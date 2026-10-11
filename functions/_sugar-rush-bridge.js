// Apex · Sugar Rush Bridge (isolated from candy)
// Key fix: build merged MathProfile THEN write back to window BEFORE engine imports.
let _engineLoaded = null;
let _configLoaded = null;

function ensureWindow() {
  if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
  return globalThis.window;
}

export async function loadSugarRushConfig() {
  if (_configLoaded) return _configLoaded;
  const w = ensureWindow();

  await import('./games/sugar-rush/config/symbols.locked.js');
  await import('./games/sugar-rush/config/paytable.locked.js');
  await import('./games/sugar-rush/config/math-profile.js');
  await import('./games/sugar-rush/config/math-profile.real.js');

  const demo = w.ApexSugarRushMathProfile;
  const real = w.ApexSugarRushMathProfileReal;
  if (!demo || !real) throw new Error('SUGAR_BRIDGE_PROFILE_MISSING');

  const _idMap = demo.ID_MAP;
  const _getProfile = function (m) {
    if (m === 'real') return real.getReal();
    if (m === 'demo') return demo.PROFILES.demo;
    throw new Error('SUGAR_BRIDGE_UNKNOWN_MODE:' + m);
  };

  const merged = Object.freeze({
    VERSION: real.VERSION,
    PROFILES: demo.PROFILES,
    ID_MAP: _idMap,
    buildRngWeights: function (mode, opts) {
      opts = opts || {};
      const p = _getProfile(mode);
      const out = {};
      const keys = Object.keys(p.baseWeights);
      for (let i = 0; i < keys.length; i++) {
        out[_idMap[keys[i]] || keys[i].toLowerCase()] = p.baseWeights[keys[i]];
      }
      const sw = (opts.fsMode && typeof p.fsScatterWeight === 'number')
        ? p.fsScatterWeight : p.scatterWeight;
      if (sw > 0) out.lollipop = sw;
      const mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
      if (mw > 0) out.candy_bomb = mw;
      return out;
    },
    validate: demo.validate,
    getProfile: _getProfile
  });

  // ★ 核心：回写全局，让引擎 import 时捕获到正确对象
  w.ApexSugarRushMathProfile = merged;

  _configLoaded = {
    Version: { VERSION: { game: '2.0.0', math: real.VERSION } },
    MathProfile: merged,
    SymbolsLocked: w.ApexSugarRushSymbolsLocked,
    PaytableLocked: w.ApexSugarRushPaytableLocked
  };
  return _configLoaded;
}

export async function loadSugarRushEngine() {
  if (_engineLoaded) return _engineLoaded;
  ensureWindow();

  // ★ 先回写 MathProfile，再 import 引擎
  await loadSugarRushConfig();

  await import('./games/sugar-rush/engine/errors.js');
  await import('./games/sugar-rush/engine/grid.js');
  await import('./games/sugar-rush/engine/rng.js');
  await import('./games/sugar-rush/engine/payout.js');
  await import('./games/sugar-rush/engine/multiplier.js');
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
  if (!_engineLoaded.Engine || typeof _engineLoaded.Engine.spinBase !== 'function') {
    throw new Error('SUGAR_BRIDGE_ENGINE_LOAD_FAILED');
  }
  return _engineLoaded;
}

export function isSugarRushLoaded() { return _engineLoaded !== null && _configLoaded !== null; }
