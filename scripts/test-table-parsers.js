function parseScheduleFragmentTable(text) {
  const headerRe =
    /ID\s+Activity\s+Predecessor\(s\)\s+Original\s+Duration\s*\(days\)\s+Original\s+Finish\s+Notes/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(A key stakeholder[\s\S]*)$/i) ||
    body.match(/\s+(What should[\s\S]*)$/i) ||
    body.match(/\s+(The project manager[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe =
    /([A-Z])\s+(.+?)\s+([\u2212\-]|(?:[A-Z](?:,\s*[A-Z])*))\s+(\d+)\s+(Day\s+\d+)\s+(.+?)(?=\s+[A-Z]\s+[A-Za-z]|$)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    rows.push({
      id: match[1],
      activity: match[2].trim(),
      predecessor: match[3].trim(),
      duration: match[4],
      finish: match[5].trim(),
      notes: match[6].trim(),
    });
  }

  if (rows.length === 0) return null;
  return {
    kind: "schedule_fragment",
    intro,
    questionPrompt,
    caption: "Schedule fragment",
    columns: [
      "ID",
      "Activity",
      "Predecessor(s)",
      "Duration (days)",
      "Original Finish",
      "Notes",
    ],
    rows: rows.map((row) => [
      row.id,
      row.activity,
      row.predecessor,
      row.duration,
      row.finish,
      row.notes,
    ]),
  };
}

function parseTaskDurationTable(text) {
  const headerRe = /Task\s+Duration\s+Start\s+Predecessor\(s\)/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch = body.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe =
    /([A-Z])\s+(\d+\s+days)\s+(.+?)(?=\s+[A-Z]\s+\d+\s+days|\s+What\s+is|$)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    const rest = match[3].trim();
    if (rest.startsWith("Project start")) {
      rows.push([
        match[1],
        match[2],
        "Project start",
        rest.includes("None") ? "None" : "—",
      ]);
    } else {
      rows.push([match[1], match[2], rest, "—"]);
    }
  }

  if (rows.length === 0) return null;
  return {
    kind: "task_duration",
    intro,
    questionPrompt,
    caption: "Activities and durations",
    columns: ["Task", "Duration", "Start", "Predecessor(s)"],
    rows,
  };
}

function parseWorkPackageEvTable(text) {
  const headerRe =
    /Work Package\s+Planned Value\s*\(PV\)\s+Earned Value\s*\(P[V E]\)/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const intro = text.slice(0, headerMatch.index).trim();
  const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
  const promptMatch =
    body.match(/\s+(Based on[\s\S]*)$/i) ||
    body.match(/\s+(What[\s\S]*)$/i);
  const tableBody = promptMatch
    ? body.slice(0, body.length - promptMatch[0].length).trim()
    : body;
  const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

  const rowRe = /([A-Za-z][A-Za-z\s]*?)\s+([\d,]+)\s+([\d,]+)/g;
  const rows = [];
  let match;
  while ((match = rowRe.exec(tableBody)) !== null) {
    const name = match[1].trim();
    if (/work package|planned value|earned value/i.test(name)) continue;
    rows.push([name, match[2], match[3]]);
  }

  if (rows.length === 0) return null;
  return {
    kind: "work_package_ev",
    intro,
    questionPrompt,
    caption: "Work package performance (USD)",
    columns: ["Work Package", "Planned Value (PV)", "Earned Value (EV)"],
    rows,
  };
}

function parseEmbeddedTable(text) {
  return (
    parseWeightedScoringTable(text) ||
    parseScheduleFragmentTable(text) ||
    parseTaskDurationTable(text) ||
    parseWorkPackageEvTable(text)
  );
}

function parseWeightedScoringTable(text) {
  const marker = "Weighted Scoring Model";
  const start = text.indexOf(marker);
  if (start < 0) return null;
  const section = text.slice(start);
  const questionMatch = section.match(/\s+(What should[\s\S]*)$/i);
  if (!questionMatch) return null;
  const questionPrompt = questionMatch[1].trim();
  const tablePart = section.slice(marker.length, section.length - questionMatch[0].length);
  const headerMatch = tablePart.match(/Criteria\s+Weight\s+((?:Project\s+\d+\s*)+)/i);
  if (!headerMatch) return null;
  const projects = [...headerMatch[1].matchAll(/Project\s+(\d+)/gi)].map(
    (m) => `Project ${m[1]}`,
  );
  const numCols = 1 + projects.length;
  const criteriaList = [
    "Supports key business objectives",
    "Uses standard technology",
    "Can be completed within project timeframe",
    "Provides positive NPV",
  ];
  const bodyAfterHeader = tablePart
    .replace(/Criteria\s+Weight\s+(?:Project\s+\d+\s*)+/i, "")
    .trim();
  const rows = [];
  for (const criterion of criteriaList) {
    const pos = bodyAfterHeader.indexOf(criterion);
    if (pos < 0) continue;
    const after = bodyAfterHeader.slice(pos + criterion.length).trim();
    const numMatch = after.match(/^(\d+(?:\s+\d+){0,10})/);
    if (!numMatch) continue;
    const nums = numMatch[1].trim().split(/\s+/).map(Number);
    if (nums.length !== numCols) continue;
    rows.push([criterion, String(nums[0]), ...nums.slice(1).map(String)]);
  }
  if (rows.length === 0) return null;
  return {
    kind: "weighted_scoring",
    intro: text.slice(0, start).trim(),
    questionPrompt,
    caption: "Weighted Scoring Model",
    columns: ["Criteria", "Weight", ...projects],
    rows,
  };
}

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

for (const id of [219, 626, 629, 441, 627]) {
  const q = qs.find((x) => x.id === id);
  const table = parseEmbeddedTable(q.text);
  console.log("\nQ" + id, table ? table.kind : "NO TABLE");
  if (table) {
    console.log("columns", table.columns);
    console.log("rows", table.rows);
    console.log("prompt", table.questionPrompt?.slice(0, 80));
  }
}

const all = qs
  .map((q) => ({ id: q.id, table: parseEmbeddedTable(q.text) }))
  .filter((x) => x.table);
console.log("\nAll table questions:", all.map((x) => `Q${x.id}:${x.table.kind}`).join(", "));
