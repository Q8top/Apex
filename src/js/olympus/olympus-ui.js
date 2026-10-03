/* 奥林匹斯之门 · UI */
(function(){
'use strict';

var C = window.OlympusConfig, E = window.OlympusEngine, S = window.OlympusSymbols, A = window.OlympusAudio;

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

function safeAudio(fn, n){ try { if (typeof fn === "function") fn(); } catch(e){ console.warn("[Olympus] audio@"+n, e && e.message); } }
function $(id){ return document.getElementById(id); }
function fmt(n, sign){
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}
function bet(){ return C.CONFIG.betSteps[state.betIndex]; }
function bump(el){ if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
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
function renderBalance(animate){ $('ol-balance').textContent = fmt(state.balance); if (animate) bump($('ol-balance')); }
function renderBet(){
  $('ol-bet').textContent = fmt(bet());
  $('ol-bet-txt').textContent = '下注 ' + fmt(bet());
}
function renderWin(amount, combo){
  var el = $('ol-win-value');
  el.textContent = amount > 0 ? fmt(amount, true) : fmt(0);
  el.classList.toggle('winning', amount > 0);
  if (amount > 0) { el.classList.remove('pulsing'); void el.offsetWidth; el.classList.add('pulsing'); }
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
    else { safeAudio(function(){ A.reelStop(c); }, 'reelStop'); if (onDone) onDone(); }
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
  safeAudio(A.init, 'init'); A.spinStart(); console.log('[Olympus] spinStart called, ctx state:', A && A._ctxState && A._ctxState());
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
  var triggeredFS = (result.scatterCount || 0) >= 4;
  var baseDelay = 500, stagger = 120, done = 0;
  [0,1,2,3,4,5].forEach(function(c){
    var dur = baseDelay + c * stagger;
    spinReel(c, dur, function(){
      done++;
      if (done === 6) {
        paintGrid(firstGrid, false);
        setTimeout(function(){
          if (triggeredFS) {
            safeAudio(A.winBig, "fsTrigger");
            toast("🎉 免费旋转触发！15 次", 2200);
            setTimeout(function(){ runOlympusFreeSpins(b); }, 900);
          } else {
            playRounds(result, b);
          }
        }, 250);
      }
    });
  });
}

/* 逐轮播放（无递归） */
function spawnMultipliers(rd){
  var stage = document.querySelector(".ol-stage");
  if (!stage) return;
  var mult = rd.multiplier || 0;
  if (!mult) return;
  // 根据 mult 拆成 1~2 个虚拟乘法器
  var parts = [];
  if (mult <= 25) parts.push(mult);
  else if (mult <= 100) { parts.push(Math.round(mult/2)); parts.push(mult - Math.round(mult/2)); }
  else { parts.push(Math.round(mult/2)); parts.push(mult - Math.round(mult/2)); }
  // 随机位置（stage 内 30%~70% 区域）
  var cells = [];
  if (rd.wins) rd.wins.forEach(function(w){ w.cells.forEach(function(p){ cells.push(p); }); });
  for (var i = 0; i < parts.length; i++) {
    var el = document.createElement("div");
    el.className = "ol-mult";
    el.textContent = "×" + parts[i];
    var src = cells[i] || cells[0] || [0,0];
    var gx = (src[1] + 0.5) / 6 * 100;
    var gy = (src[0] + 0.5) / 5 * 100;
    el.style.left = gx + "%";
    el.style.top = gy + "%";
    stage.appendChild(el);
    (function(el2, delay){
      setTimeout(function(){ el2.classList.add("show"); }, delay);
      setTimeout(function(){ el2.classList.add("fly"); }, delay + 300);
      setTimeout(function(){ if (el2.parentNode) el2.parentNode.removeChild(el2); }, delay + 1400);
    })(el, i * 120);
  }
  // 中心累加显示
  var center = document.createElement("div");
  center.className = "ol-mult-center";
  center.textContent = "×" + mult;
  stage.appendChild(center);
  setTimeout(function(){ center.classList.add("show"); }, 500);
  setTimeout(function(){ center.classList.add("fade"); }, 1200);
  setTimeout(function(){ if (center.parentNode) center.parentNode.removeChild(center); }, 1700);
}

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
    spawnMultipliers(rd);
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
          paintGrid(rounds[i].grid, false);
          setTimeout(playOne, 250);
        } else { finish(totalShown); }
      }, 220);
    }, 500);
  }
  playOne();
}

function finish(totalWin){
  // Big Win 分级横幅（原版 Pragmatic 风格）
  if (typeof ApexBigWin !== 'undefined' && amount > 0) {
    try { ApexBigWin.celebrate(amount, bet()); } catch(e){}
  }
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
  if (totalWin > 0) { bump($('ol-balance')); bump($('ol-won')); }
  if (totalWin > 0) {
    var ratio = totalWin / bet();
    if (ratio >= 10) { safeAudio(A.winBig, 'winBig'); showCelebrate(ratio, totalWin); }
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
  state.betIndex = n; renderBet(); saveState(); safeAudio(A.click, 'click');
}

/* 弹窗 */
function showCelebrate(ratio, totalWin){
  var el = $("ol-celebrate"), tier = $("ol-celebrate-tier"), amt = $("ol-celebrate-amount");
  if (!el || !tier || !amt) return;
  var label = "";
  if (ratio >= 50) label = "MEGA WIN";
  else if (ratio >= 20) label = "BIG WIN";
  else if (ratio >= 10) label = "NICE WIN";
  else return;
  tier.textContent = label;
  amt.textContent = "+" + fmt(totalWin);
  el.classList.toggle("mega", ratio >= 50);
  el.classList.add("show");
  setTimeout(function(){ el.classList.remove("show", "mega"); }, 2400);
}

function showOlFsBanner(remaining, mult){
  var b = $("ol-freespin-banner");
  if (!b) return;
  if (remaining > 0) {
    b.hidden = false;
    $("ol-fs-count").textContent = remaining;
    var m = $("ol-fs-mult");
    if (m) m.textContent = mult ? "×" + mult : "";
  } else {
    b.hidden = true;
    var m2 = $("ol-fs-mult");
    if (m2) m2.textContent = "";
  }
}
function showOlFsSummary(amount){
  var el = $("ol-fs-summary");
  if (!el) return;
  $("ol-fs-total").textContent = fmt(amount);
  el.classList.add("show");
  setTimeout(function(){ el.classList.remove("show"); }, 3000);
}
function runOlympusFreeSpins(b){
  var stage = document.querySelector(".ol-stage");
  if (stage) stage.classList.add("fs-mode");
  var fsResult;
  try { fsResult = E.playFreeSpins(b); }
  catch(e){ console.error("[Olympus] fs error:", e); if (stage) stage.classList.remove("fs-mode"); releaseSpin(); return; }
  var spins = fsResult.spins;
  var idx = 0;
  var cumMult = 0;
  function nextFs(){
    if (idx >= spins.length) {
      if (stage) stage.classList.remove("fs-mode");
      showOlFsBanner(0);
      if (fsResult.totalWin > 0) { safeAudio(A.winBig, "fsWin"); showOlFsSummary(fsResult.totalWin); }
      setTimeout(function(){ finish(fsResult.totalWin); }, fsResult.totalWin > 0 ? 1800 : 200);
      return;
    }
    var sp = spins[idx]; idx++;
    cumMult = sp.zeusMult;
    showOlFsBanner(sp.remaining, cumMult);
    paintGrid(sp.grid, false);
    if (sp.zeusDrops && sp.zeusDrops.length) { safeAudio(A.tumble, "zeus"); spawnZeusMult(sp.zeusDrops, stage); }
    if (sp.win > 0) renderWin(sp.win, "×" + sp.zeusMult + " 倍");
    setTimeout(nextFs, sp.win > 0 ? 1600 : 800);
  }
  nextFs();
}

function spawnZeusMult(drops, stage){
  if (!drops || !drops.length) return;
  drops.forEach(function(d, i){
    var el = document.createElement("div");
    el.className = "ol-mult";
    el.textContent = "×" + d.mult;
    var gx = (d.c + 0.5) / C.CONFIG.cols * 100;
    var gy = (d.r + 0.5) / C.CONFIG.rows * 100;
    el.style.left = gx + "%";
    el.style.top = gy + "%";
    stage.appendChild(el);
    setTimeout(function(){ el.classList.add("show"); }, i * 100);
    setTimeout(function(){ el.classList.add("fly"); }, i * 100 + 300);
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, i * 100 + 1400);
  });
}

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
  var _soundOn = true;
  $('ol-sound').addEventListener('click', function(){
    _soundOn = !_soundOn;
    safeAudio(function(){ A.enabled(_soundOn); }, 'toggle');
    $('ol-sound').style.opacity = _soundOn ? '1' : '0.35';
    toast(_soundOn ? '音效已开' : '音效已关', 900);
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
window.addEventListener('error', function(e){
  try { if (typeof toast === 'function') toast('JS错误: ' + (e.message || '').slice(0, 60), 5000); } catch(x){}
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
