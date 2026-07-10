---
name: pmp-teach-full-lesson
description: Regenerate or polish Full Bank teach lessons — PMBOK 8 grounding (structured HTML), AI-derived signal phrases in English highlighted in quiz stem. Use when user asks pmp-teach-full-q, grounding, signal highlight, colocation-style teach, or PMBOK 8 lesson quality.
---

# PMP Teach Full Lesson

**Colocation-grade** teach **lesson**: PMBOK 8 traceable, **grounding** + **signal** from AI (not engine templates).

## Inputs

| Source | Path |
|--------|------|
| Questions | `public/pmp/pmp-full-questions.json` |
| AI grounding store | `data/pmp-teach-signals.json` (required per question before generate) |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Profiles | `scripts/lib/pmp-option-reasoning.js` |

## Workflow

### 1. Load question

`id`, `text`, `options`, `correct`.

**Completion:** Correct key + full option texts listed.

### 2. **Grounding** — ask PMBOK 8 (retry until complete)

Template: [REFERENCE.md](REFERENCE.md#grounding-prompt).

Store in `data/pmp-teach-signals.json`:

- `whyBullets` — chỉ lý do đáp án **đúng**
- `excludeReasons` — **mọi** đáp án sai `{ "A": "…", "B": "…" }`

**Retry rule:** Nếu thiếu bất kỳ `excludeReasons.{key}` nào cho đáp án sai → **hỏi lại AI** cho đến khi đủ. **Không** generate lesson với placeholder.

**Completion:** `excludeReasons` có entry cho **từng** key sai; không còn key thiếu.

### 3. **Signal** — ask AI (retry until complete)

Prompt: [REFERENCE.md](REFERENCE.md#signal-prompt).

- `signalPhrases` — English verbatim from stem (2–5)
- `signalAnswer` — English (AI exchange)

**Retry rule:** Nếu `signalPhrases` hoặc `signalAnswer` trống → **hỏi lại AI** cho đến khi có đủ. **Không** render Signal card rỗng.

**Completion:** `signalPhrases` non-empty, each in stem; `signalAnswer` English.

### 4. Embed into lesson

| Block | Rule |
|-------|------|
| Hero `#intro` | **Không** lặp full stem — chỉ `buildHeroLead` + badges (stem chỉ ở `#question` quiz) |
| Signal card | Bắt buộc có AI signal — không trống |
| Tại sao chọn | `whyBullets` — chỉ đáp án đúng |
| Loại trừ | `excludeReasons` đủ mọi đáp án sai — không placeholder |
| Quiz `.q-text` | `signalPhrases` highlights |

**Omit:** `#drill`, `#traps`, Grounding card, hero stem duplicate.

### 5. Generate

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

Default: **skip write** nếu thiếu signal hoặc `excludeReasons` (`validateTeachGrounding`).  
Override (dev only): `--allow-incomplete`.

**Completion:** Generator reports `written` with 0 `incomplete` for the range.

### 6. Validate

[REFERENCE.md](REFERENCE.md#validation)

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| Empty Signal card (Q614) | Retry signal prompt; fill store; re-run generate |
| Missing excludeReasons | Retry grounding prompt until every wrong key filled |
| Lesson not updated after `--force` | Check console `incomplete` — fill store first |

## Resources

- Prompts + HTML contract: [REFERENCE.md](REFERENCE.md)
- Examples: [examples.md](examples.md)
