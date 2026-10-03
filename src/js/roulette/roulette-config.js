/* 欧洲/美式轮盘 · 共用配置 */
(function(){
'use strict';

/* 欧洲轮盘（单 0）：37 格标准排列 */
var EURO_WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

/* 美式轮盘（0 + 00）：38 格排列（00 用 -1 表示） */
var AMER_WHEEL = [0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,-1,27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2];

/* 红色数字（欧洲/美式共用规则） */
var RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

function isRed(n){ return RED_NUMBERS.indexOf(n) !== -1; }
function isBlack(n){ return n !== 0 && n !== -1 && !isRed(n); }

/* 赔付倍数（中奖就返还 下注 × (1 + payout)；这里 payout 是净赢倍数） */
var PAYOUTS = {
  straight:   35,   // 单个数字
  red:         1,   // 红/黑
  black:       1,
  odd:         1,   // 奇偶
  even:        1,
  low:         1,   // 1-18
  high:        1,   // 19-36
  dozen1:      2,   // 1-12
  dozen2:      2,
  dozen3:      2,
  column1:     2,   // 列注
  column2:     2,
  column3:     2
};

/* RTP 缩放：欧洲原始 RTP 97.3% → 92% (乘 0.945)
   美式原始 RTP 94.74% → 92% (乘 0.971) */
var EURO_SCALE = 0.945;
var AMER_SCALE = 0.971;

var CONFIG = {
  initialBalance: 1000,
  betSteps: [1, 5, 10, 20, 50, 100],
  defaultBetIndex: 2,
  spinDurationMs: 4200,
  maxChipsPerSpot: 5
};

window.RouletteConfig = {
  EURO_WHEEL: EURO_WHEEL,
  AMER_WHEEL: AMER_WHEEL,
  RED_NUMBERS: RED_NUMBERS,
  isRed: isRed,
  isBlack: isBlack,
  PAYOUTS: PAYOUTS,
  EURO_SCALE: EURO_SCALE,
  AMER_SCALE: AMER_SCALE,
  CONFIG: CONFIG
};
})();
