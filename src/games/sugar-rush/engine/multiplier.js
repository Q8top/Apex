(function(){
'use strict';
/* Apex Sugar Rush · position-marked multipliers (原版还原)
 *
 * 原版规则 (Pragmatic Play Sugar Rush):
 *   1. 每次获胜，获胜位置被"标记"
 *   2. 第 1 次获胜：未标记 → 仅标记（无乘数）
 *   3. 第 2 次获胜：仅标记 → 2x
 *   4. 第 3 次起：2x → 4x → 8x → ... → 128x (封顶)
 *
 * 计算顺序:
 *   - 用本轮开始时的乘数结算当前簇
 *   - 然后更新簇位置的值（用于后续回合）
 *   - 新创建/翻倍的乘数不影响本轮派彩
 *
 * State 语义:
 *   0 = 未标记
 *   1 = 已标记（无乘数）
 *   2 = 2x
 *   4 = 4x
 *   8 = 8x
 *   ...
 *   128 = 128x (封顶)
 */
var _err = window.ApexSugarRushErrors;
var GRID_SIZE = 49;
var MAX_MULT = 128;
var MARKED = 1;

function MultiplierState(){ this.positions = new Map(); }
MultiplierState.prototype.add = function(position, value){
  if (!Number.isInteger(position) || position < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, "position invalid");
  }
  if (!Number.isFinite(value) || value <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, "value invalid");
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
  this._check(pos);
  return this.marks[pos];
};
MarkState.prototype.set = function(pos, value){
  this._check(pos);
  if (value !== 0 && value !== MARKED && value >= 2 && (value & (value - 1)) !== 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, "mark value must be power of 2");
  }
  if (value !== 0 && value !== MARKED &&
      (!Number.isInteger(value) || value < 2 || value > MAX_MULT)){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'mark value invalid');
  }
  this.marks[pos] = value;
};

/* 计算簇的乘数之和（用当前已存在的乘数，不含标记） */
MarkState.prototype.sumInCluster = function(positions){
  var s = 0;
  for (var i = 0; i < positions.length; i++){
    var v = this.marks[positions[i]];
    if (v >= 2) s += v;
  }
  return s;
};

/* 更新本轮获胜位置的值（用于后续回合）
 * 原版语义:
 *   0 -> 1     (首次获胜：仅标记)
 *   1 -> 2     (第二次获胜：出现 2x)
 *   2 -> 4     (第三次获胜：翻倍)
 *   ...
 *   128 -> 128 (封顶)
 */
MarkState.prototype.updateAfterWin = function(positions){
  var updates = [];
  for (var i = 0; i < positions.length; i++){
    var p = positions[i];
    var from = this.marks[p];
    var to;
    if (from === 0) to = MARKED;
    else if (from === MARKED) to = 2;
    else to = from * 2 > MAX_MULT ? MAX_MULT : from * 2;
    this.marks[p] = to;
    updates.push({ position: p, from: from, to: to });
  }
  return updates;
};

/* 向后兼容：老名字 */
MarkState.prototype.upgradeOnExplosion = MarkState.prototype.updateAfterWin;

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
    if (!Number.isInteger(p[1]) || p[1] < 0 || p[1] > MAX_MULT) continue;
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
  MARKED: MARKED,
  MAX_MARK: MAX_MULT
});
})();
