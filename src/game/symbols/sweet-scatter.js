/* 甜蜜蜜 · 棒棒糖（Scatter）v2
   大球体 + 大面积高光 + 螺旋纹 + 棍身阴影 + 边缘光
*/
(function(){
'use strict';
var R = window.SymbolRenderer;
var S = window.GameMaterials.scatter;

window.SweetScatterSymbols = {
  lollipop: function(){
    var E = S.outline;
    return R.wrap(
      /* 地面阴影 */
      '<ellipse cx="50" cy="94" rx="10" ry="2.5" fill="#000" opacity="0.30"/>' +
      /* 棍（带高光条） */
      '<rect x="46" y="60" width="8" height="34" rx="4" fill="#f8f8fc" stroke="'+E+'" stroke-width="1.6"/>' +
      '<path d="M49 62 L49 92" stroke="#d0d0d8" stroke-width="1.2" opacity="0.7"/>' +
      '<path d="M52 62 L52 92" stroke="#fff" stroke-width="0.9" opacity="0.85"/>' +
      /* 球体 */
      '<circle cx="50" cy="44" r="30" fill="url(#sw-lolli)" stroke="'+E+'" stroke-width="2.2"/>' +
      /* 下部暗区 */
      '<path d="M22 52 Q22 74 50 74 Q78 74 78 52 Q66 66 50 66 Q34 66 22 52 Z" fill="#3a0a30" opacity="0.36"/>' +
      /* 螺旋纹（带透视） */
      '<path d="M50 44 Q50 24 68 30 Q78 46 62 56 Q44 64 38 48 Q34 38 44 34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.88"/>' +
      /* 大高光（左上） */
      '<ellipse cx="38" cy="30" rx="11" ry="8" fill="#fff" opacity="0.68" transform="rotate(-25 38 30)"/>' +
      '<ellipse cx="36" cy="27" rx="4.5" ry="3" fill="#fff" opacity="0.95"/>' +
      /* 边缘光 */
      '<path d="M26 34 Q22 48 30 60" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.55" stroke-linecap="round"/>' +
      /* 中心小孔 */
      '<circle cx="50" cy="44" r="4" fill="#fff" stroke="'+E+'" stroke-width="1.4"/>'
    );
  }
};
})();
