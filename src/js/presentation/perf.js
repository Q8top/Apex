/* Apex - Perf Monitor (C-4 render performance)
 *
 * Ring buffer of samples, per-label stats. Pure logic, no DOM.
 *
 * API:
 *   var p = ApexPerf.create({ cap: 100 });
 *   p.mark('t0');
 *   p.measure('render', 't0');       // push sample 'render'
 *   p.timeIt('board', function(){...});
 *   p.report('board');               // { n, min, p50, p95, max, mean }
 *   p.reportAll();
 *   p.getSamples('board');
 *   p.clear();
 */
(function () {
  'use strict';

  var DEFAULT_CAP = 200;

  function defaultNow() {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }

  function percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    var idx = Math.floor(sorted.length * p);
    if (idx >= sorted.length) idx = sorted.length - 1;
    if (idx < 0) idx = 0;
    return sorted[idx];
  }

  function Perf(opts) {
    opts = opts || {};
    var cap = Number.isSafeInteger(opts.cap) && opts.cap > 0 ? opts.cap : DEFAULT_CAP;
    var now = typeof opts.now === 'function' ? opts.now : defaultNow;
    var buf = [];           // { label, ms }
    var marks = {};         // name -> t

    function push(label, ms) {
      if (!Number.isFinite(ms) || ms < 0) return false;
      buf.push({ label: String(label), ms: ms });
      if (buf.length > cap) buf.shift();
      return true;
    }

    function mark(name) {
      var t = now();
      marks[String(name)] = t;
      return t;
    }

    function measure(label, startName) {
      var t0 = marks[String(startName)];
      if (t0 === undefined) return null;
      var ms = now() - t0;
      push(label, ms);
      return ms;
    }

    function timeIt(label, fn) {
      var t0 = now();
      var out;
      try {
        out = fn();
      } finally {
        push(label, now() - t0);
      }
      return out;
    }

    function samplesOf(label) {
      if (label === undefined || label === null) return buf.slice();
      var l = String(label);
      var out = [];
      for (var i = 0; i < buf.length; i++) {
        if (buf[i].label === l) out.push(buf[i].ms);
      }
      return out;
    }

    function report(label) {
      var arr = samplesOf(label);
      if (arr.length === 0) {
        return Object.freeze({ label: label == null ? null : String(label),
                              n: 0, min: 0, p50: 0, p95: 0, max: 0, mean: 0 });
      }
      var sorted = arr.slice().sort(function (a, b) { return a - b; });
      var sum = 0;
      for (var i = 0; i < sorted.length; i++) sum += sorted[i];
      return Object.freeze({
        label: label == null ? null : String(label),
        n: sorted.length,
        min: sorted[0],
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        max: sorted[sorted.length - 1],
        mean: sum / sorted.length
      });
    }

    function labels() {
      var seen = {}, out = [];
      for (var i = 0; i < buf.length; i++) {
        if (!seen[buf[i].label]) { seen[buf[i].label] = 1; out.push(buf[i].label); }
      }
      return out;
    }

    function reportAll() {
      var ls = labels();
      var out = {};
      for (var i = 0; i < ls.length; i++) out[ls[i]] = report(ls[i]);
      return Object.freeze(out);
    }

    function getSamples(label) { return samplesOf(label); }
    function size() { return buf.length; }
    function clear() { buf = []; marks = {}; }

    return Object.freeze({
      cap: cap,
      mark: mark,
      measure: measure,
      timeIt: timeIt,
      push: push,
      report: report,
      reportAll: reportAll,
      labels: labels,
      getSamples: getSamples,
      size: size,
      clear: clear
    });
  }

  window.ApexPerf = Object.freeze({
    create: Perf,
    percentile: percentile
  });
})();
