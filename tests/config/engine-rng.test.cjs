'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;
require(ROOT + '/src/engine/errors.js');
require(ROOT + '/src/engine/grid.js');
require(ROOT + '/src/engine/rng.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var RNG = globalThis.window.ApexEngineRng;
var E = globalThis.window.ApexEngineErrors;

// mount
t('mounted', !!RNG);
t('outer frozen', Object.isFrozen(RNG));
t('randomInt is fn', typeof RNG.randomInt === 'function');
t('Rng is fn', typeof RNG.Rng === 'function');
t('MAX_RANGE = 2^32-1', RNG.MAX_RANGE === 0xFFFFFFFF);

// randomInt valid
t('randomInt(1) = 0', RNG.randomInt(1) === 0);
var r1 = RNG.randomInt(100);
t('randomInt(100) in [0,100)', r1 >= 0 && r1 < 100, 'got ' + r1);
var r2 = RNG.randomInt(0xFFFFFFFF);
t('randomInt(2^32-1) in range', r2 >= 0 && r2 < 0xFFFFFFFF);

// randomInt rejected
var badMax = [0, -1, -100, 1.5, '100', null, undefined, NaN, Infinity, 0x100000000, 0x100000001, Number.MAX_SAFE_INTEGER];
badMax.forEach(function(m){
  var ok = false;
  try { RNG.randomInt(m); } catch (e) {
    ok = (e.name === 'ApexError' && e.code === E.CODES.INVALID_MAX);
  }
  t('randomInt rejects ' + String(m), ok);
});

// Rng construction valid
var rngA = new RNG.Rng({ a: 1, b: 2 });
t('Rng constructs', !!rngA);
t('instance frozen', Object.isFrozen(rngA));
t('entries frozen array', Object.isFrozen(rngA.entries));
t('entry tuple frozen', Object.isFrozen(rngA.entries[0]));
t('totalWeight = 3', rngA.totalWeight === 3, 'got ' + rngA.totalWeight);

// Rng construction rejected
var badWeights = [null, undefined, 42, 'abc', {}, { a: 0 }, { a: -1 }, { a: 1.5 }, { a: 'x' }, { a: NaN }, { a: 1, b: 0 }];
badWeights.forEach(function(w, i){
  var ok = false;
  try { new RNG.Rng(w); } catch (e) {
    ok = (e.name === 'ApexError' && e.code === E.CODES.INVALID_WEIGHTS);
  }
  t('Rng rejects bad weights #' + i, ok);
});

// tamper resistance
var tamperFailed = false;
try { rngA.totalWeight = 0; } catch (e) { tamperFailed = true; }
t('totalWeight tamper blocked', tamperFailed || rngA.totalWeight === 3, 'got ' + rngA.totalWeight);
t('entries push blocked', (function(){
  var threw = false;
  try { rngA.entries.push(['x', 1]); } catch (e) { threw = true; }
  return threw || rngA.entries.length === 2;
})());

// pickSymbol distribution (10k draws, weights 1:3)
var rngD = new RNG.Rng({ a: 1, b: 3 });
var cnt = { a: 0, b: 0 };
for (var i = 0; i < 10000; i++) cnt[rngD.pickSymbol()]++;
var ratioA = cnt.a / 10000;
var ratioB = cnt.b / 10000;
t('pickSymbol a ~0.25 (+/-0.03)', Math.abs(ratioA - 0.25) < 0.03, 'got ' + ratioA.toFixed(3));
t('pickSymbol b ~0.75 (+/-0.03)', Math.abs(ratioB - 0.75) < 0.03, 'got ' + ratioB.toFixed(3));
t('pickSymbol total = 10000', cnt.a + cnt.b === 10000);

// pickSymbol all-in-one branch
var rngOnly = new RNG.Rng({ only: 5 });
var onlyOk = true;
for (var k = 0; k < 100; k++) if (rngOnly.pickSymbol() !== 'only') onlyOk = false;
t('single-symbol always picked', onlyOk);

// generateGrid
var grid = rngD.generateGrid();
t('generateGrid returns array', Array.isArray(grid));
t('generateGrid size = 30', grid.length === 30, 'got ' + grid.length);
var allInRange = grid.every(function(s){ return s === 'a' || s === 'b'; });
t('generateGrid all valid symbols', allInRange);

// generateGrid without ApexEngineGrid
var savedGrid = globalThis.window.ApexEngineGrid;
delete globalThis.window.ApexEngineGrid;
var gridThrew = false;
try { rngD.generateGrid(); } catch (e) {
  gridThrew = (e.name === 'ApexError' && e.code === E.CODES.INVALID_GRID_SIZE);
}
t('generateGrid throws INVALID_GRID_SIZE when grid missing', gridThrew);
globalThis.window.ApexEngineGrid = savedGrid;

// mirror byte-identical
var s1 = fs.readFileSync(ROOT + '/src/engine/rng.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_engine/rng.js', 'utf8');
t('mirror byte-identical', s1 === s2);

// comments
t('comment documents crypto source', s1.indexOf('crypto.getRandomValues') !== -1);
t('comment documents rejection sampling', s1.indexOf('rejection sampling') !== -1);
t('comment documents 2^32 boundary', s1.indexOf('2^32') !== -1 || s1.indexOf('MAX_RANGE') !== -1);

// source: no Math.random in code (comments may mention it defensively)
var codeOnly = s1.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
t('source: no Math.random in code', codeOnly.indexOf('Math.random') === -1);

console.log('');
console.log('========== engine/rng ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
