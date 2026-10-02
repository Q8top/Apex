/* 幸运水果 · UI 层
   负责：DOM 渲染 / 交互 / 状态展示
   不负责：RNG、判定
*/
(function(){
'use strict';

var C = window.SlotConfig;
var E = window.SlotEngine;
var S = window.SlotSymbols;

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false,
  grid: null
};

/* ---------- 格式化 ---------- */
function fmt(n, withSign) {
  var v = Math.round(n * 100) / 100;
  var str = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (withSign && v > 0 ? '+' : '') + '¥' + str;
}
function bet() { return C.CONFIG.betSteps[state.betIndex]; }

/* ---------- 建 9 个格子（3×3）---------- */
function buildGrid() {
  var box = document.getElementById('reels');
  box.innerHTML = '';
  for (var i = 0; i < 9; i++) {
    var cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-idx', String(i));
    box.appendChild(cell);
  }
}

/* ---------- 渲染 grid ---------- */
/* grid[row][col] → 按行铺入 9 格 */
function renderGrid(grid, winPositions) {
  state.grid = grid;
  var cells = document.querySelectorAll('#reels .cell');
  var winSet = {};
  if (winPositions) {
    winPositions.forEach(function(p){ winSet[p.row + ',' + p.col] = 1; });
  }
  for (var r = 0; r < C.CONFIG.rows; r++) {
    for (var c = 0; c < C.CONFIG.reels; c++) {
      var idx = r * C.CONFIG.reels + c;
      var symId = grid[r][c];
      var fn = S[symId];
      var el = cells[idx];
      el.innerHTML = fn ? fn() : '';
      el.classList.toggle('winning', !!winSet[r + ',' + c]);
    }
  }
}

/* ---------- 顶部显示 ---------- */
function renderJackpot() { /* 静态展示，不动 */ }
function renderBalance() {
  document.getElementById('balance').textContent = fmt(state.balance);
}
function renderBet() {
  document.getElementById('bet').textContent = fmt(bet());
}
function renderWin(amount) {
  var el = document.getElementById('win-value');
  var label = document.getElementById('win-label');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  document.getElementById('won').textContent = amount > 0 ? fmt(amount) : '¥0';
  if (amount > 0) {
    label.textContent = '恭喜中奖';
  } else {
    label.textContent = '本局中奖';
  }
}

/* ---------- 下注 ---------- */
function changeBet(dir) {
  if (state.spinning) return;
  var next = state.betIndex + dir;
  if (next < 0) next = 0;
  if (next >= C.CONFIG.betSteps.length) next = C.CONFIG.betSteps.length - 1;
  if (next === state.betIndex) return;
  state.betIndex = next;
  renderBet();
}

/* ---------- 旋转 ---------- */
function doSpin() {
  if (state.spinning) return;
  var b = bet();
  if (state.balance < b) {
    alert('余额不足，请重置余额');
    return;
  }
  state.spinning = true;
  document.getElementById('spin').disabled = true;

  // 扣下注
  state.balance -= b;
  renderBalance();
  renderWin(0);

  // 立即出新结果（先不做滚动动画）
  var grid = E.spin();
  var result = E.evaluate(grid, b);

  // 收集中奖位置用于高亮
  var winPos = [];
  if (result.wins.length > 0) {
    result.wins.forEach(function(w){
      w.positions.forEach(function(p){ winPos.push(p); });
    });
  }
  renderGrid(grid, winPos);

  // 中奖加余额
  if (result.totalWin > 0) {
    state.balance += result.totalWin;
    renderBalance();
    renderWin(result.totalWin);
  }

  state.spinning = false;
  document.getElementById('spin').disabled = false;
}

/* ---------- 重置余额 ---------- */
function resetBalance() {
  if (state.spinning) return;
  if (!confirm('重置余额为 ¥1,000.00？')) return;
  state.balance = C.CONFIG.initialBalance;
  renderBalance();
  renderWin(0);
}

/* ---------- 绑定事件 ---------- */
function bind() {
  document.getElementById('bet-minus').addEventListener('click', function(){ changeBet(-1); });
  document.getElementById('bet-plus').addEventListener('click', function(){ changeBet(1); });
  document.getElementById('spin').addEventListener('click', doSpin);
  document.getElementById('btn-max').addEventListener('click', function(){
    if (state.spinning) return;
    state.betIndex = C.CONFIG.betSteps.length - 1;
    renderBet();
  });
  document.getElementById('btn-auto').addEventListener('click', function(){ alert('自动旋转开发中'); });
  document.getElementById('btn-help').addEventListener('click', function(){ alert('玩法说明开发中'); });
  document.getElementById('btn-menu').addEventListener('click', function(){ resetBalance(); });
  document.getElementById('btn-sound').addEventListener('click', function(){ alert('音效开关开发中'); });
  document.getElementById('btn-settings').addEventListener('click', function(){ alert('设置开发中'); });
}

/* ---------- 启动 ---------- */
function init() {
  buildGrid();
  renderBalance();
  renderBet();
  renderWin(0);
  // 初始展示一组随机符号
  renderGrid(E.spin(), null);
  bind();
  console.log('[幸运水果] UI 就绪');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

})();
