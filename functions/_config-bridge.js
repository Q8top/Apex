// Apex · Config Bridge
let _loaded = null;
export async function loadConfig() {
  if (_loaded) return _loaded;
  if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
  await import('./_config/version.js');
  await import('./_config/math-profile.js');
  await import('./_config/symbols.locked.js');
  await import('./_config/paytable.locked.js');
  _loaded = {
    Version: globalThis.window.ApexVersion,
    MathProfile: globalThis.window.ApexMathProfile,
    SymbolsLocked: globalThis.window.ApexSymbolsLocked,
    PaytableLocked: globalThis.window.ApexPaytableLocked
  };
  return _loaded;
}
export function isConfigLoaded() { return _loaded !== null; }
