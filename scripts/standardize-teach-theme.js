const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../public/pmp");

const REPLACEMENTS = [
  [
    "--primary: #7c3aed; --primary-dark: #5b21b6; --primary-bg: #f5f3ff;",
    "--primary: #d97706; --primary-dark: #b45309; --primary-bg: #fffbeb;",
  ],
  [
    "--primary: #2563eb; --primary-dark: #1d4ed8; --primary-bg: #eff6ff;",
    "--primary: #d97706; --primary-dark: #b45309; --primary-bg: #fffbeb;",
  ],
  [
    "--primary: #0d9488; --primary-dark: #0f766e; --primary-bg: #f0fdfa;",
    "--primary: #d97706; --primary-dark: #b45309; --primary-bg: #fffbeb;",
  ],
  ["border: 1px solid #ddd6fe;", "border: 1px solid #fde68a;"],
  ["border: 1px solid #bfdbfe;", "border: 1px solid #fde68a;"],
  ["border: 1px solid #99f6e4;", "border: 1px solid #fde68a;"],
  ["border-color: #ddd6fe;", "border-color: #fde68a;"],
  ["border-color: #bfdbfe;", "border-color: #fde68a;"],
  ["border-color: #99f6e4;", "border-color: #fde68a;"],
  ["background: #ede9fe;", "background: #fef9c3;"],
  ["background: #dbeafe;", "background: #fef9c3;"],
  ["background: #ccfbf1;", "background: #fef9c3;"],
];

let updated = 0;
fs.readdirSync(dir)
  .filter((f) => f.startsWith("pmp-teach-") && f.endsWith(".html"))
  .forEach(function (file) {
    const filePath = path.join(dir, file);
    let text = fs.readFileSync(filePath, "utf8");
    let next = text;
    REPLACEMENTS.forEach(function (pair) {
      next = next.split(pair[0]).join(pair[1]);
    });
    if (next !== text) {
      fs.writeFileSync(filePath, next);
      updated++;
      console.log("Themed: " + file);
    }
  });

console.log("Done. Themed " + updated + " files.");
