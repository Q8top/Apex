// Apex Olympus - tumble: remove winning cells, drop, refill from strips.
// Multiplier symbols appear during refill (chance + weights in
// config/tumble-config.js). They never participate in a match.

(function (global) {
  'use strict';

  var ROWS = 5, COLS = 6;

  // remove the positions of a list of wins; returns a new board
  function removeWins(board, wins) {
    var g = board.map(function (row) { return row.slice(); });
    for (var i = 0; i < wins.length; i++) {
      var cells = wins[i].cells;
      for (var j = 0; j < cells.length; j++) {
        g[cells[j].r][cells[j].c] = null;
      }
    }
    return g;
  }

  // drop existing symbols down within each column
  function drop(board) {
    var g = board.map(function (row) { return row.slice(); });
    for (var c = 0; c < COLS; c++) {
      var col = [];
      for (var r = ROWS - 1; r >= 0; r--) {
        if (g[r][c] != null) col.push(g[r][c]);
      }
      // col now holds non-null symbols from bottom upward
      for (var r2 = ROWS - 1, k = 0; r2 >= 0; r2--, k++) {
        g[r2][c] = k < col.length ? col[k] : null;
      }
    }
    return g;
  }

  // refill empty cells from the top of each column strip.
  // strips[col] = flat array; use a rotating pointer per call so the
  // same symbol is not re-used inside one refill.
  // multChance: per-cell probability to place a multiplier instead
  //             of a normal symbol. multPick: function(rng) -> sym id
  function refill(board, strips, multChance, multPick, rng) {
    var g = board.map(function (row) { return row.slice(); });
    for (var c = 0; c < COLS; c++) {
      var strip = strips[c];
      var start = Math.floor(rng() * strip.length);
      var cursor = start;
      for (var r = 0; r < ROWS; r++) {
        if (g[r][c] != null) continue;
        if (multPick && rng() < multChance) {
          g[r][c] = multPick(rng);
        } else {
          g[r][c] = strip[cursor % strip.length];
          cursor++;
        }
      }
    }
    return g;
  }

  global.OlympusTumble = Object.freeze({
    removeWins: removeWins,
    drop: drop,
    refill: refill
  });
})(typeof window !== "undefined" ? window : globalThis);
