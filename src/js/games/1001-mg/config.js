/* 1001 Mystery Genie Fortunes · 1001神秘精灵财富
   5×3 · 10 线 · Wild + Scatter + FS 10/15/20
*/
(function(){
'use strict';

/* 5×3 的 10 条标准线（行索引 0=上 1=中 2=下） */
var PAYLINES = [
  [1,1,1,1,1],
  [0,0,0,0,0],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
  [1,0,0,0,1],
  [1,2,2,2,1],
  [0,0,1,2,2],
  [2,2,1,0,0],
  [1,0,1,0,1]
];

var NAMES = {
  ten:'10', jack:'J', queen:'Q', king:'K', ace:'A',
  lamp:'神灯', carpet:'飞毯', palace:'宫殿', genie:'精灵',
  wild:'Wild', scatter:'Scatter'
};

var WEIGHTS_REAL = {
  ten:24, jack:22, queen:20, king:18, ace:14,
  lamp:8, carpet:5, palace:3, genie:1.5,
  wild:2.5, scatter:2
};
var WEIGHTS_DEMO = {
  ten:22, jack:20, queen:18, king:16, ace:14,
  lamp:9, carpet:6, palace:4, genie:2.5,
  wild:4, scatter:3
};

var PAYOUTS = {
  ten:     {3:0.5,  4:2,  5:10},
  jack:    {3:0.5,  4:2,  5:10},
  queen:   {3:1,    4:5,  5:20},
  king:    {3:1,    4:5,  5:20},
  ace:     {3:2,    4:10, 5:50},
  lamp:    {3:5,    4:25, 5:100},
  carpet:  {3:10,   4:50, 5:200},
  palace:  {3:20,   4:100,5:500},
  genie:   {3:50,   4:250,5:1000}
};

var CONFIG = {
  cols:5, rows:3,
  paylines:PAYLINES,
  payouts:PAYOUTS,
  names:NAMES,
  wild:'wild', scatter:'scatter',
  scatterTrigger:{3:10, 4:15, 5:20},
  scatterRetrigger:5,
  weightsReal:WEIGHTS_REAL,
  weightsDemo:WEIGHTS_DEMO,
  payScaleReal:12.63,
  payScaleDemo:17.96,
  betSteps:[1,2,5,10,20,50,100],
  defaultBetIndex:3
};

window.LinesGameConfig = CONFIG;
})();
