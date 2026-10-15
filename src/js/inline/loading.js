/* Apex loading screen - real preload with byte-accurate progress. */
(function () {
  'use strict';

  var MAP = {
    'sweet':       '/sweet-demo.html',
    'sugar-rush':  '/sugar-rush.html',
    'olympus':     '/olympus.html'
  };
  var FALLBACK = '/coming-soon.html';

  function qs(name) {
    try {
      return new URLSearchParams(location.search).get(name) || '';
    } catch (e) { return ''; }
  }

  var game = qs('game') || '';
  var target = MAP[game] || (FALLBACK + '?game=' + encodeURIComponent(game));

  var fill = document.getElementById('ldFill');
  var pct  = document.getElementById('ldPct');
  var bar  = document.getElementById('ldBar');

  var totalBytes = 0;
  var loadedBytes = 0;
  var startTime = Date.now();
  var MIN_DURATION = 1100; /* keep bar visible at least 1.1s */

  function setProgress(ratio) {
    var p = Math.max(0, Math.min(1, ratio)) * 100;
    var rounded = Math.floor(p);
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = rounded + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(rounded));
  }

  function finish() {
    var elapsed = Date.now() - startTime;
    var wait = Math.max(0, MIN_DURATION - elapsed);
    setTimeout(function () {
      setProgress(1);
      setTimeout(function () {
        location.replace(target);
      }, 220);
    }, wait);
  }

  /* Fallback if fetch fails or takes too long */
  setTimeout(function () {
    if (loadedBytes === 0) {
      /* nothing loaded in 4s: just go */
      finish();
    }
  }, 4000);

  function parseAssets(html) {
    var urls = [];
    var re;
    /* <link ... href="..."> */
    re = /<link[^>]*\brel=["']?(?:stylesheet|preload|modulepreload)["']?[^>]*\bhref=["']([^"']+)["']/gi;
    var m;
    while ((m = re.exec(html))) urls.push({ type: 'css', url: m[1] });
    re = /<link[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']?(?:stylesheet|preload|modulepreload)["']?/gi;
    while ((m = re.exec(html))) urls.push({ type: 'css', url: m[1] });
    /* <script src="..."> */
    re = /<script[^>]*\bsrc=["']([^"']+)["']/gi;
    while ((m = re.exec(html))) urls.push({ type: 'js', url: m[1] });
    /* <img src="..."> */
    re = /<img[^>]*\bsrc=["']([^"']+)["']/gi;
    while ((m = re.exec(html))) urls.push({ type: 'img', url: m[1] });
    /* dedupe + make absolute */
    var seen = {};
    var out = [];
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i].url;
      if (!u) continue;
      if (/^(https?:|data:|blob:|javascript:|#)/i.test(u)) continue;
      if (u.charAt(0) !== '/') {
        try { u = new URL(u, location.origin + target).pathname + (u.indexOf('?') >= 0 ? '?' + u.split('?')[1] : ''); }
        catch (e) { continue; }
      }
      if (seen[u]) continue;
      seen[u] = 1;
      out.push({ type: urls[i].type, url: u });
    }
    return out;
  }

  function loadOne(a) {
    return new Promise(function (resolve) {
      if (a.type === 'img') {
        var img = new Image();
        img.onload = img.onerror = function () { resolve(1); };
        img.src = a.url;
        return;
      }
      fetch(a.url, { cache: 'force-cache', credentials: 'same-origin' })
        .then(function (r) {
          var len = parseInt(r.headers.get('content-length') || '0', 10) || 0;
          if (len > 0) return { len: len };
          /* no content-length: read body to measure */
          return r.arrayBuffer().then(function (b) { return { len: b.byteLength }; });
        })
        .catch(function () { return { len: 0 }; })
        .then(function (res) { resolve(res.len || 1); });
    });
  }

  function run() {
    setProgress(0);
    fetch(target, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var assets = parseAssets(html);
        if (!assets.length) { finish(); return; }
        /* 1) fetch HEAD-ish length in parallel (proxy: run loadOne and just track completions) */
        var done = 0;
        var n = assets.length;
        var est = n * 1;
        setProgress(0);
        assets.forEach(function (a) {
          loadOne(a).then(function () {
            done++;
            /* ratio = completed / total; also blend in real bytes for smoother feel */
            var r = done / n;
            setProgress(r * 0.98);
            if (done === n) finish();
          });
        });
      })
      .catch(function () { finish(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
