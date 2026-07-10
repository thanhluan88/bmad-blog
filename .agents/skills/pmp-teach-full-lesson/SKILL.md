---
name: pmp-teach-full-lesson
description: Regenerate or polish Full Bank teach lessons — PMBOK 8 grounding (structured HTML), AI-derived signal phrases in English highlighted in quiz stem. Use when user asks pmp-teach-full-q, grounding, signal highlight, colocation-style teach, or PMBOK 8 lesson quality.
---

# PMP Teach Full Lesson

**Colocation-grade** teach **lesson**: Vietnamese reasoning, PMBOK 8 traceable, **grounding** + **signal** from AI (not engine templates).

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

Template: [REFERENCE.md](REFERENCE.md#grounding-prompt). AI explains why correct key fits and why each wrong key fails.

Store full JSON per question in `data/pmp-teach-signals.json`:

- `whyBullets` — bullets for **Tại sao chọn {key}?**
- `excludeReasons` — map `{ "A": "…", "C": "…" }` for **Loại trừ từng đáp án**
- `guideQuote` — **Trích dẫn Guide**: 1–3 câu PMBOK 8 **đầy đủ ý**, kết thúc bằng `.` / `!` / `?` (không cắt giữa câu)
- `pmbokConcept` — excerpt for flashcard concept (same complete-sentence rule)

**Completion:** Every wrong key has a non-generic `excludeReasons` entry; `whyBullets` has ≥2 items; `guideQuote` ends on complete sentence(s).

### 3. **Signal** — ask AI (not regex)

Prompt: [REFERENCE.md](REFERENCE.md#signal-prompt).

- `signalAnswer` — Vietnamese: stem cues → correct action
- `signalPhrases` — **English** substrings copied verbatim from stem (2–5)

**Rules:** No `STEM_SIGNAL_PATTERNS` / regex for signals. Phrases must appear exactly in the English stem.

**Completion:** `signalPhrases` non-empty; each phrase in stem; `signalAnswer` in Vietnamese.

### 4. Embed into `#analysis`

| Block | Source |
|-------|--------|
| Signal card | `signalPhrases` + `signalAnswer` |
| **Tại sao chọn {key}?** | `whyBullets` from grounding AI |
| **Trích dẫn Guide** | `guideQuote` or RAG snippet via `formatGuideQuote()` |
| Loại trừ table | `excludeReasons` from grounding AI only |
| Quiz `.q-text` | `signalPhrases` highlights |

**Omit:** `#drill`, `#traps`, **Grounding PMBOK 8 card** — lý do đã nằm trong Tại sao chọn + Loại trừ.

**Trích dẫn Guide rule:** Quote must be **complete sentence(s)** with full meaning — never truncate mid-sentence (e.g. bad: *"…can vary from"*). Engine: `formatGuideQuote()` in `pmp-pmbok8-rag-pages.js`.

**Completion:** No generic engine text; Guide quote ends on sentence boundary; Tại sao + Loại trừ trace to stored grounding.

### 5. Flashcard concept

Card 1 back = **PMBOK 8 citation**: process/principle + quoted Guide excerpt (complete sentences) + page ref.

**Completion:** Back shows complete PMBOK 8 sentence(s) with tr. number.

### 6. Generate

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

### 7. Validate

[REFERENCE.md](REFERENCE.md#validation)

## Engine vs hand work

| Symptom | Action |
|---------|--------|
| Guide quote cuts mid-sentence | Fill `guideQuote` with full sentence(s); or fix RAG + `formatGuideQuote` |
| Empty Tại sao / Loại trừ | Run grounding prompt; fill `whyBullets` + `excludeReasons` |
| Generic rejection text | Replace with AI reasoning in store |
| No stem highlights | Run signal prompt; fill `signalPhrases` |

## Resources

- Prompts + HTML contract: [REFERENCE.md](REFERENCE.md)
- Examples: [examples.md](examples.md)
