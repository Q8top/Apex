(function(){
'use strict';
var LOCKED = Object.freeze({
  banana:          Object.freeze({ id:'banana',          kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'BANANA' }),
  grape:           Object.freeze({ id:'grape',           kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'GRAPE' }),
  watermelon:      Object.freeze({ id:'watermelon',      kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'WATERMELON' }),
  plum:            Object.freeze({ id:'plum',            kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'PLUM' }),
  apple:           Object.freeze({ id:'apple',           kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'APPLE' }),
  blue_candy:      Object.freeze({ id:'blue_candy',      kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'BLUE_CANDY' }),
  green_candy:     Object.freeze({ id:'green_candy',     kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'GREEN_CANDY' }),
  purple_candy:    Object.freeze({ id:'purple_candy',    kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'PURPLE_CANDY' }),
  red_heart_candy: Object.freeze({ id:'red_heart_candy', kind:'regular',    renderer:'ApexSymbolsV2', paytableKey:'RED_HEART' }),
  lollipop:        Object.freeze({ id:'lollipop',        kind:'scatter',    renderer:'ApexSymbolsV2', paytableKey:null }),
  multiplier_bomb: Object.freeze({ id:'multiplier_bomb', kind:'multiplier', renderer:'ApexSymbolsV2', paytableKey:null })
});
function assertSymbolsLocked(nextSymbols){
  var cur = Object.keys(LOCKED).sort().join(',');
  var nxt = Object.keys(nextSymbols).sort().join(',');
  if (cur !== nxt) throw new Error('SYMBOLS_LOCKED: ' + cur + ' !== ' + nxt);
  return true;
}
function isLocked(id){ return Object.prototype.hasOwnProperty.call(LOCKED, id); }
function list(){ return Object.keys(LOCKED); }
function kindOf(id){ var s = LOCKED[id]; return s ? s.kind : null; }
window.ApexSymbolsLocked = Object.freeze({
  SYMBOLS_LOCKED: true,
  LOCKED: LOCKED,
  assertSymbolsLocked: assertSymbolsLocked,
  isLocked: isLocked,
  list: list,
  kindOf: kindOf
});
})();
