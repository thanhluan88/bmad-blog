---
name: pmp-teach-full-lesson
description: Regenerate Full Bank teach lessons from CSV reference solution (column P) plus PMBOK 8 reasoning — grounding, signal keywords, colocation HTML. Use when user asks pmp-teach-full-q, all_questions_flat CSV, solution column P, grounding, or teach lesson quality.
---

# PMP Teach Full Lesson

**Colocation-grade** teach **lesson**: anchor on CSV **solution**, reason with PMBOK 8, ship complete **grounding** + **signal**.

## Hard rules (never ship incomplete)

A lesson is **invalid** if any block below is missing — see [REFERENCE.md](REFERENCE.md#validation).

| Block | Requirement |
|-------|-------------|
| Signal card | `signalPhrases` + `signalAnswer` (English) |
| Tại sao chọn | `whyBullets` — **correct key only** |
| Loại trừ | `excludeReasons` for **every** wrong key |

**Never** use `--allow-incomplete` for publish, push, or full-bank regen.

## Inputs

| Source | Path / column |
|--------|----------------|
| Reference **solution** | `all_questions_flat 1.csv` — column **P** (`explanation_text`) |
| Questions | `public/pmp/pmp-full-questions.json` |
| Grounding store | `data/pmp-teach-signals.json` |
| CSV loader | `scripts/lib/pmp-csv-solutions.js` |
| CSV → store hints | `scripts/lib/pmp-csv-solution-grounding.js` |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Sections | `scripts/lib/pmp-teach-colocation-style.js` |

**Solution lookup:** match CSV row by **exact question stem** (`question_text` ↔ `q.text`). ~1095/1123 Full Bank rows match; missing rows → note in store, reason from PMBOK 8 only.

## Workflow (per question — retry until complete)

### 1. Load question

`id`, `text`, `options`, `correct`. List correct key + all option texts.

**Done when:** stem and all option keys listed.

### 2. Load reference solution (column P)

```javascript
const { getCsvSolutionForQuestion } = require("./scripts/lib/pmp-csv-solutions");
const row = getCsvSolutionForQuestion(q);
// row.explanationText — full column P
```

If no row: proceed with PMBOK 8 only; flag `sourceSolution: null` in store.

**Done when:** `explanation_text` loaded or explicitly missing.

### 3. Grounding — solution + PMBOK 8

Prompt: [REFERENCE.md#grounding-prompt](REFERENCE.md#grounding-prompt).

Use CSV **solution** as reference truth; **reason** into PMBOK 8 terms (process, principle, Guide quote). Do not copy CSV verbatim without PMBOK alignment.

Store in `data/pmp-teach-signals.json`:

- `sourceSolution` — raw column P (audit trail)
- `whyBullets` — correct answer only (≥1)
- `excludeReasons` — **every** wrong key
- `guideQuote` — complete Guide sentence(s)

Bootstrap seeds from CSV: `node scripts/bootstrap-pmp-teach-signals.js` (calls `mergeCsvGrounding`).

**Done when:** all wrong keys have `excludeReasons.{key}`.

### 4. Signal — ask AI (keyword phrases only)

Prompt: [REFERENCE.md#signal-prompt](REFERENCE.md#signal-prompt).

2–5 short English phrases from stem (≤80 chars); **not** full stem.

**Done when:** `validateSignalPhrases()` passes.

### 5. Validate before write

`validateTeachGrounding()` must pass. If fail → fix store, retry — **do not write**.

### 6. Generate

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Done when:** console `1 written, 0 incomplete`.

### 7. Full bank regen

1. `node scripts/bootstrap-pmp-teach-signals.js` — CSV solution + engine → store
2. Refine weak rows with AI (steps 3–4)
3. `node scripts/generate-pmp-full-teach-lessons.js --force` (no `--allow-incomplete`)
4. Commit only when `1123 written, 0 incomplete`

Exam Latest: separate store — [REFERENCE.md#exam-latest](REFERENCE.md#exam-latest).

## Embed rules

| Block | Rule |
|-------|------|
| Hero `#intro` | No full stem — summary + badges |
| Signal card | Required — keyword highlights in quiz |
| Tại sao chọn | `whyBullets` — correct only |
| Loại trừ | Every wrong key — from solution + PMBOK reasoning |
| Trích dẫn Guide | PMBOK 8 complete sentence(s) |

**Omit:** `#drill`, `#traps`, Grounding card, hero stem duplicate.

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| Empty Tại sao / Loại trừ | Load column P; run grounding prompt; save store |
| No Signal | Run signal prompt; re-generate |
| CSV mismatch (correct key ≠ bank) | Skip CSV for that ID; reason from PMBOK only |
| `--force` but unchanged | Console `incomplete` — validation blocked write |

## Resources

- Prompts, CSV contract, HTML: [REFERENCE.md](REFERENCE.md)
- Examples: [examples.md](examples.md)
