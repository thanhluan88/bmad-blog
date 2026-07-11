/**
 * Derive teach grounding hints from CSV column P (explanation_text).
 */
const {
  getCsvSolutionForQuestion,
  stripSolutionPrefix,
  parseCorrectFromSolution,
} = require("./pmp-csv-solutions");

const EXCLUDE_MARKERS = [
  /the other (?:answer choices|options) (?:are|is) incorrect\.?\s*/i,
  /all other (?:answer choices|options) (?:are|is) incorrect\.?\s*/i,
];

function findExcludeSplit(body) {
  let best = { idx: -1, len: 0 };
  for (const re of EXCLUDE_MARKERS) {
    const m = body.match(re);
    if (!m) continue;
    const idx = body.search(re);
    if (idx >= 0 && (best.idx < 0 || idx < best.idx)) {
      best = { idx, len: m[0].length };
    }
  }
  return best;
}

function splitCsvSolutionParts(explanationText) {
  const body = stripSolutionPrefix(explanationText);
  const split = findExcludeSplit(body);
  if (split.idx < 0) {
    return { whyPart: body.trim(), excludePart: "" };
  }
  return {
    whyPart: body.slice(0, split.idx).trim(),
    excludePart: body.slice(split.idx + split.len).trim(),
  };
}

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
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
    if (best.score >= 0.2 && best.sentence) {
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

function trimSentence(text, max = 220) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function splitWhySentences(whyPart) {
  return String(whyPart || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function cleanGuideProse(text) {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  t = t.replace(/^\d+(?:\.\d+)+\s+/, "");
  const dup = t.match(/^(.{12,80}?)\s+\1\b/i);
  if (dup) t = t.slice(dup[1].length).trim();
  return t;
}

function trimExcerpt(excerpt, max = 180) {
  let t = cleanGuideProse(excerpt);
  if (!t) return "";
  if (/^licensed to\b/i.test(t) || /^figure\s+\d/i.test(t)) return "";

  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && /^[A-Z0-9(]/.test(s) && /[.!?]$/.test(s));
  if (sentences.length) {
    let out = sentences[0];
    if (out.length < 80 && sentences[1] && out.length + sentences[1].length + 1 <= max) {
      out = `${out} ${sentences[1]}`;
    }
    return out.length <= max ? out : `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
  }

  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastDot = cut.lastIndexOf(".");
  return lastDot > 40 ? cut.slice(0, lastDot + 1) : `${cut}…`;
}

const STEM_QUESTION_MARKERS = [
  /\bwhat should the project manager\b/i,
  /\bwhat is the (?:best|most appropriate)\b/i,
  /\bwhich of the following\b/i,
  /\bhow should the project manager\b/i,
  /\bwhat would be the best\b/i,
  /\bwhat is the first\b/i,
];

/** Stem situation for chain bullet 1 — never the correct answer or column P why. */
function extractStemScenario(stem, signalPhrases = []) {
  let text = String(stem || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  for (const re of STEM_QUESTION_MARKERS) {
    const idx = text.search(re);
    if (idx > 30) {
      text = text.slice(0, idx).trim();
      break;
    }
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  let scenario = sentences[0] || text;

  if (scenario.length > 220 && signalPhrases.length >= 2) {
    scenario = `The situation involves ${signalPhrases.slice(0, 2).join(" and ")}.`;
  } else if (scenario.length > 220) {
    scenario = trimSentence(scenario, 200);
  }

  return scenario;
}

function scoreHitForWhy(hit, whyPart, stem = "") {
  const why = String(whyPart).toLowerCase();
  const stemLower = String(stem).toLowerCase();
  const blob = `${hit.topic || ""} ${hit.excerpt || ""}`.toLowerCase();
  const words = [...new Set(why.split(/\W+/).filter((w) => w.length > 4))].slice(0, 24);
  let score = 0;
  for (const w of words) {
    if (blob.includes(w)) score++;
  }
  const bridgeTerms = [
    "continuous feedback",
    "early feedback",
    "feedback on features",
    "continuous improvement",
    "risk register",
    "identified risk",
    "agile",
    "collaborat",
    "teamwork",
    "team building",
  ];
  for (const term of bridgeTerms) {
    if (stemLower.includes(term) && blob.includes(term)) score += 5;
    if (why.includes(term) && blob.includes(term)) score += 3;
  }
  if (/^\d+\s/.test(hit.excerpt || "")) score -= 1;
  if ((hit.excerpt || "").length < 40) score -= 2;
  return score;
}

function pickChainHit(guideHits, whyPart, stem = "") {
  if (!guideHits?.length) return null;
  let best = guideHits[0];
  let bestScore = -Infinity;
  for (const h of guideHits) {
    const s = scoreHitForWhy(h, whyPart, stem);
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }
  return best;
}

function buildBridgeClause({ scenario, excerpt, whyPart }) {
  const blob = `${scenario} ${excerpt} ${whyPart}`.toLowerCase();
  if (/continuous feedback|feedback on features|user stories|early feedback|feedback cycle/i.test(blob)) {
    return "so collaborative teamwork enables the feedback loops that improve quality, countering the belief that working alone is faster or higher quality";
  }
  if (/continuous improvement/i.test(blob)) {
    return "so team-based iteration drives improvement and better outcomes rather than slowing delivery";
  }
  if (/risk register|identified risk|monitor risk|undocumented risk/i.test(blob)) {
    return "so newly identified risks must be formally captured and assessed before they affect schedule or cost";
  }
  if (/stakeholder engagement|mutual trust|empowered culture/i.test(blob)) {
    return "so the PM must address the relationship directly with transparency before escalating or assigning blame";
  }
  if (/change request|integrated change control/i.test(blob)) {
    return "so the scope or plan change must follow the formal change process rather than informal workarounds";
  }
  return "which is why this PMBOK guidance applies directly to the stem and supports the correct PM action";
}

/** PMBOK reasoning chain: stem scenario → p.{page} prose + bridge → therefore correctKey */
function buildWhyChainBullets({ stem, signalPhrases, whyPart, correctKey, guideHits }) {
  const hit = pickChainHit(guideHits, whyPart, stem);
  const sentences = splitWhySentences(whyPart);
  const bullets = [];

  const scenario = extractStemScenario(stem, signalPhrases);
  if (scenario) bullets.push(`Scenario: ${scenario}`);

  if (hit?.page && hit?.excerpt) {
    const topic = hit.topic || "PMBOK 8";
    const excerpt = trimExcerpt(hit.excerpt);
    if (excerpt) {
      const bridge = buildBridgeClause({ scenario, excerpt, whyPart });
      bullets.push(`PMBOK 8, p. ${hit.page} (${topic}): ${excerpt} — ${bridge}.`);
    }
  }

  let tail =
    sentences.find((s, i) => i > 0 && !/^therefore\b/i.test(s)) ||
    sentences[sentences.length - 1] ||
    sentences[0] ||
    "this is the PM action that best fits the scenario and PMBOK 8 guidance.";
  tail = tail.replace(/^therefore\s+/i, "");
  bullets.push(`Therefore ${correctKey} is correct: ${trimSentence(tail)}`);

  return bullets.filter(Boolean).slice(0, 3);
}

function buildWhySolutionBullets(whyPart, correctKey) {
  const sentences = splitWhySentences(whyPart);
  if (!sentences.length) return [];

  const bullets = [];
  const first = sentences[0].replace(/^[A-Z]\.\s*/i, "").trim();
  if (first) bullets.push(trimSentence(`${correctKey}. ${first}`, 280));
  if (sentences[1] && sentences[1].length > 30) {
    bullets.push(trimSentence(sentences[1], 280));
  }
  return bullets.slice(0, 2);
}

function buildWhyCorrectFromCsv(explanationText) {
  const { whyPart } = splitCsvSolutionParts(explanationText);
  return whyPart.replace(/\s+/g, " ").trim();
}

function hasVietnamese(text) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    String(text || ""),
  );
}

function englishExcludeFallback(opt, correctOpt) {
  const wrong = opt.text.slice(0, 95).trim();
  const right = correctOpt.text.slice(0, 95).trim();
  return `Option ${opt.key} (${wrong}) does not resolve the stem focus — ${correctOpt.key} (${right}) is the PMBOK-aligned action.`;
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

  const excludeFromCsv = buildExcludeReasonsFromCsv(q, row.explanationText);
  const wrongOpts = (q.options || []).filter((o) => !correctKeys.includes(o.key));
  const correctOpt =
    (q.options || []).find((o) => correctKeys.includes(o.key)) ||
    (analysis?.optionAnalysis || []).find((o) => o.isCorrect);
  const excludeReasons = {};
  for (const o of wrongOpts) {
    if (excludeFromCsv[o.key]) {
      excludeReasons[o.key] = excludeFromCsv[o.key];
      continue;
    }
    const prev = entry.excludeReasons?.[o.key] || "";
    if (prev && !hasVietnamese(prev)) {
      excludeReasons[o.key] = prev;
    } else if (correctOpt) {
      excludeReasons[o.key] = englishExcludeFallback(o, correctOpt);
    } else {
      excludeReasons[o.key] = prev || `Option ${o.key} is not the best PMBOK 8 match for this stem.`;
    }
  }

  const whyCorrect = buildWhyCorrectFromCsv(row.explanationText) || entry.whyCorrect;
  const { whyPart } = splitCsvSolutionParts(row.explanationText);
  const whySolutionBullets = buildWhySolutionBullets(whyPart, correctKey);

  return {
    ...entry,
    sourceSolution: row.explanationText,
    whyCorrect,
    whySolutionBullets,
    whyBullets: entry.whyBullets,
    excludeReasons,
  };
}

module.exports = {
  splitCsvSolutionParts,
  buildExcludeReasonsFromCsv,
  buildWhyBulletsFromCsv,
  buildWhyCorrectFromCsv,
  buildWhyChainBullets,
  buildWhySolutionBullets,
  pickChainHit,
  buildBridgeClause,
  extractStemScenario,
  mergeCsvGrounding,
};
