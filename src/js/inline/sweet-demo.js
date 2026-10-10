/* Apex · Demo Game · Mobile HUD v1 */
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

  var audioBridge = null;
var sheetTrap = null;
var confirmTrap = null;
var perfBoard = null;
var announcer = null;
var autoSpinCtl = null;
var pendingAutoResolve = null;
var animator = null;
var state = {
    balance: INITIAL_BALANCE,
    betIndex: DEFAULT_BET_INDEX,
    win: 0,
    autoSpin: false,
    fastMode: false,
    spinning: false,
    bonusLock: false,
    tumbleTimers: [],
    sheetCloseTimer: 0,
    confirmCloseTimer: 0,
    sheetFocusBefore: null,
    confirmFocusBefore: null
  };

  function $(id) { return document.getElementById(id); }
  // P2-1: 游戏币统一显示 ¥，所有 locale 一致。
  // 数字部分走 Intl 千分位，符号固定 ¥。
  var _numFmt = null;
  function _getNumFmt() {
    if (_numFmt !== null) return _numFmt;
    try {
      _numFmt = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      });
    } catch (e) { _numFmt = false; }
    return _numFmt;
  }
  function fmt(n) {
    var num = Number(n);
    if (!Number.isFinite(num)) num = 0;
    var inst = _getNumFmt();
    if (inst) { try { return '¥' + inst.format(num); } catch (e) {} }
    return '¥' + num.toFixed(2);
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
    if (!window.ApexGameRuntime) return null;
    var bus = window.ApexEventBus();
    var provider;
    if (GAME_MODE === 'demo') {
      if (!window.ApexDemoProvider) return null;
      provider = window.ApexDemoProvider.create({ initialBalance: 1000000, mode: 'demo' });
    } else {
      if (!window.ApexServerProvider) {
        console.error('[initRuntime] ApexServerProvider 未加载');
        return null;
      }
      provider = window.ApexServerProvider.create({});
    }
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

  // Spin 下落-替换动画（Moment A）
  function playSpinDrop(board, done) {
    var cells = board.querySelectorAll('.sd-sym');
    if (!cells.length) { done(); return; }
    var staggerMs = state.fastMode ? 10 : 18;
    var baseMs = state.fastMode ? 120 : 200;
    for (var i = 0; i < cells.length; i++) {
      var col = i % 6;
      cells[i].style.setProperty('--drop-delay', (col * staggerMs) + 'ms');
      cells[i].classList.add('is-dropping-out');
    }
    var totalMs = baseMs + 6 * staggerMs + 20;
    setTimeout(function () {
      var cs = board.querySelectorAll('.sd-sym');
      for (var j = 0; j < cs.length; j++) {
        cs[j].classList.remove('is-dropping-out');
        cs[j].style.removeProperty('--drop-delay');
      }
      done();
    }, totalMs);
  }

  function applyDropIn(board) {
    var cells = board.querySelectorAll('.sd-sym');
    if (!cells.length) return;
    var staggerMs = state.fastMode ? 10 : 18;
    for (var i = 0; i < cells.length; i++) {
      var col = i % 6;
      cells[i].style.setProperty('--drop-delay', (col * staggerMs) + 'ms');
      cells[i].classList.add('is-dropping-in');
    }
    setTimeout(function () {
      var cs = board.querySelectorAll('.sd-sym');
      for (var j = 0; j < cs.length; j++) {
        cs[j].classList.remove('is-dropping-in');
        cs[j].style.removeProperty('--drop-delay');
      }
    }, 420);
  }

  function clearTumbleTimers() {
    if (animator && animator.cancelAll) {
      try { animator.cancelAll(); } catch (e) {}
    }
    for (var i = 0; i < state.tumbleTimers.length; i++) {
      clearTimeout(state.tumbleTimers[i]);
    }
    state.tumbleTimers.length = 0;
  }
  function tumbleSetTimeout(fn, ms) {
    if (animator && animator.delay) {
      var h = animator.delay(ms, fn);
      state.tumbleTimers.push(h);
      return h;
    }
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

  function updateTumbleCounter(step) {
    // P2-5: 显示当前连消次数（step = 0 是首次，不显示；>=1 显示 x2..）
    var el2 = document.getElementById('sd-tumble-counter');
    if (!el2) return;
    if (step >= 1) {
      el2.textContent = 'x' + (step + 1);
      el2.hidden = false;
      // 触发入场动画：移除再加
      el2.classList.remove('is-visible');
      void el2.offsetWidth;
      el2.classList.add('is-visible');
    } else {
      el2.classList.remove('is-visible');
      el2.hidden = true;
      el2.textContent = '';
    }
  }

  function playTumbleSequence(result, animate) {
    clearTumbleTimers();
    return new Promise(function (resolve) {
      var tumbles = result.tumbles || [];
      if (!tumbles.length) {
        renderGridAt(result.finalGrid);
        if (animate) applyDropIn(el.board);
        tumbleSetTimeout(resolve, 200);
        return;
      }
      renderGridAt(result.grid);
      if (animate) applyDropIn(el.board);

      // P1-7: 长链加速 + 跳过按钮
      var isLongChain = tumbles.length > 8;
      var speed = isLongChain ? 0.6 : 1;
      var resolved = false;
      var skipBtn = document.getElementById('sd-skip-btn');
      var skipHandler = null;

      function finishNow() {
        if (resolved) return;
        resolved = true;
        clearTumbleTimers();
        renderGridAt(result.finalGrid);
        try { updateTumbleCounter(-1); } catch (e) {}
        if (skipBtn) {
          skipBtn.hidden = true;
          if (skipHandler) skipBtn.removeEventListener('click', skipHandler);
        }
        resolve();
      }
      function detachSkip() {
        if (!skipBtn) return;
        skipBtn.hidden = true;
        if (skipHandler) {
          skipBtn.removeEventListener('click', skipHandler);
          skipHandler = null;
        }
      }

      if (isLongChain && skipBtn) {
        skipBtn.hidden = false;
        skipHandler = function () { finishNow(); };
        skipBtn.addEventListener('click', skipHandler);
      }

      var i = 0;
      function playOne() {
        if (resolved) return;
        if (i >= tumbles.length) {
          renderGridAt(result.finalGrid);
          detachSkip();
          // P2-5: 序列结束隐藏计数
          try { updateTumbleCounter(-1); } catch (e) {}
          tumbleSetTimeout(function () {
            if (resolved) return;
            resolved = true;
            resolve();
          }, 200);
          return;
        }
        var t = tumbles[i];
        var anim = computeTumbleAnimations(t);

        // P2-5: 每步更新连消计数（i=0 是首次消除，显示 x1 无意义 -> 跳过）
        try { updateTumbleCounter(i); } catch (e) {}

        var tWin    = (state.fastMode ? 180 : 500) * speed;
        var tRemove = (state.fastMode ? 120 : 300) * speed;
        var tIn     = (state.fastMode ? 180 : 400) * speed;

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
            // 落点音效：连续 3 声轻"嗒"
            if (audio) {
              try { playAudio('tumble-land'); } catch (e) {}
              setTimeout(function () { try { playAudio('tumble-land'); } catch (e) {} }, 60);
              setTimeout(function () { try { playAudio('tumble-land'); } catch (e) {} }, 120);
            }
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

  function provider_spin(betMinor, isFree) {
    if (!runtime || !runtime.getProvider) {
      return Promise.reject(new Error('no runtime'));
    }
    var p = runtime.getProvider();
    if (!p) return Promise.reject(new Error('no provider'));
    return p.spin({ bet: betMinor, free: !!isFree });
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
      if (window.ApexAudio) audio && playAudio('spin-start');
      if (haptics) haptics.pulse('spin');
      provider_spin(betMinor, true).then(function (r) {
        totalWinMinor += r.totalWin || 0;
        if (r.multiplierSum > 0 && r.totalWin > 0) {
          if (audio && audio.play) {
            try { playAudio('multiplier'); } catch (err) {}
          }
          totalMult += r.multiplierSum;
          multEl.style.display = '';
          multValEl.textContent = '×' + totalMult;
        }
        // P0-1: 服务端权威 FS 状态优先（real 模式）
        if (r.freeSpin && typeof r.freeSpin.remaining === 'number') {
          remaining = r.freeSpin.remaining;
          if (r.freeSpin.status === 'completed' || remaining <= 0) {
            leftEl.textContent = 0;
            totalEl.textContent = fmt(totalWinMinor / 100);
            return finish();
          }
        } else {
          // 回退路径（demo 模式或旧接口）：前端自行推进
          if (r.feature && r.feature.triggered && window.ApexBonus) {
            remaining += window.ApexBonus.CONFIG.retriggerAdd;
          }
          remaining--;
        }
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
    playSpinDrop(el.board, function () {
    playTumbleSequence(result, true).then(function () {
    if (audio && audio.play) {
      try { playAudio('spin-stop'); } catch (err) {}
    }
    renderStats();
    // P2-4: 差 1 个中奖微光（仅视觉，无逻辑影响）
    try {
      if (window.ApexNearMiss) {
        window.ApexNearMiss.clearHighlight(el.board);
        var nmOpts = {};
        if (window.ApexSymbols && typeof window.ApexSymbols.getSymbolId === 'function'
            && window.ApexSymbolsLocked && typeof window.ApexSymbolsLocked.kindOf === 'function') {
          nmOpts.isRegular = function (t) {
            try {
              var id = window.ApexSymbols.getSymbolId(t);
              return window.ApexSymbolsLocked.kindOf(id) === 'regular';
            } catch (e) { return false; }
          };
        }
        var n = window.ApexNearMiss.applyHighlight(el.board, result.finalGrid, nmOpts);
        if (n > 0) {
          window.setTimeout(function () {
            try { window.ApexNearMiss.clearHighlight(el.board); } catch (e) {}
          }, 800);
        }
      }
    } catch (e) {}
    if (window.ApexHistory) {
      // 记录详细字段
      var _ratio = (betMinor > 0) ? (winMinor / betMinor) : 0;
      var _tumbleCount = (result.tumbles && result.tumbles.length) || 0;
      var _fsTriggered = !!(result.feature && result.feature.triggered);
      var _maxMult = 0;
      try {
        if (result.multiplierSum && result.multiplierSum > _maxMult) _maxMult = result.multiplierSum;
      } catch (e) {}
      window.ApexHistory.push({
        ts: Date.now(),
        betMinor: betMinor,
        winMinor: winMinor,
        spinId: (typeof result.spinId === 'string') ? result.spinId : null,
        ratio: _ratio,
        tumbleCount: _tumbleCount,
        fsTriggered: _fsTriggered,
        maxMultiplier: _maxMult
      });
    }
    if (state.win > 0) {
      var ratio = state.win / (betMinor / 100);
      try {
        if (announcer) {
          var lvl = ratio >= 100 ? "ultra" : ratio >= 50 ? "epic" : ratio >= 20 ? "mega" : ratio >= 5 ? "big" : "";
          announcer.polite(lvl ? (lvl + " win: " + state.win.toFixed(2)) : ("Win: " + state.win.toFixed(2)));
        }
      } catch (e) {}
      if (audio) {
        if (ratio >= 100) playAudio('ultra-win');
        else if (ratio >= 50) playAudio('epic-win');
        else if (ratio >= 20) playAudio('mega-win');
        else if (ratio >= 5)  playAudio('big-win');
        else                  playAudio('win-normal');
      }
      if (haptics) haptics.winPulse(ratio);
      if (window.ApexWinFeedback) {
        window.ApexWinFeedback.show(state.win, betMinor / 100);
      }
    }
    if (result.tumbles && result.tumbles.length > 1) {
      if (audio) playAudio('tumble');
      if (haptics) haptics.pulse('tumble');
    }
    el.board.dataset.spinning = '0';
    state.spinning = false;
    renderSpinBtn();
    if (result.feature && result.feature.triggered) {
      if (window.ApexAudio) audio && playAudio('bonus');
      // FS 进入：全屏金色闪光 + 粒子爆炸
      try {
        var flashEl = document.getElementById('sd-fs-flash');
        if (flashEl) {
          flashEl.classList.remove('is-on');
          void flashEl.offsetWidth;
          flashEl.classList.add('is-on');
          setTimeout(function () {
            try { flashEl.classList.remove('is-on'); } catch (e) {}
          }, 800);
        }
      } catch (e) {}
      try { spawnFsParticles(); } catch (e) {}
      if (audio) playAudio('fs-enter');
      state.bonusLock = true;
      runBonusSequence(result.feature, betMinor, function (bonusWin) {
        state.bonusLock = false;
        var p = runtime && runtime.getProvider && runtime.getProvider();
        var done = function () {
          renderStats();
          resolveAutoDone({ stop: false });
          pending = null;
        };
        // P0-4: real 模式服务端权威，getBalance 失败绝不本地加钱（防双重记账）。
        // demo 模式 provider 无 getBalance -> 走保守本地路径（demo 是本地钱包）。
        if (p && p.getBalance) {
          p.getBalance().then(function (bal) {
            state.balance = bal.minor / 100;
            done();
          }).catch(function () {
            if (window.console && console.warn) {
              console.warn('[sweet-demo] getBalance failed after bonus; UI balance may be stale until next spin');
            }
            done();
          });
        } else {
          // 无 getBalance 的 provider（demo 本地钱包）才本地加
          state.balance += bonusWin / 100;
          done();
        }
      });
      return;
    }
    resolveAutoDone({ stop: false });
    pending = null;
    }).catch(function (err) {
      if (window.console && console.error) console.error('[onSpinResult] tumble failed:', err);
      clearTumbleTimers();
      state.spinning = false;
      state.bonusLock = false;
      pending = null;
      if (el.board) el.board.dataset.spinning = '0';
      renderSpinBtn();
      resolveAutoDone({ stop: true, stopReason: 'spin_error' });
    });
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
      if (window.ApexPerf && perfBoard) {
        perfBoard.timeIt("board", function () {
          window.ApexSymbolRenderer.renderBoard(el.board, ids);
        });
      } else {
        window.ApexSymbolRenderer.renderBoard(el.board, ids);
      }
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
    if (audio) playAudio('spin-start');

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

    // P1-10: runtime 是唯一结算源；旧随机 fallback 已删除
    pending = null;
    state.spinning = false;
    el.board.dataset.spinning = '0';
    renderSpinBtn();
    toast('游戏初始化失败，请刷新页面');
  }

  function resolveAutoDone(outcome) {
    if (pendingAutoResolve) {
      var r = pendingAutoResolve;
      pendingAutoResolve = null;
      try { r(outcome || { stop: false }); } catch (e) {}
    }
  }

  function autoSpinFn() {
    if (state.bonusLock) {
      return Promise.resolve({ stop: true, stopReason: 'bonus_lock' });
    }
    if (state.balance < getBet()) {
      toast('试玩余额不足');
      return Promise.resolve({ stop: true, stopReason: 'insufficient' });
    }
    return new Promise(function (resolve) {
      pendingAutoResolve = resolve;
      doSpin();
    });
  }

  function startAuto() {
    if (state.spinning) return;
    if (!window.ApexAutoSpin) {
      state.autoSpin = true;
      renderAutoBtn();
      renderSpinBtn();
      doSpin();
      return;
    }
    if (autoSpinCtl && autoSpinCtl.isRunning()) return;
    autoSpinCtl = window.ApexAutoSpin.create({
      delay: state.fastMode ? 150 : 400,
      spinFn: autoSpinFn,
      onState: function () {
        state.autoSpin = !!(autoSpinCtl && autoSpinCtl.isRunning());
        renderAutoBtn();
        renderSpinBtn();
      },
      onFinish: function (reason) {
        state.autoSpin = false;
        pendingAutoResolve = null;
        renderAutoBtn();
        renderSpinBtn();
        if (reason === 'insufficient') toast('试玩余额不足');
      }
    });
    state.autoSpin = true;
    renderAutoBtn();
    renderSpinBtn();
    autoSpinCtl.start();
  }

  function stopAuto() {
    if (autoSpinCtl) {
      try { autoSpinCtl.stop(); } catch (e) {}
      autoSpinCtl = null;
    }
    state.autoSpin = false;
    pendingAutoResolve = null;
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
    if (window.ApexA11y) {
      sheetTrap = window.ApexA11y.trapFocus(el.sheetRoot, {
        autoFocus: false, restoreFocus: false
      });
    }
  }
  function closeSheet() {
    if (!el.sheetRoot.classList.contains('is-open')) return;
    el.sheetRoot.classList.remove('is-open');
    if (sheetTrap) { try { sheetTrap.release(); } catch (e) {} sheetTrap = null; }
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
    if (window.ApexA11y) {
      confirmTrap = window.ApexA11y.trapFocus(el.confirmRoot, {
        autoFocus: false, restoreFocus: false
      });
    }
  }
  function closeConfirm() {
    if (!el.confirmRoot.classList.contains('is-open')) return;
    el.confirmRoot.classList.remove('is-open');
    if (confirmTrap) { try { confirmTrap.release(); } catch (e) {} confirmTrap = null; }
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
    var finish = function () {
      state.win = 0;
      renderStats();
      closeConfirm();
      toast('试玩余额已重置');
    };
    if (p && p.resetBalance) {
      p.resetBalance(INITIAL_BALANCE * 100).then(function (r) {
        state.balance = (r.minor || INITIAL_BALANCE * 100) / 100;
        finish();
      }).catch(function () {
        closeConfirm();
        toast('正式模式不支持重置余额', 'info');
      });
    } else {
      state.balance = INITIAL_BALANCE;
      finish();
    }
  }

  var toastEl = null, toastTimer = 0;
  function spawnFsParticles() {
    var prev = document.getElementById('sd-fs-particles');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    var container = document.createElement('div');
    container.id = 'sd-fs-particles';
    container.className = 'sd-fs-particles';
    var COUNT = 15;
    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement('div');
      p.className = 'sd-fs-particle';
      var _r1 = new Uint32Array(1); crypto.getRandomValues(_r1);
      var _r2 = new Uint32Array(1); crypto.getRandomValues(_r2);
      var _r3 = new Uint32Array(1); crypto.getRandomValues(_r3);
      var angle = (i / COUNT) * Math.PI * 2 + ((_r1[0] % 200) / 1000 - 0.1);
      var dist = 140 + (_r2[0] % 120);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      p.style.setProperty('--dx', dx.toFixed(1) + 'px');
      p.style.setProperty('--dy', dy.toFixed(1) + 'px');
      p.style.animationDelay = (_r3[0] % 60) + 'ms';
      container.appendChild(p);
    }
    document.body.appendChild(container);
    // 触发
    void container.offsetWidth;
    container.classList.add('is-on');
    setTimeout(function () {
      if (container.parentNode) container.parentNode.removeChild(container);
    }, 1200);
  }

  function playAudio(name) {
  if (audioBridge) { try { audioBridge.play(name); return; } catch (e) {} }
  if (audio && audio.play) { try { audio.play(name); } catch (e) {} }
}

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
    // 全局按钮点击 → ui-tap 音效（事件委托，避免逐个绑定）
    document.addEventListener('click', function (e) {
      if (!e.target || !e.target.closest) return;
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (audio && audio.play) {
        try { playAudio('ui-tap'); } catch (err) {}
      }
    }, true);

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
      case 'sound':
      case 'vibrate':
        if (window.ApexSettings) window.ApexSettings.open(); else toast('即将上线');
        break;
      case 'help':
        if (window.ApexRules) window.ApexRules.open(); else toast('即将上线');
        break;
      default:        toast('功能开发中');
    }
  }

  function init() {
    cacheEl();
    runtime = initRuntime();
    if (window.ApexAudio) audio = window.ApexAudio.create();
    if (window.ApexAnimator) animator = window.ApexAnimator.create();
    if (window.ApexPerf) perfBoard = window.ApexPerf.create({ cap: 100 });
    // client error reporter (real: POST /api/log; demo: console only)
    try {
      if (window.ApexErrorReporter && typeof window.ApexErrorReporter.install === 'function') {
        window.ApexErrorReporter.install({ mode: GAME_MODE });
      }
    } catch (e) {}
    if (window.ApexA11y) { try { announcer = window.ApexA11y.createAnnouncer(); } catch (e) {} }
    if (window.ApexAudioBridge) audioBridge = window.ApexAudioBridge.create();
    if (window.ApexAudioSynth && typeof window.ApexAudioSynth.preloadSamples === 'function') {
      try { window.ApexAudioSynth.preloadSamples(); } catch (e) {}
    }
    if (window.ApexReconnection) {
      try {
        var rc = window.ApexReconnection.create();
        rc.onChange(function (online) {
          try {
            var i18n = window.ApexI18n;
            var msg = online ? (i18n ? i18n.t('net.online') : 'Network restored')
                             : (i18n ? i18n.t('net.offline') : 'Network disconnected');
            toast(msg);
            if (!online && window.console && console.warn) console.warn('[net] offline');
          } catch (e) {}
        });
      } catch (e) {}
    }
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

    // P2-8: bfcache 恢复时重新校验状态
    // 浏览器后退/前进恢复页面时不重新执行 JS，服务端可能已经改状态。
    // 简单策略：恢复时重新拉一次余额；若是 real 模式同步。
    try {
      window.addEventListener('pageshow', function (e) {
        if (!e.persisted) return;
        try {
          if (runtime && runtime.getProvider && GAME_MODE === 'real') {
            var p = runtime.getProvider();
            if (p && p.getBalance) {
              p.getBalance().then(function (bal) {
                state.balance = bal.minor / 100;
                renderStats();
              }).catch(function () {});
            }
          }
        } catch (er) {}
      });
    } catch (e) {}

    // C-3 wiring: boot self-check (console only)
    try {
      if (window.ApexRenderer && typeof window.ApexRenderer.bootCheck === "function") {
        var bc = window.ApexRenderer.bootCheck();
        if (!bc.ok) console.warn("[renderer] bootCheck not ok:", bc.missing);
        else if (window.console && console.info) console.info("[renderer] bootCheck ok: " + bc.totalChecked + " symbols");
      }
    } catch (e) {}

    // real 模式：异步拉服务端余额
    if (runtime && GAME_MODE === 'real') {
      var p0 = runtime.getProvider && runtime.getProvider();
      if (p0 && p0.getBalance) {
        p0.getBalance().then(function (bal) {
          state.balance = bal.minor / 100;
          renderStats();
        }).catch(function () {
          state.balance = 0;
          renderStats();
        });
      }
    }
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
