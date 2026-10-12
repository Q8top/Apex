/* Apex - Paytable locked snapshot (cross-engine contract).
 *
 * SNAPSHOT maps regular symbol paytableKey -> { clusterSize: multiplier }.
 * Values are total multipliers (not bet-fractions). RTP is applied
 * downstream via payScale in math-profile; do not double-apply here.
 *
 * Mounted as window.ApexPaytableLocked (frozen).
 * Byte-identical mirror at functions/_config/paytable.locked.js,
 * enforced by scripts/check-config-sync.sh in CI.
 *
 * Contract:
 *   - SNAPSHOT keys === symbols.locked paytableKey set (9 keys)
 *   - scatter and multiplier symbols have paytableKey:null and are
 *     NOT present in SNAPSHOT
 *   - MIN_MATCH is the lowest cluster size that pays
 *   - cluster tiers per symbol derived from SNAPSHOT (currently 8/10/12);
 *     verifyAgainst reads tiers from SNAPSHOT, not a hardcoded list
 *
 * Public API:
 *   verifyAgainst(actual)  returns true when actual matches snapshot;
 *                          throws Error('PAYTABLE_MISMATCH: ...') on
 *                          missing key, extra key, or tier mismatch;
 *                          returns false when actual is falsy.
 *                          (Design note: unlike symbols.locked.
 *                          assertSymbolsLocked, this returns false for
 *                          a falsy argument instead of throwing.)
 *
 * Consumer status (audit round-check of files 1-10):
 *   PAYTABLE_SNAPSHOT  read by engines via _ptl alias.
 *   MIN_MATCH          read by engines via _ptl alias.
 *   verifyAgainst      TEST-ONLY: exercised by
 *                      tests/config/paytable-locked.test.cjs; no
 *                      production caller today. Kept as a
 *                      forward-compatible guard for future engine
 *                      integrations that build their own paytable.
 */
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
  var snapKeys = Object.keys(SNAPSHOT);
  var actKeys = Object.keys(actual);
  for (var x=0;x<actKeys.length;x++){
    if (snapKeys.indexOf(actKeys[x]) === -1){
      throw new Error('PAYTABLE_MISMATCH: extra ' + actKeys[x]);
    }
  }
  for (var i=0;i<snapKeys.length;i++){
    var k = snapKeys[i];
    var a = actual[k], b = SNAPSHOT[k];
    if (!a) throw new Error('PAYTABLE_MISMATCH: missing ' + k);
    var hs = Object.keys(b).map(Number).sort(function(p,q){ return p-q; });
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
