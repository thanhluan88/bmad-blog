---
name: pmp-teach-full-lesson
description: Regenerate or polish Full Bank teach lessons — PMBOK 8 grounding (structured HTML), AI-derived signal phrases in English highlighted in quiz stem. Use when user asks pmp-teach-full-q, grounding, signal highlight, colocation-style teach, or PMBOK 8 lesson quality.
---

# PMP Teach Full Lesson

**Colocation-grade** teach **lesson**: PMBOK 8 traceable, **grounding** + **signal** from AI (not engine templates).

## Hard rules (never ship incomplete)

A lesson is **invalid** if any of these are missing:

| Block | Requirement |
|-------|-------------|
| Signal card | `signalPhrases` + `signalAnswer` (English) |
| Tại sao chọn | `whyBullets` non-empty — chỉ đáp án **đúng** |
| Loại trừ | `excludeReasons` for **every** wrong key (e.g. Q611 correct B → need A, C, D) |

**Anti-pattern — Q611 after `--allow-incomplete`:** no Signal card, empty Tại sao chọn, Loại trừ chỉ có D. **Do not commit** lessons like this.

**Never** use `--allow-incomplete` for publish, push, or full-bank regen. That flag is local debug only.

## Inputs

| Source | Path |
|--------|------|
| Questions | `public/pmp/pmp-full-questions.json` |
| AI grounding store | `data/pmp-teach-signals.json` (required per question before generate) |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Profiles | `scripts/lib/pmp-option-reasoning.js` |

## Workflow (per question — retry until complete)

### 1. Load question

`id`, `text`, `options`, `correct`. List correct key + all option texts.

### 2. Grounding — ask PMBOK 8

Template: [REFERENCE.md](REFERENCE.md#grounding-prompt).

Store in `data/pmp-teach-signals.json`:

- `whyBullets` — chỉ lý do đáp án **đúng** (≥1 bullet)
- `excludeReasons` — **mọi** đáp án sai `{ "A": "…", "C": "…", "D": "…" }`

**Retry:** thiếu bất kỳ `excludeReasons.{key}` → hỏi lại AI đến khi đủ **tất cả** key sai.

### 3. Signal — ask AI (keyword phrases only)

Prompt: [REFERENCE.md](REFERENCE.md#signal-prompt).

- `signalPhrases` — **2–5 short English keyword phrases** verbatim from stem (≤80 chars, ≤12 words each)
- **Not** full sentences, **not** the entire question, **not** generic `"What should the project manager do"` alone
- `signalAnswer` — English: how those keyword signals → correct key (PMBOK 8)

**Anti-pattern — Q123:** whole stem highlighted as one signal.  
**Good:** `aligns with its broader goals` · `vision and expectations throughout the project timeline`

**Retry:** phrase quá dài / generic / <2 phrases → hỏi lại AI.

### 4. Validate before write

`validateTeachGrounding()` must pass:

- signal present
- `whyBullets` non-empty
- `excludeReasons` for every wrong key

If validation fails → **do not write**; fix store/profile and retry.

### 5. Generate (single question)

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Completion:** console shows `1 written, 0 incomplete`.

### 6. Full bank regen

1. Bootstrap grounding store (if empty or incomplete):
   ```bash
   node scripts/bootstrap-pmp-teach-signals.js
   ```
   Fills `data/pmp-teach-signals.json` for all questions; refine entries with AI over time.
2. Run `--force` **without** `--allow-incomplete`.
3. Generator skips incomplete IDs — fix those in store, re-run bootstrap + generate.
4. Only commit when `1123 written, 0 incomplete`.

### 6b. Exam Latest (`pmp-exam-latest.html`)

Separate store: `data/pmp-exam-latest-teach-signals.json` (IDs ≠ Full Bank).

```bash
node scripts/generate-pmp-exam-latest-from-teach.js
```

1. Bootstrap `pmp-exam-latest-teach-signals.json` (keyword signals, why, exclude)
2. Write `data/pmp-exam-latest-pmbok8-explanations.json` (teach-style markdown)
3. Rebuild `public/pmp/pmp-exam-latest.html` via `build-pmp-exam-latest.js`

Requires `public/pmp/pmp-exam-latest-questions.json` (from prior `build-pmp-exam-latest.js`).

**Completion:** `1417 teach-style` explanations, HTML rebuilt.

### 7. Embed rules

| Block | Rule |
|-------|------|
| Hero `#intro` | Không lặp full stem — `buildHeroLead` + badges only |
| Signal card | Bắt buộc — không trống |
| Tại sao chọn | `whyBullets` — chỉ đáp án đúng |
| Loại trừ | Mọi đáp án sai — không placeholder, không thiếu row |
| Quiz `.q-text` | `signalPhrases` highlights |

**Omit:** `#drill`, `#traps`, Grounding card, hero stem duplicate.

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| No Signal (Q611) | Run signal prompt; save store; re-generate |
| Loại trừ thiếu A/C (chỉ có D) | Fill **all** wrong keys in `excludeReasons`; retry grounding |
| Empty Tại sao chọn | Add `whyBullets` in store or profile |
| `--force` but file unchanged | Console `incomplete` — validation blocked write |

## Resources

- Prompts + HTML contract: [REFERENCE.md](REFERENCE.md)
- Examples (Q611 bad/good): [examples.md](examples.md)
