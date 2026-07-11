/**
 * Derive teach grounding hints from CSV column P (explanation_text).
 */
const {
  getCsvSolutionForQuestion,
  stripSolutionPrefix,
  parseCorrectFromSolution,
} = require("./pmp-csv-solutions");

const EXCLUDE_MARKER =
  /the other (?:answer choices|options) (?:are|is) incorrect\.?\s*/i;

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function splitCsvSolutionParts(explanationText) {
  const body = stripSolutionPrefix(explanationText);
  const m = body.match(EXCLUDE_MARKER);
  if (!m) {
    return { whyPart: body.trim(), excludePart: "" };
  }
  const idx = body.search(EXCLUDE_MARKER);
  return {
    whyPart: body.slice(0, idx).trim(),
    excludePart: body.slice(idx + m[0].length).trim(),
  };
}

function optionMatchScore(optionText, sentence) {
  const opt = String(optionText || "").toLowerCase();
  const sent = String(sentence || "").toLowerCase();
  if (!opt || !sent) return 0;
  const words = opt.split(/\s+/).filter((w) => w.length > 3);
  if (!words.length) return 0;
  let hits = 0;
  for (const w of words.slice(0, 6)) {
    if (sent.includes(w)) hits++;
  }
  return hits / Math.min(words.length, 6);
}

function splitExcludeSentences(excludePart) {
  return String(excludePart || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function buildExcludeReasonsFromCsv(q, explanationText) {
  const { excludePart } = splitCsvSolutionParts(explanationText);
  if (!excludePart) return {};

  const correctKeys = parseCorrectKeys(q.correct);
  const wrongOpts = (q.options || []).filter((o) => !correctKeys.includes(o.key));
  const sentences = splitExcludeSentences(excludePart);
  const reasons = {};
  const used = new Set();

  for (const o of wrongOpts) {
    let best = { score: 0, sentence: "" };
    for (const sent of sentences) {
      if (used.has(sent)) continue;
      const score = optionMatchScore(o.text, sent);
      if (score > best.score) best = { score, sentence: sent };
    }
    if (best.score >= 0.34 && best.sentence) {
      reasons[o.key] = best.sentence.replace(/\s+/g, " ").trim();
      used.add(best.sentence);
    }
  }

  const unmatched = wrongOpts.filter((o) => !reasons[o.key]);
  const remaining = sentences.filter((s) => !used.has(s));
  unmatched.forEach((o, i) => {
    if (remaining[i]) reasons[o.key] = remaining[i].replace(/\s+/g, " ").trim();
  });

  return reasons;
}

function buildWhyBulletsFromCsv(q, explanationText, correctKey) {
  const { whyPart } = splitCsvSolutionParts(explanationText);
  if (!whyPart) return [];

  const verbatim = whyPart.replace(/\s+/g, " ").trim();
  return verbatim ? [verbatim] : [];
}

function buildWhyCorrectFromCsv(explanationText) {
  const { whyPart } = splitCsvSolutionParts(explanationText);
  return whyPart.replace(/\s+/g, " ").trim();
}

function mergeCsvGrounding(q, entry, analysis) {
  const row = getCsvSolutionForQuestion(q);
  if (!row?.explanationText) return entry;

  const correctKeys = parseCorrectKeys(q.correct);
  const correctKey = correctKeys[0] || q.correct;
  const csvCorrect = parseCorrectFromSolution(row.explanationText);
  if (csvCorrect && correctKeys.length === 1 && csvCorrect !== correctKey) {
    return entry;
  }

  const whyBullets = buildWhyBulletsFromCsv(q, row.explanationText, correctKey);
  const excludeFromCsv = buildExcludeReasonsFromCsv(q, row.explanationText);
  const mergedExclude = { ...entry.excludeReasons };
  for (const [k, v] of Object.entries(excludeFromCsv)) {
    if (v) mergedExclude[k] = v;
  }

  return {
    ...entry,
    sourceSolution: row.explanationText,
    whyCorrect: buildWhyCorrectFromCsv(row.explanationText) || entry.whyCorrect,
    whyBullets: whyBullets.length ? whyBullets : entry.whyBullets,
    excludeReasons: mergedExclude,
  };
}

module.exports = {
  splitCsvSolutionParts,
  buildExcludeReasonsFromCsv,
  buildWhyBulletsFromCsv,
  buildWhyCorrectFromCsv,
  mergeCsvGrounding,
};
