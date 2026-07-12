/**
 * Generate public/pmp/pmp-exam-latest-prep-lecture.html
 * Analysis lecture for ExamTopics "PMP Exam - Lasted version 1" (1417 questions).
 *
 * Usage: node scripts/generate-pmp-exam-latest-prep-lecture.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TEMPLATE_CSS_PATH = path.join(ROOT, "public", "pmp", "pmp-exam-prep-lecture.html");
const QUESTIONS_PATH = path.join(ROOT, "public", "pmp", "pmp-exam-latest-questions.json");
const EXPLANATIONS_PATH = path.join(ROOT, "data", "pmp-exam-latest-pmbok8-explanations.json");
const SIGNALS_PATH = path.join(ROOT, "data", "pmp-exam-latest-teach-signals.json");
const OUT_PATH = path.join(ROOT, "public", "pmp", "pmp-exam-latest-prep-lecture.html");

const PRACTICE_GROUPS = [
  { id: "q01-10", from: 1, to: 10, title: "Risk · Agile · Hybrid", subtitle: "Risk register · Empower team · Customer review · Integration" },
  { id: "q11-20", from: 11, to: 20, title: "Team & Contractor", subtitle: "Empower contractor · Scope review · Conflict · Virtual team" },
  { id: "q21-30", from: 21, to: 30, title: "Stakeholder & Comms", subtitle: "Engagement · Communication plan · Resistance · Feedback" },
  { id: "q31-40", from: 31, to: 40, title: "Scope & Change", subtitle: "Scope baseline · Change control · Requirements · Deliverables" },
  { id: "q41-50", from: 41, to: 50, title: "Quality & Team dynamics", subtitle: "Quality · Diversity · Coaching · Performance" },
  { id: "q51-60", from: 51, to: 60, title: "Schedule & Resources", subtitle: "Critical path · Resource conflict · Leveling · Fast-track" },
  { id: "q61-70", from: 61, to: 70, title: "Procurement & Governance", subtitle: "Vendor · Contract · Governance · Compliance" },
  { id: "q71-80", from: 71, to: 80, title: "Agile ceremonies", subtitle: "Sprint · Backlog · Retrospective · Impediment" },
  { id: "q81-90", from: 81, to: 90, title: "Risk & Issue", subtitle: "Risk response · Issue log · Reserve · Escalation" },
  { id: "q91-100", from: 91, to: 100, title: "Innovation & Uncertainty", subtitle: "Adaptive · Experiment · Value · Uncertainty" },
];

const DOMAIN_EXAMPLES = {
  Stakeholders: [
    [7, "Team performance thấp ở group activities", "Facilitate communication and team building"],
    [21, "Stakeholder resistant", "Understand concerns → adjust engagement"],
    [30, "Customer feedback delayed", "Plan review approach with customer"],
  ],
  Resources: [
    [2, "Agile team low quality sau fast-track", "Empower team improve processes"],
    [10, "Member không hiểu hệ thống mới", "Assign experienced resource support"],
    [25, "Diverse team ages", "Adapt leadership style"],
  ],
  Scope: [
    [12, "Schedule/cost overrun + unhappy client", "Review scope and objectives first"],
    [5, "Hybrid — unclear requirements + date constraint", "Manage uncertainties + date restriction"],
    [40, "Deliverable rejected", "Engage stakeholder, review acceptance criteria"],
  ],
  Governance: [
    [22, "Informal decisions không document", "Establish decision log"],
    [35, "Scope changes bypass change control", "Ensure formal change control"],
    [55, "Hybrid agile + predictive conflict", "Hybrid governance framework"],
  ],
  Schedule: [
    [4, "Designer delay blocks release", "Meet designer, develop solution"],
    [60, "Critical path delay", "Document → analyze → corrective"],
    [63, "Resource leveling needed", "Adjust schedule with leveling"],
  ],
  Risk: [
    [1, "Risk materialized — resource unavailable", "Consult risk register → implement response"],
    [85, "New risk identified mid-project", "Update risk register + planned response"],
    [95, "Risk trigger occurred", "Implement planned risk response"],
  ],
  Finance: [
    [70, "CPI/SPI analysis", "Earned value corrective action"],
    [75, "Cost overrun trend", "Forecast + change request if needed"],
    [90, "Budget constraint vs scope", "Focus on value, prioritize"],
  ],
};

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function extractCss(templateHtml) {
  const m = templateHtml.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error("CSS block not found in template");
  return m[1];
}

function qHref(id) {
  return `pmp-exam-latest.html#q-${id}`;
}

function qLink(id, label) {
  const text = label || `Câu ${id}`;
  return `<a href="${qHref(id)}" class="q-link" target="_blank">${text}</a>`;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cardTitle(q, exp) {
  const proc = exp?.pmbok8?.processes?.[0];
  if (proc) return proc;
  const stem = q.text.replace(/\s+/g, " ").trim();
  const cut = stem.length > 55 ? stem.slice(0, 52) + "…" : stem;
  return cut;
}

function cardSummary(q, sig) {
  const raw =
    sig?.whyBullets?.find((b) => /correct|đúng|PMBOK/i.test(b)) ||
    sig?.signalAnswer ||
    q.text;
  const s = String(raw).replace(/\s+/g, " ").trim();
  return s.length > 110 ? s.slice(0, 107) + "…" : s;
}

function computeStats(questions, explanations) {
  const total = questions.length;
  const domains = {};
  const focus = {};
  const principles = {};
  const processes = {};
  let agile = 0;
  let hybrid = 0;
  let notKw = 0;
  let multi = 0;
  let drag = 0;
  let first = 0;
  let next = 0;
  let best = 0;
  let most = 0;
  const types = {};

  for (const q of questions) {
    const ex = explanations[String(q.id)];
    types[q.type] = (types[q.type] || 0) + 1;
    if (q.type !== "mcq") drag++;
    if (q.type === "mcq" && q.correct && q.correct.length > 1) multi++;

    const t = (q.text || "").toLowerCase();
    if (/agile|scrum|sprint|iteration|product owner|backlog|kanban/.test(t)) agile++;
    if (/hybrid/.test(t)) hybrid++;
    if (/\bnot\b/.test(t)) notKw++;
    if (/\bfirst\b/i.test(q.text)) first++;
    if (/\bnext\b/i.test(q.text)) next++;
    if (/\bbest\b/i.test(q.text)) best++;
    if (/most likely/i.test(q.text)) most++;

    if (ex?.pmbok8?.domains) {
      for (const d of ex.pmbok8.domains) domains[d] = (domains[d] || 0) + 1;
    }
    if (ex?.pmbok8?.focusArea) {
      focus[ex.pmbok8.focusArea] = (focus[ex.pmbok8.focusArea] || 0) + 1;
    }
    if (ex?.pmbok8?.principles) {
      for (const p of ex.pmbok8.principles) principles[p] = (principles[p] || 0) + 1;
    }
    if (ex?.pmbok8?.processes) {
      for (const p of ex.pmbok8.processes) processes[p] = (processes[p] || 0) + 1;
    }
  }

  const domainOrder = ["Stakeholders", "Resources", "Scope", "Governance", "Schedule", "Risk", "Finance"];
  const domainRows = domainOrder
    .filter((d) => domains[d])
    .map((d) => [d, domains[d], Math.round((domains[d] / total) * 100)]);

  const focusOrder = ["Executing", "Initiating", "Monitoring & Controlling", "Closing", "Planning"];
  const focusRows = focusOrder
    .filter((f) => focus[f])
    .map((f) => [f, focus[f], Math.round((focus[f] / total) * 100)]);

  const principleOrder = [
    "Lead accountably",
    "Focus on value",
    "Build an empowered culture",
    "Embed quality",
    "Adopt a holistic view",
    "Integrate sustainability",
  ];
  const principleRows = principleOrder
    .filter((p) => principles[p])
    .map((p) => [p, principles[p]]);

  const topProcesses = Object.entries(processes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const perDomainProcesses = {};
  for (const q of questions) {
    const ex = explanations[String(q.id)];
    if (!ex?.pmbok8?.domains || !ex?.pmbok8?.processes) continue;
    for (const d of ex.pmbok8.domains) {
      if (!perDomainProcesses[d]) perDomainProcesses[d] = {};
      for (const p of ex.pmbok8.processes) {
        perDomainProcesses[d][p] = (perDomainProcesses[d][p] || 0) + 1;
      }
    }
  }
  for (const d of Object.keys(perDomainProcesses)) {
    perDomainProcesses[d] = Object.entries(perDomainProcesses[d])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }

  const mcq = types.mcq || 0;
  const execPct = focusRows.find((r) => r[0] === "Executing")?.[2] || 0;
  const stakePct = domainRows.find((r) => r[0] === "Stakeholders")?.[2] || 0;

  return {
    total,
    mcq,
    drag,
    multi,
    agile,
    hybrid,
    notKw,
    first,
    next,
    best,
    most,
    domainRows,
    focusRows,
    principleRows,
    topProcesses,
    perDomainProcesses,
    execPct,
    stakePct,
  };
}

function buildTeachCard(q, exp, sig) {
  return `            <a class="teach-card" href="${qHref(q.id)}">
              <div class="q-label">Question ${q.id}</div>
              <h4>${esc(cardTitle(q, exp))}</h4>
              <p>${esc(cardSummary(q, sig))}</p>
            </a>`;
}

function buildPracticeSection(questions, explanations, signals) {
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const jumps = PRACTICE_GROUPS.map(
    (g) => `            <a class="teach-group-chip" href="#group-${g.id}">Q${g.from}–${g.to}</a>`
  ).join("\n");

  const groups = PRACTICE_GROUPS.map((g) => {
    const cards = [];
    for (let id = g.from; id <= g.to; id++) {
      const q = byId[id];
      if (!q) continue;
      cards.push(buildTeachCard(q, explanations[String(id)], signals[String(id)]));
    }
    return `          <div id="group-${g.id}" class="teach-group">
            <div class="teach-group-head">
              <h3>Q${g.from}–${g.to} · ${esc(g.title)}</h3>
              <p class="teach-group-sub">${esc(g.subtitle)}</p>
            </div>
            <div class="teach-grid">
${cards.join("\n")}
            </div>
          </div>`;
  }).join("\n\n");

  return `        <section id="practice-teach">
          <h2>Practice Questions — ExamTopics Lasted v1</h2>
          <p>
            <strong>100 câu đầu</strong> của bộ <code>pmp-exam-latest</code> (ExamTopics Lasted version 1) —
            mỗi thẻ mở bài luyện có phân tích PMBOK 8 đầy đủ. Tổng bộ: <strong>${questions.length.toLocaleString("vi-VN")} câu</strong>.
          </p>

          <div class="teach-series-toolbar">
            <a class="teach-series-index-link full-bank" href="pmp-exam-latest.html">📖 Mở bộ luyện ${questions.length.toLocaleString("vi-VN")} câu</a>
            <a class="teach-series-index-link" href="pmp-exam-prep-lecture.html">📚 Bài giảng Full Bank (1.123 câu)</a>
          </div>
          <div class="teach-group-jump">
${jumps}
          </div>

${groups}
        </section>`;
}

function buildPrincipleGrid(rows) {
  const desc = {
    "Lead accountably": "Thừa nhận lỗi, minh bạch, không đổ lỗi, không che giấu.",
    "Focus on value": "Ưu tiên deliverable tạo giá trị, không gold-plating.",
    "Build an empowered culture": "Facilitate, trao quyền team, servant leadership.",
    "Embed quality": "Quality built-in, không để cuối mới test.",
    "Adopt a holistic view": "Nhìn hệ thống, không fix cục bộ.",
    "Integrate sustainability": "ESG, dài hạn — ít câu nhưng dễ gặp.",
  };
  return rows
    .map(
      ([name, count]) => `            <div class="principle-card">
              <div class="num">${count}</div>
              <h4>${esc(name)}</h4>
              <p>${desc[name] || ""}</p>
            </div>`
    )
    .join("\n");
}

function buildDomainArticle(name, count, examples, topProc) {
  const procLine = topProc.length
    ? `<p><strong>Processes:</strong> ${topProc.map(([p, c]) => `${p} (${c})`).join(", ")}</p>`
    : "";
  const rows = (DOMAIN_EXAMPLES[name] || [])
    .map(
      ([id, scenario, action]) =>
        `              <tr><td>${esc(scenario)}</td><td>${esc(action)}</td><td>${qLink(id)}</td></tr>`
    )
    .join("\n");
  const anchor = `domain-${name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`;
  return `          <article id="${anchor}">
            <h3>4.x ${name} — ${count} câu</h3>
            ${procLine}
            <table>
              <tr><th>Tình huống</th><th>PM làm gì</th><th>Ví dụ</th></tr>
${rows}
            </table>
          </article>`;
}

function buildHtml(css, stats, questions, explanations, signals) {
  const s = stats;
  const domainChartJs = JSON.stringify(s.domainRows);
  const focusChartJs = JSON.stringify(s.focusRows);

  const domainArticles = s.domainRows
    .map(([name, count]) => buildDomainArticle(name, count, DOMAIN_EXAMPLES[name], s.perDomainProcesses[name] || []))
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMP Exam Latest — Bài phân tích ExamTopics (Thi 20/7/2026)</title>
  <style>${css}
  </style>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">PMP Exam Latest</div>
      <div class="brand-sub">ExamTopics Lasted v1 · ${s.total.toLocaleString("vi-VN")} câu</div>

      <div class="countdown">
        Ngày thi: <strong>20/07/2026</strong>
        Còn lại: <strong id="daysLeft">—</strong> ngày
      </div>

      <nav id="sideNav">
        <div class="nav-group">Tổng quan</div>
        <a href="#intro">Giới thiệu</a>
        <a href="#practice-teach">100 câu đầu</a>
        <a href="#mindset-teach">Mindset</a>
        <a href="#format">Format đề thi</a>
        <a href="#principles">6 Principles</a>
        <a href="#first-next">FIRST / NEXT</a>

        <div class="nav-group">7 Domains</div>
        <a href="#domain-stakeholders">Stakeholders</a>
        <a href="#domain-resources">Resources</a>
        <a href="#domain-scope">Scope</a>
        <a href="#domain-governance">Governance</a>
        <a href="#domain-schedule">Schedule</a>
        <a href="#domain-risk">Risk</a>
        <a href="#domain-finance">Finance & EVM</a>

        <div class="nav-group">Chuyên đề</div>
        <a href="pmp-glossary-vi.html">Glossary từ vựng</a>
        <a href="pmp-teach-cheat-sheet.html">PMP Cheat Sheet</a>
        <a href="pmp-mindset-teach.html">PMP Mindset Drill</a>
        <a href="pmp-exam-prep-lecture.html">→ Bài giảng Full Bank</a>
        <a href="#agile">Agile & Hybrid</a>
        <a href="#traps">Bẫy đáp án</a>
        <a href="#exam-day">Ngày thi</a>
        <a href="#cheatsheet">Cheat sheet</a>
      </nav>

      <a class="quiz-link" href="pmp-exam-latest.html">→ Luyện ${s.total.toLocaleString("vi-VN")} câu</a>
      <a class="quiz-link secondary" href="pmp-exam-prep-lecture.html">→ Bài giảng Full Bank</a>
      <a class="quiz-link secondary" href="pmp-mindset-teach.html">→ PMP Mindset Drill</a>
      <a class="quiz-link secondary" href="/p/pmp">← Về blog PMP</a>
    </aside>

    <div>
      <nav class="mobile-nav">
        <a href="/p/pmp">← Blog PMP</a>
        <a href="#format">Format</a>
        <a href="#practice-teach">100 câu</a>
        <a href="#principles">Principles</a>
        <a href="#first-next">FIRST/NEXT</a>
        <a href="#agile">Agile</a>
        <a href="pmp-exam-latest.html">Luyện đề</a>
      </nav>

      <main>
        <header class="hero" id="intro">
          <h1>Bài phân tích PMP — ExamTopics Lasted version 1</h1>
          <p class="lead">
            Phân tích <strong>${s.total.toLocaleString("vi-VN")} câu</strong> từ
            <em>PMP Exam - Lasted version 1</em> (ExamTopics), giải thích theo
            7 Performance Domains và 6 Principles PMBOK Guide 8th Edition.
            Mục tiêu: pass kỳ thi PMP ngày <strong>20/07/2026</strong>.
          </p>
          <div class="badges">
            <span class="badge">180 câu / 240 phút</span>
            <span class="badge">PMBOK 8</span>
            <span class="badge">ExamTopics</span>
            <span class="badge">${s.execPct}% Executing</span>
            <span class="badge">${s.stakePct}% Stakeholders</span>
            <span class="badge">${s.multi} multi-select</span>
            <span class="badge">${s.drag} drag-drop</span>
          </div>
        </header>

        <section id="mindset-teach">
          <h2>PMP Mindset — Drill tình huống</h2>
          <p>Trước khi luyện ${s.total.toLocaleString("vi-VN")} câu, nên luyện <strong>PMI mindset</strong>: pattern Do First / Risk vs Issue, bẫy PMI vs thực tế.</p>
          <div class="teach-grid">
            <a class="teach-card" href="pmp-teach-cheat-sheet.html">
              <div class="q-label">Cheat Sheet</div>
              <h4>PMP Cheat Sheet — Full Exam Overview</h4>
              <p>People 33% · Process 41% · Business Environment 26%.</p>
            </a>
            <a class="teach-card mindset" href="pmp-mindset-teach.html">
              <div class="q-label">Bài học tương tác</div>
              <h4>PMP Mindset — Drill tình huống</h4>
              <p>7 bước trả lời, pattern đề thi, PMI vs thực tế, Agile/Hybrid/Predictive.</p>
            </a>
          </div>
        </section>

${buildPracticeSection(questions, explanations, signals)}

        <section id="format">
          <h2>1. Hiểu format đề thi</h2>
          <div class="card info">
            <h4>Thông số thi (theo mock trong bộ luyện)</h4>
            <table>
              <tr><th>Thông số</th><th>Giá trị</th></tr>
              <tr><td>Số câu</td><td><strong>180 câu</strong> (PMI có thể thêm câu thử nghiệm)</td></tr>
              <tr><td>Thời gian</td><td><strong>240 phút</strong> (~1,3 phút/câu)</td></tr>
              <tr><td>Dạng câu</td><td>MCQ (${s.mcq}), drag-drop (${s.drag})</td></tr>
              <tr><td>Multi-select</td><td><strong>${s.multi} câu</strong> — chọn nhiều đáp án</td></tr>
              <tr><td>Nguồn</td><td>ExamTopics — <em>PMP Exam - Lasted version 1</em></td></tr>
              <tr><td>Framework</td><td>PMBOK 8 — 7 Domains + 6 Principles</td></tr>
            </table>
          </div>

          <h3>Phân bố Performance Domains</h3>
          <p>Câu có thể map nhiều domain. Tần suất trong bộ ${s.total.toLocaleString("vi-VN")} câu:</p>
          <div class="bar-chart" id="domainChart"></div>

          <div class="card warn">
            <h4>Insight quan trọng — Focus Area</h4>
            <p style="margin:0"><strong>${s.execPct}% câu nằm ở Executing.</strong> Đề hỏi <em>"đang chạy dự án, gặp vấn đề X — PM làm gì?"</em></p>
          </div>
          <div class="bar-chart" id="focusChart"></div>
        </section>

        <section id="principles">
          <h2>2. Sáu Principles — Bộ não PMI</h2>
          <p>Tần suất trong ${s.total.toLocaleString("vi-VN")} giải thích:</p>
          <div class="principle-grid">
${buildPrincipleGrid(s.principleRows)}
          </div>
        </section>

        <section id="first-next">
          <h2>3. Chiến thuật FIRST / NEXT / BEST</h2>
          <p>Trong bộ Exam Latest: <strong>${s.first} câu FIRST</strong>, <strong>${s.next} câu NEXT</strong>, <strong>${s.best} câu BEST</strong>, <strong>${s.most} câu MOST LIKELY</strong>.</p>

          <div class="flow">
            <span class="flow-step">Đọc stem</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">FIRST / NEXT / BEST?</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">Loại passive / escalate</span>
            <span class="flow-arrow">→</span>
            <span class="flow-step">Chọn align Principle</span>
          </div>

          <div class="card info">
            <h4>Phân biệt 3 loại câu hỏi</h4>
            <table>
              <tr><th>Từ khóa</th><th>Ý nghĩa</th><th>Cách chọn</th></tr>
              <tr><td><strong>FIRST</strong></td><td>Bước ngay lập tức</td><td>Acknowledge, document, facilitate</td></tr>
              <tr><td><strong>NEXT</strong></td><td>Bước tiếp theo</td><td>Tra risk register, change log</td></tr>
              <tr><td><strong>BEST</strong></td><td>Cách tối ưu dài hạn</td><td>Cân bằng, sustainable, align value</td></tr>
            </table>
          </div>

          <div class="example">
            <div class="q">${qLink(1)}: Risk materialized — resource unavailable. PM làm gì <strong>next</strong>?</div>
            <span class="opt ok">A. Consult risk register → implement planned response ✓</span>
            <span class="opt bad">B. Revise PM plan ngay — chưa tra artifact</span>
            <span class="opt bad">D. Update lessons learned — bước sau, không phải NEXT</span>
          </div>

          <div class="example">
            <div class="q">${qLink(12)}: Schedule/cost overrun, client unhappy. PM làm gì <strong>first</strong>?</div>
            <span class="opt ok">A. Review scope and project objectives ✓</span>
            <span class="opt bad">Enforce penalty — chưa hiểu root cause</span>
          </div>

          <div class="card warn">
            <strong>BEST ≠ FIRST.</strong> Chọn đáp án <em>cân bằng lâu dài</em>, không phải hành động nhanh nhất.
          </div>
        </section>

        <section id="domains">
          <h2>4. Bảy Performance Domains</h2>
${domainArticles}
        </section>

        <section id="agile">
          <h2>5. Agile & Hybrid</h2>
          <p>Bộ Exam Latest có <strong>${s.agile} câu agile</strong> và <strong>${s.hybrid} câu hybrid</strong>.</p>
          <table>
            <tr><th>Tình huống</th><th>PM làm gì</th><th>Ví dụ</th></tr>
            <tr><td>Team mới agile, quality thấp</td><td>Empower team improve processes</td><td>${qLink(2)}</td></tr>
            <tr><td>PO thêm feature giữa iteration</td><td>Internal meeting discuss value</td><td>${qLink(8)}</td></tr>
            <tr><td>Multi-team integration issues</td><td>Frequent continuous integration</td><td>${qLink(9)}</td></tr>
            <tr><td>Hybrid — uncertainty + deadline</td><td>Manage uncertainties + date restriction</td><td>${qLink(5)}</td></tr>
          </table>
        </section>

        <section id="traps">
          <h2>6. Bẫy đáp án — Loại ngay</h2>
          <p>${s.notKw} câu có từ khóa <strong>NOT</strong>. Pattern lặp lại:</p>
          <div class="card danger">
            <h4>❌ Đáp án SAI — loại ngay</h4>
            <table>
              <tr><th>Pattern</th><th>Ví dụ</th><th>Tại sao sai</th></tr>
              <tr><td><strong>Ignore / do nothing</strong></td><td>${qLink(33)}</td><td>Passive — không giải quyết root cause</td></tr>
              <tr><td><strong>Escalate sớm</strong></td><td>${qLink(15)}</td><td>PM phải thử facilitate trước</td></tr>
              <tr><td><strong>Micromanage</strong></td><td>${qLink(2, "Câu 2 — option B")}</td><td>Phá empowered culture</td></tr>
              <tr><td><strong>Lessons learned thay hành động</strong></td><td>${qLink(1, "Câu 1 — option D")}</td><td>Ghi log sau khi xử lý tình huống</td></tr>
            </table>
          </div>
          <div class="card tip">
            <h4>✅ Đáp án ĐÚNG — ưu tiên</h4>
            <table>
              <tr><th>Pattern</th><th>Ví dụ</th></tr>
              <tr><td><strong>Consult risk register</strong></td><td>${qLink(1)}</td></tr>
              <tr><td><strong>Facilitate</strong></td><td>${qLink(7)}</td></tr>
              <tr><td><strong>Empower team</strong></td><td>${qLink(2)}</td></tr>
              <tr><td><strong>Meet + develop solution</strong></td><td>${qLink(4)}</td></tr>
            </table>
          </div>
        </section>

        <section id="exam-day">
          <h2>7. Ngày thi — Checklist</h2>
          <ul class="checklist">
            <li>Thi trước 30 phút, mang 2 giấy tờ tùy thân</li>
            <li>Flag câu khó, không dừng quá 2 phút/câu</li>
            <li>Review 30 phút cuối — ưu tiên câu đã flag</li>
            <li>Multi-select: chọn đủ, không thừa</li>
          </ul>
        </section>

        <section id="cheatsheet">
          <h2>8. Cheat sheet — In mang theo</h2>
          <div class="cheat-sheet">EXAM LATEST (${s.total} câu) — PMBOK 8 CHEAT SHEET
═══════════════════════════════════════
6 PRINCIPLES
  Lead accountably | Focus on value | Build empowered culture
  Embed quality | Holistic view | Sustainability

FIRST → Hành động NGAY (acknowledge > document > facilitate)
NEXT  → Tra artifact (risk register, change log)
NOT   → Loại passive, escalate sớm, micromanage

DOMAIN WEIGHT (ExamTopics Lasted v1)
  Stakeholders >>> Resources > Scope > Governance > Schedule > Risk > Finance
  Focus Area: ${s.execPct}% EXECUTING

AGILE (${s.agile} câu) | HYBRID (${s.hybrid} câu)
  Servant leader | Remove impediment | No mid-sprint scope add

EXAM: 180 câu / 240 phút | ${s.multi} multi-select | ${s.drag} drag-drop</div>
          <p style="margin-top:1rem">
            <a href="pmp-exam-latest.html" style="color:var(--primary);font-weight:600">→ Mở bộ luyện ${s.total.toLocaleString("vi-VN")} câu</a>
            &nbsp;·&nbsp;
            <a href="pmp-exam-prep-lecture.html" style="color:var(--primary);font-weight:600">→ Bài giảng Full Bank</a>
          </p>
        </section>
      </main>
    </div>
  </div>

  <script>
    (function () {
      const EXAM_DATE = new Date("2026-07-20T00:00:00");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.ceil((EXAM_DATE - today) / 86400000);
      document.getElementById("daysLeft").textContent = diff > 0 ? diff : 0;

      const domains = ${domainChartJs};
      const maxD = domains[0][1];
      document.getElementById("domainChart").innerHTML = domains.map(([name, count, pct]) => \`
        <div class="bar-row">
          <span class="bar-label">\${name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:\${(count / maxD) * 100}%">\${count}</div></div>
          <span class="bar-pct">\${pct}%</span>
        </div>\`).join("");

      const focus = ${focusChartJs};
      const maxF = focus[0][1];
      document.getElementById("focusChart").innerHTML = focus.map(([name, count, pct]) => \`
        <div class="bar-row">
          <span class="bar-label">\${name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:\${(count / maxF) * 100}%">\${count}</div></div>
          <span class="bar-pct">\${pct}%</span>
        </div>\`).join("");

      const links = document.querySelectorAll("#sideNav a");
      const sections = [...links].map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = "#" + e.target.id;
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        });
      }, { rootMargin: "-20% 0px -60% 0px", threshold: 0 });
      sections.forEach((s) => obs.observe(s));
    })();
  </script>
</body>
</html>`;
}

function main() {
  const templateHtml = fs.readFileSync(TEMPLATE_CSS_PATH, "utf8");
  const css = extractCss(templateHtml);
  const questions = loadJson(QUESTIONS_PATH);
  const explanations = loadJson(EXPLANATIONS_PATH);
  const signals = loadJson(SIGNALS_PATH);

  if (questions.length < 1400) {
    console.warn(`Warning: expected ~1417 questions, got ${questions.length}`);
  }

  const stats = computeStats(questions, explanations);
  const html = buildHtml(css, stats, questions, explanations, signals);
  fs.writeFileSync(OUT_PATH, html);
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Stats: ${stats.total} questions, ${stats.execPct}% Executing, ${stats.stakePct}% Stakeholders`);
}

main();
