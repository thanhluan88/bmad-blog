const fs = require("fs");

function extractQuestionsArray(source) {
  const marker = "const QUESTIONS = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("QUESTIONS marker not found");

  let i = start + marker.length;
  while (source[i] === " ") i += 1;
  if (source[i] !== "[") throw new Error("Expected [ after QUESTIONS");

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
      if (depth === 0) {
        return {
          json: source.slice(i, j + 1),
          start: i,
          end: j + 1,
          questions: JSON.parse(source.slice(i, j + 1)),
        };
      }
    }
  }
  throw new Error("Unterminated QUESTIONS array");
}

function replaceQuestionsInHtml(html, questions) {
  const { start, end } = extractQuestionsArray(html);
  const json = JSON.stringify(questions);
  return html.slice(0, start) + json + html.slice(end);
}

function readQuestionsFromHtml(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  return extractQuestionsArray(html).questions;
}

function writeQuestionsToHtml(filePath, questions) {
  const html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  fs.writeFileSync(filePath, replaceQuestionsInHtml(html, questions));
}

function mergePmbok8IntoQuestions(questions, explanations) {
  return questions.map((q) => {
    const entry = explanations[String(q.id)];
    if (!entry) return q;
    return {
      ...q,
      explanation: entry.explanation || q.explanation,
      signalPhrases: entry.signalPhrases || q.signalPhrases,
      pmbok8: entry.pmbok8 || q.pmbok8,
      references: entry.references || q.references,
    };
  });
}

module.exports = {
  extractQuestionsArray,
  replaceQuestionsInHtml,
  readQuestionsFromHtml,
  writeQuestionsToHtml,
  mergePmbok8IntoQuestions,
};
