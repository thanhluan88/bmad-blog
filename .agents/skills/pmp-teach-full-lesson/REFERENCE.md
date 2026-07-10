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
```

## Signal prompt

After grounding, ask AI:

```
Từ stem tiếng Anh sau, liệt kê 2–5 cụm tiếng Anh (copy nguyên văn từ stem) là signal dẫn tới đáp án {correctKey}.
Giải thích bằng tiếng Việt tại sao các signal đó → đáp án {correctKey} (PMBOK 8).

Stem:
"{stem}"

Trả về JSON:
{
  "signalPhrases": ["...", "..."],
  "signalAnswer": "..."
}
```

**signalPhrases** = English only, verbatim from stem.  
**signalAnswer** = Vietnamese only.

## HTML section order

1. `#intro` — hero + badges
2. `#question` — quiz (`highlightQuizStem` with `signalPhrases`)
3. `#analysis` — grounding card, signal card, why bullets, Guide quote, loại trừ table
4. `#traps` — trap pattern names (short)
5. `#flashcards` — 3 cards
6. `#cheatsheet` — keywords, answer, NOT list

**Omit:** `#drill` — *Drill — phân loại hành động PM* (classify drill). Không render, không sidebar link.

## HTML contract — Grounding card

```html
<div class="card info grounding-card">
  <h4>Grounding PMBOK 8</h4>
  <p class="grounding-ref">PMBOK 8 · Develop Team + …, tr. 205</p>
  <div class="grounding-block">
    <h5>Đáp án đúng — D</h5>
    <p class="grounding-opt-text"><strong>D.</strong> Conduct recurring check-ins…</p>
    <p class="grounding-why">…lý do PMBOK…</p>
  </div>
  <div class="grounding-block">
    <h5>Không chọn</h5>
    <ul class="grounding-wrong">
      <li><strong>A.</strong> …</li>
    </ul>
  </div>
</div>
```

**Bad:** single `<p>` with entire grounding + wrong options inline.

## HTML contract — Signal card

```html
<div class="card tip signal-card">
  <h4>Signal trong stem Q3</h4>
  <p class="signal-phrases-en">
    <span class="kw-signal">lack of locally skilled resources</span> ·
    <span class="kw-signal">work virtually</span> · …
  </p>
  <p class="signal-answer-vi">Virtual team + … → recurring check-ins (tiếng Việt).</p>
  <p class="signal-conclusion">→ <strong>D</strong>: …</p>
</div>
```

Quiz `.q-text` uses same `signalPhrases` for `kw-signal` highlight.

## Data store

`data/pmp-teach-signals.json`:

```json
{
  "3": {
    "signalPhrases": [
      "lack of locally skilled resources",
      "internationally dispersed project team",
      "work virtually",
      "concerned about engagement"
    ],
    "signalAnswer": "Virtual team + PM lo engagement → cadence check-in/meeting, không copy plan cũ hay async-only."
  }
}
```

Priority: **store** → **STEM_PROFILE** → empty (agent must fill).

## Validation

- [ ] **No** `#drill` section in output
- [ ] Grounding card has `Đáp án đúng` + `Không chọn` sections (not one block)
- [ ] `signalPhrases` are English substrings from stem
- [ ] Quiz highlights match `signalPhrases` exactly
- [ ] `signalAnswer` Vietnamese; phrases English
- [ ] No `STEM_SIGNAL_PATTERNS` used for signal card
- [ ] Loại trừ table matches grounding rejections
- [ ] **dedup**: no 8+ word sentence repeated across analysis blocks

## Engine

| Piece | File |
|-------|------|
| `composeGrounding`, cards | `pmp-teach-colocation-style.js` |
| Signal store | `pmp-teach-signals-store.js` |
| Quiz highlight | `highlightQuizStem(text, signalPhrases)` in `pmp-teach-keywords.js` |
| Profiles | `pmp-option-reasoning.js` |
