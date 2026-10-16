// Apex Olympus - tumble: board + INDEPENDENT values layer.
// values[r][c] = persisted multiplier on that cell. It is NOT
// tied to the symbol: during free spins the value stays put even
// if the symbol on top of it moves or clears. New multiplier gems
// landing on a cell with a value ADD to it.
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

  // Only the board cells are cleared. values are left intact so
  // the persisted multipliers survive the tumble sequence.
  function removeWins(board, values, wins) {
    var g = board.map(function (row) { return row.slice(); });
    for (var i = 0; i < wins.length; i++) {
      var cells = wins[i].cells;
      for (var j = 0; j < cells.length; j++) {
        g[cells[j].r][cells[j].c] = null;
      }
    }
    // values untouched
    return { board: g, values: values };
  }

  // Drop symbols only. values stay fixed in their cell.
  // If isMult is provided, multiplier symbols act as immovable anchors:
  // they keep their row, and non-multiplier symbols fall around them.
  function drop(board, values, isMult) {
    var g = board.map(function (row) { return row.slice(); });
    for (var c = 0; c < COLS; c++) {
      var anchorRows = [], movers = [], r;
      for (r = 0; r < ROWS; r++) {
        var id = board[r][c];
        if (id == null) continue;
        if (isMult && isMult(id)) anchorRows.push(r);
        else movers.push(id);
      }
      for (r = 0; r < ROWS; r++) g[r][c] = null;
      for (var ai = 0; ai < anchorRows.length; ai++) {
        var ar = anchorRows[ai];
        g[ar][c] = board[ar][c];
      }
      var mi = movers.length - 1;
      for (r = ROWS - 1; r >= 0 && mi >= 0; r--) {
        if (g[r][c] == null) g[r][c] = movers[mi--];
      }
    }
    return { board: g, values: values };
  }

  // Refill empty cells. If a multiplier gem drops, its value is
  // ADDED to whatever is already stored on that cell.
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
          v[r][c] = (v[r][c] || 0) + m.value;
        } else {
          g[r][c] = strip[cursor % strip.length];
          cursor++;
          // value, if any, stays as-is
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
