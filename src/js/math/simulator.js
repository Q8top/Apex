/* Apex · Math Simulator
 * 纯数据模拟，不涉及 UI / 动画
 * 输入：spins 次数
 * 输出：RTP / HitRate / 分位统计 / 分布
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;
  var TOTAL = COLS * ROWS;

  function pickSymbols() {
    if (!window.ApexSymbols) throw new Error('simulator: ApexSymbols 未加载');
    var keys = window.ApexSymbols.BASE_SYMBOL_KEYS;
    var meta = window.ApexSymbols.SYMBOL_META;
    var weights = { BANANA:14, GRAPE:14, WATERMELON:13, PLUM:13, APPLE:12,
                    BLUE_CANDY:6, GREEN_CANDY:6, PURPLE_CANDY:5, RED_HEART:5 };
    var total = 0;
    for (var i = 0; i < keys.length; i++) total += weights[keys[i]];
    function pick() {
      var b = new Uint32Array(1);
      crypto.getRandomValues(b);
      var n = b[0] % total;
      var acc = 0;
      for (var j = 0; j < keys.length; j++) {
        acc += weights[keys[j]];
        if (n < acc) return keys[j];
      }
      return keys[0];
    }
    return pick;
  }

  function genGrid(pick) {
    var g = [];
    for (var i = 0; i < TOTAL; i++) g.push(pick());
    return g;
  }

  function playRound(pick, betMinor) {
    var grid = genGrid(pick);
    var totalWin = 0;
    var depth = 0;
    while (depth < 20) {
      var wins = window.ApexEvaluator.evaluate(grid);
      if (!wins.length) break;
      var mult = window.ApexEvaluator.sumMultiplier(wins);
      totalWin += Math.floor(betMinor * mult);
      var positions = [];
      wins.forEach(function (w) { positions = positions.concat(w.positions); });
      var res = window.ApexTumble.removeAndCompress(grid, positions, function () { return pick(); });
      grid = res.grid;
      depth++;
    }
    return { totalWin: totalWin, depth: depth };
  }

  function simulate(spins, betMinor) {
    var wagered = 0;
    var paid = 0;
    var hits = 0;
    var wins = [];
    for (var i = 0; i < spins; i++) {
      wagered += betMinor;
      var r = playRound(pickSymbols(), betMinor);
      paid += r.totalWin;
      if (r.totalWin > 0) hits++;
      wins.push(r.totalWin / betMinor);
    }
    wins.sort(function (a, b) { return a - b; });
    function q(p) { return wins[Math.floor(p * (wins.length - 1))] || 0; }
    return {
      spins: spins,
      wagered: wagered,
      paid: paid,
      rtp: paid / wagered,
      hitRate: hits / spins,
      avgWin: paid / wagered,
      median: q(0.5),
      p95: q(0.95),
      p99: q(0.99),
      max: wins[wins.length - 1] || 0
    };
  }

  window.ApexSimulator = Object.freeze({ simulate: simulate });
})();
