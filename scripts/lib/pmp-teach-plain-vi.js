/**
 * Plain Vietnamese explanations for teach lessons (dễ hiểu).
 */
const {
  classifyAction,
  matchStemProfile,
  extractStemIssues,
  getPrimaryStemIssue,
  buildContextualSummary,
  buildSpecificCorrectRationale,
  inferWrongReason,
} = require("./pmp-option-reasoning");
const { WRONG_OPTION_PATTERNS, AGILE_KEYWORDS } = require("./pmp-pmbok8-knowledge");
const { getStoredTeachGrounding } = require("./pmp-teach-signals-store");

function parseCorrectKeys(correct) {
  const s = String(correct || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) return s.split("");
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function detectPriorityCue(text) {
  const lower = String(text || "").toLowerCase();
  if (/\bfirst\b/.test(lower)) return "FIRST";
  if (/\bnext\b/.test(lower)) return "NEXT";
  if (/\bbest\b/.test(lower)) return "BEST";
  return null;
}

function isAgileContext(text) {
  return AGILE_KEYWORDS.some((kw) => String(text || "").toLowerCase().includes(kw));
}

function hasVietnamese(text) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    String(text || ""),
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

function resolvePlainExcludeReason(q, opt, correctKeys, priorityCue, agile, storedReason) {
  const stemProfile = matchStemProfile(q.text);
  const wrongType = classifyAction(opt.text);
  const profileKey = stemProfile?.excludeReasonsByKey?.[opt.key];
  if (profileKey) return profileKey;
  if (wrongType && stemProfile?.rejectByAction?.[wrongType.id]) {
    return stemProfile.rejectByAction[wrongType.id];
  }
  if (storedReason && hasVietnamese(storedReason)) return storedReason.trim();
  const inferred = inferWrongReason(
    opt,
    q,
    correctKeys,
    (o) => applyPatternRejection(o, priorityCue, agile),
    priorityCue,
  );
  if (inferred) return inferred;
  if (storedReason) return storedReason.trim();
  return `Phương án ${opt.key} không giải quyết đúng trọng tâm câu hỏi.`;
}

function truncate(text, max = 160) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function describeSituation(q, stemProfile, stemIssues) {
  const primary = getPrimaryStemIssue(stemIssues, stemProfile);
  if (stemProfile?.summaryHint) {
    const head = stemProfile.summaryHint.split("—")[0].trim();
    if (head) return head.endsWith(".") ? head : `${head}.`;
  }
  if (primary?.label) {
    const label = primary.label;
    return label.endsWith(".") ? label : `${label}.`;
  }
  const stem = String(q.text || "").replace(/\s+/g, " ").trim();
  const qStart = stem.search(
    /\b(What should|What is|Which|How should|Who should|What would|What could|What must|What needs|What are|When should|Where should|Why should|During what|The project manager should|The best|Is this|Are these|Does the|Should the|Can the|Will the|Has the|Have the|Did the)\b/i,
  );
  const ctx = qStart > 24 ? stem.slice(0, qStart).trim() : stem.replace(/\?\s*$/, "");
  return ctx.endsWith(".") ? ctx : `${ctx}.`;
}

function buildPmbokNote(analysis) {
  const p8 = analysis.pmbok8 || {};
  const process = (p8.processes || [])[0] || "";
  const principle = (p8.principles || [])[0] || "";
  const page = analysis.pageInfo?.pages?.[0];
  const parts = [];
  if (process) parts.push(`Process: ${process}`);
  if (principle) parts.push(`Principle: ${principle}`);
  if (page) parts.push(`PMBOK 8, tr. ${page}`);
  return parts.join(" · ");
}

function buildDragDropPlainVi(q, analysis, stored) {
  const correctKey = parseCorrectKeys(q.correct).join(", ");
  const isTuckman = /tuckman/i.test(q.text || "") || /tuckman/i.test(stored?.signalAnswer || "");
  const situation = isTuckman
    ? "Ghép 5 giai đoạn Tuckman Ladder (phát triển nhóm dự án) với mô tả tương ứng."
    : "Câu kéo-thả — ghép thuật ngữ đúng với từng mô tả / thứ tự.";
  const rationale = isTuckman
    ? "Thứ tự chuẩn Forming → Storming → Norming → Performing → Adjourning; mỗi mô tả khớp đúng đặc điểm giai đoạn (kickoff → xung đột → tập thể → synergy → giải tán)."
    : stored?.whySolutionBullets?.[0] ||
      stored?.signalAnswer ||
      `Ghép đúng theo đáp án ${correctKey}.`;
  const summary = isTuckman
    ? "Tuckman: Forming → Storming → Norming → Performing → Adjourning."
    : truncate(stored?.signalAnswer || rationale, 160);
  const bullets = [
    `**Tình huống:** ${situation}`,
    `**Đáp án đúng (${correctKey}):** ${truncate(q.correctLabel || correctKey, 220)}`,
    `**Vì sao:** ${rationale}`,
  ];
  if (isTuckman) {
    bullets.push(
      "**Mẹo:** Storming ≠ Norming (còn jockey/xung đột vs đã làm việc tập thể); Performing = hiệu quả + synergy; Adjourning luôn cuối.",
    );
  }
  const pmbokNote = buildPmbokNote(analysis);
  if (pmbokNote) bullets.push(`**PMBOK 8:** ${pmbokNote}`);
  return {
    situation,
    answerKey: correctKey,
    answerText: q.correctLabel || "",
    rationale,
    summary,
    bullets,
    excludes: [],
    pmbokNote,
  };
}

/** Structured plain-VI explanation for one question. */
function buildPlainViExplanation(q, analysis) {
  const stored = getStoredTeachGrounding(q.id);
  if (q.type === "drag_drop") {
    return buildDragDropPlainVi(q, analysis, stored);
  }

  const correctKeys = parseCorrectKeys(q.correct);
  const correctKey = correctKeys.join(", ");
  const stemProfile = matchStemProfile(q.text);
  const stemIssues = extractStemIssues(q.text);
  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  const correctType = classifyAction(correctOpt?.text || "");
  const meta = analysis.pmbok8 || {};
  const domains = meta.domains || ["Governance"];
  const focusArea = meta.focusArea || "Executing";
  const priorityCue = detectPriorityCue(q.text);
  const agile = isAgileContext(q.text);

  const situation = describeSituation(q, stemProfile, stemIssues);
  const rationale = buildSpecificCorrectRationale(
    q,
    correctKeys,
    correctType,
    stemIssues,
    stemProfile,
    domains,
    focusArea,
  );
  const summary = buildContextualSummary(
    q,
    correctKeys,
    correctType,
    stemProfile,
    stemIssues,
    domains,
    focusArea,
  );

  const bullets = [
    `**Tình huống:** ${situation}`,
    `**Đáp án đúng (${correctKey}):** ${truncate(correctOpt?.text || q.correctLabel || correctKey, 200)}`,
    `**Vì sao:** ${rationale}`,
  ];

  if (priorityCue === "FIRST") {
    bullets.push("**Lưu ý đề bài:** Câu hỏi hỏi bước **FIRST** — chọn hành động khẩn cấp nhất, không phải bước tốt nhưng làm sau.");
  } else if (priorityCue === "NEXT") {
    bullets.push("**Lưu ý đề bài:** Câu hỏi hỏi bước **NEXT** — sau bước đầu tiên, chọn hành động tiếp theo hợp lý.");
  }

  const pmbokNote = buildPmbokNote(analysis);
  if (pmbokNote) {
    bullets.push(`**PMBOK 8:** ${pmbokNote}`);
  }

  const excludes = [];
  for (const opt of (q.options || []).filter((o) => !correctKeys.includes(o.key))) {
    const storedReason = stored?.excludeReasons?.[opt.key] || "";
    const fromAnalysis = (analysis.optionAnalysis || []).find((o) => o.key === opt.key)?.reason || "";
    const reason = resolvePlainExcludeReason(
      q,
      opt,
      correctKeys,
      priorityCue,
      agile,
      hasVietnamese(storedReason) ? storedReason : hasVietnamese(fromAnalysis) ? fromAnalysis : storedReason || fromAnalysis,
    );
    excludes.push({
      key: opt.key,
      text: truncate(opt.text, 90),
      reason: truncate(reason, 220),
    });
  }

  return {
    situation,
    answerKey: correctKey,
    answerText: correctOpt?.text || "",
    rationale,
    summary,
    bullets,
    excludes,
    pmbokNote,
  };
}

function plainViMarkdownBullets(plain) {
  const lines = [];
  for (const b of plain.bullets) {
    lines.push(`- ${b}`);
  }
  if (plain.excludes.length) {
    lines.push("");
    lines.push("**Loại trừ phương án khác:**");
    for (const ex of plain.excludes) {
      lines.push(`- **${ex.key}:** ${ex.reason}`);
    }
  }
  return lines;
}

module.exports = {
  buildPlainViExplanation,
  plainViMarkdownBullets,
  hasVietnamese,
};
