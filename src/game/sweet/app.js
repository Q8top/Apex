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

  var modeBtn = document.getElementById('sw-mode-action');
  if (modeBtn) modeBtn.addEventListener('click', function(){ Events.emit('audio:click'); actionMode(); });

  var menuBtn = document.getElementById('sw-menu');
  if (menuBtn) menuBtn.addEventListener('click', function(){ Events.emit('audio:click'); openMenu(); });

  var histBtn = document.getElementById('sw-history');
  if (histBtn) histBtn.addEventListener('click', function(){ Events.emit('audio:click'); openHistory(); });

  var payBtn = document.getElementById('sw-paytable');
  if (payBtn) payBtn.addEventListener('click', function(){ Events.emit('audio:click'); openPaytable(); });

  var modalX = document.getElementById('sw-modal-x');
  var modalMask = document.getElementById('sw-modal-mask');
  if (modalX) modalX.addEventListener('click', closeModal);
  if (modalMask) modalMask.addEventListener('click', closeModal);

  updateModeBtn();

  var minus = document.getElementById('sw-bet-minus');
  var plus = document.getElementById('sw-bet-plus');
  if (minus) minus.addEventListener('click', function(){ changeBet(-1); });
  if (plus) plus.addEventListener('click', function(){ changeBet(1); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

function openModal(title, html){
  var t = document.getElementById('sw-modal-title');
  var b = document.getElementById('sw-modal-body');
  var m = document.getElementById('sw-modal');
  if (!t || !b || !m) return;
  t.textContent = title;
  b.innerHTML = html;
  m.classList.add('show');
  m.setAttribute('aria-hidden', 'false');
}
function closeModal(){
  var m = document.getElementById('sw-modal');
  if (!m) return;
  m.classList.remove('show');
  m.setAttribute('aria-hidden', 'true');
}

function updateModeBtn(){
  var btn = document.getElementById('sw-mode-action');
  if (!btn) return;
  var txt = btn.querySelector('span');
  if (!txt) return;
  txt.textContent = (MODE === 'demo') ? '重置余额' : '充值余额';
}

function actionMode(){
  if (State.get() !== State.S.IDLE) { HUD.toast('请等待本局结束'); return; }
  if (MODE === 'demo') {
    if (!confirm('重置演示余额为 ' + HUD.fmt(Config.CONFIG.initialBalance) + '？')) return;
    state.balance = Config.CONFIG.initialBalance;
    state.betIndex = Config.CONFIG.defaultBetIndex;
    state.history = [];
    saveLocal();
    saveHist();
    Events.emit('balance:change', { balance: state.balance, animate: false });
    Events.emit('bet:change', { bet: bet() });
    HUD.updateWin(0, '');
    HUD.toast('已重置');
  } else {
    openModal('充值', '<p style="text-align:center;padding:14px 0 22px;color:#666;">充值功能开发中，敬请期待。</p>');
  }
}

function openMenu(){
  var isDemo = MODE === 'demo';
  var soundOn = AudioBridge.isEnabled();
  var html =
    '<div class="sw-menu-list">' +
      '<button type="button" class="sw-menu-item" data-act="sound"><span>音效</span><small>' + (soundOn ? '开' : '关') + '</small></button>' +
      '<button type="button" class="sw-menu-item" data-act="history"><span>游戏记录</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="paytable"><span>赔付表</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="balance"><span>当前余额</span><small>' + HUD.fmt(state.balance) + '</small></button>' +
      '<button type="button" class="sw-menu-item" data-act="mode"><span>' + (isDemo ? '重置余额' : '充值余额') + '</span></button>' +
      '<button type="button" class="sw-menu-item" data-act="info"><span>游戏说明</span></button>' +
    '</div>';
  openModal('菜单 · ' + (isDemo ? '试玩模式' : '游戏模式'), html);
  setTimeout(function(){
    var body = document.getElementById('sw-modal-body');
    if (!body || body.__menuBound) return;
    body.__menuBound = true;
    body.addEventListener('click', function(e){
      var item = e.target.closest ? e.target.closest('.sw-menu-item') : null;
      if (!item) return;
      var act = item.getAttribute('data-act');
      if (act === 'sound') {
        var nv = !AudioBridge.isEnabled();
        AudioBridge.setEnabled(nv);
        var st = item.querySelector('small');
        if (st) st.textContent = nv ? '开' : '关';
      } else if (act === 'history') { closeModal(); setTimeout(openHistory, 180); }
      else if (act === 'paytable') { closeModal(); setTimeout(openPaytable, 180); }
      else if (act === 'mode') { closeModal(); setTimeout(actionMode, 180); }
      else if (act === 'info') { closeModal(); setTimeout(function(){ HUD.toast('本游戏为虚拟积分娱乐，不涉及真实货币'); }, 240); }
      else if (act === 'balance') { HUD.toast('当前余额 ' + HUD.fmt(state.balance), 1500); }
    });
  }, 30);
}

function openPaytable(){
  var order = ['candyBlue','candyGreen','candyPurple','candyRed','candyOrange','candyYellow','banana','grape','watermelon','apple','plum','lollipop'];
  var html = '<div style="font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.7;">6×5 Cluster Pays（8 个及以上相邻同类消除）</div>';
  order.forEach(function(id){
    var s = Config.SYMBOLS[id];
    var icon = Renderer.get(id);
    var payText = '';
    if (id === 'lollipop') payText = '4/5/6 个 → 免费旋转 10/12/15 次';
    else {
      var tbl = Config.PAYOUTS[id];
      if (tbl) payText = '8-9个×' + tbl[8] + ' · 10-11个×' + tbl[10] + ' · 12+个×' + tbl[12];
    }
    html += '<div class="sym-row"><div class="sym-icon">' + icon + '</div><div><div class="sym-name">' + s.name + '</div><div class="sym-pay">' + payText + '</div></div></div>';
  });
  openModal('赔付表', html);
}

function openHistory(){
  if (!state.history.length) {
    openModal('游戏记录', '<p style="text-align:center;padding:24px 0;color:#999;">暂无记录</p>');
    return;
  }
  var tb = 0, tw = 0, w = 0;
  state.history.forEach(function(h){ tb += h.bet; tw += h.win; if (h.win > 0) w++; });
  var rate = (w / state.history.length * 100).toFixed(1);
  var head = '<div class="hist-summary">' +
    '<div><span>总局数</span><b>' + state.history.length + '</b></div>' +
    '<div><span>中奖次数</span><b>' + w + '</b></div>' +
    '<div><span>中奖率</span><b>' + rate + '%</b></div>' +
    '<div><span>总下注</span><b>' + HUD.fmt(tb) + '</b></div>' +
    '<div><span>总中奖</span><b>' + HUD.fmt(tw) + '</b></div>' +
    '<div><span>净赢</span><b>' + HUD.fmt(tw - tb) + '</b></div>' +
    '</div>';
  var rows = '';
  state.history.slice(0, 20).forEach(function(h){
    var cls = h.delta > 0 ? 'win' : 'lose';
    var txt = (h.delta > 0 ? '+' : '') + '¥' + h.delta.toFixed(2);
    var t = new Date(h.ts);
    var hh = String(t.getHours()).padStart(2, '0');
    var mm = String(t.getMinutes()).padStart(2, '0');
    rows += '<div class="hist-row"><div><div style="font-weight:700;">下注 ' + HUD.fmt(h.bet) + '</div><div style="font-size:12px;color:#999;">' + hh + ':' + mm + ' · 中奖 ' + HUD.fmt(h.win) + '</div></div><div class="hist-amt ' + cls + '">' + txt + '</div></div>';
  });
  openModal('游戏记录', head + rows);
}

window.SweetApp = { init: init, doSpin: doSpin };
})();
