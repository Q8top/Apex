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
  freeSpinMode: false,
  fsEntranceActive: false,
  spinToken: 0
};

var SYMBOL_POOL = Object.keys(C.SYMBOLS);
var reelHandles = [];
var spinTargetGrid = null;
var reelGeom = null;

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
  var stage = document.querySelector('.sw-stage');
  if (stage) stage.classList.toggle('winning-focus', !!on);
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
  syncBet();
}
var _countRaf = 0;
function countUp(el, to, dur){
  if (!el) return;
  if (_countRaf) cancelAnimationFrame(_countRaf);
  var from = 0;
  try { from = parseFloat(String(el.dataset.v || '0')) || 0; } catch(e){}
  if (Math.abs(to - from) < 0.005) { el.dataset.v = String(to); return; }
  var t0 = performance.now();
  function step(now){
    var p = Math.min(1, (now - t0) / (dur || 380));
    var e = 1 - Math.pow(1 - p, 3);
    var v = from + (to - from) * e;
    el.textContent = v > 0 ? fmt(v, true) : fmt(0);
    if (p < 1) { _countRaf = requestAnimationFrame(step); }
    else { el.dataset.v = String(to); _countRaf = 0; }
  }
  _countRaf = requestAnimationFrame(step);
}
function renderWin(amount, combo){
  var el = $('sw-win-value');
  countUp(el, amount > 0 ? amount : 0, 420);
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
function reelEase(p){
  if (p < 0.15) return 2.5 * p * p;
  if (p < 0.70) { var q = (p - 0.15) / 0.55; return 0.056 + 0.80 * q; }
  var q = (p - 0.70) / 0.30;
  return 0.856 + 0.144 * (1 - Math.pow(1 - q, 3));
}

function buildReelLayer(targetGrid){
  var layer = document.querySelector('.stage-symbols');
  if (!layer) { reelGeom = null; return; }
  layer.innerHTML = '';
  var N = 20;
  var frag = document.createDocumentFragment();
  for (var c = 0; c < 6; c++) {
    var col = document.createElement('div'); col.className = 'reel-col';
    var track = document.createElement('div'); track.className = 'reel-track';
    var inner = document.createDocumentFragment();
    for (var k = 0; k < N; k++) {
      var sym;
      if (k < N - 5) sym = SYMBOL_POOL[Math.floor(E.randFloat() * SYMBOL_POOL.length)];
      else sym = targetGrid[k - (N - 5)][c];
      var el = document.createElement('div'); el.className = 'reel-sym';
      el.innerHTML = S[sym] ? S[sym]() : '';
      inner.appendChild(el);
    }
    track.appendChild(inner);
    col.appendChild(track);
    frag.appendChild(col);
  }
  layer.appendChild(frag);
  var firstCol = layer.children[0];
  if (!firstCol) { reelGeom = null; return; }
  var colH = firstCol.clientHeight;
  var gap = 4;
  var cellH = (colH - gap * 4) / 5;
  var step = cellH + gap;
  for (var i = 0; i < 6; i++) {
    var c2 = layer.children[i];
    var t2 = c2 && c2.firstChild;
    if (!t2) continue;
    for (var j = 0; j < N; j++) {
      var sy = t2.children[j];
      if (sy) sy.style.height = cellH + 'px';
    }
  }
  layer.classList.add('active');
  reelGeom = { colH: colH, cellH: cellH, step: step, gap: gap, N: N };
}

function destroyReelLayer(){
  var layer = document.querySelector('.stage-symbols');
  if (layer) { layer.classList.remove('active'); layer.innerHTML = ''; }
  reelGeom = null;
}

function spinReel(c, dur, onDone, token){
  if (!reelGeom) { if (onDone) onDone(); return; }
  var layer = document.querySelector('.stage-symbols');
  if (!layer || !layer.children[c]) { if (onDone) onDone(); return; }
  var track = layer.children[c].firstChild;
  if (!track) { if (onDone) onDone(); return; }

  var N = reelGeom.N;
  var yStart = reelGeom.colH;
  var yFinal = -(N - 5) * reelGeom.step;
  var start = performance.now();
  var stopped = false;

  track.style.transform = 'translate3d(0,' + yStart + 'px,0)';

  function settle(){
    if (stopped) return;
    stopped = true;
    if (token !== state.spinToken) return;
    safeAudio(function(){ A.reelStop(c); }, 'reelStop');
    track.style.transition = 'transform 120ms cubic-bezier(.2,1,.35,1)';
    track.style.transform = 'translate3d(0,' + (yFinal - 4) + 'px,0)';
    setTimeout(function(){
      if (token !== state.spinToken) return;
      track.style.transition = 'transform 80ms ease-out';
      track.style.transform = 'translate3d(0,' + (yFinal + 1.5) + 'px,0)';
      setTimeout(function(){
        if (token !== state.spinToken) return;
        track.style.transition = 'transform 60ms ease-out';
        track.style.transform = 'translate3d(0,' + yFinal + 'px,0)';
        setTimeout(function(){
          if (token !== state.spinToken) return;
          track.style.transition = '';
          reelHandles[c] = null;
          if (onDone) onDone();
        }, 60);
      }, 80);
    }, 120);
  }

  function loop(now){
    if (token !== state.spinToken) return;
    var el = now - start;
    if (el >= dur) { settle(); return; }
    var p = el / dur;
    var y = yStart + (yFinal - yStart) * reelEase(p);
    track.style.transform = 'translate3d(0,' + y + 'px,0)';
    reelHandles[c] = requestAnimationFrame(loop);
  }
  reelHandles[c] = requestAnimationFrame(loop);
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

  var token = ++state.spinToken;
  state.spinning = true;
  var sb = $('sw-spin'); sb.disabled = true; sb.classList.add('spinning');
  safeAudio(A.init, 'init');
  safeAudio(A.spinStart, 'spinStart');

  if (state.safetyTimer) clearTimeout(state.safetyTimer);
  state.safetyTimer = setTimeout(function(){
    if (token !== state.spinToken) return;
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
  spinTargetGrid = firstGrid;
  buildReelLayer(firstGrid);
  var _g0 = document.getElementById('sw-grid'); if (_g0) _g0.style.opacity = '0';

  var baseDelay = 500, stagger = 120, done = 0;
  [0,1,2,3,4,5].forEach(function(c){
    var dur = baseDelay + c * stagger;
    spinReel(c, dur, function(){
      if (token !== state.spinToken) return;
      done++;
      if (done === 6) {
        var _g1 = document.getElementById('sw-grid'); if (_g1) _g1.style.opacity = '1';
        paintGrid(firstGrid);
        setTimeout(function(){
          if (token !== state.spinToken) return;
          // 检查免费旋转触发
          var fsCount = C.getFreeSpinCount(result.scatterCount);
          if (fsCount > 0) {
            safeAudio(A.freeSpin, 'freeSpin');
            playFsEntrance(fsCount, function(){ runFreeSpins(b, fsCount, token); }, token);
          } else {
            playRounds(result, b, null, token);
          }
        }, 250);
      }
    }, token);
  });
}

/* 免费旋转 */
function playFsEntrance(count, cb, token){
  if (state.fsEntranceActive) return;
  var banner = $('sw-freespin-banner');
  var stage = document.querySelector('.sw-stage');
  if (!banner) { if (cb) cb(); return; }

  state.fsEntranceActive = true;
  var finished = false;
  function finish(){
    if (finished) return;
    finished = true;
    banner.classList.remove('fs-entrance');
    banner.hidden = true;
    if (stage) stage.classList.remove('fs-entrance-active');
    state.fsEntranceActive = false;
    if (token !== state.spinToken) return;
    if (cb) cb();
  }

  banner.hidden = false;
  banner.classList.add('fs-entrance');
  if (stage) stage.classList.add('fs-entrance-active');
  var c = $('sw-fs-count'); if (c) c.textContent = '×' + count;
  var m = $('sw-fs-mult'); if (m) m.textContent = '';

  banner.addEventListener('animationend', finish, { once: true });
  setTimeout(finish, 1200);
}

function runFreeSpins(b, fsCount, token){
  if (token !== state.spinToken) return;
  state.freeSpinMode = true;
  var stage = document.querySelector('.sw-stage');
  if (stage) stage.classList.add('fs-mode');
  safeAudio(A.fsBgStart, 'fsBgStart');
  var fsResult;
  try {
    fsResult = E.playFreeSpins(b, fsCount);
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
    if (token !== state.spinToken) return;
    if (idx >= spins.length) {
      state.freeSpinMode = false;
      if (stage) stage.classList.remove('fs-mode');
      safeAudio(A.fsBgStop, 'fsBgStop');
      showFsBanner(0);
      if (totalWin > 0) { safeAudio(A.fsSummary, 'fsSummary'); showFsSummary(totalWin); }
      setTimeout(function(){
        if (token !== state.spinToken) return;
        finish(totalWin, token);
      }, totalWin > 0 ? 1800 : 200);
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
        if (token !== state.spinToken) return;
        if (rd.wins && rd.wins.length) {
          var cells = [];
          rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
          highlightCells(cells, true);
          if (rd.bombs && rd.bombs.length) spawnBombs(rd.bombs, document.querySelector('.sw-stage'));
          shown += rd.roundWin;
          renderWin(shown, rd.cumMult ? '×' + rd.cumMult + ' 累计' : '');
          showFsBanner(s.remaining, rd.cumMult);
          safeAudio(A.tumble, 'tumble');
          setTimeout(function(){
            if (token !== state.spinToken) return;
            cells.forEach(function(p){
              var el = cellAt(p[0], p[1]);
              if (el) el.classList.add('popping');
            });
            setTimeout(function(){
              if (token !== state.spinToken) return;
              highlightCells(cells, false);
            }, 220);
          }, 500);
        }
      }, ri * 700);
    });
    setTimeout(nextFs, Math.max(1500, s.result.rounds.length * 700 + 500));
  }
  nextFs();
}

/* 逐轮播放（普通 spin） */
function playRounds(result, betAmt, fs, token){
  var rounds = result.rounds;
  var totalShown = 0;
  var i = 0;
  var stage = document.querySelector('.sw-stage');

  function playOne(){
    if (token !== state.spinToken) return;
    if (i >= rounds.length) { paintGrid(result.finalGrid); finish(totalShown, token); return; }
    var rd = rounds[i];
    if (!rd || !rd.wins || rd.wins.length === 0) { i++; playOne(); return; }
    var cells = [];
    rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
    highlightCells(cells, true);
    totalShown += rd.roundWin;
    renderWin(totalShown, '');
    safeAudio(A.tumble, 'tumble');
    setTimeout(function(){
      if (token !== state.spinToken) return;
      cells.forEach(function(p){
        var el = cellAt(p[0], p[1]);
        if (el) el.classList.add('popping');
      });
      setTimeout(function(){
        if (token !== state.spinToken) return;
        highlightCells(cells, false);
        i++;
        if (i < rounds.length && rounds[i] && rounds[i].grid) {
          paintGrid(rounds[i].grid);
          setTimeout(playOne, 250);
        } else { paintGrid(result.finalGrid); finish(totalShown, token); }
      }, 220);
    }, 500);
  }
  playOne();
}

function finish(totalWin, token){
  if (MODE === 'demo') {
    state.balance = state.balance - bet() + totalWin;
    renderBalance(true); saveState();
    if (typeof ApexBigWin !== 'undefined' && totalWin > 0) {
      try { ApexBigWin.celebrate(totalWin, bet()); } catch(e){}
    }
    afterSettle(totalWin);
  } else {
    fetch('/api/slot/spin', {
      method: 'POST', credentials: 'include',
      headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf()},
      body: JSON.stringify({bet: bet(), totalWin: totalWin})
    }).then(function(r){ return r.json().catch(function(){ return null; }); })
      .then(function(d){
        if (token !== state.spinToken) return;
        if (d && d.success) {
          state.balance = Number(d.balanceAfter); renderBalance(true);
          if (typeof ApexBigWin !== 'undefined' && totalWin > 0) {
            try { ApexBigWin.celebrate(totalWin, bet()); } catch(e){}
          }
          afterSettle(totalWin);
        }
        else { toast('结算失败'); releaseSpin(); stopAuto(); }
      }).catch(function(){
        if (token !== state.spinToken) return;
        toast('网络错误'); releaseSpin(); stopAuto();
      });
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
  state.spinToken++;
  if (state.safetyTimer) { clearTimeout(state.safetyTimer); state.safetyTimer = null; }
  for (var i = 0; i < 6; i++) {
    if (reelHandles[i]) { cancelAnimationFrame(reelHandles[i]); reelHandles[i] = null; }
  }
  destroyReelLayer();
  var _g2 = document.getElementById('sw-grid'); if (_g2) _g2.style.opacity = '1';
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
  try {
    _soundOn = localStorage.getItem('sweetSoundOn') !== '0';
  } catch(e) { _soundOn = true; }
  safeAudio(function(){ A.enabled(_soundOn); }, 'toggle');
  $('sw-sound').style.opacity = _soundOn ? '1' : '0.35';
  $('sw-sound').addEventListener('click', function(){
    _soundOn = !_soundOn;
    safeAudio(function(){ A.enabled(_soundOn); }, 'toggle');
    $('sw-sound').style.opacity = _soundOn ? '1' : '0.35';
    try { localStorage.setItem('sweetSoundOn', _soundOn ? '1' : '0'); } catch(e) {}
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
  document.addEventListener('visibilitychange', function(){
  if (document.hidden) { if (state.autoOn) stopAuto(); }
  else { setTimeout(function(){ safeAudio(A.resume, 'vis-resume'); }, 60); }
});
  window.addEventListener('pagehide', function(){ if (state.autoOn) stopAuto(); });
  window.addEventListener('focus', function(){ safeAudio(A.resume, 'focus-resume'); });
  document.addEventListener('touchstart', function(){ safeAudio(A.resume, 'touch-resume'); }, { passive: true });
  document.addEventListener('click', function(){ safeAudio(A.resume, 'click-resume'); });
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
        state.ready = true; if(typeof ApexLoader!=='undefined')ApexLoader.hide();
        renderBalance(); renderBet();
        paintGrid(E.spin());
      }).catch(function(){ toast('网络错误'); });
  } else {
    loadState(); loadHist(); state.ready = true; if(typeof ApexLoader!=='undefined')ApexLoader.hide();
    renderBalance(); renderBet();
    paintGrid(E.spin());
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();


/* ═══════════════════════════════════════════════════
   __sweet_patch385__ · UI 增强（Bottom Sheet / 档位 / 徽章 / 状态机）
   ═══════════════════════════════════════════════════ */

function buildBetChips(){
  var box = $('sw-bet-steps');
  if (!box) return;
  box.innerHTML = C.CONFIG.betSteps.map(function(v, i){
    return '<button type="button" class="sw-bet-chip' + (i === state.betIndex ? ' active' : '') + '" data-idx="' + i + '" role="tab">¥' + v + '</button>';
  }).join('');
}

function renderModeBadge(){
  var badge = $('sw-mode-badge');
  var text = $('sw-mode-text');
  if (!badge || !text) return;
  badge.setAttribute('data-mode', MODE);
  text.textContent = MODE === 'demo' ? '试玩模式' : '游戏模式';
}

function syncBet(){
  var disp = $('sw-bet-display');
  if (disp) disp.textContent = fmt(bet());
  var chips = document.querySelectorAll('#sw-bet-steps .sw-bet-chip');
  for (var i = 0; i < chips.length; i++){
    var idx = parseInt(chips[i].getAttribute('data-idx'), 10);
    chips[i].classList.toggle('active', idx === state.betIndex);
  }
}

function syncWin(amount){
  var disp = $('sw-won-display');
  if (disp) {
    disp.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
    disp.classList.toggle('win', amount > 0);
  }
}

/* Hook 原 render 函数 */
var _rBet = renderBet;
renderBet = function(){ _rBet(); syncBet(); };
var _rWin = renderWin;
renderWin = function(a, c){ _rWin(a, c); syncWin(a); };

/* ═══ Bottom Sheet ═══ */
function openSheet(title, html){
  var sheet = $('sw-sheet');
  var t = $('sw-sheet-title');
  var b = $('sw-sheet-body');
  if (!sheet || !b) return;
  if (t) t.textContent = title;
  b.innerHTML = html;
  sheet.classList.add('show');
  sheet.setAttribute('aria-hidden', 'false');
}
function closeSheet(){
  var sheet = $('sw-sheet');
  if (!sheet) return;
  sheet.classList.remove('show');
  sheet.setAttribute('aria-hidden', 'true');
}

/* ═══ 菜单抽屉 ═══ */
function openMenuSheet(){
  var isDemo = MODE === 'demo';
  var soundOn = document.querySelector('#sw-sound') && document.querySelector('#sw-sound').style.opacity !== '0.35';
  var html =
    '<div class="sw-menu-list">' +
      '<button type="button" class="sw-menu-item" data-act="sound"><i class="ri-volume-up-line"></i><span>音效</span><small>' + (soundOn ? '开' : '关') + '</small></button>' +
      '<button type="button" class="sw-menu-item" data-act="history"><i class="ri-history-line"></i><span>游戏记录</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="paytable"><i class="ri-bar-chart-box-line"></i><span>赔付表</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="balance"><i class="ri-wallet-3-line"></i><span>当前余额</span><small>' + fmt(state.balance) + '</small></button>' +
      '<button type="button" class="sw-menu-item' + (isDemo ? '' : ' danger') + '" data-act="mode"><i class="ri-refresh-line"></i><span>' + (isDemo ? '重置余额' : '充值余额') + '</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="info"><i class="ri-information-line"></i><span>游戏说明</span></button>' +
    '</div>';
  openSheet('菜单 · ' + (isDemo ? '试玩模式' : '游戏模式'), html);
  setTimeout(bindMenuItems, 30);
}
function bindMenuItems(){
  var body = $('sw-sheet-body');
  if (!body || body.__bound) return;
  body.__bound = true;
  body.addEventListener('click', function(e){
    var item = e.target.closest ? e.target.closest('.sw-menu-item') : null;
    if (!item) return;
    var act = item.getAttribute('data-act');
    if (act === 'sound'){
      var sbtn = $('sw-sound');
      if (sbtn) sbtn.click();
      var st = item.querySelector('small');
      if (st) st.textContent = st.textContent === '开' ? '关' : '开';
    } else if (act === 'history'){ closeSheet(); setTimeout(openHistorySheet, 180); }
    else if (act === 'paytable'){ closeSheet(); setTimeout(openPaytableSheet, 180); }
    else if (act === 'mode'){ closeSheet(); setTimeout(actionMode, 180); }
    else if (act === 'info'){ closeSheet(); setTimeout(function(){ toast('本游戏为虚拟积分娱乐，不涉及真实货币'); }, 240); }
    else if (act === 'balance'){ toast('当前余额 ' + fmt(state.balance), 1500); }
  });
}

/* ═══ 赔付表抽屉 ═══ */
function openPaytableSheet(){
  var rows = [];
  for (var sym in C.PAYOUTS){
    if (!C.PAYOUTS.hasOwnProperty(sym)) continue;
    var t = C.PAYOUTS[sym];
    var fn = S[sym];
    rows.push({ sym: sym, icon: fn ? fn() : '', t: t });
  }
  var html = '<div style="font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.7;">6×5 Cluster Pays（8 个及以上相邻同类消除）</div>';
  rows.forEach(function(r){
    html += '<div class="sym-row"><div class="sym-icon">' + r.icon + '</div><div><div class="sym-name">' + ((C.SYMBOLS[r.sym] && C.SYMBOLS[r.sym].name) || r.sym) + '</div><div class="sym-pay">8-9个×' + (r.t[8] || 0) + ' · 10-11个×' + (r.t[10] || 0) + ' · 12+个×' + (r.t[12] || 0) + '</div></div></div>';
  });
  openSheet('赔付表', html);
}

/* ═══ 记录抽屉 ═══ */
function openHistorySheet(){
  if (!state.history.length){
    openSheet('游戏记录', '<p style="text-align:center;padding:28px 0;color:#999;line-height:1.8;">还没有游戏记录<br>开始第一局游戏吧</p>');
    return;
  }
  var tb = 0, tw = 0, w = 0;
  state.history.forEach(function(h){ tb += h.bet; tw += h.win; if (h.win > 0) w++; });
  var rate = (w / state.history.length * 100).toFixed(1);
  var head = '<div class="hist-summary">' +
    '<div><span>总局数</span><b>' + state.history.length + '</b></div>' +
    '<div><span>中奖次数</span><b>' + w + '</b></div>' +
    '<div><span>中奖率</span><b>' + rate + '%</b></div>' +
    '<div><span>总下注</span><b>' + fmt(tb) + '</b></div>' +
    '<div><span>总中奖</span><b>' + fmt(tw) + '</b></div>' +
    '<div><span>净赢</span><b>' + fmt(tw - tb) + '</b></div>' +
    '</div><h4 style="margin:14px 0 6px;font-weight:800;font-size:13px;">最近记录</h4>';
  var rows = '';
  state.history.slice(0, 20).forEach(function(h){
    var cls = h.delta > 0 ? 'win' : 'lose';
    var txt = (h.delta > 0 ? '+' : '') + '¥' + h.delta.toFixed(2);
    var t = new Date(h.ts);
    var hh = String(t.getHours()).padStart(2, '0');
    var mm = String(t.getMinutes()).padStart(2, '0');
    rows += '<div class="hist-row"><div><div style="font-weight:700;">下注 ' + fmt(h.bet) + '</div>' +
      '<div style="font-size:12px;color:#999;">' + hh + ':' + mm + ' · 中奖 ' + fmt(h.win) + '</div></div>' +
      '<div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openSheet('游戏记录', head + rows);
}

/* ═══ 拦截原按钮绑定（capture 阶段） ═══ */
function patchBindings(){
  function intercept(id, handler){
    var el = $(id);
    if (!el || el.__patched) return;
    el.__patched = true;
    el.addEventListener('click', function(e){
      e.stopImmediatePropagation();
      e.preventDefault();
      handler();
    }, true);
  }
  intercept('sw-menu', openMenuSheet);
  intercept('sw-paytable', openPaytableSheet);
  intercept('sw-history', openHistorySheet);

  var mask = $('sw-sheet-mask');
  var x = $('sw-sheet-x');
  if (mask) mask.addEventListener('click', closeSheet);
  if (x) x.addEventListener('click', closeSheet);

  var steps = $('sw-bet-steps');
  if (steps){
    steps.addEventListener('click', function(e){
      var chip = e.target.closest ? e.target.closest('.sw-bet-chip') : null;
      if (!chip) return;
      var i = parseInt(chip.getAttribute('data-idx'), 10);
      if (isNaN(i)) return;
      if (i === state.betIndex) return;
      state.betIndex = i;
      saveState();
      renderBet();
      safeAudio(A.click, 'click');
    });
  }
}

/* ═══ 启动补丁 ═══ */
function _patch385(){
  try {
    buildBetChips();
    renderModeBadge();
    patchBindings();
    syncBet();
    syncWin(0);
  } catch(e){ console.error('[Sweet patch385]', e); }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _patch385);
} else {
  _patch385();
}

})();
