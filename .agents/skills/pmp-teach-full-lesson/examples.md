# Examples — grounding, colocation-grade vs auto

## Q2 — full grounding workflow (model lesson)

**Correct key:** B

**Grounding prompt to agent:**

> Dựa trên PMBOK 8, với nội dung câu hỏi  
> *"A highly skilled subject matter expert (SME) is engaged in a government project where approximately 30% of the deliverables will follow an agile approach. The project manager invites the SME to join the agile team to contribute to these iterations. The SME is reluctant because they think that working on a team is demotivating and slows them down, and they want to achieve the highest-quality output possible. What should the project manager do to address the SME's concerns and encourage them to join the agile team?"*  
> tại sao đáp án đúng là **B. Explain that teamwork fosters continuous improvement and early feedback loops** mà không phải  
> **A.** Recommend that the SME develop emotional intelligence by integrating with the team.  
> **C.** Request that the SME conduct the retrospective meetings as an objective observer.  
> **D.** Ask the sponsor to meet with the SME and help improve their attitude towards teamwork.

**Grounding answer → embed in `#analysis`:**

- SME lo teamwork làm chậm và giảm chất lượng — đó là misconception về Agile; PM phải **explain value**, không lecture EQ hay escalate.
- B đúng vì CI + early feedback giúp expert đạt chất lượng cao hơn làm việc đơn độc (**Develop Team**, **Build an empowered culture**, PMBOK 8 tr. 112).
- A: chỉ nhắc EQ — không giải thích vì sao teamwork Agile không compromise quality.
- C: giao retrospective khi SME chưa join — ceremony quá sớm.
- D: leo thang sponsor — PM vẫn coach trực tiếp trước.

**Bad:** Skip grounding; paste generic *"align miền Resources + Stakeholders"* in every subsection.

---

## Quiz stem highlighting (Q2)

**Good** `.q-text`:

> …<span class="kw-signal">subject matter expert (SME)</span>… <span class="kw-signal">agile approach</span>… <span class="kw-signal">reluctant because…slows them down</span>… <span class="kw-cue">What should the project manager do</span>…

Engine: `highlightQuizStem()` in `pmp-teach-keywords.js`.

---

## Bad: auto Q1120 (anti-patterns)

### Generic correct rationale (repeated)

```
Hành động này giải quyết trực tiếp vấn đề trong đề — align miền Scope + Stakeholders (Executing, PMBOK 8).
```

**Fix:** Run **grounding** first; one distinct rationale in `#analysis` bullets only.

### Template wrong-option rejection

Same sentence for A, C, D — only swaps quoted option.

**Fix:** Grounding gives each wrong key a different PMI trap (see Q2 table above).

### Wrong PMBOK mapping

Stem: *improve agile resource planning* → auto mapped Define Scope.

**Fix:** Grounding + RAG → Resources, Plan Resources.

### Weak signal

`SIGNAL KEYWORDS: —`

**Fix:** Extract from stem during grounding step.

---

## Colocation Q92 (quality bar)

Hero uses `<em>` on stem signals; wrong options each name a *different* mechanism — same standard as grounding rejections.
