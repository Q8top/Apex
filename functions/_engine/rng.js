/* Apex - Cryptographic RNG for Sweet Bonanza engine.
 *
 * Mounted as window.ApexEngineRng (frozen).
 * Byte-identical mirror at functions/_engine/rng.js.
 *
 * Randomness source: crypto.getRandomValues (Web Crypto).
 * Never Math.random: engine output must be unpredictable to the
 * client even in demo mode so distribution tests and difficulty
 * calibration are not gameable by monkey-patching Math.random.
 *
 * randomInt(max):
 *   Uniform integer in [0, max). Uses rejection sampling to remove
 *   modulo bias. max must be a safe integer in [1, 2^32 - 1].
 *   Above 2^32-1 a single 32-bit draw cannot cover the range and
 *   the rejection loop would never terminate; we throw
 *   INVALID_MAX instead. (Prior audit found a live infinite loop
 *   for max > 2^32; fixed here.)
 *
 * Rng(weights):
 *   weights: { symbolId: positiveSafeIntegerWeight }
 *   - non-object, empty, or any non-positive/non-integer weight
 *     throws INVALID_WEIGHTS
 *   - total accumulation overflow throws INVALID_WEIGHTS
 *   - instance is frozen; entries and totalWeight are read-only
 *     to prevent tampering with the distribution after construction
 *
 * Methods:
 *   randomInt(max)      - passthrough to the module-level randomInt
 *   pickSymbol()        - weighted pick, throws RNG_SYMBOL_NOT_FOUND
 *                         only if the internal table is corrupted
 *   generateGrid()      - 30 draws; requires ApexEngineGrid to be
 *                         loaded (throws INVALID_GRID_SIZE otherwise)
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _buf = new Uint32Array(1);

var MAX_RANGE = 0xFFFFFFFF; // 2^32 - 1, largest safe single-draw range

function _getCrypto(){
  if (typeof globalThis !== 'undefined' && globalThis.crypto &&
      typeof globalThis.crypto.getRandomValues === 'function'){
    return globalThis.crypto;
  }
  if (typeof crypto !== 'undefined' && crypto &&
      typeof crypto.getRandomValues === 'function'){
    return crypto;
  }
  return null;
}

function randomInt(max){
  if (!Number.isSafeInteger(max) || max <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MAX, 'max must be positive safe integer');
  }
  if (max > MAX_RANGE){
    throw _err.ApexError(_err.CODES.INVALID_MAX, 'max out of range (max ' + MAX_RANGE + ')');
  }
  var c = _getCrypto();
  if (!c){
    throw _err.ApexError(_err.CODES.INVALID_MAX, 'crypto.getRandomValues unavailable');
  }
  var limit = Math.floor(0x100000000 / max) * max;
  do { c.getRandomValues(_buf); } while (_buf[0] >= limit);
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
      throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, 'total overflow');
    }
    entries.push(Object.freeze([keys[i], w]));
    total += w;
  }
  Object.defineProperty(this, 'entries', { value: Object.freeze(entries), enumerable: true, writable: false, configurable: false });
  Object.defineProperty(this, 'totalWeight', { value: total, enumerable: true, writable: false, configurable: false });
  Object.freeze(this);
}

Rng.prototype.randomInt = function(max){
  return randomInt(max);
};

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
  if (!window.ApexEngineGrid || !window.ApexEngineGrid.GRID){
    throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'ApexEngineGrid not loaded');
  }
  var size = window.ApexEngineGrid.GRID.size;
  var out = new Array(size);
  for (var i = 0; i < size; i++) out[i] = this.pickSymbol();
  return out;
};

window.ApexEngineRng = Object.freeze({ randomInt: randomInt, Rng: Rng, MAX_RANGE: MAX_RANGE });
})();
