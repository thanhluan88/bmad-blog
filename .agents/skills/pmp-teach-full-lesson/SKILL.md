---
name: pmp-teach-full-lesson
description: Build Full Bank teach lessons — CSV column P → RAG 3 hits → grounding → HTML → sync Kiểm tra. Use for pmp-teach-full-q*, teach lesson quality, or Kiểm tra mismatch.
---

# PMP Teach Full Lesson

Pipeline: **solution** (CSV P) → **RAG** (3 hits) → **grounding** → **lesson** → **sync**

## Branches

| Branch | When | Path |
|--------|------|------|
| **One question** | Fix or author a single ID | Steps 1–7 with `--from={id} --to={id}`; hand-RAG via MCP |
| **Full bank** | Regen all 1123 | Bootstrap batch → `--force` → sync; skip hand-RAG |

Exam Latest is out of scope — separate store `data/pmp-exam-latest-teach-signals.json`.

## Invalid lesson

Any [CONTRACT.md#validation](CONTRACT.md#validation) item fails → do not write HTML. Never `--allow-incomplete` for publish.

## Inputs

| Source | Path |
|--------|------|
| Question bank | `public/pmp/pmp-full-questions.json` |
| Solution | `all_questions_flat 1.csv` column **P** (`explanation_text`) |
| Grounding store | `data/pmp-teach-signals.json` |
| RAG | Skill `rag-local-pmp` — MCP `search_docs` only |

Stem match: CSV `question_text` ↔ `q.text` (~1095/1123). CSV correct key ≠ bank → skip CSV for that ID.

## Steps

### 1. Load question

From bank: `id`, `text`, `options[]`, `correct`, `correctLabel`.

**Done when:** correct key + every wrong option key listed.

### 2. Load solution (column P)

```javascript
const { getCsvSolutionForQuestion } = require("./scripts/lib/pmp-csv-solutions");
const row = getCsvSolutionForQuestion(q);
// row.explanationText — column P verbatim → sourceSolution
```

**Done when:** `sourceSolution` loaded or flagged missing.

### 3. RAG — 3 Guide hits

Follow [RAG.md](RAG.md). Query from solution **why-correct** terms — not stem-only domain labels.

**Done when:** 3 hits with printed `page` + excerpt; or ≥1 with documented fallback.

### 4. Grounding

Run [PROMPTS.md#grounding](PROMPTS.md#grounding) + [PROMPTS.md#signal](PROMPTS.md#signal) → write store entry per [CONTRACT.md#store-fields](CONTRACT.md#store-fields).

**Done when:** `whyBullets` non-empty; every wrong key in `excludeReasons`; `guideHits.length` ≥ 1.

### 5. Validate

`validateTeachGrounding(q, analysis)` — retry grounding prompt if fail.

**Done when:** passes.

### 6. Generate lesson

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Done when:** `1 written, 0 incomplete`.

### 7. Sync Kiểm tra

```bash
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

Both surfaces read `data/pmp-teach-signals.json` + `buildTeachExplanationMarkdown()`.

**Done when:** teach `#analysis` = Kiểm tra `#result-{id}` (why, exclude, Guide).

## Full bank

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

Commit when `1123 written, 0 incomplete` and spot-check Kiểm tra = teach.

## Symptom → fix

| Symptom | Fix |
|---------|-----|
| Empty Tại sao / Loại trừ | Column P → grounding prompt → store |
| Tại sao ≠ Guide | Re-bootstrap; query RAG from `whyBullets` terms |
| Kiểm tra ≠ teach | Run `generate-pmp-full-from-teach.js` after teach regen |
| No Signal | Signal prompt; `validateSignalPhrases` |
| Guide fragment / Licensed To | Reject via `isMidSentenceFragment`; re-RAG |

## Resources

- [PROMPTS.md](PROMPTS.md) — grounding + signal prompts
- [CONTRACT.md](CONTRACT.md) — store fields, HTML rules, validation
- [RAG.md](RAG.md) — 3-hit lookup, citation
- [examples.md](examples.md) — Q982 end-to-end + anti-patterns
