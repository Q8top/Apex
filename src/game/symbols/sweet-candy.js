/* 甜蜜蜜 · 6 色糖果 v3 Final
   4 层体积：topLight / midLight / base / deep
   大弧形高光占主体约 1/4
   包装纸：后层宽裙 + 前层折楔
*/
(function(){
'use strict';
var R = window.SymbolRenderer;
var CM = window.GameMaterials.candy;

function candy(m){
  var E = m.outline;
  return R.wrap(
    /* 1. 地面阴影 */
    '<ellipse cx="50" cy="89" rx="30" ry="3.6" fill="#000" opacity="0.32"/>' +

    /* 2. 左后包装纸（宽裙，带渐变） */
    '<path d="M20 46 Q8 34 0 38 Q4 43 2 47 Q4 51 0 56 Q6 62 20 54 Z" fill="'+m.wrapper+'" stroke="'+E+'" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M18 42 Q10 40 4 40" stroke="'+m.wrapperLight+'" stroke-width="1.2" fill="none" opacity="0.7"/>' +

    /* 3. 右后包装纸 */
    '<path d="M80 46 Q92 34 100 38 Q96 43 98 47 Q96 51 100 56 Q94 62 80 54 Z" fill="'+m.wrapper+'" stroke="'+E+'" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M82 42 Q90 40 96 40" stroke="'+m.wrapperLight+'" stroke-width="1.2" fill="none" opacity="0.7"/>' +

    /* 4. 主体底部深色（体积感） */
    '<ellipse cx="50" cy="57" rx="35" ry="26" fill="'+m.deep+'" opacity="0.55"/>' +

    /* 5. 主体胖椭圆 */
    '<ellipse cx="50" cy="50" rx="35" ry="28" fill="url(#'+m.gradId+')" stroke="'+E+'" stroke-width="2.6"/>' +

    /* 6. Core 底部饱和深色区 */
    '<ellipse cx="50" cy="65" rx="33" ry="12" fill="'+m.bottomDeep+'" opacity="0.38"/>' +

    /* 7. 上部亮区（topLight 覆盖） */
    '<ellipse cx="50" cy="38" rx="30" ry="13" fill="'+m.topLight+'" opacity="0.24"/>' +

    /* 8. 大弧形高光（左上，约 1/4 面积） */
    '<path d="M22 46 Q22 27 42 21 Q52 19 58 22 Q40 26 30 36 Q25 42 24 48 Z" fill="#fff" opacity="0.78"/>' +

    /* 9. 次级柔光 */
    '<ellipse cx="36" cy="38" rx="17" ry="9" fill="#fff" opacity="0.32" transform="rotate(-25 36 38)"/>' +

    /* 10. 镜面高光点 */
    '<ellipse cx="32" cy="33" rx="5.5" ry="3.5" fill="#fff" opacity="0.96"/>' +

    /* 11. 左边缘光 */
    '<path d="M22 46 Q25 32 42 24" stroke="#fff" stroke-width="1.8" fill="none" opacity="0.65" stroke-linecap="round"/>' +

    /* 12. 左前包装纸（折叠楔形） */
    '<path d="M20 46 L7 41 L11 46 L7 50 L11 55 L7 59 Z" fill="'+m.wrapperLight+'" stroke="'+E+'" stroke-width="1.3" stroke-linejoin="round"/>' +

    /* 13. 右前包装纸 */
    '<path d="M80 46 L93 41 L89 46 L93 50 L89 55 L93 59 Z" fill="'+m.wrapperLight+'" stroke="'+E+'" stroke-width="1.3" stroke-linejoin="round"/>' +

    /* 14. 底部接触阴影（落在糖果下缘） */
    '<path d="M28 74 Q50 79 72 74" stroke="'+m.bottomDeep+'" stroke-width="1.6" fill="none" opacity="0.45"/>'
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
