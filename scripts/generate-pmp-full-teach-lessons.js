/**
 * Generate PMBOK 8 teach lessons for all questions in pmp-full-questions.json.
 * Usage: node scripts/generate-pmp-full-teach-lessons.js [--force] [--from=N] [--to=N] [--allow-incomplete]
 */
const fs = require("fs");
const path = require("path");
const { generateTeachAnalysis } = require("./lib/pmp-pmbok8-generator");
const { loadCacheFile, formatGuideQuote } = require("./lib/pmp-pmbok8-rag-pages");
const { getStoredTeachGrounding } = require("./lib/pmp-teach-signals-store");
const {
  highlightExamCues,
  highlightQuizStem,
  highlightOptionText,
  highlightReasoning,
  mdInlineHighlighted,
} = require("./lib/pmp-teach-keywords");
const {
  buildHeroLead,
  buildSignalCard,
  buildWhyBullets,
  buildExcludeRows,
  buildFlashcards,
  buildCheatSheet,
  composeGrounding,
  validateTeachGrounding,
  quizExplMap,
  conceptLabel,
} = require("./lib/pmp-teach-colocation-style");

const PMP_DIR = path.join(__dirname, "..", "public", "pmp");
const JSON_PATH = path.join(PMP_DIR, "pmp-full-questions.json");
const FULL_HTML = path.join(PMP_DIR, "pmp-full-questions.html");
const INDEX_PATH = path.join(PMP_DIR, "pmp-teach-full-series-index.html");
const SERIES_JS = path.join(__dirname, "pmp-full-teach-series.js");

const args = process.argv.slice(2);
const force = args.includes("--force");
const allowIncomplete = args.includes("--allow-incomplete");
const fromArg = args.find((a) => a.startsWith("--from="));
const toArg = args.find((a) => a.startsWith("--to="));
const fromId = fromArg ? Number(fromArg.split("=")[1]) : 1;
const toId = toArg ? Number(toArg.split("=")[1]) : Infinity;

const questions = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

function lessonFile(id) {
  return `pmp-teach-full-q${id}.html`;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdInline(s) {
  return mdInlineHighlighted(s);
}

function formatMappingList(val) {
  if (Array.isArray(val)) return val.join(", ");
  return String(val || "");
}

function formatFirstItem(val) {
  if (Array.isArray(val)) return val[0] || "";
  return String(val || "").split(",")[0].trim();
}

function shortTitle(q) {
  const t = (q.text || "").replace(/\(Choose\s+\d+\)/gi, "").trim();
  const words = t.split(/\s+/).slice(0, 6).join(" ");
  return words.length > 52 ? words.slice(0, 49) + "…" : words;
}

function parseMapping(explanation) {
  const m = {};
  if (!explanation) return m;
  const dm = explanation.match(/- Domain: (.+)/);
  const fa = explanation.match(/- Focus Area: (.+)/);
  const pr = explanation.match(/- Process: (.+)/);
  const pi = explanation.match(/- Principle: (.+)/);
  if (dm) m.domain = dm[1].trim();
  if (fa) m.focus = fa[1].trim();
  if (pr) m.process = pr[1].trim();
  if (pi) m.principle = pi[1].trim();
  return m;
}

function parseSection(explanation, header) {
  if (!explanation) return "";
  const re = new RegExp(`\\*\\*${header}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`);
  const m = explanation.match(re);
  return m ? m[1].trim() : "";
}

function parseExcludeRows(explanation) {
  const block = parseSection(explanation, "Loại trừ phương án khác");
  if (!block) return [];
  const rows = [];
  for (const line of block.split("\n")) {
    const m = line.match(/^- \*\*([A-Z]):\*\* (.+)/);
    if (m) rows.push({ key: m[1], text: m[2] });
  }
  return rows;
}

function isMultiSelect(q) {
  return q.type === "mcq" && String(q.correct || "").includes(",");
}

function correctKeys(q) {
  return String(q.correct || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function renderOptionsGridFromAnalysis(optionAnalysis) {
  if (!optionAnalysis?.length) return "";
  return `<div class="approach-grid">${optionAnalysis
    .map((o) => {
      const ok = o.isCorrect;
      const reason = ok
        ? "Đáp án đúng — xem phân tích chi tiết bên dưới."
        : o.reason || "Không phù hợp tình huống.";
      return `<div class="approach-cell${ok ? " pull" : ""}">
        <strong>${escapeHtml(o.key)} — ${ok ? "Đúng" : "Sai"}</strong>
        ${highlightOptionText(o.text, ok)}
        <p style="margin:0.45rem 0 0;font-size:0.78rem;color:var(--muted)">${mdInline(reason)}</p>
      </div>`;
    })
    .join("")}</div>`;
}

function guideQuoteText(q, analysis) {
  const stored = getStoredTeachGrounding(q.id);
  if (stored?.guideQuote) return formatGuideQuote(stored.guideQuote, 600);
  const insight = parseSection(analysis.explanation || "", "PMBOK 8 — Cơ sở từ Guide");
  if (insight) {
    const quote = insight.split("\n").find((l) => l.startsWith("> ") && !l.startsWith("> —"));
    if (quote) return formatGuideQuote(quote.replace(/^>\s*/, "").trim());
  }
  if (analysis.pageInfo?.snippet) return formatGuideQuote(analysis.pageInfo.snippet);
  return "";
}

function renderPmbok8Insight(q, analysis) {
  const pageInfo = analysis.pageInfo;
  const excerpt = guideQuoteText(q, analysis);
  if (!excerpt || excerpt.length < 40) return "";
  const pages = pageInfo?.pages?.join(", ") || "";
  const topic = pageInfo?.topic || "";
  return `<div class="card info">
            <h4>Trích dẫn Guide</h4>
            <p style="margin:0">"${highlightReasoning(excerpt)}"</p>
            ${pages ? `<p style="margin:0.5rem 0 0;font-size:0.82rem;color:var(--muted)">— PMBOK 8, tr. ${escapeHtml(pages)}${topic ? ` (${escapeHtml(topic)})` : ""}</p>` : ""}
          </div>`;
}

function renderAnalysisSection(q, analysis) {
  const refs = parseSection(analysis.explanation || "", "Tham khảo");
  let html = renderPmbok8Insight(q, analysis);
  if (refs) {
    html += `<p style="font-size:0.86rem;color:var(--muted);margin:0">${mdInline(refs).replace(/\n/g, "<br>")}</p>`;
  }
  return html;
}

function renderExcludeTableFromAnalysis(q, analysis) {
  const wrong = buildExcludeRows(q, analysis).filter((o) => o.reason);
  if (!wrong.length) return "";
  return `<table>
            <thead><tr><th>Đáp án</th><th>Tại sao không chọn (grounding AI)</th></tr></thead>
            <tbody>${wrong
              .map(
                (o) =>
                  `<tr><td><strong>${o.key}</strong><br><span style="font-size:0.8rem;color:var(--muted)">${highlightOptionText(o.text.slice(0, 80), false)}${o.text.length > 80 ? "…" : ""}</span></td><td>${mdInline(o.reason)}</td></tr>`,
              )
              .join("")}</tbody>
          </table>`;
}

function renderOptionsGrid(q) {
  const keys = correctKeys(q);
  if (!q.options?.length) return "";
  return `<div class="approach-grid">${q.options
    .map((o) => {
      const ok = keys.includes(o.key);
      return `<div class="approach-cell${ok ? " pull" : ""}">
        <strong>${escapeHtml(o.key)} — ${ok ? "Đúng" : "Sai"}</strong>
        ${escapeHtml(o.text)}
      </div>`;
    })
    .join("")}</div>`;
}

function renderMcqQuiz(q, signalPhrases) {
  const multi = isMultiSelect(q);
  const opts = (q.options || [])
    .map(
      (o) =>
        `<button class="opt-btn" data-opt="${o.key}" type="button">${o.key}. ${highlightOptionText(o.text, correctKeys(q).includes(o.key))}</button>`,
    )
    .join("\n            ");
  return `<div class="quiz-card" id="mainQuiz">
            <div class="q-num">pmp-full-questions · Câu ${q.id}${multi ? " · Chọn nhiều" : ""}</div>
            <div class="q-text">${highlightQuizStem(q.text, signalPhrases)}</div>
            ${opts}
            <div class="feedback" id="quizFeedback"></div>
          </div>`;
}

function renderNonMcqAnswer(q) {
  if (q.type === "drag_drop") {
    return `<div class="card info">
            <h4>Drag &amp; Drop — Đáp án đúng</h4>
            <p style="margin:0"><strong>${escapeHtml(q.correctLabel || q.correct)}</strong></p>
            ${q.dragTerms?.length ? `<p style="margin:0.5rem 0 0">Thuật ngữ: ${escapeHtml(q.dragTerms.join(", "))}</p>` : ""}
          </div>`;
  }
  if (q.type === "dropdown") {
    return `<div class="card info">
            <h4>Dropdown — Đáp án đúng</h4>
            <p style="margin:0"><strong>${escapeHtml(q.correctLabel || q.correct)}</strong></p>
          </div>`;
  }
  return "";
}

function renderQuizBlock(q, signalPhrases) {
  if (q.type === "mcq" && q.options?.length) return renderMcqQuiz(q, signalPhrases);
  return `<div class="quiz-card">
            <div class="q-num">pmp-full-questions · Câu ${q.id} · ${escapeHtml(q.type)}</div>
            <div class="q-text">${highlightQuizStem(q.text, signalPhrases)}</div>
          </div>
          ${renderNonMcqAnswer(q)}`;
}

function renderExplanationBody(explanation) {
  const why = parseSection(explanation, "Vì sao chọn đáp án này") || parseSection(explanation, "Vì sao mapping đúng");
  const refs = parseSection(explanation, "Tham khảo");
  let html = "";
  if (why) {
    html += `<div class="card tip"><h4>Vì sao chọn đáp án này</h4><p style="margin:0">${mdInline(why).replace(/\n/g, "<br>")}</p></div>`;
  }
  if (refs) {
    html += `<div class="card info"><h4>Tham khảo PMBOK 8</h4><p style="margin:0">${mdInline(refs).replace(/\n/g, "<br>")}</p></div>`;
  }
  if (!html) {
    html = `<div class="explanation-body">${mdInline(explanation || "").replace(/\n/g, "<br>")}</div>`;
  }
  return html;
}

function renderExcludeTable(q, explanation) {
  const rows = parseExcludeRows(explanation);
  if (rows.length) {
    return `<table>
            <thead><tr><th>Đáp án</th><th>Tại sao không chọn</th></tr></thead>
            <tbody>${rows
              .map(
                (r) =>
                  `<tr><td><strong>${r.key}</strong></td><td>${mdInline(r.text)}</td></tr>`,
              )
              .join("")}</tbody>
          </table>`;
  }
  const keys = correctKeys(q);
  const wrong = (q.options || []).filter((o) => !keys.includes(o.key));
  if (!wrong.length) return "";
  return `<table>
            <thead><tr><th>Đáp án</th><th>Ghi chú</th></tr></thead>
            <tbody>${wrong
              .map((o) => `<tr><td><strong>${o.key}</strong></td><td>${escapeHtml(o.text)}</td></tr>`)
              .join("")}</tbody>
          </table>`;
}

function quizScript(q, analysis) {
  if (q.type !== "mcq" || !q.options?.length) return "";
  const multi = isMultiSelect(q);
  const correct = q.correct;
  const expl = quizExplMap(analysis.optionAnalysis || []);
  const correctLabel = JSON.stringify(q.correctLabel || q.correct);
  if (multi) {
    return `<script>
    (function () {
      const CORRECT = ${JSON.stringify(correctKeys(q))};
      const picked = new Set();
      document.querySelectorAll("#mainQuiz .opt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.disabled) return;
          const k = btn.dataset.opt;
          if (picked.has(k)) { picked.delete(k); btn.classList.remove("correct", "wrong"); return; }
          picked.add(k);
          btn.classList.add("correct");
          if (picked.size !== CORRECT.length) return;
          const ok = CORRECT.every(function (c) { return picked.has(c); }) && picked.size === CORRECT.length;
          document.querySelectorAll("#mainQuiz .opt-btn").forEach(function (b) {
            b.disabled = true;
            if (CORRECT.includes(b.dataset.opt)) b.classList.add("correct");
            else if (picked.has(b.dataset.opt)) b.classList.add("wrong");
          });
          const fb = document.getElementById("quizFeedback");
          fb.className = "feedback show " + (ok ? "ok" : "bad");
          fb.innerHTML = ok ? "<strong>Chính xác!</strong>" : "<strong>Chưa đúng.</strong> Đáp án: <strong>" + ${correctLabel} + "</strong>";
        });
      });
    })();
  </script>`;
  }
  return `<script>
    (function () {
      const CORRECT = ${JSON.stringify(correct)};
      const EXPL = ${JSON.stringify(expl)};
      let answered = false;
      document.querySelectorAll("#mainQuiz .opt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          const c = btn.dataset.opt;
          document.querySelectorAll("#mainQuiz .opt-btn").forEach(function (b) {
            b.disabled = true;
            if (b.dataset.opt === CORRECT) b.classList.add("correct");
            else if (b === btn) b.classList.add("wrong");
          });
          const fb = document.getElementById("quizFeedback");
          fb.className = "feedback show " + (c === CORRECT ? "ok" : "bad");
          fb.innerHTML = (c === CORRECT ? "<strong>Chính xác!</strong> " : "<strong>Chưa đúng.</strong> ") +
            (EXPL[c] || "") + (c !== CORRECT ? "<br><br>Đáp án: <strong>" + ${correctLabel} + "</strong>" : "");
        });
      });
    })();
  </script>`;
}

function sectionNumbers() {
  return { question: 1, analysis: 2, flashcards: 3, cheatsheet: 4 };
}

function renderLesson(q, prev, next) {
  const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
  const mapping = analysis.pmbok8 || parseMapping(analysis.explanation);
  const concept = conceptLabel(mapping, analysis.pageInfo);
  const title = shortTitle(q);
  const file = lessonFile(q.id);
  const pagesBadge = analysis.pageInfo?.pages?.length
    ? `PMBOK 8, tr. ${analysis.pageInfo.pages.slice(0, 2).join(", ")}`
    : "";
  const badges = [
    pagesBadge,
    formatMappingList(mapping.domains || mapping.domain),
    concept,
    `Full Bank Q${q.id}`,
  ].filter(Boolean);
  const whyBullets = buildWhyBullets(analysis, q);
  const grounding = composeGrounding(q, analysis);
  const excludeHtml = renderExcludeTableFromAnalysis(q, analysis);
  const sec = sectionNumbers();

  const prevLink = prev ? `<a href="${lessonFile(prev.id)}">← Câu ${prev.id}</a>` : "";
  const nextLink = next ? `<a href="${lessonFile(next.id)}">Câu ${next.id} →</a>` : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMBOK 8 — Câu ${q.id}: ${escapeHtml(title)} (Full Bank)</title>
  <style>
    :root {
      --bg: #fafaf8; --card: #ffffff; --text: #1f2937; --muted: #6b7280;
      --primary: #d97706; --primary-dark: #b45309; --primary-bg: #fffbeb;
      --ok: #059669; --ok-bg: #ecfdf5; --bad: #dc2626; --bad-bg: #fef2f2;
      --info: #2563eb; --info-bg: #eff6ff; --border: #e5e7eb;
      --shadow: 0 8px 24px rgba(15, 23, 42, 0.08); --radius: 14px; --sidebar-w: 260px;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; width: 100%; min-height: 100dvh; font-family: "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .layout { display: grid; grid-template-columns: var(--sidebar-w) 1fr; min-height: 100dvh; width: 100%; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .sidebar { display: none; } .mobile-nav { display: flex !important; } }
    .sidebar { position: sticky; top: 0; height: 100vh; overflow-y: auto; background: var(--card); border-right: 1px solid var(--border); padding: 1.25rem 1rem 2rem; }
    .sidebar .brand { font-size: 1rem; font-weight: 700; color: var(--primary); }
    .sidebar .brand-sub { font-size: 0.78rem; color: var(--muted); margin: 0.2rem 0 1rem; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border); }
    .sidebar nav a { display: block; padding: 0.45rem 0.65rem; color: var(--muted); text-decoration: none; border-radius: 8px; font-size: 0.86rem; margin-bottom: 1px; }
    .sidebar nav a:hover, .sidebar nav a.active { background: var(--primary-bg); color: var(--primary-dark); }
    .sidebar nav a.active { font-weight: 600; border-left: 3px solid var(--primary); }
    .sidebar .nav-series { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin: 1rem 0 0.35rem 0.65rem; }
    .sidebar .series-current { font-weight: 600; color: var(--primary-dark); background: var(--primary-bg); }
    .sidebar .back-link { display: block; margin-top: 1.25rem; padding: 0.65rem 0.85rem; background: var(--primary); color: #fff; text-align: center; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.88rem; }
    .sidebar .back-link.secondary { margin-top: 0.5rem; background: var(--card); color: var(--primary-dark); border: 1px solid var(--border); }
    .sidebar .back-link.secondary:hover { background: var(--primary-bg); }
    .lesson-pager { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }
    .lesson-pager a { flex: 1; min-width: 7rem; text-align: center; padding: 0.45rem 0.6rem; border-radius: 8px; border: 1px solid var(--border); text-decoration: none; font-size: 0.82rem; color: var(--primary-dark); background: var(--bg); }
    .lesson-pager a:hover { background: var(--primary-bg); }
    .mobile-nav { display: none; position: sticky; top: 0; z-index: 30; background: var(--card); border-bottom: 1px solid var(--border); padding: 0.6rem 0.85rem; gap: 0.4rem; overflow-x: auto; }
    .mobile-nav a { white-space: nowrap; padding: 0.35rem 0.7rem; background: var(--bg); color: var(--muted); text-decoration: none; border-radius: 99px; font-size: 0.78rem; border: 1px solid var(--border); }
    main { max-width: none; width: 100%; padding: 1.5rem clamp(1rem, 3vw, 2.5rem) 4rem; }
    .hero { background: linear-gradient(135deg, #fff 0%, var(--primary-bg) 100%); border: 1px solid #fde68a; border-radius: var(--radius); padding: 1.75rem 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow); }
    .hero h1 { margin: 0 0 0.5rem; font-size: clamp(1.35rem, 3vw, 1.75rem); }
    .hero .lead { margin: 0; color: var(--muted); font-size: 0.95rem; max-width: 72ch; }
    .badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; }
    .badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 99px; background: #fff; border: 1px solid var(--border); color: var(--primary-dark); font-weight: 500; }
    section { margin-bottom: 2.5rem; scroll-margin-top: 1rem; }
    section > h2 { font-size: 1.3rem; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary); color: var(--primary-dark); }
    section p { margin: 0 0 0.75rem; }
    section ul { margin: 0 0 1rem 1.2rem; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem 1.25rem; margin-bottom: 1rem; }
    .card.tip { border-left: 4px solid var(--ok); background: var(--ok-bg); }
    .card.warn { border-left: 4px solid var(--primary); background: var(--primary-bg); }
    .card.danger { border-left: 4px solid var(--bad); background: var(--bad-bg); }
    .card.info { border-left: 4px solid var(--info); background: var(--info-bg); }
    .card h4 { margin: 0 0 0.5rem; font-size: 0.95rem; }
    .signal-card .signal-phrases-en { margin: 0 0 0.65rem; font-size: 0.9rem; line-height: 1.55; }
    .signal-card .signal-answer-en { margin: 0 0 0.5rem; font-size: 0.92rem; line-height: 1.55; }
    .signal-card .signal-conclusion { font-size: 0.9rem; }
    section h3 { font-size: 1.05rem; margin: 1.25rem 0 0.65rem; }
    table { width: 100%; border-collapse: collapse; margin: 0.75rem 0 1rem; font-size: 0.88rem; background: var(--card); border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
    th, td { border-bottom: 1px solid var(--border); padding: 0.55rem 0.75rem; text-align: left; vertical-align: top; }
    th { background: var(--bg); color: var(--primary-dark); font-weight: 600; font-size: 0.82rem; }
    tr:last-child td { border-bottom: none; }
    .approach-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
    @media (max-width: 700px) { .approach-grid { grid-template-columns: 1fr; } }
    .approach-cell { padding: 0.85rem; background: var(--card); border: 1px solid var(--border); border-radius: 10px; font-size: 0.8rem; }
    .approach-cell strong { display: block; color: var(--primary-dark); margin-bottom: 0.35rem; }
    .approach-cell.pull { border-color: var(--ok); background: var(--ok-bg); }
    .quiz-card { background: var(--card); border: 2px solid var(--border); border-radius: var(--radius); padding: 1.25rem; margin-bottom: 1rem; }
    .quiz-card .q-num { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 0.5rem; }
    .quiz-card .q-text { font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.65; }
    .quiz-card .q-text em { font-style: normal; background: #fef9c3; padding: 0.1rem 0.25rem; border-radius: 4px; }
    .kw-cue { font-style: normal; background: #fef9c3; color: #854d0e; padding: 0.1rem 0.25rem; border-radius: 4px; font-weight: 600; }
    .kw-signal { background: #ecfdf5; color: #065f46; padding: 0.08rem 0.22rem; border-radius: 4px; font-weight: 600; }
    .kw-trap { background: #fef2f2; color: #991b1b; padding: 0.08rem 0.22rem; border-radius: 4px; font-weight: 500; }
    .kw-pmbok { background: #fffbeb; color: #b45309; padding: 0.08rem 0.22rem; border-radius: 4px; font-weight: 600; }
    .kw-legend { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; font-size: 0.78rem; color: var(--muted); margin: 0.75rem 0 0; }
    .kw-legend span { display: inline-flex; align-items: center; gap: 0.3rem; }
    .opt-btn { display: block; width: 100%; text-align: left; padding: 0.7rem 1rem; margin-bottom: 0.45rem; background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
    .opt-btn:hover:not(:disabled) { border-color: var(--primary); background: var(--primary-bg); }
    .opt-btn.correct { border-color: var(--ok); background: var(--ok-bg); color: #065f46; font-weight: 600; }
    .opt-btn.wrong { border-color: var(--bad); background: var(--bad-bg); color: #991b1b; opacity: 0.85; }
    .opt-btn:disabled { cursor: default; }
    .feedback { display: none; margin-top: 1rem; padding: 1rem; border-radius: 10px; font-size: 0.9rem; }
    .feedback.show { display: block; }
    .feedback.ok { background: var(--ok-bg); border: 1px solid #a7f3d0; }
    .feedback.bad { background: var(--bad-bg); border: 1px solid #fecaca; }
    .flashcard { perspective: 1000px; height: 150px; cursor: pointer; margin-bottom: 0.75rem; }
    .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s; transform-style: preserve-3d; }
    .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
    .flashcard-front, .flashcard-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: var(--radius); padding: 1rem; display: flex; align-items: center; justify-content: center; text-align: center; border: 1px solid var(--border); font-size: 0.88rem; }
    .flashcard-front { background: var(--card); font-weight: 600; }
    .flashcard-back { background: var(--primary-bg); border-color: #fde68a; transform: rotateY(180deg); }
    .flash-hint { font-size: 0.78rem; color: var(--muted); text-align: center; margin-bottom: 1rem; }
    .cheat-sheet { background: #1f2937; color: #f3f4f6; border-radius: var(--radius); padding: 1.25rem; font-family: Consolas, monospace; font-size: 0.8rem; line-height: 1.55; white-space: pre-wrap; }
    .ref-footer { font-size: 0.82rem; color: var(--muted); border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 2rem; }
  </style>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">PMBOK 8 Teach</div>
      <div class="brand-sub">Full Bank · Câu ${q.id}</div>
      <nav id="sideNav">
        <a href="#intro" class="active">Giới thiệu</a>
        <a href="#question">Câu hỏi</a>
        <a href="#analysis">Phân tích</a>
        <a href="#flashcards">Flashcard</a>
        <a href="#cheatsheet">Cheat sheet</a>
        <div class="nav-series">Bộ luyện Full ${questions.length} câu</div>
        <a href="${file}" class="series-current">Câu ${q.id}</a>
        <a href="pmp-teach-full-series-index.html">→ Index Full Bank</a>
        <a href="pmp-full-questions.html#q-${q.id}">→ Luyện câu ${q.id}</a>
        <div class="lesson-pager">${prevLink}${nextLink}</div>
      </nav>
      <a class="back-link" href="pmp-exam-prep-lecture.html">← Về bài giảng PMP</a>
      <a class="back-link secondary" href="pmp-full-questions.html">Luyện ${questions.length} câu</a>
    </aside>
    <div>
      <nav class="mobile-nav">
        <a href="pmp-teach-full-series-index.html">Index</a>
        <a href="pmp-full-questions.html#q-${q.id}">Câu ${q.id}</a>
        <a href="#question">Quiz</a>
        <a href="#analysis">Phân tích</a>
        ${prev ? `<a href="${lessonFile(prev.id)}">← ${prev.id}</a>` : ""}
        ${next ? `<a href="${lessonFile(next.id)}">${next.id} →</a>` : ""}
      </nav>
      <main>
        <header class="hero" id="intro">
          <h1>Practice Questions — PMBOK 8th Ed · Q${q.id}</h1>
          <p class="lead">${buildHeroLead(q, analysis, mapping)}</p>
          <div class="badges">${badges.map((b) => `<span class="badge">${escapeHtml(b)}</span>`).join("")}</div>
          <p class="kw-legend">
            <span><span class="kw-cue">cue</span> từ khóa đề bài</span>
            <span><span class="kw-signal">signal</span> gợi ý đáp án đúng</span>
            <span><span class="kw-trap">trap</span> bẫy PMI</span>
            <span><span class="kw-pmbok">PMBOK</span> thuật ngữ Guide</span>
          </p>
        </header>

        <section id="question">
          <h2>${sec.question}. Câu hỏi thực hành — Full Bank Q${q.id}</h2>
          ${renderQuizBlock(q, grounding.signalPhrases)}
          <p style="font-size:0.86rem;color:var(--muted)">
            <a href="pmp-full-questions.html#q-${q.id}">→ Mở câu ${q.id} trong bộ luyện đầy đủ</a>
          </p>
        </section>

        <section id="analysis">
          <h2>${sec.analysis}. Phân tích đáp án — Đáp án đúng: ${escapeHtml(q.correct)}</h2>
          ${buildSignalCard(q, analysis)}
          <h3>Tại sao chọn ${escapeHtml(q.correct)}?</h3>
          <ul>${whyBullets.map((b) => `<li>${mdInline(b)}</li>`).join("")}</ul>
          <div class="card tip">
            <h4>Đáp án</h4>
            <p style="margin:0"><strong>${escapeHtml(q.correctLabel || q.correct)}</strong></p>
          </div>
          ${renderAnalysisSection(q, analysis)}
          ${excludeHtml ? `<h3>Loại trừ từng đáp án</h3>\n          ${excludeHtml}` : ""}
        </section>

        <section id="flashcards">
          <h2>${sec.flashcards}. Flashcard</h2>
          <p class="flash-hint">Nhấn để lật</p>
          ${buildFlashcards(q, analysis, mapping)}
        </section>

        <section id="cheatsheet">
          <h2>${sec.cheatsheet}. Cheat sheet</h2>
          <div class="cheat-sheet">${escapeHtml(buildCheatSheet(q, analysis, mapping))}</div>
        </section>

        <footer class="ref-footer">
          ${prevLink} · ${nextLink} ·
          <a href="pmp-full-questions.html#q-${q.id}">Luyện câu ${q.id}</a> ·
          <a href="pmp-teach-full-series-index.html">Index Full Bank</a> ·
          <a href="pmp-exam-prep-lecture.html">Bài giảng PMP</a>
        </footer>
      </main>
    </div>
  </div>
  ${quizScript(q, analysis)}
  <script>
    (function () {
      document.querySelectorAll(".flashcard").forEach(function (card) {
        function flip() { card.classList.toggle("flipped"); }
        card.addEventListener("click", flip);
        card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      });
      const sections = document.querySelectorAll("main section[id], main header[id]");
      const navLinks = document.querySelectorAll("#sideNav a[href^='#']");
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            navLinks.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
            });
          }
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      sections.forEach(function (s) { obs.observe(s); });
    })();
  </script>
</body>
</html>`;
}

function renderIndex(all) {
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < all.length; i += batchSize) {
    const slice = all.slice(i, i + batchSize);
    batches.push({ start: slice[0].id, end: slice[slice.length - 1].id, items: slice });
  }
  const chips = batches
    .map((b) => `<a class="teach-group-chip" href="#full-q${b.start}-${b.end}">Q${b.start}–${b.end}</a>`)
    .join("\n            ");
  const groups = batches
    .map(
      (b) => `          <div id="full-q${b.start}-${b.end}" class="teach-group">
            <div class="teach-group-head">
              <h3>Q${b.start}–${b.end}</h3>
            </div>
            <div class="teach-grid">
${b.items
  .map((q) => {
    const t = shortTitle(q);
    const m = parseMapping(q.explanation);
    const label = formatFirstItem(m.process || m.domain) || "PMBOK 8";
    return `              <a class="teach-card" href="${lessonFile(q.id)}">
                <div class="q-label">Câu ${q.id}</div>
                <h4>${escapeHtml(t)}</h4>
                <p>${escapeHtml(label)}</p>
              </a>`;
  })
  .join("\n")}
            </div>
          </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PMBOK 8 — Full Bank Teach Index (${all.length} câu)</title>
  <link rel="stylesheet" href="pmp-teach-fullscreen.css">
  <style>
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: #fafaf8; color: #1f2937; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
    h1 { margin: 0 0 0.5rem; color: #b45309; }
    .lead { color: #6b7280; margin: 0 0 1.5rem; }
    .toolbar { margin-bottom: 1rem; }
    .toolbar a { display: inline-block; margin-right: 0.5rem; padding: 0.5rem 0.85rem; background: #d97706; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.88rem; }
    .toolbar a.secondary { background: #fff; color: #b45309; border: 1px solid #e5e7eb; }
    .teach-group-jump { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }
    .teach-group-chip { padding: 0.3rem 0.65rem; border-radius: 99px; border: 1px solid #e5e7eb; background: #fff; color: #b45309; text-decoration: none; font-size: 0.78rem; font-weight: 600; }
    .teach-group { margin-bottom: 2rem; }
    .teach-group-head h3 { margin: 0 0 0.75rem; color: #b45309; border-bottom: 2px solid #fde68a; padding-bottom: 0.35rem; }
    .teach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
    .teach-card { display: block; padding: 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: inherit; }
    .teach-card:hover { border-color: #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .teach-card .q-label { font-size: 0.72rem; font-weight: 700; color: #d97706; text-transform: uppercase; }
    .teach-card h4 { margin: 0.35rem 0; font-size: 0.92rem; line-height: 1.35; }
    .teach-card p { margin: 0; font-size: 0.78rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Bài giảng Full Bank PMBOK 8</h1>
    <p class="lead">${all.length} câu — mỗi câu có phân tích PMBOK 8, quiz, flashcard và cheat sheet.</p>
    <div class="toolbar">
      <a href="pmp-exam-prep-lecture.html">← Bài giảng PMP</a>
      <a href="pmp-full-questions.html" class="secondary">Luyện đề Full Bank</a>
      <a href="${lessonFile(1)}" class="secondary">Bắt đầu Câu 1</a>
    </div>
    <div class="teach-group-jump">
            ${chips}
    </div>
${groups}
  </div>
</body>
</html>`;
}

function writeSeriesJs(all) {
  const lines = all.map(
    (q) => `  ["${lessonFile(q.id)}", "Q${q.id}: ${shortTitle(q).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"],`,
  );
  const content = `/** Auto-generated by generate-pmp-full-teach-lessons.js */\nmodule.exports.FULL_SERIES = [\n${lines.join("\n")}\n];\n`;
  fs.writeFileSync(SERIES_JS, content);
}

function patchFullQuestionsHtml() {
  let html = fs.readFileSync(FULL_HTML, "utf8");
  html = html.replace(
    /    const TEACH_LESSONS = \{[\s\S]*?\};\n/,
    "",
  );
  html = html.replace(
    /    function teachLessonHref\(id\) \{[\s\S]*?\n    \}\n/,
    `    function teachLessonHref(id) {
      return "pmp-teach-full-q" + id + ".html";
    }
`,
  );
  html = html.replace(
    /    function renderTeachLink\(id\) \{[\s\S]*?\n    \}\n/,
    `    function renderTeachLink(id) {
      return \`<a class="q-teach-link" href="\${teachLessonHref(id)}" target="_blank" rel="noopener">📖 Bài giảng</a>\`;
    }
`,
  );
  fs.writeFileSync(FULL_HTML, html);
}

function main() {
  loadCacheFile();
  let written = 0;
  let skipped = 0;
  let incomplete = 0;
  const incompleteIds = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.id < fromId || q.id > toId) continue;
    const outPath = path.join(PMP_DIR, lessonFile(q.id));
    if (fs.existsSync(outPath) && !force) {
      skipped++;
      continue;
    }
    const prev = i > 0 ? questions[i - 1] : null;
    const next = i < questions.length - 1 ? questions[i + 1] : null;
    const analysis = generateTeachAnalysis(q, { preserveOriginal: false });
    const validation = validateTeachGrounding(q, analysis);
    if (!validation.ok && !allowIncomplete) {
      incomplete++;
      incompleteIds.push(q.id);
      console.warn(validation.errors.join("; "));
      skipped++;
      continue;
    }
    fs.writeFileSync(outPath, renderLesson(q, prev, next), "utf8");
    written++;
    if (written % 100 === 0) console.log(`  ... ${written} lessons`);
  }

  fs.writeFileSync(INDEX_PATH, renderIndex(questions), "utf8");
  writeSeriesJs(questions);
  patchFullQuestionsHtml();

  console.log(`Done: ${written} written, ${skipped} skipped, ${incomplete} incomplete (no write)`);
  if (incompleteIds.length) {
    console.log(`Incomplete IDs (fill data/pmp-teach-signals.json then re-run): ${incompleteIds.slice(0, 30).join(", ")}${incompleteIds.length > 30 ? ` … +${incompleteIds.length - 30} more` : ""}`);
  }
  console.log(`Index: ${INDEX_PATH}`);
  console.log(`Series: ${SERIES_JS}`);
}

main();
