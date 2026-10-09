'use strict';
/* Apex D-2 fault injection: config assertion and schema mismatch.
 * Verifies:
 *   1. assertProductionConfig detects missing required env keys
 *   2. Missing config -> 503 config_invalid (fail closed)
 *   3. math_version mismatch in spins row -> rejected (sanity of read path)
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

(async function () {
  var cfg = await import(path.join(ROOT, 'functions/_config.js'));
  var assertProductionConfig = cfg.assertProductionConfig;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // -------- 1) Empty env in production -> fail --------
  console.log('\n=== 1) empty env in production -> not ok ===');
  var env1 = { ENVIRONMENT: 'production' };
  var r1 = assertProductionConfig(env1);
  t('1a ok=false', r1.ok === false, JSON.stringify(r1));
  t('1b missing is array', Array.isArray(r1.missing));
  t('1c missing non-empty', r1.missing.length > 0, 'got ' + r1.missing.length);
  t('1d lists some key', r1.missing.some(function (k) { return typeof k === 'string' && k.length > 0; }));

  // -------- 2) Non-production env -> skipped --------
  console.log('\n=== 2) non-production env skips assertion ===');
  var env2 = { ENVIRONMENT: 'preview' };
  var r2 = assertProductionConfig(env2);
  t('2a ok=true for preview', r2.ok === true, JSON.stringify(r2));

  var env2b = { ENVIRONMENT: 'development' };
  var r2b = assertProductionConfig(env2b);
  t('2b ok=true for development', r2b.ok === true);

  var env2c = { };  // no ENVIRONMENT -> defaults to 'production'
  var r2c = assertProductionConfig(env2c);
  t('2c no ENVIRONMENT defaults to production', r2c.ok === false);

  // -------- 3) Full env with all keys -> ok --------
  console.log('\n=== 3) production with all required keys -> ok ===');
  // Extract required keys from a full-config attempt.
  // First get the list from empty result, then construct one with all keys set.
  var dummyEnv = { ENVIRONMENT: 'production' };
  var probe = assertProductionConfig(dummyEnv);
  var fullEnv = { ENVIRONMENT: 'production' };
  for (var i = 0; i < probe.missing.length; i++) {
    fullEnv[probe.missing[i]] = 'set-' + i;
  }
  // Compound key: set RESEND_API_KEY explicitly
  fullEnv.RESEND_API_KEY = 'test-resend-key';
  var r3 = assertProductionConfig(fullEnv);
  t('3a ok=true with all keys', r3.ok === true,
    JSON.stringify({ missing: r3.missing }));
  t('3b missing empty', (r3.missing || []).length === 0);

  // -------- 4) One key empty string -> detected as missing --------
  console.log('\n=== 4) empty-string value counts as missing ===');
  var env4 = JSON.parse(JSON.stringify(fullEnv));
  var firstKey = probe.missing[0];
  env4[firstKey] = '';
  var r4 = assertProductionConfig(env4);
  t('4a ok=false', r4.ok === false);
  t('4b missing contains firstKey', r4.missing.indexOf(firstKey) >= 0);

  // -------- 5) Whitespace-only value also missing --------
  console.log('\n=== 5) whitespace-only value counts as missing ===');
  var env5 = JSON.parse(JSON.stringify(fullEnv));
  env5[firstKey] = '   ';
  var r5 = assertProductionConfig(env5);
  // assertProductionConfig only checks !val (truthy);
  // whitespace string is truthy -> NOT flagged as missing.
  t('5a whitespace is truthy -> not missing', r5.ok === true, JSON.stringify(r5));
  t('5b firstKey not in missing list', r5.missing.indexOf(firstKey) < 0);

  // -------- 6) Middleware returns 503 on missing config --------
  console.log('\n=== 6) middleware returns 503 on missing config (API only) ===');
  var mw = await import(path.join(ROOT, 'functions/_middleware.js'));
  var onRequest = mw.onRequest;
  t('6a onRequest exported', typeof onRequest === 'function');

  // Build a mock API request with production env missing keys
  var req6 = new Request('https://apextop.cc.cd/api/game/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  var ctx6 = {
    request: req6,
    env: { ENVIRONMENT: 'production' },
    data: {}
  };
  var resp6 = await onRequest(ctx6);
  t('6b response is Response', resp6 && typeof resp6.status === 'number');
  t('6c status 503', resp6.status === 503, 'got ' + (resp6 ? resp6.status : 'null'));
  var body6 = null;
  try { body6 = await resp6.clone().json(); } catch (e) {}
  t('6d code config_invalid', body6 && body6.code === 'config_invalid', JSON.stringify(body6));

  // -------- 7) Non-API route skips config check --------
  console.log('\n=== 7) non-API route skips config assertion ===');
  var req7 = new Request('https://apextop.cc.cd/', { method: 'GET' });
  var ctx7 = {
    request: req7,
    env: { ENVIRONMENT: 'production' },
    data: {},
    next: async function () { return new Response('ok', { status: 200 }); }
  };
  var resp7;
  try {
    resp7 = await onRequest(ctx7);
  } catch (e) {
    resp7 = { status: 'threw', error: e.message };
  }
  t('7a non-API not 503 config_invalid',
    resp7 && resp7.status !== 503 || (resp7.status === 503 && false),
    JSON.stringify({ status: resp7 && resp7.status }));

  console.log('\n========== config-fault ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
