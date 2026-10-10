/* Apex - Reconnection monitor (P1-8)
 *
 * Tracks navigator.onLine and fires online/offline events.
 * Does NOT auto-retry spins (server-side idempotency is the safety
 * net; a client auto-retry with new spinId would double-charge).
 *
 * Usage:
 *   var rc = window.ApexReconnection.create();
 *   rc.onChange(function(online) { ... });
 *   if (!rc.isOnline()) { ... }
 */
(function () {
  'use strict';

  function Reconnection(opts) {
    opts = opts || {};
    var listeners = [];
    var online = (typeof navigator !== 'undefined') ? navigator.onLine !== false : true;
    var lastChangeAt = 0;

    function notify() {
      lastChangeAt = Date.now();
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](online); } catch (e) {}
      }
    }

    function onChange(cb) {
      if (typeof cb !== 'function') return function () {};
      listeners.push(cb);
      return function off() {
        listeners = listeners.filter(function (f) { return f !== cb; });
      };
    }

    function setOnline(v) {
      var next = !!v;
      if (next === online) return;
      online = next;
      notify();
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      try {
        window.addEventListener('online', function () { setOnline(true); });
        window.addEventListener('offline', function () { setOnline(false); });
      } catch (e) {}
    }

    return Object.freeze({
      isOnline: function () { return online; },
      onChange: onChange,
      _setOnline: setOnline,
      _lastChangeAt: function () { return lastChangeAt; }
    });
  }

  if (typeof window !== 'undefined') {
    window.ApexReconnection = Object.freeze({ create: Reconnection });
  }
})();
