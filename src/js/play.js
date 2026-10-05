(function () {
  'use strict';

  var GAME_NAMES = {
    olympus:   '奥林匹斯之门',
    sweet:     '糖果连连爆',
    sugar:     '甜蜜爆奖',
    bass:      '巨型鲈鱼',
    dog:       '狗狗之家',
    book:      '死亡之书',
    starburst: '星爆',
    gonzo:     '刚果探险',
    buffalo:   '水牛之王',
    wolf:      '狼黄金',
    fruit:     '水果派对',
    megaways:  '大富翁'
  };

  var MODE_LABELS = {
    demo: '试玩模式',
    real: '真实模式'
  };

  /* 盘面配置 */
  var COLS = 6, ROWS = 5;

  /* 符号池（权重越高出现越多） */
  var POOL = [
    { id: 'zeus',      w: 1 },
    { id: 'crown',     w: 2 },
    { id: 'chalice',   w: 3 },
    { id: 'ring',      w: 3 },
    { id: 'hourglass', w: 4 },
    { id: 'gem-red',   w: 6 },
    { id: 'gem-purple',w: 6 },
    { id: 'gem-blue',  w: 7 },
    { id: 'gem-green', w: 7 },
    { id: 'gem-yellow',w: 7 }
  ];
  var POOL_FLAT = (function () {
    var out = [];
    for (var i = 0; i < POOL.length; i++) {
      for (var j = 0; j < POOL[i].w; j++) out.push(POOL[i].id);
    }
    return out;
  })();

  /* 符号赔率表：数组 index = 连线长度 - 3（3/4/5/6+） */
  var PAYTABLE = {
    'zeus':       [2.5, 10,  25,  100],
    'crown':      [2,   8,   20,  50 ],
    'chalice':    [1.5, 5,   15,  40 ],
    'ring':       [1.2, 4,   12,  30 ],
    'hourglass':  [1,   3,   10,  25 ],
    'gem-red':    [0.5, 2,   5,   12 ],
    'gem-purple': [0.4, 1.5, 4,   10 ],
    'gem-blue':   [0.3, 1,   3,   8  ],
    'gem-green':  [0.2, 0.8, 2.5, 6  ],
    'gem-yellow': [0.2, 0.5, 2,   5  ]
  };

  /* 符号中文名（用于中奖提示） */
  var SYMBOL_NAMES = {
    'zeus':       '宙斯',
    'crown':      '金冠',
    'chalice':    '圣杯',
    'ring':       '神戒',
    'hourglass':  '沙漏',
    'gem-red':    '红宝石',
    'gem-purple': '紫宝石',
    'gem-blue':   '蓝宝石',
    'gem-green':  '绿宝石',
    'gem-yellow': '黄宝石'
  };

  /* 下注档位 */
  var BET_STEPS = [1, 2, 5, 10, 20, 50, 100];
  var DEFAULT_BALANCE = { demo: 10000, real: 0 };

  /* ---------- URL 参数 ---------- */
  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var mode     = params.get('mode') || 'demo';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;
  var modeText = MODE_LABELS[mode] || MODE_LABELS.demo;

  /* ---------- DOM ---------- */
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

  /* ---------- 状态 ---------- */
  var balance   = DEFAULT_BALANCE[mode] || 0;
  var betIndex  = 3;   /* BET_STEPS[3] = 10 */
  var lastWin   = 0;

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 2600);
  }

  /* ---------- 结果栏 ---------- */
  function setResult(text, isWin) {
    if (!resultEl) return;
    resultEl.textContent = text || '';
    resultEl.classList.toggle('is-win', !!isWin);
    resultEl.classList.toggle('is-empty', !text);
  }

  /* ---------- 金额格式化 ---------- */
  function fmtMoney(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  /* ---------- 随机数（基于 crypto 的均匀随机） ---------- */
  var rndBuf = new Uint32Array(1);
  function rnd() {
    (window.crypto || window.msCrypto).getRandomValues(rndBuf);
    return rndBuf[0] / 4294967296;
  }

  /* ---------- 随机符号 ---------- */
  function pick() {
    return POOL_FLAT[Math.floor(rnd() * POOL_FLAT.length)];
  }

  /* ---------- 盘面数据（symbol id 数组，长度 COLS*ROWS） ---------- */
  var grid = [];

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* 列内下落 + 顶部补新符号 */
  function dropDown() {
    for (var col = 0; col < COLS; col++) {
      var stack = [];
      for (var r = ROWS - 1; r >= 0; r--) {
        var idx = r * COLS + col;
        if (grid[idx]) stack.push(grid[idx]);
      }
      for (var r2 = ROWS - 1; r2 >= 0; r2--) {
        var i2 = r2 * COLS + col;
        grid[i2] = stack.length > 0 ? stack.shift() : pick();
      }
    }
  }

  function renderSym(symId) {
    if (!window.ApexOlympusSymbols) return '';
    var camel = String(symId).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    return window.ApexOlympusSymbols.render(camel);
  }

  function newGrid() {
    grid = [];
    for (var i = 0; i < COLS * ROWS; i++) grid.push(pick());
  }

  /* 8 方向相邻同符号连通组，>=3 个算中奖 */
  function findWins() {
    var visited = new Array(grid.length).fill(false);
    var wins = [];
    var dirs = [-1, 0, 1];

    for (var start = 0; start < grid.length; start++) {
      if (visited[start]) continue;
      var sym = grid[start];
      var stack = [start];
      var group = [];
      visited[start] = true;

      while (stack.length) {
        var cur = stack.pop();
        group.push(cur);
        var r = Math.floor(cur / COLS);
        var c = cur % COLS;
        for (var di = 0; di < 3; di++) {
          for (var dj = 0; dj < 3; dj++) {
            if (dirs[di] === 0 && dirs[dj] === 0) continue;
            var nr = r + dirs[di];
            var nc = c + dirs[dj];
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            var ni = nr * COLS + nc;
            if (visited[ni]) continue;
            if (grid[ni] !== sym) continue;
            visited[ni] = true;
            stack.push(ni);
          }
        }
      }

      if (group.length >= 3) {
        wins.push({ symbol: sym, positions: group, count: group.length });
      }
    }
    return wins;
  }

  /* 计算总赢额（单位：注额倍数 × 下注额） */
  function calcTotalWin(wins, bet) {
    var total = 0;
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      var pay = PAYTABLE[w.symbol] || [0, 0, 0, 0];
      var tier = Math.min(w.count - 3, 3);
      total += pay[tier];
    }
    return total * bet;
  }

  /* ---------- 渲染盘面 ---------- */
  function renderBoard(highlightPositions) {
    if (!window.ApexOlympusSymbols) {
      boardEl.innerHTML = '<div style="grid-column:1/-1;color:#fff;padding:20px;text-align:center;font-size:12px">符号库加载中…</div>';
      return;
    }
    if (grid.length !== COLS * ROWS) newGrid();
    window.ApexOlympusSymbols.ensureDefs();
    var hl = highlightPositions || [];
    var hasWin = hl.length > 0;
    var frag = '';
    for (var i = 0; i < grid.length; i++) {
      var isWin = hl.indexOf(i) >= 0;
      var cls = 'gp-cell';
      if (isWin) cls += ' is-win';
      else if (hasWin) cls += ' is-dim';
      frag += '<div class="' + cls + '">' + renderSym(grid[i]) + '</div>';
    }
    boardEl.innerHTML = frag;
  }

  /* ---------- 刷新 UI ---------- */
  function refreshUI() {
    if (balanceEl)  balanceEl.textContent  = fmtMoney(balance);
    if (betEl)      betEl.textContent      = fmtMoney(BET_STEPS[betIndex]);
    if (winEl)      winEl.textContent      = fmtMoney(lastWin);
    if (prizeEl)    prizeEl.textContent    = fmtMoney(lastWin);
    if (betValueEl) betValueEl.textContent = '下注 ' + fmtMoney(BET_STEPS[betIndex]);
  }

  /* ---------- 重置 / 充值 ---------- */
  if (rechargeEl) {
    if (mode === 'demo') {
      rechargeEl.textContent = '重置余额';
      rechargeEl.addEventListener('click', function () {
        balance = DEFAULT_BALANCE.demo;
        lastWin = 0;
        refreshUI();
        setResult('');
        toast('余额已重置');
      });
    } else {
      rechargeEl.textContent = '充值余额';
      rechargeEl.addEventListener('click', function () {
        toast('充值功能即将开放');
      });
    }
  }

  /* ---------- 下注 ---------- */
  if (betMinus) betMinus.addEventListener('click', function () {
    if (betIndex > 0) { betIndex--; refreshUI(); }
  });
  if (betPlus) betPlus.addEventListener('click', function () {
    if (betIndex < BET_STEPS.length - 1) { betIndex++; refreshUI(); }
  });

  /* ---------- 旋转（含连锁掉落） ---------- */
  var spinning = false;

  async function runSpin(bet) {
    /* 1) 开始闪烁 */
    var cellEls = boardEl.querySelectorAll('.gp-cell');
    var tick = 0;
    var flashTimer = window.setInterval(function () {
      for (var i = 0; i < cellEls.length; i++) {
        if (rnd() < 0.4) {
          cellEls[i].innerHTML = renderSym(pick());
        }
      }
      tick++;
      if (tick >= 8) window.clearInterval(flashTimer);
    }, 80);
    await sleep(700);

    /* 2) 新盘面 */
    newGrid();
    renderBoard();
    await sleep(200);

    /* 3) 连锁掉落 */
    var totalWin = 0;
    var chain = 0;

    while (true) {
      var wins = findWins();
      if (wins.length === 0) break;

      chain++;
      var winAmount = calcTotalWin(wins, bet);
      totalWin += winAmount;

      var positions = [];
      for (var wi = 0; wi < wins.length; wi++) {
        positions = positions.concat(wins[wi].positions);
      }

      /* 高亮 + 结果栏显示本连锁 */
      renderBoard(positions);
      setResult('第 ' + chain + ' 连 · +' + fmtMoney(winAmount), true);
      lastWin = totalWin;
      refreshUI();
      await sleep(900);

      /* 消除：加 .is-clearing 让中奖格缩放消失 */
      var cellsNow = boardEl.querySelectorAll('.gp-cell');
      for (var pi = 0; pi < positions.length; pi++) {
        var el = cellsNow[positions[pi]];
        if (el) el.classList.add('is-clearing');
      }
      await sleep(320);

      /* 数据层面消除 + 补位 */
      for (var di = 0; di < positions.length; di++) grid[positions[di]] = null;
      dropDown();
      renderBoard();
      await sleep(280);
    }

    /* 4) 结算 */
    if (chain === 0) {
      setResult('未中奖', false);
    } else {
      balance += totalWin;
      lastWin = totalWin;
      refreshUI();
      setResult(chain + ' 连锁 · 总赢 ' + fmtMoney(totalWin), true);
    }

    spinning = false;
  }

  if (spinBtn) spinBtn.addEventListener('click', function () {
    if (spinning) return;
    var bet = BET_STEPS[betIndex];
    if (balance < bet) { toast('余额不足'); return; }

    spinning = true;
    balance -= bet;
    lastWin = 0;
    setResult('');
    refreshUI();

    runSpin(bet).catch(function () { spinning = false; });
  });

  /* ---------- 工具按钮 ---------- */
  if (autoBtn)  autoBtn.addEventListener('click',  function () { toast('自动旋转即将开放'); });
  if (histBtn)  histBtn.addEventListener('click',  function () { toast('游戏记录即将开放'); });
  if (payBtn)   payBtn.addEventListener('click',   function () { toast('赔付表即将开放'); });

  /* ---------- 顶栏 ---------- */
  if (backBtn) backBtn.addEventListener('click', function () {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/game-detail.html?game=' + encodeURIComponent(gameId);
  });
  if (menuBtn)  menuBtn.addEventListener('click',  function () { toast('菜单即将开放'); });

  var soundOn = true;
  if (soundBtn) soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    toast(soundOn ? '音效已开启' : '音效已关闭');
  });

  /* ---------- 真实模式：拉取后端余额 ---------- */
  function loadRealBalance() {
    if (mode !== 'real') return;
    fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d || !res.d.success) {
          toast('未登录，请先登录');
          return;
        }
        var wb = res.d.user && res.d.user.walletBalance;
        balance = (typeof wb === 'number') ? wb : 0;
        refreshUI();
      })
      .catch(function () { toast('余额获取失败'); });
  }

  /* ---------- 初始化 ---------- */
  renderBoard();
  refreshUI();
  loadRealBalance();
})();
