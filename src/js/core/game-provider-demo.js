/* Apex Game Runtime · Demo Provider v2
 * 使用真实 Paytable + Evaluator + Tumble 生成结果
 * 正式模式必须由服务器权威生成
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;
  var TOTAL = COLS * ROWS;
  var MAX_TUMBLES = 20;

  function randInt(max) {
    var b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] % max;
  }

  function pickBaseSymbol() {
    return window.ApexSymbols.pickBase();
  }

  function genGrid() {
    var g = [];
    for (var i = 0; i < TOTAL; i++) g.push(pickBaseSymbol());
    return g;
  }

  function DemoProvider(opts) {
    opts = opts || {};
    var balanceMinor = Number(opts.initialBalance) || 1000000;

    function getBalance() {
      return { currency: 'CNY', minor: balanceMinor };
    }

    function resolveTumbles(startGrid, betMinor) {
      var grid = startGrid;
      var totalWinMinor = 0;
      var tumbles = [];
      var step = 0;

      while (step < MAX_TUMBLES) {
        var wins = window.ApexEvaluator.evaluate(grid);
        if (!wins.length) break;

        var mult = window.ApexEvaluator.sumMultiplier(wins);
        var winMinor = Math.floor(betMinor * mult);
        totalWinMinor += winMinor;

        var positions = [];
        wins.forEach(function (w) {
          positions = positions.concat(w.positions);
        });

        var tumbleResult = window.ApexTumble.removeAndCompress(
          grid, positions, function () { return pickBaseSymbol(); }
        );

        tumbles.push({
          index: step,
          gridBefore: grid,
          wins: wins,
          removedPositions: positions,
          multiplier: mult,
          winMinor: winMinor,
          gridAfter: tumbleResult.grid
        });

        grid = tumbleResult.grid;
        step++;
      }

      return {
        finalGrid: grid,
        totalWinMinor: totalWinMinor,
        tumbles: tumbles
      };
    }

    function simulateDelay(minMs, maxMs) {
      var span = Math.max(1, maxMs - minMs);
      var ms = minMs + randInt(span);
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function spin(req) {
      var betMinor = Number(req && req.bet) || 200;
      var before = balanceMinor;
      balanceMinor -= betMinor;

      var initialGrid = genGrid();
      var result = resolveTumbles(initialGrid, betMinor);

      balanceMinor += result.totalWinMinor;

      var payload = {
        spinId: 'demo_' + Date.now() + '_' + randInt(100000),
        gameId: 'sweet',
        currency: 'CNY',
        bet: betMinor,
        balanceBefore: before,
        balanceAfter: balanceMinor,
        grid: initialGrid,
        finalGrid: result.finalGrid,
        tumbles: result.tumbles,
        totalWin: result.totalWinMinor,
        feature: null
      };
      return simulateDelay(400, 900).then(function () { return payload; });
    }

    return { getBalance: getBalance, spin: spin };
  }

  window.ApexDemoProvider = { create: DemoProvider };
})();
