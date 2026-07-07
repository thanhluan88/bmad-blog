const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PDF_NAME = "PMBOK8";
const RAG_PYTHON = process.env.RAG_PYTHON || "C:\\MyWork\\PMP\\rag_langchain\\.venv\\Scripts\\python.exe";
const RAG_BATCH_SCRIPT =
  process.env.RAG_BATCH_SCRIPT || "C:\\MyWork\\PMP\\rag_langchain\\search_pages_batch.py";
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "pmp-pmbok8-page-cache.json");
const RAG_TOP_K = 5;

let pageCache = new Map();

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function buildRagQuery(q, meta) {
  const { domains, processes, principles } = meta;
  const correctKeys = parseCorrectKeys(q.correct);
  const correctText =
    (q.options || []).find((o) => correctKeys.includes(o.key))?.text ||
    String(q.correctLabel || "").replace(/^[A-Z]\.\s*/, "");
  const stem = String(q.text || "").replace(/\s+/g, " ").slice(0, 200);
  const blob = `${stem} ${correctText}`.toLowerCase();

  const artifacts = [];
  for (const term of [
    "risk register",
    "issue log",
    "stakeholder register",
    "change request",
    "lessons learned",
    "product backlog",
    "sprint retrospective",
    "critical path",
  ]) {
    if (blob.includes(term)) artifacts.push(term);
  }

  const parts = [
    principles[0],
    principles[1],
    processes[0],
    domains[0],
    ...artifacts,
    correctText.replace(/\s+/g, " ").slice(0, 100),
  ].filter(Boolean);

  const words = [...new Set(parts.join(" ").split(/\s+/).filter((w) => w.length > 2))];
  return words.slice(0, 18).join(" ");
}

function buildTopicLabel(domains, processes) {
  const domain = domains[0] || "Governance";
  const process = processes[0] || "";
  return process
    ? `Performance Domain: ${domain}, ${process}`
    : `Performance Domain: ${domain}`;
}

function isLowValueSnippet(snippet) {
  const s = (snippet || "").replace(/\s+/g, " ").trim();
  const lower = s.toLowerCase();
  if (!s) return true;
  if (/performance domain addresses the processes/.test(lower)) return true;
  if (/section 2 – project management performance domains/.test(lower)) return true;
  if (/processes overview/i.test(lower) && /figure 2-\d+/i.test(lower)) return true;
  if (/identify stakeholders[\s\S]{0,80}plan stakeholder engagement/i.test(lower) && s.length < 400) {
    return true;
  }
  if (/licensed to:/i.test(lower) && s.length < 280) return true;
  return false;
}

function hitRankScore(hit) {
  let rank = hit.score;
  const s = (hit.snippet || "").replace(/\s+/g, " ");
  if (isLowValueSnippet(s)) return rank + 100;
  if (/\d+\.\d+(?:\.\d+)?\s+(?:Plan|Implement|Monitor|Manage|Identify|Develop|Control|Close)\s+/i.test(s)) {
    rank -= 4;
  }
  if (/The process of/i.test(s)) rank -= 2;
  if (/principle of Be an Accountable Leader/i.test(s)) rank -= 4;
  if (/Implement Risk Responses/i.test(s)) rank -= 1;
  return rank;
}

function pickBestHit(hits) {
  const ranked = [...(hits || [])].sort((a, b) => hitRankScore(a) - hitRankScore(b));
  return ranked[0] || null;
}

function topicFromSnippet(snippet, fallback) {
  const s = (snippet || "").replace(/\s+/g, " ");
  if (/principle of Be an Accountable Leader/i.test(s)) return "Be an Accountable Leader";
  const riskProc = s.match(
    /\d+\.\d+(?:\.\d+)?\s+((?:Plan|Implement|Monitor)\s+Risk\s+Responses)/,
  );
  if (riskProc) return riskProc[1];
  const section = s.match(
    /\d+\.\d+(?:\.\d+)?\s+((?:Plan|Monitor|Manage|Identify|Implement|Develop|Control|Close)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  );
  if (section) return section[1].trim();
  const principle = s.match(/principle of ([^.]{4,50})/i);
  if (principle) return principle[1].trim();
  const process = s.match(/The process of ([^.]{8,70})/i);
  if (process) return process[1].trim().replace(/\.$/, "");
  return fallback;
}

function loadCacheFile() {
  if (!fs.existsSync(CACHE_PATH)) return;
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    pageCache = new Map(Object.entries(data));
  } catch {
    pageCache = new Map();
  }
}

function saveCacheFile() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(Object.fromEntries(pageCache), null, 2));
}

function warmupPageCache(queries, options = {}) {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  const missing = unique.filter((q) => !pageCache.has(q));
  if (!missing.length) return { warmed: 0, total: unique.length };

  if (options.skipRag) return { warmed: 0, total: unique.length, skipped: true };

  const payload = JSON.stringify({ queries: missing, top_k: RAG_TOP_K });
  const result = spawnSync(RAG_PYTHON, [RAG_BATCH_SCRIPT], {
    input: payload,
    encoding: "utf8",
    timeout: 900000,
    maxBuffer: 80 * 1024 * 1024,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });

  if (result.status !== 0) {
    const err = (result.stderr || result.error?.message || "RAG batch failed").slice(0, 500);
    throw new Error(err);
  }

  const batch = JSON.parse(result.stdout || "{}");
  for (const [query, hit] of Object.entries(batch)) {
    pageCache.set(query, hit);
  }
  saveCacheFile();
  return { warmed: missing.length, total: unique.length };
}

function lookupPmbokPages(q, meta) {
  const { domains, processes } = meta;
  const query = buildRagQuery(q, meta);
  const topicFallback = buildTopicLabel(domains, processes);
  const hit = pageCache.get(query);
  const best = pickBestHit(hit?.hits);
  const page = Number(best?.printed_page ?? best?.page);

  if (!Number.isInteger(page) || page < 1 || page > 401) {
    return { pages: [], topic: topicFallback, pdfRef: null, query, fromRag: false };
  }

  const topic = topicFromSnippet(best.snippet, topicFallback);
  return {
    pages: [page],
    topic,
    pdfRef: `${PDF_NAME}, tr. ${page} — ${topic}`,
    query,
    fromRag: true,
  };
}

function collectQueriesFromQuestions(questions, buildMeta) {
  return questions.map((q) => buildRagQuery(q, buildMeta(q)));
}

function clearPageCache() {
  pageCache = new Map();
}

module.exports = {
  PDF_NAME,
  CACHE_PATH,
  RAG_TOP_K,
  buildRagQuery,
  buildTopicLabel,
  isLowValueSnippet,
  pickBestHit,
  topicFromSnippet,
  loadCacheFile,
  saveCacheFile,
  warmupPageCache,
  lookupPmbokPages,
  collectQueriesFromQuestions,
  clearPageCache,
};
