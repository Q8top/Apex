/* Sweet · HUD
   职责：余额 / 下注 / 中奖 / 按钮 disabled / Toast。
   通过事件响应，不主动轮询。
*/
(function(){
'use strict';

var Events = window.SweetEvents;

var refs = {
  balance: null,
  betDisplay: null,
  betValue: null,
  wonDisplay: null,
  winValue: null,
  winLabel: null,
  spinBtn: null,
  autoBtn: null,
  toast: null
};

function $(id){ return document.getElementById(id); }

function init(){
  refs.balance = $('sw-balance');
  refs.betDisplay = $('sw-bet-display');
  refs.betValue = $('sw-bet');
  refs.wonDisplay = $('sw-won-display');
  refs.winValue = $('sw-win-value');
  refs.winLabel = $('sw-win-label');
  refs.spinBtn = $('sw-spin');
  refs.autoBtn = $('sw-auto');
  refs.toast = $('sw-toast');
}

function fmt(n, sign){
  var v = Math.round(n * 100) / 100;
  var s = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign && v > 0 ? '+' : '') + '¥' + s;
}

var _countRaf = 0;
function countUp(el, to, dur){
  if (!el) return;
  if (_countRaf) cancelAnimationFrame(_countRaf);
  var from = 0;
  try { from = parseFloat(String(el.dataset.v || '0')) || 0; } catch(e){}
  if (Math.abs(to - from) < 0.005) { el.dataset.v = String(to); el.textContent = to > 0 ? fmt(to, true) : fmt(0); return; }
  var t0 = performance.now();
  function step(now){
    var p = Math.min(1, (now - t0) / (dur || 420));
    var e = 1 - Math.pow(1 - p, 3);
    var v = from + (to - from) * e;
    el.textContent = v > 0 ? fmt(v, true) : fmt(0);
    if (p < 1) { _countRaf = requestAnimationFrame(step); }
    else { el.dataset.v = String(to); _countRaf = 0; }
  }
  _countRaf = requestAnimationFrame(step);
}

function updateBalance(n, animate){
  if (!refs.balance) return;
  refs.balance.textContent = fmt(n);
  if (animate) {
    refs.balance.classList.remove('bump');
    void refs.balance.offsetWidth;
    refs.balance.classList.add('bump');
  }
}

function updateBet(n){
  if (refs.betDisplay) refs.betDisplay.textContent = fmt(n);
  if (refs.betValue) refs.betValue.textContent = fmt(n);
}

function updateWin(n, combo){
  if (refs.winValue) {
    countUp(refs.winValue, n > 0 ? n : 0, 420);
    refs.winValue.classList.toggle('winning', n > 0);
  }
  if (refs.winLabel) refs.winLabel.textContent = n > 0 ? '恭喜中奖' : '本局中奖';
  if (refs.wonDisplay) {
    refs.wonDisplay.textContent = n > 0 ? fmt(n, true) : fmt(0);
    refs.wonDisplay.classList.toggle('win', n > 0);
  }
  var cb = $('sw-combo');
  if (cb) {
    if (combo) { cb.textContent = combo; cb.classList.add('show'); }
    else { cb.textContent = ''; cb.classList.remove('show'); }
  }
}

function setSpinDisabled(v){
  if (refs.spinBtn) {
    refs.spinBtn.disabled = !!v;
    refs.spinBtn.classList.toggle('spinning', !!v);
  }
}

function toast(msg, ms){
  if (!refs.toast) return;
  refs.toast.textContent = msg;
  refs.toast.classList.add('show');
  clearTimeout(refs.toast._timer);
  refs.toast._timer = setTimeout(function(){ refs.toast.classList.remove('show'); }, ms || 1500);
}

/* 事件订阅 */
function bindEvents(){
  Events.on('balance:change', function(d){ updateBalance(d.balance, d.animate); });
  Events.on('bet:change',     function(d){ updateBet(d.bet); });
  Events.on('win:update',     function(d){ updateWin(d.amount, d.combo); });
  Events.on('spin:start',     function(){ setSpinDisabled(true); });
  Events.on('spin:end',       function(){ setSpinDisabled(false); });
}

window.SweetHUD = {
  init: init,
  bindEvents: bindEvents,
  updateBalance: updateBalance,
  updateBet: updateBet,
  updateWin: updateWin,
  setSpinDisabled: setSpinDisabled,
  toast: toast,
  fmt: fmt
};
})();
