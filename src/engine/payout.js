/* Apex - Payout / unit conversion / money formatting.
 *
 * Mounted as window.ApexEnginePayout (frozen).
 * Byte-identical mirror at functions/_engine/payout.js.
 *
 * SWEET BONANZA ROUNDING POLICY:
 *   calculatePayout uses Math.round(betMinor * multiplier).
 *   Sugar Rush's independent engine uses Math.floor for the same
 *   expression. This is an INTENTIONAL divergence: the two games
 *   have separately calibrated RTP targets and the rounding
 *   direction feeds into that calibration. Do not 'unify' them
 *   without re-running both RTP gates.
 *
 * UNIT CONVENTIONS:
 *   minor    - integer number of smallest currency units (e.g. cents)
 *              betMinor, winMinor, wallet balances are all in minor
 *   units    - decimal number of display units (e.g. 1.50 for 1.50 CNY)
 *   scale    - conversion factor; default 100 (2 minor per 1 unit)
 *              must be a positive safe integer; scale=0 and negative
 *              scale are rejected (previously scale=0 silently fell
 *              back to 100 and negative scale returned negative minor)
 *
 * OVERFLOW POLICY:
 *   calculatePayout guards the product betMinor * multiplier against
 *   Number.MAX_SAFE_INTEGER; overflow throws INVALID_MULTIPLIER
 *   instead of silently losing precision.
 *
 * LOCALE NOTE:
 *   formatMinor uses a hardcoded ',' thousands separator. It is a
 *   display helper for server logs and fallback paths, NOT the
 *   player-facing formatter (that lives in the UI layer with
 *   Intl.NumberFormat). Changing the separator here requires a
 *   corresponding UI change to stay consistent.
 */
(function(){
'use strict';
var _err = window.ApexEngineErrors;

function _validScale(scale){
  return Number.isSafeInteger(scale) && scale > 0;
}

function calculatePayout(betMinor, multiplier){
  if (!Number.isSafeInteger(betMinor) || betMinor <= 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'betMinor must be positive integer');
  }
  if (!Number.isFinite(multiplier) || multiplier < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'multiplier must be >= 0 finite');
  }
  var product = betMinor * multiplier;
  if (!Number.isFinite(product) || product > Number.MAX_SAFE_INTEGER){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'product exceeds MAX_SAFE_INTEGER');
  }
  return Math.round(product);
}

function unitsToMinor(units, scale){
  if (!Number.isFinite(units)){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'units not finite');
  }
  if (scale === undefined) scale = 100;
  if (!_validScale(scale)){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'scale must be positive safe integer');
  }
  var product = units * scale;
  if (!Number.isFinite(product) || Math.abs(product) > Number.MAX_SAFE_INTEGER){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'units*scale exceeds MAX_SAFE_INTEGER');
  }
  return Math.round(product);
}

function minorToUnits(minor, scale){
  if (!Number.isSafeInteger(minor)){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'minor not integer');
  }
  if (scale === undefined) scale = 100;
  if (!_validScale(scale)){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'scale must be positive safe integer');
  }
  return minor / scale;
}

function formatMinor(minor, symbol){
  if (!Number.isSafeInteger(minor)){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'minor not integer');
  }
  var sign = minor < 0 ? '-' : '';
  var abs = Math.abs(minor);
  var units = Math.floor(abs / 100);
  var cents = abs % 100;
  var s = String(units).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  var c = cents < 10 ? '0' + cents : String(cents);
  return sign + (symbol || '') + s + '.' + c;
}

window.ApexEnginePayout = Object.freeze({
  calculatePayout: calculatePayout,
  unitsToMinor: unitsToMinor,
  minorToUnits: minorToUnits,
  formatMinor: formatMinor
});
})();
