const fs = require("fs");
const path = require("path");

const MARKER = "PMP_PMBOK8_DISPLAY_ENABLED";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const CSS = `    .pmbok8-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin: 0 0 0.75rem;
    }
    .pmbok8-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.18rem 0.55rem;
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
    }
    .result .solution .md-section {
      margin: 0 0 0.85rem;
    }
    .result .solution .md-section:last-child {
      margin-bottom: 0;
    }
    .result .solution .md-heading {
      font-weight: 700;
      color: var(--primary-dark);
      margin: 0 0 0.35rem;
      font-size: 0.9rem;
    }
    .result .solution ul {
      margin: 0.25rem 0 0;
      padding-left: 1.2rem;
    }
    .result .solution li {
      margin: 0.2rem 0;
    }
    .result .solution a {
      color: #1d4ed8;
      word-break: break-word;
    }
    .result .solution p {
      margin: 0 0 0.45rem;
    }
    .result .solution p:last-child {
      margin-bottom: 0;
    }
`;

const HELPERS = `    const PMP_PMBOK8_DISPLAY_ENABLED = true;

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
      return chips.length ? \`<div class="pmbok8-badges">\${chips.join("")}</div>\` : "";
    }

    function renderMarkdownLite(text) {
      const src = String(text || "").trim();
      if (!src) return "";
      const blocks = src.split(/\\n\\n+/);
      return blocks.map(block => {
        const lines = block.split("\\n");
        const isList = lines.every(l => /^-\\s+/.test(l.trim()) || !l.trim());
        if (lines.length === 1 && /^\\*\\*[^*]+\\*\\*$/.test(lines[0].trim())) {
          const heading = lines[0].trim().replace(/^\\*\\*|\\*\\*$/g, "");
          return \`<div class="md-section"><div class="md-heading">\${escapeHtml(heading)}</div></div>\`;
        }
        if (isList && lines.some(l => /^-\\s+/.test(l.trim()))) {
          const items = lines
            .filter(l => /^-\\s+/.test(l.trim()))
            .map(l => {
              let item = l.trim().replace(/^-\\s+/, "");
              item = item.replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
              item = item.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
              return \`<li>\${item}</li>\`;
            })
            .join("");
          return \`<div class="md-section"><ul>\${items}</ul></div>\`;
        }
        let para = block
          .replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>")
          .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        return \`<div class="md-section"><p>\${para}</p></div>\`;
      }).join("");
    }

    function renderSolution(q) {
      const body = renderMarkdownLite(q.explanation);
      const badges = renderPmbok8Badges(q);
      return badges + (body || \`<p>\${escapeHtml(q.explanation || "")}</p>\`);
    }

`;

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    return;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

  if (html.includes(MARKER)) {
    console.log("Already patched:", path.basename(filePath));
    return;
  }

  if (!html.includes(".result .solution { color: var(--text); white-space: pre-wrap; }")) {
    throw new Error(`solution CSS anchor not found in ${filePath}`);
  }

  html = html.replace(
    ".result .solution { color: var(--text); white-space: pre-wrap; }",
    `.result .solution { color: var(--text); white-space: pre-wrap; }\n${CSS.trim()}`,
  );

  const fnAnchor = "    function escapeHtml(s) {";
  if (!html.includes(fnAnchor)) {
    throw new Error(`escapeHtml anchor not found in ${filePath}`);
  }
  html = html.replace(fnAnchor, `${HELPERS}${fnAnchor}`);

  const oldSolution = `<div class="solution highlightable" data-qid="\${q.id}" data-field="solution">\${escapeHtml(q.explanation)}</div>`;
  const newSolution = `<div class="solution highlightable" data-qid="\${q.id}" data-field="solution">\${renderSolution(q)}</div>`;

  if (!html.includes(oldSolution)) {
    throw new Error(`renderQuestion solution anchor not found in ${filePath}`);
  }
  html = html.replace(oldSolution, newSolution);

  if (!html.includes(MARKER)) {
    throw new Error(`Failed to inject PMBOK8 display helpers in ${filePath}`);
  }

  fs.writeFileSync(filePath, html);
  console.log("Patched PMBOK8 display:", path.basename(filePath));
}

for (const file of FILES) {
  patchFile(file);
}
