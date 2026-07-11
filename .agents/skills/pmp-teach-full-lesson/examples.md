# Examples

## Q2 — triad

**1. Reference solution** (column P):
- B. Explain that teamwork fosters continuous improvement and early feedback loops — agile teamwork delivers quality through collaboration and adaptability.

**2. PMBOK 8 reasoning:**
- Scenario: SME refuses agile team — fears teamwork hurts quality.
- PMBOK 8, p. 76: Agile requires continuous feedback — **bridge:** teamwork creates feedback loops that improve quality.
- Therefore B: explain continuous improvement and early feedback.

**3. Supplementary (web):**
- PMP agile questions often test the misconception that solo work is faster; PM should educate on iterative feedback before EQ coaching or escalation. *(Source: exam prep pattern)*

---

## Q2 — bridge (pmbok lane detail)

**Stem:** SME fears teamwork on agile iterations will slow them down and hurt quality.

**Bad bullet 2:** p. 31 "professional growth of the team" — true but no **bridge** to "explain continuous improvement and early feedback."

**Iterate:** Re-RAG `Agile continuous feedback early feedback teamwork` → **p. 76**.

**Good chain:**

1. Scenario: An SME on a hybrid government project refuses to join the agile team because they believe teamwork is demotivating and will lower quality.
2. PMBOK 8, p. 76 (Tailoring — Agile examples): Agile projects require continuous feedback on features and user stories — so collaborative teamwork creates the early feedback loops that improve quality, directly countering the SME's fear that working alone is better.
3. Therefore **B** is correct: explain that teamwork fosters continuous improvement and early feedback loops.

---

## Q982 — reasoning chain

**Stem scenario:** During execution, the team discovers previously undocumented risks that could significantly affect the project's timeline and budget.

**Primary hit:** PMBOK 8, **p. 137** — Monitor Risks  
"A risk register is a repository in which outputs of risk management processes are recorded."

**Chain (`whyBullets`):**

1. Scenario: The team has found new risks late in the project that could affect schedule and cost.
2. PMBOK 8, p. 137 (Monitor Risks): the risk register records identified risks — so undocumented risks with schedule impact must be captured and assessed immediately, not deferred.
3. Therefore **C** is correct: document and analyze the risks immediately so they are formally assessed and addressed.

**Exclude (prose from column P):**

| Key | Reason |
|-----|--------|
| A | A brief status mention defers formal documentation and leaves exposure unaddressed. |
| B | Escalating before documenting skips the risk management process. |
| D | The issue log tracks materialized problems, not potential risks. |

**Iterate:** Bullet 1 quoted correct option → audit fails (scenario ≠ stem). Rewrite from stem → pass. Bullet 2 cited p. 98 (Implement) while arguing risk register → re-RAG → p. 137 → pass.

**Commands:**

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from=982 --to=982
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

---

## Q1 — scenario ≠ answer

**Bad bullet 1:** `Scenario: Acknowledge the mistake and apologize…` ← that is the **answer**, not the stem.

**Good bullet 1:** `Scenario: The project manager accidentally sent an email with critical feedback to the entire global team instead of one member.`

---

## Anti-patterns

| Bad | Good |
|-----|------|
| Scenario = correct option / column P | Scenario = stem situation |
| Naked PMBOK quote | Excerpt + **bridge** |
| One draft, publish | **Iterate** until bridge + fit pass |
