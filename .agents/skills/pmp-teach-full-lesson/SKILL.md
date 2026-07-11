---
name: pmp-teach-full-lesson
description: Lesson pipeline for Full Bank PMP questions — CSV solution → RAG → grounding → HTML → quiz sync. Use for pmp-teach-full-q*, lesson quality, or quiz/teach mismatch.
---

# PMP Teach Full Lesson

**Role:** Project Manager owning one **lesson** deliverable per question.

**Pipeline:** solution → RAG → grounding → lesson → **sync**

## Branches

| Branch | Trigger | Path |
|--------|---------|------|
| **Single ID** | Fix one question | Steps 1–7, `--from={id} --to={id}`, hand-RAG |
| **Full bank** | Regen 1123 | Bootstrap → `--force` → sync (no hand-RAG) |

Exam Latest is **out of scope** (`data/pmp-exam-latest-teach-signals.json`).

## Quality gate

Any [CONTRACT.md#validation](CONTRACT.md#validation) item fails → **no HTML write**. Never `--allow-incomplete` for publish.

## Inputs

| Asset | Path |
|-------|------|
| Question bank | `public/pmp/pmp-full-questions.json` |
| Reference solution | `all_questions_flat 1.csv` column **P** (`explanation_text`) |
| Grounding store | `data/pmp-teach-signals.json` |
| RAG | Skill `rag-local-pmp` — `search_docs` only |

CSV stem match ~1095/1123. Skip CSV when CSV correct key ≠ bank `q.correct`.

## Steps

### 1. Load question

Pull `id`, `text`, `options[]`, `correct`, `correctLabel` from bank.

**Done when:** correct key listed; every wrong option key listed.

### 2. Load solution

```javascript
const { getCsvSolutionForQuestion } = require("./scripts/lib/pmp-csv-solutions");
const row = getCsvSolutionForQuestion(q);
// row.explanationText → sourceSolution (verbatim)
```

**Done when:** `sourceSolution` loaded or absence documented.

### 3. RAG — 3 Guide hits

Follow [RAG.md](RAG.md). Query from solution **why-correct** terms — not stem-only labels.

**Done when:** 3 hits with printed `page` + excerpt, or ≥1 with documented fallback.

### 4. Grounding

Run [PROMPTS.md](PROMPTS.md) → write store per [CONTRACT.md#store-fields](CONTRACT.md#store-fields).

- `whyBullets` + `excludeReasons` = **verbatim** column P
- Both sections **adjacent** in output, before Guide citations

**Done when:** verbatim why; verbatim exclude for every wrong key; `guideHits.length` ≥ 1.

### 5. Validate

`validateTeachGrounding(q, analysis)` — retry step 4 on fail.

**Done when:** passes.

### 6. Generate lesson

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Done when:** `1 written, 0 incomplete`.

### 7. Sync quiz

```bash
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

Shared store + `buildTeachExplanationMarkdown()`.

**Done when:** teach `#analysis` matches quiz `#result-{id}` (why, exclude, Guide).

## Full bank release

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

**Release criteria:** `1123 written, 0 incomplete`; spot-check quiz = teach on sample IDs.

## Defect log

| Symptom | Fix |
|---------|-----|
| Empty why / exclude | `mergeCsvGrounding()` from column P → store |
| Paraphrase vs CSV | `whyBullets` / `excludeReasons` must match column P word-for-word |
| Why ≠ Guide | Re-bootstrap; RAG query from `whyBullets` terms |
| Quiz ≠ teach | Run sync after lesson regen |
| No signal | Signal prompt; `validateSignalPhrases` |
| Guide fragment | Reject via `isMidSentenceFragment`; re-RAG |

## Reference

- [PROMPTS.md](PROMPTS.md) — grounding + signal
- [CONTRACT.md](CONTRACT.md) — store, layout, validation
- [RAG.md](RAG.md) — 3-hit lookup
- [examples.md](examples.md) — Q982
