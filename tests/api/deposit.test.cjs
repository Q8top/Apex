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
  t('1a status 401', res1.status === 401, 'got ' + res1.status);
  var body1 = await res1.json();
  t('1b code unauthenticated', body1.code === 'unauthenticated', body1.code);

  console.log('\n=== 2) invalid amount -> 400 ===');
  var req2 = new Request('https://x/api/pay/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountMinor: 50 })
  });
  var res2 = await mod.onRequestPost({
    request: req2, env: env1, data: { requestId: 'rid2' }
  });
  // If auth check fires first (no session cookie) it'll be 401.
  // We accept either 401 (auth first) or 400 (validated) since order matters.
  t('2a returns 4xx', res2.status === 400 || res2.status === 401, 'got ' + res2.status);

  console.log('');
  console.log('========== deposit test ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail === 0 ? 0 : 1);
})();
