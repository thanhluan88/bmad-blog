const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const MARKER = "toggleQuestionTimer";

const replacements = [
  [
    `    .q-num {
      font-weight: 700;
      color: var(--primary);
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.35rem 0.5rem;
    }`,
    `    .q-num {
      font-weight: 700;
      color: var(--primary);
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.35rem 0.5rem;
    }
    .q-timer-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .q-timer-display {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      font-size: 1.05rem;
      color: #0f766e;
      min-width: 3.5rem;
      text-align: right;
    }
    .q-timer-btn {
      font: inherit;
      font-size: 0.82rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.3rem 0.65rem;
      cursor: pointer;
      background: #fff;
      color: var(--text);
      white-space: nowrap;
    }
    .q-timer-btn:hover { background: #fffbeb; }
    .q-timer-btn.active {
      background: #0f766e;
      border-color: #0f766e;
      color: #fff;
    }`,
  ],
  [
    `    function renderQuestionStatBadge(id) {
      const stat = getQuestionStat(id);
      const cls = stat.wrong > 0 ? "q-stat has-wrong" : "q-stat";
      return \`<span class="\${cls}" id="q-stat-\${id}">Đã làm: \${stat.attempts} · Sai: \${stat.wrong}</span>\`;
    }

    function renderQuestion(q) {`,
    `    function renderQuestionStatBadge(id) {
      const stat = getQuestionStat(id);
      const cls = stat.wrong > 0 ? "q-stat has-wrong" : "q-stat";
      return \`<span class="\${cls}" id="q-stat-\${id}">Đã làm: \${stat.attempts} · Sai: \${stat.wrong}</span>\`;
    }

    const questionTimer = { activeId: null, intervalId: null, startedAt: null, elapsed: {} };

    function formatQuestionTimer(seconds) {
      const s = Math.max(0, Math.floor(seconds));
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return \`\${String(m).padStart(2, "0")}:\${String(sec).padStart(2, "0")}\`;
    }

    function updateQuestionTimerDisplay(id) {
      const el = document.getElementById(\`q-timer-\${id}\`);
      const btn = document.getElementById(\`q-timer-btn-\${id}\`);
      if (!el) return;
      const base = questionTimer.elapsed[id] || 0;
      const running = questionTimer.activeId === id && questionTimer.startedAt;
      const total = base + (running ? (Date.now() - questionTimer.startedAt) / 1000 : 0);
      el.textContent = formatQuestionTimer(total);
      el.hidden = !running && !questionTimer.elapsed[id];
      if (btn) {
        btn.textContent = running ? "Stop" : "Start";
        btn.classList.toggle("active", !!running);
      }
    }

    function stopQuestionTimer(id, save = true) {
      if (questionTimer.activeId !== id) return;
      if (save && questionTimer.startedAt) {
        const prev = questionTimer.elapsed[id] || 0;
        questionTimer.elapsed[id] = prev + (Date.now() - questionTimer.startedAt) / 1000;
      }
      clearInterval(questionTimer.intervalId);
      questionTimer.intervalId = null;
      questionTimer.activeId = null;
      questionTimer.startedAt = null;
      updateQuestionTimerDisplay(id);
    }

    function stopAllQuestionTimers(save = true) {
      if (questionTimer.activeId != null) stopQuestionTimer(questionTimer.activeId, save);
    }

    function startQuestionTimer(id) {
      if (state.exam && !state.exam.submitted) return;
      if (questionTimer.activeId === id) return;
      stopAllQuestionTimers(true);
      questionTimer.elapsed[id] = 0;
      questionTimer.activeId = id;
      questionTimer.startedAt = Date.now();
      questionTimer.intervalId = setInterval(() => updateQuestionTimerDisplay(id), 250);
      updateQuestionTimerDisplay(id);
    }

    function toggleQuestionTimer(id) {
      if (state.exam && !state.exam.submitted) return;
      if (questionTimer.activeId === id) {
        stopQuestionTimer(id, true);
      } else {
        startQuestionTimer(id);
      }
    }

    function restoreQuestionTimersOnPage() {
      pageQuestions().forEach(q => {
        if (questionTimer.elapsed[q.id] || questionTimer.activeId === q.id) {
          updateQuestionTimerDisplay(q.id);
        }
      });
    }

    function renderQuestion(q) {`,
  ],
  [
    `      return \`<article class="card" id="q-\${q.id}" data-id="\${q.id}">
        <div class="q-head">
          <div class="q-num">Câu \${q.id}\${badge}\${renderQuestionStatBadge(q.id)}</div>
        </div>`,
    `      return \`<article class="card" id="q-\${q.id}" data-id="\${q.id}">
        <div class="q-head">
          <div class="q-num">Câu \${q.id}\${badge}\${renderQuestionStatBadge(q.id)}</div>
          <div class="q-timer-wrap practice-only">
            <span class="q-timer-display" id="q-timer-\${q.id}" hidden>00:00</span>
            <button type="button" class="q-timer-btn" id="q-timer-btn-\${q.id}" onclick="toggleQuestionTimer(\${q.id})">Start</button>
          </div>
        </div>`,
  ],
  [
    `    function renderPage() {
      const totalPages = Math.ceil(questionTotal() / PER_PAGE);
      state.page = Math.max(1, Math.min(state.page, totalPages));
      const visibleQuestions = pageQuestions();
      document.getElementById("quiz").innerHTML = visibleQuestions.length
        ? visibleQuestions.map(renderQuestion).join("")
        : \`<div class="notice">\${practiceFilterEmptyMessage()}</div>\`;
      document.getElementById("pageInfo").textContent = \`Trang \${state.page} / \${totalPages}\`;
      document.getElementById("pageSelect").value = String(state.page);
      restoreSelections();
      restoreHighlightsOnPage();
      updateStats();
    }`,
    `    function renderPage() {
      stopAllQuestionTimers(true);
      const totalPages = Math.ceil(questionTotal() / PER_PAGE);
      state.page = Math.max(1, Math.min(state.page, totalPages));
      const visibleQuestions = pageQuestions();
      document.getElementById("quiz").innerHTML = visibleQuestions.length
        ? visibleQuestions.map(renderQuestion).join("")
        : \`<div class="notice">\${practiceFilterEmptyMessage()}</div>\`;
      document.getElementById("pageInfo").textContent = \`Trang \${state.page} / \${totalPages}\`;
      document.getElementById("pageSelect").value = String(state.page);
      restoreSelections();
      restoreHighlightsOnPage();
      restoreQuestionTimersOnPage();
      updateStats();
    }`,
  ],
  [
    `    function checkQuestion(id, revealOnly=false) {
      if (state.exam && !state.exam.submitted) return;
      const q = questionBank().find(x => x.id === id) || QUESTIONS.find(x => x.id === id);
      if (!q) return;`,
    `    function checkQuestion(id, revealOnly=false) {
      if (state.exam && !state.exam.submitted) return;
      stopQuestionTimer(id, true);
      const q = questionBank().find(x => x.id === id) || QUESTIONS.find(x => x.id === id);
      if (!q) return;`,
  ],
];

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  if (html.includes(MARKER)) {
    console.log("Already patched:", path.basename(filePath));
    continue;
  }

  let changed = false;
  for (const [oldText, newText] of replacements) {
    if (!html.includes(oldText)) {
      throw new Error(`Missing block in ${path.basename(filePath)}:\n${oldText.slice(0, 120)}...`);
    }
    if (!html.includes(newText)) {
      html = html.replace(oldText, newText);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
    console.log("Patched:", path.basename(filePath));
  } else {
    console.log("No changes:", path.basename(filePath));
  }
}
