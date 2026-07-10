---
name: pmp-teach-full-lesson
description: Regenerate or polish Full Bank teach lessons — PMBOK 8 grounding (structured HTML), AI-derived signal phrases in English highlighted in quiz stem. Use when user asks pmp-teach-full-q, grounding, signal highlight, colocation-style teach, or PMBOK 8 lesson quality.
---

# PMP Teach Full Lesson

**Colocation-grade** teach **lesson**: Vietnamese reasoning, PMBOK 8 traceable, **signal** from AI grounding (not regex).

**Leading words:** **lesson**, **grounding** (structured PMBOK Q&A), **signal** (AI answer + English stem phrases), **dedup**.

## Inputs

| Source | Path |
|--------|------|
| Questions | `public/pmp/pmp-full-questions.json` |
| AI signal overrides | `data/pmp-teach-signals.json` (optional, by `id`) |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Profiles | `scripts/lib/pmp-option-reasoning.js` (`signalPhrases`, `signalAnswer`) |

## Workflow

### 1. Load question

`id`, `text`, `options`, `correct`.

**Completion:** Correct key + full option texts listed.

### 2. **Grounding** — ask PMBOK 8

Template: [REFERENCE.md](REFERENCE.md#grounding-prompt). Answer why correct key fits; why each wrong key fails.

**Completion:** Grounding covers correct + every wrong key; Guide page cited when possible.

### 3. **Signal** — ask AI (not regex)

Separate prompt: [REFERENCE.md](REFERENCE.md#signal-prompt).

AI returns:
- `signalAnswer` — Vietnamese: *tại sao* stem cues → correct action
- `signalPhrases` — **English** substrings copied verbatim from stem (2–5 phrases)

**Rules:**
- Do **not** use `STEM_SIGNAL_PATTERNS` / regex to invent signals.
- `signalPhrases` must appear exactly in the English stem.
- Quiz `.q-text` highlights only `signalPhrases` (`kw-signal`) + PMI directive (`kw-cue`).

Store output:
1. `data/pmp-teach-signals.json` → `{ "2": { "signalAnswer": "...", "signalPhrases": [...] } }`, or
2. `STEM_PROFILES` in `pmp-option-reasoning.js` for stem classes.

**Completion:** `signalPhrases` non-empty; each phrase found in stem; `signalAnswer` in Vietnamese.

### 4. Embed into `#analysis`

| Block | Content |
|-------|---------|
| **Grounding PMBOK 8** | Structured card — ref, đáp án đúng block, `Không chọn` list (not one paragraph) |
| **Signal trong stem** | English phrases (`kw-signal`) + Vietnamese `signalAnswer` + `→ {key}` |
| Why bullets | From grounding, **dedup** |
| Loại trừ table | Wrong keys only |
| Quiz `.q-text` | Highlight `signalPhrases` only |

**Omit:** `#drill` (phân loại hành động PM) — không có trong lesson output.

**Completion:** Grounding readable at a glance; signal card shows English + Vietnamese; no wall-of-text `<p>`.

### 5. Generate

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

Bulk: add `signalPhrases`/`signalAnswer` per stem class or batch-fill `pmp-teach-signals.json`, then `--force` range.

### 6. Validate

[REFERENCE.md](REFERENCE.md#validation)

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| Grounding wall of text | Engine already uses structured card — refill `whyCorrect` / rejections |
| No stem highlights | Missing `signalPhrases` — run step 3 |
| Generic signal | Replace regex; run AI **signal** prompt |
| One stem class | Extend `STEM_PROFILES` with `signalPhrases` + `signalAnswer` |

## Resources

- Prompts + HTML contract: [REFERENCE.md](REFERENCE.md)
- Examples: [examples.md](examples.md)
