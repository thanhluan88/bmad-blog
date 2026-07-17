/**
 * Generate Full Bank (1123) multi-pattern teach lesson.
 *
 * Usage:
 *   node scripts/analyze-pmp-full-bank-patterns.js
 *   node scripts/generate-pmp-full-bank-patterns-lesson.js
 */
const fs = require("fs");
const path = require("path");
const { EXAMPLES } = require("./lib/pmp-pattern-examples");
const { getDrill } = require("./lib/pmp-drill-from-explanation");

const ROOT = path.join(__dirname, "..");
const PACK = path.join(ROOT, "data", "pmp-full-bank-patterns.json");
const PUBLIC_OUT = path.join(ROOT, "public", "pmp", "pmp-teach-full-bank-patterns.html");
const TEACH_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "lessons",
  "0004-full-bank-patterns.html",
);
const REF_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "reference",
  "0004-full-bank-patterns.md",
);

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
    tip: "EVM / budget",
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
    pid: "team-stage",
    tip: "Tuckman / EI",
    ans: "A",
    q: "Team mới (shouting / storming). Mindset đúng?",
    opts: {
      A: "Nhận diện giai đoạn team + dùng EI / coach dynamics",
      B: "Micromanage từng task và escalate HR ngay lập tức",
      C: "Im lặng để “tự chín” không can thiệp environment",
      D: "Đổi hết member vì conflict là dấu hiệu fail",
    },
  },
  {
    pid: "compliance-ethics",
    tip: "no exception",
    ans: "A",
    q: "Multinational; local muốn lệch ethics/HQ. Mindset đúng?",
    opts: {
      A: "Không authorize ethics exception; escalate/validate theo chuẩn org",
      B: "Cho phép local exception nếu giúp giữ tiến độ quý này",
      C: "Đổi HQ policy một mình vì “agile nghĩa là linh hoạt”",
      D: "Che deviation đến sau audit rồi mới bàn",
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
        `<a class="id-chip" href="${qPrefix}pmp-teach-full-q${s.id}.html">Q${s.id}</a>`,
    )
    .join("\n                  ");
}

/** Lecture-style mini-drill for each sample ID (up to 5 per pattern). */
function renderDrills(sampleIds, qPrefix = "") {
  const blocks = (sampleIds || [])
    .slice(0, 5)
    .map((s) => {
      const d = getDrill(s.id);
      if (!d) return "";
      const wrongHtml = (d.wrongs || [])
        .map((w) => `            <span class="opt bad">${esc(w.text)}</span>`)
        .join("\n");
      return `          <div class="example">
            <div class="q"><a href="${qPrefix}pmp-teach-full-q${d.id}.html">Câu ${d.id}</a>: ${esc(d.tinhHuong)}. <strong>PM ${esc(d.ask)}?</strong></div>
            <span class="opt ok">${esc(d.correctLetter)}. ${esc(d.correctText)} ✓</span>
${wrongHtml}
          </div>`;
    })
    .filter(Boolean);
  if (!blocks.length) return "";
  return `          <h4 style="margin:0.75rem 0 0.35rem;font-size:0.85rem;color:var(--muted)">Drill từng câu mẫu</h4>
${blocks.join("\n")}`;
}

function buildHtml(data, { assetPrefix, cssHref, fullscreenHref }) {
  const qPrefix = assetPrefix;
  const byId = Object.fromEntries(data.patterns.map((p) => [p.id, p]));
  const sorted = [...data.patterns].filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
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
    .map((p, i) => {
      const ex = EXAMPLES[p.id];
      const sitRaw = ex
        ? ex.stem.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        : p.cue;
      const act = ex ? ex.do : p.action;
      return `              <tr>
                <td><a href="#p-${p.id}"><strong>${i + 1}. ${esc(shortTitle(p.title))}</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">n=${p.count}${p.open ? ` · open ${p.open}` : ""}</span></td>
                <td>${esc(sitRaw)}<br><span style="font-size:0.72rem;color:var(--muted)">${esc(p.cue)}</span></td>
                <td>${esc(act)}</td>
                <td style="font-size:0.78rem">${esc(p.trap)}</td>
                <td>${idChips(p.sampleIds, 3, qPrefix)}</td>
              </tr>`;
    })
    .join("\n");

  const familySections = familiesWithContent
    .map((fam) => {
      const blocks = fam.patterns
        .map((p) => {
          const tip = (p.sampleIds || [])[0];
          const ex = EXAMPLES[p.id];
          const exampleBody = ex
            ? `<strong>Ví dụ:</strong> ${ex.stem}
            <br><strong>→ Làm:</strong> ${ex.do}
            <br><strong>Tránh:</strong> ${esc(p.trap)}`
            : `<strong>Cue →</strong> <em>${esc(p.action)}</em>
            <br><strong>Tránh:</strong> ${esc(p.trap)}`;
          const tipHtml = tip
            ? `<div class="card tip">
            ${exampleBody}
            <div style="margin-top:0.45rem;font-size:0.8rem">
              Mẫu:
              ${(p.sampleIds || [])
                .slice(0, 5)
                .map(
                  (x) =>
                    `<a class="id-chip" href="${qPrefix}pmp-teach-full-q${x.id}.html">${x.id}</a>`,
                )
                .join(" ")}
              · <a href="${qPrefix}pmp-full-questions.html#q-${tip.id}">luyện đề</a>
              · <a href="${qPrefix}pmp-teach-full-q${tip.id}.html">Q${tip.id}</a>
            </div>
          </div>`
            : ex
              ? `<div class="card tip">${exampleBody}</div>`
              : "";
          const drillsHtml = renderDrills(p.sampleIds, qPrefix);
          return `        <article class="pattern-block" id="p-${p.id}">
          <h3>${esc(p.title)} <span style="font-weight:500;color:var(--muted);font-size:0.9rem">· ${p.count} câu${p.open ? ` · ${p.open} đang mở` : ""}</span></h3>
          <div class="rule">${esc(p.cue)}  →  ${esc(p.action)}</div>
          ${tipHtml}
${drillsHtml}
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
    .slice(0, 14)
    .map((p) => {
      const ex = EXAMPLES[p.id];
      const action = ex ? ex.do.replace(/<[^>]+>/g, "") : p.action;
      return `IF ${p.cue} → ${action}`;
    })
    .concat([`IF other / mixed → open Q teach · don’t force bucket`])
    .join("\n");

  /** Lecture-style NEXT table: curated first rows + top bank patterns. */
  const NEXT_CORE = [
    {
      sit: "Risk đã materialize",
      next: "Tra risk register → implement planned response",
      href: "#p-risk-cadence",
    },
    {
      sit: "Đã nghe 2 bên conflict",
      next: "Facilitate joint problem-solving session",
      href: "#p-coach-conflict",
    },
    {
      sit: "Change request submitted",
      next: "Perform Integrated Change Control",
      href: "#p-change-control",
    },
    {
      sit: "Sprint có impediment",
      next: "Remove impediment / escalate nếu PM không giải quyết được",
      href: "#p-agile-mvp",
    },
  ];
  const nextCoreIds = new Set([
    "risk-cadence",
    "coach-conflict",
    "change-control",
    "agile-mvp",
  ]);
  const nextExtraRows = sorted
    .filter((p) => !nextCoreIds.has(p.id) && EXAMPLES[p.id])
    .slice(0, 10)
    .map((p) => {
      const ex = EXAMPLES[p.id];
      const sit = esc(ex.stem.replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
      return `              <tr>
                <td><a href="#p-${p.id}">${sit}</a></td>
                <td>${esc(ex.do)}</td>
              </tr>`;
    })
    .join("\n");
  const nextCoreRows = NEXT_CORE.map(
    (r) => `              <tr>
                <td><a href="${r.href}">${esc(r.sit)}</a></td>
                <td>${esc(r.next)}</td>
              </tr>`,
  ).join("\n");

  const famIdsJson = JSON.stringify(familiesWithContent.map((f) => f.id));
  const namedWithCount = sorted.length;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMP Teach — ${s.patternCount} pattern trên Full Bank (${s.total} câu)</title>
  <link rel="stylesheet" href="${cssHref}">
  <link rel="stylesheet" href="${fullscreenHref}">
  <style>
    .pattern-block { margin-bottom: 1.25rem; }
    .pattern-block h3 { margin: 0 0 0.5rem; font-size: 1.05rem; }
    .fam-note { font-size: 0.85rem; color: var(--muted); margin: 0 0 1rem; }
    table td { vertical-align: top; font-size: 0.84rem; }
    .example { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem 1rem; margin: 0.75rem 0; }
    .example .q { font-weight: 600; margin-bottom: 0.45rem; font-size: 0.92rem; }
    .example .opt { display: block; font-size: 0.84rem; margin: 0.2rem 0; padding: 0.2rem 0; }
    .example .opt.ok { color: var(--ok, #166534); }
    .example .opt.bad { color: var(--muted); }
    .example .opt.bad::before { content: "✗ "; color: var(--bad, #b91c1c); }
    .example .opt.ok::before { content: ""; }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">PMP Teach</div>
      <div class="brand-sub">${namedWithCount} pattern · Full Bank ${s.total}</div>
      <nav id="sideNav">
        <a href="#intro" class="active">Giới thiệu</a>
        <a href="#map">Bản đồ pattern</a>
${familyNav}
        <a href="#other">Other / mixed</a>
        <a href="#next-heuristics">NEXT heuristics</a>
        <a href="#practice">Luyện ${QUIZ.length} câu</a>
        <a href="#cheat">Cheat sheet</a>
        <a href="#next">Next</a>
      </nav>
      <a class="back-link" href="${assetPrefix}pmp-exam-prep-lecture.html#practice-teach">← Bài giảng · Practice</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-full-series-index.html">Index Full Bank (1123)</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-full-questions.html">→ Luyện Full Bank</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-last-wrong-patterns.html">LWA (cá nhân)</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-glossary-vi.html">Glossary</a>
    </aside>

    <div>
      <nav class="mobile-nav">
        <a href="#intro">Intro</a>
        <a href="#map">Map</a>
        <a href="#next-heuristics">NEXT</a>
        <a href="#practice">Quiz</a>
        <a href="#cheat">Cheat</a>
        <a href="${assetPrefix}pmp-exam-prep-lecture.html#practice-teach">Lecture</a>
      </nav>

      <main>
        <header class="hero" id="intro">
          <h1>${namedWithCount} trap-pattern trên toàn Full Bank</h1>
          <p class="lead">
            Phân tích <strong>${s.total} câu</strong> Full Bank theo taxonomy PMI trap v${s.taxonomyVersion}
            (<strong>${s.patternCount} named + other</strong> — ${other.count} mixed · ${s.otherPct}%).
            Học map keyword → hành động. Mỗi pattern có <strong>ví dụ tình huống</strong>
            và <strong>mini-drill từng câu mẫu</strong> (đáp án đúng + vì sao sai).
            Dùng <a href="#next-heuristics">NEXT heuristics</a> khi stem hỏi bước tiếp theo.
            Overlay open/hard từ snapshot LWA khi có.
          </p>
          <div class="stat-grid">
            <div class="stat-box"><strong>${s.total}</strong><span>câu Full Bank</span></div>
            <div class="stat-box"><strong>${namedWithCount}</strong><span>named &gt; 0</span></div>
            <div class="stat-box"><strong>${other.count}</strong><span>other / mixed</span></div>
            <div class="stat-box"><strong>${s.otherPct}%</strong><span>other</span></div>
          </div>
          <div class="badges">
            <span class="badge">1123 Full Bank</span>
            <span class="badge">taxonomy v${s.taxonomyVersion}</span>
            <span class="badge">specific-first</span>
            <span class="badge">Lead accountably</span>
          </div>
        </header>

        <section id="map">
          <h2>Bản đồ pattern (count ↓)</h2>
          <div class="card info">
            <p style="margin:0" class="fam-note">
              Mỗi dòng = <strong>tình huống đề → hành động đúng → tránh gì</strong>
              (cùng logic bài giảng FIRST / NEXT / BEST).
              Keyword nhỏ dưới tình huống để scan nhanh.
              Click pattern / mẫu ID → chi tiết + drill.
            </p>
          </div>
          <table>
            <thead>
              <tr><th>Pattern</th><th>Tình huống</th><th>Hành động đúng</th><th>Tránh</th><th>Mẫu ID</th></tr>
            </thead>
            <tbody>
${mapRows}
              <tr>
                <td><a href="#other"><strong>Other / mixed</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">n=${other.count}</span></td>
                <td>Edge / multi-signal — không nhồi bucket giả</td>
                <td>Ôn qua index Full Bank + teach từng câu</td>
                <td>Ép vào 1 named pattern</td>
                <td>${idChips(other.sampleIds, 3, qPrefix)}</td>
              </tr>
            </tbody>
          </table>
          <p class="ref-footer" style="margin-top:0.75rem">
            Data: <code>pmp-full-bank-patterns.json</code> ·
            <a href="${assetPrefix}pmp-teach-full-series-index.html">Index 1.123 câu</a>
          </p>
        </section>

${familySections}

        <section id="other">
          <h2>Other / mixed · ${other.count} câu (${s.otherPct}%)</h2>
          <div class="card info">
            <p style="margin:0">
              Residual có chủ đích — không nhồi bucket giả. Dùng
              <a href="${assetPrefix}pmp-teach-full-series-index.html">index Full Bank</a>
              hoặc mở từng <code>pmp-teach-full-qN</code>.
            </p>
          </div>
          <div class="card tip">
            Mẫu:
            ${(other.sampleIds || [])
              .slice(0, 10)
              .map(
                (x) =>
                  `<a class="id-chip" href="${qPrefix}pmp-teach-full-q${x.id}.html">${x.id}</a>`,
              )
              .join(" ")}
          </div>
        </section>

        <section id="next-heuristics">
          <h2>NEXT — “Bước TIẾP THEO?”</h2>
          <p class="fam-note">
            Giả định bạn <strong>đã làm bước trước</strong>. Tìm artifact đã có — rồi chọn NEXT đúng.
            Cùng khung với <a href="${assetPrefix}pmp-exam-prep-lecture.html#practice-teach">bài giảng Practice</a>.
          </p>
          <table>
            <thead><tr><th>Tình huống</th><th>NEXT đúng</th></tr></thead>
            <tbody>
${nextCoreRows}
${nextExtraRows}
            </tbody>
          </table>

          <div class="example">
            <div class="q"><a href="${qPrefix}pmp-full-questions.html#q-7">Câu 7</a>: 2 engineer conflict, PM đã nghe riêng từng bên. <strong>Next?</strong></div>
            <span class="opt ok">B. Facilitate joint problem-solving session ✓</span>
            <span class="opt bad">Escalate manager — chưa thử facilitate</span>
            <span class="opt bad">Chọn 1 phương án cho team — không empowered</span>
          </div>

          <div class="example">
            <div class="q">Risk đã materialize (đã có trong register). <strong>Next?</strong></div>
            <span class="opt ok">Tra risk register → implement planned response ✓</span>
            <span class="opt bad">Invent giải pháp mới — bỏ qua response đã plan</span>
            <span class="opt bad">Chỉ mở lessons learned — chưa act trên risk hiện tại</span>
          </div>

          <div class="example">
            <div class="q">Change request đã submitted. <strong>Next?</strong></div>
            <span class="opt ok">Perform Integrated Change Control (impact → CR/CCB) ✓</span>
            <span class="opt bad">Absorb scope vì “có value” — silent change</span>
            <span class="opt bad">Team làm luôn trong sprint — bỏ qua baseline</span>
          </div>

          <div class="example">
            <div class="q">Sprint có impediment / blocker. <strong>Next?</strong></div>
            <span class="opt ok">Remove impediment / escalate nếu PM không tự giải quyết được ✓</span>
            <span class="opt bad">Team tự hấp thụ thêm work mid-sprint</span>
            <span class="opt bad">Đợi retrospective mới bàn — quá muộn</span>
          </div>
        </section>

        <section id="practice">
          <h2>Luyện ${QUIZ.length} câu (retrieval)</h2>
          <p class="flash-hint">Options cân độ dài. Chọn → feedback ngay.</p>
${quizHtml}
        </section>

        <section id="cheat">
          <h2>Cheat sheet (cue → hành động)</h2>
          <div class="cheat-sheet">${esc(cheatLines)}</div>
        </section>

        <section id="next">
          <h2>Next</h2>
          <div class="card tip">
            <ol style="margin:0;padding-left:1.2rem">
              <li>Học map theo family Lead → Process → Money → Engage.</li>
              <li>Mở <a href="${assetPrefix}pmp-teach-full-series-index.html">index Full Bank</a> drill theo ID.</li>
              <li>Remediation cá nhân: <a href="${assetPrefix}pmp-teach-sai1-patterns.html">Sai:1</a> /
                  <a href="${assetPrefix}pmp-teach-last-wrong-patterns.html">LWA</a>.</li>
              <li>Series 110 chỉ là starter topic — không thay Full Bank pattern map.</li>
            </ol>
          </div>
          <p class="ref-footer">
            Primary:
            <a href="https://www.pmi.org/standards/pmbok/" target="_blank" rel="noopener">PMBOK® Guide — Eighth Edition (PMI)</a>
            · Teach: <code>teach/pmp-wrong-patterns/lessons/0004-full-bank-patterns.html</code>
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
            : "Sai — đọc lại rule của pattern, rồi drill ID mẫu.";
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
    ["intro","map",...${famIdsJson},"other","next-heuristics","practice","cheat","next"]
      .forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  </script>
</body>
</html>
`;
}

function buildReference(data) {
  const lines = [
    `# Full Bank multi-pattern cheat (${data.summary.patternCount} + other)`,
    "",
    `Criteria: all Full Bank · total ${data.summary.total} · other ${data.summary.otherPct}%`,
    "",
    "| ID | Cue | Action | n |",
    "|----|-----|--------|---|",
  ];
  for (const p of [...data.patterns].sort((a, b) => b.count - a.count)) {
    lines.push(`| ${p.id} | ${p.cue} | ${p.action} | ${p.count} |`);
  }
  lines.push(
    `| other | mixed / edge | drill full index | ${data.other.count} |`,
    "",
  );
  return lines.join("\n");
}

/** Compact HTML fragment for embedding in prep-lecture #practice-teach */
function buildLectureFragment(data) {
  const sorted = [...data.patterns].filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
  const other = data.other;
  const s = data.summary;
  const chips = sorted
    .map(
      (p) =>
        `<a class="teach-group-chip" href="pmp-teach-full-bank-patterns.html#p-${p.id}">${esc(shortTitle(p.title))} (${p.count})</a>`,
    )
    .join("\n            ");
  const topRows = sorted
    .slice(0, 12)
    .map(
      (p) =>
        `              <tr><td><a href="pmp-teach-full-bank-patterns.html#p-${p.id}"><strong>${esc(shortTitle(p.title))}</strong></a></td><td>${p.count}</td><td>${esc(p.action)}</td></tr>`,
    )
    .join("\n");

  return `        <section id="practice-teach">
          <h2>Practice &amp; Patterns — Full Bank PMBOK 8</h2>
          <p>
            Phân tích <strong>trap-pattern PMI</strong> trên toàn bộ
            <strong>${s.total} câu Full Bank</strong> (taxonomy v${s.taxonomyVersion}:
            ${s.patternCount} named + other ${other.count} · ${s.otherPct}%).
            Học mindset theo pattern → drill bài giảng từng câu → luyện đề.
            Series 110 theo chủ đề chỉ còn là <em>starter</em> (link bên dưới).
          </p>

          <div class="teach-series-toolbar">
            <a class="teach-series-index-link full-bank" href="pmp-teach-full-bank-patterns.html">🎯 Pattern Full Bank (${s.total} câu · ${s.patternCount}+other)</a>
            <a class="teach-series-index-link full-bank" href="pmp-teach-full-series-index.html">📖 Index bài giảng 1.123 câu</a>
            <a class="teach-series-index-link" href="pmp-teach-last-wrong-patterns.html">🎯 Pattern LWA (cá nhân)</a>
            <a class="teach-series-index-link" href="pmp-teach-sai1-patterns.html">🎯 Pattern Sai:1 đang mở</a>
            <a class="teach-series-index-link" href="pmp-teach-series-index.html">📚 Starter 110 câu (11 batch × 10)</a>
          </div>

          <div class="teach-group-jump">
            ${chips}
            <a class="teach-group-chip" href="pmp-teach-full-bank-patterns.html#other">Other / mixed (${other.count})</a>
          </div>

          <div class="card info" style="margin:1rem 0">
            <p style="margin:0 0 0.75rem">Top pattern theo số lượng trong Full Bank — mở bài teach để xem cue / trap / mẫu ID:</p>
            <table>
              <thead><tr><th>Pattern</th><th>n</th><th>Hành động đúng</th></tr></thead>
              <tbody>
${topRows}
                <tr><td><a href="pmp-teach-full-bank-patterns.html#other"><strong>Other / mixed</strong></a></td><td>${other.count}</td><td>Drill index Full Bank · không ép bucket</td></tr>
              </tbody>
            </table>
            <p class="ref-footer" style="margin:0.75rem 0 0">
              Data: <code>pmp-full-bank-patterns.json</code> ·
              <a href="pmp-full-questions.html">Luyện Full Bank</a> ·
              <a href="pmp-teach-full-sai1-index.html">Ôn Sai:1</a>
            </p>
          </div>
        </section>`;
}

function main() {
  if (!fs.existsSync(PACK)) {
    console.error("Missing pack. Run analyze-pmp-full-bank-patterns.js first.");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(PACK, "utf8"));

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

  const fragPath = path.join(ROOT, "data", "pmp-practice-teach-fragment.html");
  fs.writeFileSync(fragPath, buildLectureFragment(data) + "\n");

  console.log(
    JSON.stringify(
      {
        public: PUBLIC_OUT,
        teach: TEACH_OUT,
        fragment: fragPath,
        total: data.summary.total,
        otherPct: data.summary.otherPct,
      },
      null,
      2,
    ),
  );
}

main();
