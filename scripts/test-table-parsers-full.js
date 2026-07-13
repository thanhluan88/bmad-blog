const fs = require("fs");
const path = require("path");
const { parseEmbeddedTable } = require("./lib/pmp-embedded-table-parsers");

const qs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../public/pmp/pmp-full-questions.json"), "utf8"),
);

const expected = [164, 219, 441, 546, 547, 620, 626, 627, 629, 988, 989, 1001];
let failed = 0;

for (const id of expected) {
  const q = qs.find((x) => x.id === id);
  const table = parseEmbeddedTable(q?.text || "");
  if (!table?.rows?.length) {
    console.error("FAIL Q" + id);
    failed += 1;
    continue;
  }
  console.log("OK Q" + id + ":", table.caption, "(" + table.rows.length + " rows)");
}

if (failed) process.exit(1);
