# Reference — PMP Teach Full Lesson

## Grounding prompt

```
Dựa trên PMBOK 8, với nội dung câu hỏi sau:

"{stem}"

tại sao đáp án đúng là

{correctKey}. {correctOptionText}

mà không phải

{for each wrong key}
{key}. {optionText}

Trả về JSON:
{
  "whyCorrect": "why {correctKey} is correct per PMBOK 8 (Vietnamese or English)",
  "excludeReasons": {
    "A": "why A is wrong — one entry per WRONG key only",
    "B": "…",
    "C": "…"
  },
  "whyBullets": [
    "Why {correctKey} is correct: …",
    "PMBOK 8 reference / process alignment …"
  ],
  "pmbokConcept": "short PMBOK 8 excerpt for flashcard",
  "guideQuote": "complete sentence(s) from Guide for Trích dẫn block"
}
```

**Separation rule:**
- `whyBullets` → **correct answer only** — never `"A sai: …"` or wrong-key reasoning
- `excludeReasons` → **every wrong key** — full reasoning per wrong option

## Signal prompt

```
From this English stem, list 2–5 SHORT verbatim English keyword phrases (signalPhrases)
that point to answer {correctKey} — NOT the full question, NOT full sentences.

Rules:
- Each phrase: 8–80 characters, max 12 words, must appear verbatim in stem
- Pick scenario cues that discriminate the correct action (sponsor, vision, risk, retrospective, etc.)
- Do NOT use only generic exam wording like "What should the project manager do"
- Do NOT return the entire stem as one phrase

Write signalAnswer in English: how those keyword signals → {correctKey} (PMBOK 8).

Stem:
"{stem}"

Return JSON:
{
  "signalPhrases": ["short phrase 1", "short phrase 2"],
  "signalAnswer": "English only — how keywords → correct action"
}
```

**signalPhrases** = short **keywords/clauses** from stem (2–5), not whole question.  
Max **80 chars** and **12 words** per phrase; reject if >45% of stem length.

**signal-conclusion** must stay **English** — never Vietnamese generic rationale (e.g. MVP/business value fallback).

## HTML section order

1. `#intro` — hero + badges
2. `#question` — quiz (`highlightQuizStem` with `signalPhrases`)
3. `#analysis` — signal card, Tại sao chọn, Guide quote, loại trừ table
4. `#flashcards` — 3 cards
5. `#cheatsheet`

**Omit:** `#drill`, `#traps`, Grounding PMBOK 8 card.

## HTML contract — Signal card

```html
<div class="card tip signal-card">
  <h4>Signal trong stem Q2</h4>
  <p class="signal-phrases-en">
    <span class="kw-signal">reluctant because they think that working on a team is demotivating</span> · …
  </p>
  <p class="signal-answer-en">SME believes teamwork slows them down — PM explains CI + early feedback before ceremonies or escalation.</p>
  <p class="signal-conclusion">→ <strong>B</strong>: …</p>
</div>
```

All signal content **English**. Quiz highlights `signalPhrases` only.

## HTML contract — Tại sao chọn

- `<ul>` from `whyBullets` — **correct key reasoning only**
- **Bad:** bullets like `A sai: …`, `C/D sai thứ tự: …`
- Engine: `filterWhyBulletsForCorrect()` strips wrong-key bullets

## HTML contract — Loại trừ từng đáp án

- Table lists **every wrong option** (one row per wrong key)
- Column *Tại sao không chọn* from `excludeReasons` (AI grounding)
- **Bad:** only one wrong key shown (e.g. Q611 with only D when correct is B — need A, C, D)
- **Bad:** missing rows for any wrong key
- Engine: `buildExcludeRows()` + `validateTeachGrounding()` — skip write if any wrong key lacks reason

## HTML contract — Trích dẫn Guide

Complete PMBOK 8 sentence(s) — see `formatGuideQuote()`.

## Data store example

```json
{
  "2": {
    "signalPhrases": ["reluctant because they think that working on a team is demotivating and slows them down"],
    "signalAnswer": "SME believes teamwork is demotivating — PM explains continuous improvement and early feedback loops (Develop Team).",
    "whyBullets": [
      "B is correct: teamwork + CI + early feedback helps expert achieve higher quality than working alone.",
      "PMBOK 8 p. 112: PM coaches when member unsure how to collaborate — servant leadership."
    ],
    "excludeReasons": {
      "A": "EQ lecture judges attitude — does not explain why Agile teamwork preserves quality.",
      "C": "Retrospective role too early before SME understands Agile value.",
      "D": "Sponsor escalation too heavy — PM coaches directly first."
    }
  }
}
```

## Validation

- [ ] Hero **no** full question stem (summary lead + badges only)
- [ ] Signal card: `signalPhrases` (2–5 **short keywords**, ≤80 chars each) + `signalAnswer` — never whole stem
- [ ] Tại sao chọn: `whyBullets` non-empty — correct key only
- [ ] Loại trừ: **every** wrong key — e.g. Q611 (correct B) → rows for A, C, D
- [ ] `validateTeachGrounding()` passes before write
- [ ] Trích dẫn Guide: complete sentence(s)

**Invalid lesson example:** `pmp-teach-full-q611.html` after `--allow-incomplete` — no Signal, empty Tại sao, Loại trừ chỉ D.

## Generator

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
```

Bootstrap fills `data/pmp-teach-signals.json` so `validateTeachGrounding()` passes for all IDs.  
Default **skips write** when validation fails.  
**Do not** use `--allow-incomplete` for publish or full-bank regen.

## Engine

| Piece | File |
|-------|------|
| `validateTeachGrounding`, `hasTeachSignal` | `pmp-teach-colocation-style.js` |
| Skip incomplete writes | `generate-pmp-full-teach-lessons.js` |
| `excludeReasonsByKey` in profiles | `pmp-option-reasoning.js` |
| Grounding store | `pmp-teach-signals-store.js` |
| Guide quote | `formatGuideQuote()` in `pmp-pmbok8-rag-pages.js` |
