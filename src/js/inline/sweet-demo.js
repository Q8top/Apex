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
    bonusLock: false,
    autoTimer: 0,
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

  var runtime = null;
  var audio = null;
  var haptics = null;

  function initRuntime() {
    if (!window.ApexGameRuntime || !window.ApexDemoProvider) return null;
    var bus = window.ApexEventBus();
    var provider = window.ApexDemoProvider.create({ initialBalance: 1000000 });
    var rt = window.ApexGameRuntime.create({ events: bus, provider: provider });
    bus.on('game:spin-result', onSpinResult);
    bus.on('game:error', function (e) {
      toast('游戏错误');
      state.spinning = false;
      state.bonusLock = false;
      pending = null;
      if (el.board) el.board.dataset.spinning = '0';
      renderSpinBtn();
    });
    return rt;
  }

  var pending = null;

  function getCellAt(i) {
    var cells = el.board.querySelectorAll('.sd-sym');
    return cells[i];
  }

  function renderGridAt(types) {
    if (window.ApexSymbolRenderer && window.ApexSymbolRenderer.renderGrid) {
      window.ApexSymbolRenderer.renderGrid(el.board, types);
    } else {
      renderBoard(false);
    }
  }

  function playTumbleSequence(result) {
    return new Promise(function (resolve) {
      var tumbles = result.tumbles || [];
      if (!tumbles.length) {
        renderGridAt(result.finalGrid);
        setTimeout(resolve, 200);
        return;
      }
      renderGridAt(result.grid);
      var i = 0;
      function playOne() {
        if (i >= tumbles.length) {
          renderGridAt(result.finalGrid);
          setTimeout(resolve, 200);
          return;
        }
        var t = tumbles[i];
        t.removedPositions.forEach(function (idx) {
          var c = getCellAt(idx);
          if (c) c.classList.add('is-winning');
        });
        setTimeout(function () {
          t.removedPositions.forEach(function (idx) {
            var c = getCellAt(idx);
            if (c) { c.classList.remove('is-winning'); c.classList.add('is-removing'); }
          });
          setTimeout(function () {
            renderGridAt(t.gridAfter);
            var cells = el.board.querySelectorAll('.sd-sym');
            cells.forEach(function (c) { c.classList.add('is-entering'); });
            setTimeout(function () {
              cells.forEach(function (c) { c.classList.remove('is-entering'); });
              i++;
              playOne();
            }, 400);
          }, 300);
        }, 500);
      }
      playOne();
    });
  }


  function buildBonusOverlay() {
    var html = ''
      + '<div class="sd-bonus-backdrop"></div>'
      + '<div class="sd-bonus-panel">'
      +   '<h2 class="sd-bonus-title">Candy Storm</h2>'
      +   '<p class="sd-bonus-sub">免费旋转进行中</p>'
      +   '<div class="sd-bonus-stats">'
      +     '<div class="sd-bonus-stat"><span class="sd-bonus-stat-label">剩余局数</span><span class="sd-bonus-stat-value" id="sd-bonus-left">-</span></div>'
      +     '<div class="sd-bonus-stat"><span class="sd-bonus-stat-label">累计赢得</span><span class="sd-bonus-stat-value" id="sd-bonus-total">¥0.00</span></div>'
      +   '</div>'
      +   '<div class="sd-bonus-mult" id="sd-bonus-mult" style="display:none"><span class="sd-bonus-stat-label">倍率合计</span><span class="sd-bonus-mult-val" id="sd-bonus-mult-val">×0</span></div>'
      +   '<button type="button" class="sd-bonus-btn" id="sd-bonus-ok" style="display:none">完成</button>'
      + '</div>';
    var root = document.createElement('div');
    root.id = 'sd-bonus-root';
    root.className = 'sd-bonus-root';
    root.innerHTML = html;
    document.body.appendChild(root);
    return root;
  }

  function runBonusSequence(feature, betMinor, onDone) {
    var finished = false;
    var overlay = buildBonusOverlay();
    var leftEl = overlay.querySelector('#sd-bonus-left');
    var totalEl = overlay.querySelector('#sd-bonus-total');
    var okBtn = overlay.querySelector('#sd-bonus-ok');
    var remaining = feature.initialSpins || 10;
    var totalWinMinor = 0;
    var totalMult = 0;
    var multEl = overlay.querySelector('#sd-bonus-mult');
    var multValEl = overlay.querySelector('#sd-bonus-mult-val');

    overlay.classList.add('is-open');
    leftEl.textContent = remaining;
    totalEl.textContent = fmt(0);

    function nextFree() {
      if (remaining <= 0 || !runtime || !runtime.state) return finish();
      if (window.ApexAudio) audio && audio.play('spin-start');
      if (haptics) haptics.pulse('spin');
      provider_spin(betMinor, true).then(function (r) {
        totalWinMinor += r.totalWin || 0;
        if (r.multiplierSum > 0) {
          totalMult += r.multiplierSum;
          multEl.style.display = '';
          multValEl.textContent = '×' + totalMult;
        }
        if (r.feature && r.feature.triggered && window.ApexBonus) {
          remaining += window.ApexBonus.CONFIG.retriggerAdd;
        }
        remaining--;
        leftEl.textContent = remaining;
        totalEl.textContent = fmt(totalWinMinor / 100);
        setTimeout(nextFree, 300);
      }).catch(function () { finish(); });
    }

    function finish() {
      if (finished) return;
      finished = true;
      okBtn.style.display = '';
      okBtn.textContent = '领取 ' + fmt(totalWinMinor / 100);
      okBtn.addEventListener('click', function () {
        overlay.classList.remove('is-open');
        setTimeout(function () { overlay.remove(); }, 400);
        if (onDone) onDone(totalWinMinor);
      });
    }

    nextFree();
  }

  function provider_spin(betMinor, isFree) {
    if (!runtime || !runtime.getProvider) {
      return Promise.reject(new Error('no runtime'));
    }
    var p = runtime.getProvider();
    if (!p) return Promise.reject(new Error('no provider'));
    return p.spin({ bet: betMinor, free: !!isFree });
  }

  function onSpinResult(result) {
    if (!pending) {
      state.spinning = false;
      state.bonusLock = false;
      if (el.board) el.board.dataset.spinning = '0';
      renderSpinBtn();
      return;
    }
    var betMinor = result.bet;
    var winMinor = result.totalWin;
    state.win = winMinor / 100;
    state.balance = result.balanceAfter / 100;
    playTumbleSequence(result).then(function () {
    renderStats();
    if (window.ApexHistory) {
      window.ApexHistory.push({
        ts: Date.now(),
        betMinor: betMinor,
        winMinor: winMinor
      });
    }
    if (state.win > 0) {
      var ratio = state.win / (betMinor / 100);
      if (audio) {
        if (ratio >= 50) audio.play('super-win');
        else if (ratio >= 25) audio.play('mega-win');
        else if (ratio >= 10) audio.play('big-win');
        else audio.play('win-normal');
      }
      if (haptics) haptics.winPulse(ratio);
      if (window.ApexWinFeedback) {
        window.ApexWinFeedback.show(state.win, betMinor / 100);
      }
    }
    if (result.tumbles && result.tumbles.length > 1) {
      if (audio) audio.play('tumble');
      if (haptics) haptics.pulse('tumble');
    }
    el.board.dataset.spinning = '0';
    state.spinning = false;
    renderSpinBtn();
    if (result.feature && result.feature.triggered) {
      if (window.ApexAudio) audio && audio.play('bonus');
      state.bonusLock = true;
      runBonusSequence(result.feature, betMinor, function (bonusWin) {
        state.bonusLock = false;
        var p = runtime && runtime.getProvider && runtime.getProvider();
        if (p && p.getBalance) {
          state.balance = p.getBalance().minor / 100;
        } else {
          state.balance += bonusWin / 100;
        }
        renderStats();
        if (state.autoSpin) scheduleAuto();
        pending = null;
      });
      return;
    }
    if (state.autoSpin) scheduleAuto();
    pending = null;
    }).catch(function (err) {
      if (window.console && console.error) console.error('[onSpinResult] tumble failed:', err);
      state.spinning = false;
      state.bonusLock = false;
      pending = null;
      if (el.board) el.board.dataset.spinning = '0';
      renderSpinBtn();
    });
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
    el.winLabel = $('sd-win-fb-label');
  }

  function renderBoard(initial) {
    var ids = [];
    for (var i = 0; i < CELLS; i++) ids.push(randomSymbol());
    if (window.ApexSymbolRenderer && window.ApexSymbolRenderer.renderBoard) {
      window.ApexSymbolRenderer.renderBoard(el.board, ids);
    } else {
      var html = '';
      for (var j = 0; j < CELLS; j++) {
        var delay = ((j * 137) % 36) / 10;
        html += '<div class="sd-sym"><svg viewBox="0 0 160 160" aria-hidden="true" style="--sd-sym-delay:' + delay.toFixed(2) + 's"><use href="#' + ids[j] + '"/></svg></div>';
      }
      el.board.innerHTML = html;
    }
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
    var disabled = false;
    if (state.bonusLock) {
      label = window.ApexI18n ? window.ApexI18n.t('btn.bonus') : '免费旋转中';
      disabled = true;
    }
    else if (state.autoSpin) label = '停止';
    else if (state.spinning) label = '旋转中';
    el.spinBtn.querySelector('.sd-ctrl-label').textContent = label;
    el.spinBtn.classList.toggle('spinning', state.spinning);
    el.spinBtn.disabled = disabled;
  }

  function renderFastBtn() {
    el.fastBtn.classList.toggle('active', state.fastMode);
  }

  function applyI18n(root) {
    if (!window.ApexI18n) return;
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var key = node.getAttribute('data-i18n');
      var val = window.ApexI18n.t(key);
      if (val && val !== key) node.textContent = val;
    }
  }

  function applyI18nDynamic() {
    if (!window.ApexI18n) return;
    if (el.winLabel) el.winLabel.textContent = window.ApexI18n.t('win.label');
  }

  function applySettings() {
    if (!window.ApexSettings) return;
    var cfg = window.ApexSettings.get();
    if (audio) {
      audio.setEnabled(!!cfg.audioEnabled);
      audio.setVolume('music', cfg.musicVolume);
      audio.setVolume('sfx', cfg.sfxVolume);
    }
    if (haptics) haptics.setEnabled(!!cfg.hapticsEnabled);
    state.fastMode = !!cfg.fastMode;
    if (el.board) el.board.dataset.fast = state.fastMode ? '1' : '0';
    renderFastBtn();
  }

  function doSpin() {
    if (state.spinning) return;
    if (state.bonusLock) return;
    if (state.balance < getBet()) {
      toast('试玩余额不足');
      stopAuto();
      return;
    }

    state.spinning = true;
    el.board.dataset.spinning = '1';
    renderSpinBtn();
    if (haptics) haptics.pulse('spin');
    if (audio) audio.play('spin-start');

    if (runtime) {
      pending = true;
      var betMinor = Math.round(getBet() * 100);
      var res = runtime.startSpin(betMinor);
      if (!res || !res.ok) {
        pending = null;
        state.spinning = false;
        el.board.dataset.spinning = '0';
        renderSpinBtn();
      }
      return;
    }

    state.balance -= getBet();
    state.win = 0;
    renderStats();

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
    if (state.bonusLock) return;
    if (state.betIndex > 0) {
      state.betIndex--;
      renderStats();
      renderBetButtons();
    }
  }
  function increaseBet() {
    if (state.bonusLock) return;
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
    if (window.ApexSettings) window.ApexSettings.set({ fastMode: state.fastMode });
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
    var p = runtime && runtime.getProvider && runtime.getProvider();
    if (p && p.resetBalance) {
      var r = p.resetBalance(INITIAL_BALANCE * 100);
      state.balance = (r.minor || INITIAL_BALANCE * 100) / 100;
    } else {
      state.balance = INITIAL_BALANCE;
    }
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
      case 'rules':   if (window.ApexRules) window.ApexRules.open(); else toast('即将上线'); break;
      case 'history': if (window.ApexHistory) window.ApexHistory.open(); else toast('即将上线'); break;
      case 'settings':if (window.ApexSettings) window.ApexSettings.open(); else toast('即将上线'); break;
      case 'sound':   toast('音效设置 · 即将上线'); break;
      case 'vibrate': toast('震动反馈 · 即将上线'); break;
      case 'help':    toast('游戏帮助 · 即将上线'); break;
      default:        toast('功能开发中');
    }
  }

  function init() {
    cacheEl();
    runtime = initRuntime();
    if (window.ApexAudio) audio = window.ApexAudio.create();
    if (window.ApexHaptics) haptics = window.ApexHaptics.create();
    applyI18n();
    applyI18nDynamic();
    applySettings();
    if (window.ApexSettings) window.ApexSettings.onChange(applySettings);
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
