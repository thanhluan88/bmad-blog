/**
 * Per-question AI grounding stores (Full Bank + Exam Latest).
 */
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "..", "..", "data", "pmp-teach-signals.json");
const EXAM_LATEST_STORE_PATH = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "pmp-exam-latest-teach-signals.json",
);

let activeStorePath = STORE_PATH;
let cache = null;
let cachePath = null;

function setActiveTeachSignalsStore(storePath) {
  if (storePath !== activeStorePath) {
    activeStorePath = storePath;
    cache = null;
    cachePath = null;
  }
}

function getActiveTeachSignalsStorePath() {
  return activeStorePath;
}

function loadTeachSignalsStore() {
  if (cache && cachePath === activeStorePath) return cache;
  cachePath = activeStorePath;
  if (!fs.existsSync(activeStorePath)) {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(activeStorePath, "utf8"));
  } catch {
    cache = {};
  }
  return cache;
}

function parseStoreEntry(entry) {
  if (!entry) return null;
  const excludeReasons = {};
  if (entry.excludeReasons && typeof entry.excludeReasons === "object") {
    for (const [k, v] of Object.entries(entry.excludeReasons)) {
      const t = String(v || "").trim();
      if (t) excludeReasons[k.toUpperCase()] = t;
    }
  }
  return {
    signalAnswer: String(entry.signalAnswer || "").trim(),
    signalPhrases: Array.isArray(entry.signalPhrases)
      ? entry.signalPhrases.map((p) => String(p).trim()).filter((p) => p.length > 3)
      : [],
    whyCorrect: String(entry.whyCorrect || "").trim(),
    whyBullets: Array.isArray(entry.whyBullets)
      ? entry.whyBullets.map((b) => String(b).trim()).filter((b) => b.length > 12)
      : [],
    excludeReasons,
    pmbokConcept: String(entry.pmbokConcept || "").trim(),
    guideQuote: String(entry.guideQuote || "").trim(),
  };
}

function getStoredTeachGrounding(questionId) {
  const store = loadTeachSignalsStore();
  return parseStoreEntry(store[String(questionId)]);
}

/** @deprecated use getStoredTeachGrounding */
function getStoredTeachSignals(questionId) {
  return getStoredTeachGrounding(questionId);
}

function resetTeachSignalsCache() {
  cache = null;
  cachePath = null;
}

module.exports = {
  STORE_PATH,
  EXAM_LATEST_STORE_PATH,
  setActiveTeachSignalsStore,
  getActiveTeachSignalsStorePath,
  loadTeachSignalsStore,
  getStoredTeachGrounding,
  getStoredTeachSignals,
  resetTeachSignalsCache,
};
