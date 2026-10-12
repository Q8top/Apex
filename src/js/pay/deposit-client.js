/* Apex - Deposit Client (PSP skeleton). Front-end pre-flight only. */
(function () {
  'use strict';
  function post(path, body) {
    var client = window.apiClient;
    if (!client || typeof client.post !== 'function') {
      return Promise.reject(new Error('apiClient unavailable'));
    }
    return client.post(path, body);
  }
  function createIntent(opts) {
    opts = opts || {};
    var amountMinor = Number(opts.amountMinor);
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      return Promise.reject(new Error('amountMinor invalid'));
    }
    return post('/api/pay/deposit', { amountMinor: amountMinor });
  }
  function redirectToPSP(intent) {
    if (!intent || !intent.intentId) return Promise.reject(new Error('intent invalid'));
    return Promise.resolve({ ok: true, intentId: intent.intentId, provider: intent.provider });
  }
  window.ApexDeposit = Object.freeze({
    create: createIntent,
    redirectToPSP: redirectToPSP
  });
})();
