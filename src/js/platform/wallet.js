/* Apex · Wallet 抽象
 * 所有金额使用整数 minor units（分）
 * 正式模式应替换为 ServerWallet（接口相同）
 *
 * 约定：
 *   - debit 余额不足返回 { ok:false, reason:'insufficient' } 而非抛错，
 *     调用方必须检查返回值（或先 getMinor 预检）。
 *   - credit / debit 拒绝负数。
 *   - set 会将余额钳制到 [0, MAX_MINOR]。
 */
(function () {
  'use strict';

  var MAX_MINOR = Number.MAX_SAFE_INTEGER;   // 余额上限，防 set(1e20) 溢出

  function DemoWallet(opts) {
    opts = opts || {};
    var rawInit = Number(opts.initialMinor);
    var balance = Number.isFinite(rawInit)
      ? Math.min(MAX_MINOR, Math.max(0, Math.floor(rawInit)))
      : 1000000;                                // 缺省初始 100 万；显式传 0 保持 0
    var currency = typeof opts.currency === 'string' && opts.currency
      ? opts.currency
      : 'CNY';
    var listeners = [];

    function emit() {
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](balance); } catch (e) {}
      }
    }

    function getMinor() { return balance; }
    function getCurrency() { return currency; }

    function debit(minor) {
      var raw = Number(minor);
      if (!Number.isFinite(raw)) throw new Error('debit: non-finite');
      var n = Math.floor(raw);
      if (n < 0) throw new Error('debit: negative');
      if (balance < n) return { ok: false, reason: 'insufficient', balance: balance };
      balance -= n;
      emit();
      return { ok: true, balance: balance };
    }

    function credit(minor) {
      var raw = Number(minor);
      if (!Number.isFinite(raw)) throw new Error('credit: non-finite');
      var n = Math.floor(raw);
      if (n < 0) throw new Error('credit: negative');
      balance = Math.min(MAX_MINOR, balance + n);
      emit();
      return { ok: true, balance: balance };
    }

    function set(minor) {
      var raw = Number(minor);
      if (!Number.isFinite(raw)) throw new Error('set: non-finite');
      balance = Math.min(MAX_MINOR, Math.max(0, Math.floor(raw)));
      emit();
      return balance;
    }

    function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

    return Object.freeze({
      getMinor: getMinor,
      getCurrency: getCurrency,
      debit: debit,
      credit: credit,
      set: set,
      onChange: onChange
    });
  }

  window.ApexWallet = Object.freeze({ createDemo: DemoWallet });
})();
