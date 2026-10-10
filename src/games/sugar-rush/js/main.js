(function(){
'use strict';

var Engine = window.ApexSugarRushGameEngine;
var Symbols = window.ApexSugarRushSymbolsV2;
var Lock = window.ApexSugarRushSymbolsLocked;
var Payout = window.ApexSugarRushPayout;
var Multiplier = window.ApexSugarRushMultiplier;
var Bonus = window.ApexSugarRushBonus;
var Audio = window.ApexSugarRushAudio;
var perfInst = null;
var autospinCtl = null;
var animatorInst = null;
var audioBridgeInst = null;
var hapticsInst = null;

var BET_OPTIONS = [100, 200, 500, 1000, 2000, 5000, 10000];
var DEFAULT_BET_INDEX = 0;
var START_BALANCE_MINOR = 1000000;

var state = {
  mode: "demo",
  balanceMinor: START_BALANCE_MINOR,
  betIndex: DEFAULT_BET_INDEX,
  spinning: false,
  fastMode: false,
  autoSpinning: false,
  autoRemaining: 0,
  tumbleTimers: [],
  currentSpinId: null,
  skipRequested: false,
  currentBetMinor: 100,
  payScaleDemo: 1
};

var el = {};
function $(id){ return document.getElementById(id); }
function cacheEls(){
  el.board = $("sr-board");
  el.balance = $("sr-balance");
  el.bet = $("sr-bet");
  el.win = $("sr-win");
  el.betDisplay = $("sr-bet-display");
  el.betMinus = $("sr-bet-minus");
  el.betPlus = $("sr-bet-plus");
  el.spinBtn = $("sr-spin-btn");
  el.autoBtn = $("sr-auto-btn");
  el.fastBtn = $("sr-fast-btn");
  el.resetBtn = $("sr-reset-btn");
  el.skipBtn = $("sr-skip-btn");
  el.tumbleCounter = $("sr-tumble-counter");
  el.menuBtn = $("sr-menu-btn");
}

/* ---------- format + UI ---------- */
function fmt(minor){ return Payout.formatMinor(minor, "\u00a5"); }

function updateBalance(){ el.balance.textContent = fmt(state.balanceMinor); if (el.spinBtn && !state.spinning) updateBetDisplay(); }
function updateBetDisplay(){
  var b = BET_OPTIONS[state.betIndex];
  el.bet.textContent = fmt(b);
  el.betDisplay.textContent = fmt(b);
  el.betMinus.disabled = state.betIndex <= 0 || state.spinning;
  el.betPlus.disabled = state.betIndex >= BET_OPTIONS.length - 1 || state.spinning;
  var canAfford = state.balanceMinor >= b;
  if (!state.autoSpinning) el.spinBtn.disabled = state.spinning || !canAfford;
  el.autoBtn.disabled = !canAfford && !state.autoSpinning;
}
function updateWin(minor){ el.win.textContent = fmt(minor); }

function renderGrid(types){
  var board = el.board;
  var cells = board.children;
  var expected = types.length;
  if (cells.length !== expected){
    board.innerHTML = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < expected; i++){
      var cell = document.createElement("div");
      cell.className = "sr-sym";
      cell.dataset.index = String(i);
      frag.appendChild(cell);
    }
    board.appendChild(frag);
    cells = board.children;
  }
  for (var j = 0; j < expected; j++){
    var c = cells[j];
    var id = types[j];
    if (c.dataset.sid === id && c.firstChild) continue;
    c.innerHTML = Symbols.get(id);
    c.dataset.sid = id;
    c.classList.remove("is-winning", "is-removing", "is-dropping-in");
  }
}

function clearCellAnim(){
  var cells = el.board.children;
  for (var i = 0; i < cells.length; i++){
    cells[i].classList.remove("is-winning", "is-removing", "is-dropping-in");
  }
}

/* ---------- animation ---------- */
function pushTimer(id){ state.tumbleTimers.push(id); }
function clearTimers(){
  for (var i = 0; i < state.tumbleTimers.length; i++) clearTimeout(state.tumbleTimers[i]);
  state.tumbleTimers.length = 0;
}
function delay(ms){
  var effective = state.skipRequested ? Math.min(ms, 30) : ms;
  return new Promise(function(res){
    if (animatorInst && typeof animatorInst.delay === 'function'){
      try {
        animatorInst.delay(effective, res);
        return;
      } catch (e) { /* fall through */ }
    }
    pushTimer(setTimeout(res, effective));
  });
}

function applyDropIn(){
  var cells = el.board.children;
  var stagger = state.fastMode ? 8 : 16;
  for (var i = 0; i < cells.length; i++){
    var col = i % window.ApexSugarRushGrid.GRID.columns;
    cells[i].style.setProperty("--sr-drop-delay", (col * stagger) + "ms");
    cells[i].classList.add("is-dropping-in");
  }
  return delay((state.fastMode ? 120 : 200) + 7 * stagger + 100);
}

function showWinFlash(text, tier){
  var old = el.board.querySelector(".sr-win-flash");
  if (old) old.remove();
  var div = document.createElement("div");
  div.className = "sr-win-flash";
  if (tier) div.classList.add("is-" + tier);
  div.textContent = text;
  el.board.appendChild(div);
  requestAnimationFrame(function(){ div.classList.add("is-show"); });
  return delay(700).then(function(){
    div.classList.remove("is-show");
    return delay(300).then(function(){ div.remove(); });
  });
}

function markWinning(positions){
  var cells = el.board.children;
  for (var i = 0; i < positions.length; i++){
    var c = cells[positions[i]];
    if (c) c.classList.add("is-winning");
  }
}
function markRemoving(positions){
  var cells = el.board.children;
  for (var i = 0; i < positions.length; i++){
    var c = cells[positions[i]];
    if (c){ c.classList.remove("is-winning"); c.classList.add("is-removing"); }
  }
}
function showFloatWin(positions, amountMinor){
  if (!positions || !positions.length) return;
  var cells = el.board.children;
  var anchor = cells[positions[0]];
  if (!anchor) return;
  var div = document.createElement('div');
  div.className = 'sr-float-win';
  div.textContent = '+' + fmt(amountMinor);
  anchor.appendChild(div);
  setTimeout(function(){ if (div.parentNode) div.parentNode.removeChild(div); }, 1200);
}

function updateTumbleCounter(step){
  if (step <= 1){ el.tumbleCounter.hidden = true; return; }
  el.tumbleCounter.hidden = false;
  el.tumbleCounter.textContent = "x" + step;
}

/* ---------- tumble playback ---------- */
function playSteps(steps, finalGrid, opts){
  opts = opts || {};
  if (!steps || steps.length === 0){
    if (finalGrid) renderGrid(finalGrid);
    return Promise.resolve();
  }
  var p = Promise.resolve();
  steps.forEach(function(step, i){
    p = p.then(function(){
      if (!opts.noCounter) updateTumbleCounter(i + 1);
      markWinning(step.winningPositions);
      if (step.wins && step.wins.length && state.mode === 'demo'){
        // P0-3b: only demo mode shows float estimates; real gets authoritative values from server
        for (var k = 0; k < step.wins.length; k++){
          var w = step.wins[k];
          var amt = Math.floor(state.currentBetMinor * w.payoutMultiplier * state.payScaleDemo);
          if (amt > 0) showFloatWin(w.positions, amt);
        }
      }
      return delay(state.fastMode ? 200 : 400);
    }).then(function(){
      markRemoving(step.winningPositions);
      return delay(state.fastMode ? 120 : 250);
    }).then(function(){
      renderGrid(step.gridAfter);
      if (Audio) playAudio("tumble-land");
      return applyDropIn();
    });
  });
  return p.then(function(){
    if (finalGrid) renderGrid(finalGrid);
    if (!opts.keepCounter) el.tumbleCounter.hidden = true;
    clearCellAnim();
  });
}

function playBaseCascades(detail){
  return playSteps(detail.baseSteps || [], detail.baseFinalGrid);
}

function playFsSequence(fsDetail){
  if (!fsDetail || fsDetail.length === 0) return Promise.resolve();
  var overlay = document.getElementById("sr-fs-overlay");
  if (overlay) overlay.hidden = false;
  var total = fsDetail.length;
  var countEl = document.getElementById("sr-fs-count");
  var p = Promise.resolve();
  fsDetail.forEach(function(d, idx){
    p = p.then(function(){
      if (countEl) countEl.textContent = "\u5269\u4f59 " + (total - idx);
      var bombs = [];
      for (var i = 0; i < d.initialGrid.length; i++){
        if (window.ApexSugarRushSymbolsLocked.kindOf(d.initialGrid[i]) === 'multiplier') bombs.push(i);
      }
      if (bombs.length && Audio) playAudio("multiplier");
      return playSteps(d.steps || [], d.finalGrid, { keepCounter: true, noCounter: true });
    });
  });
  return p.then(function(){
    if (overlay) overlay.hidden = true;
  });
}

/* ---------- spin ---------- */
function makeSpinId(){
  var b = new Uint8Array(8);
  crypto.getRandomValues(b);
  var s = "";
  for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return "sr-" + Date.now().toString(36) + "-" + s;
}

function doRealSpin(betMinor, opts){
  var client = window.apiClient;
  if (!client || typeof client.post !== 'function'){
    state.spinning = false;
    if (el.skipBtn) el.skipBtn.hidden = true;
    el.board.removeAttribute('data-spinning');
    updateBetDisplay();
    if (!opts.silent) alert(window.ApexI18n ? window.ApexI18n.t('sr.toast.loginRequired') : '\u767b\u5f55\u540e\u624d\u80fd\u8fdb\u5165\u6b63\u5f0f\u6e38\u620f');
    return Promise.resolve();
  }
  var spinId = makeSpinId();
  el.board.setAttribute('data-spinning', '1');
  return client.post('/api/game/sugar-rush-spin', {
    spinId: spinId, betMinor: betMinor, mode: 'real'
  }).then(function(resp){
    if (!resp || !resp.success){
      var code = resp && resp.code ? resp.code : 'unknown';
      if (code === 'unauthenticated'){
        if (!opts.silent) alert(window.ApexI18n ? window.ApexI18n.t('sr.toast.loginRequired') : '\u8bf7\u5148\u767b\u5f55');
        location.href = '/?login=1';
      } else if (code === 'insufficient_balance'){
        if (!opts.silent) alert(window.ApexI18n ? window.ApexI18n.t('sr.toast.insufficient') : '\u4f59\u989d\u4e0d\u8db3');
      } else {
        if (!opts.silent) alert((window.ApexI18n ? window.ApexI18n.t('sr.toast.realSpinFailed') : '\u65cb\u8f6c\u5931\u8d25') + ': ' + code);
      }
      throw new Error('real_spin_failed:' + code);
    }
    var r = resp.result || {};
    var finalGrid = r.finalGrid || [];
    if (finalGrid.length === 49) renderGrid(finalGrid);
    if (resp.balanceAfter != null) { state.balanceMinor = resp.balanceAfter; updateBalance(); }
    var winMinor = resp.winMinor || 0;
    updateWin(winMinor);
    if (winMinor > 0){
      var ratio = winMinor / betMinor;
      var tier = ratio >= 100 ? 'super' : ratio >= 50 ? 'mega' : ratio >= 20 ? 'big' : null;
      if (Audio) playAudio(ratio >= 20 ? 'win-big' : 'win-normal');
      return showWinFlash('+' + fmt(winMinor), tier);
    }
  }).then(function(){
    state.spinning = false;
    state.skipRequested = false;
    if (el.skipBtn) el.skipBtn.hidden = true;
    el.board.removeAttribute('data-spinning');
    updateBetDisplay();
  }).catch(function(err){
    state.spinning = false;
    state.skipRequested = false;
    if (el.skipBtn) el.skipBtn.hidden = true;
    el.board.removeAttribute('data-spinning');
    updateBetDisplay();
    console.error('[sugar-rush] real spin error', err);
  });
}

function doSpin(opts){
  opts = opts || {};
  if (state.spinning) return Promise.resolve();
  var betMinor = BET_OPTIONS[state.betIndex];
  if (state.balanceMinor < betMinor){
    if (Audio) playAudio("ui-tap");
    if (!opts.silent) alert(window.ApexI18n ? window.ApexI18n.t("sr.toast.insufficient") : "\u4f59\u989d\u4e0d\u8db3");
    stopAuto();
    return Promise.resolve();
  }
state.spinning = true;
  state.skipRequested = false;
  if (el.skipBtn) el.skipBtn.hidden = false;
  state.currentSpinId = makeSpinId();
  state.balanceMinor -= betMinor;
  updateBalance();
  updateBetDisplay();
  el.spinBtn.disabled = true;
  updateWin(0);
  clearTimers();
  clearCellAnim();
  el.board.setAttribute("data-spinning", "1");

  if (state.mode === 'real'){
    return doRealSpin(betMinor, opts);
  }

  return Promise.resolve().then(function(){
    var result = Engine.spin(state.mode, betMinor, { detail: true });
    var d = result.detail;
    if (state.mode === 'demo'){ state.payScaleDemo = d.payScale || 1; }
    renderGrid(d.initialGrid);
    return applyDropIn().then(function(){
      return playBaseCascades(d);
    }).then(function(){
      if (result.fsTriggered){
        if (Audio) playAudio("scatter");
        return delay(250).then(function(){ return playFsSequence(d.fsDetail); });
      }
      state.balanceMinor += result.winMinor;
      updateBalance();
      updateWin(result.winMinor);
      if (result.winMinor > 0) {
        var ratio = result.winMinor / betMinor;
        var tier = ratio >= 100 ? 'super' : ratio >= 50 ? 'mega' : ratio >= 20 ? 'big' : null;
        if (Audio) playAudio(ratio >= 20 ? "win-big" : "win-normal");
        return showWinFlash("+" + fmt(result.winMinor), tier);
      }
    }).then(function(){
      state.spinning = false;
      state.skipRequested = false;
      if (el.skipBtn) el.skipBtn.hidden = true;
      el.board.removeAttribute("data-spinning");
      updateBetDisplay();
      return result;
    }).catch(function(err){
      state.spinning = false;
      state.skipRequested = false;
      if (el.skipBtn) el.skipBtn.hidden = true;
      el.board.removeAttribute("data-spinning");
      updateBetDisplay();
      console.error("[sugar-rush] spin error", err);
    });
  });
}

/* ---------- auto spin ---------- */
function autoSpinFn(){
  return doSpin({ silent: true }).then(function(){
    if (state.balanceMinor < BET_OPTIONS[state.betIndex]){
      return { stop: true, stopReason: 'insufficient' };
    }
    return { stop: false };
  }).catch(function(){
    return { stop: true, stopReason: 'spin_error' };
  });
}

function startAutoViaCtl(n){
  if (autospinCtl && autospinCtl.isRunning()) return;
  try {
    autospinCtl = window.ApexAutoSpin.create({
      delay: state.fastMode ? 100 : 400,
      maxSpins: n,
      spinFn: autoSpinFn,
      onState: function(st){
        var running = (st === 'spinning' || st === 'waiting');
        state.autoSpinning = running;
        var lbl = el.autoBtn.querySelector("span");
        if (lbl) lbl.textContent = running ? 'STOP' : 'AUTO';
      },
      onFinish: function(reason){
        state.autoSpinning = false;
        state.autoRemaining = 0;
        el.autoBtn.removeAttribute('data-active');
        var lbl = el.autoBtn.querySelector("span");
        if (lbl) lbl.textContent = 'AUTO';
        autospinCtl = null;
      }
    });
    el.autoBtn.setAttribute('data-active', '1');
    var lbl2 = el.autoBtn.querySelector("span");
    if (lbl2) lbl2.textContent = 'x' + n;
    autospinCtl.start();
  } catch (e) {
    autospinCtl = null;
  }
}

function stopAuto(){
  if (autospinCtl){
    try { autospinCtl.stop(); } catch (e) {}
    autospinCtl = null;
  }
  state.autoSpinning = false;
  state.autoRemaining = 0;
  el.autoBtn.removeAttribute("data-active");
  el.autoBtn.querySelector("span").textContent = "\u81ea\u52a8";
}
function startAuto(n){
  if (window.ApexAutoSpin && typeof window.ApexAutoSpin.create === 'function'){
    startAutoViaCtl(n);
    return;
  }
  state.autoSpinning = true;
  state.autoRemaining = n;
  el.autoBtn.setAttribute("data-active", "1");
  el.autoBtn.querySelector("span").textContent = "x" + n;
  autoLoop();
}
function autoLoop(){
  if (!state.autoSpinning) return;
  if (state.autoRemaining <= 0){ stopAuto(); return; }
  state.autoRemaining--;
  el.autoBtn.querySelector("span").textContent = "x" + state.autoRemaining;
  doSpin({ silent: true }).then(function(){
    if (!state.autoSpinning) return;
    setTimeout(autoLoop, state.fastMode ? 100 : 400);
  });
}

/* ---------- events ---------- */
function bindEvents(){
  el.betMinus.addEventListener("click", function(){
    if (Audio) playAudio("ui-tap");
    if (state.spinning) return;
    if (state.betIndex > 0){ state.betIndex--; updateBetDisplay(); }
  });
  el.betPlus.addEventListener("click", function(){
    if (Audio) playAudio("ui-tap");
    if (state.spinning) return;
    if (state.betIndex < BET_OPTIONS.length - 1){ state.betIndex++; updateBetDisplay(); }
  });
  el.spinBtn.addEventListener("click", function(){
    if (state.autoSpinning) stopAuto();
    else doSpin();
  });
  el.autoBtn.addEventListener("click", function(){
    if (state.autoSpinning) stopAuto();
    else startAuto(20);
  });
  el.fastBtn.addEventListener("click", function(){
    if (Audio) playAudio("ui-tap");
    state.fastMode = !state.fastMode;
    el.board.setAttribute("data-fast", state.fastMode ? "1" : "0")
    if (state.fastMode) el.fastBtn.setAttribute("data-active", "1")
    else el.fastBtn.removeAttribute("data-active")
  });
  if (el.menuBtn) el.menuBtn.addEventListener("click", function(){ openSheet(); });
  var sfxBtn = document.getElementById("sr-sfx-toggle");
  var sfxState = document.getElementById("sr-sfx-state");
  if (sfxBtn && sfxState){
    var stored = null;
    try { stored = localStorage.getItem("sr.audio.enabled"); } catch (e) {}
    if (stored === "0"){ if (Audio) Audio.setEnabled(false); sfxState.textContent = "\u5173"; }
    sfxBtn.addEventListener("click", function(){
      var on = !(Audio && Audio.isEnabled());
      if (Audio) Audio.setEnabled(on);
      sfxState.textContent = on ? "\u5f00" : "\u5173";
      try { localStorage.setItem("sr.audio.enabled", on ? "1" : "0"); } catch (e) {}
      if (Audio) playAudio("ui-tap");
    });
  }
  if (el.skipBtn) el.skipBtn.addEventListener("click", function(){
    state.skipRequested = true;
    clearTimers();
  });
  el.resetBtn.addEventListener("click", function(){
    if (state.spinning) return;
    state.balanceMinor = START_BALANCE_MINOR;
    updateBalance();
    updateWin(0);
  });
}

/* ---------- init ---------- */
function applyI18n(){
  if (!window.ApexI18n || typeof window.ApexI18n.t !== 'function') return;
  var t = window.ApexI18n.t;
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++){
    var el = els[i];
    var key = el.getAttribute('data-i18n');
    if (!key) continue;
    var v = t(key);
    if (v && v !== key) el.textContent = v;
  }
  var attrs = document.querySelectorAll('[data-i18n-attr]');
  for (var j = 0; j < attrs.length; j++){
    var el2 = attrs[j];
    var spec = el2.getAttribute('data-i18n-attr');
    if (!spec) continue;
    var parts = spec.split(':');
    if (parts.length !== 2) continue;
    var v2 = t(parts[1]);
    if (v2 && v2 !== parts[1]) el2.setAttribute(parts[0], v2);
  }
  var titleEl = document.querySelector('title[data-i18n]');
  if (titleEl){
    var v3 = t('sr.title');
    if (v3 && v3 !== 'sr.title') document.title = v3 + ' \u00b7 Sugar Rush';
  }
}

function readModeFromUrl(){
  try {
    var params = new URLSearchParams(window.location.search);
    var m = params.get('mode');
    if (m === 'real' || m === 'demo') return m;
  } catch (e) {}
  return 'demo';
}

function genDisplayGrid(){
  // P0-6: static display board, never invokes the engine
  var ids = Lock.list();
  var regs = [];
  for (var i = 0; i < ids.length; i++){
    if (Lock.kindOf(ids[i]) === 'regular') regs.push(ids[i]);
  }
  if (regs.length === 0) return new Array(49).fill('blue_candy');
  var out = new Array(49);
  var buf = new Uint32Array(1);
  for (var j = 0; j < 49; j++){
    crypto.getRandomValues(buf);
    out[j] = regs[buf[0] % regs.length];
  }
  return out;
}

function loadServerBalance(){
  // P0-6: real mode pulls authoritative balance from server
  var client = window.apiClient;
  if (!client || typeof client.get !== 'function') return;
  client.get('/api/me').then(function(resp){
    if (resp && resp.success && resp.user &&
        typeof resp.user.walletBalance === 'number'){
      state.balanceMinor = resp.user.walletBalance;
      updateBalance();
    }
  }).catch(function(){});
}
function buildSheetBody(){
  var t = (window.ApexI18n && window.ApexI18n.t) ? window.ApexI18n.t : function(k){ return k; };
  return '<h3>' + t('sr.rules.tumble.title') + '</h3>'
       + '<p>' + t('sr.rules.intro') + '</p>'
       + '<p>' + t('sr.rules.tumble.body') + '</p>'
       + '<h3>' + t('sr.rules.fs.title') + '</h3>'
       + '<p>' + t('sr.rules.fs.body') + '</p>'
       + '<h3>' + t('sr.rules.bomb.title') + '</h3>'
       + '<p>' + t('sr.rules.bomb.body') + '</p>'
       + '<h3>' + t('sr.rules.notice.title') + '</h3>'
       + '<ul><li>' + t('sr.rules.notice.item1') + '</li>'
       + '<li>' + t('sr.rules.notice.item2') + '</li></ul>';
}

function openSheet(){
  var sh = document.getElementById("sr-sheet");
  if (!sh) return;
  var bodyEl = document.getElementById("sr-sheet-body");
  if (bodyEl && !bodyEl.innerHTML) bodyEl.innerHTML = buildSheetBody();
  sh.hidden = false;
  requestAnimationFrame(function(){ sh.classList.add("is-open"); });
}
function closeSheet(){
  var sh = document.getElementById("sr-sheet");
  if (!sh) return;
  sh.classList.remove("is-open");
  setTimeout(function(){ sh.hidden = true; }, 220);
}
function bindSheet(){
  var sh = document.getElementById("sr-sheet");
  if (!sh) return;
  sh.addEventListener("click", function(e){
    var t = e.target;
    if (t.closest && t.closest("[data-sr-close]")){ e.preventDefault(); closeSheet(); }
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && !sh.hidden) closeSheet();
  });
}

function wireAudioBridge(){
  if (!window.ApexAudioBridge) return;
  if (typeof window.ApexAudioBridge.create !== 'function') return;
  try { audioBridgeInst = window.ApexAudioBridge.create(); }
  catch (e) { audioBridgeInst = null; }
}

function playAudio(name){
  if (audioBridgeInst && typeof audioBridgeInst.play === 'function'){
    try { if (audioBridgeInst.play(name)) return; } catch (e) {}
  }
  if (Audio && typeof Audio.play === 'function'){
    try { Audio.play(name); } catch (e) {}
  }
}
function wireAnimator(){
  if (!window.ApexAnimator) return;
  if (typeof window.ApexAnimator.create !== 'function') return;
  try { animatorInst = window.ApexAnimator.create(); }
  catch (e) { animatorInst = null; }
}
function wireA11y(){
  if (!window.ApexA11y) return;
  var board = document.getElementById('sr-board');
  if (board && !board.getAttribute('role')){
    board.setAttribute('role', 'grid');
  }
  var btns = document.querySelectorAll('button.sr-header-btn, button.sr-ctrl, button.sr-bet-btn');
  for (var i = 0; i < btns.length; i++){
    if (!btns[i].getAttribute('aria-label')){
      var lbl = btns[i].querySelector('.sr-ctrl-label');
      if (lbl && lbl.textContent) btns[i].setAttribute('aria-label', lbl.textContent);
    }
  }
}

function wirePerf(){
  if (!window.ApexPerf) return;
  if (typeof window.ApexPerf.create !== 'function') return;
  try { perfInst = window.ApexPerf.create({ cap: 200 }); }
  catch (e) { perfInst = null; }
}

function wireHaptics(){
  if (!window.ApexHaptics) return;
  if (typeof window.ApexHaptics.create !== 'function') return;
  try { hapticsInst = window.ApexHaptics.create(); }
  catch (e) { hapticsInst = null; }
}
function wireErrorReporter(){
  if (!window.ApexErrorReporter) return;
  if (typeof window.ApexErrorReporter.install !== 'function') return;
  try { window.ApexErrorReporter.install({ mode: GAME_MODE }); }
  catch (e) {}
}

function wireReconnection(){
  if (state.mode !== 'real') return;
  if (!window.ApexReconnection) return;
  if (typeof window.ApexReconnection.create !== 'function') return;
  try {
    var rc = window.ApexReconnection.create();
    rc.onChange(function(online){
      var i18n = window.ApexI18n;
      var t = (i18n && typeof i18n.t === 'function') ? i18n.t : function(k){ return k; };
      try {
        if (online) toast(t('net.online') || 'online');
        else toast(t('net.offline') || 'offline');
      } catch (e) {}
    });
  } catch (e) {}
}

function init(){
  cacheEls();
  applyI18n();
  if (Audio) try { Audio.load(); } catch (e) {}
  bindSheet();
  state.mode = readModeFromUrl();
  var modeLabel = $('sr-mode-label');
  if (modeLabel) modeLabel.textContent = (state.mode === 'real') ? '\u6b63\u5f0f\u6e38\u620f' : '\u8bd5\u73a9\u6a21\u5f0f';
  bindEvents();
  updateBalance();
  updateBetDisplay();
  updateWin(0);
  // P0-6: display-only initial board (no engine spin, no RNG consumption)
  renderGrid(genDisplayGrid());
  // P0-6: real mode pulls authoritative balance from server
  if (state.mode === 'real') loadServerBalance();
  wireErrorReporter();
  wireReconnection();
  wireA11y();
  wirePerf();
  wireHaptics();
  wireAnimator();
  wireAudioBridge();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init)
else init()
})();
