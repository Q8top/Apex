(function(){
'use strict';
/* Apex Sugar Rush · 派彩截断统一入口 (P0-1)
 * 目的：把 max-win 截断从 payScale 之后 移到 payScale 之前
 *       让 maxWinMultiplier (bet 倍数语义) 与 payScale (展示倍数语义) 解耦
 */
var _err = window.ApexSugarRushErrors;

function applyCap(rawWin, payScale, maxWinMultiplier){
  if (!Number.isFinite(rawWin) || rawWin < 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'rawWin invalid');
  }
  if (!Number.isFinite(payScale) || payScale <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'payScale invalid');
  }
  if (!Number.isSafeInteger(maxWinMultiplier) || maxWinMultiplier <= 0){
    throw _err.ApexError(_err.CODES.INVALID_MULTIPLIER, 'maxWinMultiplier invalid');
  }
  var rawCap = maxWinMultiplier / payScale;
  var capped = rawWin > rawCap ? rawCap : rawWin;
  return { rawWin: capped, capped: rawWin > rawCap, rawCap: rawCap };
}

window.ApexSugarRushCap = Object.freeze({ applyCap: applyCap });
})();
