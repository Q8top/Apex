(function(){
'use strict';
var _err = window.ApexEngineErrors;
function MultiplierState(){
  this.positions = new Map();
}
MultiplierState.prototype.add = function(position, value){
  if (!Number.isInteger(position) || position < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'position invalid');
  }
  if (!Number.isFinite(value) || value <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'value invalid');
  }
  this.positions.set(position, value);
};
MultiplierState.prototype.total = function(){
  var sum = 0;
  this.positions.forEach(function(v){ sum += v; });
  return sum;
};
MultiplierState.prototype.clear = function(){ this.positions.clear(); };
MultiplierState.prototype.size = function(){ return this.positions.size; };
MultiplierState.prototype.snapshot = function(){
  var out = [];
  this.positions.forEach(function(v, k){ out.push({ position: k, value: v }); });
  return out;
};
window.ApexEngineMultiplier = Object.freeze({ MultiplierState: MultiplierState });
})();
