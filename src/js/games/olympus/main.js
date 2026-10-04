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

  // ── 渲染（6 列 / 绝对定位符号）──
  function symAt(c, r) {
    var col = elGrid.children[c];
    if (!col) return null;
    return col.children[r];
  }
  function layoutGrid() {
    var H = elGrid.clientHeight;
    if (!H) return;
    var pad = 8, gap = 4;
    var rowH = (H - 2 * pad - (ROWS - 1) * gap) / ROWS;
    if (rowH > 0) elGrid.style.setProperty('--row-h', rowH + 'px');
  }
  function buildGrid() {
    var h = '';
    for (var c = 0; c < COLS; c++) {
      h += '<div class="ol-col" data-col="' + c + '">';
      for (var r = 0; r < ROWS; r++) {
        h += '<div class="ol-sym" data-col="' + c + '" data-row="' + r + '" style="--row:' + r + '"></div>';
      }
      h += '</div>';
    }
    elGrid.innerHTML = h;
    layoutGrid();
  }
  function setSym(c, r, symId) {
    var el = symAt(c, r);
    if (!el) return;
    var url = SYMBOL_SVG[symId];
    if (url) {
      el.innerHTML = '<img src="' + url + '" alt="">';
    } else {
      el.innerHTML = '';
    }
  }
  function renderGridFull(grid) {
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var el = symAt(c, r);
        if (!el) continue;
        el.classList.remove('win', 'remove', 'dim', 'enter');
        el.style.setProperty('--row', r);
        setSym(c, r, grid[c][r]);
      }
    }
  }
  function highlightCells(cellList) {
    // 先把所有标记为非中奖 → dim
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var el = symAt(c, r);
        if (el) el.classList.add('dim');
      }
    }
    // 中奖格亮
    for (var i = 0; i < cellList.length; i++) {
      var cc = cellList[i][0], rr = cellList[i][1];
      var el2 = symAt(cc, rr);
      if (el2) { el2.classList.remove('dim'); el2.classList.add('win'); }
    }
  }
  function clearHighlights() {
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var el = symAt(c, r);
        if (el) el.classList.remove('win', 'dim');
      }
    }
  }
  function removeWinningCells(cellList) {
    for (var i = 0; i < cellList.length; i++) {
      var c = cellList[i][0], r = cellList[i][1];
      var el = symAt(c, r);
      if (el) el.classList.add('remove');
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
  // roundIdx: 0=第一轮（初始网格），>=1 表示是下落补位后的新一轮
  // nextGrid: 下一轮网格（用于下落补位）；最后一轮可传 null
  function playTumbleRound(grid, wins, roundWin, nextGrid) {
    return new Promise(function (resolve) {
      renderGridFull(grid);
      // 高亮
      var allCells = [];
      for (var i = 0; i < wins.length; i++) {
        allCells = allCells.concat(wins[i].cells);
      }
      highlightCells(allCells);
      sfx('win', Math.min(3, Math.max(1, Math.round(roundWin / Math.max(1, getBet()) / 5))));

      // 赢奖显示累加
      var prevWin = parseFloat((elWinVal.textContent || '0').replace(/[^\d.]/g, '')) || 0;
      updateWinUI(prevWin + roundWin, true);

      setTimeout(function () {
        // 消除
        removeWinningCells(allCells);
        setTimeout(function () {
          // 消除完成
          if (nextGrid) {
            // 下落 + 补位：先设置起点（新符号从上方进入）
            // 简单方案：所有格子先 .enter（新位置），下一帧移除 .enter
            for (var c = 0; c < COLS; c++) {
              for (var r = 0; r < ROWS; r++) {
                var el = symAt(c, r);
                if (!el) continue;
                setSym(c, r, nextGrid[c][r]);
                el.style.setProperty('--row', r);
                // 判断是否原来是中奖格（要入场）
                var wasWin = false;
                for (var k = 0; k < allCells.length; k++) {
                  if (allCells[k][0] === c && allCells[k][1] === r) { wasWin = true; break; }
                }
                el.classList.remove('win', 'dim', 'remove');
                if (wasWin) {
                  el.classList.add('enter');
                }
              }
            }
            // 下一帧恢复
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var enters = elGrid.querySelectorAll('.ol-sym.enter');
                for (var j = 0; j < enters.length; j++) enters[j].classList.remove('enter');
                setTimeout(resolve, 420);
              });
            });
          } else {
            // 无下一轮：直接等待
            clearHighlights();
            setTimeout(resolve, 240);
          }
        }, 220);
      }, 480);
    });
  }

  // ── Free Spins 播放 ──
  function playFreeSpins(fs) {
    return new Promise(function (resolve) {
      var elStage = document.querySelector('.ol-stage');
      var elBanner = document.getElementById('ol-fs-banner');
      var elLeft = document.getElementById('ol-fs-left');
      var elTotal = document.getElementById('ol-fs-total');
      var elSum = document.getElementById('ol-fs-summary');
      var elSumVal = document.getElementById('ol-fs-summary-val');

      var awarded = fs.awarded || (fs.rounds ? fs.rounds.length : 0);
      var totalWinFS = fs.totalWin || 0;
      var left = awarded;

      // 进入 FS 模式
      if (elStage) elStage.classList.add('fs-mode');
      if (elBanner) {
        elBanner.setAttribute('aria-hidden', 'false');
        elBanner.classList.add('show');
      }
      if (elLeft) elLeft.textContent = left;
      if (elTotal) elTotal.textContent = awarded;
      sfx('scatter');

      // 延迟一点再开始
      setTimeout(function () {
        var rounds = fs.rounds || [];
        var idx = 0;

        function nextRound() {
          if (idx >= rounds.length) {
            // FS 结束
            if (elStage) elStage.classList.remove('fs-mode');
            if (elBanner) elBanner.classList.remove('show');
            setTimeout(function () {
              if (elSumVal) elSumVal.textContent = fmtMoney(totalWinFS);
              if (elSum) elSum.classList.add('show');
              setTimeout(function () {
                if (elSum) elSum.classList.remove('show');
                if (elBanner) elBanner.setAttribute('aria-hidden', 'true');
                resolve();
              }, 3200);
            }, 300);
            return;
          }

          var r = rounds[idx];
          idx++;
          left--;
          if (elLeft) elLeft.textContent = left;

          // 显示本轮初始网格
          renderGridFull(r.initialGrid);

          var ts = r.tumbles || [];
          if (ts.length === 0) {
            setTimeout(nextRound, 400);
            return;
          }
          var j = 0;
          function nextTumble() {
            if (j >= ts.length) {
              setTimeout(nextRound, 240);
              return;
            }
            var t = ts[j];
            var nextGrid = (j + 1 < ts.length) ? ts[j + 1].grid : null;
            j++;
            playTumbleRound(t.grid, t.wins, t.roundWin || 0, nextGrid).then(function () {
              setTimeout(nextTumble, 160);
            });
          }
          nextTumble();
        }

        nextRound();
      }, 700);
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

      // 播放 reel 滚动动画（6 列依次停下），停止后揭示初始网格
      await spinReels(initialGrid);
      renderGridFull(initialGrid);
      // 播放每一轮
      for (var i = 0; i < tumbles.length; i++) {
        var t = tumbles[i];
        var roundWin = t.roundWin || 0;
        var nextGrid = (i + 1 < tumbles.length) ? tumbles[i + 1].grid : null;
        await playTumbleRound(t.grid, t.wins, roundWin, nextGrid);
      }
      // 全部结束：清高亮
      clearHighlights();

      // 触发 Free Spins 播放
      if (result.freeSpins && result.freeSpins.rounds && result.freeSpins.rounds.length > 0) {
        await playFreeSpins(result.freeSpins);
      }
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

  // ── FX 尺寸同步（DPR 上限 2）──
  function resizeFx() {
    var elFx = document.getElementById('ol-fx');
    if (!elFx) return;
    var r = elFx.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    elFx.width = Math.max(1, Math.floor(r.width * dpr));
    elFx.height = Math.max(1, Math.floor(r.height * dpr));
  }

  // ── 事件绑定 ──
  function bind() {
    var elBack = document.querySelector('.ol-topbar a[href="/olympus.html"]');
    if (elBack) {
      elBack.addEventListener('click', function (e) {
        // 停 auto
        if (autoRun) { autoRun = false; if (elAuto) elAuto.classList.remove('active'); clearTimeout(autoTimer); }
        // 停 reel 层（清空）
        var elReels = $('ol-reels');
        if (elReels) { elReels.classList.remove('show'); elReels.innerHTML = ''; }
      });
    }
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
    if (elTitle) elTitle.textContent = '奥林匹斯之门';
    var elBadge = document.getElementById('ol-badge');
    if (elBadge) {
      if (MODE === 'demo') {
        elBadge.textContent = '试玩模式';
        elBadge.classList.remove('real');
      } else {
        elBadge.textContent = '游戏模式';
        elBadge.classList.add('real');
      }
    }
    buildGrid();
    window.addEventListener('resize', layoutGrid);
    window.addEventListener('orientationchange', function () { setTimeout(layoutGrid, 200); });
    updateBetUI();
    updateBalanceUI();
    updateTotalWinUI();
    updateWinUI(0, false);
    bind();
    resizeFx();
    window.addEventListener('resize', resizeFx);
    window.addEventListener('orientationchange', function () { setTimeout(resizeFx, 200); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
