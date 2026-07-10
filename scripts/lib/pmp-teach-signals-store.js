/**
 * Optional per-question AI grounding (data/pmp-teach-signals.json).
 */
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "..", "..", "data", "pmp-teach-signals.json");

let cache = null;

function loadTeachSignalsStore() {
  if (cache) return cache;
  if (!fs.existsSync(STORE_PATH)) {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    cache = {};
  }
  return cache;
}

function getStoredTeachGrounding(questionId) {
  const store = loadTeachSignalsStore();
  const entry = store[String(questionId)];
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

/** @deprecated use getStoredTeachGrounding */
function getStoredTeachSignals(questionId) {
  return getStoredTeachGrounding(questionId);
}

module.exports = {
  STORE_PATH,
  loadTeachSignalsStore,
  getStoredTeachGrounding,
  getStoredTeachSignals,
};
