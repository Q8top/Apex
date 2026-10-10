# P2f - Misc Items (P2-8 / P2-9 / P2-10)

Status: ASSESSED, NO CODE CHANGE NEEDED
Date:   2026-10-10

## P2-8: SR skip / fast-mode unification

Construction sheet suggested merging `skipRequested` and
`fastMode` into one concept. Audit shows they are
orthogonal:

| flag | scope | set by | effect |
|---|---|---|---|
| `fastMode` | persistent | user toggle button | shrinks ALL delays (stagger 16->8, base 200->120) |
| `skipRequested` | single spin | user clicks Skip during a long chain | forces `delay()` to cap at 30ms until spin ends |

Interaction is correct: in fast mode, Skip still pushes
the current spin to its minimum. In normal mode, Skip
accelerates only the current spin. Both can be active.

Action: add code comment only (done).

## P2-9: BigInt server vs client precision

Server (`functions/api/game/sugar-rush-spin.js`):

```js
const theoreticalWinMinor = spinResult.winMinor;
```

The server does NOT recompute the win. It trusts the
engine value. The engine (`spinBase` / `spinFree`) computes:

```js
var winMinor = Math.floor(betMinor * totalMult);
```

Client (demo path) goes through the same engine, same
expression. There is exactly one win-calculation site.

Action: none needed.

## P2-10: result_json payload size

Server calls `spinBase(mode, bet)` and
`spinFree(mode, bet, {marks})` WITHOUT `{detail: true}`.
The `detail` block (cascades + per-step grid snapshots)
is therefore absent from `result_json`.

What IS stored per spin:

- `finalGrid`: 49 symbol ids (necessary for client replay)
- `cascades`: integer
- `scatterCount`: integer
- `marksAfter`: array of [pos, value] pairs (FS only)
- Misc numeric fields

Estimated payload: ~400-700 bytes JSON per spin.

Single-char index optimization would save ~60% -> ~250
bytes. D1 storage cost at 10M spins:

- Current: ~6 GB
- Optimized: ~2.5 GB

At D1 pricing (first 5 GB free, then ~$0.75/GB/mo), this
saves <$3/mo at 10M spins. The migration cost (write
decoder, backfill 10M rows, version field, dual-read
window) is not justified.

Action: none needed until storage cost becomes material.

## Revisit If

- D1 storage becomes a material line item (> $50/mo)
- We add a second gameplay mode that needs raw cascades
  in the persisted result (then detail must be stored)
- We introduce per-spin analytics that need the full
  grid history

