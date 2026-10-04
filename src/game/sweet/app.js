/* Sweet · App
   主控：初始化所有模块 + 编排 spin 全流程。
   依赖：State / Events / Config / MathEngine / ReelController /
         HUD / WinPresentation / FreeSpin / BigWin / AudioBridge / Particles
   规则：
   - 所有 async callback 走 State.isCurrent(gen)
   - Demo / Real 分支只在 settlement 处不同
   - Real settlement 成功后 → balance 更新 → 才 emit win:big
*/
(function(){
'use strict';

var State       = window.SweetState;
var Events      = window.SweetEvents;
var Config      = window.SweetGameConfig;
var MathEngine  = window.SweetMathEngine;
var ReelCtrl    = window.SweetReelController;
var Renderer    = window.SweetSymbolRenderer;
var HUD         = window.SweetHUD;
var Win         = window.SweetWinPresentation;
var FS          = window.SweetFreeSpin;
var BigWin      = window.SweetBigWin;
var AudioBridge = window.SweetAudioBridge;
var Particles   = window.SweetParticles;

var MODE = (function(){
  var m = String(location.search).match(/[?&]mode=([a-z]+)/i);
  var v = m ? m[1].toLowerCase() : 'demo';
  return v === 'real' ? 'real' : 'demo';
})();

var LS_STATE = 'apex_sweet_v2_' + MODE + '_state';
var LS_HIST  = 'apex_sweet_v2_' + MODE + '_history';

var state = {
  balance: Config.CONFIG.initialBalance,
  betIndex: Config.CONFIG.defaultBetIndex,
  history: [],
  autoOn: false,
  ready: false
};

function $(id){ return document.getElementById(id); }

function bet(){ return Config.CONFIG.betSteps[state.betIndex]; }

function getCsrf(){
  var m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?apex_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function cellAt(r, c){
  return document.querySelectorAll('#sw-grid .sw-cell')[r * Config.CONFIG.cols + c];
}

function paintGrid(grid){
  if (!grid) return;
  for (var r = 0; r < Config.CONFIG.rows; r++) {
    for (var c = 0; c < Config.CONFIG.cols; c++) {
      var el = cellAt(r, c);
      if (!el) continue;
      var svg = el.querySelector('svg');
      if (svg) {
        svg.style.transition = '';
        svg.style.transform = '';
        svg.style.opacity = '';
        svg.style.transformOrigin = '';
      }
      el.innerHTML = Renderer.get(grid[r][c]);
      el.classList.remove('winning');
    }
  }
}

function loadLocal(){
  if (MODE === 'real') return;
  try {
    var d = JSON.parse(localStorage.getItem(LS_STATE) || '{}');
    if (typeof d.balance === 'number' && d.balance >= 0) state.balance = d.balance;
    if (typeof d.betIndex === 'number') state.betIndex = d.betIndex;
  } catch(e){}
}
function saveLocal(){
  if (MODE === 'real') return;
  try {
    localStorage.setItem(LS_STATE, JSON.stringify({
      balance: state.balance,
      betIndex: state.betIndex
    }));
  } catch(e){}
}
function loadHist(){
  try {
    var d = JSON.parse(localStorage.getItem(LS_HIST) || '[]');
    if (Array.isArray(d)) state.history = d.slice(0, 30);
  } catch(e){}
}
function saveHist(){
  try { localStorage.setItem(LS_HIST, JSON.stringify(state.history.slice(0, 30))); } catch(e){}
}

function clearWinning(){
  var cells = document.querySelectorAll('#sw-grid .sw-cell');
  for (var i = 0; i < cells.length; i++) {
    cells[i].classList.remove('winning');
    var svg = cells[i].querySelector('svg');
    if (svg) {
      svg.style.transition = '';
      svg.style.transform = '';
      svg.style.opacity = '';
      svg.style.transformOrigin = '';
    }
  }
}

var pendingResult = null;

function doSpin(){
  if (!state.ready) return;
  if (State.get() !== State.S.IDLE) return;

  var b = bet();
  if (state.balance < b) {
    HUD.toast('余额不足' + (MODE === 'demo' ? '，请重置' : '，请充值'));
    return;
  }

  var gen = State.next();
  State.to(State.S.SPINNING);
  Events.emit('spin:start', { gen: gen });

  clearWinning();
  HUD.updateWin(0, '');

  var result;
  try {
    result = (MODE === 'demo') ? MathEngine.spinDemo(b) : MathEngine.playFullSpin(b, false);
  } catch(e) {
    console.error('[SweetApp] engine error', e);
    State.to(State.S.IDLE);
    Events.emit('spin:end', { gen: gen });
    return;
  }

  var firstGrid = (result.rounds && result.rounds.length) ? result.rounds[0].grid : result.finalGrid;

  var layer = document.querySelector('.stage-symbols');
  ReelCtrl.init(layer);
  var ok = ReelCtrl.build(firstGrid, Config.symbolKeys());
  if (!ok) {
    paintGrid(firstGrid);
    Events.emit('reel:allstop', { gen: gen, fallback: true });
  } else {
    if (layer) layer.classList.add('active');
    ReelCtrl.start(gen);
  }

  pendingResult = { result: result, firstGrid: firstGrid, bet: b, gen: gen };
}

function settleAndPresent(gen, b, result){
  if (!State.isCurrent(gen)) return;

  var totalWin = result.totalWin || 0;

  if (MODE === 'demo') {
    state.balance = state.balance - b + totalWin;
    saveLocal();
    Events.emit('balance:change', { balance: state.balance, animate: true });
    afterSettle(gen, b, totalWin);
    return;
  }

  fetch('/api/slot/spin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify({ bet: b, totalWin: totalWin })
  })
  .then(function(r){ return r.json().catch(function(){ return null; }); })
  .then(function(d){
    if (!State.isCurrent(gen)) return;
    if (d && d.success) {
      state.balance = Number(d.balanceAfter);
      Events.emit('balance:change', { balance: state.balance, animate: true });
      afterSettle(gen, b, totalWin);
    } else {
      HUD.toast('结算失败');
      State.to(State.S.IDLE);
      Events.emit('spin:end', { gen: gen });
    }
  })
  .catch(function(){
    if (!State.isCurrent(gen)) return;
    HUD.toast('网络错误');
    State.to(State.S.IDLE);
    Events.emit('spin:end', { gen: gen });
  });
}

function afterSettle(gen, b, totalWin){
  if (!State.isCurrent(gen)) return;

  state.history.unshift({ bet: b, win: totalWin, delta: totalWin - b, ts: Date.now() });
  state.history = state.history.slice(0, 30);
  saveHist();

  Events.emit('win:settled', { gen: gen, totalWin: totalWin, bet: b });

  if (totalWin > 0) {
    Events.emit('win:big', { gen: gen, totalWin: totalWin, bet: b });
  }

  State.to(State.S.IDLE);
  Events.emit('spin:end', { gen: gen });

  if (state.autoOn) {
    setTimeout(function(){
      if (!state.autoOn) return;
      if (State.get() !== State.S.IDLE) return;
      doSpin();
    }, 700);
  }
}

Events.on('reel:allstop', function(d){
  if (!d || !pendingResult) return;
  if (!State.isCurrent(d.gen)) return;

  var pr = pendingResult;
  pendingResult = null;

  var gridEl = document.getElementById('sw-grid');
  if (gridEl) gridEl.style.opacity = '1';

  paintGrid(pr.firstGrid);
  var layer = document.querySelector('.stage-symbols');
  if (layer) { layer.classList.remove('active'); layer.innerHTML = ''; }

  var result = pr.result;

  var fsCount = Config.getFreeSpinCount(result.scatterCount || 0);
  if (fsCount > 0) {
    FS.play({
      bet: pr.bet,
      scatterCount: result.scatterCount,
      gen: pr.gen,
      cellAt: cellAt,
      onFinish: function(totalFsWin){
        if (!State.isCurrent(pr.gen)) return;
        State.to(State.S.IDLE);
        settleAndPresent(pr.gen, pr.bet, { totalWin: totalFsWin });
      }
    });
    return;
  }

  State.to(State.S.WIN_PRESENT);
  var rounds = result.rounds || [];
  var idx = 0;
  var totalShown = 0;

  function next(){
    if (!State.isCurrent(pr.gen)) return;
    if (idx >= rounds.length) {
      State.to(State.S.SETTLING);
      settleAndPresent(pr.gen, pr.bet, result);
      return;
    }
    var rd = rounds[idx];
    if (!rd || !rd.wins || !rd.wins.length) { idx++; next(); return; }
    totalShown += rd.roundWin;
    Events.emit('win:update', { amount: totalShown, combo: '' });
    Win.playRound(rd, pr.gen, cellAt, function(){
      idx++;
      if (idx < rounds.length && rounds[idx] && rounds[idx].grid) {
        paintGrid(rounds[idx].grid);
      }
      next();
    });
  }
  next();
});

Events.on('grid:paint', function(d){
  if (!d || !d.grid) return;
  paintGrid(d.grid);
});

Events.on('fs:summary', function(d){
  var el = document.getElementById('sw-fs-summary');
  if (!el) return;
  var tot = document.getElementById('sw-fs-total');
  if (tot) tot.textContent = HUD.fmt(d.totalWin);
  el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, 3000);
});

function changeBet(dir){
  if (State.get() !== State.S.IDLE) return;
  var n = state.betIndex + dir;
  var max = Config.CONFIG.betSteps.length - 1;
  if (n < 0) n = 0;
  if (n > max) n = max;
  if (n === state.betIndex) return;
  state.betIndex = n;
  saveLocal();
  Events.emit('bet:change', { bet: bet() });
  Events.emit('audio:click');
}

function init(){
  HUD.init();
  HUD.bindEvents();
  AudioBridge.init();
  AudioBridge.bindEvents();
  BigWin.bindEvents();

  var canvas = document.getElementById('sw-fx');
  if (canvas) {
    Particles.init(canvas);
    Particles.bindEvents();
  }

  var box = document.getElementById('sw-grid');
  if (box) {
    box.innerHTML = '';
    for (var i = 0; i < Config.CONFIG.rows * Config.CONFIG.cols; i++) {
      var c = document.createElement('div');
      c.className = 'sw-cell';
      c.setAttribute('data-idx', String(i));
      box.appendChild(c);
    }
  }

  HUD.updateBet(bet());
  HUD.updateWin(0, '');

  if (MODE === 'real') {
    fetch('/api/me', { credentials: 'include', cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.success || !d.user) {
          HUD.toast('请先登录');
          setTimeout(function(){ location.replace('/'); }, 800);
          return;
        }
        state.balance = Number(d.user.walletBalance) || 0;
        state.ready = true;
        Events.emit('balance:change', { balance: state.balance, animate: false });
        paintGrid(MathEngine.spin());
        if (typeof ApexLoader !== 'undefined') ApexLoader.hide();
      })
      .catch(function(){ HUD.toast('网络错误'); });
  } else {
    loadLocal();
    loadHist();
    state.ready = true;
    Events.emit('balance:change', { balance: state.balance, animate: false });
    paintGrid(MathEngine.spin());
    if (typeof ApexLoader !== 'undefined') ApexLoader.hide();
  }

  var spinBtn = document.getElementById('sw-spin');
  if (spinBtn) spinBtn.addEventListener('click', function(){ Events.emit('audio:click'); doSpin(); });

  var autoBtn = document.getElementById('sw-auto');
  if (autoBtn) autoBtn.addEventListener('click', function(){
    state.autoOn = !state.autoOn;
    autoBtn.classList.toggle('active', state.autoOn);
    var sp = autoBtn.querySelector('span');
    if (sp) sp.textContent = state.autoOn ? '停止' : '自动';
    HUD.toast(state.autoOn ? '自动模式开启' : '自动模式停止');
    if (state.autoOn) doSpin();
  });

  var minus = document.getElementById('sw-bet-minus');
  var plus = document.getElementById('sw-bet-plus');
  if (minus) minus.addEventListener('click', function(){ changeBet(-1); });
  if (plus) plus.addEventListener('click', function(){ changeBet(1); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

window.SweetApp = { init: init, doSpin: doSpin };
})();
