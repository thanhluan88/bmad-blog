---
name: pmp-teach-full-lesson
description: Build Full Bank PMP teach lessons from CSV solution (column P) plus local RAG — grounding, signal, Guide quotes, sync with Kiểm tra. Use when pmp-teach-full-q, all_questions_flat, column P, pmp-full-questions Kiểm tra, or teach lesson quality.
---

# PMP Teach Full Lesson

One **lesson** per question: **solution** (CSV cột P) → **RAG** (3 hits) → **grounding** → HTML teach page → **sync** `Kiểm tra`.

## Invalid lesson

Missing any block in [REFERENCE.md#validation](REFERENCE.md#validation) → do not write HTML. Never `--allow-incomplete` for publish.

## Inputs

| Source | Path |
|--------|------|
| Question bank | `public/pmp/pmp-full-questions.json` (mirror of `pmp-full-questions.html`) |
| **Solution** | `all_questions_flat 1.csv` column **P** (`explanation_text`) |
| Grounding store | `data/pmp-teach-signals.json` |
| RAG | Skill `rag-local-pmp` — MCP `search_docs` only |

Stem match: CSV `question_text` ↔ `q.text` (~1095/1123). CSV correct key ≠ bank → skip CSV for that ID.

## Workflow (per question)

### 1. Load question

From bank: `id`, `text`, `options[]`, `correct`, `correctLabel`.

**Done when:** correct key + every wrong option key listed.

### 2. Load solution (column P)

```javascript
const { getCsvSolutionForQuestion } = require("./scripts/lib/pmp-csv-solutions");
const row = getCsvSolutionForQuestion(q);
// row.explanationText — column P verbatim
```

**Done when:** `sourceSolution` loaded or flagged missing.

### 3. RAG — 3 related Guide hits

Follow [RAG.md](RAG.md). Skill `rag-local-pmp`: `search_docs`, `top_k` 8–12, pick **3** best chunks (distinct printed `page`).

Query from **why terms** in solution (process, artifact, principle) — not generic domain overview.

**Done when:** 3 hits with `page` (số trang in PMBOK8) + excerpt; or documented fallback &lt;3.

### 4. Grounding — reason from solution + RAG

Prompt: [REFERENCE.md#grounding-prompt](REFERENCE.md#grounding-prompt).

| Store field | Source |
|-------------|--------|
| `sourceSolution` | Column P raw |
| `whyBullets` | **Tại sao chọn** — correct key only; distill from solution “why correct” |
| `excludeReasons` | Every **wrong** key — from solution “other incorrect” + PMBOK |
| `signalPhrases` + `signalAnswer` | Stem keywords → correct action (English) |
| `guideHits` | 3 RAG hits `{page, topic, excerpt, query}` |
| `guideQuote` | Primary hit excerpt (hit #1) |
| `guidePages` / `guideTopic` | From hit #1 |

**Done when:** every wrong key has `excludeReasons`; `whyBullets` non-empty; `guideHits.length` ≥ 1.

### 5. Pattern lesson (teach reasoning)

Apply exam **pattern** from grounding — same logic as colocation teach pages:

- Signal = stem keywords that point to correct action
- Tại sao = why correct (not wrong-option prose)
- Loại trừ = wrong keys only
- Guide = 3 aligned RAG excerpts with `PMBOK 8, tr. {page}`

Do not paste solution verbatim without PMBOK alignment.

**Done when:** `validateTeachGrounding(q, analysis)` passes.

### 6. Generate lesson HTML

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Done when:** `1 written, 0 incomplete`.

### 7. Sync Kiểm tra

Teach page and **Kiểm tra** must share one store + one generator pipeline:

```bash
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

Rebuilds `pmp-full-questions.html` explanations from same `data/pmp-teach-signals.json` + `buildTeachExplanationMarkdown`.

**Done when:** `#analysis` blocks match `result-*` Solution on same question ID (why, exclude, Guide).

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

- [REFERENCE.md](REFERENCE.md) — prompts, HTML, store schema, sync
- [RAG.md](RAG.md) — `rag-local-pmp`, 3 hits, page citation
- [examples.md](examples.md) — Q982, Q611 patterns
