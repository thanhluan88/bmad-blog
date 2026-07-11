# Prompts

## Grounding

**Inputs:** stem, options, correct key, column P (`sourceSolution`), RAG hits from step 3.

```
You have the reference solution from the question bank (CSV column P):

"{sourceSolution}"

Question:
"{stem}"

Correct answer: {correctKey}. {correctOptionText}

Wrong answers:
{for each wrong key}
{key}. {optionText}

Extract lesson grounding from the reference solution above.

VERBATIM from column P (no paraphrase, no added PMBOK prose):
- whyBullets — why-correct section: from after "Solution: {key}." through before "The other answer choices are incorrect"
- excludeReasons — one verbatim exclude sentence per wrong key from the section after that marker

Signal and guideHits still align to PMBOK 8 — see [RAG.md](RAG.md).

Return JSON:
{
  "whyCorrect": "same verbatim text as whyBullets[0] when from CSV",
  "excludeReasons": {
    "A": "verbatim sentence from column P for wrong A",
    "C": "…",
    "D": "…"
  },
  "whyBullets": [
    "verbatim why-correct excerpt from column P"
  ],
  "pmbokConcept": "short excerpt for flashcard",
  "guideHits": [
    {
      "page": 137,
      "topic": "Monitor Risks",
      "excerpt": "complete sentence(s) from RAG chunk",
      "query": "why-aligned search query"
    }
  ],
  "guideQuote": "primary excerpt — same as guideHits[0].excerpt",
  "guidePages": [137],
  "guideTopic": "Monitor Risks"
}
```

**Rules:**
- `whyBullets` → correct answer only, verbatim from column P
- `excludeReasons` → every wrong key, verbatim from column P
- If `sourceSolution` missing: derive why/exclude from PMBOK 8 + stem only

---

## Signal

Signal comes from **stem keywords**, not CSV solution text.

```
From this English stem, list 2–5 SHORT verbatim English keyword phrases (signalPhrases)
that point to answer {correctKey} — NOT the full question, NOT full sentences.

Rules:
- Each phrase: 8–80 characters, max 12 words, must appear verbatim in stem
- Do NOT use only generic exam wording like "What should the project manager do"
- Do NOT return the entire stem as one phrase

Write signalAnswer in English: how those keyword signals → {correctKey} (PMBOK 8).

Stem:
"{stem}"

Return JSON:
{
  "signalPhrases": ["short phrase 1", "short phrase 2"],
  "signalAnswer": "English only — how keywords → correct action"
}
```
