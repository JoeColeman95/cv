// Site behaviour: external links in new tabs + mobile menu toggle + scrollspy for the sticky nav.
(function () {
  // External links open in a new tab. Same-origin (or anchor-only) links stay in place.
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="http"]'), function (a) {
    if (!a.hostname || a.hostname === location.hostname) return;
    a.target = '_blank';
    a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener noreferrer';
  });

  var nav = document.querySelector('.site-nav');
  var toggle = document.querySelector('.nav-toggle');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[data-section]'));

  // Mobile menu open/close.
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.classList.contains('nav-link')) nav.classList.remove('nav-open');
    });
  }

  // Scrollspy: highlight the nav link for the section currently in view.
  var sections = links
    .map(function (l) { return document.getElementById(l.getAttribute('data-section')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute('data-section')] = l; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = byId[entry.target.id];
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // Tone slider: rewrite the hero pitch across nine tiers, understated to shameless.
  // Copy gets shorter at the calm end and longer toward hard sell. To reword or add a
  // tier, edit the tonePitches array (and set the slider's max in index.html to tiers - 1).
  var tone = document.getElementById('tone');
  var pitch = document.getElementById('pitch');
  var hero = document.querySelector('.hero');
  var stageProps = document.querySelectorAll('.hero .prop');
  var tonePitches = [
    'I build reliable cloud platforms as code, currently at Buildkite.',
    'At Buildkite, I build cloud platforms as code and keep CI/CD dependable.',
    'At Buildkite, I build cloud platforms as code, keep CI/CD reliable, and help engineering teams ship without friction.',
    'I build and maintain cloud platforms as code at Buildkite, keeping CI/CD reliable across the public CLI, the Go SDK, and a new Terraform Elastic CI Stack module.',
    'I build cloud platforms as code and keep CI/CD reliable. Currently at Buildkite, where I unblock engineers at leading AI and tech companies and ship across the public CLI, the Go SDK, and a Terraform Elastic CI Stack module that teams run in production.',
    'I make CI/CD fast and reliable for teams that cannot afford downtime. I build platforms as code, author public Terraform and CLI tooling, and I have the receipts. Monitoring that cut incident response by forty percent. ISO 27001 passed with zero findings.',
    'Here is the actual pitch. I shipped a Terraform module that around sixty organisations now run in production. I have wrangled Terraform across twenty-five AWS accounts and eighty-five VPCs, run Kafka on MSK, and walked an estate through ISO 27001 with no findings. I do this every day, and I would happily do it for your team.',
    'Let me be blunt. Your pipelines are probably red right now and your on-call is probably awake. I am the engineer who makes them boringly green and suspiciously quiet, the one who cut incident response by forty percent and shipped a Terraform module around sixty organisations rely on. Your current shortlist is, statistically, less reliable than my uptime.',
    'Right, you dragged it all the way, so here is the shameless version: hire me. Your pipelines go boringly green, your pager goes quiet, and your incidents close before anyone opens a thread about them. Around sixty organisations run the Terraform module I shipped, twenty-five AWS accounts have run on infrastructure I wrote, and ISO 27001 auditors left empty-handed. WARNING: prolonged exposure may cause five nines and an alarming amount of reclaimed weekend.'
  ];
  function applyTone(i, animate) {
    if (tonePitches[i]) pitch.textContent = tonePitches[i];
    var level = i / (tonePitches.length - 1);
    if (hero) {
      hero.style.setProperty('--level', level.toFixed(3));
      hero.setAttribute('data-hype', i >= 8 ? '3' : i >= 7 ? '2' : i >= 5 ? '1' : '0');
    }
    var scene = String(i);
    for (var p = 0; p < stageProps.length; p++) {
      var el = stageProps[p];
      var inScene = (el.getAttribute('data-scene') || '').split(',').indexOf(scene) > -1;
      if (inScene && !el.classList.contains('in')) el.classList.add('in');
      else if (!inScene && el.classList.contains('in')) el.classList.remove('in');
    }
    if (animate) {
      pitch.classList.remove('animate');
      void pitch.offsetWidth;
      pitch.classList.add('animate');
    }
  }
  if (tone && pitch) {
    applyTone(parseInt(tone.value, 10), false);
    tone.addEventListener('input', function () { applyTone(parseInt(tone.value, 10), true); });
  }
})();
