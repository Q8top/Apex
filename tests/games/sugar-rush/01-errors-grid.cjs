'use strict';
require('./_loader.cjs').loadAll();
var assert = require('assert');
var passed = 0, failed = 0;
function ok(cond, name){ if(cond){passed++;} else {failed++; console.log('FAIL: '+name);} }

var E = window.ApexSugarRushErrors;
ok(typeof E === 'object', 'errors exported');
ok(typeof E.ApexError === 'function', 'ApexError is function');
var e1 = E.ApexError(E.CODES.INVALID_GRID_SIZE, 'test');
ok(e1.code === 'INVALID_GRID_SIZE', 'error code set');
ok(e1.apex === true, 'error apex flag');

var G = window.ApexSugarRushGrid;
ok(G.GRID.columns === 7, 'grid columns=7');
ok(G.GRID.rows === 7, 'grid rows=7');
ok(G.GRID.size === 49, 'grid size=49');
ok(G.getIndex(0,0) === 0, 'getIndex(0,0)=0');
ok(G.getIndex(6,6) === 48, 'getIndex(6,6)=48');
ok(G.getIndex(3,2) === 23, 'getIndex(3,2)=23');
ok(G.getRow(23) === 3, 'getRow(23)=3');
ok(G.getColumn(23) === 2, 'getColumn(23)=2');
ok(G.isIndexInside(0) === true, 'idx 0 inside');
ok(G.isIndexInside(48) === true, 'idx 48 inside');
ok(G.isIndexInside(49) === false, 'idx 49 outside');
ok(G.isIndexInside(-1) === false, 'idx -1 outside');

console.log('[errors+grid] passed='+passed+' failed='+failed);
process.exit(failed > 0 ? 1 : 0);
