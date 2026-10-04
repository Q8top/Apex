/* Gates of Olympus · 主逻辑 */
(function () {
  'use strict';

  // ── 配置 ──
  var COLS = 6, ROWS = 5, TOTAL = 30;
  var BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  var DEMO_BALANCE_INIT = 1000;
  var API_SPIN_DEMO = '/api/slot/spin-demo';

  var SYMBOL_SVG = {
    GEM_BLUE:   '/assets/games/symbols/gem-blue.svg',
    GEM_GREEN:  '/assets/games/symbols/gem-green.svg',
    GEM_PURPLE: '/assets/games/symbols/gem-purple.svg',
    GEM_RED:    '/assets/games/symbols/gem-red.svg',
    CHALICE:    '/assets/games/symbols/chalice.svg',
    RING:       '/assets/games/symbols/ring.svg',
    HOURGLASS:  '/assets/games/symbols/hourglass.svg',
    CROWN:      '/assets/games/symbols/crown.svg',
    SCATTER:    '/assets/games/symbols/scatter.svg',
    MULTIPLIER: '/assets/games/symbols/multiplier.svg'
  };

  // ── DOM ──
  var $ = function (id) { return document.getElementById(id); };
  var elGrid = $('ol-grid');
  var elSpin = $('ol-spin');
  var elBetVal = $('ol-bet-val');
  var elBetDisplay = $('ol-bet-display');
  var elBetMinus = $('ol-bet-minus');
  var elBetPlus = $('ol-bet-plus');
  var elWinVal = $('ol-win-val');
  var elTotalWin = $('ol-total-win');
  var elBalance = $('ol-balance');
  var elToast = $('ol-toast');
  var elReset = $('ol-reset');
  var elTitle = $('ol-title');
  var elSound = $('ol-btn-sound');
  var elAuto = $('ol-auto');
  var elHistory = $('ol-history');
  var elPaytable = $('ol-paytable');
  var elMenu = $('ol-btn-menu');

  // ── State ──
  var url = new URL(location.href);
  var MODE = url.searchParams.get('mode') === 'real' ? 'real' : 'demo';
  var betIdx = 3; // ¥10
  var balance = DEMO_BALANCE_INIT;
  var totalWinSession = 0;
  var spinning = false;
  var autoRun = false;
  var autoTimer = null;
  var muted = false;

  // ── Utils ──
  function fmtMoney(v) {
    return '¥' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtShort(v) {
    return '¥' + Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  function toast(msg, ms) {
    if (!elToast) return;
    elToast.textContent = String(msg || '');
    elToast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { elToast.classList.remove('show'); }, ms || 1800);
  }
  function sfx(name, arg) {
    if (window.olympusAudio) window.olympusAudio.play(name, arg);
  }
  function getBet() { return BET_STEPS[betIdx]; }

  // ── 渲染 ──
  function blankCell() {
    return '<div class="ol-cell"></div>';
  }
  function buildGrid() {
    var h = '';
    for (var i = 0; i < TOTAL; i++) h += blankCell();
    elGrid.innerHTML = h;
  }
  function renderGridFull(grid) {
    // grid[col][row]
    var cells = elGrid.children;
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var idx = c * ROWS + r;
        var sym = grid[c][r];
        var img = SYMBOL_SVG[sym];
        var cell = cells[idx];
        if (!cell) continue;
        cell.classList.remove('win', 'remove', 'drop');
        if (img) {
          cell.innerHTML = '<img src="' + img + '" alt="">';
        } else {
          cell.innerHTML = '';
        }
      }
    }
  }
  function highlightCells(cellList) {
    for (var i = 0; i < cellList.length; i++) {
      var c = cellList[i][0], r = cellList[i][1];
      var idx = c * ROWS + r;
      var cell = elGrid.children[idx];
      if (cell) cell.classList.add('win');
    }
  }
  function clearHighlights() {
    var cells = elGrid.querySelectorAll('.ol-cell.win');
    for (var i = 0; i < cells.length; i++) cells[i].classList.remove('win');
  }
  function removeWinningCells(cellList) {
    for (var i = 0; i < cellList.length; i++) {
      var c = cellList[i][0], r = cellList[i][1];
      var idx = c * ROWS + r;
      var cell = elGrid.children[idx];
      if (cell) cell.classList.add('remove');
    }
  }

  // ── UI 更新 ──
  function updateBalanceUI() {
    elBalance.textContent = fmtMoney(balance);
  }
  function updateBetUI() {
    var b = getBet();
    elBetVal.textContent = '下注 ' + fmtMoney(b);
    elBetDisplay.textContent = fmtMoney(b);
    elBetMinus.disabled = (betIdx === 0);
    elBetPlus.disabled = (betIdx === BET_STEPS.length - 1);
  }
  function updateWinUI(v, isWin) {
    elWinVal.textContent = fmtMoney(v);
    elWinVal.classList.toggle('win', !!isWin);
    elWinVal.classList.remove('bump');
    void elWinVal.offsetWidth;
    elWinVal.classList.add('bump');
  }
  function updateTotalWinUI() {
    elTotalWin.textContent = fmtShort(totalWinSession);
  }
  function setSpinBusy(b) {
    spinning = b;
    elSpin.disabled = b;
    elSpin.classList.toggle('spinning', b);
    elBetMinus.disabled = b || betIdx === 0;
    elBetPlus.disabled = b || betIdx === BET_STEPS.length - 1;
  }

  // ── 播放一轮 tumble ──
  function playTumbleRound(grid, wins, roundWin, roundIdx) {
    return new Promise(function (resolve) {
      // 1. 全量渲染本轮网格
      renderGridFull(grid);
      // 2. 高亮中奖
      var allCells = [];
      for (var i = 0; i < wins.length; i++) {
        allCells = allCells.concat(wins[i].cells);
      }
      highlightCells(allCells);
      sfx('win', Math.min(3, Math.round(roundWin / getBet() / 5)));
      // 3. 赢奖累加显示
      var prevWin = parseFloat(elWinVal.textContent.replace(/[^\d.]/g, '')) || 0;
      var newWin = prevWin + roundWin;
      updateWinUI(newWin, true);
      // 4. 等待高亮展示
      setTimeout(function () {
        // 5. 消格
        removeWinningCells(allCells);
        setTimeout(function () {
          resolve();
        }, 280);
      }, 500);
    });
  }

  // ── Spin 主流程 ──
  async function doSpin() {
    if (spinning) return;
    if (balance < getBet()) { toast('余额不足'); return; }
    if (!window.apiClient || !window.apiClient.post) { toast('API 未就绪'); return; }

    setSpinBusy(true);
    sfx('spinStart');
    updateWinUI(0, false);
    balance -= getBet();
    updateBalanceUI();

    try {
      var res = await window.apiClient.post(API_SPIN_DEMO, { bet: getBet() });
      if (!res || res.success !== true || !res.result) {
        sfx('error');
        toast((res && res.message) || '请求失败');
        balance += getBet();
        updateBalanceUI();
        setSpinBusy(false);
        return;
      }

      var result = res.result;
      var totalWin = result.totalWin || 0;
      var initialGrid = result.initialGrid;
      var tumbles = result.tumbles || [];

      // 先渲染初始网格
      renderGridFull(initialGrid);
      // 播放每一轮
      var cumulative = 0;
      for (var i = 0; i < tumbles.length; i++) {
        var t = tumbles[i];
        var roundWin = t.roundWin || 0;
        cumulative += roundWin;
        await playTumbleRound(t.grid, t.wins, roundWin, i);
        sfx('reelStop', i);
      }
      // 如果有 tumble，最后一轮消格后要渲染最终网格（无中奖）
      if (tumbles.length > 0) {
        // 用下一轮的 grid 或空网格
        // 这里简单处理：tumbles 最后一轮之后就没有 grid 了，我们保留最后的可见状态
      }
      // 全部结束：清高亮
      clearHighlights();
      // 最终赢奖
      if (totalWin > 0) {
        balance += totalWin;
        totalWinSession += totalWin;
        updateBalanceUI();
        updateTotalWinUI();
        updateWinUI(totalWin, true);
        sfx('win', 3);
        toast('中奖 ' + fmtShort(totalWin));
      } else {
        updateWinUI(0, false);
        toast('未中奖');
      }
    } catch (e) {
      sfx('error');
      toast('异常：' + (e && e.message ? e.message : '未知'));
    } finally {
      setSpinBusy(false);
      if (autoRun) scheduleAuto();
    }
  }

  // ── Auto ──
  function scheduleAuto() {
    if (!autoRun) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { if (autoRun) doSpin(); }, 800);
  }
  function toggleAuto() {
    autoRun = !autoRun;
    if (elAuto) elAuto.classList.toggle('active', autoRun);
    if (autoRun) {
      toast('自动旋转已开启');
      scheduleAuto();
    } else {
      clearTimeout(autoTimer);
      toast('自动旋转已关闭');
    }
  }

  // ── 事件绑定 ──
  function bind() {
    elSpin.addEventListener('click', function () {
      if (window.olympusAudio && !window.olympusAudio.isUnlocked()) window.olympusAudio.unlock();
      sfx('click');
      doSpin();
    });
    elBetMinus.addEventListener('click', function () {
      if (spinning) return;
      sfx('click');
      if (betIdx > 0) { betIdx--; updateBetUI(); }
    });
    elBetPlus.addEventListener('click', function () {
      if (spinning) return;
      sfx('click');
      if (betIdx < BET_STEPS.length - 1) { betIdx++; updateBetUI(); }
    });
    elReset.addEventListener('click', function () {
      sfx('click');
      balance = DEMO_BALANCE_INIT;
      totalWinSession = 0;
      updateBalanceUI();
      updateTotalWinUI();
      updateWinUI(0, false);
      toast('余额已重置为 ' + fmtShort(DEMO_BALANCE_INIT));
    });
    elSound.addEventListener('click', function () {
      muted = !muted;
      if (window.olympusAudio) window.olympusAudio.setMuted(muted);
      var on = elSound.querySelector('.ol-ico-sound-on');
      var off = elSound.querySelector('.ol-ico-sound-off');
      if (on) on.style.display = muted ? 'none' : '';
      if (off) off.style.display = muted ? '' : 'none';
      if (!muted) sfx('click');
    });
    elAuto.addEventListener('click', function () { sfx('click'); toggleAuto(); });
    elHistory.addEventListener('click', function () { sfx('click'); toast('记录功能开发中'); });
    elPaytable.addEventListener('click', function () { sfx('click'); location.href = '/olympus.html'; });
    elMenu.addEventListener('click', function () { sfx('click'); toast('菜单开发中'); });
  }

  // ── Init ──
  function init() {
    document.getElementById('ol-root').setAttribute('data-mode', MODE);
    if (MODE === 'demo') {
      if (elTitle) elTitle.textContent = '奥林匹斯之门 · 试玩';
    } else {
      if (elTitle) elTitle.textContent = '奥林匹斯之门';
    }
    buildGrid();
    updateBetUI();
    updateBalanceUI();
    updateTotalWinUI();
    updateWinUI(0, false);
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
