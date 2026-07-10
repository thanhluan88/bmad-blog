---
name: pmp-teach-full-lesson
description: Regenerate or polish a Full Bank PMP teach lesson (pmp-teach-full-q{N}.html) — PMBOK 8 grounding explains why the correct key fits the stem and why each wrong key fails; embed that into #analysis. Use when the user asks to regenerate, fix, or research a full bank teach lesson, mentions pmp-teach-full-q, colocation-style teach content, PMBOK 8 lesson quality, or grounding answer explanations.
---

# PMP Teach Full Lesson

Produce a **colocation-grade** teach **lesson**: one HTML file per Full Bank question, Vietnamese prose, every explanation traceable to PMBOK 8 — not ExamTopics copy-paste.

**Leading words:** **lesson** (output), **grounding** (PMBOK 8 Q&A before writing), **dedup** (one meaning → one section), **signal** (stem cues → correct action).

## Inputs

| Source | Path |
|--------|------|
| Question + options | `public/pmp/pmp-full-questions.json` (by `id`) |
| Quality bar | `public/pmp/pmp-teach-colocation.html` |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Colocation sections | `scripts/lib/pmp-teach-colocation-style.js` |
| PMBOK reasoning | `scripts/lib/pmp-pmbok8-generator.js`, `pmp-option-reasoning.js` |
| RAG | `data/pmp-pmbok8-page-cache.json` via `pmp-pmbok8-rag-pages.js` |

## Workflow

### 1. Load the question

Read `id`, `text`, `options`, `correct` from `pmp-full-questions.json`. Note the correct key and its full option text.

**Completion:** Correct key and all wrong keys listed with option text — no need to open the legacy `explanation` field yet.

### 2. Map PMBOK 8 from the stem

Infer domain, process, principle from stem **signal** (not keyword accidents). Cross-check RAG snippet supports the mapping.

**Completion:** Domain, process, principle, and PDF page(s) stated in one line each, justified by stem + RAG.

### 3. **Grounding** — ask PMBOK 8 before writing

Before any lesson prose, answer this **grounding** question using PMBOK 8 Guide (+ RAG snippet for the question). Template in [REFERENCE.md](REFERENCE.md#grounding-prompt).

For each question:
- State why the **correct** option fits the stem.
- State why **each wrong** option does not — one distinct PMI reason per key.

Do not answer from exam tricks alone; cite process/principle and Guide page when available.

**Completion:** Grounding covers correct key + every wrong key; each wrong key has a different rejection; at least one Guide page or process name cited.

### 4. Embed **grounding** into `#analysis`

Map the grounding answer into the lesson — **dedup** across subsections:

| `#analysis` block | From grounding |
|-------------------|----------------|
| Signal card | Stem **signal** → hướng đáp án đúng |
| `Tại sao chọn {key}?` bullets | Why correct (3–5 distinct points) |
| Trích dẫn Guide | RAG snippet + `PMBOK 8, tr. N` |
| Loại trừ table | Wrong keys only — one rejection each |
| Quiz `EXPL` | Correct: **Đúng!** + one concrete reason; wrong: one trap sentence |

Hero, quiz stem highlights, traps, flashcards, cheat sheet derive from the same grounding — do not contradict it.

**Completion:** `#analysis` reads as the grounding answer in Vietnamese; no sentence of 8+ words repeated across analysis subsections.

### 5. Section contract (**dedup**)

| Section | Owns | Must not repeat |
|---------|------|-----------------|
| Hero lead | Vietnamese scenario + `<em>` **signal** | Full rejections |
| Quiz `.q-text` | `kw-signal` cues + `kw-cue` PMI directive | Analysis bullets |
| `#analysis` | Full **grounding** prose | — |
| Traps / cheat sheet | Short pattern names | Loại trừ table rows |

**Omit** `#concept` and `#compare` — trùng `#analysis`.

Banned patterns: [examples.md](examples.md) Q1120 anti-patterns.

### 6. Generate or patch

```bash
node scripts/generate-pmp-full-pmbok8-explanations.js   # if reasoning engine changed
node scripts/build-pmp-full-questions.js
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

Bulk: fix engine (`pmp-option-reasoning.js`, `pmp-teach-colocation-style.js`) when the same grounding defect hits many ids, then `--force` range.

**Completion:** `public/pmp/pmp-teach-full-q{id}.html` exists; grounding visible in `#analysis`.

### 7. Validate

Checklist: [REFERENCE.md](REFERENCE.md#validation). Spot-check: hero → quiz → analysis tells one coherent **grounding** story.

## When to fix engine vs lesson

| Symptom | Action |
|---------|--------|
| One lesson weak grounding | Hand-polish `#analysis` or extend `STEM_PROFILES` / `lessonBullets` for that stem |
| Same generic rejection on many lessons | `pmp-option-reasoning.js` — `CONTRAST_MATRIX`, `rejectByAction` |
| Quiz stem thiếu cue highlight | `STEM_SIGNAL_PATTERNS` in `pmp-teach-keywords.js` |
| RAG page irrelevant | `buildRagQuery` in `pmp-pmbok8-rag-pages.js` |

## Additional resources

- Grounding prompt template + Q2 model: [REFERENCE.md](REFERENCE.md)
- Good vs bad excerpts: [examples.md](examples.md)
