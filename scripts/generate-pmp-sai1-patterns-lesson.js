/**
 * Refresh Sai:1 snapshot (wrongAttempt === 1) from LWA pack and build patterns + lessons.
 *
 * Usage:
 *   node scripts/generate-pmp-sai1-patterns-lesson.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LWA_PACK = path.join(ROOT, "data", "pmp-luannt115-full-last-wrong-patterns.json");
const IDS_OUT = path.join(ROOT, "data", "pmp-luannt115-full-sai1-ids.json");
const PATTERNS_OUT = path.join(ROOT, "data", "pmp-luannt115-sai1-patterns.json");
const STATS_WRONG_OUT = path.join(ROOT, "data", "pmp-stats-luannt115-full-wrong.json");
const PUBLIC_OUT = path.join(ROOT, "public", "pmp", "pmp-teach-sai1-patterns.html");
const TEACH_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "lessons",
  "0002-sai1-eight-patterns.html",
);
const REF_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "reference",
  "0002-sai1-patterns.md",
);

// Reuse family grouping from LWA lesson.
const FAMILIES = [
  {
    id: "fam-lead",
    label: "Lead people",
    ids: [
      "resilience",
      "transparency-news",
      "own-mistake",
      "coach-conflict",
      "competency-develop",
      "knowledge-transfer",
      "team-stage",
      "culture-change",
    ],
  },
  {
    id: "fam-process",
    label: "Protect process",
    ids: [
      "opa-improve",
      "risk-cadence",
      "change-control",
      "verify-scope",
      "quality-sampling",
      "charter-authorize",
      "plan-translate",
      "compliance-ethics",
      "compliance-audit",
      "compliance-research",
    ],
  },
  {
    id: "fam-value",
    label: "Money & governance",
    ids: ["money-forecast", "benefits-metrics", "governance-roles"],
  },
  {
    id: "fam-engage",
    label: "Engage & tailor",
    ids: [
      "engage-plan",
      "adapt-comms",
      "identify-stakeholders",
      "agile-mvp",
      "hybrid-tailor",
    ],
  },
];

const QUIZ = [
  {
    pid: "money-forecast",
    tip: "top Sai:1",
    ans: "D",
    q: "Budget cần quản đi tiếp trong bối cảnh biến động. Hành động ưu tiên?",
    opts: {
      A: "Giữ nguyên BAC vì “strategic direction không đổi”",
      B: "Ngừng đo EVM để giảm tải báo cáo tài chính",
      C: "Chỉ cắt scope ngẫu nhiên mỗi tuần không forecast",
      D: "Cập nhật financial forecasts thường xuyên để thấy nhu cầu thực",
    },
  },
  {
    pid: "opa-improve",
    tip: "lessons → action",
    ans: "B",
    q: 'Agile multi-team; sponsor lo <span class="kw-signal">quá nhiều change đã deliver</span>. PM?',
    opts: {
      A: "Chỉ nhắc team đọc SLA/SOW rồi coi như xong",
      B: "Cập nhật OPA để còn hiệu lực và khớp mục tiêu công ty",
      C: "Bắt buộc mọi người online 100% thời gian làm việc",
      D: "Chỉ trỏ sang lessons cũ mà không cập nhật quy trình hiện tại",
    },
  },
  {
    pid: "change-control",
    tip: "ICC",
    ans: "A",
    q: "SH mới muốn đổi ownership mid-flight → ảnh hưởng scope. First move?",
    opts: {
      A: "Assess impact on scope rồi formal change path nếu cần",
      B: "Accept ngay vì “strategic partner” luôn đúng về scope",
      C: "Im lặng thêm work vào sprint mà không ghi CR",
      D: "Chỉ cancel feature cũ random để nhường chỗ partner",
    },
  },
  {
    pid: "adapt-comms",
    tip: "comms plan",
    ans: "B",
    q: "SH feedback kiểu nhận tin không hiệu quả. Mindset đúng?",
    opts: {
      A: "Giữ nguyên channel vì “đã ghi trong plan ban đầu”",
      B: "Điều chỉnh communication approach theo nhu cầu/feedback SH",
      C: "Chỉ tăng tần suất email blast cho mọi người giống nhau",
      D: "Ngừng cập nhật để tránh noise",
    },
  },
  {
    pid: "agile-mvp",
    tip: "MVP / PO",
    ans: "C",
    q: "Timeline chặt; scope đầy. Cách PMI nhất?",
    opts: {
      A: "Ship tất cả stories cùng lúc để “đủ giá trị” ngay ngày 1",
      B: "Team tự cắt backlog giữa sprint không hỏi Product Owner",
      C: "MVP + PO reprioritize / protect iteration theo backlog",
      D: "Pause dự án đến khi mọi requirement hoàn hảo trên giấy",
    },
  },
  {
    pid: "governance-roles",
    tip: "roles",
    ans: "A",
    q: "Rối vai trò giữa team / sponsor / vendor. First?",
    opts: {
      A: "Clarify roles & responsibilities / RACI với stakeholders",
      B: "Để mỗi người tự quyết theo “empowerment” không khung",
      C: "PM làm hết work của team để tránh confusion",
      D: "Cancel vendor ngay vì “quá nhiều người nói”",
    },
  },
];

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortTitle(title) {
  return String(title || "").split("—")[0].trim();
}

function idChips(samples, limit = 4, qPrefix = "") {
  return (samples || [])
    .slice(0, limit)
    .map(
      (s) =>
        `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${s.id}">Q${s.id}</a>`,
    )
    .join("\n                  ");
}

function buildSai1Pack(lwa) {
  const metaById = Object.fromEntries(lwa.patterns.map((p) => [p.id, p]));
  const openRows = lwa.rows.filter((r) => r.wrongAttempt === 1);
  const byPattern = new Map();
  for (const row of openRows) {
    const pid = row.patternId || "other";
    if (!byPattern.has(pid)) byPattern.set(pid, []);
    byPattern.get(pid).push(row);
  }

  const patterns = [];
  for (const [pid, rows] of byPattern) {
    if (pid === "other") continue;
    const meta = metaById[pid] || {
      id: pid,
      title: pid,
      cue: pid,
      action: "See per-question teach",
      trap: "Mis-bucket",
    };
    const sorted = [...rows].sort((a, b) => a.id - b.id);
    patterns.push({
      id: pid,
      title: meta.title,
      cue: meta.cue,
      action: meta.action,
      trap: meta.trap,
      count: sorted.length,
      hard: 0,
      open: sorted.length,
      sampleIds: sorted.slice(0, 6).map((r) => ({
        id: r.id,
        lastWrongAttempt: r.lastWrongAttempt,
        wrongAttempt: r.wrongAttempt,
        attempts: r.attempts,
        process: r.process,
      })),
    });
  }
  patterns.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const otherRows = byPattern.get("other") || [];
  const otherSorted = [...otherRows].sort((a, b) => a.id - b.id);
  const other = {
    id: "other",
    title: "Other / mixed",
    count: otherSorted.length,
    hard: 0,
    open: otherSorted.length,
    sampleIds: otherSorted.slice(0, 12).map((r) => ({
      id: r.id,
      lastWrongAttempt: r.lastWrongAttempt,
      wrongAttempt: r.wrongAttempt,
      attempts: r.attempts,
      process: r.process,
    })),
    rowsPreview: otherSorted.slice(0, 20).map((r) => ({
      id: r.id,
      stem: r.stem,
      correctLabel: r.correctLabel,
      process: r.process,
    })),
  };

  const namedCount = patterns.length;
  const total = openRows.length;
  const summary = {
    total,
    openWrong: total,
    closed: 0,
    criteria: "wrongAttempt === 1",
    sort: "id ASC",
    taxonomyVersion: lwa.summary?.taxonomyVersion || 2,
    patternCount: namedCount,
    otherCount: other.count,
    otherPct: total ? Math.round((other.count / total) * 100) : 0,
    updatedAt: new Date().toISOString(),
    source: "pmp-luannt115-full-last-wrong-patterns.json",
    patternCounts: [
      ...patterns.map((p) => [p.id, p.count]),
      ["other", other.count],
    ],
  };

  return {
    summary,
    patterns,
    other,
    rows: openRows.map((r) => ({
      id: r.id,
      attempts: r.attempts,
      wrongAttempt: r.wrongAttempt,
      lastWrongAttempt: r.lastWrongAttempt,
      patternId: r.patternId,
      domain: r.domain,
      focus: r.focus,
      process: r.process,
      stem: r.stem,
      correct: r.correct,
      correctLabel: r.correctLabel,
    })),
  };
}

function buildHtml(data, { assetPrefix, cssHref, fullscreenHref }) {
  const qPrefix = assetPrefix;
  const byId = Object.fromEntries(data.patterns.map((p) => [p.id, p]));
  const sorted = [...data.patterns].sort((a, b) => b.count - a.count);
  const other = data.other;
  const s = data.summary;

  const familiesWithContent = FAMILIES.map((fam) => ({
    ...fam,
    patterns: fam.ids.map((id) => byId[id]).filter((p) => p && p.count > 0),
  })).filter((f) => f.patterns.length);

  const familyNav = familiesWithContent
    .map((f) => `        <a href="#${f.id}">${esc(f.label)}</a>`)
    .join("\n");

  const mapRows = sorted
    .map(
      (p, i) => `              <tr>
                <td><a href="#p-${p.id}"><strong>${i + 1}. ${esc(shortTitle(p.title))}</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">n=${p.count}</span></td>
                <td>${esc(p.cue)}</td>
                <td>${esc(p.action)}</td>
                <td>${idChips(p.sampleIds, 3, qPrefix)}</td>
              </tr>`,
    )
    .join("\n");

  const familySections = familiesWithContent
    .map((fam) => {
      const blocks = fam.patterns
        .map((p) => {
          const tip = (p.sampleIds || [])[0];
          const tipHtml = tip
            ? `<div class="card tip">
            <strong><a href="${qPrefix}pmp-full-questions.html#q-${tip.id}">Q${tip.id}</a>:</strong>
            Cue → <em>${esc(p.action)}</em>
            · mẫu:
            ${(p.sampleIds || [])
              .slice(0, 5)
              .map(
                (x) =>
                  `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${x.id}">${x.id}</a>`,
              )
              .join(" ")}
          </div>`
            : "";
          return `        <article class="pattern-block" id="p-${p.id}">
          <h3>${esc(p.title)} <span style="font-weight:500;color:var(--muted);font-size:0.9rem">· ${p.count} câu</span></h3>
          <div class="rule">${esc(p.cue)}  →  ${esc(p.action)}</div>
          ${tipHtml}
          <div class="card danger"><strong>Trap:</strong> ${esc(p.trap)}</div>
        </article>`;
        })
        .join("\n");
      return `      <section id="${fam.id}">
        <h2>${esc(fam.label)}</h2>
${blocks}
      </section>`;
    })
    .join("\n\n");

  const quizHtml = QUIZ.map((item, i) => {
    const buttons = ["A", "B", "C", "D"]
      .map(
        (k) =>
          `            <button type="button" class="opt-btn" data-k="${k}">${esc(item.opts[k])}</button>`,
      )
      .join("\n");
    return `          <div class="quiz-card" data-quiz="${i}" data-ans="${item.ans}">
            <div class="q-num">${esc(item.pid)} · ${esc(item.tip)}</div>
            <div class="q-text">${item.q}</div>
${buttons}
            <div class="feedback" data-fb></div>
          </div>`;
  }).join("\n\n");

  const cheatLines = sorted
    .slice(0, 12)
    .map((p) => `IF ${p.cue.slice(0, 42).padEnd(42)} → ${shortTitle(p.title)}`)
    .join("\n");

  const famIdsJson = JSON.stringify(familiesWithContent.map((f) => f.id));

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMP Teach — ${s.patternCount} pattern Sai:1 (${s.total} câu · luannt115)</title>
  <link rel="stylesheet" href="${cssHref}">
  <link rel="stylesheet" href="${fullscreenHref}">
  <style>
    .pattern-block { margin-bottom: 1.25rem; }
    .pattern-block h3 { margin: 0 0 0.5rem; font-size: 1.05rem; }
    .fam-note { font-size: 0.85rem; color: var(--muted); margin: 0 0 1rem; }
    table td { vertical-align: top; font-size: 0.84rem; }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">PMP Teach</div>
      <div class="brand-sub">${s.patternCount} pattern · Sai:1 · ${s.total}</div>
      <nav id="sideNav">
        <a href="#intro" class="active">Giới thiệu</a>
        <a href="#map">Bản đồ ${s.patternCount}</a>
${familyNav}
        <a href="#other">Other / mixed</a>
        <a href="#practice">Luyện ${QUIZ.length} câu</a>
        <a href="#cheat">Cheat sheet</a>
        <a href="#next">Next</a>
      </nav>
      <a class="back-link" href="${assetPrefix}pmp-exam-prep-lecture.html">← Bài giảng PMP</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-full-sai1-index.html">Index Sai:1 (${s.total})</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-full-questions.html">→ Ôn câu sai (Sai:1)</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-last-wrong-patterns.html">LWA 26 pattern</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-glossary-vi.html">Glossary</a>
    </aside>

    <div>
      <nav class="mobile-nav">
        <a href="#intro">Intro</a>
        <a href="#map">Map</a>
        <a href="#practice">Quiz</a>
        <a href="#cheat">Cheat</a>
        <a href="${assetPrefix}pmp-exam-prep-lecture.html">Lecture</a>
      </nav>

      <main>
        <header class="hero" id="intro">
          <h1>${s.patternCount} pattern từ câu Sai:1 đang mở</h1>
          <p class="lead">
            User <strong>luannt115</strong> · Full Bank · tiêu chí
            <code>wrongAttempt === 1</code> (open wrong đúng một lần).
            Snapshot: <strong>${s.total} câu</strong>.
            Taxonomy v${s.taxonomyVersion}: <strong>${s.patternCount} named + other</strong>
            (${other.count} mixed · ${s.otherPct}%) — không ép 8 bucket.
          </p>
          <div class="stat-grid">
            <div class="stat-box"><strong>${s.total}</strong><span>Sai:1</span></div>
            <div class="stat-box"><strong>${s.patternCount}</strong><span>named patterns</span></div>
            <div class="stat-box"><strong>${other.count}</strong><span>other / mixed</span></div>
            <div class="stat-box"><strong>${s.otherPct}%</strong><span>other</span></div>
          </div>
          <div class="badges">
            <span class="badge">wrongAttempt=1</span>
            <span class="badge">Ôn câu sai</span>
            <span class="badge">Lead accountably</span>
            <span class="badge">Focus on value</span>
          </div>
        </header>

        <section id="map">
          <h2>Bản đồ ${s.patternCount} pattern</h2>
          <div class="card info">
            <p style="margin:0" class="fam-note">
              Cùng taxonomy với <a href="${assetPrefix}pmp-teach-last-wrong-patterns.html">LWA 26 pattern</a>,
              nhưng chỉ ${s.total} câu đang trong filter <strong>Ôn câu sai (Sai:1)</strong>.
              Ưu tiên drill theo count ↓ rồi mở index / full teach từng câu.
            </p>
          </div>
          <table>
            <thead>
              <tr><th>Pattern</th><th>Cue</th><th>Hành động đúng</th><th>Mẫu ID</th></tr>
            </thead>
            <tbody>
${mapRows}
              <tr>
                <td><a href="#other"><strong>Other / mixed</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">n=${other.count}</span></td>
                <td>edge / multi-signal</td>
                <td>Ôn qua index Sai:1 + bài giảng từng câu</td>
                <td>${idChips(other.sampleIds, 3, qPrefix)}</td>
              </tr>
            </tbody>
          </table>
          <p class="ref-footer" style="margin-top:0.75rem">
            Data: <code>pmp-luannt115-sai1-patterns.json</code> ·
            <a href="${assetPrefix}pmp-teach-full-sai1-index.html">${s.total} bài theo ID ↑</a>
          </p>
        </section>

${familySections}

        <section id="other">
          <h2>Other / mixed · ${other.count} câu (${s.otherPct}%)</h2>
          <div class="card info">
            <p style="margin:0">
              Không nhồi vào bucket giả. Ôn trực tiếp trên
              <a href="${assetPrefix}pmp-teach-full-sai1-index.html">index Sai:1</a>
              hoặc Full Bank filter Ôn câu sai.
            </p>
          </div>
          <div class="card tip">
            Mẫu:
            ${(other.sampleIds || [])
              .slice(0, 10)
              .map(
                (x) =>
                  `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${x.id}">${x.id}</a>`,
              )
              .join(" ")}
          </div>
        </section>

        <section id="practice">
          <h2>Luyện ${QUIZ.length} câu (retrieval · top Sai:1 cues)</h2>
          <p class="flash-hint">Options cân độ dài. Chọn → feedback ngay.</p>
${quizHtml}
        </section>

        <section id="cheat">
          <h2>Cheat sheet (top by count)</h2>
          <div class="cheat-sheet">${esc(cheatLines)}
IF other / mixed                              → open Q teach · don’t force bucket</div>
        </section>

        <section id="next">
          <h2>Next</h2>
          <div class="card tip">
            <ol style="margin:0;padding-left:1.2rem">
              <li>Làm ${QUIZ.length} quiz đến khi đúng hết không nhìn cheat.</li>
              <li>Mở <a href="${assetPrefix}pmp-full-questions.html">Full Bank → Ôn câu sai (Sai:1)</a> — ${s.total} câu.</li>
              <li>Dùng <a href="${assetPrefix}pmp-teach-full-sai1-index.html">index ${s.total}</a> theo pattern map ở trên.</li>
              <li>Khi đã đúng lại (wrongAttempt=0), câu tự ra khỏi filter.</li>
            </ol>
          </div>
          <p class="ref-footer">
            Primary:
            <a href="https://www.pmi.org/standards/pmbok/" target="_blank" rel="noopener">PMBOK® Guide — Eighth Edition (PMI)</a>
            · Teach: <code>teach/pmp-wrong-patterns/lessons/0002-sai1-eight-patterns.html</code>
            · Related:
            <a href="${assetPrefix}pmp-exam-prep-lecture.html">Bài giảng PMP</a> ·
            <a href="${assetPrefix}pmp-teach-last-wrong-patterns.html">LWA</a>
          </p>
        </section>
      </main>
    </div>
  </div>

  <script>
    document.querySelectorAll(".quiz-card").forEach((card) => {
      const ans = card.getAttribute("data-ans");
      const fb = card.querySelector("[data-fb]");
      card.querySelectorAll(".opt-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (card.dataset.locked === "1") return;
          card.dataset.locked = "1";
          const ok = btn.getAttribute("data-k") === ans;
          btn.classList.add(ok ? "correct" : "wrong");
          card.querySelectorAll(".opt-btn").forEach((b) => {
            b.disabled = true;
            if (b.getAttribute("data-k") === ans) b.classList.add("correct");
          });
          fb.className = "feedback " + (ok ? "ok" : "bad");
          fb.textContent = ok
            ? "Đúng — giữ cue này dưới 5 giây lần sau."
            : "Sai — đọc lại rule của pattern, rồi drill lại ID gắn pattern.";
        });
      });
    });
    const links = [...document.querySelectorAll("#sideNav a")];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    ["intro","map",...${famIdsJson},"other","practice","cheat","next"]
      .forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  </script>
</body>
</html>
`;
}

function buildReference(data) {
  const lines = [
    `# Sai:1 multi-pattern cheat (${data.summary.patternCount} + other)`,
    "",
    `Criteria: wrongAttempt === 1 · total ${data.summary.total} · other ${data.summary.otherPct}%`,
    "",
    "| ID | Cue | Action | n |",
    "|----|-----|--------|---|",
  ];
  for (const p of [...data.patterns].sort((a, b) => b.count - a.count)) {
    lines.push(`| ${p.id} | ${p.cue} | ${p.action} | ${p.count} |`);
  }
  lines.push(
    `| other | mixed / edge | drill Sai:1 index | ${data.other.count} |`,
    "",
  );
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(LWA_PACK)) {
    console.error("Missing LWA pack. Run analyze-pmp-last-wrong-patterns.js first.");
    process.exit(1);
  }
  const lwa = JSON.parse(fs.readFileSync(LWA_PACK, "utf8"));
  const data = buildSai1Pack(lwa);
  const ids = data.rows.map((r) => r.id).sort((a, b) => a - b);

  fs.writeFileSync(
    IDS_OUT,
    JSON.stringify(
      {
        quizId: "full",
        username: "luannt115",
        updatedAt: data.summary.updatedAt,
        criteria: "wrongAttempt === 1",
        count: ids.length,
        ids,
      },
      null,
      2,
    ) + "\n",
  );

  fs.writeFileSync(PATTERNS_OUT, JSON.stringify(data, null, 2) + "\n");

  fs.writeFileSync(
    STATS_WRONG_OUT,
    JSON.stringify(
      {
        quizId: "full",
        username: "luannt115",
        updatedAt: data.summary.updatedAt,
        wrongGt0Count: ids.length,
        wrongExact1Count: ids.length,
        wrongOnes: ids.map((id) => ({ id, wrong: 1, wrongAttempt: 1 })),
        wrongExact1: ids,
      },
      null,
      2,
    ) + "\n",
  );

  fs.writeFileSync(
    PUBLIC_OUT,
    buildHtml(data, {
      assetPrefix: "",
      cssHref: "pmp-teach-wrong-patterns.css",
      fullscreenHref: "pmp-teach-fullscreen.css",
    }),
  );

  fs.mkdirSync(path.dirname(TEACH_OUT), { recursive: true });
  fs.writeFileSync(
    TEACH_OUT,
    buildHtml(data, {
      assetPrefix: "../../../public/pmp/",
      cssHref: "../assets/lesson.css",
      fullscreenHref: "../../../public/pmp/pmp-teach-fullscreen.css",
    }),
  );

  fs.mkdirSync(path.dirname(REF_OUT), { recursive: true });
  fs.writeFileSync(REF_OUT, buildReference(data));

  console.log(
    JSON.stringify(
      {
        ids: ids.length,
        patterns: data.summary.patternCount,
        other: data.other.count,
        public: PUBLIC_OUT,
        indexIds: IDS_OUT,
      },
      null,
      2,
    ),
  );
}

main();
