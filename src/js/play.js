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

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
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

  function refreshUI() {
    if (balanceEl) balanceEl.textContent = fmtMoney(balance);
    if (betEl)     betEl.textContent     = fmtMoney(BET_STEPS[betIndex]);
    if (winEl)     winEl.textContent     = fmtMoney(lastWin);
    if (prizeEl)   prizeEl.textContent   = fmtMoney(lastWin);
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
    await sleep(200);

    var totalWin = 0, chain = 0;
    while (true) {
      if (isFS) {
        var dv = dropBall();
        if (dv) {
          renderBoard();
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
      setResult('第 ' + chain + ' 连 · +' + fmtMoney(winAmount), true);
      lastWin = totalWin;
      refreshUI();
      await sleep(900);

      var now = boardEl.querySelectorAll('.gp-cell');
      for (var pi = 0; pi < positions.length; pi++) {
        var el = now[positions[pi]];
        if (el) el.classList.add('is-clearing');
      }
      await sleep(320);

      for (var di = 0; di < positions.length; di++) grid[positions[di]] = null;
      dropDown();
      renderBoard();
      await sleep(280);
    }

    /* 结算（只有 FS 用倍率球） */
    var mult = isFS ? sumBalls() : 0;
    var finalWin = totalWin * (mult > 0 ? mult : 1);
    if (finalWin > 0) {
      balance += finalWin;
      lastWin = finalWin;
      refreshUI();
    } else {
      lastWin = 0;
    }
    if (!isFS) bonusBalls = {};

    return { finalWin: finalWin, chain: chain, mult: mult };
  }

  /* Spin 按钮 */
  if (spinBtn) spinBtn.addEventListener('click', async function () {
    if (spinning) return;
    var bet = BET_STEPS[betIndex];

    if (fsRemaining === 0 && balance < bet) { toast('余额不足'); return; }

    spinning = true;
    setResult('');

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
        var fr = await runSpin(bet, true);
        if (fr.finalWin > 0) {
          setResult('免费旋转 · +' + fmtMoney(fr.finalWin) + ' · 剩余 ' + fsRemaining + ' 次', true);
        } else {
          setResult('免费旋转 · 剩余 ' + fsRemaining + ' 次', false);
        }
        /* 再次触发 */
        if (countScatters() >= 4) {
          fsRemaining += 15;
          setResult('⚡ 再次触发 +15 次免费旋转！', true);
          refreshUI();
          await sleep(1200);
        }
      }

      if (fsRemaining === 0 && lastWin > 0) {
        setResult('免费旋转结束 · 总赢 ' + fmtMoney(lastWin), true);
      }
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

  /* 工具 */
  if (autoBtn) autoBtn.addEventListener('click', function () { toast('自动旋转即将开放'); });
  if (histBtn) histBtn.addEventListener('click', function () { toast('游戏记录即将开放'); });
  if (payBtn)  payBtn.addEventListener('click',  function () { toast('赔付表即将开放'); });

  /* 顶栏 */
  if (backBtn) backBtn.addEventListener('click', function () {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
  });
  if (menuBtn) menuBtn.addEventListener('click', function () { toast('菜单即将开放'); });

  var soundOn = true;
  if (soundBtn) soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    toast(soundOn ? '音效已开启' : '音效已关闭');
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
  loadRealBalance();
})();
