const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../public/pmp");
const re =
  /\r?\n\s*<a class="back-link secondary" href="pmp-full-questions\.html#q-\d+">Luyện câu \d+<\/a>/g;

let updated = 0;
fs.readdirSync(dir)
  .filter((f) => f.startsWith("pmp-teach-") && f.endsWith(".html"))
  .forEach(function (file) {
    const filePath = path.join(dir, file);
    const text = fs.readFileSync(filePath, "utf8");
    const next = text.replace(re, "");
    if (next !== text) {
      fs.writeFileSync(filePath, next);
      updated++;
      console.log("Removed: " + file);
    }
  });

console.log("Done. Updated " + updated + " files.");
