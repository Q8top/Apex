/* Apex Olympus - Big Win celebration overlay. */
(function (global) {
'use strict';
var overlay = null, textEl = null, amountEl = null, hideTimer = 0;
var TIERS = [
{ min: 5000, label: 'MAX WIN',   cls: 'is-max' },
{ min: 100,  label: 'EPIC WIN',  cls: 'is-epic' },
{ min: 50,   label: 'SUPER WIN', cls: 'is-super' },
{ min: 25,   label: 'MEGA WIN',  cls: 'is-mega' },
{ min: 10,   label: 'BIG WIN',   cls: 'is-big' }
];
function tierFor(x) {
for (var i = 0; i < TIERS.length; i++) {
if (x >= TIERS[i].min) return TIERS[i];
}
return null;
}
function ensure() {
if (overlay) return true;
overlay = document.getElementById('olBigWin');
if (!overlay) return false;
textEl = overlay.querySelector('.ol-bigwin-text');
amountEl = overlay.querySelector('.ol-bigwin-amount');
return true;
}
function fmt(n) { return '\u00A5' + n.toFixed(2); }
function play(winX) {
if (!ensure()) return;
var tier = tierFor(winX);
if (!tier) return;
// reset
overlay.className = 'ol-bigwin';
void overlay.offsetWidth;
overlay.classList.add('on', tier.cls);
textEl.textContent = tier.label;
// roll the number from 0 to winX over ~1.2s
var dur = 1200;
var start = performance.now();
var from = 0, to = winX;
function roll(now) {
var t = Math.min(1, (now - start) / dur);
var e = 1 - Math.pow(1 - t, 3);
amountEl.textContent = fmt(from + (to - from) * e);
if (t < 1) requestAnimationFrame(roll);
}
requestAnimationFrame(roll);
// auto-hide
if (hideTimer) clearTimeout(hideTimer);
var stay = tier.cls === 'is-max' ? 4200 : (tier.cls === 'is-epic' ? 3600 : 2800);
hideTimer = setTimeout(hide, stay);
}
function hide() {
if (!overlay) return;
overlay.classList.remove('on');
if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
}
global.OlympusBigWin = Object.freeze({
play: play,
hide: hide,
tierFor: tierFor
});
})(typeof window !== 'undefined' ? window : globalThis);
