/* Apex Olympus - Free Spins UI overlay controller. */
(function (global) {
'use strict';
var introEl = null, panelEl = null, summaryEl = null;
var countEl = null, leftEl = null, multEl = null, collectedEl = null, summaryAmtEl = null;
var lastFocus = null;
var onContinue = null;
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
function showIntro(spins, cb) {
if (!ensure()) { cb && cb(); return; }
if (countEl) countEl.textContent = String(spins);
introEl.classList.remove('on');
void introEl.offsetWidth;
introEl.classList.add('on');
onContinue = function () {
introEl.classList.remove('on');
onContinue = null;
cb && cb();
};
var handler = function () {
introEl.removeEventListener('pointerdown', handler);
introEl.removeEventListener('touchstart', handler);
introEl.removeEventListener('click', handler);
if (onContinue) onContinue();
};
introEl.addEventListener('pointerdown', handler, { once: true });
introEl.addEventListener('touchstart', handler, { once: true });
introEl.addEventListener('click', handler, { once: true });
// safety: auto-continue after 8s if user never taps
clearTimeout(showIntro.__t);
showIntro.__t = setTimeout(function () {
if (onContinue) handler();
}, 8000);
if (global.OlympusFs) global.OlympusFs.__introTimer = showIntro.__t;
}
function showPanel() {
if (!ensure()) return;
panelEl.classList.add('on');
}
function hidePanel() {
if (!panelEl) return;
panelEl.classList.remove('on');
}
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
if (!ensure()) { cb && cb(); return; }
hidePanel();
if (summaryAmtEl) summaryAmtEl.textContent = fmt(totalWin);
summaryEl.classList.remove('on');
void summaryEl.offsetWidth;
summaryEl.classList.add('on');
var handler = function () {
summaryEl.removeEventListener('pointerdown', handler);
summaryEl.removeEventListener('touchstart', handler);
summaryEl.removeEventListener('click', handler);
summaryEl.classList.remove('on');
cb && cb();
};
summaryEl.addEventListener('pointerdown', handler, { once: true });
summaryEl.addEventListener('touchstart', handler, { once: true });
summaryEl.addEventListener('click', handler, { once: true });
}
function hideAll() {
if (introEl) introEl.classList.remove('on');
if (panelEl) panelEl.classList.remove('on');
if (summaryEl) summaryEl.classList.remove('on');
}
global.OlympusFs = Object.freeze({
showIntro: showIntro,
showPanel: showPanel,
hidePanel: hidePanel,
updatePanel: updatePanel,
showSummary: showSummary,
hideAll: hideAll
});
})(typeof window !== 'undefined' ? window : globalThis);
