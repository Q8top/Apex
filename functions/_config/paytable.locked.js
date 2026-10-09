(function(){
'use strict';
var SNAPSHOT = Object.freeze({
  BANANA:       Object.freeze({ 8: 0.25, 10: 0.75, 12: 2 }),
  GRAPE:        Object.freeze({ 8: 0.4,  10: 0.9,  12: 4 }),
  WATERMELON:   Object.freeze({ 8: 0.5,  10: 1.0,  12: 5 }),
  PLUM:         Object.freeze({ 8: 0.8,  10: 1.2,  12: 8 }),
  APPLE:        Object.freeze({ 8: 1.0,  10: 1.5,  12: 10 }),
  BLUE_CANDY:   Object.freeze({ 8: 1.5,  10: 2.0,  12: 12 }),
  GREEN_CANDY:  Object.freeze({ 8: 2.0,  10: 5.0,  12: 15 }),
  PURPLE_CANDY: Object.freeze({ 8: 2.5,  10: 10.0, 12: 25 }),
  RED_HEART:    Object.freeze({ 8: 10.0, 10: 25.0, 12: 50 })
});
var MIN_MATCH = 8;
function verifyAgainst(actual){
  if (!actual) return false;
  var keys = Object.keys(SNAPSHOT);
  for (var i=0;i<keys.length;i++){
    var k = keys[i];
    var a = actual[k], b = SNAPSHOT[k];
    if (!a) throw new Error('PAYTABLE_MISMATCH: missing ' + k);
    var hs = [8,10,12];
    for (var j=0;j<hs.length;j++){
      var h = hs[j];
      if (a[h] !== b[h]) throw new Error('PAYTABLE_MISMATCH: ' + k + '[' + h + '] ' + a[h] + ' !== ' + b[h]);
    }
  }
  return true;
}
window.ApexPaytableLocked = Object.freeze({
  PAYTABLE_SNAPSHOT: SNAPSHOT,
  MIN_MATCH: MIN_MATCH,
  verifyAgainst: verifyAgainst
});
})();
