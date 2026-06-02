#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist/img

# CV as a PDF
tmp_html="$(pwd)/.cv-build.html"
trap 'rm -f "$tmp_html"' EXIT
pandoc src/cv.md -t html5 -o "$tmp_html" --standalone --css=src/cv.css \
  --metadata pagetitle="Joseph Coleman, CV"
# strip pandoc's pandoc-only column styles (weasyprint warns on them). -i.bak works on both BSD and GNU sed.
sed -i.bak '/div\.columns{display: flex; gap:/d; /div\.column{flex: auto; overflow-x:/d' "$tmp_html"
rm -f "$tmp_html.bak"
weasyprint "$tmp_html" dist/cv.pdf
echo "Built dist/cv.pdf"

# CV as a HTML page. Iframed by cv.html, so every link opens in a new tab via the <base> in src/cv-sheet-header.html.
pandoc src/cv.md -t html5 -o dist/cv-sheet.html \
  --standalone --embed-resources --css=src/cv.css \
  --metadata pagetitle="Joseph Coleman, CV" \
  --include-in-header=src/cv-sheet-header.html
echo "Built dist/cv-sheet.html"

# Cover letters: one PDF per src/cover-letters/*.md, same toolchain as the CV
for letter in src/cover-letters/*.md; do
  [ -f "$letter" ] || continue
  name="$(basename "$letter" .md)"
  pandoc "$letter" -t html5 -o "$tmp_html" --standalone \
    --css=src/cv.css --css=src/letter.css \
    --metadata pagetitle="Joseph Coleman, Cover Letter ($name)"
  sed -i.bak '/div\.columns{display: flex; gap:/d; /div\.column{flex: auto; overflow-x:/d' "$tmp_html"
  rm -f "$tmp_html.bak"
  weasyprint "$tmp_html" "dist/cover-letter-${name}.pdf"
  echo "Built dist/cover-letter-${name}.pdf"
done

# Website dist
cp src/site/site.css    dist/site.css
cp src/site/site.js     dist/site.js
cp src/site/github.js   dist/github.js
cp src/site/index.html  dist/index.html
cp src/site/cv.html     dist/cv.html
cp src/site/github.html dist/github.html
cp src/site/img/*.png   dist/img/
echo "Built homepage, cv.html, github.html + assets + cutouts"
