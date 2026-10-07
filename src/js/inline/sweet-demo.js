/* Apex · Sweet Bonanza Demo Game · Mobile HUD v1 */
(function () {
  'use strict';

  var INITIAL_BALANCE = 10000;
  var BET_OPTIONS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var DEFAULT_BET_INDEX = 3;
  var SYM_IDS = ['sb-fruit-banana','sb-fruit-grape','sb-fruit-watermelon','sb-fruit-plum','sb-fruit-apple','sb-candy-blue','sb-candy-green','sb-candy-purple','sb-candy-heart','sb-scatter-lollipop','sb-multiplier-bomb'];
  var CELLS = 30;

  var state = {
    balance: INITIAL_BALANCE,
    betIndex: DEFAULT_BET_INDEX,
    win: 0,
    autoSpin: false,
    fastMode: false,
    spinning: false,
    autoTimer: 0,
    spinTimer: 0,
    lastFocused: null
  };

  function $(id) { return document.getElementById(id); }
  function fmt(n) {
    return '¥' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function getBet() { return BET_OPTIONS[state.betIndex]; }
  function randomSymbol() {
    if (window.ApexSymbols && window.ApexSymbols.pickSymbol) {
      var t = window.ApexSymbols.pickSymbol();
      var id = window.ApexSymbols.getSymbolId(t);
      if (id) return id;
    }
    var a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return SYM_IDS[a[0] % SYM_IDS.length];
  }

  var el = {};
  function cacheEl() {
    el.board = $('sd-board');
    el.balance = $('sd-balance');
    el.bet = $('sd-bet');
    el.win = $('sd-win');
    el.betDisplay = $('sd-bet-display');
    el.betMinus = $('sd-bet-minus');
    el.betPlus = $('sd-bet-plus');
    el.resetBtn = $('sd-reset-btn');
    el.autoBtn = $('sd-auto-btn');
    el.spinBtn = $('sd-spin-btn');
    el.fastBtn = $('sd-fast-btn');
    el.menuBtn = $('sd-menu-btn');
    el.sheetRoot = $('sd-sheet-root');
    el.confirmRoot = $('sd-confirm-root');
    el.confirmCurrent = $('sd-confirm-current');
    el.confirmCancel = $('sd-confirm-cancel');
    el.confirmOk = $('sd-confirm-ok');
  }

  function renderBoard(initial) {
    var html = '';
    for (var i = 0; i < CELLS; i++) {
      var delay = ((i * 137) % 36) / 10;
      html += '<div class="sd-sym"><svg viewBox="0 0 160 160" aria-hidden="true" style="--sd-sym-delay:' + delay.toFixed(2) + 's"><use href="#' + randomSymbol() + '"/></svg></div>';
    }
    el.board.innerHTML = html;
    if (initial) el.board.dataset.fast = state.fastMode ? '1' : '0';
  }

  function renderStats() {
    el.balance.textContent = fmt(state.balance);
    el.bet.textContent = fmt(getBet());
    el.betDisplay.textContent = fmt(getBet());
    el.win.textContent = fmt(state.win);
    el.win.dataset.win = state.win > 0 ? '1' : '0';
  }

  function renderBetButtons() {
    el.betMinus.disabled = state.betIndex === 0;
    el.betPlus.disabled = state.betIndex === BET_OPTIONS.length - 1;
  }

  function renderAutoBtn() {
    if (state.autoSpin) {
      el.autoBtn.classList.add('active');
      el.autoBtn.querySelector('.sd-ctrl-label').textContent = '停止';
      el.autoBtn.querySelector('use').setAttribute('href', '#ic-stop');
    } else {
      el.autoBtn.classList.remove('active');
      el.autoBtn.querySelector('.sd-ctrl-label').textContent = '自动';
      el.autoBtn.querySelector('use').setAttribute('href', '#ic-repeat');
    }
  }

  function renderSpinBtn() {
    var label = '旋转';
    if (state.autoSpin) label = '停止';
    else if (state.spinning) label = '旋转中';
    el.spinBtn.querySelector('.sd-ctrl-label').textContent = label;
    el.spinBtn.classList.toggle('spinning', state.spinning);
  }

  function renderFastBtn() {
    el.fastBtn.classList.toggle('active', state.fastMode);
  }

  function doSpin() {
    if (state.spinning) return;
    if (state.balance < getBet()) {
      toast('试玩余额不足');
      stopAuto();
      return;
    }

    state.spinning = true;
    state.balance -= getBet();
    state.win = 0;
    el.board.dataset.spinning = '1';
    renderStats();
    renderSpinBtn();

    var duration = state.fastMode ? 400 : 900;

    state.spinTimer = window.setTimeout(function () {
      renderBoard(false);
      var r = new Uint32Array(1);
      crypto.getRandomValues(r);
      if ((r[0] % 100) < 30) {
        var mult = ((r[0] % 20) + 1) / 10;
        state.win = Math.round(getBet() * mult * 100) / 100;
        state.balance += state.win;
        if (window.ApexWinFeedback) {
          window.ApexWinFeedback.show(state.win, getBet());
        }
      }
      el.board.dataset.spinning = '0';
      state.spinning = false;
      renderStats();
      renderSpinBtn();
      if (state.autoSpin) scheduleAuto();
    }, duration);
  }

  function scheduleAuto() {
    clearTimeout(state.autoTimer);
    var delay = state.fastMode ? 150 : 400;
    state.autoTimer = window.setTimeout(doSpin, delay);
  }

  function startAuto() {
    if (state.spinning) return;
    state.autoSpin = true;
    renderAutoBtn();
    renderSpinBtn();
    doSpin();
  }

  function stopAuto() {
    state.autoSpin = false;
    clearTimeout(state.autoTimer);
    state.autoTimer = 0;
    renderAutoBtn();
    renderSpinBtn();
  }

  function decreaseBet() {
    if (state.betIndex > 0) {
      state.betIndex--;
      renderStats();
      renderBetButtons();
    }
  }
  function increaseBet() {
    if (state.betIndex < BET_OPTIONS.length - 1) {
      state.betIndex++;
      renderStats();
      renderBetButtons();
    }
  }

  function toggleFast() {
    state.fastMode = !state.fastMode;
    el.board.dataset.fast = state.fastMode ? '1' : '0';
    renderFastBtn();
  }

  function openSheet() {
    state.lastFocused = document.activeElement;
    el.sheetRoot.removeAttribute('hidden');
    void el.sheetRoot.offsetWidth;
    el.sheetRoot.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var first = el.sheetRoot.querySelector('.sd-sheet-item');
    if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 60);
  }
  function closeSheet() {
    el.sheetRoot.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      el.sheetRoot.setAttribute('hidden', '');
      if (state.lastFocused && state.lastFocused.focus) {
        try { state.lastFocused.focus(); } catch (e) {}
      }
      state.lastFocused = null;
    }, 300);
  }

  function openConfirm() {
    el.confirmCurrent.textContent = fmt(state.balance);
    el.confirmRoot.removeAttribute('hidden');
    void el.confirmRoot.offsetWidth;
    el.confirmRoot.classList.add('is-open');
    setTimeout(function () { try { el.confirmCancel.focus(); } catch (e) {} }, 60);
  }
  function closeConfirm() {
    el.confirmRoot.classList.remove('is-open');
    setTimeout(function () { el.confirmRoot.setAttribute('hidden', ''); }, 220);
  }
  function doReset() {
    state.balance = INITIAL_BALANCE;
    state.win = 0;
    renderStats();
    closeConfirm();
    toast('试玩余额已重置');
  }

  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:calc(100px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(8px);background:#111;color:#fff;padding:10px 16px;border-radius:12px;font-size:13px;font-weight:600;z-index:200;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.2)';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastTimer);
    requestAnimationFrame(function () {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateX(-50%) translateY(0)';
    });
    toastTimer = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(-50%) translateY(8px)';
    }, 1600);
  }

  function bindEvents() {
    el.betMinus.addEventListener('click', decreaseBet);
    el.betPlus.addEventListener('click', increaseBet);
    el.resetBtn.addEventListener('click', openConfirm);
    el.fastBtn.addEventListener('click', toggleFast);

    el.autoBtn.addEventListener('click', function () {
      if (state.autoSpin) stopAuto(); else startAuto();
    });
    el.spinBtn.addEventListener('click', function () {
      if (state.autoSpin) { stopAuto(); return; }
      doSpin();
    });
    el.menuBtn.addEventListener('click', openSheet);

    el.sheetRoot.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      if (t.closest('[data-sheet-close]')) { closeSheet(); return; }
      var item = t.closest('.sd-sheet-item');
      if (item) {
        var action = item.getAttribute('data-sheet-action');
        closeSheet();
        setTimeout(function () { handleMenuAction(action); }, 300);
      }
    });

    el.confirmRoot.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-confirm-close]')) closeConfirm();
    });
    el.confirmCancel.addEventListener('click', closeConfirm);
    el.confirmOk.addEventListener('click', doReset);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (!el.confirmRoot.hasAttribute('hidden')) { closeConfirm(); return; }
        if (!el.sheetRoot.hasAttribute('hidden')) { closeSheet(); return; }
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state.autoSpin) stopAuto();
    });
  }

  function handleMenuAction(action) {
    switch (action) {
      case 'home':    window.location.href = '/'; break;
      case 'rules':   toast('游戏规则 · 即将上线'); break;
      case 'history': toast('游戏记录 · 即将上线'); break;
      case 'settings':toast('游戏设置 · 即将上线'); break;
      case 'sound':   toast('音效设置 · 即将上线'); break;
      case 'vibrate': toast('震动反馈 · 即将上线'); break;
      case 'help':    toast('游戏帮助 · 即将上线'); break;
      default:        toast('功能开发中');
    }
  }

  function init() {
    cacheEl();
    renderBoard(true);
    renderStats();
    renderBetButtons();
    renderAutoBtn();
    renderSpinBtn();
    renderFastBtn();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
