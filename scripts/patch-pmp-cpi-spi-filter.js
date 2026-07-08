const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const CPI_SPI_BLOCK = `
    const CPI_SPI_RE = /\\b(CPI|SPI)\\b/i;
    function questionTextBlob(q) {
      const parts = [q.text || "", q.correctLabel || "", q.explanation || ""];
      for (const o of q.options || []) parts.push(o.text || "");
      for (const o of q.dropdownOptions || []) parts.push(o.text || o.label || "");
      return parts.join(" ");
    }
    const CPI_SPI_QUESTION_IDS = new Set(
      QUESTIONS.filter(q => CPI_SPI_RE.test(questionTextBlob(q))).map(q => q.id),
    );
`;

const replacements = [
  [
    `#filterUnattemptedBtn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }`,
    `#filterUnattemptedBtn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    #filterCpiSpiBtn.active {
      background: #7c3aed;
      border-color: #7c3aed;
      color: #fff;
    }`,
  ],
  [
    `.toolbar .secondary.practice-only:not(#filterWrongBtn):not(#filterUnattemptedBtn),`,
    `.toolbar .secondary.practice-only:not(#filterWrongBtn):not(#filterUnattemptedBtn):not(#filterCpiSpiBtn),`,
  ],
  [
    `      #filterWrongBtn,
      #filterUnattemptedBtn {
        display: block !important;
        width: 100%;
        text-align: center;
      }`,
    `      #filterWrongBtn,
      #filterUnattemptedBtn,
      #filterCpiSpiBtn {
        display: block !important;
        width: 100%;
        text-align: center;
      }`,
  ],
  [
    `      <button type="button" id="filterUnattemptedBtn" class="secondary practice-only" onclick="toggleUnattemptedFilter()">Ôn câu chưa làm</button>
      <div class="stats" id="stats"></div>`,
    `      <button type="button" id="filterUnattemptedBtn" class="secondary practice-only" onclick="toggleUnattemptedFilter()">Ôn câu chưa làm</button>
      <button type="button" id="filterCpiSpiBtn" class="secondary practice-only" onclick="toggleCpiSpiFilter()">CPI / SPI</button>
      <div class="stats" id="stats"></div>`,
  ],
  [
    `    const PER_PAGE = 25;`,
    `    const PER_PAGE = 25;${CPI_SPI_BLOCK}`,
  ],
  [
    `filterUnattemptedOnly: false, unattemptedFilterIds: null, wrongFilterIds: null, user: null`,
    `filterUnattemptedOnly: false, filterCpiSpiOnly: false, unattemptedFilterIds: null, wrongFilterIds: null, user: null`,
  ],
  [
    `      state.wrongFilterIds = null;
      const wrongBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      if (wrongBtn) wrongBtn.classList.remove("active");
      if (unattemptedBtn) unattemptedBtn.classList.remove("active");
    }`,
    `      state.filterCpiSpiOnly = false;
      state.wrongFilterIds = null;
      const wrongBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      const cpiSpiBtn = document.getElementById("filterCpiSpiBtn");
      if (wrongBtn) wrongBtn.classList.remove("active");
      if (unattemptedBtn) unattemptedBtn.classList.remove("active");
      if (cpiSpiBtn) cpiSpiBtn.classList.remove("active");
    }`,
  ],
  [
    `    function countUnattemptedQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0).length;
    }`,
    `    function countUnattemptedQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0).length;
    }

    function countCpiSpiQuestions() {
      return CPI_SPI_QUESTION_IDS.size;
    }

    function clearOtherPracticeFilters(except) {
      if (except !== "wrong") {
        state.filterWrongOnly = false;
        state.wrongFilterIds = null;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
      }
      if (except !== "unattempted") {
        state.filterUnattemptedOnly = false;
        state.unattemptedFilterIds = null;
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
        if (unattemptedBtn) unattemptedBtn.classList.remove("active");
      }
      if (except !== "cpiSpi") {
        state.filterCpiSpiOnly = false;
        const cpiSpiBtn = document.getElementById("filterCpiSpiBtn");
        if (cpiSpiBtn) cpiSpiBtn.classList.remove("active");
      }
    }`,
  ],
  [
    `      if (state.filterUnattemptedOnly) {
        return "Bạn đã làm hết tất cả câu hỏi. Tắt filter để xem lại toàn bộ đề.";
      }
      return "Không có câu hỏi để hiển thị.";`,
    `      if (state.filterUnattemptedOnly) {
        return "Bạn đã làm hết tất cả câu hỏi. Tắt filter để xem lại toàn bộ đề.";
      }
      if (state.filterCpiSpiOnly) {
        return "Không có câu CPI / SPI trong bộ đề này.";
      }
      return "Không có câu hỏi để hiển thị.";`,
  ],
  [
    `      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        state.unattemptedFilterIds = null;
        refreshWrongFilterSnapshot();
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
        if (unattemptedBtn) unattemptedBtn.classList.remove("active");
      } else {
        state.wrongFilterIds = null;
      }
      const btn = document.getElementById("filterWrongBtn");
      if (btn) btn.classList.toggle("active", state.filterWrongOnly);
      state.page = 1;
      initPager();
      renderPage();
      const max = String(QUESTIONS.length);
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.max = max;
      if (bottomInput) bottomInput.max = max;
    }

    function toggleUnattemptedFilter()`,
    `      if (state.filterWrongOnly) {
        clearOtherPracticeFilters("wrong");
        refreshWrongFilterSnapshot();
      } else {
        state.wrongFilterIds = null;
      }
      const btn = document.getElementById("filterWrongBtn");
      if (btn) btn.classList.toggle("active", state.filterWrongOnly);
      state.page = 1;
      initPager();
      renderPage();
      const max = String(QUESTIONS.length);
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.max = max;
      if (bottomInput) bottomInput.max = max;
    }

    function toggleUnattemptedFilter()`,
  ],
  [
    `      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        state.wrongFilterIds = null;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
        refreshUnattemptedFilterSnapshot();
      } else {
        state.unattemptedFilterIds = null;
      }
      const btn = document.getElementById("filterUnattemptedBtn");
      if (btn) btn.classList.toggle("active", state.filterUnattemptedOnly);
      state.page = 1;
      initPager();
      renderPage();
      const max = String(QUESTIONS.length);
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.max = max;
      if (bottomInput) bottomInput.max = max;
    }


    let examTimerId = null;`,
    `      if (state.filterUnattemptedOnly) {
        clearOtherPracticeFilters("unattempted");
        refreshUnattemptedFilterSnapshot();
      } else {
        state.unattemptedFilterIds = null;
      }
      const btn = document.getElementById("filterUnattemptedBtn");
      if (btn) btn.classList.toggle("active", state.filterUnattemptedOnly);
      state.page = 1;
      initPager();
      renderPage();
      const max = String(QUESTIONS.length);
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.max = max;
      if (bottomInput) bottomInput.max = max;
    }

    function toggleCpiSpiFilter() {
      if (state.exam) return;
      if (!getActiveUser()) {
        openUserModal(false);
        return;
      }
      state.filterCpiSpiOnly = !state.filterCpiSpiOnly;
      if (state.filterCpiSpiOnly) {
        clearOtherPracticeFilters("cpiSpi");
      }
      const btn = document.getElementById("filterCpiSpiBtn");
      if (btn) btn.classList.toggle("active", state.filterCpiSpiOnly);
      state.page = 1;
      initPager();
      renderPage();
      const max = String(QUESTIONS.length);
      const topInput = document.getElementById("jumpInput");
      const bottomInput = document.getElementById("jumpInputBottom");
      if (topInput) topInput.max = max;
      if (bottomInput) bottomInput.max = max;
    }


    let examTimerId = null;`,
  ],
  [
    `      if (state.filterUnattemptedOnly) {
        if (state.unattemptedFilterIds) {
          const allowed = new Set(state.unattemptedFilterIds);
          return QUESTIONS.filter(q => allowed.has(q.id));
        }
        return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0);
      }
      return QUESTIONS;`,
    `      if (state.filterUnattemptedOnly) {
        if (state.unattemptedFilterIds) {
          const allowed = new Set(state.unattemptedFilterIds);
          return QUESTIONS.filter(q => allowed.has(q.id));
        }
        return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0);
      }
      if (state.filterCpiSpiOnly) {
        return QUESTIONS.filter(q => CPI_SPI_QUESTION_IDS.has(q.id));
      }
      return QUESTIONS;`,
  ],
  [
    `      const filterBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      if (filterBtn) filterBtn.hidden = !!active;
      if (unattemptedBtn) unattemptedBtn.hidden = !!active;
      if (active && (state.filterWrongOnly || state.filterUnattemptedOnly)) {
        clearPracticeFilters();
      }`,
    `      const filterBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      const cpiSpiBtn = document.getElementById("filterCpiSpiBtn");
      if (filterBtn) filterBtn.hidden = !!active;
      if (unattemptedBtn) unattemptedBtn.hidden = !!active;
      if (cpiSpiBtn) cpiSpiBtn.hidden = !!active;
      if (active && (state.filterWrongOnly || state.filterUnattemptedOnly || state.filterCpiSpiOnly)) {
        clearPracticeFilters();
      }`,
  ],
  [
    `        if (state.filterUnattemptedOnly) text += " · Chỉ câu chưa làm";`,
    `        if (state.filterUnattemptedOnly) text += " · Chỉ câu chưa làm";
        if (state.filterCpiSpiOnly) text += " · CPI / SPI (" + countCpiSpiQuestions() + ")";`,
  ],
  [
    `        alert(state.filterWrongOnly
          ? \`Câu \${n} không nằm trong danh sách câu đã sai.\`
          : state.filterUnattemptedOnly
            ? \`Câu \${n} đã được làm trước đó hoặc không nằm trong danh sách câu chưa làm.\`
            : \`Không tìm thấy câu \${n}.\`);`,
    `        alert(state.filterWrongOnly
          ? \`Câu \${n} không nằm trong danh sách câu đã sai.\`
          : state.filterUnattemptedOnly
            ? \`Câu \${n} đã được làm trước đó hoặc không nằm trong danh sách câu chưa làm.\`
            : state.filterCpiSpiOnly
              ? \`Câu \${n} không nằm trong danh sách CPI / SPI.\`
              : \`Không tìm thấy câu \${n}.\`);`,
  ],
];

const MARKER = "filterCpiSpiOnly";

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  if (html.includes(MARKER) && html.includes("toggleCpiSpiFilter")) {
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
