(function () {
  'use strict';

  function report(type, message) {
    try {
      if (window.apiClient && typeof window.apiClient.post === 'function') {
        window.apiClient.post(
          '/api/log',
          { type: type, message: message, url: location.href },
          { keepalive: true }
        );
      }
    } catch (e) { /* 日志通道失败不影响主流程 */ }
  }

  window.addEventListener('error', function (e) {
    report('js_error',
      (e.message || 'Unknown') + ' @ ' + (e.filename || '') + ':' + (e.lineno || ''));
  });

  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    var msg = (r && r.message) ? r.message : String(r);
    report('promise_rejection', msg.substring(0, 500));
  });

  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        var last = entries[entries.length - 1];
        if (last) report('perf_lcp', Math.round(last.startTime) + 'ms');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { /* 旧浏览器不支持 buffered */ }
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          report('perf_load',
            'DOM:' + Math.round(nav.domContentLoadedEventEnd) + 'ms ' +
            'Load:' + Math.round(nav.loadEventEnd) + 'ms');
        }
      } catch (e) {}
    }, 1000);
  });
})();
