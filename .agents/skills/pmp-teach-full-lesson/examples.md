# Examples

## Signal — keyword phrases only (not full question)

**Bad — Q123:** entire stem as one `kw-signal` highlight

```json
{
  "signalPhrases": [
    "A major retailer known for its environmentally conscious branding is launching… What should the project manager do?"
  ]
}
```

**Good — Q123 (correct B):**

```json
{
  "signalPhrases": [
    "aligns with its broader goals",
    "vision and expectations throughout the project timeline",
    "organization's image and brand recognition"
  ],
  "signalAnswer": "Ongoing alignment with organizational vision and brand → regular sponsor check-ins to align business objectives, not newsletters alone or charter rework."
}
```

Quiz stem highlights only those short phrases — rest of stem stays unhighlighted.

---

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

Every wrong key must have a row — retry grounding AI until complete.

---

## Q611 — partial Loại trừ (bad)

Correct = **B**. Wrong keys = **A, C, D**.

**Bad** (after `--allow-incomplete`):

- No Signal card
- `<ul></ul>` — empty Tại sao chọn
- Loại trừ table has **only D** (generic engine text slipped through)

**Good:**

| Đáp án | Tại sao không chọn |
|--------|-------------------|
| A | T&M keeps flexibility — wrong when scope is well-defined. |
| C | Cost-plus shifts cost risk to buyer — scope already clear. |
| D | Letter of intent before contract terms — poor procurement governance. |

Plus Signal card with `well-defined remaining scope` phrases and non-empty Tại sao chọn.

**Fix:** Fill `data/pmp-teach-signals.json` (or STEM_PROFILE) with full `signalPhrases`, `signalAnswer`, `whyBullets`, `excludeReasons` for A/C/D → `--force --from=611 --to=611` **without** `--allow-incomplete`.

---

## Q614 — empty signal (bad)

```html
<div class="card tip signal-card">
  <h4>Signal trong stem Q614</h4>
  <!-- empty — invalid -->
</div>
```

**Fix:** Retry signal prompt; fill `data/pmp-teach-signals.json`; re-run `--force --from=614 --to=614`.

---

## Hero — no stem duplicate

**Bad:** Full English question repeated under `Practice Questions — PMBOK 8th Ed` hero.

**Good:** Hero = title + one-line summary + badges; stem only in `#question` quiz.

---

## Trích dẫn Guide — complete sentences

**Bad:** `…Team-building activities can vary from` (cut mid-sentence)

**Good:** ends on `.` with full meaning — use `guideQuote` or `formatGuideQuote()`.
