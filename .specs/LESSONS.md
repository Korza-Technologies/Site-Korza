# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — When two fixed elements share a screen corner, assert they do not overlap in every state where both are visible, not only on the first screen
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `e2e-visual` · harmful: 0
- features: lp-fundacao
- evidence: validation.md M8 (styles/components.css .sticky-cta padding-left) (e2e-visual)
- last seen: 2026-10-21T15:24:47Z

### L-002 — When an AC says any width, enumerate the viewport matrix the test must cover in the spec
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: lp-fundacao
- evidence: VIS-04 tests/e2e/visual.spec.js:61 (spec)
- last seen: 2026-10-21T15:24:47Z

### L-003 — When an AC depends on a known name, define the list of known names in the spec so the assertion is exact
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: lp-fundacao
- evidence: A11Y-07 tests/e2e/text-a11y.spec.js:24 (spec)
- last seen: 2026-10-21T15:24:47Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
