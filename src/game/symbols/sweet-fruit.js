/* 甜蜜蜜 · 5 款水果
   每款独立造型 + 分层渲染
*/
(function(){
'use strict';
var M = window.GameMaterials.fruit;
var R = window.SymbolRenderer;

function banana(){
  return R.wrap(
    R.softShadow(50, 86, 24, 3, M) +
    '<path d="M18 44 Q22 76 54 78 Q84 76 84 46 Q82 44 78 46 Q74 72 50 72 Q28 70 26 46 Q22 42 18 44 Z" fill="url(#sw-banana)" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'" stroke-linejoin="round"/>' +
    '<path d="M24 48 Q28 66 48 70" stroke="#fff" stroke-width="2.2" fill="none" opacity=".5" stroke-linecap="round"/>' +
    R.rimLight('M22 48 Q26 58 38 64', M, 1.4) +
    '<path d="M32 62 Q50 68 68 62" stroke="#fff" stroke-width="1" fill="none" opacity=".18"/>' +
    '<circle cx="20" cy="42" r="2" fill="'+M.outline+'"/>' +
    '<circle cx="82" cy="44" r="2" fill="'+M.outline+'"/>'
  );
}

function grape(){
  var ball = function(cx, cy, r){
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#sw-grape)" stroke="'+M.outline+'" stroke-width="1.8"/>' +
           '<ellipse cx="'+(cx-2.5)+'" cy="'+(cy-3)+'" rx="'+(r*0.42)+'" ry="'+(r*0.28)+'" fill="#fff" opacity=".55"/>';
  };
  return R.wrap(
    R.softShadow(50, 88, 26, 3, M) +
    '<path d="M50 22 C48 14 52 10 58 8" stroke="#2f6a30" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 22 C42 18 36 20 34 26" stroke="#3f9a4a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="34" cy="22" rx="8" ry="4" fill="#3f9a4a" stroke="'+M.outline+'" stroke-width="1.4" transform="rotate(-25 34 22)"/>' +
    ball(42, 40, 10) + ball(60, 40, 10) +
    ball(50, 56, 10) + ball(32, 56, 10) + ball(68, 56, 10) +
    ball(42, 72, 10) + ball(58, 72, 10)
  );
}

function watermelon(){
  return R.wrap(
    R.softShadow(50, 84, 28, 3, M) +
    '<path d="M14 42 C14 42 50 12 86 42 C78 68 60 82 50 82 C40 82 22 68 14 42 Z" fill="url(#sw-green)" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'" stroke-linejoin="round"/>' +
    '<path d="M20 44 C20 44 50 20 80 44 C74 64 60 76 50 76 C40 76 26 64 20 44 Z" fill="url(#sw-watermelon)" stroke="'+M.outline+'" stroke-width="1.4"/>' +
    '<path d="M28 44 C28 44 50 26 72 44" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45" stroke-linecap="round"/>' +
    '<circle cx="40" cy="52" r="1.6" fill="'+M.outline+'"/>' +
    '<circle cx="54" cy="48" r="1.6" fill="'+M.outline+'"/>' +
    '<circle cx="60" cy="58" r="1.6" fill="'+M.outline+'"/>' +
    '<circle cx="46" cy="62" r="1.6" fill="'+M.outline+'"/>' +
    '<circle cx="34" cy="58" r="1.6" fill="'+M.outline+'"/>' +
    R.rimLight('M22 44 Q30 34 44 30', M, 1.4)
  );
}

function apple(){
  return R.wrap(
    R.softShadow(50, 84, 22, 3, M) +
    '<path d="M46 24 Q50 14 58 16 Q56 24 50 26 Z" fill="#3f9a4a" stroke="'+M.outline+'" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M50 26 L50 34" stroke="'+M.outline+'" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M50 32 C34 32 26 44 26 58 C26 74 38 82 50 82 C62 82 74 74 74 58 C74 44 66 32 50 32 Z" fill="url(#sw-apple)" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'"/>' +
    R.topHighlight(40, 44, 5, 3.6, M) +
    R.rimLight('M32 42 Q30 54 34 66', M, 1.6) +
    R.reflection('M36 70 Q50 76 64 70', M)
  );
}

function plum(){
  return R.wrap(
    R.softShadow(50, 86, 22, 3, M) +
    '<ellipse cx="50" cy="56" rx="26" ry="24" fill="url(#sw-plum)" stroke="'+M.outline+'" stroke-width="'+M.outlineW+'"/>' +
    '<path d="M50 32 Q50 40 50 56" stroke="'+M.outline+'" stroke-width="1.2" fill="none" opacity=".3"/>' +
    '<path d="M50 32 Q54 26 60 26" stroke="#2f6a30" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="62" cy="30" rx="6" ry="3.5" fill="#3f9a4a" stroke="'+M.outline+'" stroke-width="1.4" transform="rotate(-20 62 30)"/>' +
    R.topHighlight(40, 44, 6, 4, M) +
    R.rimLight('M30 48 Q30 58 36 68', M, 1.5) +
    R.reflection('M38 72 Q50 76 62 72', M)
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
