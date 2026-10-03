/* 甜蜜蜜 · 配置
   6×5 Cluster Pays + Tumble + 炸弹倍数 + 免费旋转
   数据依据原版（Pragmatic Play Sweet Bonanza）
*/
(function(){
'use strict';

var SYMBOLS = {
  candyBlue:    { id:'candyBlue',    name:'蓝糖',   tier:'low' },
  candyGreen:   { id:'candyGreen',   name:'绿糖',   tier:'low' },
  candyPurple:  { id:'candyPurple',  name:'紫糖',   tier:'mid' },
  candyRed:     { id:'candyRed',     name:'红糖',   tier:'mid' },
  candyOrange:  { id:'candyOrange',  name:'橙糖',   tier:'mid' },
  candyYellow:  { id:'candyYellow',  name:'黄糖',   tier:'high'},
  banana:       { id:'banana',       name:'香蕉',   tier:'high'},
  grape:        { id:'grape',        name:'葡萄',   tier:'high'},
  watermelon:   { id:'watermelon',   name:'西瓜',   tier:'prem'},
  apple:        { id:'apple',        name:'苹果',   tier:'prem'},
  plum:         { id:'plum',         name:'李子',   tier:'prem'},
  lollipop:     { id:'lollipop',     name:'棒棒糖', tier:'scatter'}
};

/* 出现权重（越高越常见） */
var WEIGHTS_REAL = {
  candyBlue: 60, candyGreen: 50, candyPurple: 28, candyRed: 14,
  candyOrange: 7, candyYellow: 4, banana: 2, grape: 1.2,
  watermelon: 0.7, apple: 0.3, plum: 0.2, lollipop: 4
};
var WEIGHTS_DEMO = {
  candyBlue: 55, candyGreen: 48, candyPurple: 28, candyRed: 15,
  candyOrange: 9, candyYellow: 6, banana: 3, grape: 2,
  watermelon: 1.2, apple: 0.6, plum: 0.4, lollipop: 5
};

/* Cluster 赔付（8-9 / 10-11 / 12+ 个） */
var PAYOUTS = {
  candyBlue:   { 8:0.25, 10:0.75, 12:2   },
  candyGreen:  { 8:0.4,  10:0.9,  12:4   },
  candyPurple: { 8:0.5,  10:1,    12:5   },
  candyRed:    { 8:0.8,  10:1.2,  12:8   },
  candyOrange: { 8:1,    10:1.5,  12:10  },
  candyYellow: { 8:1.5,  10:2,    12:12  },
  banana:      { 8:2,    10:5,    12:15  },
  grape:       { 8:2.5,  10:10,   12:25  },
  watermelon:  { 8:5,    10:15,   12:40  },
  apple:       { 8:8,    10:20,   12:45  },
  plum:        { 8:10,   10:25,   12:50  }
};

/* Scatter 触发免费旋转 */
var SCATTER_TRIGGER = { 4:10, 5:12, 6:15 };
var SCATTER_RETRIGGER = 5;  // 免费旋转中再触发 +5 次

/* 炸弹倍数（免费旋转期间掉落） */
var BOMB_VALUES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100];
var BOMB_WEIGHTS = {
  2:30, 3:25, 4:18, 5:12, 6:9, 8:7, 10:5,
  12:3, 15:2, 20:1.2, 25:0.7, 50:0.3, 100:0.1
};

var CONFIG = {
  cols: 6,
  rows: 5,
  minCluster: 8,
  maxTumbles: 15,
  initialBalance: 1000,
  betSteps: [1, 2, 5, 10, 20, 50, 100],
  defaultBetIndex: 3,
  baseCellBet: 20,
  payoutScaleReal: 63.2,
  payoutScaleDemo: 160,
  reelStopDelayMs: 140,
  minSpinMs: 550
};

window.SweetConfig = {
  SYMBOLS: SYMBOLS,
  WEIGHTS_REAL: WEIGHTS_REAL,
  WEIGHTS_DEMO: WEIGHTS_DEMO,
  PAYOUTS: PAYOUTS,
  SCATTER_TRIGGER: SCATTER_TRIGGER,
  SCATTER_RETRIGGER: SCATTER_RETRIGGER,
  BOMB_VALUES: BOMB_VALUES,
  BOMB_WEIGHTS: BOMB_WEIGHTS,
  CONFIG: CONFIG
};
})();
