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
const { extractStemSignals, sanitizeSignalPhrases, validateSignalPhrases } = require("./pmp-teach-keywords");
const { formatGuideQuote, lookupGuideQuote, lookupGuideHits } = require("./pmp-pmbok8-rag-pages");
const { getStoredTeachGrounding } = require("./pmp-teach-signals-store");
const { buildPlainViExplanation, plainViMarkdownBullets } = require("./pmp-teach-plain-vi");

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

function truncateSentence(s, max = 100) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function isMostlyVietnamese(text) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(String(text || ""));
}

function isWrongAnswerBullet(text, correctKey) {
  const t = String(text || "").trim();
  if (!t) return false;
  const ck = String(correctKey || "").trim().toUpperCase();
  if (/^[A-Z](?:,\s*[A-Z])*\s+sai\b/i.test(t)) return true;
  if (/^[A-Z](?:\/[A-Z])+\s+sai\b/i.test(t)) return true;
  if (/\b[A-Z](?:\/[A-Z])+\s+sai\b/i.test(t)) return true;
  if (/^[^:\n]{1,12}\s+sai:/i.test(t) && !new RegExp(`^${ck}\\b`, "i").test(t)) return true;
  return false;
}

function filterWhyBulletsForCorrect(bullets, correctKey) {
  return (bullets || []).filter((b) => {
    if (!b || isGenericReasoning(b)) return false;
    if (isWrongAnswerBullet(b, correctKey)) return false;
    return true;
  });
}

function isGenericReasoning(text) {
  const t = String(text || "").toLowerCase();
  if (!t || t.length < 20) return true;
  if (/hành động này giải quyết trực tiếp vấn đề trong đề/.test(t)) return true;
  if (/đáp án đúng tập trung/.test(t)) return true;
  if (/align miền .+ \(executing/.test(t) && t.length < 120) return true;
  if (/không phù hợp .+ — đáp án đúng/.test(t)) return true;
  return false;
}

function resolveExcludeReason(q, stemProfile, key, fallback) {
  const stored = getStoredTeachGrounding(q.id);
  const fromStore = stored?.excludeReasons?.[key];
  if (fromStore && !isGenericReasoning(fromStore)) return fromStore;
  if (stored?.sourceSolution) {
    if (fallback && !isGenericReasoning(fallback)) return fallback;
    return "";
  }
  const fromProfileKey = stemProfile?.excludeReasonsByKey?.[key];
  if (fromProfileKey && !isGenericReasoning(fromProfileKey)) return fromProfileKey;
  const fromProfile = stemProfile?.rejectByAction;
  if (fromProfile) {
    const opt = (q.options || []).find((o) => o.key === key);
    const action = opt ? classifyAction(opt.text) : null;
    const profileReason = action && fromProfile[action.id];
    if (profileReason && !isGenericReasoning(profileReason)) return profileReason;
  }
  if (fallback && !isGenericReasoning(fallback)) return fallback;
  return "";
}

/** AI grounding signals — store → STEM_PROFILE → none (no regex fallback). */
function resolveTeachSignals(q, stemProfile) {
  const stem = q.text || "";
  const stored = getStoredTeachGrounding(q.id);
  let signalAnswer = "";
  let rawPhrases = [];

  if (stored?.signalPhrases?.length || stored?.signalAnswer) {
    signalAnswer = stored.signalAnswer;
    rawPhrases = stored.signalPhrases;
  } else if (stemProfile?.signalPhrases?.length || stemProfile?.signalAnswer) {
    signalAnswer = String(stemProfile.signalAnswer || "").trim();
    rawPhrases = stemProfile.signalPhrases || [];
  }

  return {
    signalAnswer,
    signalPhrases: sanitizeSignalPhrases(stem, rawPhrases),
  };
}

/** PMBOK 8 grounding — structured for readable HTML. */
function composeGrounding(q, analysis) {
  const stemProfile = matchStemProfile(q.text);
  const teachSignals = resolveTeachSignals(q, stemProfile);
  const optionAnalysis = analysis.optionAnalysis || [];
  const correctOpt = optionAnalysis.find((o) => o.isCorrect);
  const wrongOpts = optionAnalysis.filter((o) => !o.isCorrect);
  const mapping = analysis.pmbok8 || {};
  const process = formatFirstItem(mapping.processes || mapping.process);
  const principle = formatFirstItem(mapping.principles || mapping.principle);
  const page = analysis.pageInfo?.pages?.[0];
  const pageRef = page ? `tr. ${page}` : "";
  const pmbokLabel = [process, principle].filter(Boolean).join(" + ") || "PMBOK 8";
  const pmbokRef = pageRef ? `${pmbokLabel}, ${pageRef}` : pmbokLabel;
  const correctKey = correctOpt?.key || q.correct;

  const stored = getStoredTeachGrounding(q.id);
  const whyCorrect =
    stored?.whyCorrect ||
    stemProfile?.whyCorrect ||
    (correctOpt?.reason && !isGenericReasoning(correctOpt.reason) ? correctOpt.reason : "");
  const whyWrong = wrongOpts.map((o) => ({
    key: o.key,
    text: o.text,
    reason: resolveExcludeReason(q, stemProfile, o.key, o.reason),
  }));

  const conclusion =
    stemProfile?.groundingConclusion ||
    (teachSignals.signalAnswer
      ? `→ ${correctKey}: ${truncateSentence(teachSignals.signalAnswer, 160)}`
      : whyCorrect && !isMostlyVietnamese(whyCorrect)
        ? `→ ${correctKey}: ${truncateSentence(whyCorrect, 140)}`
        : `→ ${correctKey}: align PMBOK 8.`);

  const bullets = [];
  if (stored?.whyBullets?.length) {
    for (const b of filterWhyBulletsForCorrect(stored.whyBullets, correctKey)) {
      pushUnique(bullets, b);
    }
  } else if (stemProfile?.lessonBullets?.length) {
    for (const b of filterWhyBulletsForCorrect(stemProfile.lessonBullets, correctKey)) {
      pushUnique(bullets, b);
    }
  } else {
    if (whyCorrect && !isGenericReasoning(whyCorrect)) {
      pushUnique(bullets, `${correctKey} is correct: ${whyCorrect}`);
    }
    if (page && process && whyCorrect) {
      pushUnique(
        bullets,
        `PMBOK 8 ${pageRef}: ${process}${principle ? ` + ${principle}` : ""}.`,
      );
    }
  }

  if (!whyCorrect && !whyWrong.length && !teachSignals.signalAnswer) {
    return {
      pmbokRef: "",
      correctKey,
      correctText: correctOpt?.text || "",
      whyCorrect: "",
      whyWrong: [],
      signalAnswer: "",
      signalPhrases: [],
      conclusion: "",
      bullets: [],
    };
  }

  return {
    pmbokRef,
    correctKey,
    correctText: correctOpt?.text || q.correctLabel || "",
    whyCorrect,
    whyWrong,
    signalAnswer: teachSignals.signalAnswer,
    signalPhrases: teachSignals.signalPhrases,
    conclusion,
    bullets: bullets.slice(0, 5),
  };
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

function highlightStemPhrases(text, signalPhrases) {
  const phrases = (signalPhrases || []).filter((p) => p && p.length > 3);
  if (!phrases.length) {
    let html = escapeHtml(text);
    return html;
  }
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  let html = escapeHtml(text);
  for (const sig of sorted) {
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
  const grounding = composeGrounding(q, analysis);
  if (!hasTeachSignal(grounding, q.text)) return "";
  const correctKey = grounding.correctKey || q.correct;
  const plain = buildPlainViExplanation(q, analysis);
  const phrasesHtml = grounding.signalPhrases.length
    ? `<p class="signal-phrases-en">${grounding.signalPhrases
        .map((p) => `<span class="kw-signal">${escapeHtml(p)}</span>`)
        .join(" · ")}</p>`
    : "";
  const answerHtml = grounding.signalAnswer
    ? `<p class="signal-answer-en">${escapeHtml(grounding.signalAnswer)}</p>`
    : "";
  const viHint = plain.summary
    ? `<p class="signal-answer-vi" style="margin:0.5rem 0 0;font-size:0.92rem;line-height:1.6;color:var(--text)"><strong>Tóm tắt:</strong> ${escapeHtml(plain.summary)}</p>`
    : "";
  const rawConclusion = grounding.conclusion || `→ ${correctKey}: align PMBOK 8.`;
  const showConclusion =
    grounding.signalPhrases.length > 0 ||
    (grounding.signalAnswer && !isMostlyVietnamese(grounding.signalAnswer));
  const conclusionHtml = showConclusion
    ? escapeHtml(rawConclusion).replace(
        `→ ${escapeHtml(correctKey)}:`,
        `→ <strong>${escapeHtml(correctKey)}</strong>:`,
      )
    : "";
  return `<div class="card tip signal-card">
            <h4>Signal trong stem Q${q.id}</h4>
            ${phrasesHtml}
            ${answerHtml}
            ${viHint}
            ${conclusionHtml ? `<p class="signal-conclusion" style="margin:0">${conclusionHtml}</p>` : ""}
          </div>`;
}

function buildPlainViCard(q, analysis) {
  const plain = buildPlainViExplanation(q, analysis);
  const bulletHtml = plain.bullets
    .map((b) => {
      const html = escapeHtml(b).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return `<li>${html}</li>`;
    })
    .join("");
  const excludeHtml = plain.excludes.length
    ? `<h5 style="margin:1rem 0 0.45rem;font-size:0.88rem;color:var(--muted)">Loại trừ phương án khác</h5>
            <ul style="margin:0;padding-left:1.2rem;font-size:0.9rem">${plain.excludes
              .map(
                (ex) =>
                  `<li><strong>${escapeHtml(ex.key)}.</strong> ${escapeHtml(ex.reason)}</li>`,
              )
              .join("")}</ul>`
    : "";
  return `<div class="card tip plain-vi-card" style="border-left:4px solid var(--ok);background:var(--ok-bg)">
            <h4>Giải thích dễ hiểu</h4>
            <ul class="plain-vi-bullets" style="margin:0;padding-left:1.2rem;line-height:1.65;font-size:0.92rem">${bulletHtml}</ul>
            ${excludeHtml}
          </div>`;
}

function buildGroundingCard(q, analysis) {
  const g = composeGrounding(q, analysis);
  if (!g.whyCorrect && !g.whyWrong.length) return "";
  const correctLine = g.correctText
    ? `<p class="grounding-opt-text"><strong>${escapeHtml(g.correctKey)}.</strong> ${escapeHtml(g.correctText)}</p>`
    : "";
  const wrongList = g.whyWrong.filter((w) => w.reason && !isGenericReasoning(w.reason)).length
    ? `<div class="grounding-block">
            <h5>Không chọn</h5>
            <ul class="grounding-wrong">${g.whyWrong
              .filter((w) => w.reason && !isGenericReasoning(w.reason))
              .map(
                (w) =>
                  `<li><strong>${escapeHtml(w.key)}.</strong> ${escapeHtml(truncateSentence(w.reason, 220))}</li>`,
              )
              .join("")}</ul>
          </div>`
    : "";
  return `<div class="card info grounding-card">
            <h4>Grounding PMBOK 8</h4>
            <p class="grounding-ref"><span class="kw-pmbok">PMBOK 8</span> · ${escapeHtml(g.pmbokRef)}</p>
            <div class="grounding-block">
              <h5>Đáp án đúng — ${escapeHtml(g.correctKey)}</h5>
              ${correctLine}
              <p class="grounding-why">${escapeHtml(g.whyCorrect)}</p>
            </div>
            ${wrongList}
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
  return buildWhyTriad(analysis, q).pmbok;
}

function buildWhyTriad(analysis, q) {
  const stored = getStoredTeachGrounding(q.id);
  const grounding = composeGrounding(q, analysis);
  const correctKey = grounding.correctKey || q.correct;

  const pmbokRaw =
    stored?.whyPmbokBullets?.length
      ? stored.whyPmbokBullets
      : stored?.whyBullets?.length
        ? stored.whyBullets
        : grounding.bullets;
  const pmbok = filterWhyBulletsForCorrect(pmbokRaw, correctKey).slice(0, 5);

  let solution = stored?.whySolutionBullets?.length ? stored.whySolutionBullets : [];
  if (!solution.length && grounding.whyCorrect && !isGenericReasoning(grounding.whyCorrect)) {
    const text = grounding.whyCorrect.replace(/^[A-Z]\.\s*/i, "").trim();
    if (text) solution = [`${correctKey}. ${truncateSentence(text, 240)}`];
  }

  const web = stored?.whyWebBullets || [];
  const webSources = stored?.whyWebSources || [];

  return { solution, pmbok, web, webSources };
}

function renderWhyTriadHtml(triad, mdInline, escapeHtmlFn) {
  const esc = escapeHtmlFn || ((s) => String(s));
  const lanes = [];

  if (triad.solution?.length) {
    lanes.push(
      `<div class="why-lane why-lane-solution"><h4>1. Đáp án tham chiếu (Reference solution)</h4><ul>${triad.solution.map((b) => `<li>${mdInline(b)}</li>`).join("")}</ul></div>`,
    );
  }
  if (triad.pmbok?.length) {
    lanes.push(
      `<div class="why-lane why-lane-pmbok"><h4>2. Lý luận PMBOK 8 (PMBOK reasoning)</h4><ul>${triad.pmbok.map((b) => `<li>${mdInline(b)}</li>`).join("")}</ul></div>`,
    );
  }
  if (triad.web?.length) {
    const sources = triad.webSources?.length
      ? `<p class="why-web-sources" style="font-size:0.82rem;color:var(--muted);margin:0.35rem 0 0 1rem"><em>Sources: ${triad.webSources.map((s) => esc(s)).join("; ")}</em></p>`
      : "";
    lanes.push(
      `<div class="why-lane why-lane-web"><h4>3. Bổ sung từ nguồn ngoài (Web)</h4><ul>${triad.web.map((b) => `<li>${mdInline(b)}</li>`).join("")}</ul>${sources}</div>`,
    );
  }

  return lanes.join("\n          ");
}

function buildExcludeRows(q, analysis) {
  const grounding = composeGrounding(q, analysis);
  const reasonByKey = new Map();
  for (const w of grounding.whyWrong || []) {
    if (w.reason && !isGenericReasoning(w.reason)) reasonByKey.set(w.key, w.reason);
  }
  const correctKeys = String(q.correct || "")
    .split(",")
    .map((k) => k.trim().toUpperCase())
    .filter(Boolean);
  const wrongOpts = (analysis.optionAnalysis || []).filter((o) => !o.isCorrect);
  const opts =
    wrongOpts.length > 0
      ? wrongOpts
      : (q.options || []).filter((o) => !correctKeys.includes(o.key));
  return opts.map((o) => ({
    key: o.key,
    text: o.text || "",
    reason: reasonByKey.get(o.key) || "",
  }));
}

function hasTeachSignal(grounding, stem) {
  if (!grounding?.signalAnswer?.trim()) return false;
  const check = validateSignalPhrases(stem || "", grounding.signalPhrases);
  return check.ok && check.phrases.length >= 2;
}

function validateTeachGrounding(q, analysis) {
  const grounding = composeGrounding(q, analysis);
  const errors = [];
  if (!grounding.signalAnswer?.trim()) {
    errors.push(`Q${q.id}: missing signalAnswer`);
  }
  const signalCheck = validateSignalPhrases(q.text || "", grounding.signalPhrases);
  if (!signalCheck.ok) {
    errors.push(`Q${q.id}: ${signalCheck.errors.join("; ")}`);
  }
  const whyTriad = buildWhyTriad(analysis, q);
  const whyBullets = whyTriad.pmbok;
  if (!whyBullets.length) {
    errors.push(`Q${q.id}: missing whyBullets (Tại sao chọn is empty)`);
  }
  const wrong = buildExcludeRows(q, analysis);
  const missing = wrong.filter((o) => !o.reason);
  if (missing.length) {
    errors.push(
      `Q${q.id}: missing excludeReasons for ${missing.map((o) => o.key).join(", ")}`,
    );
  }
  return {
    ok: errors.length === 0,
    errors,
    grounding,
    whyBullets,
    missingExcludeKeys: missing.map((o) => o.key),
  };
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
  const stored = getStoredTeachGrounding(q.id);
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const process = formatFirstItem(mapping.processes || mapping.process);
  const principle = formatFirstItem(mapping.principles || mapping.principle);
  const guide = resolveGuideQuote(q, analysis);
  const pages = guide?.pages?.slice(0, 2).join(", ") || analysis.pageInfo?.pages?.slice(0, 2).join(", ") || "";
  const snippet = formatGuideQuote(
    stored?.guideQuote || guide?.excerpt || stored?.pmbokConcept || "",
    220,
  );
  const excerpt = snippet.replace(/\s+/g, " ");
  const conceptBack = excerpt
    ? `<strong>${escapeHtml(concept)}</strong><br><span style="font-size:0.82rem">${escapeHtml(process)}${principle ? ` · ${escapeHtml(principle)}` : ""}</span><br><em style="font-size:0.8rem;color:var(--muted)">"${escapeHtml(excerpt)}"</em>${pages ? `<br>PMBOK 8, tr. ${escapeHtml(pages)}` : ""}`
    : `<strong>${escapeHtml(concept)}</strong>${process ? `<br>${escapeHtml(process)}` : ""}${pages ? `<br>PMBOK 8, tr. ${escapeHtml(pages)}` : ""}`;
  const correctOpt = (analysis.optionAnalysis || []).find((o) => o.isCorrect);
  const grounding = composeGrounding(q, analysis);
  return `<div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Q${q.id} — chủ đề PMBOK 8?</div>
            <div class="flashcard-back">${conceptBack}</div>
          </div></div>
          <div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Q${q.id} — đáp án?</div>
            <div class="flashcard-back"><strong>${escapeHtml(q.correct)}</strong> — ${escapeHtml((q.correctLabel || correctOpt?.text || "").replace(/^[A-Z]\.\s*/, "").slice(0, 100))}</div>
          </div></div>
          <div class="flashcard" tabindex="0"><div class="flashcard-inner">
            <div class="flashcard-front">Signal → đáp án?</div>
            <div class="flashcard-back">${escapeHtml((grounding.signalAnswer || viSummaryLine(analysis, q)).slice(0, 200))}</div>
          </div></div>`;
}

function buildCheatSheet(q, analysis, mapping) {
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const domain = formatMappingList(mapping.domains || mapping.domain);
  const process = formatMappingList(mapping.processes || mapping.process);
  const principle = formatMappingList(mapping.principles || mapping.principle);
  const pages = analysis.pageInfo?.pages?.join(", ") || "";
  const signals = extractStemSignals(q.text).join(" | ") || "—";
  const excludeRows = buildExcludeRows(q, analysis)
    .filter((o) => o.reason)
    .map((o) => `  ${o.key}) ${o.text.slice(0, 50)}… — ${o.reason.slice(0, 80)}`)
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
${excludeRows || "  (see exclude table)"}

Q${q.id} ANSWER: ${q.correct}`;
}

function quizExplMap(q, analysisOrOptions) {
  const analysis = Array.isArray(analysisOrOptions)
    ? { optionAnalysis: analysisOrOptions }
    : analysisOrOptions || {};
  const grounding = composeGrounding(q, analysis);
  const correctKeys = String(q.correct || "")
    .split(",")
    .map((k) => k.trim().toUpperCase())
    .filter(Boolean);
  const wrongByKey = new Map(
    (grounding.whyWrong || []).filter((w) => w.reason).map((w) => [w.key, w.reason]),
  );
  const optionAnalysis = analysis.optionAnalysis || [];
  const expl = {};
  for (const o of q.options || optionAnalysis) {
    const key = o.key;
    if (correctKeys.includes(key)) {
      const why =
        grounding.whyCorrect ||
        optionAnalysis.find((x) => x.key === key && x.isCorrect)?.reason ||
        "";
      expl[key] = why
        ? why.startsWith("Đúng") || /^[A-Z]\.\s/.test(why)
          ? why.startsWith("Đúng")
            ? why
            : `Đúng! ${why}`
          : `Đúng! ${why}`
        : "Đúng theo PMBOK 8 và phân tích tình huống.";
    } else {
      expl[key] =
        wrongByKey.get(key) ||
        optionAnalysis.find((x) => x.key === key)?.reason ||
        "Không phải lựa chọn tốt nhất trong tình huống này.";
    }
  }
  return expl;
}

function resolveGuideQuote(q, analysis) {
  const stored = getStoredTeachGrounding(q.id);
  const fromLookup = lookupGuideQuote(q, analysis, stored || {});
  if (fromLookup?.excerpt && fromLookup.pages?.length) {
    return fromLookup;
  }
  return null;
}

function resolveGuideHits(q, analysis, limit = 3) {
  const stored = getStoredTeachGrounding(q.id);
  return lookupGuideHits(q, analysis, stored || {}, limit);
}

/** Markdown explanation for quiz pages (exam-latest / full) from teach grounding. */
function buildTeachExplanationMarkdown(q, analysis) {
  const grounding = composeGrounding(q, analysis);
  const whyTriad = buildWhyTriad(analysis, q);
  const whyBullets = whyTriad.pmbok;
  const excludeRows = buildExcludeRows(q, analysis).filter((r) => r.reason);
  const p8 = analysis.pmbok8 || {};
  const pages = analysis.pageInfo?.pages || [];
  const topic = analysis.pageInfo?.topic || formatFirstItem(p8.processes) || "PMBOK 8";

  const plain = buildPlainViExplanation(q, analysis);
  const lines = [];
  lines.push("**PMBOK 8 mapping**");
  if (p8.domains?.length) lines.push(`- Domain: ${p8.domains.join(", ")}`);
  if (p8.focusArea) lines.push(`- Focus Area: ${p8.focusArea}`);
  if (p8.processes?.length) lines.push(`- Process: ${p8.processes.join(", ")}`);
  if (p8.principles?.length) lines.push(`- Principle: ${p8.principles.join(", ")}`);
  lines.push("");
  lines.push("**Giải thích dễ hiểu**");
  lines.push(...plainViMarkdownBullets(plain));
  lines.push("");
  lines.push("**Why this answer**");
  if (whyTriad.solution?.length) {
    lines.push("");
    lines.push("**1. Reference solution**");
    for (const b of whyTriad.solution) lines.push(`- ${b}`);
  }
  if (whyTriad.pmbok?.length) {
    lines.push("");
    lines.push("**2. PMBOK 8 reasoning**");
    for (const b of whyTriad.pmbok) lines.push(`- ${b}`);
  }
  if (whyTriad.web?.length) {
    lines.push("");
    lines.push("**3. Supplementary reasoning (web)**");
    for (const b of whyTriad.web) lines.push(`- ${b}`);
    if (whyTriad.webSources?.length) {
      lines.push(`_Sources: ${whyTriad.webSources.join("; ")}_`);
    }
  }
  if (excludeRows.length) {
    lines.push("");
    lines.push("**Exclude other options**");
    for (const row of excludeRows) {
      lines.push(`- **${row.key}:** ${row.reason}`);
    }
  }
  if (grounding.signalPhrases?.length || grounding.signalAnswer) {
    lines.push("");
    lines.push("**Signal trong stem**");
    if (grounding.signalPhrases?.length) {
      lines.push(grounding.signalPhrases.join(" · "));
    }
    if (grounding.signalAnswer) lines.push(grounding.signalAnswer);
  }
  const guideHits = resolveGuideHits(q, analysis, 3);
  if (guideHits.length) {
    lines.push("");
    lines.push("**Trích dẫn Guide**");
    guideHits.forEach((h, i) => {
      lines.push(`${i + 1}. "${h.excerpt}"`);
      lines.push(
        `— PMBOK 8, tr. ${h.page}${h.topic ? ` (${h.topic})` : ""}`,
      );
    });
  } else {
    const guide = resolveGuideQuote(q, analysis);
    if (guide) {
      lines.push("");
      lines.push("**Trích dẫn Guide**");
      lines.push(`"${guide.excerpt}"`);
      lines.push(
        `— PMBOK 8, tr. ${guide.pages.join(", ")}${guide.topic ? ` (${guide.topic})` : ""}`,
      );
    }
  }
  if (pages.length) {
    lines.push("");
    lines.push("**Tham khảo**");
    lines.push(`- PMBOK8, tr. ${pages.join(", ")}: ${topic}`);
  }

  return {
    explanation: lines.join("\n"),
    signalPhrases: grounding.signalPhrases || [],
    pmbok8: {
      domains: p8.domains || [],
      focusArea: p8.focusArea || "",
      processes: p8.processes || [],
      principles: p8.principles || [],
      pages,
    },
    references: pages.length ? [`PMBOK8, tr. ${pages[0]} — ${topic}`] : [],
  };
}

module.exports = {
  composeGrounding,
  resolveTeachSignals,
  buildHeroLead,
  buildPlainViCard,
  buildGroundingCard,
  buildConceptIntro,
  buildSignalCard,
  buildActionTypeGrid,
  buildCompareTable,
  buildWhyBullets,
  buildWhyTriad,
  renderWhyTriadHtml,
  buildExcludeRows,
  hasTeachSignal,
  validateTeachGrounding,
  filterWhyBulletsForCorrect,
  buildTeachExplanationMarkdown,
  resolveGuideQuote,
  resolveGuideHits,
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
