const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const helperBlock = `    function splitDefinitionSentences(text) {
      return text
        .split(/\\.\\s+(?=[A-Z])/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => (s.endsWith(".") ? s : s + "."));
    }

    function parseExplanationTerms(q) {
      const segments = String(q.explanation || "").trim().split(/\\s+(?=A\\s+[a-z])/);
      const pairs = segments.map(seg => {
        const idx = seg.lastIndexOf(". ");
        if (idx < 0) return { definition: seg.trim(), term: "" };
        return {
          definition: seg.slice(0, idx + 1).trim(),
          term: seg.slice(idx + 2).trim(),
        };
      }).filter(pair => pair.term);
      const valid = pairs.length === q.dragSlots
        && pairs.every(pair => pair.term.length <= 60 && !/examples include|Project professionals should/i.test(pair.term));
      return valid ? pairs : null;
    }

    function splitKnownTermsFromBlob(termsBlob, knownTerms) {
      let rest = termsBlob.trim();
      const found = [];
      const sorted = [...knownTerms].sort((a, b) => b.length - a.length);
      while (rest.length) {
        const term = sorted.find(item => rest.endsWith(item));
        if (!term) return null;
        found.unshift(term);
        rest = rest.slice(0, rest.length - term.length).trim();
      }
      return found.length === knownTerms.length ? found : null;
    }

    function parseQuestionMatchBody(afterMarker, slots) {
      const idx = afterMarker.lastIndexOf(". ");
      if (idx < 0) return null;
      const definitionsText = afterMarker.slice(0, idx + 1).trim();
      const termsBlob = afterMarker.slice(idx + 2).trim();
      let terms = termsBlob.split(/\\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
      if (terms.length !== slots) terms = null;
      if (!terms) return null;
      return { definitionsText, terms };
    }

    function buildDragDropModel(q) {
      if (q.type !== "drag_drop" || !q.dragSlots) return null;

      const text = String(q.text || "");
      const slots = q.dragSlots;
      const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"].slice(0, slots);
      const markerMatch = text.match(/Drag and drop[^:]*:/i);
      const markerIndex = markerMatch ? text.indexOf(markerMatch[0]) : -1;
      const markerText = markerMatch ? markerMatch[0] : "";
      const beforeMarker = markerIndex >= 0 ? text.slice(0, markerIndex).trim() : "";
      const afterMarker = markerIndex >= 0 ? text.slice(markerIndex + markerMatch[0].length).trim() : text.trim();

      if (/\\bFirst\\b/i.test(text) && q.dragTerms.length === slots) {
        const firstIdx = text.search(/\\bFirst\\b/i);
        const instruction = text.slice(0, firstIdx).trim()
          || "Sắp xếp các mục theo đúng thứ tự.";
        const choices = q.dragTerms.map((term, i) => ({
          key: String.fromCharCode(65 + i),
          text: term,
        }));
        return {
          mode: "order",
          instruction,
          slots: ordinals.map(label => ({ label, description: "" })),
          choices,
        };
      }

      const instructionParts = [];
      if (beforeMarker) instructionParts.push(beforeMarker);
      if (markerText) instructionParts.push(markerText.trim());
      const instruction = instructionParts.join(" ").trim()
        || "Chọn thuật ngữ phù hợp cho từng mô tả bên dưới.";

      const explanationPairs = parseExplanationTerms(q);
      if (explanationPairs) {
        const knownTerms = explanationPairs.map(pair => pair.term);
        const questionMatch = parseQuestionMatchBody(afterMarker, slots);
        let choicesTexts = questionMatch
          ? splitKnownTermsFromBlob(questionMatch.terms.join(" "), knownTerms)
          : null;
        if (!choicesTexts) choicesTexts = knownTerms;

        const choices = choicesTexts.map((term, i) => ({
          key: String.fromCharCode(65 + i),
          text: term,
        }));

        let definitions = questionMatch
          ? splitDefinitionSentences(questionMatch.definitionsText)
          : explanationPairs.map(pair => pair.definition);
        if (definitions.length > slots) definitions = definitions.slice(-slots);
        while (definitions.length < slots) definitions.push("");

        return {
          mode: "match",
          instruction,
          slots: definitions.map((description, i) => ({
            label: \`Mô tả \${i + 1}\`,
            description,
          })),
          choices,
        };
      }

      const questionMatch = parseQuestionMatchBody(afterMarker, slots);
      if (questionMatch) {
        let definitions = splitDefinitionSentences(questionMatch.definitionsText);
        if (definitions.length > slots) definitions = definitions.slice(-slots);
        while (definitions.length < slots) definitions.push("");
        const choices = questionMatch.terms.map((term, i) => ({
          key: String.fromCharCode(65 + i),
          text: term,
        }));
        return {
          mode: "match",
          instruction,
          slots: definitions.map((description, i) => ({
            label: \`Mô tả \${i + 1}\`,
            description,
          })),
          choices,
        };
      }

      const choices = q.dragTerms.slice(0, slots).map((term, i) => ({
        key: String.fromCharCode(65 + i),
        text: term,
      }));
      return {
        mode: "fallback",
        instruction: text,
        slots: Array.from({ length: slots }, (_, i) => ({
          label: \`Vị trí \${i + 1}\`,
          description: "",
        })),
        choices,
      };
    }

    function renderDragDropOptions(q) {
      const model = buildDragDropModel(q);
      if (!model) return \`<div class="notice">Câu kéo-thả — nhấn Kiểm tra để xem đáp án.</div>\`;

      const bank = \`<div class="drag-bank">
        <h4>Danh sách lựa chọn</h4>
        <ul>\${model.choices.map(c => \`<li><strong>\${c.key}.</strong> \${escapeHtml(c.text)}</li>\`).join("")}</ul>
      </div>\`;

      const slotsTitle = model.mode === "order"
        ? "Chọn giai đoạn đúng cho từng thứ tự"
        : "Chọn thuật ngữ đúng cho từng mô tả";

      const slots = \`<div class="drag-slots">
        <h4>\${slotsTitle}</h4>
        \${model.slots.map((slot, idx) => \`
          <div class="drag-slot" data-q="\${q.id}" data-slot="\${idx}">
            <div class="drag-slot-label">\${escapeHtml(slot.label)}</div>
            \${slot.description ? \`<div class="drag-slot-desc highlightable" data-qid="\${q.id}" data-field="slot-\${idx}">\${escapeHtml(slot.description)}</div>\` : ""}
            <select data-q="\${q.id}" data-slot="\${idx}" aria-label="\${escapeHtml(slot.label)}">
              <option value="">-- Chọn \${model.mode === "order" ? slot.label : "thuật ngữ"} --</option>
              \${model.choices.map(c => \`<option value="\${c.key}">\${c.key}. \${escapeHtml(c.text)}</option>\`).join("")}
            </select>
          </div>\`).join("")}
      </div>\`;

      return \`<div class="drag-drop">
        <div class="notice drag-drop-instruction">\${escapeHtml(model.instruction)}</div>
        \${bank}
        \${slots}
      </div>\`;
    }`;

const startMarkers = [
  "    function splitPhraseBlob(termsBlob, count) {",
  "    function extractTermPhrasesFromEnd(body, count) {",
  "    function splitDefinitionSentences(text) {",
];
const start = startMarkers.map((m) => html.indexOf(m)).find((i) => i >= 0);
const end = html.indexOf("    function renderOptions(q) {");
if (start == null || start < 0 || end < 0) throw new Error("Could not locate helper block");
html = html.slice(0, start) + helperBlock + "\n\n" + html.slice(end);

fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");

// Validate by copying logic
eval(helperBlock.replace(/\\`/g, "`"));
const questions = JSON.parse(fs.readFileSync(filePath, "utf8").match(/const QUESTIONS = (\[[\s\S]*?\]);/)[1]);
[214, 621, 938, 1037].forEach((id) => {
  const model = buildDragDropModel(questions.find((q) => q.id === id));
  console.log(`\nQ${id} [${model.mode}]`);
  console.log("instruction:", model.instruction.slice(0, 100));
  console.log("choices:", model.choices.map((c) => `${c.key}=${c.text}`).join(" | "));
  model.slots.forEach((s, i) => console.log(`  ${i + 1}. ${s.description.slice(0, 85)}`));
});
