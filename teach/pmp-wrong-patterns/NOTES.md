# Notes

- User mapping for Full Bank (`luannt115`):
  - `attempts` = số lần đã làm
  - `wrongAttempt` = số lần sai **đang mở** cho filter ôn lại (cộng khi sai, **reset 0 khi đúng**)
  - Filter "Câu đã sai" = `wrongAttempt > 0` (sau khi chọn lại đúng → ra khỏi màn hình câu sai)
- Lesson 0001 (2026-07-13): multi-attempt historical (`attempts > 1`) snapshot
- Lesson 0002 (2026-07-14): `Sai: 1` / open wrong snapshot = 105 IDs
- Prefer Vietnamese lesson voice with English exam cues highlighted.
- Browser lessons: `public/pmp/pmp-teach-wrong-patterns.html` (0001), `public/pmp/pmp-teach-sai1-patterns.html` (0002)
