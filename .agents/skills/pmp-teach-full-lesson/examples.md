# Examples

## Q982 — solution + RAG + sync

**Column P (why correct):** Document and analyze newly identified risks → **risk register**, not issue log.

**RAG query:** `Monitor Risks risk register identified risks`

**guideHits (3 distinct pages when available):**

```json
{
  "guideHits": [
    {
      "page": 137,
      "topic": "Monitor Risks",
      "excerpt": "A risk register is a repository in which outputs of risk management processes are recorded.",
      "query": "Monitor Risks risk register identified risks"
    }
  ]
}
```

**Signal** (from stem, not solution):

```json
{
  "signalPhrases": [
    "previously undocumented risks",
    "could significantly affect the project's timeline and budget"
  ],
  "signalAnswer": "Undocumented risks with schedule/cost impact → document and analyze in risk register immediately."
}
```

**Tại sao chọn** — from solution why-correct only:

- C is correct (reference solution): Document and analyze… formally captured in **risk register**

**Loại trừ** — from solution “other incorrect”:

| Key | From column P |
|-----|----------------|
| A | Brief mention in status report defers formal documentation |
| B | Escalate before documenting skips risk management process |
| D | Issue log is for materialized problems, not potential risks |

**Sync:** After `generate-pmp-full-from-teach.js`, Kiểm tra on `#q-982` shows same exclude reasons and Guide excerpt as teach page.

---

## CSV solution → grounding (column P)

**Source:** `all_questions_flat 1.csv` column `explanation_text` (P), matched by stem.

**Q611 excerpt (column P):**

> Solution: B. Recommend a firm-fixed-price contract… FFP when scope is well-defined… The other answer choices are incorrect. Time-and-materials… Cost-plus… Issuing a letter of intent…

**Agent workflow:**

1. Load column P as `sourceSolution`
2. Grounding prompt: solution + PMBOK 8 → `whyBullets`, `excludeReasons` (A, C, D), `guideQuote`
3. Signal prompt: stem keywords only (not solution text)
4. Validate → generate

**Good store entry (after PMBOK refinement):**

```json
{
  "sourceSolution": "Solution: B. Recommend a firm-fixed-price contract…",
  "whyBullets": [
    "B is correct: FFP when scope is well-defined — buyer cost control.",
    "PMBOK 8: Conduct Procurements — fixed price for clear scope."
  ],
  "excludeReasons": {
    "A": "T&M when scope uncertain — remaining scope here is well-defined.",
    "C": "Cost-plus shifts cost risk to buyer — scope already defined.",
    "D": "Letter of intent without formal contract — legal ambiguity."
  }
}
```

**Bad:** empty `whyBullets`, Loại trừ chỉ D, no `sourceSolution` when CSV row exists.

---

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

## Trích dẫn Guide — 3 RAG hits + page

**Bad:** one fragment misaligned with Tại sao (`register. Identified risks…` while why says Develop Team)

**Bad:** cite `file_page` or invent PDF line number

**Good — Q982:**

1. PMBOK 8, tr. 137 — Monitor Risks  
   "A risk register is a repository in which outputs of risk management processes are recorded."

2. (additional hits on distinct pages when RAG returns them)

Align with **whyBullets** — if why mentions risk register, Guide must cite risk/register content.

---

## Trích dẫn Guide — complete sentences (single-hit fallback)

**Bad:** `…Team-building activities can vary from` (cut mid-sentence)

**Good:** ends on `.` with full meaning — use `guideQuote` or `formatGuideQuote()`.
