# Notes

- User mapping for Full Bank (`luannt115`):
  - `attempts` = số lần đã làm
  - `wrongAttempt` = số lần sai **đang mở** cho filter ôn lại (cộng khi sai, **reset 0 khi đúng**)
  - `lastWrongAttempt` = số lần **đã từng sai** lifetime (cộng khi sai, **không reset** khi đúng)
  - Seed migrate: `wrongAttempt>0` → lastWrongAttempt=wrongAttempt; `attempts>1 && wrongAttempt=0` → lastWrongAttempt=attempts-1
  - Filter "Câu đã sai" = `wrongAttempt > 0` (sau khi chọn lại đúng → ra khỏi màn hình câu sai)
- Lesson 0001 (2026-07-13): multi-attempt historical (`attempts > 1`) snapshot — 8 patterns
- Lesson 0002 (2026-07-14): `Sai: 1` / open wrong snapshot = 105 IDs — 8 patterns
- Lesson 0003 (2026-07-15): `lastWrongAttempt ≥ 1` = 415 IDs — **26 named patterns + other (~18%)** after /review rejected forced-8
- Analyzer: `scripts/analyze-pmp-last-wrong-patterns.js` (specific-first; correct-only then distractor fallback)
- Lesson generator: `scripts/generate-pmp-last-wrong-patterns-lesson.js`
- Prefer Vietnamese lesson voice with English exam cues highlighted.
- Browser lessons:
  - `public/pmp/pmp-teach-wrong-patterns.html` (0001)
  - `public/pmp/pmp-teach-sai1-patterns.html` (0002)
  - `public/pmp/pmp-teach-last-wrong-patterns.html` (0003)
