# Examples

## Q982 — end-to-end

**Column P:** Document and analyze newly identified risks → **risk register**, not issue log.

**RAG query:** `Monitor Risks risk register identified risks`

**Store (excerpt):**

```json
{
  "signalPhrases": [
    "previously undocumented risks",
    "could significantly affect the project's timeline and budget"
  ],
  "signalAnswer": "Undocumented risks with schedule/cost impact → document and analyze in risk register immediately.",
  "whyBullets": [
    "C is correct: Document and analyze… formally captured in risk register."
  ],
  "excludeReasons": {
    "A": "Brief mention in status report defers formal documentation.",
    "B": "Escalate before documenting skips risk management process.",
    "D": "Issue log is for materialized problems, not potential risks."
  },
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

**Rendered Guide:**

1. PMBOK 8, tr. 137 — Monitor Risks  
   "A risk register is a repository in which outputs of risk management processes are recorded."

**Sync:** After `generate-pmp-full-from-teach.js`, Kiểm tra `#q-982` matches teach `#analysis`.

**Commands:**

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from=982 --to=982
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

---

## Anti-patterns

| Rule | Bad | Good |
|------|-----|------|
| **Signal** | Entire stem as one `signalPhrases` entry | `["aligns with its broader goals", "vision and expectations throughout the project timeline"]` + English `signalAnswer` |
| **Tại sao** | Bullets mix correct + wrong keys | Correct only: "B is correct: teamwork + CI…"; wrong keys → Loại trừ |
| **Loại trừ** | Table missing option A when correct = B | Row for every wrong key (A, C, D) |
| **Guide** | `register. Identified risks…` fragment; cite `file_page` | Complete sentence; `PMBOK 8, tr. 137`; topic matches `whyBullets` |
| **Hero** | Full English question under hero badges | Stem only in `#question` quiz |
| **Incomplete** | `--allow-incomplete` with empty Tại sao, 1-row Loại trừ | Fill store → `--force --from={id} --to={id}` without `--allow-incomplete` |
