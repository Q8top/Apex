/* Apex · 材质参数表
   每种材质定义：高光强度 / 边缘光强度 / 底部反射 / 软阴影透明度
   供 SymbolRenderer 统一渲染使用
*/
(function(){
'use strict';

window.GameMaterials = {
  candy: {
    topHighlight: 0.72,
    rimLight: 0.55,
    bottomReflection: 0.20,
    softShadow: 0.18,
    outline: '#0a0a0a',
    outlineW: 2.4,
    rimColor: '#ffffff'
  },
  fruit: {
    topHighlight: 0.62,
    rimLight: 0.42,
    bottomReflection: 0.15,
    softShadow: 0.16,
    outline: '#0a0a0a',
    outlineW: 2.2,
    rimColor: '#ffffff'
  },
  metal: {
    topHighlight: 0.80,
    rimLight: 0.65,
    bottomReflection: 0.28,
    softShadow: 0.22,
    outline: '#0a0a0a',
    outlineW: 2.4,
    rimColor: '#ffffff'
  },
  glass: {
    topHighlight: 0.85,
    rimLight: 0.60,
    bottomReflection: 0.35,
    softShadow: 0.12,
    outline: '#0a0a0a',
    outlineW: 2.0,
    rimColor: '#ffffff'
  }
};
})();
