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

Dựa trên reference solution TRÊN, trích dữ liệu cho bài giảng.

**Trích NGUYÊN VĂN từ cột P** (không paraphrase, không thêm PMBOK):
- `whyBullets` — phần **why correct**: từ sau `Solution: {key}.` đến trước `The other answer choices are incorrect`
- `excludeReasons` — **mỗi wrong key**: câu loại trừ nguyên văn từ phần sau marker đó

Signal + `guideHits` vẫn align PMBOK 8 (xem [RAG.md](RAG.md)).

Trả về JSON:
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

**Separation rule:**
- `whyBullets` → **verbatim** why-correct từ cột P — **không** gộp wrong-key prose
- `excludeReasons` → **verbatim** mỗi wrong key từ cột P

If `sourceSolution` missing: reason from PMBOK 8 + stem for why/exclude only.

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
