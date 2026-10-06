/* Sweet Bonanza - Demo game page
   Architecture: EngineAdapter (Phase 1 MathEngine) + sweet.js visuals
   Native ES Module. Math comes only from engine. */

import { createEngineAdapter } from './ui/engine-adapter.js';

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
    round: 0,
    drawerOpen: false,
    freeSpins: 0,
    adapter: null
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

  var grid = [];

  /* ── seeded PRNG ── */
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
  function paintCell(idx, symbolId) {
    var cell = document.querySelector('.demo-cell[data-idx="' + idx + '"]');
    if (!cell) return;
    var holder = cell.querySelector('.demo-cell__sym');
    holder.innerHTML = '';
    if (!symbolId) return;
    var node = window.ApexSweetSymbols.build(symbolId, 40);
    if (node) holder.appendChild(node);
  }

  /* ── 生成一次盘面（60% 概率有主符号 → 中奖） ── */
  /* ── 由 RTP 引擎驱动的盘面生成 ──
     返回 { grid, decision }
     保证 rollGrid 结果与 calcWin 一致：
       isWin=true → 一定有符号组 ≥8
       isWin=false → 所有符号组 ≤7 */
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
    if (!state.adapter) {
      toast('引擎未就绪');
      return;
    }
    var betAmount = BETS[state.betIndex];
    if (state.balance < betAmount) {
      toast('余额不足，请重置或降低下注');
      return;
    }
    state.spinning = true;
    var btn = document.getElementById('demo-spin');
    if (btn) btn.disabled = true;

    state.balance -= betAmount;
    state.won = 0;
    updateAll();

    var cells = document.querySelectorAll('.demo-cell');
    for (var i = 0; i < cells.length; i++) cells[i].classList.add('is-spinning');
    for (var j = 0; j < cells.length; j++) cells[j].classList.remove('is-win');

    var result;
    try {
      result = state.adapter.playSpin(betAmount);
    } catch (e) {
      console.error('[spin] adapter error', e);
      toast('计算失败，请重试');
      state.spinning = false;
      if (btn) btn.disabled = false;
      for (var k = 0; k < cells.length; k++) cells[k].classList.remove('is-spinning');
      return;
    }
    var view = result.view;

    setTimeout(function () {
      state.won = view.totalWin;
      state.balance += view.totalWin;

      var flatGrid = [];
      for (var r = 0; r < view.grid.length; r++) {
        for (var c = 0; c < view.grid[r].length; c++) {
          flatGrid.push(view.grid[r][c]);
        }
      }
      for (var m = 0; m < flatGrid.length; m++) {
        paintCell(m, flatGrid[m]);
      }

      var winSet = {};
      for (var w = 0; w < view.winIds.length; w++) winSet[view.winIds[w]] = true;

      var cellList = document.querySelectorAll('.demo-cell');
      for (var p = 0; p < cellList.length; p++) {
        cellList[p].classList.remove('is-spinning');
        var idx = parseInt(cellList[p].getAttribute('data-idx'), 10);
        if (winSet[flatGrid[idx]]) cellList[p].classList.add('is-win');
      }

      updateAll();
      if (view.totalWin > 0) popWinAmount();

      playSpinFeedback(view);

      if (view.freeSpinsAwarded > 0) {
        state.freeSpins = view.freeSpinsAwarded;
        updateFreeSpinUI();
        toast('触发 ' + view.freeSpinsAwarded + ' 次免费旋转');
      }

      state.round += 1;
      var winDetails = [];
      for (var ti = 0; ti < view.tumbleSteps.length; ti++) {
        var ts = view.tumbleSteps[ti];
        for (var si = 0; si < ts.winIds.length; si++) {
          winDetails.push({ id: ts.winIds[si], count: 0 });
        }
      }
      state.history.push({
        round: state.round,
        bet: betAmount,
        won: view.totalWin,
        time: Date.now(),
        free: view.freeSpinsAwarded > 0,
        details: winDetails
      });
      if (state.history.length > 100) state.history.shift();
      saveHistory();
      if (state.drawerOpen) renderHistory();

      state.spinning = false;
      if (btn) btn.disabled = false;

      if (state.auto && state.freeSpins <= 0) {
        state.autoTimer = setTimeout(spin, AUTO_INTERVAL);
      }
    }, SPIN_DELAY);
  }

  /* ── 音频上下文：必须在用户手势中创建 ── */
  function ensureAudio() {
    if (window.__apexCtx) {
      if (window.__apexCtx.state === 'suspended') {
        window.__apexCtx.resume().catch(function(){});
      }
      return window.__apexCtx;
    }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      window.__apexCtx = new AC();
      /* 播放一个静音启动，解锁上下文 */
      var buf = window.__apexCtx.createBuffer(1, 1, 22050);
      var src = window.__apexCtx.createBufferSource();
      src.buffer = buf;
      src.connect(window.__apexCtx.destination);
      if (src.start) src.start(0);
    } catch (e) {}
    return window.__apexCtx;
  }

  /* ── 音效 + 震动 + 大额中奖 ── */
  function playSpinFeedback(view) {
    /* 震动 */
    if (navigator.vibrate) {
      if (view.tier === 'epic' || view.tier === 'mega') {
        navigator.vibrate([60, 40, 60, 40, 120]);
      } else if (view.totalWin > 0) {
        navigator.vibrate(35);
      }
    }
    /* 音效（Web Audio 合成，无素材依赖） */
    try {
      var ctx = window.__apexCtx;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(function(){});
      var now = ctx.currentTime;
      if (view.totalWin > 0) {
        var freqs = view.tier === 'epic' ? [523, 659, 784, 1047] : [660, 880];
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
    if (tierLabels[view.tier]) {
      showBigWin(view.tier, tierLabels[view.tier], view.totalWin);
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
      ensureAudio();
      if (state.auto) {
        state.auto = false;
        clearTimeout(state.autoTimer);
        toast('已停止');
        return;
      }
      spin();
    });

    /* 任意点击首次也解锁音频（兜底） */
    document.addEventListener('pointerdown', function once() {
      ensureAudio();
      document.removeEventListener('pointerdown', once);
    }, { once: true });

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
  async function init() {
    if (!window.ApexSweetSymbols || !window.ApexSweetSymbols.list) {
      console.error('[demo] ApexSweetSymbols 未加载');
      showFatal('符号系统未加载');
      return;
    }

    var config;
    try {
      var resp = await fetch('/config/game.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      config = await resp.json();
    } catch (e) {
      console.error('[demo] config 加载失败:', e);
      showFatal('配置加载失败');
      return;
    }

    if (!config.game || !config.symbols || !config.modes) {
      showFatal('配置结构异常');
      return;
    }

    state.mode = getMode();
    try {
      state.adapter = createEngineAdapter(config, { mode: state.mode });
    } catch (e) {
      console.error('[demo] Adapter 创建失败:', e);
      showFatal('引擎初始化失败');
      return;
    }

    state.history = loadHistory();
    state.round = state.history.length;
    applyMode();
    buildReels();

    var previewGrid = state.adapter.previewGrid();
    var flat = [];
    for (var r = 0; r < previewGrid.length; r++) {
      for (var c = 0; c < previewGrid[r].length; c++) {
        flat.push(previewGrid[r][c]);
      }
    }
    for (var i = 0; i < flat.length; i++) paintCell(i, flat[i]);

    bindEvents();
    updateAll();

    fitReels();
    requestAnimationFrame(fitReels);
    window.addEventListener('resize', fitReels);
    window.addEventListener('orientationchange', function () {
      setTimeout(fitReels, 100);
    });
  }

  function showFatal(msg) {
    var winEl = document.getElementById('demo-win-amount');
    if (winEl) {
      winEl.textContent = '初始化失败: ' + msg;
      winEl.style.color = '#ff6b6b';
    }
    var btn = document.getElementById('demo-spin');
    if (btn) btn.disabled = true;
    console.error('[fatal]', msg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
