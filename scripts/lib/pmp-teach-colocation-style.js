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
const { extractStemSignals } = require("./pmp-teach-keywords");

const ACTION_CONTRAST = {
  explain_agile_value: { title: "Explain Agile value", blurb: "CI + early feedback — expert vẫn đạt chất lượng cao trong teamwork." },
  recommend_eq: { title: "Recommend EQ", blurb: "Lecture attitude — không giải thích vì sao Agile teamwork không compromise quality." },
  facilitate_retro: { title: "Assign retrospective", blurb: "Giao ceremony khi member chưa buy-in — quá sớm." },
  escalate: { title: "Escalate sponsor", blurb: "Nhờ sponsor fix attitude — PM vẫn phải coach trực tiếp." },
  listen_support: { title: "Listen & support", blurb: "Lắng nghe concern trước khi hành động." },
  team_building: { title: "Team building", blurb: "Bonding chung — không address misconception cụ thể." },
};

const TRAP_HEADLINE = {
  recommend_eq: "EQ lecture trap",
  facilitate_retro: "Ceremony quá sớm",
  escalate: "Escalate sponsor trap",
  meet_discuss: "Nhờ sponsor trap",
  evaluate_individual: "Blame individual trap",
};

function normalizeForDedup(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function isNearDuplicate(a, b) {
  const na = normalizeForDedup(a);
  const nb = normalizeForDedup(b);
  if (!na || !nb || na.length < 24) return false;
  return na.includes(nb.slice(0, Math.min(nb.length, 60))) || nb.includes(na.slice(0, Math.min(na.length, 60)));
}

function pushUnique(bullets, text) {
  const t = String(text || "").trim();
  if (t.length < 18) return;
  if (bullets.some((b) => isNearDuplicate(b, t))) return;
  bullets.push(t);
}

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
  const stemProfile = matchStemProfile(q.text);
  if (stemProfile?.conceptBlurb) {
    return escapeHtml(stemProfile.conceptBlurb);
  }
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
  const correctKey = (analysis.optionAnalysis || []).find((o) => o.isCorrect)?.key || q.correct;
  const signalText =
    signals.length > 0
      ? signals.slice(0, 4).map((s) => `<strong>${escapeHtml(s)}</strong>`).join(" · ")
      : issue?.label || "Đọc kỹ stem và xác định vấn đề trọng tâm.";
  const conclusion = `→ <strong>${escapeHtml(correctKey)}</strong>: explain agile value (CI + feedback) trước ceremony / escalate / lecture EQ.`;
  return `<div class="card tip">
            <h4>Signal trong stem Q${q.id}</h4>
            <p style="margin:0">${signalText}<br><br>${conclusion}</p>
          </div>`;
}

function buildActionTypeGrid(optionAnalysis) {
  if (!optionAnalysis?.length) return "";
  const cells = optionAnalysis.map((o) => {
    const type = classifyAction(o.text);
    const contrast = type && ACTION_CONTRAST[type.id];
    const title = contrast?.title || (type?.label || o.key).split("/")[0].trim().slice(0, 28);
    const blurb = contrast?.blurb || o.text.slice(0, 72);
    return `<div class="approach-cell${o.isCorrect ? " pull" : ""}">
              <strong>${escapeHtml(title)}</strong>
              ${escapeHtml(blurb)}
            </div>`;
  });
  return `<div class="approach-grid">${cells.join("")}</div>`;
}

function buildCompareTable(optionAnalysis, q) {
  if (!optionAnalysis?.length) return "";
  const rows = optionAnalysis
    .map((o) => {
      const type = classifyAction(o.text);
      const action = (type && ACTION_CONTRAST[type.id]?.title) || type?.label?.split("/")[0].trim() || o.text.slice(0, 40);
      const fit = o.isCorrect
        ? "<strong>Yes — đáp án đúng</strong>"
        : `✗ ${escapeHtml((o.reason || "Không phù hợp").slice(0, 72))}${(o.reason || "").length > 72 ? "…" : ""}`;
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
  const stemProfile = matchStemProfile(q.text);
  if (stemProfile?.lessonBullets?.length) {
    return stemProfile.lessonBullets.slice(0, 5);
  }

  const bullets = [];
  const correctOpt = (analysis.optionAnalysis || []).find((o) => o.isCorrect);
  const primary = getPrimaryStemIssue(extractStemIssues(q.text), stemProfile);

  if (primary?.label) {
    pushUnique(bullets, `Bối cảnh: ${primary.label}.`);
  }
  if (correctOpt?.reason) {
    pushUnique(bullets, correctOpt.reason);
  }

  const mapping = analysis.pmbok8;
  if (mapping?.principles?.[0] && mapping?.processes?.[0]) {
    pushUnique(
      bullets,
      `${mapping.processes[0]} + ${mapping.principles[0]} — đáp án ${q.correct} align PMBOK 8.`,
    );
  }
  if (analysis.pageInfo?.pages?.length) {
    pushUnique(bullets, `Tham chiếu PMBOK 8, tr. ${analysis.pageInfo.pages.slice(0, 2).join(", ")}.`);
  }
  return bullets.slice(0, 5);
}

function buildTrapsSection(optionAnalysis, q) {
  const wrong = (optionAnalysis || []).filter((o) => !o.isCorrect && o.reason);
  if (!wrong.length) return "";
  const cards = wrong.slice(0, 4).map((o, i) => {
    const type = classifyAction(o.text);
    const headline = (type && TRAP_HEADLINE[type.id]) || `Bẫy ${o.key}`;
    const short = o.text.length > 48 ? `${o.text.slice(0, 45)}…` : o.text;
    return `<div class="card danger">
            <h4>Bẫy ${i + 1}: ${escapeHtml(headline)} (${o.key})</h4>
            <p style="margin:0">${escapeHtml(o.reason)}</p>
            <p style="margin:0.35rem 0 0;font-size:0.78rem;color:var(--muted)">"${escapeHtml(short)}"</p>
          </div>`;
  });
  const signals = extractStemSignals(q.text).slice(0, 3);
  const pattern = signals.length
    ? `<div class="card tip"><h4>Pattern</h4><p style="margin:0"><strong>${escapeHtml(signals.join(" · "))}</strong> → đáp án <strong>${escapeHtml(q.correct)}</strong></p></div>`
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
    {
      id: correctType?.id || "CORRECT",
      label: (correctType && ACTION_CONTRAST[correctType.id]?.title) || "Explain value",
    },
    ...wrongTypes.slice(0, 3).map((t) => ({
      id: t.id,
      label: ACTION_CONTRAST[t.id]?.title || t.label.split("/")[0].trim().slice(0, 14),
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
