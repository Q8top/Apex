#!/usr/bin/env node
import fs from 'node:fs';
const demo=fs.readFileSync('src/js/sweet-demo.js','utf8');
const css=fs.readFileSync('src/css/sweet-demo.css','utf8');
const html=fs.readFileSync('sweet-demo.html','utf8');
const checks=[
 ['Web Audio',/AudioContext|webkitAudioContext/.test(demo)],
 ['Haptic feedback',/navigator\.vibrate/.test(demo)],
 ['Particle FX',/requestAnimationFrame|fx-canvas/.test(demo)&&/game-fx/.test(css)],
 ['Tumble drop animation',/animateDrop|dropIn/.test(demo)&&/dropIn/.test(css)],
 ['Win tiers',/is-epic|is-super|is-mega|is-big/.test(css)&&/tierClass/.test(demo)],
 ['Free Spins overlay',/animateFreeSpins|game-overlay/.test(demo)&&/game-overlay/.test(html)],
 ['Replay',/normalizeReplay|data-replay|replayItem/.test(demo)],
 ['Offline/online handling',/addEventListener\('offline'|addEventListener\('online'/.test(demo)],
 ['Localization',/LANG_KEY|state\.lang|text=/.test(demo)&&/game-lang/.test(html)],
 ['Reduced motion',/prefers-reduced-motion/.test(css)&&/prefers-reduced-motion/.test(demo)],
 ['Mobile touch',/pointer:coarse|touch-action/.test(css)],
 ['No Math.random',!demo.includes('Math.random')],
 ['No eval/new Function',!(/\beval\s*\(|\bnew Function\s*\(/.test(demo))]
];
let fail=0;for(const [n,ok] of checks){console.log(`${ok?'✓':'✗'} ${n}`);if(!ok)fail++}if(fail)process.exit(1);console.log(`ALL FINAL FEATURE CHECKS PASSED (${checks.length})`);
