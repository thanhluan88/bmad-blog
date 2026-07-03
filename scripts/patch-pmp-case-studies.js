const fs = require("fs");
const path = require("path");

const MARKER = "PMP_CASE_STUDIES_ENABLED";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
];

const CASE_STUDIES_PATH = path.join(__dirname, "../data/pmp-case-studies.json");

function extractQuestionsArray(source) {
  const marker = "const QUESTIONS = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("QUESTIONS array not found");

  let i = start + marker.length;
  while (source[i] === " ") i += 1;
  if (source[i] !== "[") throw new Error("QUESTIONS array must start with [");

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
        };
      }
    }
  }

  throw new Error("Unterminated QUESTIONS array");
}

const caseStudies = JSON.parse(fs.readFileSync(CASE_STUDIES_PATH, "utf8"));
const questionToCaseStudy = {};
for (const [id, cs] of Object.entries(caseStudies)) {
  for (const qid of cs.questionIds || []) {
    questionToCaseStudy[qid] = id;
  }
}

const CASE_STUDIES_JS = JSON.stringify(
  Object.fromEntries(
    Object.entries(caseStudies).map(([id, cs]) => [
      id,
      { title: cs.title, paragraphs: cs.paragraphs },
    ]),
  ),
);

const CSS = `    .case-study {
      margin: 0 0 1rem;
      padding: 0.85rem 1rem;
      border: 1px solid #fde68a;
      border-left: 4px solid var(--primary);
      background: var(--warn-bg);
      border-radius: 0 8px 8px 0;
      font-size: 0.94rem;
      color: var(--text);
    }
    .case-study h4 {
      margin: 0 0 0.55rem;
      font-size: 0.92rem;
      color: var(--primary-dark);
    }
    .case-study p {
      margin: 0 0 0.65rem;
    }
    .case-study p:last-child {
      margin-bottom: 0;
    }
`;

const RENDER_FN = `    const PMP_CASE_STUDIES_ENABLED = true;
    const CASE_STUDIES = ${CASE_STUDIES_JS};

    function renderCaseStudy(caseStudyId) {
      const cs = CASE_STUDIES[caseStudyId];
      if (!cs) return "";
      const body = (cs.paragraphs || [])
        .map(p => \`<p class="highlightable" data-field="case-study">\${escapeHtml(p)}</p>\`)
        .join("");
      return \`<div class="case-study"><h4>\${escapeHtml(cs.title)}</h4>\${body}</div>\`;
    }

`;

const RENDER_QUESTION_OLD = `        </div>
        \${q.type === "drag_drop"
          ? ""
          : renderQuestionBody(q)}`;

const RENDER_QUESTION_NEW = `        </div>
        \${q.caseStudyId ? renderCaseStudy(q.caseStudyId) : ""}
        \${q.type === "drag_drop"
          ? ""
          : renderQuestionBody(q)}`;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

  const extracted = extractQuestionsArray(html);
  const questions = JSON.parse(extracted.json);
  let changed = 0;

  for (const q of questions) {
    const csId = questionToCaseStudy[q.id];
    if (!csId) {
      if (q.caseStudyId) {
        delete q.caseStudyId;
        changed += 1;
      }
      continue;
    }
    if (q.caseStudyId !== csId) {
      q.caseStudyId = csId;
      changed += 1;
    }
  }

  const nextQuestionsJson = JSON.stringify(questions);
  if (nextQuestionsJson !== extracted.json) {
    html = html.slice(0, extracted.start) + nextQuestionsJson + html.slice(extracted.end);
  }

  if (!html.includes(MARKER)) {
    if (!html.includes(".case-study {")) {
      html = html.replace("    .stats {", CSS + "    .stats {");
    }

    if (!html.includes("function renderCaseStudy")) {
      html = html.replace(
        "    function renderQuestionBody(q) {",
        RENDER_FN + "    function renderQuestionBody(q) {",
      );
    }

    if (!html.includes(RENDER_QUESTION_NEW)) {
      if (!html.includes(RENDER_QUESTION_OLD)) {
        throw new Error(`renderQuestion anchor not found in ${filePath}`);
      }
      html = html.replace(RENDER_QUESTION_OLD, RENDER_QUESTION_NEW);
    }
  }

  if (!html.includes(MARKER)) {
    throw new Error(`Failed to inject case study helpers in ${filePath}`);
  }

  fs.writeFileSync(filePath, html);
  console.log(
    `Patched ${path.basename(filePath)}: ${changed} question mappings, case studies: ${Object.keys(caseStudies).length}`,
  );
}
