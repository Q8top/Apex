/* 幸运水果 · 3×3 配置
   所有数值集中管理
*/
(function(){
'use strict';

/* ---------- 符号 ---------- */
var SYMBOLS = {
  cherry:      { id:'cherry',      name:'樱桃'   },
  lemon:       { id:'lemon',       name:'柠檬'   },
  orange:      { id:'orange',      name:'橙子'   },
  grape:       { id:'grape',       name:'葡萄'   },
  watermelon:  { id:'watermelon',  name:'西瓜'   },
  bell:        { id:'bell',        name:'铃铛'   },
  bar:         { id:'bar',         name:'BAR'    },
  seven:       { id:'seven',       name:'幸运 7' },
  goldenSeven: { id:'goldenSeven', name:'金色 7' },
  wild:        { id:'wild',        name:'百搭'   }
};

/* ---------- 出现权重 ---------- */
/* real：标准赔率，稀有符号权重低 */
var WEIGHTS_REAL = {
  cherry: 22, lemon: 20, orange: 18, grape: 16, watermelon: 12,
  bell: 6, bar: 3, seven: 1.6, goldenSeven: 0.6, wild: 0.8
};
/* demo：高命中，所有符号更常见，方便试玩看效果 */
var WEIGHTS_DEMO = {
  cherry: 24, lemon: 22, orange: 20, grape: 18, watermelon: 16,
  bell: 4, bar: 2, seven: 1.5, goldenSeven: 0.8, wild: 2.2
};

/* ---------- 5 条中奖线（3×3 网格）
   每条线 3 个位置，值为行索引 0=上 1=中 2=下
*/
var PAYLINES = [
  [0,0,0],  // 上行
  [1,1,1],  // 中行
  [2,2,2],  // 下行
  [0,1,2],  // 主对角 ↘
  [2,1,0]   // 副对角 ↗
];

/* ---------- 赔率表：3 个相同符号 → 倍数（相对 lineBet）---------- */
/* real：标准赔率 */
var PAYOUTS_REAL = {
  cherry:      14,
  lemon:       22,
  orange:      28,
  grape:       42,
  watermelon:  56,
  bell:        84,
  bar:         140,
  seven:       280,
  goldenSeven: 700,
  wild:        840
};
/* demo：低赔率（配合高命中率，RTP 约 130%） */
var PAYOUTS_DEMO = {
  cherry:      7,
  lemon:       11,
  orange:      14,
  grape:       21,
  watermelon:  28,
  bell:        42,
  bar:         70,
  seven:       140,
  goldenSeven: 350,
  wild:        420
};
var PAYOUTS = PAYOUTS_REAL;

/* ---------- 游戏参数 ---------- */
var CONFIG = {
  reels: 3,
  rows: 3,
  initialBalance: 1000,
  betSteps: [1, 5, 10, 20, 50, 100],
  defaultBetIndex: 2,           // → bet = 10
  reelStopDelayMs: 180,
  minSpinMs: 700,
  jackpot: 12580                // 展示用，前端假数据
};

/* ---------- 百搭可替代符号 ---------- */
var WILD_SUBSTITUTES = ['cherry','lemon','orange','grape','watermelon','bell','bar','seven','goldenSeven'];

window.SlotConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS: WEIGHTS_REAL,
  WEIGHTS_REAL: WEIGHTS_REAL,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYLINES: PAYLINES,
  PAYOUTS: PAYOUTS_REAL,
  PAYOUTS_REAL: PAYOUTS_REAL,
  PAYOUTS_DEMO: PAYOUTS_DEMO,
  CONFIG: CONFIG,
  WILD_SUBSTITUTES: WILD_SUBSTITUTES
};

})();
