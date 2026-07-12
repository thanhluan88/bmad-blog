const fs = require("fs");
const path = require("path");

const MD_PATH = path.join(__dirname, "..", "PMP Exam - Lasted version 1.md");
const SUPPLEMENTS_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-supplements.json");
const PMBOK8_PATH = path.join(__dirname, "..", "data", "pmp-exam-latest-pmbok8-explanations.json");
const TEMPLATE_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-full-questions.html");
const OUT_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest.html");
const JSON_PATH = path.join(__dirname, "..", "public", "pmp", "pmp-exam-latest-questions.json");

const EXPECTED_COUNT = 1417;

const NOISE_PATTERNS = [
  /^## Page \d+$/,
  /^Topic \d+ - /,
  /^Topic \d+$/,
  /^Community vote distribution$/,
  /^Browse atleast/,
  /^Viewing /,
  /^---$/,
  /^4\/\d+\/\d+,/,
  /^PMP Exam - Free Actual Q&As/,
  /^https:\/\/www\.examtopics\.com\//,
  /^\d+\/\d+$/,
  /^> /,
  /^# PMP Exam/,
  /^Select and Place:$/,
  /^Hot Area:$/,
  /^_{3,}$/,
  /^$/,
];

const SPECIAL_PREFIX = /^(DRAG DROP|FILL BLANK|HOTSPOT)\s*-?\s*/i;

function isNoise(line) {
  const t = line.trim();
  if (!t) return true;
  return NOISE_PATTERNS.some((re) => re.test(t));
}

function cleanLines(lines) {
  return lines.filter((line) => !isNoise(line));
}

function joinParagraph(lines) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCorrectKeys(raw) {
  const s = String(raw || "").trim().toUpperCase();
  if (/^[A-Z]{2,}$/.test(s) && !/[,;\s]/.test(s)) {
    return s.split("");
  }
  return s.split(/[^A-Z]+/).filter(Boolean);
}

function buildCorrectLabel(options, keys) {
  return keys
    .map((k) => {
      const o = options.find((x) => x.key === k);
      return o ? `${k}. ${o.text}` : k;
    })
    .join(" · ");
}

function detectKind(lines) {
  const first = lines[0]?.trim() || "";
  const m = first.match(SPECIAL_PREFIX);
  if (!m) return { kind: "mcq", textLines: lines };
  return {
    kind: m[1].toLowerCase().replace(/\s+/g, "_"),
    textLines: lines.slice(1),
  };
}

function parseQuestionBlock(part, supplements) {
  const header = part.match(/^Question #(\d+)\s*/);
  if (!header) return null;

  const id = Number(header[1]);
  const supplement = supplements[String(id)];
  const body = part.slice(header[0].length);
  const answerMatch = body.match(/\nCorrect Answer:\s*(.*?)(?:\n|$)/);
  if (!answerMatch && !supplement) {
    console.warn(`Skip Q${id}: no correct answer`);
    return null;
  }

  const correctRaw = answerMatch ? answerMatch[1].trim() : "";
  const beforeAnswer = answerMatch ? body.slice(0, answerMatch.index) : body;
  const lines = cleanLines(beforeAnswer.split("\n"));
  const { kind, textLines } = detectKind(lines);

  const options = [];
  const stemLines = [];
  const optionRe = /^([A-E])\.\s*(.*)$/;

  for (const line of textLines) {
    const t = line.trim();
    const om = t.match(optionRe);
    if (om && (om[2] || options.length > 0)) {
      options.push({ key: om[1], text: om[2].trim() || `(Hình ảnh đáp án ${om[1]})` });
    } else {
      stemLines.push(t);
    }
  }

  const text = supplement?.text || joinParagraph(stemLines);

  if (supplement) {
    const q = {
      id,
      type: supplement.type || "mcq",
      text,
      options: supplement.options || options,
      dropdownOptions: supplement.dropdownOptions || [],
      dragTerms: supplement.dragTerms || [],
      dragSlots: supplement.dragSlots || (supplement.slotDescriptions?.length ?? 0),
      slotDescriptions: supplement.slotDescriptions || [],
      correct: supplement.correct,
      correctLabel: supplement.correctLabel || supplement.correct,
      explanation: supplement.explanation || supplement.correctLabel || supplement.correct,
      topic: "Topic 1",
    };
    if (!q.dragSlots && q.type === "drag_drop") {
      q.dragSlots = q.slotDescriptions.length;
    }
    return q;
  }

  if (options.length < 2) {
    console.warn(`Skip Q${id}: only ${options.length} options (no supplement)`);
    return null;
  }

  const correctKeys = parseCorrectKeys(correctRaw);
  const correct = correctKeys.join(",");
  const correctLabel = buildCorrectLabel(options, correctKeys);

  return {
    id,
    type: kind === "drag_drop" || kind === "hotspot" || kind === "fill_blank" ? "special" : "mcq",
    text,
    options,
    dropdownOptions: [],
    dragTerms: [],
    dragSlots: 0,
    slotDescriptions: [],
    correct,
    correctLabel,
    explanation: correctLabel,
    topic: "Topic 1",
  };
}

function parseQuestions(rawMd, supplements) {
  const md = rawMd.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = md.split(/(?=Question #\d+)/);
  const questions = [];

  for (const part of parts) {
    const q = parseQuestionBlock(part, supplements);
    if (q) questions.push(q);
  }

  questions.sort((a, b) => a.id - b.id);
  return questions;
}

function extractJsonFromHtml(html) {
  const marker = "const QUESTIONS = ";
  const start = html.indexOf(marker);
  if (start < 0) throw new Error("QUESTIONS marker not found");
  let i = start + marker.length;
  if (html[i] !== "[") throw new Error("Expected [ after QUESTIONS");
  let depth = 0;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return { start: start + marker.length, end: i + 1 };
    }
  }
  throw new Error("Unclosed QUESTIONS array");
}

const SLOT_DESCRIPTIONS_PATCH = `      if (Array.isArray(q.slotDescriptions) && q.slotDescriptions.length === slots && q.dragTerms.length) {
        const markerMatch = text.match(/Select and Place:|Drag[^:]*:|Match[^:]*:/i);
        const instruction = markerMatch
          ? text.slice(0, text.indexOf(markerMatch[0])).trim()
          : (text.trim() || "Chọn thuật ngữ phù hợp cho từng mô tả bên dưới.");
        const choices = q.dragTerms.map((term, i) => ({
          key: String.fromCharCode(65 + i),
          text: term,
        }));
        return {
          mode: "match",
          instruction,
          slots: q.slotDescriptions.map((description, i) => ({
            label: \`Mô tả \${i + 1}\`,
            description,
          })),
          choices,
        };
      }

`;

function patchDragDropModel(html) {
  if (html.includes("q.slotDescriptions") && html.includes('mode: "match"')) {
    return html;
  }
  const needle = "const slots = q.dragSlots;";
  const pos = html.indexOf(needle);
  if (pos < 0) {
    throw new Error("buildDragDropModel anchor not found");
  }
  const lineEnd = html.indexOf("\n", pos);
  const insertAt = lineEnd < 0 ? pos + needle.length : lineEnd + 1;
  return html.slice(0, insertAt) + SLOT_DESCRIPTIONS_PATCH + html.slice(insertAt);
}

function buildHtml(template, questions) {
  const json = JSON.stringify(questions);
  const { start, end } = extractJsonFromHtml(template);
  let html = template.slice(0, start) + json + template.slice(end);
  html = patchDragDropModel(html);

  const dragCount = questions.filter((q) => q.type === "drag_drop").length;
  const subtitle =
    `ExamTopics (Lasted version 1) — ${questions.length} câu (${dragCount} kéo-thả) — giải thích theo <strong>PMBOK 8</strong>. Chọn đáp án rồi nhấn <strong>Kiểm tra</strong> để xem phân tích. <a href="pmp-exam-latest-prep-lecture.html" style="color:#b45309;font-weight:600">📖 Bài phân tích đề ExamTopics</a>`;

  const replacements = [
    ["PMP Full Questions — Luyện tập trắc nghiệm", "PMP Exam Latest — Luyện tập trắc nghiệm"],
    ["<h1>PMP Full Questions</h1>", "<h1>PMP Exam Latest</h1>"],
    [
      "<p>Bộ gốc — 1123 câu — giải thích theo <strong>PMBOK 8</strong>. Chọn đáp án rồi nhấn <strong>Kiểm tra</strong> để xem phân tích.</p>",
      `<p>${subtitle}</p>`,
    ],
    ['max="1123"', `max="${questions.length}"`],
    ['"pmp-quiz-highlights-v1"', '"pmp-exam-latest-highlights-v1"'],
    ['"pmp-mock-exam-v1"', '"pmp-exam-latest-mock-exam-v1"'],
    ['"pmp-mock-exam-used-v1"', '"pmp-exam-latest-mock-exam-used-v1"'],
    ['pmp-question-stats-v1', "pmp-exam-latest-question-stats-v1"],
    ['const PMP_STATS_QUIZ_ID = "full"', 'const PMP_STATS_QUIZ_ID = "latest"'],
  ];

  for (const [from, to] of replacements) {
    html = html.split(from).join(to);
  }
  html = html.replace(
    /<p>Bộ gốc — \d+ câu[\s\S]*?<\/p>/,
    `<p>${subtitle}</p>`,
  );

  return html;
}

function loadPmbok8Explanations() {
  if (!fs.existsSync(PMBOK8_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(PMBOK8_PATH, "utf8"));
  } catch (err) {
    console.warn("Could not load PMBOK8 explanations:", err.message);
    return {};
  }
}

function mergePmbok8(questions, pmbok8) {
  if (!pmbok8 || !Object.keys(pmbok8).length) return questions;
  return questions.map((q) => {
    const entry = pmbok8[String(q.id)];
    if (!entry) return q;
    return {
      ...q,
      explanation: entry.explanation || q.explanation,
      pmbok8: entry.pmbok8 || q.pmbok8,
      references: entry.references || q.references,
    };
  });
}

function main() {
  const supplements = JSON.parse(fs.readFileSync(SUPPLEMENTS_PATH, "utf8"));
  const pmbok8 = loadPmbok8Explanations();
  const md = fs.readFileSync(MD_PATH, "utf8");
  let questions = parseQuestions(md, supplements);
  questions = mergePmbok8(questions, pmbok8);

  const ids = new Set(questions.map((q) => q.id));
  const missing = [];
  for (let id = 1; id <= EXPECTED_COUNT; id++) {
    if (!ids.has(id)) missing.push(id);
  }
  if (missing.length) {
    console.warn("Missing question IDs:", missing.join(", "));
  }

  const multi = questions.filter((q) => parseCorrectKeys(q.correct).length > 1).length;
  const drag = questions.filter((q) => q.type === "drag_drop").length;
  console.log(`Parsed ${questions.length} questions (${multi} multi-select, ${drag} drag-drop)`);

  fs.writeFileSync(JSON_PATH, JSON.stringify(questions, null, 0));
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const html = buildHtml(template, questions);
  fs.writeFileSync(OUT_PATH, html);
  console.log(`Wrote ${OUT_PATH} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
}

main();
