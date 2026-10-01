/* Lucky Fruit · UI 层
   负责：转轮渲染 / 下注控制 / 余额显示
   不负责：RNG、判定（由 SlotEngine 处理）
*/
(function(){
'use strict';

var C = window.SlotConfig;
var E = window.SlotEngine;
var SYM = window.SlotSymbols;

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false,
  reels: null
};

function betAmount() { return C.CONFIG.betSteps[state.betIndex]; }

function fmt(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ---------- 建 5 列转轮 DOM ---------- */
function buildReels() {
  var box = document.getElementById('slot-reels');
  if (!box) return;
  var mask = box.querySelector('.slot-reels-mask');
  box.innerHTML = '';
  if (mask) box.appendChild(mask);
  for (var c = 0; c < C.CONFIG.reels; c++) {
    var col = document.createElement('div');
    col.className = 'slot-reel';
    col.setAttribute('data-col', String(c));
    for (var r = 0; r < C.CONFIG.rows; r++) {
      var cell = document.createElement('div');
      cell.className = 'slot-reel-cell';
      cell.setAttribute('data-row', String(r));
      col.appendChild(cell);
    }
    box.appendChild(col);
  }
}

/* ---------- 把符号画到转轮（静止）---------- */
function renderReels(reels) {
  state.reels = reels;
  var box = document.getElementById('slot-reels');
  var cols = box.querySelectorAll('.slot-reel');
  for (var c = 0; c < cols.length; c++) {
    var cells = cols[c].querySelectorAll('.slot-reel-cell');
    for (var r = 0; r < cells.length; r++) {
      var symId = reels[c][r];
      var fn = SYM[symId];
      cells[r].innerHTML = fn ? fn() : '';
    }
  }
}

/* ---------- 余额 / 下注 ---------- */
function renderBalance() {
  var el = document.getElementById('slot-balance-value');
  if (el) el.textContent = fmt(state.balance);
}

function renderBet() {
  var el = document.getElementById('slot-bet-num');
  if (el) el.textContent = String(betAmount());
}

/* ---------- 下注按钮 ---------- */
function changeBet(dir) {
  if (state.spinning) return;
  var next = state.betIndex + dir;
  if (next < 0) next = 0;
  if (next >= C.CONFIG.betSteps.length) next = C.CONFIG.betSteps.length - 1;
  if (next === state.betIndex) return;
  state.betIndex = next;
  renderBet();
}

/* ---------- Spin（先只显示一次随机结果）---------- */
function doSpin() {
  if (state.spinning) return;
  var bet = betAmount();
  if (state.balance < bet) {
    alert('余额不足');
    return;
  }
  state.balance -= bet;
  renderBalance();

  var reels = E.spin();
  renderReels(reels);

  var result = E.evaluate(reels, bet);
  if (result.totalWin > 0) {
    state.balance += result.totalWin;
    renderBalance();
    var winEl = document.getElementById('slot-win-value');
    if (winEl) winEl.textContent = fmt(result.totalWin);
  } else {
    var w = document.getElementById('slot-win-value');
    if (w) w.textContent = '0';
  }
}

/* ---------- 绑定 ---------- */
function bind() {
  var minus = document.getElementById('slot-bet-minus');
  var plus = document.getElementById('slot-bet-plus');
  var spin = document.getElementById('slot-spin');
  var reset = document.getElementById('slot-reset');

  if (minus) minus.addEventListener('click', function(){ changeBet(-1); });
  if (plus) plus.addEventListener('click', function(){ changeBet(1); });
  if (spin) spin.addEventListener('click', doSpin);
  if (reset) reset.addEventListener('click', function(){
    if (!confirm('重置演示余额为 10,000？')) return;
    state.balance = C.CONFIG.initialBalance;
    renderBalance();
    var w = document.getElementById('slot-win-value');
    if (w) w.textContent = '0';
  });

  document.getElementById('slot-paytable').addEventListener('click', function(){ alert('赔付表开发中'); });
  document.getElementById('slot-help').addEventListener('click', function(){ alert('玩法说明开发中'); });
}

/* ---------- 启动 ---------- */
function init() {
  buildReels();
  renderBalance();
  renderBet();
  // 初始展示一组随机符号
  renderReels(E.spin());
  bind();
  console.log('[LuckyFruit] UI ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

})();
