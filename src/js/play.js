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
  var buyFsBtn   = document.getElementById('gpBuyFs');
  var buyFsText  = document.getElementById('gpBuyFsText');
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
  var fsTotal = 0;
  var hypeCount = 0;
  var HYPE_MAX = 15;
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
  var turboOn = false;
  function sleep(ms) {
    var t = turboOn ? Math.max(40, Math.round(ms * 0.4)) : ms;
    return new Promise(function (r) { setTimeout(r, t); });
  }


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

  function openAchSheet() {
    var unlockedCount = 0;
    for (var k in achUnlocked) if (achUnlocked.hasOwnProperty(k)) unlockedCount++;
    var html = '<div class="gp-ach-head"><span>已解锁</span><strong>' + unlockedCount + ' / ' + ACHIEVEMENTS.length + '</strong></div>';
    html += '<div class="gp-ach-list">';
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      var on = !!achUnlocked[a.id];
      html += '<div class="gp-ach-item' + (on ? ' is-on' : '') + '">' +
                '<span class="gp-ach-icon">' + a.icon + '</span>' +
                '<div class="gp-ach-body">' +
                  '<div class="gp-ach-name">' + a.name + '</div>' +
                  '<div class="gp-ach-desc">' + a.desc + '</div>' +
                '</div>' +
                '<span class="gp-ach-badge">' + (on ? '已解锁' : '未解锁') + '</span>' +
              '</div>';
    }
    html += '</div>';
    openSheet('成就', html);
  }

  function openThemeSheet() {
    var themes = [
      { id: 'light',  name: '浅色',  sw: 'sw-light'  },
      { id: 'dark',   name: '深色',  sw: 'sw-dark'   },
      { id: 'royal',  name: '紫金',  sw: 'sw-royal'  }
    ];
    var html = '<div class="gp-theme-grid">';
    for (var i = 0; i < themes.length; i++) {
      var t = themes[i];
      var cls = 'gp-theme-opt' + (themeName === t.id ? ' is-active' : '');
      html += '<button type="button" class="' + cls + '" data-theme-id="' + t.id + '">' +
                '<span class="gp-theme-swatch ' + t.sw + '"></span>' +
                '<span>' + t.name + '</span>' +
              '</button>';
    }
    html += '</div>';
    html += '<p class="gp-paynote" style="margin-top:12px">主题仅影响本机显示，不会改变游戏数值。</p>';
    openSheet('主题', html);

    sheetBody.querySelectorAll('.gp-theme-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-theme-id');
        applyTheme(id);
        savePref();
        /* 更新选中状态 */
        sheetBody.querySelectorAll('.gp-theme-opt').forEach(function (x) {
          x.classList.toggle('is-active', x === b);
        });
        toast('主题已切换为「' + (id === 'light' ? '浅色' : id === 'dark' ? '深色' : '紫金') + '」');
      });
    });
  }

  function applyTheme(name) {
    if (!page) return;
    if (name !== 'light' && name !== 'dark' && name !== 'royal') name = 'light';
    themeName = name;
    if (name === 'light') page.removeAttribute('data-theme');
    else page.setAttribute('data-theme', name);
  }

  var srEl = document.getElementById('gpSrOnly');
  var _lastAnnounce = '';
  function announce(msg) {
    if (!srEl || !msg || msg === _lastAnnounce) return;
    _lastAnnounce = msg;
    srEl.textContent = '';
    setTimeout(function () { srEl.textContent = msg; }, 30);
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
      /* 焦点移入抽屉（优先第一个按钮） */
      var first = sheetBody.querySelector('button, a, [tabindex]');
      if (first && first.focus) first.focus();
      else if (sheetTitle && sheetTitle.focus) {
        sheetTitle.setAttribute('tabindex', '-1');
        sheetTitle.focus();
      }
    });
  }
  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.classList.remove('is-open');
    sheetEl.setAttribute('aria-hidden', 'true');
    setTimeout(function () { sheetEl.hidden = true; }, 300);
    if (document.activeElement && sheetEl.contains(document.activeElement)) {
      if (menuBtn && menuBtn.focus) menuBtn.focus();
    }
  }
  if (sheetBd) sheetBd.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSheet();
  });

  /* ---------- 成就系统 ---------- */
  var ACH_KEY = 'apex.ach.' + gameId;
  var ACHIEVEMENTS = [
    { id: 'first_win',   icon: '🏆', name: '首次中奖',     desc: '第一次赢得任何金额' },
    { id: 'first_fs',    icon: '⚡', name: '神迹降临',     desc: '首次触发免费旋转' },
    { id: 'chain3',      icon: '🔥', name: '三连击',       desc: '单局达成 3 次连锁' },
    { id: 'chain5',      icon: '💫', name: '五连击',       desc: '单局达成 5 次连锁' },
    { id: 'win10',       icon: '⭐', name: '小有所得',     desc: '单局中奖达到 10 倍注额' },
    { id: 'win30',       icon: '🌟', name: 'BIG WIN',      desc: '单局中奖达到 30 倍注额' },
    { id: 'win100',      icon: '👑', name: 'MEGA WIN',     desc: '单局中奖达到 100 倍注额' },
    { id: 'buy_fs',      icon: '🎁', name: '大方买下',     desc: '购买过 1 次免费旋转' },
    { id: 'hype_5',      icon: '💜', name: '幸运收集',     desc: '触发 5 次幸运一击' },
    { id: 'chain10',     icon: '🚀', name: '十连传奇',     desc: '单局达成 10 次连锁' }
  ];
  var achProgress = {};
  var achUnlocked = {};
  function loadAch() {
    try {
      var raw = localStorage.getItem(ACH_KEY);
      if (raw) {
        var j = JSON.parse(raw);
        achProgress = j.progress || {};
        achUnlocked = j.unlocked || {};
      }
    } catch (e) {}
  }
  function saveAch() {
    try { localStorage.setItem(ACH_KEY, JSON.stringify({ progress: achProgress, unlocked: achUnlocked })); } catch (e) {}
  }
  function unlockAch(id) {
    if (achUnlocked[id]) return;
    achUnlocked[id] = Date.now();
    saveAch();
    var ach = null;
    for (var i = 0; i < ACHIEVEMENTS.length; i++) if (ACHIEVEMENTS[i].id === id) { ach = ACHIEVEMENTS[i]; break; }
    if (ach) {
      toast('🏆 解锁成就 · ' + ach.name);
      if (window.ApexAudio) window.ApexAudio.play('fsTrigger');
      if (navigator.vibrate) { try { navigator.vibrate([40, 30, 80]); } catch (e) {} }
    }
  }
  function tickAch(id, value, threshold) {
    if (achUnlocked[id]) return;
    if (value >= threshold) unlockAch(id);
  }

  /* ---------- 用户偏好本地化 ---------- */
  var PREF_KEY = 'apex.pref';
  function loadPref() {
    try {
      var raw = localStorage.getItem(PREF_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function savePref() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        betIndex: betIndex,
        sound:    soundOn,
        vibe:     vibeOn,
        turbo:    turboOn,
        bgm:      bgmOn,
        lowperf:  lowPerf,
        theme:    themeName
      }));
    } catch (e) {}
  }

  /* ---------- 全局统计（localStorage 持久化） ---------- */
  var STATS_KEY = 'apex.stats.' + gameId;
  function loadStats() {
    try {
      var raw = localStorage.getItem(STATS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { rounds: 0, totalBet: 0, totalWin: 0, bestWin: 0, bestMult: 0, bestChain: 0, fsCount: 0 };
  }
  function saveStats(st) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(st)); } catch (e) {}
  }
  var stats = loadStats();
  function recordStats(entry) {
    stats.rounds++;
    stats.totalBet += entry.bet || 0;
    stats.totalWin += entry.win || 0;
    if ((entry.win || 0) > stats.bestWin) stats.bestWin = entry.win || 0;
    if ((entry.mult || 0) > stats.bestMult) stats.bestMult = entry.mult || 0;
    if ((entry.chain || 0) > stats.bestChain) stats.bestChain = entry.chain || 0;
    if (entry.fs) stats.fsCount++;
    saveStats(stats);
  }
  function renderStatsHTML() {
    var net = stats.totalWin - stats.totalBet;
    function row(k, v, cls) {
      return '<div class="gp-stat-cell"><span>' + k + '</span><strong class="' + (cls || '') + '">' + v + '</strong></div>';
    }
    var h = '<div class="gp-stats-grid">';
    h += row('总局数',     stats.rounds);
    h += row('总下注',     fmtMoney(stats.totalBet));
    h += row('总赢',       fmtMoney(stats.totalWin));
    h += row('净收益',     (net >= 0 ? '+' : '') + fmtMoney(net), net >= 0 ? 'is-win' : 'is-lose');
    h += row('最高单局赢', stats.bestWin > 0 ? fmtMoney(stats.bestWin) : '—', stats.bestWin > 0 ? 'is-win' : '');
    h += row('最高倍率',   stats.bestMult > 0 ? 'x' + stats.bestMult : '—');
    h += row('最高连锁',   stats.bestChain > 0 ? stats.bestChain + ' 连' : '—');
    h += row('免费旋转',   stats.fsCount + ' 次');
    h += '</div>';
    h += '<button type="button" class="gp-hist-clear" id="gpStatsReset">清空统计</button>';
    return h;
  }

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
    exitIdle();
    resetIdleTimer();
    /* 重建 / 清空连线层 */
    var svg = document.getElementById('gpLinks');
    if (!svg) {
      svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'gp-links');
      svg.setAttribute('id', 'gpLinks');
      svg.setAttribute('preserveAspectRatio', 'none');
      boardEl.appendChild(svg);
    } else {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    }
    if (hasWin && !lowPerf) drawWinLinks(hl);
  }

  /* ---------- 中奖连线（相邻对连金线） ---------- */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function drawWinLinks(positions) {
    var svg = document.getElementById('gpLinks');
    if (!svg || !positions || positions.length < 2) return;
    var boardRect = boardEl.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + boardRect.width + ' ' + boardRect.height);
    var cells = boardEl.querySelectorAll('.gp-cell');
    var centers = {};
    for (var i = 0; i < positions.length; i++) {
      var el = cells[positions[i]];
      if (!el) continue;
      var r = el.getBoundingClientRect();
      centers[positions[i]] = {
        x: r.left + r.width / 2 - boardRect.left,
        y: r.top + r.height / 2 - boardRect.top
      };
    }
    for (var a = 0; a < positions.length; a++) {
      for (var b = a + 1; b < positions.length; b++) {
        var pa = positions[a], pb = positions[b];
        var ar = (pa / COLS) | 0, ac = pa % COLS;
        var br = (pb / COLS) | 0, bc = pb % COLS;
        if (Math.abs(ar - br) + Math.abs(ac - bc) !== 1) continue;
        var ca = centers[pa], cb = centers[pb];
        if (!ca || !cb) continue;
        var line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', ca.x.toFixed(1)); line.setAttribute('y1', ca.y.toFixed(1));
        line.setAttribute('x2', cb.x.toFixed(1)); line.setAttribute('y2', cb.y.toFixed(1));
        line.setAttribute('class', 'gp-link');
        svg.appendChild(line);
      }
    }
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
    if (!cellEl || lowPerf) return;
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

  /* ============================================================
     以下为补齐的演出函数（之前定义未成功插入，现统一补上）
     ============================================================ */
  var flashEl       = document.getElementById('gpFlash');
  var comboEl       = document.getElementById('gpCombo');
  var settleEl      = document.getElementById('gpSettle');
  var settleChainEl = document.getElementById('gpSettleChain');
  var settleWinEl   = document.getElementById('gpSettleWin');
  var settleMultEl  = document.getElementById('gpSettleMult');
  var settleTimer   = null;
  var bigwinEl      = document.getElementById('gpBigwin');
  var bigwinTitleEl = document.getElementById('gpBigwinTitle');
  var bigwinAmtEl   = document.getElementById('gpBigwinAmount');
  var bigwinSubEl   = document.getElementById('gpBigwinSub');
  var bigwinTimer   = null;
  var shareBtnEl    = document.getElementById('gpSettleShare');

  /* ---------- 全屏金光 ---------- */
  function triggerFlash(level) {
    if (!flashEl || lowPerf) return;
    flashEl.classList.remove('is-small', 'is-mid', 'is-big');
    void flashEl.offsetWidth;
    flashEl.classList.add(level === 'big' ? 'is-big' : (level === 'mid' ? 'is-mid' : 'is-small'));
    setTimeout(function () {
      flashEl.classList.remove('is-small', 'is-mid', 'is-big');
    }, level === 'big' ? 1700 : 900);
  }

  /* ---------- COMBO ---------- */
  function showCombo(n) {
    if (!comboEl || n < 2) return;
    if (lowPerf) { comboEl.hidden = true; return; }
    comboEl.classList.remove('is-show', 'is-hot', 'is-fire');
    void comboEl.offsetWidth;
    comboEl.textContent = 'COMBO ×' + n;
    if (n >= 5) comboEl.classList.add('is-fire');
    else if (n >= 3) comboEl.classList.add('is-hot');
    comboEl.hidden = false;
    comboEl.classList.add('is-show');
    clearTimeout(showCombo._t);
    showCombo._t = setTimeout(function () {
      comboEl.classList.remove('is-show');
    }, 820);
  }

  /* ---------- 中奖金额浮层 ---------- */
  function popupWin(positions, amount) {
    if (lowPerf || !positions || !positions.length || amount <= 0) return;
    var boardRect = boardEl.getBoundingClientRect();
    var cells = boardEl.querySelectorAll('.gp-cell');
    var sumX = 0, sumY = 0, n = 0;
    for (var i = 0; i < positions.length; i++) {
      var el = cells[positions[i]];
      if (!el) continue;
      var r = el.getBoundingClientRect();
      sumX += (r.left + r.right) / 2;
      sumY += (r.top + r.bottom) / 2;
      n++;
    }
    if (!n) return;
    var cx = sumX / n - boardRect.left;
    var cy = sumY / n - boardRect.top;
    var div = document.createElement('div');
    div.className = 'gp-win-float';
    div.textContent = '+' + fmtMoney(amount);
    div.style.left = cx.toFixed(1) + 'px';
    div.style.top = cy.toFixed(1) + 'px';
    boardEl.appendChild(div);
    setTimeout(function () {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 1500);
  }

  /* ---------- 结算面板 ---------- */
  function showSettle(chain, win, mult, bet) {
    return;   /* 已禁用 */
    if (!settleEl || win <= 0) return;
    var ratio = win / Math.max(1, bet);
    settleEl.classList.toggle('is-jackpot', ratio >= 20);
    settleChainEl.textContent = chain > 1 ? ('连锁 ' + chain + ' 次') : '';
    settleWinEl.textContent = fmtMoney(win);
    if (mult > 1) {
      settleMultEl.textContent = '倍率 x' + mult;
      settleMultEl.hidden = false;
    } else {
      settleMultEl.hidden = true;
    }
    if (shareBtnEl) shareBtnEl.hidden = false;
    settleEl.hidden = false;
    requestAnimationFrame(function () {
      settleEl.classList.add('is-show');
      settleEl.setAttribute('aria-hidden', 'false');
    });
    var dur = ratio >= 20 ? 3600 : (ratio >= 5 ? 2600 : 1800);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(hideSettle, dur);
  }

  function hideSettle() {
    if (!settleEl) return;
    if (shareBtnEl) shareBtnEl.hidden = true;
    settleEl.classList.remove('is-show');
    settleEl.setAttribute('aria-hidden', 'true');
    setTimeout(function () { settleEl.hidden = true; }, 260);
  }

  if (settleEl) settleEl.addEventListener('click', hideSettle);

  /* ---------- 大奖演出 ---------- */
  function showBigwin(win, bet, chain, mult) {
    if (!bigwinEl || win <= 0) return;
    var ratio = win / Math.max(1, bet);
    var tier = '';
    if      (ratio >= 500) tier = 'super';
    else if (ratio >= 100) tier = 'mega';
    else if (ratio >= 30)  tier = 'big';
    else return;
    var title = { big: 'BIG WIN', mega: 'MEGA WIN', super: 'SUPER WIN' }[tier];
    bigwinEl.classList.remove('is-show', 'is-mega', 'is-super');
    bigwinEl.classList.add('is-show');
    if (tier === 'mega')  bigwinEl.classList.add('is-mega');
    if (tier === 'super') bigwinEl.classList.add('is-super');
    bigwinTitleEl.textContent = title;
    bigwinAmtEl.textContent = fmtMoney(win);
    var subParts = [];
    subParts.push(ratio.toFixed(1) + '×');
    if (chain > 1) subParts.push('连锁 ' + chain + ' 次');
    if (mult > 1)  subParts.push('倍率 x' + mult);
    bigwinSubEl.textContent = subParts.join(' · ');
    bigwinEl.hidden = false;
    bigwinEl.setAttribute('aria-hidden', 'false');
    if (window.ApexAudio) {
      window.ApexAudio.play('fsTrigger');
      setTimeout(function () { window.ApexAudio.play('fsTrigger'); }, 380);
    }
    if (navigator.vibrate && vibeOn) {
      try {
        if (tier === 'super') navigator.vibrate([80, 60, 80, 60, 200]);
        else if (tier === 'mega') navigator.vibrate([60, 50, 120]);
        else navigator.vibrate([40, 40, 80]);
      } catch (e) {}
    }
    var dur = tier === 'super' ? 3200 : (tier === 'mega' ? 2600 : 2200);
    clearTimeout(bigwinTimer);
    bigwinTimer = setTimeout(hideBigwin, dur);
  }

  function hideBigwin() {
    if (!bigwinEl) return;
    bigwinEl.classList.remove('is-show');
    bigwinEl.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      bigwinEl.hidden = true;
      bigwinEl.classList.remove('is-mega', 'is-super');
    }, 320);
  }

  if (bigwinEl) bigwinEl.addEventListener('click', hideBigwin);


  /* ============================================================
     补齐缺失函数：待机 / FS总结 / 新手引导
     ============================================================ */

  /* ---------- 待机呼吸 ---------- */
  var idleTimer = null;
  var idleOn = false;
  function enterIdle() {
    if (lowPerf || idleOn || spinning || autoRunning) return;
    idleOn = true;
    var cells = boardEl.querySelectorAll('.gp-cell');
    for (var i = 0; i < cells.length; i++) {
      if (rnd() < 0.30) {
        cells[i].classList.add('is-idle');
        cells[i].style.setProperty('--idle-delay', (rnd() * 2.4).toFixed(2) + 's');
      }
    }
    if (boardEl) boardEl.classList.add('is-idle');
  }
  function exitIdle() {
    if (!idleOn) return;
    idleOn = false;
    var cells = boardEl.querySelectorAll('.gp-cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('is-idle');
      cells[i].style.removeProperty('--idle-delay');
    }
    if (boardEl) boardEl.classList.remove('is-idle');
  }
  function resetIdleTimer() {
    exitIdle();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(enterIdle, 3000);
  }
  ['pointerdown', 'keydown', 'touchstart', 'mousemove', 'wheel'].forEach(function (ev) {
    document.addEventListener(ev, resetIdleTimer, { passive: true });
  });

  /* ---------- FS 结束总结 ---------- */
  function showFsSummary(totalWin, bet, count) {
    return;   /* 已禁用 */
    if (!settleEl || totalWin <= 0) return;
    var ratio = totalWin / Math.max(1, bet);
    settleEl.classList.toggle('is-jackpot', ratio >= 20);
    settleChainEl.textContent = 'FREE SPINS · ' + count + ' 次';
    settleWinEl.textContent = fmtMoney(totalWin);
    settleMultEl.hidden = true;
    settleEl.hidden = false;
    requestAnimationFrame(function () {
      settleEl.classList.add('is-show');
      settleEl.setAttribute('aria-hidden', 'false');
    });
    clearTimeout(settleTimer);
    settleTimer = setTimeout(hideSettle, ratio >= 20 ? 3200 : 2400);
  }

  /* ---------- 新手引导 ---------- */
  var TUT_KEY = 'apex.tut.' + gameId;
  var tutEl    = document.getElementById('gpTutorial');
  var tutMask  = document.getElementById('gpTutMask');
  var tutCard  = document.getElementById('gpTutCard');
  var tutStep  = document.getElementById('gpTutStep');
  var tutTitle = document.getElementById('gpTutTitle');
  var tutDesc  = document.getElementById('gpTutDesc');
  var tutNext  = document.getElementById('gpTutNext');
  var tutSkip  = document.getElementById('gpTutSkip');

  var TUT_STEPS = [
    { sel: '#gpBoard',  title: '这是游戏盘面', desc: '6 列 × 5 行，30 个格子。相邻 3 个以上相同符号即可中奖。' },
    { sel: '#gpSpin',   title: '点这里开始旋转', desc: '每次旋转消耗一个下注额。中奖符号会消失，上方符号下落补位，可连续连锁。' },
    { sel: '.gp-tools', title: '这里有更多功能', desc: '自动旋转 · 游戏记录 · 赔付表。顶部菜单里还能切换音效和震动。' }
  ];

  var tutIdx = 0;
  var tutSpot = null;

  function tutHide() {
    if (!tutEl) return;
    tutEl.hidden = true;
    if (tutSpot && tutSpot.parentNode) tutSpot.parentNode.removeChild(tutSpot);
    tutSpot = null;
    try { localStorage.setItem(TUT_KEY, '1'); } catch (e) {}
  }

  function tutRender() {
    var step = TUT_STEPS[tutIdx];
    if (tutStep)  tutStep.textContent  = (tutIdx + 1) + ' / ' + TUT_STEPS.length;
    if (tutTitle) tutTitle.textContent = step.title;
    if (tutDesc)  tutDesc.textContent  = step.desc;
    if (tutNext)  tutNext.textContent  = (tutIdx === TUT_STEPS.length - 1) ? '开始游戏' : '下一步';
    if (tutSpot && tutSpot.parentNode) tutSpot.parentNode.removeChild(tutSpot);
    var target = document.querySelector(step.sel);
    if (target) {
      var r = target.getBoundingClientRect();
      tutSpot = document.createElement('div');
      tutSpot.className = 'gp-tut-spot';
      tutSpot.style.left   = (r.left   - 6) + 'px';
      tutSpot.style.top    = (r.top    - 6) + 'px';
      tutSpot.style.width  = (r.width  + 12) + 'px';
      tutSpot.style.height = (r.height + 12) + 'px';
      document.body.appendChild(tutSpot);
      var midY = r.top + r.height / 2;
      if (tutCard) {
        tutCard.style.marginTop = (midY < window.innerHeight / 2) ? '25vh' : '-25vh';
      }
    }
  }

  function tutNextStep() {
    if (tutIdx < TUT_STEPS.length - 1) { tutIdx++; tutRender(); }
    else tutHide();
  }

  if (tutNext) tutNext.addEventListener('click', tutNextStep);
  if (tutSkip) tutSkip.addEventListener('click', tutHide);
  if (tutMask) tutMask.addEventListener('click', tutHide);

  function startTutorial() {
    var done = false;
    try { done = localStorage.getItem(TUT_KEY) === '1'; } catch (e) {}
    if (done || !tutEl) return;
    tutEl.hidden = false;
    tutIdx = 0;
    tutRender();
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
      if (buyFsBtn) {
      var real = (mode !== 'demo');
      buyFsBtn.hidden = real || fsRemaining > 0;
      if (!buyFsBtn.hidden && buyFsText) {
        buyFsText.textContent = '买 FS · ' + fmtMoney(BET_STEPS[betIndex] * 100);
      }
    }
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
    /* 1) 准备新盘面数据 */
    newGrid();
    var newCells = grid.slice();

    /* 2) 所有格子进入滚动状态 */
    var cells = boardEl.querySelectorAll('.gp-cell');
    for (var ci = 0; ci < cells.length; ci++) cells[ci].classList.add('is-spinning');

    /* 3) 快速变符号（视觉滚动） */
    var t = 0;
    var ft = setInterval(function () {
      for (var i = 0; i < cells.length; i++) {
        if (rnd() < 0.35) cells[i].innerHTML = renderSym(pick());
      }
      t++;
      if (t >= 8) clearInterval(ft);
    }, 80);
    await sleep(700);
    clearInterval(ft);

    /* 4) 逐列定格（列错开 60ms） */
    for (var col = 0; col < COLS; col++) {
      for (var rr = 0; rr < ROWS; rr++) {
        var idx = rr * COLS + col;
        var el = cells[idx];
        if (!el) continue;
        el.innerHTML = renderSym(newCells[idx]);
        el.classList.remove('is-spinning');
        el.classList.add('is-land');
      }
      sfx('land');
      await sleep(60);
    }
    await sleep(140);
    for (var li = 0; li < cells.length; li++) cells[li].classList.remove('is-land');
    await sleep(80);

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
      showCombo(chain);
      announce('第 ' + chain + ' 次连锁中奖 ' + fmtMoney(winAmount));
      setResult('第 ' + chain + ' 连 · +' + fmtMoney(winAmount), true);
      var prevWin = lastWin;
      lastWin = totalWin;
      refreshUI();
      animateNumber(prizeEl, prevWin, totalWin, 320);
      var ratio = totalWin / Math.max(1, bet);
      if (ratio >= 20) triggerFlash('big');
      else if (ratio >= 5) triggerFlash('mid');
      else triggerFlash('small');
      /* 成就检查 */
      if (chain === 1) unlockAch('first_win');
      tickAch('chain3',  chain, 3);
      tickAch('chain5',  chain, 5);
      tickAch('chain10', chain, 10);
      tickAch('win10',   ratio, 10);
      tickAch('win30',   ratio, 30);
      tickAch('win100',  ratio, 100);
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
      announce('本局总赢 ' + fmtMoney(finalWin));
      if (!isFS) {
        showSettle(chain, finalWin, mult, bet);
        /* 大奖时先放专属演出，结算面板稍微延后 */
        var ratio2 = finalWin / Math.max(1, bet);
        if (ratio2 >= 30) {
          hideSettle();
          showBigwin(finalWin, bet, chain, mult);
        }
      }
    } else {
      lastWin = 0;
    }
    if (!isFS) bonusBalls = {};

    return { finalWin: finalWin, chain: chain, mult: mult };
  }

  /* Spin 按钮 */
  if (spinBtn) spinBtn.addEventListener('click', async function (ev) {
    try {
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
          fsTotal = 15;
          bonusBalls = {};
        
          if (bgmOn && window.ApexAudio) window.ApexAudio.setBgmMode('fs');
          unlockAch('first_fs');
          sfx('fsTrigger');
          triggerFlash('big');
          announce('触发免费旋转 15 次');
          setResult('⚡ ' + sc + ' 个闪电 · 触发免费旋转 15 次！', true);
          refreshUI();
          await sleep(1400);
        } else {
          if (r.chain === 0) { announce('本局未中奖'); setResult('未中奖', false); }
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
          fsTotal += 15;
          setResult('⚡ 再次触发 +15 次免费旋转！', true);
          refreshUI();
          await sleep(1200);
        }
      }

      if (fsRemaining === 0 && lastWin > 0) {
        sfx('fsEnd');
        if (bgmOn && window.ApexAudio) window.ApexAudio.setBgmMode('idle');
        setResult('免费旋转结束 · 总赢 ' + fmtMoney(lastWin), true);
        showFsSummary(lastWin, bet, fsTotal);
        fsTotal = 0;
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

      /* 热度逻辑（仅 demo，且非 FS 内） */
      if (mode === 'demo' && !isFS) {
        if (lastWin > 0) {
          /* 中奖 → 热度减半（不是清零，保持"运气延续"） */
          hypeCount = Math.floor(hypeCount / 2);
        } else {
          hypeCount++;
        }
        if (hypeCount >= HYPE_MAX) {
          await triggerHypeReward(bet);
        }
            }
      recordStats({
        bet: bet,
        win: lastWin,
        chain: r.chain || 0,
        mult: r.mult || 0,
        fs: !!isFS
      });
    } catch (e) {
      console.warn('[apex] spin 异常:', e);
      toast('旋转异常，已恢复');
    }

    spinning = false;
    } catch (outerErr) {
      console.warn('[apex] spin 外层异常:', outerErr);
      spinning = false;
      autoRunning = false;
      toast('操作异常，请重试');
    }
  });

  /* 下注 */
  if (betMinus) betMinus.addEventListener('click', function () { if (betIndex > 0) { betIndex--; refreshUI(); savePref(); } });
  if (betPlus)  betPlus.addEventListener('click',  function () { if (betIndex < BET_STEPS.length - 1) { betIndex++; refreshUI(); savePref(); } });

  /* 重置/充值 */
  if (rechargeEl) {
    if (mode === 'demo') {
      rechargeEl.textContent = '重置余额';
      rechargeEl.addEventListener('click', function () {
        balance = cfg.startBalance;
        lastWin = 0;
        hypeCount = 0;
        setResult('');
        refreshUI();
      
        toast('余额已重置');
      });
    } else {
      rechargeEl.textContent = '充值余额';
      rechargeEl.addEventListener('click', function () { toast('充值功能即将开放'); });
    }
  }

  /* ---------- 购买免费旋转 ---------- */
  if (buyFsBtn) buyFsBtn.addEventListener('click', async function () {
    if (spinning || autoRunning || fsRemaining > 0) return;
    var bet = BET_STEPS[betIndex];
    var cost = bet * 100;
    if (balance < cost) { sfx('error'); toast('余额不足，购买需要 ' + fmtMoney(cost)); return; }

    /* 二次确认 */
    if (!window.confirm('购买 15 次免费旋转，消耗 ' + fmtMoney(cost) + '？')) return;

    balance -= cost;
    lastWin = 0;
    fsRemaining = 15;
    fsTotal = 15;
    bonusBalls = {};
    refreshUI();
    sfx('fsTrigger');
    triggerFlash('big');
    if (bgmOn && window.ApexAudio) window.ApexAudio.setBgmMode('fs');
    setResult('⚡ 已购买 · 15 次免费旋转', true);
    unlockAch('buy_fs');
    await sleep(1200);

    /* 自动跑 FS */
    spinning = true;
    try {
      while (fsRemaining > 0) {
        fsRemaining--;
        await sleep(300);
        sfx('fsSpin');
        var fr = await runSpin(bet, true);
        if (fr.finalWin > 0) {
          setResult('免费旋转 · +' + fmtMoney(fr.finalWin) + ' · 剩余 ' + fsRemaining + ' 次', true);
        } else {
          setResult('免费旋转 · 剩余 ' + fsRemaining + ' 次', false);
        }
        if (countScatters() >= 4) {
          fsRemaining += 15;
          fsTotal += 15;
          setResult('⚡ 再次触发 +15 次免费旋转！', true);
          await sleep(1200);
        }
      }
      if (bgmOn && window.ApexAudio) window.ApexAudio.setBgmMode('idle');
      if (lastWin > 0) {
        sfx('fsEnd');
        setResult('免费旋转结束 · 总赢 ' + fmtMoney(lastWin), true);
        showFsSummary(lastWin, bet, fsTotal);
      }
      fsTotal = 0;
      recordHistory({
        t: Date.now(), bet: cost, win: lastWin, chain: 0, mult: 0, fs: true
      });
      recordStats({ bet: cost, win: lastWin, chain: 0, mult: 0, fs: true });
    } catch (e) { /* noop */ }
    spinning = false;
    refreshUI();
  });

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
  var bgmOn = false;
  var lowPerf = false;
  var themeName = 'light';
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var html = '<div class="gp-menu">' +
                 '<button type="button" class="gp-menu-item" id="gpMenuPay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span>赔付表</span></button>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuHist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>游戏记录</span></button>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuStats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><span>统计</span></button>' +
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
                 '<div class="gp-menu-row">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                   '<span>极速旋转</span>' +
                   '<button type="button" class="gp-switch" id="gpSwitchTurbo" role="switch" aria-checked="' + (turboOn ? 'true' : 'false') + '"><span></span></button>' +
                 '</div>' +
                 '<div class="gp-menu-row">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18 V5 L21 3 V16"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
                   '<span>背景音乐</span>' +
                   '<button type="button" class="gp-switch" id="gpSwitchBgm" role="switch" aria-checked="' + (bgmOn ? 'true' : 'false') + '"><span></span></button>' +
                 '</div>' +
                 '<div class="gp-menu-row">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L3 14 H12 L11 22 L21 10 H12 Z"/></svg>' +
                   '<span>低性能模式</span>' +
                   '<button type="button" class="gp-switch" id="gpSwitchLowperf" role="switch" aria-checked="' + (lowPerf ? 'true' : 'false') + '"><span></span></button>' +
                 '</div>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuAch">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M6 14 L4 22 L12 18 L20 22 L18 14"/></svg>' +
                   '<span>成就</span>' +
                 '</button>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuTheme">' +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2 a10 10 0 0 0 0 20 V2 z" fill="currentColor" stroke="none"/></svg>' +
                   '<span>主题</span>' +
                 '</button>' +
                 '<button type="button" class="gp-menu-item" id="gpMenuExit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span>退出游戏</span></button>' +
               '</div>';
    openSheet('菜单', html);
    document.getElementById('gpMenuPay').addEventListener('click', function () { closeSheet(); payBtn && payBtn.click(); });
    document.getElementById('gpMenuHist').addEventListener('click', function () { closeSheet(); histBtn && histBtn.click(); });
    document.getElementById('gpMenuAch').addEventListener('click', function () {
      closeSheet();
      setTimeout(openAchSheet, 320);
    });
    document.getElementById('gpMenuTheme').addEventListener('click', function () {
      closeSheet();
      setTimeout(openThemeSheet, 320);
    });
    document.getElementById('gpMenuStats').addEventListener('click', function () {
      closeSheet();
      openSheet('统计', renderStatsHTML());
      var rst = document.getElementById('gpStatsReset');
      if (rst) rst.addEventListener('click', function () {
        stats = { rounds: 0, totalBet: 0, totalWin: 0, bestWin: 0, bestMult: 0, bestChain: 0, fsCount: 0 };
        saveStats(stats);
        closeSheet();
        toast('统计已清空');
      });
    });
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
      savePref();
    });

    /* 震动开关 */
    var swVibe = document.getElementById('gpSwitchVibe');
    if (swVibe) swVibe.addEventListener('click', function () {
      vibeOn = !vibeOn;
      swVibe.setAttribute('aria-checked', vibeOn ? 'true' : 'false');
      if (vibeOn && navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
      savePref();
    });

    /* 极速旋转开关 */
    var swTurbo = document.getElementById('gpSwitchTurbo');
    if (swTurbo) swTurbo.addEventListener('click', function () {
      turboOn = !turboOn;
      swTurbo.setAttribute('aria-checked', turboOn ? 'true' : 'false');
      if (spinBtn) spinBtn.classList.toggle('is-turbo', turboOn);
      toast(turboOn ? '极速旋转已开启' : '极速旋转已关闭');
      savePref();
    });

    /* 低性能模式开关 */
    var swLow = document.getElementById('gpSwitchLowperf');
    if (swLow) swLow.addEventListener('click', function () {
      lowPerf = !lowPerf;
      swLow.setAttribute('aria-checked', lowPerf ? 'true' : 'false');
      if (page) page.classList.toggle('is-lowperf', lowPerf);
      if (lowPerf) exitIdle();
      savePref();
      toast(lowPerf ? '低性能模式已开启' : '低性能模式已关闭');
    });

    /* 背景音乐开关 */
    var swBgm = document.getElementById('gpSwitchBgm');
    if (swBgm) swBgm.addEventListener('click', function () {
      bgmOn = !bgmOn;
      swBgm.setAttribute('aria-checked', bgmOn ? 'true' : 'false');
      if (!window.ApexAudio) return;
      if (bgmOn) {
        window.ApexAudio.startBgm(fsRemaining > 0 ? 'fs' : 'idle');
        toast('背景音乐已开启');
      } else {
        window.ApexAudio.stopBgm();
        toast('背景音乐已关闭');
      }
      savePref();
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
    savePref();
  });

  /* 真实模式：读后端余额 */
  function loadRealBalance(attempt) {
    attempt = attempt || 0;
    if (mode !== 'real') return;
    if (!navigator.onLine) { toast('网络未连接，余额暂显示为 0'); return; }

    fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (res) {
        if (res.status === 401 || (res.d && res.d.code === 'unauthenticated')) {
          toast('未登录，请先登录');
          return;
        }
        if (!res.ok || !res.d || !res.d.success) {
          if (attempt < 2) setTimeout(function () { loadRealBalance(attempt + 1); }, 1500);
          else toast('余额获取失败，请稍后重试');
          return;
        }
        var wb = res.d.user && res.d.user.walletBalance;
        balance = (typeof wb === 'number') ? wb : 0;
        refreshUI();
      })
      .catch(function () {
        if (attempt < 2) setTimeout(function () { loadRealBalance(attempt + 1); }, 1500);
        else toast('网络异常，余额未加载');
      });
  }

  /* 初始化 */
  loadAch();

  /* 恢复偏好（一次性） */
  (function restorePref() {
    var pref = loadPref();
    if (typeof pref.betIndex === 'number' && pref.betIndex >= 0 && pref.betIndex < BET_STEPS.length) {
      betIndex = pref.betIndex;
    }
    if (typeof pref.sound   === 'boolean') { soundOn  = pref.sound; }
    if (typeof pref.vibe    === 'boolean') { vibeOn   = pref.vibe; }
    if (typeof pref.turbo   === 'boolean') { turboOn  = pref.turbo; }
    if (typeof pref.bgm     === 'boolean') { bgmOn    = pref.bgm; }
    if (typeof pref.lowperf === 'boolean') { lowPerf  = pref.lowperf; }
    /* 同步到 UI */
    if (window.ApexAudio) window.ApexAudio.setEnabled(soundOn);
    if (soundBtn) soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    if (spinBtn) spinBtn.classList.toggle('is-turbo', turboOn);
    if (page && lowPerf) page.classList.add('is-lowperf');
    if (typeof pref.theme === 'string') applyTheme(pref.theme);
  })();

  renderBoard();
  refreshUI();
  loadRealBalance();
  resetIdleTimer();
  setTimeout(startTutorial, 400);
})();
