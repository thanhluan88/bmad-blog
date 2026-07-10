---
name: pmp-teach-full-lesson
description: Regenerate or polish a Full Bank PMP teach lesson (pmp-teach-full-q{N}.html) to colocation-grade quality — deduped sections, plain Vietnamese reasoning, PMBOK 8 grounded in the Guide PDF. Use when the user asks to regenerate, fix, or research a full bank teach lesson, mentions pmp-teach-full-q, colocation-style teach content, or PMBOK 8 lesson quality.
---

# PMP Teach Full Lesson

Produce a **colocation-grade** teach **lesson**: one self-contained HTML file per Full Bank question, readable in Vietnamese, grounded in PMBOK 8 (not ExamTopics copy-paste).

**Leading words:** **lesson** (output artifact), **dedup** (one meaning → one section), **signal** (stem cues → correct action), **colocation-grade** (quality bar = `public/pmp/pmp-teach-colocation.html`).

## Inputs

| Source | Path |
|--------|------|
| Question + options | `public/pmp/pmp-full-questions.json` (by `id`) |
| Quality bar | `public/pmp/pmp-teach-colocation.html` |
| Generator | `scripts/generate-pmp-full-teach-lessons.js` |
| Colocation sections | `scripts/lib/pmp-teach-colocation-style.js` |
| PMBOK reasoning | `scripts/lib/pmp-pmbok8-generator.js`, `pmp-option-reasoning.js` |
| RAG | `data/pmp-pmbok8-page-cache.json` via `pmp-pmbok8-rag-pages.js` |

Q1 is handcrafted: `public/pmp/pmp-teach-full-q1-misdirected-email.html` — do not overwrite unless explicitly asked.

## Workflow

### 1. Research the question

Load the question by id from `pmp-full-questions.json`. Read the auto **lesson** if it exists (`public/pmp/pmp-teach-full-q{id}.html`).

**Completion:** You can state stem **signal**, correct key, and why each wrong option fails in one sentence each — without opening the JSON explanation field.

### 2. Map PMBOK 8 from the stem

Map from what the question tests, not from keyword accidents.

| Stem focus | Domain / process (typical) |
|------------|----------------------------|
| Resource planning, generalists vs specialists, team composition | **Resources** — Plan Resources, Develop Team |
| Scope / requirements / WBS | **Scope** — Define Scope, Validate Scope |
| Stakeholder attitude, communication error | **Stakeholders** — Manage Stakeholder Engagement |
| Agile teamwork, SME reluctance | **Resources** — Develop Team; principle **Build an empowered culture** |

Cross-check RAG snippet: page content must support the mapping. If mapping conflicts with stem (e.g. Q1120 labeled Define Scope but stem asks **agile resource planning**), fix mapping before writing prose.

**Completion:** Domain, process, principle, and PDF page(s) are justified by stem + RAG excerpt in one line each.

### 3. **Dedup** — section contract

Each section owns one job. Never repeat the same sentence across sections.

| Section | Owns | Must not repeat |
|---------|------|-----------------|
| Hero lead | Vietnamese scenario summary + `<em>` stem **signal** | Full option text, rejection reasons |
| **Quiz stem** (`.q-text`) | `kw-signal` trên cue tình huống + `kw-cue` trên câu hỏi PMI | Phân tích bullets, loại trừ table |
| Signal card (trong Phân tích) | Stem keywords → hướng đáp án đúng | Loại trừ table, bullets |
| Analysis bullets | 3–5 distinct *why* points (no copy-paste) | Guide quote body |
| Loại trừ table | Wrong keys only; specific rejection each | Trap cards verbatim |
| Traps | PMI trap pattern name + one-line why | Table rows |
| Cheat sheet | Keywords, answer, NOT list (short) | Long prose |

**Không dùng** section `#concept` (Develop Team / concept grid / compare table) hay `#compare` (option grid) — trùng nội dung với Phân tích.

Banned patterns (see [examples.md](examples.md) Q1120):
- Generic fallback: *"Hành động này giải quyết trực tiếp vấn đề trong đề — align miền…"*
- Wrong-option template repeating full correct option text in every rejection
- Same bullet repeated in `<ul>`, tip card, and analysis card

**Completion:** No two sections share a sentence of 8+ words; each wrong option has a *different* rejection rationale.

### 3b. **Quiz stem keywords** (`#question .q-text`)

Highlight cues that *drive* the correct answer — not decoration.

| Class | Meaning | Examples |
|-------|---------|----------|
| `kw-cue` | PMI exam directive | *what should the project manager do (first/next)* |
| `kw-signal` | Scenario constraint / misconception / artifact | *SME reluctant*, *join the agile team*, *30% agile*, *highest-quality output* |

Rules:
- Target **≥3** `kw-signal` spans per stem when the scenario has enough cues (use `highlightQuizStem` in `pmp-teach-keywords.js`).
- Longest phrase first (e.g. full *reluctant because…* clause before *reluctant* alone).
- Options: `kw-signal` on correct option action words; `kw-trap` on wrong-option trap verbs — stem itself stays signal/cue only.
- Missing highlights for a **class** of stems → extend `STEM_SIGNAL_PATTERNS` in `pmp-teach-keywords.js`, not hand-edit 1,000 HTML files.

**Completion:** Reader can skim `.q-text` and name the PMI action type before reading options.

### 4. Write plain Vietnamese reasoning

- Explain **why** the correct action fits the **signal**, then name PMBOK process/principle.
- Wrong options: contrast with correct (*"chỉ thuê specialist ngắn hạn — Agile cần T-shaped generalists + specialists"*, not *"không phù hợp ngữ cảnh Agile"* alone).
- Quiz `EXPL`: correct starts with **Đúng!** + one concrete reason; wrong = one trap-focused sentence.

**Completion:** A Vietnamese reader can paraphrase the answer without reading English options.

### 5. Generate or patch

**Single lesson** (e.g. Q1120): run engine, then hand-fix prose to satisfy **dedup** and mapping.

```bash
node scripts/generate-pmp-full-pmbok8-explanations.js   # if reasoning engine changed
node scripts/build-pmp-full-questions.js
node scripts/generate-pmp-full-teach-lessons.js --force --from=1120 --to=1120
```

**Bulk:** fix `pmp-option-reasoning.js` / `pmp-teach-colocation-style.js` first when the same defect appears on many ids, then `--force` full range.

**Completion:** Target `public/pmp/pmp-teach-full-q{id}.html` exists and passes validation below.

### 6. Validate

Run the checklist in [REFERENCE.md](REFERENCE.md#validation). Spot-check in browser: hero → quiz → analysis — no déjà vu.

**Completion:** Every checklist item checked; Q1120-style duplicates absent.

## When to fix the engine vs the lesson

| Symptom | Action |
|---------|--------|
| One lesson weak | Hand-polish HTML or re-run single-id generator after editing colocation-style helpers |
| Same generic rejection on many lessons | Extend `pmp-option-reasoning.js` stem profiles / `CONTRAST_MATRIX` |
| Quiz stem chỉ highlight câu hỏi PMI, thiếu cue tình huống | Extend `STEM_SIGNAL_PATTERNS` in `pmp-teach-keywords.js`; use `highlightQuizStem` in generator |
| Wrong domain on a class of stems | Fix `pmp-pmbok8-generator.js` `scoreDomains` or add `STEM_PROFILES` |
| RAG page irrelevant | Tune `buildRagQuery` in `pmp-pmbok8-rag-pages.js` |

## Additional resources

- Section templates and validation checklist: [REFERENCE.md](REFERENCE.md)
- Good vs bad lesson excerpts: [examples.md](examples.md)
