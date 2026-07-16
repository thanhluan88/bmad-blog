/**
 * Generate multi-pattern LWA teach lesson (public + teach workspace).
 *
 * Usage:
 *   node scripts/analyze-pmp-last-wrong-patterns.js
 *   node scripts/generate-pmp-last-wrong-patterns-lesson.js
 */
const fs = require("fs");
const path = require("path");
const { EXAMPLES } = require("./lib/pmp-pattern-examples");

const ROOT = path.join(__dirname, "..");
const PACK = path.join(ROOT, "data", "pmp-luannt115-full-last-wrong-patterns.json");
const PUBLIC_OUT = path.join(ROOT, "public", "pmp", "pmp-teach-last-wrong-patterns.html");
const TEACH_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "lessons",
  "0003-lwa-multi-patterns.html",
);
const REF_OUT = path.join(
  ROOT,
  "teach",
  "pmp-wrong-patterns",
  "reference",
  "0003-lwa-multi-patterns.md",
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

/** Retrieval quiz — options roughly equal length; interleaved families. */
const QUIZ = [
  {
    pid: "resilience",
    tip: "Q828-style",
    ans: "C",
    q: 'Uncertainty cao; SH lo <span class="kw-cue">timeline + budget</span>. Approach nào đúng?',
    opts: {
      A: "Quy trình cộng tác để loại sạch risk và ambiguity khỏi dự án",
      B: "Chỉ tăng số cuộc họp status để “thấy” rủi ro rồi bỏ qua plan",
      C: "Đưa resilience vào approach: anticipate → respond → recover",
      D: "Đóng băng mọi thay đổi và không nhận SH concerns nữa",
    },
  },
  {
    pid: "opa-improve",
    tip: "Q981-style",
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
    pid: "money-forecast",
    tip: "Q376-style",
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
    pid: "transparency-news",
    tip: "Q305-style",
    ans: "B",
    q: "Công ty sắp layoff; team gần delivery lo mất việc. PM?",
    opts: {
      A: "Hứa chắc chắn không ai trong team bị cắt để giữ morale",
      B: "Cập nhật minh bạch thông tin có sẵn và mở thảo luận với team",
      C: "Cấm nói về layoff trong standup và chỉ focus burn-down",
      D: "Tạm dừng dự án đến khi HR công bố danh sách chính thức",
    },
  },
  {
    pid: "change-control",
    tip: "scope-impact",
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
    pid: "compliance-ethics",
    tip: "Q1047-style",
    ans: "A",
    q: "Multinational; local muốn lệch ethics/HQ. Mindset đúng?",
    opts: {
      A: "Không authorize ethics exception; escalate/validate theo chuẩn org",
      B: "Cho phép local exception nếu giúp giữ tiến độ quý này",
      C: "Đổi HQ policy một mình vì “agile nghĩa là linh hoạt”",
      D: "Che deviation đến sau audit rồi mới bàn",
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
    pid: "verify-scope",
    tip: "Q719-style",
    ans: "B",
    q: "Milestone xong; sponsor xin confirm deliverables đạt yêu cầu. Next?",
    opts: {
      A: "Tuyên bố success ngay vì timeline đã met",
      B: "Rà lại project scope & requirements để xác nhận objectives",
      C: "Chỉ hỏi team cảm nhận “ổn không” rồi đóng dự án",
      D: "Bắt đầu phase mới trước khi verify acceptance",
    },
  },
  {
    pid: "coach-conflict",
    tip: "Q257-style",
    ans: "C",
    q: "Senior nói riêng khó làm việc với đồng nghiệp giữa critical phase. PM?",
    opts: {
      A: "Chuyển ngay senior sang dự án khác để tránh ồn ào",
      B: "Ghi nhận rồi bỏ qua vì “senior nên tự xử”",
      C: "Coach kỹ thuật giải quyết xung đột để họ xử lý tình huống",
      D: "Họp toàn team tố cáo công khai để “làm gương”",
    },
  },
  {
    pid: "engage-plan",
    tip: "Q255-style",
    ans: "A",
    q: "Biết trước SH interests xung đột; một SH then trở thành resistant. First?",
    opts: {
      A: "Xem stakeholder engagement plan và engage đúng chiến lược đã ghi",
      B: "Escalate ngay sponsor để “ép” SH đó im lặng",
      C: "Bỏ qua SH resistant vì thiểu số và tiếp tục plan cũ",
      D: "Chỉ gửi email one-way rồi đánh dấu đã “manage engagement”",
    },
  },
  {
    pid: "hybrid-tailor",
    tip: "tailor weight",
    ans: "B",
    q: "Project nhỏ / mixed certainty. Cách đúng?",
    opts: {
      A: "Copy full waterfall megaproject ceremony không cắt",
      B: "Tailor / hybrid: vừa đủ governance theo rủi ro & certainty",
      C: "Zero artifacts vì “agile = không tài liệu gì cả”",
      D: "Chỉ predictive cố định dù uncertainty cao ở nhiều phần",
    },
  },
  {
    pid: "benefits-metrics",
    tip: "value metrics",
    ans: "D",
    q: "Muốn biết value/outcome với khách — không chỉ SPI. Chọn?",
    opts: {
      A: "Chỉ theo dõi SPI hàng tuần rồi dừng đo outcome",
      B: "Bỏ hết survey vì “team đã biết khách muốn gì”",
      C: "Đo LOC và số commit để chứng minh giá trị nghiệp vụ",
      D: "Dùng Kano / surveys / KPI để đo value & satisfaction",
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
        `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${s.id}">${s.id}×${s.lastWrongAttempt}</a>`,
    )
    .join("\n                  ");
}

function buildHtml({ assetPrefix, cssHref, fullscreenHref }) {
  const qPrefix = assetPrefix;
  const data = JSON.parse(fs.readFileSync(PACK, "utf8"));
  const byId = Object.fromEntries(data.patterns.map((p) => [p.id, p]));
  const sorted = [...data.patterns].sort((a, b) => b.count - a.count);
  const other = data.other;
  const s = data.summary;
  const hardN = Object.entries(s.hist || {})
    .filter(([k]) => Number(k) >= 3)
    .reduce((n, [, v]) => n + v, 0);

  const familyNav = FAMILIES.map(
    (f) => `        <a href="#${f.id}">${esc(f.label)}</a>`,
  ).join("\n");

  const mapRows = sorted
    .map((p, i) => {
      const fam =
        FAMILIES.find((f) => f.ids.includes(p.id))?.label || "Other";
      return `              <tr>
                <td><a href="#p-${p.id}"><strong>${i + 1}. ${esc(shortTitle(p.title))}</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">${esc(fam)} · n=${p.count}</span></td>
                <td>${esc(p.cue)}</td>
                <td>${esc(p.action)}</td>
                <td>
                  ${idChips(p.sampleIds, 3, qPrefix)}
                </td>
              </tr>`;
    })
    .join("\n");

  const familySections = FAMILIES.map((fam) => {
    const patterns = fam.ids
      .map((id) => byId[id])
      .filter((p) => p && p.count > 0);
    const blocks = patterns
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
              <a href="${qPrefix}pmp-full-questions.html#q-${tip.id}">Q${tip.id}</a> (LWA ${tip.lastWrongAttempt})${
                tip.wrongAttempt > 0
                  ? ' · <span style="color:var(--bad)">đang mở</span>'
                  : ""
              }
              · cũng xem:
              ${(p.sampleIds || [])
                .slice(0, 4)
                .map(
                  (x) =>
                    `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${x.id}">${x.id}</a>`,
                )
                .join(" ")}
            </div>
          </div>`
          : ex
            ? `<div class="card tip">${exampleBody}</div>`
            : "";
        return `        <article class="pattern-block" id="p-${p.id}">
          <h3>${esc(p.title)} <span style="font-weight:500;color:var(--muted);font-size:0.9rem">· ${p.count} câu · hard ${p.hard} · open ${p.open}</span></h3>
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
  }).join("\n\n");

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
      const cue = p.cue.length > 36 ? p.cue.slice(0, 36) + "…" : p.cue;
      const act = action.length > 52 ? action.slice(0, 52) + "…" : action;
      return `IF ${cue.padEnd(38)} → ${act}`;
    })
    .concat([`IF other / mixed                            → open Q teach · don’t force bucket`])
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMP Teach — ${s.patternCount} pattern từ câu từng sai (LWA · luannt115)</title>
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
      <div class="brand-sub">${s.patternCount} pattern · LWA · Full Bank</div>
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
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-full-last-wrong-index.html">Index từng sai (415)</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-full-questions.html">→ Luyện Full Bank</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-sai1-patterns.html">Sai:1 đang mở</a>
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
          <h1>${s.patternCount} pattern từ câu bạn từng làm sai</h1>
          <p class="lead">
            User <strong>luannt115</strong> · Full Bank · tiêu chí
            <code>lastWrongAttempt ≥ 1</code> (từng sai — không reset khi sau đó đúng),
            sort <strong>LWA ↓</strong>.
            Snapshot: <strong>${s.total} câu</strong>
            (${s.openWrong} đang mở · ${s.closed} đã đúng lại).
            Taxonomy v${s.taxonomyVersion}: <strong>không ép 8 bucket</strong> —
            ${s.patternCount} trap-pattern cụ thể + ${other.count} mixed (${s.otherPct}%).
            Mỗi pattern có <strong>ví dụ tình huống</strong> (cue → làm gì → tránh gì).
          </p>
          <div class="stat-grid">
            <div class="stat-box"><strong>${s.total}</strong><span>từng sai</span></div>
            <div class="stat-box"><strong>${s.patternCount}</strong><span>named patterns</span></div>
            <div class="stat-box"><strong>${hardN}</strong><span>LWA ≥ 3</span></div>
            <div class="stat-box"><strong>${s.openWrong}</strong><span>đang mở</span></div>
          </div>
          <div class="badges">
            <span class="badge">lastWrongAttempt</span>
            <span class="badge">specific-first</span>
            <span class="badge">Lead accountably</span>
            <span class="badge">Focus on value</span>
          </div>
        </header>

        <section id="map">
          <h2>Bản đồ ${s.patternCount} pattern</h2>
          <div class="card info">
            <p style="margin:0" class="fam-note">
              Review: 415 câu ≠ 8 mental model. Gom theo <em>trap / action</em> (resilience, OPA, money, agile…)
              — khớp trước trên stem+đáp án đúng, fallback options chỉ khi chưa match.
              Khác <a href="${assetPrefix}pmp-teach-sai1-patterns.html">Sai:1</a> (wrongAttempt=1):
              đây là <strong>toàn bộ lịch sử từng sai</strong>.
            </p>
          </div>
          <table>
            <thead>
              <tr><th>Pattern</th><th>Cue</th><th>Hành động đúng</th><th>ID cứng (LWA)</th></tr>
            </thead>
            <tbody>
${mapRows}
              <tr>
                <td><a href="#other"><strong>Other / mixed</strong></a><br><span style="font-size:0.72rem;color:var(--muted)">n=${other.count}</span></td>
                <td>edge / multi-signal</td>
                <td>Ôn qua index LWA ↓ + bài giảng từng câu</td>
                <td>${idChips(other.sampleIds, 3, qPrefix)}</td>
              </tr>
            </tbody>
          </table>
          <p class="ref-footer" style="margin-top:0.75rem">
            Data: <code>pmp-luannt115-full-last-wrong-patterns.json</code> ·
            <a href="${assetPrefix}pmp-teach-full-last-wrong-index.html">415 bài theo LWA ↓</a>
          </p>
        </section>

${familySections}

        <section id="other">
          <h2>Other / mixed · ${other.count} câu (${s.otherPct}%)</h2>
          <div class="card info">
            <p style="margin:0">
              Không nhồi vào 8 (hay 26) bucket giả. Các ID này thường multi-signal hoặc edge
              (EMV số, charter edge, quality niche…). Ôn trực tiếp trên index / full teach lesson.
            </p>
          </div>
          <div class="card tip">
            Mẫu:
            ${(other.sampleIds || [])
              .slice(0, 8)
              .map(
                (x) =>
                  `<a class="id-chip" href="${qPrefix}pmp-full-questions.html#q-${x.id}">${x.id}×${x.lastWrongAttempt}</a>`,
              )
              .join(" ")}
          </div>
        </section>

        <section id="practice">
          <h2>Luyện ${QUIZ.length} câu (retrieval · interleaved)</h2>
          <p class="flash-hint">Options cân độ dài. Chọn → feedback ngay. Trộn Lead / Process / Money / Engage.</p>

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
              <li>Làm ${QUIZ.length} quiz đến khi đúng hết không nhìn cheat.</li>
              <li>Mở <a href="${assetPrefix}pmp-teach-full-last-wrong-index.html">index 415</a> — LWA cao trước.</li>
              <li>Ưu tiên ${s.openWrong} câu <code>wrongAttempt === 1</code> trong filter Ôn câu sai (Sai:1).</li>
              <li>Hỏi agent nếu một cue chưa rõ — teacher loop.</li>
            </ol>
          </div>
          <p class="ref-footer">
            Primary:
            <a href="https://www.pmi.org/standards/pmbok/" target="_blank" rel="noopener">PMBOK® Guide — Eighth Edition (PMI)</a>
            · Teach lesson: <code>teach/pmp-wrong-patterns/lessons/0003-lwa-multi-patterns.html</code>
            · Related:
            <a href="${assetPrefix}pmp-exam-prep-lecture.html">Bài giảng PMP</a> ·
            <a href="${assetPrefix}pmp-teach-sai1-patterns.html">Sai:1</a> ·
            <a href="${assetPrefix}pmp-teach-wrong-patterns.html">attempts&gt;1</a>
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
    ["intro","map",...${JSON.stringify(FAMILIES.map((f) => f.id))},"other","practice","cheat","next"]
      .forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  </script>
</body>
</html>
`;
}

function buildReference(data) {
  const lines = [
    `# LWA multi-pattern cheat (${data.summary.patternCount} + other)`,
    "",
    `Criteria: lastWrongAttempt ≥ 1 · total ${data.summary.total} · other ${data.summary.otherPct}%`,
    "",
    "| ID | Cue | Action | n |",
    "|----|-----|--------|---|",
  ];
  for (const p of [...data.patterns].sort((a, b) => b.count - a.count)) {
    lines.push(
      `| ${p.id} | ${p.cue} | ${p.action} | ${p.count} |`,
    );
  }
  lines.push(
    `| other | mixed / edge | drill index LWA | ${data.other.count} |`,
    "",
    "Hard exemplars: Q828 resilience, Q981 OPA, Q1047 compliance, Q305 transparency, Q376 money.",
    "",
  );
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(PACK)) {
    console.error("Missing patterns pack. Run analyze-pmp-last-wrong-patterns.js first.");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(PACK, "utf8"));

  const publicHtml = buildHtml({
    assetPrefix: "",
    cssHref: "pmp-teach-wrong-patterns.css",
    fullscreenHref: "pmp-teach-fullscreen.css",
  });
  fs.writeFileSync(PUBLIC_OUT, publicHtml);

  const teachHtml = buildHtml({
    assetPrefix: "../../../public/pmp/",
    cssHref: "../assets/lesson.css",
    fullscreenHref: "../../../public/pmp/pmp-teach-fullscreen.css",
  });
  fs.mkdirSync(path.dirname(TEACH_OUT), { recursive: true });
  fs.writeFileSync(TEACH_OUT, teachHtml);

  fs.mkdirSync(path.dirname(REF_OUT), { recursive: true });
  fs.writeFileSync(REF_OUT, buildReference(data));

  console.log(
    JSON.stringify(
      {
        public: PUBLIC_OUT,
        teach: TEACH_OUT,
        reference: REF_OUT,
        patterns: data.summary.patternCount,
        otherPct: data.summary.otherPct,
        quiz: QUIZ.length,
      },
      null,
      2,
    ),
  );
}

main();
