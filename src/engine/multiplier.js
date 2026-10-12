/* Apex - Multiplier position map (Sweet Bonanza).
 *
 * Mounted as window.ApexEngineMultiplier (frozen).
 * Byte-identical mirror at functions/_engine/multiplier.js.
 *
 * Consumer status (audit of file 11/85):
 *   - PRODUCTION: none. The Sweet game engine implements the
 *     free-spins bomb accumulation inline in src/engine/game-engine.js
 *     (bombSum += rollBombValue; bombFactor = bombSum > 0 ? bombSum
 *     : 1). MultiplierState is a standalone primitive that is not
 *     used by the current engine path.
 *   - TEST: tests/engine/all.test.cjs exercises the class API.
 *   - debug-boot registers it in the boot check list.
 *
 * Kept because:
 *   - Sugar Rush has an independent but equivalent MultiplierState
 *     in src/games/sugar-rush/engine/multiplier.js (connected to its
 *     own mark accumulation); Sweet and SR are expected to converge
 *     if the engines are ever unified.
 *   - Removing would break the boot check registry and 12 existing
 *     test assertions in tests/engine/all.test.cjs.
 *
 * Contract:
 *   new MultiplierState()
 *     .add(position, value)  position: integer in [0, GRID.size)
 *                            value:    finite > 0; overwrites same pos
 *     .total()               sum of all current values
 *     .clear()               removes all entries
 *     .size()                number of entries
 *     .snapshot()            array of {position, value}, insertion order
 *
 * Bounds:
 *   position must be a non-negative integer below ApexEngineGrid.GRID.size
 *   (30 for Sweet). Grid may not be loaded at call time; when it is not,
 *   only the non-negative integer check is enforced.
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;

function _gridSize(){
  if (window.ApexEngineGrid && window.ApexEngineGrid.GRID &&
      Number.isSafeInteger(window.ApexEngineGrid.GRID.size)){
    return window.ApexEngineGrid.GRID.size;
  }
  return null;
}

function MultiplierState(){
  this.positions = new Map();
}

MultiplierState.prototype.add = function(position, value){
  if (!Number.isInteger(position) || position < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'position invalid');
  }
  var gs = _gridSize();
  if (gs !== null && position >= gs){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'position out of range (grid ' + gs + ')');
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
