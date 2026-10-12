'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/engine/errors.js');
require(ROOT + '/src/engine/grid.js');
require(ROOT + '/src/engine/tumble.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var T = globalThis.window.ApexEngineTumble;
var E = globalThis.window.ApexEngineErrors;

// fake rng with deterministic sequence
function fakeRng(seq){
  var i = 0;
  return { pickSymbol: function(){ var v = seq[i % seq.length]; i++; return v; } };
}

// mount
t('mounted', !!T);
t('frozen', Object.isFrozen(T));
t('3 fns', typeof T.tumble === 'function' && typeof T.removePositions === 'function' && typeof T.refillColumns === 'function');

// removePositions: basics
var g = [];
for (var i = 0; i < 30; i++) g.push('s' + (i % 5));
var g2 = T.removePositions(g, [0, 5, 29]);
t('removePositions: len 30', g2.length === 30);
t('removePositions: [0]=null', g2[0] === null);
t('removePositions: [5]=null', g2[5] === null);
t('removePositions: [29]=null', g2[29] === null);
t('removePositions: [1] unchanged', g2[1] === g[1]);
t('removePositions: copy not same ref', g2 !== g);
t('removePositions: original untouched', g[0] !== null);

// removePositions: dedup
var g3 = T.removePositions(g, [0, 0, 0, 5, 5]);
t('removePositions dedup: [0] null', g3[0] === null);
t('removePositions dedup: [5] null', g3[5] === null);
t('removePositions dedup: others ok', g3[1] === g[1] && g3[6] === g[6]);

// removePositions: empty positions
var g4 = T.removePositions(g, []);
t('removePositions empty: full copy', g4.length === 30 && g4.every(function(v,i){ return v === g[i]; }));
t('removePositions empty: not same ref', g4 !== g);

// removePositions: rejected
function threw(fn){ try { fn(); return false; } catch(e){ return e.name === 'ApexError'; } }
t('removePositions(null grid)', threw(function(){ T.removePositions(null, []); }));
t('removePositions(short grid)', threw(function(){ T.removePositions([1,2,3], []); }));
t('removePositions(null positions)', threw(function(){ T.removePositions(g, null); }));
t('removePositions(bad position -1)', threw(function(){ T.removePositions(g, [-1]); }));
t('removePositions(bad position 30)', threw(function(){ T.removePositions(g, [30]); }));
t('removePositions(1.5)', threw(function(){ T.removePositions(g, [1.5]); }));
t('removePositions(string pos)', threw(function(){ T.removePositions(g, ['5']); }));

// refillColumns: full-empty column
var empty = [];
for (var k = 0; k < 30; k++) empty.push(null);
var rng = fakeRng(['A','B','C','D','E']);
var filled = T.refillColumns(empty, rng);
t('refillColumns: no nulls left', filled.indexOf(null) === -1);
t('refillColumns: len 30', filled.length === 30);

// refillColumns: preserve existing bottom values
var bottomHeavy = [];
for (var k2 = 0; k2 < 30; k2++) bottomHeavy.push(null);
// col 0 (rows 0..4) = indices 0,6,12,18,24
// set rows 2,3,4 to X,Y,Z (indices 12,18,24)
bottomHeavy[12] = 'X';
bottomHeavy[18] = 'Y';
bottomHeavy[24] = 'Z';
var rng2 = fakeRng(['N1','N2']);
var refilled = T.refillColumns(bottomHeavy, rng2);
// after refill, col 0 should be: top=N1 bottom=N2, then Z,Y,X bottom-up preserved
t('refillColumns: idx 24=Z preserved', refilled[24] === 'Z');
t('refillColumns: idx 18=Y preserved', refilled[18] === 'Y');
t('refillColumns: idx 12=X preserved', refilled[12] === 'X');
t('refillColumns: idx 6 new fill', refilled[6] === 'N1' || refilled[6] === 'N2');
t('refillColumns: idx 0 new fill', refilled[0] === 'N1' || refilled[0] === 'N2');
t('refillColumns: no nulls in col0', refilled[0]!==null && refilled[6]!==null);

// refillColumns: rejected
t('refillColumns(null grid)', threw(function(){ T.refillColumns(null, fakeRng(['A'])); }));
t('refillColumns(short grid)', threw(function(){ T.refillColumns([1,2,3], fakeRng(['A'])); }));
t('refillColumns(null rng)', threw(function(){ T.refillColumns(empty, null); }));
t('refillColumns(rng no pickSymbol)', threw(function(){ T.refillColumns(empty, {}); }));

// tumble: basic
var t1 = T.tumble(bottomHeavy, [12, 18, 24], fakeRng(['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15','A16','A17','A18','A19','A20','A21','A22','A23','A24','A25','A26','A27','A28','A29','A30','A31','A32','A33','A34','A35','A36','A37','A38','A39','A40','A41','A42','A43','A44','A45']));
t('tumble: returns array len 30', Array.isArray(t1) && t1.length === 30);
t('tumble: no nulls', t1.indexOf(null) === -1);

// tumble: empty positions rejected
t('tumble(empty positions) throws', threw(function(){ T.tumble(empty, [], fakeRng(['A'])); }));

// mirror
var s1 = fs.readFileSync(ROOT + '/src/engine/tumble.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_engine/tumble.js', 'utf8');
t('mirror byte-identical', s1 === s2);

// comments
t('comment documents null-vs-undefined', s1.indexOf('undefined') !== -1);
t('comment documents consumer status', s1.indexOf('Consumer status') !== -1);

console.log('');
console.log('========== engine/tumble ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
