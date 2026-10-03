/* Apex · 统一光照系统 v2
   主光源：左上方（315°），阴影右下
*/
(function(){
'use strict';

var ANGLE_DEG = 315;
var RAD = ANGLE_DEG * Math.PI / 180;

window.GameLighting = {
  ANGLE: ANGLE_DEG,
  DIR: { x: Math.cos(RAD), y: -Math.sin(RAD) },
  SHADOW_DIR: { x: -Math.cos(RAD), y: Math.sin(RAD) },
  OUTLINE_W: 2.2,
  OUTLINE_W_LIGHT: 1.6
};
})();
