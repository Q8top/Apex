// Apex Olympus - reels: build virtual strips and fill a 6x5 board.
// A real slot machine has one strip per column. Spin = pick a start
// index on each strip, take ROWS consecutive symbols (wrapping).

(function (global) {
  'use strict';

  // Build one flat array per column from the weight object.
  // Order does NOT matter for pay-anywhere, but we shuffle once so
  // that adjacent cells on the strip are not identical (visual +
  // natural distribution).
  function buildStrips(weightsCfg, rng) {
    rng = rng || defaultRng;
    var strips = [];
    for (var c = 0; c < weightsCfg.WEIGHTS.length; c++) {
      var col = weightsCfg.WEIGHTS[c];
      var arr = [];
      for (var id in col) {
        var n = col[id];
        for (var i = 0; i < n; i++) arr.push(id);
      }
      // Fisher-Yates shuffle so adjacent entries are not clustered
      for (var j = arr.length - 1; j > 0; j--) {
        var k = Math.floor(rng() * (j + 1));
        var t = arr[j]; arr[j] = arr[k]; arr[k] = t;
      }
      strips.push(arr);
    }
    return strips;
  }

  // Pick ROWS consecutive symbols from a strip, wrapping around.
  function takeColumn(strip, start, rows) {
    var L = strip.length;
    var out = [];
    for (var i = 0; i < rows; i++) out.push(strip[(start + i) % L]);
    return out;
  }

  // Fill a 6x5 board. strips = array of 6 flat arrays.
  function fillBoard(strips, rows, rng) {
    rng = rng || defaultRng;
    var board = [];
    for (var r = 0; r < rows; r++) board.push([]);
    for (var c = 0; c < strips.length; c++) {
      var s = strips[c];
      var start = Math.floor(rng() * s.length);
      var colVals = takeColumn(s, start, rows);
      for (var r2 = 0; r2 < rows; r2++) board[r2][c] = colVals[r2];
    }
    return board;
  }

  function defaultRng() {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }

  global.OlympusReels = Object.freeze({
    buildStrips: buildStrips,
    takeColumn: takeColumn,
    fillBoard: fillBoard
  });
})(typeof window !== "undefined" ? window : globalThis);
