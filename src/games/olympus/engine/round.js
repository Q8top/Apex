// Apex Olympus - spin/tumble/multiplier/pity/FS.
(function (global) {
  'use strict';

  function scalePay(symbols, scale) {
    if (scale === 1.0) return symbols;
    return symbols.map(function (s) {
      var ns = {}; for (var k in s) ns[k] = s[k];
      if (ns.pay && ns.pay.length) ns.pay = ns.pay.map(function (p) { return p * scale; });
      return ns;
    });
  }

  function injectPity(board, symbolId, targetCount, rng) {
    var rows = board.length, cols = board[0].length;
    var count = 0;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) if (board[r][c] === symbolId) count++;
    var need = targetCount - count;
    if (need <= 0) return board;
    var out = board.map(function (row) { return row.slice(); });
    var idx = [];
    for (var r2 = 0; r2 < rows; r2++) for (var c2 = 0; c2 < cols; c2++) if (out[r2][c2] !== symbolId) idx.push(r2 * cols + c2);
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
        if (d && d.type === "scatter") n++;
      }
    return n;
  }

  function sumValues(v) {
    var t = 0;
    for (var r = 0; r < v.length; r++) for (var c = 0; c < v[r].length; c++) t += v[r][c];
    return t;
  }

  function playSpin(opts) {
    var strips = opts.strips, symbols = opts.symbols, paytable = opts.paytable;
    var reels = opts.reels, matcher = opts.matcher, tumble = opts.tumble;
    var mult = opts.multiplier, rng = opts.rng, profile = opts.profile;
    var tcfg = opts.tumbleConfig;
    var ROWS = paytable.ROWS, COLS = paytable.COLS;
    var MAX = tcfg.MAX_STEPS;
    var isBase = !opts.multiplierMap;

    var payScale = profile ? profile.payScale : 1;
    var S = scalePay(symbols, payScale);
    var mc = profile ? profile.multChance : tcfg.MULT_CHANCE;

    // values grid: persistent in FS, fresh in base
    var values;
    var persist = !!opts.multiplierMap;
    if (persist) {
      values = opts.multiplierMap;
    } else {
      values = tumble.emptyValues();
    }

    var board = reels.fillBoard(strips, ROWS, rng);
    var poked = false;
    if (isBase && profile && profile.pityRate > 0) {
      var pre = matcher.findWins(board, S, paytable);
      if (!pre.length) {
        if (rng() < profile.pityRate) {
          board = injectPity(board, profile.pitySymbol, profile.pityTargetCount, rng);
          poked = true;
        }
      }
    }
    var scatters = countScatters(board, S);

    var totalPayX = 0;
    var step = 0;
    var history = [];
    while (step < MAX) {
      var wins = matcher.findWins(board, S, paytable);
      if (!wins.length) break;
      var pay = matcher.totalPay(wins);
      totalPayX += pay;
      history.push({
        step: step,
        board: board.map(function (row) { return row.slice(); }),
        values: values.map(function (row) { return row.slice(); }),
        wins: wins.map(function (w) {
          return { symId: w.symId,
            cells: w.cells.map(function (c) { return { r: c.r, c: c.c }; }),
            pay: w.pay };
        }),
        pay: pay
      });
      var r1 = tumble.removeWins(board, values, wins);
      var r2 = tumble.drop(r1.board, r1.values);
      var r3 = tumble.refill(r2.board, r2.values, strips, mc, mult.pick, rng);
      board = r3.board;
      values = r3.values;
      step++;
    }

    var multSum = sumValues(values);
    var factor = multSum > 0 ? multSum : 1;
    var rawWin = totalPayX * factor;
    var capped = false;
    if (profile && profile.maxWinX && rawWin > profile.maxWinX) {
      rawWin = profile.maxWinX; capped = true;
    }

    return {
      board: board, values: values,
      baseWinX: totalPayX, multiplierSum: multSum,
      winX: rawWin, scatters: scatters, poked: poked, capped: capped,
      multMap: values, steps: step, history: history
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
    return Object.assign({}, r, { baseWin: r.winX, triggerFS: trig, fsAward: award });
  }

  function startFreeSpins(opts) {
    return {
      remaining: opts.count || 0, spinsPlayed: 0, totalWin: 0,
      retriggers: 0,
      multMap: opts.tumble ? opts.tumble.emptyValues() : null
    };
  }

  function nextFreeSpin(state, opts) {
    if (state.remaining <= 0) return null;
    if (state.spinsPlayed >= 200) { state.remaining = 0; return null; }
    var r = playSpin(Object.assign({}, opts, { multiplierMap: state.multMap }));
    state.remaining--;
    state.spinsPlayed++;
    state.totalWin += r.winX;
    var rt = opts.paytable.RETRIGGER_TRIGGER || 3;
    if (r.scatters >= rt) {
      state.retriggers++;
      state.remaining += 5;
    }
    return { win: r.winX, scatters: r.scatters, remaining: state.remaining, board: r.board, values: r.values };
  }

  global.OlympusRound = Object.freeze({
    playSpin: playSpin, playBase: playBase,
    startFreeSpins: startFreeSpins, nextFreeSpin: nextFreeSpin,
    injectPity: injectPity, sumValues: sumValues
  });
})(typeof window !== "undefined" ? window : globalThis);
