(function(){
'use strict';
var SNAPSHOT = Object.freeze({
  BLUE_CANDY:   Object.freeze({ 5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50, 9: 0.60, 10: 0.80, 11: 1.00, 12: 1.50 }),
  GREEN_CANDY:  Object.freeze({ 5: 0.25, 6: 0.40, 7: 0.50, 8: 0.60, 9: 0.80, 10: 1.00, 11: 1.50, 12: 2.00 }),
  PURPLE_CANDY: Object.freeze({ 5: 0.30, 6: 0.50, 7: 0.60, 8: 0.80, 9: 1.00, 10: 1.50, 11: 2.00, 12: 2.50 }),
  RED_CANDY:    Object.freeze({ 5: 0.40, 6: 0.60, 7: 0.80, 8: 1.00, 9: 1.50, 10: 2.00, 11: 2.50, 12: 3.00 }),
  STRAWBERRY:   Object.freeze({ 5: 0.50, 6: 1.00, 7: 1.50, 8: 2.00, 9: 3.00, 10: 5.00, 11: 10.0, 12: 15.0 }),
  ORANGE:       Object.freeze({ 5: 0.60, 6: 1.50, 7: 2.00, 8: 3.00, 9: 5.00, 10: 10.0, 11: 15.0, 12: 25.0 }),
  CHERRY:       Object.freeze({ 5: 0.75, 6: 2.00, 7: 3.00, 8: 5.00, 9: 10.0, 10: 15.0, 11: 25.0, 12: 50.0 }),
  GRAPE:        Object.freeze({ 5: 1.00, 6: 3.00, 7: 5.00, 8: 10.0, 9: 15.0, 10: 25.0, 11: 50.0, 12: 100.0 }),
  MANGO:        Object.freeze({ 5: 2.00, 6: 5.00, 7: 10.0, 8: 25.0, 9: 50.0, 10: 100.0, 11: 250.0, 12: 500.0 })
});
var MIN_MATCH = 5;
function verifyAgainst(actual){
  if (!actual) return false;
  var keys = Object.keys(SNAPSHOT);
  for (var i=0;i<keys.length;i++){
    var k = keys[i];
    var a = actual[k], b = SNAPSHOT[k];
    if (!a) throw new Error('SUGAR_PAYTABLE_MISMATCH: missing ' + k);
    var counts = Object.keys(b).map(Number);
    for (var j=0;j<counts.length;j++){
      var c = counts[j];
      if (a[c] !== b[c]) throw new Error('SUGAR_PAYTABLE_MISMATCH: ' + k + '[' + c + '] ' + a[c] + ' !== ' + b[c]);
    }
  }
  return true;
}
window.ApexSugarRushPaytableLocked = Object.freeze({
  PAYTABLE_SNAPSHOT: SNAPSHOT,
  MIN_MATCH: MIN_MATCH,
  verifyAgainst: verifyAgainst
});
})();
