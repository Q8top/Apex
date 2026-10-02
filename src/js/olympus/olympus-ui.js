/* 奥林匹斯之门 · UI */
(function(){
'use strict';

var C = window.OlympusConfig, E = window.OlympusEngine, S = window.OlympusSymbols;

var MODE = (function(){
  var m = String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v = m ? m[1].toLowerCase() : 'demo';
  return v === 'real' ? 'real' : 'demo';
})();

var LS_STATE = 'apex_olympus_v2_' + MODE + '_state';
var LS_HIST  = 'apex_olympus_v2_' + MODE + '_history';

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false, grid: null, history: [],
  autoOn: false, ready: false, safetyTimer: null
};

function $(id){ return document.getElementById(id); }
function fmt(n, sign){
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet(){ return C.CONFIG.betSteps[state.betIndex]; }
function toast(m, ms){
  var t = $('ol-toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(function(){ t.classList.remove('show'); }, ms || 1500);
}

/* 存储 */
function loadState(){
  try {
    var d = JSON.parse(localStorage.getItem(LS_STATE) || '{}');
    if (typeof d.balance === 'number' && d.balance >= 0) state.balance = d.balance;
    else state.balance = C.CONFIG.initialBalance;
    if (typeof d.betIndex === 'number') state.betIndex = d.betIndex;
  } catch(e){ state.balance = C.CONFIG.initialBalance; }
}
function saveState(){
  if (MODE === 'real') return;
  try { localStorage.setItem(LS_STATE, JSON.stringify({balance: state.balance, betIndex: state.betIndex})); } catch(e){}
}
function loadHist(){ try { var d = JSON.parse(localStorage.getItem(LS_HIST) || '[]'); if (Array.isArray(d)) state.history = d.slice(0, 30); } catch(e){} }
function saveHist(){ try { localStorage.setItem(LS_HIST, JSON.stringify(state.history.slice(0, 30))); } catch(e){} }

/* 远端 */
function getCsrf(){
  var m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

/* 网格 */
function buildGrid(){
  var box = $('ol-grid'); box.innerHTML = '';
  for (var i = 0; i < C.CONFIG.rows * C.CONFIG.cols; i++) {
    var c = document.createElement('div');
    c.className = 'ol-cell';
    c.setAttribute('data-idx', String(i));
    box.appendChild(c);
  }
}
function cellAt(r, c){ return document.querySelectorAll('#ol-grid .ol-cell')[r * C.CONFIG.cols + c]; }
function paintGrid(grid, animate){
  for (var r = 0; r < C.CONFIG.rows; r++) {
    for (var c = 0; c < C.CONFIG.cols; c++) {
      var el = cellAt(r, c); if (!el) continue;
      var fn = S[grid[r][c]];
      el.innerHTML = fn ? fn() : '';
      el.classList.remove('winning', 'popping');
    }
  }
}
function highlightCells(cells, on){
  cells.forEach(function(p){
    var el = cellAt(p[0], p[1]);
    if (el) el.classList.toggle('winning', !!on);
  });
}

/* 渲染 */
function renderBalance(){ $('ol-balance').textContent = fmt(state.balance); }
function renderBet(){
  $('ol-bet').textContent = fmt(bet());
  $('ol-bet-txt').textContent = '下注 ' + fmt(bet());
}
function renderWin(amount, combo){
  var el = $('ol-win-value');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  $('ol-win-label').textContent = amount > 0 ? '恭喜中奖' : '本局中奖';
  var cb = $('ol-combo');
  if (combo) { cb.textContent = combo; cb.classList.add('show'); }
  else { cb.textContent = ''; cb.classList.remove('show'); }
}

/* 旋转动画：6 列落停 */
function spinReel(c, duration, onDone){
  var cells = [];
  for (var r = 0; r < C.CONFIG.rows; r++) cells.push(cellAt(r, c));
  var pool = Object.keys(C.SYMBOLS);
  var start = performance.now(), lastTick = 0, every = 55;
  function loop(now){
    var el = now - start;
    if (el - lastTick >= every) {
      lastTick = el;
      for (var r = 0; r < C.CONFIG.rows; r++) {
        var rnd = pool[Math.floor(E.randFloat() * pool.length)];
        cells[r].innerHTML = S[rnd] ? S[rnd]() : '';
      }
    }
    if (el < duration) requestAnimationFrame(loop);
    else { if (onDone) onDone(); }
  }
  requestAnimationFrame(loop);
}

/* Spin */
function doSpin(){
  if (state.spinning || !state.ready) return;
  var b = bet();
  if (state.balance < b) {
    toast('余额不足' + (MODE === 'demo' ? '，请重置' : '，请充值'));
    stopAuto(); return;
  }
  document.querySelectorAll('#ol-grid .ol-cell').forEach(function(c){
    c.classList.remove('winning', 'popping');
  });
  renderWin(0);

  state.spinning = true;
  var sb = $('ol-spin'); sb.disabled = true; sb.classList.add('spinning');
  if (state.safetyTimer) clearTimeout(state.safetyTimer);
  state.safetyTimer = setTimeout(function(){
    if (state.spinning) {
      console.warn('[Olympus] safety release');
      paintGrid(state.grid || E.spin(), false);
      releaseSpin(); stopAuto();
    }
  }, 8000);

  var result;
  try {
    result = (MODE === 'demo') ? E.spinDemo(b) : E.playFullSpin(b);
    state.grid = result.finalGrid;
  } catch(e) {
    console.error('[Olympus] engine error:', e);
    releaseSpin(); return;
  }

  var firstGrid = result.rounds.length ? result.rounds[0].grid : result.finalGrid;
  var baseDelay = 500, stagger = 120, done = 0;
  [0,1,2,3,4,5].forEach(function(c){
    var dur = baseDelay + c * stagger;
    spinReel(c, dur, function(){
      done++;
      if (done === 6) {
        paintGrid(firstGrid, false);
        setTimeout(function(){ playRounds(result, b); }, 250);
      }
    });
  });
}

/* 逐轮播放（无递归） */
function playRounds(result, betAmt){
  var rounds = result.rounds;
  var totalShown = 0;
  var i = 0;

  function playOne(){
    if (i >= rounds.length) { finish(totalShown); return; }
    var rd = rounds[i];
    if (!rd || !rd.wins || rd.wins.length === 0) { i++; playOne(); return; }
    var cells = [];
    rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
    highlightCells(cells, true);
    totalShown += rd.roundWin;
    renderWin(totalShown, '×' + rd.multiplier + ' 倍');
    setTimeout(function(){
      cells.forEach(function(p){
        var el = cellAt(p[0], p[1]);
        if (el) el.classList.add('popping');
      });
      setTimeout(function(){
        highlightCells(cells, false);
        i++;
        if (i < rounds.length && rounds[i] && rounds[i].grid) {
          paintGrid(rounds[i].grid, false);
          setTimeout(playOne, 250);
        } else { finish(totalShown); }
      }, 220);
    }, 500);
  }
  playOne();
}

function finish(totalWin){
  if (MODE === 'demo') {
    state.balance = state.balance - bet() + totalWin;
    renderBalance(); saveState();
    afterSettle(totalWin);
  } else {
    fetch('/api/slot/spin', {
      method: 'POST', credentials: 'include',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf()},
      body: JSON.stringify({bet: bet(), totalWin: totalWin})
    }).then(function(r){ return r.json().catch(function(){ return null; }); })
      .then(function(d){
        if (d && d.success) { state.balance = Number(d.balanceAfter); renderBalance(); afterSettle(totalWin); }
        else { toast('结算失败'); releaseSpin(); stopAuto(); }
      }).catch(function(){ toast('网络错误'); releaseSpin(); stopAuto(); });
  }
}

function afterSettle(totalWin){
  state.history.unshift({bet: bet(), win: totalWin, delta: totalWin - bet(), ts: Date.now()});
  state.history = state.history.slice(0, 30); saveHist();
  releaseSpin();
  if (state.autoOn) setTimeout(function(){ if (state.autoOn) doSpin(); }, 700);
}

function releaseSpin(){
  state.spinning = false;
  if (state.safetyTimer) { clearTimeout(state.safetyTimer); state.safetyTimer = null; }
  var sb = $('ol-spin'); if (sb) { sb.disabled = false; sb.classList.remove('spinning'); }
}

/* 自动 */
function startAuto(){
  if (state.spinning || state.autoOn) return;
  state.autoOn = true;
  var btn = $('ol-auto'); btn.classList.add('active');
  btn.querySelector('span').textContent = '停止';
  toast('自动模式开启'); doSpin();
}
function stopAuto(){
  state.autoOn = false;
  var btn = $('ol-auto');
  if (btn) { btn.classList.remove('active'); var sp = btn.querySelector('span'); if (sp) sp.textContent = '自动'; }
}

/* 下注 */
function changeBet(dir){
  if (state.spinning) return;
  var n = state.betIndex + dir;
  if (n < 0) n = 0;
  if (n >= C.CONFIG.betSteps.length) n = C.CONFIG.betSteps.length - 1;
  if (n === state.betIndex) return;
  state.betIndex = n; renderBet(); saveState();
}

/* 弹窗 */
function openModal(t, h){
  $('ol-modal-title').textContent = t;
  $('ol-modal-body').innerHTML = h;
  $('ol-modal').classList.add('show');
}
function closeModal(){ $('ol-modal').classList.remove('show'); }

function showPaytable(){
  var order = ['gemBlue','gemGreen','gemYellow','gemPurple','gemRed','cup','ring','hourglass','crown','zeus'];
  var html = '';
  order.forEach(function(id){
    var s = C.SYMBOLS[id], svg = S[id] ? S[id]() : '';
    var payText = '';
    if (id === 'zeus') payText = '4个×3 · 5个×5 · 6个×100（Scatter）';
    else {
      var tbl = C.PAYOUTS[id];
      if (tbl) payText = '8-9个×' + tbl[8] + ' · 10-11个×' + tbl[10] + ' · 12-30个×' + tbl[12];
    }
    html += '<div class="sym-row"><div class="sym-icon">' + svg + '</div>' +
      '<div><div class="sym-name">' + s.name + '</div>' +
      '<div class="sym-pay">' + payText + '</div></div></div>';
  });
  html += '<h4 style="margin-top:14px;font-weight:800;">玩法</h4>' +
    '<p style="color:#555;">6×5 网格，相邻（水平/垂直）相同符号 ≥8 个即形成 cluster 中奖。</p>' +
    '<p style="color:#555;">中奖后符号消失，上方符号下落补位，若再次中奖则触发 Tumble 连击，每次掉落随机乘法器（×2 ~ ×1000）。</p>' +
    '<p style="color:#555;">宙斯（Scatter）不参与 cluster，4/5/6 个分别赔付 ×3 / ×5 / ×100。</p>';
  openModal('赔付表', html);
}

function showHistory(){
  if (!state.history.length) { openModal('游戏记录', '<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>'); return; }
  var tb = 0, tw = 0, w = 0;
  state.history.forEach(function(h){ tb += h.bet; tw += h.win; if (h.win > 0) w++; });
  var head = '<div class="hist-summary">' +
    '<div><span>总局数</span><b>' + state.history.length + '</b></div>' +
    '<div><span>中奖次数</span><b>' + w + '</b></div>' +
    '<div><span>总下注</span><b>' + fmt(tb) + '</b></div>' +
    '<div><span>总中奖</span><b>' + fmt(tw) + '</b></div>' +
    '</div><h4 style="margin-top:14px;font-weight:800;">最近记录</h4>';
  var rows = '';
  state.history.forEach(function(h){
    var cls = h.delta > 0 ? 'win' : 'lose';
    var txt = (h.delta > 0 ? '+' : '') + '¥' + h.delta.toFixed(2);
    var t = new Date(h.ts), hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
    rows += '<div class="hist-row"><div><div style="font-weight:700;">下注 ' + fmt(h.bet) + '</div>' +
      '<div style="font-size:12px;color:#999;">' + hh + ':' + mm + ' · 中奖 ' + fmt(h.win) + '</div></div>' +
      '<div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openModal('游戏记录', head + rows);
}

function actionMode(){
  if (state.spinning) { toast('请等待本局结束'); return; }
  if (MODE === 'demo') {
    if (!confirm('重置演示余额为 ¥' + C.CONFIG.initialBalance.toFixed(2) + '？')) return;
    state.balance = C.CONFIG.initialBalance;
    state.betIndex = C.CONFIG.defaultBetIndex;
    state.history = [];
    saveState(); saveHist();
    renderBalance(); renderBet(); renderWin(0);
    toast('已重置');
  } else {
    openModal('充值', '<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');
  }
}

/* 绑定 */
function bind(){
  $('ol-bet-minus').addEventListener('click', function(){ changeBet(-1); });
  $('ol-bet-plus').addEventListener('click', function(){ changeBet(1); });
  $('ol-spin').addEventListener('click', doSpin);
  $('ol-auto').addEventListener('click', function(){ if (state.autoOn) stopAuto(); else startAuto(); });
  $('ol-history').addEventListener('click', showHistory);
  $('ol-paytable').addEventListener('click', showPaytable);
  $('ol-menu').addEventListener('click', actionMode);
  $('ol-mode-action').addEventListener('click', actionMode);
  $('ol-sound').addEventListener('click', function(){
    toast('音效开关开发中');
  });
  $('ol-modal-x').addEventListener('click', closeModal);
  document.querySelector('.ol-modal-mask').addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e){
    if (e.target && e.target.tagName === 'BUTTON') return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doSpin(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); changeBet(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); changeBet(-1); }
    else if (e.key === 'Escape') { closeModal(); stopAuto(); }
  });

  document.addEventListener('visibilitychange', function(){ if (document.hidden && state.autoOn) stopAuto(); });
  window.addEventListener('pagehide', function(){ if (state.autoOn) stopAuto(); });
}

/* 模式 UI */
function setupMode(){
  var ma = $('ol-mode-action'); if (!ma) return;
  var isDemo = MODE === 'demo';
  var ic = isDemo
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
  ma.innerHTML = ic + '<span>' + (isDemo ? '重置余额' : '充值余额') + '</span>';
  var b = document.querySelector('.ol-brand');
  if (b && isDemo) b.textContent = '奥林匹斯之门 · 试玩';
}

/* 启动 */
function init(){
  E.setMode(MODE);
  buildGrid(); renderWin(0); bind(); setupMode();

  if (MODE === 'real') {
    fetch('/api/me', {credentials: 'include', cache: 'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.success || !d.user) { toast('请先登录'); setTimeout(function(){ location.replace('/'); }, 800); return; }
        state.balance = Number(d.user.walletBalance) || 0;
        state.ready = true;
        renderBalance(); renderBet();
        paintGrid(E.spin(), false);
      }).catch(function(){ toast('网络错误'); });
  } else {
    loadState(); loadHist(); state.ready = true;
    renderBalance(); renderBet();
    paintGrid(E.spin(), false);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
