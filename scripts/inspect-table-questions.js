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

const qs = extractQuestionsArray(
  fs.readFileSync(path.join(__dirname, "../public/pmp/pmp-full-questions.html"), "utf8"),
);

for (const id of [301, 349, 350, 441, 611, 627, 629, 699, 754]) {
  const q = qs.find((x) => x.id === id);
  console.log("\n===== Q" + id + " =====");
  console.log(q.text);
}
