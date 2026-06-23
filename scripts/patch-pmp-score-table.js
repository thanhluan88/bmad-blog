const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const cssBlock = `    .score-table-wrap {
      margin: 0.85rem 0 1rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: #fff;
    }
    .score-table {
      width: 100%;
      min-width: 520px;
      border-collapse: collapse;
      font-size: 0.92rem;
    }
    .score-table caption {
      caption-side: top;
      text-align: left;
      font-weight: 700;
      color: var(--primary);
      padding: 0.75rem 0.85rem 0.35rem;
    }
    .score-table th,
    .score-table td {
      border-bottom: 1px solid var(--border);
      padding: 0.6rem 0.7rem;
      vertical-align: top;
    }
    .score-table thead th {
      background: #eff6ff;
      color: var(--primary);
      font-size: 0.86rem;
      white-space: nowrap;
    }
    .score-table tbody tr:last-child td {
      border-bottom: none;
    }
    .score-table td:first-child {
      min-width: 11rem;
      font-weight: 500;
    }
    .score-table .num {
      text-align: center;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      min-width: 3rem;
    }
    .q-prompt {
      margin: 0.75rem 0 0;
    }`;

if (!html.includes(".score-table-wrap")) {
  html = html.replace("    .q-text { margin: 0; }", `    .q-text { margin: 0; }\n${cssBlock}`);
}

const helperBlock = `    function parseWeightedScoringTable(text) {
      const marker = "Weighted Scoring Model";
      const start = text.indexOf(marker);
      if (start < 0) return null;

      const section = text.slice(start);
      const questionMatch = section.match(/\\s+(What should[\\s\\S]*)$/i);
      if (!questionMatch) return null;

      const questionPrompt = questionMatch[1].trim();
      const tablePart = section.slice(marker.length, section.length - questionMatch[0].length);
      const headerMatch = tablePart.match(/Criteria\\s+Weight\\s+((?:Project\\s+\\d+\\s*)+)/i);
      if (!headerMatch) return null;

      const projects = [...headerMatch[1].matchAll(/Project\\s+(\\d+)/gi)].map(m => \`Project \${m[1]}\`);
      const numCols = 1 + projects.length;
      const criteriaList = [
        "Supports key business objectives",
        "Uses standard technology",
        "Can be completed within project timeframe",
        "Provides positive NPV",
      ];

      const bodyAfterHeader = tablePart.replace(/Criteria\\s+Weight\\s+(?:Project\\s+\\d+\\s*)+/i, "").trim();
      const rows = [];
      for (const criterion of criteriaList) {
        const pos = bodyAfterHeader.indexOf(criterion);
        if (pos < 0) continue;
        const after = bodyAfterHeader.slice(pos + criterion.length).trim();
        const numMatch = after.match(/^(\\d+(?:\\s+\\d+){0,10})/);
        if (!numMatch) continue;
        const nums = numMatch[1].trim().split(/\\s+/).map(Number);
        if (nums.length !== numCols) continue;
        rows.push({ criterion, weight: nums[0], scores: nums.slice(1) });
      }

      if (rows.length === 0) return null;
      return {
        intro: text.slice(0, start).trim(),
        rows,
        projects,
        questionPrompt,
      };
    }

    function renderQuestionBody(q) {
      const table = parseWeightedScoringTable(q.text);
      if (!table) {
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\`;
      }

      const headerCols = table.projects.map(p => escapeHtml(p)).join("</th><th>");
      const bodyRows = table.rows.map(row => \`
        <tr>
          <td class="highlightable" data-qid="\${q.id}" data-field="crit-\${escapeHtml(row.criterion).slice(0, 20)}">\${escapeHtml(row.criterion)}</td>
          <td class="num">\${row.weight}</td>
          \${row.scores.map(s => \`<td class="num">\${s}</td>\`).join("")}
        </tr>\`).join("");

      return \`
        \${table.intro ? \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(table.intro)}</p>\` : ""}
        <div class="score-table-wrap">
          <table class="score-table">
            <caption>Weighted Scoring Model</caption>
            <thead>
              <tr>
                <th>Tiêu chí</th>
                <th>Trọng số</th>
                <th>\${headerCols}</th>
              </tr>
            </thead>
            <tbody>\${bodyRows}</tbody>
          </table>
        </div>
        <p class="q-text q-prompt highlightable" data-qid="\${q.id}" data-field="text-prompt">\${escapeHtml(table.questionPrompt)}</p>\`;
    }`;

const insertBefore = "    function renderQuestion(q) {";
if (!html.includes("function parseWeightedScoringTable(text)")) {
  html = html.replace(insertBefore, `${helperBlock}\n\n${insertBefore}`);
}

const oldBodyLine = `          : \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\`}`;
const newBodyLine = `          : renderQuestionBody(q)}`;

if (html.includes(oldBodyLine)) {
  html = html.replace(oldBodyLine, newBodyLine);
} else if (!html.includes("renderQuestionBody(q)")) {
  throw new Error("Could not update renderQuestion to use renderQuestionBody");
}

fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
console.log("Patched weighted scoring table rendering in", filePath);
