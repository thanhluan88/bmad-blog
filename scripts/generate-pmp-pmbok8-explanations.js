const fs = require("fs");
const path = require("path");
const { generateBatch } = require("./lib/pmp-pmbok8-generator");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-pmbok8-explanations.json");

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const out = generateBatch(questions);
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Generated PMBOK 8 explanations for ${questions.length} questions → ${OUT_PATH}`);
}

main();
