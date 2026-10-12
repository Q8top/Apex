/* Apex - Symbols locked registry (cross-engine contract).
 *
 * LOCKED is the single source of truth for symbol ids, kinds
 * and paytable mapping. Engines read `kindOf(id)` / `list()`
 * directly from the frozen map. `assertSymbolsLocked(next)` is
 * provided for boot-time or test-time verification when a caller
 * maintains its own symbol list; current engines do not, so it is
 * exercised by tests/config/symbols-locked.test.cjs and reserved
 * for future engine-side guards.
 *
 * Mounted as window.ApexSymbolsLocked (frozen).
 * Byte-identical mirror at functions/_config/symbols.locked.js,
 * enforced by scripts/check-config-sync.sh in CI.
 *
 * kinds:
 *   regular    - base symbols paid by cluster / tumble
 *   scatter    - triggers free spins
 *   multiplier - free-spin multiplier bomb
 *
 * Public API (all synchronous, side-effect-free):
 *   assertSymbolsLocked(next)  throws if id set differs
 *                              (reserved; not called by engines)
 *   isLocked(id)               true if id registered
 *                              (used via alias, e.g. _lock.isLocked)
 *   list()                     id array in registration order
 *   kindOf(id)                 kind string or null
 *
 * Invariants (changing any requires a symbols version bump):
 *   - 11 ids: 9 regular + 1 scatter + 1 multiplier
 *   - entry.id === map key
 *   - entry.renderer === 'ApexSymbolsV2'
 *   - paytableKey is null for scatter and multiplier
 */
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

// assertSymbolsLocked: throws if id set differs from LOCKED.
// Returns true on success; kept for caller compatibility.
function assertSymbolsLocked(nextSymbols){
  if (!nextSymbols || typeof nextSymbols !== 'object'){
    throw new Error('SYMBOLS_LOCKED: input must be a non-null object');
  }
  var cur = Object.keys(LOCKED).sort().join(',');
  var nxt = Object.keys(nextSymbols).sort().join(',');
  // Note: literal 'SYMBOLS_LOCKED:' string rather than CODES.SYMBOLS_LOCKED
  // because this module loads before src/engine/errors.js in HTML order.
  // The engine error code of the same name is a separate protocol
  // constant used by throw sites in the engine layer.
  if (cur !== nxt) throw new Error('SYMBOLS_LOCKED: ' + cur + ' !== ' + nxt);
  return true;
}

// isLocked: hasOwnProperty guard, safe on prototype keys.
function isLocked(id){ return Object.prototype.hasOwnProperty.call(LOCKED, id); }

// list: returns a new array each call; safe to mutate.
function list(){ return Object.keys(LOCKED); }

// kindOf: null when unknown, never throws.
function kindOf(id){ if (!Object.prototype.hasOwnProperty.call(LOCKED, id)) return null; var s = LOCKED[id]; return s ? s.kind : null; }

// SYMBOLS_LOCKED flag on this object is a boot-check marker only.
// Distinct from the engine error code (see src/engine/errors.js
// CODES.SYMBOLS_LOCKED), which is a string used in throw sites.
window.ApexSymbolsLocked = Object.freeze({
  SYMBOLS_LOCKED: true,
  LOCKED: LOCKED,
  assertSymbolsLocked: assertSymbolsLocked,
  isLocked: isLocked,
  list: list,
  kindOf: kindOf
});
})();
