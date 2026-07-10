/**
 * Regenerate Exam Latest PMBOK 8 data using teach skill grounding, then rebuild HTML.
 * Usage: node scripts/generate-pmp-exam-latest-from-teach.js [--skip-bootstrap]
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
  EXAM_LATEST_STORE_PATH,
  setActiveTeachSignalsStore,
  STORE_PATH,
} = require("./lib/pmp-teach-signals-store");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-pmbok8-explanations.json");
const skipBootstrap = process.argv.includes("--skip-bootstrap");

function main() {
  if (!fs.existsSync(QUESTIONS_PATH)) {
    throw new Error(`Missing ${QUESTIONS_PATH}. Run node scripts/build-pmp-exam-latest.js first.`);
  }

  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  setActiveTeachSignalsStore(EXAM_LATEST_STORE_PATH);

  if (!skipBootstrap) {
    console.log("Bootstrapping exam-latest teach signals…");
    const boot = bootstrapTeachSignalsStore({
      questionsPath: QUESTIONS_PATH,
      storePath: EXAM_LATEST_STORE_PATH,
    });
    console.log(
      `Bootstrap: ${boot.pass}/${boot.questions} pass (${boot.added} updated, ${boot.kept} kept)`,
    );
    if (boot.failIds.length) {
      console.warn(`Incomplete signal store IDs: ${boot.failIds.slice(0, 15).join(", ")}…`);
    }
  }

  loadCacheFile();
  const warm = warmupPageCache(collectMetaForWarmup(questions));
  console.log(`RAG page cache: ${warm.total} unique queries, warmed ${warm.warmed}`);

  const out = {};
  let written = 0;
  let incomplete = 0;
  const incompleteIds = [];

  for (const q of questions) {
    if (q.type === "drag_drop") {
      out[String(q.id)] = generateForQuestion(q, { preserveOriginal: false });
      written++;
      continue;
    }

    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    const validation = validateTeachGrounding(q, analysis);
    if (!validation.ok) {
      incomplete++;
      incompleteIds.push(q.id);
      out[String(q.id)] = generateForQuestion(q, { preserveOriginal: false });
      continue;
    }
    out[String(q.id)] = buildTeachExplanationMarkdown(q, analysis);
    written++;
    if (written % 200 === 0) console.log(`  … ${written} teach explanations`);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${OUT_PATH} (${written} teach-style, ${incomplete} fallback)`);
  if (incompleteIds.length) {
    console.log(
      `Incomplete: ${incompleteIds.slice(0, 20).join(", ")}${incompleteIds.length > 20 ? ` … +${incompleteIds.length - 20}` : ""}`,
    );
  }

  console.log("Rebuilding pmp-exam-latest.html…");
  execSync("node scripts/build-pmp-exam-latest.js", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });

  setActiveTeachSignalsStore(STORE_PATH);
  console.log("Done.");
}

main();
