# Examples

## Bad grounding (Q3 before fix)

One unreadable paragraph:

> Dựa trên PMBOK 8 (Develop Team + Build an empowered culture, tr. 205): với thiếu hụt nguồn lực / kỹ năng, đáp án đúng là D — Hành động này giải quyết trực tiếp… Không chọn: A (…); B ("Adopt the communications…"); C (…).

**Fix:** structured `grounding-card` with `Không chọn` as `<ul>`.

---

## Good grounding (Q3 target)

**PMBOK 8** · Develop Team + Build an empowered culture, tr. 205

**Đáp án đúng — D**  
D. Conduct recurring check-ins and meetings at scheduled intervals.  
Team virtual + PM lo engagement → cadence meeting giữ kết nối (Develop Team).

**Không chọn**
- **A.** Kickoff bắt buộc không giải quyết engagement ongoing
- **B.** Copy plan team cũ — không fit context hiện tại
- **C.** Async-only — thiếu tương tác cho virtual team mới

---

## Signal — AI not regex

**Bad:** regex `/sent to the entire/` auto-tags signal.

**Good — Q1 signal prompt result:**

```json
{
  "signalPhrases": [
    "mistakenly sent to the entire global project team",
    "critical feedback regarding a recent incident",
    "email intended for a specific team member"
  ],
  "signalAnswer": "Email nhầm audience + feedback nhạy cảm → FIRST là acknowledge + apologize công khai (Lead accountably)."
}
```

Quiz highlights those **English** phrases; signal card shows phrases + Vietnamese answer.

---

## Q2 signal (handcrafted profile)

**signalPhrases (EN):**
- `reluctant because they think that working on a team is demotivating and slows them down`
- `join the agile team`
- `highest-quality output possible`

**signalAnswer (VI):** SME misconception về Agile → explain CI + early feedback (Develop Team).
