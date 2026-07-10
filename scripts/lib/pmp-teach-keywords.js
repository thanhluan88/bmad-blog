/**
 * Highlight exam cues, PMI signal/trap words, and PMBOK 8 terms in teach lessons.
 */

const EXAM_CUE_PATTERNS = [
  /\bwhat should the project manager do first\b/gi,
  /\bwhat should the project manager do next\b/gi,
  /\bwhat should the project manager do\b/gi,
  /\bwhich (?:of the following )?(?:document|artifact|tool|technique)\b/gi,
  /\b(?:choose|select) (?:two|three|2|3|all that apply)\b/gi,
  /\b(?:first|next|best|worst|least|most|primarily|initially|not|except)\b/gi,
  /\bdrag and drop\b/gi,
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

function highlightExamCues(text) {
  let html = escapeHtml(text);
  return applyPatterns(html, EXAM_CUE_PATTERNS, "kw-cue");
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
  highlightExamCues,
  highlightOptionText,
  highlightReasoning,
  highlightPmbokTerms,
  mdInlineHighlighted,
};
