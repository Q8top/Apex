/* 甜蜜蜜 · 6 款糖果
   结构：包装纸左 / 包装纸右 / 主体 / 顶部高光 / 边缘光 / 底部反射
*/
(function(){
'use strict';
var L = window.GameLighting, M = window.GameMaterials.candy;
var R = window.SymbolRenderer;

function candy(gradId, gradEdge){
  return R.wrap(
    R.softShadow(50, 88, 28, 3, M) +
    /* 左侧包装纸 */
    '<path d="M14 50 L26 41 L26 59 Z" fill="url(#'+gradId+')" stroke="'+M.outline+'" stroke-width="1.8" stroke-linejoin="round"/>' +
    /* 右侧包装纸 */
    '<path d="M86 50 L74 41 L74 59 Z" fill="url(#'+gradId+')" stroke="'+M.outline+'" stroke-width="1.8" stroke-linejoin="round"/>' +
    /* 包装纸折叠细节 */
    '<path d="M26 44 L26 56" stroke="'+M.outline+'" stroke-width="0.6" opacity=".35"/>' +
    '<path d="M74 44 L74 56" stroke="'+M.outline+'" stroke-width="0.6" opacity=".35"/>' +
    /* 主体 */
    '<rect x="22" y="30" width="56" height="40" rx="14" fill="url(#'+gradId+')" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'"/>' +
    /* 顶部高光 */
    R.topHighlight(36, 38, 7, 3.6, M) +
    /* 边缘光（左上） */
    R.rimLight('M28 36 Q34 33 50 32', M, 1.6) +
    /* 底部反射 */
    R.reflection('M32 64 Q50 68 68 64', M)
  );
}

window.SweetCandySymbols = {
  candyBlue:   function(){ return candy('sw-blue');   },
  candyGreen:  function(){ return candy('sw-green');  },
  candyPurple: function(){ return candy('sw-purple'); },
  candyRed:    function(){ return candy('sw-red');    },
  candyOrange: function(){ return candy('sw-orange'); },
  candyYellow: function(){ return candy('sw-yellow'); }
};
})();
