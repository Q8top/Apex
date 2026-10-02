/* 甜蜜蜜 · UI */
(function(){
'use strict';

var C = window.SweetConfig, E = window.SweetEngine, S = window.SweetSymbols, A = window.SweetAudio;

var MODE = (function(){
  var m = String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v = m ? m[1].toLowerCase() : 'demo';
  return v === 'real' ? 'real' : 'demo';
})();

var LS_STATE = 'apex_sweet_v1_' + MODE + '_state';
var LS_HIST  = 'apex_sweet_v1_' + MODE + '_history';

var state = {
  balance: C.CONFIG.initialBalance,
  betIndex: C.CONFIG.defaultBetIndex,
  spinning: false, grid: null, history: [],
  autoOn: false, ready: false, safetyTimer: null,
  freeSpinMode: false
};

function $(id){ return document.getElementById(id); }
function fmt(n, sign){
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet(){ return C.CONFIG.betSteps[state.betIndex]; }
function toast(m, ms){
  var t = $('sw-toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(function(){ t.classList.remove('show'); }, ms || 1500);
}
function bump(el){ if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function safeAudio(fn, n){ try { if (typeof fn === 'function') fn(); } catch(e){ console.warn('[Sweet] audio@'+n, e && e.message); } }
function getCsrf(){
  var m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function loadState(){
  if (MODE === 'real') return;
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

function buildGrid(){
  var box = $('sw-grid'); box.innerHTML = '';
  for (var i = 0; i < C.CONFIG.rows * C.CONFIG.cols; i++) {
    var c = document.createElement('div');
    c.className = 'sw-cell';
    c.setAttribute('data-idx', String(i));
    box.appendChild(c);
  }
}
function cellAt(r, c){ return document.querySelectorAll('#sw-grid .sw-cell')[r * C.CONFIG.cols + c]; }
function paintGrid(grid){
  for (var r = 0; r < C.CONFIG.rows; r++) {
    for (var c = 0; c < C.CONFIG.cols; c++) {
      var el = cellAt(r, c); if (!el) continue;
      var fn = S[grid[r][c]];
      el.innerHTML = fn ? fn() : '';
      el.classList.remove('winning', 'popping', 'bomb');
    }
  }
}
function highlightCells(cells, on){
  cells.forEach(function(p){
    var el = cellAt(p[0], p[1]);
    if (el) el.classList.toggle('winning', !!on);
  });
}

function renderBalance(animate){
  $('sw-balance').textContent = fmt(state.balance);
  if (animate) bump($('sw-balance'));
}
function renderBet(){
  $('sw-bet').textContent = fmt(bet());
  $('sw-bet-txt').textContent = '下注 ' + fmt(bet());
}
function renderWin(amount, combo){
  var el = $('sw-win-value');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  if (amount > 0) { el.classList.remove('pulsing'); void el.offsetWidth; el.classList.add('pulsing'); }
  $('sw-win-label').textContent = amount > 0 ? '恭喜中奖' : '本局中奖';
  var cb = $('sw-combo');
  if (combo) { cb.textContent = combo; cb.classList.add('show'); }
  else { cb.textContent = ''; cb.classList.remove('show'); }
}

/* 免费旋转横幅 */
function showFsBanner(remaining, mult){
  var b = $('sw-freespin-banner');
  if (!b) return;
  if (remaining > 0) {
    b.hidden = false;
    $('sw-fs-count').textContent = remaining;
    var m = $('sw-fs-mult');
    if (m) m.textContent = mult ? '· ×' + mult : '';
  } else {
    b.hidden = true;
    var m2 = $('sw-fs-mult');
    if (m2) m2.textContent = '';
  }
}

/* 免费旋转总赢分 banner */
function showFsSummary(amount){
  var el = $('sw-fs-summary');
  if (!el) return;
  $('sw-fs-total').textContent = fmt(amount);
  el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, 3000);
}


/* 炸弹飘入 */
function spawnBombs(bombs, stage){
  if (!bombs || !bombs.length) return;
  bombs.forEach(function(b, i){
    var el = document.createElement('div');
    el.className = 'sw-bomb-badge';
    el.textContent = '×' + b.value;
    var gx = (b.cell[1] + 0.5) / 6 * 100;
    var gy = (b.cell[0] + 0.5) / 5 * 100;
    el.style.left = gx + '%';
    el.style.top = gy + '%';
    stage.appendChild(el);
    setTimeout(function(){ el.classList.add('show'); }, i * 100);
    safeAudio(A.bomb, 'bomb');
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 2600 + i * 100);
  });
}

/* 落停动画 */
function spinReel(c, dur, onDone){
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
    if (el < dur) requestAnimationFrame(loop);
    else { safeAudio(function(){ A.reelStop(c); }, 'reelStop'); if (onDone) onDone(); }
  }
  requestAnimationFrame(loop);
}

function doSpin(){
  if (state.spinning || !state.ready) return;
  var b = bet();
  if (state.balance < b) {
    toast('余额不足' + (MODE === 'demo' ? '，请重置' : '，请充值'));
    stopAuto(); return;
  }
  document.querySelectorAll('#sw-grid .sw-cell').forEach(function(c){
    c.classList.remove('winning', 'popping', 'bomb');
  });
  renderWin(0);

  state.spinning = true;
  var sb = $('sw-spin'); sb.disabled = true; sb.classList.add('spinning');
  safeAudio(A.init, 'init');
  safeAudio(A.spinStart, 'spinStart');

  if (state.safetyTimer) clearTimeout(state.safetyTimer);
  state.safetyTimer = setTimeout(function(){
    if (state.spinning) {
      console.warn('[Sweet] safety release');
      paintGrid(state.grid || E.spin());
      releaseSpin(); stopAuto();
    }
  }, 8000);

  var result;
  try {
    result = (MODE === 'demo') ? E.spinDemo(b) : E.playFullSpin(b, false);
    state.grid = result.finalGrid;
  } catch(e) {
    console.error('[Sweet] engine error:', e);
    releaseSpin(); return;
  }

  var firstGrid = result.rounds.length ? result.rounds[0].grid : result.finalGrid;
  var baseDelay = 500, stagger = 120, done = 0;
  [0,1,2,3,4,5].forEach(function(c){
    var dur = baseDelay + c * stagger;
    spinReel(c, dur, function(){
      done++;
      if (done === 6) {
        paintGrid(firstGrid);
        setTimeout(function(){
          // 检查免费旋转触发
          if (result.scatterCount >= 4) {
            safeAudio(A.freeSpin, 'freeSpin');
            toast('🎉 免费旋转触发！+10 次', 2200);
            setTimeout(function(){ runFreeSpins(b); }, 800);
          } else {
            playRounds(result, b, null);
          }
        }, 250);
      }
    });
  });
}

/* 免费旋转 */
function runFreeSpins(b){
  state.freeSpinMode = true;
  var stage = document.querySelector('.sw-stage');
  if (stage) stage.classList.add('fs-mode');
  safeAudio(A.fsBgStart, 'fsBgStart');
  var fsResult;
  try {
    fsResult = E.playFreeSpins(b);
  } catch(e) {
    console.error('[Sweet] freespin error:', e);
    state.freeSpinMode = false;
    if (stage) stage.classList.remove('fs-mode');
    safeAudio(A.fsBgStop, 'fsBgStop');
    releaseSpin();
    return;
  }
  var totalWin = fsResult.totalWin;
  var spins = fsResult.spins;
  var idx = 0;
  function nextFs(){
    if (idx >= spins.length) {
      state.freeSpinMode = false;
      if (stage) stage.classList.remove('fs-mode');
      safeAudio(A.fsBgStop, 'fsBgStop');
      showFsBanner(0);
      if (totalWin > 0) { safeAudio(A.fsSummary, 'fsSummary'); showFsSummary(totalWin); }
      setTimeout(function(){ finish(totalWin); }, totalWin > 0 ? 1800 : 200);
      return;
    }
    var s = spins[idx];
    idx++;
    showFsBanner(s.remaining);
    paintGrid(s.result.finalGrid);
    var roundTotal = s.result.totalWin;
    var shown = 0;
    s.result.rounds.forEach(function(rd, ri){
      setTimeout(function(){
        if (rd.wins && rd.wins.length) {
          var cells = [];
          rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
          highlightCells(cells, true);
          if (rd.bombs && rd.bombs.length) spawnBombs(rd.bombs, document.querySelector('.sw-stage'));
          shown += rd.roundWin;
          renderWin(shown, rd.cumMult ? '×' + rd.cumMult + ' 累计' : '');
          showFsBanner(s.remaining, rd.cumMult);
          safeAudio(A.tumble, 'tumble');
          if (rd.bombs && rd.bombs.length) safeAudio(A.bomb, 'bomb');
          setTimeout(function(){
            cells.forEach(function(p){
              var el = cellAt(p[0], p[1]);
              if (el) el.classList.add('popping');
            });
            setTimeout(function(){ highlightCells(cells, false); }, 220);
          }, 500);
        }
      }, ri * 700);
    });
    setTimeout(nextFs, Math.max(1500, s.result.rounds.length * 700 + 500));
  }
  nextFs();
}

/* 逐轮播放（普通 spin） */
function playRounds(result, betAmt, fs){
  var rounds = result.rounds;
  var totalShown = 0;
  var i = 0;
  var stage = document.querySelector('.sw-stage');

  function playOne(){
    if (i >= rounds.length) { finish(totalShown); return; }
    var rd = rounds[i];
    if (!rd || !rd.wins || rd.wins.length === 0) { i++; playOne(); return; }
    var cells = [];
    rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
    highlightCells(cells, true);
    totalShown += rd.roundWin;
    renderWin(totalShown, '');
    safeAudio(A.tumble, 'tumble');
    setTimeout(function(){
      cells.forEach(function(p){
        var el = cellAt(p[0], p[1]);
        if (el) el.classList.add('popping');
      });
      setTimeout(function(){
        highlightCells(cells, false);
        i++;
        if (i < rounds.length && rounds[i] && rounds[i].grid) {
          paintGrid(rounds[i].grid);
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
    renderBalance(true); saveState();
    afterSettle(totalWin);
  } else {
    fetch('/api/slot/spin', {
      method: 'POST', credentials: 'include',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf()},
      body: JSON.stringify({bet: bet(), totalWin: totalWin})
    }).then(function(r){ return r.json().catch(function(){ return null; }); })
      .then(function(d){
        if (d && d.success) { state.balance = Number(d.balanceAfter); renderBalance(true); afterSettle(totalWin); }
        else { toast('结算失败'); releaseSpin(); stopAuto(); }
      }).catch(function(){ toast('网络错误'); releaseSpin(); stopAuto(); });
  }
}

function afterSettle(totalWin){
  if (totalWin > 0) { bump($('sw-balance')); bump($('sw-won')); }
  if (totalWin > 0) {
    var ratio = totalWin / bet();
    if (ratio >= 10) { safeAudio(A.winBig, 'winBig'); }
    else if (ratio >= 2) { safeAudio(A.winMedium, 'winMedium'); }
    else { safeAudio(A.winSmall, 'winSmall'); }
  } else { safeAudio(A.lose, 'lose'); }
  state.history.unshift({bet: bet(), win: totalWin, delta: totalWin - bet(), ts: Date.now()});
  state.history = state.history.slice(0, 30); saveHist();
  releaseSpin();
  if (state.autoOn) setTimeout(function(){ if (state.autoOn) doSpin(); }, 700);
}

function releaseSpin(){
  state.spinning = false;
  if (state.safetyTimer) { clearTimeout(state.safetyTimer); state.safetyTimer = null; }
  var sb = $('sw-spin'); if (sb) { sb.disabled = false; sb.classList.remove('spinning'); }
}

function startAuto(){
  if (state.spinning || state.autoOn) return;
  state.autoOn = true;
  var btn = $('sw-auto'); btn.classList.add('active');
  btn.querySelector('span').textContent = '停止';
  toast('自动模式开启'); doSpin();
}
function stopAuto(){
  state.autoOn = false;
  var btn = $('sw-auto');
  if (btn) { btn.classList.remove('active'); var sp = btn.querySelector('span'); if (sp) sp.textContent = '自动'; }
}

function changeBet(dir){
  if (state.spinning) return;
  var n = state.betIndex + dir;
  if (n < 0) n = 0;
  if (n >= C.CONFIG.betSteps.length) n = C.CONFIG.betSteps.length - 1;
  if (n === state.betIndex) return;
  state.betIndex = n; renderBet(); saveState(); safeAudio(A.click, 'click');
}

function openModal(t, h){
  $('sw-modal-title').textContent = t;
  $('sw-modal-body').innerHTML = h;
  $('sw-modal').classList.add('show');
}
function closeModal(){ $('sw-modal').classList.remove('show'); }

function showPaytable(){
  var order = ['candyBlue','candyGreen','candyPurple','candyRed','candyOrange','candyYellow','banana','grape','watermelon','apple','plum','lollipop'];
  var html = '';
  order.forEach(function(id){
    var s = C.SYMBOLS[id], svg = S[id] ? S[id]() : '';
    var payText = '';
    if (id === 'lollipop') payText = '4/5/6 个 → 免费旋转 10/12/15 次';
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
    '<p style="color:#555;">中奖后符号消失，上方符号下落补位，若再次中奖则触发 Tumble 连击。</p>' +
    '<p style="color:#555;">棒棒糖（Scatter）4 个及以上触发免费旋转，免费旋转中每次 Tumble 掉落炸弹倍数（×2 ~ ×100），倍数累加后与本轮赢分相乘。</p>';
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

function bind(){
  $('sw-bet-minus').addEventListener('click', function(){ changeBet(-1); });
  $('sw-bet-plus').addEventListener('click', function(){ changeBet(1); });
  $('sw-spin').addEventListener('click', doSpin);
  $('sw-auto').addEventListener('click', function(){ if (state.autoOn) stopAuto(); else startAuto(); });
  $('sw-history').addEventListener('click', showHistory);
  $('sw-paytable').addEventListener('click', showPaytable);
  $('sw-menu').addEventListener('click', actionMode);
  $('sw-mode-action').addEventListener('click', actionMode);
  var _soundOn = true;
  $('sw-sound').addEventListener('click', function(){
    _soundOn = !_soundOn;
    safeAudio(function(){ A.enabled(_soundOn); }, 'toggle');
    $('sw-sound').style.opacity = _soundOn ? '1' : '0.35';
    toast(_soundOn ? '音效已开' : '音效已关', 900);
  });
  $('sw-modal-x').addEventListener('click', closeModal);
  document.querySelector('.sw-modal-mask').addEventListener('click', closeModal);

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

function setupMode(){
  var ma = $('sw-mode-action'); if (!ma) return;
  var isDemo = MODE === 'demo';
  var ic = isDemo
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h2"/></svg>';
  ma.innerHTML = ic + '<span>' + (isDemo ? '重置余额' : '充值余额') + '</span>';
  var b = document.querySelector('.sw-brand');
  if (b && isDemo) b.textContent = '甜蜜蜜 · 试玩';
}

function init(){
  E.setMode(MODE);
  safeAudio(A.init, 'initAudio');
  buildGrid(); renderWin(0); bind(); setupMode();

  if (MODE === 'real') {
    fetch('/api/me', {credentials: 'include', cache: 'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.success || !d.user) { toast('请先登录'); setTimeout(function(){ location.replace('/'); }, 800); return; }
        state.balance = Number(d.user.walletBalance) || 0;
        state.ready = true;
        renderBalance(); renderBet();
        paintGrid(E.spin());
      }).catch(function(){ toast('网络错误'); });
  } else {
    loadState(); loadHist(); state.ready = true;
    renderBalance(); renderBet();
    paintGrid(E.spin());
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
