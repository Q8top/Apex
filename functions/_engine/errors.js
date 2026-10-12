/* Apex - Engine error codes and constructor.
 *
 * Mounted as window.ApexEngineErrors (frozen).
 * Byte-identical mirror at functions/_engine/errors.js.
 *
 * Every throw site in the engine/provider/wallet layers must use
 * CODES.<NAME> rather than a string literal, so callers can branch
 * on e.code without parsing message text. Verified at audit time:
 * zero literal-code throw sites across src/engine, src/core,
 * src/provider, src/wallet, functions/_engine.
 *
 * CODE inventory (consumer file count as of this audit):
 *   INVALID_MODE             3   bad spin mode string
 *   INVALID_BET              9   non-integer or out-of-range bet
 *   INSUFFICIENT_BALANCE     1   wallet refuses debit
 *   SPIN_NOT_ALLOWED         1   spin attempted while phase busy
 *   PROVIDER_UNAVAILABLE     6   provider/wallet missing
 *   INVALID_RESULT           3   provider returned malformed result
 *   NETWORK_ERROR            5   transport failure to backend
 *   INVALID_MAX              4   RNG upper bound invalid
 *   INVALID_MULTIPLIER      14   payout multiplier out of range
 *   INVALID_GRID_SIZE       11   grid array length mismatch
 *   RNG_SYMBOL_NOT_FOUND     4   weighted pick hit empty bucket
 *   INVALID_WEIGHTS          6   weight table malformed
 *
 * RESERVED (defined for forward-compat; zero consumers today):
 *   SPIN_IN_PROGRESS         -   planned client-side reentry guard
 *   RTP_HARD_LIMIT           -   planned server-side RTP cap guard
 *   SYMBOLS_LOCKED           -   the config/symbols.locked.js module
 *                                throws a literal 'SYMBOLS_LOCKED:'
 *                                string because it loads before this
 *                                file; the constant exists so future
 *                                engine-side guards can branch on it.
 *   Do not remove; server-side guards are being added incrementally
 *   and these codes are already baked into protocol reasoning.
 *
 * ApexError(code, message):
 *   - returns an Error instance with .name = 'ApexError',
 *     .code = code (string), .apex = true marker (parity with
 *     ApexSugarRushErrors.ApexError).
 *   - if code is not a non-empty string, it is normalized to
 *     'UNKNOWN' and the original value is preserved on
 *     .originalCode for forensic logging.
 */
(function(){
'use strict';
var CODES = Object.freeze({
  INVALID_MODE: 'INVALID_MODE',
  INVALID_BET: 'INVALID_BET',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SPIN_IN_PROGRESS: 'SPIN_IN_PROGRESS',
  SPIN_NOT_ALLOWED: 'SPIN_NOT_ALLOWED',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  INVALID_RESULT: 'INVALID_RESULT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SYMBOLS_LOCKED: 'SYMBOLS_LOCKED',
  RTP_HARD_LIMIT: 'RTP_HARD_LIMIT',
  INVALID_MAX: 'INVALID_MAX',
  INVALID_MULTIPLIER: 'INVALID_MULTIPLIER',
  INVALID_GRID_SIZE: 'INVALID_GRID_SIZE',
  RNG_SYMBOL_NOT_FOUND: 'RNG_SYMBOL_NOT_FOUND',
  INVALID_WEIGHTS: 'INVALID_WEIGHTS'
});

function ApexError(code, message){
  var safeCode = (typeof code === 'string' && code.length > 0) ? code : 'UNKNOWN';
  var msg = (message != null) ? String(message) : safeCode;
  var e = new Error(msg);
  e.code = safeCode;
  if (safeCode === 'UNKNOWN' && code !== 'UNKNOWN') e.originalCode = code;
  e.apex = true;
  e.name = 'ApexError';
  return e;
}

window.ApexEngineErrors = Object.freeze({ CODES: CODES, ApexError: ApexError });
})();
