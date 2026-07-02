const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const oldBlockStart = "    function parseWeightedScoringTable(text) {";
const oldBlockEnd = "    function renderQuestion(q) {";

const startIdx = html.indexOf(oldBlockStart);
const endIdx = html.indexOf(oldBlockEnd);
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
  throw new Error("Could not locate table render block to replace");
}

const newBlock = `    function isNumericTableCell(cell) {
      return /^[\\d,.]+$/.test(String(cell).trim());
    }

    function parseWeightedScoringTable(text) {
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
        rows.push([criterion, String(nums[0]), ...nums.slice(1).map(String)]);
      }

      if (rows.length === 0) return null;
      return {
        intro: text.slice(0, start).trim(),
        questionPrompt,
        caption: "Weighted Scoring Model",
        columns: ["Criteria", "Weight", ...projects],
        rows,
      };
    }

    function parseScheduleFragmentTable(text) {
      const headerRe = /ID\\s+Activity\\s+Predecessor\\(s\\)\\s+Original\\s+Duration\\s*\\(days\\)\\s+Original\\s+Finish\\s+Notes/i;
      const headerMatch = text.match(headerRe);
      if (!headerMatch) return null;

      const intro = text.slice(0, headerMatch.index).trim();
      const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
      const promptMatch =
        body.match(/\\s+(A key stakeholder[\\s\\S]*)$/i) ||
        body.match(/\\s+(What should[\\s\\S]*)$/i) ||
        body.match(/\\s+(The project manager[\\s\\S]*)$/i);
      const tableBody = promptMatch
        ? body.slice(0, body.length - promptMatch[0].length).trim()
        : body;
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const rowRe = /([A-Z])\\s+(.+?)\\s+([\\u2212\\-]|(?:[A-Z](?:,\\s*[A-Z])*))\\s+(\\d+)\\s+(Day\\s+\\d+)\\s+(.+?)(?=\\s+[A-Z]\\s+[A-Za-z]|$)/g;
      const rows = [];
      let match;
      while ((match = rowRe.exec(tableBody)) !== null) {
        rows.push([
          match[1],
          match[2].trim(),
          match[3].trim(),
          match[4],
          match[5].trim(),
          match[6].trim(),
        ]);
      }

      if (rows.length === 0) return null;
      return {
        intro,
        questionPrompt,
        caption: "Schedule fragment",
        columns: [
          "ID",
          "Activity",
          "Predecessor(s)",
          "Duration (days)",
          "Original Finish",
          "Notes",
        ],
        rows,
      };
    }

    function parseTaskDurationTable(text) {
      const headerRe = /Task\\s+Duration\\s+Start\\s+Predecessor\\(s\\)/i;
      const headerMatch = text.match(headerRe);
      if (!headerMatch) return null;

      const intro = text.slice(0, headerMatch.index).trim();
      const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
      const promptMatch = body.match(/\\s+(What[\\s\\S]*)$/i);
      const tableBody = promptMatch
        ? body.slice(0, body.length - promptMatch[0].length).trim()
        : body;
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const rowRe = /([A-Z])\\s+(\\d+\\s+days)\\s+(.+?)(?=\\s+[A-Z]\\s+\\d+\\s+days|\\s+What\\s+is|$)/g;
      const rows = [];
      let match;
      while ((match = rowRe.exec(tableBody)) !== null) {
        const rest = match[3].trim();
        if (rest.startsWith("Project start")) {
          rows.push([
            match[1],
            match[2],
            "Project start",
            rest.includes("None") ? "None" : "—",
          ]);
        } else {
          rows.push([match[1], match[2], rest, "—"]);
        }
      }

      if (rows.length === 0) return null;
      return {
        intro,
        questionPrompt,
        caption: "Activities and durations",
        columns: ["Task", "Duration", "Start", "Predecessor(s)"],
        rows,
      };
    }

    function parseWorkPackageEvTable(text) {
      const headerRe = /Work Package\\s+Planned Value\\s*\\(PV\\)\\s+Earned Value\\s*\\(P[V E]\\)/i;
      const headerMatch = text.match(headerRe);
      if (!headerMatch) return null;

      const intro = text.slice(0, headerMatch.index).trim();
      const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
      const promptMatch =
        body.match(/\\s+(Based on[\\s\\S]*)$/i) ||
        body.match(/\\s+(What[\\s\\S]*)$/i);
      const tableBody = promptMatch
        ? body.slice(0, body.length - promptMatch[0].length).trim()
        : body;
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const rowRe = /([A-Za-z][A-Za-z\\s]*?)\\s+([\\d,]+)\\s+([\\d,]+)/g;
      const rows = [];
      let match;
      while ((match = rowRe.exec(tableBody)) !== null) {
        const name = match[1].trim();
        if (/work package|planned value|earned value/i.test(name)) continue;
        rows.push([name, match[2], match[3]]);
      }

      if (rows.length === 0) return null;
      return {
        intro,
        questionPrompt,
        caption: "Work package performance (USD)",
        columns: ["Work Package", "Planned Value (PV)", "Earned Value (EV)"],
        rows,
      };
    }

    function parseEmbeddedTable(text) {
      return (
        parseWeightedScoringTable(text) ||
        parseScheduleFragmentTable(text) ||
        parseTaskDurationTable(text) ||
        parseWorkPackageEvTable(text)
      );
    }

    function renderDataTable(table, q) {
      const header = table.columns.map(col => \`<th>\${escapeHtml(col)}</th>\`).join("");
      const bodyRows = table.rows.map((row, rowIndex) => \`
        <tr>\${row.map((cell, colIndex) => {
          const numClass = colIndex > 0 && isNumericTableCell(cell) ? " num" : "";
          return \`<td class="highlightable\${numClass}" data-qid="\${q.id}" data-field="tbl-\${rowIndex}-\${colIndex}">\${escapeHtml(cell)}</td>\`;
        }).join("")}</tr>\`).join("");

      return \`
        <div class="score-table-wrap">
          <table class="score-table">
            <caption>\${escapeHtml(table.caption)}</caption>
            <thead><tr>\${header}</tr></thead>
            <tbody>\${bodyRows}</tbody>
          </table>
        </div>\`;
    }

    function renderQuestionBody(q) {
      const table = parseEmbeddedTable(q.text);
      if (!table) {
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\`;
      }

      return \`
        \${table.intro ? \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(table.intro)}</p>\` : ""}
        \${renderDataTable(table, q)}
        \${table.questionPrompt ? \`<p class="q-text q-prompt highlightable" data-qid="\${q.id}" data-field="text-prompt">\${escapeHtml(table.questionPrompt)}</p>\` : ""}\`;
    }

`;

html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);

if (!html.includes("function parseScheduleFragmentTable(text)")) {
  throw new Error("Patch failed: parseScheduleFragmentTable not found");
}

fs.writeFileSync(filePath, html, "utf8");
console.log("Patched embedded data table rendering in", filePath);
