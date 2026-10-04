/* Gates of Olympus · 前端主控（骨架版） */
(function () {
  'use strict';

  var GRID_COLS = 6;
  var GRID_ROWS = 5;
  var TOTAL_CELLS = GRID_COLS * GRID_ROWS;

  var BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  var betIdx = 0;
  var spinning = false;

  var url = new URL(location.href);
  var MODE = url.searchParams.get('mode') === 'real' ? 'real' : 'demo';

  var $ = function (id) { return document.getElementById(id); };
  var elGrid = $('ol-grid');
  var elSpin = $('ol-spin');
  var elBetVal = $('ol-bet-val');
  var elBetMinus = $('ol-bet-minus');
  var elBetPlus = $('ol-bet-plus');
  var elWinVal = $('ol-win-val');
  var elBalance = $('ol-balance');
  var elToast = $('ol-toast');

  function toast(msg) {
    if (!elToast) return;
    elToast.textContent = String(msg || '');
    elToast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { elToast.classList.remove('show'); }, 1800);
  }

  function renderGrid(placeholder) {
    if (!elGrid) return;
    var html = '';
    for (var i = 0; i < TOTAL_CELLS; i++) {
      html += '<div class="ol-cell' + (placeholder ? ' filled' : '') + '"></div>';
    }
    elGrid.innerHTML = html;
  }

  function setBet(idx) {
    if (idx < 0) idx = 0;
    if (idx >= BET_STEPS.length) idx = BET_STEPS.length - 1;
    betIdx = idx;
    if (elBetVal) elBetVal.textContent = String(BET_STEPS[idx]);
    if (elBetMinus) elBetMinus.disabled = (idx === 0);
    if (elBetPlus) elBetPlus.disabled = (idx === BET_STEPS.length - 1);
  }

  function getBet() { return BET_STEPS[betIdx]; }

  function setBalance(v) {
    if (!elBalance) return;
    elBalance.textContent = Number(v || 0).toLocaleString('en-US');
  }

  function setWin(v) {
    if (!elWinVal) return;
    elWinVal.textContent = Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
    elWinVal.classList.add('bump');
    setTimeout(function () { elWinVal.classList.remove('bump'); }, 220);
  }

  function onSpin() {
    if (spinning) { toast('请稍候'); return; }
    spinning = true;
    elSpin.disabled = true;
    elSpin.classList.add('spinning');
    // 骨架版：仅演示状态切换，不接 API
    setWin(0);
    toast('骨架版 · API 未接入 (' + MODE + ')');
    setTimeout(function () {
      spinning = false;
      elSpin.disabled = false;
      elSpin.classList.remove('spinning');
    }, 600);
  }

  function bind() {
    if (elSpin) elSpin.addEventListener('click', onSpin);
    if (elBetMinus) elBetMinus.addEventListener('click', function () { setBet(betIdx - 1); });
    if (elBetPlus) elBetPlus.addEventListener('click', function () { setBet(betIdx + 1); });
  }

  function init() {
    renderGrid(true);
    setBet(0);
    setBalance(MODE === 'demo' ? 10000 : 0);
    setWin(0);
    bind();
    document.documentElement.setAttribute('data-olympus-mode', MODE);
    console.info('[Olympus] 骨架就绪 · mode=' + MODE);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
