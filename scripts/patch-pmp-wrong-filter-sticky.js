const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const replacements = [
  [
    "filterUnattemptedOnly: false, unattemptedFilterIds: null, user: null",
    "filterUnattemptedOnly: false, unattemptedFilterIds: null, wrongFilterIds: null, user: null",
  ],
  [
    `    function clearPracticeFilters() {
      state.filterWrongOnly = false;
      state.filterUnattemptedOnly = false;
      state.unattemptedFilterIds = null;
      const wrongBtn`,
    `    function clearPracticeFilters() {
      state.filterWrongOnly = false;
      state.filterUnattemptedOnly = false;
      state.unattemptedFilterIds = null;
      state.wrongFilterIds = null;
      const wrongBtn`,
  ],
  [
    `    function refreshUnattemptedFilterSnapshot() {
      const stats = loadQuestionStats();
      state.unattemptedFilterIds = QUESTIONS
        .filter(q => (stats[String(q.id)]?.attempts || 0) === 0)
        .map(q => q.id);
    }

    function practiceFilterEmptyMessage()`,
    `    function refreshUnattemptedFilterSnapshot() {
      const stats = loadQuestionStats();
      state.unattemptedFilterIds = QUESTIONS
        .filter(q => (stats[String(q.id)]?.attempts || 0) === 0)
        .map(q => q.id);
    }

    function refreshWrongFilterSnapshot() {
      const stats = loadQuestionStats();
      state.wrongFilterIds = QUESTIONS
        .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
        .sort((a, b) => {
          const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
          if (wrongDiff !== 0) return wrongDiff;
          return a.id - b.id;
        })
        .map(q => q.id);
    }

    function practiceFilterEmptyMessage()`,
  ],
  [
    `      state.filterWrongOnly = !state.filterWrongOnly;
      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        state.unattemptedFilterIds = null;
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
        if (unattemptedBtn) unattemptedBtn.classList.remove("active");
      }
      const btn = document.getElementById("filterWrongBtn");`,
    `      state.filterWrongOnly = !state.filterWrongOnly;
      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        state.unattemptedFilterIds = null;
        refreshWrongFilterSnapshot();
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
        if (unattemptedBtn) unattemptedBtn.classList.remove("active");
      } else {
        state.wrongFilterIds = null;
      }
      const btn = document.getElementById("filterWrongBtn");`,
  ],
  [
    `      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
        refreshUnattemptedFilterSnapshot();
      } else {
        state.unattemptedFilterIds = null;
      }`,
    `      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        state.wrongFilterIds = null;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
        refreshUnattemptedFilterSnapshot();
      } else {
        state.unattemptedFilterIds = null;
      }`,
  ],
  [
    `      if (state.filterWrongOnly) {
        return QUESTIONS
          .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
          .sort((a, b) => {
            const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
            if (wrongDiff !== 0) return wrongDiff;
            return a.id - b.id;
          });
      }`,
    `      if (state.filterWrongOnly) {
        if (state.wrongFilterIds) {
          const order = new Map(state.wrongFilterIds.map((id, idx) => [id, idx]));
          return QUESTIONS
            .filter(q => order.has(q.id))
            .sort((a, b) => order.get(a.id) - order.get(b.id));
        }
        return QUESTIONS
          .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
          .sort((a, b) => {
            const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
            if (wrongDiff !== 0) return wrongDiff;
            return a.id - b.id;
          });
      }`,
  ],
  [
    `        if (state.filterWrongOnly) {
          initPager();
          renderPage();
        }
        return true;`,
    `        return true;`,
  ],
  [
    `        if (state.filterWrongOnly && ok) {
          initPager();
          renderPage();
          return;
        }
        `,
    "",
  ],
];

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let changed = false;

  for (const [oldText, newText] of replacements) {
    if (newText && html.includes(newText)) continue;
    if (!oldText || !html.includes(oldText)) {
      if (newText === "") continue;
      throw new Error(`Missing block in ${filePath}:\n${oldText.slice(0, 100)}...`);
    }
    html = html.replace(oldText, newText);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
    console.log("Patched:", path.basename(filePath));
  } else {
    console.log("Already patched:", path.basename(filePath));
  }
}
