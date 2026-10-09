(function(){
'use strict';
var _err = window.ApexEngineErrors;

function calculatePayout(betMinor, multiplier){
  if (!Number.isSafeInteger(betMinor) || betMinor <= 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'betMinor must be positive integer');
  }
  if (!Number.isFinite(multiplier) || multiplier < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'multiplier must be >= 0 finite');
  }
  return Math.round(betMinor * multiplier);
}

function unitsToMinor(units, scale){
  scale = scale || 100;
  if (!Number.isFinite(units)) throw _err.ApexError(_err.CODES.INVALID_BET, 'units not finite');
  return Math.round(units * scale);
}

function minorToUnits(minor, scale){
  scale = scale || 100;
  if (!Number.isSafeInteger(minor)) throw _err.ApexError(_err.CODES.INVALID_BET, 'minor not integer');
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
