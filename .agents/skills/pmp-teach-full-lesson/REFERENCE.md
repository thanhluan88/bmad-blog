# Reference — PMP Teach Full Lesson

## Grounding prompt

Use this **grounding** question before writing any lesson prose. Answer from PMBOK 8 Guide (+ RAG snippet); write the answer in Vietnamese for the lesson.

```
Dựa trên PMBOK 8, với nội dung câu hỏi sau:

"{stem}"

tại sao đáp án đúng là

{correctKey}. {correctOptionText}

mà không phải

{for each wrong key}
{key}. {optionText}
```

**Grounding answer must include:**
1. **Signal** — what in the stem drives the correct PMI action
2. **Why correct** — process/principle (e.g. Develop Team, Build an empowered culture) + how it addresses the misconception
3. **Why not each wrong key** — distinct trap or wrong sequence (escalate too early, ceremony before buy-in, lecture EQ without explaining value…)
4. **Guide cite** — `PMBOK 8, tr. N` from RAG when available

Embed the full grounding answer into `#analysis` (bullets + loại trừ table + EXPL). Do not leave grounding only in engine JSON.

---

## Q2 grounding model

**Stem:** SME skilled, 30% agile, invited to agile team, reluctant (team demotivating, slows down), wants highest-quality output.

**Correct:** B — Explain teamwork fosters continuous improvement and early feedback loops.

**Grounding question (abbreviated):** …tại sao đáp án đúng là B… mà không phải A (recommend EQ), C (SME runs retrospective as observer), D (ask sponsor to fix attitude)?

**Grounding answer (embed into `#analysis`):**

| Key | PMBOK 8 reasoning |
|-----|-------------------|
| **B ✓** | SME misconception: teamwork = slower / lower quality. PM must **explain Agile value** — collaboration enables **continuous improvement** and **early feedback**, helping experts reach *higher* quality than solo work. **Develop Team** (tr. 112): assess team needs, coach when members unsure how to work collaboratively; **Build an empowered culture**. |
| A | Recommending EQ integration lectures attitude — does not address *why* Agile teamwork does not compromise quality. |
| C | Assigning retrospective before SME joins / buys in — ceremony too early; must explain CI + feedback value first. |
| D | Escalating to sponsor for attitude — too heavy; PM coaches directly (servant leadership), not sponsor intervention first. |

**RAG:** tr. 112 — *Team members are unsure how to proceed… Assess the specific needs of the team… Focus on process improvements.*

---

## HTML section order

1. `#intro` — hero + badges
2. `#question` — quiz + `highlightQuizStem`
3. `#analysis` — **grounding** embedded: signal card, why bullets, Guide quote, loại trừ table
4. `#drill` — optional
5. `#traps` — trap pattern names (short)
6. `#flashcards` — 3 cards
7. `#cheatsheet` — keywords, answer, NOT list

**Omit:** `#concept`, `#compare`.

## Validation

- [ ] **Grounding** answered for correct key + every wrong key before lesson HTML written
- [ ] `#analysis` bullets match grounding (not generic template)
- [ ] Loại trừ table rows = grounding rejections for wrong keys only
- [ ] Quiz EXPL correct = **Đúng!** + grounding reason for correct key
- [ ] Hero lead Vietnamese; stem **signal** in `<em>`
- [ ] Quiz `.q-text` has ≥3 `kw-signal` + `kw-cue`
- [ ] Guide page in badges matches RAG snippet
- [ ] No sentence of 8+ words duplicated across analysis subsections

## Engine files

| Concern | File |
|---------|------|
| Stem profiles + rejections | `scripts/lib/pmp-option-reasoning.js` |
| Explanation markdown | `scripts/lib/pmp-pmbok8-generator.js` |
| Lesson sections | `scripts/lib/pmp-teach-colocation-style.js` |
| Lesson assembly | `scripts/generate-pmp-full-teach-lessons.js` |
| Quiz stem highlights | `scripts/lib/pmp-teach-keywords.js` |
| RAG pages | `scripts/lib/pmp-pmbok8-rag-pages.js` |

Engine emits first draft via `composeGrounding()` in `pmp-teach-colocation-style.js` (profile override or auto from `optionAnalysis`). Agent polishes prose and ensures **dedup** in HTML.

## RAG usage

1. `buildRagQuery(q, meta)` — include stem nouns + correct option action words
2. `lookupPmbokPages` — prefer snippets matching process (e.g. Develop Team for SME reluctance)
3. Quote in lesson: ≤2 lines, cite `PMBOK 8, tr. N`
