/* Aces and Eights · 3×3 · 8 线 · 经典机台 */
(function(){
'use strict';
/* 3×3 的 8 条线：3 横 + 2 斜 + 3 特殊 */
var PAYLINES = [
  [0,0,0],[1,1,1],[2,2,2],
  [0,1,2],[2,1,0],
  [1,0,2],[1,2,0],[0,2,1]
];
var NAMES = {
  seven:'幸运7', bar:'BAR', cherry:'樱桃', bell:'铃铛',
  ace:'A', eight:'8', wild:'Wild', scatter:'Scatter'
};
/* 3×3 出现频率高，赔率表要小（传统机台风格） */
var W_R = {seven:8, bar:12, cherry:16, bell:10, ace:6, eight:6, wild:1.5, scatter:3};
var W_D = {seven:7, bar:11, cherry:15, bell:10, ace:7, eight:7, wild:3, scatter:4};
var P = {
  seven:{3:15}, bar:{3:10}, cherry:{3:5}, bell:{3:8},
  ace:{3:3}, eight:{3:3}
};
window.LinesGameConfig = {
  cols:3, rows:3, paylines:PAYLINES, payouts:P, names:NAMES,
  wild:'wild', scatter:'scatter',
  scatterTrigger:{3:8,4:12,5:15}, scatterRetrigger:3,
  weightsReal:W_R, weightsDemo:W_D,
  payScaleReal:2.70, payScaleDemo:4.46,
  betSteps:[1,2,5,10,20,50,100], defaultBetIndex:3
};
})();
