/* 1001 Mystery Genie Fortunes 2 · 1001神秘精灵财富2 */
(function(){
'use strict';
var base = window.LinesGameConfig || {};
/* 5×3 · 10 线（复用标准线型） */
var PAYLINES = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],
  [0,1,2,1,0],[2,1,0,1,2],[1,0,0,0,1],
  [1,2,2,2,1],[0,0,1,2,2],[2,2,1,0,0],[1,0,1,0,1]
];
var NAMES = {
  ten:'10', jack:'J', queen:'Q', king:'K', ace:'A',
  bottle:'魔瓶', ring:'戒指', carpet:'飞毯', princess:'公主',
  wild:'Wild', scatter:'Scatter'
};
var WEIGHTS_REAL = {ten:22,jack:20,queen:18,king:16,ace:13,bottle:8,ring:5,carpet:3,princess:1.5,wild:2.5,scatter:2.2};
var WEIGHTS_DEMO = {ten:20,jack:18,queen:16,king:15,ace:13,bottle:9,ring:6,carpet:4,princess:2.5,wild:4,scatter:3.2};
var PAYOUTS = {
  ten:{3:0.5,4:2,5:10}, jack:{3:0.5,4:2,5:10},
  queen:{3:1,4:5,5:20}, king:{3:1,4:5,5:20}, ace:{3:2,4:10,5:50},
  bottle:{3:5,4:25,5:120}, ring:{3:10,4:50,5:220},
  carpet:{3:20,4:100,5:600}, princess:{3:50,4:250,5:1200}
};
window.LinesGameConfig = {
  cols:5, rows:3, paylines:PAYLINES, payouts:PAYOUTS, names:NAMES,
  wild:'wild', scatter:'scatter',
  scatterTrigger:{3:12,4:18,5:25}, scatterRetrigger:5,
  weightsReal:WEIGHTS_REAL, weightsDemo:WEIGHTS_DEMO,
  payScaleReal:12.60, payScaleDemo:15.77,
  betSteps:[1,2,5,10,20,50,100], defaultBetIndex:3
};
})();
