/**
 * Generate interactive 50 PMP exam-mindset principles lesson.
 * Usage: node scripts/generate-pmp-50-principles-lesson.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC_OUT = path.join(ROOT, "public", "pmp", "pmp-teach-50-principles.html");
const TEACH_DIR = path.join(ROOT, "teach", "pmp-principles");
const TEACH_OUT = path.join(TEACH_DIR, "lessons", "0001-fifty-exam-principles.html");
const REF_OUT = path.join(TEACH_DIR, "reference", "0001-fifty-principles.md");

const PRINCIPLES = [
  { n: 1, t: "3:15", en: "Continuously identify and analyze stakeholders, not just at the beginning of the project.", vi: "Identify/analyze SH liên tục cả đời dự án — không chỉ lúc kickoff." },
  { n: 2, t: "14:42", en: "Actively engage all stakeholders, especially those who seem disengaged or unhappy.", vi: "Chủ động engage SH thờ ơ / không hài lòng — đừng bỏ qua." },
  { n: 3, t: "15:28", en: "Engage individual stakeholders where appropriate, rather than always involving the entire group.", vi: "Engage từng cá nhân khi cần — không bắt buộc họp cả nhóm mọi lúc." },
  { n: 4, t: "15:28", en: "Document all impacted individuals as stakeholders, even if their involvement is indirect.", vi: "Ai bị impact cũng vào register — kể cả gián tiếp." },
  { n: 5, t: "19:18", en: "Don't dismiss customer requests prematurely. Evaluate each one carefully.", vi: "Đừng bác request khách sớm — evaluate kỹ trước khi từ chối." },
  { n: 6, t: "24:41", en: "Traditional: Follow the plan. Do not allow changes without an approved change request.", vi: "Predictive: bám plan — không đổi nếu chưa có CR được duyệt." },
  { n: 7, t: "29:57", en: "Any stakeholder requesting changes to the project management plan must submit a change request.", vi: "Muốn đổi PMP → phải submit change request." },
  { n: 8, t: "32:55", en: "All changes must be reviewed and assessed.", vi: "Mọi change đều phải review/assess impact trước." },
  { n: 9, t: "36:34", en: "Traditional: Never act without a plan. Planning is done once for the entire project.", vi: "Predictive: không hành động không plan — plan upfront cả dự án." },
  { n: 10, t: "42:04", en: "Consult with your team and subject matter experts before making decisions, especially on technical issues.", vi: "Tham vấn team/SME trước khi quyết — đặc biệt kỹ thuật." },
  { n: 11, t: "44:19", en: "Choose actions that best serve project objectives and deliver the highest value to the stakeholders.", vi: "Chọn hành động tối ưu objective + value cho SH." },
  { n: 12, t: "52:00", en: "Address issues directly and avoid unnecessary escalation.", vi: "Xử lý issue trực tiếp — escalate chỉ khi cần." },
  { n: 13, t: "55:38", en: "Anticipate and address potential problems before they become critical issues.", vi: "Anticipate sớm — đừng đợi thành critical." },
  { n: 14, t: "56:54", en: "Always seek out the advice of the subject matter expert before moving forward on a project. Never assume you are the expert.", vi: "Hỏi SME trước khi tiến — đừng tự cho là expert." },
  { n: 15, t: "58:40", en: "Always investigate and consult before acting, especially when the questions ask what the PM should do first or next.", vi: "FIRST/NEXT → investigate/consult trước khi act." },
  { n: 16, t: "1:05:40", en: "Address conflict directly and privately.", vi: "Xung đột: xử lý trực tiếp + riêng tư." },
  { n: 17, t: "1:06:50", en: "Always protect the team from external disruptions and distractions.", vi: "Bảo vệ team khỏi nhiễu loạn bên ngoài." },
  { n: 18, t: "1:08:33", en: "Be a servant leader.", vi: "Servant leadership: phục vụ / remove impediments / empower." },
  { n: 19, t: "1:13:30", en: "Focus on the big picture, not just individual tasks or components.", vi: "Nhìn big picture — không chỉ task lẻ." },
  { n: 20, t: "1:15:19", en: "The team is best suited to break down work.", vi: "Team tự break down work tốt nhất." },
  { n: 21, t: "1:23:42", en: "Empower your team to make decisions and solve problems.", vi: "Empower team quyết định & solve problems." },
  { n: 22, t: "1:24:54", en: "Foster a collaborative environment where team members feel comfortable asking for help and offering support.", vi: "Môi trường cộng tác: hỏi giúp / hỗ trợ nhau thoải mái." },
  { n: 23, t: "1:26:10", en: "Ensure team members are cross-trained and have diverse skill sets.", vi: "Cross-train / đa kỹ năng để giảm bottleneck." },
  { n: 24, t: "1:27:16", en: "Provide timely and constructive feedback to your team members.", vi: "Feedback kịp thời + mang tính xây dựng." },
  { n: 25, t: "1:31:37", en: "Support and accommodate team requests for flexible work arrangements, if feasible.", vi: "Hỗ trợ linh hoạt giờ làm nếu khả thi." },
  { n: 26, t: "1:32:58", en: "Use peer programming for skill development.", vi: "Peer programming để phát triển kỹ năng." },
  { n: 27, t: "1:36:09", en: "Address performance issues directly and privately, not in front of the entire team.", vi: "Performance issue: riêng tư — không xử lý trước cả team." },
  { n: 28, t: "1:37:54", en: "The product owner documents and prioritizes features. Only the product owner prioritizes the product backlog.", vi: "Chỉ Product Owner ưu tiên product backlog." },
  { n: 29, t: "1:41:35", en: "Agile teams love collocation (being together in one central place to work).", vi: "Agile thích collocation khi có thể." },
  { n: 30, t: "1:42:22", en: "Face-to-face communication is the most effective way to communicate anything.", vi: "Face-to-face thường hiệu quả nhất (Agile Manifesto)." },
  { n: 31, t: "1:49:50", en: "Gather customer feedback regularly and throughout the project life cycle.", vi: "Thu feedback khách thường xuyên suốt vòng đời." },
  { n: 32, t: "1:52:12", en: "Define quality requirements early and check them often.", vi: "Quality requirements sớm + kiểm thường xuyên." },
  { n: 33, t: "1:57:43", en: "Prioritize the highest value features in agile development.", vi: "Agile: ưu tiên feature giá trị cao nhất trước." },
  { n: 34, t: "2:01:23", en: "Focus on delivering working software frequently and iteratively.", vi: "Ship working software thường xuyên / iterative." },
  { n: 35, t: "2:04:12", en: "The team should provide estimates for their own work.", vi: "Team tự estimate việc của mình." },
  { n: 36, t: "2:09:59", en: "Actively identify and manage risks throughout the project.", vi: "Identify + manage risk chủ động suốt dự án." },
  { n: 37, t: "2:13:38", en: "Continuously identify and assess risk throughout the life cycle of your project.", vi: "Risk cadence liên tục — không one-shot đầu dự án." },
  { n: 38, t: "2:14:50", en: "Use mutually beneficial contracts and procurement.", vi: "Hợp đồng / procurement win–win." },
  { n: 39, t: "2:17:29", en: "Update the lesson learned register throughout the project.", vi: "Lessons learned cập nhật suốt dự án — không chỉ lúc đóng." },
  { n: 40, t: "2:20:00", en: "All projects should be formally closed, whether completed successfully, terminated, or terminated early, ensuring all bills are paid and resources released.", vi: "Mọi dự án đều formal close (kể cả dừng sớm): bills + release resources." },
  { n: 41, t: "2:23:27", en: "Repeat and reinforce the vision to the team.", vi: "Lặp lại / củng cố vision với team." },
  { n: 42, t: "2:26:09", en: "Clarify what success and failure look like.", vi: "Làm rõ success vs failure trông như thế nào." },
  { n: 43, t: "2:29:13", en: "In agile, the retrospectives are used to review and improve future sprints or iterations.", vi: "Retro: cải thiện sprint/iteration sau — không blame." },
  { n: 44, t: "2:31:32", en: "Implement feedback loops. Apply lessons from one task to the next.", vi: "Feedback loop: áp dụng lesson sang việc kế tiếp." },
  { n: 45, t: "2:33:54", en: "Avoid cost and time overruns. If you must choose, fix budget issues before scheduling.", vi: "Tránh overrun; nếu phải chọn — ưu tiên xử lý budget trước schedule (trong logic đề)." },
  { n: 46, t: "2:37:13", en: "Traditional: Understand the critical path.", vi: "Predictive: nắm critical path." },
  { n: 47, t: "2:38:09", en: "Agile: Manage schedule through sprint commitments and velocity.", vi: "Agile schedule: sprint commitments + velocity." },
  { n: 48, t: "2:40:44", en: "When you see answers that are absolute, like \"always\" or \"all,\" they're probably not correct.", vi: "Đáp án tuyệt đối (always/all) — thường sai." },
  { n: 49, t: "2:43:03", en: "Never do nothing.", vi: "Đừng chọn “không làm gì”." },
  { n: 50, t: "2:45:51", en: "The perfect answer isn't always listed. You must choose from the choices available.", vi: "Không có đáp án hoàn hảo — chọn best available." },
];

const FAMILIES = [
  { id: "fam-sh", label: "Stakeholders & engagement", ids: [1, 2, 3, 4, 5] },
  { id: "fam-change", label: "Change & traditional planning", ids: [6, 7, 8, 9] },
  { id: "fam-decide", label: "Investigate before act", ids: [10, 11, 12, 13, 14, 15] },
  { id: "fam-people", label: "People / conflict / servant leader", ids: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] },
  { id: "fam-agile", label: "Agile delivery & PO", ids: [28, 29, 30, 31, 32, 33, 34, 35, 43] },
  { id: "fam-risk", label: "Risk / procurement / close / lessons", ids: [36, 37, 38, 39, 40, 44] },
  { id: "fam-vision", label: "Vision & success criteria", ids: [41, 42] },
  { id: "fam-schedule", label: "Schedule (predictive vs agile)", ids: [45, 46, 47] },
  { id: "fam-exam", label: "Exam answer craft", ids: [48, 49, 50] },
];

const QUIZ = [
  {
    tip: "FIRST / NEXT",
    ans: "B",
    q: 'Đề hỏi "What should the PM do <span class="kw-cue">FIRST</span>?" Mindset đúng?',
    opts: {
      A: "Chọn luôn giải pháp kỹ thuật mạnh nhất để chứng minh năng lực",
      B: "Investigate / consult (SME, data) trước khi act — nguyên tắc #15",
      C: "Escalate sponsor ngay vì FIRST = urgency tuyệt đối",
      D: "Không làm gì để “quan sát thêm một sprint”",
    },
  },
  {
    tip: "Unhappy SH",
    ans: "A",
    q: "Một stakeholder im lặng / không hài lòng. PM nên?",
    opts: {
      A: "Actively engage — đặc biệt khi disengaged (#2)",
      B: "Bỏ qua vì thiểu số và bám burn-down",
      C: "Chỉ gửi status email hàng tháng coi như đã manage",
      D: "Đưa thẳng lên escalation mà chưa nói chuyện",
    },
  },
  {
    tip: "Predictive change",
    ans: "C",
    q: "SH yêu cầu đổi phạm vi baseline (predictive). First path?",
    opts: {
      A: "Team tự absorb vì “agile tinh thần”",
      B: "Accept ngay để giữ quan hệ",
      C: "Submit/assess change request (#6–#8)",
      D: "Im lặng thêm work vào Gantt",
    },
  },
  {
    tip: "Backlog",
    ans: "D",
    q: "Ai ưu tiên product backlog?",
    opts: {
      A: "Scrum Master sắp xếp theo skill team",
      B: "Sponsor tự reorder mỗi sáng",
      C: "Team vote đa số trong standup",
      D: "Chỉ Product Owner (#28)",
    },
  },
  {
    tip: "Conflict",
    ans: "A",
    q: "Hai thành viên xung đột / một người performance kém. Cách đúng?",
    opts: {
      A: "Address trực tiếp + riêng tư (#16 / #27)",
      B: "Xử lý công khai trong standup để làm gương",
      C: "Bỏ qua để tránh toxicity escalate",
      D: "Chuyển ngay cả hai sang dự án khác",
    },
  },
  {
    tip: "Absolute option",
    ans: "B",
    q: 'Thấy option có chữ <span class="kw-cue">always / all / never</span>?',
    opts: {
      A: "Ưu tiên vì PMI thích quy tắc tuyệt đối",
      B: "Nghi ngờ — absolute thường sai (#48)",
      C: "Chọn nếu kèm “do nothing”",
      D: "Bỏ luôn mọi option có “first”",
    },
  },
  {
    tip: "SME",
    ans: "C",
    q: "Vấn đề kỹ thuật khó, PM không chuyên sâu. Next?",
    opts: {
      A: "Tự decide để “own accountability”",
      B: "Đóng băng dự án đến khi tự học xong",
      C: "Consult SME / team trước (#10 / #14)",
      D: "Chỉ hỏi sponsor ý kiến kỹ thuật",
    },
  },
  {
    tip: "Servant leader",
    ans: "A",
    q: "Servant leadership trên đề thường nghĩa?",
    opts: {
      A: "Remove impediments, protect team, empower (#17–#18, #21)",
      B: "Micromanage từng task để đảm bảo chất lượng",
      C: "Làm hộ conflict thay vì coach",
      D: "Chỉ tổ chức họp status dài hơn",
    },
  },
  {
    tip: "Closeout",
    ans: "D",
    q: "Dự án bị hủy giữa chừng. PM?",
    opts: {
      A: "Bỏ qua close vì đã fail",
      B: "Chỉ archive chat logs",
      C: "Giữ resource “phòng khi reboot”",
      D: "Formal close: bills, release resources, lessons (#40)",
    },
  },
  {
    tip: "Do nothing",
    ans: "B",
    q: "Option “wait and see / do nothing”?",
    opts: {
      A: "Thường đúng khi risk thấp",
      B: "Thường loại — #49 Never do nothing",
      C: "Đúng nếu có chữ always",
      D: "Chỉ đúng với Agile collocation",
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

function byN(n) {
  return PRINCIPLES.find((p) => p.n === n);
}

function buildHtml({ assetPrefix, cssHref, fullscreenHref }) {
  const familyNav = FAMILIES.map(
    (f) => `        <a href="#${f.id}">${esc(f.label)}</a>`,
  ).join("\n");

  const mapRows = FAMILIES.map((f) => {
    const chips = f.ids
      .map((n) => `<a class="id-chip" href="#p-${n}">#${n}</a>`)
      .join(" ");
    return `              <tr>
                <td><a href="#${f.id}"><strong>${esc(f.label)}</strong></a></td>
                <td>${f.ids.length}</td>
                <td>${chips}</td>
              </tr>`;
  }).join("\n");

  const familySections = FAMILIES.map((fam) => {
    const cards = fam.ids
      .map((n) => {
        const p = byN(n);
        return `        <article class="pattern-block" id="p-${p.n}">
          <h3><span class="badge">#${p.n}</span> ${esc(p.en.slice(0, 72))}${p.en.length > 72 ? "…" : ""}</h3>
          <div class="rule">${esc(p.en)}</div>
          <div class="card tip"><strong>VI:</strong> ${esc(p.vi)}</div>
          <p class="fam-note" style="margin:0.35rem 0 0">⏱ ${esc(p.t)}</p>
        </article>`;
      })
      .join("\n");
    return `      <section id="${fam.id}">
        <h2>${esc(fam.label)} · ${fam.ids.length}</h2>
${cards}
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
            <div class="q-num">${esc(item.tip)}</div>
            <div class="q-text">${item.q}</div>
${buttons}
            <div class="feedback" data-fb></div>
          </div>`;
  }).join("\n\n");

  const famIds = JSON.stringify(FAMILIES.map((f) => f.id));

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMP Teach — 50 exam mindset principles</title>
  <link rel="stylesheet" href="${cssHref}">
  <link rel="stylesheet" href="${fullscreenHref}">
  <style>
    .pattern-block { margin-bottom: 1.1rem; }
    .pattern-block h3 { margin: 0 0 0.45rem; font-size: 1rem; display:flex; gap:0.5rem; align-items:flex-start; flex-wrap:wrap; }
    .pattern-block .badge { flex: 0 0 auto; }
    .rule { font-size: 0.95rem; margin-bottom: 0.5rem; }
    .fam-note { font-size: 0.8rem; color: var(--muted); }
    .kw-cue { color: var(--primary-dark); font-weight: 600; }
    table td { vertical-align: top; font-size: 0.84rem; }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">PMP Teach</div>
      <div class="brand-sub">50 exam principles · mindset</div>
      <nav id="sideNav">
        <a href="#intro" class="active">Giới thiệu</a>
        <a href="#map">Bản đồ 9 nhóm</a>
${familyNav}
        <a href="#practice">Luyện ${QUIZ.length} câu</a>
        <a href="#cheat">Cheat sheet</a>
        <a href="#next">Next</a>
      </nav>
      <a class="back-link" href="${assetPrefix}pmp-exam-prep-lecture.html#mindset-teach">← Bài giảng · Mindset</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-mindset-teach.html">Mindset drill</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-cheat-sheet.html">Cheat Sheet</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-teach-full-bank-patterns.html">Full Bank patterns</a>
      <a class="back-link secondary" href="${assetPrefix}pmp-glossary-vi.html">Glossary</a>
    </aside>

    <div>
      <nav class="mobile-nav">
        <a href="#intro">Intro</a>
        <a href="#map">Map</a>
        <a href="#practice">Quiz</a>
        <a href="#cheat">Cheat</a>
        <a href="${assetPrefix}pmp-exam-prep-lecture.html#mindset-teach">Lecture</a>
      </nav>

      <main>
        <header class="hero" id="intro">
          <h1>50 PMP exam mindset principles</h1>
          <p class="lead">
            Bộ nguyên tắc <strong>thi tình huống</strong> (không phải 6 Principles PMBOK 8).
            Mỗi thẻ: English principle + 1 dòng VI + timestamp video nguồn.
            Học theo nhóm → làm quiz retrieval → hỏi agent nếu cue chưa rõ.
          </p>
          <div class="stat-grid">
            <div class="stat-box"><strong>50</strong><span>principles</span></div>
            <div class="stat-box"><strong>9</strong><span>families</span></div>
            <div class="stat-box"><strong>${QUIZ.length}</strong><span>retrieval quiz</span></div>
            <div class="stat-box"><strong>EN→VI</strong><span>exam cues</span></div>
          </div>
          <div class="badges">
            <span class="badge">exam mindset</span>
            <span class="badge">FIRST / NEXT</span>
            <span class="badge">servant leader</span>
            <span class="badge">≠ PMBOK 6 Principles</span>
          </div>
        </header>

        <section id="map">
          <h2>Bản đồ 9 nhóm</h2>
          <div class="card info">
            <p style="margin:0" class="fam-note">
              Khác <a href="${assetPrefix}pmp-exam-prep-lecture.html#principles">6 Principles PMBOK 8</a>:
              đây là heuristics chọn đáp án trong situational MCQ.
            </p>
          </div>
          <table>
            <thead><tr><th>Family</th><th>n</th><th>IDs</th></tr></thead>
            <tbody>
${mapRows}
            </tbody>
          </table>
        </section>

${familySections}

        <section id="practice">
          <h2>Luyện ${QUIZ.length} câu (retrieval · interleaved)</h2>
          <p class="fam-note">Chọn → feedback ngay. Trộn Stakeholder / Change / People / Agile / Exam craft.</p>
${quizHtml}
        </section>

        <section id="cheat">
          <h2>Cheat sheet</h2>
          <div class="cheat-sheet">IF stem asks FIRST / NEXT                    → investigate / consult (#15)
IF unhappy / silent stakeholder               → actively engage (#2)
IF predictive scope/baseline change           → CR · review · assess (#6–#8)
IF agile product backlog priority             → Product Owner only (#28)
IF interpersonal / performance conflict       → direct + private (#16/#27)
IF option says always / all / never           → usually wrong (#48)
IF option is do nothing / wait indefinitely   → discard (#49)
IF project ends early                         → still formal close (#40)
IF technical unknown                          → SME / team first (#10/#14)</div>
        </section>

        <section id="next">
          <h2>Next</h2>
          <div class="card tip">
            <ol style="margin:0;padding-left:1.2rem">
              <li>Làm ${QUIZ.length} quiz đến đúng hết không nhìn cheat.</li>
              <li>Drill <a href="${assetPrefix}pmp-mindset-teach.html">PMP Mindset</a> + Full Bank filter Ôn câu sai.</li>
              <li>Map principle ↔ pattern trap tại <a href="${assetPrefix}pmp-teach-full-bank-patterns.html">Full Bank patterns</a>.</li>
              <li>Hỏi agent nếu một cue (#N) chưa rõ — teacher loop.</li>
            </ol>
          </div>
          <p class="ref-footer">
            Timestamps từ video nguồn học viên cung cấp (metadata only).
            Ground thêm:
            <a href="https://www.pmi.org/standards/pmbok/" target="_blank" rel="noopener">PMBOK® Guide — Eighth Edition</a>
            · Teach workspace: <code>teach/pmp-principles/</code>
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
            : "Sai — đọc lại principle # liên quan trên map, rồi thử quiz khác.";
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
    ["intro","map",...${famIds},"practice","cheat","next"]
      .forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  </script>
</body>
</html>
`;
}

function buildReference() {
  const lines = [
    "# 50 PMP exam mindset principles",
    "",
    "Not the PMBOK 8 six principles — situational exam heuristics.",
    "",
    "| # | Time | Principle | VI cue |",
    "|---|------|-----------|--------|",
  ];
  for (const p of PRINCIPLES) {
    lines.push(`| ${p.n} | ${p.t} | ${p.en.replace(/\|/g, "/")} | ${p.vi.replace(/\|/g, "/")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function writeWorkspace() {
  fs.mkdirSync(path.join(TEACH_DIR, "lessons"), { recursive: true });
  fs.mkdirSync(path.join(TEACH_DIR, "reference"), { recursive: true });
  fs.mkdirSync(path.join(TEACH_DIR, "learning-records"), { recursive: true });
  fs.mkdirSync(path.join(TEACH_DIR, "assets"), { recursive: true });

  // Reuse wrong-patterns CSS via relative link from lesson; copy note for assets
  const cssSrc = path.join(ROOT, "teach", "pmp-wrong-patterns", "assets", "lesson.css");
  const cssDst = path.join(TEACH_DIR, "assets", "lesson.css");
  if (fs.existsSync(cssSrc) && !fs.existsSync(cssDst)) {
    fs.copyFileSync(cssSrc, cssDst);
  }

  fs.writeFileSync(
    path.join(TEACH_DIR, "MISSION.md"),
    `# Mission: Fluency with 50 PMP exam mindset principles

## Why
Pass situational PMP items by retrieving the right exam heuristic in under 5 seconds (engage SH, CR before scope absorb, PO owns backlog, investigate FIRST/NEXT, …).

## Success looks like
- Name the matching principle # when hearing a stem cue
- Avoid absolute / do-nothing traps
- Distinguish predictive CR vs agile PO ownership
- Transfer cues into Full Bank redrills

## Constraints
- Vietnamese tips + English principle text
- Short interactive lesson over long theory
- Distinct from PMBOK 8's six Principles on the prep lecture

## Out of scope
- Memorizing video timestamps
- Replacing PMBOK 6 Principles teaching
`,
  );

  fs.writeFileSync(
    path.join(TEACH_DIR, "NOTES.md"),
    `# Notes

- Lesson 0001 (2026-07-15): 50 exam mindset principles from learner video outline
- Public: \`public/pmp/pmp-teach-50-principles.html\`
- Generator: \`scripts/generate-pmp-50-principles-lesson.js\`
- Timestamps are metadata only until a source URL is provided
`,
  );

  fs.writeFileSync(
    path.join(TEACH_DIR, "RESOURCES.md"),
    `# Resources

## Primary
- Learner-provided 50-principle outline (timestamps embedded in lesson cards)
- [PMBOK® Guide — Eighth Edition (PMI)](https://www.pmi.org/standards/pmbok/)

## Related in-repo
- \`public/pmp/pmp-mindset-teach.html\`
- \`public/pmp/pmp-teach-cheat-sheet.html\`
- \`public/pmp/pmp-teach-full-bank-patterns.html\`
`,
  );

  fs.writeFileSync(REF_OUT, buildReference());
}

function main() {
  writeWorkspace();

  fs.writeFileSync(
    PUBLIC_OUT,
    buildHtml({
      assetPrefix: "",
      cssHref: "pmp-teach-wrong-patterns.css",
      fullscreenHref: "pmp-teach-fullscreen.css",
    }),
  );

  fs.writeFileSync(
    TEACH_OUT,
    buildHtml({
      assetPrefix: "../../../public/pmp/",
      cssHref: "../assets/lesson.css",
      fullscreenHref: "../../../public/pmp/pmp-teach-fullscreen.css",
    }),
  );

  console.log(
    JSON.stringify(
      {
        public: PUBLIC_OUT,
        teach: TEACH_OUT,
        principles: PRINCIPLES.length,
        families: FAMILIES.length,
        quiz: QUIZ.length,
      },
      null,
      2,
    ),
  );
}

main();
