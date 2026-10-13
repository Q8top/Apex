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
  ['html: refs exist', 'node scripts/check-html-refs.cjs', 'miss=0'],
  ['deploy: excludes', 'node scripts/check-deploy-excludes.cjs', 'miss=0'],
  ['config: symbols-locked', 'node tests/config/symbols-locked.test.cjs', 'fail: 0'],
  ['config: paytable-locked', 'node tests/config/paytable-locked.test.cjs', 'fail: 0'],
  ['config: math-profile', 'node tests/config/math-profile.test.cjs', 'fail: 0'],
  ['config: public-rules', 'node tests/config/public-rules.test.cjs', 'fail: 0'],
  ['config: games-registry', 'node tests/config/games-registry.test.cjs', 'fail: 0'],
  ['config: version', 'node tests/config/version.test.cjs', 'fail: 0'],
  ['config: id-map-strictness', 'node tests/config/id-map-strictness.test.cjs', 'failed=0'],
  ['config: tumble-steps-uniform', 'node tests/config/tumble-steps-uniform.test.cjs', 'failed=0'],
  ['config: engine-errors', 'node tests/config/engine-errors.test.cjs', 'fail: 0'],
  ['config: engine-grid', 'node tests/config/engine-grid.test.cjs', 'fail: 0'],
  ['config: engine-rng', 'node tests/config/engine-rng.test.cjs', 'fail: 0'],
  ['config: engine-payout', 'node tests/config/engine-payout.test.cjs', 'fail: 0'],
  ['config: engine-multiplier', 'node tests/config/engine-multiplier.test.cjs', 'fail: 0'],
  ['config: engine-tumble', 'node tests/config/engine-tumble.test.cjs', 'fail: 0'],
  ['engine: sweet', 'node tests/engine/all.test.cjs', '0 \u5931\u8d25'],
  ['routing: sweet', 'node tests/games/sweet-demo/routing.cjs', 'failed=0'],
  ['sugar-rush: full', 'node tests/games/sugar-rush/run-all.cjs', 'failed=0'],
  ['fault: d1', 'node tests/fault/d1-fault.cjs', 'fail: 0'],
  ['fault: rate-limit', 'node tests/fault/rate-limit-fault.cjs', 'fail: 0'],
  ['fault: concurrency', 'node tests/fault/concurrency-fault.cjs', 'fail: 0'],
  ['fault: config', 'node tests/fault/config-fault.cjs', 'fail: 0'],
  ['api: spin', 'node tests/api/spin.test.cjs', 'fail: 0'],
  ['api: spin-dto', 'node tests/api/spin-dto.test.cjs', 'failed=0'],
  ['api: buy-fs', 'node tests/api/buy-fs.test.cjs', 'fail: 0'],
  ['api: history', 'node tests/api/history.test.cjs', 'fail: 0'],
  ['api: deposit', 'node tests/api/deposit.test.cjs', 'fail: 0'],
  ['api: state', 'node tests/api/state.test.cjs', 'fail: 0'],
  ['security: no secret leak', 'node scripts/check-no-secret-leak.cjs', 'OK'],
  ['security: no math leak', 'node scripts/check-no-math-leak.cjs', '0 leaks'],
  ['security: client/server sep', 'bash scripts/check-client-server-separation.sh', 'passed'],
  ['security: authority-boundary', 'node tests/security/authority-boundary.test.cjs', 'failed=0'],
  ['security: passkey-recover-status', 'node tests/security/passkey-recover-status.test.cjs', 'failed=0'],
  ['security: recover-email-rate', 'node tests/security/recover-email-rate.test.cjs', 'failed=0'],
  ['security: csp-regression', 'node tests/security/csp-regression.test.cjs', 'failed=0'],
  ['security: history-game-filter', 'node tests/security/history-game-filter.test.cjs', 'failed=0'],
  ['security: username-case', 'node tests/security/username-case.test.cjs', 'failed=0'],
  ['security: real-money-off', 'node tests/security/real-money-off.test.cjs', 'failed=0'],
  ['settlement: buy-fs conc', 'node tests/settlement/b5-buyfs-concurrency.cjs', '0 fail'],
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
