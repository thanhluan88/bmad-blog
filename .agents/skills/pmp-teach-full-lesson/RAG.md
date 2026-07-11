# RAG — 3 Guide hits

`rag-local-pmp` — `search_docs` only. Never `ask_docs`.

Step 3 of [SKILL.md](SKILL.md). Hits must **fit** the stem and support a **bridge** — [REASONING.md#bridge](REASONING.md#bridge).

## Query

**Round 1:** column P why-correct — process, artifact, principle, correct-option verb.

**Round 2 (fit fail):** re-query from **stem scenario** — actors, conflict, misconception, correct-action verbs.  
Example: SME + agile + quality fear → `Agile continuous feedback early feedback teamwork collaboration`.

Avoid: bare domain labels (`Performance Domain Resources`), overview pages, diagram chunks.

## Pick 3

1. **Fit** — closest PMBOK idea to stem conflict (not same-domain decoration)
2. **Prose** — complete sentence(s), grammatical, concise
3. Distinct printed `page`

Reject: fragments, `Licensed To`, `Figure 2-`, hits that cannot support a **bridge**.

**Primary hit (`guideHits[0]`):** best **fit** for stem → answer. Cited in bullet 2 with **bridge**.

## Iterate tie-in

| Fail | Action |
|------|--------|
| Naked quote — excerpt true but unrelated to stem | Re-RAG stem terms; swap primary hit |
| Wrong domain | New query from stem nouns + correct action |
| Fragment | Trim to full sentence or paraphrase |

## Done when

- ≥1 hit with printed `page` + prose excerpt (target 3)
- Primary hit supports an explicit **bridge** from stem to correct action
