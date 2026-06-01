// Live GitHub activity, pulled from the public GitHub REST API at page load.
// No backend and no token: unauthenticated calls (60/hr core, 10/min search per IP),
// scoped to public contributions in the buildkite org. CORS is open on api.github.com.
// Results are cached in localStorage for 30 minutes so repeat visits do not burn the
// rate limit, and the page falls back to the last good cache (or a clear link out to
// GitHub) if the API is unreachable. Public-only by design: private/internal repos are
// invisible to an anonymous client, so these numbers are the publicly verifiable subset.
(function () {
  var USER = 'JoeColeman95';
  var ORG = 'buildkite';
  var DOCS_REPO = 'buildkite/docs';
  var API = 'https://api.github.com';
  var CACHE_KEY = 'gh-activity-v2';
  var TTL = 30 * 60 * 1000; // 30 minutes

  var els = {
    profile: document.getElementById('gh-profile'),
    liveText: document.getElementById('gh-live-text'),
    refresh: document.getElementById('gh-refresh'),
    stats: document.getElementById('gh-stats'),
    statsNote: document.getElementById('gh-stats-note'),
    bars: document.getElementById('gh-bars'),
    barsNote: document.getElementById('gh-bars-note'),
    feed: document.getElementById('gh-feed')
  };
  if (!els.stats) return; // not on the GitHub page

  var lastFetchedAt = null, lastStale = false; // for the ticking "updated ..." label

  // ---- helpers -------------------------------------------------
  function gh(path) {
    return fetch(API + path, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (r) {
        if (!r.ok) { var e = new Error('GitHub API ' + r.status); e.status = r.status; throw e; }
        return r.json();
      });
  }
  function q(s) { return encodeURIComponent(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function repoFromUrl(u) { return (u || '').split('/repos/')[1] || ''; } // -> "buildkite/cli"
  function shortRepo(full) { return full.indexOf(ORG + '/') === 0 ? full.slice(ORG.length + 1) : full; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function ago(iso) {
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    var d = Math.floor(h / 24); if (d < 30) return d + 'd ago';
    var mo = Math.floor(d / 30); if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  }
  function updatedLabel(ts, stale) {
    var s = Math.floor((Date.now() - ts) / 1000);
    return 'Live from the GitHub API · updated ' + (s < 45 ? 'just now' : ago(ts)) + (stale ? ' (cached)' : '');
  }

  // ---- fetch ---------------------------------------------------
  function fetchPRs() {
    var query = 'author:' + USER + ' type:pr org:' + ORG;
    var items = [], total = 0;
    function page(p) {
      return gh('/search/issues?q=' + q(query) + '&per_page=100&page=' + p).then(function (d) {
        total = d.total_count || 0;
        items = items.concat(d.items || []);
        if ((d.items || []).length === 100 && items.length < total && p < 3) return page(p + 1);
        return { total: total, items: items, capped: items.length < total };
      });
    }
    return page(1);
  }
  function fetchDocsCommits() {
    return gh('/search/commits?q=' + q('repo:' + DOCS_REPO + ' author:' + USER) + '&per_page=1')
      .then(function (d) { return d.total_count; });
  }
  function fetchEvents() { return gh('/users/' + USER + '/events/public?per_page=30'); }
  function fetchProfile() { return gh('/users/' + USER); }

  function describeEvent(e) {
    var repo = e.repo ? e.repo.name : '';
    var repoUrl = 'https://github.com/' + repo;
    var p = e.payload || {}, text, link = repoUrl;
    switch (e.type) {
      case 'PushEvent':
        var n = p.size || (p.commits ? p.commits.length : 0);
        if (!n) return null; // skip zero-commit pushes (branch nudges, low signal)
        text = 'Pushed ' + n + ' commit' + (n === 1 ? '' : 's') + ' to ' + repo;
        link = repoUrl + '/commits'; break;
      case 'PullRequestEvent':
        var pr = p.pull_request || {}, verb = (p.action === 'closed' && pr.merged) ? 'Merged' : cap(p.action);
        text = verb + ' pull request #' + pr.number + ' in ' + repo;
        link = pr.html_url || repoUrl; break;
      case 'PullRequestReviewEvent':
        text = 'Reviewed pull request #' + (p.pull_request || {}).number + ' in ' + repo;
        link = (p.pull_request || {}).html_url || repoUrl; break;
      case 'IssuesEvent':
        text = cap(p.action) + ' issue #' + (p.issue || {}).number + ' in ' + repo;
        link = (p.issue || {}).html_url || repoUrl; break;
      case 'IssueCommentEvent':
        text = 'Commented on #' + (p.issue || {}).number + ' in ' + repo;
        link = (p.comment || {}).html_url || repoUrl; break;
      case 'CreateEvent':
        text = 'Created ' + p.ref_type + (p.ref ? ' ' + p.ref : '') + ' in ' + repo; break;
      case 'ReleaseEvent':
        text = 'Released ' + (p.release || {}).tag_name + ' in ' + repo;
        link = (p.release || {}).html_url || repoUrl; break;
      case 'ForkEvent': text = 'Forked ' + repo; break;
      case 'WatchEvent': text = 'Starred ' + repo; break;
      default: return null; // skip deletes and lower-signal events
    }
    return { text: text, link: link, at: e.created_at };
  }

  function buildModel() {
    var safe = function (p) { return p.catch(function (e) { return { __error: e }; }); };
    return Promise.all([safe(fetchPRs()), safe(fetchDocsCommits()), safe(fetchEvents()), safe(fetchProfile())])
      .then(function (r) {
        var prs = r[0], docs = r[1], events = r[2], profile = r[3];
        if ((prs && prs.__error) && (events && events.__error)) throw prs.__error; // nothing useful loaded

        var model = { fetchedAt: Date.now() };

        if (prs && !prs.__error) {
          var merged = prs.items.filter(function (it) { return it.pull_request && it.pull_request.merged_at; });
          var repoSet = {}, byRepo = {};
          prs.items.forEach(function (it) { var f = repoFromUrl(it.repository_url); if (f) repoSet[f] = 1; });
          merged.forEach(function (it) { var f = repoFromUrl(it.repository_url); byRepo[f] = (byRepo[f] || 0) + 1; });
          model.prsOpened = prs.total;
          model.prsMerged = merged.length;
          model.prsCapped = prs.capped;
          model.repoCount = Object.keys(repoSet).length;
          model.byRepo = Object.keys(byRepo)
            .map(function (f) { return { repo: shortRepo(f), count: byRepo[f] }; })
            .sort(function (a, b) { return b.count - a.count; });
        }
        if (docs != null && !(docs && docs.__error)) model.docsCommits = docs;
        if (events && !events.__error && events.length != null) {
          model.events = events.map(describeEvent).filter(Boolean).slice(0, 12);
        }
        if (profile && !profile.__error && profile.login) {
          model.profile = {
            login: profile.login, url: profile.html_url,
            repos: profile.public_repos, followers: profile.followers
          };
        }
        return model;
      });
  }

  // ---- render --------------------------------------------------
  function statCard(num, label) {
    return '<div class="stat-card"><div class="num">' + esc(num) + '</div><div class="label">' + esc(label) + '</div></div>';
  }
  function render(m, opts) {
    opts = opts || {};
    var cards = [];
    if (m.prsOpened != null) cards.push(statCard(m.prsOpened, 'Pull requests opened'));
    if (m.prsMerged != null) cards.push(statCard(m.prsMerged + (m.prsCapped ? '+' : ''), 'Merged'));
    if (m.repoCount != null) cards.push(statCard(m.repoCount, 'Repositories contributed to'));
    if (m.docsCommits != null) cards.push(statCard(m.docsCommits, 'Commits to buildkite/docs'));
    if (cards.length) els.stats.innerHTML = cards.join('');
    els.statsNote.textContent =
      'Public contributions in the buildkite organisation, pulled live from the GitHub API. '
      + 'Private and internal repositories are not visible to an unauthenticated client, so these are the publicly verifiable figures.'
      + (opts.stale ? ' Showing the last cached copy: GitHub was unreachable just now.' : '');

    if (m.byRepo && m.byRepo.length) {
      var max = m.byRepo[0].count, top = m.byRepo.slice(0, 10);
      els.bars.innerHTML = top.map(function (r) {
        var w = Math.max(4, Math.round(r.count / max * 100));
        return '<div class="bar-row"><div class="name" title="' + esc(r.repo) + '">' + esc(r.repo) + '</div>'
          + '<div class="bar-track"><div class="bar-fill" style="width:' + w + '%"></div></div>'
          + '<div class="val">' + r.count + '</div></div>';
      }).join('');
      var tail = m.byRepo.length - top.length;
      els.barsNote.textContent = 'Merged pull requests by public repository'
        + (tail > 0 ? ', plus ' + tail + ' more with fewer merges.' : '.');
    }

    if (m.events && m.events.length) {
      els.feed.innerHTML = m.events.map(function (ev) {
        return '<li><a href="' + esc(ev.link) + '" target="_blank" rel="noopener">' + esc(ev.text) + '</a>'
          + '<span class="when">' + esc(ago(ev.at)) + '</span></li>';
      }).join('');
    }

    if (m.profile && els.profile) {
      els.profile.innerHTML = '<a href="' + esc(m.profile.url) + '" target="_blank" rel="noopener">@' + esc(m.profile.login) + ' on GitHub</a>';
    }

    if (els.liveText && m.fetchedAt) {
      lastFetchedAt = m.fetchedAt;
      lastStale = !!opts.stale;
      els.liveText.textContent = updatedLabel(m.fetchedAt, opts.stale);
    }
  }

  function skeleton() {
    var sk = '';
    for (var i = 0; i < 4; i++) sk += '<div class="stat-card sk"><div class="num">&nbsp;</div><div class="label">&nbsp;</div></div>';
    els.stats.innerHTML = sk;
    els.feed.innerHTML = '<li class="sk-line">Loading recent activity from GitHub...</li>';
    if (els.liveText) els.liveText.textContent = 'Live from the GitHub API · fetching...';
  }
  function showError() {
    els.stats.innerHTML = '<p class="gh-error">Could not reach the GitHub API just now (it limits anonymous requests). '
      + 'See it all live at <a href="https://github.com/' + USER + '" target="_blank" rel="noopener">github.com/' + USER + '</a>.</p>';
    els.statsNote.textContent = '';
    els.feed.innerHTML = '';
    if (els.liveText) els.liveText.textContent = 'GitHub API unreachable right now';
  }

  // ---- cache + boot --------------------------------------------
  function readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; } }
  function writeCache(m) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(m)); } catch (e) {} }

  var cached = readCache();
  if (cached && cached.fetchedAt && (Date.now() - cached.fetchedAt) < TTL) {
    render(cached);
  } else {
    skeleton();
    buildModel()
      .then(function (m) { render(m); writeCache(m); })
      .catch(function () { if (cached) render(cached, { stale: true }); else showError(); });
  }

  // Refresh button: drop the cache and refetch live, so the data is visibly dynamic.
  function refetch() {
    els.refresh.disabled = true;
    els.refresh.textContent = 'Refreshing...';
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
    skeleton();
    return buildModel()
      .then(function (m) { render(m); writeCache(m); })
      .catch(function () { showError(); })
      .then(function () { els.refresh.disabled = false; els.refresh.textContent = 'Refresh'; });
  }
  if (els.refresh) els.refresh.addEventListener('click', refetch);

  // Tick the "updated ... ago" label so it stays honest between fetches.
  setInterval(function () {
    if (lastFetchedAt && els.liveText) els.liveText.textContent = updatedLabel(lastFetchedAt, lastStale);
  }, 30000);
})();
