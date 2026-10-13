# M6 Known Defects - UI rules panel vs engine authority

Date: 2026-10-13
Status: RESOLVED in Stage 6 batch A (2026-10-13)
Authority: src/config/paytable.locked.js + src/engine/bonus.js

## Confirmed authoritative values

- MIN_MATCH = 5 (paytable.locked.js:50, also asserted by paytable-locked.test.cjs)
- Cluster tiers = [5, 6, 8, 10, 12, 15] (all 9 regular symbols)
- Bomb values = [2, 3, 5, 8, 10, 15, 20, 25, 50, 100] (bonus.js BOMB_VALUE_DIST)
- Bet options = [0.20, 0.50, 1, 2, 5, 10, 20, 50, 100] (sweet-demo.js BET_OPTIONS)

## Fixed in M6 (2026-10-13)

- src/js/ui/sweet-rules.js rule text: "8 or more" -> "5 or more".
  This was a direct rule misstatement (players were told 8, engine pays at 5).

## Resolved in Stage 6 batch A (2026-10-13)

The four items below were fixed; the xfail() assertions in
tests/config/paytable-ui-consistency.test.cjs have been promoted
to positive t() assertions.

1. sweet-rules.js reads window.ApexPaytable (old table with MIN_MATCH=8,
   tiers [8,10,12]) instead of window.ApexPaytableLocked.
   Impact: paytable shown to player uses wrong tiers; engine settles at 5/6/15.

2. sweet-rules.js paytable header has 5 columns (8 / 9 / 10 / 11 / 12+)
   instead of 6 engine tiers (5 / 6 / 8 / 10 / 12 / 15).

3. sweet-rules.js note says "8~9 same tier, 10~11 same tier, 12+ top"
   - wrong for engine which uses 5/6/8/10/12/15 as separate tiers.

4. sweet-rules.js renders only t[8], t[10], t[12] cells
   - engine has t[5], t[6], t[8], t[10], t[12], t[15].

## Not defects (verified consistent)

- Bomb tier list in rules panel matches BOMB_VALUE_DIST.
- Bet tier list in rules panel matches BET_OPTIONS.

## Out of scope for M6

- docs/math/theory.md:114 states ">= 8" - documentation drift,
  tracked separately as docs cleanup (Stage 6).
- src/engine/evaluator.js:85 fallback constant 8 - only fires if
  ApexPaytableLocked failed to load; documented but not defect.

## Related

- tests/config/paytable-locked.test.cjs
- tests/config/paytable-ui-consistency.test.cjs
- Construction doc v6.0 section P1-M6
