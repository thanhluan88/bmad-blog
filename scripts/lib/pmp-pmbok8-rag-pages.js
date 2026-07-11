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

const PMBOK_PROCESS_TERMS = [
  "Implement Risk Responses",
  "Monitor Risks",
  "Plan Risk Management",
  "Identify Risks",
  "Develop Team",
  "Manage Team",
  "Plan Resources",
  "Acquire Resources",
  "Manage Stakeholder Engagement",
  "Plan Stakeholder Engagement",
  "Identify Stakeholders",
  "Perform Integrated Change Control",
  "Validate Scope",
  "Control Scope",
  "Define Scope",
  "Determine Budget",
  "Estimate Costs",
  "Control Costs",
  "Conduct Procurements",
  "Plan Procurement Management",
  "Manage Project Execution",
  "Close Project or Phase",
  "Plan Quality Management",
  "Manage Quality",
  "Plan Communications Management",
  "Manage Communications",
];

const ARTIFACT_TERMS = [
  "risk register",
  "issue log",
  "stakeholder register",
  "change request",
  "lessons learned",
  "product backlog",
  "definition of done",
  "communications management plan",
  "project management plan",
  "acceptance criteria",
  "contingency reserve",
  "management reserve",
];

const PRINCIPLE_TERMS = [
  "Lead accountably",
  "Build an empowered culture",
  "Focus on value",
  "Embed quality",
  "Be an accountable leader",
  "Adopt a holistic view",
];

function extractGuideTermsFromText(text) {
  const lower = String(text || "").toLowerCase();
  const found = [];
  for (const t of PMBOK_PROCESS_TERMS) {
    if (lower.includes(t.toLowerCase())) found.push(t);
  }
  for (const t of ARTIFACT_TERMS) {
    if (lower.includes(t)) found.push(t);
  }
  for (const p of PRINCIPLE_TERMS) {
    if (lower.includes(p.toLowerCase())) found.push(p);
  }
  return [...new Set(found)];
}

/** RAG query aligned with whyBullets / whyCorrect — not stem-only meta. */
function buildGuideRagQuery(q, analysis, teachEntry = {}) {
  const whyBlob = [
    teachEntry.whyCorrect,
    ...(teachEntry.whyBullets || []),
    analysis.whyCorrect,
    analysis.summaryLine,
  ]
    .filter(Boolean)
    .join(" ");

  const fromWhy = extractGuideTermsFromText(whyBlob);
  const p8 = analysis.pmbok8 || {};
  const parts = [
    ...fromWhy,
    ...(p8.processes || []).slice(0, 2),
    ...(p8.principles || []).slice(0, 1),
  ];

  if (/risk register|newly identified risk|undocumented risk|identify.*risk/i.test(whyBlob)) {
    parts.unshift("Monitor Risks", "Identified risks", "risk register");
  }
  if (/stakeholder engagement|stakeholder register|resistant stakeholder/i.test(whyBlob)) {
    parts.unshift("Manage Stakeholder Engagement", "stakeholder");
  }
  if (/retrospective|sprint|agile team|product owner|backlog/i.test(whyBlob)) {
    parts.unshift("Build empowered culture", "Develop Team", "continuous improvement");
  }
  if (/acceptance criteria|quality standard|defect|validate scope/i.test(whyBlob)) {
    parts.unshift("Validate Scope", "Embed quality", "acceptance criteria");
  }

  const words = [...new Set(parts.join(" ").split(/\s+/).filter((w) => w.length > 2))];
  if (words.length >= 4) return words.slice(0, 18).join(" ");

  const meta = {
    domains: p8.domains || [],
    processes: p8.processes || [],
    principles: p8.principles || [],
  };
  return buildRagQuery(q, meta);
}

function isMidSentenceFragment(snippet) {
  const s = cleanSnippet(snippet);
  if (!s || s.length < 30) return true;
  if (/^[a-z]/.test(s)) return true;
  if (/^register\./i.test(s)) return true;
  return false;
}

function guideHitRankScore(hit, queryTerms = []) {
  let rank = hitRankScore(hit);
  const s = cleanSnippet(hit.snippet || "");
  if (isMidSentenceFragment(s)) rank += 50;
  const lower = s.toLowerCase();
  for (const term of queryTerms) {
    if (term.length > 4 && lower.includes(term.toLowerCase())) rank -= 3;
  }
  if (/The process of/i.test(s)) rank -= 3;
  if (/Identified risks are described/i.test(s)) rank -= 5;
  if (/risk register/i.test(s)) rank -= 4;
  return rank;
}

function pickBestGuideHit(hits, query = "") {
  const terms = query.split(/\s+/).filter((w) => w.length > 3);
  const ranked = [...(hits || [])].sort(
    (a, b) => guideHitRankScore(a, terms) - guideHitRankScore(b, terms),
  );
  return ranked[0] || null;
}

function hitToGuideResult(hit, topicFallback) {
  const page = Number(hit?.printed_page ?? hit?.page);
  const snippet = cleanSnippet(hit?.snippet);
  if (!Number.isInteger(page) || page < 1 || page > 401) {
    return null;
  }
  const excerpt = formatGuideQuote(snippet, 600);
  if (!excerpt || excerpt.length < 40 || isMidSentenceFragment(excerpt)) {
    return null;
  }
  const topic = topicFromSnippet(hit.snippet, topicFallback);
  return {
    excerpt,
    pages: [page],
    topic,
    pdfRef: `${PDF_NAME}, tr. ${page} — ${topic}`,
    snippet,
  };
}

/** Guide quote aligned with Tại sao chọn — uses store, then why-aligned RAG, then stem RAG. */
function lookupGuideQuote(q, analysis, teachEntry = null) {
  const stored = teachEntry || {};
  if (stored.guideQuote && stored.guideQuote.length >= 40) {
    const excerpt = formatGuideQuote(stored.guideQuote, 600);
    const pages = Array.isArray(stored.guidePages)
      ? stored.guidePages.filter((p) => Number.isInteger(p) && p > 0)
      : [];
    if (excerpt.length >= 40 && pages.length) {
      return {
        excerpt,
        pages,
        topic: stored.guideTopic || "",
        pdfRef: pages.length
          ? `${PDF_NAME}, tr. ${pages.join(", ")}${stored.guideTopic ? ` — ${stored.guideTopic}` : ""}`
          : null,
        fromStore: true,
      };
    }
  }

  const p8 = analysis.pmbok8 || {};
  const topicFallback = buildTopicLabel(p8.domains || [], p8.processes || []);
  const guideQuery = buildGuideRagQuery(q, analysis, stored);
  const guideHit = pageCache.get(guideQuery);
  let best = pickBestGuideHit(guideHit?.hits, guideQuery);
  let result = best ? hitToGuideResult(best, topicFallback) : null;

  if (!result) {
    const stemQuery = buildRagQuery(q, {
      domains: p8.domains || [],
      processes: p8.processes || [],
      principles: p8.principles || [],
    });
    const stemHit = pageCache.get(stemQuery);
    best = pickBestGuideHit(stemHit?.hits, guideQuery);
    result = best ? hitToGuideResult(best, topicFallback) : null;
  }

  if (!result) return null;
  return { ...result, query: guideQuery, fromStore: false };
}

/** Up to 3 Guide excerpts aligned with whyBullets — distinct printed pages. */
function lookupGuideHits(q, analysis, teachEntry = null, limit = 3) {
  const stored = teachEntry || {};
  if (Array.isArray(stored.guideHits) && stored.guideHits.length) {
    return stored.guideHits.slice(0, limit).map((h) => ({
      page: Number(h.page),
      topic: String(h.topic || "").trim(),
      excerpt: formatGuideQuote(h.excerpt || h.snippet || "", 520),
      query: h.query || "",
    })).filter((h) => h.page > 0 && h.excerpt.length >= 40);
  }

  const p8 = analysis.pmbok8 || {};
  const topicFallback = buildTopicLabel(p8.domains || [], p8.processes || []);
  const guideQuery = buildGuideRagQuery(q, analysis, stored);
  const ranked = [...(pageCache.get(guideQuery)?.hits || [])].sort(
    (a, b) => guideHitRankScore(a, guideQuery.split(/\s+/)) - guideHitRankScore(b, guideQuery.split(/\s+/)),
  );

  const hits = [];
  const seenPages = new Set();
  for (const hit of ranked) {
    const item = hitToGuideResult(hit, topicFallback);
    if (!item?.pages?.[0]) continue;
    const page = item.pages[0];
    if (seenPages.has(page)) continue;
    seenPages.add(page);
    hits.push({
      page,
      topic: item.topic || "",
      excerpt: item.excerpt,
      query: guideQuery,
    });
    if (hits.length >= limit) break;
  }

  if (hits.length < limit) {
    const stemQuery = buildRagQuery(q, {
      domains: p8.domains || [],
      processes: p8.processes || [],
      principles: p8.principles || [],
    });
    const stemRanked = [...(pageCache.get(stemQuery)?.hits || [])].sort(
      (a, b) => guideHitRankScore(a, guideQuery.split(/\s+/)) - guideHitRankScore(b, guideQuery.split(/\s+/)),
    );
    for (const hit of stemRanked) {
      const item = hitToGuideResult(hit, topicFallback);
      if (!item?.pages?.[0]) continue;
      const page = item.pages[0];
      if (seenPages.has(page)) continue;
      seenPages.add(page);
      hits.push({ page, topic: item.topic || "", excerpt: item.excerpt, query: stemQuery });
      if (hits.length >= limit) break;
    }
  }

  return hits;
}

function collectGuideQueriesFromQuestions(questions, getEntry) {
  return questions.map((q) => {
    const analysis = getEntry ? getEntry(q)?.analysis : null;
    const entry = getEntry ? getEntry(q)?.entry : {};
    if (analysis) return buildGuideRagQuery(q, analysis, entry);
    const meta = { domains: ["Governance"], processes: [], principles: [] };
    return buildRagQuery(q, meta);
  });
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

  if (/subject matter expert|\bsme\b|reluctant.*(?:agile|team)|join the agile team|empower(?:ed|ment)? culture/i.test(blob)) {
    parts.unshift("Build empowered culture", "coaching", "continuous improvement", "early feedback", "Develop Team");
  }
  if (/actively listen|emotional intelligence|one-on-one/i.test(blob)) {
    parts.unshift("active listening", "emotional intelligence", "coach");
  }

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
  if (isMidSentenceFragment(s)) return true;
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

function cleanSnippet(snippet) {
  return String(snippet || "")
    .replace(/\s+/g, " ")
    .replace(/^\d+\s+Section\s+\d+\s*[–-]\s*[^.]*\.?\s*/i, "")
    .replace(/^\d+\s+A Guide to the Project Management Body of Knowledge\s+/i, "")
    .replace(/Licensed To:[\s\S]*$/i, "")
    .replace(/This copy is a PMI Member benefit[\s\S]*$/i, "")
    .replace(/Figure \d+-\d+\.[\s\S]*$/i, "")
    .trim();
}

/** Quote only complete sentences — never end mid-sentence. */
function formatGuideQuote(text, maxChars = 520) {
  const t = cleanSnippet(text);
  if (!t) return "";
  if (t.length <= maxChars && /[.!?]["']?\s*$/.test(t)) return t;

  const sentences = t.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (sentences?.length) {
    let out = "";
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      const next = out ? `${out} ${s}` : s;
      if (next.length > maxChars && out) break;
      if (next.length > maxChars && !out) return s;
      out = next;
    }
    if (out) return out;
  }

  const cut = t.slice(0, maxChars);
  const lastEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastEnd > 80) return cut.slice(0, lastEnd + 1).trim();
  return cut.replace(/\s+\S*$/, "").trim();
}

function lookupPmbokPages(q, meta) {
  const { domains, processes } = meta;
  const query = buildRagQuery(q, meta);
  const topicFallback = buildTopicLabel(domains, processes);
  const hit = pageCache.get(query);
  const best = pickBestHit(hit?.hits);
  const page = Number(best?.printed_page ?? best?.page);
  const snippet = cleanSnippet(best?.snippet);

  if (!Number.isInteger(page) || page < 1 || page > 401) {
    return { pages: [], topic: topicFallback, pdfRef: null, query, fromRag: false, snippet: "" };
  }

  const topic = topicFromSnippet(best.snippet, topicFallback);
  return {
    pages: [page],
    topic,
    pdfRef: `${PDF_NAME}, tr. ${page} — ${topic}`,
    query,
    fromRag: true,
    snippet,
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
  buildGuideRagQuery,
  buildTopicLabel,
  isLowValueSnippet,
  isMidSentenceFragment,
  pickBestHit,
  pickBestGuideHit,
  topicFromSnippet,
  cleanSnippet,
  formatGuideQuote,
  loadCacheFile,
  saveCacheFile,
  warmupPageCache,
  lookupPmbokPages,
  lookupGuideQuote,
  lookupGuideHits,
  extractGuideTermsFromText,
  collectGuideQueriesFromQuestions,
  collectQueriesFromQuestions,
  clearPageCache,
};
