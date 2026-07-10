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
| AI grounding store | `data/pmp-teach-signals.json` (optional, by `id`) |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Profiles | `scripts/lib/pmp-option-reasoning.js` |

## Workflow

### 1. Load question

`id`, `text`, `options`, `correct`.

**Completion:** Correct key + full option texts listed.

### 2. **Grounding** — ask PMBOK 8

Template: [REFERENCE.md](REFERENCE.md#grounding-prompt).

Store per question in `data/pmp-teach-signals.json`:

- `whyBullets` — **chỉ** lý do đáp án **đúng** (cho *Tại sao chọn {key}?*)
- `excludeReasons` — map **mọi** đáp án sai `{ "A": "…", "C": "…" }` (cho *Loại trừ từng đáp án*)
- `guideQuote`, `pmbokConcept` — trích dẫn Guide (câu đầy đủ)

**Completion:** `whyBullets` không chứa lý do đáp án sai; `excludeReasons` có entry cho **từng** key sai.

### 3. **Signal** — ask AI (not regex)

Prompt: [REFERENCE.md](REFERENCE.md#signal-prompt).

- `signalPhrases` — **English** substrings verbatim from stem (2–5)
- `signalAnswer` — **English** (giữ nguyên gốc trao đổi với AI): stem cues → correct action

**Rules:** No regex for signals. `signalAnswer` **English only** — không dịch sang Việt trong Signal card.

**Completion:** `signalPhrases` in stem; `signalAnswer` English.

### 4. Embed into `#analysis`

| Block | Source | Rule |
|-------|--------|------|
| **Signal trong stem** | `signalPhrases` + `signalAnswer` | **English** |
| **Tại sao chọn {key}?** | `whyBullets` | Chỉ đáp án đúng — **không** giải thích đáp án khác sai |
| **Trích dẫn Guide** | `guideQuote` / `formatGuideQuote()` | Câu đầy đủ ý |
| **Loại trừ từng đáp án** | `excludeReasons` | **Đủ** mọi đáp án sai |
| Quiz `.q-text` | `signalPhrases` highlights | English |

**Omit:** `#drill`, `#traps`, Grounding PMBOK 8 card.

**Completion:** Tại sao = đúng only; Loại trừ = all wrong keys with reasoning.

### 5. Flashcard concept

PMBOK 8 citation: process + quoted excerpt (complete sentences) + tr.

### 6. Generate

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

### 7. Validate

[REFERENCE.md](REFERENCE.md#validation)

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| Signal card in Vietnamese | Rewrite `signalAnswer` in English |
| Wrong keys in Tại sao bullets | Remove; move to `excludeReasons` |
| Loại trừ thiếu đáp án | Fill every wrong key in `excludeReasons` |
| Guide quote cuts mid-sentence | Fill `guideQuote` or fix `formatGuideQuote` |

## Resources

- Prompts + HTML contract: [REFERENCE.md](REFERENCE.md)
- Examples: [examples.md](examples.md)
