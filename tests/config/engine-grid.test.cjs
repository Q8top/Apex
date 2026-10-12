'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/engine/errors.js');
require(ROOT + '/src/engine/grid.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var G = globalThis.window.ApexEngineGrid;
var E = globalThis.window.ApexEngineErrors;

// mount
t('mounted', !!G);
t('outer frozen', Object.isFrozen(G));
t('GRID frozen', Object.isFrozen(G.GRID));
t('GRID dims 6x5x30', G.GRID.columns === 6 && G.GRID.rows === 5 && G.GRID.size === 30);
t('all 7 APIs present', ['GRID','getIndex','getIndexSafe','getRow','getColumn','clone','isIndexInside'].every(function(k){ return G[k] !== undefined; }));

// getIndex: hot path unchanged
t('getIndex(0,0)=0', G.getIndex(0,0) === 0);
t('getIndex(0,5)=5', G.getIndex(0,5) === 5);
t('getIndex(4,0)=24', G.getIndex(4,0) === 24);
t('getIndex(4,5)=29', G.getIndex(4,5) === 29);
t('getIndex row-major', G.getIndex(2,3) === 2 * 6 + 3);

// getRow/getColumn: reserved but working
t('getRow(0)=0', G.getRow(0) === 0);
t('getRow(29)=4', G.getRow(29) === 4);
t('getColumn(0)=0', G.getColumn(0) === 0);
t('getColumn(29)=5', G.getColumn(29) === 5);
t('getRow/getColumn roundtrip', (function(){
  for (var i = 0; i < 30; i++){
    if (G.getIndex(G.getRow(i), G.getColumn(i)) !== i) return false;
  }
  return true;
})());

// getIndexSafe: success
t('getIndexSafe(0,0)=0', G.getIndexSafe(0,0) === 0);
t('getIndexSafe(4,5)=29', G.getIndexSafe(4,5) === 29);
t('getIndexSafe matches getIndex', (function(){
  for (var r = 0; r < 5; r++){
    for (var c = 0; c < 6; c++){
      if (G.getIndexSafe(r,c) !== G.getIndex(r,c)) return false;
    }
  }
  return true;
})());

// getIndexSafe: rejected
var badArgs = [[-1,0],[0,-1],[5,0],[0,6],[1.5,0],[0,1.5],['a',0],[0,'a'],[null,0],[0,null],[undefined,0],[0,undefined]];
badArgs.forEach(function(pair){
  var ok = false;
  try { G.getIndexSafe(pair[0], pair[1]); } catch (e) {
    ok = (e.name === 'ApexError' && e.code === E.CODES.INVALID_GRID_SIZE && e.apex === true);
  }
  t('getIndexSafe rejects ' + JSON.stringify(pair), ok);
});

// clone: valid
var src = [1,2,3];
var c = G.clone(src);
t('clone returns array', Array.isArray(c));
t('clone is a copy', c !== src);
t('clone preserves content', c.join(',') === src.join(','));
t('clone of empty array', G.clone([]).length === 0);

// clone: rejected
['null','undefined','string','number','object','boolean'].forEach(function(kind){
  var input;
  if (kind === 'null') input = null;
  else if (kind === 'undefined') input = undefined;
  else if (kind === 'string') input = 'abc';
  else if (kind === 'number') input = 42;
  else if (kind === 'object') input = {a:1};
  else if (kind === 'boolean') input = true;
  var ok = false;
  try { G.clone(input); } catch (e) {
    ok = (e.name === 'ApexError' && e.code === E.CODES.INVALID_GRID_SIZE);
  }
  t('clone rejects ' + kind, ok);
});

// isIndexInside
t('isIndexInside(0)', G.isIndexInside(0) === true);
t('isIndexInside(29)', G.isIndexInside(29) === true);
t('isIndexInside(30)', G.isIndexInside(30) === false);
t('isIndexInside(-1)', G.isIndexInside(-1) === false);
t('isIndexInside(1.5)', G.isIndexInside(1.5) === false);
t('isIndexInside("5")', G.isIndexInside('5') === false);
t('isIndexInside(null)', G.isIndexInside(null) === false);
t('isIndexInside(NaN)', G.isIndexInside(NaN) === false);

// mirror byte-identical
var s1 = fs.readFileSync(ROOT + '/src/engine/grid.js', 'utf8');
var s2 = fs.readFileSync(ROOT + '/functions/_engine/grid.js', 'utf8');
t('mirror byte-identical', s1 === s2);

// comments: reserved markers
t('comment marks RESERVED', s1.indexOf('RESERVED') !== -1);
t('comment warns getIndex hot path', s1.indexOf('HOT PATH') !== -1);

console.log('');
console.log('========== engine/grid ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
