/* Apex loading screen - byte-accurate preload of every asset. */
(function () {
'use strict';
var MAP = {
'sweet':       '/sweet-demo.html',
'sugar-rush':  '/sugar-rush.html',
'olympus':     '/olympus.html',
  'emberfall':   '/emberfall.html'
};
var FALLBACK = '/coming-soon.html';

/* Resources that JS builds at runtime (symbol images via string
   concatenation, audio via new Audio()). Static HTML never mentions
   them, so we list them per game. */
var EXTRA = {
  'emberfall': [
    '/assets/emberfall/bg.webp',
    '/assets/emberfall/dragon.webp',
    '/assets/emberfall/seal.webp',
    '/assets/emberfall/wild.webp',
    '/assets/emberfall/phoenix.webp',
    '/assets/emberfall/lotus.webp',
    '/assets/emberfall/crown.webp',
    '/assets/emberfall/feather.webp',
    '/assets/emberfall/bell.webp',
    '/assets/emberfall/ingot.webp',
    '/assets/emberfall/coin.webp',
    '/assets/emberfall/jade.webp'
  ],
'olympus': [
'/assets/games/olympus-bg.jpeg',
'/assets/audio/olympus-bgm.mp3',
'/assets/audio/olympus-payout.mp3',
'/assets/symbols/sym-0.webp',
'/assets/symbols/sym-1.webp',
'/assets/symbols/sym-2.webp',
'/assets/symbols/sym-3.webp',
'/assets/symbols/sym-4.webp',
'/assets/symbols/sym-5.webp',
'/assets/symbols/sym-6.webp',
'/assets/symbols/sym-7.webp',
'/assets/symbols/sym-8.webp',
'/assets/symbols/sym-9.webp',
'/assets/symbols/sym-10.webp',
'/assets/symbols/sym-11.webp',
'/assets/symbols/sym-12.webp'
],
'sweet': [],
'sugar-rush': []
};

function qs(name) {
try { return new URLSearchParams(location.search).get(name) || ''; }
catch (e) { return ''; }
}

var game = qs('game') || '';
var target = MAP[game] || (FALLBACK + '?game=' + encodeURIComponent(game));

var fill = document.getElementById('ldFill');
var pct  = document.getElementById('ldPct');
var bar  = document.getElementById('ldBar');
var totalBytes = 0;
var loadedBytes = 0;
var startTime = Date.now();
var MIN_DURATION = 1100;
function setProgress(ratio) {
var p = Math.max(0, Math.min(1, ratio));
var rounded = Math.min(99, Math.floor(p * 100));  // never show 100 until真的完成
if (p >= 1) rounded = 100;
if (fill) fill.style.width = (p * 100) + '%';
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

// safety net: if nothing downloaded in 8s, just go
setTimeout(function () {
if (loadedBytes === 0) finish();
}, 8000);

function parseAssets(html) {
var urls = [];
var re, m;
/* <link rel="stylesheet|preload|modulepreload" href="..."> */
re = /<link[^>]*\brel=["']?(?:stylesheet|preload|modulepreload)["']?[^>]*\bhref=["']([^"']+)["']/gi;
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
try {
var abs = new URL(u, location.origin + target);
u = abs.pathname + (abs.search || '');
} catch (e) { continue; }
}
// strip ?v=... so HEAD still works but keep it for cache-busting fetch
if (seen[u]) continue;
seen[u] = 1;
out.push({ type: urls[i].type, url: u });
}
return out;
}
function probeOne(url) {
return fetch(url, { method: 'HEAD', cache: 'force-cache', credentials: 'same-origin' })
.then(function (r) {
var len = parseInt(r.headers.get('content-length') || '0', 10) || 0;
return len;
})
.catch(function () { return 0; });
}

function downloadOne(url) {
return fetch(url, { cache: 'force-cache', credentials: 'same-origin' })
.then(function (r) {
if (!r.ok) return null;
// modern: stream chunk by chunk
if (r.body && r.body.getReader) {
var reader = r.body.getReader();
var pump = function () {
return reader.read().then(function (res) {
if (res.done) return;
if (res.value && res.value.byteLength) {
loadedBytes += res.value.byteLength;
setProgress(loadedBytes / Math.max(1, totalBytes));
}
return pump();
});
};
return pump();
}
// fallback: wait for whole body
return r.arrayBuffer().then(function (buf) {
loadedBytes += buf.byteLength;
setProgress(loadedBytes / Math.max(1, totalBytes));
});
})
.catch(function () { return null; });
}

function run() {
setProgress(0);
fetch(target, { cache: 'no-store', credentials: 'same-origin' })
.then(function (r) { return r.text(); })
.then(function (html) {
var assets = parseAssets(html);
var extra = EXTRA[game] || [];
for (var i = 0; i < extra.length; i++) {
var dup = false;
for (var j = 0; j < assets.length; j++) if (assets[j].url === extra[i]) { dup = true; break; }
if (!dup) assets.push({ type: 'asset', url: extra[i] });
}
if (!assets.length) { finish(); return; }
var n = assets.length;
// 1) probe byte lengths in parallel
Promise.all(assets.map(function (a) { return probeOne(a.url); }))
.then(function (lens) {
totalBytes = lens.reduce(function (a, b) { return a + b; }, 0);
if (!totalBytes) totalBytes = n * 30000; // fallback
// 2) download in parallel, streaming bytes into loadedBytes
var done = 0;
var promises = assets.map(function (a) {
return downloadOne(a.url).then(function () { done++; });
});
return Promise.all(promises).then(function () {
// ensure we show 100% before leaving
setProgress(1);
finish();
});
})
.catch(function () { finish(); });
})
.catch(function () { finish(); });
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', run);
} else {
run();
}
})();
