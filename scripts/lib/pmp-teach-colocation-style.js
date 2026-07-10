/**
 * Colocation-style teach lesson sections (auto-generated from PMBOK 8 analysis).
 * Reference: public/pmp/pmp-teach-colocation.html
 */
const {
  classifyAction,
  matchStemProfile,
  extractStemIssues,
  getPrimaryStemIssue,
} = require("./pmp-option-reasoning");

const STEM_SIGNAL_PATTERNS = [
  /what should the project manager do(?: first| next)?/i,
  /distributed across[^.,;]{5,90}/i,
  /video conferencing/i,
  /misunderstandings? about[^.,;]{0,60}/i,
  /taking too long[^.,;]{0,60}/i,
  /subject matter expert|\bSME\b/i,
  /reluctant[^.?!]{5,100}/i,
  /join the agile team/i,
  /same building/i,
  /different departments/i,
  /\d+%[^.,;]{0,50}/i,
  /change request/i,
  /risk register/i,
  /stakeholder[^.,;]{0,50}/i,
  /escalat[^.,;]{0,40}/i,
  /continuous improvement/i,
  /retrospective/i,
  /minimum viable product|\bMVP\b/i,
  /scope creep/i,
  /over budget|behind schedule/i,
  /newly assigned|just assigned/i,
];

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFirstItem(val) {
  if (Array.isArray(val)) return val[0] || "";
  return String(val || "").split(",")[0].trim();
}

function formatMappingList(val) {
  if (Array.isArray(val)) return val.join(", ");
  return String(val || "");
}

function parseSection(explanation, header) {
  if (!explanation) return "";
  const re = new RegExp(`\\*\\*${header}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`);
  const m = explanation.match(re);
  return m ? m[1].trim() : "";
}

function extractStemSignals(text) {
  const found = [];
  const t = String(text || "");
  for (const re of STEM_SIGNAL_PATTERNS) {
    const m = t.match(re);
    if (!m) continue;
    const phrase = m[0].trim();
    if (phrase.length < 4) continue;
    if (found.some((f) => f.includes(phrase) || phrase.includes(f))) continue;
    found.push(phrase);
  }
  return found.slice(0, 6);
}

function highlightStemPhrases(text) {
  const signals = extractStemSignals(text).sort((a, b) => b.length - a.length);
  let html = escapeHtml(text);
  for (const sig of signals) {
    const esc = escapeHtml(sig);
    if (!html.includes(esc)) continue;
    html = html.replace(esc, `<em>${esc}</em>`);
  }
  return html;
}

function conceptLabel(mapping, pageInfo) {
  return (
    formatFirstItem(mapping.processes || mapping.process) ||
    formatFirstItem(mapping.principles || mapping.principle) ||
    pageInfo?.topic?.split(",").pop()?.trim() ||
    "PMBOK 8"
  );
}

function viSummaryLine(analysis, q) {
  const whyBlock = parseSection(analysis.explanation, "Vì sao chọn đáp án này");
  const arrow = whyBlock.match(/^→ \*\*([A-Z, ]+)\*\*:\s*(.+)$/m);
  if (arrow) return arrow[2].trim();
  const stemProfile = matchStemProfile(q.text);
  if (stemProfile?.summaryHint) return stemProfile.summaryHint.split("—")[0].trim();
  const issue = getPrimaryStemIssue(extractStemIssues(q.text), stemProfile);
  return issue?.label || `Phân tích tình huống và chọn đáp án ${q.correct} theo PMBOK 8.`;
}

function buildHeroLead(q, analysis, mapping) {
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const summary = viSummaryLine(analysis, q);
  const pages = analysis.pageInfo?.pages?.length
    ? ` (PMBOK 8, tr. ${analysis.pageInfo.pages.slice(0, 2).join(", ")})`
    : "";
  return `Bài học Q${q.id} về <strong>${escapeHtml(concept)}</strong>${pages} — ${escapeHtml(summary)}`;
}

function buildConceptIntro(q, analysis, mapping) {
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const domain = formatMappingList(mapping.domains || mapping.domain);
  const process = formatFirstItem(mapping.processes || mapping.process);
  const principle = formatFirstItem(mapping.principles || mapping.principle);
  const pages = analysis.pageInfo?.pages?.slice(0, 2).join(", ") || "";
  const snippet = analysis.pageInfo?.snippet || "";

  let intro = `<strong>${escapeHtml(concept)}</strong>`;
  if (domain) intro += ` thuộc miền <strong>${escapeHtml(domain)}</strong>`;
  if (process) intro += ` — process <strong>${escapeHtml(process)}</strong>`;
  if (principle) intro += `, principle <strong>${escapeHtml(principle)}</strong>`;
  intro += ".";
  if (snippet.length > 40) {
    const excerpt = snippet.length > 280 ? `${snippet.slice(0, 277)}…` : snippet;
    intro += ` PMBOK 8${pages ? ` (tr. ${pages})` : ""}: ${escapeHtml(excerpt)}`;
  }
  return intro;
}

function buildSignalCard(q, analysis) {
  const signals = extractStemSignals(q.text);
  const stemProfile = matchStemProfile(q.text);
  const issue = getPrimaryStemIssue(extractStemIssues(q.text), stemProfile);
  const correctOpt = (analysis.optionAnalysis || []).find((o) => o.isCorrect);
  const signalText =
    signals.length > 0
      ? signals.map((s) => `<strong>${escapeHtml(s)}</strong>`).join(" · ")
      : issue?.label || "Đọc kỹ stem và xác định vấn đề trọng tâm.";
  const conclusion = correctOpt
    ? `→ <strong>${escapeHtml(correctOpt.key)}</strong> phù hợp vì ${escapeHtml((correctOpt.reason || "").slice(0, 140))}${(correctOpt.reason || "").length > 140 ? "…" : ""}`
    : `→ Đáp án đúng: <strong>${escapeHtml(q.correct)}</strong>`;
  return `<div class="card tip">
            <h4>Signal trong stem Q${q.id}</h4>
            <p style="margin:0">${signalText}<br><br>${conclusion}</p>
          </div>`;
}

function buildActionTypeGrid(optionAnalysis) {
  if (!optionAnalysis?.length) return "";
  const seen = new Set();
  const cells = [];
  for (const o of optionAnalysis) {
    const type = classifyAction(o.text);
    const key = type?.id || o.key;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = type?.label || o.text.slice(0, 60);
    cells.push(`<div class="approach-cell${o.isCorrect ? " pull" : ""}">
              <strong>${escapeHtml(type?.id ? type.label.split("/")[0].trim() : o.key)}</strong>
              ${escapeHtml(label)}
            </div>`);
  }
  if (!cells.length) return "";
  return `<div class="approach-grid">${cells.join("")}</div>`;
}

function buildCompareTable(optionAnalysis, q) {
  if (!optionAnalysis?.length) return "";
  const rows = optionAnalysis
    .map((o) => {
      const type = classifyAction(o.text);
      const action = type?.label || o.text.slice(0, 70);
      const fit = o.isCorrect
        ? "<strong>Yes — đáp án đúng</strong>"
        : `✗ ${escapeHtml((o.reason || "Không phù hợp tình huống").slice(0, 90))}${(o.reason || "").length > 90 ? "…" : ""}`;
      return `<tr>
                <td><strong>${o.key}. ${escapeHtml(o.text.slice(0, 55))}${o.text.length > 55 ? "…" : ""}</strong></td>
                <td>${escapeHtml(action)}</td>
                <td>${fit}</td>
              </tr>`;
    })
    .join("");
  return `<table>
            <thead><tr><th>Option</th><th>Action</th><th>Q${q.id} fit?</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
}

function buildWhyBullets(analysis, q) {
  const whyBlock = parseSection(analysis.explanation, "Vì sao chọn đáp án này");
  const bullets = [];
  const correctOpt = (analysis.optionAnalysis || []).find((o) => o.isCorrect);

  if (correctOpt?.reason) {
    bullets.push(correctOpt.reason);
  }
  for (const line of whyBlock.split("\n")) {
    const t = line.replace(/^→ \*\*[A-Z, ]+\*\*:\s*/, "").trim();
    if (t && !bullets.includes(t) && t.length > 20) bullets.push(t);
  }
  const stemIssues = extractStemIssues(q.text);
  for (const issue of stemIssues.slice(0, 2)) {
    const b = `Stem signal: ${issue.label} — cần hành động PM phù hợp PMBOK 8.`;
    if (!bullets.includes(b)) bullets.push(b);
  }
  const mapping = analysis.pmbok8;
  if (mapping?.processes?.[0]) {
    bullets.push(`Process ${mapping.processes[0]} — align với đáp án ${q.correct}.`);
  }
  if (analysis.pageInfo?.pages?.length) {
    bullets.push(`Tham chiếu PMBOK 8, tr. ${analysis.pageInfo.pages.slice(0, 2).join(", ")}.`);
  }
  return bullets.slice(0, 5);
}

function buildTrapsSection(optionAnalysis, q) {
  const wrong = (optionAnalysis || []).filter((o) => !o.isCorrect && o.reason);
  if (!wrong.length) return "";
  const cards = wrong.slice(0, 4).map((o, i) => {
    const short = o.text.length > 55 ? `${o.text.slice(0, 52)}…` : o.text;
    return `<div class="card danger">
            <h4>Bẫy ${i + 1}: "${escapeHtml(short)}" → ${o.key}</h4>
            <p style="margin:0">${escapeHtml(o.reason)}</p>
          </div>`;
  });
  const correct = (optionAnalysis || []).find((o) => o.isCorrect);
  const signals = extractStemSignals(q.text);
  const pattern = correct
    ? `<div class="card tip"><h4>Pattern</h4><p style="margin:0">${signals.length ? `<strong>${escapeHtml(signals.join(" · "))}</strong> → ` : ""}<strong>${correct.key}</strong>${correct.reason ? ` — ${escapeHtml(correct.reason.slice(0, 140))}${correct.reason.length > 140 ? "…" : ""}` : ""}</p></div>`
    : "";
  return cards.join("") + pattern;
}

function buildDrillHtml(optionAnalysis, q) {
  if (!optionAnalysis?.length || q.type !== "mcq") return "";
  const correct = optionAnalysis.find((o) => o.isCorrect);
  if (!correct) return "";

  const correctType = classifyAction(correct.text);
  const wrongTypes = [];
  const seen = new Set();
  for (const o of optionAnalysis) {
    if (o.isCorrect) continue;
    const t = classifyAction(o.text);
    if (!t || seen.has(t.id)) continue;
    seen.add(t.id);
    wrongTypes.push(t);
  }

  const pickLabels = [
    { id: correctType?.id || "CORRECT", label: (correctType?.label || "Đúng").split("/")[0].trim().slice(0, 12) },
    ...wrongTypes.slice(0, 3).map((t) => ({
      id: t.id,
      label: t.label.split("/")[0].trim().slice(0, 12),
    })),
  ];
  while (pickLabels.length < 4) {
    pickLabels.push({ id: `DUMMY${pickLabels.length}`, label: `Opt ${pickLabels.length}` });
  }

  const stemShort = q.text.replace(/\s+/g, " ").slice(0, 100);
  const rows = [
    { text: `${stemShort}… (Q${q.id})`, answer: pickLabels[0].id },
    ...wrongTypes.slice(0, 4).map((t) => ({
      text: `Tình huống cần "${t.label}" — không phải trọng tâm Q${q.id}`,
      answer: pickLabels.find((p) => p.id === t.id)?.id || wrongTypes[0]?.id,
    })),
  ].slice(0, 5);

  const html = rows
    .map((row) => {
      const btns = pickLabels
        .map(
          (p) =>
            `<button data-pick="${escapeHtml(p.id)}" type="button">${escapeHtml(p.label)}</button>`,
        )
        .join("");
      return `<div class="classify-row" data-answer="${escapeHtml(row.answer)}">
              <span>${escapeHtml(row.text)}</span>
              <div class="classify-btns">${btns}</div>
            </div>`;
    })
    .join("");

  return `<div class="classify-drill" id="classifyDrill">${html}</div>
          <p class="drill-score" id="drillScore">0 / ${rows.length} đúng</p>`;
}

function buildDrillScript() {
  return `
      let score = 0;
      const drillRows = document.querySelectorAll("#classifyDrill .classify-row");
      const total = drillRows.length;
      drillRows.forEach(function (row) {
        const ans = row.dataset.answer;
        let done = false;
        row.querySelectorAll("button").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (done) return;
            done = true;
            const ok = btn.dataset.pick === ans;
            row.querySelectorAll("button").forEach(function (b) {
              b.disabled = true;
              if (b.dataset.pick === ans) b.classList.add("correct");
              else if (b === btn) b.classList.add("wrong-pick");
            });
            if (ok) score++;
            const el = document.getElementById("drillScore");
            if (el) el.textContent = score + " / " + total + " đúng";
          });
        });
      });`;
}

function buildFlashcards(q, analysis, mapping) {
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const correctOpt = (analysis.optionAnalysis || []).find((o) => o.isCorrect);
  const pages = analysis.pageInfo?.pages?.slice(0, 2).join(", ") || "";
  return `<div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Q${q.id} — chủ đề / concept?</div>
            <div class="flashcard-back"><strong>${escapeHtml(concept)}</strong>${pages ? `<br>PMBOK 8, tr. ${escapeHtml(pages)}` : ""}</div>
          </div></div>
          <div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Q${q.id} — đáp án?</div>
            <div class="flashcard-back"><strong>${escapeHtml(q.correct)}</strong> — ${escapeHtml((q.correctLabel || correctOpt?.text || "").replace(/^[A-Z]\.\s*/, "").slice(0, 100))}</div>
          </div></div>
          <div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Signal stem → hành động?</div>
            <div class="flashcard-back">${escapeHtml(viSummaryLine(analysis, q).slice(0, 160))}</div>
          </div></div>`;
}

function buildCheatSheet(q, analysis, mapping) {
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const domain = formatMappingList(mapping.domains || mapping.domain);
  const process = formatMappingList(mapping.processes || mapping.process);
  const principle = formatMappingList(mapping.principles || mapping.principle);
  const pages = analysis.pageInfo?.pages?.join(", ") || "";
  const signals = extractStemSignals(q.text).join(" | ") || "—";
  const wrong = (analysis.optionAnalysis || [])
    .filter((o) => !o.isCorrect)
    .map((o) => `  ${o.key}) ${o.text.slice(0, 50)}… — ${(o.reason || "").slice(0, 60)}`)
    .join("\n");

  return `${concept.toUpperCase()} — Q${q.id}
(PMBOK 8${pages ? `, tr. ${pages}` : ""})
─────────────────────────────────────────────────────
DOMAIN: ${domain || "—"}
PROCESS: ${process || "—"}
PRINCIPLE: ${principle || "—"}

SCENARIO:
${q.text.replace(/\s+/g, " ").slice(0, 220)}${q.text.length > 220 ? "…" : ""}

SIGNAL KEYWORDS:
  ${signals}

ANSWER → ${q.correct}) ${(q.correctLabel || "").replace(/^[A-Z]\.\s*/, "")}

NOT:
${wrong || "  (xem bảng loại trừ)"}

Q${q.id} ANSWER: ${q.correct}`;
}

function quizExplMap(optionAnalysis) {
  const expl = {};
  for (const o of optionAnalysis || []) {
    if (o.isCorrect) {
      expl[o.key] = o.reason
        ? `Đúng! ${o.reason}`
        : "Đúng theo PMBOK 8 và phân tích tình huống.";
    } else {
      expl[o.key] = o.reason || "Không phải lựa chọn tốt nhất trong tình huống này.";
    }
  }
  return expl;
}

module.exports = {
  buildHeroLead,
  buildConceptIntro,
  buildSignalCard,
  buildActionTypeGrid,
  buildCompareTable,
  buildWhyBullets,
  buildTrapsSection,
  buildDrillHtml,
  buildDrillScript,
  buildFlashcards,
  buildCheatSheet,
  highlightStemPhrases,
  quizExplMap,
  conceptLabel,
  viSummaryLine,
  extractStemSignals,
};
