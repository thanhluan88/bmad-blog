/**
 * After Kiểm tra: highlight signal phrases in question stem (same as teach lessons).
 */
const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const CSS_START = "/* PMP_STEM_SIGNAL_CSS_START */";
const CSS_END = "/* PMP_STEM_SIGNAL_CSS_END */";
const JS_START = "/* PMP_STEM_SIGNAL_JS_START */";
const JS_END = "/* PMP_STEM_SIGNAL_JS_END */";

const CSS = `${CSS_START}
    .q-text .kw-signal {
      background: #ecfdf5;
      color: #065f46;
      padding: 0.08rem 0.22rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .q-text .kw-cue {
      background: #fef9c3;
      color: #854d0e;
      padding: 0.1rem 0.25rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .q-text.stem-signals-shown { line-height: 1.65; }
${CSS_END}`;

const JS = `${JS_START}
    const STEM_CUE_PATTERNS = [
      /\\bwhat should the project manager do first\\b/gi,
      /\\bwhat should the project manager do next\\b/gi,
      /\\bwhat should the project manager do\\b/gi,
      /\\bwhat should the team do first\\b/gi,
      /\\bwhich (?:of the following )?(?:document|artifact|tool|technique)\\b/gi,
      /\\bwhich (?:of the following )?(?:is|are) (?:the )?(?:best|most appropriate)\\b/gi,
      /\\b(?:choose|select) (?:two|three|2|3|all that apply)\\b/gi,
      /\\b(?:first|next|best|worst|least|most|primarily|initially|not|except)\\b/gi,
    ];

    function parseSignalPhrasesFromExplanation(explanation) {
      const src = String(explanation || "");
      const marker = "**Signal trong stem**";
      const idx = src.indexOf(marker);
      if (idx < 0) return [];
      const after = src.slice(idx + marker.length).replace(/^\\n+/, "");
      const firstLine = after.split("\\n")[0]?.trim() || "";
      if (!firstLine.includes("·")) return [];
      return firstLine.split("·").map(p => p.trim()).filter(p => p.length > 3);
    }

    function stemReplaceOutsideSpans(html, phrase, cls) {
      if (!phrase || phrase.length < 4) return html;
      const wrapped = \`<span class="\${cls}">\${phrase}</span>\`;
      const parts = html.split(/(<span class="kw-[^"]*">[\\s\\S]*?<\\/span>)/gi);
      return parts
        .map((part, i) => (i % 2 === 1 ? part : part.split(phrase).join(wrapped)))
        .join("");
    }

    function stemApplyCuePatterns(html) {
      const parts = html.split(/(<span class="kw-[^"]*">[\\s\\S]*?<\\/span>)/gi);
      return parts
        .map((part, i) => {
          if (i % 2 === 1) return part;
          let out = part;
          for (const re of STEM_CUE_PATTERNS) {
            out = out.replace(re, m => \`<span class="kw-cue">\${m}</span>\`);
          }
          return out;
        })
        .join("");
    }

    function highlightQuizStemHtml(text, signalPhrases) {
      const phrases = (signalPhrases || []).filter(p => p && p.length > 3);
      if (!phrases.length) return escapeHtml(text);
      let html = escapeHtml(String(text || ""));
      const sorted = [...phrases].sort((a, b) => b.length - a.length);
      for (const sig of sorted) {
        const esc = escapeHtml(sig);
        if (html.includes(esc)) {
          html = stemReplaceOutsideSpans(html, esc, "kw-signal");
        }
      }
      return stemApplyCuePatterns(html);
    }

    function highlightQuestionStemSignals(q) {
      if (!q || q.type === "drag_drop") return;
      const phrases = Array.isArray(q.signalPhrases) && q.signalPhrases.length
        ? q.signalPhrases
        : parseSignalPhrasesFromExplanation(q.explanation);
      if (!phrases.length) return;
      const card = document.getElementById(\`q-\${q.id}\`);
      if (!card) return;
      card.querySelectorAll(".q-text").forEach(el => {
        const raw = el.textContent || "";
        if (!raw.trim()) return;
        el.innerHTML = highlightQuizStemHtml(raw, phrases);
        el.classList.add("stem-signals-shown");
      });
    }
${JS_END}`;

function stripStemSignalBlocks(html) {
  return html
    .replace(/\/\* PMP_STEM_SIGNAL_CSS_START \*\/[\s\S]*?\/\* PMP_STEM_SIGNAL_CSS_END \*\//g, "")
    .replace(/\/\* PMP_STEM_SIGNAL_JS_START \*\/[\s\S]*?\/\* PMP_STEM_SIGNAL_JS_END \*\//g, "");
}

function patchCheckQuestion(html) {
  const needle = `      updateStats();
      saveExamState();
    }

    function revealQuestion(id) { checkQuestion(id, true); }`;
  const replacement = `      highlightQuestionStemSignals(q);
      updateStats();
      saveExamState();
    }

    function revealQuestion(id) { checkQuestion(id, true); }`;
  if (html.includes("highlightQuestionStemSignals(q);")) return html;
  if (!html.includes(needle)) {
    throw new Error("checkQuestion anchor not found for stem signal highlight");
  }
  return html.replace(needle, replacement);
}

function patchStemSignalHighlight(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip stem signal (missing):", filePath);
    return;
  }

  let html = stripStemSignalBlocks(fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n"));

  const cssAnchor = ".q-text { margin: 0; }";
  if (!html.includes(cssAnchor)) {
    throw new Error(`q-text CSS anchor not found in ${filePath}`);
  }
  html = html.replace(cssAnchor, `${cssAnchor}\n${CSS}`);

  const jsAnchor = "    function checkQuestion(id, revealOnly=false) {";
  if (!html.includes(jsAnchor)) {
    throw new Error(`checkQuestion anchor not found in ${filePath}`);
  }
  if (!html.includes("function highlightQuestionStemSignals")) {
    html = html.replace(jsAnchor, `${JS}\n\n${jsAnchor}`);
  }
  html = patchCheckQuestion(html);

  fs.writeFileSync(filePath, html);
  console.log("Patched stem signal highlight:", path.basename(filePath));
}

if (require.main === module) {
  for (const file of FILES) patchStemSignalHighlight(file);
}

module.exports = { patchStemSignalHighlight, FILES };
