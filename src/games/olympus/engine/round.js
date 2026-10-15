// Apex Olympus - spin + tumble + multiplier + pity.
(function (global) {
  'use strict';

  function makeMultMap(rows, cols) {
    var m = [];
    for (var r = 0; r < rows; r++) {
      var row = []; for (var c = 0; c < cols; c++) row.push(0);
      m.push(row);
    }
    return m;
  }

  function scalePay(symbols, scale) {
    if (scale === 1.0) return symbols;
    return symbols.map(function (s) {
      var ns = {}; for (var k in s) ns[k] = s[k];
      if (ns.pay && ns.pay.length) {
        ns.pay = ns.pay.map(function (p) { return p * scale; });
      }
      return ns;
    });
  }

  function injectPity(board, symbols, symbolId, targetCount, rng) {
    var rows = board.length, cols = board[0].length;
    var total = rows * cols;
    var count = 0;
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++)
        if (board[r][c] === symbolId) count++;
    var need = targetCount - count;
    if (need <= 0) return board;
    var out = board.map(function (row) { return row.slice(); });
    // collect positions that are NOT already symbolId, shuffle, take first need
    var idx = [];
    for (var r2 = 0; r2 < rows; r2++)
      for (var c2 = 0; c2 < cols; c2++)
        if (out[r2][c2] !== symbolId) idx.push(r2 * cols + c2);
    for (var j = idx.length - 1; j > 0; j--) {
      var k = Math.floor(rng() * (j + 1));
      var t = idx[j]; idx[j] = idx[k]; idx[k] = t;
    }
    for (var m = 0; m < need && m < idx.length; m++) {
      var pos = idx[m];
      out[Math.floor(pos / cols)][pos % cols] = symbolId;
    }
    return out;
  }

  function countScatters(board, symbols) {
    var byId = {};
    for (var i = 0; i < symbols.length; i++) byId[symbols[i].id] = symbols[i];
    var n = 0;
    for (var r = 0; r < board.length; r++)
      for (var c = 0; c < board[r].length; c++) {
        var id = board[r][c]; if (!id) continue;
        var d = byId[id];
        if (d && d.type === 'scatter') n++;
      }
    return n;
  }

  function applyMultipliers(board, symbols, map) {
    var byId = {};
    for (var i = 0; i < symbols.length; i++) byId[symbols[i].id] = symbols[i];
    for (var r = 0; r < board.length; r++)
      for (var c = 0; c < board[r].length; c++) {
        var id = board[r][c]; if (!id) continue;
        var d = byId[id];
        if (d && d.type === 'multiplier') map[r][c] += d.value || 0;
      }
  }

  function sumMap(map) {
    var t = 0;
    for (var r = 0; r < map.length; r++)
      for (var c = 0; c < map[r].length; c++) t += map[r][c];
    return t;
  }

  function playSpin(opts) {
    var strips = opts.strips, symbols = opts.symbols, paytable = opts.paytable;
    var reels = opts.reels, matcher = opts.matcher, tumble = opts.tumble;
    var mult = opts.multiplier, rng = opts.rng;
    var profile = opts.profile;
    var tcfg = opts.tumbleConfig;
    var ROWS = paytable.ROWS;
    var MAX = tcfg.MAX_STEPS;
    var isBase = !opts.multiplierMap;

    var payScale = profile ? profile.payScale : 1;
    var S = scalePay(symbols, payScale);
    var mc = profile ? profile.multChance : tcfg.MULT_CHANCE;

    var map = opts.multiplierMap || makeMultMap(ROWS, paytable.COLS);

    var board = reels.fillBoard(strips, ROWS, rng);
    var poked = false;
    if (isBase && profile && profile.pityRate > 0) {
      var pre = matcher.findWins(board, S, paytable);
      if (!pre.length) {
        var roll = rng();
        if (roll < profile.pityRate) {
          board = injectPity(board, S, profile.pitySymbol,
                             profile.pityTargetCount, rng);
          poked = true;
        }
      }
    }
    var scatters = countScatters(board, S);

    var totalPayX = 0;
    var step = 0;
    while (step < MAX) {
      var wins = matcher.findWins(board, S, paytable);
      if (!wins.length) break;
      totalPayX += matcher.totalPay(wins);
      board = tumble.removeWins(board, wins);
      board = tumble.drop(board);
      board = tumble.refill(board, strips, mc, mult.pick, rng);
      step++;
    }

    applyMultipliers(board, S, map);
    var multSum = sumMap(map);
    var factor = multSum > 0 ? multSum : 1;
    var rawWin = totalPayX * factor;
    var capped = false;
    if (profile && profile.maxWinX && rawWin > profile.maxWinX) {
      rawWin = profile.maxWinX; capped = true;
    }

    return {
      board: board, baseWinX: totalPayX, multiplierSum: multSum,
      winX: rawWin, scatters: scatters, poked: poked, capped: capped,
      multMap: map, steps: step
    };
  }

  function playBase(opts) {
    var r = playSpin(opts);
    var trig = r.scatters >= opts.paytable.SCATTER_TRIGGER;
    var award = 0;
    if (trig) {
      var a = opts.paytable.FREE_SPINS_AWARD;
      award = a[r.scatters] || a[4] || 15;
    }
    return Object.assign({}, r, {
      baseWin: r.winX, triggerFS: trig, fsAward: award
    });
  }

  function startFreeSpins(opts) {
    return {
      remaining: opts.count || 0, spinsPlayed: 0, totalWin: 0,
      retriggers: 0,
      multMap: makeMultMap(opts.paytable.ROWS, opts.paytable.COLS)
    };
  }

  var MAX_FS_SPINS = 200;  // hard cap, prevents runaway retriggers

  function nextFreeSpin(state, opts) {
    if (state.remaining <= 0) return null;
    if (state.spinsPlayed >= MAX_FS_SPINS) {
      state.remaining = 0;
      return null;
    }
    var r = playSpin(Object.assign({}, opts, { multiplierMap: state.multMap }));
    state.remaining--;
    state.spinsPlayed++;
    state.totalWin += r.winX;
    // Retriggers disabled for calibration pass. Re-enable later with a
    // strict cap (e.g. max 2 retriggers total, 6+ scatters on final board).
    // if (r.scatters >= 6 && state.retriggers < 2) {
    //   state.retriggers++;
    //   state.remaining += 5;
    // }
    return { win: r.winX, scatters: r.scatters,
             remaining: state.remaining, board: r.board };
  }

  global.OlympusRound = Object.freeze({
    playSpin: playSpin, playBase: playBase,
    startFreeSpins: startFreeSpins, nextFreeSpin: nextFreeSpin,
    injectPity: injectPity, makeMultMap: makeMultMap
  });
})(typeof window !== 'undefined' ? window : globalThis);
