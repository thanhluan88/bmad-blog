# Why this answer — triad

**Leading word:** **triad** — three lanes under one heading; each lane answers from a different source.

```
Why this answer
├── 1. solution   — column P reference (correct key + why-correct)
├── 2. pmbok      — stem → PMBOK 8 + bridge → therefore key
└── 3. web        — supplementary PM reasoning from internet search
```

Lanes are **independent prose** — not three copies of the same sentence.

---

## 1. solution

**Source:** `all_questions_flat 1.csv` column **P** — why-correct section (before exclude markers).

| Rule | Check |
|------|-------|
| Faithful | Preserves correct **key** and PM action from column P |
| Concise | 1–2 bullets; trim filler, keep grammar |
| Not scenario | Situation belongs in pmbok bullet 1, not here |

**Store:** `whySolutionBullets[]`  
**UI:** `1. Reference solution`

**Pattern:** `{correctKey}. {why-correct gist from column P in complete English}.`

---

## 2. pmbok

**Source:** RAG `guideHits` + [REASONING.md](REASONING.md) chain with **bridge**.

| Rule | Check |
|------|-------|
| Scenario | Bullet 1 = stem situation only |
| Bridge | Bullet 2 argues why PMBOK → this answer — not naked quote |
| Therefore | Bullet 3 names correct key |

**Store:** `whyPmbokBullets[]` (legacy alias: `whyBullets`)  
**UI:** `2. PMBOK 8 reasoning`

See [PROSE.md](PROSE.md), [RAG.md](RAG.md).

---

## 3. web

**Source:** Internet search — PMI exam prep, agile/PM practice articles, reputable PM sources.

| Rule | Check |
|------|-------|
| On-topic | Supports same correct key as solution + pmbok |
| Cited | Name source or site; no invented URLs |
| Supplementary | Adds angle PMBOK lane does not cover (exam trap, agile misconception, PM practice) |
| Honest | If search weak → say so; do not fabricate |

**Store:** `whyWebBullets[]` (+ optional `whyWebSources[]`)  
**UI:** `3. Supplementary reasoning (web)`

**Workflow:** [WEB.md](WEB.md) — query from stem conflict + correct action; 1–2 bullets.

**Single ID:** web lane required before publish.  
**Full bank:** web lane optional (empty → omit subsection in HTML).

---

## Audit (triad)

- [ ] **solution** lane matches column P key and action
- [ ] **pmbok** lane passes [REASONING.md#audit](REASONING.md#audit)
- [ ] **web** lane on-topic; sources named (hand-work)
- [ ] Three lanes do not contradict each other on correct key
- [ ] Exclude block still adjacent after triad

---

## Anti-patterns

| Bad | Good |
|-----|------|
| One `<ul>` mixing all three sources | Three labelled subsections |
| solution = full column P wall | 1–2 concise bullets |
| web = repeat of pmbok bullet 2 | web adds exam/practice angle |
| web with no source named | Cite site or article title |
