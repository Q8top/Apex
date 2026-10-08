/* Apex · Math Simulator
 * 纯数据模拟，不涉及 UI / 动画
 * 支持 real / demo 两套模式：
 *   real —— RTP 88~93%，命中率 20~35%
 *   demo —— RTP 130~250%，命中率 45~60%
 * 模式参数唯一真值来源：MODE_PROFILE
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;
  var TOTAL = COLS * ROWS;

  var MODE_PROFILE = Object.freeze({
    real: Object.freeze({
      payScale: 1.0,
      pityRate: 0.0,
      pitySymbol: null,
      pityMinCount: 8
    }),
    demo: Object.freeze({
      payScale: 1.55,
      pityRate: 0.35,
      pitySymbol: 'BANANA',
      pityMinCount: 8
    })
  });

  var RAND_BUF = new Uint32Array(1);

  function rand01() {
    crypto.getRandomValues(RAND_BUF);
    return RAND_BUF[0] / 4294967296;
  }

  function pickSymbols() {
    if (!window.ApexSymbols) throw new Error('simulator: ApexSymbols 未加载');
    var keys = window.ApexSymbols.BASE_SYMBOL_KEYS;
    var weights = window.ApexSymbols.BASE_WEIGHTS;
    if (!keys || !keys.length) throw new Error('simulator: BASE_SYMBOL_KEYS 为空');
    if (!weights) throw new Error('simulator: BASE_WEIGHTS 未暴露');

    var acc = new Array(keys.length);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
      var w = weights[keys[i]];
      if (!(w > 0)) throw new Error('simulator: 缺少权重 ' + keys[i]);
      total += w;
      acc[i] = total;
    }

    var buf = new Uint32Array(1);
    function pick() {
      crypto.getRandomValues(buf);
      var n = buf[0] % total;
      for (var j = 0; j < keys.length; j++) {
        if (n < acc[j]) return keys[j];
      }
      return keys[0];
    }
    return pick;
  }

  function genGrid(pick) {
    var g = new Array(TOTAL);
    for (var i = 0; i < TOTAL; i++) g[i] = pick();
    return g;
  }

  /* 保底注入：确保 grid 至少含 count 个 symbol 副本 */
  function injectPity(grid, symbol, count) {
    var g = grid.slice();
    var cur = 0;
    for (var i = 0; i < g.length; i++) if (g[i] === symbol) cur++;
    var need = count - cur;
    if (need <= 0) return g;

    var buf = new Uint32Array(1);
    var guard = 0;
    while (need > 0 && guard < 200) {
      crypto.getRandomValues(buf);
      var idx = buf[0] % g.length;
      if (g[idx] !== symbol) { g[idx] = symbol; need--; }
      guard++;
    }
    return g;
  }

  function playRound(pick, betMinor, profile) {
    var grid = genGrid(pick);

    // 保底：无中奖且掷骰通过时注入
    if (profile.pityRate > 0 && profile.pitySymbol) {
      var pre = window.ApexEvaluator.evaluate(grid);
      if (!pre.length && rand01() < profile.pityRate) {
        grid = injectPity(grid, profile.pitySymbol, profile.pityMinCount);
      }
    }

    var totalWin = 0;
    var depth = 0;
    var capped = false;
    while (depth < 20) {
      var wins = window.ApexEvaluator.evaluate(grid);
      if (!wins.length) break;
      var mult = window.ApexEvaluator.sumMultiplier(wins);
      totalWin += Math.floor(betMinor * mult * profile.payScale);
      var positions = [];
      for (var k = 0; k < wins.length; k++) {
        var ps = wins[k].positions;
        for (var m = 0; m < ps.length; m++) positions.push(ps[m]);
      }
      var res = window.ApexTumble.removeAndCompress(grid, positions, function () { return pick(); });
      grid = res.grid;
      depth++;
      if (depth >= 20) capped = true;
    }
    return { totalWin: totalWin, depth: depth, capped: capped };
  }

  function simulate(spins, betMinor, opts) {
    opts = opts || {};
    var mode = opts.mode || 'real';
    var profile = MODE_PROFILE[mode];
    if (!profile) throw new Error('simulator: 未知模式 ' + mode);
    if (!Number.isInteger(spins) || spins <= 0) throw new Error('simulator: spins 必须为正整数');
    if (spins > 1e7) throw new Error('simulator: spins 上限 1e7，避免 OOM');
    if (!(betMinor > 0)) throw new Error('simulator: betMinor 必须 > 0');

    var pick = pickSymbols();
    var wagered = 0;
    var paid = 0;
    var hits = 0;
    var cappedRounds = 0;
    var wins = new Array(spins);
    for (var i = 0; i < spins; i++) {
      wagered += betMinor;
      var r = playRound(pick, betMinor, profile);
      paid += r.totalWin;
      if (r.totalWin > 0) hits++;
      if (r.capped) cappedRounds++;
      wins[i] = r.totalWin / betMinor;
    }
    wins.sort(function (a, b) { return a - b; });

    function q(p) {
      if (!wins.length) return 0;
      return wins[Math.floor(p * (wins.length - 1))];
    }

    return {
      mode: mode,
      spins: spins,
      wagered: wagered,
      paid: paid,
      rtp: paid / wagered,
      hitRate: hits / spins,
      avgWin: paid / spins,
      avgWinPerBet: paid / wagered,
      median: q(0.5),
      p95: q(0.95),
      p99: q(0.99),
      max: wins[wins.length - 1] || 0,
      cappedRounds: cappedRounds
    };
  }

  window.ApexSimulator = Object.freeze({
    simulate: simulate,
    MODE_PROFILE: MODE_PROFILE
  });
})();
