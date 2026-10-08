/* Apex Game Runtime · Demo Provider v3
 * 使用真实 Paytable + Evaluator + Tumble 生成结果
 * 支持 real / demo 双模式 —— 参数唯一真值来源：ApexSimulator.MODE_PROFILE
 * 正式模式必须由服务器权威生成
 */
(function () {
  'use strict';

  var COLS = 6;
  var ROWS = 5;
  var TOTAL = COLS * ROWS;
  var MAX_TUMBLES = 20;
  var SPIN_COUNTER = 0;
  var RAND_BUF = new Uint32Array(1);

  function randInt(max) {
    crypto.getRandomValues(RAND_BUF);
    return RAND_BUF[0] % max;
  }

  function getProfile(mode) {
    var mp = window.ApexSimulator && window.ApexSimulator.MODE_PROFILE;
    if (!mp) throw new Error('provider: ApexSimulator.MODE_PROFILE 未加载');
    var p = mp[mode || 'real'];
    if (!p) throw new Error('provider: 未知模式 ' + mode);
    return p;
  }

  function pickBaseSymbol() {
    if (!window.ApexSymbols) return null;
    return window.ApexSymbols.pickBase();
  }

  /* P0-0 修复：生成 30 格基础盘面（旧版只推 1 个） */
  function genGrid() {
    var g = new Array(TOTAL);
    for (var i = 0; i < TOTAL; i++) {
      var s = pickBaseSymbol();
      g[i] = s || 'BANANA';
    }
    return g;
  }

  /* 保底注入（demo 模式），语义与 simulator 内 injectPity 一致 */
  function injectPity(grid, symbol, count) {
    var g = grid.slice();
    var cur = 0;
    for (var i = 0; i < g.length; i++) if (g[i] === symbol) cur++;
    var need = count - cur;
    if (need <= 0) return g;
    var guard = 0;
    while (need > 0 && guard < 200) {
      var idx = randInt(g.length);
      if (g[idx] !== symbol) { g[idx] = symbol; need--; }
      guard++;
    }
    return g;
  }

  function placeMultipliers(grid, count) {
    if (!window.ApexBonus) throw new Error('provider: ApexBonus 未加载');
    var next = grid.slice();
    var placed = 0;
    var guard = 0;
    var mults = [];
    while (placed < count && guard < 100) {
      var idx = randInt(TOTAL);
      if (next[idx] !== 'LOLLIPOP' && next[idx] !== 'MULTIPLIER') {
        next[idx] = 'MULTIPLIER';
        mults.push({ pos: idx, value: window.ApexBonus.pickMultiplier() });
        placed++;
      }
      guard++;
    }
    return { grid: next, mults: mults };
  }

  function maybePlaceScatters(grid) {
    var forceBonus = false;
    try {
      forceBonus = (typeof window !== 'undefined' && window.__APEX_FORCE_BONUS === true);
    } catch (e) {}
    if (!forceBonus && randInt(1000) >= 5) return { grid: grid, scatterCount: 0 };

    var count = forceBonus ? 6 : (4 + randInt(3));
    if (count > 6) count = 6;

    var positions = [];
    var guard = 0;
    while (positions.length < count && guard < 100) {
      var idx = randInt(TOTAL);
      if (positions.indexOf(idx) === -1) positions.push(idx);
      guard++;
    }
    var next = grid.slice();
    for (var i = 0; i < positions.length; i++) next[positions[i]] = 'LOLLIPOP';
    return { grid: next, scatterCount: count };
  }

  function DemoProvider(opts) {
    opts = opts || {};
    var noDelay = opts.noDelay === true;

    var wallet = (window.ApexWallet && window.ApexWallet.createDemo)
      ? window.ApexWallet.createDemo({ initialMinor: Number(opts.initialBalance) || 1000000 })
      : null;

    function getBalance() {
      if (wallet) return { currency: wallet.getCurrency(), minor: wallet.getMinor() };
      return { currency: 'CNY', minor: 1000000 };
    }

    function resolveTumbles(startGrid, betMinor, payScale) {
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
        var winMinor = Math.floor(betMinor * mult * payScale);   // P0-1: 统一施加 payScale
        totalWinMinor += winMinor;

        var positions = [];
        for (var k = 0; k < wins.length; k++) {
          var ps = wins[k].positions;
          for (var m = 0; m < ps.length; m++) positions.push(ps[m]);
        }

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

      return { finalGrid: grid, totalWinMinor: totalWinMinor, tumbles: tumbles };
    }

    function simulateDelay(minMs, maxMs) {
      if (noDelay) return Promise.resolve();
      var span = Math.max(1, maxMs - minMs);
      var ms = minMs + randInt(span);
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function spin(req) {
      req = req || {};
      var mode = req.mode || 'real';
      var profile = getProfile(mode);
      var betMinor = Number(req.bet) || 200;
      var isFree = !!req.free;
      var before = wallet ? wallet.getMinor() : 1000000;

      if (!isFree && wallet && wallet.getMinor() < betMinor) {
        return Promise.reject(new Error('insufficient'));
      }
      if (!isFree && wallet) wallet.debit(betMinor);

      var payload;
      try {
        var initialGrid = genGrid();

        // P0-1b: demo 模式保底注入
        if (profile.pityRate > 0 && profile.pitySymbol) {
          var pre = window.ApexEvaluator.evaluate(initialGrid);
          if (!pre.length) {
            var r01 = randInt(1000000) / 1000000;
            if (r01 < profile.pityRate) {
              initialGrid = injectPity(initialGrid, profile.pitySymbol, profile.pityMinCount);
            }
          }
        }

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
        if (isFree) {
          var mc = 1 + randInt(3);
          var mres = placeMultipliers(initialGrid, mc);
          initialGrid = mres.grid;
          mults = mres.mults;
        }

        var result = resolveTumbles(initialGrid, betMinor, profile.payScale);

        var multiplierSum = 0;
        for (var mi = 0; mi < mults.length; mi++) multiplierSum += mults[mi].value;
        if (multiplierSum > 0 && result.totalWinMinor > 0) {
          result.totalWinMinor = result.totalWinMinor * multiplierSum;
        }

        if (wallet) wallet.credit(result.totalWinMinor);

        payload = {
          spinId: 'demo_' + Date.now() + '_' + (++SPIN_COUNTER) + '_' + randInt(100000),
          gameId: 'sweet',
          mode: mode,
          payScale: profile.payScale,
          currency: wallet ? wallet.getCurrency() : 'CNY',
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
      } catch (e) {
        if (!isFree && wallet) wallet.credit(betMinor);   // P1-3: 出错回滚下注
        return Promise.reject(e);
      }

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
