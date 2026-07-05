const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8");
html = html.replace(/\r\n/g, "\n");

const cssBlock = `    .notice.multi-select-hint {
      margin-top: 0;
      margin-bottom: 0.55rem;
      padding: 0.55rem 0.75rem;
      font-size: 0.88rem;
    }
    .badge.multi {
      background: #fef3c7;
      color: #92400e;
    }`;

if (!html.includes(".notice.multi-select-hint")) {
  html = html.replace(
    /    \.notice \{[\s\S]*?      font-size: 0\.92rem;\n    \}/,
    (match) => `${match}\n${cssBlock}`,
  );
}

const replacements = [
  [
    `    function renderOptions(q) {
      if (q.type === "mcq" && q.options.length) {
        return \`<div class="options">\${q.options.map(o => \`
          <label class="option" data-q="\${q.id}" data-key="\${o.key}">
            <input type="radio" name="q-\${q.id}" value="\${o.key}" />
            <span class="highlightable" data-qid="\${q.id}" data-field="opt-\${o.key}"><strong>\${o.key}.</strong> \${escapeHtml(o.text)}</span>
          </label>\`).join("")}</div>\`;
      }`,
    `    function renderOptions(q) {
      if (q.type === "mcq" && q.options.length) {
        const multi = isMultiSelect(q);
        const inputType = multi ? "checkbox" : "radio";
        const hint = multi
          ? \`<div class="notice multi-select-hint">Chọn đúng \${requiredMultiSelectCount(q)} đáp án (phải chọn đủ \${requiredMultiSelectCount(q)} mới chấm điểm).</div>\`
          : "";
        return \`<div class="options">\${hint}\${q.options.map(o => \`
          <label class="option" data-q="\${q.id}" data-key="\${o.key}">
            <input type="\${inputType}" name="q-\${q.id}" value="\${o.key}" />
            <span class="highlightable" data-qid="\${q.id}" data-field="opt-\${o.key}"><strong>\${o.key}.</strong> \${escapeHtml(o.text)}</span>
          </label>\`).join("")}</div>\`;
      }`,
  ],
  [
    `    function renderQuestion(q) {
      const badge = q.type !== "mcq" ? \`<span class="badge">\${q.type}</span>\` : "";`,
    `    function renderQuestion(q) {
      const badge = q.type !== "mcq"
        ? \`<span class="badge">\${q.type}</span>\`
        : isMultiSelect(q)
          ? \`<span class="badge multi">Chọn nhiều</span>\`
          : "";`,
  ],
  [
    `    function normalizeAnswer(s) {
      return String(s || "").replace(/\\s+/g, "").toUpperCase();
    }

    function answersMatch(q, userAnswer) {
      return normalizeAnswer(userAnswer) === normalizeAnswer(q.correct);
    }

    function getAnswer(q) {
      if (q.type === "drag_drop" && q.dragSlots) {
        const picks = [];
        for (let i = 0; i < q.dragSlots; i++) {
          const el = document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${i}"]\`);
          picks.push(el ? el.value : "");
        }
        return picks.join(",");
      }
      const picked = document.querySelector(\`input[name="q-\${q.id}"]:checked\`);
      return picked ? picked.value : "";
    }

    function setAnswerHighlight(q, userAnswer) {
      const correct = (q.correct || "").toUpperCase();
      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (key === userAnswer) lbl.classList.add("selected");
          if (key === correct) lbl.classList.add("correct");
          else if (key === userAnswer && userAnswer !== correct) lbl.classList.add("incorrect");
        });
      }
    }`,
    `    function normalizeAnswer(s) {
      return String(s || "").replace(/\\s+/g, "").toUpperCase();
    }

    function parseAnswerKeys(s) {
      return String(s || "").toUpperCase().split(/[^A-Z]+/).filter(Boolean).sort();
    }

    function formatAnswerKeys(keys) {
      return parseAnswerKeys(keys.join(",")).join(",");
    }

    function isMultiSelect(q) {
      return q.type === "mcq" && parseAnswerKeys(q.correct).length > 1;
    }

    function requiredMultiSelectCount(q) {
      return parseAnswerKeys(q.correct).length;
    }

    function isMultiSelectComplete(q, answer) {
      if (!isMultiSelect(q)) return true;
      return parseAnswerKeys(answer).length === requiredMultiSelectCount(q);
    }

    function answersMatch(q, userAnswer) {
      if (isMultiSelect(q)) {
        return formatAnswerKeys(parseAnswerKeys(userAnswer)) === formatAnswerKeys(parseAnswerKeys(q.correct));
      }
      return normalizeAnswer(userAnswer) === normalizeAnswer(q.correct);
    }

    function getAnswer(q) {
      if (q.type === "drag_drop" && q.dragSlots) {
        const picks = [];
        for (let i = 0; i < q.dragSlots; i++) {
          const el = document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${i}"]\`);
          picks.push(el ? el.value : "");
        }
        return picks.join(",");
      }
      if (isMultiSelect(q)) {
        return Array.from(document.querySelectorAll(\`input[name="q-\${q.id}"]:checked\`))
          .map(el => el.value)
          .sort()
          .join(",");
      }
      const picked = document.querySelector(\`input[name="q-\${q.id}"]:checked\`);
      return picked ? picked.value : "";
    }

    function setAnswerHighlight(q, userAnswer) {
      const correctKeys = parseAnswerKeys(q.correct);
      const userKeys = parseAnswerKeys(userAnswer);
      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (userKeys.includes(key)) lbl.classList.add("selected");
          if (correctKeys.includes(key)) lbl.classList.add("correct");
          else if (userKeys.includes(key)) lbl.classList.add("incorrect");
        });
      }
    }`,
  ],
  [
    "setAnswerHighlight(q, userAnswer.toUpperCase());",
    "setAnswerHighlight(q, userAnswer);",
  ],
  [
    `        if (q.type === "drag_drop") {
          saved.split(",").forEach((val, idx) => {
            const el = document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${idx}"]\`);
            if (el) el.value = val;
          });
        } else {
          const input = document.querySelector(\`input[name="q-\${q.id}"][value="\${saved}"]\`);
          if (input) input.checked = true;
        }`,
    `        if (q.type === "drag_drop") {
          saved.split(",").forEach((val, idx) => {
            const el = document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${idx}"]\`);
            if (el) el.value = val;
          });
        } else if (isMultiSelect(q)) {
          saved.split(",").filter(Boolean).forEach(val => {
            const input = document.querySelector(\`input[name="q-\${q.id}"][value="\${val}"]\`);
            if (input) input.checked = true;
          });
        } else {
          const input = document.querySelector(\`input[name="q-\${q.id}"][value="\${saved}"]\`);
          if (input) input.checked = true;
        }`,
  ],
  [
    `    document.addEventListener("change", e => {
      const t = e.target;
      if (t.matches('input[type="radio"]')) {
        const qid = Number(t.name.replace("q-", ""));
        state.answers[qid] = t.value;
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(l => l.classList.remove("selected"));
        const lbl = t.closest("label.option");
        if (lbl) lbl.classList.add("selected");
      }
      if (t.matches("select[data-q]")) {
        const qid = Number(t.dataset.q);
        state.answers[qid] = getAnswer(QUESTIONS.find(x => x.id === qid));
      }
    });`,
    `    document.addEventListener("change", e => {
      const t = e.target;
      if (t.matches('input[type="radio"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        state.answers[qid] = t.value;
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(l => l.classList.remove("selected"));
        const lbl = t.closest("label.option");
        if (lbl) lbl.classList.add("selected");
      }
      if (t.matches('input[type="checkbox"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        const q = QUESTIONS.find(x => x.id === qid);
        if (!q) return;
        state.answers[qid] = getAnswer(q);
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(lbl => {
          lbl.classList.toggle("selected", !!lbl.querySelector("input:checked"));
        });
      }
      if (t.matches("select[data-q]")) {
        const qid = Number(t.dataset.q);
        state.answers[qid] = getAnswer(QUESTIONS.find(x => x.id === qid));
      }
    });`,
  ],
];

for (const [oldText, newText] of replacements) {
  if (html.includes(newText)) continue;
  if (!html.includes(oldText)) {
    throw new Error(`Missing expected block:\n${oldText.slice(0, 120)}...`);
  }
  html = html.replace(oldText, newText);
}

fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");

const questions = JSON.parse(html.match(/const QUESTIONS = (\[[\s\S]*?\]);/)[1]);
const multi = questions.filter(
  (q) => q.type === "mcq" && String(q.correct || "").split(/[^A-Z]+/i).filter(Boolean).length > 1,
);
console.log(`Patched ${filePath}`);
console.log(`Multi-select MCQs: ${multi.length}`);
