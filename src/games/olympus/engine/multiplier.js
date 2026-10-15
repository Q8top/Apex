// Apex Olympus - multiplier symbol handler
// Values come from symbols.js (sym-0..sym-3).
// A multiplier symbol sits on the board but does NOT participate in
// matches. At the end of the tumble sequence, all live multiplier
// values on the board are summed and applied to the round win.

(function (global) {
  'use strict';

  // weights for picking a multiplier value (index matched to the
  // four multiplier symbols: 2x, 5x, 10x, 25x). Tune via config.
  var DEFAULT_PICK = [60, 25, 10, 5];  // 2x most common, 25x rare

  function pick(rng) {
    var total = 0, i;
    for (i = 0; i < DEFAULT_PICK.length; i++) total += DEFAULT_PICK[i];
    var roll = rng() * total;
    for (i = 0; i < DEFAULT_PICK.length; i++) {
      roll -= DEFAULT_PICK[i];
      if (roll <= 0) return "sym-" + i;
    }
    return "sym-0";
  }

  // scan a board, return list of { r, c, id, value } for multiplier
  // symbols currently visible
  function collect(board, symbols) {
    var byId = {};
    for (var i = 0; i < symbols.length; i++) byId[symbols[i].id] = symbols[i];
    var out = [];
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[r].length; c++) {
        var id = board[r][c];
        if (!id) continue;
        var def = byId[id];
        if (def && def.type === "multiplier") {
          out.push({ r: r, c: c, id: id, value: def.value || 0 });
        }
      }
    }
    return out;
  }

  function sum(list) {
    var t = 0;
    for (var i = 0; i < list.length; i++) t += list[i].value || 0;
    return t;
  }

  global.OlympusMultiplier = Object.freeze({
    pick: pick,
    collect: collect,
    sum: sum,
    DEFAULT_PICK: DEFAULT_PICK
  });
})(typeof window !== "undefined" ? window : globalThis);
