# Examples

## Q982 — end-to-end

**Column P (verbatim excerpts):**

- **Why:** `C. Document and analyze the newly identified risks. These risks should be formally captured in the risk register.`
- **Exclude A:** `A brief mention in a status report does not formally document and analyze the risks.`
- **Exclude B:** `Escalating to senior management before documenting the risks skips the risk management process.`
- **Exclude D:** `An issue log is for problems that have already materialized, not for potential risks.`

**Store:**

```json
{
  "whyBullets": [
    "C. Document and analyze the newly identified risks. These risks should be formally captured in the risk register."
  ],
  "excludeReasons": {
    "A": "A brief mention in a status report does not formally document and analyze the risks.",
    "B": "Escalating to senior management before documenting the risks skips the risk management process.",
    "D": "An issue log is for problems that have already materialized, not for potential risks."
  }
}
```

**Layout in `#analysis`:** Signal → **Vì sao chọn đáp án này** → **Loại trừ phương án khác** (liền kề) → Đáp án → Trích dẫn Guide.

---

## Anti-patterns

| Rule | Bad | Good |
|------|-----|------|
| **Vì sao** | Paraphrase / thêm "PMBOK 8: …" | Nguyên văn đoạn why-correct từ cột P |
| **Loại trừ** | Tóm tắt lại bằng tiếng Việt | Nguyên văn câu exclude từ cột P |
| **Layout** | Guide nằm giữa Vì sao và Loại trừ | Vì sao + Loại trừ liền kề, trước Guide |
| **Signal** | Entire stem as one phrase | 2–5 short verbatim English phrases |
| **Incomplete** | `--allow-incomplete` with empty sections | Fill store → `--force` without `--allow-incomplete` |
