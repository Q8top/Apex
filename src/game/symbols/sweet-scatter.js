/* 甜蜜蜜 · 棒棒糖 v3 Final
   大球体 + 外圈暗边 + 大面积高光 + 加粗螺旋 + 棍身高光
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
      '<ellipse cx="50" cy="94" rx="11" ry="3" fill="#000" opacity="0.34"/>' +
      /* 棍（带高光条） */
      '<rect x="46.5" y="58" width="7" height="36" rx="3.5" fill="#f8f8fc" stroke="'+E+'" stroke-width="1.8"/>' +
      '<path d="M49 60 L49 92" stroke="#d0d0d8" stroke-width="1.2" opacity="0.7"/>' +
      '<path d="M52 60 L52 92" stroke="#fff" stroke-width="0.9" opacity="0.9"/>' +
      /* 棍与球接触处阴影 */
      '<ellipse cx="50" cy="58" rx="6" ry="1.8" fill="'+E+'" opacity="0.4"/>' +
      /* 球体（外圈暗边 + 主体） */
      '<circle cx="50" cy="42" r="32" fill="#3a0a30" opacity="0.55"/>' +
      '<circle cx="50" cy="42" r="30" fill="url(#sw-lolli)" stroke="'+E+'" stroke-width="2.4"/>' +
      /* 下部暗区 */
      '<path d="M20 50 Q20 74 50 74 Q80 74 80 50 Q68 64 50 64 Q32 64 20 50 Z" fill="#3a0a30" opacity="0.42"/>' +
      /* 加粗螺旋纹 */
      '<path d="M50 42 Q50 22 68 28 Q78 44 62 54 Q44 62 38 46 Q34 36 44 32" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.9"/>' +
      /* 螺旋次级反光 */
      '<path d="M50 42 Q48 32 58 30" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.55" stroke-linecap="round"/>' +
      /* 大面积高光（左上） */
      '<ellipse cx="38" cy="28" rx="12" ry="9" fill="#fff" opacity="0.72" transform="rotate(-25 38 28)"/>' +
      '<ellipse cx="36" cy="26" rx="5" ry="3.5" fill="#fff" opacity="0.96"/>' +
      /* 边缘光 */
      '<path d="M24 32 Q20 46 28 60" stroke="#fff" stroke-width="1.8" fill="none" opacity="0.62" stroke-linecap="round"/>' +
      /* 中心孔 */
      '<circle cx="50" cy="42" r="4.5" fill="#fff" stroke="'+E+'" stroke-width="1.6"/>'
    );
  }
};
})();
