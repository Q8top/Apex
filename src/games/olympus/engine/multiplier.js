// Apex Olympus - multiplier picker (15 tiers across 4 buckets).
(function (global) {
  'use strict';

  // Per-bucket face-value weights (bucket index -> value -> weight).
  var VALUES = {
    0: [[2, 35], [3, 25], [4, 20], [5, 15]],
    1: [[6, 40], [8, 25], [10, 20], [12, 10]],
    2: [[15, 40], [20, 25], [25, 20], [50, 10]],
    3: [[100, 50], [250, 30], [500, 15]]
  };
  var BUCKET_WEIGHT = [55, 28, 12, 5];

  function pickBucket(rng) {
    var total = 0, i;
    for (i = 0; i < BUCKET_WEIGHT.length; i++) total += BUCKET_WEIGHT[i];
    var roll = rng() * total;
    for (i = 0; i < BUCKET_WEIGHT.length; i++) {
      roll -= BUCKET_WEIGHT[i];
      if (roll <= 0) return i;
    }
    return 0;
  }

  function pickValue(bucket, rng) {
    var arr = VALUES[bucket] || VALUES[0];
    var total = 0, i;
    for (i = 0; i < arr.length; i++) total += arr[i][1];
    var roll = rng() * total;
    for (i = 0; i < arr.length; i++) {
      roll -= arr[i][1];
      if (roll <= 0) return arr[i][0];
    }
    return arr[0][0];
  }

  // Returns { id, value } so round.js can use the face value.
  function pick(rng) {
    var bucket = pickBucket(rng);
    var value = pickValue(bucket, rng);
    return { id: "sym-" + bucket, value: value };
  }

  // Collect multipliers from a board. Each cell may carry a value
  // stored separately in multMap; here we only return cell positions.
  function collect(board, symbols) {
    var byId = {};
    for (var i = 0; i < symbols.length; i++) byId[symbols[i].id] = symbols[i];
    var out = [];
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[r].length; c++) {
        var id = board[r][c];
        if (!id) continue;
        var d = byId[id];
        if (d && d.type === "multiplier") out.push({ r: r, c: c, id: id });
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
    pick: pick, collect: collect, sum: sum,
    VALUES: VALUES, BUCKET_WEIGHT: BUCKET_WEIGHT
  });
})(typeof window !== "undefined" ? window : globalThis);
