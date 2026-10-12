/* Apex perf probe. Paste into mobile DevTools console after game loads.
   Reports: FPS over 3s, long frames, first paint metrics.
   Zero dependency. Safe to run anytime. */
(function () {
  'use strict';
  var frames = 0;
  var longFrames = 0;
  var worst = 0;
  var last = performance.now();
  var stopAt = last + 3000;
  function tick(now) {
    var dt = now - last;
    last = now;
    frames++;
    if (dt > 20) longFrames++;
    if (dt > worst) worst = dt;
    if (now < stopAt) requestAnimationFrame(tick);
    else finish();
  }
  function finish() {
    var fps = frames / 3;
    var nav = performance.getEntriesByType('navigation')[0] || {};
    var paint = performance.getEntriesByType('paint') || [];
    var fcp = 0;
    for (var i = 0; i < paint.length; i++) {
      if (paint[i].name === 'first-contentful-paint') fcp = paint[i].startTime;
    }
    var mem = (performance.memory && performance.memory.usedJSHeapSize) || 0;
    console.log('===== APEX PERF PROBE =====');
    console.log('FPS avg (3s):', fps.toFixed(1));
    console.log('Long frames (>20ms):', longFrames);
    console.log('Worst frame (ms):', worst.toFixed(1));
    console.log('TTFB (ms):', (nav.responseStart || 0).toFixed(0));
    console.log('DOMContentLoaded (ms):', (nav.domContentLoadedEventEnd || 0).toFixed(0));
    console.log('Load (ms):', (nav.loadEventEnd || 0).toFixed(0));
    console.log('FCP (ms):', fcp.toFixed(0));
    if (mem) console.log('JS heap (MB):', (mem / 1048576).toFixed(1));
    console.log('device:', navigator.userAgent);
    console.log('dpr:', window.devicePixelRatio);
    console.log('viewport:', window.innerWidth + 'x' + window.innerHeight);
    console.log('=== copy above and paste back ===');
  }
  console.log('[perf-probe] sampling 3s...');
  requestAnimationFrame(tick);
})();
