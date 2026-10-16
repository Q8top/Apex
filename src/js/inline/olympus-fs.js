/* Apex Olympus - Free Spins UI overlay controller. */
(function (global) {
'use strict';
var introEl = null, panelEl = null, summaryEl = null;
var countEl = null, leftEl = null, multEl = null, collectedEl = null, summaryAmtEl = null;
var onContinue = null;
var introTimer = 0;
var introHandler = null, summaryHandler = null;

function unbindAll(el, h) {
if (!el || !h) return;
el.removeEventListener('pointerdown', h);
el.removeEventListener('touchstart', h);
el.removeEventListener('click', h);
}

function ensure() {
if (introEl) return true;
introEl = document.getElementById('olFsIntro');
panelEl = document.getElementById('olFsPanel');
summaryEl = document.getElementById('olFsSummary');
countEl = document.getElementById('olFsCount');
leftEl = document.getElementById('olFsLeft');
multEl = document.getElementById('olFsMult');
collectedEl = document.getElementById('olFsCollected');
summaryAmtEl = document.getElementById('olFsSummaryAmount');
return !!(introEl && panelEl && summaryEl);
}
function fmt(n) { return '\u00A5' + n.toFixed(2); }
function clearIntroTimer() {
if (introTimer) { clearTimeout(introTimer); introTimer = 0; }
}
function bindOnce(el, handler) {
el.addEventListener('pointerdown', handler, { once: true });
el.addEventListener('touchstart', handler, { once: true });
el.addEventListener('click', handler, { once: true });
}

function showIntro(spins, cb) {
if (!ensure()) { if (cb) cb(); return; }
unbindAll(introEl, introHandler);
introHandler = null;
if (countEl) countEl.textContent = String(spins);
introEl.classList.remove('on');
void introEl.offsetWidth;
introEl.classList.add('on');
onContinue = function () {
introEl.classList.remove('on');
onContinue = null;
clearIntroTimer();
if (cb) cb();
};
var handler = function () {
unbindAll(introEl, handler);
introHandler = null;
if (onContinue) onContinue();
};
introHandler = handler;
bindOnce(introEl, handler);
clearIntroTimer();
introTimer = setTimeout(function () { if (onContinue) handler(); }, 8000);
}
function showPanel() { if (!ensure()) return; panelEl.classList.add('on'); }
function hidePanel() { if (!panelEl) return; panelEl.classList.remove('on'); }
function updatePanel(remaining, multSum, collected) {
if (!ensure()) return;
if (leftEl) leftEl.textContent = String(remaining);
if (multEl) multEl.textContent = (multSum > 0 ? multSum : 1) + '\u00D7';
if (collectedEl) {
collectedEl.innerHTML = '';
if (collected && collected.length) {
for (var i = 0; i < collected.length && i < 12; i++) {
var sp = document.createElement('span');
sp.textContent = collected[i] + '\u00D7';
collectedEl.appendChild(sp);
}
}
}
}
function showSummary(totalWin, cb) {
if (!ensure()) { if (cb) cb(); return; }
hidePanel();
unbindAll(summaryEl, summaryHandler);
summaryHandler = null;
if (summaryAmtEl) summaryAmtEl.textContent = fmt(totalWin);
summaryEl.classList.remove('on');
void summaryEl.offsetWidth;
summaryEl.classList.add('on');
var handler = function () {
unbindAll(summaryEl, handler);
summaryHandler = null;
summaryEl.classList.remove('on');
if (cb) cb();
};
summaryHandler = handler;
bindOnce(summaryEl, handler);
}
function hideAll() {
clearIntroTimer();
onContinue = null;
unbindAll(introEl, introHandler); introHandler = null;
unbindAll(summaryEl, summaryHandler); summaryHandler = null;
if (introEl) introEl.classList.remove('on');
if (panelEl) panelEl.classList.remove('on');
if (summaryEl) summaryEl.classList.remove('on');
}
function pauseTimer() { clearIntroTimer(); }
global.OlympusFs = Object.freeze({
showIntro: showIntro,
showPanel: showPanel,
hidePanel: hidePanel,
updatePanel: updatePanel,
showSummary: showSummary,
hideAll: hideAll,
pauseTimer: pauseTimer
});
})(typeof window !== 'undefined' ? window : globalThis);
