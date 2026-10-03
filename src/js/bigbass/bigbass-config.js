/* 大鱼大亨 · 配置
   5×3 固定 10 线老虎机 · 渔民 Wild · 金钱鱼收集 · 3 档免费旋转
   数据依据原版 Pragmatic Play Big Bass Bonanza
*/
(function(){
'use strict';

var SYMBOLS = {
  ten:        { id:'ten',        name:'10',     tier:'low'  },
  jack:       { id:'jack',       name:'J',      tier:'low'  },
  queen:      { id:'queen',      name:'Q',      tier:'mid'  },
  king:       { id:'king',       name:'K',      tier:'mid'  },
  ace:        { id:'ace',        name:'A',      tier:'mid'  },
  fishingRod: { id:'fishingRod', name:'鱼竿',   tier:'high' },
  tackleBox:  { id:'tackleBox',  name:'渔具盒', tier:'high' },
  dragonfly:  { id:'dragonfly',  name:'蜻蜓',   tier:'prem' },
  bass:       { id:'bass',       name:'大鱼',   tier:'prem' },
  fisherman:  { id:'fisherman',  name:'渔民',   tier:'wild' },
  moneyFish:  { id:'moneyFish',  name:'金钱鱼', tier:'money'}
};

var WEIGHTS_REAL = {
  ten: 26, jack: 24, queen: 20, king: 16, ace: 12,
  fishingRod: 6, tackleBox: 4, dragonfly: 2, bass: 1,
  fisherman: 2.5, moneyFish: 0
};
var WEIGHTS_DEMO = {
  ten: 22, jack: 20, queen: 17, king: 14, ace: 12,
  fishingRod: 7, tackleBox: 5, dragonfly: 3, bass: 2,
  fisherman: 6, moneyFish: 0
};

/* 5×3 = 15 格，10 条 payline */
var PAYLINES = [
  [0,0,0,0,0],
  [1,1,1,1,1],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
  [1,0,0,0,1],
  [1,2,2,2,1],
  [0,0,1,2,2],
  [2,2,1,0,0],
  [1,0,1,0,1]
];

/* 赔率（× 线注）：3 / 4 / 5 连 */
var PAYOUTS = {
  ten:        {3:0.2, 4:0.5, 5:2},
  jack:       {3:0.2, 4:0.5, 5:2},
  queen:      {3:0.5, 4:1,   5:5},
  king:       {3:0.5, 4:1,   5:5},
  ace:        {3:1,   4:2,   5:10},
  fishingRod: {3:1,   4:2.5, 5:15},
  tackleBox:  {3:2,   4:10,  5:40},
  dragonfly:  {3:5,   4:15,  5:75},
  bass:       {3:10,  4:50,  5:200},
  fisherman:  {3:10,  4:50,  5:200}
};

var SCATTER_TRIGGER = {3:10, 4:15, 5:20};

/* 金钱鱼金额池（× 线注） */
var FISH_VALUES = [0.2,0.5,1,2,5,10,20,50,100,200,500,1000,2000,4000];
var FISH_WEIGHTS = {
  0.2:100, 0.5:80, 1:60, 2:40, 5:25, 10:15, 20:8,
  50:4, 100:2, 200:1, 500:0.4, 1000:0.15, 2000: 0.05, 4000: 0.02
};

var FS_LEVELS = [{mult:1},{mult:2},{mult:10}];
var FS_LEVEL_UP_WILDS = 4;
var FS_LEVEL_UP_ADD = 10;

var FISH_DROP_RATE   = [0.45, 0.55, 0.65];
var FISH_MAX_PER_SPIN= [3, 4, 5];
var WILD_DROP_RATE   = [0.12, 0.14, 0.16];

var CONFIG = {
  cols: 5, rows: 3,
  initialBalance: 1000,
  betSteps: [1,2,5,10,20,50,100],
  defaultBetIndex: 3,
  lines: 10,
  payoutScaleReal: 53.0,
  payoutScaleDemo: 3.5,
  reelStopDelayMs: 130,
  minSpinMs: 550
};

window.BigBassConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_REAL: WEIGHTS_REAL, WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYLINES: PAYLINES, PAYOUTS: PAYOUTS,
  SCATTER_TRIGGER: SCATTER_TRIGGER,
  FISH_VALUES: FISH_VALUES, FISH_WEIGHTS: FISH_WEIGHTS,
  FS_LEVELS: FS_LEVELS, FS_LEVEL_UP_WILDS: FS_LEVEL_UP_WILDS, FS_LEVEL_UP_ADD: FS_LEVEL_UP_ADD,
  FISH_DROP_RATE: FISH_DROP_RATE, FISH_MAX_PER_SPIN: FISH_MAX_PER_SPIN,
  WILD_DROP_RATE: WILD_DROP_RATE,
  CONFIG: CONFIG
};
})();
