const fs = require("fs");
const path = require("path");

const MARKER = "filterUnattemptedOnly";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

function patch(html) {
  if (html.includes(MARKER)) return html;

  html = html.replace(
    `    #filterWrongBtn.active {
      background: var(--bad);
      border-color: var(--bad);
      color: #fff;
    }`,
    `    #filterWrongBtn.active {
      background: var(--bad);
      border-color: var(--bad);
      color: #fff;
    }
    #filterUnattemptedBtn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }`,
  );

  html = html.replace(
    ".toolbar .secondary.practice-only:not(#filterWrongBtn),",
    ".toolbar .secondary.practice-only:not(#filterWrongBtn):not(#filterUnattemptedBtn),",
  );

  html = html.replace(
    `      #filterWrongBtn {
        display: block !important;
        width: 100%;
        text-align: center;
      }`,
    `      #filterWrongBtn,
      #filterUnattemptedBtn {
        display: block !important;
        width: 100%;
        text-align: center;
      }`,
  );

  html = html.replace(
    `<button type="button" id="filterWrongBtn" class="secondary practice-only" onclick="toggleWrongFilter()">Ôn câu sai (nhiều nhất)</button>`,
    `<button type="button" id="filterWrongBtn" class="secondary practice-only" onclick="toggleWrongFilter()">Ôn câu sai (nhiều nhất)</button>
      <button type="button" id="filterUnattemptedBtn" class="secondary practice-only" onclick="toggleUnattemptedFilter()">Ôn câu chưa làm</button>`,
  );

  html = html.replace(
    "filterWrongOnly: false, user: null",
    "filterWrongOnly: false, filterUnattemptedOnly: false, user: null",
  );

  html = html.replace(
    `      state.filterWrongOnly = false;
      const btn = document.getElementById("filterWrongBtn");
      if (btn) btn.classList.remove("active");
      openUserModal(false);
    }`,
    `      clearPracticeFilters();
      openUserModal(false);
    }

    function clearPracticeFilters() {
      state.filterWrongOnly = false;
      state.filterUnattemptedOnly = false;
      const wrongBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      if (wrongBtn) wrongBtn.classList.remove("active");
      if (unattemptedBtn) unattemptedBtn.classList.remove("active");
    }`,
  );

  html = html.replace(
    `        if (state.filterWrongOnly) {
          initPager();
          renderPage();
        }`,
    `        if (state.filterWrongOnly || state.filterUnattemptedOnly) {
          initPager();
          renderPage();
        }`,
  );

  html = html.replace(
    `    function countWrongQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.wrong || 0) > 0).length;
    }

    function toggleWrongFilter() {
      if (state.exam) return;
      if (!getActiveUser()) {
        openUserModal(false);
        return;
      }
      state.filterWrongOnly = !state.filterWrongOnly;
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
    }`,
    `    function countWrongQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.wrong || 0) > 0).length;
    }

    function countUnattemptedQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0).length;
    }

    function practiceFilterEmptyMessage() {
      if (state.filterWrongOnly) {
        return "Chưa có câu nào bị sai. Hãy làm bài thi thử hoặc kiểm tra đáp án trong luyện tập trước.";
      }
      if (state.filterUnattemptedOnly) {
        return "Bạn đã làm hết tất cả câu hỏi. Tắt filter để xem lại toàn bộ đề.";
      }
      return "Không có câu hỏi để hiển thị.";
    }

    function toggleWrongFilter() {
      if (state.exam) return;
      if (!getActiveUser()) {
        openUserModal(false);
        return;
      }
      state.filterWrongOnly = !state.filterWrongOnly;
      if (state.filterWrongOnly) {
        state.filterUnattemptedOnly = false;
        const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
        if (unattemptedBtn) unattemptedBtn.classList.remove("active");
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

    function toggleUnattemptedFilter() {
      if (state.exam) return;
      if (!getActiveUser()) {
        openUserModal(false);
        return;
      }
      state.filterUnattemptedOnly = !state.filterUnattemptedOnly;
      if (state.filterUnattemptedOnly) {
        state.filterWrongOnly = false;
        const wrongBtn = document.getElementById("filterWrongBtn");
        if (wrongBtn) wrongBtn.classList.remove("active");
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
    }`,
  );

  html = html.replace(
    `    function questionBank() {
      if (state.exam) return state.exam.questions;
      if (!state.filterWrongOnly) return QUESTIONS;
      const stats = loadQuestionStats();
      return QUESTIONS
        .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
        .sort((a, b) => {
          const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
          if (wrongDiff !== 0) return wrongDiff;
          return a.id - b.id;
        });
    }`,
    `    function questionBank() {
      if (state.exam) return state.exam.questions;
      const stats = loadQuestionStats();
      if (state.filterWrongOnly) {
        return QUESTIONS
          .filter(q => (stats[String(q.id)]?.wrong || 0) > 0)
          .sort((a, b) => {
            const wrongDiff = (stats[String(b.id)]?.wrong || 0) - (stats[String(a.id)]?.wrong || 0);
            if (wrongDiff !== 0) return wrongDiff;
            return a.id - b.id;
          });
      }
      if (state.filterUnattemptedOnly) {
        return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0);
      }
      return QUESTIONS;
    }`,
  );

  html = html.replace(
    `      const filterBtn = document.getElementById("filterWrongBtn");
      if (filterBtn) filterBtn.hidden = !!active;
      if (active && state.filterWrongOnly) {
        state.filterWrongOnly = false;
        if (filterBtn) filterBtn.classList.remove("active");
      }`,
    `      const filterBtn = document.getElementById("filterWrongBtn");
      const unattemptedBtn = document.getElementById("filterUnattemptedBtn");
      if (filterBtn) filterBtn.hidden = !!active;
      if (unattemptedBtn) unattemptedBtn.hidden = !!active;
      if (active && (state.filterWrongOnly || state.filterUnattemptedOnly)) {
        clearPracticeFilters();
      }`,
  );

  html = html.replace(
    `        : '<div class="notice">Chưa có câu nào bị sai. Hãy làm bài thi thử hoặc kiểm tra đáp án trong luyện tập trước.</div>';`,
    `        : \`<div class="notice">\${practiceFilterEmptyMessage()}</div>\`;`,
  );

  html = html.replace(
    `        if (state.filterWrongOnly && ok) {
          initPager();
          renderPage();
          return;
        }`,
    `        if (state.filterWrongOnly && ok) {
          initPager();
          renderPage();
          return;
        }
        if (state.filterUnattemptedOnly && !revealOnly) {
          initPager();
          renderPage();
          return;
        }`,
  );

  html = html.replace(
    `        const wrongCount = countWrongQuestions();
        text += \` · Câu đã sai: \${wrongCount}\`;
        if (statsSyncFailed) text += " · Chưa đồng bộ server";
        if (state.filterWrongOnly) text += " · Sắp xếp: sai nhiều → ít";`,
    `        const wrongCount = countWrongQuestions();
        const unattemptedCount = countUnattemptedQuestions();
        text += \` · Câu đã sai: \${wrongCount} · Chưa làm: \${unattemptedCount}\`;
        if (statsSyncFailed) text += " · Chưa đồng bộ server";
        if (state.filterWrongOnly) text += " · Sắp xếp: sai nhiều → ít";
        if (state.filterUnattemptedOnly) text += " · Chỉ câu chưa làm";`,
  );

  html = html.replace(
    `        alert(state.filterWrongOnly
          ? \`Câu \${n} không nằm trong danh sách câu đã sai.\`
          : \`Không tìm thấy câu \${n}.\`);`,
    `        alert(state.filterWrongOnly
          ? \`Câu \${n} không nằm trong danh sách câu đã sai.\`
          : state.filterUnattemptedOnly
            ? \`Câu \${n} đã được làm trước đó hoặc không nằm trong danh sách câu chưa làm.\`
            : \`Không tìm thấy câu \${n}.\`);`,
  );

  return html;
}

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const next = patch(html);
  if (next === html) {
    console.log("Already patched:", path.basename(filePath));
  } else {
    fs.writeFileSync(filePath, next);
    console.log("Patched:", path.basename(filePath));
  }
}
