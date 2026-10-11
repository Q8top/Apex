'use strict';
var subprocess = require('child_process');
var files = [
  '01-errors-grid.cjs',
  '02-rng-evaluator.cjs',
  '03-payout-bonus.cjs',
  '04-tumble-engine.cjs',
  '05-multiplier-marks.cjs',
  '06-spin-base-free.cjs',
  '07-grid-boundaries.cjs',
  '08-payout-precision.cjs',
  '09-max-win-cap.cjs',
  '10-free-spin-rules.cjs',
  '11-deterministic-replay.cjs',
  '12-client-server-parity.cjs',
  '13-long-run-stability.cjs',
  '14-performance-benchmark.cjs',
  '15-base-marks.cjs',
  '16-round-cap.cjs',
  'symbols-audit.cjs',
];
var totalPassed = 0, totalFailed = 0, exitCode = 0;
files.forEach(function(f){
  var p = __dirname + '/' + f;
  var r = subprocess.spawnSync('node', [p], { encoding: 'utf8' });
  var line = (r.stdout || '').trim().split('\n').pop();
  var m = line.match(/passed=(\d+) failed=(\d+)/);
  if (m) { totalPassed += parseInt(m[1],10); totalFailed += parseInt(m[2],10); }
  console.log('  ' + f + ' -> ' + line);
  if (r.status !== 0) exitCode = 1;
});
console.log('[TOTAL] passed=' + totalPassed + ' failed=' + totalFailed);
process.exit(exitCode || (totalFailed > 0 ? 1 : 0));
