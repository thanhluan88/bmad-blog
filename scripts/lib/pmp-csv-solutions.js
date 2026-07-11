/**
 * Reference solutions from all_questions_flat CSV (column P = explanation_text).
 */
const fs = require("fs");
const path = require("path");

const DEFAULT_CSV_PATH = path.join(__dirname, "..", "..", "all_questions_flat 1.csv");

let cache = null;
let cachePath = null;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function normalizeStem(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripSolutionPrefix(text) {
  return String(text || "")
    .replace(/^Solution:\s*/i, "")
    .replace(/^Explanation:\s*/i, "")
    .trim();
}

function parseCorrectFromSolution(text) {
  const m = String(text || "").match(/^Solution:\s*([A-F])\./i);
  return m ? m[1].toUpperCase() : "";
}

/**
 * @returns {Map<string, { explanationText: string, questionText: string, correctAnswer: string, questionId: string, externalId: string }>}
 */
function parseCsvFile(csvPath = DEFAULT_CSV_PATH) {
  if (cache && cachePath === csvPath) return cache;

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const col = (name) => header.indexOf(name);

  const byStem = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const questionText = cols[col("question_text")] || "";
    const explanationText = cols[col("explanation_text")] || "";
    if (!questionText.trim()) continue;

    const entry = {
      questionId: cols[col("question_id")] || "",
      externalId: cols[col("external_id")] || "",
      questionText,
      explanationText,
      correctAnswer: cols[col("correct_answer")] || "",
      solutionBody: stripSolutionPrefix(explanationText),
    };
    byStem.set(normalizeStem(questionText), entry);
  }

  cachePath = csvPath;
  cache = byStem;
  return byStem;
}

function getCsvSolutionForQuestion(q, csvPath) {
  const map = parseCsvFile(csvPath);
  const stem = normalizeStem(q?.text);
  if (!stem) return null;
  return map.get(stem) || null;
}

function getCsvSolutionText(q, csvPath) {
  const row = getCsvSolutionForQuestion(q, csvPath);
  return row?.explanationText || "";
}

function getCsvSolutionBody(q, csvPath) {
  const row = getCsvSolutionForQuestion(q, csvPath);
  return row?.solutionBody || "";
}

function csvSolutionStats(questions, csvPath) {
  const map = parseCsvFile(csvPath);
  let matched = 0;
  const missing = [];
  for (const q of questions) {
    if (map.has(normalizeStem(q.text))) matched++;
    else missing.push(q.id);
  }
  return { total: questions.length, matched, missing };
}

function resetCsvSolutionsCache() {
  cache = null;
  cachePath = null;
}

module.exports = {
  DEFAULT_CSV_PATH,
  parseCsvFile,
  getCsvSolutionForQuestion,
  getCsvSolutionText,
  getCsvSolutionBody,
  parseCorrectFromSolution,
  stripSolutionPrefix,
  csvSolutionStats,
  resetCsvSolutionsCache,
};
