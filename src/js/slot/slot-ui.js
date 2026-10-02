/* 幸运水果 · UI（高级版） */
(function(){
'use strict';

var C = window.SlotConfig, E = window.SlotEngine,
    S = window.SlotSymbols, A = window.SlotAudio;

var LS = 'apex_slot_v2';

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false,
  grid: null,
  history: [],
  autoOn: false,
  soundOn: true
};

function save() {
  try { localStorage.setItem(LS, JSON.stringify({
    balance: state.balance, betIndex: state.betIndex,
    history: state.history.slice(0, 50), soundOn: state.soundOn
  })); } catch (e) {}
}
function load() {
  try {
    var d = JSON.parse(localStorage.getItem(LS) || '{}');
    if (typeof d.balance === 'number') state.balance = d.balance;
    if (typeof d.betIndex === 'number') state.betIndex = d.betIndex;
    if (Array.isArray(d.history)) state.history = d.history;
    if (typeof d.soundOn === 'boolean') state.soundOn = d.soundOn;
  } catch (e) {}
}
function fmt(n, sign) {
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet() { return C.CONFIG.betSteps[state.betIndex]; }
function $(id) { return document.getElementById(id); }

function toast(msg, ms) {
  var t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){ t.classList.remove('show'); }, ms || 1500);
}
function flash(big) {
  var el = $('flash'); if (!el) return;
  el.classList.add('show');
  if (big) el.classList.add('big');
  setTimeout(function(){
    el.classList.remove('show', 'big');
  }, big ? 2400 : 600);
}
function bump(el) {
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function buildGrid() {
  var box = $('reels'); box.innerHTML = '';
  for (var i = 0; i < 9; i++) {
    var c = document.createElement('div');
    c.className = 'cell';
    box.appendChild(c);
  }
}
function cellAt(row, col) {
  return document.querySelectorAll('#reels .cell')[row * 3 + col];
}
function paintColStatic(colIdx, syms) {
  for (var r = 0; r < 3; r++) {
    var el = cellAt(r, colIdx);
    var fn = S[syms[r]];
    el.innerHTML = fn ? fn() : '';
    el.classList.remove('spinning', 'settling', 'winning');
  }
}
function renderBalance() { $('balance').textContent = fmt(state.balance); }
function renderBet() {
  $('bet').textContent = fmt(bet());
  $('bet-txt').textContent = '下注 ' + fmt(bet());
}
function renderWin(amount) {
  var el = $('win-value');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  if (amount > 0) {
    el.classList.remove('pulsing');
    void el.offsetWidth;
    el.classList.add('pulsing');
  }
  $('win-label').textContent = amount > 0 ? '恭喜中奖' : '本局中奖';
  $('won').textContent = amount > 0 ? fmt(amount) : '¥0';
}

/* ---------- 逐列滚动：CSS 类驱动，性能好 ---------- */
function spinReel(colIdx, targetCol, duration, onDone) {
  var cells = [cellAt(0, colIdx), cellAt(1, colIdx), cellAt(2, colIdx)];
  var pool = Object.keys(C.WEIGHTS);
  cells.forEach(function(c){ c.classList.remove('winning'); c.classList.add('spinning'); });

  var start = performance.now();
  var lastTick = 0;
  var tickEvery = 60;

  function loop(now) {
    var el = now - start;
    if (el - lastTick >= tickEvery) {
      lastTick = el;
      for (var r = 0; r < 3; r++) {
        var rnd = pool[Math.floor(E.randFloat() * pool.length)];
        var fn = S[rnd];
        cells[r].innerHTML = fn ? fn() : '';
      }
    }
    if (el < duration) requestAnimationFrame(loop);
    else {
      // 定格：先移除 spinning，加 settling
      for (var r2 = 0; r2 < 3; r2++) {
        var fn2 = S[targetCol[r2]];
        cells[r2].innerHTML = fn2 ? fn2() : '';
        cells[r2].classList.remove('spinning');
        cells[r2].classList.add('settling');
        (function(el2){
          setTimeout(function(){ el2.classList.remove('settling'); }, 480);
        })(cells[r2]);
      }
      A.reelStop(colIdx);
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(loop);
}

function doSpin() {
  if (state.spinning) return;
  var b = bet();
  if (state.balance < b) {
    A.lose();
    toast('余额不足，请重置余额');
    var sb = $('spin'); sb.classList.add('shake');
    setTimeout(function(){ sb.classList.remove('shake'); }, 420);
    stopAuto();
    return;
  }

  document.querySelectorAll('#reels .cell').forEach(function(c){
    c.classList.remove('winning', 'settling');
  });
  renderWin(0);

  state.spinning = true;
  var spinBtn = $('spin');
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning');
  $('reels').classList.add('active');

  state.balance -= b;
  renderBalance();
  A.spinStart();

  var grid = E.spin();
  var result = E.evaluate(grid, b);
  state.grid = grid;

  var cols = [[], [], []];
  for (var c = 0; c < 3; c++)
    for (var r = 0; r < 3; r++) cols[c].push(grid[r][c]);

  var baseDelay = C.CONFIG.minSpinMs;
  var stagger = 200;
  var done = 0;

  [0, 1, 2].forEach(function(c){
    var dur = baseDelay + c * stagger * 1.6;
    spinReel(c, cols[c], dur, function(){
      done++;
      if (done === 3) setTimeout(function(){ finishSpin(result, b); }, 260);
    });
  });
}

function finishSpin(result, betAmount) {
  if (result.totalWin > 0) {
    state.balance += result.totalWin;
    renderBalance();
    renderWin(result.totalWin);
    bump($('balance'));
    bump($('won'));

    // 高亮所有中奖格
    result.wins.forEach(function(w){
      w.positions.forEach(function(p){
        var el = cellAt(p.row, p.col);
        if (el) el.classList.add('winning');
      });
    });

    // 音效 & 闪光分级
    var ratio = result.totalWin / betAmount;
    if (ratio >= 10) { A.winBig(); flash(true); }
    else if (ratio >= 2) { A.winMedium(); flash(false); }
    else { A.winSmall(); }
  } else {
    A.lose();
  }

  var delta = result.totalWin - betAmount;
  state.history.unshift({
    bet: betAmount, win: result.totalWin, delta: delta,
    ts: Date.now(), grid: result.grid || state.grid
  });
  state.history = state.history.slice(0, 50);
  save();

  state.spinning = false;
  var sb = $('spin'); sb.disabled = false;
  sb.classList.remove('spinning');
  $('reels').classList.remove('active');

  // 自动模式：无限循环直到用户点击停止
  if (state.autoOn) {
    setTimeout(function(){
      if (state.autoOn) doSpin();
    }, 800);
  }
}

function startAuto() {
  if (state.spinning || state.autoOn) return;
  state.autoOn = true;
  var btn = $('btn-auto');
  btn.classList.add('active');
  btn.querySelector('span').textContent = '停止';
  toast('自动模式开启，点击停止结束');
  doSpin();
}
function stopAuto() {
  state.autoOn = false;
  var btn = $('btn-auto');
  if (btn) {
    btn.classList.remove('active');
    var sp = btn.querySelector('span');
    if (sp) sp.textContent = '自动';
  }
}

function changeBet(dir) {
  if (state.spinning) return;
  var n = state.betIndex + dir;
  if (n < 0) n = 0;
  if (n >= C.CONFIG.betSteps.length) n = C.CONFIG.betSteps.length - 1;
  if (n === state.betIndex) return;
  state.betIndex = n;
  renderBet(); A.click(); save();
}

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
    var s = C.SYMBOLS[id], mult = C.PAYOUTS[id];
    var svg = S[id] ? S[id]() : '';
    html += '<div class="sym-row"><div class="sym-icon">' + svg + '</div>' +
      '<div class="sym-info"><div class="sym-name">' + s.name + '</div>' +
      '<div class="sym-pay">3 个相同 → ×' + mult + '</div></div></div>';
  });
  html += '<h4>中奖线</h4><p>共 5 条：横排 3 条 + 对角线 2 条</p>' +
    '<h4>百搭（Wild）</h4><p>可替代除自己以外的任意符号，帮助凑成三连。</p>';
  openModal('赔付表', html);
}

function showHistory() {
  if (state.history.length === 0) {
    openModal('游戏记录', '<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>');
    return;
  }
  var totalBet = 0, totalWin = 0, wins = 0;
  state.history.forEach(function(h){ totalBet += h.bet; totalWin += h.win; if (h.win > 0) wins++; });

  var head = '<div class="hist-summary">' +
    '<div><span>总局数</span><b>' + state.history.length + '</b></div>' +
    '<div><span>中奖次数</span><b>' + wins + '</b></div>' +
    '<div><span>总下注</span><b>' + fmt(totalBet) + '</b></div>' +
    '<div><span>总中奖</span><b>' + fmt(totalWin) + '</b></div>' +
    '</div><h4 style="margin-top:18px;">最近记录</h4>';

  var rows = '';
  state.history.forEach(function(h){
    var cls = h.delta > 0 ? 'win' : 'lose';
    var txt = (h.delta > 0 ? '+' : '') + '¥' + h.delta.toFixed(2);
    var t = new Date(h.ts);
    var hh = String(t.getHours()).padStart(2, '0');
    var mm = String(t.getMinutes()).padStart(2, '0');
    rows += '<div class="hist-row">' +
      '<div><div style="font-weight:700;">下注 ' + fmt(h.bet) + '</div>' +
      '<div style="font-size:12px;color:#999;">' + hh + ':' + mm +
      ' · 中奖 ' + fmt(h.win) + '</div></div>' +
      '<div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openModal('游戏记录', head + rows);
}

function resetBalance() {
  if (state.spinning) return;
  if (!confirm('重置余额为 ¥1,000.00？记录会清空。')) return;
  state.balance = C.CONFIG.initialBalance;
  state.betIndex = C.CONFIG.defaultBetIndex;
  state.history = [];
  save();
  renderBalance();
  renderBet();
  renderWin(0);
  toast('已重置');
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn ? '1' : '0.35';
  save();
  if (state.soundOn) A.click();
}

function bind() {
  $('bet-minus').addEventListener('click', function(){ changeBet(-1); });
  $('bet-plus').addEventListener('click', function(){ changeBet(1); });
  $('spin').addEventListener('click', function(){ A.init(); doSpin(); });
  $('btn-auto').addEventListener('click', function(){
    if (state.autoOn) stopAuto(); else startAuto();
  });
  $('btn-history').addEventListener('click', showHistory);
  $('btn-paytable').addEventListener('click', showPaytable);
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-menu').addEventListener('click', resetBalance);
  $('modal-x').addEventListener('click', closeModal);
  document.querySelector('.modal-mask').addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e){
    if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault(); A.init(); doSpin();
    } else if (e.key === 'ArrowUp') { e.preventDefault(); changeBet(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); changeBet(-1); }
    else if (e.key === 'Escape') { closeModal(); stopAuto(); }
  });
}

function init() {
  load();
  A.enabled(state.soundOn);
  $('btn-sound').style.opacity = state.soundOn ? '1' : '0.35';
  buildGrid();
  renderBalance();
  renderBet();
  renderWin(0);
  var g = E.spin();
  for (var c = 0; c < 3; c++) {
    var col = [];
    for (var r = 0; r < 3; r++) col.push(g[r][c]);
    paintColStatic(c, col);
  }
  bind();
  console.log('[幸运水果] 高级版就绪');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
