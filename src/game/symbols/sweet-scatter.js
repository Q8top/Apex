/* 甜蜜蜜 · 棒棒糖（Scatter）
   螺旋色带 + 反光 + 棍身阴影
*/
(function(){
'use strict';
var M = window.GameMaterials.glass;
var R = window.SymbolRenderer;

window.SweetScatterSymbols = {
  lollipop: function(){
    return R.wrap(
      R.softShadow(50, 92, 10, 2.5, M) +
      '<rect x="46.5" y="60" width="7" height="30" rx="3.5" fill="#fff" stroke="'+M.outline+'" stroke-width="1.8"/>' +
      '<path d="M49 62 L49 86" stroke="#d8d8dc" stroke-width="1.2" opacity=".7"/>' +
      '<circle cx="50" cy="46" r="28" fill="url(#sw-lolli)" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'"/>' +
      '<path d="M50 46 Q50 26 66 34 Q74 50 58 56 Q42 60 40 48" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M50 46 Q46 34 58 32" stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>' +
      '<circle cx="50" cy="46" r="4" fill="#fff" stroke="'+M.outline+'" stroke-width="1.5"/>' +
      R.topHighlight(38, 32, 6, 4, M) +
      R.rimLight('M28 36 Q26 50 34 60', M, 1.6)
    );
  }
};
})();
