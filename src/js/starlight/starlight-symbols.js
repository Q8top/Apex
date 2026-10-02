/* 星光公主 · 符号 SVG
   黑描边 + 渐变填充 + 高光（与奥林匹斯之门同风格）
   所有 gradient 自动注入到 document
*/
(function(){
'use strict';

var DEFS_ID = 'starlight-sym-defs';
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
    '<radialGradient id="sl-blue" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#a8d8ff"/><stop offset="70%" stop-color="#6eb6f0"/><stop offset="100%" stop-color="#2a5a90"/></radialGradient>' +
    '<radialGradient id="sl-green" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#aef0b8"/><stop offset="70%" stop-color="#6ed880"/><stop offset="100%" stop-color="#2a7040"/></radialGradient>' +
    '<radialGradient id="sl-yellow" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff2a0"/><stop offset="70%" stop-color="#f0d040"/><stop offset="100%" stop-color="#a08020"/></radialGradient>' +
    '<radialGradient id="sl-purple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#dcb4ff"/><stop offset="70%" stop-color="#b470f0"/><stop offset="100%" stop-color="#5a2a80"/></radialGradient>' +
    '<radialGradient id="sl-red" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffb0b8"/><stop offset="70%" stop-color="#f06070"/><stop offset="100%" stop-color="#a02030"/></radialGradient>' +
    '<radialGradient id="sl-moon" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff8d0"/><stop offset="70%" stop-color="#f5e8b0"/><stop offset="100%" stop-color="#a8904a"/></radialGradient>' +
    '<linearGradient id="sl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="45%" stop-color="#f0c84a"/><stop offset="100%" stop-color="#a07818"/></linearGradient>' +
    '<radialGradient id="sl-pink" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffd6ec"/><stop offset="60%" stop-color="#ff77b8"/><stop offset="100%" stop-color="#a02868"/></radialGradient>' +
    '<radialGradient id="sl-star" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fffbe0"/><stop offset="55%" stop-color="#ffe060"/><stop offset="100%" stop-color="#a07818"/></radialGradient>' +
    '<radialGradient id="sl-princess" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe0f0"/><stop offset="70%" stop-color="#f0a0d0"/><stop offset="100%" stop-color="#a05080"/></radialGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}

function wrap(inner){
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx, cy, rx, ry, op){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op||.55) + '"/>'; }
function sh(cx, cy, rx, ry){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".12"/>'; }

/* 通用心形宝石：切割 + 高光 */
function gem(grad){
  return wrap(
    sh(50, 88, 22, 2.5) +
    '<path d="M50 30 C58 18 78 20 78 38 C78 56 50 82 50 82 C50 82 22 56 22 38 C22 20 42 18 50 30 Z" fill="url(#' + grad + ')" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M50 30 C58 18 78 20 78 38" fill="none" stroke="#0a0a0a" stroke-width="1" opacity=".35"/>' +
    hl(38, 38, 5, 3, .65) +
    hl(60, 52, 2.5, 4, .4)
  );
}

/* 月亮：月牙 + 星光 */
function moon(){
  return wrap(
    sh(50, 88, 22, 2.5) +
    '<path d="M60 18 A32 32 0 1 0 60 78 A26 26 0 1 1 60 18 Z" fill="url(#sl-moon)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="34" cy="34" r="3" fill="#fff8d0" opacity=".75"/>' +
    '<circle cx="26" cy="52" r="2" fill="#fff8d0" opacity=".55"/>' +
    '<path d="M84 26 L86 32 L92 34 L86 36 L84 42 L82 36 L76 34 L82 32 Z" fill="#fff8d0" opacity=".9"/>' +
    hl(48, 30, 3, 5, .5)
  );
}

/* 皇冠：金冠 + 宝石 */
function crown(){
  return wrap(
    sh(50, 86, 26, 2.5) +
    '<path d="M18 62 L18 34 L34 48 L50 20 L66 48 L82 34 L82 62 Z" fill="url(#sl-gold)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<rect x="18" y="62" width="64" height="10" rx="3" fill="url(#sl-gold)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="46" r="3.8" fill="#f06070" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<circle cx="30" cy="56" r="2.4" fill="#6eb6f0" stroke="#0a0a0a" stroke-width=".9"/>' +
    '<circle cx="70" cy="56" r="2.4" fill="#6ed880" stroke="#0a0a0a" stroke-width=".9"/>' +
    '<path d="M26 40 L34 48" stroke="#fffbe0" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>'
  );
}

/* 公主：简化剪影 - 头 + 长发 + 皇冠 */
function princess(){
  return wrap(
    sh(50, 92, 22, 2.5) +
    '<path d="M30 92 C30 70 36 58 50 58 C64 58 70 70 70 92 Z" fill="url(#sl-pink)" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="44" r="16" fill="url(#sl-princess)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    '<path d="M34 40 Q28 60 32 82" stroke="#0a0a0a" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>' +
    '<path d="M66 40 Q72 60 68 82" stroke="#0a0a0a" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>' +
    '<path d="M42 30 L42 22 L48 26 L50 18 L52 26 L58 22 L58 30 Z" fill="url(#sl-gold)" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<circle cx="44" cy="44" r="1.8" fill="#0a0a0a"/>' +
    '<circle cx="56" cy="44" r="1.8" fill="#0a0a0a"/>' +
    '<path d="M46 52 Q50 55 54 52" stroke="#0a0a0a" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
    hl(44, 38, 3, 2, .6)
  );
}

/* 爱心：大粉心 */
function heart(){
  return wrap(
    sh(50, 88, 24, 2.5) +
    '<path d="M50 78 C40 68 16 52 16 34 C16 20 30 14 40 22 C46 26 50 32 50 32 C50 32 54 26 60 22 C70 14 84 20 84 34 C84 52 60 68 50 78 Z" fill="url(#sl-pink)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    hl(36, 36, 7, 4, .65) +
    hl(64, 38, 3, 2, .4)
  );
}

/* 星星：金五角星（scatter） */
function star(){
  return wrap(
    sh(50, 90, 30, 3) +
    '<path d="M50 14 L60 42 L88 42 L66 60 L74 88 L50 70 L26 88 L34 60 L12 42 L40 42 Z" fill="url(#sl-star)" stroke="#0a0a0a" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M50 14 L58 40 L50 50" fill="none" stroke="#fffbe0" stroke-width="2" stroke-linecap="round" opacity=".85"/>' +
    '<circle cx="76" cy="24" r="2.2" fill="#fffbe0" opacity=".9"/>' +
    '<circle cx="22" cy="28" r="1.8" fill="#fffbe0" opacity=".75"/>'
  );
}

window.StarlightSymbols = {
  gemBlue:    function(){ return gem('sl-blue');   },
  gemGreen:   function(){ return gem('sl-green');  },
  gemYellow:  function(){ return gem('sl-yellow'); },
  gemPurple:  function(){ return gem('sl-purple'); },
  gemRed:     function(){ return gem('sl-red');    },
  moon: moon,
  crown: crown,
  princess: princess,
  heart: heart,
  star: star
};
})();
