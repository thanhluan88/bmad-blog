const fs = require("fs");
const path = require("path");

const MARKER = "const inProgress = active && !submitted";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const DISABLED_CSS = `    .toolbar button:disabled,
    .toolbar select:disabled,
    .toolbar input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }
    .toolbar button.secondary:disabled:hover {
      background: #fff;
    }
`;

const MOBILE_FIX = `      #examControls[hidden] {
        display: none !important;
      }
`;

const EXAM_CONTROLS_OLD = `      <div class="exam-controls" id="examControls" hidden>
        <div id="examTimer" class="exam-timer" hidden></div>
        <button type="button" id="pauseMockExamBtn" class="secondary" onclick="togglePauseMockExam()">Tạm dừng</button>
        <button type="button" id="resetMockExamBtn" class="secondary" onclick="resetMockExam()">Làm lại đề</button>
        <button type="button" id="submitMockExamBtn" class="secondary" onclick="submitMockExam()">Nộp bài</button>
        <button type="button" id="exitMockExamBtn" class="secondary" onclick="exitMockExam()">Thoát thi thử</button>
      </div>`;

const EXAM_CONTROLS_NEW = `      <div class="exam-controls" id="examControls">
        <div id="examTimer" class="exam-timer" hidden></div>
        <button type="button" id="pauseMockExamBtn" class="secondary" onclick="togglePauseMockExam()" disabled>Tạm dừng</button>
        <button type="button" id="resetMockExamBtn" class="secondary" onclick="resetMockExam()" disabled>Làm lại đề</button>
        <button type="button" id="submitMockExamBtn" class="secondary" onclick="submitMockExam()" disabled>Nộp bài</button>
        <button type="button" id="exitMockExamBtn" class="secondary" onclick="exitMockExam()" disabled>Thoát thi thử</button>
      </div>`;

const SET_EXAM_UI_OLD = `    function setExamUI(active, submitted = false) {
      document.body.classList.toggle("exam-active", active && !submitted);
      document.getElementById("startMockExamBtn").hidden = active;
      document.getElementById("examControls").hidden = !active;
      document.getElementById("submitMockExamBtn").hidden = submitted;
      document.getElementById("pauseMockExamBtn").hidden = submitted;
      document.getElementById("resetMockExamBtn").hidden = submitted;
      document.getElementById("examTimer").hidden = !active;
      const pauseBtn = document.getElementById("pauseMockExamBtn");
      if (pauseBtn && active && !submitted) {
        pauseBtn.textContent = state.exam?.paused ? "Tiếp tục" : "Tạm dừng";
      }`;

const SET_EXAM_UI_NEW = `    function setExamUI(active, submitted = false) {
      const inProgress = active && !submitted;
      document.body.classList.toggle("exam-active", inProgress);
      const startBtn = document.getElementById("startMockExamBtn");
      if (startBtn) {
        startBtn.hidden = active;
        startBtn.disabled = active;
      }
      const mockBtn = (id, { hidden = false, disabled = true } = {}) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.hidden = hidden;
        el.disabled = disabled;
      };
      mockBtn("pauseMockExamBtn", { hidden: submitted, disabled: !inProgress });
      mockBtn("resetMockExamBtn", { hidden: submitted, disabled: !inProgress });
      mockBtn("submitMockExamBtn", { hidden: submitted, disabled: !inProgress });
      mockBtn("exitMockExamBtn", { hidden: !active, disabled: !active });
      document.getElementById("examTimer").hidden = !active;
      const pauseBtn = document.getElementById("pauseMockExamBtn");
      if (pauseBtn && inProgress) {
        pauseBtn.textContent = state.exam?.paused ? "Tiếp tục" : "Tạm dừng";
      }
      document.querySelectorAll(".practice-only").forEach(el => {
        if (el.tagName === "BUTTON" || el.tagName === "SELECT") {
          el.disabled = inProgress;
        }
      });
      document.querySelectorAll(".jump-controls input").forEach(inp => {
        inp.disabled = inProgress;
      });`;

const INIT_OLD = `    restoreExamState();
    document.getElementById("startMockExamBtn").textContent =`;

const INIT_NEW = `    restoreExamState();
    if (!state.exam) setExamUI(false);
    document.getElementById("startMockExamBtn").textContent =`;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let changed = false;

  if (!html.includes("button:disabled,")) {
    html = html.replace(
      "    .toolbar button.secondary:hover { background: #fffbeb; }",
      `    .toolbar button.secondary:hover { background: #fffbeb; }\n${DISABLED_CSS}`,
    );
    changed = true;
  }

  if (!html.includes("#examControls[hidden]")) {
    html = html.replace(
      "      .exam-controls {\n        display: flex;\n        width: 100%;\n      }",
      `      .exam-controls {\n        display: flex;\n        width: 100%;\n      }\n${MOBILE_FIX}`,
    );
    changed = true;
  }

  if (html.includes(EXAM_CONTROLS_OLD)) {
    html = html.replace(EXAM_CONTROLS_OLD, EXAM_CONTROLS_NEW);
    changed = true;
  }

  if (html.includes(SET_EXAM_UI_OLD) && !html.includes(MARKER)) {
    html = html.replace(SET_EXAM_UI_OLD, SET_EXAM_UI_NEW);
    changed = true;
  }

  if (html.includes(INIT_OLD) && !html.includes("if (!state.exam) setExamUI(false);")) {
    html = html.replace(INIT_OLD, INIT_NEW);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html);
    console.log("Patched:", path.basename(filePath));
  } else if (html.includes(MARKER)) {
    console.log("Already patched:", path.basename(filePath));
  } else {
    console.warn("No changes applied:", path.basename(filePath));
  }
}
