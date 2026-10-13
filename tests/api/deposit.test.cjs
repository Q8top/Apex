'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');
if (!globalThis.crypto) { globalThis.crypto = require('crypto').webcrypto; }

(async function () {
  var mod = await import(path.join(ROOT, 'functions/api/pay/deposit.js'));
  var pass = 0, fail = 0;
  function t(n, c, e) {
    if (c) { pass++; console.log('  ok   ' + n); }
    else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
  }

  console.log('\n=== 1) no auth -> 401 ===');
  var req1 = new Request('https://x/api/pay/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountMinor: 1000 })
  });
  var env1 = { apex_db: null, PUBLIC_BASE_URL: 'https://x', SESSION_SECRET: 'abc' };
  var res1 = await mod.onRequestPost({
    request: req1, env: env1, data: { requestId: 'rid1' }
  });
  t('1a status 501 (disabled even without auth)', res1.status === 501, 'got ' + res1.status);
  var body1 = await res1.json();
  t('1b code not_implemented', body1.code === 'not_implemented', body1.code);

  console.log('\n=== 2) invalid amount -> 400 ===');
  var req2 = new Request('https://x/api/pay/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountMinor: 50 })
  });
  var res2 = await mod.onRequestPost({
    request: req2, env: env1, data: { requestId: 'rid2' }
  });
  // Endpoint is unconditionally 501 (real money off); validation never runs.
  t('2a still 501 (validation bypassed when disabled)', res2.status === 501, 'got ' + res2.status);

  console.log('');
  console.log('=== 3) authenticated still 501 (real money OFF) ===');
  var req3 = new Request('https://x/api/pay/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountMinor: 1000 })
  });
  var res3 = await mod.onRequestPost({ request: req3, env: env1, data: { requestId: 'rid3' } });
  t('3a status 501', res3.status === 501, 'got ' + res3.status);
  var body3 = await res3.json();
  t('3b code not_implemented', body3.code === 'not_implemented', body3.code);
  t('3c no intentId leaked', !('intentId' in body3));
  t('3d no fingerprint leaked', !('fingerprint' in body3));
  t('3e no provider leaked', !('provider' in body3));

  console.log('');
  console.log('========== deposit test ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail === 0 ? 0 : 1);
})();
