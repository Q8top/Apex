# Engine Duplication: Why Sweet and Sugar Rush Stay Separate

Status: DECISION (P2-1)
Date:   2026-10-10

## Context

The construction sheet (P2-1) proposed extracting a shared
kernel from the two game engines. We ran a structural audit
first and decided NOT to do this.

## Audit Results

Nine engine files, line-set overlap ratio:

| file | overlap | verdict |
|---|---|---|
| errors.js | 42% | not worth |
| grid.js | 64% | constants differ (30 vs 49) |
| rng.js | 82% | namespace only |
| payout.js | 84% | ROUND vs FLOOR (money path) |
| multiplier.js | 19% | fundamentally different |
| evaluator.js | 30% | pay-anywhere vs cluster |
| tumble.js | 67% | namespace only |
| bonus.js | 50% | rule structure differs |
| game-engine.js | 4% | different architecture |

Zero files are byte-identical.

## Why We Skip

1. Trigger condition not met. The classic reason to extract
   a shared kernel is 3+ engines with >90% overlap. We have
   2 engines, max 84%, and even that 84% has a real
   semantic difference (payout uses Math.round in Sweet but
   Math.floor in SR; rounding policy is money-path and
   cannot be silently unified).

2. Physical isolation is already a project principle.
   See the audit package: each game owns its engine so a
   compromise in one cannot affect the other.

3. Cost / benefit. Extraction would touch 6+ files, two
   test loaders (_loader.cjs, redline-gate.cjs), and the
   config-sync script. Risk of silent regression > value
   of saving ~200 lines.

## When To Revisit

Reconsider if ANY of these become true:

- A third game engine is added with >90% overlap to SR
- A security fix is needed in rng.js / grid.js / errors.js
  that must apply to both engines
- A monorepo tool (pnpm workspaces, turbo) is introduced

## Future Sync Policy

Until then, when patching shared logic (rng, grid, tumble,
errors), apply the same edit to both copies and run:

```
bash scripts/syntax-check.sh
node tests/engine/all.test.cjs
node tests/games/sugar-rush/run-all.cjs
```

The two engines are siblings, not duplicates.

