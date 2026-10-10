#!/usr/bin/env node
'use strict';
// Apex P0-1b payScale calibrator (subprocess per eval).
// Usage: node tools/calibrate-scale.cjs [seeds] [spins] [target]
const path = require('node:path');
const cp = require('node:child_process');
const fs = require('node:fs');
const ROOT = path.resolve(__dirname, '..');
const EVAL = path.join(__dirname, '_eval-scale.cjs');
const SEEDS = parseInt(process.argv[2] || '3', 10);
const SPINS = parseInt(process.argv[3] || '8000', 10);
const TARGET = parseFloat(process.argv[4] || '0.925');
const LO0 = 3.0, HI0 = 8.0, ITER = 7;
function worstRtp(scale){
  var out = cp.execFileSync('node',
    [EVAL, String(scale), String(SEEDS), String(SPINS)],
    { encoding: 'utf-8', timeout: 600000,
      stdio: ['ignore','pipe','pipe'] });
  return JSON.parse(String(out).trim());
}
console.log('============================================');
console.log('  P0-1b SR payScale Calibrator');
console.log('  seeds=' + SEEDS + '  spins/seed=' + SPINS + '  target=' + TARGET);
console.log('============================================');
console.log('');
var lo = LO0, hi = HI0;
var history = [];
for (var iter = 0; iter < ITER; iter++){
  var mid = (lo + hi) / 2;
  var t0 = Date.now();
  var r = worstRtp(mid);
  var dt = ((Date.now() - t0) / 1000).toFixed(1);
  var verdict = r.worst > TARGET ? 'HIGH' : 'OK  ';
  var rtps = r.rtps.map(function(v){ return v.toFixed(4); }).join(',');
  console.log('iter' + iter
    + '  scale=' + mid.toFixed(4)
    + '  worst=' + r.worst.toFixed(4)
    + '  r[' + rtps + ']'
    + '  [' + verdict + ']  ' + dt + 's');
  history.push({ iter: iter, scale: mid, worst: r.worst });
  if (r.worst > TARGET) hi = mid; else lo = mid;
}
console.log('');
console.log('============================================');
console.log('  SUGGESTED payScale = ' + lo.toFixed(3));
console.log('  (worst-RTP bound should be <= ' + TARGET + ')');
console.log('============================================');
var outFile = path.join(ROOT, 'audit-logs', 'calibrate-scale-result.json');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(
  { seeds: SEEDS, spins: SPINS, target: TARGET,
    suggested: lo, history: history }, null, 2));
console.log('  saved: ' + outFile);
