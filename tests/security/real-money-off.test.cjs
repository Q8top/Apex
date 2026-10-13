'use strict';
/* 2.C.4: real-money endpoints must all be OFF (501 not_implemented). */
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;

var pass = 0, fail = 0;
function t(n, c, e){ if (c){ console.log('  ok   ' + n); pass++; } else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); } }

var ENDPOINTS = [
  ['wallet/deposit',  '/api/wallet/deposit'],
  ['wallet/withdraw', '/api/wallet/withdraw'],
  ['pay/deposit',     '/api/pay/deposit'],
];

(async function(){
  console.log('=== real-money endpoints must be disabled ===');
  for (const [name, url] of ENDPOINTS) {
    const mod = await import(path.join(ROOT, 'functions/api/' + name + '.js'));
    if (typeof mod.onRequestPost !== 'function') {
      t(name + ' has onRequestPost', false);
      continue;
    }
    const req = new Request('https://x' + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountMinor: 1000 })
    });
    const res = await mod.onRequestPost({ request: req, env: {}, data: { requestId: 'c4' } });
    t(name + ' returns 501', res.status === 501, 'got ' + res.status);
    const b = await res.json();
    t(name + ' code not_implemented', b.code === 'not_implemented', b.code);
    t(name + ' no intentId/fingerprint/provider',
      !('intentId' in b) && !('fingerprint' in b) && !('provider' in b));
  }
  // bypass attempts: client params + env vars must NOT enable real money
  console.log('');
  console.log('=== bypass attempts ===');
  const BYPASS = [
    ['force=1', '?force=1', {}, { amountMinor: 1000 }],
    ['mode=real', '?mode=real', {}, { amountMinor: 1000, mode: 'real' }],
    ['__test=1', '?__test=1', {}, { amountMinor: 1000 }],
    ['env PSP_PROVIDER=mock', '', { PSP_PROVIDER: 'mock' }, { amountMinor: 1000 }],
    ['env ENABLE_REAL=1', '', { ENABLE_REAL: '1' }, { amountMinor: 1000 }],
    ['env REAL_MONEY=on', '', { REAL_MONEY: 'on' }, { amountMinor: 1000 }],
  ];
  for (const [label, qs, envExtra, bodyExtra] of BYPASS) {
    for (const [name, base] of ENDPOINTS) {
      const mod = await import(path.join(ROOT, 'functions/api/' + name + '.js'));
      const env = Object.assign({}, envExtra);
      const req = new Request('https://x' + base + qs, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyExtra)
      });
      const res = await mod.onRequestPost({ request: req, env: env, data: { requestId: 'byp' } });
      t(label + ' -> ' + name + ' still 501', res.status === 501, 'got ' + res.status);
    }
  }
  console.log('');
  console.log('[real-money-off] passed=' + pass + ' failed=' + fail);
  process.exit(fail === 0 ? 0 : 1);
})().catch(function(e){ console.error('FATAL', e && e.message); process.exit(1); });
