const fs = require("fs");
const path = require("path");
const { generateBatch, collectMetaForWarmup } = require("./lib/pmp-pmbok8-generator");
const { loadCacheFile, warmupPageCache } = require("./lib/pmp-pmbok8-rag-pages");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-pmbok8-explanations.json");

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  loadCacheFile();
  const queries = collectMetaForWarmup(questions);
  const warm = warmupPageCache(queries);
  console.log(`RAG page cache: ${warm.total} unique queries, warmed ${warm.warmed}`);
  const out = generateBatch(questions);
  const withPages = Object.values(out).filter((e) => e.pmbok8?.pages?.length).length;
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(
    `Generated PMBOK 8 explanations for ${questions.length} questions (${withPages} with PDF pages) → ${OUT_PATH}`,
  );
}

main();
