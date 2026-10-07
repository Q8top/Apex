/* Apex · Wallet 抽象
 * 所有金额使用整数 minor units（分）
 * 正式模式应替换为 ServerWallet（接口相同）
 */
(function () {
  'use strict';

  function DemoWallet(opts) {
    opts = opts || {};
    var balance = Math.floor(Number(opts.initialMinor) || 1000000);
    var currency = opts.currency || 'CNY';
    var listeners = [];

    function emit() {
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](balance); } catch (e) {}
      }
    }

    function getMinor() { return balance; }
    function getCurrency() { return currency; }

    function debit(minor) {
      var n = Math.floor(Number(minor) || 0);
      if (n < 0) throw new Error('debit: negative');
      if (balance < n) return { ok: false, reason: 'insufficient', balance: balance };
      balance -= n;
      emit();
      return { ok: true, balance: balance };
    }

    function credit(minor) {
      var n = Math.floor(Number(minor) || 0);
      if (n < 0) throw new Error('credit: negative');
      balance += n;
      emit();
      return { ok: true, balance: balance };
    }

    function set(minor) {
      balance = Math.floor(Number(minor) || 0);
      emit();
      return balance;
    }

    function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

    return {
      getMinor: getMinor,
      getCurrency: getCurrency,
      debit: debit,
      credit: credit,
      set: set,
      onChange: onChange
    };
  }

  window.ApexWallet = { createDemo: DemoWallet };
})();
