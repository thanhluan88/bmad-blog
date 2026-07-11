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
| `whyBullets` | Column P **verbatim** (why-correct part) | Vì sao chọn đáp án này |
| `excludeReasons` | Column P **verbatim** (exclude part) | Loại trừ phương án khác |
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
      "B. Recommend a firm-fixed-price contract. A firm-fixed-price contract is appropriate when the scope is well-defined."
    ],
    "excludeReasons": {
      "A": "A time-and-materials contract is used when the scope is uncertain.",
      "C": "A cost-plus contract shifts cost risk to the buyer.",
      "D": "Issuing a letter of intent before finalizing contract terms creates legal ambiguity."
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
| **Solution reasoning block** | `whyBullets` + `excludeReasons` | **Liền kề** — Vì sao rồi Loại trừ, trước Guide |
| Vì sao chọn đáp án này | `whyBullets` | **Nguyên văn** từ cột P (why-correct) |
| Loại trừ phương án khác | `excludeReasons` | **Nguyên văn** từ cột P; row per wrong key |
| Đáp án card | — | Correct label |
| Trích dẫn Guide | `guideHits` | `PMBOK 8, tr. {page}` + excerpt; target 3 distinct pages |
| Solution gốc | `sourceSolution` | After Guide; when CSV matched |

Guide render priority: store `guideHits` → `lookupGuideHits()` → single `guideQuote` fallback.

Cite **printed `page`** metadata — not `file_page`, not PDF line numbers.

---

## Sync Kiểm tra ↔ teach

| Surface | File | Generator |
|---------|------|-----------|
| Teach `#analysis` | `pmp-teach-full-q{id}.html` | `generate-pmp-full-teach-lessons.js` |
| Kiểm tra Solution | `pmp-full-questions.html` `#result-{id}` | `generate-pmp-full-from-teach.js` |

Must match per ID: Vì sao chọn đáp án này + Loại trừ phương án khác (liền kề), Trích dẫn Guide.

Spot-check: `pmp-full-questions.html#q-{id}` vs `pmp-teach-full-q{id}.html#analysis`.

---

## Validation

- [ ] `sourceSolution` present when CSV row matched
- [ ] Hero **no** full question stem
- [ ] Signal: 2–5 short keywords + `signalAnswer` (English)
- [ ] Vì sao: `whyBullets` **verbatim** từ cột P when CSV matched
- [ ] Loại trừ: **every** wrong key, **verbatim** từ cột P
- [ ] Vì sao + Loại trừ **liền kề** trước Trích dẫn Guide
- [ ] `validateTeachGrounding()` passes before write
- [ ] Trích dẫn Guide: ≥1 hit, target 3 — `guideHits` with printed `page`
- [ ] Kiểm tra Solution matches teach `#analysis` for same ID
- [ ] Solution gốc card when `sourceSolution` present

Generator skips write on validation fail. Never `--allow-incomplete` for publish.

---

## Engine

Scripts live in `scripts/lib/`: `pmp-csv-solutions.js`, `pmp-csv-solution-grounding.js`, `bootstrap-teach-signals.js`, `pmp-teach-colocation-style.js`, `pmp-teach-signals-store.js`, `pmp-pmbok8-rag-pages.js`, `generate-pmp-full-teach-lessons.js`, `generate-pmp-full-from-teach.js`.
