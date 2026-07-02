const fs = require("fs");
const path = require("path");

function extractQuestionsArray(source) {
  const marker = "const QUESTIONS = ";
  const start = source.indexOf(marker);
  let i = start + marker.length;
  while (source[i] === " ") i += 1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(i, j + 1));
    }
  }
  throw new Error("bad array");
}

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
const qs = extractQuestionsArray(fs.readFileSync(filePath, "utf8"));
const ids = [777, 454, 880, 43, 103, 914, 550, 822, 826];

for (const id of ids) {
  const q = qs.find((x) => x.id === id);
  console.log(`\nQ${id} [${q.type}] correct=${q.correct}`);
  if (q.dropdownOptions?.length) {
    q.dropdownOptions.forEach((t, i) =>
      console.log(`  ${String.fromCharCode(65 + i)}. ${t}`),
    );
  }
  if (q.options?.length) {
    q.options.forEach((o) => console.log(`  ${o.key}. ${o.text}`));
  }
}

console.log("\nimage_click:", qs.filter((q) => q.type === "image_click").length);
console.log("case study refs:", qs.filter((q) => /case study/i.test(q.text)).length);
