# Examples

## Signal — English only (AI exchange)

**Bad — Q9 before fix:** Vietnamese conclusion, no stem highlights

> → C: PM ưu tiên theo business value/MVP…

**Good — Q9:**

```json
{
  "signalPhrases": [
    "Kanban board and work-in-progress (WIP) limits agreed with stakeholders",
    "Because we are agile, you can just start my landing page now, and we\u2019ll worry about process later"
  ],
  "signalAnswer": "Stakeholder cites agility to bypass agreed WIP limits — PM explains agile teams still maintain governance and WIP limits."
}
```

Quiz stem highlights `kw-signal` on those English phrases.

---

## Tại sao chọn — correct only

**Bad** (wrong keys mixed in):

- B đúng: teamwork + CI…
- **A sai:** khuyên EQ = phán xét…
- **C/D sai thứ tự:** retrospective…

**Good:**

- B is correct: teamwork + continuous improvement + early feedback loops…
- PMBOK 8 p. 112: PM assesses team needs and coaches directly.

Wrong-key reasoning → **Loại trừ** table only.

---

## Loại trừ — all wrong keys

**Bad:** table missing option B when A, C, D shown.

**Good — Q2 (correct = B):**

| Đáp án | Tại sao không chọn |
|--------|-------------------|
| A | EQ lecture judges attitude — does not explain Agile teamwork value. |
| C | Retrospective role before SME buy-in. |
| D | Sponsor escalation too heavy. |

Every wrong key must have a row.

---

## Trích dẫn Guide — complete sentences

**Bad:** `…Team-building activities can vary from` (cut mid-sentence)

**Good:** ends on `.` with full meaning — use `guideQuote` or `formatGuideQuote()`.
