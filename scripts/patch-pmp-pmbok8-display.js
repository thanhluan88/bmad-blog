const fs = require("fs");
const path = require("path");
const { buildQuizHighlightBrowserJs, buildQuizHighlightCss } = require("./lib/pmp-teach-keywords");

const CSS_START = "/* PMP_PMBOK8_CSS_START */";
const CSS_END = "/* PMP_PMBOK8_CSS_END */";
const JS_START = "/* PMP_PMBOK8_JS_START */";
const JS_END = "/* PMP_PMBOK8_JS_END */";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const BLOCK = `${CSS_START}
    .pmbok8-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      margin: 0 0 0.35rem;
    }
    .pmbok8-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin: 0 0 0.85rem;
    }
    .pmbok8-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .pmbok8-badge.focus {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }
    .result .solution {
      white-space: normal;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .solution-card {
      border-radius: 10px;
      border: 1px solid var(--border);
      padding: 0.75rem 0.9rem;
      background: #fff;
    }
    .solution-card.mapping { background: #f0f9ff; border-color: #bae6fd; }
    .solution-card.why { background: #f0fdf4; border-color: #bbf7d0; }
    .solution-card.signal { background: #ecfdf5; border-color: #a7f3d0; }
    .solution-card.guide { background: #eff6ff; border-color: #bfdbfe; }
    .solution-card.reject { background: #fff; border-color: #e5e7eb; }
    .solution-card.refs { background: #fafafa; border-color: #e5e7eb; }
    .solution-card.original { background: #fffbeb; border-color: #fde68a; font-size: 0.92rem; line-height: 1.6; }
    .solution-card-title {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--primary-dark);
      margin: 0 0 0.5rem;
    }
    .solution-lead {
      margin: 0 0 0.65rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      background: #ecfdf5;
      border-left: 4px solid var(--ok);
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text);
    }
    .solution-lead strong { color: #047857; }
    .why-bullets {
      margin: 0.35rem 0 0;
      padding-left: 1.15rem;
      font-size: 0.92rem;
      line-height: 1.6;
    }
    .why-bullets li { margin: 0.25rem 0; }
    .signal-phrases {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
      line-height: 1.55;
    }
    .signal-phrases .kw-signal {
      background: #d1fae5;
      color: #065f46;
      padding: 0.08rem 0.22rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .signal-answer {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.55;
      color: var(--text);
    }
    .guide-quote {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.6;
      font-style: italic;
      color: var(--text);
    }
    .guide-attrib {
      margin: 0.5rem 0 0;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .mapping-grid {
      display: grid;
      grid-template-columns: 5.5rem 1fr;
      gap: 0.35rem 0.65rem;
      font-size: 0.88rem;
      margin: 0;
    }
    .mapping-grid dt {
      font-weight: 600;
      color: var(--muted);
      margin: 0;
    }
    .mapping-grid dd {
      margin: 0;
      color: var(--text);
    }
    .solution-text {
      margin: 0 0 0.45rem;
      font-size: 0.94rem;
      line-height: 1.65;
    }
    .solution-text:last-child { margin-bottom: 0; }
    .reject-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin: 0;
    }
    .reject-item {
      display: flex;
      gap: 0.55rem;
      align-items: flex-start;
      padding: 0.45rem 0.55rem;
      border-radius: 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
    }
    .reject-key {
      flex-shrink: 0;
      width: 1.55rem;
      height: 1.55rem;
      border-radius: 6px;
      background: #dc2626;
      color: #fff;
      font-weight: 700;
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .reject-body {
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.55;
      margin: 0;
    }
    .ref-list {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.88rem;
    }
    .ref-list li { margin: 0.25rem 0; }
    .solution-card a {
      color: #1d4ed8;
      word-break: break-word;
    }
${buildQuizHighlightCss()}
${CSS_END}`;

const HELPERS = `${JS_START}
    const PMP_PMBOK8_DISPLAY_ENABLED = true;
${buildQuizHighlightBrowserJs()}

    function renderPmbok8Badges(q) {
      const p8 = q.pmbok8;
      if (!p8) return "";
      const chips = [];
      for (const d of p8.domains || []) {
        chips.push(\`<span class="pmbok8-badge">\${escapeHtml(d)}</span>\`);
      }
      if (p8.focusArea) {
        chips.push(\`<span class="pmbok8-badge focus">\${escapeHtml(p8.focusArea)}</span>\`);
      }
      if (!chips.length) return "";
      return \`<div class="pmbok8-label">PMBOK 8</div><div class="pmbok8-badges">\${chips.join("")}</div>\`;
    }

    function inlineFormat(text) {
      return String(text || "")
        .split(/(\\*\\*[^*]+\\*\\*)/g)
        .map((part) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return \`<strong>\${highlightSolutionText(part.slice(2, -2))}</strong>\`;
          }
          return highlightSolutionText(part);
        })
        .join("")
        .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    function cardClassForHeading(heading) {
      const h = heading.toLowerCase();
      if (h.includes("pmbok 8 mapping")) return "mapping";
      if (h.includes("why this answer")) return "why";
      if (h.includes("reference solution")) return "why";
      if (h.includes("pmbok 8 reasoning")) return "why";
      if (h.includes("supplementary reasoning")) return "why";
      if (h.includes("vì sao") || h.includes("vi sao")) return "why";
      if (h.includes("giải thích dễ hiểu") || h.includes("giai thich de hieu")) return "why";
      if (h.includes("signal trong stem")) return "signal";
      if (h.includes("trích dẫn guide") || h.includes("trich dan guide")) return "guide";
      if (h.includes("exclude other options")) return "reject";
      if (h.includes("loại trừ") || h.includes("loai tru")) return "reject";
      if (h.includes("tham khảo") || h.includes("tham khao")) return "refs";
      if (h.includes("giải thích gốc") || h.includes("giai thich goc")) return "original";
      return "";
    }

    function renderMappingList(lines) {
      const labels = {
        domain: "Domain",
        "miền": "Domain",
        mien: "Domain",
        "focus area": "Focus Area",
        "vùng trọng tâm": "Focus Area",
        "vung trong tam": "Focus Area",
        process: "Process",
        "quy trình": "Process",
        "quy trinh": "Process",
        principle: "Principle",
        "nguyên tắc": "Principle",
        "nguyen tac": "Principle",
      };
      const rows = lines
        .map(line => line.trim().replace(/^-\\s+/, ""))
        .filter(Boolean)
        .map(line => {
          const m = line.match(/^([^:]+):\\s*(.+)$/);
          if (!m) return "";
          const key = m[1].trim().toLowerCase();
          const label = labels[key] || m[1].trim();
          return \`<dt>\${escapeHtml(label)}</dt><dd>\${inlineFormat(m[2].trim())}</dd>\`;
        })
        .filter(Boolean)
        .join("");
      return rows ? \`<dl class="mapping-grid">\${rows}</dl>\` : "";
    }

    function renderWhyBody(lines) {
      const parts = [];
      let bullets = [];
      const flush = () => {
        if (!bullets.length) return;
        parts.push(\`<ul class="why-bullets">\${bullets.join("")}</ul>\`);
        bullets = [];
      };
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^\\*\\*[^*]+\\*\\*$/.test(trimmed)) {
          flush();
          const sub = trimmed.replace(/^\\*\\*|\\*\\*$/g, "");
          parts.push(\`<div class="why-sub">\${escapeHtml(sub)}</div>\`);
        } else if (/^→/.test(line)) {
          flush();
          parts.push(\`<div class="solution-lead">\${inlineFormat(line.replace(/^→\\s*/, ""))}</div>\`);
        } else if (/^-\\s+/.test(line)) {
          bullets.push(\`<li>\${inlineFormat(line.replace(/^-\\s+/, ""))}</li>\`);
        } else {
          flush();
          parts.push(\`<p class="solution-text">\${inlineFormat(line)}</p>\`);
        }
      }
      flush();
      return parts.join("");
    }

    function renderSignalBody(lines) {
      const cleaned = lines.map(l => l.trim()).filter(Boolean);
      if (!cleaned.length) return "";
      let html = "";
      const phrasesLine = cleaned[0];
      if (phrasesLine.includes("·")) {
        const phraseParts = phrasesLine.split("·").map(p => p.trim()).filter(p => p.length > 3);
        if (phraseParts.length) {
          html += \`<p class="signal-phrases">\${phraseParts.map(p => \`<span class="kw-signal">\${escapeHtml(p)}</span>\`).join(" · ")}</p>\`;
        }
      }
      const answer = cleaned.length > 1
        ? cleaned.slice(1).join(" ")
        : (phrasesLine.includes("·") ? "" : phrasesLine);
      if (answer) {
        html += \`<p class="signal-answer">\${inlineFormat(answer)}</p>\`;
      }
      return html;
    }

    function renderGuideBody(lines) {
      const cleaned = lines.map(l => l.trim()).filter(Boolean);
      if (!cleaned.length) return "";
      const attrib = cleaned.find(l => /^—/.test(l) || (l.startsWith("-") && l.includes("PMBOK")));
      const quoteLines = cleaned.filter(l => l !== attrib);
      let quote = quoteLines.join(" ").replace(/^["“]|["”]$/g, "").trim();
      let html = "";
      if (quote) {
        html += \`<p class="guide-quote">"\${inlineFormat(quote)}"</p>\`;
      }
      if (attrib) {
        html += \`<p class="guide-attrib">\${inlineFormat(attrib.replace(/^—\\s*/, "— "))}</p>\`;
      }
      return html;
    }

    function renderRejectList(lines) {
      const items = lines
        .map(line => line.trim().replace(/^-\\s+/, ""))
        .filter(Boolean)
        .map(line => {
          const m = line.match(/^\\*\\*([A-E])\\*\\*:\\s*(.+)$/);
          if (!m) return \`<p class="solution-text">\${inlineFormat(line)}</p>\`;
          return \`<div class="reject-item"><span class="reject-key">\${escapeHtml(m[1])}</span><p class="reject-body">\${inlineFormat(m[2].trim())}</p></div>\`;
        })
        .join("");
      return \`<div class="reject-list">\${items}</div>\`;
    }

    function renderRefList(lines) {
      const items = lines
        .map(line => line.trim().replace(/^-\\s+/, ""))
        .filter(Boolean)
        .map(line => \`<li>\${inlineFormat(line)}</li>\`)
        .join("");
      return \`<ul class="ref-list">\${items}</ul>\`;
    }

    function renderSolutionSections(text) {
      const src = String(text || "").trim();
      if (!src) return "";
      const sections = [];
      let current = null;

      for (const block of src.split(/\\n\\n+/)) {
        const lines = block.split("\\n").map(l => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        if (lines.length === 1 && /^\\*\\*[^*]+\\*\\*$/.test(lines[0])) {
          if (current) sections.push(current);
          current = { heading: lines[0].replace(/^\\*\\*|\\*\\*$/g, ""), lines: [] };
          continue;
        }
        if (!current) {
          sections.push({ heading: "", lines });
        } else {
          current.lines.push(...lines);
        }
      }
      if (current) sections.push(current);

      return sections.map(section => {
        const cls = cardClassForHeading(section.heading);
        const title = section.heading
          ? \`<div class="solution-card-title">\${escapeHtml(section.heading)}</div>\`
          : "";
        let body = "";
        if (cls === "mapping") body = renderMappingList(section.lines);
        else if (cls === "why") body = renderWhyBody(section.lines);
        else if (cls === "signal") body = renderSignalBody(section.lines);
        else if (cls === "guide") body = renderGuideBody(section.lines);
        else if (cls === "reject") body = renderRejectList(section.lines);
        else if (cls === "refs") body = renderRefList(section.lines);
        else body = section.lines.map(line => \`<p class="solution-text">\${inlineFormat(line)}</p>\`).join("");
        const cardCls = cls ? \`solution-card \${cls}\` : "solution-card";
        return \`<section class="\${cardCls}">\${title}\${body}</section>\`;
      }).join("");
    }

    function renderSolution(q) {
      const badges = renderPmbok8Badges(q);
      const body = renderSolutionSections(q.explanation);
      if (body) return badges + body;
      return badges + \`<section class="solution-card"><p class="solution-text">\${escapeHtml(q.explanation || "")}</p></section>\`;
    }

${JS_END}`;

function stripOldPmbok8Blocks(html) {
  html = html.replace(/\/\* PMP_PMBOK8_CSS_START \*\/[\s\S]*?\/\* PMP_PMBOK8_CSS_END \*\//g, "");
  html = html.replace(/\/\* PMP_PMBOK8_JS_START \*\/[\s\S]*?\/\* PMP_PMBOK8_JS_END \*\//g, "");
  html = html.replace(/\/\* PMP_PMBOK8_DISPLAY_START \*\/[\s\S]*?\/\* PMP_PMBOK8_DISPLAY_END \*\//g, "");
  html = html.replace(
    /    const PMP_PMBOK8_DISPLAY_ENABLED = true;[\s\S]*?    function renderSolution\(q\) \{[\s\S]*?    \}\n\n/g,
    "",
  );
  html = html.replace(
    /\.pmbok8-badges \{[\s\S]*?\.solution-card a \{[\s\S]*?word-break: break-word;\n    \}\n/g,
    "",
  );
  return html;
}

function patchHighlightFix(html) {
  const oldApply = `    function applyStoredHighlights(el) {
      if (!el) return;`;
  const newApply = `    function applyStoredHighlights(el) {
      if (!el || el.dataset.field === "solution") return;`;
  if (html.includes(oldApply)) {
    html = html.replace(oldApply, newApply);
  }
  html = html.replace(
    `<div class="solution highlightable" data-qid="\${q.id}" data-field="solution">\${renderSolution(q)}</div>`,
    `<div class="solution" data-qid="\${q.id}" data-field="solution">\${renderSolution(q)}</div>`,
  );
  return html;
}

function patchTeachQuizSync(html) {
  html = html.replace(
    `function teachLessonHref(id) {
      return "pmp-teach-full-q" + id + ".html";
    }`,
    `function teachLessonHref(id) {
      if (typeof PMP_STATS_QUIZ_ID !== "undefined" && PMP_STATS_QUIZ_ID === "latest") return "";
      return "pmp-teach-full-q" + id + ".html";
    }`,
  );
  html = html.replace(
    `function renderTeachLink(id) {
      return \`<a class="q-teach-link" href="\${teachLessonHref(id)}" target="_blank" rel="noopener">📖 Bài giảng</a>\`;
    }`,
    `function renderTeachLink(id) {
      const href = teachLessonHref(id);
      if (!href) return "";
      return \`<a class="q-teach-link" href="\${href}" target="_blank" rel="noopener">📖 Bài giảng</a>\`;
    }`,
  );
  return html;
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    return;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  html = stripOldPmbok8Blocks(html);

  const cssAnchor = ".result .solution { color: var(--text); white-space: pre-wrap; }";
  if (!html.includes(cssAnchor)) {
    throw new Error(`solution CSS anchor not found in ${filePath}`);
  }
  html = html.replace(cssAnchor, `${cssAnchor}\n${BLOCK}`);

  const fnAnchor = "    function escapeHtml(s) {";
  if (!html.includes(fnAnchor)) {
    throw new Error(`escapeHtml anchor not found in ${filePath}`);
  }
  html = html.replace(fnAnchor, `${HELPERS}${fnAnchor}`);

  const oldSolution = `<div class="solution highlightable" data-qid="\${q.id}" data-field="solution">\${escapeHtml(q.explanation)}</div>`;
  const newSolution = `<div class="solution" data-qid="\${q.id}" data-field="solution">\${renderSolution(q)}</div>`;
  if (html.includes(oldSolution)) {
    html = html.replace(oldSolution, newSolution);
  } else if (!html.includes("renderSolution(q)}</div>")) {
    throw new Error(`renderQuestion solution anchor not found in ${filePath}`);
  }

  html = patchHighlightFix(html);
  html = patchTeachQuizSync(html);

  fs.writeFileSync(filePath, html);
  console.log("Patched PMBOK8 display:", path.basename(filePath));
}

const { patchStemSignalHighlight } = require("./patch-pmp-stem-signal-highlight");

for (const file of FILES) {
  patchFile(file);
  patchStemSignalHighlight(file);
}
