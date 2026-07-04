const fs = require("fs");
const path = require("path");
const { generateBatch } = require("./lib/pmp-pmbok8-generator");
const { readQuestionsFromHtml } = require("./lib/pmp-html-questions");

const HTML_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.html");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-full-pmbok8-explanations.json");
const JSON_CACHE = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.json");

function main() {
  const questions = readQuestionsFromHtml(HTML_PATH);
  const out = generateBatch(questions, { preserveOriginal: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  fs.writeFileSync(JSON_CACHE, JSON.stringify(questions, null, 0));
  console.log(`Generated PMBOK 8 explanations for ${questions.length} full questions → ${OUT_PATH}`);
}

main();
