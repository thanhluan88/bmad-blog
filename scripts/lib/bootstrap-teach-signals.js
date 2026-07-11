/**
 * Shared bootstrap for teach grounding stores (skill step 6).
 */
const fs = require("fs");
const path = require("path");
const { generateTeachAnalysis } = require("./pmp-pmbok8-generator");
const {
  validateTeachGrounding,
  filterWhyBulletsForCorrect,
} = require("./pmp-teach-colocation-style");
const { resetTeachSignalsCache, setActiveTeachSignalsStore } = require("./pmp-teach-signals-store");
const {
  matchStemProfile,
  extractStemIssues,
  inferWrongReason,
} = require("./pmp-option-reasoning");
const {
  extractKeywordSignalPhrases,
  sanitizeSignalPhrases,
  validateSignalPhrases,
} = require("./pmp-teach-keywords");
const { mergeCsvGrounding, buildWhyChainBullets, splitCsvSolutionParts } = require("./pmp-csv-solution-grounding");
const { csvSolutionStats } = require("./pmp-csv-solutions");
const {
  loadCacheFile,
  warmupPageCache,
  lookupGuideQuote,
  buildGuideRagQuery,
} = require("./pmp-pmbok8-rag-pages");

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function isGenericReasoning(text) {
  const t = String(text || "").toLowerCase();
  if (!t || t.length < 20) return true;
  if (/hành động này giải quyết trực tiếp vấn đề trong đề/.test(t)) return true;
  if (/đáp án đúng tập trung/.test(t)) return true;
  if (/align miền .+ \(executing/.test(t) && t.length < 120) return true;
  if (/không phù hợp .+ — đáp án đúng/.test(t)) return true;
  return false;
}

function resolveSignalPhrases(q, storeEntry, profile) {
  const stem = q.text || "";
  const storedValid = validateSignalPhrases(stem, storeEntry?.signalPhrases || []).ok;
  if (storedValid && storeEntry?.signalPhrases?.length) {
    return sanitizeSignalPhrases(stem, storeEntry.signalPhrases);
  }
  if (profile?.signalPhrases?.length) {
    const fromProfile = sanitizeSignalPhrases(stem, profile.signalPhrases);
    if (fromProfile.length >= 2) return fromProfile;
  }
  return extractKeywordSignalPhrases(stem);
}

function buildSignalAnswer(q, analysis, correctKey) {
  const profile = matchStemProfile(q.text);
  if (profile?.signalAnswer) return profile.signalAnswer;
  const correctOpt = (q.options || []).find((o) => o.key === correctKey);
  const issues = extractStemIssues(q.text)
    .map((i) => i.label)
    .slice(0, 2)
    .join("; ");
  const action = correctOpt?.text?.slice(0, 140) || correctKey;
  const cue = issues || analysis.summaryLine?.slice(0, 80) || "scenario cues";
  return `Stem signals (${cue}) → ${correctKey}: ${action}`;
}

function fallbackExcludeReason(opt, correctOpt) {
  const wrong = opt.text.slice(0, 95).trim();
  const right = correctOpt.text.slice(0, 95).trim();
  return `Option ${opt.key} (${wrong}) does not resolve the stem focus — ${correctOpt.key} (${right}) is the PMBOK-aligned action.`;
}

function getCorrectOpt(q, analysis, correctKeys) {
  const fromAnalysis = analysis.optionAnalysis?.find((o) => o.isCorrect);
  if (fromAnalysis) return fromAnalysis;
  const opts =
    q.type === "dropdown"
      ? (q.dropdownOptions || []).map((text, i) => ({
          key: String.fromCharCode(65 + i),
          text,
        }))
      : q.options || [];
  return opts.find((o) => correctKeys.includes(o.key));
}

function buildExcludeReasons(q, analysis) {
  const correctKeys = parseCorrectKeys(q.correct);
  const stemProfile = matchStemProfile(q.text);
  const correctOpt = getCorrectOpt(q, analysis, correctKeys);
  const excludeReasons = {};

  for (const o of analysis.optionAnalysis.filter((x) => !x.isCorrect)) {
    let reason = "";
    if (stemProfile?.excludeReasonsByKey?.[o.key]) {
      reason = stemProfile.excludeReasonsByKey[o.key];
    } else if (o.reason && !isGenericReasoning(o.reason)) {
      reason = o.reason;
    } else if (correctOpt) {
      const inferred = inferWrongReason(o, q, correctKeys, () => null, null);
      if (inferred && !isGenericReasoning(inferred)) reason = inferred;
      else reason = fallbackExcludeReason(o, correctOpt);
    } else {
      reason = `Option ${o.key} (${o.text?.slice(0, 90) || ""}) is not the best PMBOK 8 match for this stem.`;
    }
    excludeReasons[o.key] = reason;
  }
  return excludeReasons;
}

function buildWhyBulletsEntry(q, analysis, correctKey) {
  const profile = matchStemProfile(q.text);
  if (profile?.lessonBullets?.length) {
    return filterWhyBulletsForCorrect(profile.lessonBullets, correctKey).slice(0, 5);
  }
  const bullets = [];
  const correctOpt = analysis.optionAnalysis?.find((o) => o.isCorrect);
  const why =
    profile?.whyCorrect ||
    analysis.whyCorrect ||
    correctOpt?.reason ||
    "";
  if (why && !isGenericReasoning(why)) {
    bullets.push(`${correctKey} is correct: ${why.slice(0, 220)}`);
  }
  const proc = analysis.pmbok8?.processes?.[0];
  const page = analysis.pageInfo?.pages?.[0];
  if (proc) {
    bullets.push(
      page
        ? `PMBOK 8, p. ${page}: ${proc} — aligns with this scenario.`
        : `PMBOK 8: ${proc} — aligns with this scenario.`,
    );
  }
  if (!bullets.length) {
    const correctText =
      correctOpt?.text ||
      (q.type === "dropdown"
        ? q.dropdownOptions?.[correctKey.charCodeAt(0) - 65]
        : (q.options || []).find((o) => o.key === correctKey)?.text) ||
      "";
    bullets.push(`${correctKey} best addresses the situation: ${correctText.slice(0, 160)}`);
  }
  return bullets.slice(0, 5);
}

function bootstrapTeachSignalsStore({ questionsPath, storePath, useCsvSolutions = true }) {
  setActiveTeachSignalsStore(storePath);
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
  const store = fs.existsSync(storePath)
    ? JSON.parse(fs.readFileSync(storePath, "utf8"))
    : {};
  let added = 0;
  let kept = 0;

  loadCacheFile();
  const drafts = [];

  for (const q of questions) {
    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    const profile = matchStemProfile(q.text);
    const existingEntry = store[String(q.id)];
    const existing = validateTeachGrounding(q, analysis);
    const signalPhrases = resolveSignalPhrases(q, existingEntry, profile);
    const correctKey = parseCorrectKeys(q.correct)[0] || q.correct;
    let entry = {
      signalPhrases,
      signalAnswer: buildSignalAnswer(q, analysis, correctKey),
      whyBullets: buildWhyBulletsEntry(q, analysis, correctKey),
      excludeReasons: buildExcludeReasons(q, analysis),
    };
    if (useCsvSolutions) {
      entry = mergeCsvGrounding(q, entry, analysis);
    }
    drafts.push({
      q,
      analysis,
      entry,
      existingEntry,
      hadValid: existing.ok && existingEntry,
    });
  }

  const guideQueries = drafts.map((d) => buildGuideRagQuery(d.q, d.analysis, d.entry));
  try {
    const warm = warmupPageCache(guideQueries);
    if (warm.warmed) console.log(`Guide RAG warmup: ${warm.warmed} new queries`);
  } catch (err) {
    console.warn(`Guide RAG warmup skipped: ${err.message?.slice(0, 120)}`);
  }

  let guideFilled = 0;
  for (const d of drafts) {
    const guide = lookupGuideQuote(d.q, d.analysis, d.entry);
    if (guide?.excerpt) {
      d.entry.guideQuote = guide.excerpt;
      d.entry.guidePages = guide.pages;
      d.entry.guideTopic = guide.topic || "";
      if (guide.topic) d.entry.pmbokConcept = guide.topic;
      const { lookupGuideHits } = require("./pmp-pmbok8-rag-pages");
      const hits = lookupGuideHits(d.q, d.analysis, d.entry, 3);
      if (hits.length) d.entry.guideHits = hits;
      guideFilled++;
    }
    const correctKey = parseCorrectKeys(d.q.correct)[0] || d.q.correct;
    const whyPart = d.entry.sourceSolution
      ? splitCsvSolutionParts(d.entry.sourceSolution).whyPart
      : d.entry.whyCorrect || (d.entry.whyBullets || []).join(" ");
    const chain = buildWhyChainBullets({
      stem: d.q.text,
      signalPhrases: d.entry.signalPhrases,
      whyPart,
      correctKey,
      guideHits: d.entry.guideHits || [],
    });
    if (chain.length >= 2) {
      d.entry.whyBullets = chain;
      d.entry.whyPmbokBullets = chain;
    }
    store[String(d.q.id)] = (() => {
      const merged = { ...d.existingEntry, ...d.entry };
      if (d.entry.sourceSolution) {
        merged.whyBullets = d.entry.whyBullets;
        merged.whyPmbokBullets = d.entry.whyPmbokBullets || d.entry.whyBullets;
        merged.whySolutionBullets = d.entry.whySolutionBullets || d.existingEntry?.whySolutionBullets;
        merged.excludeReasons = d.entry.excludeReasons;
        merged.whyCorrect = d.entry.whyCorrect;
        merged.sourceSolution = d.entry.sourceSolution;
      }
      return merged;
    })();
    if (d.hadValid && validateSignalPhrases(d.q.text, d.existingEntry?.signalPhrases || []).ok) kept++;
    else added++;
  }

  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
  resetTeachSignalsCache();

  const csvStats = useCsvSolutions ? csvSolutionStats(questions) : null;

  let pass = 0;
  const failIds = [];
  for (const q of questions) {
    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    if (validateTeachGrounding(q, analysis).ok) pass++;
    else failIds.push(q.id);
  }

  return {
    storePath,
    questions: questions.length,
    added,
    kept,
    pass,
    failIds,
    csvStats,
    guideFilled,
  };
}

module.exports = { bootstrapTeachSignalsStore };
