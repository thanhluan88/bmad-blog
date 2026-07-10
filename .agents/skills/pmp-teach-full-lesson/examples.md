# Examples — colocation-grade vs auto lesson

## Quiz stem highlighting (Q2 model)

**Bad** — chỉ highlight câu hỏi PMI:
> …join the agile team… <span class="kw-cue">What should the project manager do</span>…

**Good** — cue tình huống + directive:
> A highly skilled <span class="kw-signal">subject matter expert (SME)</span>… <span class="kw-signal">30%…agile approach</span>… <span class="kw-signal">join the agile team</span>… <span class="kw-signal">reluctant because…demotivating and slows them down</span>… <span class="kw-signal">highest-quality output</span>… <span class="kw-cue">What should the project manager do</span>…

Engine: `highlightQuizStem()` → `STEM_SIGNAL_PATTERNS` + `EXAM_CUE_PATTERNS` in `scripts/lib/pmp-teach-keywords.js`.

---

## Good: colocation Q92 (excerpt)

**Hero (one scenario paragraph, signal in `<em>`):**
> team nằm rải rác *các phòng ban khác nhau trong cùng một tòa nhà*, phụ thuộc *video conferencing*, có *hiểu lầm về yêu cầu*…

**Concept contrast grid — concepts, not option letters:**
> Colocation · Team-building · Virtual meetings · Requirements docs

**Wrong-option rejection (specific):**
> Team-building xây trust/morale — không fix misunderstandings hàng ngày hay slow knowledge transfer.

Each wrong option gets a *different* mechanism named.

---

## Bad: auto Q1120 (anti-patterns)

### 1. Generic correct rationale (repeated 5+ times)

```
Hành động này giải quyết trực tiếp vấn đề trong đề — align miền Scope + Stakeholders (Executing, PMBOK 8).
```

Appears in: compare grid B, analysis bullets ×3, tip card, pattern card.

**Fix:** One paragraph in analysis only; elsewhere use short contrasts. Do not add `#concept` / `#compare` sections to recover this content.

### 2. Template wrong-option rejection

```
"The product owner should only include short-term specialists…" không phù hợp ngữ cảnh Agile/Scrum — đáp án đúng tập trung "The team should include both generalists…"
```

Same template for A, C, D — only swaps quoted option.

**Fix:**
- A → specialist ngắn hạn / task-based hiring
- C → team chọn requirements (sai vai PO/prioritization)
- D → hạn chế customer (waterfall trap)

### 3. Wrong PMBOK mapping

Stem: *improve agile resource planning*  
Auto mapped: Define Scope, Validate Scope, Control Scope

**Fix:** Resources — Plan Resources; principle Build an empowered culture; RAG tr. 88 adaptive resource/skills.

### 4. Weak signal

```
Signal: ngữ cảnh Agile/Scrum
Cheat sheet SIGNAL KEYWORDS: —
```

**Fix:** `adopting agile approach · specialized resources · project managers assigned for set period · improve agile resource planning`

### 5. Approach grid shows option letters

```
<strong>A</strong> The product owner should only include…
```

**Fix:** Label by action concept: *Short-term specialists only* · *Generalists + specialists (đúng)* · …

---

## Target Q1120 hero (after fix)

```html
<p class="lead">Bài học Q1120 về <strong>Agile resource planning</strong> (PMBOK 8, tr. 88) —
Tổ chức chuyển sang Agile nhưng vẫn quản lý nguồn lực theo kiểu specialist + PM gán cố định.</p>
<p class="lead" style="margin-top:0.75rem">
  … <em>adopting an agile approach</em> … <em>specialized resources</em> …
  <em>project managers assigned to the project for a set period</em> …
  <em>improve agile resource planning</em>?
</p>
```

## Target Q1120 analysis bullet (one of five, distinct)

- Tổ chức cũ: specialist theo task + PM cố định — không phù hợp team cross-functional Agile.
- Đáp án B: generalist + specialist cùng thích nghi requirement thay đổi — đúng hướng Plan Resources adaptive.
- A chỉ thêm specialist ngắn hạn → vẫn task-based, thiếu generalists.
- (etc. — no sentence reused elsewhere)
