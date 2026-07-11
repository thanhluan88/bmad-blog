# Contract

## Column P

| Item | Value |
|------|--------|
| File | `all_questions_flat 1.csv` (repo root) |
| Column | **P** — `explanation_text` |
| Role | Lane 1 (**solution**) + correct key; seeds RAG — not pmbok scenario |

`sourceSolution` = raw column P (audit card below triad).

---

## Store fields

| Field | Source | UI (under Why this answer) |
|-------|--------|----------------------------|
| `whySolutionBullets[]` | Column P why-correct | **1. Reference solution** |
| `whyPmbokBullets[]` / `whyBullets[]` | PMBOK chain — [REASONING.md](REASONING.md) | **2. PMBOK 8 reasoning** |
| `whyWebBullets[]` | [WEB.md](WEB.md) | **3. Supplementary reasoning (web)** |
| `whyWebSources[]` | Web search (optional) | Sources footnote |
| `sourceSolution` | Column P raw | Source solution card |
| `signalPhrases` + `signalAnswer` | Signal prompt | Signal card |
| `excludeReasons` | Column P exclude | Exclude other options |
| `guideHits[]` | RAG step 3 | Guide citation |

Legacy: `whyBullets` = `whyPmbokBullets` when latter absent.

---

## Lesson layout (`#analysis`)

Signal → **why triad** + exclude (adjacent) → answer → Guide → source solution

| Subsection | Rule |
|------------|------|
| 1. Reference solution | 1–2 bullets from column P why-correct |
| 2. PMBOK 8 reasoning | Chain + **bridge** — [WHY.md](WHY.md) |
| 3. Supplementary (web) | 1–2 bullets + sources; omit if empty (full bank) |
| Exclude | Every wrong key; English |

---

## Sync

Teach `#analysis` triad = quiz `#result-{id}` why block.

---

## Validation

- [ ] `sourceSolution` when CSV matched
- [ ] **Triad:** solution + pmbok lanes — [WHY.md#audit-triad](WHY.md#audit-triad)
- [ ] pmbok: **bridge** + **fit** — [REASONING.md#audit](REASONING.md#audit)
- [ ] web lane filled (single ID hand-work) or intentionally omitted (full bank)
- [ ] Signal: 2–5 keywords + English `signalAnswer`
- [ ] Exclude: every wrong key
- [ ] `validateTeachGrounding()` passes
- [ ] Quiz matches teach

Never `--allow-incomplete` for publish.

---

## Engine

`scripts/lib/`: `pmp-csv-solutions.js`, `pmp-csv-solution-grounding.js`, `bootstrap-teach-signals.js`, `pmp-teach-colocation-style.js`, `pmp-teach-signals-store.js`, `pmp-pmbok8-rag-pages.js`, `generate-pmp-full-teach-lessons.js`, `generate-pmp-full-from-teach.js`.
