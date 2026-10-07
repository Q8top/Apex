/* Apex · Board Evaluator
 * 输入：30 格符号 ID 数组（长度 30）
 * 输出：中奖组列表 [{ symbol, count, positions, multiplier }]
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;
  var TOTAL = COLS * ROWS;

  function evaluate(grid) {
    if (!Array.isArray(grid) || grid.length !== TOTAL) {
      throw new Error('evaluator: grid 必须为长度 ' + TOTAL + ' 的数组');
    }
    if (!window.ApexPaytable) {
      throw new Error('evaluator: ApexPaytable 未加载');
    }

    var groups = {};
    for (var i = 0; i < grid.length; i++) {
      var s = grid[i];
      if (!s) continue;
      if (!groups[s]) groups[s] = [];
      groups[s].push(i);
    }

    var wins = [];
    var keys = Object.keys(groups);
    for (var k = 0; k < keys.length; k++) {
      var symbol = keys[k];
      var pos = groups[symbol];
      var mult = window.ApexPaytable.getMultiplier(symbol, pos.length);
      if (mult > 0) {
        wins.push({
          symbol: symbol,
          count: pos.length,
          positions: pos,
          multiplier: mult
        });
      }
    }

    wins.sort(function (a, b) { return b.multiplier - a.multiplier; });
    return wins;
  }

  function sumMultiplier(wins) {
    var sum = 0;
    for (var i = 0; i < wins.length; i++) sum += wins[i].multiplier;
    return sum;
  }

  window.ApexEvaluator = Object.freeze({
    COLS: COLS,
    ROWS: ROWS,
    TOTAL: TOTAL,
    evaluate: evaluate,
    sumMultiplier: sumMultiplier
  });
})();
