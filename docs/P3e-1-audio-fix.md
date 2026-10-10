# P3e-1 - Audio Regression Fix

Status: FIXED
Date:   2026-10-10

## Bug

P1e-6 wired SR to prefer `ApexAudioBridge.play(name)` over
its own `Audio.play(name)`.

Chain after P1e-6:

```
playAudio('spin-start')
  -> audioBridgeInst.play('spin-start')
    -> ApexAudioSynth.play('spin-start')
      -> fetch('/sfx/spin-start.wav')     <-- Sweet asset
```

`audio-synth.js` has `SAMPLES_BASE = '/sfx/'` hard-coded.
SR's assets live in `sfx/sugar-rush/`. Result: SR never
used its own 8 WAV/OGG files. It used Sweet's, or fell
through to synth for names Sweet does not have.

## Fix

Reverse the order in `playAudio` (SR main.js):

```js
function playAudio(name){
  if (Audio && typeof Audio.play === 'function'){
    try { Audio.play(name); return; } catch (e) {}
  }
  if (audioBridgeInst && typeof audioBridgeInst.play === 'function'){
    try { audioBridgeInst.play(name); } catch (e) {}
  }
}
```

`Audio.play` (from `src/games/sugar-rush/js/audio.js`) has
`BASE = '/sfx/sugar-rush/'` and the correct FILES map with
both `.wav` and `.ogg` extensions. It is the authoritative
source for SR sounds.

`audio-bridge` is now only consulted when SR's own map
has no entry for `name`. This covers:

- `win-mega`, `win-super`, `win-epic`, `win-ultra` (synth only)
- `bonus` (synth only)
- `tumble` (synth only)

## Effect

| event | before | after |
|---|---|---|
| spin-start | Sweet 35 KB | **SR 206 KB** |
| tumble-land | Sweet 4.9 KB | **SR 5.9 KB** |
| ui-tap | Sweet 10 KB | **SR 4.9 KB** |
| scatter | 404 -> synth | **SR 12 KB** |
| fs-enter | Sweet 11 KB | **SR 18 KB** |
| multiplier | Sweet 11 KB | **SR 29 KB** |
| win-normal | Sweet 26 KB | **SR 29 KB** |
| win-big | Sweet 18 KB | **SR 9 KB** |
| win-mega+ | synth | synth (unchanged) |

## Regression Guard

`tests/games/sugar-rush/audio-routing.cjs` (new) asserts:

1. `playAudio` tries `Audio.play` first
2. `audioBridgeInst.play` appears only as fallback
3. `SR audio.js` has `BASE = '/sfx/sugar-rush/'`

## Root Cause

P1e-6 assumed the bridge could serve all games. It cannot:
the bridge loads via `audio-synth.js` which has a
single global `SAMPLES_BASE`. A future multi-game
bridge should accept per-call `samplesBase`, but that
is a larger change. For now each game owns its loader.

