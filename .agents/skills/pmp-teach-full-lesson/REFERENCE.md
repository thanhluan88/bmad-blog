# Reference — PMP Teach Full Lesson

## CSV reference solution (column P)

| Item | Value |
|------|--------|
| File | `all_questions_flat 1.csv` (repo root) |
| Column | **P** — header `explanation_text` |
| Match key | Normalized exact stem: CSV `question_text` ↔ `q.text` |
| Loader | `scripts/lib/pmp-csv-solutions.js` |
| Bootstrap merge | `scripts/lib/pmp-csv-solution-grounding.js` → `mergeCsvGrounding()` |

Typical column P format:

```
Solution: B. {correct option text}. {why correct}. The other answer choices are incorrect. {why A wrong}. {why C wrong}. …
```

If CSV correct key ≠ bank `q.correct`, skip CSV for that question (stem collision or stale row).

Store field `sourceSolution` = raw column P for audit.

---

## Grounding prompt

**Inputs:** question stem, options, correct key, **reference solution (column P)**, PMBOK 8 RAG snippet (process, principle, page).

```
Bạn có reference solution từ ngân hàng câu (cột P CSV):

"{sourceSolution}"

Câu hỏi:
"{stem}"

Đáp án đúng: {correctKey}. {correctOptionText}

Các đáp án sai:
{for each wrong key}
{key}. {optionText}

Dựa trên reference solution TRÊN và PMBOK 8 (process, principle, Guide excerpt nếu có),
reasoning ra bài giảng — không copy nguyên văn solution nếu lệch PMBOK 8.

Trả về JSON:
{
  "whyCorrect": "why {correctKey} — PMBOK 8 aligned (EN or VI)",
  "excludeReasons": {
    "A": "one entry per WRONG key only",
    "C": "…",
    "D": "…"
  },
  "whyBullets": [
    "Why {correctKey} is correct: …",
    "PMBOK 8 process / principle …"
  ],
  "pmbokConcept": "short excerpt for flashcard",
  "guideQuote": "complete sentence(s) from Guide for Trích dẫn block"
}
```

**Separation rule:**
- `whyBullets` → **correct answer only**
- `excludeReasons` → **every wrong key** — use CSV “other answer choices are incorrect” as seed, refine with PMBOK 8

If `sourceSolution` missing: omit first block; reason from PMBOK 8 + stem only.

---

## Signal prompt

Unchanged — signal comes from **stem keywords**, not from CSV solution text.

```
From this English stem, list 2–5 SHORT verbatim English keyword phrases (signalPhrases)
that point to answer {correctKey} — NOT the full question, NOT full sentences.

Rules:
- Each phrase: 8–80 characters, max 12 words, must appear verbatim in stem
- Do NOT use only generic exam wording like "What should the project manager do"
- Do NOT return the entire stem as one phrase

Write signalAnswer in English: how those keyword signals → {correctKey} (PMBOK 8).

Stem:
"{stem}"

Return JSON:
{
  "signalPhrases": ["short phrase 1", "short phrase 2"],
  "signalAnswer": "English only — how keywords → correct action"
}
```

---

## HTML section order

1. `#intro` — hero + badges
2. `#question` — quiz (`highlightQuizStem` with `signalPhrases`)
3. `#analysis` — signal card, Tại sao chọn, Guide quote, loại trừ table
4. `#flashcards` — 3 cards
5. `#cheatsheet`

**Omit:** `#drill`, `#traps`, Grounding PMBOK 8 card.

---

## HTML contract — Signal card

```html
<div class="card tip signal-card">
  <h4>Signal trong stem Q2</h4>
  <p class="signal-phrases-en">
    <span class="kw-signal">reluctant because they think that working on a team is demotivating</span> · …
  </p>
  <p class="signal-answer-en">SME believes teamwork slows them down — PM explains CI + early feedback.</p>
  <p class="signal-conclusion">→ <strong>B</strong>: …</p>
</div>
```

All signal content **English**.

---

## HTML contract — Tại sao chọn

- `<ul>` from `whyBullets` — **correct key only**
- Engine: `filterWhyBulletsForCorrect()`

---

## HTML contract — Loại trừ

- Table: **every wrong option**
- Column from `excludeReasons` (CSV seed + PMBOK refinement)
- `validateTeachGrounding()` — skip write if any wrong key lacks reason

---

## HTML contract — Trích dẫn Guide

Complete PMBOK 8 sentence(s) — `formatGuideQuote()`.

## HTML contract — Solution gốc (sourceSolution)

When `sourceSolution` exists in store (CSV column P):

```html
<div class="card source">
  <h4>Solution gốc (CSV — cột P)</h4>
  <p class="source-solution">…full explanation_text…</p>
</div>
```

Placed in `#analysis` after card Đáp án, before Trích dẫn Guide.

---

## Data store example

```json
{
  "611": {
    "sourceSolution": "Solution: B. Recommend a firm-fixed-price contract…",
    "signalPhrases": ["well-defined remaining scope", "hold contractors accountable"],
    "signalAnswer": "Well-defined scope → FFP minimizes buyer cost risk (Procurement).",
    "whyBullets": [
      "B is correct: FFP when scope is well-defined — accountability at agreed price.",
      "PMBOK 8: Conduct Procurements — fixed price when requirements are clear."
    ],
    "excludeReasons": {
      "A": "T&M when scope uncertain — here scope is well-defined.",
      "C": "Cost-plus shifts risk to buyer — scope already clear.",
      "D": "Letter of intent before formal contract — poor governance."
    },
    "guideQuote": "…"
  }
}
```

---

## Validation

- [ ] `sourceSolution` present when CSV row matched
- [ ] Hero **no** full question stem
- [ ] Signal: 2–5 short keywords + `signalAnswer`
- [ ] Tại sao: `whyBullets` non-empty — correct only
- [ ] Loại trừ: **every** wrong key
- [ ] `validateTeachGrounding()` passes before write
- [ ] Trích dẫn Guide: complete sentence(s)
- [ ] Solution gốc card when CSV `sourceSolution` present

---

## Generator

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
```

Bootstrap: CSV column P → `mergeCsvGrounding()` → `data/pmp-teach-signals.json` (**Full Bank only**).

Default **skips write** when validation fails. **Do not** use `--allow-incomplete` for publish.

---

## Exam Latest

**Out of scope for CSV:** `all_questions_flat 1.csv` maps only Full Bank (`pmp-full-questions`). Exam Latest uses a separate question set — bootstrap with `useCsvSolutions: false`.

Separate store: `data/pmp-exam-latest-teach-signals.json`.

```bash
node scripts/generate-pmp-exam-latest-from-teach.js
```

---

## Engine

| Piece | File |
|-------|------|
| CSV load | `pmp-csv-solutions.js` |
| CSV → grounding hints | `pmp-csv-solution-grounding.js` |
| Bootstrap | `bootstrap-teach-signals.js` |
| `validateTeachGrounding` | `pmp-teach-colocation-style.js` |
| Skip incomplete writes | `generate-pmp-full-teach-lessons.js` |
| Grounding store | `pmp-teach-signals-store.js` |
| Guide quote | `formatGuideQuote()` in `pmp-pmbok8-rag-pages.js` |
