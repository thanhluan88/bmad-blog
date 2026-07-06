const fs = require("fs");
const path = require("path");
const {
  readQuestionsFromHtml,
  writeQuestionsToHtml,
  mergePmbok8IntoQuestions,
} = require("./lib/pmp-html-questions");

const HTML_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.html");
const JSON_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.json");
const EXPLANATIONS_PATH = path.join(__dirname, "..", "data", "pmp-full-pmbok8-explanations.json");

function main() {
  if (!fs.existsSync(EXPLANATIONS_PATH)) {
    throw new Error(`Missing ${EXPLANATIONS_PATH}. Run generate-pmp-full-pmbok8-explanations.js first.`);
  }

  const explanations = JSON.parse(fs.readFileSync(EXPLANATIONS_PATH, "utf8"));
  const questions = readQuestionsFromHtml(HTML_PATH);
  const merged = mergePmbok8IntoQuestions(questions, explanations);

  const withP8 = merged.filter((q) => q.pmbok8).length;
  const rich = merged.filter((q) => q.explanation?.includes("**PMBOK 8 mapping**")).length;

  writeQuestionsToHtml(HTML_PATH, merged);
  fs.writeFileSync(JSON_PATH, JSON.stringify(merged));

  let html = fs.readFileSync(HTML_PATH, "utf8");
  const subtitle =
    `Bộ gốc — ${merged.length} câu — giải thích theo <strong>PMBOK 8</strong>. Chọn đáp án rồi nhấn <strong>Kiểm tra</strong> để xem phân tích.`;
  html = html.replace(
    /<p>Tài liệu luyện tập trắc nghiệm[\s\S]*?<\/p>/,
    `<p>${subtitle}</p>`,
  );
  html = html.replace(
    /<p>ExamTopics[\s\S]*?<\/p>/,
    `<p>${subtitle}</p>`,
  );
  fs.writeFileSync(HTML_PATH, html);

  console.log(`Injected PMBOK 8 into ${HTML_PATH}: ${withP8} mapped, ${rich} rich explanations`);
}

main();
