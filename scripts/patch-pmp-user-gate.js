const fs = require("fs");
const path = require("path");

const FILES = [
  {
    file: path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
    userKey: "pmp-quiz-user-v1",
    statsPrefix: "pmp-question-stats-v1",
  },
  {
    file: path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
    userKey: "pmp-exam-latest-user-v1",
    statsPrefix: "pmp-exam-latest-question-stats-v1",
  },
];

function patchFile({ file, userKey, statsPrefix }) {
  if (!fs.existsSync(file)) {
    console.warn("Skip (missing):", file);
    return;
  }

  let html = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

  const gateCss = `    body.user-gate-active header .toolbar,
    body.user-gate-active main {
      visibility: hidden;
      pointer-events: none;
    }
    body.user-gate-active header h1,
    body.user-gate-active header > p {
      opacity: 0.45;
    }
    .switch-user-btn {
      margin-left: 0.5rem;
      font-size: 0.85rem;
      color: var(--primary);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }
`;

  if (!html.includes("body.user-gate-active")) {
    html = html.replace("  </style>", `${gateCss}  </style>`);
  }

  html = html.replace(
    "<h3>Nhập nickname</h3>\n      <p>Dùng để lưu thống kê câu hỏi riêng của bạn</p>",
    "<h3>Nhập tên người dùng</h3>\n      <p>Bắt buộc để vào luyện tập PMP. Thống kê và ôn câu sai được lưu riêng theo từng người.</p>",
  );

  if (html.includes('id="nicknameCancelBtn"')) {
    html = html.replace(
      /\s*<button type="button" class="modal-btn" id="nicknameCancelBtn">Hủy<\/button>/,
      "",
    );
  }

  const stateOld =
    'const state = { page: 1, answers: {}, checked: {}, hlColor: "yellow", exam: null, filterWrongOnly: false };';
  const stateNew =
    'const state = { page: 1, answers: {}, checked: {}, hlColor: "yellow", exam: null, filterWrongOnly: false, user: null };';
  if (html.includes(stateOld)) {
    html = html.replace(stateOld, stateNew);
  }

  const statsKeyOld = `    function getStatsKey(nickname) {
      return nickname ? \`${statsPrefix}:\${nickname}\` : "${statsPrefix}";
    }`;

  const statsKeyNew = `    const USER_KEY = "${userKey}";
    let userGatePendingMock = false;

    function getActiveUser() {
      return state.user || state.exam?.nickname || null;
    }

    function getStatsKey(user) {
      const u = (user || getActiveUser() || "").trim();
      if (!u) return null;
      return \`${statsPrefix}:\${u}\`;
    }

    function saveUser(name) {
      const trimmed = String(name || "").trim();
      if (!trimmed) return false;
      state.user = trimmed;
      localStorage.setItem(USER_KEY, trimmed);
      if (state.exam) state.exam.nickname = trimmed;
      updateNicknameDisplay();
      return true;
    }

    function loadStoredUser() {
      const fromUrl = (_urlParams.get("user") || "").trim();
      if (fromUrl) {
        saveUser(fromUrl);
        return fromUrl;
      }
      const saved = (localStorage.getItem(USER_KEY) || "").trim();
      if (saved) {
        state.user = saved;
        return saved;
      }
      return null;
    }

    function setUserGateMode(active) {
      document.body.classList.toggle("user-gate-active", !!active);
    }

    function openUserModal(forMockExam) {
      userGatePendingMock = !!forMockExam;
      const input = document.getElementById("nicknameInput");
      if (input) input.value = getActiveUser() || "";
      document.getElementById("nicknameModal").showModal();
    }

    function completeUserEntry() {
      setUserGateMode(false);
      initPager();
      renderPage();
      updateStats();
      if (userGatePendingMock) {
        userGatePendingMock = false;
        startMockExam(true);
      }
    }

    function switchUser() {
      if (state.exam && !state.exam.submitted) {
        alert("Không thể đổi người dùng khi đang thi thử. Hãy nộp bài hoặc thoát thi thử trước.");
        return;
      }
      state.filterWrongOnly = false;
      const btn = document.getElementById("filterWrongBtn");
      if (btn) btn.classList.remove("active");
      openUserModal(false);
    }`;

  if (html.includes("function getStatsKey(nickname)")) {
    html = html.replace(
      /    function getStatsKey\(nickname\) \{[\s\S]*?    \}/,
      statsKeyNew.trim(),
    );
  } else if (!html.includes("const USER_KEY")) {
    html = html.replace(
      /    const USED_KEY = "[^"]+";/,
      (match) => `${match}\n${statsKeyNew}`,
    );
  }

  const loadStatsOld = `    function loadQuestionStats() {
      const key = getStatsKey(state.exam?.nickname);
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    }`;

  const loadStatsNew = `    function loadQuestionStats() {
      const key = getStatsKey();
      if (!key) return {};
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    }`;

  if (html.includes("getStatsKey(state.exam?.nickname)")) {
    html = html.replace(loadStatsOld, loadStatsNew);
  }

  const saveStatsOld = `    function saveQuestionStats(stats) {
      const key = getStatsKey(state.exam?.nickname);
      localStorage.setItem(key, JSON.stringify(stats));
    }`;

  const saveStatsNew = `    function saveQuestionStats(stats) {
      const key = getStatsKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(stats));
    }`;

  if (html.includes(saveStatsOld)) {
    html = html.replace(saveStatsOld, saveStatsNew);
  }

  const toggleOld = `    function toggleWrongFilter() {
      if (state.exam) return;
      state.filterWrongOnly = !state.filterWrongOnly;`;

  const toggleNew = `    function toggleWrongFilter() {
      if (state.exam) return;
      if (!getActiveUser()) {
        openUserModal(false);
        return;
      }
      state.filterWrongOnly = !state.filterWrongOnly;`;

  if (html.includes(toggleOld) && !html.includes("if (!getActiveUser())")) {
    html = html.replace(toggleOld, toggleNew);
  }

  const recordOld = `    function recordQuestionAttempt(id, isCorrect) {
      const stats = loadQuestionStats();`;
  const recordNew = `    function recordQuestionAttempt(id, isCorrect) {
      if (!getActiveUser()) return;
      const stats = loadQuestionStats();`;
  if (html.includes(recordOld) && !html.includes("if (!getActiveUser()) return;")) {
    html = html.replace(recordOld, recordNew);
  }

  const mockGateOld = `      if (!state.exam?.nickname && !force) {
        document.getElementById("nicknameModal").showModal();
        return;
      }`;
  const mockGateNew = `      if (!getActiveUser() && !force) {
        openUserModal(true);
        return;
      }`;
  if (html.includes(mockGateOld)) {
    html = html.replace(mockGateOld, mockGateNew);
  }

  const displayOld = `    function updateNicknameDisplay() {
      const nickname = state.exam?.nickname;
      const display = document.getElementById("nicknameDisplay");
      if (nickname) {
        display.textContent = \`Người dùng: \${nickname}\`;
      } else {
        display.textContent = "";
      }
    }`;

  const displayNew = `    function updateNicknameDisplay() {
      const nickname = getActiveUser();
      const display = document.getElementById("nicknameDisplay");
      if (!display) return;
      if (nickname) {
        display.innerHTML = \`Người dùng: <strong>\${escapeHtml(nickname)}</strong> <button type="button" class="switch-user-btn" onclick="switchUser()">Đổi</button>\`;
      } else {
        display.textContent = "";
      }
    }`;

  if (html.includes("const nickname = state.exam?.nickname;")) {
    html = html.replace(displayOld, displayNew);
  }

  const submitOld = `    document.getElementById("nicknameSubmitBtn").addEventListener("click", () => {
      const nickname = document.getElementById("nicknameInput").value.trim();
      if (!nickname) {
        alert("Vui lòng nhập nickname");
        return;
      }
      if (!state.exam) state.exam = {};
      state.exam.nickname = nickname;
      document.getElementById("nicknameModal").close();
      document.getElementById("nicknameInput").value = "";
      updateNicknameDisplay();
      startMockExam(true);
    });

    document.getElementById("nicknameCancelBtn").addEventListener("click", () => {
      document.getElementById("nicknameModal").close();
      document.getElementById("nicknameInput").value = "";
    });`;

  const submitNew = `    document.getElementById("nicknameSubmitBtn").addEventListener("click", () => {
      const nickname = document.getElementById("nicknameInput").value.trim();
      if (!nickname) {
        alert("Vui lòng nhập tên người dùng");
        return;
      }
      if (!saveUser(nickname)) return;
      document.getElementById("nicknameModal").close();
      document.getElementById("nicknameInput").value = "";
      completeUserEntry();
    });

    document.getElementById("nicknameModal").addEventListener("cancel", (e) => {
      if (!getActiveUser()) e.preventDefault();
    });`;

  if (html.includes('alert("Vui lòng nhập nickname")')) {
    html = html.replace(submitOld, submitNew);
  }

  const initOld = `    initPager();
    loadHighlights();
    restoreExamState();
    renderPage();
    document.getElementById("startMockExamBtn").textContent =
      \`Thi thử \${MOCK_EXAM_SIZE} câu (\${MOCK_EXAM_SECONDS / 60} phút)\`;
    updateNicknameDisplay();
    if (_urlParams.get("exam") === "1" && !state.exam) {
      startMockExam(true);
    }`;

  const initNew = `    initPager();
    loadHighlights();
    restoreExamState();
    document.getElementById("startMockExamBtn").textContent =
      \`Thi thử \${MOCK_EXAM_SIZE} câu (\${MOCK_EXAM_SECONDS / 60} phút)\`;
    const existingUser = loadStoredUser() || getActiveUser();
    if (existingUser) {
      if (!state.user) saveUser(existingUser);
      setUserGateMode(false);
      renderPage();
      updateNicknameDisplay();
      if (_urlParams.get("exam") === "1" && !state.exam) {
        startMockExam(true);
      }
    } else {
      setUserGateMode(true);
      openUserModal(false);
      updateNicknameDisplay();
    }`;

  if (html.includes("restoreExamState();\n    renderPage();")) {
    html = html.replace(initOld, initNew);
  }

  fs.writeFileSync(file, html);
  console.log("Patched:", path.basename(file));
}

for (const cfg of FILES) {
  patchFile(cfg);
}
