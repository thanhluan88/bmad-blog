# Examples

## Q982 — end-to-end

**Column P (verbatim):**

- **Why:** `C. Document and analyze the newly identified risks. These risks should be formally captured in the risk register.`
- **Exclude A:** `A brief mention in a status report does not formally document and analyze the risks.`
- **Exclude B:** `Escalating to senior management before documenting the risks skips the risk management process.`
- **Exclude D:** `An issue log is for problems that have already materialized, not for potential risks.`

**Store excerpt:**

```json
{
  "whyBullets": [
    "C. Document and analyze the newly identified risks. These risks should be formally captured in the risk register."
  ],
  "excludeReasons": {
    "A": "A brief mention in a status report does not formally document and analyze the risks.",
    "B": "Escalating to senior management before documenting the risks skips the risk management process.",
    "D": "An issue log is for problems that have already materialized, not for potential risks."
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

**Layout:** Signal → why → exclude (adjacent) → answer → Guide.

**Commands:**

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from=982 --to=982
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

---

## Anti-patterns

| Rule | Bad | Good |
|------|-----|------|
| Why | Paraphrase or add PMBOK bullets | Verbatim why-correct from column P |
| Exclude | Summarize in different words | Verbatim exclude sentence per wrong key |
| Layout | Guide between why and exclude | Why + exclude adjacent, then Guide |
| Signal | Entire stem as one phrase | 2–5 short verbatim English phrases |
| Publish | `--allow-incomplete` | Fill store → `--force` without flag |
