# Reference — PMP Teach Full Lesson

## HTML section order

1. `#intro` — hero + badges (page, domain, process, Full Bank Qn)
2. `#question` — quiz card + feedback script
3. `#analysis` — signal card, why bullets, answer card, Guide quote, loại trừ table
4. `#drill` — classify drill (only if ≥2 meaningful action types)
5. `#traps` — trap cards + pattern card
6. `#flashcards` — 3 cards: concept, answer, signal→action
7. `#cheatsheet` — ASCII summary

**Omit:** `#concept` (e.g. "1. Develop Team") and `#compare` (e.g. "2. So sánh đáp án") — concept grid và option grid trùng Phân tích.

## Validation

- [ ] Hero lead is Vietnamese; stem **signal** phrases use `<em>` (not raw wall of English only)
- [ ] Quiz `.q-text` has ≥3 `kw-signal` spans on scenario cues (SME issue, agile context, constraint…) plus `kw-cue` on PMI directive
- [ ] PMBOK page cited in badges matches RAG snippet topic
- [ ] Signal card (in analysis) lists ≥2 stem keywords specific to this question
- [ ] No `#concept` or `#compare` sections in output
- [ ] Analysis `<ul>` has 3–5 bullets, all distinct
- [ ] Loại trừ table: each wrong key has a unique rejection (no copy-paste template)
- [ ] Trap cards name the trap pattern (e.g. "EQ lecture trap")
- [ ] Cheat sheet SIGNAL KEYWORDS not empty (`—`)
- [ ] Quiz EXPL correct = `Đúng!` + specific reason
- [ ] No sentence of 8+ words appears in more than one major section

## Q1120 content model (when regenerating)

**Stem signal:** adopting agile · previously specialized resources + PM assigned for fixed period · improve **agile resource planning**

**Correct B rationale (Vietnamese):** Agile cần team linh hoạt — vừa generalist vừa specialist thích nghi requirement thay đổi; không giữ mô hình specialist thuê theo task hay PM gán cố định.

**PMBOK 8:** Resources — Plan Resources / Develop Team; adaptive teams with varied skills (Guide tr. ~88 resource planning in adaptive approach).

| Key | Rejection focus |
|-----|-----------------|
| A | Short-term specialists only → vẫn mô hình task-based, thiếu generalists adapt |
| C | Team tự chọn requirements → lẫn vai PO/backlog prioritization, không phải resource planning |
| D | Restrict customer → waterfall, mâu thuẫn agile collaboration |

## Engine files (single source of truth)

| Concern | File |
|---------|------|
| Wrong-option logic | `scripts/lib/pmp-option-reasoning.js` |
| Explanation markdown | `scripts/lib/pmp-pmbok8-generator.js` |
| Lesson HTML sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Lesson assembly | `scripts/generate-pmp-full-teach-lessons.js` |
| Keyword highlights | `scripts/lib/pmp-teach-keywords.js` |

Do not duplicate rejection templates in HTML by hand when the engine can emit them once.

## RAG usage

1. `buildRagQuery(q, meta)` — query must include stem nouns (e.g. "resource planning", "generalists specialists adaptive")
2. `lookupPmbokPages` — prefer snippets about team/resources/adaptive over generic scope overview
3. Quote in lesson: ≤2 lines, cite `PMBOK 8, tr. N`
