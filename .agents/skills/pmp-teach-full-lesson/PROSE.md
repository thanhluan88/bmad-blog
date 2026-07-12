# Prose — RAG excerpts & chain writing

**Leading words:** **prose** (grammatical sentences), **bridge** (why PMBOK → this answer).

Column P sets **correct key** and PM action — not scenario text.

---

## Plain Vietnamese (dễ hiểu)

Every lesson and quiz sync must include **Giải thích dễ hiểu** before the English triad:

| Block | Content |
|-------|---------|
| Tình huống | Stem conflict in plain Vietnamese |
| Đáp án đúng | Key + short option text |
| Vì sao | PM rationale from `buildSpecificCorrectRationale` |
| Lưu ý | FIRST/NEXT when stem asks priority |
| PMBOK 8 | Process + principle + page |
| Loại trừ | Wrong keys — Vietnamese via `inferWrongReason` |

Engine: `scripts/lib/pmp-teach-plain-vi.js` → `buildPlainViCard()` in HTML; `**Giải thích dễ hiểu**` in quiz markdown.

English triad stays for reference — label **Chi tiết tiếng Anh**.

---

## RAG excerpt (Guide hit)

Pick or rewrite until excerpt is **prose** and **fits** the stem ([REASONING.md#bridge](REASONING.md#bridge)):

| Rule | Check |
|------|-------|
| Complete sentence | Capital start; ends `.` `?` `!` |
| Concise | 1–2 sentences in chain bullet |
| **Fit** | Closest PMBOK idea to stem — not same-domain decoration |
| Clean | No `Licensed To`, `Figure 2-`, list stubs, fragments |

**If raw chunk fails:** nearest full sentence or tight paraphrase — keep `page` + `topic`.

**Reject → re-query** (iterate round 2): fragment, wrong domain, or excerpt that cannot support a **bridge**.

---

## Chain bullets (whyBullets)

Three bullets, English, PM voice.

### Bullet 1 — Scenario (stem only)

The **question situation** — facts, actors, conflict or misconception.

**Pattern:** `Scenario: {one complete stem sentence}.`

Include the tension when present (e.g. SME fears teamwork hurts quality).

### Bullet 2 — PMBOK + bridge (required)

**Pattern:** `PMBOK 8, p. {page} ({topic}): {prose excerpt} — {bridge}.`

**Bridge** = because / since / so the PMBOK idea applies to **this** stem and implies **this** PM action. Never a naked quote.

### Bullet 3 — Therefore

**Pattern:** `Therefore {correctKey} is correct: {PM action — one sentence}.`

---

## PM role gate

Read as a PM explaining to a peer:

1. Does bullet 1 match the stem conflict?
2. Does bullet 2 **argue** (not just cite) why PMBOK supports the answer?
3. Does bullet 3 state the best PM action per column P?

Any fail → **iterate** (re-RAG for **fit**, rewrite **bridge**). Max 3 rounds.

---

## Exclude prose

One complete English sentence per wrong key. Prefer column P exclude verbatim.
