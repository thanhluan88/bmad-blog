/**
 * Bootstrap data/pmp-exam-latest-teach-signals.json for Exam Latest (skill step 6).
 */
const path = require("path");
const { bootstrapTeachSignalsStore } = require("./lib/bootstrap-teach-signals");
const { EXAM_LATEST_STORE_PATH } = require("./lib/pmp-teach-signals-store");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");

const result = bootstrapTeachSignalsStore({
  questionsPath: QUESTIONS_PATH,
  storePath: EXAM_LATEST_STORE_PATH,
  useCsvSolutions: false,
});

console.log(`Store: ${result.storePath}`);
console.log(`Entries added/updated: ${result.added}, kept valid: ${result.kept}`);
console.log(`Validation after bootstrap: ${result.pass}/${result.questions} pass`);
if (result.failIds.length) {
  console.log(
    `Still failing: ${result.failIds.slice(0, 20).join(", ")}${result.failIds.length > 20 ? ` … +${result.failIds.length - 20}` : ""}`,
  );
}
