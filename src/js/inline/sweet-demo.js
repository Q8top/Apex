/* Apex · Sweet Bonanza Demo Game · Mobile HUD v1 */
(function () {
  'use strict';

  var INITIAL_BALANCE = 10000;
  var BET_OPTIONS = Object.freeze([0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]);
  var DEFAULT_BET_INDEX = 3;

  var SYM_IDS = Object.freeze([
    'sb-fruit-banana','sb-fruit-grape','sb-fruit-watermelon',
    'sb-fruit-plum','sb-fruit-apple','sb-candy-blue','sb-candy-green',
    'sb-candy-purple','sb-candy-heart','sb-scatter-lollipop','sb-multiplier-bomb'
  ]);

  var BASE_FALLBACK_IDS = Object.freeze([
    'sb-fruit-banana','sb-fruit-grape','sb-fruit-watermelon',
    'sb-fruit-plum','sb-fruit-apple','sb-candy-blue','sb-candy-green',
    'sb-candy-purple','sb-candy-heart'
  ]);

  var CELLS = 30;
  var RAND_BUF = new Uint32Array(1);
  var XLINK_NS = 'http://www.w3.org/1999/xlink';

  var state = {
    balance: INITIAL_BALANCE,
    betIndex: DEFAULT_BET_INDEX,
    win: 0,
    autoSpin: false,
    fastMode: false,
    spinning: false,
    bonusLock: false,
    autoTimer: 0,
    tumbleTimers: [],
    sheetCloseTimer: 0,
    confirmCloseTimer: 0,
    sheetFocusBefore: null,
    confirmFocusBefore: null
  };

  function $(id) { return document.getElementById(id); }
  function fmt(n) {
    return '¥' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function getBet() { return BET_OPTIONS[state.betIndex]; }
  function randomSymbol() {
    if (window.ApexSymbols && typeof window.ApexSymbols.pickSymbol === 'function') {
      var t = window.ApexSymbols.pickSymbol();
      var id = window.ApexSymbols.getSymbolId(t);
      if (id) return id;
    }
    crypto.getRandomValues(RAND_BUF);
    return BASE_FALLBACK_IDS[RAND_BUF[0] % BASE_FALLBACK_IDS.length];
  }

  var runtime = null;
  var audio = null;
  var haptics = null;

  // P0-1：从 URL ?mode= 读取游戏模式（demo / real），默认 real
  function getGameMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      var m = params.get('mode');
      if (m === 'demo' || m === 'real') return m;
    } catch (e) {}
    return 'real';
  }

  var GAME_MODE = getGameMode();

  function initRuntime() {
    if (!window.ApexGameRuntime || !window.ApexDemoProvider) return null;
    var bus = window.ApexEventBus();
    var provider = window.ApexDemoProvider.create({
      initialBalance: 1000000,
      mode: GAME_MODE
    });
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

  function clearTumbleTimers() {
    for (var i = 0; i < state.tumbleTimers.length; i++) {
      clearTimeout(state.tumbleTimers[i]);
    }
    state.tumbleTimers.length = 0;
  }
  function tumbleSetTimeout(fn, ms) {
    var id = setTimeout(fn, ms);
    state.tumbleTimers.push(id);
    return id;
  }

  // Step 3d：计算每格在本次 tumble 中的动画角色（精确版）
  //
  // 语义：
  //   - 逐列独立处理
  //   - 保留的格子按原相对顺序从顶部下移，最终排在底部
  //   - 顶部空位由新符号补位
  //   - 每格下落距离 = 新 row - 原 row（>0 才有动画）
  //
  // 返回：
  //   { entering: [newIndex...], falling: [{ index, rows }...] }
  //   index 均为 gridAfter 中的位置（row * COLS + col）
  function computeTumbleAnimations(t) {
    var COLS = 6, ROWS = 5;
    var removed = {};
    for (var r = 0; r < t.removedPositions.length; r++) {
      removed[t.removedPositions[r]] = true;
    }

    var entering = [];
    var falling = [];

    for (var c = 0; c < COLS; c++) {
      // 从上到下收集保留格子的原 row
      var keptRows = [];
      for (var rr = 0; rr < ROWS; rr++) {
        if (!removed[rr * COLS + c]) keptRows.push(rr);
      }
      var newCount = ROWS - keptRows.length;

      // 新符号落在顶部 newCount 格
      for (var e = 0; e < newCount; e++) {
        entering.push(e * COLS + c);
      }

      // 保留的格子从 row = newCount 开始排列
      for (var k = 0; k < keptRows.length; k++) {
        var oldRow = keptRows[k];
        var newRow = newCount + k;
        if (newRow > oldRow) {
          falling.push({ index: newRow * COLS + c, rows: newRow - oldRow });
        }
      }
    }

    return { entering: entering, falling: falling };
  }

  function playTumbleSequence(result) {
    clearTumbleTimers();
    return new Promise(function (resolve) {
      var tumbles = result.tumbles || [];
      if (!tumbles.length) {
        renderGridAt(result.finalGrid);
        tumbleSetTimeout(resolve, 200);
        return;
      }
      renderGridAt(result.grid);
      var i = 0;
      function playOne() {
        if (i >= tumbles.length) {
          renderGridAt(result.finalGrid);
          tumbleSetTimeout(resolve, 200);
          return;
        }
        var t = tumbles[i];
        var anim = computeTumbleAnimations(t);

        var tWin    = state.fastMode ? 180 : 500;
        var tRemove = state.fastMode ? 120 : 300;
        var tIn     = state.fastMode ? 180 : 400;

        // Phase 1: 中奖格弹跳
        for (var a = 0; a < t.removedPositions.length; a++) {
          var ca = getCellAt(t.removedPositions[a]);
          if (ca) ca.classList.add('is-winning');
        }

        tumbleSetTimeout(function () {
          // Phase 2: 中奖格消失
          for (var b = 0; b < t.removedPositions.length; b++) {
            var cb = getCellAt(t.removedPositions[b]);
            if (cb) { cb.classList.remove('is-winning'); cb.classList.add('is-removing'); }
          }

          tumbleSetTimeout(function () {
            // Phase 3: 换盘 + 分角色动画
            renderGridAt(t.gridAfter);
            var cells = el.board.querySelectorAll('.sd-sym');

            // 新格子：从上方进入
            for (var e = 0; e < anim.entering.length; e++) {
              var ce = cells[anim.entering[e]];
              if (ce) ce.classList.add('is-entering');
            }
            // 下移的格子：从原位置滑下
            for (var f = 0; f < anim.falling.length; f++) {
              var info = anim.falling[f];
              var cf = cells[info.index];
              if (cf) {
                cf.style.setProperty('--fall-rows', String(info.rows));
                cf.classList.add('is-falling');
              }
            }

            tumbleSetTimeout(function () {
              // Phase 4: 清理
              for (var c2 = 0; c2 < cells.length; c2++) {
                cells[c2].classList.remove('is-entering', 'is-falling');
                cells[c2].style.removeProperty('--fall-rows');
              }
              i++;
              playOne();
            }, tIn);
          }, tRemove);
        }, tWin);
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
        if (r.multiplierSum > 0 && r.totalWin > 0) {
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
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          else if (typeof overlay.remove === 'function') overlay.remove();
        }, 400);
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
        if (ratio >= 100) audio.play('ultra-win');
        else if (ratio >= 50) audio.play('epic-win');
        else if (ratio >= 20) audio.play('mega-win');
        else if (ratio >= 5)  audio.play('big-win');
        else                  audio.play('win-normal');
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
      clearTumbleTimers();
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

  function setUseHref(useEl, href) {
    if (!useEl) return;
    useEl.setAttribute('href', href);
    try { useEl.setAttributeNS(XLINK_NS, 'xlink:href', href); } catch (e) {}
  }
  function renderAutoBtn() {
    var useEl = el.autoBtn.querySelector('use');
    var labelEl = el.autoBtn.querySelector('.sd-ctrl-label');
    if (state.autoSpin) {
      el.autoBtn.classList.add('active');
      if (labelEl) labelEl.textContent = '停止';
      setUseHref(useEl, '#ic-stop');
    } else {
      el.autoBtn.classList.remove('active');
      if (labelEl) labelEl.textContent = '自动';
      setUseHref(useEl, '#ic-repeat');
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

    window.setTimeout(function () {
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
    if (state.sheetCloseTimer) { clearTimeout(state.sheetCloseTimer); state.sheetCloseTimer = 0; }
    var ae = document.activeElement;
    state.sheetFocusBefore = (ae && ae !== document.body) ? ae : null;
    el.sheetRoot.removeAttribute('hidden');
    void el.sheetRoot.offsetWidth;
    el.sheetRoot.classList.add('is-open');
    if (window.ApexSheetLock) window.ApexSheetLock.lock();
    else document.body.style.overflow = 'hidden';
    var first = el.sheetRoot.querySelector('.sd-sheet-item');
    if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 60);
  }
  function closeSheet() {
    if (!el.sheetRoot.classList.contains('is-open')) return;
    el.sheetRoot.classList.remove('is-open');
    if (window.ApexSheetLock) window.ApexSheetLock.unlock();
    else document.body.style.overflow = '';
    if (state.sheetCloseTimer) clearTimeout(state.sheetCloseTimer);
    state.sheetCloseTimer = setTimeout(function () {
      state.sheetCloseTimer = 0;
      el.sheetRoot.setAttribute('hidden', '');
      if (state.sheetFocusBefore && typeof state.sheetFocusBefore.focus === 'function') {
        try { state.sheetFocusBefore.focus(); } catch (e) {}
      }
      state.sheetFocusBefore = null;
    }, 300);
  }

  function openConfirm() {
    if (state.spinning || state.bonusLock) return;
    if (el.confirmRoot.classList.contains('is-open')) return;
    if (state.confirmCloseTimer) { clearTimeout(state.confirmCloseTimer); state.confirmCloseTimer = 0; }
    var ae = document.activeElement;
    state.confirmFocusBefore = (ae && ae !== document.body) ? ae : null;
    el.confirmCurrent.textContent = fmt(state.balance);
    el.confirmRoot.removeAttribute('hidden');
    void el.confirmRoot.offsetWidth;
    el.confirmRoot.classList.add('is-open');
    setTimeout(function () { try { el.confirmCancel.focus(); } catch (e) {} }, 60);
  }
  function closeConfirm() {
    if (!el.confirmRoot.classList.contains('is-open')) return;
    el.confirmRoot.classList.remove('is-open');
    if (state.confirmCloseTimer) clearTimeout(state.confirmCloseTimer);
    state.confirmCloseTimer = setTimeout(function () {
      state.confirmCloseTimer = 0;
      el.confirmRoot.setAttribute('hidden', '');
      if (state.confirmFocusBefore && typeof state.confirmFocusBefore.focus === 'function') {
        try { state.confirmFocusBefore.focus(); } catch (e) {}
      }
      state.confirmFocusBefore = null;
    }, 220);
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
    // resetBtn 的行为由 applyModeUI() 根据 mode 决定
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

    // P0-1：让 UI 文案与真实 mode 一致
    try {
      var subEl = document.querySelector('.sd-header-sub');
      if (subEl) {
        if (GAME_MODE === 'demo') subEl.textContent = '试玩模式';
        else subEl.textContent = '正式模式';
      }
      var modeHint = document.querySelector('.sd-mode-badge');
      if (modeHint) modeHint.textContent = GAME_MODE.toUpperCase();
    } catch (e) {}

    renderBoard(true);
    renderStats();
    renderBetButtons();
    renderAutoBtn();
    renderSpinBtn();
    renderFastBtn();
    applyModeUI();
    bindEvents();
  }

  // Step 2：根据 GAME_MODE 决定"重置/充值"按钮的文本与行为
  function applyModeUI() {
    if (!el.resetBtn) return;
    var label = el.resetBtn.querySelector('[data-i18n="btn.reset"]')
      || el.resetBtn.querySelector('span');
    var i18n = window.ApexI18n;

    if (GAME_MODE === 'demo') {
      if (label) {
        label.textContent = i18n ? i18n.t('btn.reset') : '重置余额';
        label.removeAttribute('data-i18n');   // 防止语言切换时被覆盖
      }
      el.resetBtn.addEventListener('click', openConfirm);
    } else {
      if (label) {
        label.textContent = i18n ? i18n.t('btn.recharge') : '充值余额';
        label.removeAttribute('data-i18n');
      }
      el.resetBtn.addEventListener('click', function () {
        toast(i18n ? i18n.t('toast.coming') : '功能开发中', 'info');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // P0-1：暴露当前 mode（调试 / 自动化测试用）
  window.__APEX_GAME_MODE = GAME_MODE;
})();
