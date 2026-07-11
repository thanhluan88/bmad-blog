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
  "guideHits": [
    {
      "page": 137,
      "topic": "Monitor Risks",
      "excerpt": "complete sentence(s) from RAG chunk",
      "query": "why-aligned search query"
    }
  ],
  "guideQuote": "primary excerpt — same as guideHits[0].excerpt",
  "guidePages": [137],
  "guideTopic": "Monitor Risks"
}
```

**Guide hits (required ≥1, target 3):** from skill `rag-local-pmp` — see [RAG.md](RAG.md). Align query with `whyBullets` terms.

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

Up to **3** RAG excerpts — `resolveGuideHits()` / `guideHits[]`.

```html
<div class="card info">
  <h4>Trích dẫn Guide</h4>
  <div>
    <p><strong>1.</strong> PMBOK 8, tr. 137 — Monitor Risks</p>
    <p>"A risk register is a repository…"</p>
  </div>
  <!-- 2., 3. -->
</div>
```

**Source priority:**
1. Store `guideHits` (bootstrap / agent RAG)
2. `lookupGuideHits()` at render
3. Fallback `guideQuote` single hit

Cite **printed page** (`page` metadata) + excerpt — not `file_page`, not PDF line numbers.

**Validate:** topics match `whyBullets` process/artifact.

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
    "guideHits": [
      { "page": 81, "topic": "Conduct Procurements", "excerpt": "…", "query": "firm-fixed-price well-defined scope" }
    ],
    "guideQuote": "…",
    "guidePages": [81],
    "guideTopic": "Conduct Procurements"
  }
}
```

---

## Sync Kiểm tra ↔ teach lesson

Both read **`data/pmp-teach-signals.json`** and **`buildTeachExplanationMarkdown()`** / `composeGrounding()`.

| Surface | File | Trigger |
|---------|------|---------|
| Teach `#analysis` | `pmp-teach-full-q{id}.html` | `generate-pmp-full-teach-lessons.js` |
| Kiểm tra Solution | `pmp-full-questions.html` `#result-{id}` | `generate-pmp-full-from-teach.js` |

**Must match per question ID:**
- Tại sao / **Vì sao chọn đáp án này**
- Loại trừ / **Loại trừ phương án khác**
- Trích dẫn Guide / **Trích dẫn Guide**
- Solution gốc (teach only; Kiểm tra uses same exclude/why in markdown)

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

Spot-check: open `pmp-full-questions.html#q-{id}` → Kiểm tra vs `pmp-teach-full-q{id}.html#analysis`.

---

## Guide quote pipeline

| Step | Command / function |
|------|-------------------|
| Why-aligned query | `buildGuideRagQuery()` |
| 3 hits lookup | `lookupGuideHits()` · [RAG.md](RAG.md) |
| Single primary | `lookupGuideQuote()` |
| Bootstrap fill | `node scripts/bootstrap-pmp-teach-signals.js` |
| Teach render | `resolveGuideHits()` → `#analysis` |
| Kiểm tra sync | `node scripts/generate-pmp-full-from-teach.js --skip-bootstrap` |

## Validation

- [ ] `sourceSolution` present when CSV row matched
- [ ] Hero **no** full question stem
- [ ] Signal: 2–5 short keywords + `signalAnswer`
- [ ] Tại sao: `whyBullets` non-empty — correct only
- [ ] Loại trừ: **every** wrong key
- [ ] `validateTeachGrounding()` passes before write
- [ ] Trích dẫn Guide: ≥1 hit, target 3 — `guideHits` with printed `page`
- [ ] Kiểm tra Solution matches teach `#analysis` for same ID
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
| Why-aligned guide lookup | `buildGuideRagQuery()` · `lookupGuideHits()` |
| Kiểm tra rebuild | `generate-pmp-full-from-teach.js` |
