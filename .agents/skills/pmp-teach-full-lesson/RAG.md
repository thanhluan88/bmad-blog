# RAG — 3 Guide hits

Skill **`rag-local-pmp`** — MCP `search_docs` only. **Never** `ask_docs`.

Step 3 of [SKILL.md](SKILL.md): after column P loaded, before grounding JSON.

## Query

Build from **solution why-correct** + correct option text — not stem-only domain labels.

Include when present: PMBOK **process**, **artifact**, **principle**, key verb from correct option (first 80 chars).

Avoid: bare `Performance Domain Stakeholders`, `Processes Overview`, diagram-only pages.

Engine: `buildGuideRagQuery()` in `scripts/lib/pmp-pmbok8-rag-pages.js`.

## MCP call

```
search_docs(
  query = "<process> <artifact> <principle keywords>",
  top_k = 8,
  collection = "pmp-docs"
)
```

Pick **3** chunks:

1. Relevance to query + complete sentences
2. **Distinct** printed `page` (metadata `page` = PMBOK8 printed page)
3. Reject: `Licensed To`, `Figure 2-`, mid-sentence fragments, overview boilerplate

## Citation

Cite **`PMBOK 8, p. {page}`** + quoted excerpt. Do not cite `file_page`.

Store shape: [CONTRACT.md#store-fields](CONTRACT.md#store-fields).

## Agent vs bootstrap

| Branch | Method |
|--------|--------|
| Single ID | MCP `search_docs` via `rag-local-pmp` |
| Full bank | `node scripts/bootstrap-pmp-teach-signals.js` — `lookupGuideHits()` |

After store update: lesson regen + quiz sync ([SKILL.md](SKILL.md) steps 6–7).

## Done when

- 3 hits when quality chunks exist (else ≥1 documented)
- Each hit: printed `page` + complete-sentence excerpt
- Topics align with `whyBullets` process/artifact
