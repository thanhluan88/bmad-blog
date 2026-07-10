# Examples

## Bad — generic engine reasoning

**Tại sao chọn D?**
- Hành động này giải quyết trực tiếp vấn đề trong đề.

**Loại trừ A:** đáp án đúng tập trung vào Develop Team.

**Fix:** Run grounding prompt; store `whyBullets` + `excludeReasons` with question-specific PMBOK logic.

---

## Good — AI grounding (Q3)

**whyBullets:**
- Đáp án D đúng: virtual team + lo engagement → recurring check-ins (Develop Team).
- A sai: kickoff một lần không duy trì engagement.
- B sai: copy plan team cũ — không fit context.
- C sai: async-only thiếu tương tác đồng bộ.

**excludeReasons:** same reasoning per key (used in Loại trừ table).

---

## Signal — AI not regex

**Bad:** regex `/sent to the entire/` auto-tags signal.

**Good — Q1:**

```json
{
  "signalPhrases": [
    "mistakenly sent to the entire global project team",
    "critical feedback regarding a recent incident"
  ],
  "signalAnswer": "Email nhầm audience + feedback nhạy cảm → acknowledge + apologize công khai."
}
```

---

## Trích dẫn Guide — complete sentences

**Bad:** RAG snippet cut at 360 chars:

> Team building is conducting activities… and build a collaborative and cooperative working environment. Team-building activities can vary from

**Good:** ends on complete sentence:

> Team building is conducting activities that enhance the team's social relationships and build a collaborative and cooperative working environment.

Store override: `guideQuote` in `pmp-teach-signals.json` when RAG text is incomplete.

---

## Flashcard concept — PMBOK 8 citation

**Bad back:** `Develop Team` only — no Guide text.

**Good back:**

> **Develop Team**  
> Develop Team · Build an empowered culture  
> *"The Develop Team process focuses on improving competencies, team member interaction, and the overall team environment…"*  
> PMBOK 8, tr. 205

Source: `pmbokConcept` from grounding JSON or RAG `pageInfo.snippet`.
