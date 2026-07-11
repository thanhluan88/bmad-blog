# RAG — 3 Guide hits (rag-local-pmp)

Skill **`rag-local-pmp`** — MCP `search_docs` only. **Không** `ask_docs`.

## When

Step 3 of [SKILL.md](SKILL.md): after column P loaded, before grounding JSON.

## Query construction

Build from **solution why-correct** + correct option text — not stem-only domain labels.

Include (when present in solution):

- PMBOK **process** (Monitor Risks, Develop Team, Validate Scope…)
- **Artifact** (risk register, issue log, change request…)
- **Principle** (Lead accountably, Embed quality…)
- Key verb phrase from correct option (first 80 chars)

Avoid: `Performance Domain Stakeholders` alone, `Processes Overview`, diagram-only pages.

Engine mirror: `buildGuideRagQuery(q, analysis, storeEntry)` in `scripts/lib/pmp-pmbok8-rag-pages.js`.

## MCP call

```
search_docs(
  query = "<process> <artifact> <principle keywords>",
  top_k = 8,
  collection = "pmp-docs"
)
```

Pick **3** chunks:

1. Rank by relevance to query terms + complete sentences
2. **Distinct** printed `page` (metadata `page` = số trang in PMBOK8)
3. Reject: `Licensed To`, `Figure 2-`, mid-sentence fragments (`register.` start), overview boilerplate

## Store shape

```json
"guideHits": [
  {
    "page": 137,
    "topic": "Monitor Risks",
    "excerpt": "A risk register is a repository in which outputs of risk management processes are recorded.",
    "query": "Monitor Risks risk register identified risks"
  }
]
```

`guideQuote` = `guideHits[0].excerpt` · `guidePages` = `[guideHits[0].page]`

## Citation rule (PDF)

PMBOK PDF has no stable line numbers. Cite:

- **`PMBOK 8, tr. {page}`** — printed page from chunk metadata
- **Quoted excerpt** — verbatim from chunk (trimmed to full sentences via `formatGuideQuote`)

Do **not** cite `file_page` to readers.

## Agent vs bootstrap

| Mode | How |
|------|-----|
| **Agent hand-work** | MCP `search_docs` per [rag-local-pmp](~/.cursor/skills or user skill path) |
| **Bootstrap batch** | `node scripts/bootstrap-pmp-teach-signals.js` — uses `data/pmp-pmbok8-page-cache.json` + `lookupGuideHits()` |

After store update, regenerate teach + sync Kiểm tra (SKILL step 6–7).

## Completion

- [ ] Exactly 3 hits when RAG returns enough quality chunks (else ≥1 documented)
- [ ] Each hit: printed `page` + complete-sentence excerpt
- [ ] Topics align with `whyBullets` process/artifact (e.g. risk register → Monitor Risks)
- [ ] No `ask_docs`
