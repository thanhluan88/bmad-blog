const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
const libPath = path.join(__dirname, "lib/pmp-embedded-table-parsers.js");

const html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf("function isNumericTableCell");
const end = html.indexOf("function renderDataTable");
if (start < 0 || end < 0) throw new Error("Could not locate parser block in quiz HTML");

const block = html
  .slice(start, end)
  .trim()
  .replace(/^    /gm, "");

const lib = `/**
 * Embedded table parsers for PMP question stems (quiz + teach).
 * Synced to public/pmp/pmp-full-questions.html via scripts/sync-pmp-table-parsers-to-html.js
 */

${block}

function parseEmbeddedTableForStem(text) {
  return parseEmbeddedTable(text);
}

function renderStemTableHtml(table, escapeHtmlFn) {
  const esc =
    escapeHtmlFn ||
    ((s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"));
  const header = table.columns.map((col) => \`<th>\${esc(col)}</th>\`).join("");
  const bodyRows = table.rows
    .map(
      (row) =>
        \`<tr>\${row
          .map((cell, colIndex) => {
            const numClass =
              colIndex > 0 && isNumericTableCell(cell) ? ' class="num"' : "";
            return \`<td\${numClass}>\${esc(cell)}</td>\`;
          })
          .join("")}</tr>\`,
    )
    .join("");
  return \`<div class="score-table-wrap">
          <table class="score-table">
            <caption>\${esc(table.caption)}</caption>
            <thead><tr>\${header}</tr></thead>
            <tbody>\${bodyRows}</tbody>
          </table>
        </div>\`;
}

module.exports = {
  isNumericTableCell,
  parseEmbeddedTable,
  parseEmbeddedTableForStem,
  renderStemTableHtml,
};
`;

fs.writeFileSync(libPath, lib, "utf8");
console.log("Wrote", libPath);
