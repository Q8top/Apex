(function () {
  'use strict';

  var GAME_NAMES = {
    olympus: '奥林匹斯之门', sweet: '糖果连连爆', sugar: '甜蜜爆奖',
    bass: '巨型鲈鱼', dog: '狗狗之家', book: '死亡之书',
    starburst: '星爆', gonzo: '刚果探险', buffalo: '水牛之王',
    wolf: '狼黄金', fruit: '水果派对', megaways: '大富翁'
  };
  var MODE_LABELS = { demo: '试玩模式', real: '真实模式' };

  var COLS = 6, ROWS = 5, N = COLS * ROWS;

  /* 符号权重（真实/demo 相同，差异在 payScale 与 gemMin） */
  var POOL_W = {
    scatter: 8, zeus: 0.5, crown: 1, chalice: 3, ring: 5,
    hourglass: 10, 'gem-red': 20, 'gem-purple': 30, 'gem-blue': 40, 'gem-green': 50, 'gem-yellow': 60
  };
  var POOL = [], POOL_W_TOTAL = 0;
  for (var k in POOL_W) { POOL.push({ id: k, w: POOL_W[k] }); POOL_W_TOTAL += POOL_W[k]; }

  /* tier 索引：count-3 → [3,4,5,6,7,8,9,10+] */
  var PAYTABLE = {
    'zeus':       [1, 2, 5, 10, 25, 50, 100, 250],
    'crown':      [0.6, 1.5, 3, 6, 12, 25, 50, 100],
    'chalice':    [0.4, 1, 2, 5, 10, 20, 40, 80],
    'ring':       [0.3, 0.8, 1.5, 4, 8, 15, 30, 60],
    'hourglass':  [0.2, 0.5, 1, 2, 5, 10, 20, 40],
    'gem-red':    [0, 0, 0.5, 1, 2.5, 5, 10, 20],
    'gem-purple': [0, 0, 0.4, 0.8, 2, 4, 8, 16],
    'gem-blue':   [0, 0, 0.3, 0.6, 1.5, 3, 6, 12],
    'gem-green':  [0, 0, 0.2, 0.5, 1, 2.5, 5, 10],
    'gem-yellow': [0, 0, 0.2, 0.4, 0.8, 2, 4, 8]
  };

  var SYMBOL_NAMES = {
    scatter: '闪电', zeus: '宙斯', crown: '金冠', chalice: '圣杯',
    ring: '神戒', hourglass: '沙漏', 'gem-red': '红宝石',
    'gem-purple': '紫宝石', 'gem-blue': '蓝宝石',
    'gem-green': '绿宝石', 'gem-yellow': '黄宝石'
  };

  var HIGH_SYMBOLS = { zeus: 1, crown: 1, chalice: 1, ring: 1, hourglass: 1 };

  /* 模式参数 */
  var MODE_CFG = {
    demo: { payScale: 0.72, gemMin: 3, dropBallRateFS: 0.20, startBalance: 10000 },
    real: { payScale: 1.22, gemMin: 6, dropBallRateFS: 0.15, startBalance: 0 }
  };

  var BET_STEPS = [1, 2, 5, 10, 20, 50, 100];

  /* URL */
  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var mode     = params.get('mode') || 'demo';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;
  var modeText = MODE_LABELS[mode] || MODE_LABELS.demo;
  var cfg      = MODE_CFG[mode] || MODE_CFG.demo;

  /* DOM */
  var page       = document.querySelector('.gp-page');
  var titleEl    = document.getElementById('gpTitle');
  var modeEl     = document.getElementById('gpMode');
  var backBtn    = document.getElementById('gpBack');
  var menuBtn    = document.getElementById('gpMenu');
  var soundBtn   = document.getElementById('gpSound');
  var boardEl    = document.getElementById('gpBoard');
  var prizeEl    = document.getElementById('gpPrize');
  var balanceEl  = document.getElementById('gpBalance');
  var betEl      = document.getElementById('gpBet');
  var winEl      = document.getElementById('gpWin');
  var betValueEl = document.getElementById('gpBetValue');
  var betMinus   = document.getElementById('gpBetMinus');
  var betPlus    = document.getElementById('gpBetPlus');
  var spinBtn    = document.getElementById('gpSpin');
  var rechargeEl = document.getElementById('gpRecharge');
  var autoBtn    = document.getElementById('gpAuto');
  var histBtn    = document.getElementById('gpHistory');
  var payBtn     = document.getElementById('gpPaytable');
  var toastEl    = document.getElementById('gpToast');
  var resultEl   = document.getElementById('gpResult');

  if (!page || !boardEl) return;

  page.setAttribute('data-game-id', gameId);
  page.setAttribute('data-mode', mode);
  if (titleEl) titleEl.textContent = gameName;
  if (modeEl)  modeEl.textContent  = modeText;
  document.title = gameName + ' · ' + modeText;

  /* 状态 */
  var balance     = cfg.startBalance;
  var betIndex    = 3;
  var lastWin     = 0;
  var fsRemaining = 0;
  var grid        = [];
  var bonusBalls  = {};
  var spinning    = false;

  /* 随机数 */
  var rbuf = new Uint32Array(1024), rptr = rbuf.length;
  function rnd() {
    if (rptr >= rbuf.length) {
      (window.crypto || window.msCrypto).getRandomValues(rbuf);
      rptr = 0;
    }
    return rbuf[rptr++] / 4294967296;
  }

  /* 工具 */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function fmtMoney(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var VIB = {
    click: 8,
    spin: 15,
    land: 15,
    drop: 20,
    ball: [30, 30, 60],
    chain: [25],
    win: function (amount, bet) {
      var r = amount / Math.max(1, bet);
      if (r >= 50) return [50, 40, 80, 40, 120];
      if (r >= 10) return [30, 30, 60];
      if (r >= 3) return [20];
      return [10];
    },
    fsTrigger: [60, 40, 60, 40, 200],
    fsSpin: [15],
    fsEnd: [40, 40, 100],
    error: 80
  };

  function sfx(name) {
    if (window.ApexAudio) window.ApexAudio.play.apply(null, arguments);
    if (!vibeOn || !navigator.vibrate) return;
    var v = VIB[name];
    if (typeof v === 'function') v = v(arguments[1], arguments[2]);
    if (v) { try { navigator.vibrate(v); } catch (e) {} }
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }

  /* ---------- Sheet 弹层 ---------- */
  var sheetEl     = document.getElementById('gpSheet');
  var sheetBd     = document.getElementById('gpSheetBackdrop');
  var sheetTitle  = document.getElementById('gpSheetTitle');
  var sheetBody   = document.getElementById('gpSheetBody');

  function openSheet(title, html) {
    if (!sheetEl) return;
    sheetTitle.textContent = title;
    sheetBody.innerHTML = html;
    sheetEl.hidden = false;
    requestAnimationFrame(function () {
      sheetEl.classList.add('is-open');
      sheetEl.setAttribute('aria-hidden', 'false');
    });
  }
  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.classList.remove('is-open');
    sheetEl.setAttribute('aria-hidden', 'true');
    setTimeout(function () { sheetEl.hidden = true; }, 300);
  }
  if (sheetBd) sheetBd.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSheet();
  });

  /* ---------- 游戏记录 ---------- */
  var history = [];
  function recordHistory(entry) {
    history.unshift(entry);
    if (history.length > 100) history.length = 100;
  }

  function setResult(text, isWin) {
    if (!resultEl) return;
    resultEl.textContent = text || '';
    resultEl.classList.toggle('is-win', !!isWin);
    resultEl.classList.toggle('is-empty', !text);
  }

  /* 符号渲染 */
  function renderSym(symId) {
    if (symId === 'scatter') return renderScatter();
    if (!window.ApexOlympusSymbols) return '';
    var camel = String(symId).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    return window.ApexOlympusSymbols.render(camel);
  }

  function renderScatter() {
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="50" cy="50" r="42" fill="#2A1B5E" stroke="#FFD84D" stroke-width="2.5"/>'
      + '<circle cx="50" cy="50" r="36" fill="none" stroke="#C4A6FF" stroke-width="1" opacity=".5"/>'
      + '<path d="M56 12 L28 54 L46 54 L36 88 L72 42 L54 42 L64 12 Z" fill="#FFF4B0" stroke="#6A4600" stroke-width="1.8" stroke-linejoin="round"/>'
      + '<path d="M56 12 L40 54 L48 54 L42 76" fill="none" stroke="#FFFCE8" stroke-width="1.6" opacity=".9" stroke-linecap="round"/>'
      + '<ellipse cx="32" cy="22" rx="8" ry="5" fill="#fff" opacity=".18"/>'
      + '</svg>';
  }

  function renderBall(v) {
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="50" cy="50" r="42" fill="#7A50C8" stroke="#FFD84D" stroke-width="2.5"/>'
      + '<circle cx="50" cy="50" r="36" fill="none" stroke="#C4A6FF" stroke-width="1" opacity=".55"/>'
      + '<ellipse cx="34" cy="30" rx="14" ry="10" fill="#fff" opacity=".28"/>'
      + '<ellipse cx="30" cy="26" rx="6" ry="4" fill="#fff" opacity=".55"/>'
      + '<text x="50" y="63" text-anchor="middle" font-size="32" font-weight="800" fill="#FFE888" stroke="#3D0A70" stroke-width=".8" font-family="sans-serif">x' + v + '</text>'
      + '</svg>';
  }

  /* 盘面 */
  function pick() {
    var r = rnd() * POOL_W_TOTAL;
    for (var i = 0; i < POOL.length; i++) { r -= POOL[i].w; if (r <= 0) return POOL[i].id; }
    return POOL[POOL.length - 1].id;
  }

  function newGrid() {
    grid = [];
    for (var i = 0; i < N; i++) grid.push(pick());
    bonusBalls = {};
  }

  function renderBoard(highlight) {
    if (!window.ApexOlympusSymbols) return;
    window.ApexOlympusSymbols.ensureDefs();
    var hl = highlight || [];
    var hasWin = hl.length > 0;
    var html = '';
    for (var i = 0; i < N; i++) {
      var isBall = bonusBalls[i] !== undefined;
      var isWin = hl.indexOf(i) >= 0;
      var cls = 'gp-cell';
      if (isBall) cls += ' is-ball';
      else if (isWin) cls += ' is-win';
      else if (hasWin) cls += ' is-dim';
      html += '<div class="' + cls + '">' + (isBall ? renderBall(bonusBalls[i]) : renderSym(grid[i])) + '</div>';
    }
    boardEl.innerHTML = html;
  }

  /* 判定：4 方向相邻连通 */
  function findWins() {
    var visited = new Uint8Array(N);
    var wins = [];
    var DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
    for (var s = 0; s < N; s++) {
      if (visited[s]) continue;
      if (bonusBalls[s] !== undefined) { visited[s] = 1; continue; }
      var sym = grid[s];
      if (sym === 'scatter') { visited[s] = 1; continue; }
      var stack = [s], group = [];
      visited[s] = 1;
      while (stack.length) {
        var cur = stack.pop();
        group.push(cur);
        var r = (cur / COLS) | 0, c = cur % COLS;
        for (var d = 0; d < 4; d++) {
          var nr = r + DIRS[d][0], nc = c + DIRS[d][1];
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          var ni = nr * COLS + nc;
          if (visited[ni] || bonusBalls[ni] !== undefined || grid[ni] !== sym) continue;
          visited[ni] = 1;
          stack.push(ni);
        }
      }
      var minN = HIGH_SYMBOLS[sym] ? 3 : cfg.gemMin;
      if (group.length >= minN) wins.push({ symbol: sym, positions: group, count: group.length });
    }
    return wins;
  }

  function calcTotalWin(wins, bet) {
    var total = 0;
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      var pay = PAYTABLE[w.symbol] || [];
      var idx = Math.min(w.count - 3, 7);
      total += (pay[idx] || 0) * cfg.payScale;
    }
    return total * bet;
  }

  function countScatters() {
    var n = 0;
    for (var i = 0; i < N; i++) if (bonusBalls[i] === undefined && grid[i] === 'scatter') n++;
    return n;
  }

  function spawnParticles(cellEl) {
    if (!cellEl) return;
    var n = 6;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span');
      p.className = 'gp-particle ' + (i % 2 === 0 ? 'is-star' : 'is-white');
      var ang = (i / n) * Math.PI * 2 + rnd() * 0.7;
      var dist = 24 + rnd() * 18;
      var dx = Math.cos(ang) * dist;
      var dy = Math.sin(ang) * dist - 4;
      p.style.setProperty('--dx', dx.toFixed(1) + 'px');
      p.style.setProperty('--dy', dy.toFixed(1) + 'px');
      p.style.animationDelay = (rnd() * 60) + 'ms';
      cellEl.appendChild(p);
      (function (el) {
        setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 720);
      })(p);
    }
  }

  function dropDown() {
    for (var col = 0; col < COLS; col++) {
      var stack = [];
      for (var r = ROWS - 1; r >= 0; r--) {
        var v = grid[r * COLS + col];
        if (v !== null) stack.push(v);
      }
      for (var r2 = ROWS - 1; r2 >= 0; r2--) {
        var i2 = r2 * COLS + col;
        grid[i2] = stack.length ? stack.shift() : pick();
      }
    }
  }

  function dropBall() {
    var cnt = 0;
    for (var k in bonusBalls) if (bonusBalls.hasOwnProperty(k)) cnt++;
    if (cnt >= 3) return 0;
    if (rnd() > cfg.dropBallRateFS) return 0;
    var cand = [];
    for (var i = 0; i < N; i++) if (bonusBalls[i] === undefined) cand.push(i);
    if (!cand.length) return 0;
    var idx = cand[(rnd() * cand.length) | 0];
    var vals = [2,2,2,3,3,4,5,6,8,10,15,20,50];
    var v = vals[(rnd() * vals.length) | 0];
    bonusBalls[idx] = v;
    return v;
  }

  function sumBalls() {
    var t = 0;
    for (var k in bonusBalls) if (bonusBalls.hasOwnProperty(k)) t += bonusBalls[k];
    return t;
  }

  var rollingId = 0;
  function animateNumber(el, from, to, dur) {
    if (!el) return;
    var myId = ++rollingId;
    var start = performance.now();
    function tick(now) {
      if (myId !== rollingId) return;
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmtMoney(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmtMoney(to);
    }
    requestAnimationFrame(tick);
  }

  function refreshUI() {
    if (balanceEl) balanceEl.textContent = fmtMoney(balance);
    if (betEl)     betEl.textContent     = fmtMoney(BET_STEPS[betIndex]);
    if (winEl)     winEl.textContent     = fmtMoney(lastWin);
    if (prizeEl)   prizeEl.textContent   = fmtMoney(lastWin);
    updateFsUI();
    if (betValueEl) {
      if (fsRemaining > 0) {
        betValueEl.textContent = '免费旋转 · 剩余 ' + fsRemaining + ' 次';
        betValueEl.style.color = '#C77800';
      } else {
        betValueEl.textContent = '下注 ' + fmtMoney(BET_STEPS[betIndex]);
        betValueEl.style.color = '';
      }
    }
  }

  /* 核心旋转（含连锁 + 倍率球） */
  async function runSpin(bet, isFS) {
    /* 闪烁 */
    var cells = boardEl.querySelectorAll('.gp-cell');
    var t = 0;
    var ft = setInterval(function () {
      for (var i = 0; i < cells.length; i++) {
        if (rnd() < 0.4) cells[i].innerHTML = renderSym(pick());
      }
      t++;
      if (t >= 8) clearInterval(ft);
    }, 80);
    await sleep(700);

    newGrid();
    renderBoard();
    sfx('land');
    await sleep(200);

    var totalWin = 0, chain = 0;
    while (true) {
      if (isFS) {
        var dv = dropBall();
        if (dv) {
          renderBoard();
          sfx('ball');
          setResult('倍率之球 x' + dv + '！', true);
          await sleep(500);
        }
      }

      var wins = findWins();
      if (wins.length === 0) break;
      chain++;

      var winAmount = calcTotalWin(wins, bet);
      totalWin += winAmount;

      var positions = [];
      for (var wi = 0; wi < wins.length; wi++) positions = positions.concat(wins[wi].positions);

      renderBoard(positions);
      sfx('chain', chain);
      sfx('win', winAmount, bet);
      popupWin(positions, winAmount);
      setResult('第 ' + chain + ' 连 · +' + fmtMoney(winAmount), true);
      var prevWin = lastWin;
      lastWin = totalWin;
      refreshUI();
      animateNumber(prizeEl, prevWin, totalWin, 320);
      var ratio = totalWin / Math.max(1, bet);
      if (ratio >= 20) triggerFlash('big');
      else if (ratio >= 5) triggerFlash('mid');
      else triggerFlash('small');
      await sleep(900);

      var now = boardEl.querySelectorAll('.gp-cell');
      for (var pi = 0; pi < positions.length; pi++) {
        var el = now[positions[pi]];
        if (el) { el.classList.add('is-clearing'); spawnParticles(el); }
      }
      await sleep(320);
      sfx('drop');

      for (var di = 0; di < positions.length; di++) grid[positions[di]] = null;
      dropDown();
      renderBoard();
      await sleep(280);
    }

    /* 结算（只有 FS 用倍率球） */
    var mult = isFS ? sumBalls() : 0;
    var finalWin = totalWin * (mult > 0 ? mult : 1);
    if (finalWin > 0) {
      var prevTotal = lastWin;
      balance += finalWin;
      lastWin = finalWin;
      refreshUI();
      animateNumber(prizeEl, prevTotal, finalWin, 450);
      animateNumber(balanceEl, balance - finalWin, balance, 450);
      /* FS 内不弹（避免连转频繁打断），普通局弹结算 */
      if (!isFS) showSettle(chain, finalWin, mult, bet);
    } else {
      lastWin = 0;
    }
    if (!isFS) bonusBalls = {};

    return { finalWin: finalWin, chain: chain, mult: mult };
  }

  /* Spin 按钮 */
  if (spinBtn) spinBtn.addEventListener('click', async function (ev) {
    if (spinning) return;
    /* 用户手动点击 → 停止自动（自动触发不带 isTrusted） */
    if (ev && ev.isTrusted && autoRunning) stopAuto();
    var bet = BET_STEPS[betIndex];

    if (fsRemaining === 0 && balance < bet) { sfx('error'); toast('余额不足'); return; }

    spinning = true;
    setResult('');
    sfx('spin');

    var isFS = false;
    if (fsRemaining > 0) {
      fsRemaining--;
      isFS = true;
    } else {
      balance -= bet;
      bonusBalls = {};
    }
    refreshUI();

    try {
      var r = await runSpin(bet, isFS);

      if (isFS) {
        if (r.finalWin > 0) {
          setResult('免费旋转 · +' + fmtMoney(r.finalWin) + ' · 剩余 ' + fsRemaining + ' 次', true);
        } else {
          setResult('免费旋转 · 未中奖 · 剩余 ' + fsRemaining + ' 次', false);
        }
        if (fsRemaining === 0) {
          setResult('免费旋转结束 · 总赢 ' + fmtMoney(lastWin), lastWin > 0);
        }
      } else {
        var sc = countScatters();
        if (sc >= 4) {
          fsRemaining = 15;
          bonusBalls = {};
          updateFsUI();
          sfx('fsTrigger');
          triggerFlash('big');
          setResult('⚡ ' + sc + ' 个闪电 · 触发免费旋转 15 次！', true);
          refreshUI();
          await sleep(1400);
        } else {
          if (r.chain === 0) setResult('未中奖', false);
          else if (r.finalWin > 0) setResult(r.chain + ' 连锁 · 总赢 ' + fmtMoney(r.finalWin), true);
        }
      }

      /* 自动连转 FS */
      while (fsRemaining > 0) {
        fsRemaining--;
        refreshUI();
        await sleep(300);
        sfx('fsSpin');
        var fr = await runSpin(bet, true);
        if (fr.finalWin > 0) {
          setResult('免费旋转 · +' + fmtMoney(fr.finalWin) + ' · 剩余 ' + fsRemaining + ' 次', true);
        } else {
          setResult('免费旋转 · 剩余 ' + fsRemaining + ' 次', false);
        }
        /* 再次触发 */
        if (countScatters() >= 4) {
          fsRemaining += 15;
          updateFsUI();
          setResult('⚡ 再次触发 +15 次免费旋转！', true);
          refreshUI();
          await sleep(1200);
        }
      }

      if (fsRemaining === 0 && lastWin > 0) {
        sfx('fsEnd');
        updateFsUI();
        setResult('免费旋转结束 · 总赢 ' + fmtMoney(lastWin), true);
      }

      /* 记录到历史 */
      recordHistory({
        t: Date.now(),
        bet: bet,
        win: lastWin,
        chain: r.chain || 0,
        mult: r.mult || 0,
        fs: !!isFS
      });
    } catch (e) { /* noop */ }

    spinning = false;
  });

  /* 下注 */
  if (betMinus) betMinus.addEventListener('click', function () { if (betIndex > 0) { betIndex--; refreshUI(); } });
  if (betPlus)  betPlus.addEventListener('click',  function () { if (betIndex < BET_STEPS.length - 1) { betIndex++; refreshUI(); } });

  /* 重置/充值 */
  if (rechargeEl) {
    if (mode === 'demo') {
      rechargeEl.textContent = '重置余额';
      rechargeEl.addEventListener('click', function () {
        balance = cfg.startBalance;
        lastWin = 0;
        setResult('');
        refreshUI();
        toast('余额已重置');
      });
    } else {
      rechargeEl.textContent = '充值余额';
      rechargeEl.addEventListener('click', function () { toast('充值功能即将开放'); });
    }
  }

  /* ---------- 自动旋转 ---------- */
  var autoRunning = false;
  var autoCount = 0;
  function startAuto() {
    if (autoRunning) return;
    autoRunning = true;
    if (autoBtn) autoBtn.classList.add('is-running');
    toast('自动旋转已开启');
    tickAuto();
  }
  function tickAuto() {
    if (!autoRunning) return;
    if (spinning) { setTimeout(tickAuto, 300); return; }
    if (spinBtn) spinBtn.click();
    setTimeout(tickAuto, 600);
  }
  function stopAuto() {
    if (!autoRunning) return;
    autoRunning = false;
    autoCount = 0;
    if (autoBtn) autoBtn.classList.remove('is-running');
    toast('自动旋转已停止');
  }

  if (autoBtn) autoBtn.addEventListener('click', function () {
    if (autoRunning) stopAuto();
    else startAuto();
  });

  /* ---------- 记录 ---------- */
  if (histBtn) histBtn.addEventListener('click', function () {
    if (!history.length) {
      openSheet('游戏记录', '<p class="gp-sheet-empty">暂无记录，旋转几次后再来查看</p>');
      return;
    }

    /* 顶部统计 */
    var totalBet = 0, totalWin = 0, hits = 0, fsRounds = 0;
    for (var i = 0; i < history.length; i++) {
      totalBet += history[i].bet;
      totalWin += history[i].win;
      if (history[i].win > 0) hits++;
      if (history[i].fs) fsRounds++;
    }
    var net = totalWin - totalBet;
    var hitRate = (hits / history.length * 100).toFixed(1);

    var html = '';
    html += '<div class="gp-hist-stats">';
    html += '<div class="gp-hist-stat"><span>总局数</span><strong>' + history.length + '</strong></div>';
    html += '<div class="gp-hist-stat"><span>总下注</span><strong>' + fmtMoney(totalBet) + '</strong></div>';
    html += '<div class="gp-hist-stat"><span>总赢</span><strong>' + fmtMoney(totalWin) + '</strong></div>';
    html += '<div class="gp-hist-stat"><span>净收益</span><strong class="' + (net >= 0 ? 'is-win' : 'is-lose') + '">' + (net >= 0 ? '+' : '') + fmtMoney(net) + '</strong></div>';
    html += '<div class="gp-hist-stat"><span>命中率</span><strong>' + hitRate + '%</strong></div>';
    html += '<div class="gp-hist-stat"><span>免费旋转</span><strong>' + fsRounds + ' 局</strong></div>';
    html += '</div>';

    /* 逐局列表 */
    html += '<div class="gp-hist">';
    var maxShow = Math.min(history.length, 50);
    for (var j = 0; j < maxShow; j++) {
      var h = history[j];
      var d = new Date(h.t);
      var hh = String(d.getHours()).padStart(2, '0');
      var mm2 = String(d.getMinutes()).padStart(2, '0');
      var ss = String(d.getSeconds()).padStart(2, '0');
      var rowNet = h.win - h.bet;
      var cls = h.win > 0 ? 'is-win' : 'is-lose';
      html += '<div class="gp-hist-row ' + cls + '">';
      html += '  <div class="gp-hist-time">' + hh + ':' + mm2 + ':' + ss + (h.fs ? ' <em>FS</em>' : '') + '</div>';
      html += '  <div class="gp-hist-mid">';
      html += '    <span class="gp-hist-tag">注 ' + fmtMoney(h.bet) + '</span>';
      html += '    <span class="gp-hist-tag">' + h.chain + ' 连</span>';
      if (h.mult > 0) html += '<span class="gp-hist-tag is-mult">x' + h.mult + '</span>';
      html += '  </div>';
      html += '  <div class="gp-hist-right">';
      if (h.win > 0) {
        html += '<span class="gp-hist-win">+' + fmtMoney(h.win) + '</span>';
        html += '<span class="gp-hist-net ' + (rowNet >= 0 ? 'is-win' : 'is-lose') + '">' + (rowNet >= 0 ? '+' : '') + fmtMoney(rowNet) + '</span>';
      } else {
        html += '<span class="gp-hist-win is-none">—</span>';
        html += '<span class="gp-hist-net is-lose">' + fmtMoney(rowNet) + '</span>';
      }
      html += '  </div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<button type="button" class="gp-hist-clear" id="gpHistClear">清空记录</button>';

    openSheet('游戏记录', html);

    var clr = document.getElementById('gpHistClear');
    if (clr) clr.addEventListener('click', function () {
      history = [];
      closeSheet();
      toast('记录已清空');
    });
  });

  /* ---------- 赔付表 ---------- */
  if (payBtn) payBtn.addEventListener('click', function () {
    var rows = [
      ['zeus', '宙斯'], ['crown', '金冠'], ['chalice', '圣杯'], ['ring', '神戒'], ['hourglass', '沙漏'],
      ['gem-red', '红宝石'], ['gem-purple', '紫宝石'], ['gem-blue', '蓝宝石'], ['gem-green', '绿宝石'], ['gem-yellow', '黄宝石']
    ];
    var html = '<div class="gp-paytable">';
    html += '<div class="gp-payhead"><span>符号</span><span>3</span><span>4</span><span>5</span><span>6+</span></div>';
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i][0], name = rows[i][1];
      var pay = PAYTABLE[id] || [];
      var high = HIGH_SYMBOLS[id];
      html += '<div class="gp-payrow">' +
                '<span class="gp-payname">' + name + '</span>' +
                '<span>' + (high ? (pay[0] || '—') : '—') + '</span>' +
                '<span>' + (high ? (pay[1] || '—') : '—') + '</span>' +
                '<span>' + (pay[2] || '—') + '</span>' +
                '<span>' + (pay[7] || pay[5] || '—') + '</span>' +
              '</div>';
    }
    html += '</div>';
    html += '<p class="gp-paynote">数值为注额倍数。高值符号 3+ 连线，低值符号 5+ 连线（真实模式 6+）。</p>';
    openSheet('赔付表', html);
  });

  /* ---------- 菜单 ---------- */
  var vibeOn = true;
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var html = '<div class="gp-menu">' +
                 '<button type="button" class="gp-menu-item" id="gpMenuPay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span>赔付表</span></button>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuHist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>游戏记录</span></button>' +
                 '<div class="gp-menu-row">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 L6 9 L2 9 L2 15 L6 15 L11 19 Z"/><path d="M15.5 8.5 Q18 12 15.5 15.5"/><path d="M18.5 5.5 Q23 12 18.5 18.5"/></svg>' +
                   '<span>音效</span>' +
                   '<button type="button" class="gp-switch" id="gpSwitchSound" role="switch" aria-checked="' + (soundOn ? 'true' : 'false') + '"><span></span></button>' +
                 '</div>' +
                 '<div class="gp-menu-row">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L22 20 L2 20 Z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>' +
                   '<span>震动</span>' +
                   '<button type="button" class="gp-switch" id="gpSwitchVibe" role="switch" aria-checked="' + (vibeOn ? 'true' : 'false') + '"><span></span></button>' +
                 '</div>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuExit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span>退出游戏</span></button>' +
               '</div>';
    openSheet('菜单', html);
    document.getElementById('gpMenuPay').addEventListener('click', function () { closeSheet(); payBtn && payBtn.click(); });
    document.getElementById('gpMenuHist').addEventListener('click', function () { closeSheet(); histBtn && histBtn.click(); });
    document.getElementById('gpMenuExit').addEventListener('click', function () {
      closeSheet();
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
    });

    /* 音效开关 */
    var swSound = document.getElementById('gpSwitchSound');
    if (swSound) swSound.addEventListener('click', function () {
      soundOn = !soundOn;
      swSound.setAttribute('aria-checked', soundOn ? 'true' : 'false');
      if (soundBtn) soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      if (window.ApexAudio) window.ApexAudio.setEnabled(soundOn);
      if (soundOn && window.ApexAudio) window.ApexAudio.play('click');
    });

    /* 震动开关 */
    var swVibe = document.getElementById('gpSwitchVibe');
    if (swVibe) swVibe.addEventListener('click', function () {
      vibeOn = !vibeOn;
      swVibe.setAttribute('aria-checked', vibeOn ? 'true' : 'false');
      if (vibeOn && navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
    });
  });

  /* ---------- 顶栏 ---------- */
  if (backBtn) backBtn.addEventListener('click', function () {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
  });

  /* ---------- 音效开关（图标切换） ---------- */
  var soundOn = true;
  if (window.ApexAudio) window.ApexAudio.setEnabled(true);
  if (soundBtn) soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    if (window.ApexAudio) window.ApexAudio.setEnabled(soundOn);
    if (soundOn) sfx('click');
  });

  /* 真实模式：读后端余额 */
  function loadRealBalance() {
    if (mode !== 'real') return;
    fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d || !res.d.success) { toast('未登录，请先登录'); return; }
        var wb = res.d.user && res.d.user.walletBalance;
        balance = (typeof wb === 'number') ? wb : 0;
        refreshUI();
      })
      .catch(function () { toast('余额获取失败'); });
  }

  /* 初始化 */
  renderBoard();
  refreshUI();
  updateFsUI();
  loadRealBalance();
})();
