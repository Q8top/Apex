// Apex Olympus - Pay-Anywhere matcher
// Given a 6x5 board, find every normal symbol with 8+ occurrences.
// Multiplier and scatter symbols do NOT participate in wins.

(function (global) {
  'use strict';

  // symbols: window.OlympusSymbols.SYMBOLS  (or a compatible list)
  // paytable: window.OlympusPaytable
  // board: 2D array of symbol ids (string)
  // returns: [{ symId, count, cells:[{r,c}], pay }]
  function findWins(board, symbols, paytable) {
    if (!board || !symbols || !paytable) return [];
    var MIN = paytable.MIN_MATCHES || 8;

    // build index: id -> symbol definition
    var byId = {};
    for (var i = 0; i < symbols.length; i++) byId[symbols[i].id] = symbols[i];

    // count + collect positions
    var pos = Object.create(null);
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[r].length; c++) {
        var id = board[r][c];
        if (id == null) continue;
        var def = byId[id];
        if (!def) continue;
        if (def.type === "multiplier") continue;
        if (def.type === "scatter") continue;
        if (!pos[id]) pos[id] = [];
        pos[id].push({ r: r, c: c });
      }
    }

    // evaluate
    var wins = [];
    for (var id in pos) {
      var cells = pos[id];
      var n = cells.length;
      if (n < MIN) continue;
      var def = byId[id];
      var tier = Math.min(n - MIN, 4);  // 8..12+ -> index 0..4
      var pay = (def.pay && def.pay[tier] != null) ? def.pay[tier] : 0;
      wins.push({ symId: id, count: n, cells: cells, pay: pay });
    }

    // stable sort: bigger pay first, then bigger count, then id
    wins.sort(function (a, b) {
      if (b.pay !== a.pay) return b.pay - a.pay;
      if (b.count !== a.count) return b.count - a.count;
      return a.symId < b.symId ? -1 : (a.symId > b.symId ? 1 : 0);
    });
    return wins;
  }

  // total bet-multiplier win before any multiplier-symbol summing
  function totalPay(wins) {
    var t = 0;
    for (var i = 0; i < wins.length; i++) t += wins[i].pay;
    return t;
  }

  global.OlympusMatcher = Object.freeze({
    findWins: findWins,
    totalPay: totalPay
  });
})(typeof window !== "undefined" ? window : globalThis);
