const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const cssBlock = `    .exam-timer {
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      padding: 0.45rem 0.75rem;
      border-radius: 10px;
      background: #eff6ff;
      color: var(--primary);
      white-space: nowrap;
    }
    .exam-timer.warning {
      background: var(--warn-bg);
      color: #92400e;
    }
    .exam-timer.danger {
      background: var(--bad-bg);
      color: var(--bad);
    }
    body.exam-active .exam-hide-during-exam {
      display: none !important;
    }`;

if (!html.includes(".exam-timer")) {
  html = html.replace(
    "    .stats {",
    `${cssBlock}\n    .stats {`
  );
}

const toolbarButton = `      <button type="button" id="startMockExamBtn" onclick="startMockExam()">Thi thử 180 câu (240 phút)</button>
      <div id="examTimer" class="exam-timer" hidden></div>
      <button type="button" id="submitMockExamBtn" class="secondary exam-hide-during-exam" hidden onclick="submitMockExam()">Nộp bài</button>
      <button type="button" id="exitMockExamBtn" class="secondary exam-hide-during-exam" hidden onclick="exitMockExam()">Thoát thi thử</button>
      <button type="button" class="secondary exam-hide-during-exam" onclick="clearPageHighlights()">Xóa highlight trang</button>`;

if (!html.includes("startMockExamBtn")) {
  html = html.replace(
    `      <button type="button" class="secondary" onclick="clearPageHighlights()">Xóa highlight trang</button>`,
    toolbarButton
  );
}

html = html.replace(
  `<button type="button" class="secondary" onclick="checkCurrentPage()">Kiểm tra trang này</button>`,
  `<button type="button" class="secondary exam-hide-during-exam" onclick="checkCurrentPage()">Kiểm tra trang này</button>`
);

for (const line of [
  `      <button type="button" class="secondary practice-only" onclick="showAllAnswers()">Hiện tất cả đáp án</button>\n`,
  `      <button type="button" class="secondary exam-hide-during-exam" onclick="showAllAnswers()">Hiện tất cả đáp án</button>\n`,
  `      <button type="button" class="secondary" onclick="showAllAnswers()">Hiện tất cả đáp án</button>\n`,
  `      <button type="button" class="secondary practice-only" onclick="resetAll()">Làm lại</button>\n`,
  `      <button type="button" class="secondary" onclick="resetAll()">Làm lại</button>\n`,
]) {
  html = html.replace(line, "");
}

const examJs = `    const MOCK_EXAM_SIZE = 180;
    const MOCK_EXAM_SECONDS = 240 * 60;
    const EXAM_KEY = "pmp-mock-exam-v1";
    let examTimerId = null;

    function questionBank() {
      if (state.exam) return state.exam.questions;
      return QUESTIONS;
    }

    function questionTotal() {
      return questionBank().length;
    }

    function isAnswerFilled(q, answer) {
      if (answer == null || answer === "") return false;
      if (q.type === "drag_drop" && q.dragSlots) {
        const picks = String(answer).split(",");
        return picks.length >= q.dragSlots && picks.every(v => v);
      }
      if (isMultiSelect(q)) {
        return parseAnswerKeys(answer).length > 0;
      }
      return normalizeAnswer(answer) !== "";
    }

    function countAnsweredQuestions() {
      return questionBank().filter(q => isAnswerFilled(q, state.answers[q.id])).length;
    }

    function shuffleQuestions(list) {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function pickExamQuestions(count) {
      return shuffleQuestions(QUESTIONS).slice(0, count);
    }

    function formatExamTime(totalSeconds) {
      const safe = Math.max(0, totalSeconds);
      const h = Math.floor(safe / 3600);
      const m = Math.floor((safe % 3600) / 60);
      const s = safe % 60;
      return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    function examSecondsLeft() {
      if (!state.exam) return 0;
      return Math.max(0, Math.floor((state.exam.endAt - Date.now()) / 1000));
    }

    function saveExamState() {
      if (!state.exam) {
        localStorage.removeItem(EXAM_KEY);
        return;
      }
      localStorage.setItem(EXAM_KEY, JSON.stringify({
        questionIds: state.exam.questions.map(q => q.id),
        endAt: state.exam.endAt,
        submitted: !!state.exam.submitted,
        answers: state.answers,
        checked: state.checked,
        page: state.page,
      }));
    }

    function setExamUI(active, submitted = false) {
      document.body.classList.toggle("exam-active", active && !submitted);
      document.getElementById("startMockExamBtn").hidden = active;
      document.getElementById("submitMockExamBtn").hidden = !active || submitted;
      document.getElementById("exitMockExamBtn").hidden = !active;
      document.getElementById("examTimer").hidden = !active;
      const max = questionTotal();
      document.getElementById("jumpInput").max = String(max);
      document.getElementById("jumpInputBottom").max = String(max);
    }

    function updateExamTimer() {
      if (!state.exam) return;
      const left = examSecondsLeft();
      const el = document.getElementById("examTimer");
      el.textContent = "Còn lại: " + formatExamTime(left);
      el.classList.toggle("warning", left > 0 && left <= 600);
      el.classList.toggle("danger", left > 0 && left <= 60);
      if (left <= 0 && !state.exam.submitted) {
        submitMockExam(true);
      }
    }

    function startMockExam(force = false) {
      if (state.exam && !state.exam.submitted && !force) {
        if (!confirm("Bạn đang có bài thi. Bắt đầu lại?")) return;
      }
      if (!force && !confirm("Bắt đầu thi thử 180 câu / 240 phút?")) return;
      if (QUESTIONS.length < MOCK_EXAM_SIZE) {
        alert("Không đủ câu hỏi để tạo đề thi.");
        return;
      }
      if (examTimerId) clearInterval(examTimerId);
      state.exam = {
        questions: pickExamQuestions(MOCK_EXAM_SIZE),
        endAt: Date.now() + MOCK_EXAM_SECONDS * 1000,
        submitted: false,
      };
      state.page = 1;
      state.answers = {};
      state.checked = {};
      setExamUI(true);
      saveExamState();
      initPager();
      renderPage();
      examTimerId = setInterval(updateExamTimer, 1000);
      updateExamTimer();
    }

    function gradeAllExamQuestions() {
      const totalPages = Math.ceil(questionTotal() / PER_PAGE);
      const current = state.page;
      for (let p = 1; p <= totalPages; p++) {
        state.page = p;
        renderPage();
        pageQuestions().forEach(q => checkQuestion(q.id));
      }
      state.page = current;
      renderPage();
    }

    function submitMockExam(auto = false) {
      if (!state.exam || state.exam.submitted) return;
      if (!auto && !confirm("Nộp bài và xem kết quả?")) return;
      if (examTimerId) {
        clearInterval(examTimerId);
        examTimerId = null;
      }
      gradeAllExamQuestions();
      state.exam.submitted = true;
      setExamUI(true, true);
      saveExamState();
      let correct = 0;
      state.exam.questions.forEach(q => {
        if (answersMatch(q, state.answers[q.id])) correct++;
      });
      alert("Kết quả thi thử: " + correct + " / " + MOCK_EXAM_SIZE + " câu đúng");
    }

    function exitMockExam() {
      if (!state.exam) return;
      if (!confirm("Thoát chế độ thi thử?")) return;
      if (examTimerId) {
        clearInterval(examTimerId);
        examTimerId = null;
      }
      state.exam = null;
      state.page = 1;
      state.answers = {};
      state.checked = {};
      localStorage.removeItem(EXAM_KEY);
      setExamUI(false);
      initPager();
      renderPage();
    }

    function restoreExamState() {
      const raw = localStorage.getItem(EXAM_KEY);
      if (!raw) return;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        localStorage.removeItem(EXAM_KEY);
        return;
      }
      const questions = (data.questionIds || [])
        .map(id => QUESTIONS.find(q => q.id === id))
        .filter(Boolean);
      if (questions.length !== MOCK_EXAM_SIZE) {
        localStorage.removeItem(EXAM_KEY);
        return;
      }
      state.exam = {
        questions,
        endAt: data.endAt,
        submitted: !!data.submitted,
      };
      state.answers = data.answers || {};
      state.checked = data.checked || {};
      state.page = data.page || 1;
      setExamUI(true, state.exam.submitted);
      if (!state.exam.submitted && examSecondsLeft() <= 0) {
        submitMockExam(true);
        return;
      }
      if (!state.exam.submitted) {
        examTimerId = setInterval(updateExamTimer, 1000);
        updateExamTimer();
      }
    }`;

if (!html.includes("function startMockExam")) {
  html = html.replace(
    "    const state = { page: 1, answers: {}, checked: {}, hlColor: \"yellow\" };",
    `    const state = { page: 1, answers: {}, checked: {}, hlColor: "yellow", exam: null };\n${examJs}`
  );
}

html = html.replace(
  /function pageQuestions\(\) \{\s*const start = \(state\.page - 1\) \* PER_PAGE;\s*return QUESTIONS\.slice\(start, start \+ PER_PAGE\);\s*\}/,
  `function pageQuestions() {
      const bank = questionBank();
      const start = (state.page - 1) * PER_PAGE;
      return bank.slice(start, start + PER_PAGE);
    }`
);

html = html.replace(
  /const totalPages = Math\.ceil\(QUESTIONS\.length \/ PER_PAGE\);/g,
  "const totalPages = Math.ceil(questionTotal() / PER_PAGE);"
);

html = html.replace(
  /if \(!n \|\| n < 1 \|\| n > QUESTIONS\.length\)/,
  "if (!n || n < 1 || n > questionTotal())"
);

html = html.replace(
  "`Đã kiểm tra: ${checked} / ${QUESTIONS.length} · Đúng: ${correct}`;",
  "`Đã kiểm tra: ${checked} / ${questionTotal()} · Đúng: ${correct}`;"
);

html = html.replace(
  "const q = QUESTIONS.find(x => x.id === id);",
  "const q = questionBank().find(x => x.id === id) || QUESTIONS.find(x => x.id === id);"
);

html = html.replace(
  "const q = QUESTIONS.find(x => x.id === Number(id));",
  "const q = questionBank().find(x => x.id === Number(id)) || QUESTIONS.find(x => x.id === Number(id));"
);

html = html.replace(
  "const q = QUESTIONS.find(x => x.id === qid);",
  "const q = questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid);"
);

html = html.replace(
  "state.answers[qid] = getAnswer(QUESTIONS.find(x => x.id === qid));",
  "state.answers[qid] = getAnswer(questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid));"
);

const renderQuestionOld = `        <div class="actions">
          <button type="button" onclick="checkQuestion(\${q.id})">Kiểm tra</button>
          <button type="button" class="ghost" onclick="revealQuestion(\${q.id})">Xem đáp án</button>
        </div>`;

const renderQuestionNew = `        \${state.exam && !state.exam.submitted ? "" : \`<div class="actions">
          <button type="button" onclick="checkQuestion(\${q.id})">Kiểm tra</button>
          <button type="button" class="ghost" onclick="revealQuestion(\${q.id})">Xem đáp án</button>
        </div>\`}`;

if (html.includes(renderQuestionOld) && !html.includes("state.exam && !state.exam.submitted ?")) {
  html = html.replace(renderQuestionOld, renderQuestionNew);
}

html = html.replace(
  "function checkQuestion(id, revealOnly=false) {",
  `function checkQuestion(id, revealOnly=false) {
      if (state.exam && !state.exam.submitted) return;`
);

if (html.includes("gradeAllExamQuestions();\n      state.exam.submitted = true;")) {
  html = html.replace(
    "gradeAllExamQuestions();\n      state.exam.submitted = true;\n      setExamUI(true, true);",
    "state.exam.submitted = true;\n      setExamUI(true, true);\n      gradeAllExamQuestions();"
  );
}

html = html.replace(
  "function showAllAnswers() {",
  `function showAllAnswers() {
      if (state.exam && !state.exam.submitted) return;`
);

html = html.replace(
  "      updateStats();\n    }\n\n    function revealQuestion",
  `      updateStats();
      saveExamState();
    }\n\n    function revealQuestion`
);

html = html.replace(
  /if \(t\.matches\('input\[type="radio"\]\[name\^="q-"\]'\)\) \{[\s\S]*?if \(lbl\) lbl\.classList\.add\("selected"\);\n      \}/,
  `$&
      saveExamState();`
);

html = html.replace(
  /if \(t\.matches\('input\[type="checkbox"\]\[name\^="q-"\]'\)\) \{[\s\S]*?\}\);\n      \}/,
  `$&
      saveExamState();`
);

html = html.replace(
  /if \(t\.matches\("select\[data-q\]"\)\) \{[\s\S]*?state\.answers\[qid\] = getAnswer\(questionBank\(\)\.find\(x => x\.id === qid\) \|\| QUESTIONS\.find\(x => x\.id === qid\)\);\n      \}/,
  `$&
      saveExamState();`
);

html = html.replace(
  "    initPager();\n    loadHighlights();\n    renderPage();",
  `    initPager();
    loadHighlights();
    restoreExamState();
    renderPage();
    if (new URLSearchParams(window.location.search).get("exam") === "1" && !state.exam) {
      startMockExam(true);
    }`
);

if (!html.includes("function startMockExam")) {
  throw new Error("Failed to inject mock exam functions.");
}

fs.writeFileSync(filePath, html, "utf8");
console.log("Patched mock exam mode:", filePath);
