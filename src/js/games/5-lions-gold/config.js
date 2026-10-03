/* 5 Lions Gold */
(function(){
'use strict';
var PAYLINES = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[1,0,0,0,1],[1,2,2,2,1],[0,0,1,2,2],[2,2,1,0,0],[1,0,1,0,1],[0,0,0,0,1],[1,1,1,1,2],[2,2,2,2,1],[0,1,2,2,2],[2,1,0,0,0],[1,1,1,1,0],[0,2,0,2,0],[2,0,2,0,2],[0,1,1,1,0],[2,1,1,1,2]];
var NAMES = {ten:'10',jack:'J',queen:'Q',king:'K',ace:'A',star:'星币',moon:'月牙',palace:'宫殿',hero:'英雄',wild:'Wild',scatter:'Scatter'};
var W_R = {ten:22,jack:20,queen:18,king:16,ace:13,star:8,moon:5,palace:3,hero:1.5,wild:2.5,scatter:2.2};
var W_D = {ten:20,jack:18,queen:16,king:15,ace:13,star:9,moon:6,palace:4,hero:2.5,wild:4,scatter:3.2};
var P = {
  ten:{3:0.5,4:2,5:10}, jack:{3:0.5,4:2,5:10},
  queen:{3:1,4:5,5:20}, king:{3:1,4:5,5:20}, ace:{3:2,4:10,5:50},
  star:{3:5,4:25,5:100}, moon:{3:10,4:50,5:200},
  palace:{3:20,4:100,5:500}, hero:{3:50,4:250,5:1000}
};
window.LinesGameConfig = {
  cols:5, rows:3, paylines:PAYLINES, payouts:P, names:NAMES,
  wild:'wild', scatter:'scatter',
  scatterTrigger:{3:10,4:15,5:20}, scatterRetrigger:5,
  weightsReal:W_R, weightsDemo:W_D,
  payScaleReal:12.37, payScaleDemo:16.49,
  betSteps:[1,2,5,10,20,50,100], defaultBetIndex:3
};
})();
