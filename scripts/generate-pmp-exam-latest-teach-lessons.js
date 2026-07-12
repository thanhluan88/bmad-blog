/**
 * Generate teach lessons for Exam Latest (1417 câu).
 * Usage: node scripts/generate-pmp-exam-latest-teach-lessons.js [--force] [--from=N] [--to=N]
 */
const { execSync } = require("child_process");
const path = require("path");

const extra = process.argv.slice(2).filter((a) => !a.startsWith("--bank="));
const cmd = `node scripts/generate-pmp-full-teach-lessons.js --bank=latest ${extra.join(" ")}`.trim();

execSync(cmd, {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});
