'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/engine/errors.js');
require(ROOT + '/src/engine/grid.js');
require(ROOT + '/src/engine/multiplier.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var M = globalThis.window.ApexEngineMultiplier;
var E = globalThis.window.ApexEngineErrors;

t('mounted', !!M);
t('outer frozen', Object.isFrozen(M));
t('MultiplierState is fn', typeof M.MultiplierState === 'function');

// basic
var ms = new M.MultiplierState();
t('initial total=0', ms.total() === 0);
t('initial size=0', ms.size() === 0);
t('initial snapshot=[]', Array.isArray(ms.snapshot()) && ms.snapshot().length === 0);

ms.add(3, 5);
t('add(3,5) total=5', ms.total() === 5);
t('add(3,5) size=1', ms.size() === 1);
ms.add(3, 100);
t('same pos overwrite total=100', ms.total() === 100);
t('same pos size stays 1', ms.size() === 1);
ms.add(7, 2);
t('second pos total=102', ms.total() === 102);
t('two positions size=2', ms.size() === 2);

// snapshot
var snap = ms.snapshot();
t('snapshot len=2', snap.length === 2);
t('snapshot entries have position+value', snap.every(function(x){ return typeof x.position === 'number' && typeof x.value === 'number'; }));
var snapSum = snap.reduce(function(a,x){ return a + x.value; }, 0);
t('snapshot sum = total', snapSum === ms.total());

// clear
ms.clear();
t('clear total=0', ms.total() === 0);
t('clear size=0', ms.size() === 0);

// rejected: negative position
var negThrew = false;
try { ms.add(-1, 2); } catch (e) { negThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(-1, 2) throws', negThrew);

// rejected: zero / negative value
var zeroThrew = false;
try { ms.add(0, 0); } catch (e) { zeroThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(0, 0) throws', zeroThrew);
var negValThrew = false;
try { ms.add(0, -1); } catch (e) { negValThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(0, -1) throws', negValThrew);

// rejected: non-integer position
var nonIntThrew = false;
try { ms.add(1.5, 2); } catch (e) { nonIntThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(1.5, 2) throws', nonIntThrew);

// rejected: NaN / Infinity value
var nanThrew = false;
try { ms.add(0, NaN); } catch (e) { nanThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(0, NaN) throws', nanThrew);
var infThrew = false;
try { ms.add(0, Infinity); } catch (e) { infThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(0, Infinity) throws', infThrew);

// NEW: position >= grid.size rejected (grid loaded in this test)
var grid = globalThis.window.ApexEngineGrid;
var gridSize = grid.GRID.size;
t('grid size 30', gridSize === 30);
var oobThrew = false;
try { ms.add(gridSize, 5); } catch (e) { oobThrew = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(30, 5) throws (oob)', oobThrew);
var oobThrew2 = false;
try { ms.add(gridSize + 100, 5); } catch (e) { oobThrew2 = (e.code === E.CODES.INVALID_MULTIPLIER); }
t('add(130, 5) throws', oobThrew2);
ms.add(gridSize - 1, 5);
t('add(29, 5) works (last valid)', ms.total() === 5);

// snapshot insertion order
var ms2 = new M.MultiplierState();
ms2.add(5, 1);
ms2.add(2, 2);
ms2.add(8, 3);
var s2 = ms2.snapshot();
t('snapshot preserves insertion order', s2[0].position === 5 && s2[1].position === 2 && s2[2].position === 8);
t('total sums all', ms2.total() === 6);

// mirror byte-identical
var s1 = fs.readFileSync(ROOT + '/src/engine/multiplier.js', 'utf8');
var s2f = fs.readFileSync(ROOT + '/functions/_engine/multiplier.js', 'utf8');
t('mirror byte-identical', s1 === s2f);

// comment markers
t('comment documents test-only', s1.indexOf('TEST') !== -1 && s1.indexOf('PRODUCTION') !== -1);
t('comment documents SR relation', s1.indexOf('sugar-rush') !== -1);

console.log('');
console.log('========== engine/multiplier ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
