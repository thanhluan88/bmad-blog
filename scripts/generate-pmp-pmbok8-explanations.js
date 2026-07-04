const fs = require("fs");
const path = require("path");
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
} = require("./lib/pmp-pmbok8-knowledge");

const QUESTIONS_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");
const OUT_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-pmbok8-explanations.json");

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
  const lower = text.toLowerCase();
  return AGILE_KEYWORDS.some((kw) => lower.includes(kw));
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

function buildWhyCorrect(q, correctKeys, scenario, domains, focusArea, priorityCue) {
  const correctOpts = (q.options || []).filter((o) => correctKeys.includes(o.key));
  const correctText = correctOpts.map((o) => o.text).join(" · ") || q.correctLabel || q.correct;

  if (scenario) {
    let text = scenario.whyCorrect;
    text += ` Đáp án **${correctKeys.join(", ")}** — "${correctText}" — phản ánh đúng hành vi PM được PMBOK 8 khuyến nghị.`;
    if (priorityCue === "FIRST" || priorityCue === "NEXT") {
      text += ` Câu hỏi hỏi hành động **${priorityCue}** — đây là bước ưu tiên trước ghi nhận, leo thang, hoặc thay đổi baseline.`;
    }
    return text;
  }

  const domainStr = domains.join(" + ");
  let text =
    `Theo PMBOK 8 (miền ${domainStr}, Focus Area: ${focusArea}), PM cần hành động phù hợp bối cảnh: ${summarizeStem(q.text, 100)}. `;
  text += `Đáp án **${correctKeys.join(", ")}** — "${correctText}" — là lựa chọn phù hợp vì align với quy trình và artifact của miền liên quan. `;

  if (isAgileContext(q.text)) {
    text +=
      "Trong ngữ cảnh Agile/Hybrid, PMBOK 8 nhấn mạnh Build an empowered culture và Focus on value thay vì kiểm soát cứng nhắc.";
  } else if (priorityCue === "FIRST" || priorityCue === "NEXT") {
    text += `Với câu hỏi **${priorityCue}**, chọn hành động tác động trực tiếp tình huống trước các bước documentation hoặc thay đổi kế hoạch dài hạn.`;
  } else {
    text += "PMI ưu tiên giải quyết có hệ thống dựa trên plan/artifact hiện có thay vì phản ứng tùy hứng.";
  }

  return text;
}

function rejectWrongOption(opt, q, correctKeys, priorityCue, agile) {
  if (correctKeys.includes(opt.key)) return null;

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

  const correctOpt = (q.options || []).find((o) => correctKeys.includes(o.key));
  if (!correctOpt) {
    return "Không align với best practice PMBOK 8 cho tình huống này.";
  }

  if (/plan|define|facilitat|consult|review|communicat|introduc|empower|consensus/i.test(correctOpt.text)) {
    if (/ignore|wait|delay|without|disregard|assume/i.test(opt.text)) {
      return "Thiếu chủ động và trách nhiệm — PM cần hành động rõ ràng thay vì trì hoãn hoặc bỏ qua.";
    }
  }

  if (priorityCue && /update|document|log|report|lessons/i.test(opt.text)) {
    return `Ghi nhận/cập nhật tài liệu quan trọng nhưng thường thực hiện sau hành động xử lý chính (câu hỏi hỏi ${priorityCue}).`;
  }

  return "Không phải hành động ưu tiên hoặc vi phạm logic PMP/PMBOK 8 cho bối cảnh câu hỏi.";
}

function buildDragDropExplanation(q, domains, focusArea, processes, principles) {
  const lines = [];
  lines.push(`**PMBOK 8 mapping**`);
  lines.push(`- Miền: ${domains.join(", ")}`);
  lines.push(`- Vùng trọng tâm: ${focusArea}`);
  lines.push(`- Quy trình: ${processes.join(", ")}`);
  lines.push(`- Nguyên tắc: ${principles.join(", ")}`);
  lines.push("");
  lines.push("**Vì sao mapping đúng**");
  if (q.explanation && q.explanation.length > 30 && q.explanation !== q.correctLabel) {
    lines.push(q.explanation);
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
  lines.push("");
  lines.push("**Tham khảo**");
  lines.push(`- [PMBOK Guide 8th Edition](${PMI_PMBOK8})`);
  for (const d of domains.slice(0, 1)) {
    if (DOMAIN_REFS[d]) lines.push(`- [${d} — PMBOK 8](${DOMAIN_REFS[d]})`);
  }
  return lines.join("\n");
}

function buildMcqExplanation(q) {
  const fullText = `${q.text} ${(q.options || []).map((o) => o.text).join(" ")}`;
  const scenario = matchScenario(q);
  const domains = scenario?.domains || scoreDomains(fullText);
  const focusArea = scenario?.focusArea || detectFocusArea(q.text);
  const processes = scenario?.processes || getProcesses(domains);
  const principles = scenario?.principles || detectPrinciples(q.text);
  const priorityCue = detectPriorityCue(q.text);
  const agile = isAgileContext(q.text);
  const correctKeys = parseCorrectKeys(q.correct);

  const lines = [];
  lines.push(`**PMBOK 8 mapping**`);
  lines.push(`- Miền: ${domains.join(", ")}`);
  lines.push(`- Vùng trọng tâm: ${focusArea}`);
  lines.push(`- Quy trình: ${processes.join(", ")}`);
  lines.push(`- Nguyên tắc: ${principles.join(", ")}`);
  lines.push("");
  lines.push("**Vì sao chọn đáp án này**");
  lines.push(buildWhyCorrect(q, correctKeys, scenario, domains, focusArea, priorityCue));
  lines.push("");
  lines.push("**Loại trừ phương án khác**");

  for (const opt of q.options || []) {
    const rejection = rejectWrongOption(opt, q, correctKeys, priorityCue, agile);
    if (rejection) {
      lines.push(`- **${opt.key}:** ${rejection}`);
    }
  }

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

  return {
    explanation: lines.join("\n"),
    pmbok8: { domains, focusArea, processes, principles },
    references: [...refs],
  };
}

function generateForQuestion(q) {
  const fullText = `${q.text} ${(q.options || []).map((o) => o.text).join(" ")}`;
  const domains = scoreDomains(fullText);
  const focusArea = detectFocusArea(q.text);
  const processes = getProcesses(domains);
  const principles = detectPrinciples(q.text);

  if (q.type === "drag_drop") {
    const explanation = buildDragDropExplanation(q, domains, focusArea, processes, principles);
    const refs = [PMI_PMBOK8];
    if (DOMAIN_REFS[domains[0]]) refs.push(DOMAIN_REFS[domains[0]]);
    return {
      explanation,
      pmbok8: { domains, focusArea, processes, principles },
      references: refs,
    };
  }

  return buildMcqExplanation(q);
}

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const out = {};

  for (const q of questions) {
    out[String(q.id)] = generateForQuestion(q);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Generated PMBOK 8 explanations for ${questions.length} questions → ${OUT_PATH}`);

  const sample = out["1"];
  console.log("\n--- Sample Q1 ---\n");
  console.log(sample.explanation.slice(0, 600), "...");
}

main();
