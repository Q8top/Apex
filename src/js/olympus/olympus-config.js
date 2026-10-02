/* 奥林匹斯之门 · 配置 v3
   精简：6 种符号 + 权重集中 → cluster 更容易形成
*/
(function(){
'use strict';

var SYMBOLS = {
  zeus:      { id:'zeus',      name:'宙斯'    },
  gemRed:    { id:'gemRed',    name:'红宝石'  },
  gemPurple: { id:'gemPurple', name:'紫水晶'  },
  gemYellow: { id:'gemYellow', name:'黄晶'    },
  gemGreen:  { id:'gemGreen',  name:'翡翠'    },
  gemBlue:   { id:'gemBlue',   name:'蓝宝石'  }
};

/* 6 种符号：gem 各 18%（合计 90%）+ zeus 10% */
var WEIGHTS_DEMO = {
  zeus: 6,
  gemRed: 20, gemPurple: 20, gemYellow: 22, gemGreen: 22, gemBlue: 22
};
var WEIGHTS_REAL = {
  zeus: 4,
  gemRed: 20, gemPurple: 20, gemYellow: 22, gemGreen: 22, gemBlue: 22
};

/* cluster 5+ 起算；越大赔率越高
   cellBet = bet / 30 */
var PAYOUTS = {
  gemBlue:   { 5:25,  6:50,  8:100,  10:200,  12:400,  15:800  },
  gemGreen:  { 5:25,  6:50,  8:100,  10:200,  12:400,  15:800  },
  gemYellow: { 5:25,  6:50,  8:125,  10:250,  12:500,  15:1000 },
  gemPurple: { 5:25,  6:50,  8:125,  10:250,  12:500,  15:1000 },
  gemRed:    { 5:25,  6:75,  8:200,  10:400,  12:800,  15:1600 },
  zeus:      { 5:125, 6:375, 8:1000, 10:2000, 12:4000, 15:8000 }
};

var TUMBLE_MULTIPLIERS = [1, 2, 3, 5, 10, 15, 25, 50, 100];

var CONFIG = {
  cols: 6,
  rows: 5,
  minCluster: 5,
  maxTumbles: 8,
  initialBalance: 1000,
  betSteps: [1, 2, 5, 10, 20, 50, 100],
  defaultBetIndex: 3,
  baseCellBet: 30,
  reelStopDelayMs: 200,
  minSpinMs: 550
};

window.OlympusConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  WEIGHTS_REAL: WEIGHTS_REAL,
  PAYOUTS: PAYOUTS,
  TUMBLE_MULTIPLIERS: TUMBLE_MULTIPLIERS,
  CONFIG: CONFIG
};
})();
