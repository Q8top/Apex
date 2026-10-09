'use strict';
/* Apex D-3 monitoring probes test.
 * Covers GET /api/health, /api/ready, /api/status behavior.
 *
 * These are read-only probes used by uptime monitors:
 *   - must not require auth
 *   - must not leak secrets (no env values, no schema, no internal hostnames)
 *   - must return 503 when D1 unreachable (fail closed)
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

function mockEnv(ok, extras) {
  return Object.assign({
    apex_db: {
      prepare: function () {
        return {
          first: async function () {
            if (!ok) throw new Error('injected: d1 down');
            return { c: 1 };
          },
          bind: function () { return this; },
          run: async function () { return { meta: { changes: 0 } }; }
        };
      }
    },
    ENVIRONMENT: 'production'
  }, extras || {});
}

(async function () {
  var health = await import(path.join(ROOT, 'functions/api/health.js'));
  var ready = await import(path.join(ROOT, 'functions/api/ready.js'));
  var status = await import(path.join(ROOT, 'functions/api/status.js'));

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // ============================================================
  // 1) health.js
  // ============================================================
  console.log('\n=== 1) GET /api/health ===');

  var r1 = await health.onRequestGet({ env: mockEnv(true), data: { requestId: 'req-h1' } });
  t('1a status 200 when db ok', r1.status === 200, 'got ' + r1.status);
  var b1 = await r1.json();
  t('1b success true', b1.success === true);
  t('1c checks.api ok', b1.checks.api === 'ok');
  t('1d checks.db ok', b1.checks.db === 'ok');
  t('1e checks.time is ISO', typeof b1.checks.time === 'string' && b1.checks.time.indexOf('T') > 0);

  var r2 = await health.onRequestGet({ env: mockEnv(false), data: {} });
  t('1f status 503 when db down', r2.status === 503, 'got ' + r2.status);
  var b2 = await r2.json();
  t('1g success false', b2.success === false);
  t('1h checks.db error', b2.checks.db === 'error');

  // secret leak check
  var b1Str = JSON.stringify(b1);
  t('1i no ENVIRONMENT leak', b1Str.indexOf('production') < 0);
  t('1j no apex_db leak', b1Str.indexOf('apex_db') < 0);

  // OPTIONS
  var opt1 = await health.onRequestOptions({ data: {} });
  t('1k OPTIONS 204', opt1.status === 204);

  // ============================================================
  // 2) ready.js
  // ============================================================
  console.log('\n=== 2) GET /api/ready ===');

  var r3 = await ready.onRequestGet({ env: mockEnv(true), data: { requestId: 'req-r1' } });
  t('2a status 200 when db ok', r3.status === 200, 'got ' + r3.status);
  var b3 = await r3.json();
  t('2b ready true', b3.ready === true);
  t('2c success true', b3.success === true);

  var r4 = await ready.onRequestGet({ env: mockEnv(false), data: {} });
  t('2d status 503 when db down', r4.status === 503, 'got ' + r4.status);
  var b4 = await r4.json();
  t('2e ready false', b4.ready === false);
  t('2f success false', b4.success === false);

  var opt2 = await ready.onRequestOptions({ data: {} });
  t('2g OPTIONS 204', opt2.status === 204);

  // ============================================================
  // 3) status.js
  // ============================================================
  console.log('\n=== 3) GET /api/status ===');

  // No email provider configured -> email.state = 'error' -> overall error -> 503
  var r5 = await status.onRequestGet({
    env: mockEnv(true, { EMAIL_PROVIDER: 'resend' }),
    data: { requestId: 'req-s1' }
  });
  t('3a status 503 when email error', r5.status === 503, 'got ' + r5.status);
  var b5 = await r5.json();
  t('3b overall error', b5.overall === 'error');
  t('3c email state error', b5.checks.email.state === 'error');
  t('3d email providers empty', Array.isArray(b5.checks.email.providers) && b5.checks.email.providers.length === 0);
  t('3e db still ok', b5.checks.db.state === 'ok');

  // 1 email provider -> warn -> 200
  var r6 = await status.onRequestGet({
    env: mockEnv(true, { RESEND_API_KEY: 'rk_test', EMAIL_PROVIDER: 'resend' }),
    data: {}
  });
  t('3f status 200 with 1 provider', r6.status === 200, 'got ' + r6.status);
  var b6 = await r6.json();
  t('3g overall warn', b6.overall === 'warn', 'got ' + b6.overall);
  t('3h email state warn', b6.checks.email.state === 'warn');
  t('3i providers = [resend]', b6.checks.email.providers.length === 1 && b6.checks.email.providers[0] === 'resend');
  t('3j primary = resend', b6.checks.email.primary === 'resend');

  // 2 email providers -> ok -> 200
  var r7 = await status.onRequestGet({
    env: mockEnv(true, {
      RESEND_API_KEY: 'rk_test',
      AGENTMAIL_API_KEY: 'am_test',
      AGENTMAIL_INBOX_ID: 'inbox_x',
      EMAIL_PROVIDER: 'resend,agentmail'
    }),
    data: {}
  });
  t('3k status 200 with 2 providers', r7.status === 200);
  var b7 = await r7.json();
  t('3l overall ok', b7.overall === 'ok', 'got ' + b7.overall);
  t('3m providers = [resend,agentmail]', b7.checks.email.providers.length === 2);

  // db down -> error -> 503
  var r8 = await status.onRequestGet({
    env: mockEnv(false, { RESEND_API_KEY: 'rk', AGENTMAIL_API_KEY: 'am', AGENTMAIL_INBOX_ID: 'i' }),
    data: {}
  });
  t('3n status 503 when db down', r8.status === 503, 'got ' + r8.status);
  var b8 = await r8.json();
  t('3o overall error', b8.overall === 'error');
  t('3p db error state', b8.checks.db.state === 'error');

  // secret leak check for status
  var b7Str = JSON.stringify(b7);
  t('3q status response does not leak keys', b7Str.indexOf('rk_test') < 0 && b7Str.indexOf('am_test') < 0 && b7Str.indexOf('inbox_x') < 0);

  var opt3 = await status.onRequestOptions({ data: {} });
  t('3r OPTIONS 204', opt3.status === 204);

  // ============================================================
  // 4) All probes: JSON content-type + no-store
  // ============================================================
  console.log('\n=== 4) Common headers ===');
  [r1, r3, r5].forEach(function (resp, i) {
    var ct = resp.headers.get('Content-Type') || '';
    var cc = resp.headers.get('Cache-Control') || '';
    t('4' + String.fromCharCode(97 + i) + ' json content-type', ct.indexOf('application/json') >= 0);
    t('4' + String.fromCharCode(97 + i) + ' no-store', cc.indexOf('no-store') >= 0);
  });

  console.log('\n========== probes ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
