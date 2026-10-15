// Apex Olympus - board (6x5 grid of symbol ids)
// Pure data + helpers. No rendering, no RNG policy.

(function (global) {
  'use strict';

  var COLS = 6;
  var ROWS = 5;

  function empty() {
    var g = [];
    for (var r = 0; r < ROWS; r++) {
      var row = [];
      for (var c = 0; c < COLS; c++) row.push(null);
      g.push(row);
    }
    return g;
  }

  // Random fill from a weighted pool (uniform for now).
  // rng: optional function () -> [0,1). Default uses crypto.
  function randomFill(pool, rng) {
    if (!pool || !pool.length) throw new Error("board: empty pool");
    rng = rng || defaultRng;
    var g = empty();
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var i = Math.floor(rng() * pool.length);
        if (i >= pool.length) i = pool.length - 1;
        g[r][c] = pool[i];
      }
    }
    return g;
  }

  function defaultRng() {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }

  function get(g, r, c) { return g[r][c]; }
  function set(g, r, c, v) { g[r][c] = v; }
  function clone(g) { return g.map(function (row) { return row.slice(); }); }

  // Count how many cells currently hold each symbol id.
  function counts(g) {
    var m = Object.create(null);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var v = g[r][c];
        if (v == null) continue;
        m[v] = (m[v] || 0) + 1;
      }
    }
    return m;
  }

  global.OlympusBoard = Object.freeze({
    COLS: COLS,
    ROWS: ROWS,
    empty: empty,
    randomFill: randomFill,
    get: get,
    set: set,
    clone: clone,
    counts: counts
  });
})(typeof window !== "undefined" ? window : globalThis);
