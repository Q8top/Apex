/* 甜蜜蜜 · 6 色糖果 v2
   完全重新设计：胖椭圆主体 + 上部亮区 + 下部暗区 + 大弧形高光 + 前后两层包装纸
*/
(function(){
'use strict';
var R = window.SymbolRenderer;
var CM = window.GameMaterials.candy;

function candy(m){
  var E = m.outline;
  return R.wrap(
    /* 1. 地面阴影 */
    '<ellipse cx="50" cy="88" rx="28" ry="3.2" fill="#000" opacity="0.28"/>' +
    /* 2. 左包装纸（后层，宽锥） */
    '<path d="M18 50 Q10 42 3 44 L11 50 L3 56 Q10 58 18 50 Z" fill="'+m.wrapper+'" stroke="'+E+'" stroke-width="1.4" stroke-linejoin="round"/>' +
    /* 3. 右包装纸（后层） */
    '<path d="M82 50 Q90 42 97 44 L89 50 L97 56 Q90 58 82 50 Z" fill="'+m.wrapper+'" stroke="'+E+'" stroke-width="1.4" stroke-linejoin="round"/>' +
    /* 4. 主体（胖椭圆） */
    '<ellipse cx="50" cy="50" rx="31" ry="25" fill="url(#'+m.gradId+')" stroke="'+E+'" stroke-width="2.2"/>' +
    /* 5. 上部亮区 */
    '<ellipse cx="50" cy="40" rx="27" ry="14" fill="#fff" opacity="0.20"/>' +
    /* 6. 下部暗区 */
    '<ellipse cx="50" cy="63" rx="27" ry="11" fill="'+m.deep+'" opacity="0.36"/>' +
    /* 7. 大弧形高光（左上） */
    '<path d="M24 42 Q26 28 44 25 Q34 34 30 48 Q26 48 24 42 Z" fill="#fff" opacity="0.68"/>' +
    /* 8. 次级柔光 */
    '<ellipse cx="40" cy="40" rx="14" ry="7" fill="#fff" opacity="0.24" transform="rotate(-22 40 40)"/>' +
    /* 9. 顶部镜面高光 */
    '<ellipse cx="34" cy="35" rx="4.5" ry="2.6" fill="#fff" opacity="0.92"/>' +
    /* 10. 边缘光（左上内侧） */
    '<path d="M26 42 Q30 32 44 28" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.55" stroke-linecap="round"/>' +
    /* 11. 左包装纸（前层，折叠楔形） */
    '<path d="M20 50 L10 43 L14 47 L10 50 L14 53 L10 57 Z" fill="'+m.wrapperLight+'" stroke="'+E+'" stroke-width="1.2" stroke-linejoin="round"/>' +
    /* 12. 右包装纸（前层） */
    '<path d="M80 50 L90 43 L86 47 L90 50 L86 53 L90 57 Z" fill="'+m.wrapperLight+'" stroke="'+E+'" stroke-width="1.2" stroke-linejoin="round"/>' +
    /* 13. 底部接触阴影 */
    '<path d="M32 68 Q50 71 68 68" stroke="'+m.deep+'" stroke-width="1.2" fill="none" opacity="0.32"/>'
  );
}

window.SweetCandySymbols = {
  candyBlue:   function(){ return candy(CM.blue);   },
  candyGreen:  function(){ return candy(CM.green);  },
  candyPurple: function(){ return candy(CM.purple); },
  candyRed:    function(){ return candy(CM.red);    },
  candyOrange: function(){ return candy(CM.orange); },
  candyYellow: function(){ return candy(CM.yellow); }
};
})();
