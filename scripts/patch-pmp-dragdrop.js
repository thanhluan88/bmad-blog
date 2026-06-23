const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/pmp/pmp-full-questions.html");
let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const cssInsert = `    .drag-drop-instruction {
      margin-bottom: 0.75rem;
    }
    .drag-bank {
      margin: 0.85rem 0 1rem;
      padding: 0.85rem 1rem;
      border: 1px dashed #93c5fd;
      border-radius: 12px;
      background: #f8fbff;
    }
    .drag-bank h4,
    .drag-slots h4 {
      margin: 0 0 0.55rem;
      font-size: 0.92rem;
      color: var(--primary);
    }
    .drag-bank ul {
      margin: 0;
      padding-left: 1.1rem;
    }
    .drag-bank li {
      margin: 0.25rem 0;
    }
    .drag-slots {
      display: grid;
      gap: 0.75rem;
    }
    .drag-slot {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.85rem;
      background: #fff;
    }
    .drag-slot-label {
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.35rem;
    }
    .drag-slot-desc {
      margin-bottom: 0.55rem;
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.45;
    }
    .drag-slot select {
      width: 100%;
      font: inherit;
      border-radius: 10px;
      border: 1px solid var(--border);
      padding: 0.55rem 0.75rem;
      background: #fff;
    }
    .drag-slot.selected-slot {
      border-color: #93c5fd;
      background: #eff6ff;
    }`;

if (!html.includes(".drag-drop-instruction")) {
  html = html.replace(
    "    .badge.multi {",
    `${cssInsert}\n    .badge.multi {`,
  );
}

const dragDropJs = `
    function extractTermPhrasesFromEnd(body, count) {
      let rest = body.trim();
      const terms = [];
      for (let i = 0; i < count; i++) {
        const m = rest.match(/([A-Z][\\s\\S]*?)(?:\\s*)$/);
        if (!m) break;
        const candidate = m[1].trim();
        const splitAt = rest.lastIndexOf(candidate);
        if (splitAt < 0) break;
        terms.unshift(candidate);
        rest = rest.slice(0, splitAt).trim();
      }
      if (terms.length !== count) return null;
      return { terms, definitionsText: rest };
    }

    function splitDefinitionSentences(text) {
      return text
        .split(/\\.\\s+(?=[A-Z])/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => (s.endsWith(".") ? s : s + "."));
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
        const instructionParts = [];
        if (beforeMarker) instructionParts.push(beforeMarker);
        if (markerText) instructionParts.push(markerText.replace(/:$/, "").trim());
        const instruction = instructionParts.join(" ").trim()
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

      const parsed = extractTermPhrasesFromEnd(afterMarker || text, slots);
      if (parsed) {
        const instructionParts = [];
        if (beforeMarker) instructionParts.push(beforeMarker);
        if (markerText) instructionParts.push(markerText.trim());
        const instruction = instructionParts.join(" ").trim()
          || "Chọn thuật ngữ phù hợp cho từng mô tả bên dưới.";
        let definitions = splitDefinitionSentences(parsed.definitionsText);
        if (definitions.length > slots) {
          definitions = definitions.slice(-slots);
        }
        while (definitions.length < slots) definitions.push("");
        const choices = parsed.terms.map((term, i) => ({
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
          <div class="drag-slot" data-slot="\${idx}">
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

if (!html.includes("function buildDragDropModel(q)")) {
  html = html.replace(
    "    function renderOptions(q) {",
    `${dragDropJs}\n    function renderOptions(q) {`,
  );
}

const oldDragBlock = `      if (q.type === "drag_drop" && q.dragTerms.length && q.dragSlots) {
        const labels = ["Vị trí 1", "Vị trí 2", "Vị trí 3", "Vị trí 4", "Vị trí 5"].slice(0, q.dragSlots);
        return \`<div class="notice">Câu kéo-thả: chọn thứ tự đúng cho từng vị trí.</div>
          <div class="options">\${labels.map((label, idx) => \`
            <label class="option">
              <span style="min-width:5.5rem;font-weight:600;">\${label}</span>
              <select data-q="\${q.id}" data-slot="\${idx}">
                <option value="">-- Chọn --</option>
                \${q.dragTerms.map((t, i) => \`<option value="\${String.fromCharCode(65 + i)}">\${String.fromCharCode(65 + i)}. \${escapeHtml(t)}</option>\`).join("")}
              </select>
            </label>\`).join("")}</div>\`;
      }`;

const newDragBlock = `      if (q.type === "drag_drop" && q.dragSlots) {
        return renderDragDropOptions(q);
      }`;

if (html.includes(oldDragBlock)) {
  html = html.replace(oldDragBlock, newDragBlock);
} else if (!html.includes("return renderDragDropOptions(q)")) {
  throw new Error("drag_drop render block not found");
}

const oldRenderQuestionText = `        <p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>`;

const newRenderQuestionText = `        \${q.type === "drag_drop"
          ? ""
          : \`<p class="q-text highlightable" data-qid="\${q.id}" data-field="text">\${escapeHtml(q.text)}</p>\`}`;

if (html.includes(oldRenderQuestionText)) {
  html = html.replace(oldRenderQuestionText, newRenderQuestionText);
}

const oldSetHighlightTail = `      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (userKeys.includes(key)) lbl.classList.add("selected");
          if (correctKeys.includes(key)) lbl.classList.add("correct");
          else if (userKeys.includes(key)) lbl.classList.add("incorrect");
        });
      }
    }`;

const newSetHighlightTail = `      if (q.type === "mcq" || q.type === "dropdown") {
        document.querySelectorAll(\`label.option[data-q="\${q.id}"]\`).forEach(lbl => {
          const key = lbl.dataset.key;
          lbl.classList.remove("selected", "correct", "incorrect");
          if (userKeys.includes(key)) lbl.classList.add("selected");
          if (correctKeys.includes(key)) lbl.classList.add("correct");
          else if (userKeys.includes(key)) lbl.classList.add("incorrect");
        });
      }
      if (q.type === "drag_drop" && q.dragSlots) {
        const correctKeys = (q.correct || "").split(",");
        const userKeysDrag = (userAnswer || "").split(",");
        document.querySelectorAll(\`.drag-slot[data-slot]\`).forEach(() => {});
        for (let i = 0; i < q.dragSlots; i++) {
          const slot = document.querySelector(\`.drag-slot[data-q="\${q.id}"][data-slot="\${i}"]\`)
            || document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${i}"]\`)?.closest(".drag-slot");
          const select = document.querySelector(\`select[data-q="\${q.id}"][data-slot="\${i}"]\`);
          if (slot) slot.classList.toggle("selected-slot", !!select?.value);
          if (select) {
            select.style.borderColor = userKeysDrag[i] && userKeysDrag[i] === correctKeys[i]
              ? "var(--ok)"
              : userKeysDrag[i]
                ? "var(--bad)"
                : "";
          }
        }
      }
    }`;

if (html.includes(oldSetHighlightTail) && !html.includes('q.type === "drag_drop" && q.dragSlots')) {
  html = html.replace(oldSetHighlightTail, newSetHighlightTail);
}

fs.writeFileSync(filePath, html.replace(/\n/g, "\r\n"), "utf8");

const questions = JSON.parse(html.match(/const QUESTIONS = (\[[\s\S]*?\]);/)[1]);

function extractTermPhrasesFromEnd(body, count) {
  let rest = body.trim();
  const terms = [];
  for (let i = 0; i < count; i++) {
    const m = rest.match(/([A-Z][\s\S]*?)(?:\s*)$/);
    if (!m) break;
    const candidate = m[1].trim();
    const splitAt = rest.lastIndexOf(candidate);
    if (splitAt < 0) break;
    terms.unshift(candidate);
    rest = rest.slice(0, splitAt).trim();
  }
  if (terms.length !== count) return null;
  return { terms, definitionsText: rest };
}

function splitDefinitionSentences(text) {
  return text
    .split(/\.\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
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

  if (/\bFirst\b/i.test(text) && q.dragTerms.length === slots) {
    const instructionParts = [];
    if (beforeMarker) instructionParts.push(beforeMarker);
    if (markerText) instructionParts.push(markerText.replace(/:$/, "").trim());
    const instruction = instructionParts.join(" ").trim() || "Sắp xếp các mục theo đúng thứ tự.";
    const choices = q.dragTerms.map((term, i) => ({ key: String.fromCharCode(65 + i), text: term }));
    return { mode: "order", instruction, slots: ordinals.map((label) => ({ label, description: "" })), choices };
  }

  const parsed = extractTermPhrasesFromEnd(afterMarker || text, slots);
  if (parsed) {
    const instructionParts = [];
    if (beforeMarker) instructionParts.push(beforeMarker);
    if (markerText) instructionParts.push(markerText.trim());
    const instruction = instructionParts.join(" ").trim() || "Chọn thuật ngữ phù hợp cho từng mô tả bên dưới.";
    let definitions = splitDefinitionSentences(parsed.definitionsText);
    if (definitions.length > slots) definitions = definitions.slice(-slots);
    while (definitions.length < slots) definitions.push("");
    const choices = parsed.terms.map((term, i) => ({ key: String.fromCharCode(65 + i), text: term }));
    return {
      mode: "match",
      instruction,
      slots: definitions.map((description, i) => ({ label: `Mô tả ${i + 1}`, description })),
      choices,
    };
  }
  return null;
}

[214, 621, 938, 1037].forEach((id) => {
  const model = buildDragDropModel(questions.find((q) => q.id === id));
  console.log(`\nQ${id} (${model?.mode})`);
  console.log("instruction:", model?.instruction?.slice(0, 120));
  console.log("choices:", model?.choices?.map((c) => `${c.key}=${c.text}`).join(" | "));
  console.log("slots:", model?.slots?.map((s) => `${s.label}: ${s.description?.slice(0, 60)}`).join("\n  "));
});

console.log("\nPatched drag_drop UI in", filePath);
