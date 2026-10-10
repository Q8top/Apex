'use strict';
require('./_loader.cjs').loadAll();
var passed = 0, failed = 0;
function ok(c, n){ if (c) { passed++; } else { failed++; console.log('FAIL: ' + n); } }
var G = window.ApexSugarRushGrid;
ok(G.GRID.columns === 7, 'cols 7');
ok(G.GRID.rows === 7, 'rows 7');
ok(G.GRID.size === 49, 'size 49');
ok(G.getIndex(0, 0) === 0, 'idx 0,0');
ok(G.getIndex(0, 6) === 6, 'idx 0,6');
ok(G.getIndex(6, 0) === 42, 'idx 6,0');
ok(G.getIndex(6, 6) === 48, 'idx 6,6');
ok(G.getRow(0) === 0, 'row 0');
ok(G.getRow(48) === 6, 'row 48');
ok(G.getColumn(0) === 0, 'col 0');
ok(G.getColumn(48) === 6, 'col 48');
ok(G.isIndexInside(0) === true, 'inside 0');
ok(G.isIndexInside(48) === true, 'inside 48');
ok(G.isIndexInside(49) === false, 'oob 49');
ok(G.isIndexInside(-1) === false, 'oob -1');
ok(G.isIndexInside(1.5) === false, 'oob 1.5');
ok(G.isIndexInside(NaN) === false, 'oob NaN');
var c = G.clone([1, 2, 3]);
ok(c.length === 3 && c[0] === 1, 'clone content');
c[0] = 99;
ok(c[0] === 99, 'clone independent');

var Ev = window.ApexSugarRushEvaluator;
var threw = false;
try { Ev.evaluate([]); } catch(e){ threw = true; }
ok(threw, 'eval [] throws');
threw = false;
try { Ev.evaluate(new Array(48).fill('blue_candy')); } catch(e){ threw = true; }
ok(threw, 'eval 48 throws');
threw = false;
try { Ev.evaluate(new Array(50).fill('blue_candy')); } catch(e){ threw = true; }
ok(threw, 'eval 50 throws');
threw = false;
try { Ev.evaluate(null); } catch(e){ threw = true; }
ok(threw, 'eval null throws');

var T = window.ApexSugarRushTumble;
threw = false;
try { T.removePositions([1,2,3], [0]); } catch(e){ threw = true; }
ok(threw, 'removePos short throws');
threw = false;
try { T.removePositions(new Array(49).fill('x'), [49]); } catch(e){ threw = true; }
ok(threw, 'removePos oob throws');

console.log('[grid-boundaries] passed=' + passed + ' failed=' + failed);
process.exit(failed > 0 ? 1 : 0);
