# Mission: Fix PMP wrong-answer patterns (luannt115)

## Why
Pass the PMP exam by converting recurring situational mistakes into fluent PMI judgment — especially Stakeholders/Governance/Resources in Executing — instead of memorizing Full Bank IDs.

## Success looks like
- Given a stem, name the trap in under 5 seconds (e.g. "resilience not eliminate-risk", "CR before absorb scope", "compliance > deadline pressure")
- On Sai:1 / LWA-hard items, choose the PMI action on first redrill
- Retake filter "Sai" on Full Bank until open wrong count trends to 0

## Constraints
- Study in Vietnamese + English exam stems
- Prefer short retrieval lessons over long theory dumps
- Ground answers in PMBOK® Guide 8th Edition and this repo's Full Bank explanations
- Three live signals:
  - `wrongAttempt > 0` / Sai:1 — still open wrong
  - `lastWrongAttempt ≥ 1` — lifetime wrongs (415 for current snapshot), sort LWA ↓
  - `attempts > 1` — historical multi-attempt (older lesson 0001)

## Out of scope
- Memorizing every Full Bank ID verbatim
- Forcing all history into exactly 8 patterns (rejected after review — use trap-specific taxonomy)
- Deep EVM arithmetic unless a cluster demands it
- Rewriting the question bank itself
