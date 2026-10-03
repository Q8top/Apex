/* 通用 Crash 引擎（Aviator / Crash / JetX 共用）
   核心：每局生成崩溃倍率，实时倍率上升，玩家提现锁倍率
   RTP 模型：
     崩点 crash = (1 - edge) / (1 - r)，r ∈ [0,1)
     P(crash >= x) = (1-edge)/x
     玩家在 x 提现 → 期望返还 = x × P(crash >= x) = 1 - edge → RTP = 1 - edge
*/
(function(){
'use strict';

var CONFIG = {
  houseEdge: 0.08,        // real RTP = 92%
  demoEdge: -0.10,        // demo RTP = 110%（玩家爽）
  growthRate: 0.06,       // 倍率随时间指数增长：multi = e^(0.06 * t秒)
  maxMult: 10000,         // 倍率显示上限
  tickMs: 50,
  autoCashoutMin: 1.01,
  historyLen: 20
};

function randFloat(){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

var _mode = 'real';
var _edge = CONFIG.houseEdge;

function setMode(m){
  _mode = (m === 'demo') ? 'demo' : 'real';
  _edge = (_mode === 'demo') ? CONFIG.demoEdge : CONFIG.houseEdge;
}
function mode(){ return _mode; }
function edge(){ return _edge; }

/* 生成崩溃点：返回 2 位小数倍率，最小 1.00 */
function generateCrash(){
  var r = randFloat();
  if (r < _edge) return 1.00;
  var c = (1 - _edge) / (1 - r);
  if (c > CONFIG.maxMult) c = CONFIG.maxMult;
  return Math.floor(c * 100) / 100;
}

/* 倍率随时间增长（tMs 毫秒） */
function multiAt(tMs){
  return Math.exp(CONFIG.growthRate * tMs / 1000);
}
/* 到达指定倍率需要的时间（毫秒） */
function timeToMulti(multi){
  if (multi <= 1) return 0;
  return Math.log(multi) / CONFIG.growthRate * 1000;
}

/* 单局状态机 */
function newRound(){
  return {
    crash: generateCrash(),
    startedAt: 0,
    cashedOutAt: 0,
    state: 'idle',   // idle | flying | busted | cashed
    currentMulti: 1.00
  };
}

window.CrashCore = {
  CONFIG: CONFIG,
  setMode: setMode,
  mode: mode,
  edge: edge,
  generateCrash: generateCrash,
  multiAt: multiAt,
  timeToMulti: timeToMulti,
  newRound: newRound,
  randFloat: randFloat
};
})();
