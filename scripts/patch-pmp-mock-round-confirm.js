const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const INSERT_BLOCK = `    function countFreshExamQuestions() {
      const stats = loadQuestionStats();
      return QUESTIONS.filter(q => (stats[String(q.id)]?.attempts || 0) === 0).length;
    }

    function confirmMockExamRoundIfNeeded() {
      const fresh = countFreshExamQuestions();
      if (fresh >= MOCK_EXAM_SIZE) return true;
      return confirm(
        \`Đã hết 1 round, chỉ còn \${fresh} câu hỏi, bạn có muốn tiếp tục không?\`,
      );
    }

`;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

  if (!html.includes("function countFreshExamQuestions")) {
    const anchor = "    function pickExamQuestions(count) {";
    if (!html.includes(anchor)) {
      throw new Error(`pickExamQuestions anchor not found in ${filePath}`);
    }
    html = html.replace(anchor, INSERT_BLOCK + anchor);
  }

  if (!html.includes("if (!force && !confirmMockExamRoundIfNeeded())")) {
    const startOld = /      if \(!force && !confirm\(`Bắt đầu thi thử \$\{MOCK_EXAM_SIZE\} câu \/ \$\{MOCK_EXAM_SECONDS \/ 60\} phút\?`\)\) return;\n      if \(QUESTIONS\.length < MOCK_EXAM_SIZE\) \{/;
    if (!startOld.test(html)) {
      throw new Error(`startMockExam anchor not found in ${filePath}`);
    }
    html = html.replace(
      startOld,
      `      if (!force && !confirm(\`Bắt đầu thi thử \${MOCK_EXAM_SIZE} câu / \${MOCK_EXAM_SECONDS / 60} phút?\`)) return;
      if (!force && !confirmMockExamRoundIfNeeded()) return;
      if (QUESTIONS.length < MOCK_EXAM_SIZE) {`,
    );
  }

  fs.writeFileSync(filePath, html);
  console.log("Patched:", path.basename(filePath));
}
