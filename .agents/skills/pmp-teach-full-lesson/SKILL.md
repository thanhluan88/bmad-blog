---
name: pmp-teach-full-lesson
description: Lesson pipeline — CSV solution → RAG fit → why triad (solution + PMBOK bridge + web) → iterate → HTML → quiz sync. Use for pmp-teach-full-q*, triad/bridge quality, or quiz/teach mismatch.
---

# PMP Teach Full Lesson

**Role:** PM owning one **lesson** per question.

**Pipeline:** solution → RAG **fit** → **triad** → **iterate** → lesson → **sync**

## Branches

| Branch | Trigger | Path |
|--------|---------|------|
| **Single ID** | Fix one question | Steps 1–9; hand-RAG + **web**; **iterate** until triad passes |
| **Full bank** | Regen 1123 | Bootstrap → `--force` → sync (web lane optional) |

Exam Latest is **out of scope**.

## Quality gate

[CONTRACT.md#validation](CONTRACT.md#validation) + [WHY.md#audit-triad](WHY.md#audit-triad) fail → no HTML. Never `--allow-incomplete` for publish.

## Inputs

| Asset | Path |
|-------|------|
| Question bank | `public/pmp/pmp-full-questions.json` |
| Answer key + reference | `all_questions_flat 1.csv` column **P** |
| Grounding store | `data/pmp-teach-signals.json` |
| RAG | `rag-local-pmp` — `search_docs` only |
| Web | `WebSearch` — [WEB.md](WEB.md) |

## Steps

### 1. Load question

**Done when:** correct key + every wrong key listed.

### 2. Load solution

```javascript
const { getCsvSolutionForQuestion } = require("./scripts/lib/pmp-csv-solutions");
const row = getCsvSolutionForQuestion(q);
```

**Done when:** `sourceSolution` loaded or absence documented.

### 3. RAG — 3 Guide hits

[RAG.md](RAG.md) — query from column P + stem; **fit** for **bridge**.

**Done when:** ≥1 hit with printed `page` + prose excerpt; target 3 pages.

### 4. Triad — three why lanes

Build per [WHY.md](WHY.md):

| Lane | Source | Store field |
|------|--------|-------------|
| 1. solution | Column P why-correct | `whySolutionBullets` |
| 2. pmbok | [REASONING.md](REASONING.md) chain + **bridge** | `whyPmbokBullets` / `whyBullets` |
| 3. web | [WEB.md](WEB.md) | `whyWebBullets` |

Run [PROMPTS.md#grounding](PROMPTS.md#grounding).

**Done when:** solution + pmbok lanes pass; web lane filled (single ID) or omitted (full bank).

### 5. Iterate

[REASONING.md#iterate](REASONING.md#iterate) on pmbok **bridge**/**fit**; [WEB.md](WEB.md) on weak web hits.

**Done when:** [WHY.md#audit-triad](WHY.md#audit-triad) passes.

### 6. Validate

`validateTeachGrounding(q, analysis)` + triad audit.

**Done when:** both pass.

### 7. Generate lesson

```bash
node scripts/generate-pmp-full-teach-lessons.js --force --from={id} --to={id}
```

**Done when:** `1 written, 0 incomplete`; HTML shows three labelled subsections.

### 8. Sync quiz

```bash
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

**Done when:** teach `#analysis` = quiz `#result-{id}`.

## Full bank release

```bash
node scripts/bootstrap-pmp-teach-signals.js
node scripts/generate-pmp-full-teach-lessons.js --force
node scripts/generate-pmp-full-from-teach.js --skip-bootstrap
```

**Release criteria:** `1123 written, 0 incomplete`; spot-check **triad** on samples.

## Defect log

| Symptom | Fix |
|---------|-----|
| Why is one flat list | Split into **triad** lanes — [WHY.md](WHY.md) |
| Naked PMBOK quote | Add **bridge** in pmbok lane |
| solution = scenario | Lane 1 from column P only; scenario in pmbok lane 1 |
| web repeats pmbok | Re-search for exam/practice angle |
| Quiz ≠ teach | Sync after regen |

## Reference

- [WHY.md](WHY.md) — **triad** structure (solution | pmbok | web)
- [WEB.md](WEB.md) — internet search lane
- [REASONING.md](REASONING.md) — pmbok chain, bridge, iterate
- [PROSE.md](PROSE.md) — prose rules
- [PROMPTS.md](PROMPTS.md) — grounding + signal + web
- [CONTRACT.md](CONTRACT.md) — store, layout, validation
- [RAG.md](RAG.md) — 3-hit lookup
- [examples.md](examples.md) — Q2 triad
