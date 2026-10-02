/* 奥林匹斯之门 · 符号 SVG
   黑描边 + 渐变填充 + 高光（与幸运水果机同风格）
   所有 gradient 自动注入到 document
*/
(function(){
'use strict';

var DEFS_ID = 'olympus-sym-defs';
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
    '<radialGradient id="og-blue" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#9ecdf0"/><stop offset="70%" stop-color="#4a90d0"/><stop offset="100%" stop-color="#205a90"/></radialGradient>' +
    '<radialGradient id="og-green" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#9ee89e"/><stop offset="70%" stop-color="#3f9a4a"/><stop offset="100%" stop-color="#1f6028"/></radialGradient>' +
    '<radialGradient id="og-yellow" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff09a"/><stop offset="70%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></radialGradient>' +
    '<radialGradient id="og-purple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#c89cf0"/><stop offset="70%" stop-color="#9060c0"/><stop offset="100%" stop-color="#5a3080"/></radialGradient>' +
    '<radialGradient id="og-red" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff7070"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#a01828"/></radialGradient>' +
    '<linearGradient id="og-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f7e08a"/><stop offset="45%" stop-color="#d9b04a"/><stop offset="100%" stop-color="#9a6a1a"/></linearGradient>' +
    '<linearGradient id="og-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3b8"/><stop offset="50%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></linearGradient>' +
    '<linearGradient id="og-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f5e8b8"/><stop offset="100%" stop-color="#c8a04a"/></linearGradient>' +
    '<radialGradient id="og-zeus" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff8d0"/><stop offset="50%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}

function wrap(inner){
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx, cy, rx, ry, op){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op||.55) + '"/>'; }
function sh(cx, cy, rx, ry){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".12"/>'; }

/* 通用宝石：六边形切割 + 高光 */
function gem(grad){
  return wrap(
    sh(50, 86, 22, 2.5) +
    '<path d="M50 20 L76 40 L68 80 L32 80 L24 40 Z" fill="url(#' + grad + ')" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M50 20 L50 80 M24 40 L76 40 M32 80 L42 40 L58 40 L68 80" fill="none" stroke="#0a0a0a" stroke-width="1" opacity=".35"/>' +
    hl(38, 36, 6, 3, .7) +
    hl(62, 52, 3, 5, .45)
  );
}

/* 圣杯：金杯 + 底座 */
function cup(){
  return wrap(
    sh(50, 86, 22, 2.5) +
    '<path d="M26 26 L74 26 L70 52 C70 62 60 68 50 68 C40 68 30 62 30 52 Z" fill="url(#og-cup)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M50 68 L50 78" stroke="#0a0a0a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="80" rx="14" ry="3" fill="url(#og-cup)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<path d="M30 30 Q50 38 70 30" stroke="#fff8d0" stroke-width="1.6" fill="none" opacity=".7"/>' +
    '<circle cx="50" cy="46" r="4" fill="#e5484d" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<circle cx="50" cy="46" r="1.5" fill="#fff" opacity=".7"/>'
  );
}

/* 戒指：金环 + 宝石 */
function ring(){
  return wrap(
    sh(50, 86, 18, 2.5) +
    '<circle cx="50" cy="62" r="20" fill="none" stroke="url(#og-gold)" stroke-width="7"/>' +
    '<circle cx="50" cy="62" r="20" fill="none" stroke="#0a0a0a" stroke-width="1.4"/>' +
    '<circle cx="50" cy="62" r="16.5" fill="none" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<path d="M50 24 L58 36 L50 48 L42 36 Z" fill="url(#og-purple)" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    hl(44, 32, 2, 3, .7)
  );
}

/* 沙漏：金框 + 沙 */
function hourglass(){
  return wrap(
    sh(50, 90, 20, 2.5) +
    '<rect x="30" y="18" width="40" height="5" rx="2" fill="url(#og-gold)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<rect x="30" y="77" width="40" height="5" rx="2" fill="url(#og-gold)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<path d="M34 23 L66 23 L52 50 L52 50 L66 77 L34 77 L48 50 L48 50 Z" fill="#faf8f0" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M40 27 L60 27 L50 42 Z" fill="url(#og-sand)" opacity=".9"/>' +
    '<path d="M42 73 L58 73 L50 58 Z" fill="url(#og-sand)" opacity=".9"/>'
  );
}

/* 皇冠：金冠 + 宝石 */
function crown(){
  return wrap(
    sh(50, 86, 26, 2.5) +
    '<path d="M18 62 L18 36 L34 50 L50 22 L66 50 L82 36 L82 62 Z" fill="url(#og-cup)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<rect x="18" y="62" width="64" height="10" rx="3" fill="url(#og-cup)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="48" r="3.5" fill="#e5484d" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<circle cx="30" cy="56" r="2.4" fill="#4a90d0" stroke="#0a0a0a" stroke-width=".9"/>' +
    '<circle cx="70" cy="56" r="2.4" fill="#3f9a4a" stroke="#0a0a0a" stroke-width=".9"/>' +
    '<path d="M26 42 L34 50" stroke="#fff8d0" stroke-width="1.6" fill="none" opacity=".75" stroke-linecap="round"/>'
  );
}

/* 宙斯（Scatter）：金闪电 + 云 */
function zeus(){
  return wrap(
    sh(50, 90, 30, 3) +
    '<ellipse cx="50" cy="78" rx="32" ry="4" fill="#e8e8ee" opacity=".5"/>' +
    '<path d="M56 16 L34 50 L48 50 L40 86 L66 46 L52 46 Z" fill="url(#og-zeus)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M56 16 L42 42 L50 42" fill="none" stroke="#fff8d0" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>' +
    '<circle cx="76" cy="26" r="2.2" fill="#fff3b8" opacity=".85"/>' +
    '<circle cx="24" cy="34" r="1.8" fill="#fff3b8" opacity=".7"/>'
  );
}

window.OlympusSymbols = {
  gemBlue:    function(){ return gem('og-blue');   },
  gemGreen:   function(){ return gem('og-green');  },
  gemYellow:  function(){ return gem('og-yellow'); },
  gemPurple:  function(){ return gem('og-purple'); },
  gemRed:     function(){ return gem('og-red');    },
  cup: cup,
  ring: ring,
  hourglass: hourglass,
  crown: crown,
  zeus: zeus
};
})();
