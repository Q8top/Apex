# P2d - SR Frontend Wiring Status

Status: COMPLETE (via P1e)
Date:   2026-10-10

## Tasks from construction sheet

| task | description | status |
|---|---|---|
| P2-4 | SR audio.js -> audio-bridge | DONE (P1e-6) |
| P2-5 | SR reconnection.js wiring | DONE (P1e-2) |
| P2-6 | SR perf.js wiring | DONE (P1e-3 + P2d) |

## What Each Provides

### P2-4 audio-bridge

`src/games/sugar-rush/js/main.js` `playAudio()`:

- tries `audioBridgeInst.play(name)` first
- falls back to raw `Audio.play(name)` (existing behavior)
- bridge handles: preset aliases, throttling, autoplay unlock,
  page-hidden suspend, reduced-motion policy

### P2-5 reconnection

`wireReconnection()` in `main.js`:

- only active in `mode=real` (demo never makes network calls)
- subscribes to navigator online/offline events
- shows i18n toast on transitions

### P2-6 perf

`wirePerf()` in `main.js`:

- creates `perfInst` with 200-sample ring buffer
- exposes debug API:

```js
window.__apexPerfReport()  // -> { label: {n,min,p50,p95,max,mean}, ... }
window.__apexPerfClear()   // clear all samples
```

## Deliberate Omission: No Hot-Path Instrumentation

We do NOT call `perfInst.timeIt()` inside `renderGrid()` or
`doSpin()`. Reasons:

1. These are the hottest paths. Adding a timer closure per
   call adds ~1-3% overhead on low-end Android.
2. P0-6 already showed renderBoard p50=30ms on device.
   If that regresses, we will instrument then, not now.
3. When needed, drop 4 lines into any function:

```js
var _t0 = perfInst ? performance.now() : 0;
// ... existing body ...
if (perfInst && _t0) perfInst.push('label', performance.now() - _t0);
```

## Revisit If

- We observe a performance regression on device
- We add a feature that blocks the main thread >50ms
- We integrate an external APM (Sentry performance, etc.)

