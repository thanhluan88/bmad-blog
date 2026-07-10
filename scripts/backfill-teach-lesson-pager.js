const fs = require("fs");
const path = require("path");
const { SERIES } = require("./pmp-teach-series");

const dir = path.join(__dirname, "../public/pmp");

function parseQNum(label) {
  const m = /^Q(\d+)/.exec(label);
  return m ? parseInt(m[1], 10) : null;
}

function maxQInSeries() {
  return SERIES.reduce(function (max, entry) {
    const n = parseQNum(entry[1]);
    return n && n > max ? n : max;
  }, 0);
}

function getNeighbors(currentHref) {
  const idx = SERIES.findIndex(function (entry) {
    return entry[0] === currentHref;
  });
  if (idx < 0) return null;
  return {
    idx: idx,
    total: SERIES.length,
    current: SERIES[idx],
    prev: idx > 0 ? SERIES[idx - 1] : null,
    next: idx < SERIES.length - 1 ? SERIES[idx + 1] : null,
  };
}

function buildFooterPager(n) {
  const qNum = parseQNum(n.current[1]) || n.idx + 1;
  const pos = "Q" + qNum + " / " + maxQInSeries();
  const prevBtn = n.prev
    ? '<a class="lesson-pager-btn" href="' +
      n.prev[0] +
      '"><span class="lesson-pager-dir">← Trước</span><span class="lesson-pager-label">' +
      n.prev[1] +
      "</span></a>"
    : '<span class="lesson-pager-btn disabled" aria-hidden="true"><span class="lesson-pager-dir">← Trước</span><span class="lesson-pager-label">—</span></span>';
  const nextBtn = n.next
    ? '<a class="lesson-pager-btn next" href="' +
      n.next[0] +
      '"><span class="lesson-pager-dir">Sau →</span><span class="lesson-pager-label">' +
      n.next[1] +
      "</span></a>"
    : '<span class="lesson-pager-btn disabled" aria-hidden="true"><span class="lesson-pager-dir">Sau →</span><span class="lesson-pager-label">—</span></span>';
  return (
    '        <nav class="lesson-pager" aria-label="Điều hướng Practice Series">\n' +
    "          " +
    prevBtn +
    "\n" +
    '          <span class="lesson-pager-pos">' +
    pos +
    "</span>\n" +
    "          " +
    nextBtn +
    "\n" +
    "        </nav>\n"
  );
}

function buildSidebarPager(n) {
  const prev = n.prev
    ? '<a href="' + n.prev[0] + '" class="sidebar-pager-link">← ' + n.prev[1] + "</a>"
    : '<span class="sidebar-pager-link disabled" aria-hidden="true">← —</span>';
  const next = n.next
    ? '<a href="' + n.next[0] + '" class="sidebar-pager-link">' + n.next[1] + " →</a>"
    : '<span class="sidebar-pager-link disabled" aria-hidden="true">— →</span>';
  return "      <div class=\"sidebar-pager\">\n        " + prev + "\n        " + next + "\n      </div>\n";
}

function buildMobilePager(n) {
  let out = "";
  if (n.prev) {
    out +=
      '        <a href="' + n.prev[0] + '" class="mobile-series-nav">← ' + n.prev[1] + "</a>\n";
  }
  if (n.next) {
    out +=
      '        <a href="' + n.next[0] + '" class="mobile-series-nav">' + n.next[1] + " →</a>\n";
  }
  return out;
}

function stripPager(text) {
  return text
    .replace(/\n        <nav class="lesson-pager"[\s\S]*?<\/nav>\n/g, "\n")
    .replace(/\n      <div class="sidebar-pager">[\s\S]*?<\/div>\n/g, "\n")
    .replace(/\n        <a href="[^"]*" class="mobile-series-nav">[^<]*<\/a>/g, "")
    .replace(/\n        <a href="\/p\/pmp"[^>]*>[^<]*<\/a>/g, "");
}

function ensureBlogLink(text) {
  if (text.includes('href="/p/pmp"')) return text;
  return text.replace(
    /(<a class="back-link" href="pmp-exam-prep-lecture\.html">[^<]*<\/a>)/,
    '$1\n      <a class="back-link secondary" href="/p/pmp">← Về blog PMP</a>'
  );
}

function ensureMobileBlogLink(text) {
  const match = text.match(/<nav class="mobile-nav">([\s\S]*?)<\/nav>/);
  if (!match) return text;
  if (match[1].includes('href="/p/pmp"')) return text;
  return text.replace(
    /(<nav class="mobile-nav">\n)/,
    '$1        <a href="/p/pmp" class="mobile-series-nav">← Blog PMP</a>\n'
  );
}

let updated = 0;
SERIES.forEach(function (entry) {
  const file = entry[0];
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing): " + file);
    return;
  }

  const n = getNeighbors(file);
  if (!n) return;

  let text = stripPager(fs.readFileSync(filePath, "utf8"));
  const footerPager = buildFooterPager(n);
  const sidebarPager = buildSidebarPager(n);
  const mobilePager = buildMobilePager(n);

  if (text.includes('<footer class="ref-footer">')) {
    text = text.replace(
      /(\n        <footer class="ref-footer">)/,
      "\n" + footerPager + "$1"
    );
  }

  text = text.replace(
    /(\n      <a class="back-link" href="pmp-exam-prep-lecture\.html">)/,
    "\n" + sidebarPager + "$1"
  );

  if (text.includes('<nav class="mobile-nav">')) {
    text = text.replace(/(<nav class="mobile-nav">\n)/, "$1" + mobilePager);
  }

  text = ensureBlogLink(text);
  text = ensureMobileBlogLink(text);

  fs.writeFileSync(filePath, text);
  updated++;
  console.log("Updated pager: " + file);
});

console.log("Done. Updated " + updated + " files.");
