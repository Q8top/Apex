/* 奥林匹斯之门 · 符号 SVG
   神话风：金色 + 深紫 + 高光
*/
(function(){
'use strict';

var DEFS_ID = 'olympus-defs-global';
function ensureDefs(){
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width','0'); svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');
  svg.setAttribute('aria-hidden','true');
  svg.innerHTML = '<defs>' +
    '<linearGradient id="ol-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3b8"/><stop offset="45%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></linearGradient>' +
    '<linearGradient id="ol-gold2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d090"/><stop offset="100%" stop-color="#8a6020"/></linearGradient>' +
    '<radialGradient id="ol-red" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff7070"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#a01828"/></radialGradient>' +
    '<radialGradient id="ol-purple" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#c89cf0"/><stop offset="70%" stop-color="#9060c0"/><stop offset="100%" stop-color="#5a3080"/></radialGradient>' +
    '<radialGradient id="ol-yellow" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff09a"/><stop offset="70%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></radialGradient>' +
    '<radialGradient id="ol-green" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#9ee89e"/><stop offset="70%" stop-color="#3f9a4a"/><stop offset="100%" stop-color="#1f6028"/></radialGradient>' +
    '<radialGradient id="ol-blue" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#9ecdf0"/><stop offset="70%" stop-color="#4a90d0"/><stop offset="100%" stop-color="#205a90"/></radialGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}

function wrap(inner){
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx,cy,rx,ry,op){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>'; }
function sh(cx,cy,rx,ry){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#000" opacity=".15"/>'; }

/* 宙斯：金冠 + 胡须轮廓 + 电光 */
function zeus(){
  return wrap(
    sh(50, 88, 28, 3) +
    '<circle cx="50" cy="52" r="30" fill="url(#ol-gold)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    '<path d="M50 22 L54 34 L66 34 L56 42 L60 54 L50 46 L40 54 L44 42 L34 34 L46 34 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M36 58 L30 60 M64 58 L70 60 M38 70 Q50 76 62 70" stroke="#0a0a0a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<circle cx="42" cy="52" r="1.8" fill="#0a0a0a"/><circle cx="58" cy="52" r="1.8" fill="#0a0a0a"/>' +
    hl(38, 42, 5, 3, .6)
  );
}

/* 王冠 */
function crown(){
  return wrap(
    sh(50, 82, 28, 3) +
    '<path d="M22 68 L22 42 L36 54 L50 34 L64 54 L78 42 L78 68 Z" fill="url(#ol-gold)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<rect x="22" y="68" width="56" height="8" rx="2" fill="url(#ol-gold2)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="52" r="3" fill="#e5484d" stroke="#0a0a0a" stroke-width="1.4"/>' +
    '<circle cx="34" cy="60" r="2.2" fill="#4a90d0" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<circle cx="66" cy="60" r="2.2" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.2"/>' +
    hl(42, 50, 4, 2, .55)
  );
}

/* 戒指 */
function ring(){
  return wrap(
    sh(50, 84, 22, 3) +
    '<circle cx="50" cy="60" r="22" fill="none" stroke="url(#ol-gold)" stroke-width="7"/>' +
    '<circle cx="50" cy="60" r="22" fill="none" stroke="#0a0a0a" stroke-width="1.4"/>' +
    '<circle cx="50" cy="60" r="18.5" fill="none" stroke="#0a0a0a" stroke-width="1.2"/>' +
    '<path d="M50 26 L56 38 L50 48 L44 38 Z" fill="url(#ol-blue)" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    hl(44, 32, 2, 3, .7)
  );
}

/* 沙漏 */
function hourglass(){
  return wrap(
    sh(50, 86, 22, 3) +
    '<rect x="30" y="22" width="40" height="6" rx="2" fill="url(#ol-gold)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<rect x="30" y="72" width="40" height="6" rx="2" fill="url(#ol-gold)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<path d="M34 28 L66 28 L52 50 L52 50 L66 72 L34 72 L48 50 L48 50 Z" fill="#faf8f0" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M40 32 L60 32 L50 44 Z" fill="#f0c33e" opacity=".85"/>' +
    '<path d="M42 68 L58 68 L50 58 Z" fill="#f0c33e" opacity=".85"/>' +
    '<circle cx="50" cy="52" r="1" fill="#f0c33e"/>' +
    '<circle cx="50" cy="55" r=".8" fill="#f0c33e"/>'
  );
}

/* 宝石通用 */
function makeGem(grad){
  return wrap(
    sh(50, 82, 24, 3) +
    '<path d="M50 20 L76 42 L66 78 L34 78 L24 42 Z" fill="url('+grad+')" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M50 20 L50 78 M24 42 L76 42 M34 78 L44 42 L56 42 L66 78" stroke="#0a0a0a" stroke-width="1" opacity=".35" fill="none"/>' +
    hl(40, 36, 5, 8, .55) +
    hl(60, 50, 3, 5, .4)
  );
}
function gemRed(){ return makeGem('#ol-red'); }
function gemPurple(){ return makeGem('#ol-purple'); }
function gemYellow(){ return makeGem('#ol-yellow'); }
function gemGreen(){ return makeGem('#ol-green'); }
function gemBlue(){ return makeGem('#ol-blue'); }

window.OlympusSymbols = {
  zeus: zeus, crown: crown, ring: ring, hourglass: hourglass,
  gemRed: gemRed, gemPurple: gemPurple, gemYellow: gemYellow,
  gemGreen: gemGreen, gemBlue: gemBlue
};
})();
