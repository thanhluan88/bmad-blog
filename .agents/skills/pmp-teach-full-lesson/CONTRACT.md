# Contract — PMP Teach Full Lesson

## Column P (CSV solution)

| Item | Value |
|------|--------|
| File | `all_questions_flat 1.csv` (repo root) |
| Column | **P** — header `explanation_text` |
| Match | Normalized stem: CSV `question_text` ↔ `q.text` |
| Loader | `scripts/lib/pmp-csv-solutions.js` |

Typical format:

```
Solution: B. {correct}. {why correct}. The other answer choices are incorrect. {why A wrong}. …
```

`sourceSolution` = raw column P. Skip CSV when correct key ≠ bank `q.correct`.

---

## Store fields

| Field | Source | Renders as |
|-------|--------|------------|
| `sourceSolution` | Column P raw | Solution gốc card (teach only) |
| `signalPhrases` + `signalAnswer` | Signal prompt — stem only | Signal card (English) |
| `whyBullets` | Grounding — **correct key only** | Tại sao chọn `<ul>` |
| `excludeReasons` | Grounding — **every wrong key** | Loại trừ table |
| `guideHits[]` | RAG step 3 | Trích dẫn Guide (up to 3) |
| `guideQuote` | `guideHits[0].excerpt` | Primary Guide fallback |
| `guidePages` / `guideTopic` | From hit #1 | Guide header metadata |
| `pmbokConcept` | Grounding | Flashcard |

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

## HTML sections

Order: `#intro` → `#question` → `#analysis` → `#flashcards` → `#cheatsheet`

**Omit:** `#drill`, `#traps`, Grounding PMBOK 8 card.

| Section | Store source | Rules |
|---------|-------------|-------|
| Hero `#intro` | — | Title + summary + badges; **no** full stem |
| Quiz `#question` | `signalPhrases` | `highlightQuizStem` — short English phrases only |
| Signal card | `signalPhrases`, `signalAnswer` | All content English |
| Tại sao chọn | `whyBullets` | Correct key only; `filterWhyBulletsForCorrect()` |
| Solution gốc | `sourceSolution` | After Đáp án card, before Guide; when CSV matched |
| Trích dẫn Guide | `guideHits` | `PMBOK 8, tr. {page}` + excerpt; target 3 distinct pages |
| Loại trừ | `excludeReasons` | Row per **every** wrong option |

Guide render priority: store `guideHits` → `lookupGuideHits()` → single `guideQuote` fallback.

Cite **printed `page`** metadata — not `file_page`, not PDF line numbers.

---

## Sync Kiểm tra ↔ teach

| Surface | File | Generator |
|---------|------|-----------|
| Teach `#analysis` | `pmp-teach-full-q{id}.html` | `generate-pmp-full-teach-lessons.js` |
| Kiểm tra Solution | `pmp-full-questions.html` `#result-{id}` | `generate-pmp-full-from-teach.js` |

Must match per ID: Tại sao, Loại trừ, Trích dẫn Guide.

Spot-check: `pmp-full-questions.html#q-{id}` vs `pmp-teach-full-q{id}.html#analysis`.

---

## Validation

- [ ] `sourceSolution` present when CSV row matched
- [ ] Hero **no** full question stem
- [ ] Signal: 2–5 short keywords + `signalAnswer` (English)
- [ ] Tại sao: `whyBullets` non-empty — correct only
- [ ] Loại trừ: **every** wrong key
- [ ] `validateTeachGrounding()` passes before write
- [ ] Trích dẫn Guide: ≥1 hit, target 3 — `guideHits` with printed `page`
- [ ] Kiểm tra Solution matches teach `#analysis` for same ID
- [ ] Solution gốc card when `sourceSolution` present

Generator skips write on validation fail. Never `--allow-incomplete` for publish.

---

## Engine

Scripts live in `scripts/lib/`: `pmp-csv-solutions.js`, `pmp-csv-solution-grounding.js`, `bootstrap-teach-signals.js`, `pmp-teach-colocation-style.js`, `pmp-teach-signals-store.js`, `pmp-pmbok8-rag-pages.js`, `generate-pmp-full-teach-lessons.js`, `generate-pmp-full-from-teach.js`.
