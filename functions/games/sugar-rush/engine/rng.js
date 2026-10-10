(function(){
'use strict';
var _err = window.ApexSugarRushErrors;
var _buf = new Uint32Array(1);
function randomInt(max){
  if (!Number.isSafeInteger(max) || max <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MAX, 'max must be positive safe integer');
  }
  var limit = Math.floor(0x100000000 / max) * max;
  do { crypto.getRandomValues(_buf); } while (_buf[0] >= limit);
  return _buf[0] % max;
}
function Rng(symbolWeights){
  if (!symbolWeights || typeof symbolWeights !== 'object'){
    throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, 'weights required');
  }
  var keys = Object.keys(symbolWeights);
  if (keys.length === 0){
    throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, 'weights empty');
  }
  var entries = [];
  var total = 0;
  for (var i = 0; i < keys.length; i++){
    var w = symbolWeights[keys[i]];
    if (!Number.isSafeInteger(w) || w <= 0){
      throw _err.ApexError(_err.CODES.INVALID_WEIGHTS,
        'weight must be positive safe integer (got ' + w + ' for ' + keys[i] + ')');
    }
    if (!Number.isSafeInteger(total + w)){
      throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, "total overflow");
    }
    entries.push([keys[i], w]);
    total += w;
  }
  this.entries = entries;
  this.totalWeight = total;
}
Rng.prototype.randomInt = function(max){ return randomInt(max); };
Rng.prototype.pickSymbol = function(){
  var roll = randomInt(this.totalWeight);
  for (var i = 0; i < this.entries.length; i++){
    var e = this.entries[i];
    if (roll < e[1]) return e[0];
    roll -= e[1];
  }
  throw _err.ApexError(_err.CODES.RNG_SYMBOL_NOT_FOUND, 'exhausted');
};
Rng.prototype.generateGrid = function(){
  var size = window.ApexSugarRushGrid.GRID.size;
  var out = new Array(size);
  for (var i = 0; i < size; i++) out[i] = this.pickSymbol();
  return out;
};
window.ApexSugarRushRng = Object.freeze({ randomInt: randomInt, Rng: Rng });
})();
