/* Sweet Bonanza · 试玩 / 正式游戏页
   架构：复用 sweet.js 的 window.ApexSweetSymbols
   纯原生 JS · 无框架 · 无 Math.random（用 seeded PRNG） */

(function () {
  'use strict';

  var COLS = 6, ROWS = 5, TOTAL = COLS * ROWS;
  var BETS = [0.2, 0.5, 1, 2, 3, 5, 10, 15, 20, 30, 50, 100];
  var INIT_BALANCE = 10000;
  var SPIN_DELAY = 900;
  var AUTO_INTERVAL = 1400;

  var STORAGE_KEY = 'apex.sweet.history.v1';

  var state = {
    balance: INIT_BALANCE,
    betIndex: 6,
    won: 0,
    spinning: false,
    auto: false,
    autoTimer: 0,
    history: [],
    seed: 0,
    round: 0,
    drawerOpen: false
  };

  /* ── 持久化：加载 / 保存 ── */
  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.slice(-100);
    } catch (e) { return []; }
  }
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history.slice(-100)));
    } catch (e) {}
  }

  var symbolPool = [];
  var grid = [];

  /* ── seeded PRNG ── */
  function prng(n) {
    var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }
  function nextRand() {
    state.seed += 1;
    return prng(state.seed);
  }

  /* ── 工具 ── */
  function fmtMoney(n) {
    return '¥' + Number(n).toFixed(2);
  }
  function parseMult(s) {
    if (!s || s === '—') return 0;
    var m = String(s).replace('×', '').replace('SCATTER', '').replace('WILD', '').trim();
    var v = parseFloat(m);
    return isNaN(v) ? 0 : v;
  }
  function findSpec(id) {
    for (var i = 0; i < symbolPool.length; i++) {
      if (symbolPool[i].id === id) return symbolPool[i];
    }
    return null;
  }

  /* ── Toast ── */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'demo-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 1800);
  }

  /* ── 构建 6×5 网格 ── */
  function buildReels() {
    var wrap = document.getElementById('demo-reels');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (var i = 0; i < TOTAL; i++) {
      var cell = document.createElement('div');
      cell.className = 'demo-cell';
      cell.setAttribute('data-idx', String(i));
      var sym = document.createElement('div');
      sym.className = 'demo-cell__sym';
      cell.appendChild(sym);
      wrap.appendChild(cell);
    }
  }

  /* ── 渲染一个符号到 cell ── */
  function paintCell(idx, spec) {
    var cell = document.querySelector('.demo-cell[data-idx="' + idx + '"]');
    if (!cell) return;
    var holder = cell.querySelector('.demo-cell__sym');
    holder.innerHTML = '';
    var node = window.ApexSweetSymbols.build(spec.id, 40);
    if (node) holder.appendChild(node);
  }

  /* ── 生成一次盘面（60% 概率有主符号 → 中奖） ── */
  function rollGrid() {
    var pool = symbolPool;
    var result = [];
    var main = null;
    if (nextRand() < 0.6) {
      main = pool[Math.floor(nextRand() * pool.length)];
    }
    for (var i = 0; i < TOTAL; i++) {
      if (main && i < 10) result.push(main);
      else result.push(pool[Math.floor(nextRand() * pool.length)]);
    }
    /* Fisher-Yates 洗牌 */
    for (var k = result.length - 1; k > 0; k--) {
      var j = Math.floor(nextRand() * (k + 1));
      var t = result[k]; result[k] = result[j]; result[j] = t;
    }
    return result;
  }

  /* ── 中奖判定（同种 ≥8） ── */
  function calcWin(symbols, bet) {
    var counts = {};
    for (var i = 0; i < symbols.length; i++) {
      var id = symbols[i].id;
      counts[id] = (counts[id] || 0) + 1;
    }
    var total = 0;
    var winIds = [];
    for (var id2 in counts) {
      if (!Object.prototype.hasOwnProperty.call(counts, id2)) continue;
      var c = counts[id2];
      if (c < 8) continue;
      var spec = findSpec(id2);
      if (!spec) continue;
      var multStr = (c <= 9) ? spec.m8 : (c <= 11 ? spec.m10 : spec.m12);
      var mult = parseMult(multStr);
      if (mult > 0) {
        total += mult * bet;
        winIds.push(id2);
      }
    }
    return { total: total, winIds: winIds };
  }

  /* ── 更新 UI ── */
  function updateAll() {
    var bal = document.getElementById('demo-balance');
    var bet = document.getElementById('demo-bet');
    var betDisp = document.getElementById('demo-bet-display');
    var won = document.getElementById('demo-won');
    var winAmt = document.getElementById('demo-win-amount');
    var resetLabel = document.getElementById('demo-reset-label');

    var bv = BETS[state.betIndex];
    if (bal) bal.textContent = fmtMoney(state.balance);
    if (bet) bet.textContent = fmtMoney(bv);
    if (betDisp) betDisp.textContent = fmtMoney(bv);
    if (won) won.textContent = fmtMoney(state.won);
    if (winAmt) winAmt.textContent = fmtMoney(state.won);

    if (resetLabel) {
      resetLabel.textContent = (state.mode === 'play') ? '充值余额' : '重置余额';
    }
  }

  function popWinAmount() {
    var el = document.getElementById('demo-win-amount');
    if (!el) return;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  /* ── 旋转 ── */
  function spin() {
    if (state.spinning) return;
    if (state.balance < BETS[state.betIndex]) {
      toast('余额不足，请重置或降低下注');
      return;
    }
    state.spinning = true;
    var btn = document.getElementById('demo-spin');
    if (btn) btn.disabled = true;

    state.balance -= BETS[state.betIndex];
    state.won = 0;
    updateAll();

    var cells = document.querySelectorAll('.demo-cell');
    for (var i = 0; i < cells.length; i++) cells[i].classList.add('is-spinning');
    for (var j = 0; j < cells.length; j++) cells[j].classList.remove('is-win');

    var newGrid = rollGrid();

    setTimeout(function () {
      grid = newGrid;
      for (var k = 0; k < grid.length; k++) paintCell(k, grid[k]);

      var win = calcWin(grid, BETS[state.betIndex]);
      state.won = win.total;
      state.balance += win.total;

      var winSet = {};
      for (var w = 0; w < win.winIds.length; w++) winSet[win.winIds[w]] = true;

      var cellList = document.querySelectorAll('.demo-cell');
      for (var m = 0; m < cellList.length; m++) {
        cellList[m].classList.remove('is-spinning');
        var idx = parseInt(cellList[m].getAttribute('data-idx'), 10);
        if (winSet[grid[idx].id]) cellList[m].classList.add('is-win');
      }

      updateAll();
      if (win.total > 0) popWinAmount();

      state.round += 1;
      var winDetails = [];
      for (var wi = 0; wi < win.winIds.length; wi++) {
        var wid = win.winIds[wi];
        var ws = findSpec(wid);
        var wc = 0;
        for (var cc = 0; cc < grid.length; cc++) if (grid[cc].id === wid) wc++;
        if (ws) winDetails.push({ id: wid, name: ws.name, count: wc });
      }
      state.history.push({
        round: state.round,
        bet: BETS[state.betIndex],
        won: win.total,
        time: Date.now(),
        details: winDetails
      });
      if (state.history.length > 100) state.history.shift();
      saveHistory();
      if (state.drawerOpen) renderHistory();

      state.spinning = false;
      if (btn) btn.disabled = false;

      /* 自动模式继续 */
      if (state.auto) {
        state.autoTimer = setTimeout(spin, AUTO_INTERVAL);
      }
    }, SPIN_DELAY);
  }

  /* ══════════════ 记录抽屉 ══════════════ */

  function fmtTime(ts) {
    var d = new Date(ts);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
           pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function renderHistory() {
    var body = document.getElementById('demo-drawer-body');
    if (!body) return;
    body.innerHTML = '';

    if (!state.history.length) {
      var empty = document.createElement('div');
      empty.className = 'demo-drawer__empty';
      empty.innerHTML =
        '<div class="demo-drawer__empty-icon">' +
        '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>' +
        '</div>' +
        '<div>暂无对局记录</div>' +
        '<div style="margin-top:6px;font-size:12px;opacity:.6">旋转一次后即可查看</div>';
      body.appendChild(empty);
      return;
    }

    /* 统计摘要 */
    var totalBet = 0, totalWon = 0;
    for (var i = 0; i < state.history.length; i++) {
      totalBet += state.history[i].bet;
      totalWon += state.history[i].won;
    }
    var net = totalWon - totalBet;

    var summary = document.createElement('div');
    summary.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px;';
    summary.innerHTML =
      '<div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);">' +
        '<div style="font-size:10.5px;letter-spacing:.1em;color:rgba(255,255,255,.45);font-weight:700;">总局数</div>' +
        '<div style="font-size:16px;font-weight:800;margin-top:2px;">' + state.history.length + '</div>' +
      '</div>' +
      '<div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);">' +
        '<div style="font-size:10.5px;letter-spacing:.1em;color:rgba(255,255,255,.45);font-weight:700;">累计下注</div>' +
        '<div style="font-size:16px;font-weight:800;margin-top:2px;">' + fmtMoney(totalBet) + '</div>' +
      '</div>' +
      '<div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);">' +
        '<div style="font-size:10.5px;letter-spacing:.1em;color:rgba(255,255,255,.45);font-weight:700;">累计赢得</div>' +
        '<div style="font-size:16px;font-weight:800;margin-top:2px;color:#ffce6b;">' + fmtMoney(totalWon) + '</div>' +
      '</div>' +
      '<div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);">' +
        '<div style="font-size:10.5px;letter-spacing:.1em;color:rgba(255,255,255,.45);font-weight:700;">净收益</div>' +
        '<div style="font-size:16px;font-weight:800;margin-top:2px;color:' + (net >= 0 ? '#7ee0a0' : '#ff8c8c') + ';">' +
          (net >= 0 ? '+' : '') + fmtMoney(net) +
        '</div>' +
      '</div>';
    body.appendChild(summary);

    /* 倒序渲染对局 */
    for (var k = state.history.length - 1; k >= 0; k--) {
      var r = state.history[k];
      var item = document.createElement('div');
      item.className = 'demo-record' + (r.won > 0 ? ' is-win' : '');

      var idx = document.createElement('div');
      idx.className = 'demo-record__idx';
      idx.textContent = '#' + (r.round || (k + 1));

      var meta = document.createElement('div');
      meta.className = 'demo-record__meta';

      var timeEl = document.createElement('div');
      timeEl.className = 'demo-record__time';
      timeEl.textContent = fmtTime(r.time);
      meta.appendChild(timeEl);

      var betEl = document.createElement('div');
      betEl.className = 'demo-record__bet';
      var betText = '下注 ' + fmtMoney(r.bet);
      if (r.details && r.details.length) {
        var names = [];
        for (var di = 0; di < r.details.length; di++) {
          names.push(r.details[di].name + ' ×' + r.details[di].count);
        }
        betText += ' · ' + names.join(' / ');
      }
      betEl.textContent = betText;
      meta.appendChild(betEl);

      var wonEl = document.createElement('div');
      wonEl.className = 'demo-record__won' + (r.won > 0 ? ' is-win' : '');
      wonEl.textContent = (r.won > 0 ? '+' : '') + fmtMoney(r.won);

      item.appendChild(idx);
      item.appendChild(meta);
      item.appendChild(wonEl);
      body.appendChild(item);
    }
  }

  function openDrawer() {
    var mask = document.getElementById('demo-drawer-mask');
    var drawer = document.getElementById('demo-drawer');
    if (!mask || !drawer) return;
    renderHistory();
    state.drawerOpen = true;
    mask.classList.add('is-open');
    drawer.classList.add('is-open');
    mask.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    var mask = document.getElementById('demo-drawer-mask');
    var drawer = document.getElementById('demo-drawer');
    if (!mask || !drawer) return;
    state.drawerOpen = false;
    mask.classList.remove('is-open');
    drawer.classList.remove('is-open');
    mask.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── 事件绑定 ── */
  function bindEvents() {
    var back = document.getElementById('demo-back');
    if (back) back.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'sweet';
    });

    var menu = document.getElementById('demo-menu');
    if (menu) menu.addEventListener('click', function () { toast('菜单即将上线'); });

    var reset = document.getElementById('demo-reset');
    if (reset) reset.addEventListener('click', function () {
      if (state.mode === 'play') {
        toast('充值功能即将接入');
        return;
      }
      state.balance = INIT_BALANCE;
      state.won = 0;
      updateAll();
      toast('余额已重置为 ¥10,000.00');
    });

    var minus = document.getElementById('demo-bet-minus');
    if (minus) minus.addEventListener('click', function () {
      if (state.spinning) return;
      if (state.betIndex > 0) { state.betIndex--; updateAll(); }
    });

    var plus = document.getElementById('demo-bet-plus');
    if (plus) plus.addEventListener('click', function () {
      if (state.spinning) return;
      if (state.betIndex < BETS.length - 1) { state.betIndex++; updateAll(); }
    });

    var spinBtn = document.getElementById('demo-spin');
    if (spinBtn) spinBtn.addEventListener('click', function () {
      if (state.auto) {
        state.auto = false;
        clearTimeout(state.autoTimer);
        toast('已停止');
        return;
      }
      spin();
    });

    var auto = document.getElementById('demo-auto');
    if (auto) auto.addEventListener('click', function () {
      if (state.auto) {
        state.auto = false;
        clearTimeout(state.autoTimer);
        toast('自动旋转已关闭');
        auto.classList.remove('is-on');
        return;
      }
      state.auto = true;
      auto.classList.add('is-on');
      toast('自动旋转已开启');
      spin();
    });

    var hist = document.getElementById('demo-history');
    if (hist) hist.addEventListener('click', function () { openDrawer(); });

    var mask = document.getElementById('demo-drawer-mask');
    if (mask) mask.addEventListener('click', closeDrawer);

    var closeBtn = document.getElementById('demo-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.drawerOpen) closeDrawer();
    });

    var pay = document.getElementById('demo-paytable');
    if (pay) pay.addEventListener('click', function () {
      window.location.href = 'sweet#symbols';
    });
  }

  /* ── URL 参数：?mode=demo / ?mode=play ── */
  function getMode() {
    var m = window.location.search.match(/[?&]mode=([^&]+)/);
    return (m && m[1] === 'play') ? 'play' : 'demo';
  }

  function applyMode() {
    state.mode = getMode();
    var badge = document.getElementById('demo-badge');
    if (badge) {
      badge.textContent = (state.mode === 'play') ? '正式模式' : '试玩模式';
    }
    document.title = '糖果连连爆 · ' + (state.mode === 'play' ? '正式' : '试玩') + ' · Apex';
  }

  /* ── 精确计算 reels 尺寸，保证一屏显示 ── */
  function fitReels() {
    var board = document.querySelector('.demo-board');
    var reels = document.querySelector('.demo-reels');
    if (!board || !reels) return;
    var cs = getComputedStyle(board);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var availW = board.clientWidth - padX;
    var availH = board.clientHeight - padY;
    if (availW <= 0 || availH <= 0) return;
    var ratio = 6 / 5;
    var w = Math.min(availW, availH * ratio);
    var h = w / ratio;
    reels.style.width = w.toFixed(1) + 'px';
    reels.style.height = h.toFixed(1) + 'px';
  }

  /* ── 初始化 ── */
  function init() {
    if (!window.ApexSweetSymbols || !window.ApexSweetSymbols.list) {
      console.error('[demo] ApexSweetSymbols 未加载');
      return;
    }
    symbolPool = window.ApexSweetSymbols.list.filter(function (s) {
      return s.type === 'base' || s.type === 'high';
    });
    state.mode = getMode();
    state.history = loadHistory();
    state.round = state.history.length;
    applyMode();
    buildReels();

    /* 初始盘面 */
    grid = rollGrid();
    for (var i = 0; i < grid.length; i++) paintCell(i, grid[i]);

    bindEvents();
    updateAll();

    fitReels();
    requestAnimationFrame(fitReels);
    window.addEventListener('resize', fitReels);
    window.addEventListener('orientationchange', function () {
      setTimeout(fitReels, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
