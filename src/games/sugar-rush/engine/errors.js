(function(){
'use strict';
var CODES = Object.freeze({
  INVALID_GRID_SIZE: 'INVALID_GRID_SIZE',
  INVALID_MAX: 'INVALID_MAX',
  INVALID_WEIGHTS: 'INVALID_WEIGHTS',
  RNG_SYMBOL_NOT_FOUND: 'RNG_SYMBOL_NOT_FOUND',
  INVALID_BET: 'INVALID_BET',
  INVALID_MULTIPLIER: 'INVALID_MULTIPLIER',
  INVALID_MODE: 'INVALID_MODE',
  ENGINE_HALT: 'ENGINE_HALT'
});
function ApexError(code, msg){
  var e = new Error(msg || code);
  e.code = code;
  e.apex = true;
  return e;
}
window.ApexSugarRushErrors = Object.freeze({ CODES: CODES, ApexError: ApexError });
})();
