/* Sweet · Config
   从 window.SweetConfig 读取（旧配置模块保留不动）。
   只暴露只读访问接口，不再让 UI 层直接读 window.SweetConfig。
*/
(function(){
'use strict';

var C = window.SweetConfig;

if (!C) {
  console.error('[SweetConfig] window.SweetConfig 未加载');
  window.SweetGameConfig = null;
  return;
}

var SYMBOLS = C.SYMBOLS;
var CONFIG = C.CONFIG;
var PAYOUTS = C.PAYOUTS;
var SCATTER = C.SCATTER_TRIGGER;
var RETRIGGER = C.SCATTER_RETRIGGER;
var BOMB_VALUES = C.BOMB_VALUES;
var BOMB_WEIGHTS = C.BOMB_WEIGHTS;
var WEIGHTS_REAL = C.WEIGHTS_REAL;
var WEIGHTS_DEMO = C.WEIGHTS_DEMO;

function getFreeSpinCount(scatterCount){
  if (scatterCount >= 6) return 15;
  if (scatterCount >= 5) return 12;
  if (scatterCount >= 4) return 10;
  return 0;
}

function symbolKeys(){ return Object.keys(SYMBOLS); }
function bet(){ return CONFIG.betSteps; }
function defaultBet(){ return CONFIG.betSteps[CONFIG.defaultBetIndex]; }

window.SweetGameConfig = {
  SYMBOLS: SYMBOLS,
  CONFIG: CONFIG,
  PAYOUTS: PAYOUTS,
  SCATTER: SCATTER,
  RETRIGGER: RETRIGGER,
  BOMB_VALUES: BOMB_VALUES,
  BOMB_WEIGHTS: BOMB_WEIGHTS,
  WEIGHTS_REAL: WEIGHTS_REAL,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  getFreeSpinCount: getFreeSpinCount,
  symbolKeys: symbolKeys,
  bet: bet,
  defaultBet: defaultBet
};
})();
