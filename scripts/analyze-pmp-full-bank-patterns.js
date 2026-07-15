/**
 * Classify ALL Full Bank questions (1123) into LWA taxonomy v2 patterns.
 *
 * Usage: node scripts/analyze-pmp-full-bank-patterns.js
 */
const fs = require("fs");
const path = require("path");
const { PATTERNS, assign, TAXONOMY_VERSION } = require("./lib/pmp-trap-patterns");

const ROOT = path.join(__dirname, "..");
const QUESTIONS = path.join(ROOT, "public", "pmp", "pmp-full-questions.json");
const EXPLAIN = path.join(ROOT, "data", "pmp-full-pmbok8-explanations.json");
const SIGNALS = path.join(ROOT, "data", "pmp-teach-signals.json");
const LWA_PACK = path.join(ROOT, "data", "pmp-luannt115-full-last-wrong-patterns.json");
const OUT = path.join(ROOT, "data", "pmp-full-bank-patterns.json");

function loadStatsOverlay() {
  if (!fs.existsSync(LWA_PACK)) return new Map();
  const pack = JSON.parse(fs.readFileSync(LWA_PACK, "utf8"));
  return new Map(
    (pack.rows || []).map((r) => [
      r.id,
      {
        attempts: r.attempts || 0,
        wrongAttempt: r.wrongAttempt || 0,
        lastWrongAttempt: r.lastWrongAttempt || 0,
      },
    ]),
  );
}

function main() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS, "utf8"));
  const explanations = fs.existsSync(EXPLAIN)
    ? JSON.parse(fs.readFileSync(EXPLAIN, "utf8"))
    : {};
  const signals = fs.existsSync(SIGNALS)
    ? JSON.parse(fs.readFileSync(SIGNALS, "utf8"))
    : {};
  const statsById = loadStatsOverlay();

  const buckets = Object.fromEntries(
    [...PATTERNS.map((p) => p.id), "other"].map((id) => [
      id,
      { id, count: 0, hard: 0, open: 0, sampleIds: [], rows: [] },
    ]),
  );

  const enriched = [];
  for (const q of questions) {
    const ex = explanations[String(q.id)];
    const sig = signals[String(q.id)];
    const st = statsById.get(q.id) || {
      attempts: 0,
      wrongAttempt: 0,
      lastWrongAttempt: 0,
    };
    const patternId = assign(q, ex, sig);
    const row = {
      id: q.id,
      attempts: st.attempts,
      wrongAttempt: st.wrongAttempt,
      lastWrongAttempt: st.lastWrongAttempt,
      patternId,
      domain: (ex?.pmbok8?.domains || []).join(", ") || null,
      focus: ex?.pmbok8?.focusArea || null,
      process: (ex?.pmbok8?.processes || [])[0] || null,
      stem: String(q.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200),
      correct: q.correct,
      correctLabel: String(q.correctLabel || "").slice(0, 220),
    };
    enriched.push(row);
    const b = buckets[patternId];
    b.count += 1;
    if (st.lastWrongAttempt >= 3) b.hard += 1;
    if (st.wrongAttempt > 0) b.open += 1;
    b.rows.push(row);
  }

  for (const b of Object.values(buckets)) {
    b.rows.sort((a, c) => a.id - c.id);
    b.sampleIds = b.rows.slice(0, 10).map((r) => ({
      id: r.id,
      lastWrongAttempt: r.lastWrongAttempt,
      wrongAttempt: r.wrongAttempt,
      attempts: r.attempts,
      process: r.process,
    }));
  }

  const patterns = PATTERNS.map((p) => ({
    id: p.id,
    title: p.title,
    cue: p.cue,
    action: p.action,
    trap: p.trap,
    count: buckets[p.id].count,
    hard: buckets[p.id].hard,
    open: buckets[p.id].open,
    sampleIds: buckets[p.id].sampleIds,
  }));

  const openWrong = enriched.filter((r) => r.wrongAttempt > 0).length;
  const out = {
    summary: {
      total: enriched.length,
      openWrong,
      closed: enriched.length - openWrong,
      updatedAt: new Date().toISOString(),
      criteria: "all Full Bank questions",
      sort: "id ASC",
      taxonomyVersion: TAXONOMY_VERSION,
      patternCount: patterns.length,
      otherCount: buckets.other.count,
      otherPct: Math.round((buckets.other.count / enriched.length) * 100),
      patternCounts: [...patterns, { id: "other", count: buckets.other.count, hard: buckets.other.hard, open: buckets.other.open }]
        .map((p) => [p.id, p.count, p.hard || 0, p.open || 0])
        .sort((a, c) => c[1] - a[1]),
    },
    patterns,
    other: {
      id: "other",
      title: "Other / mixed",
      count: buckets.other.count,
      hard: buckets.other.hard,
      open: buckets.other.open,
      sampleIds: buckets.other.sampleIds,
      rowsPreview: buckets.other.rows.slice(0, 25).map((r) => ({
        id: r.id,
        lastWrongAttempt: r.lastWrongAttempt,
        process: r.process,
        stem: r.stem,
        correctLabel: r.correctLabel,
      })),
    },
    rows: enriched,
  };

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(
    JSON.stringify(
      {
        total: out.summary.total,
        patterns: out.summary.patternCount,
        other: out.summary.otherCount,
        otherPct: out.summary.otherPct,
        top: out.summary.patternCounts.slice(0, 8),
      },
      null,
      2,
    ),
  );
}

main();
