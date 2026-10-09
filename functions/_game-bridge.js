// Apex · Game Bridge
let _loaded = null;
export async function loadServerEngine() {
  if (_loaded) return _loaded;
  if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
  await import('./_engine/errors.js');
  await import('./_engine/grid.js');
  await import('./_engine/rng.js');
  await import('./_engine/multiplier.js');
  await import('./_engine/evaluator.js');
  await import('./_engine/tumble.js');
  await import('./_engine/bonus.js');
  await import('./_engine/payout.js');
  await import('./_engine/game-engine.js');
  _loaded = {
    GameEngine: globalThis.window.ApexEngineGameEngine && globalThis.window.ApexEngineGameEngine.GameEngine,
    Rng: globalThis.window.ApexEngineRng && globalThis.window.ApexEngineRng.Rng,
    MathProfile: globalThis.window.ApexMathProfile,
    Errors: globalThis.window.ApexEngineErrors
  };
  if (!_loaded.GameEngine) throw new Error('BRIDGE_ENGINE_LOAD_FAILED');
  return _loaded;
}
export function isEngineLoaded() { return _loaded !== null; }
