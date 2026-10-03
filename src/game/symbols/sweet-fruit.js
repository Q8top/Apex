/* 甜蜜蜜 · 5 款水果 v2
   每种独立造型 + 大高光 + 边缘光 + 底部反光 + 独立描边色
*/
(function(){
'use strict';
var R = window.SymbolRenderer;
var F = window.GameMaterials.fruit;

/* 香蕉：明显弯曲 + 加厚 */
function banana(){
  var E = F.bananaOutline;
  return R.wrap(
    '<ellipse cx="50" cy="88" rx="26" ry="3.2" fill="#000" opacity="0.26"/>' +
    /* 主体（弯曲粗壮） */
    '<path d="M14 40 Q14 80 50 84 Q86 80 86 40 Q82 35 76 37 Q74 72 50 76 Q26 72 24 37 Q18 35 14 40 Z" fill="#e8c020" stroke="'+E+'" stroke-width="2.2" stroke-linejoin="round"/>' +
    /* 顶部亮面（沿上弧） */
    '<path d="M22 42 Q24 72 50 76 Q76 72 78 42 Q74 40 70 42 Q68 68 50 70 Q32 68 30 42 Q26 40 22 42 Z" fill="#f8e080" opacity="0.65"/>' +
    /* 高光弧线 */
    '<path d="M30 46 Q32 66 50 70" stroke="#fff" stroke-width="3.2" fill="none" opacity="0.72" stroke-linecap="round"/>' +
    /* 两端柄 */
    '<circle cx="15" cy="37" r="2.6" fill="#4a3010"/>' +
    '<circle cx="85" cy="37" r="2.6" fill="#4a3010"/>' +
    /* 边缘光 */
    '<path d="M20 44 Q22 62 34 72" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.4" stroke-linecap="round"/>' +
    /* 底部反光 */
    '<path d="M36 76 Q50 80 64 76" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.32"/>'
  );
}

/* 葡萄：每颗独立体积 + 高光 + 叶片 + 茎 */
function grape(){
  var E = F.grapeOutline;
  function b(cx, cy, r){
    return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+r+'" ry="'+(r*1.05)+'" fill="url(#sw-grape)" stroke="'+E+'" stroke-width="1.6"/>' +
           '<ellipse cx="'+(cx-r*0.30)+'" cy="'+(cy-r*0.35)+'" rx="'+(r*0.55)+'" ry="'+(r*0.42)+'" fill="#fff" opacity="0.60"/>' +
           '<ellipse cx="'+(cx-r*0.32)+'" cy="'+(cy-r*0.42)+'" rx="'+(r*0.26)+'" ry="'+(r*0.20)+'" fill="#fff" opacity="0.95"/>' +
           '<ellipse cx="'+(cx+r*0.35)+'" cy="'+(cy+r*0.42)+'" rx="'+(r*0.42)+'" ry="'+(r*0.28)+'" fill="'+E+'" opacity="0.22"/>';
  }
  return R.wrap(
    '<ellipse cx="50" cy="90" rx="26" ry="3.2" fill="#000" opacity="0.26"/>' +
    /* 茎 */
    '<path d="M50 18 C48 10 52 6 60 4" stroke="#3a5a20" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    /* 叶（带渐变感） */
    '<ellipse cx="34" cy="20" rx="10" ry="5" fill="#4ea848" stroke="#1a3a18" stroke-width="1.4" transform="rotate(-25 34 20)"/>' +
    '<path d="M26 20 Q34 22 42 18" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.5"/>' +
    /* 葡萄球（后→前） */
    b(38, 34, 9) + b(58, 32, 9) + b(48, 40, 9) +
    b(34, 50, 9.5) + b(52, 48, 9.5) + b(68, 46, 9) +
    b(40, 62, 9.5) + b(58, 62, 9.5) +
    b(48, 74, 8.5)
  );
}

/* 西瓜：切片清晰 + 红瓤绿皮 + 籽高光 */
function watermelon(){
  var E = F.watermelonOutline;
  return R.wrap(
    '<ellipse cx="50" cy="86" rx="32" ry="3.2" fill="#000" opacity="0.26"/>' +
    /* 外皮 */
    '<path d="M12 44 C12 44 50 12 88 44 C80 76 62 86 50 86 C38 86 20 76 12 44 Z" fill="#1a8030" stroke="'+E+'" stroke-width="2.2" stroke-linejoin="round"/>' +
    /* 浅绿过渡 */
    '<path d="M16 46 C16 46 50 18 84 46 C78 72 62 82 50 82 C38 82 22 72 16 46 Z" fill="#5ac848" stroke="'+E+'" stroke-width="1.4"/>' +
    /* 红瓤 */
    '<path d="M22 48 C22 48 50 24 78 48 C72 70 60 78 50 78 C40 78 28 70 22 48 Z" fill="#e82848" stroke="'+E+'" stroke-width="1.4"/>' +
    /* 红瓤高光 */
    '<ellipse cx="42" cy="52" rx="14" ry="8" fill="#ff8090" opacity="0.55" transform="rotate(-20 42 52)"/>' +
    '<ellipse cx="38" cy="48" rx="6" ry="3" fill="#fff" opacity="0.72"/>' +
    /* 籽 */
    '<ellipse cx="40" cy="56" rx="1.6" ry="2.5" fill="#1a1008"/>' +
    '<ellipse cx="54" cy="52" rx="1.6" ry="2.5" fill="#1a1008"/>' +
    '<ellipse cx="60" cy="62" rx="1.6" ry="2.5" fill="#1a1008"/>' +
    '<ellipse cx="46" cy="68" rx="1.6" ry="2.5" fill="#1a1008"/>' +
    '<ellipse cx="34" cy="64" rx="1.6" ry="2.5" fill="#1a1008"/>' +
    /* 边缘光 */
    '<path d="M20 46 Q30 30 50 22" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.4" stroke-linecap="round"/>'
  );
}

/* 苹果：圆润主体 + 顶部凹槽 + 梗 + 叶 */
function apple(){
  var E = F.appleOutline;
  return R.wrap(
    '<ellipse cx="50" cy="86" rx="24" ry="3.2" fill="#000" opacity="0.26"/>' +
    /* 主体 */
    '<path d="M50 30 C42 30 38 36 32 38 C24 42 22 54 26 66 C30 78 40 84 50 82 C60 84 70 78 74 66 C78 54 76 42 68 38 C62 36 58 30 50 30 Z" fill="#d82840" stroke="'+E+'" stroke-width="2.2"/>' +
    /* 顶部凹槽 */
    '<path d="M44 32 Q50 34 56 32" stroke="'+E+'" stroke-width="1.4" fill="none" opacity="0.5"/>' +
    /* 大高光 */
    '<ellipse cx="38" cy="46" rx="9" ry="7" fill="#ff8088" opacity="0.72" transform="rotate(-25 38 46)"/>' +
    '<ellipse cx="36" cy="44" rx="4" ry="3" fill="#fff" opacity="0.92" transform="rotate(-25 36 44)"/>' +
    /* 边缘光 */
    '<path d="M28 44 Q28 58 34 70" stroke="#ffb0b8" stroke-width="1.4" fill="none" opacity="0.6"/>' +
    /* 梗 */
    '<path d="M50 30 L50 20" stroke="#5a3818" stroke-width="2.4" stroke-linecap="round"/>' +
    /* 叶 */
    '<path d="M50 22 Q58 16 64 20 Q60 26 50 24 Z" fill="#3fa848" stroke="#1a4a18" stroke-width="1.2"/>'
  );
}

/* 李子：不对称 + 顶部凹槽 + 大高光 */
function plum(){
  var E = F.plumOutline;
  return R.wrap(
    '<ellipse cx="50" cy="86" rx="24" ry="3.2" fill="#000" opacity="0.26"/>' +
    /* 主体 */
    '<ellipse cx="50" cy="56" rx="26" ry="26" fill="url(#sw-plum)" stroke="'+E+'" stroke-width="2.2"/>' +
    /* 顶部凹槽 */
    '<path d="M50 32 Q48 42 50 56" stroke="'+E+'" stroke-width="1.4" fill="none" opacity="0.42"/>' +
    /* 大高光 */
    '<ellipse cx="40" cy="46" rx="9" ry="7" fill="#e8c8f8" opacity="0.75" transform="rotate(-25 40 46)"/>' +
    '<ellipse cx="38" cy="44" rx="4" ry="3" fill="#fff" opacity="0.92"/>' +
    /* 边缘光 */
    '<path d="M28 46 Q28 58 34 68" stroke="#e8c8f8" stroke-width="1.4" fill="none" opacity="0.55"/>' +
    /* 茎 + 叶 */
    '<path d="M50 32 Q54 24 62 22" stroke="#3a5a20" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="64" cy="24" rx="6" ry="3" fill="#4ea848" stroke="#1a3a18" stroke-width="1.2" transform="rotate(-15 64 24)"/>' +
    /* 底部反光 */
    '<path d="M38 72 Q50 76 62 72" stroke="#fff" stroke-width="1" fill="none" opacity="0.28"/>'
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
