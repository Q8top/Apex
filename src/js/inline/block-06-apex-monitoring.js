(function() {
    function report(type, message) {
      try {
        if (window.apiClient) {
          window.apiClient.post('/api/log',
            { type: type, message: message, url: location.href },
            { keepalive: true }
          );
        }
      } catch (e) {}
    }
    window.addEventListener('error', function(e) {
      report('js_error', (e.message || 'Unknown') + ' @ ' + (e.filename || '') + ':' + (e.lineno || ''));
    });
    window.addEventListener('unhandledrejection', function(e) {
      const reason = e.reason && e.reason.message ? e.reason.message : String(e.reason);
      report('promise_rejection', reason.substring(0, 500));
    });
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          report('perf_lcp', Math.round(last.startTime) + 'ms');
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    }
    window.addEventListener('load', function() {
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) report('perf_load', 'DOM:' + Math.round(nav.domContentLoadedEventEnd) + 'ms Load:' + Math.round(nav.loadEventEnd) + 'ms');
      }, 1000);
    });
    console.log('[Apex] 监控已启用');
  })();
