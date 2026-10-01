/* Lucky Fruit · 游戏数据配置
   所有数值集中在此，UI 与逻辑都从这里读取（Single Source of Truth）
*/
(function(){
'use strict';

/* ---------- 符号定义 ---------- */
var SYMBOLS = {
  cherry:      { id:'cherry',      name:'樱桃',    tier:'low'    },
  lemon:       { id:'lemon',       name:'柠檬',    tier:'low'    },
  orange:      { id:'orange',      name:'橙子',    tier:'low'    },
  grape:       { id:'grape',       name:'葡萄',    tier:'low'    },
  watermelon:  { id:'watermelon',  name:'西瓜',    tier:'low'    },
  bell:        { id:'bell',        name:'铃铛',    tier:'mid'    },
  bar:         { id:'bar',         name:'BAR',     tier:'mid'    },
  seven:       { id:'seven',       name:'幸运 7',  tier:'high'   },
  goldenSeven: { id:'goldenSeven', name:'金色 7',  tier:'high'   },
  wild:        { id:'wild',        name:'Wild',    tier:'special'}
};

/* ---------- 出现权重（越高越常见）---------- */
var WEIGHTS = {
  cherry: 22,
  lemon: 20,
  orange: 18,
  grape: 16,
  watermelon: 12,
  bell: 6,
  bar: 3,
  seven: 1.6,
  goldenSeven: 0.6,
  wild: 0.8
};

/* ---------- 10 条中奖线（行坐标 0=上 1=中 2=下）---------- */
var PAYLINES = [
  [1,1,1,1,1],   // 中线
  [0,0,0,0,0],   // 上线
  [2,2,2,2,2],   // 下线
  [0,1,2,1,0],   // V 形
  [2,1,0,1,2],   // 倒 V
  [0,0,1,2,2],   // 斜下
  [2,2,1,0,0],   // 斜上
  [1,0,0,0,1],   // 上梯
  [1,2,2,2,1],   // 下梯
  [0,1,1,1,0]    // 浅拱
];

/* ---------- 赔率表（从最左连续匹配 N 个相同符号）---------- */
/* 值 = 相对 lineBet 的倍数 */
var PAYOUTS = {
  cherry:      { 3: 5,    4: 10,   5: 25    },
  lemon:       { 3: 8,    4: 15,   5: 40    },
  orange:      { 3: 10,   4: 20,   5: 50    },
  grape:       { 3: 15,   4: 30,   5: 75    },
  watermelon:  { 3: 20,   4: 40,   5: 100   },
  bell:        { 3: 30,   4: 60,   5: 150   },
  bar:         { 3: 50,   4: 100,  5: 250   },
  seven:       { 3: 100,  4: 250,  5: 500   },
  goldenSeven: { 3: 250,  4: 500,  5: 1000  },
  wild:        { 3: 300,  4: 750,  5: 1500  }
};

/* ---------- 游戏参数 ---------- */
var CONFIG = {
  reels: 5,
  rows: 3,
  initialBalance: 10000,
  betSteps: [1, 2, 5, 10, 20, 50, 100],
  defaultBetIndex: 3,          // → bet = 10
  reelStopDelayMs: 160,        // 相邻转轮停差
  minSpinMs: 700
};

/* ---------- Wild 可替代的符号 ---------- */
var WILD_SUBSTITUTES = ['cherry','lemon','orange','grape','watermelon','bell','bar','seven','goldenSeven'];

window.SlotConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS: WEIGHTS,
  PAYLINES: PAYLINES,
  PAYOUTS: PAYOUTS,
  CONFIG: CONFIG,
  WILD_SUBSTITUTES: WILD_SUBSTITUTES
};

})();
