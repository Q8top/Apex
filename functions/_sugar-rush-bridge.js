// Apex · Sugar Rush Bridge (isolated from candy)
let _engineLoaded = null;
let _configLoaded = null;

export async function loadSugarRushEngine() {
  if (_engineLoaded) return _engineLoaded;
  if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

  await import('./games/sugar-rush/engine/errors.js');
  await import('./games/sugar-rush/engine/grid.js');
  await import('./games/sugar-rush/engine/rng.js');
  await import('./games/sugar-rush/engine/payout.js');
  await import('./games/sugar-rush/engine/multiplier.js');
  await import('./games/sugar-rush/config/symbols.locked.js');
  await import('./games/sugar-rush/config/paytable.locked.js');
  await import('./games/sugar-rush/config/math-profile.js');
  await import('./games/sugar-rush/config/math-profile.real.js');
  await import('./games/sugar-rush/engine/evaluator.js');
  await import('./games/sugar-rush/engine/tumble.js');
  await import('./games/sugar-rush/engine/bonus.js');
  await import('./games/sugar-rush/engine/cap.js');
  await import('./games/sugar-rush/engine/game-engine.js');

  const w = globalThis.window;
  _engineLoaded = {
    Engine: w.ApexSugarRushGameEngine,
    Rng: w.ApexSugarRushRng,
    MathProfile: w.ApexSugarRushMathProfile,
    Errors: w.ApexSugarRushErrors
  };
  if (!_engineLoaded.Engine || typeof _engineLoaded.Engine.spin !== 'function') {
    throw new Error('SUGAR_BRIDGE_ENGINE_LOAD_FAILED');
  }
  return _engineLoaded;
}

export async function loadSugarRushConfig() {
  if (_configLoaded) return _configLoaded;
  if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

  await import('./games/sugar-rush/config/symbols.locked.js');
  await import('./games/sugar-rush/config/paytable.locked.js');
  await import('./games/sugar-rush/config/math-profile.js');

  const w = globalThis.window;
  var demo = w.ApexSugarRushMathProfile;
  var real = w.ApexSugarRushMathProfileReal;
  var _idMap = demo.ID_MAP;
  var _getProfile = function(m){
    if (m === 'real') return real.getReal();
    return demo.getProfile(m);
  };
  var merged = Object.freeze({
    VERSION: demo.VERSION,
    PROFILES: demo.PROFILES,
    ID_MAP: _idMap,
    buildRngWeights: function(mode, opts){
      opts = opts || {};
      var p = _getProfile(mode);
      var out = {};
      var keys = Object.keys(p.baseWeights);
      for (var i = 0; i < keys.length; i++){
        var id = _idMap[keys[i]] || keys[i].toLowerCase();
        out[id] = p.baseWeights[keys[i]];
      }
      if (p.scatterWeight > 0) out.lollipop = p.scatterWeight;
      var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
      if (mw > 0) out.candy_bomb = mw;
      return out;
    },
    validate: demo.validate,
    getProfile: _getProfile
  });
  _configLoaded = {
    Version: { VERSION: { game: demo.VERSION, math: demo.VERSION } },
    MathProfile: merged,
    SymbolsLocked: w.ApexSugarRushSymbolsLocked,
    PaytableLocked: w.ApexSugarRushPaytableLocked
  };
  return _configLoaded;
}

export function isSugarRushLoaded() { return _engineLoaded !== null && _configLoaded !== null; }
