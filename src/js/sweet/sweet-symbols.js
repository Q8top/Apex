/* 甜蜜蜜 · 符号接口
   优先使用 SymbolRenderer（sweet.html 游戏页加载）；
   详情页（game.html）未加载新模块时，回退到本文件内置渲染，
   保证 12 个 key 与 12 个 defs id 始终可用。
*/
(function(){
'use strict';

var DEFS_ID = 'sweet-sym-defs';

function ensureDefs(){
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('style', 'position:absolute;overflow:hidden');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs>' +
    '<radialGradient id="sw-blue" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#d0f0ff"/><stop offset="25%" stop-color="#a8d8f8"/><stop offset="55%" stop-color="#5aaee8"/><stop offset="100%" stop-color="#1a4a7a"/></radialGradient><radialGradient id="sw-green" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#d0f8d8"/><stop offset="25%" stop-color="#a0e8a8"/><stop offset="55%" stop-color="#5aad60"/><stop offset="100%" stop-color="#0e4a1a"/></radialGradient><radialGradient id="sw-purple" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#f0d8ff"/><stop offset="25%" stop-color="#d8b0f0"/><stop offset="55%" stop-color="#9060c0"/><stop offset="100%" stop-color="#3a1e58"/></radialGradient><radialGradient id="sw-red" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#ffc8c8"/><stop offset="25%" stop-color="#ff8a90"/><stop offset="55%" stop-color="#e5484d"/><stop offset="100%" stop-color="#6a0e18"/></radialGradient><radialGradient id="sw-orange" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#ffe0b8"/><stop offset="25%" stop-color="#ffb870"/><stop offset="55%" stop-color="#f08a3c"/><stop offset="100%" stop-color="#7a3810"/></radialGradient><radialGradient id="sw-yellow" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#fffcc8"/><stop offset="25%" stop-color="#fff0a0"/><stop offset="55%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#6a4812"/></radialGradient><radialGradient id="sw-banana" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#f8f0c0"/><stop offset="55%" stop-color="#e8c020"/><stop offset="100%" stop-color="#7a5010"/></radialGradient><radialGradient id="sw-grape" cx="32%" cy="22%" r="95%"><stop offset="0%" stop-color="#f0d8ff"/><stop offset="25%" stop-color="#c8a0e0"/><stop offset="55%" stop-color="#8a50b8"/><stop offset="100%" stop-color="#3a1a60"/></radialGradient><radialGradient id="sw-watermelon" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#ffb8c0"/><stop offset="55%" stop-color="#e82848"/><stop offset="100%" stop-color="#7a0a1a"/></radialGradient><radialGradient id="sw-apple" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#ffb0a8"/><stop offset="55%" stop-color="#d82840"/><stop offset="100%" stop-color="#5a0812"/></radialGradient><radialGradient id="sw-plum" cx="35%" cy="25%" r="90%"><stop offset="0%" stop-color="#e8c8f8"/><stop offset="55%" stop-color="#8a4898"/><stop offset="100%" stop-color="#2a0e40"/></radialGradient><linearGradient id="sw-lolli" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffb8e8"/><stop offset="35%" stop-color="#d880c8"/><stop offset="75%" stop-color="#a04898"/><stop offset="100%" stop-color="#5a1a60"/></linearGradient>' +
  '</defs>';
  document.body.appendChild(svg);
}

/* ---- Fallback 渲染（详情页用，与 Phase 2 前一致） ---- */
function wrap(inner){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx, cy, rx, ry, op){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>'; }
function sh(cx, cy, rx, ry){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#000" opacity=".12"/>'; }
function candy(g){
  return wrap(sh(50,86,26,3) +
    '<path d="M14 50 L26 42 L26 58 Z" fill="url(#'+g+')" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M86 50 L74 42 L74 58 Z" fill="url(#'+g+')" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<rect x="22" y="32" width="56" height="36" rx="12" fill="url(#'+g+')" stroke="#0a0a0a" stroke-width="2.4"/>' +
    hl(36,42,6,3.5,.65) +
    '<path d="M30 60 Q50 66 70 60" stroke="#0a0a0a" stroke-width="1" fill="none" opacity=".2"/>');
}
function banana(){
  return wrap(sh(50,86,26,3) +
    '<path d="M18 44 Q22 76 54 78 Q84 76 84 46 Q82 44 78 46 Q74 72 50 72 Q28 70 26 46 Q22 42 18 44 Z" fill="url(#sw-banana)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M22 48 Q28 68 50 70" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>' +
    '<circle cx="20" cy="42" r="2" fill="#0a0a0a"/>' +
    '<circle cx="82" cy="44" r="2" fill="#0a0a0a"/>');
}
function grape(){
  return wrap(sh(50,88,26,3) +
    '<path d="M50 22 C48 14 52 10 58 8" stroke="#2f6a30" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 22 C42 18 36 20 34 26" stroke="#3f9a4a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="42" cy="40" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="60" cy="40" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="50" cy="56" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="32" cy="56" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="68" cy="56" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="42" cy="72" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="58" cy="72" r="10" fill="url(#sw-grape)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    hl(38,36,2.5,2,.7));
}
function watermelon(){
  return wrap(sh(50,82,30,3) +
    '<path d="M14 42 C14 42 50 12 86 42 C78 68 60 82 50 82 C40 82 22 68 14 42 Z" fill="url(#sw-green)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M20 44 C20 44 50 20 80 44 C74 64 60 76 50 76 C40 76 26 64 20 44 Z" fill="url(#sw-watermelon)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<circle cx="40" cy="52" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="54" cy="48" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="60" cy="58" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="46" cy="62" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="34" cy="58" r="1.6" fill="#0a0a0a"/>');
}
function apple(){
  return wrap(sh(50,84,24,3) +
    '<path d="M46 24 Q50 14 58 16 Q56 24 50 26 Z" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M50 26 L50 34" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M50 32 C34 32 26 44 26 58 C26 74 38 82 50 82 C62 82 74 74 74 58 C74 44 66 32 50 32 Z" fill="url(#sw-apple)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    hl(40,44,5,3.5,.6) +
    '<path d="M36 70 Q50 76 64 70" stroke="#fff" stroke-width="1.2" fill="none" opacity=".2"/>');
}
function plum(){
  return wrap(sh(50,86,24,3) +
    '<ellipse cx="50" cy="56" rx="26" ry="24" fill="url(#sw-plum)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<path d="M50 32 Q50 40 50 56" stroke="#0a0a0a" stroke-width="1.4" fill="none" opacity=".35"/>' +
    '<path d="M50 32 Q54 26 60 26" stroke="#2f6a30" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="62" cy="30" rx="6" ry="3.5" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.4" transform="rotate(-20 62 30)"/>' +
    hl(38,48,6,4,.6));
}
function lollipop(){
  return wrap(sh(50,92,8,2.5) +
    '<rect x="47" y="60" width="6" height="30" rx="3" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="46" r="28" fill="url(#sw-lolli)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<path d="M50 46 Q50 26 66 34 Q74 50 58 56 Q42 60 40 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>' +
    '<circle cx="50" cy="46" r="4" fill="#fff" stroke="#0a0a0a" stroke-width="1.5"/>' +
    hl(38,32,5,4,.7));
}

var FALLBACK = {
  candyBlue:   function(){ return candy('sw-blue');   },
  candyGreen:  function(){ return candy('sw-green');  },
  candyPurple: function(){ return candy('sw-purple'); },
  candyRed:    function(){ return candy('sw-red');    },
  candyOrange: function(){ return candy('sw-orange'); },
  candyYellow: function(){ return candy('sw-yellow'); },
  banana: banana, grape: grape, watermelon: watermelon,
  apple: apple, plum: plum, lollipop: lollipop
};

ensureDefs();

var KEYS = ['candyBlue','candyGreen','candyPurple','candyRed','candyOrange','candyYellow','banana','grape','watermelon','apple','plum','lollipop'];
var API = {};
KEYS.forEach(function(k){
  API[k] = function(){
    ensureDefs();
    var R = window.SymbolRenderer;
    if (R && R.render) {
      var out = R.render(k);
      if (out) return out;
    }
    return FALLBACK[k]();
  };
});
window.SweetSymbols = API;
})();
