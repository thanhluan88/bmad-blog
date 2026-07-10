/**
 * Highlight exam cues, PMI signal/trap words, and PMBOK 8 terms in teach lessons.
 */

const EXAM_CUE_PATTERNS = [
  /\bwhat should the project manager do first\b/gi,
  /\bwhat should the project manager do next\b/gi,
  /\bwhat should the project manager do\b/gi,
  /\bwhat should the team do first\b/gi,
  /\bwhich (?:of the following )?(?:document|artifact|tool|technique)\b/gi,
  /\bwhich (?:of the following )?(?:is|are) (?:the )?(?:best|most appropriate)\b/gi,
  /\b(?:choose|select) (?:two|three|2|3|all that apply)\b/gi,
  /\b(?:first|next|best|worst|least|most|primarily|initially|not|except)\b/gi,
  /\bdrag and drop\b/gi,
];

/** Stem phrases that point toward the correct PMI action (scenario signals). */
const STEM_SIGNAL_PATTERNS = [
  /subject matter expert(?:\s*\(SME\))?/i,
  /\bSME\b/,
  /join the agile team/i,
  /agile approach/i,
  /agile team/i,
  /adopting agile/i,
  /reluctant because[^.?]{10,140}/i,
  /reluctant to/i,
  /demotivat(?:ing|ed)/i,
  /slows them down/i,
  /highest[- ]quality output/i,
  /overwhelmed/i,
  /struggling with[^.?]{5,90}/i,
  /not happy with/i,
  /having difficulty delivering/i,
  /burned out/i,
  /missing (?:task )?deadlines/i,
  /distributed across[^.,;]{5,90}/i,
  /video conferencing/i,
  /misunderstandings? about[^.,;]{0,70}/i,
  /taking too long[^.,;]{0,70}/i,
  /same building/i,
  /different departments/i,
  /colocation/i,
  /mistake[^.?]{0,50}(?:email|message)/i,
  /wrong[^.?]{0,30}(?:email|message)/i,
  /sent to the entire/i,
  /miscommunicat/i,
  /unintended/i,
  /new (?:project )?sponsor/i,
  /newly assigned sponsor/i,
  /new department/i,
  /new stakeholder/i,
  /requested to be involved/i,
  /stakeholder[^.,;]{0,60}(?:concern|unhappy|dissatisf)/i,
  /customer[^.,;]{0,50}(?:unhappy|complain|concern)/i,
  /not meeting[^.,;]{0,50}expect/i,
  /conflict[^.,;]{0,50}/i,
  /disagree(?:ment)?/i,
  /argument/i,
  /tension between/i,
  /change request/i,
  /risk register/i,
  /risk (?:has |)(?:materializ|occurred|happened)/i,
  /planned risk response/i,
  /scope creep/i,
  /over budget|behind schedule/i,
  /generalists? and specialists?/i,
  /specialized resources/i,
  /resource planning/i,
  /previously specialized/i,
  /continuous improvement/i,
  /retrospective/i,
  /minimum viable product|\bMVP\b/i,
  /stakeholder[^.,;]{0,50}/i,
  /escalat[^.,;]{0,40}/i,
  /\d+%[^.,;]{0,60}/i,
  /newly assigned|just assigned/i,
  /fixed period/i,
  /iterations?/i,
  /deliverables?/i,
  /government project/i,
  /highly skilled/i,
  /encourage them to join/i,
];

const PMI_SIGNAL_PATTERNS = [
  /\backnowledge(?:\s+the\s+mistake)?\b/gi,
  /\bapolog(?:ize|ise)\b/gi,
  /\btake responsibility\b/gi,
  /\bfacilitat(?:e|ion)\b/gi,
  /\bretrospective\b/gi,
  /\broot cause\b/gi,
  /\bcontinuous improvement\b/gi,
  /\bearly feedback\b/gi,
  /\bempower(?:ed|ment)?\b/gi,
  /\bcollaborat(?:e|ion|ive)\b/gi,
  /\bactively listen\b/gi,
  /\bone-on-one\b/gi,
  /\bstakeholder analysis\b/gi,
  /\bcommunications? management plan\b/gi,
  /\bstakeholder engagement plan\b/gi,
  /\brisk register\b/gi,
  /\bissue log\b/gi,
  /\bchange request\b/gi,
  /\bintegrated change control\b/gi,
  /\brequirements traceability matrix\b/gi,
  /\bproject charter\b/gi,
  /\bminimum viable product\b/gi,
  /\b(?:\bMVP\b)\b/gi,
  /\bservant leader(?:ship)?\b/gi,
  /\bconsensus\b/gi,
  /\bimpediment\b/gi,
  /\bset expectations\b/gi,
  /\bmanage expectations\b/gi,
  /\bconsult(?:ing)? the\b/gi,
  /\bmeet with\b/gi,
  /\bwork with\b/gi,
  /\bco-?design\b/gi,
  /\bcoach(?:ing)?\b/gi,
];

const TRAP_PATTERNS = [
  /\bignore\b/gi,
  /\bassume\b/gi,
  /\bdo nothing\b/gi,
  /\bdisregard\b/gi,
  /\bdelete (?:the )?(?:message|email)\b/gi,
  /\bwithout reading\b/gi,
  /\bescalat(?:e|ion)\b/gi,
  /\bask the sponsor\b/gi,
  /\b(?:mandate|command)\b/gi,
  /\bdirect(?:ed|ing)? the team\b/gi,
  /\bmicromanag\b/gi,
  /\brebaseline\b/gi,
  /\brevis(?:e|ing) the (?:plan|schedule|baseline)\b/gi,
  /\bmajority vote\b/gi,
  /\bvoting\b/gi,
  /\bexclude\b/gi,
  /\breduce scope\b/gi,
  /\bcut scope\b/gi,
  /\bwait until\b/gi,
  /\bpostpone\b/gi,
  /\bdelay\b/gi,
  /\bwithout (?:any )?action\b/gi,
  /\btell the team to\b/gi,
  /\bask the team to find\b/gi,
];

const PMBOK8_TERM_PATTERNS = [
  /\bLead accountably\b/gi,
  /\bBuild an empowered culture\b/gi,
  /\bFocus on value\b/gi,
  /\bEmbed quality\b/gi,
  /\bAdopt a holistic view\b/gi,
  /\bIntegrate sustainability\b/gi,
  /\bManage (?:Stakeholder Engagement|Team|Communications|Project Execution)\b/gi,
  /\bDevelop Team\b/gi,
  /\bPlan (?:Stakeholder Engagement|Risk Responses|Sourcing)\b/gi,
  /\bIdentify (?:Stakeholders|Risks)\b/gi,
  /\bPerform (?:Integrated Change Control|Risk Analysis)\b/gi,
  /\bPMBOK 8\b/gi,
  /\b(?:Governance|Stakeholders|Resources|Risk|Scope|Schedule|Finance)\b/g,
];

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyPatterns(html, patterns, cls) {
  let out = html;
  for (const re of patterns) {
    out = out.replace(re, (m) => `<span class="${cls}">${m}</span>`);
  }
  return out;
}

/** Strip existing highlight spans before re-applying (avoid nesting). */
function stripHighlights(html) {
  return String(html || "").replace(/<\/?span class="kw-[^"]*">/gi, "");
}

function extractStemSignals(text) {
  const found = [];
  const t = String(text || "");
  for (const re of STEM_SIGNAL_PATTERNS) {
    const m = t.match(re);
    if (!m) continue;
    const phrase = m[0].trim();
    if (phrase.length < 4) continue;
    if (found.some((f) => f.includes(phrase) || phrase.includes(f))) continue;
    found.push(phrase);
  }
  return found.slice(0, 10);
}

function replacePhraseOutsideSpans(html, phrase, cls) {
  if (!phrase || phrase.length < 4) return html;
  const wrapped = `<span class="${cls}">${phrase}</span>`;
  const parts = html.split(/(<span class="kw-[^"]*">[\s\S]*?<\/span>)/gi);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part.split(phrase).join(wrapped);
    })
    .join("");
}

function highlightExamCues(text) {
  let html = escapeHtml(text);
  return applyPatterns(html, EXAM_CUE_PATTERNS, "kw-cue");
}

/** Quiz stem: scenario signals (kw-signal) + exam directive (kw-cue). */
function highlightQuizStem(text) {
  const raw = String(text || "");
  let html = escapeHtml(raw);
  const signals = extractStemSignals(raw).sort((a, b) => b.length - a.length);
  for (const sig of signals) {
    const esc = escapeHtml(sig);
    if (html.includes(esc)) {
      html = replacePhraseOutsideSpans(html, esc, "kw-signal");
    }
  }
  html = applyPatternsOutsideSpans(html, EXAM_CUE_PATTERNS, "kw-cue");
  html = applyPatternsOutsideSpans(html, PMI_SIGNAL_PATTERNS, "kw-signal");
  return html;
}

function highlightOptionText(text, isCorrect) {
  let html = escapeHtml(text);
  if (isCorrect) {
    html = applyPatterns(html, PMI_SIGNAL_PATTERNS, "kw-signal");
  } else {
    html = applyPatterns(html, TRAP_PATTERNS, "kw-trap");
  }
  return html;
}

function applyPatternsOutsideSpans(html, patterns, cls) {
  const parts = html.split(/(<span class="kw-[^"]*">[\s\S]*?<\/span>)/gi);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      let out = part;
      for (const re of patterns) {
        out = out.replace(re, (m) => `<span class="${cls}">${m}</span>`);
      }
      return out;
    })
    .join("");
}

function highlightReasoning(text) {
  let html = stripHighlights(escapeHtml(text));
  html = applyPatterns(html, EXAM_CUE_PATTERNS, "kw-cue");
  html = applyPatterns(html, PMBOK8_TERM_PATTERNS, "kw-pmbok");
  html = applyPatternsOutsideSpans(html, PMI_SIGNAL_PATTERNS, "kw-signal");
  html = applyPatternsOutsideSpans(html, TRAP_PATTERNS, "kw-trap");
  return html;
}

function highlightPmbokTerms(text) {
  let html = escapeHtml(text);
  return applyPatterns(html, PMBOK8_TERM_PATTERNS, "kw-pmbok");
}

function mdInlineHighlighted(s) {
  return String(s || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${highlightReasoning(part.slice(2, -2))}</strong>`;
      }
      return highlightReasoning(part);
    })
    .join("");
}

module.exports = {
  extractStemSignals,
  highlightExamCues,
  highlightQuizStem,
  highlightOptionText,
  highlightReasoning,
  highlightPmbokTerms,
  mdInlineHighlighted,
};
