/**
 * Index Full Bank teach lessons for lastWrongAttempt >= 1 (sorted DESC).
 *
 * Usage:
 *   node scripts/generate-pmp-full-last-wrong-index.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PACK_PATH = path.join(ROOT, "data", "pmp-luannt115-full-last-wrong-ids.json");
const QUESTIONS_PATH = path.join(ROOT, "public", "pmp", "pmp-full-questions.json");
const EXPLAIN_PATH = path.join(ROOT, "data", "pmp-full-pmbok8-explanations.json");
const SIGNALS_PATH = path.join(ROOT, "data", "pmp-teach-signals.json");
const PATTERNS_PATH = path.join(
  ROOT,
  "data",
  "pmp-luannt115-full-last-wrong-patterns.json",
);
const OUT_PATH = path.join(ROOT, "public", "pmp", "pmp-teach-full-last-wrong-index.html");

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

function main() {
  const pack = JSON.parse(fs.readFileSync(PACK_PATH, "utf8"));
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const explanations = fs.existsSync(EXPLAIN_PATH)
    ? JSON.parse(fs.readFileSync(EXPLAIN_PATH, "utf8"))
    : {};
  const signals = fs.existsSync(SIGNALS_PATH)
    ? JSON.parse(fs.readFileSync(SIGNALS_PATH, "utf8"))
    : {};
  const patternsPack = fs.existsSync(PATTERNS_PATH)
    ? JSON.parse(fs.readFileSync(PATTERNS_PATH, "utf8"))
    : null;
  const patternById = {};
  if (patternsPack?.rows) {
    for (const r of patternsPack.rows) patternById[r.id] = r.patternId;
  }

  const rows = pack.rows.slice().sort((a, b) => {
    if (b.lastWrongAttempt !== a.lastWrongAttempt) {
      return b.lastWrongAttempt - a.lastWrongAttempt;
    }
    return a.id - b.id;
  });

  // Group by LWA band
  const bands = [
    { id: "lwa-4plus", label: "LWA ≥ 4 (hard)", test: (r) => r.lastWrongAttempt >= 4 },
    { id: "lwa-3", label: "LWA = 3", test: (r) => r.lastWrongAttempt === 3 },
    { id: "lwa-2", label: "LWA = 2", test: (r) => r.lastWrongAttempt === 2 },
    { id: "lwa-1", label: "LWA = 1", test: (r) => r.lastWrongAttempt === 1 },
  ];

  const jumps = bands
    .map((b) => {
      const n = rows.filter(b.test).length;
      return `      <a class="teach-group-chip" href="#${b.id}">${esc(b.label)} · ${n}</a>`;
    })
    .join("\n");

  const groupsHtml = bands
    .map((b) => {
      const chunk = rows.filter(b.test);
      const cards = chunk
        .map((r) => {
          const q = byId[r.id];
          const exp = explanations[String(r.id)];
          const sig = signals[String(r.id)];
          const lesson = `pmp-teach-full-q${r.id}.html`;
          const exists = fs.existsSync(path.join(ROOT, "public", "pmp", lesson));
          const proc =
            exp?.pmbok8?.processes?.[0] ||
            exp?.pmbok8?.domains?.[0] ||
            "Full Bank";
          const open = r.wrongAttempt > 0 ? " · đang mở" : "";
          const pat = patternById[r.id] ? ` · ${patternById[r.id]}` : "";
          const summary = (
            sig?.whySolutionBullets?.[0] ||
            sig?.signalAnswer ||
            (exp?.pmbok8?.domains || []).join(", ") ||
            ""
          )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 110);
          return `              <a class="teach-card" href="${exists ? lesson : `pmp-full-questions.html#q-${r.id}`}">
                <div class="q-label">Câu ${r.id} · LWA ${r.lastWrongAttempt}${open}</div>
                <h4>${esc(stemTitle(q?.text))}</h4>
                <p>${esc(proc)}${esc(pat)} · ${esc(summary)}</p>
              </a>`;
        })
        .join("\n");
      return `          <div id="${b.id}" class="teach-group">
            <div class="teach-group-head"><h3>${esc(b.label)} · ${chunk.length} câu</h3></div>
            <div class="teach-grid">
${cards}
            </div>
          </div>`;
    })
    .join("\n\n");

  const openCount = rows.filter((r) => r.wrongAttempt > 0).length;
  const hist = pack.hist || {};

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMBOK 8 — Ôn từng sai (lastWrongAttempt · luannt115 · ${rows.length} câu)</title>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
  <style>
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: #fafaf8; color: #1f2937; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
    h1 { margin: 0 0 0.5rem; color: #b45309; }
    .lead { color: #6b7280; margin: 0 0 1.25rem; max-width: 72ch; }
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
    .hist { font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Ôn từng sai — lastWrongAttempt ↓</h1>
    <p class="lead">
      <strong>${rows.length} câu</strong> Full Bank của <code>luannt115</code> có
      <em>lastWrongAttempt ≥ 1</em> (đã từng trả lời sai). Sắp xếp giảm dần LWA.
      ${openCount} câu vẫn đang mở (<code>wrongAttempt &gt; 0</code>).
    </p>
    <p class="hist">Phân bố LWA:
      ${Object.entries(hist)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([k, v]) => `<strong>${k}</strong>=${v}`)
        .join(" · ")}
    </p>
    <div class="badges">
      <span class="badge">${rows.length} câu</span>
      <span class="badge">${openCount} đang mở</span>
      <span class="badge">sort: LWA DESC</span>
      <span class="badge">updated ${esc(String(pack.updatedAt || "").slice(0, 10))}</span>
    </div>
    <div class="toolbar">
      <a href="pmp-exam-prep-lecture.html">← Bài giảng PMP</a>
      <a href="pmp-teach-last-wrong-patterns.html" class="secondary">26+ pattern từng sai</a>
      <a href="pmp-full-questions.html" class="secondary">Luyện đề + Ôn câu sai</a>
      <a href="pmp-teach-sai1-patterns.html" class="secondary">Sai:1 đang mở</a>
      <a href="pmp-teach-full-q${rows[0].id}.html" class="secondary">Bắt đầu Q${rows[0].id} (LWA ${rows[0].lastWrongAttempt})</a>
    </div>
    <div class="teach-group-jump">
${jumps}
    </div>

${groupsHtml}
  </div>
</body>
</html>
`;

  fs.writeFileSync(OUT_PATH, html);
  console.log(`Wrote ${OUT_PATH} (${rows.length} rows, open=${openCount})`);
}

main();
