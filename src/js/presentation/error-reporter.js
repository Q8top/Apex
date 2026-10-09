// Apex - Client error reporter.
// Captures uncaught errors + unhandled rejections.
//
// Modes:
//   real -> POST /api/log with keepalive
//   demo -> console only (does NOT violate A-2 demo no-network rule)
//
// Safety:
//   - dedup: same message within dedupMs -> skip
//   - rate: at most maxErrors per session
//   - swallow: transport failure never propagates
//   - does not depend on apiClient (survives its failure)
(function () {
  'use strict';

  var TYPES = { error: 'js_error', rejection: 'promise_rejection' };

  function shortMsg(s) {
    return String(s == null ? '' : s).substring(0, 500);
  }

  function install(opts) {
    opts = opts || {};
    var mode = opts.mode === 'demo' ? 'demo' : 'real';
    var endpoint = opts.endpoint || '/api/log';
    var maxErrors = Number.isSafeInteger(opts.maxErrors) && opts.maxErrors > 0 ? opts.maxErrors : 5;
    var dedupMs = Number.isSafeInteger(opts.dedupMs) && opts.dedupMs > 0 ? opts.dedupMs : 5000;
    var now = typeof opts.now === 'function' ? opts.now : function () { return Date.now(); };
    var sender = typeof opts.send === 'function' ? opts.send : defaultSend;

    var reported = 0;
    var lastMsg = '';
    var lastAt = 0;
    var installed = false;

    function defaultSend(payload) {
      try {
        if (typeof fetch !== 'function') return;
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
          credentials: 'same-origin'
        }).catch(function () {});
      } catch (e) {}
    }

    function report(type, message) {
      if (reported >= maxErrors) return false;
      var msg = shortMsg(message);
      if (!msg) return false;
      var t = now();
      if (msg === lastMsg && (t - lastAt) < dedupMs) return false;
      lastMsg = msg;
      lastAt = t;
      reported++;

      if (mode === 'demo') {
        try { if (typeof console !== 'undefined' && console.warn) console.warn('[error-reporter/demo]', type, msg); } catch (e) {}
        return true;
      }

      try {
        sender({
          type: TYPES[type] || 'unknown',
          message: msg,
          url: (typeof location !== 'undefined' ? location.href : ''),
        });
      } catch (e) {}
      return true;
    }

    function onError(e) {
      var m = e && e.message ? e.message : 'Unknown';
      var f = e && e.filename ? e.filename : '';
      var l = e && e.lineno != null ? e.lineno : '';
      report('error', m + ' @ ' + f + ':' + l);
    }

    function onReject(e) {
      var r = e && e.reason;
      var m = (r && r.message) ? r.message : String(r);
      report('rejection', m);
    }

    function installHandlers() {
      if (installed) return false;
      if (typeof window === 'undefined' || !window.addEventListener) return false;
      window.addEventListener('error', onError);
      window.addEventListener('unhandledrejection', onReject);
      installed = true;
      return true;
    }

    // Auto-install handlers on construction (idempotent via installHandlers guard)
    installHandlers();

    return Object.freeze({
      report: report,
      install: installHandlers,
      count: function () { return reported; },
      mode: mode,
      isInstalled: function () { return installed; },
    });
  }

  if (typeof window !== 'undefined' && window) {
    window.ApexErrorReporter = Object.freeze({
      install: install,
      _types: TYPES,
    });
  }
})();
