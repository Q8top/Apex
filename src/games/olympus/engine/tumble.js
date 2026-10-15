// Apex Olympus - tumble: board + parallel values grid.
// board[r][c] = symbol id string or null
// values[r][c] = multiplier face value for a ball at that cell,
//               0 for normal symbols / empty cells.
(function (global) {
  'use strict';
  var ROWS = 5, COLS = 6;

  function emptyValues() {
    var m = [];
    for (var r = 0; r < ROWS; r++) {
      var row = []; for (var c = 0; c < COLS; c++) row.push(0);
      m.push(row);
    }
    return m;
  }

  function cloneV(v) { return v.map(function (row) { return row.slice(); }); }

  function removeWins(board, values, wins) {
    var g = board.map(function (row) { return row.slice(); });
    var v = cloneV(values);
    for (var i = 0; i < wins.length; i++) {
      var cells = wins[i].cells;
      for (var j = 0; j < cells.length; j++) {
        g[cells[j].r][cells[j].c] = null;
        v[cells[j].r][cells[j].c] = 0;
      }
    }
    return { board: g, values: v };
  }

  function drop(board, values) {
    var g = board.map(function (row) { return row.slice(); });
    var v = cloneV(values);
    for (var c = 0; c < COLS; c++) {
      var colIds = [], colVals = [];
      for (var r = ROWS - 1; r >= 0; r--) {
        if (g[r][c] != null) {
          colIds.push(g[r][c]);
          colVals.push(v[r][c]);
        }
      }
      for (var r2 = ROWS - 1, k = 0; r2 >= 0; r2--, k++) {
        if (k < colIds.length) {
          g[r2][c] = colIds[k];
          v[r2][c] = colVals[k];
        } else {
          g[r2][c] = null;
          v[r2][c] = 0;
        }
      }
    }
    return { board: g, values: v };
  }

  // refill empty cells. multPick(rng) => { id, value } | null
  function refill(board, values, strips, multChance, multPick, rng) {
    var g = board.map(function (row) { return row.slice(); });
    var v = cloneV(values);
    for (var c = 0; c < COLS; c++) {
      var strip = strips[c];
      var start = Math.floor(rng() * strip.length);
      var cursor = start;
      for (var r = 0; r < ROWS; r++) {
        if (g[r][c] != null) continue;
        if (multPick && rng() < multChance) {
          var m = multPick(rng);
          g[r][c] = m.id;
          v[r][c] = m.value;
        } else {
          g[r][c] = strip[cursor % strip.length];
          v[r][c] = 0;
          cursor++;
        }
      }
    }
    return { board: g, values: v };
  }

  global.OlympusTumble = Object.freeze({
    emptyValues: emptyValues,
    removeWins: removeWins, drop: drop, refill: refill
  });
})(typeof window !== "undefined" ? window : globalThis);
