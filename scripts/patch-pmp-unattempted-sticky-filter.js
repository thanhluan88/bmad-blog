const fs = require("fs");
const path = require("path");

const MARKER = "refreshUnattemptedFilterSnapshot";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const STATE_OLD = "filterUnattemptedOnly: false, user: null";
const STATE_NEW = "filterUnattemptedOnly: false, unattemptedFilterIds: null, user: null";

const CLEAR_FILTERS_OLD = `    function clearPracticeFilters() {
      state.filterWrongOnly = false;
      state.filterUnattemptedOnly = false;
      const wrongBtn`;
const CLEAR_FILTERS_NEW = `    function clearPracticeFilters() {
      state.filterWrongOnly = false;
      state.filterUnattemptedOnly = false;
      state.unattemptedFilterIds = null;
      const wrongBtn`;

const PULL_OLD = `        if (state.filterWrongOnly || state.filterUnattemptedOnly) {
          initPager();
          renderPage();
        }`;
const PULL_NEW = `        if (state.filterWrongOnly) {
          initPager();
          renderPage();
        }`;

const SNAPSHOT_FN = `
    function refreshUnattemptedFilterSnapshot() {
      const stats = loadQuestionStats();
      state.unattemptedFilterIds = QUESTIONS
        .filter(q => (stats[String(q.id)]?.attempts || 0) === 0)
        .map(q => q.id);
    }
`;

const WRONG_TOGGLE_OLD = `      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");`;
const WRONG_TOGGLE_NEW = `      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        state.unattemptedFilterIds = null;
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");`;

const UNATTEMPTED_TOGGLE_OLD = `      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
      }
      const btn = document.getElementById("filterUnattemptedBtn");`;
const UNATTEMPTED_TOGGLE_NEW = `      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
        refreshUnattemptedFilterSnapshot();
      } else {
        state.unattemptedFilterIds = null;
      }
      const btn = document.getElementById("filterUnattemptedBtn");`;

const BANK_OLD = `      if (state.filterUnattemptedOnly) {
        return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0);
      }`;
const BANK_NEW = `      if (state.filterUnattemptedOnly) {
        if (state.unattemptedFilterIds) {
          const allowed = new Set(state.unattemptedFilterIds);
          return QUESTIONS.filter(q => allowed.has(q.id));
        }
        return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0);
      }`;

const CHECK_REMOVE = `        if (state.filterUnattemptedOnly && !revealOnly) {
          initPager();
          renderPage();
          return;
        }
        `;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

  if (html.includes(STATE_OLD) && !html.includes("unattemptedFilterIds")) {
    html = html.replace(STATE_OLD, STATE_NEW);
  }

  if (html.includes(CLEAR_FILTERS_OLD) && !html.includes("state.unattemptedFilterIds = null;\n      const wrongBtn")) {
    html = html.replace(CLEAR_FILTERS_OLD, CLEAR_FILTERS_NEW);
  }

  if (html.includes(PULL_OLD)) {
    html = html.replace(PULL_OLD, PULL_NEW);
  }

  if (!html.includes(MARKER)) {
    html = html.replace(
      "    function practiceFilterEmptyMessage() {",
      `${SNAPSHOT_FN}\n    function practiceFilterEmptyMessage() {`,
    );
  }

  if (html.includes(WRONG_TOGGLE_OLD) && !html.includes("state.unattemptedFilterIds = null;\n        const unattemptedBtn")) {
    html = html.replace(WRONG_TOGGLE_OLD, WRONG_TOGGLE_NEW);
  }

  if (html.includes(UNATTEMPTED_TOGGLE_OLD) && !html.includes("refreshUnattemptedFilterSnapshot();")) {
    html = html.replace(UNATTEMPTED_TOGGLE_OLD, UNATTEMPTED_TOGGLE_NEW);
  }

  if (html.includes(BANK_OLD)) {
    html = html.replace(BANK_OLD, BANK_NEW);
  }

  if (html.includes(CHECK_REMOVE)) {
    html = html.replace(CHECK_REMOVE, "");
  }

  fs.writeFileSync(filePath, html);
  console.log(
    html.includes(MARKER) ? "Patched:" : "Partial:",
    path.basename(filePath),
  );
}
