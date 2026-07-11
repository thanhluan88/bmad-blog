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

const SIGNAL_PHRASE_MAX_CHARS = 80;
const SIGNAL_PHRASE_MAX_WORDS = 12;
const SIGNAL_PHRASE_MAX_STEM_RATIO = 0.45;

const GENERIC_SIGNAL_PHRASES = [
  /^what should the project manager do(?:\s+first|\s+next)?\??$/i,
  /^what should the team do(?:\s+first|\s+next)?\??$/i,
  /^which (?:of the following )?(?:is|are) (?:the )?(?:best|most appropriate)/i,
];

function isGenericSignalPhrase(phrase) {
  const t = String(phrase || "").trim();
  return GENERIC_SIGNAL_PHRASES.some((re) => re.test(t));
}

function isValidSignalPhrase(stem, phrase) {
  const t = String(phrase || "").trim().replace(/\s+/g, " ");
  if (t.length < 8 || t.length > SIGNAL_PHRASE_MAX_CHARS) return false;
  if (t.split(/\s+/).length > SIGNAL_PHRASE_MAX_WORDS) return false;
  const maxRatio = stem.length < 100 ? 0.7 : SIGNAL_PHRASE_MAX_STEM_RATIO;
  if (stem && t.length > stem.length * maxRatio) return false;
  if (isGenericSignalPhrase(t)) return false;
  if (/^(?:A|An|The) \w+/i.test(t) && t.length > 42 && !/\b(?:aligns|vision|retrospective|overtime|well-defined|contract|stakeholder|sponsor|risk|change request|WIP|Kanban|unknown-unknown)\b/i.test(t)) {
    return false;
  }
  if (stem && !stem.toLowerCase().includes(t.toLowerCase())) return false;
  return true;
}

/** Keep 2–5 short keyword phrases from stem — not full sentences or entire question. */
function sanitizeSignalPhrases(stem, phrases) {
  const out = [];
  const seen = new Set();
  for (const raw of phrases || []) {
    let t = String(raw || "").trim().replace(/\s+/g, " ");
    if (!stem || !isValidSignalPhrase(stem, t)) continue;
    const idx = stem.toLowerCase().indexOf(t.toLowerCase());
    if (idx >= 0) t = stem.slice(idx, idx + t.length);
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 5) break;
  }
  return out;
}

const SIGNAL_KEYWORD_RE =
  /\b(?:align(?:s|ed)?(?: with)?|vision|expectations|sponsor|stakeholder|retrospective|overtime|experience|well-defined|change request|conflict|risk|scope|contract|vendor|procurement|first time|agile|iteration|backlog|budget|quality|delay|training|escalat|concern|issue|without|lacking|unable|discovered|agreed|requested|collaboration|branding|image|recognition|timeline|environmentally|public attention|business objectives|check-in|WIP|Kanban|demotivat|reluctant|SME|mistake|email|virtual|distributed|hybrid|inexperienced|defect|over budget|behind schedule|role change|reporting lines|team dynamics|disengage|productivity|tension|uncertainty|guidance|fluctuat|resource|members?|project manager)\b/i;

function wordChunkAround(text, keywordRe, before = 3, after = 5) {
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const window = words.slice(i, Math.min(words.length, i + 4)).join(" ");
    if (!keywordRe.test(window) && !keywordRe.test(words[i])) continue;
    const start = Math.max(0, i - before);
    const end = Math.min(words.length, i + after);
    return words.slice(start, end).join(" ");
  }
  return "";
}

const INLINE_SIGNAL_PATTERNS = [
  /\baligns with (?:its |the )?broader goals\b/gi,
  /\bvision and expectations throughout the project timeline\b/gi,
  /\borganization['']s image and brand recognition\b/gi,
  /\benvironmentally conscious branding\b/gi,
  /\bsignificant public attention\b/gi,
  /\bwell-defined remaining scope\b/gi,
  /\bmost appropriate contract type\b/gi,
  /\breplacement contractors\b/gi,
  /\bdid not have the required experience when they executed[^.?]{0,55}/gi,
  /\bIn the iteration retrospective, the team agreed\b/gi,
  /\bwork overtime to accomplish the goal\b/gi,
  /\bKanban board and work-in-progress \(WIP\) limits\b/gi,
  /\breluctant because they think that working on a team is demotivating[^.?]{0,40}/gi,
  /\bunknown-unknown risk\b/gi,
  /\brisk classification\b/gi,
  /\bknown-unknown risk\b/gi,
];

function extractKeywordSignalPhrases(stem) {
  const phrases = [];
  const seen = new Set();
  const add = (raw) => {
    let t = String(raw || "").trim().replace(/\s+/g, " ");
    if (!isValidSignalPhrase(stem, t)) return;
    const idx = stem.toLowerCase().indexOf(t.toLowerCase());
    if (idx < 0) return;
    t = stem.slice(idx, idx + t.length);
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    phrases.push(t);
  };

  for (const p of extractStemSignals(stem)) add(p);

  for (const re of INLINE_SIGNAL_PATTERNS) {
    const r = new RegExp(re.source, re.flags);
    let m;
    while ((m = r.exec(stem)) !== null) add(m[0]);
  }

  for (const frag of stem.split(/[,;]/)) {
    const t = frag.replace(/^[\s.?!]+|[\s.?!]+$/g, "").trim();
    if (!SIGNAL_KEYWORD_RE.test(t)) continue;
    if (t.length <= SIGNAL_PHRASE_MAX_CHARS) add(t);
    else {
      const chunk = wordChunkAround(t, SIGNAL_KEYWORD_RE);
      if (chunk) add(chunk);
    }
  }

  for (const sent of stem.split(/(?<=[.?!])\s+/)) {
    const clean = sent.replace(/[.?!]$/, "").trim();
    if (clean.length <= SIGNAL_PHRASE_MAX_CHARS && SIGNAL_KEYWORD_RE.test(clean)) add(clean);
    else if (clean.length > SIGNAL_PHRASE_MAX_CHARS) {
      const chunk = wordChunkAround(clean, SIGNAL_KEYWORD_RE);
      if (chunk) add(chunk);
    }
    if (phrases.length >= 5) break;
  }

  if (phrases.length < 2) {
    const words = stem.replace(/[.?!]$/, "").split(/\s+/);
    for (let size = 5; size <= 9 && phrases.length < 3; size++) {
      for (let i = 0; i <= words.length - size; i++) {
        const chunk = words.slice(i, i + size).join(" ");
        if (SIGNAL_KEYWORD_RE.test(chunk)) add(chunk);
        if (phrases.length >= 5) break;
      }
    }
  }

  if (phrases.length < 2) {
    for (const sent of stem.split(/(?<=[.?!])\s+/)) {
      if (/^what should/i.test(sent.trim())) continue;
      const clean = sent.replace(/[.?!]$/, "").trim();
      const words = clean.split(/\s+/);
      for (let size = 5; size <= Math.min(10, words.length); size++) {
        for (let i = 0; i <= words.length - size; i++) {
          add(words.slice(i, i + size).join(" "));
          if (phrases.length >= 2) break;
        }
        if (phrases.length >= 2) break;
      }
      if (phrases.length >= 2) break;
    }
  }

  return sanitizeSignalPhrases(stem, phrases).slice(0, 5);
}

function validateSignalPhrases(stem, phrases) {
  const errors = [];
  const list = Array.isArray(phrases) ? phrases : [];
  if (list.length < 2) errors.push("need at least 2 signalPhrases");
  for (const p of list) {
    if (!isValidSignalPhrase(stem, p)) {
      errors.push(`signal phrase too long or generic: "${String(p).slice(0, 60)}…"`);
    }
  }
  const sanitized = sanitizeSignalPhrases(stem, list);
  if (sanitized.length < 2) errors.push("fewer than 2 valid keyword signal phrases after sanitize");
  return { ok: errors.length === 0, errors, phrases: sanitized };
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

/** Quiz stem: AI signal phrases (English, kw-signal) + exam directive (kw-cue). */
function highlightQuizStem(text, signalPhrases) {
  const raw = String(text || "");
  let html = escapeHtml(raw);
  const phrases = (signalPhrases || []).filter((p) => p && p.length > 3);
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  for (const sig of sorted) {
    const esc = escapeHtml(sig);
    if (html.includes(esc)) {
      html = replacePhraseOutsideSpans(html, esc, "kw-signal");
    }
  }
  html = applyPatternsOutsideSpans(html, EXAM_CUE_PATTERNS, "kw-cue");
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

function regexToJson(re) {
  return { source: re.source, flags: re.flags };
}

/** Browser JS for Kiểm tra solution highlighting — same rules as teach mdInlineHighlighted. */
function buildQuizHighlightBrowserJs() {
  const payload = {
    examCue: EXAM_CUE_PATTERNS.map(regexToJson),
    pmbok: PMBOK8_TERM_PATTERNS.map(regexToJson),
    signal: PMI_SIGNAL_PATTERNS.map(regexToJson),
    trap: TRAP_PATTERNS.map(regexToJson),
  };
  return `
    const PMP_QUIZ_HIGHLIGHT = ${JSON.stringify(payload)};

    function compileHighlightPatterns(arr) {
      return (arr || []).map((p) => new RegExp(p.source, p.flags));
    }

    function stripSolutionHighlights(html) {
      return String(html || "").replace(/<\\/?span class="kw-[^"]*">/gi, "");
    }

    function applyHighlightPatterns(html, patterns, cls) {
      let out = html;
      for (const re of patterns) {
        out = out.replace(re, (m) => \`<span class="\${cls}">\${m}</span>\`);
      }
      return out;
    }

    function applyHighlightOutsideSpans(html, patterns, cls) {
      const parts = html.split(/(<span class="kw-[^"]*">[\\s\\S]*?<\\/span>)/gi);
      return parts
        .map((part, i) => {
          if (i % 2 === 1) return part;
          let out = part;
          for (const re of patterns) {
            out = out.replace(re, (m) => \`<span class="\${cls}">\${m}</span>\`);
          }
          return out;
        })
        .join("");
    }

    function highlightSolutionText(text) {
      let html = stripSolutionHighlights(escapeHtml(text));
      html = applyHighlightPatterns(html, compileHighlightPatterns(PMP_QUIZ_HIGHLIGHT.examCue), "kw-cue");
      html = applyHighlightPatterns(html, compileHighlightPatterns(PMP_QUIZ_HIGHLIGHT.pmbok), "kw-pmbok");
      html = applyHighlightOutsideSpans(html, compileHighlightPatterns(PMP_QUIZ_HIGHLIGHT.signal), "kw-signal");
      html = applyHighlightOutsideSpans(html, compileHighlightPatterns(PMP_QUIZ_HIGHLIGHT.trap), "kw-trap");
      return html;
    }
`;
}

/** CSS for kw-* inside Kiểm tra solution — matches teach lesson colors. */
function buildQuizHighlightCss() {
  return `
    .solution .kw-cue {
      background: #fef9c3;
      color: #854d0e;
      padding: 0.1rem 0.25rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .solution .kw-signal {
      background: #ecfdf5;
      color: #065f46;
      padding: 0.08rem 0.22rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .solution .kw-trap {
      background: #fef2f2;
      color: #991b1b;
      padding: 0.08rem 0.22rem;
      border-radius: 4px;
      font-weight: 500;
    }
    .solution .kw-pmbok {
      background: #fffbeb;
      color: #b45309;
      padding: 0.08rem 0.22rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .why-sub {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--primary-dark);
      margin: 0.65rem 0 0.25rem;
      letter-spacing: 0.01em;
    }
    .why-sub:first-child { margin-top: 0; }
`;
}

module.exports = {
  SIGNAL_PHRASE_MAX_CHARS,
  SIGNAL_PHRASE_MAX_WORDS,
  isValidSignalPhrase,
  sanitizeSignalPhrases,
  extractKeywordSignalPhrases,
  validateSignalPhrases,
  extractStemSignals,
  highlightExamCues,
  highlightQuizStem,
  highlightOptionText,
  highlightReasoning,
  highlightPmbokTerms,
  mdInlineHighlighted,
  buildQuizHighlightBrowserJs,
  buildQuizHighlightCss,
};
