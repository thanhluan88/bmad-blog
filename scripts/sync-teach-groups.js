/**
 * Regenerate grouped Practice Series UI:
 * - pmp-exam-prep-lecture.html (main + sidebar)
 * - pmp-teach-series-index.html (standalone index)
 *
 * Run after adding lessons: node scripts/sync-teach-groups.js
 */
const fs = require("fs");
const path = require("path");
const { SERIES, GROUPS } = require("./pmp-teach-series");

const pmpDir = path.join(__dirname, "../public/pmp");
const lecturePath = path.join(pmpDir, "pmp-exam-prep-lecture.html");
const indexPath = path.join(pmpDir, "pmp-teach-series-index.html");

function parseCardsFromLecture(html) {
  const sectionMatch = html.match(
    /<section id="practice-teach">([\s\S]*?)<\/section>/
  );
  if (!sectionMatch) throw new Error("practice-teach section not found");
  const cards = [];
  const re =
    /<a class="teach-card" href="([^"]+)">\s*<div class="q-label">([^<]+)<\/div>\s*<h4>([^<]+)<\/h4>\s*<p>([\s\S]*?)<\/p>\s*<\/a>/g;
  let m;
  while ((m = re.exec(sectionMatch[1])) !== null) {
    cards.push({
      href: m[1],
      qLabel: m[2].trim(),
      title: m[3].trim(),
      summary: m[4].trim(),
    });
  }
  return cards;
}

function cardByHref(cards) {
  const map = Object.create(null);
  cards.forEach(function (c) {
    map[c.href] = c;
  });
  return map;
}

function buildCardHtml(card) {
  if (!card) return "";
  return (
    '            <a class="teach-card" href="' +
    card.href +
    '">\n' +
    '              <div class="q-label">' +
    card.qLabel +
    "</div>\n" +
    "              <h4>" +
    card.title +
    "</h4>\n" +
    "              <p>" +
    card.summary +
    "</p>\n" +
    "            </a>"
  );
}

function buildGroupJump() {
  return (
    '          <div class="teach-group-jump">\n' +
    GROUPS.map(function (g) {
      return (
        '            <a class="teach-group-chip" href="#group-' +
        g.id +
        '">Q' +
        g.from +
        "–" +
        g.to +
        "</a>"
      );
    }).join("\n") +
    "\n          </div>"
  );
}

function buildMainGroups(cardsMap) {
  return GROUPS.map(function (g) {
    const items = SERIES.slice(g.from - 1, g.to);
    const cardsHtml = items
      .map(function (entry) {
        return buildCardHtml(cardsMap[entry[0]]);
      })
      .filter(Boolean)
      .join("\n");
    return (
      '          <div id="group-' +
      g.id +
      '" class="teach-group">\n' +
      '            <div class="teach-group-head">\n' +
      "              <h3>Q" +
      g.from +
      "–" +
      g.to +
      " · " +
      g.title +
      "</h3>\n" +
      '              <p class="teach-group-sub">' +
      g.subtitle +
      "</p>\n" +
      "            </div>\n" +
      '            <div class="teach-grid">\n' +
      cardsHtml +
      "\n            </div>\n" +
      "          </div>"
    );
  }).join("\n\n");
}

function buildSidebarGroups() {
  let out =
    '        <a href="pmp-teach-series-index.html">→ Index nhóm Q1–Q110</a>\n' +
    '        <a href="#practice-teach">Practice Questions PMBOK 8</a>\n';
  GROUPS.forEach(function (g) {
    out +=
      '        <details class="sidebar-series-group">\n' +
      '          <summary>Q' +
      g.from +
      "–" +
      g.to +
      " · " +
      g.title +
      "</summary>\n";
    SERIES.slice(g.from - 1, g.to).forEach(function (entry) {
      out += '          <a href="' + entry[0] + '">' + entry[1] + "</a>\n";
    });
    out += "        </details>\n";
  });
  return out;
}

function syncLecture(cardsMap) {
  let html = fs.readFileSync(lecturePath, "utf8");

  const mainBlock =
    '          <div class="teach-series-toolbar">\n' +
    '            <a class="teach-series-index-link" href="pmp-teach-series-index.html">📚 Xem index nhóm theo chủ đề (11 batch × 10 câu)</a>\n' +
    "          </div>\n" +
    buildGroupJump() +
    "\n\n" +
    buildMainGroups(cardsMap);

  html = html.replace(
    /(<section id="practice-teach">[\s\S]*?<p>[\s\S]*?<\/p>\n)[\s\S]*?(\n        <\/section>\n\n        <!-- FORMAT -->)/,
    "$1\n" + mainBlock + "$2"
  );

  html = html.replace(
    /        <a href="#practice-teach">Practice Questions PMBOK 8<\/a>\n[\s\S]*?        <a href="#agile">Agile/,
    buildSidebarGroups() + "        <a href=\"#agile\">Agile"
  );

  fs.writeFileSync(lecturePath, html);
  console.log("Updated lecture: pmp-exam-prep-lecture.html");
}

function syncPortfolioNav() {
  const portfolioPath = path.join(pmpDir, "pmp-teach-project-program-portfolio.html");
  let html = fs.readFileSync(portfolioPath, "utf8");
  if (html.includes("→ Xem Q2–Q110 theo nhóm")) {
    console.log("Skip portfolio nav (already grouped)");
    return;
  }
  html = html.replace(
    /\n      <a href="pmp-teach-tangible-intangible-benefits[\s\S]*?Q110: Return on Investment<\/a>\n/,
    '\n      <a href="pmp-teach-series-index.html#group-q01-10" style="display:block;padding:0.45rem 0.65rem;color:var(--muted);text-decoration:none;border-radius:8px;font-size:0.86rem;">→ Xem Q2–Q110 theo nhóm</a>\n'
  );
  if (!html.includes("nav-series-index")) {
    html = html.replace(
      /(<div class="nav-series"[^>]*>Practice Series<\/div>\n)/,
      '$1      <a href="pmp-teach-series-index.html" class="nav-series-index" style="display:block;margin:0 0.65rem 0.5rem;padding:0.4rem 0.55rem;font-size:0.78rem;font-weight:600;text-decoration:none;color:#b45309;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">📚 Nhóm theo chủ đề</a>\n'
    );
  }
  fs.writeFileSync(portfolioPath, html);
  console.log("Updated portfolio nav");
}

function buildIndexPage(cardsMap) {
  const groupsHtml = GROUPS.map(function (g) {
    const items = SERIES.slice(g.from - 1, g.to);
    const first = items[0][0];
    const cardsHtml = items
      .map(function (entry) {
        const c = cardsMap[entry[0]];
        if (!c) return "";
        return (
          '          <a class="teach-card" href="' +
          c.href +
          '">\n' +
          '            <div class="q-label">' +
          c.qLabel +
          "</div>\n" +
          "            <h4>" +
          c.title +
          "</h4>\n" +
          "            <p>" +
          c.summary +
          "</p>\n" +
          "          </a>"
        );
      })
      .join("\n");
    return (
      '      <section id="group-' +
      g.id +
      '" class="teach-group">\n' +
      '        <div class="teach-group-head">\n' +
      '          <div class="teach-group-meta">Batch ' +
      Math.ceil(g.from / 10) +
      " · " +
      items.length +
      " bài</div>\n" +
      "          <h2>Q" +
      g.from +
      "–" +
      g.to +
      " · " +
      g.title +
      "</h2>\n" +
      '          <p class="teach-group-sub">' +
      g.subtitle +
      '</p>\n          <a class="teach-group-start" href="' +
      first +
      '">Bắt đầu Q' +
      g.from +
      " →</a>\n" +
      "        </div>\n" +
      '        <div class="teach-grid">\n' +
      cardsHtml +
      "\n        </div>\n" +
      "      </section>"
    );
  }).join("\n\n");

  const jumpHtml = GROUPS.map(function (g) {
    return (
      '        <a class="teach-group-chip" href="#group-' +
      g.id +
      '">Q' +
      g.from +
      "–" +
      g.to +
      "</a>"
    );
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMBOK 8 — Practice Series Index (Q1–Q${SERIES.length})</title>
  <style>
    :root {
      --bg: #fafaf8; --card: #ffffff; --text: #1f2937; --muted: #6b7280;
      --primary: #d97706; --primary-dark: #b45309; --primary-bg: #fffbeb;
      --border: #e5e7eb; --shadow: 0 8px 24px rgba(15, 23, 42, 0.08); --radius: 14px;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 1.5rem clamp(1rem, 3vw, 2rem) 4rem; }
    .hero { background: linear-gradient(135deg, #fff 0%, var(--primary-bg) 100%); border: 1px solid #fde68a; border-radius: var(--radius); padding: 1.75rem 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow); }
    .hero h1 { margin: 0 0 0.5rem; font-size: clamp(1.35rem, 3vw, 1.75rem); }
    .hero .lead { margin: 0; color: var(--muted); max-width: 65ch; }
    .top-links { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
    .top-links a { padding: 0.45rem 0.85rem; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.88rem; border: 1px solid var(--border); background: var(--card); color: var(--primary-dark); }
    .top-links a.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
    .teach-group-jump { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 1.25rem 0 2rem; }
    .teach-group-chip { display: inline-block; padding: 0.35rem 0.7rem; border-radius: 99px; font-size: 0.78rem; font-weight: 700; text-decoration: none; color: var(--primary-dark); background: var(--card); border: 1px solid #fde68a; }
    .teach-group-chip:hover { background: var(--primary-bg); border-color: var(--primary); }
    .teach-group { margin-bottom: 2.5rem; scroll-margin-top: 1rem; }
    .teach-group-head { margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--primary); }
    .teach-group-meta { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin-bottom: 0.25rem; }
    .teach-group-head h2 { margin: 0 0 0.35rem; font-size: 1.25rem; color: var(--primary-dark); }
    .teach-group-sub { margin: 0 0 0.65rem; font-size: 0.9rem; color: var(--muted); }
    .teach-group-start { display: inline-block; font-size: 0.86rem; font-weight: 600; color: var(--primary-dark); text-decoration: none; border-bottom: 1.5px dashed var(--primary); }
    .teach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
    .teach-card { display: block; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.1rem; text-decoration: none; color: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
    .teach-card:hover { border-color: var(--primary); box-shadow: var(--shadow); }
    .teach-card .q-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--primary); margin-bottom: 0.35rem; }
    .teach-card h4 { margin: 0 0 0.35rem; font-size: 0.95rem; }
    .teach-card p { margin: 0; font-size: 0.82rem; color: var(--muted); }
  </style>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <h1>Practice Series — Nhóm theo chủ đề</h1>
      <p class="lead">
        <strong>${SERIES.length} bài</strong> practice PMBOK 8, chia <strong>11 nhóm × 10 câu</strong>
        (Q1–10, Q11–20, … Q101–110). Mỗi nhóm tập trung một chủ đề để học tuần tự.
      </p>
      <div class="top-links">
        <a class="primary" href="pmp-exam-prep-lecture.html">← Về bài giảng PMP</a>
        <a href="pmp-teach-project-program-portfolio.html">Bắt đầu Q1</a>
        <a href="pmp-full-questions.html">Luyện 1.123 câu</a>
      </div>
    </header>

    <nav class="teach-group-jump" aria-label="Nhảy tới nhóm">
${jumpHtml}
    </nav>

${groupsHtml}
  </div>
</body>
</html>`;

  fs.writeFileSync(indexPath, html);
  console.log("Wrote index: pmp-teach-series-index.html");
}

const lectureHtml = fs.readFileSync(lecturePath, "utf8");
const cards = parseCardsFromLecture(lectureHtml);
const cardsMap = cardByHref(cards);

if (cards.length < SERIES.length) {
  console.warn(
    "Warning: parsed " + cards.length + " cards, SERIES has " + SERIES.length
  );
}

syncLecture(cardsMap);
syncPortfolioNav();
buildIndexPage(cardsMap);
console.log("Done. " + GROUPS.length + " groups, " + SERIES.length + " lessons.");
