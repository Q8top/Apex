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
  var SPIN_COUNTER = 0;

  function randInt(max) {
    var b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] % max;
  }

  function pickBaseSymbol() {
    return window.ApexSymbols.pickBase();
  }



  function placeMultipliers(grid, count) {
    var next = grid.slice();
    var buf = new Uint32Array(1);
    var placed = 0;
    var guard = 0;
    var mults = [];
    while (placed < count && guard < 100) {
      crypto.getRandomValues(buf);
      var idx = buf[0] % TOTAL;
      if (next[idx] !== 'LOLLIPOP' && next[idx] !== 'MULTIPLIER') {
        crypto.getRandomValues(buf);
        var v = [2, 3, 5, 10, 25, 50, 100][buf[0] % 7];
        next[idx] = 'MULTIPLIER';
        mults.push({ pos: idx, value: v });
        placed++;
      }
      guard++;
    }
    return { grid: next, mults: mults };
  }

  function maybePlaceScatters(grid) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    var forceBonus = false;
    try {
      forceBonus = (typeof window !== 'undefined' && window.__APEX_FORCE_BONUS === true);
    } catch (e) {}
    if (!forceBonus && (buf[0] % 1000) >= 5) return { grid: grid, scatterCount: 0 };
    crypto.getRandomValues(buf);
    var count = forceBonus ? 6 : (4 + (buf[0] % 3));
    if (count > 6) count = 6;
    var positions = [];
    var guard = 0;
    while (positions.length < count && guard < 100) {
      crypto.getRandomValues(buf);
      var idx = buf[0] % TOTAL;
      if (positions.indexOf(idx) === -1) positions.push(idx);
      guard++;
    }
    var next = grid.slice();
    positions.forEach(function (i) { next[i] = 'LOLLIPOP'; });
    return { grid: next, scatterCount: count };
  }

  function genGrid() {
    var g = [];
    for (var i = 0; i < TOTAL; i++) g.push(pickBaseSymbol());
    return g;
  }

  function DemoProvider(opts) {
    opts = opts || {};
    var wallet = (window.ApexWallet && window.ApexWallet.createDemo)
      ? window.ApexWallet.createDemo({ initialMinor: Number(opts.initialBalance) || 1000000 })
      : null;

    function getBalance() {
      if (wallet) return { currency: wallet.getCurrency(), minor: wallet.getMinor() };
      currency: wallet ? wallet.getCurrency() : 'CNY',
    }

    function resolveTumbles(startGrid, betMinor) {
      if (!window.ApexEvaluator || !window.ApexTumble) {
        return { finalGrid: startGrid, totalWinMinor: 0, tumbles: [] };
      }
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
      var isFree = !!(req && req.free);
      var before = wallet ? wallet.getMinor() : 1000000;
      if (!isFree && wallet && wallet.getMinor() < betMinor) {
        return Promise.reject(new Error('insufficient'));
      }
      if (!isFree && wallet) wallet.debit(betMinor);

      var initialGrid = genGrid();
      var scatterCheck = maybePlaceScatters(initialGrid);
      initialGrid = scatterCheck.grid;

      var bonusInfo = null;
      if (scatterCheck.scatterCount >= 4 && window.ApexBonus) {
        bonusInfo = {
          triggered: true,
          scatterCount: scatterCheck.scatterCount,
          initialSpins: window.ApexBonus.resolveInitialSpins(scatterCheck.scatterCount)
        };
      }

      var mults = [];
      if (req && req.free) {
        var buf2 = new Uint32Array(1);
        crypto.getRandomValues(buf2);
        var mc = 1 + (buf2[0] % 3);
        var mres = placeMultipliers(initialGrid, mc);
        initialGrid = mres.grid;
        mults = mres.mults;
      }

      var result = resolveTumbles(initialGrid, betMinor);

      var multiplierSum = 0;
      for (var mi = 0; mi < mults.length; mi++) {
        multiplierSum += mults[mi].value;
      }
      if (multiplierSum > 0 && result.totalWinMinor > 0) {
        result.totalWinMinor = result.totalWinMinor * multiplierSum;
      }

      if (wallet) wallet.credit(result.totalWinMinor);

      var payload = {
        spinId: 'demo_' + Date.now() + '_' + (++SPIN_COUNTER) + '_' + randInt(100000),
        gameId: 'sweet',
        currency: 'CNY',
        bet: betMinor,
        balanceBefore: before,
        balanceAfter: wallet ? wallet.getMinor() : before,
        grid: initialGrid,
        finalGrid: result.finalGrid,
        tumbles: result.tumbles,
        totalWin: result.totalWinMinor,
        feature: bonusInfo,
        multipliers: mults,
        multiplierSum: multiplierSum
      };
      return simulateDelay(400, 900).then(function () { return payload; });
    }

    function resetBalance(minor) {
      var n = Math.floor(Number(minor) || 1000000);
      if (wallet && wallet.set) wallet.set(n);
      return { currency: 'CNY', minor: n };
    }

    return { getBalance: getBalance, spin: spin, resetBalance: resetBalance };
  }

  window.ApexDemoProvider = { create: DemoProvider };
})();
