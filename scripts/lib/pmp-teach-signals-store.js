/**
 * Optional per-question teach signals from AI grounding (data/pmp-teach-signals.json).
 * Keys: question id → { signalAnswer, signalPhrases }.
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

function getStoredTeachSignals(questionId) {
  const store = loadTeachSignalsStore();
  const entry = store[String(questionId)];
  if (!entry) return null;
  return {
    signalAnswer: String(entry.signalAnswer || "").trim(),
    signalPhrases: Array.isArray(entry.signalPhrases)
      ? entry.signalPhrases.map((p) => String(p).trim()).filter((p) => p.length > 3)
      : [],
  };
}

module.exports = {
  STORE_PATH,
  loadTeachSignalsStore,
  getStoredTeachSignals,
};
