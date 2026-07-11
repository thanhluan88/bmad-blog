# Prompts — PMP Teach Full Lesson

## Grounding

**Inputs:** stem, options, correct key, **column P** (`sourceSolution`), RAG hits from step 3.

```
Bạn có reference solution từ ngân hàng câu (cột P CSV):

"{sourceSolution}"

Câu hỏi:
"{stem}"

Đáp án đúng: {correctKey}. {correctOptionText}

Các đáp án sai:
{for each wrong key}
{key}. {optionText}

Dựa trên reference solution TRÊN và PMBOK 8 (process, principle, Guide excerpt nếu có),
reasoning ra bài giảng — không copy nguyên văn solution nếu lệch PMBOK 8.

Trả về JSON:
{
  "whyCorrect": "why {correctKey} — PMBOK 8 aligned (EN or VI)",
  "excludeReasons": {
    "A": "one entry per WRONG key only",
    "C": "…",
    "D": "…"
  },
  "whyBullets": [
    "Why {correctKey} is correct: …",
    "PMBOK 8 process / principle …"
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

**Separation rule:**
- `whyBullets` → **correct answer only**
- `excludeReasons` → **every wrong key** — seed from CSV "other answer choices are incorrect", refine with PMBOK 8

If `sourceSolution` missing: omit first block; reason from PMBOK 8 + stem only.

`guideHits` from step 3 — see [RAG.md](RAG.md). Align query with `whyBullets` terms.

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
