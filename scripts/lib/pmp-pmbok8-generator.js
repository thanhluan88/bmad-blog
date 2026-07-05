const {
  PMI_PMBOK8,
  DOMAIN_REFS,
  DOMAIN_KEYWORDS,
  AGILE_KEYWORDS,
  FOCUS_AREA_RULES,
  PROCESS_BY_DOMAIN,
  PRINCIPLE_KEYWORDS,
  WRONG_OPTION_PATTERNS,
  SCENARIO_RULES,
} = require("./pmp-pmbok8-knowledge");
const {
  classifyAction,
  matchStemProfile,
  extractStemIssues,
  buildContextualSummary,
  buildContextualWhy,
  buildPriorityExplanation,
  inferWrongReason,
} = require("./pmp-option-reasoning");

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function scoreDomains(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
  }
  const ranked = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return ["Governance"];
  const top = ranked[0][1];
  return ranked.filter(([, s]) => s >= top * 0.5).map(([d]) => d).slice(0, 2);
}

function detectFocusArea(text) {
  const lower = text.toLowerCase();
  for (const rule of FOCUS_AREA_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.area;
  }
  if (/first|next|what should.*do/i.test(text)) return "Executing";
  return "Executing";
}

function detectPrinciples(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [principle, keywords] of Object.entries(PRINCIPLE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.push(principle);
  }
  if (!found.length) found.push("Lead accountably");
  return found.slice(0, 2);
}

function detectPriorityCue(text) {
  const lower = text.toLowerCase();
  if (/\bfirst\b/.test(lower)) return "FIRST";
  if (/\bnext\b/.test(lower)) return "NEXT";
  if (/\bbest\b/.test(lower)) return "BEST";
  if (/\bshould the project manager\b/.test(lower)) return "ACTION";
  return null;
}

function isAgileContext(text) {
  return AGILE_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));
}

function matchScenario(q) {
  return SCENARIO_RULES.find((rule) => rule.match(q)) || null;
}

function getProcesses(domains) {
  const set = new Set();
  for (const d of domains) {
    for (const p of PROCESS_BY_DOMAIN[d] || []) set.add(p);
  }
  return [...set].slice(0, 3);
}

function summarizeStem(text, maxLen = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLen)}…`;
}

function hasRichOriginalExplanation(q) {
  const exp = String(q.explanation || "").trim();
  if (!exp || exp.includes("**PMBOK 8 mapping**")) return false;
  if (exp === q.correctLabel) return false;
  return exp.length > 120;
}

function buildSummaryLine(q, correctKeys, scenario, domains, focusArea) {
  if (scenario?.summaryLine) return scenario.summaryLine;
  const correctType = classifyAction(
    (q.options || []).find((o) => correctKeys.includes(o.key))?.text || "",
  );
  const stemProfile = matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);
  return buildContextualSummary(q, correctKeys, correctType, stemProfile, stemIssues, domains, focusArea);
}

function buildWhyCorrect(q, correctKeys, scenario, domains, focusArea, priorityCue, agile) {
  if (scenario) {
    let text = scenario.whyCorrect;
    if (priorityCue === "FIRST" || priorityCue === "NEXT") {
      const stemIssues = extractStemIssues(q.text);
      const stemProfile = matchStemProfile(q.text);
      const priorityText = buildPriorityExplanation(q, correctKeys, priorityCue, stemIssues, stemProfile);
      if (priorityText) text += ` ${priorityText}`;
    }
    return text;
  }

  const correctType = classifyAction(
    (q.options || []).find((o) => correctKeys.includes(o.key))?.text || "",
  );
  const stemProfile = matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);
  return buildContextualWhy(
    q,
    correctKeys,
    correctType,
    stemProfile,
    stemIssues,
    domains,
    focusArea,
    priorityCue,
    agile,
  );
}

function applyPatternRejection(opt, priorityCue, agile) {
  for (const pat of WRONG_OPTION_PATTERNS) {
    if (pat.priorityOnly && !priorityCue) continue;
    if (pat.agileContext && !agile) continue;
    if (pat.re.test(opt.text)) {
      let reason = pat.reason;
      if (priorityCue && /document|log|lessons/i.test(opt.text)) {
        reason += ` (Câu hỏi hỏi ${priorityCue} — đây không phải bước ưu tiên.)`;
      }
      return reason;
    }
  }
  return null;
}

function rejectWrongOption(opt, q, correctKeys, priorityCue, agile) {
  if (correctKeys.includes(opt.key)) return null;
  return inferWrongReason(
    opt,
    q,
    correctKeys,
    (o) => applyPatternRejection(o, priorityCue, agile),
    priorityCue,
  );
}

function appendReferences(lines, domains) {
  lines.push("");
  lines.push("**Tham khảo**");
  lines.push(`- [PMBOK Guide 8th Edition](${PMI_PMBOK8})`);
  const refs = new Set([PMI_PMBOK8]);
  for (const d of domains) {
    if (DOMAIN_REFS[d] && !refs.has(DOMAIN_REFS[d])) {
      lines.push(`- [${d} — PMBOK 8](${DOMAIN_REFS[d]})`);
      refs.add(DOMAIN_REFS[d]);
    }
  }
  return [...refs];
}

function formatPmbok8MappingLines(domains, focusArea, processes, principles) {
  return [
    `- Domain: ${domains.join(", ")}`,
    `- Focus Area: ${focusArea}`,
    `- Process: ${processes.join(", ")}`,
    `- Principle: ${principles.join(", ")}`,
  ];
}

function buildDragDropExplanation(q, domains, focusArea, processes, principles, options = {}) {
  const lines = [];
  lines.push("**PMBOK 8 mapping**");
  lines.push(...formatPmbok8MappingLines(domains, focusArea, processes, principles));
  lines.push("");
  lines.push("**Vì sao mapping đúng**");
  if (q.explanation && q.explanation.length > 30 && q.explanation !== q.correctLabel && !q.explanation.includes("**PMBOK 8 mapping**")) {
    lines.push(q.explanation.replace(/\s+/g, " ").trim());
  } else if (q.slotDescriptions?.length && q.dragTerms?.length) {
    const keys = parseCorrectKeys(q.correct);
    keys.forEach((key, i) => {
      const termIdx = key.charCodeAt(0) - 65;
      const term = q.dragTerms[termIdx] || key;
      const slot = q.slotDescriptions[i] || "";
      lines.push(`- **${term}** → ${slot}`);
    });
  } else {
    lines.push(`Ghép đúng theo framework chuẩn (Scrum/PMBOK/team development) — đáp án: ${q.correct}.`);
  }
  const refs = appendReferences(lines, domains);
  return {
    explanation: lines.join("\n"),
    pmbok8: { domains, focusArea, processes, principles },
    references: refs,
  };
}

function buildMcqExplanation(q, options = {}) {
  const fullText = `${q.text} ${(q.options || []).map((o) => o.text).join(" ")}`;
  const originalExplanation = hasRichOriginalExplanation(q) ? q.explanation.replace(/\s+/g, " ").trim() : "";
  const scenario = matchScenario(q);
  const stemProfile = matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);
  const domains = scenario?.domains || stemProfile?.domains || scoreDomains(fullText);
  const focusArea = scenario?.focusArea || detectFocusArea(q.text);
  const processes = scenario?.processes || stemProfile?.processes || getProcesses(domains);
  const principles = scenario?.principles || stemProfile?.principles || detectPrinciples(q.text);
  const priorityCue = detectPriorityCue(q.text);
  const agile = isAgileContext(q.text);
  const correctKeys = parseCorrectKeys(q.correct);

  const lines = [];
  lines.push("**PMBOK 8 mapping**");
  lines.push(...formatPmbok8MappingLines(domains, focusArea, processes, principles));
  lines.push("");
  lines.push("**Vì sao chọn đáp án này**");
  lines.push(`→ **${correctKeys.join(", ")}:** ${buildSummaryLine(q, correctKeys, scenario, domains, focusArea)}`);
  lines.push("");
  lines.push(buildWhyCorrect(q, correctKeys, scenario, domains, focusArea, priorityCue, agile));
  lines.push("");
  lines.push("**Loại trừ phương án khác**");

  for (const opt of q.options || []) {
    const rejection = rejectWrongOption(opt, q, correctKeys, priorityCue, agile);
    if (rejection) lines.push(`- **${opt.key}:** ${rejection}`);
  }

  if (options.preserveOriginal && originalExplanation) {
    lines.push("");
    lines.push("**Giải thích gốc (ExamTopics)**");
    lines.push(originalExplanation);
  }

  const refs = appendReferences(lines, domains);

  return {
    explanation: lines.join("\n"),
    pmbok8: { domains, focusArea, processes, principles },
    references: refs,
  };
}

function generateForQuestion(q, options = {}) {
  const fullText = `${q.text} ${(q.options || []).map((o) => o.text).join(" ")}`;
  const domains = scoreDomains(fullText);
  const focusArea = detectFocusArea(q.text);
  const processes = getProcesses(domains);
  const principles = detectPrinciples(q.text);

  if (q.type === "drag_drop") {
    return buildDragDropExplanation(q, domains, focusArea, processes, principles, options);
  }

  if (q.type === "dropdown") {
    return buildMcqExplanation(
      {
        ...q,
        options: (q.dropdownOptions || []).map((text, i) => ({
          key: String.fromCharCode(65 + i),
          text,
        })),
      },
      options,
    );
  }

  return buildMcqExplanation(q, options);
}

function generateBatch(questions, options = {}) {
  const out = {};
  for (const q of questions) {
    out[String(q.id)] = generateForQuestion(q, options);
  }
  return out;
}

module.exports = {
  generateForQuestion,
  generateBatch,
  parseCorrectKeys,
};
