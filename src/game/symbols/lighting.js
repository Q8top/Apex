/* Apex · 统一光照系统
   左上方主光源（315°），阴影右下（135°）
   所有 Symbol 共享同一套方向，形成视觉一致性
*/
(function(){
'use strict';

var ANGLE_DEG = 315;
var RAD = ANGLE_DEG * Math.PI / 180;

window.GameLighting = {
  ANGLE: ANGLE_DEG,
  DIR: { x: Math.cos(RAD), y: -Math.sin(RAD) },
  SHADOW_DIR: { x: -Math.cos(RAD), y: Math.sin(RAD) },
  /* 顶部高光位置（相对于物体 bbox 的百分比） */
  HL_CX: '34%',
  HL_CY: '26%',
  /* 统一阴影方向偏移 */
  SHADOW_DX: 0,
  SHADOW_DY: 1.4,
  /* 统一描边色与宽度 */
  OUTLINE: '#0a0a0a',
  OUTLINE_W: 2.2,
  OUTLINE_W_LIGHT: 1.6
};
})();
