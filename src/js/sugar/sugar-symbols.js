/* 糖果狂欢 · 符号 SVG
   黑描边 + 渐变 + 高光（统一三游戏视觉语言）
*/
(function(){
'use strict';

var DEFS_ID = 'sugar-sym-defs';
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
    '<radialGradient id="sr-blue" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#b0e0ff"/><stop offset="70%" stop-color="#4a9de0"/><stop offset="100%" stop-color="#205a90"/></radialGradient>' +
    '<radialGradient id="sr-green" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#a8eaa8"/><stop offset="70%" stop-color="#3f9a4a"/><stop offset="100%" stop-color="#1f6028"/></radialGradient>' +
    '<radialGradient id="sr-yellow" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff2a0"/><stop offset="70%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></radialGradient>' +
    '<radialGradient id="sr-red" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff9090"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#a01828"/></radialGradient>' +
    '<radialGradient id="sr-purple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#d8b0f0"/><stop offset="70%" stop-color="#9060c0"/><stop offset="100%" stop-color="#5a3080"/></radialGradient>' +
    '<radialGradient id="sr-pink" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffb0d8"/><stop offset="70%" stop-color="#d63b8a"/><stop offset="100%" stop-color="#8a1e5c"/></radialGradient>' +
    '<radialGradient id="sr-cyan" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#b0f0f0"/><stop offset="70%" stop-color="#4ac0c0"/><stop offset="100%" stop-color="#207070"/></radialGradient>' +
    '<linearGradient id="sr-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff6b9d"/><stop offset="25%" stop-color="#ffb84d"/><stop offset="50%" stop-color="#4ade80"/><stop offset="75%" stop-color="#4a9de0"/><stop offset="100%" stop-color="#a855f7"/></linearGradient>' +
    '<linearGradient id="sr-lolli" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9ed8"/><stop offset="50%" stop-color="#c870b8"/><stop offset="100%" stop-color="#7a2870"/></linearGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}

function wrap(inner){
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx, cy, rx, ry, op){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op||.55) + '"/>'; }
function sh(cx, cy, rx, ry){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".12"/>'; }

/* 通用糖果：六边形糖块 + 高光（区别于 sweet 的矩形） */
function candy(grad){
  return wrap(
    sh(50, 86, 26, 3) +
    '<path d="M50 12 L82 28 L82 62 L50 78 L18 62 L18 28 Z" fill="url(#' + grad + ')" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M50 20 L74 32 L74 58 L50 70 L26 58 L26 32 Z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35"/>' +
    hl(38, 30, 7, 4, .7) +
    '<circle cx="62" cy="48" r="2" fill="#fff" opacity=".5"/>'
  );
}

/* 心糖 */
function heart(){
  return wrap(
    sh(50, 84, 24, 3) +
    '<path d="M50 74 C50 74 16 54 16 36 C16 24 26 18 36 22 C42 24 47 30 50 34 C53 30 58 24 64 22 C74 18 84 24 84 36 C84 54 50 74 50 74 Z" fill="url(#sr-pink)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M32 34 Q36 28 42 30" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>' +
    hl(38, 40, 5, 4, .5)
  );
}

/* 星糖 */
function star(){
  return wrap(
    sh(50, 86, 24, 3) +
    '<path d="M50 14 L58 38 L84 38 L63 54 L71 78 L50 62 L29 78 L37 54 L16 38 L42 38 Z" fill="url(#sr-yellow)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M50 24 L55 40 L71 40 L58 50 L63 64 L50 55 L37 64 L42 50 L29 40 L45 40 Z" fill="#fff" opacity=".25"/>' +
    hl(40, 34, 4, 3, .8)
  );
}

/* 彩虹糖 */
function rainbow(){
  return wrap(
    sh(50, 86, 26, 3) +
    '<circle cx="50" cy="50" r="38" fill="url(#sr-rainbow)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<path d="M22 50 Q22 30 50 30 Q78 30 78 50" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>' +
    '<path d="M30 58 Q30 42 50 42 Q70 42 70 58" stroke="#fff" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>' +
    '<path d="M38 66 Q38 54 50 54 Q62 54 62 66" stroke="#fff" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>' +
    hl(36, 32, 6, 4, .7)
  );
}

/* 棒棒糖 Scatter */
function lollipop(){
  return wrap(
    sh(50, 92, 8, 2.5) +
    '<rect x="47" y="60" width="6" height="30" rx="3" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="46" r="28" fill="url(#sr-lolli)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<path d="M50 46 Q50 26 66 34 Q74 50 58 56 Q42 60 40 48" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".9"/>' +
    '<circle cx="50" cy="46" r="4" fill="#fff" stroke="#0a0a0a" stroke-width="1.5"/>' +
    hl(38, 32, 5, 4, .7)
  );
}

window.SugarSymbols = {
  candyBlue:    function(){ return candy('sr-blue');   },
  candyGreen:   function(){ return candy('sr-green');  },
  candyYellow:  function(){ return candy('sr-yellow'); },
  candyRed:     function(){ return candy('sr-red');    },
  candyPurple:  function(){ return candy('sr-purple'); },
  heart:        heart,
  star:         star,
  rainbow:      rainbow,
  lollipop:     lollipop
};
})();
