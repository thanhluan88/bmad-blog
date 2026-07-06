const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-exam-latest.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const parserBlock = `    function parseAgileRoiRiskTables(text) {
      const reqHeader = /Item\\s+Priority\\s+ROI\\s*\\(\\$\\)/i;
      const riskHeader = /Risk\\s+Risk Impact\\s*\\(\\$\\)\\s+Risk Probability/i;
      if (!reqHeader.test(text) || !riskHeader.test(text)) return null;

      const intro = text.slice(0, text.search(reqHeader)).trim();
      const reqStart = text.search(reqHeader);
      const riskStart = text.search(riskHeader);
      const reqHeaderMatch = text.match(reqHeader);
      const riskHeaderMatch = text.match(riskHeader);
      if (!reqHeaderMatch || !riskHeaderMatch) return null;

      const reqBody = text.slice(reqStart + reqHeaderMatch[0].length, riskStart).trim();
      const promptMatch = text.match(/\\nWhat should[\\s\\S]*$/i);
      const riskBodyEnd = promptMatch ? promptMatch.index : text.length;
      const riskBody = text.slice(riskStart + riskHeaderMatch[0].length, riskBodyEnd).trim();
      const questionPrompt = promptMatch ? promptMatch[0].trim() : "";

      const reqRows = [];
      const reqRe = /Requirement\\s+(\\d+)\\s+(\\d+)\\s+([\\d,]+)/g;
      let match;
      while ((match = reqRe.exec(reqBody)) !== null) {
        reqRows.push([\`Requirement \${match[1]}\`, match[2], match[3]]);
      }

      const riskRows = [];
      const riskRe = /Risk\\s+(\\d+)\\s+([\\d,]+)\\s+(\\d+)/g;
      while ((match = riskRe.exec(riskBody)) !== null) {
        riskRows.push([\`Risk \${match[1]}\`, match[2], match[3]]);
      }

      if (!reqRows.length || !riskRows.length) return null;
      return {
        intro,
        tables: [
          {
            caption: "Requirements",
            columns: ["Item", "Priority", "ROI ($)"],
            rows: reqRows,
          },
          {
            caption: "Project risks",
            columns: ["Risk", "Risk Impact ($)", "Risk Probability"],
            rows: riskRows,
          },
        ],
        questionPrompt,
      };
    }

`;

const parseEmbeddedOld = `    function parseEmbeddedTable(text) {
      return (
        parseWeightedScoringTable(text) ||
        parseScheduleFragmentTable(text) ||
        parseTaskDurationTable(text) ||
        parseWorkPackageEvTable(text)
      );
    }`;

const parseEmbeddedNew = `${parserBlock}    function parseEmbeddedTable(text) {
      return (
        parseAgileRoiRiskTables(text) ||
        parseWeightedScoringTable(text) ||
        parseScheduleFragmentTable(text) ||
        parseTaskDurationTable(text) ||
        parseWorkPackageEvTable(text)
      );
    }`;

const renderBodyOld = `    function renderQuestionBody(q) {
      const table = parseEmbeddedTable(q.text);
      if (!table) {
        const chart = renderAgileChart(q);
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\${chart}\`;
      }

      return \`
        \${table.intro ? \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(table.intro)}</p>\` : ""}
        \${renderDataTable(table, q)}
        \${table.questionPrompt ? \`<p class="q-text q-prompt highlightable" data-qid="\${q.id}" data-field="text-prompt">\${escapeHtml(table.questionPrompt)}</p>\` : ""}\`;
    }`;

const renderBodyNew = `    function renderQuestionBody(q) {
      const table = parseEmbeddedTable(q.text);
      if (!table) {
        const chart = renderAgileChart(q);
        return \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\${chart}\`;
      }

      const tablesHtml = Array.isArray(table.tables)
        ? table.tables.map(t => renderDataTable(t, q)).join("")
        : renderDataTable(table, q);

      return \`
        \${table.intro ? \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(table.intro)}</p>\` : ""}
        \${tablesHtml}
        \${table.questionPrompt ? \`<p class="q-text q-prompt highlightable" data-qid="\${q.id}" data-field="text-prompt">\${escapeHtml(table.questionPrompt)}</p>\` : ""}\`;
    }`;

for (const [oldText, newText, label] of [
  [parseEmbeddedOld, parseEmbeddedNew, "parseEmbeddedTable"],
  [renderBodyOld, renderBodyNew, "renderQuestionBody"],
]) {
  if (html.includes(newText)) continue;
  if (!html.includes(oldText)) {
    throw new Error(`Missing expected block for ${label}`);
  }
  html = html.replace(oldText, newText);
}

fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");
console.log(`Patched ${filePath}`);
