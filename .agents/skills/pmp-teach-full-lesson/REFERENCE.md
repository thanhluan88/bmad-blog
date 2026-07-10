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
  "whyCorrect": "lý do PMBOK 8 tại sao {correctKey} đúng (tiếng Việt, cụ thể)",
  "excludeReasons": {
    "A": "tại sao A sai — suy luận từ PMBOK 8 / tình huống",
    "B": "…",
    "C": "…"
  },
  "whyBullets": [
    "Đáp án {correctKey} đúng: …",
    "A sai: …",
    "C sai: …"
  ],
  "pmbokConcept": "trích dẫn ngắn từ PMBOK 8 (tiếng Anh hoặc Việt) — process/principle + nội dung Guide"
}
```

**whyBullets** và **excludeReasons** phải là suy luận AI — không dùng template engine (*"Hành động này giải quyết trực tiếp…"*).

## Signal prompt

After grounding:

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
3. `#analysis` — signal card, Tại sao chọn, Guide quote, loại trừ table
4. `#flashcards` — 3 cards (concept cites PMBOK 8)
5. `#cheatsheet` — keywords, answer, NOT list

**Omit:** `#drill`, `#traps`, **Grounding PMBOK 8 card** — không render.

## HTML contract — Signal card

```html
<div class="card tip signal-card">
  <h4>Signal trong stem Q3</h4>
  <p class="signal-phrases-en">
    <span class="kw-signal">lack of locally skilled resources</span> · …
  </p>
  <p class="signal-answer-vi">Virtual team + … → recurring check-ins (tiếng Việt).</p>
  <p class="signal-conclusion">→ <strong>D</strong>: …</p>
</div>
```

Quiz `.q-text` uses same `signalPhrases` for `kw-signal` highlight.

## HTML contract — Tại sao chọn + Loại trừ

- **Tại sao chọn {key}?** — `<ul>` từ `whyBullets` (grounding AI)
- **Loại trừ từng đáp án** — table từ `excludeReasons` (grounding AI), cột *Tại sao không chọn (grounding AI)*

Không lấy lý do từ `optionAnalysis` template khi chưa có grounding store.

## HTML contract — Trích dẫn Guide

```html
<div class="card info">
  <h4>Trích dẫn Guide</h4>
  <p style="margin:0">"Team building is conducting activities that enhance the team's social relationships and build a collaborative and cooperative working environment."</p>
  <p style="margin:0.5rem 0 0;font-size:0.82rem;color:var(--muted)">— PMBOK 8, tr. 205 (Performance Domain: Resources, Develop Team)</p>
</div>
```

**Rules:**
- 1–3 **complete sentences** from PMBOK 8 — each ends with `.`, `!`, or `?`
- **Never** cut mid-sentence (bad: *"Team-building activities can vary from"*)
- Prefer `guideQuote` in store when RAG snippet is incomplete
- Engine: `formatGuideQuote(text)` drops trailing incomplete fragment and caps at sentence boundaries (~520 chars)

## HTML contract — Flashcard concept (card 1)

```html
<div class="flashcard-back">
  <strong>Develop Team</strong>
  <br><span>Develop Team · Build an empowered culture</span>
  <br><em>"…quoted PMBOK 8 excerpt…"</em>
  <br>PMBOK 8, tr. 205
</div>
```

## Data store

`data/pmp-teach-signals.json`:

```json
{
  "3": {
    "signalPhrases": [
      "lack of locally skilled resources",
      "work virtually",
      "concerned about engagement"
    ],
    "signalAnswer": "Virtual team + PM lo engagement → cadence check-in, không copy plan cũ.",
    "whyCorrect": "Team virtual cần recurring check-ins để giữ engagement (Develop Team).",
    "excludeReasons": {
      "A": "Kickoff một lần không giải quyết engagement ongoing.",
      "B": "Copy plan team cũ — không fit context hiện tại.",
      "C": "Async-only thiếu tương tác cho virtual team mới."
    },
    "whyBullets": [
      "Đáp án D đúng: recurring check-ins giữ kết nối virtual team.",
      "A sai: kickoff không đủ cho engagement liên tục.",
      "B sai: plan cũ không phù hợp context mới.",
      "C sai: chỉ async — thiếu tương tác đồng bộ."
    ],
    "pmbokConcept": "Develop Team focuses on improving competencies and team member interaction. (PMBOK 8, tr. 205)",
    "guideQuote": "Team building is conducting activities that enhance the team's social relationships and build a collaborative and cooperative working environment."
  }
}
```

Priority: **store** → **STEM_PROFILE** (`lessonBullets`, `rejectByAction`) → empty (agent must fill).

## Validation

- [ ] **No** `#drill`, `#traps`, or Grounding PMBOK 8 card in output
- [ ] Tại sao chọn: bullets from `whyBullets`, not generic templates
- [ ] Loại trừ table: rows from `excludeReasons`, not `optionAnalysis` boilerplate
- [ ] Trích dẫn Guide: complete sentence(s); no mid-sentence truncation
- [ ] Flashcard concept: PMBOK 8 excerpt + tr. cited
- [ ] `signalPhrases` English substrings from stem; quiz highlights match
- [ ] **dedup**: no 8+ word sentence repeated across analysis blocks

## Engine

| Piece | File |
|-------|------|
| `composeGrounding`, cards | `pmp-teach-colocation-style.js` |
| Grounding store | `pmp-teach-signals-store.js` |
| Quiz highlight | `highlightQuizStem(text, signalPhrases)` in `pmp-teach-keywords.js` |
| Generic filter | `isGenericReasoning()` in `pmp-teach-colocation-style.js` |
| Guide quote | `formatGuideQuote()` in `pmp-pmbok8-rag-pages.js` |
| Profiles | `pmp-option-reasoning.js` |
