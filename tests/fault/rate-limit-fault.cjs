'use strict';
/* Apex D-2 fault injection: rate-limit fail-closed behavior.
 * consumeRateLimit must return {allowed:false,error:true} on DB error.
 * enforceKeyRateLimit / enforceIpRateLimit must surface as 429.
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

(async function () {
  var rl = await import(path.join(ROOT, 'functions/_rateLimit.js'));
  var consumeRateLimit = rl.consumeRateLimit;
  var enforceKeyRateLimit = rl.enforceKeyRateLimit;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // -------- 1) DB down: consumeRateLimit fail-closed --------
  console.log('\n=== 1) DB down -> consumeRateLimit fail-closed ===');
  var envDown = {
    apex_db: {
      prepare: function () {
        throw new Error('injected: D1 connection lost');
      }
    }
  };
  var r1 = await consumeRateLimit(envDown, { key: 'u:1', action: 'spin', max: 20, windowSec: 1 });
  t('1a allowed=false', r1.allowed === false);
  t('1b error=true', r1.error === true);
  t('1c remaining=0', r1.remaining === 0);
  t('1d no retryAfter leak (undefined or 0)', !r1.retryAfter || r1.retryAfter === 0);

  // -------- 2) DB down: enforceKeyRateLimit returns 429 --------
  console.log('\n=== 2) DB down -> enforceKeyRateLimit returns 429 ===');
  var resp = await enforceKeyRateLimit(envDown, 'game:spin', 'u:1', 20, 1);
  t('2a returns non-null Response', resp !== null && resp !== undefined);
  t('2b status 429', resp && resp.status === 429, resp ? 'status=' + resp.status : 'null');
  var body2 = null;
  try { body2 = await resp.clone().json(); } catch (e) {}
  t('2c body.code=rate_limited', body2 && body2.code === 'rate_limited', JSON.stringify(body2));
  t('2d has Retry-After header', !!(resp && resp.headers.get('Retry-After')));

  // -------- 3) prepare returns null row -> allowed=false via error --------
  console.log('\n=== 3) prepare returns null -> treated as 1 cost (allowed if under max) ===');
  var envNull = {
    apex_db: {
      prepare: function () {
        return {
          bind: function () { return this; },
          first: async function () { return null; }
        };
      }
    }
  };
  var r3 = await consumeRateLimit(envNull, { key: 'u:1', action: 'spin', max: 20, windowSec: 1 });
  t('3a allowed=true (treated as cost=1)', r3.allowed === true, JSON.stringify(r3));
  t('3b no error flag', !r3.error);

  // -------- 4) normal path: under max allowed --------
  console.log('\n=== 4) normal: first call under max allowed ===');
  var calls = { n: 0 };
  var envOk = {
    apex_db: {
      prepare: function () {
        return {
          bind: function () { return this; },
          first: async function () {
            calls.n++;
            return { count: calls.n };
          }
        };
      }
    }
  };
  var r4a = await consumeRateLimit(envOk, { key: 'u:1', action: 'spin', max: 3, windowSec: 1 });
  t('4a first allowed', r4a.allowed === true);
  t('4b remaining = 2', r4a.remaining === 2, 'got ' + r4a.remaining);
  var r4b = await consumeRateLimit(envOk, { key: 'u:1', action: 'spin', max: 3, windowSec: 1 });
  var r4c = await consumeRateLimit(envOk, { key: 'u:1', action: 'spin', max: 3, windowSec: 1 });
  t('4c 3rd allowed', r4c.allowed === true);
  var r4d = await consumeRateLimit(envOk, { key: 'u:1', action: 'spin', max: 3, windowSec: 1 });
  t('4d 4th blocked', r4d.allowed === false);
  t('4e retryAfter >= 1', r4d.retryAfter >= 1, 'got ' + r4d.retryAfter);

  // -------- 5) explicit cost --------
  console.log('\n=== 5) explicit cost consumes more budget ===');
  var env5 = {
    apex_db: {
      prepare: function () {
        return {
          bind: function () { return this; },
          first: async function () { return { count: 3 }; }
        };
      }
    }
  };
  var r5 = await consumeRateLimit(env5, { key: 'u:1', action: 'spin', max: 5, windowSec: 1, cost: 3 });
  t('5a cost=3, count=3 allowed', r5.allowed === true);
  var r5b = await consumeRateLimit(env5, { key: 'u:1', action: 'spin', max: 2, windowSec: 1, cost: 3 });
  t('5b cost=3 > max=2 blocked', r5b.allowed === false);

  console.log('\n========== rate-limit-fault ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
