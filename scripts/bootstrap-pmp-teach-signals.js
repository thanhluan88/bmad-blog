/**
 * Bootstrap data/pmp-teach-signals.json for Full Bank teach lessons (skill step 6).
 */
const path = require("path");
const { bootstrapTeachSignalsStore } = require("./lib/bootstrap-teach-signals");
const { STORE_PATH } = require("./lib/pmp-teach-signals-store");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.json");

const result = bootstrapTeachSignalsStore({
  questionsPath: QUESTIONS_PATH,
  storePath: STORE_PATH,
});

console.log(`Store: ${result.storePath}`);
console.log(`CSV solutions matched: ${result.csvStats.matched}/${result.csvStats.total}`);
console.log(`Entries added/updated: ${result.added}, kept valid: ${result.kept}`);
console.log(`Validation after bootstrap: ${result.pass}/${result.questions} pass`);
if (result.failIds.length) {
  console.log(
    `Still failing: ${result.failIds.slice(0, 20).join(", ")}${result.failIds.length > 20 ? ` … +${result.failIds.length - 20}` : ""}`,
  );
}
