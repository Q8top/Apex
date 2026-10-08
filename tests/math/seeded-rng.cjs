'use strict';
/* Apex · SeededRng（模拟器专用，不进产品代码）
 * 确定性 xorshift32 + 拒绝采样消除 modulo bias
 * Node CJS 模块（.cjs，不受项目 "type": "module" 影响）
 */

function _hash(str){
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 16777619)) >>> 0;
  }
  return h === 0 ? 1 : h;
}

function SeededRng(seed, symbolWeights){
  if (typeof seed !== 'string' && typeof seed !== 'number'){
    throw new Error('SEEDED_RNG: seed must be string or number');
  }
  if (!symbolWeights || typeof symbolWeights !== 'object'){
    throw new Error('SEEDED_RNG: symbolWeights required');
  }
  var keys = Object.keys(symbolWeights);
  if (keys.length === 0) throw new Error('SEEDED_RNG: weights empty');
  this.entries = [];
  this.totalWeight = 0;
  for (var i = 0; i < keys.length; i++){
    var w = symbolWeights[keys[i]];
    if (!Number.isSafeInteger(w) || w <= 0){
      throw new Error('SEEDED_RNG: invalid weight ' + keys[i] + '=' + w);
    }
    this.entries.push([keys[i], w]);
    this.totalWeight += w;
  }
  this.state = _hash(String(seed));
}

SeededRng.prototype.nextUint32 = function(){
  var x = this.state;
  x ^= (x << 13) >>> 0;
  x = x >>> 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  this.state = x >>> 0;
  return this.state;
};

SeededRng.prototype.randomInt = function(max){
  if (!Number.isSafeInteger(max) || max <= 0){
    throw new Error('SEEDED_RNG: max must be positive integer');
  }
  var limit = Math.floor(0x100000000 / max) * max;
  var x;
  do { x = this.nextUint32(); } while (x >= limit);
  return x % max;
};

SeededRng.prototype.pickSymbol = function(){
  var roll = this.randomInt(this.totalWeight);
  for (var i = 0; i < this.entries.length; i++){
    var e = this.entries[i];
    if (roll < e[1]) return e[0];
    roll -= e[1];
  }
  throw new Error('SEEDED_RNG: exhausted');
};

SeededRng.prototype.generateGrid = function(){
  var out = new Array(30);
  for (var i = 0; i < 30; i++) out[i] = this.pickSymbol();
  return out;
};

SeededRng.prototype.getState = function(){ return this.state; };
SeededRng.prototype.clone = function(){
  var copy = Object.create(SeededRng.prototype);
  copy.entries = this.entries;
  copy.totalWeight = this.totalWeight;
  copy.state = this.state;
  return copy;
};

module.exports = { SeededRng: SeededRng };
