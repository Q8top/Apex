// Apex Olympus - multiplier picker (15 face values across 4 gem buckets).
(function (global) {
  'use strict';

  // Per-bucket face-value weights. Bucket -> [[value, weight], ...].
  // Colour mapping is documented in symbols.js.
  var VALUES = {
    0: [[2, 35], [3, 25], [4, 20], [5, 15]],
    1: [[6, 40], [8, 25], [10, 20], [12, 10]],
    2: [[15, 40], [20, 25], [25, 20], [50, 10]],
    3: [[100, 50], [250, 30], [500, 15]]
  };
  var BUCKET_WEIGHT = [55, 28, 12, 5];

  function weightedPick(pairs, rng) {
    var total = 0, i;
    for (i = 0; i < pairs.length; i++) total += pairs[i][1];
    var roll = rng() * total;
    for (i = 0; i < pairs.length; i++) {
      roll -= pairs[i][1];
      if (roll <= 0) return pairs[i][0];
    }
    return pairs[0][0];
  }

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

  // Returns { id, value }. Caller stores value into the values grid.
  function pick(rng) {
    var bucket = pickBucket(rng);
    var value = weightedPick(VALUES[bucket], rng);
    return { id: 'sym-' + bucket, value: value };
  }

  global.OlympusMultiplier = Object.freeze({
    pick: pick,
    VALUES: VALUES,
    BUCKET_WEIGHT: BUCKET_WEIGHT
  });
})(typeof window !== 'undefined' ? window : globalThis);
