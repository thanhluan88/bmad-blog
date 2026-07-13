const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
const libPath = path.join(__dirname, "lib/pmp-embedded-table-parsers.js");

const html = fs.readFileSync(htmlPath, "utf8").replace(/\r\n/g, "\n");
const lib = fs.readFileSync(libPath, "utf8");

const fnStart = lib.indexOf("function isNumericTableCell");
const fnEnd = lib.indexOf("function parseEmbeddedTableForStem");
if (fnStart < 0 || fnEnd < 0) {
  throw new Error("Could not locate parser functions in lib");
}

const parserBlock = lib.slice(fnStart, fnEnd).trim();
const indented = parserBlock.replace(/^/gm, "    ");

const startMarker = "    function isNumericTableCell";
const endMarker = "    function renderDataTable";
const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
  throw new Error("Could not locate parser block in quiz HTML");
}

const nextHtml = html.slice(0, startIdx) + indented + "\n\n" + html.slice(endIdx);
fs.writeFileSync(htmlPath, nextHtml, "utf8");
console.log("Synced table parsers from lib to", htmlPath);
