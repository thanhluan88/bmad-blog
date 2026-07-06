const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PDF_NAME = "pmbokguide_eighthed_eng.pdf";
const RAG_PYTHON = process.env.RAG_PYTHON || "C:\\MyWork\\PMP\\rag_langchain\\.venv\\Scripts\\python.exe";
const RAG_BATCH_SCRIPT =
  process.env.RAG_BATCH_SCRIPT || "C:\\MyWork\\PMP\\rag_langchain\\search_pages_batch.py";
const CACHE_PATH = path.join(__dirname, "..", "..", "data", "pmp-pmbok8-page-cache.json");

let pageCache = new Map();

function buildRagQuery(domains, processes, focusArea) {
  const domain = domains[0] || "Governance";
  const process = processes[0] || "Manage Project Execution";
  return `PMBOK Guide 8 Performance Domain ${domain} ${process} ${focusArea}`.trim();
}

function buildTopicLabel(domains, processes) {
  const domain = domains[0] || "Governance";
  const process = processes[0] || "";
  return process
    ? `Performance Domain: ${domain}, ${process}`
    : `Performance Domain: ${domain}`;
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

  const payload = JSON.stringify({ queries: missing, top_k: 2 });
  const result = spawnSync(RAG_PYTHON, [RAG_BATCH_SCRIPT], {
    input: payload,
    encoding: "utf8",
    timeout: 600000,
    maxBuffer: 50 * 1024 * 1024,
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

function lookupPmbokPages(domains, processes, focusArea) {
  const query = buildRagQuery(domains, processes, focusArea);
  const topicLabel = buildTopicLabel(domains, processes);
  const hit = pageCache.get(query);
  const pages = (hit?.pages || [])
    .map((p) => Number(p))
    .filter((p) => Number.isInteger(p) && p >= 1 && p <= 401);
  const uniquePages = [...new Set(pages)].sort((a, b) => a - b).slice(0, 3);

  return {
    pages: uniquePages,
    topic: topicLabel,
    pdfRef:
      uniquePages.length > 0
        ? `${PDF_NAME}, tr. ${uniquePages.join(", ")} — ${topicLabel}`
        : null,
    query,
    fromRag: uniquePages.length > 0,
  };
}

function collectQueriesFromQuestions(questions, buildMeta) {
  const queries = [];
  for (const q of questions) {
    const meta = buildMeta(q);
    if (meta) queries.push(buildRagQuery(meta.domains, meta.processes, meta.focusArea));
  }
  return queries;
}

function clearPageCache() {
  pageCache = new Map();
}

module.exports = {
  PDF_NAME,
  CACHE_PATH,
  buildRagQuery,
  buildTopicLabel,
  loadCacheFile,
  saveCacheFile,
  warmupPageCache,
  lookupPmbokPages,
  collectQueriesFromQuestions,
  clearPageCache,
};
