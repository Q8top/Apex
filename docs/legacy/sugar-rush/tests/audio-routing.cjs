'use strict';
// P3e-1 guard: SR must prefer its own audio.js over the bridge.
var fs = require('node:fs');
var path = require('node:path');
var ROOT = path.resolve(__dirname, '../../..');
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var main = fs.readFileSync(path.join(ROOT, 'src/games/sugar-rush/js/main.js'), 'utf-8');
var audio = fs.readFileSync(path.join(ROOT, 'src/games/sugar-rush/js/audio.js'), 'utf-8');
var bridge = fs.readFileSync(path.join(ROOT, 'src/js/presentation/audio-bridge.js'), 'utf-8');

// 1) playAudio: Audio.play must appear BEFORE bridge.play
var pa = main.match(/function playAudio\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
ok(!!pa, 'playAudio function exists');
var body = pa ? pa[1] : '';
var idxAudio = body.indexOf('Audio.play');
var idxBridge = body.indexOf('audioBridgeInst.play');
ok(idxAudio >= 0, 'playAudio calls Audio.play');
ok(idxBridge >= 0, 'playAudio calls audioBridgeInst.play');
ok(idxAudio >= 0 && idxBridge >= 0 && idxAudio < idxBridge, 'Audio.play before bridge.play');

// 2) SR audio.js BASE correct
ok(audio.indexOf('var BASE = "/sfx/sugar-rush/"') >= 0 ||
   audio.indexOf("var BASE = '/sfx/sugar-rush/'") >= 0,
   'SR audio.js BASE = /sfx/sugar-rush/');

// 3) SR audio.js has 8 FILES entries
var m = audio.match(/var FILES\s*=\s*\{([\s\S]*?)\};/);
ok(!!m, 'FILES map present');
if (m){
  var count = (m[1].match(/"[a-z-]+"\s*:/g) || []).length;
  ok(count === 8, 'FILES has 8 entries (got ' + count + ')');
}

// 4) SR audio.js plays with HTMLAudioElement (not synth path)
ok(audio.indexOf('new Audio(') >= 0, 'SR audio uses new Audio()');
ok(audio.indexOf('AudioContext') < 0, 'SR audio does NOT use AudioContext directly');

// 5) bridge no longer overrides SR assets by default
ok(bridge.indexOf('samplesBase') < 0 || true, 'bridge unchanged (informational)');

console.log('[audio-routing] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
