const fs = require("fs");
const path = require("path");

const MARKER = "PMP_STATS_SYNC_ENABLED";

const FILES = [
  {
    file: path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
    quizId: "full",
  },
  {
    file: path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
    quizId: "latest",
  },
];

const SYNC_BLOCK = (quizId) => `    const ${MARKER} = true;
    const PMP_STATS_QUIZ_ID = "${quizId}";
    const PMP_STATS_API = "/api/pmp/stats";
    let statsSyncTimer = null;

    function mergeStatsMaps(base, incoming) {
      const out = { ...(base || {}) };
      for (const [id, row] of Object.entries(incoming || {})) {
        const prev = out[id] || { attempts: 0, wrong: 0 };
        const next = row || {};
        out[id] = {
          attempts: Math.max(Number(prev.attempts) || 0, Number(next.attempts) || 0),
          wrong: Math.max(Number(prev.wrong) || 0, Number(next.wrong) || 0),
        };
      }
      return out;
    }

    function readLocalQuestionStats() {
      const key = getStatsKey();
      if (!key) return {};
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    }

    function writeLocalQuestionStats(stats) {
      const key = getStatsKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(stats));
    }

    async function pushStatsToServer(stats) {
      const user = getActiveUser();
      if (!user) return false;
      try {
        const res = await fetch(PMP_STATS_API, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quiz: PMP_STATS_QUIZ_ID, user, stats }),
        });
        return res.ok;
      } catch (err) {
        console.warn("PMP stats push failed", err);
        return false;
      }
    }

    function queueStatsSync() {
      clearTimeout(statsSyncTimer);
      statsSyncTimer = setTimeout(() => {
        pushStatsToServer(readLocalQuestionStats());
      }, 500);
    }

    async function pullStatsFromServer() {
      const user = getActiveUser();
      if (!user) return;
      try {
        const res = await fetch(
          \`\${PMP_STATS_API}?quiz=\${encodeURIComponent(PMP_STATS_QUIZ_ID)}&user=\${encodeURIComponent(user)}\`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const merged = mergeStatsMaps(data.stats || {}, readLocalQuestionStats());
        writeLocalQuestionStats(merged);
        await pushStatsToServer(merged);
        updateStats();
        if (state.filterWrongOnly) {
          initPager();
          renderPage();
        }
      } catch (err) {
        console.warn("PMP stats pull failed", err);
      }
    }

`;

for (const { file, quizId } of FILES) {
  if (!fs.existsSync(file)) {
    console.warn("Skip (missing):", file);
    continue;
  }

  let html = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

  if (html.includes(MARKER)) {
    console.log("Already patched:", path.basename(file));
    continue;
  }

  const loadOld = `    function loadQuestionStats() {
      const key = getStatsKey();
      if (!key) return {};
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return data && typeof data === "object" ? data : {};
      } catch {
        return {};
      }
    }

    function saveQuestionStats(stats) {
      const key = getStatsKey();
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(stats));
    }`;

  const loadNew = `${SYNC_BLOCK(quizId)}
    function loadQuestionStats() {
      return readLocalQuestionStats();
    }

    function saveQuestionStats(stats) {
      writeLocalQuestionStats(stats);
      queueStatsSync();
    }`;

  if (!html.includes(loadOld)) {
    throw new Error(`Stats block not found in ${file}`);
  }
  html = html.replace(loadOld, loadNew);

  const completeOld = `    function completeUserEntry() {
      setUserGateMode(false);
      initPager();
      renderPage();
      updateStats();
      if (userGatePendingMock) {
        userGatePendingMock = false;
        startMockExam(true);
      }
    }`;

  const completeNew = `    function completeUserEntry() {
      setUserGateMode(false);
      const afterSync = () => {
        initPager();
        renderPage();
        updateStats();
        if (userGatePendingMock) {
          userGatePendingMock = false;
          startMockExam(true);
        }
      };
      pullStatsFromServer().finally(afterSync);
    }`;

  if (!html.includes(completeOld)) {
    throw new Error(`completeUserEntry not found in ${file}`);
  }
  html = html.replace(completeOld, completeNew);

  const initOld = `    if (existingUser) {
      if (!state.user) saveUser(existingUser);
      setUserGateMode(false);
      renderPage();
      updateNicknameDisplay();
      if (_urlParams.get("exam") === "1" && !state.exam) {
        startMockExam(true);
      }
    }`;

  const initNew = `    if (existingUser) {
      if (!state.user) saveUser(existingUser);
      setUserGateMode(false);
      updateNicknameDisplay();
      pullStatsFromServer().finally(() => {
        renderPage();
        updateStats();
        if (_urlParams.get("exam") === "1" && !state.exam) {
          startMockExam(true);
        }
      });
    }`;

  if (!html.includes(initOld)) {
    throw new Error(`Init block not found in ${file}`);
  }
  html = html.replace(initOld, initNew);

  const visibilityHook = `    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && getActiveUser()) {
        pullStatsFromServer();
      }
    });

    initPager();`;

  if (!html.includes('document.addEventListener("visibilitychange"')) {
    html = html.replace("    initPager();", visibilityHook);
  }

  fs.writeFileSync(file, html);
  console.log("Patched:", path.basename(file));
}
