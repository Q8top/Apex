'use strict';
/* P2-4 near-miss test. */
var path = require('path');
var fs = require('fs');
var vm = require('vm');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}

var SRC = fs.readFileSync(path.join(ROOT, 'src/js/presentation/near-miss.js'), 'utf8');
var fail = 0;
function t(n, c, e) { if (c) console.log('  ok   ' + n); else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

function fresh() {
  global.window = {};
  vm.runInThisContext(SRC, { filename: 'near-miss.js' });
  return global.window.ApexNearMiss;
}
function makeEl(cls) {
  var classes = (cls || '').split(' ').filter(Boolean);
  return {
    classList: {
      add: function (c) { if (classes.indexOf(c) < 0) classes.push(c); },
      remove: function (c) { classes = classes.filter(function (x) { return x !== c; }); },
      contains: function (c) { return classes.indexOf(c) >= 0; }
    },
    _classes: function () { return classes; }
  };
}
function makeBoard(n) {
  var cells = [];
  for (var i = 0; i < n; i++) cells.push(makeEl('sd-sym'));
  return {
    querySelectorAll: function (sel) {
      if (sel === '.sd-sym') return cells;
      if (sel === '.is-near-miss') return cells.filter(function (c) { return c._classes().indexOf('is-near-miss') >= 0; });
      return [];
    },
    _cells: cells
  };
}

console.log('\n=== 1) mount ===');
var NM = fresh();
t('1a mounted', !!NM);
t('1b has compute', typeof NM.computeHighlightIndices === 'function');
t('1c has apply', typeof NM.applyHighlight === 'function');
t('1d has clear', typeof NM.clearHighlight === 'function');
t('1e TRIGGER_COUNT=7', NM.TRIGGER_COUNT === 7);
t('1f frozen', Object.isFrozen(NM));

console.log('\n=== 2) compute basic ===');
// 7 bananas + 23 others (each unique)
var g1 = [];
for (var i = 0; i < 7; i++) g1.push('banana');
for (var j = 7; j < 30; j++) g1.push('x' + j);
var idx1 = NM.computeHighlightIndices(g1);
t('2a finds 7 bananas', idx1.length === 7, 'got ' + idx1.length);
t('2b indices are 0..6', idx1.join(',') === '0,1,2,3,4,5,6', idx1.join(','));

console.log('\n=== 3) threshold boundaries ===');
// 6 of 8 -> no highlight
var g3a = []; for (var a = 0; a < 6; a++) g3a.push('banana');
for (var b = 6; b < 30; b++) g3a.push('x' + b);
t('3a 6 count no highlight', NM.computeHighlightIndices(g3a).length === 0);

// 8 of 8 -> no highlight (already winning)
var g3b = []; for (var c = 0; c < 8; c++) g3b.push('banana');
for (var d = 8; d < 30; d++) g3b.push('x' + d);
t('3b 8 count no highlight', NM.computeHighlightIndices(g3b).length === 0);

// 7 + another 7 -> both highlighted
var g3c = [];
for (var e = 0; e < 7; e++) g3c.push('banana');
for (var f = 0; f < 7; f++) g3c.push('grape');
for (var g = 14; g < 30; g++) g3c.push('x' + g);
t('3c two symbols with 7', NM.computeHighlightIndices(g3c).length === 14);

console.log('\n=== 4) isRegular filter ===');
var g4 = []; for (var i4 = 0; i4 < 7; i4++) g4.push('lollipop');
for (var j4 = 7; j4 < 30; j4++) g4.push('x' + j4);
var isReg = function (t) { return t !== 'lollipop'; };
t('4a scatter filtered out', NM.computeHighlightIndices(g4, { isRegular: isReg }).length === 0);
t('4b no filter -> highlighted', NM.computeHighlightIndices(g4).length === 7);

console.log('\n=== 5) empty/invalid input ===');
t('5a empty array', NM.computeHighlightIndices([]).length === 0);
t('5b null', NM.computeHighlightIndices(null).length === 0);
t('5c undefined', NM.computeHighlightIndices(undefined).length === 0);
t('5d triggerCount=0', NM.computeHighlightIndices(['a', 'a', 'a'], { triggerCount: 0 }).length === 0);

console.log('\n=== 6) applyHighlight ===');
var board = makeBoard(30);
var n6 = NM.applyHighlight(board, g1);
t('6a applied 7', n6 === 7);
var cnt6 = 0;
for (var i6 = 0; i6 < board._cells.length; i6++) if (board._cells[i6]._classes().indexOf('is-near-miss') >= 0) cnt6++;
t('6b 7 cells have class', cnt6 === 7);

console.log('\n=== 7) clearHighlight ===');
var n7 = NM.clearHighlight(board);
t('7a cleared 7', n7 === 7);
var cnt7 = 0;
for (var i7 = 0; i7 < board._cells.length; i7++) if (board._cells[i7]._classes().indexOf('is-near-miss') >= 0) cnt7++;
t('7b no cells left', cnt7 === 0);

console.log('\n=== 8) applyHighlight invalid board ===');
t('8a null board -> 0', NM.applyHighlight(null, g1) === 0);
t('8b empty board -> 0', NM.applyHighlight({}, g1) === 0);

console.log('\ntotal: 25, failed: ' + fail);
process.exit(fail > 0 ? 1 : 0);
