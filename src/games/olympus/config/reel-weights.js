// Apex Olympus - reel weights (chosen from 30-config scan).
// mid=28 low=25 high=11 scatter=5  -> sum = 200
window.OlympusReelWeights = (function () {
  'use strict';
  var STRIP_LEN = 200;
  var COMMON = {
    'sym-4': 28, 'sym-5': 28, 'sym-6': 28, 'sym-7': 11,
    'sym-8': 25, 'sym-9': 25, 'sym-10': 25, 'sym-11': 25,
    'sym-12': 5
  };
  function clone(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
  function sumWeights(col) { var s = 0; for (var k in col) s += col[k]; return s; }
  function columnsOf(profile) {
    var out = [];
    for (var i = 0; i < 6; i++) out.push(clone(COMMON));
    out.forEach(function (c, idx) {
      var s = sumWeights(c);
      if (s !== STRIP_LEN) throw new Error('weights sum ' + s + ' col ' + idx);
    });
    return out;
  }
  return Object.freeze({
    STRIP_LEN: STRIP_LEN, COMMON: COMMON,
    WEIGHTS: columnsOf('real'),
    columnsOf: columnsOf, sumWeights: sumWeights
  });
})();
