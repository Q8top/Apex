/* 甜蜜蜜 · 5 水果 v3 Final
   香蕉：厚实月牙（有厚度）
   葡萄：每颗独立球 + 遮挡关系
   西瓜：加厚绿皮 + 白层 + 红瓤 + 籽
   苹果：不对称 + 凹槽 + 梗叶
   李子：纵向凹槽 + 大高光
*/
(function(){
'use strict';
var R = window.SymbolRenderer;
var F = window.GameMaterials.fruit;

function banana(){
  var E = F.bananaOutline;
  return R.wrap(
    '<ellipse cx="50" cy="88" rx="30" ry="3.6" fill="#000" opacity="0.30"/>' +
    /* 主体月牙（有厚度） */
    '<path d="M12 42 Q12 82 50 86 Q88 82 88 42 Q84 36 77 38 Q75 72 50 77 Q25 72 23 38 Q16 36 12 42 Z" fill="#e8c020" stroke="'+E+'" stroke-width="2.4" stroke-linejoin="round"/>' +
    /* 上弧大面积高光 */
    '<path d="M22 46 Q25 70 50 74 Q75 70 78 46 Q74 43 70 46 Q68 66 50 70 Q32 66 30 46 Q26 43 22 46 Z" fill="'+F.bananaTop+'" opacity="0.85"/>' +
    /* 主高光弧线 */
    '<path d="M28 50 Q32 68 50 72" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.68" stroke-linecap="round"/>' +
    /* 中央纵纹 */
    '<path d="M34 54 Q38 68 50 72" stroke="#a88820" stroke-width="1.2" fill="none" opacity="0.45"/>' +
    /* 左边缘光 */
    '<path d="M20 48 Q22 64 34 74" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.5" stroke-linecap="round"/>' +
    /* 底部反光 */
    '<path d="M38 78 Q50 81 62 78" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.32"/>' +
    /* 两端柄 */
    '<ellipse cx="15" cy="39" rx="2.2" ry="3" fill="#4a3010"/>' +
    '<ellipse cx="85" cy="39" rx="2.2" ry="3" fill="#4a3010"/>'
  );
}

function grape(){
  var E = F.grapeOutline;
  function b(cx, cy, r){
    return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+r+'" ry="'+(r*1.06)+'" fill="url(#sw-grape)" stroke="'+E+'" stroke-width="1.7"/>' +
           '<ellipse cx="'+(cx-r*0.30)+'" cy="'+(cy-r*0.40)+'" rx="'+(r*0.58)+'" ry="'+(r*0.44)+'" fill="#fff" opacity="0.62"/>' +
           '<ellipse cx="'+(cx-r*0.32)+'" cy="'+(cy-r*0.48)+'" rx="'+(r*0.30)+'" ry="'+(r*0.22)+'" fill="#fff" opacity="0.95"/>' +
           '<path d="M'+(cx-r*0.7)+' '+(cy+r*0.55)+' Q'+cx+' '+(cy+r*0.95)+' '+(cx+r*0.7)+' '+(cy+r*0.55)+'" fill="'+E+'" opacity="0.22"/>';
  }
  return R.wrap(
    '<ellipse cx="50" cy="90" rx="27" ry="3.4" fill="#000" opacity="0.30"/>' +
    /* 茎 */
    '<path d="M50 16 C48 9 52 5 60 3" stroke="#3a5a20" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    /* 叶（带高光） */
    '<ellipse cx="33" cy="19" rx="11" ry="5.5" fill="#4ea848" stroke="#1a3a18" stroke-width="1.4" transform="rotate(-25 33 19)"/>' +
    '<path d="M22 19 Q33 21 44 17" stroke="#fff" stroke-width="1" fill="none" opacity="0.6"/>' +
    /* 葡萄球：后层 → 前层 */
    b(38, 33, 9) + b(60, 31, 9) +
    b(48, 40, 9) + b(28, 48, 9) + b(72, 46, 9) +
    b(40, 52, 9.5) + b(60, 54, 9.5) +
    b(30, 64, 9) + b(70, 62, 9) +
    b(42, 68, 9.5) + b(58, 68, 9.5) +
    b(50, 79, 8.5)
  );
}

function watermelon(){
  var E = F.watermelonOutline;
  return R.wrap(
    '<ellipse cx="50" cy="87" rx="33" ry="3.6" fill="#000" opacity="0.30"/>' +
    /* 外皮（深绿，厚） */
    '<path d="M10 46 C10 46 50 12 90 46 C82 80 62 89 50 89 C38 89 18 80 10 46 Z" fill="#1a8030" stroke="'+E+'" stroke-width="2.4" stroke-linejoin="round"/>' +
    /* 浅绿过渡（加厚） */
    '<path d="M15 48 C15 48 50 18 85 48 C79 76 62 85 50 85 C38 85 21 76 15 48 Z" fill="#5ac848"/>' +
    /* 白层（加厚） */
    '<path d="M19 50 C19 50 50 24 81 50 C75 73 61 81 50 81 C39 81 25 73 19 50 Z" fill="#f0f8d0"/>' +
    /* 红瓤 */
    '<path d="M23 52 C23 52 50 28 77 52 C71 71 60 77 50 77 C40 77 29 71 23 52 Z" fill="#e82848" stroke="#7a0a1a" stroke-width="1.2"/>' +
    /* 红瓤高光 */
    '<ellipse cx="40" cy="52" rx="12" ry="6" fill="#ff8090" opacity="0.55" transform="rotate(-20 40 52)"/>' +
    '<ellipse cx="36" cy="48" rx="5" ry="2.8" fill="#fff" opacity="0.78"/>' +
    /* 籽 */
    '<ellipse cx="40" cy="56" rx="1.5" ry="2.4" fill="#1a1008"/>' +
    '<ellipse cx="54" cy="52" rx="1.5" ry="2.4" fill="#1a1008"/>' +
    '<ellipse cx="60" cy="62" rx="1.5" ry="2.4" fill="#1a1008"/>' +
    '<ellipse cx="46" cy="68" rx="1.5" ry="2.4" fill="#1a1008"/>' +
    '<ellipse cx="34" cy="64" rx="1.5" ry="2.4" fill="#1a1008"/>' +
    /* 边缘光 */
    '<path d="M18 48 Q28 32 48 22" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.45" stroke-linecap="round"/>'
  );
}

function apple(){
  var E = F.appleOutline;
  return R.wrap(
    '<ellipse cx="50" cy="87" rx="24" ry="3.4" fill="#000" opacity="0.30"/>' +
    /* 主体（不对称） */
    '<path d="M50 30 C42 30 36 36 30 38 C22 42 20 56 26 68 C32 80 42 84 50 82 C58 84 68 80 74 68 C80 56 78 42 70 38 C64 36 58 30 50 30 Z" fill="#d82840" stroke="'+E+'" stroke-width="2.4"/>' +
    /* 顶部凹槽 */
    '<path d="M43 32 Q50 36 57 32" stroke="'+E+'" stroke-width="1.8" fill="none" opacity="0.6"/>' +
    /* 大高光 */
    '<ellipse cx="36" cy="46" rx="10" ry="8" fill="#ff8088" opacity="0.75" transform="rotate(-25 36 46)"/>' +
    '<ellipse cx="34" cy="44" rx="4.8" ry="3.4" fill="#fff" opacity="0.95" transform="rotate(-25 34 44)"/>' +
    /* 边缘光 */
    '<path d="M26 46 Q26 60 32 70" stroke="#ffb0b8" stroke-width="1.8" fill="none" opacity="0.68"/>' +
    /* 底部反光 */
    '<path d="M36 74 Q50 78 64 74" stroke="#ffb0b8" stroke-width="1.2" fill="none" opacity="0.45"/>' +
    /* 梗 */
    '<path d="M50 30 Q50 22 52 18" stroke="#5a3818" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
    /* 叶 */
    '<path d="M52 20 Q60 14 66 18 Q62 24 52 22 Z" fill="#3fa848" stroke="#1a4a18" stroke-width="1.3"/>' +
    '<path d="M54 19 Q60 17 64 19" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.65"/>'
  );
}

function plum(){
  var E = F.plumOutline;
  return R.wrap(
    '<ellipse cx="50" cy="87" rx="25" ry="3.4" fill="#000" opacity="0.30"/>' +
    /* 主体 */
    '<ellipse cx="50" cy="55" rx="28" ry="28" fill="url(#sw-plum)" stroke="'+E+'" stroke-width="2.4"/>' +
    /* 中央纵向凹槽 */
    '<path d="M50 28 Q48 54 50 80" stroke="'+E+'" stroke-width="1.6" fill="none" opacity="0.5"/>' +
    '<path d="M44 30 Q42 54 44 78" stroke="'+E+'" stroke-width="0.9" fill="none" opacity="0.25"/>' +
    /* 大高光 */
    '<ellipse cx="38" cy="44" rx="10" ry="8" fill="#e8c8f8" opacity="0.80" transform="rotate(-25 38 44)"/>' +
    '<ellipse cx="36" cy="42" rx="4.8" ry="3.2" fill="#fff" opacity="0.95"/>' +
    /* 边缘光 */
    '<path d="M26 46 Q26 60 32 70" stroke="#e8c8f8" stroke-width="1.6" fill="none" opacity="0.62"/>' +
    /* 茎和叶 */
    '<path d="M50 30 Q54 22 62 20" stroke="#3a5a20" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="64" cy="22" rx="6" ry="3" fill="#4ea848" stroke="#1a3a18" stroke-width="1.3" transform="rotate(-15 64 22)"/>' +
    /* 底部反光 */
    '<path d="M38 74 Q50 78 62 74" stroke="#fff" stroke-width="1.1" fill="none" opacity="0.3"/>'
  );
}

window.SweetFruitSymbols = {
  banana: banana,
  grape: grape,
  watermelon: watermelon,
  apple: apple,
  plum: plum
};
})();
