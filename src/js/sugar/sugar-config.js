/* 糖果狂欢 · 配置
   7×7 Cluster Pays（5+） · Tumble · 位置倍率 · 免费旋转
   数据依据原版 Pragmatic Play Sugar Rush
*/
(function(){
'use strict';

var SYMBOLS = {
  candyBlue:   { id:'candyBlue',   name:'蓝糖',  tier:'low' },
  candyGreen:  { id:'candyGreen',  name:'绿糖',  tier:'low' },
  candyYellow: { id:'candyYellow', name:'黄糖',  tier:'mid' },
  candyRed:    { id:'candyRed',    name:'红糖',  tier:'mid' },
  candyPurple: { id:'candyPurple', name:'紫糖',  tier:'mid' },
  heart:       { id:'heart',       name:'心糖',  tier:'high'},
  star:        { id:'star',        name:'星糖',  tier:'high'},
  rainbow:     { id:'rainbow',     name:'彩虹糖',tier:'prem'},
  lollipop:    { id:'lollipop',    name:'棒棒糖',tier:'scatter'}
};

/* 出现权重 */
var WEIGHTS_REAL = {
  candyBlue: 22, candyGreen: 20, candyYellow: 16, candyRed: 12,
  candyPurple: 9, heart: 6, star: 3, rainbow: 1, lollipop: 1.0
};
var WEIGHTS_DEMO = {
  candyBlue: 20, candyGreen: 18, candyYellow: 15, candyRed: 12,
  candyPurple: 10, heart: 7, star: 4, rainbow: 1.5, lollipop: 1.3
};

/* Cluster 赔付：5-6 / 7-8 / 9-10 / 11-12 / 13-14 / 15+ */
var PAYOUTS = {
  candyBlue:   { 5:0.2, 7:0.5, 9:1.5, 11:3,  13:6,  15:15   },
  candyGreen:  { 5:0.25,7:0.6, 9:2,   11:4,  13:8,  15:20   },
  candyYellow: { 5:0.3, 7:0.8, 9:2.5, 11:5,  13:10, 15:25   },
  candyRed:    { 5:0.4, 7:1,   9:3,   11:6,  13:12, 15:30   },
  candyPurple: { 5:0.5, 7:1.5, 9:5,   11:10, 13:20, 15:50   },
  heart:       { 5:0.8, 7:2,   9:8,   11:15, 13:30, 15:75   },
  star:        { 5:1,   7:2.5, 9:10,  11:20, 13:40, 15:100  },
  rainbow:     { 5:2,   7:5,   9:20,  11:50, 13:100,15:250  }
};

/* Scatter */
var SCATTER_TRIGGER = { 3:10, 4:10, 5:10, 6:10 };  // 3+ 触发 10 次
var SCATTER_RETRIGGER = 5;

/* 位置倍率（原版：每次 Tumble 后，随机位置会附加倍率） */
var POS_MULT_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 128];
var POS_MULT_WEIGHTS = {
  2:30, 3:25, 4:18, 5:12, 6:9, 8:7, 10:5,
  12:3, 15:2, 20:1.2, 25:0.7, 50:0.3, 100:0.1, 128:0.05
};
var POS_DROP_CHANCE = 0.10; // 每格带倍率的概率（初始+新补）
var POS_INITIAL = 2;        // 倍率起始值
var POS_MAX = 128;          // 倍率上限（翻倍至此封顶）
var POS_MAX_PER_TUMBLE = 4; // 每次最多添加几个

var CONFIG = {
  cols: 7,
  rows: 7,
  minCluster: 5,
  maxTumbles: 20,
  initialBalance: 1000,
  betSteps: [1, 2, 5, 10, 20, 50, 100],
  defaultBetIndex: 3,
  baseCellBet: 20,
  payoutScaleReal: 18.2,
  payoutScaleDemo: 150,
  reelStopDelayMs: 130,
  minSpinMs: 550
};

window.SugarConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_REAL: WEIGHTS_REAL,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYOUTS: PAYOUTS,
  SCATTER_TRIGGER: SCATTER_TRIGGER,
  SCATTER_RETRIGGER: SCATTER_RETRIGGER,
  POS_MULT_VALUES: POS_MULT_VALUES,
  POS_MULT_WEIGHTS: POS_MULT_WEIGHTS,
  POS_DROP_CHANCE: POS_DROP_CHANCE,
  POS_INITIAL: POS_INITIAL,
  POS_MAX: POS_MAX,
  POS_MAX_PER_TUMBLE: POS_MAX_PER_TUMBLE,
  CONFIG: CONFIG
};
})();
