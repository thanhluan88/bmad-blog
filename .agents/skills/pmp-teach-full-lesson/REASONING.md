# Reasoning — chain, bridge & iterate

The lesson shows **why the correct answer follows from PMBOK 8** — not a naked quote. Each step must carry a **bridge**: the causal link a PM would state aloud.

See [PROSE.md](PROSE.md) for sentence rules.

## Chain

```
Scenario (stem) → PMBOK 8, p. {page} + bridge → therefore {correctKey}
```

| Link | Source |
|------|--------|
| Scenario | **Stem situation only** — [PROSE.md#bullet-1--scenario-stem-only](PROSE.md#bullet-1--scenario-stem-only) |
| PMBOK + **bridge** | Primary `guideHits[0]` — excerpt **plus** why it applies to this stem |
| Therefore | Correct key + PM action; matches column P |

### whyBullets shape (exactly 3 bullets)

```
1. Scenario: {stem situation — include conflict/misconception if present}
2. PMBOK 8, p. {page} ({topic}): {prose excerpt} — {bridge: because/since/so … this PMBOK idea → PM must …}
3. Therefore {correctKey} is correct: {PM action in one sentence}
```

**Bridge** is mandatory in bullet 2. A quote without bridge fails audit.

Page = RAG printed `page`, not `file_page`.

---

## Bridge

The reader must see **why** the PMBOK passage implies **this** answer for **this** stem.

| Pass | Fail |
|------|------|
| "Agile requires continuous feedback — so teamwork creates the loops that improve quality, answering the SME's concern" | "PMBOK says professional growth of the team." (no link to answer) |
| "Risk register captures identified risks — so undocumented risks must be entered immediately" | Excerpt about scope with no tie to risk action |

**Bridge pattern:** `{excerpt gist} — {because/so/since} {link from PMBOK idea to stem conflict} → {why correct action follows}.`

---

## Audit

Run after every chain draft. **All** must pass before step 6.

### Scenario & prose
- [ ] Bullet 1 is **stem scenario** — not correct option, not column P ([PROSE.md](PROSE.md))
- [ ] Every bullet is grammatical **prose**

### Bridge & fit
- [ ] Bullet 2 has explicit **bridge** — reader sees why PMBOK → this answer ([Bridge](#bridge))
- [ ] Cited page **fits** the argument — closest scenario match in PMBOK 8, not same-domain decoration
- [ ] **Naked quote** check: if removing bullet 2 excerpt still leaves bullet 3 plausible → bridge too weak → rewrite or re-RAG
- [ ] PMBOK bullet cites **PMBOK 8, p. {N}** where N = primary hit `page`

### Logic & key
- [ ] Conclusion names **correct key**
- [ ] Reader traces **stem → bridge → answer** with no gap
- [ ] Correct key agrees with column P / bank `q.correct`
- [ ] **PM role gate** passes ([PROSE.md#pm-role-gate](PROSE.md#pm-role-gate))

### Exclude
- [ ] `excludeReasons`: every wrong key; English prose

---

## Iterate

Repeat until audit passes — especially **fit** and **bridge**:

```
draft chain → audit → pass? → write store → step 6
                 ↓ fail (bridge | fit | prose)
         re-RAG from stem scenario terms → pick closest hit → rewrite bridge
                 ↓
              audit again
```

| Round | Action |
|-------|--------|
| 1 | Scenario from stem; PMBOK from `guideHits[0]`; draft **bridge** |
| 2 | **Fit fail** → re-RAG: stem nouns + correct-action verbs (not domain label only) |
| 3 | Swap primary hit; rewrite **bridge**; polish therefore |

**Stop:** audit passes.  
**Stop:** 3 rounds fail → do not publish; fix store manually.

Hand-work (single ID): full **iterate** loop until **bridge** + **fit** pass.  
Full bank: bootstrap seeds hits; fix weak bridge IDs by hand.

---

## Anti-patterns

| Bad | Good |
|-----|------|
| Naked PMBOK quote in bullet 2 | Excerpt + **bridge** to stem |
| p. 31 team growth; answer = agile feedback | Re-RAG → p. 76 continuous feedback; bridge SME quality fear |
| Scenario = answer text | Scenario = stem situation |
| Publish after 1 weak draft | **Iterate** until bridge + fit pass |
