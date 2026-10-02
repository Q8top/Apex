/* 星光公主 · 配置
   6×5 Cluster Pays · Tumble 连击 · 乘法器 · 免费旋转
   数据依据原版（Pragmatic Play Starlight Princess）
*/
(function(){
'use strict';

var SYMBOLS = {
  gemBlue:    { id:'gemBlue',    name:'蓝心',  tier:'low'  },
  gemGreen:   { id:'gemGreen',   name:'绿心',  tier:'low'  },
  gemYellow:  { id:'gemYellow',  name:'黄心',  tier:'mid'  },
  gemPurple:  { id:'gemPurple',  name:'紫心',  tier:'mid'  },
  gemRed:     { id:'gemRed',     name:'红心',  tier:'high' },
  moon:       { id:'moon',       name:'月亮',  tier:'high' },
  crown:      { id:'crown',      name:'皇冠',  tier:'high' },
  princess:   { id:'princess',   name:'公主',  tier:'prem' },
  heart:      { id:'heart',      name:'爱心',  tier:'prem' },
  star:       { id:'star',       name:'星星',  tier:'scatter' }
};

var WEIGHTS_REAL = {
  gemBlue: 50, gemGreen: 40, gemYellow: 22, gemPurple: 12, gemRed: 6,
  moon: 4, crown: 2, princess: 1.2, heart: 0.6, star: 4
};
var WEIGHTS_DEMO = {
  gemBlue: 45, gemGreen: 38, gemYellow: 22, gemPurple: 13, gemRed: 8,
  moon: 5, crown: 2.5, princess: 1.8, heart: 1, star: 5
};

/* Cluster 赔付（值 = × 总下注 / 20 的倍数） */
var PAYOUTS = {
  gemBlue:   { 8:0.25, 10:0.75, 12:2   },
  gemGreen:  { 8:0.4,  10:0.9,  12:4   },
  gemYellow: { 8:0.5,  10:1,    12:5   },
  gemPurple: { 8:0.8,  10:1.2,  12:8   },
  gemRed:    { 8:1,    10:1.5,  12:10  },
  moon:      { 8:1.5,  10:2,    12:12  },
  crown:     { 8:2,    10:5,    12:15  },
  princess:  { 8:2.5,  10:10,   12:25  },
  heart:     { 8:10,   10:25,   12:50  }
};

var STAR_TRIGGER = { 4:15, 5:15, 6:15 };
var STAR_RETRIGGER = 5;

var MULTIPLIER_VALUES = [2,3,4,5,6,8,10,12,15,20,25,50,100,250,500,1000];
var MULTIPLIER_WEIGHTS = {
  2:30,3:25,4:18,5:12,6:9,8:6,10:4,
  12:2,15:1.5,20:1,25:0.8,50:0.4,100:0.2,250:0.1,500:0.05,1000:0.02
};

var CONFIG = {
  cols: 6, rows: 5, minCluster: 8, maxTumbles: 12,
  initialBalance: 1000,
  betSteps: [1,2,5,10,20,50,100],
  defaultBetIndex: 3,
  baseCellBet: 20,
  payoutScaleReal: 11.0,
  payoutScaleDemo: 19,
  reelStopDelayMs: 140,
  minSpinMs: 550
};

var STAR_MULT_VALUES = [2,3,4,5,6,8,10,12,15,20,25,50,100,250,500];
var STAR_MULT_WEIGHTS = { 2:30,3:25,4:18,5:12,6:9,8:7,10:5,12:3,15:2,20:1.2,25:0.7,50:0.3,100:0.15,250:0.06,500:0.02 };
var STAR_DROP_CHANCE = 0.15;
var STAR_MAX_PER_SPIN = 3;

window.StarlightConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_REAL: WEIGHTS_REAL, WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYOUTS: PAYOUTS,
  STAR_TRIGGER: STAR_TRIGGER, STAR_RETRIGGER: STAR_RETRIGGER,
  MULTIPLIER_VALUES: MULTIPLIER_VALUES, MULTIPLIER_WEIGHTS: MULTIPLIER_WEIGHTS,
  CONFIG: CONFIG,
  STAR_MULT_VALUES: STAR_MULT_VALUES, STAR_MULT_WEIGHTS: STAR_MULT_WEIGHTS,
  STAR_DROP_CHANCE: STAR_DROP_CHANCE, STAR_MAX_PER_SPIN: STAR_MAX_PER_SPIN
};
})();
