(function(){
'use strict';

var Engine = window.ApexSugarRushGameEngine;
var Symbols = window.ApexSugarRushSymbolsV2;
var Lock = window.ApexSugarRushSymbolsLocked;
var Payout = window.ApexSugarRushPayout;
var Multiplier = window.ApexSugarRushMultiplier;
var Bonus = window.ApexSugarRushBonus;

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
  currentSpinId: null
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

function updateBalance(){ el.balance.textContent = fmt(state.balanceMinor); }
function updateBetDisplay(){
  var b = BET_OPTIONS[state.betIndex];
  el.bet.textContent = fmt(b);
  el.betDisplay.textContent = fmt(b);
  el.betMinus.disabled = state.betIndex <= 0 || state.spinning;
  el.betPlus.disabled = state.betIndex >= BET_OPTIONS.length - 1 || state.spinning;
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
function delay(ms){ return new Promise(function(res){ pushTimer(setTimeout(res, ms)); }); }

function applyDropIn(){
  var cells = el.board.children;
  var stagger = state.fastMode ? 8 : 16;
  for (var i = 0; i < cells.length; i++){
    var col = i % 7;
    cells[i].style.setProperty("--sr-drop-delay", (col * stagger) + "ms");
    cells[i].classList.add("is-dropping-in");
  }
  return delay((state.fastMode ? 120 : 200) + 7 * stagger + 100);
}

function showWinFlash(text){
  var old = el.board.querySelector(".sr-win-flash");
  if (old) old.remove();
  var div = document.createElement("div");
  div.className = "sr-win-flash";
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
function updateTumbleCounter(step){
  if (step <= 1){ el.tumbleCounter.hidden = true; return; }
  el.tumbleCounter.hidden = false;
  el.tumbleCounter.textContent = "x" + step;
}

/* ---------- tumble playback ---------- */
function playBaseCascades(detail){
  var steps = detail.baseSteps || [];
  if (steps.length === 0) return Promise.resolve();
  var p = Promise.resolve();
  steps.forEach(function(step, i){
    p = p.then(function(){
      updateTumbleCounter(i + 1);
      markWinning(step.winningPositions);
      return delay(state.fastMode ? 200 : 400);
    }).then(function(){
      markRemoving(step.winningPositions);
      return delay(state.fastMode ? 120 : 250);
    }).then(function(){
      renderGrid(step.gridAfter);
      return applyDropIn();
    });
  })
  return p.then(function(){
    renderGrid(detail.baseFinalGrid);
    el.tumbleCounter.hidden = true;
    clearCellAnim();
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

function doSpin(opts){
  opts = opts || {};
  if (state.spinning) return Promise.resolve();
  var betMinor = BET_OPTIONS[state.betIndex];
  if (state.balanceMinor < betMinor){
    if (!opts.silent) alert("\u4f59\u989d\u4e0d\u8db3");
    stopAuto();
    return Promise.resolve();
  }
  state.spinning = true;
  state.currentSpinId = makeSpinId();
  state.balanceMinor -= betMinor;
  updateBalance();
  updateBetDisplay();
  el.spinBtn.disabled = true;
  updateWin(0);
  clearTimers();
  clearCellAnim();
  el.board.setAttribute("data-spinning", "1");

  return Promise.resolve().then(function(){
    var result = Engine.spin(state.mode, betMinor, { detail: true });
    var d = result.detail;
    renderGrid(d.initialGrid);
    return applyDropIn().then(function(){
      return playBaseCascades(d);
    }).then(function(){
      state.balanceMinor += result.winMinor;
      updateBalance();
      updateWin(result.winMinor);
      if (result.winMinor > 0) return showWinFlash("+" + fmt(result.winMinor));
    }).then(function(){
      state.spinning = false;
      el.spinBtn.disabled = false;
      el.board.removeAttribute("data-spinning");
      updateBetDisplay();
      return result;
    }).catch(function(err){
      state.spinning = false;
      el.spinBtn.disabled = false;
      el.board.removeAttribute("data-spinning");
      console.error("[sugar-rush] spin error", err);
    });
  });
}

/* ---------- auto spin ---------- */
function stopAuto(){
  state.autoSpinning = false;
  state.autoRemaining = 0;
  el.autoBtn.removeAttribute("data-active");
  el.autoBtn.querySelector("span").textContent = "\u81ea\u52a8";
}
function startAuto(n){
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
    if (state.spinning) return;
    if (state.betIndex > 0){ state.betIndex--; updateBetDisplay(); }
  });
  el.betPlus.addEventListener("click", function(){
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
    state.fastMode = !state.fastMode;
    el.board.setAttribute("data-fast", state.fastMode ? "1" : "0")
    if (state.fastMode) el.fastBtn.setAttribute("data-active", "1")
    else el.fastBtn.removeAttribute("data-active")
  });
  el.resetBtn.addEventListener("click", function(){
    if (state.spinning) return;
    state.balanceMinor = START_BALANCE_MINOR;
    updateBalance();
    updateWin(0);
  });
}

/* ---------- init ---------- */
function init(){
  cacheEls();
  bindEvents();
  updateBalance();
  updateBetDisplay();
  updateWin(0);
  var result = Engine.spin(state.mode, BET_OPTIONS[state.betIndex], { detail: false });
  renderGrid(result.finalGrid);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init)
else init()
})();
