(function(){
'use strict';
var _err = window.ApexSugarRushErrors;
var GRID_SIZE = 49;
var MAX_MARK = 128;
var MIN_MARK = 2;
function MultiplierState(){ this.positions = new Map(); }
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
  var sum = 0; this.positions.forEach(function(v){ sum += v; }); return sum;
};
MultiplierState.prototype.clear = function(){ this.positions.clear(); };
MultiplierState.prototype.size = function(){ return this.positions.size; };
MultiplierState.prototype.snapshot = function(){
  var out = [];
  this.positions.forEach(function(v, k){ out.push({ position: k, value: v }); });
  return out;
};
function MarkState(opts){
  opts = opts || {};
  this.marks = new Int32Array(GRID_SIZE);
  if (opts.fromSnapshot) this.restore(opts.fromSnapshot);
}
MarkState.prototype._check = function(pos){
  if (!Number.isInteger(pos) || pos < 0 || pos >= GRID_SIZE){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'mark pos out of range');
  }
};
MarkState.prototype.get = function(pos){
  this._check(pos); return this.marks[pos];
};
MarkState.prototype.set = function(pos, value){
  this._check(pos);
  if (value !== 0 && (!Number.isInteger(value) || value < MIN_MARK || value > MAX_MARK)){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'mark value invalid');
  }
  this.marks[pos] = value;
};
MarkState.prototype.sumInCluster = function(positions){
  var s = 0;
  for (var i = 0; i < positions.length; i++){
    var v = this.marks[positions[i]];
    if (v > 0) s += v;
  }
  return s;
};
MarkState.prototype.upgradeOnExplosion = function(removed){
  var up = [];
  for (var i = 0; i < removed.length; i++){
    var p = removed[i];
    if (this.marks[p] > 0){
      var from = this.marks[p];
      var to = from * 2 > MAX_MARK ? MAX_MARK : from * 2;
      this.marks[p] = to;
      up.push({ position: p, from: from, to: to });
    }
  }
  return up;
};
MarkState.prototype.seedNewMarks = function(removed, rng, prob){
  if (prob == null) prob = 1.0;
  var sp = [];
  for (var i = 0; i < removed.length; i++){
    var p = removed[i];
    if (this.marks[p] !== 0) continue;
    if (prob < 1){
      var r = rng.randomInt(1000000) / 1000000;
      if (r > prob) continue;
    }
    this.marks[p] = MIN_MARK;
    sp.push({ position: p, value: MIN_MARK });
  }
  return sp;
};
MarkState.prototype.reset = function(){ this.marks.fill(0); };
MarkState.prototype.snapshot = function(){
  var out = [];
  for (var i = 0; i < GRID_SIZE; i++){
    if (this.marks[i] > 0) out.push([i, this.marks[i]]);
  }
  return out;
};
MarkState.prototype.restore = function(snap){
  this.marks.fill(0);
  if (!Array.isArray(snap)) return;
  for (var i = 0; i < snap.length; i++){
    var p = snap[i];
    if (!Array.isArray(p) || p.length !== 2) continue;
    if (!Number.isInteger(p[0]) || p[0] < 0 || p[0] >= GRID_SIZE) continue;
    if (!Number.isInteger(p[1]) || p[1] < MIN_MARK || p[1] > MAX_MARK) continue;
    this.marks[p[0]] = p[1];
  }
};
MarkState.prototype.visual = function(){
  var out = [];
  for (var i = 0; i < GRID_SIZE; i++){
    if (this.marks[i] > 0) out.push({ position: i, value: this.marks[i] });
  }
  return out;
};
window.ApexSugarRushMultiplier = Object.freeze({
  MultiplierState: MultiplierState,
  MarkState: MarkState,
  GRID_SIZE: GRID_SIZE,
  MIN_MARK: MIN_MARK,
  MAX_MARK: MAX_MARK
});
})();
