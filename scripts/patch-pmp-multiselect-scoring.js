const fs = require("fs");
const path = require("path");

const targets = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const replacements = [
  [
    `        const hint = multi
          ? \`<div class="notice multi-select-hint">Chọn tất cả đáp án đúng (có thể chọn nhiều hơn 1).</div>\`
          : "";`,
    `        const hint = multi
          ? \`<div class="notice multi-select-hint">Chọn đúng \${requiredMultiSelectCount(q)} đáp án (phải chọn đủ \${requiredMultiSelectCount(q)} mới chấm điểm).</div>\`
          : "";`,
  ],
  [
    `    function isMultiSelect(q) {
      return q.type === "mcq" && parseAnswerKeys(q.correct).length > 1;
    }

    function answersMatch(q, userAnswer) {`,
    `    function isMultiSelect(q) {
      return q.type === "mcq" && parseAnswerKeys(q.correct).length > 1;
    }

    function requiredMultiSelectCount(q) {
      return parseAnswerKeys(q.correct).length;
    }

    function isMultiSelectComplete(q, answer) {
      if (!isMultiSelect(q)) return true;
      return parseAnswerKeys(answer).length === requiredMultiSelectCount(q);
    }

    function answersMatch(q, userAnswer) {`,
  ],
  [
    `      if (isMultiSelect(q)) {
        return parseAnswerKeys(answer).length > 0;
      }`,
    `      if (isMultiSelect(q)) {
        return isMultiSelectComplete(q, answer);
      }`,
  ],
  [
    `    function setAnswerHighlight(q, userAnswer) {
      const correctKeys = parseAnswerKeys(q.correct);
      const userKeys = parseAnswerKeys(userAnswer);
      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (userKeys.includes(key)) lbl.classList.add("selected");
          if (correctKeys.includes(key)) lbl.classList.add("correct");
          else if (userKeys.includes(key)) lbl.classList.add("incorrect");
        });
      }
    }`,
    `    function setAnswerHighlight(q, userAnswer) {
      const correctKeys = parseAnswerKeys(q.correct);
      const userKeys = parseAnswerKeys(userAnswer);
      const showGrade = !isMultiSelect(q) || isMultiSelectComplete(q, userAnswer);
      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (userKeys.includes(key)) lbl.classList.add("selected");
          if (showGrade && correctKeys.includes(key)) lbl.classList.add("correct");
          else if (showGrade && userKeys.includes(key)) lbl.classList.add("incorrect");
        });
      }
    }`,
  ],
  [
    `    function checkQuestion(id, revealOnly=false) {
      if (state.exam && !state.exam.submitted) return;
      const q = questionBank().find(x => x.id === id) || QUESTIONS.find(x => x.id === id);
      if (!q) return;
      const userAnswer = getAnswer(q);
      state.answers[id] = userAnswer;
      state.checked[id] = true;`,
    `    function checkQuestion(id, revealOnly=false) {
      if (state.exam && !state.exam.submitted) return;
      const q = questionBank().find(x => x.id === id) || QUESTIONS.find(x => x.id === id);
      if (!q) return;
      const userAnswer = getAnswer(q);
      state.answers[id] = userAnswer;
      const incompleteMulti = isMultiSelect(q) && !isMultiSelectComplete(q, userAnswer);
      const skipIncompleteGate = revealOnly || !!(state.exam && state.exam.submitted);
      if (!skipIncompleteGate && incompleteMulti) {
        alert(\`Câu \${id}: Hãy chọn đủ \${requiredMultiSelectCount(q)} đáp án trước khi chấm điểm.\`);
        return;
      }
      state.checked[id] = true;`,
  ],
  [
    `      } else {
        result.style.borderColor = "var(--border)";
        result.style.background = "#f8fafc";
      }
      updateStats();
      saveExamState();
    }

    function revealQuestion(id) { checkQuestion(id, true); }`,
    `      } else if (!revealOnly && state.exam && state.exam.submitted && incompleteMulti) {
        result.style.borderColor = "var(--bad)";
        result.style.background = "var(--bad-bg)";
      } else {
        result.style.borderColor = "var(--border)";
        result.style.background = "#f8fafc";
      }
      updateStats();
      saveExamState();
    }

    function revealQuestion(id) { checkQuestion(id, true); }`,
  ],
];

for (const filePath of targets) {
  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let changed = false;
  for (const [oldText, newText] of replacements) {
    if (html.includes(newText)) continue;
    if (!html.includes(oldText)) {
      throw new Error(`Missing expected block in ${filePath}:\n${oldText.slice(0, 120)}...`);
    }
    html = html.replace(oldText, newText);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
    console.log(`Patched ${filePath}`);
  } else {
    console.log(`Already patched ${filePath}`);
  }
}
