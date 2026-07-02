const fs = require("fs");
const path = require("path");

function extractQuestionsArray(source) {
  const marker = "const QUESTIONS = ";
  const start = source.indexOf(marker);
  let i = start + marker.length;
  while (source[i] === " ") i += 1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(i, j + 1));
    }
  }
  throw new Error("bad array");
}

const qs = extractQuestionsArray(
  fs.readFileSync(path.join(__dirname, "../public/pmp/pmp-full-questions.html"), "utf8"),
);

const patterns = [
  { name: "weighted_scoring", re: /Weighted Scoring Model/i },
  { name: "schedule_id_activity", re: /ID\s+Activity\s+Predecessor/i },
  { name: "schedule_activity_duration", re: /Activity\s+Duration\s+Predecessor/i },
  { name: "task_duration_start_finish", re: /Task\s+Duration\s+Start\s+Finish/i },
  { name: "table_like_day", re: /Day\s+\d+\s+Day\s+\d+/ },
];

for (const p of patterns) {
  const hits = qs.filter((q) => p.re.test(q.text || ""));
  console.log(`\n${p.name}: ${hits.length}`);
  hits.forEach((q) => {
    const text = (q.text || "").replace(/\s+/g, " ");
    const idx = text.search(p.re);
    console.log(`  Q${q.id}: ...${text.slice(Math.max(0, idx - 20), idx + 100)}...`);
  });
}

const keys = [
  "Original Duration",
  "Predecessor(s)",
  "Original Finish",
  "schedule fragment",
  "simplified schedule",
  "the following table",
  "shown in the table",
];

console.log("\nKeyword hits:");
for (const k of keys) {
  const hits = qs.filter((q) => (q.text || "").includes(k));
  if (hits.length) console.log(`  ${k}: ${hits.map((q) => `Q${q.id}`).join(", ")}`);
}

const extraPatterns = [
  [/Work Package/i, "work_package_table"],
  [/Site Preparation/i, "site_prep_table"],
  [/Task\s+Duration\s+Start/i, "task_duration_start"],
  [/Below is a list of project activities/i, "activities_list"],
  [/RACI/i, "raci"],
  [/Earned Value.*Planned Value|Planned Value.*Earned Value/is, "ev_table"],
  [/Project\s+1\s+Project\s+2\s+Project\s+3/i, "project_cols"],
];

const phraseHits = [
  "summary table",
  "following table",
  "values in USD",
  "the table below",
  "shown below",
  "list of project activities",
  "schedule fragment",
];

console.log("\nPhrase hits:");
for (const phrase of phraseHits) {
  const hits = qs.filter((q) => (q.text || "").toLowerCase().includes(phrase));
  if (hits.length) console.log(`  ${phrase}: ${hits.map((q) => `Q${q.id}`).join(", ")}`);
}
