const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

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
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
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
        const json = source.slice(i, j + 1);
        return { json, start: i, end: j + 1 };
      }
    }
  }

  throw new Error("Unterminated QUESTIONS array");
}

const extracted = extractQuestionsArray(html);
const questions = JSON.parse(extracted.json);
const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
const log = [];

function note(id, msg) {
  log.push(`Q${id}: ${msg}`);
}

function stripCaseStudyRef(text) {
  return String(text || "")
    .replace(/\s*\(Refer to the case study\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripDropdownTail(text) {
  return String(text || "")
    .replace(/\s*\(?\s*Select from the drop-down list below\.?[\s\S]*$/i, "")
    .replace(/\s*1\.\s*Select one[\s\S]*$/i, "")
    .trim();
}

const DROPDOWN_FIXES = {
  286: [
    "Project charter",
    "Communications management plan",
    "Risk register",
    "Stakeholder engagement plan",
  ],
  777: ["Predictive", "Waterfall", "Agile", "Hybrid"],
  822: ["0.6", "0.8", "0.9", "1.25"],
  826: [
    "Cost performance index (CPI)",
    "Schedule variance (SV)",
    "Estimate to complete (ETC)",
    "Earned value (EV)",
  ],
  1123: ["Negotiation", "Mediation", "Litigation", "Arbitration"],
};

const DROPDOWN_LABELS = {
  286: {
    A: "A. Project charter",
    B: "B. Communications management plan",
    C: "C. Risk register",
    D: "D. Stakeholder engagement plan",
  },
  777: { C: "C. Agile" },
  822: { B: "B. 0.8" },
  826: { B: "B. Schedule variance (SV)" },
  1123: { A: "A. Negotiation" },
};

const IMAGE_CLICK_TO_MCQ = {
  103: {
    text:
      "A project team is preparing a RACI (responsible, accountable, consulted, informed) matrix for stakeholders on an upcoming project. The project manager reviews the chart and tells the team to add the customer as a stakeholder. Which person number on the RACI matrix aligns with the role of the customer?",
    options: [
      { key: "A", text: "Person 1" },
      { key: "B", text: "Person 2" },
      { key: "C", text: "Person 3" },
      { key: "D", text: "Person 4" },
    ],
    correct: "C",
    correctLabel: "C. Person 3",
  },
  474: {
    text:
      "The deployment of a solution at the client site has been delayed, impacting the project's delivery timeline. Which task under the Task column is delaying project delivery?",
    options: [
      { key: "A", text: "Design" },
      { key: "B", text: "Build" },
      { key: "C", text: "Finalize" },
      { key: "D", text: "Deploy" },
    ],
    correct: "C",
    correctLabel: "C. Finalize",
  },
  550: {
    text:
      "A project manager is reviewing the team's performance dashboard from the last 30 days with the team and stakeholders. The project manager reports that the team has delivered the sprint predictably and maintained a consistent pace. One stakeholder asks where on the dashboard that information is displayed. Which dashboard section best indicates the team delivered the sprint predictably and kept a consistent pace?",
    options: [
      { key: "A", text: "Burndown for PI 2 Sprint 2 (by Story Points)" },
      { key: "B", text: "Burndown for PI 2 Sprint 2 (by Story)" },
      { key: "C", text: "Cumulative Flow Diagram" },
      { key: "D", text: "EAPP-HBERP Cycle Time Chart" },
    ],
    correct: "A",
    correctLabel: "A. Burndown for PI 2 Sprint 2 (by Story Points)",
  },
  914: {
    text:
      "Select the risk classification that represents an unknown-unknown risk.",
    options: [
      { key: "A", text: "Unknown-Unknown (Emergent risk)" },
      { key: "B", text: "Unknown-Known (Hidden fact)" },
      { key: "C", text: "Known-Unknown (Classic risk)" },
      { key: "D", text: "Known-Known (Facts and requirements)" },
    ],
    correct: "A",
    correctLabel: "A. Unknown-Unknown (Emergent risk)",
  },
  1036: {
    text:
      "A project team is reviewing the iteration burndown chart with stakeholders. The team informed stakeholders that they had one day of access to a new technology that increased their velocity. The team would like to purchase the technology to improve productivity. The stakeholders asked the team to show them the impact of this technology on the iteration burndown chart. On which day did the team experience increased velocity?",
    options: [
      { key: "A", text: "Day 4" },
      { key: "B", text: "Day 5" },
      { key: "C", text: "Day 6" },
      { key: "D", text: "Day 7" },
    ],
    correct: "C",
    correctLabel: "C. Day 6",
  },
};

function parseDropdownFromText(q) {
  const text = q.text || "";
  const tailMatch =
    text.match(/Select one\s+(.+)$/i) ||
    text.match(/drop-down list below\.?\s*(?:\d+\.\s*)?Select one\s+(.+)$/i);
  if (!tailMatch) return null;

  const tail = tailMatch[1].trim();
  const numbers = tail.match(/\d+\.?\d*/g);
  if (numbers && numbers.length >= 2 && numbers.every((n) => /^\d/.test(n))) {
    return numbers;
  }

  const phrasePatterns = [
    /Project charter\s+Communications management plan\s+Risk register\s+Stakeholder engagement plan/i,
    /Predictive\s+Waterfall\s+Agile\s+Hybrid/i,
    /Negotiation\s+Mediation\s+Litigation\s+Arbitration/i,
    /Cost performance index \(CPI\)\s+Schedule variance \(SV\)\s+Estimate to complete \(ETC\)\s+Earned value \(EV\)/i,
  ];
  const phraseSplits = [
    [
      "Project charter",
      "Communications management plan",
      "Risk register",
      "Stakeholder engagement plan",
    ],
    ["Predictive", "Waterfall", "Agile", "Hybrid"],
    ["Negotiation", "Mediation", "Litigation", "Arbitration"],
    [
      "Cost performance index (CPI)",
      "Schedule variance (SV)",
      "Estimate to complete (ETC)",
      "Earned value (EV)",
    ],
  ];

  for (let i = 0; i < phrasePatterns.length; i++) {
    if (phrasePatterns[i].test(tail)) return phraseSplits[i];
  }

  if (q.dropdownOptions?.length === 1) {
    const single = q.dropdownOptions[0];
    if (single.split(" ").length >= 4) {
      const words = single.split(/\s+/);
      if (words.length === 4) return words;
      if (words.length === 8) {
        return [
          `${words[0]} ${words[1]} ${words[2]}`.trim(),
          `${words[3]} ${words[4]}`.trim(),
          `${words[5]} ${words[6]}`.trim(),
          `${words[7]} ${words[8] || ""}`.trim(),
        ].filter(Boolean);
      }
    }
  }

  return null;
}

function fixDropdown(q) {
  if (q.type !== "dropdown") return;

  const manual = DROPDOWN_FIXES[q.id];
  const parsed = manual || parseDropdownFromText(q);
  if (!parsed || parsed.length < 2) {
    note(q.id, "dropdown still unresolved");
    return;
  }

  q.dropdownOptions = parsed;
  q.text = stripDropdownTail(q.text);
  if (DROPDOWN_LABELS[q.id]?.[q.correct]) {
    q.correctLabel = DROPDOWN_LABELS[q.id][q.correct];
  } else {
    const idx = q.correct.charCodeAt(0) - 65;
    if (parsed[idx]) q.correctLabel = `${q.correct}. ${parsed[idx]}`;
  }
  note(q.id, `dropdown -> ${parsed.length} options`);
}

function fixCaseStudyRefs(q) {
  if (!/refer to the case study/i.test(q.text || "")) return;
  q.text = stripCaseStudyRef(q.text);
  note(q.id, "removed case study reference");
}

function fixImageClick(q) {
  const fix = IMAGE_CLICK_TO_MCQ[q.id];
  if (!fix || q.type !== "image_click") return;

  q.type = "mcq";
  q.text = fix.text;
  q.options = fix.options;
  q.correct = fix.correct;
  q.correctLabel = fix.correctLabel;
  q.dropdownOptions = [];
  note(q.id, "image_click -> mcq");
}

for (const q of questions) {
  fixCaseStudyRefs(q);
  fixDropdown(q);
  fixImageClick(q);
}

function auditQuestion(q) {
  const problems = [];
  if (/refer to the case study/i.test(q.text || "")) problems.push("case_study_ref");
  if (q.type === "dropdown") {
    const n = q.dropdownOptions?.length || 0;
    if (n < 2) problems.push("dropdown_too_few");
  }
  if (q.type === "image_click") problems.push("image_click");
  if (q.type === "mcq") {
    if (!q.options?.length) problems.push("mcq_no_options");
    if (q.options?.length === 1) problems.push("single_option");
    if (q.correct) {
      const keys = (q.options || []).map((o) => o.key);
      for (const k of String(q.correct).split(",")) {
        const trimmed = k.trim();
        if (trimmed && !keys.includes(trimmed)) problems.push(`bad_correct:${trimmed}`);
      }
    }
  }
  if (!q.correct && q.correct !== 0) problems.push("no_correct");
  return problems;
}

const remaining = questions.filter((q) => auditQuestion(q).length > 0);
if (remaining.length) {
  console.warn("Remaining issues:");
  for (const q of remaining) {
    console.warn(`  Q${q.id}: ${auditQuestion(q).join(", ")}`);
  }
} else {
  console.log("Audit passed: no remaining data issues.");
}

const json = JSON.stringify(questions);
html = `${html.slice(0, extracted.start)}${json}${html.slice(extracted.end)}`;
fs.writeFileSync(filePath, html, "utf8");

console.log(`Patched ${log.length} fixes in ${filePath}`);
for (const line of log) console.log(" -", line);
