/* 幸运水果 · UI 层（完整） */
(function(){
'use strict';

var C = window.SlotConfig, E = window.SlotEngine,
    S = window.SlotSymbols, A = window.SlotAudio;

var LS_KEY = 'apex_slot_v1';

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false,
  grid: null,
  history: [],
  autoOn: false,
  autoLeft: 0,
  soundOn: true
};

/* ---------- 持久化 ---------- */
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({
    balance: state.balance, betIndex: state.betIndex,
    history: state.history.slice(0, 20), soundOn: state.soundOn
  })); } catch (e) {}
}
function load() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    var d = JSON.parse(raw);
    if (typeof d.balance === 'number') state.balance = d.balance;
    if (typeof d.betIndex === 'number') state.betIndex = d.betIndex;
    if (Array.isArray(d.history)) state.history = d.history;
    if (typeof d.soundOn === 'boolean') state.soundOn = d.soundOn;
  } catch (e) {}
}

/* ---------- 工具 ---------- */
function fmt(n, sign) {
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet() { return C.CONFIG.betSteps[state.betIndex]; }
function $(id) { return document.getElementById(id); }

function toast(msg, ms) {
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){ t.classList.remove('show'); }, ms || 1800);
}

/* ---------- 建 9 格 ---------- */
function buildGrid() {
  var box = $('reels');
  box.innerHTML = '';
  for (var i = 0; i < 9; i++) {
    var c = document.createElement('div');
    c.className = 'cell';
    c.setAttribute('data-idx', String(i));
    box.appendChild(c);
  }
}

/* 立即绘制某列的 3 格（一次落定，滚动动画用别的函数） */
function paintCol(colIdx, symbols) {
  var cells = document.querySelectorAll('#reels .cell');
  for (var r = 0; r < 3; r++) {
    var idx = r * 3 + colIdx;
    var el = cells[idx];
    var fn = S[symbols[r]];
    el.innerHTML = fn ? fn() : '';
    el.classList.remove('spinning', 'winning');
  }
}

/* ---------- 转轮逐列动画 ----------
   每列先在容器里做上下跳跃，然后落入目标
   简化但流畅：每列用 requestAnimationFrame 随机字符跳动，然后定格
*/
function spinReel(colIdx, targetCol, stopDelay, onStop) {
  var cells = document.querySelectorAll('#reels .cell');
  var colCells = [];
  for (var r = 0; r < 3; r++) colCells.push(cells[r * 3 + colIdx]);
  colCells.forEach(function(c){ c.classList.add('spinning'); });

  var startTime = performance.now();
  var lastFrame = 0;
  var pool = Object.keys(C.WEIGHTS);
  var tickEvery = 55; // ms 换一次随机符号

  function frame(now) {
    var elapsed = now - startTime;
    if (elapsed - lastFrame >= tickEvery) {
      lastFrame = elapsed;
      for (var r = 0; r < 3; r++) {
        var rnd = pool[Math.floor(E.randFloat() * pool.length)];
        var fn = S[rnd];
        colCells[r].innerHTML = fn ? fn() : '';
      }
    }
    if (elapsed < stopDelay) {
      requestAnimationFrame(frame);
    } else {
      // 定格
      for (var r2 = 0; r2 < 3; r2++) {
        var fn2 = S[targetCol[r2]];
        colCells[r2].innerHTML = fn2 ? fn2() : '';
        colCells[r2].classList.remove('spinning');
      }
      A.reelStop(colIdx);
      if (onStop) onStop();
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- 渲染 ---------- */
function renderBalance() { $('balance').textContent = fmt(state.balance); }
function renderBet() {
  $('bet').textContent = fmt(bet());
  $('bet-txt').textContent = '下注 ' + fmt(bet());
}
function renderWin(amount) {
  var el = $('win-value');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  $('win-label').textContent = amount > 0 ? '恭喜中奖' : '本局中奖';
  $('won').textContent = amount > 0 ? fmt(amount) : '¥0';
}

/* ---------- 中奖高亮 ---------- */
function highlightWins(wins) {
  var cells = document.querySelectorAll('#reels .cell');
  wins.forEach(function(w){
    w.positions.forEach(function(p){
      var idx = p.row * 3 + p.col;
      if (cells[idx]) cells[idx].classList.add('winning');
    });
  });
  var totalWin = wins.reduce(function(s, w){ return s + w.amount; }, 0);
  if (totalWin >= bet() * 10) A.winBig();
  else if (totalWin >= bet() * 2) A.winMedium();
  else A.winSmall();
}

/* ---------- Spin 主流程 ---------- */
function doSpin() {
  if (state.spinning) return;
  var b = bet();
  if (state.balance < b) {
    A.lose();
    toast('余额不足，请重置余额');
    stopAuto();
    return;
  }

  // 清空高亮
  document.querySelectorAll('#reels .cell').forEach(function(c){
    c.classList.remove('winning');
  });
  renderWin(0);

  state.spinning = true;
  $('spin').disabled = true;
  $('spin').classList.add('spinning');

  // 扣下注
  state.balance -= b;
  renderBalance();
  A.spinStart();

  // 生成结果
  var grid = E.spin();          // grid[row][col]
  var result = E.evaluate(grid, b);
  state.grid = grid;

  // 各列目标（列 → 行数组）
  var cols = [[], [], []];
  for (var c = 0; c < 3; c++) {
    for (var r = 0; r < 3; r++) cols[c].push(grid[r][c]);
  }

  // 依次停止：col0 提前，col1 中间，col2 最晚
  var baseDelay = C.CONFIG.minSpinMs;
  var stagger = C.CONFIG.reelStopDelayMs;
  var done = 0;

  [0, 1, 2].forEach(function(c){
    var stopDelay = baseDelay + c * stagger * 3;
    spinReel(c, cols[c], stopDelay, function(){
      done++;
      if (done === 3) {
        finishSpin(result, b);
      }
    });
  });
}

/* ---------- 收尾 ---------- */
function finishSpin(result, betAmount) {
  // 中奖处理
  if (result.totalWin > 0) {
    state.balance += result.totalWin;
    renderBalance();
    renderWin(result.totalWin);
    highlightWins(result.wins);
  } else {
    A.lose();
  }

  // 记录
  var delta = result.totalWin - betAmount;
  state.history.unshift({
    bet: betAmount, win: result.totalWin,
    delta: delta, ts: Date.now()
  });
  state.history = state.history.slice(0, 30);
  save();

  state.spinning = false;
  $('spin').disabled = false;
  $('spin').classList.remove('spinning');

  // 自动模式
  if (state.autoOn && state.autoLeft > 0) {
    state.autoLeft--;
    if (state.autoLeft === 0) {
      stopAuto();
    } else {
      setTimeout(doSpin, 700);
    }
  }
}

/* ---------- 自动 ---------- */
function startAuto() {
  if (state.spinning || state.autoOn) return;
  state.autoOn = true;
  state.autoLeft = 10;
  $('btn-auto').classList.add('active');
  toast('自动 10 次开始');
  doSpin();
}
function stopAuto() {
  state.autoOn = false;
  state.autoLeft = 0;
  $('btn-auto').classList.remove('active');
}

/* ---------- 下注 ---------- */
function changeBet(dir) {
  if (state.spinning) return;
  var n = state.betIndex + dir;
  if (n < 0) n = 0;
  if (n >= C.CONFIG.betSteps.length) n = C.CONFIG.betSteps.length - 1;
  if (n === state.betIndex) return;
  state.betIndex = n;
  renderBet();
  A.click();
  save();
}

/* ---------- 弹窗 ---------- */
function openModal(title, html) {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = html;
  $('modal').classList.add('show');
  $('modal').setAttribute('aria-hidden', 'false');
}
function closeModal() {
  $('modal').classList.remove('show');
  $('modal').setAttribute('aria-hidden', 'true');
}

function showPaytable() {
  var order = ['cherry','lemon','orange','grape','watermelon','bell','bar','seven','goldenSeven','wild'];
  var html = '';
  order.forEach(function(id){
    var s = C.SYMBOLS[id];
    var mult = C.PAYOUTS[id];
    var svg = S[id] ? S[id]() : '';
    html += '<div class="sym-row"><div class="sym-icon">' + svg + '</div>' +
      '<div class="sym-info"><div class="sym-name">' + s.name + '</div>' +
      '<div class="sym-pay">3 个相同 → ×' + mult + '</div></div></div>';
  });
  html += '<h4>中奖线</h4><p>共 5 条：3 条横线 + 2 条对角线</p>' +
    '<h4>百搭</h4><p>百搭（Wild）可替代除自己以外的任意符号。</p>';
  openModal('赔付表', html);
}

function showHistory() {
  if (state.history.length === 0) {
    openModal('游戏记录', '<p style="text-align:center;padding:20px 0;color:#999;">暂无记录</p>');
    return;
  }
  var html = '';
  state.history.forEach(function(h){
    var cls = h.delta > 0 ? 'win' : 'lose';
    var txt = (h.delta > 0 ? '+' : '') + '¥' + h.delta.toFixed(2);
    var time = new Date(h.ts);
    var hh = String(time.getHours()).padStart(2, '0');
    var mm = String(time.getMinutes()).padStart(2, '0');
    html += '<div class="hist-row"><div><div style="font-weight:700;">下注 ¥' + h.bet.toFixed(2) +
      '</div><div style="font-size:12px;color:#999;">' + hh + ':' + mm + '</div></div>' +
      '<div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openModal('游戏记录', html);
}

/* ---------- 重置 ---------- */
function resetBalance() {
  if (state.spinning) return;
  if (!confirm('重置余额为 ¥1,000.00？')) return;
  state.balance = C.CONFIG.initialBalance;
  state.betIndex = C.CONFIG.defaultBetIndex;
  state.history = [];
  save();
  renderBalance();
  renderBet();
  renderWin(0);
  toast('已重置');
}

/* ---------- 音效开关 ---------- */
function toggleSound() {
  state.soundOn = !state.soundOn;
  A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn ? '1' : '0.35';
  save();
  if (state.soundOn) A.click();
}

/* ---------- 绑定 ---------- */
function bind() {
  $('bet-minus').addEventListener('click', function(){ changeBet(-1); });
  $('bet-plus').addEventListener('click', function(){ changeBet(1); });
  $('spin').addEventListener('click', function(){
    A.init();
    doSpin();
  });
  $('btn-auto').addEventListener('click', function(){
    if (state.autoOn) stopAuto(); else startAuto();
  });
  $('btn-history').addEventListener('click', showHistory);
  $('btn-paytable').addEventListener('click', showPaytable);
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-menu').addEventListener('click', resetBalance);
  $('modal-x').addEventListener('click', closeModal);
  document.querySelector('.modal-mask').addEventListener('click', closeModal);

  // 键盘
  document.addEventListener('keydown', function(e){
    if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault(); A.init(); doSpin();
    } else if (e.key === 'ArrowUp') { e.preventDefault(); changeBet(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); changeBet(-1); }
    else if (e.key === 'Escape') { closeModal(); }
  });
}

/* ---------- 启动 ---------- */
function init() {
  load();
  A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn ? '1' : '0.35';
  buildGrid();
  renderBalance();
  renderBet();
  renderWin(0);
  // 初始静止画面
  var g = E.spin();
  for (var c = 0; c < 3; c++) {
    var col = [];
    for (var r = 0; r < 3; r++) col.push(g[r][c]);
    paintCol(c, col);
  }
  bind();
  console.log('[幸运水果] 就绪');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
