/**
 * Bootstrap data/pmp-teach-signals.json for Full Bank teach lessons (skill step 6).
 * Fills signal + whyBullets + excludeReasons so validateTeachGrounding passes.
 */
const fs = require("fs");
const path = require("path");
const { generateTeachAnalysis } = require("./lib/pmp-pmbok8-generator");
const {
  validateTeachGrounding,
  buildExcludeRows,
  buildWhyBullets,
  filterWhyBulletsForCorrect,
} = require("./lib/pmp-teach-colocation-style");
const { STORE_PATH, resetTeachSignalsCache } = require("./lib/pmp-teach-signals-store");
const {
  matchStemProfile,
  extractStemIssues,
  classifyAction,
  inferWrongReason,
} = require("./lib/pmp-option-reasoning");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.json");

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

function extractSignalPhrases(stem) {
  const phrases = [];
  const seen = new Set();
  const add = (raw) => {
    let t = String(raw || "").trim().replace(/\s+/g, " ");
    if (t.length < 10) return;
    const idx = stem.toLowerCase().indexOf(t.toLowerCase());
    if (idx < 0) return;
    t = stem.slice(idx, idx + t.length);
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    phrases.push(t);
  };

  const q = stem.match(/What should[^?]+\?/i);
  if (q) add(q[0].replace(/\?$/, ""));

  for (const part of stem.split(/(?<=[.?!])\s+/)) {
    if (part.length < 15) continue;
    if (
      /should|because|although|however|during|before|after|first|without|lacking|unable|requested|agreed|identified|discovered|concern|issue|risk|change|stakeholder|team|contract|scope|budget|quality|delay|overtime|retrospective|iteration|sprint|backlog|vendor|sponsor|well-defined/i.test(
        part,
      )
    ) {
      add(part.replace(/[.?!]$/, ""));
    }
    if (phrases.length >= 5) break;
  }

  if (phrases.length < 2) {
    for (const part of stem
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)
      .sort((a, b) => b.length - a.length)) {
      add(part);
      if (phrases.length >= 4) break;
    }
  }

  if (!phrases.length) add(stem.slice(0, Math.min(90, stem.length)).trim());
  return phrases.slice(0, 5);
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
  return `Stem signals (${cue}) support ${correctKey}: ${action}`;
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

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const store = loadStore();
  let added = 0;
  let kept = 0;

  for (const q of questions) {
    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    const existing = validateTeachGrounding(q, analysis);
    if (existing.ok && store[String(q.id)]) {
      kept++;
      continue;
    }

    const correctKey = parseCorrectKeys(q.correct)[0] || q.correct;
    const entry = {
      signalPhrases: extractSignalPhrases(q.text),
      signalAnswer: buildSignalAnswer(q, analysis, correctKey),
      whyBullets: buildWhyBulletsEntry(q, analysis, correctKey),
      excludeReasons: buildExcludeReasons(q, analysis),
    };

    store[String(q.id)] = { ...store[String(q.id)], ...entry };
    added++;
  }

  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  resetTeachSignalsCache();

  let pass = 0;
  const failIds = [];
  for (const q of questions) {
    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    if (validateTeachGrounding(q, analysis).ok) pass++;
    else failIds.push(q.id);
  }

  console.log(`Store: ${STORE_PATH}`);
  console.log(`Entries added/updated: ${added}, kept valid: ${kept}`);
  console.log(`Validation after bootstrap: ${pass}/${questions.length} pass`);
  if (failIds.length) {
    console.log(`Still failing: ${failIds.slice(0, 20).join(", ")}${failIds.length > 20 ? ` … +${failIds.length - 20}` : ""}`);
  }
}

main();
