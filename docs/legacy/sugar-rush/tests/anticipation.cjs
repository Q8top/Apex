'use strict';
// G3-2 guard: anticipation must be wired correctly.
var fs = require('node:fs');
var path = require('node:path');
var ROOT = path.resolve(__dirname, '../../..');
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var main = fs.readFileSync(
  path.join(ROOT, 'src/games/sugar-rush/js/main.js'), 'utf-8');
var ant = fs.readFileSync(
  path.join(ROOT, 'src/js/presentation/anticipation.js'), 'utf-8');
var html = fs.readFileSync(
  path.join(ROOT, 'sugar-rush.html'), 'utf-8');
var synth = fs.readFileSync(
  path.join(ROOT, 'src/js/presentation/audio-synth.js'), 'utf-8');
var css = fs.readFileSync(
  path.join(ROOT, 'src/games/sugar-rush/css/game.css'), 'utf-8');

// 1) module exists and exports the API
ok(ant.indexOf('shouldAnticipate') >= 0, 'module exports shouldAnticipate');
ok(ant.indexOf('function play') >= 0, 'module exports play');
ok(ant.indexOf('function cancel') >= 0, 'module exports cancel');

// 2) module loaded before main.js in HTML
var iAnt = html.indexOf('anticipation.js');
var iMain = html.indexOf('sugar-rush/js/main.js');
ok(iAnt > 0, 'anticipation.js referenced in HTML');
ok(iMain > iAnt, 'anticipation.js loaded before main.js');

// 3) main.js wires anticipation into demo spin
ok(main.indexOf('ApexAnticipation.shouldAnticipate') >= 0,
   'main.js calls shouldAnticipate');
ok(main.indexOf('ApexAnticipation.play') >= 0,
   'main.js calls play');
ok(main.indexOf('ApexAnticipation.cancel') >= 0,
   'main.js calls cancel on spin start');

// 4) audio preset registered
ok(synth.indexOf("'anticipation'") >= 0,
   'synth has anticipation preset');

// 5) CSS class defined
ok(css.indexOf('srAnticipation') >= 0,
   'CSS has srAnticipation keyframes');
ok(css.indexOf('.sr-sym.is-anticipation') >= 0,
   'CSS has is-anticipation rule');

// 6) fast mode compression present (600 vs 1200)
ok(main.indexOf('state.fastMode ? 600 : 1200') >= 0,
   'fast mode halves duration');

console.log('[anticipation] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
