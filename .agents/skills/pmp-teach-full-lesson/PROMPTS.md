# Prompts

## Grounding (triad)

**Inputs:** stem, options, correct key, column P (`sourceSolution`), `guideHits`, web search results.

See [WHY.md](WHY.md) for three lanes.

```
Reference solution (CSV column P):
"{sourceSolution}"

Stem:
"{stem}"

Correct: {correctKey}. {correctOptionText}

Primary Guide hit:
PMBOK 8, p. {guideHits[0].page} — {guideHits[0].topic}
"{guideHits[0].excerpt}"

Web search notes (if any):
{webSnippets}

Return JSON:
{
  "whySolutionBullets": [
    "{correctKey}. {1–2 concise bullets from column P why-correct — faithful, not scenario}"
  ],
  "whyPmbokBullets": [
    "Scenario: {stem situation — NOT the correct option}",
    "PMBOK 8, p. {page} ({topic}): {excerpt} — {bridge}.",
    "Therefore {correctKey} is correct: {PM action}."
  ],
  "whyBullets": [ …same as whyPmbokBullets — legacy alias… ],
  "whyWebBullets": [
    "{supplementary reasoning from web — exam trap, agile misconception, PM practice}"
  ],
  "whyWebSources": ["Site or article title"],
  "excludeReasons": { "A": "…", "C": "…", "D": "…" },
  "guideHits": [ … ],
  "guideQuote": "…",
  "guidePages": […],
  "guideTopic": "…"
}
```

**Rules:**
- **solution** lane = column P why-correct only (1–2 bullets)
- **pmbok** lane = chain + **bridge** — [REASONING.md](REASONING.md)
- **web** lane = supplementary; cite source; do not repeat pmbok verbatim
- `excludeReasons` = every wrong key

After JSON: [WHY.md#audit-triad](WHY.md#audit-triad).

---

## Web

[WEB.md](WEB.md) — run before or after pmbok draft.

```
Stem conflict: "{stem}"
Correct action: {correctKey}. {correctOptionText}

Search the web for PMP exam / PM practice context that supports this answer.
Query example: "{misconception} {correct action verb} PMP exam"

Return:
{
  "whyWebBullets": ["1–2 English prose bullets"],
  "whyWebSources": ["source names"]
}
```

---

## Signal

From **stem keywords** only — not CSV.

```
From this English stem, list 2–5 SHORT verbatim English keyword phrases (signalPhrases)
that point to answer {correctKey}.

Rules:
- Each phrase: 8–80 chars, max 12 words, verbatim in stem
- No generic-only phrases like "What should the project manager do"

signalAnswer: English prose — keywords → {correctKey}

Stem: "{stem}"

Return JSON: { "signalPhrases": [...], "signalAnswer": "…" }
```
