const fs = require("fs");
const path = require("path");

const MARKER = "PMP_STAT_REALTIME_ENABLED";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const MERGE_FN = `    function mergeQuestionStatRow(a, b) {
      const A = { attempts: Number(a?.attempts) || 0, wrong: Number(a?.wrong) || 0 };
      const B = { attempts: Number(b?.attempts) || 0, wrong: Number(b?.wrong) || 0 };
      if (B.attempts > A.attempts) return B;
      if (A.attempts > B.attempts) return A;
      return { attempts: A.attempts, wrong: Math.min(A.wrong, B.wrong) };
    }

`;

const MERGE_STATS_OLD = `    function mergeStatsMaps(base, incoming) {
      const out = { ...(base || {}) };
      for (const [id, row] of Object.entries(incoming || {})) {
        const prev = out[id] || { attempts: 0, wrong: 0 };
        const next = row || {};
        out[id] = {
          attempts: Math.max(Number(prev.attempts) || 0, Number(next.attempts) || 0),
          wrong: Math.max(Number(prev.wrong) || 0, Number(next.wrong) || 0),
        };
      }
      return out;
    }`;

const MERGE_STATS_NEW = `${MERGE_FN}    function mergeStatsMaps(base, incoming) {
      const out = { ...(base || {}) };
      for (const [id, row] of Object.entries(incoming || {})) {
        out[id] = mergeQuestionStatRow(out[id], row);
      }
      return out;
    }`;

const RECORD_OLD = `    function recordQuestionAttempt(id, isCorrect) {
      if (!getActiveUser()) return;
      const stats = loadQuestionStats();
      const key = String(id);
      const row = stats[key] || { attempts: 0, wrong: 0 };
      row.attempts = (Number(row.attempts) || 0) + 1;
      if (!isCorrect) row.wrong = (Number(row.wrong) || 0) + 1;
      stats[key] = row;
      saveQuestionStats(stats);
    }`;

const RECORD_NEW = `    function recordQuestionAttempt(id, isCorrect) {
      if (!getActiveUser()) return;
      const stats = loadQuestionStats();
      const key = String(id);
      const row = stats[key] || { attempts: 0, wrong: 0 };
      row.attempts = (Number(row.attempts) || 0) + 1;
      if (!isCorrect) {
        row.wrong = (Number(row.wrong) || 0) + 1;
      } else {
        row.wrong = 0;
      }
      stats[key] = row;
      saveQuestionStats(stats);
    }

    function updateQuestionStatBadge(id) {
      const el = document.getElementById(\`q-stat-\${id}\`);
      if (!el) return;
      const stat = getQuestionStat(id);
      el.textContent = \`Đã làm: \${stat.attempts} · Sai: \${stat.wrong}\`;
      el.className = stat.wrong > 0 ? "q-stat has-wrong" : "q-stat";
    }

    function maybeAutoCheckQuestion(qid) {
      if (state.exam && !state.exam.submitted) return;
      if (!getActiveUser()) return;
      const q = questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid);
      if (!q) return;
      const answer = getAnswer(q);
      if (!isAnswerFilled(q, answer)) return;
      checkQuestion(qid);
    }`;

const CHECK_PATCH_OLD = `      if (!revealOnly && isAnswerFilled(q, userAnswer)) {
        const ok = answersMatch(q, userAnswer);
        recordQuestionAttempt(id, ok);
        if (q.type !== "image_click" && q.type !== "special") {`;

const CHECK_PATCH_NEW = `      if (!revealOnly && isAnswerFilled(q, userAnswer)) {
        const ok = answersMatch(q, userAnswer);
        recordQuestionAttempt(id, ok);
        updateQuestionStatBadge(id);
        if (state.filterWrongOnly && ok) {
          initPager();
          renderPage();
          return;
        }
        if (q.type !== "image_click" && q.type !== "special") {`;

const BADGE_OLD = `      return \`<span class="\${cls}">Đã làm: \${stat.attempts} · Sai: \${stat.wrong}</span>\`;`;
const BADGE_NEW = `      return \`<span class="\${cls}" id="q-stat-\${id}">Đã làm: \${stat.attempts} · Sai: \${stat.wrong}</span>\`;`;

const CHANGE_OLD = `    document.addEventListener("change", e => {
      const t = e.target;
      if (t.matches('input[type="radio"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        state.answers[qid] = t.value;
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(l => l.classList.remove("selected"));
        const lbl = t.closest("label.option");
        if (lbl) lbl.classList.add("selected");
      }
      saveExamState();
      if (t.matches('input[type="checkbox"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        const q = questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid);
        if (!q) return;
        state.answers[qid] = getAnswer(q);
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(lbl => {
          lbl.classList.toggle("selected", !!lbl.querySelector("input:checked"));
        });
      }
      saveExamState();
      if (t.matches("select[data-q]")) {
        const qid = Number(t.dataset.q);
        state.answers[qid] = getAnswer(questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid));
      }
      saveExamState();
      updateStats();
    });`;

const CHANGE_NEW = `    document.addEventListener("change", e => {
      const t = e.target;
      let autoCheckQid = null;
      if (t.matches('input[type="radio"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        autoCheckQid = qid;
        state.answers[qid] = t.value;
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(l => l.classList.remove("selected"));
        const lbl = t.closest("label.option");
        if (lbl) lbl.classList.add("selected");
      }
      saveExamState();
      if (t.matches('input[type="checkbox"][name^="q-"]')) {
        const qid = Number(t.name.replace("q-", ""));
        autoCheckQid = qid;
        const q = questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid);
        if (!q) return;
        state.answers[qid] = getAnswer(q);
        document.querySelectorAll(\`label.option[data-q="\${qid}"]\`).forEach(lbl => {
          lbl.classList.toggle("selected", !!lbl.querySelector("input:checked"));
        });
      }
      saveExamState();
      if (t.matches("select[data-q]")) {
        const qid = Number(t.dataset.q);
        autoCheckQid = qid;
        state.answers[qid] = getAnswer(questionBank().find(x => x.id === qid) || QUESTIONS.find(x => x.id === qid));
      }
      saveExamState();
      if (autoCheckQid != null) maybeAutoCheckQuestion(autoCheckQid);
      updateStats();
    });`;

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn("Skip:", file);
    continue;
  }

  let html = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

  if (html.includes(MARKER)) {
    console.log("Already patched:", path.basename(file));
    continue;
  }

  if (!html.includes(MERGE_STATS_OLD)) {
    throw new Error(`mergeStatsMaps block not found in ${file}`);
  }
  html = html.replace(MERGE_STATS_OLD, MERGE_STATS_NEW);

  if (!html.includes(RECORD_OLD)) {
    throw new Error(`recordQuestionAttempt block not found in ${file}`);
  }
  html = html.replace(RECORD_OLD, RECORD_NEW);

  if (!html.includes(CHECK_PATCH_OLD)) {
    throw new Error(`checkQuestion block not found in ${file}`);
  }
  html = html.replace(CHECK_PATCH_OLD, CHECK_PATCH_NEW);

  if (!html.includes(BADGE_OLD)) {
    throw new Error(`renderQuestionStatBadge block not found in ${file}`);
  }
  html = html.replace(BADGE_OLD, BADGE_NEW);

  if (!html.includes(CHANGE_OLD)) {
    throw new Error(`change listener block not found in ${file}`);
  }
  html = html.replace(CHANGE_OLD, CHANGE_NEW);

  html = html.replace(
    "const PMP_STATS_SYNC_ENABLED = true;",
    `const ${MARKER} = true;\n    const PMP_STATS_SYNC_ENABLED = true;`,
  );

  fs.writeFileSync(file, html);
  console.log("Patched:", path.basename(file));
}
