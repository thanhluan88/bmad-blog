const fs = require("fs");
const path = require("path");

const targets = [
  {
    file: path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
    examPrefix: "pmp-mock-exam-v2",
    usedPrefix: "pmp-mock-exam-used-v2",
    legacyExamKey: "pmp-mock-exam-v1",
    legacyUsedKey: "pmp-mock-exam-used-v1",
  },
  {
    file: path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
    examPrefix: "pmp-exam-latest-mock-exam-v2",
    usedPrefix: "pmp-exam-latest-mock-exam-used-v2",
    legacyExamKey: "pmp-exam-latest-mock-exam-v1",
    legacyUsedKey: "pmp-exam-latest-mock-exam-used-v1",
  },
];

function replaceRequired(html, oldText, newText, label) {
  if (html.includes(newText)) return html;
  if (!html.includes(oldText)) throw new Error(`Missing ${label}`);
  return html.replace(oldText, newText);
}

function patchFile(config) {
  let html = fs.readFileSync(config.file, "utf8").replace(/\r\n/g, "\n");

  const oldConstants = `    const EXAM_KEY = "${config.legacyExamKey}";
    const USED_KEY = "${config.legacyUsedKey}";`;
  const newConstants = `    const EXAM_KEY_PREFIX = "${config.examPrefix}";
    const USED_KEY_PREFIX = "${config.usedPrefix}";
    const LEGACY_EXAM_KEY = "${config.legacyExamKey}";
    const LEGACY_USED_KEY = "${config.legacyUsedKey}";`;
  if (!html.includes(newConstants)) {
    if (html.includes(oldConstants)) {
      html = html.replace(oldConstants, newConstants);
    } else {
      const scopedConstants =
        /    const EXAM_KEY_PREFIX = "[^"]+";\n    const USED_KEY_PREFIX = "[^"]+";\n    const LEGACY_EXAM_KEY = "[^"]+";\n    const LEGACY_USED_KEY = "[^"]+";/;
      if (!scopedConstants.test(html)) {
        throw new Error("Missing mock exam storage constants");
      }
      html = html.replace(scopedConstants, newConstants);
    }
  }

  const oldActiveUser = `    function getActiveUser() {
      return state.user || state.exam?.nickname || null;
    }`;
  const newActiveUser = `    function getActiveUser() {
      return state.user || state.exam?.nickname || null;
    }

    function mockExamUserSuffix(user = getActiveUser()) {
      const value = String(user || "").trim();
      return value ? encodeURIComponent(value) : null;
    }

    function getExamStorageKey(user = getActiveUser()) {
      const suffix = mockExamUserSuffix(user);
      return suffix ? \`\${EXAM_KEY_PREFIX}:\${suffix}\` : null;
    }

    function getUsedStorageKey(user = getActiveUser()) {
      const suffix = mockExamUserSuffix(user);
      return suffix ? \`\${USED_KEY_PREFIX}:\${suffix}\` : null;
    }

    function clearLegacyMockExamStorage() {
      localStorage.removeItem(LEGACY_EXAM_KEY);
      localStorage.removeItem(LEGACY_USED_KEY);
    }`;
  html = replaceRequired(html, oldActiveUser, newActiveUser, "user-scoped storage helpers");

  const oldSaveUser = `    function saveUser(name) {
      const trimmed = String(name || "").trim();
      if (!trimmed) return false;
      state.user = trimmed;
      localStorage.setItem(USER_KEY, trimmed);
      if (state.exam) state.exam.nickname = trimmed;
      updateNicknameDisplay();
      return true;
    }`;
  const newSaveUser = `    function saveUser(name) {
      const trimmed = String(name || "").trim();
      if (!trimmed) return false;
      const changedUser = !!state.user && state.user !== trimmed;
      if (changedUser) {
        stopExamTimer();
        state.exam = null;
        state.answers = {};
        state.checked = {};
        state.page = 1;
      }
      state.user = trimmed;
      localStorage.setItem(USER_KEY, trimmed);
      if (state.exam) state.exam.nickname = trimmed;
      updateNicknameDisplay();
      return true;
    }`;
  html = replaceRequired(html, oldSaveUser, newSaveUser, "user switch reset");

  const oldCompleteEntry = `      const afterSync = () => {
        initPager();
        if (!navigateFromHash()) renderPage();
        updateStats();
        if (userGatePendingMock) {`;
  const newCompleteEntry = `      const afterSync = () => {
        restoreExamState();
        if (!state.exam) setExamUI(false);
        initPager();
        if (!navigateFromHash()) renderPage();
        updateStats();
        if (userGatePendingMock) {`;
  html = replaceRequired(html, oldCompleteEntry, newCompleteEntry, "restore after user entry");

  const oldUsedFunctions = `    function loadUsedQuestionIds() {
      try {
        const data = JSON.parse(localStorage.getItem(USED_KEY) || "[]");
        return new Set(Array.isArray(data) ? data : []);
      } catch {
        return new Set();
      }
    }

    function saveUsedQuestionIds(ids) {
      localStorage.setItem(USED_KEY, JSON.stringify([...ids]));
    }`;
  const newUsedFunctions = `    function loadUsedQuestionIds() {
      const key = getUsedStorageKey();
      if (!key) return new Set();
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return new Set(Array.isArray(data) ? data : []);
      } catch {
        return new Set();
      }
    }

    function saveUsedQuestionIds(ids) {
      const key = getUsedStorageKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify([...ids]));
    }`;
  html = replaceRequired(html, oldUsedFunctions, newUsedFunctions, "used-question storage");

  const oldClearUsed = `    function clearUsedQuestionIds() {
      localStorage.removeItem(USED_KEY);
    }`;
  const newClearUsed = `    function clearUsedQuestionIds() {
      const key = getUsedStorageKey();
      if (key) localStorage.removeItem(key);
    }`;
  html = replaceRequired(html, oldClearUsed, newClearUsed, "clear used questions");

  const oldSaveExam = `    function saveExamState() {
      if (!state.exam) {
        localStorage.removeItem(EXAM_KEY);
        return;
      }
      localStorage.setItem(EXAM_KEY, JSON.stringify({
        questionIds: state.exam.questions.map(q => q.id),
        endAt: state.exam.endAt,
        submitted: !!state.exam.submitted,
        paused: !!state.exam.paused,
        pausedLeft: state.exam.pausedLeft ?? null,
        answers: state.answers,
        checked: state.checked,
        page: state.page,
      }));
      syncUsedFromExamAnswers();
    }`;
  const newSaveExam = `    function saveExamState() {
      const key = getExamStorageKey();
      if (!key) return;
      if (!state.exam) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, JSON.stringify({
        nickname: getActiveUser(),
        questionIds: state.exam.questions.map(q => q.id),
        endAt: state.exam.endAt,
        submitted: !!state.exam.submitted,
        paused: !!state.exam.paused,
        pausedLeft: state.exam.pausedLeft ?? null,
        answers: state.answers,
        checked: state.checked,
        page: state.page,
      }));
      syncUsedFromExamAnswers();
    }`;
  html = replaceRequired(html, oldSaveExam, newSaveExam, "exam state save");

  html = replaceRequired(
    html,
    "      localStorage.removeItem(EXAM_KEY);\n      setExamUI(false);",
    `      const key = getExamStorageKey();
      if (key) localStorage.removeItem(key);
      setExamUI(false);`,
    "exit exam storage cleanup",
  );

  const oldRestoreStart = `    function restoreExamState() {
      const raw = localStorage.getItem(EXAM_KEY);
      if (!raw) return;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        localStorage.removeItem(EXAM_KEY);
        return;
      }`;
  const newRestoreStart = `    function restoreExamState() {
      const user = getActiveUser();
      const key = getExamStorageKey(user);
      if (!user || !key) return;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        localStorage.removeItem(key);
        return;
      }
      if (data.nickname && data.nickname !== user) return;`;
  html = replaceRequired(html, oldRestoreStart, newRestoreStart, "exam state restore");
  html = html.replace(
    /localStorage\.removeItem\(EXAM_KEY\);/g,
    "localStorage.removeItem(key);",
  );
  html = replaceRequired(
    html,
    "        nickname: data.nickname,",
    "        nickname: user,",
    "restored exam owner",
  );

  const oldInit = `    initPager();
    loadHighlights();
    restoreExamState();
    if (!state.exam) setExamUI(false);
    document.getElementById("startMockExamBtn").textContent =
      \`Thi thử \${MOCK_EXAM_SIZE} câu (\${MOCK_EXAM_SECONDS / 60} phút)\`;
    const existingUser = loadStoredUser() || getActiveUser();
    if (existingUser) {
      if (!state.user) saveUser(existingUser);
      setUserGateMode(false);
      updateNicknameDisplay();
      pullStatsFromServer().finally(() => {`;
  const newInit = `    initPager();
    loadHighlights();
    clearLegacyMockExamStorage();
    document.getElementById("startMockExamBtn").textContent =
      \`Thi thử \${MOCK_EXAM_SIZE} câu (\${MOCK_EXAM_SECONDS / 60} phút)\`;
    const existingUser = loadStoredUser() || getActiveUser();
    if (existingUser) {
      if (!state.user) saveUser(existingUser);
      restoreExamState();
      if (!state.exam) setExamUI(false);
      setUserGateMode(false);
      updateNicknameDisplay();
      pullStatsFromServer().finally(() => {`;
  html = replaceRequired(html, oldInit, newInit, "user-first initialization");
  html = replaceRequired(
    html,
    `    } else {
      setUserGateMode(true);`,
    `    } else {
      setExamUI(false);
      setUserGateMode(true);`,
    "no-user initialization",
  );

  fs.writeFileSync(config.file, html);
  console.log(`Patched ${path.basename(config.file)}`);
}

for (const target of targets) patchFile(target);
