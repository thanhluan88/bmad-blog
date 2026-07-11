# Contract

## Column P

| Item | Value |
|------|--------|
| File | `all_questions_flat 1.csv` (repo root) |
| Column | **P** — `explanation_text` |
| Match | Normalized stem: CSV `question_text` ↔ `q.text` |
| Loader | `scripts/lib/pmp-csv-solutions.js` |

Format:

```
Solution: B. {correct}. {why correct}. The other answer choices are incorrect. {why A wrong}. …
```

`sourceSolution` = raw column P. Skip when CSV correct key ≠ bank `q.correct`.

---

## Store fields

| Field | Source | UI section |
|-------|--------|------------|
| `sourceSolution` | Column P raw | Source solution card (teach only) |
| `signalPhrases` + `signalAnswer` | Signal prompt | Signal card (English) |
| `whyBullets` | Column P verbatim (why part) | Why this answer |
| `excludeReasons` | Column P verbatim (exclude part) | Exclude other options |
| `guideHits[]` | RAG step 3 | Guide citation (up to 3) |
| `guideQuote` | `guideHits[0].excerpt` | Primary Guide fallback |
| `guidePages` / `guideTopic` | Hit #1 | Guide header |
| `pmbokConcept` | Grounding | Flashcard |

---

## Lesson layout (`#analysis`)

Order: Signal → **why + exclude block** → answer card → Guide → source solution

| Section | Rule |
|---------|------|
| Signal card | English only; 2–5 short stem phrases |
| Why + exclude | **Adjacent**; verbatim column P; before Guide |
| Answer card | Correct label |
| Guide citation | `PMBOK 8, p. {page}` + excerpt; target 3 distinct pages |
| Source solution | Full column P when matched |

**Omit:** `#drill`, `#traps`, standalone grounding card.

Guide priority: store `guideHits` → `lookupGuideHits()` → `guideQuote` fallback.

Cite printed `page` metadata — not `file_page`, not PDF line numbers.

---

## Sync

| Surface | File | Generator |
|---------|------|-----------|
| Teach | `pmp-teach-full-q{id}.html` `#analysis` | `generate-pmp-full-teach-lessons.js` |
| Quiz | `pmp-full-questions.html` `#result-{id}` | `generate-pmp-full-from-teach.js` |

Must match per ID: why, exclude (adjacent), Guide.

Spot-check: `pmp-full-questions.html#q-{id}` vs `pmp-teach-full-q{id}.html#analysis`.

---

## Validation

- [ ] `sourceSolution` when CSV row matched
- [ ] Hero has no full question stem
- [ ] Signal: 2–5 keywords + English `signalAnswer`
- [ ] Why: `whyBullets` verbatim from column P when CSV matched
- [ ] Exclude: every wrong key, verbatim from column P
- [ ] Why + exclude adjacent before Guide
- [ ] `validateTeachGrounding()` passes before write
- [ ] Guide: ≥1 hit, target 3 — `guideHits` with printed `page`
- [ ] Quiz solution matches teach `#analysis`
- [ ] Source solution card when `sourceSolution` present

Generator skips write on fail. Never `--allow-incomplete` for publish.

---

## Engine

`scripts/lib/`: `pmp-csv-solutions.js`, `pmp-csv-solution-grounding.js`, `bootstrap-teach-signals.js`, `pmp-teach-colocation-style.js`, `pmp-teach-signals-store.js`, `pmp-pmbok8-rag-pages.js`, `generate-pmp-full-teach-lessons.js`, `generate-pmp-full-from-teach.js`.
