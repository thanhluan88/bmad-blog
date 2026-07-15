/**
 * Build index of Full Bank teach lessons for questions with Sai:1 (wrong===1).
 *
 * Sources (first available):
 *   1. data/pmp-luannt115-full-sai1-ids.json  (frozen list)
 *   2. --ids=1,2,3 CLI override
 *
 * Usage:
 *   node scripts/generate-pmp-full-sai1-index.js
 *   node scripts/generate-pmp-full-sai1-index.js --ids=222,226
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IDS_PATH = path.join(ROOT, "data", "pmp-luannt115-full-sai1-ids.json");
const QUESTIONS_PATH = path.join(ROOT, "public", "pmp", "pmp-full-questions.json");
const EXPLAIN_PATH = path.join(ROOT, "data", "pmp-full-pmbok8-explanations.json");
const SIGNALS_PATH = path.join(ROOT, "data", "pmp-teach-signals.json");
const OUT_PATH = path.join(ROOT, "public", "pmp", "pmp-teach-full-sai1-index.html");

function parseIdsFromArgv() {
  const arg = process.argv.find((a) => a.startsWith("--ids="));
  if (!arg) return null;
  return arg
    .slice("--ids=".length)
    .split(/[, ]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

function loadIds() {
  const fromCli = parseIdsFromArgv();
  if (fromCli?.length) return fromCli;
  if (!fs.existsSync(IDS_PATH)) {
    throw new Error(`Missing ${IDS_PATH}. Export Sai:1 ids first.`);
  }
  const raw = JSON.parse(fs.readFileSync(IDS_PATH, "utf8"));
  const ids = Array.isArray(raw) ? raw : raw.ids;
  return ids.map(Number).filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stemTitle(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > 72 ? t.slice(0, 69) + "…" : t;
}

function processLabel(q, exp, sig) {
  return (
    exp?.pmbok8?.processes?.[0] ||
    exp?.pmbok8?.domains?.[0] ||
    sig?.signalAnswer?.slice(0, 80) ||
    "Full Bank"
  );
}

function cardSummary(sig, exp) {
  const bullet =
    sig?.whySolutionBullets?.[0] ||
    sig?.whyBullets?.[0] ||
    sig?.signalAnswer ||
    (exp?.pmbok8?.domains || []).join(", ");
  const s = String(bullet || "").replace(/\s+/g, " ").trim();
  return s.length > 120 ? s.slice(0, 117) + "…" : s;
}

function groupBatches(ids, size = 25) {
  const groups = [];
  for (let i = 0; i < ids.length; i += size) {
    const chunk = ids.slice(i, i + size);
    groups.push({
      id: `sai1-${chunk[0]}-${chunk[chunk.length - 1]}`,
      label: `Q${chunk[0]}–Q${chunk[chunk.length - 1]}`,
      ids: chunk,
    });
  }
  return groups;
}

function main() {
  const ids = loadIds();
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const explanations = fs.existsSync(EXPLAIN_PATH)
    ? JSON.parse(fs.readFileSync(EXPLAIN_PATH, "utf8"))
    : {};
  const signals = fs.existsSync(SIGNALS_PATH)
    ? JSON.parse(fs.readFileSync(SIGNALS_PATH, "utf8"))
    : {};

  const groups = groupBatches(ids, 25);
  const jumps = groups
    .map((g) => `      <a class="teach-group-chip" href="#${g.id}">${esc(g.label)}</a>`)
    .join("\n");

  const groupHtml = groups
    .map((g) => {
      const cards = g.ids
        .map((id) => {
          const q = byId[id];
          if (!q) {
            return `              <a class="teach-card missing" href="pmp-full-questions.html#q-${id}">
                <div class="q-label">Câu ${id}</div>
                <h4>Missing question data</h4>
                <p>Mở trong bộ luyện</p>
              </a>`;
          }
          const exp = explanations[String(id)];
          const sig = signals[String(id)];
          const lesson = `pmp-teach-full-q${id}.html`;
          const exists = fs.existsSync(path.join(ROOT, "public", "pmp", lesson));
          return `              <a class="teach-card" href="${exists ? lesson : `pmp-full-questions.html#q-${id}`}">
                <div class="q-label">Câu ${id}${exists ? "" : " · chưa có teach"}</div>
                <h4>${esc(stemTitle(q.text))}</h4>
                <p>${esc(processLabel(q, exp, sig))} · ${esc(cardSummary(sig, exp))}</p>
              </a>`;
        })
        .join("\n");
      return `          <div id="${g.id}" class="teach-group">
            <div class="teach-group-head"><h3>${esc(g.label)} · ${g.ids.length} câu</h3></div>
            <div class="teach-grid">
${cards}
            </div>
          </div>`;
    })
    .join("\n\n");

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMBOK 8 — Ôn Sai:1 (luannt115 Full Bank · ${ids.length} câu)</title>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
  <style>
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: #fafaf8; color: #1f2937; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
    h1 { margin: 0 0 0.5rem; color: #b45309; }
    .lead { color: #6b7280; margin: 0 0 1.25rem; max-width: 70ch; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .toolbar a {
      display: inline-block; padding: 0.5rem 0.85rem; background: #d97706; color: #fff;
      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.88rem;
    }
    .toolbar a.secondary { background: #fff; color: #b45309; border: 1px solid #e5e7eb; }
    .badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 1.25rem; }
    .badge {
      font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 99px;
      background: #fff; border: 1px solid #e5e7eb; color: #b45309; font-weight: 500;
    }
    .teach-group-jump { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }
    .teach-group-chip {
      padding: 0.3rem 0.65rem; border-radius: 99px; border: 1px solid #e5e7eb;
      background: #fff; color: #b45309; text-decoration: none; font-size: 0.78rem; font-weight: 600;
    }
    .teach-group { margin-bottom: 2rem; }
    .teach-group-head h3 {
      margin: 0 0 0.75rem; color: #b45309; border-bottom: 2px solid #fde68a; padding-bottom: 0.35rem;
    }
    .teach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
    .teach-card {
      display: block; padding: 1rem; background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; text-decoration: none; color: inherit;
    }
    .teach-card:hover { border-color: #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .teach-card .q-label { font-size: 0.72rem; font-weight: 700; color: #d97706; text-transform: uppercase; }
    .teach-card h4 { margin: 0.35rem 0; font-size: 0.92rem; line-height: 1.35; }
    .teach-card p { margin: 0; font-size: 0.78rem; color: #6b7280; }
    .id-list {
      font-family: ui-monospace, Consolas, monospace; font-size: 0.78rem; color: #6b7280;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.85rem 1rem;
      word-break: break-word; line-height: 1.55;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Ôn Sai:1 — Full Bank</h1>
    <p class="lead">
      <strong>${ids.length} câu</strong> đang có <em>Sai: 1</em> trên tài khoản <code>luannt115</code> (Full Bank).
      Mỗi thẻ mở bài giảng teach đầy đủ (signal · Giải thích dễ hiểu · triad · flashcard).
    </p>
    <div class="badges">
      <span class="badge">${ids.length} câu</span>
      <span class="badge">wrong = 1</span>
      <span class="badge">user luannt115</span>
      <span class="badge">quiz full</span>
    </div>
    <div class="toolbar">
      <a href="pmp-exam-prep-lecture.html">← Bài giảng PMP</a>
      <a href="pmp-teach-sai1-patterns.html" class="secondary">Pattern Sai:1</a>
      <a href="pmp-full-questions.html" class="secondary">Luyện đề + Ôn câu sai</a>
      <a href="pmp-teach-full-series-index.html" class="secondary">Index Full Bank</a>
      <a href="pmp-teach-wrong-mindsets.html" class="secondary">Mindset từ câu sai</a>
      <a href="pmp-teach-full-q${ids[0]}.html" class="secondary">Bắt đầu Q${ids[0]}</a>
    </div>
    <div class="teach-group-jump">
${jumps}
    </div>

${groupHtml}

    <section>
      <h2 style="color:#b45309;font-size:1.1rem;border-bottom:2px solid #fde68a;padding-bottom:0.35rem">Danh sách ID</h2>
      <p class="id-list">${ids.join(", ")}</p>
    </section>
  </div>
</body>
</html>
`;

  fs.writeFileSync(OUT_PATH, html);
  console.log(`Wrote ${OUT_PATH} (${ids.length} ids, ${groups.length} groups)`);
}

main();
