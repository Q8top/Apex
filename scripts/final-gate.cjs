#!/usr/bin/env node
/* Apex final gate: run every blocking suite in one shot.
   Exit 0 = ready to ship; exit 1 = blocker present. */
'use strict';
var cp = require('child_process');
var path = require('path');
var ROOT = path.resolve(__dirname, '..');

var SUITES = [
  // [label, command, must contain]
  ['syntax: JS files', 'bash scripts/syntax-check.sh', null],
  ['engine: sweet', 'node tests/engine/all.test.cjs', '0 \u5931\u8d25'],
  ['routing: sweet', 'node tests/games/sweet-demo/routing.cjs', 'failed=0'],
  ['sugar-rush: full', 'node tests/games/sugar-rush/run-all.cjs', 'failed=0'],
  ['fault: d1', 'node tests/fault/d1-fault.cjs', 'fail: 0'],
  ['fault: rate-limit', 'node tests/fault/rate-limit-fault.cjs', 'fail: 0'],
  ['fault: concurrency', 'node tests/fault/concurrency-fault.cjs', 'fail: 0'],
  ['fault: config', 'node tests/fault/config-fault.cjs', 'fail: 0'],
  ['api: spin', 'node tests/api/spin.test.cjs', 'fail: 0'],
  ['api: buy-fs', 'node tests/api/buy-fs.test.cjs', 'fail: 0'],
  ['api: history', 'node tests/api/history.test.cjs', 'fail: 0'],
  ['api: deposit', 'node tests/api/deposit.test.cjs', 'fail: 0'],
  ['security: no secret leak', 'node scripts/check-no-secret-leak.cjs', 'OK'],
  ['security: no math leak', 'node scripts/check-no-math-leak.cjs', '0 leaks'],
  ['security: client/server sep', 'bash scripts/check-client-server-separation.sh', 'passed'],
  ['lint: sweet rules', 'node scripts/lint-sweet-rules.cjs', 'errors=0'],
  ['a11y: tab order', 'node scripts/check-tab-order.cjs', 'issues=0']
];

var pass = 0, fail = 0, failed = [];
SUITES.forEach(function (s) {
  var label = s[0], cmd = s[1], must = s[2];
  var t0 = Date.now();
  var out = '';
  var rc = 1;
  try {
    out = cp.execSync(cmd, { cwd: ROOT, timeout: 300000, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    rc = 0;
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    rc = e.status || 1;
  }
  var ms = Date.now() - t0;
  var ok = (rc === 0);
  if (ok && must) ok = out.indexOf(must) !== -1;
  var tag = ok ? 'PASS' : 'FAIL';
  if (ok) pass++; else { fail++; failed.push(label); }
  console.log('[' + tag + '] ' + label.padEnd(30) + ' (' + ms + 'ms)');
});

console.log('');
console.log('===== final gate =====');
console.log('suites: pass=' + pass + ' fail=' + fail + ' total=' + (pass+fail));
if (fail > 0) {
  console.log('BLOCKED by:');
  failed.forEach(function (x) { console.log('  - ' + x); });
  process.exit(1);
}
console.log('READY TO SHIP (all suites green)');
process.exit(0);
