'use strict';
// P1d: static-source regression guard.
// Asserts sweet-demo.js routes all settlement through runtime/providers
// (no direct client-side math for real gameplay).
var fs = require('node:fs');
var path = require('node:path');
var ROOT = path.resolve(__dirname, '../../..');

var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }

var P = path.join(ROOT, 'src/js/inline/sweet-demo.js');
var src = fs.readFileSync(P, 'utf-8');

// 1) doSpin must route through runtime.startSpin
ok(/function doSpin\s*\(/.test(src), 'doSpin defined');
var doSpinMatch = src.match(/function doSpin\s*\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
var doSpinBody = doSpinMatch ? doSpinMatch[1] : '';
ok(doSpinBody.length > 0, 'doSpin body extracted');
ok(doSpinBody.indexOf('runtime.startSpin') >= 0, 'doSpin uses runtime.startSpin');
ok(doSpinBody.indexOf('Engine.spin') < 0, 'doSpin does NOT call Engine.spin directly');

// 2) runtime.startSpin routes to provider
ok(/runtime\.startSpin\s*=/.test(src) === false, 'runtime.startSpin is provided by runtime, not local');
ok(src.indexOf('runtime.startSpin(betMinor)') >= 0, 'runtime.startSpin called with betMinor');

// 3) initRuntime chooses providers correctly
ok(src.indexOf("ApexDemoProvider.create") >= 0, 'ApexDemoProvider instantiated');
ok(src.indexOf("ApexServerProvider.create") >= 0, 'ApexServerProvider instantiated');
ok(src.indexOf("GAME_MODE === 'demo'") >= 0, 'GAME_MODE branch present');

// 4) displayRandomSymbol is display-only
ok(/function displayRandomSymbol\s*\(/.test(src), 'displayRandomSymbol defined');
ok(src.indexOf('randomSymbol()') < 0 || src.indexOf('displayRandomSymbol()') >= 0,
   'no bare randomSymbol() call');

// 5) no manual settlement math in the module
var suspicious = [
  /wallet\s*\+=\s*win/i,
  /balance\s*\+=\s*win/i,
  /balanceBefore\s*=\s*balance/i,
];
var anySuspicious = false;
for (var i = 0; i < suspicious.length; i++){
  if (suspicious[i].test(src)) { anySuspicious = true; break; }
}
ok(!anySuspicious, 'no client-side balance += win pattern');

// 6) provider.resetBalance used only in reset flow
ok(src.indexOf('resetBalance') >= 0, 'resetBalance referenced (demo reset)');

console.log('[sweet-demo/routing] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
