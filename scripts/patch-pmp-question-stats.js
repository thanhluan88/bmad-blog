const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const cssBlock = `    .q-stat {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--muted);
      margin-left: 0.5rem;
    }
    .q-stat.has-wrong {
      color: var(--bad);
    }
    #filterWrongBtn.active {
      background: var(--bad);
      border-color: var(--bad);
      color: #fff;
    }`;

if (!html.includes(".q-stat {")) {
  html = html.replace(
    "    .stats {",
    `${cssBlock}\n    .stats {`,
  );
}

const toolbarBtn = `      <button type="button" id="filterWrongBtn" class="secondary practice-only" onclick="toggleWrongFilter()">Ôn câu sai (nhiều nhất)</button>`;
if (!html.includes("filterWrongBtn")) {
  html = html.replace(
    '      <button type="button" class="secondary practice-only" onclick="resetAll()">Làm lại</button>',
    `${toolbarBtn}\n      <button type="button" class="secondary practice-only" onclick="resetAll()">Làm lại</button>`,
  );
}

if (html.includes('<span class="hl-colors" title="Màu highlight mặc định">')) {
  html = html.replace(
    /      <span class="hl-colors" title="Màu highlight mặc định">[\s\S]*?      <\/span>\n/,
    "",
  );
}

const questionBankOld2 = `      return QUESTIONS.filter(q => (stats[String(q.id)]?.wrong || 0) > 0);`;
const questionBankNew2 = `      return QUESTIONS
        .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
        .sort((a, b) => {
          const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
          if (wrongDiff !== 0) return wrongDiff;
          return a.id - b.id;
        });`;
if (html.includes(questionBankOld2)) {
  html = html.replace(questionBankOld2, questionBankNew2);
}

const stateOld = 'const state = { page: 1, answers: {}, checked: {}, hlColor: "yellow", exam: null };';
const stateNew = 'const state = { page: 1, answers: {}, checked: {}, hlColor: "yellow", exam: null, filterWrongOnly: false };';
if (html.includes(stateOld)) {
  html = html.replace(stateOld, stateNew);
}

const keysBlock = `    const STATS_KEY = "pmp-question-stats-v1";

    function loadQuestionStats() {
      try {
        const data = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    }

    function saveQuestionStats(stats) {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function getQuestionStat(id) {
      const stats = loadQuestionStats();
      const row = stats[id] || stats[String(id)] || { attempts: 0, wrong: 0 };
      return {
        attempts: Number(row.attempts) || 0,
        wrong: Number(row.wrong) || 0,
      };
    }

    function recordQuestionAttempt(id, isCorrect) {
      const stats = loadQuestionStats();
      const key = String(id);
      const row = stats[key] || { attempts: 0, wrong: 0 };
      row.attempts = (Number(row.attempts) || 0) + 1;
      if (!isCorrect) row.wrong = (Number(row.wrong) || 0) + 1;
      stats[key] = row;
      saveQuestionStats(stats);
    }

    function countWrongQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.wrong || 0) > 0).length;
    }

    function toggleWrongFilter() {
      if (state.exam) return;
      state.filterWrongOnly = !state.filterWrongOnly;
      const btn = document.getElementById("filterWrongBtn");
      if (btn) btn.classList.toggle("active", state.filterWrongOnly);
      state.page = 1;
      initPager();
      renderPage();
    }

`;

if (!html.includes("STATS_KEY")) {
  html = html.replace(
    '    const USED_KEY = "pmp-mock-exam-used-v1";',
    `    const USED_KEY = "pmp-mock-exam-used-v1";\n${keysBlock}`,
  );
}

const questionBankOld = `    function questionBank() {
      if (state.exam) return state.exam.questions;
      return QUESTIONS;
    }`;

const questionBankNew = `    function questionBank() {
      if (state.exam) return state.exam.questions;
      if (!state.filterWrongOnly) return QUESTIONS;
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.wrong || 0) > 0);
    }`;

if (html.includes(questionBankOld)) {
  html = html.replace(questionBankOld, questionBankNew);
}

const pickExamOld = `    function pickExamQuestions(count) {
      const used = loadUsedQuestionIds();
      let available = QUESTIONS.filter(q => !used.has(q.id));
      if (available.length < count) {
        const canReset = available.length === 0
          || confirm(
            \`Chỉ còn \${available.length} câu bạn chưa từng chọn trong thi thử (đã chọn \${used.size} câu). Reset danh sách và bắt đầu lại?\`
          );
        if (!canReset) {
          alert(\`Không đủ câu hỏi mới để tạo đề (cần \${count}, còn \${available.length}).\`);
          return null;
        }
        clearUsedQuestionIds();
        available = QUESTIONS.slice();
      }
      return shuffleQuestions(available).slice(0, count);
    }`;

const pickExamNew = `    function pickExamQuestions(count) {
      const stats = loadQuestionStats();
      const tiers = new Map();
      for (const q of QUESTIONS) {
        const attempts = stats[String(q.id)]?.attempts || 0;
        if (!tiers.has(attempts)) tiers.set(attempts, []);
        tiers.get(attempts).push(q);
      }
      const picked = [];
      for (const attempts of [...tiers.keys()].sort((a, b) => a - b)) {
        const pool = shuffleQuestions(tiers.get(attempts));
        for (const q of pool) {
          picked.push(q);
          if (picked.length >= count) break;
        }
        if (picked.length >= count) break;
      }
      if (picked.length < count) {
        alert(\`Không đủ câu hỏi để tạo đề (cần \${count}, có \${picked.length}).\`);
        return null;
      }
      return picked;
    }`;

if (html.includes(pickExamOld)) {
  html = html.replace(pickExamOld, pickExamNew);
}

const renderQHeadOld = `          <div class="q-num">Câu \${q.id}\${badge}</div>`;
const renderQHeadNew = `          <div class="q-num">Câu \${q.id}\${badge}\${renderQuestionStatBadge(q.id)}</div>`;

if (html.includes(renderQHeadOld) && !html.includes("renderQuestionStatBadge")) {
  html = html.replace(
    "    function renderQuestion(q) {",
    `    function renderQuestionStatBadge(id) {
      const stat = getQuestionStat(id);
      const cls = stat.wrong > 0 ? "q-stat has-wrong" : "q-stat";
      return \`<span class="\${cls}">Đã làm: \${stat.attempts} · Sai: \${stat.wrong}</span>\`;
    }

    function renderQuestion(q) {`,
  );
  html = html.replace(renderQHeadOld, renderQHeadNew);
}

const checkRecordOld = `      if (!revealOnly && userAnswer && q.type !== "image_click" && q.type !== "special") {
        const ok = answersMatch(q, userAnswer);
        result.style.borderColor = ok ? "var(--ok)" : "var(--bad)";
        result.style.background = ok ? "var(--ok-bg)" : "var(--bad-bg)";
      } else {`;

const checkRecordNew = `      if (!revealOnly && isAnswerFilled(q, userAnswer)) {
        const ok = answersMatch(q, userAnswer);
        recordQuestionAttempt(id, ok);
        if (q.type !== "image_click" && q.type !== "special") {
          result.style.borderColor = ok ? "var(--ok)" : "var(--bad)";
          result.style.background = ok ? "var(--ok-bg)" : "var(--bad-bg)";
        } else {
          result.style.borderColor = "var(--border)";
          result.style.background = "#f8fafc";
        }
      } else {`;

if (html.includes(checkRecordOld)) {
  html = html.replace(checkRecordOld, checkRecordNew);
}

const renderPageOld = `      document.getElementById("quiz").innerHTML = pageQuestions().map(renderQuestion).join("");`;
const renderPageNew = `      const visibleQuestions = pageQuestions();
      document.getElementById("quiz").innerHTML = visibleQuestions.length
        ? visibleQuestions.map(renderQuestion).join("")
        : '<div class="notice">Chưa có câu nào bị sai. Hãy làm bài và kiểm tra đáp án trước.</div>';`;

if (html.includes(renderPageOld)) {
  html = html.replace(renderPageOld, renderPageNew);
}

const updateStatsOld = `      let text = \`Đã kiểm tra: \${checked} / \${questionTotal()} · Đúng: \${correct}\`;
      if (state.exam && !state.exam.submitted) {
        text += \` · Đã chọn: \${countAnsweredQuestions()}\`;
      }
      document.getElementById("stats").textContent = text;`;

const updateStatsNew = `      let text = \`Đã kiểm tra: \${checked} / \${questionTotal()} · Đúng: \${correct}\`;
      if (state.exam && !state.exam.submitted) {
        text += \` · Đã chọn: \${countAnsweredQuestions()}\`;
      } else if (!state.exam) {
        const wrongCount = countWrongQuestions();
        text += \` · Câu đã sai: \${wrongCount}\`;
        if (state.filterWrongOnly) text += " · Đang lọc câu sai";
      }
      document.getElementById("stats").textContent = text;`;

if (html.includes(updateStatsOld)) {
  html = html.replace(updateStatsOld, updateStatsNew);
}

const setExamUIOld = `      document.getElementById("jumpInput").max = String(max);
      document.getElementById("jumpInputBottom").max = String(max);
    }`;

const setExamUINew = `      document.getElementById("jumpInput").max = String(max);
      document.getElementById("jumpInputBottom").max = String(max);
      const filterBtn = document.getElementById("filterWrongBtn");
      if (filterBtn) filterBtn.hidden = !!active;
      if (active && state.filterWrongOnly) {
        state.filterWrongOnly = false;
        if (filterBtn) filterBtn.classList.remove("active");
      }
    }`;

if (html.includes(setExamUIOld) && !html.includes("filterBtn.hidden")) {
  html = html.replace(setExamUIOld, setExamUINew);
}

const jumpOld = `    function jumpToQuestion(inputId = "jumpInput") {
      const input = document.getElementById(inputId);
      if (!input) return;
      const n = Number(input.value);
      if (!n || n < 1 || n > questionTotal()) {
        input.focus();
        if (input.select) input.select();
        return;
      }
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.value = String(n);
      if (bottomInput) bottomInput.value = String(n);
      state.page = Math.ceil(n / PER_PAGE);
      renderPage();
      const el = document.getElementById(\`q-\${n}\`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }`;

const jumpNew = `    function jumpToQuestion(inputId = "jumpInput") {
      const input = document.getElementById(inputId);
      if (!input) return;
      const n = Number(input.value);
      if (!n || n < 1 || n > QUESTIONS.length) {
        input.focus();
        if (input.select) input.select();
        return;
      }
      const bank = questionBank();
      const idx = bank.findIndex(q => q.id === n);
      if (idx < 0) {
        alert(state.filterWrongOnly
          ? \`Câu \${n} không nằm trong danh sách câu đã sai.\`
          : \`Không tìm thấy câu \${n}.\`);
        return;
      }
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.value = String(n);
      if (bottomInput) bottomInput.value = String(n);
      state.page = Math.ceil((idx + 1) / PER_PAGE);
      renderPage();
      const el = document.getElementById(\`q-\${n}\`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }`;

if (html.includes(jumpOld)) {
  html = html.replace(jumpOld, jumpNew);
}

if (!html.includes("STATS_KEY")) {
  throw new Error("Failed to patch question stats");
}

fs.writeFileSync(filePath, html, "utf8");
console.log("Patched question stats, wrong filter, and exam picking in", filePath);
