/**
 * Regenerate Full Bank PMBOK 8 explanations from teach grounding, then rebuild quiz HTML.
 * Usage: node scripts/generate-pmp-full-from-teach.js [--skip-bootstrap]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
  generateTeachAnalysis,
  generateForQuestion,
  collectMetaForWarmup,
} = require("./lib/pmp-pmbok8-generator");
const { loadCacheFile, warmupPageCache } = require("./lib/pmp-pmbok8-rag-pages");
const {
  validateTeachGrounding,
  buildTeachExplanationMarkdown,
} = require("./lib/pmp-teach-colocation-style");
const { bootstrapTeachSignalsStore } = require("./lib/bootstrap-teach-signals");
const {
  STORE_PATH,
  setActiveTeachSignalsStore,
} = require("./lib/pmp-teach-signals-store");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.json");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-full-pmbok8-explanations.json");
const skipBootstrap = process.argv.includes("--skip-bootstrap");

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  setActiveTeachSignalsStore(STORE_PATH);

  if (!skipBootstrap) {
    console.log("Bootstrapping full-bank teach signals…");
    const boot = bootstrapTeachSignalsStore({
      questionsPath: QUESTIONS_PATH,
      storePath: STORE_PATH,
    });
    console.log(
      `Bootstrap: ${boot.pass}/${boot.questions} pass (${boot.added} updated, ${boot.kept} kept)`,
    );
  }

  loadCacheFile();
  const warm = warmupPageCache(collectMetaForWarmup(questions));
  console.log(`RAG page cache: ${warm.total} unique queries, warmed ${warm.warmed}`);

  const out = {};
  let teachStyle = 0;
  let fallback = 0;

  for (const q of questions) {
    if (q.type === "drag_drop") {
      out[String(q.id)] = generateForQuestion(q, { preserveOriginal: false });
      teachStyle++;
      continue;
    }

    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    if (validateTeachGrounding(q, analysis).ok) {
      out[String(q.id)] = buildTeachExplanationMarkdown(q, analysis);
      teachStyle++;
    } else {
      out[String(q.id)] = generateForQuestion(q, { preserveOriginal: false });
      fallback++;
    }
    if (teachStyle % 200 === 0 && teachStyle > 0) console.log(`  … ${teachStyle}`);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${OUT_PATH} (${teachStyle} teach-style, ${fallback} fallback)`);

  console.log("Rebuilding pmp-full-questions.html…");
  execSync("node scripts/build-pmp-full-questions.js", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("Done.");
}

main();
