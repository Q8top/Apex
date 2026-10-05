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
    drawerOpen: false,
    freeSpins: 0
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
  /* ── 由 RTP 引擎驱动的盘面生成 ──
     返回 { grid, decision }
     保证 rollGrid 结果与 calcWin 一致：
       isWin=true → 一定有符号组 ≥8
       isWin=false → 所有符号组 ≤7 */
  function rollGrid() {
    var pool = symbolPool;
    var basePool = [], highPool = [], i;
    for (i = 0; i < pool.length; i++) {
      if (pool[i].type === 'base') basePool.push(pool[i]);
      else if (pool[i].type === 'high') highPool.push(pool[i]);
    }

    var rtp = window.ApexSweetRTP;
    var decision = rtp ? rtp.decide(state.mode) : { isWin: nextRand() < 0.6, level: null, hasScatter: false };

    var result = new Array(TOTAL);
    var used = 0;

    /* ── 决定主符号组 ── */
    var mainSpec = null;
    var mainCount = 0;

    if (decision.isWin && decision.level) {
      var lv = decision.level;
      var sourcePool = (lv.tier === 'high') ? highPool : basePool;
      if (sourcePool.length === 0) sourcePool = pool;
      mainSpec = sourcePool[Math.floor(nextRand() * sourcePool.length)];
      mainCount = lv.count[0] + Math.floor(nextRand() * (lv.count[1] - lv.count[0] + 1));
      if (mainCount > TOTAL) mainCount = TOTAL;
    } else {
      /* 未中奖：挑一个符号最多放 7 个（不触线），剩下随机 */
      mainSpec = pool[Math.floor(nextRand() * pool.length)];
      mainCount = 0;
    }

    /* ── 铺主符号 ── */
    for (i = 0; i < mainCount; i++) { result[i] = mainSpec; used++; }

    /* ── 未中奖模式：再铺一些同符号，但不超过 7 ── */
    if (!decision.isWin) {
      var fillerCount = 4 + Math.floor(nextRand() * 4); /* 4~7 */
      for (i = 0; i < fillerCount && used < TOTAL; i++) {
        result[used++] = mainSpec;
      }
    }

    /* ── 剩余格子：随机填，避开让任何符号 ≥8 ── */
    var counts = {};
    for (i = 0; i < used; i++) {
      counts[result[i].id] = (counts[result[i].id] || 0) + 1;
    }
    var safety = 0;
    while (used < TOTAL && safety < 500) {
      safety++;
      var cand = pool[Math.floor(nextRand() * pool.length)];
      if (!decision.isWin && (counts[cand.id] || 0) >= 7) continue;
      result[used++] = cand;
      counts[cand.id] = (counts[cand.id] || 0) + 1;
    }
    /* 兜底：万一还有剩余，强填 */
    while (used < TOTAL) {
      result[used++] = pool[Math.floor(nextRand() * pool.length)];
    }

    /* ── 洗牌 ── */
    for (var k = result.length - 1; k > 0; k--) {
      var j = Math.floor(nextRand() * (k + 1));
      var t = result[k]; result[k] = result[j]; result[j] = t;
    }

    /* ── Scatter 处理（免费旋转触发） ── */
    if (decision.hasScatter) {
      var scatterSpec = findSpec('lolli');
      if (scatterSpec) {
        var scCount = 4 + Math.floor(nextRand() * 3); /* 4~6 */
        var placed = 0, tries = 0;
        while (placed < scCount && tries < 60) {
          tries++;
          var pos = Math.floor(nextRand() * TOTAL);
          if (result[pos].id !== 'lolli') {
            result[pos] = scatterSpec;
            placed++;
          }
        }
      }
    }

    return { grid: result, decision: decision };
  }

  /* ── 中奖判定（同种 ≥8） ──
     返回 { total, winIds, tier, maxCount, scatterCount } */
  function calcWin(symbols, bet) {
    var counts = {};
    for (var i = 0; i < symbols.length; i++) {
      var id = symbols[i].id;
      counts[id] = (counts[id] || 0) + 1;
    }
    var total = 0;
    var winIds = [];
    var maxCount = 0;
    var scatterCount = counts['lolli'] || 0;

    for (var id2 in counts) {
      if (!Object.prototype.hasOwnProperty.call(counts, id2)) continue;
      var c = counts[id2];
      if (id2 === 'lolli' || id2 === 'wild') continue;
      if (c < 8) continue;
      var spec = findSpec(id2);
      if (!spec) continue;
      var multStr = (c <= 9) ? spec.m8 : (c <= 11 ? spec.m10 : spec.m12);
      var mult = parseMult(multStr);
      if (mult > 0) {
        total += mult * bet;
        winIds.push(id2);
        if (c > maxCount) maxCount = c;
      }
    }

    /* 中奖等级（用于触发大额中奖特效） */
    var ratio = bet > 0 ? (total / bet) : 0;
    var tier = 'none';
    if (ratio > 0 && ratio < 10) tier = 'small';
    else if (ratio < 30) tier = 'nice';
    else if (ratio < 60) tier = 'big';
    else if (ratio < 150) tier = 'mega';
    else if (ratio >= 150) tier = 'epic';

    return {
      total: total,
      winIds: winIds,
      tier: tier,
      ratio: ratio,
      maxCount: maxCount,
      scatterCount: scatterCount
    };
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
  function spin(isFree) {
    if (state.spinning) return;
    if (!isFree && state.balance < BETS[state.betIndex]) {
      toast('余额不足，请重置或降低下注');
      return;
    }
    state.spinning = true;
    var btn = document.getElementById('demo-spin');
    if (btn) btn.disabled = true;

    if (!isFree) {
      state.balance -= BETS[state.betIndex];
    }
    state.won = 0;
    updateAll();

    var cells = document.querySelectorAll('.demo-cell');
    for (var i = 0; i < cells.length; i++) cells[i].classList.add('is-spinning');
    for (var j = 0; j < cells.length; j++) cells[j].classList.remove('is-win');

    var rolled = rollGrid();
    var newGrid = rolled.grid;
    var decision = rolled.decision;

    setTimeout(function () {
      grid = newGrid;
      for (var k = 0; k < grid.length; k++) paintCell(k, grid[k]);

      var win = calcWin(grid, BETS[state.betIndex]);

      /* 免费旋转倍数累加（简化：若免费旋转期间触发，则乘 1.5） */
      if (isFree && win.total > 0) {
        win.total = win.total * 1.5;
      }

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

      /* ── 反馈：音效 + 震动 + 大额中奖提示 ── */
      playSpinFeedback(win);

      /* ── RTP 记录 ── */
      var rtp = window.ApexSweetRTP;
      if (rtp && !isFree) rtp.record(state.mode, BETS[state.betIndex], win.total);

      /* ── 免费旋转触发检测 ── */
      var scatterCount = win.scatterCount;
      var freeAwarded = 0;
      if (scatterCount >= 6) freeAwarded = 15;
      else if (scatterCount === 5) freeAwarded = 12;
      else if (scatterCount === 4) freeAwarded = 10;

      if (freeAwarded > 0 && !isFree) {
        state.freeSpins = freeAwarded;
        updateFreeSpinUI();
        toast('🎉 触发 ' + freeAwarded + ' 次免费旋转！');
      }

      /* ── 历史记录 ── */
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
        free: !!isFree,
        details: winDetails
      });
      if (state.history.length > 100) state.history.shift();
      saveHistory();
      if (state.drawerOpen) renderHistory();

      state.spinning = false;
      if (btn) btn.disabled = false;

      /* ── 免费旋转：自动续转 ── */
      if (freeAwarded > 0 && !isFree) {
        setTimeout(function () {
          for (var fi = 0; fi < freeAwarded; fi++) {
            (function (round) {
              setTimeout(function () {
                state.freeSpins = freeAwarded - round - 1;
                updateFreeSpinUI();
                spin(true);
              }, round * 1600);
            })(fi);
          }
        }, 800);
        return;
      }

      /* ── 自动模式 ── */
      if (state.auto && state.freeSpins <= 0) {
        state.autoTimer = setTimeout(spin, AUTO_INTERVAL);
      }
    }, SPIN_DELAY);
  }

  /* ── 音效 + 震动 + 大额中奖 ── */
  function playSpinFeedback(win) {
    /* 震动 */
    if (navigator.vibrate) {
      if (win.tier === 'epic' || win.tier === 'mega') {
        navigator.vibrate([60, 40, 60, 40, 120]);
      } else if (win.total > 0) {
        navigator.vibrate(35);
      }
    }
    /* 音效（Web Audio 合成，无素材依赖） */
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window.__apexCtx) window.__apexCtx = new AC();
      var ctx = window.__apexCtx;
      if (ctx.state === 'suspended') ctx.resume();
      var now = ctx.currentTime;
      if (win.total > 0) {
        var freqs = win.tier === 'epic' ? [523, 659, 784, 1047] : [660, 880];
        for (var i = 0; i < freqs.length; i++) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freqs[i];
          g.gain.setValueAtTime(0.0001, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.14, now + i * 0.08 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.22);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.25);
        }
      }
    } catch (e) {}

    /* 大额中奖提示 */
    var tierLabels = {
      nice: '不错！', big: '大额中奖！', mega: '超大奖！', epic: '惊天巨奖！'
    };
    if (tierLabels[win.tier]) {
      showBigWin(win.tier, tierLabels[win.tier], win.total);
    }
  }

  function showBigWin(tier, label, amount) {
    var el = document.getElementById('demo-bigwin');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-bigwin';
      el.className = 'demo-bigwin';
      document.body.appendChild(el);
    }
    el.className = 'demo-bigwin is-show demo-bigwin--' + tier;
    el.innerHTML =
      '<div class="demo-bigwin__label">' + label + '</div>' +
      '<div class="demo-bigwin__amount">' + fmtMoney(amount) + '</div>';
    setTimeout(function () { el.classList.remove('is-show'); }, 1800);
  }

  function updateFreeSpinUI() {
    var el = document.getElementById('demo-freespins');
    if (!el) return;
    if (state.freeSpins > 0) {
      el.classList.add('is-show');
      el.textContent = '免费旋转 ×' + state.freeSpins;
    } else {
      el.classList.remove('is-show');
    }
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

  /* ══════════════ 赔付表抽屉 ══════════════ */

  var paytableTab = 'base';   // base / high / special

  function renderPaytable() {
    var body = document.getElementById('paytable-body');
    if (!body) return;
    body.innerHTML = '';

    /* ── Tabs ── */
    var tabs = document.createElement('div');
    tabs.className = 'paytable-tabs';
    var tabDefs = [
      { key: 'base',    label: '基础符号' },
      { key: 'high',    label: '高级符号' },
      { key: 'special', label: '特殊符号' }
    ];
    for (var ti = 0; ti < tabDefs.length; ti++) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'paytable-tab' + (paytableTab === tabDefs[ti].key ? ' is-active' : '');
      t.textContent = tabDefs[ti].label;
      t.setAttribute('data-key', tabDefs[ti].key);
      t.addEventListener('click', (function (key) {
        return function () { paytableTab = key; renderPaytable(); };
      })(tabDefs[ti].key));
      tabs.appendChild(t);
    }
    body.appendChild(tabs);

    /* ── 从 symbolPool 拿数据 ── */
    var all = window.ApexSweetSymbols ? window.ApexSweetSymbols.list : [];
    var list = [];
    for (var i = 0; i < all.length; i++) {
      if (paytableTab === 'base' && all[i].type === 'base') list.push(all[i]);
      else if (paytableTab === 'high' && all[i].type === 'high') list.push(all[i]);
      else if (paytableTab === 'special' && (all[i].type === 'scatter' || all[i].type === 'wild')) list.push(all[i]);
    }

    /* ── 表头 ── */
    var table = document.createElement('table');
    table.className = 'paytable-table';

    if (paytableTab === 'special') {
      /* 特殊符号：2 列（符号 / 作用） */
      var thead = document.createElement('thead');
      var trh = document.createElement('tr');
      var th1 = document.createElement('th'); th1.textContent = '符号';    trh.appendChild(th1);
      var th2 = document.createElement('th'); th2.textContent = '作用';    trh.appendChild(th2);
      thead.appendChild(trh);
      table.appendChild(thead);

      var tb = document.createElement('tbody');
      for (var si = 0; si < list.length; si++) {
        var spec = list[si];
        var tr = document.createElement('tr');

        /* 符号列 */
        var tdA = document.createElement('td');
        var cell = document.createElement('div');
        cell.className = 'paytable-sym';
        var art = document.createElement('div');
        art.className = 'paytable-sym__art';
        var node = window.ApexSweetSymbols.build(spec.id, 30);
        if (node) art.appendChild(node);
        cell.appendChild(art);
        var nm = document.createElement('span');
        nm.className = 'paytable-sym__name';
        nm.textContent = spec.name;
        cell.appendChild(nm);
        tdA.appendChild(cell);
        tr.appendChild(tdA);

        /* 作用列 */
        var tdB = document.createElement('td');
        var badge = document.createElement('span');
        badge.className = 'paytable-mult paytable-mult--special';
        if (spec.type === 'scatter') {
          badge.textContent = '触发免费旋转';
          badge.style.display = 'inline-block';
        } else {
          badge.textContent = '替代任意符号';
        }
        tdB.appendChild(badge);
        tr.appendChild(tdB);

        tb.appendChild(tr);
      }
      table.appendChild(tb);

      /* 说明 */
      var note = document.createElement('div');
      note.className = 'paytable-note';
      note.innerHTML =
        '<strong>SCATTER（棒棒糖）</strong>：集齐 <strong>4 个</strong> 触发 <strong>10 次</strong>免费旋转；5 个触发 12 次；6 个触发 15 次。<br>' +
        '<strong>WILD（彩虹糖）</strong>：可替代任意基础或高级符号参与结算，但不会替代 Scatter。<br>' +
        '<strong>免费旋转期间</strong>：场上的糖果炸弹倍数会累加至本轮总奖金，单个炸弹倍数 ×2 ~ ×100。';
      body.appendChild(table);
      body.appendChild(note);
      return;
    }

    /* ── 基础 / 高级：4 列（符号 / 8~9 / 10~11 / 12+） ── */
    var thead2 = document.createElement('thead');
    var trh2 = document.createElement('tr');
    var thA = document.createElement('th'); thA.textContent = '符号';   trh2.appendChild(thA);
    var thB = document.createElement('th'); thB.textContent = '8~9';     trh2.appendChild(thB);
    var thC = document.createElement('th'); thC.textContent = '10~11';   trh2.appendChild(thC);
    var thD = document.createElement('th'); thD.textContent = '12+';     trh2.appendChild(thD);
    thead2.appendChild(trh2);
    table.appendChild(thead2);

    var tb2 = document.createElement('tbody');
    for (var li = 0; li < list.length; li++) {
      var sp = list[li];
      var tr2 = document.createElement('tr');

      /* 符号列 */
      var td1 = document.createElement('td');
      var cell2 = document.createElement('div');
      cell2.className = 'paytable-sym';
      var art2 = document.createElement('div');
      art2.className = 'paytable-sym__art';
      var node2 = window.ApexSweetSymbols.build(sp.id, 30);
      if (node2) art2.appendChild(node2);
      cell2.appendChild(art2);
      var nm2 = document.createElement('span');
      nm2.className = 'paytable-sym__name';
      nm2.textContent = sp.name;
      cell2.appendChild(nm2);
      td1.appendChild(cell2);
      tr2.appendChild(td1);

      /* 三档倍率 */
      var vals = [sp.m8, sp.m10, sp.m12];
      for (var vi = 0; vi < vals.length; vi++) {
        var td = document.createElement('td');
        var badge2 = document.createElement('span');
        badge2.className = 'paytable-mult';
        badge2.textContent = vals[vi];
        td.appendChild(badge2);
        tr2.appendChild(td);
      }

      tb2.appendChild(tr2);
    }
    table.appendChild(tb2);
    body.appendChild(table);

    /* 规则说明 */
    var note2 = document.createElement('div');
    note2.className = 'paytable-note';
    note2.innerHTML =
      '同一种符号在网格任意位置出现 <strong>8 个及以上</strong>即中奖，不受行列连线限制。<br>' +
      '倍率按 <strong>下注额</strong> 计算：例如 ×5 表示赢得 <strong>下注 × 5</strong>。<br>' +
      '多个符号组合同一局可同时结算，赔付独立叠加。';
    body.appendChild(note2);
  }

  function openPaytable() {
    var mask = document.getElementById('paytable-mask');
    var drawer = document.getElementById('paytable-drawer');
    if (!mask || !drawer) return;
    renderPaytable();
    state.paytableOpen = true;
    mask.classList.add('is-open');
    drawer.classList.add('is-open');
    mask.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePaytable() {
    var mask = document.getElementById('paytable-mask');
    var drawer = document.getElementById('paytable-drawer');
    if (!mask || !drawer) return;
    state.paytableOpen = false;
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
      if (e.key !== 'Escape') return;
      if (state.drawerOpen) closeDrawer();
      if (state.paytableOpen) closePaytable();
    });

    var pay = document.getElementById('demo-paytable');
    if (pay) pay.addEventListener('click', function () { openPaytable(); });

    var payMask = document.getElementById('paytable-mask');
    if (payMask) payMask.addEventListener('click', closePaytable);

    var payClose = document.getElementById('paytable-close');
    if (payClose) payClose.addEventListener('click', closePaytable);
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
