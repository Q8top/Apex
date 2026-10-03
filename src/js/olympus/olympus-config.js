/* 奥林匹斯之门 · 配置
   6×5 Cluster Pays · Tumble 连击 · 乘法器
   数据依据原版（Pragmatic Play Gates of Olympus）
*/
(function(){
'use strict';

var SYMBOLS = {
  gemBlue:    { id:'gemBlue',    name:'蓝宝石', tier:'low'  },
  gemGreen:   { id:'gemGreen',   name:'绿宝石', tier:'low'  },
  gemYellow:  { id:'gemYellow',  name:'黄宝石', tier:'mid'  },
  gemPurple:  { id:'gemPurple',  name:'紫宝石', tier:'mid'  },
  gemRed:     { id:'gemRed',     name:'红宝石', tier:'high' },
  cup:        { id:'cup',        name:'圣杯',   tier:'high' },
  ring:       { id:'ring',       name:'戒指',   tier:'high' },
  hourglass:  { id:'hourglass',  name:'沙漏',   tier:'prem' },
  crown:      { id:'crown',      name:'皇冠',   tier:'prem' },
  zeus:       { id:'zeus',       name:'宙斯',   tier:'scatter' }
};

/* 出现权重（越高越常见） */
var WEIGHTS_REAL = {
  gemBlue: 50, gemGreen: 40, gemYellow: 22, gemPurple: 12, gemRed: 6,
  cup: 4, ring: 2, hourglass: 1.2, crown: 0.6, zeus: 4
};
var WEIGHTS_DEMO = {
  gemBlue: 45, gemGreen: 38, gemYellow: 22, gemPurple: 13, gemRed: 8,
  cup: 5, ring: 2.5, hourglass: 1.8, crown: 1, zeus: 5
};

/* Cluster 赔付（值 = × 总下注 / 20 的倍数）
   尺寸档：8-9 / 10-11 / 12-30 */
var PAYOUTS = {
  gemBlue:   { 8:0.25, 10:0.75, 12:2   },
  gemGreen:  { 8:0.4,  10:0.9,  12:4   },
  gemYellow: { 8:0.5,  10:1,    12:5   },
  gemPurple: { 8:0.8,  10:1.2,  12:8   },
  gemRed:    { 8:1,    10:1.5,  12:10  },
  cup:       { 8:1.5,  10:2,    12:12  },
  ring:      { 8:2,    10:5,    12:15  },
  hourglass: { 8:2.5,  10:10,   12:25  },
  crown:     { 8:10,   10:25,   12:50  }
};

/* Zeus Scatter：4/5/6 个分别赔 */
  // 注意：原版 Zeus 不支付现金，仅触发免费旋转（已移除死代码）
/* Tumble 乘法器池（每个连击轮次随机掉落一个） */
var MULTIPLIER_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500];
var MULTIPLIER_WEIGHTS = {
  2:30, 3:25, 4:18, 5:12, 6:9, 8:6, 10:4,
  12:2, 15:1.5, 20:1, 25:0.8, 50:0.4, 100:0.2, 250:0.1, 500:0.05
};

var CONFIG = {
  cols: 6,
  rows: 5,
  minCluster: 8,
  maxTumbles: 12,
  initialBalance: 1000,
  betSteps: [1, 2, 5, 10, 20, 50, 100],
  defaultBetIndex: 3,
  baseCellBet: 20,
  payoutScaleReal: 11.5,
  payoutScaleDemo: 19,
  reelStopDelayMs: 140,
  minSpinMs: 550
};

/* 免费旋转参数 */
var ZEUS_TRIGGER = { 4:15, 5:15, 6:15 };  // 4/5/6 个 Zeus 都触发 15 次
var ZEUS_RETRIGGER = 5;                   // 免费旋转中再触发 +5 次
var ZEUS_MULT_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500];
var ZEUS_MULT_WEIGHTS = { 2:30, 3:25, 4:18, 5:12, 6:9, 8:7, 10:5, 12:3, 15:2, 20:1.2, 25:0.7, 50:0.3, 100:0.15, 250:0.06, 500:0.02 };
var ZEUS_DROP_CHANCE = 0.15;  // 免费旋转中每次 tumble 后额外落 Zeus 概率
var ZEUS_MAX_PER_SPIN = 3;    // 每次 spin 最多额外落 Zeus 数

window.OlympusConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_REAL: WEIGHTS_REAL,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYOUTS: PAYOUTS,
MULTIPLIER_VALUES: MULTIPLIER_VALUES,
  MULTIPLIER_WEIGHTS: MULTIPLIER_WEIGHTS,
  CONFIG: CONFIG,
  ZEUS_TRIGGER: ZEUS_TRIGGER,
  ZEUS_RETRIGGER: ZEUS_RETRIGGER,
  ZEUS_MULT_VALUES: ZEUS_MULT_VALUES,
  ZEUS_MULT_WEIGHTS: ZEUS_MULT_WEIGHTS,
  ZEUS_DROP_CHANCE: ZEUS_DROP_CHANCE,
  ZEUS_MAX_PER_SPIN: ZEUS_MAX_PER_SPIN
};
})();
