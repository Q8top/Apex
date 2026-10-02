/* 大鱼大亨 · 符号 SVG（渔村风 · 蓝绿点缀） */
(function(){
'use strict';

var DEFS_ID = 'bigbass-sym-defs';
function ensureDefs(){
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.setAttribute('style', 'position:absolute;overflow:hidden');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs>' +
    '<linearGradient id="bb-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c9e6ff"/><stop offset="55%" stop-color="#5b9cd6"/><stop offset="100%" stop-color="#1e4a7a"/></linearGradient>' +
    '<linearGradient id="bb-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8f0d0"/><stop offset="55%" stop-color="#5ab878"/><stop offset="100%" stop-color="#1e5a34"/></linearGradient>' +
    '<linearGradient id="bb-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8c98a"/><stop offset="55%" stop-color="#b88450"/><stop offset="100%" stop-color="#6a4020"/></linearGradient>' +
    '<linearGradient id="bb-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="45%" stop-color="#f0c84a"/><stop offset="100%" stop-color="#a07818"/></linearGradient>' +
    '<radialGradient id="bb-fish" cx="40%" cy="35%" r="75%"><stop offset="0%" stop-color="#ffe8a0"/><stop offset="55%" stop-color="#e8b840"/><stop offset="100%" stop-color="#8a5a08"/></radialGradient>' +
    '<radialGradient id="bb-fisher" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffd8b0"/><stop offset="70%" stop-color="#e0a878"/><stop offset="100%" stop-color="#8a5a38"/></radialGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(inner){
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx,cy,rx,ry,op){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>'; }

/* 数字牌（10/J/Q/K/A） */
function card(ch, grad){
  return wrap(
    '<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+grad+')" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/>' +
    '<text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Manrope, system-ui, sans-serif" font-size="40" font-weight="900" fill="#fff" stroke="#0a0a0a" stroke-width="1" paint-order="stroke">'+ch+'</text>'
  );
}

/* 鱼竿 */
function fishingRod(){
  return wrap(
    '<path d="M20 82 L80 20" stroke="url(#bb-wood)" stroke-width="6" stroke-linecap="round" fill="none"/>' +
    '<path d="M20 82 L80 20" stroke="#0a0a0a" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".5"/>' +
    '<circle cx="80" cy="20" r="5" fill="url(#bb-gold)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<path d="M80 25 Q80 60 60 78 Q50 86 40 78" stroke="#0a0a0a" stroke-width="1" fill="none"/>' +
    '<path d="M40 78 L36 82 L44 82 Z" fill="url(#bb-gold)" stroke="#0a0a0a" stroke-width="1.4" stroke-linejoin="round"/>' +
    hl(38, 32, 4, 2, .55)
  );
}

/* 渔具盒 */
function tackleBox(){
  return wrap(
    '<rect x="18" y="36" width="64" height="42" rx="6" fill="url(#bb-green)" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<path d="M30 36 L30 26 Q30 22 34 22 L66 22 Q70 22 70 26 L70 36" stroke="#0a0a0a" stroke-width="2.4" fill="none" stroke-linejoin="round"/>' +
    '<rect x="18" y="50" width="64" height="3" fill="#0a0a0a" opacity=".35"/>' +
    '<rect x="42" y="56" width="16" height="6" rx="2" fill="url(#bb-gold)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<circle cx="46" cy="59" r="1.4" fill="#0a0a0a"/>' +
    hl(34, 44, 6, 2, .55)
  );
}

/* 蜻蜓 */
function dragonfly(){
  return wrap(
    '<ellipse cx="50" cy="62" rx="4" ry="22" fill="url(#bb-blue)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="50" cy="36" r="9" fill="url(#bb-blue)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="47" cy="34" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="53" cy="34" r="1.6" fill="#0a0a0a"/>' +
    '<ellipse cx="30" cy="46" rx="16" ry="6" fill="#fff" stroke="#0a0a0a" stroke-width="1.8" opacity=".85" transform="rotate(-15 30 46)"/>' +
    '<ellipse cx="70" cy="46" rx="16" ry="6" fill="#fff" stroke="#0a0a0a" stroke-width="1.8" opacity=".85" transform="rotate(15 70 46)"/>' +
    '<ellipse cx="30" cy="60" rx="14" ry="5" fill="#fff" stroke="#0a0a0a" stroke-width="1.6" opacity=".7" transform="rotate(-8 30 60)"/>' +
    '<ellipse cx="70" cy="60" rx="14" ry="5" fill="#fff" stroke="#0a0a0a" stroke-width="1.6" opacity=".7" transform="rotate(8 70 60)"/>' +
    hl(46, 32, 2.5, 1.6, .8)
  );
}

/* 大鱼 */
function bass(){
  return wrap(
    '<ellipse cx="50" cy="56" rx="34" ry="20" fill="url(#bb-blue)" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<path d="M84 56 L96 44 L94 56 L96 68 Z" fill="url(#bb-blue)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="34" cy="52" r="3.2" fill="#0a0a0a"/>' +
    '<circle cx="35" cy="51" r="1" fill="#fff"/>' +
    '<path d="M42 60 Q46 64 50 60" stroke="#0a0a0a" stroke-width="1.6" fill="none"/>' +
    '<path d="M28 42 L36 50 M50 40 L56 48 M62 42 L68 50" stroke="#0a0a0a" stroke-width="1" opacity=".35"/>' +
    hl(44, 46, 8, 3, .55)
  );
}

/* 渔民（Wild / Scatter） */
function fisherman(){
  return wrap(
    '<circle cx="50" cy="30" r="14" fill="url(#bb-fisher)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<ellipse cx="50" cy="22" rx="16" ry="5" fill="url(#bb-wood)" stroke="#0a0a0a" stroke-width="2"/>' +
    '<path d="M34 22 L50 8 L66 22 Z" fill="url(#bb-wood)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<circle cx="45" cy="30" r="1.8" fill="#0a0a0a"/>' +
    '<circle cx="55" cy="30" r="1.8" fill="#0a0a0a"/>' +
    '<path d="M46 36 Q50 39 54 36" stroke="#0a0a0a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M32 92 C32 62 40 46 50 46 C60 46 68 62 68 92 Z" fill="url(#bb-green)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M42 60 L58 60" stroke="#0a0a0a" stroke-width="1.4" opacity=".5"/>' +
    '<path d="M50 46 L50 92" stroke="#0a0a0a" stroke-width="1.2" opacity=".35"/>' +
    hl(44, 26, 3, 2, .7)
  );
}

/* 金钱鱼（带金额值 · value 由 UI 动态传入） */
function moneyFish(){
  return wrap(
    '<ellipse cx="48" cy="52" rx="34" ry="20" fill="url(#bb-fish)" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<path d="M82 52 L96 40 L94 52 L96 64 Z" fill="url(#bb-fish)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="30" cy="48" r="3.2" fill="#0a0a0a"/>' +
    '<circle cx="31" cy="47" r="1" fill="#fff"/>' +
    '<path d="M40 56 Q44 60 48 56" stroke="#0a0a0a" stroke-width="1.6" fill="none"/>' +
    '<path d="M22 38 L30 46 M46 36 L52 44" stroke="#fff" stroke-width="1.4" opacity=".7"/>' +
    '<rect x="34" y="58" width="26" height="14" rx="4" fill="#0a0a0a" opacity=".85"/>' +
    '<text x="47" y="65" text-anchor="middle" dominant-baseline="central" font-family="Manrope, system-ui, sans-serif" font-size="9" font-weight="900" fill="#ffe060" id="bb-fish-val">×2</text>'
  );
}

window.BigBassSymbols = {
  ten:        function(){ return card('10','bb-wood'); },
  jack:       function(){ return card('J','bb-wood');  },
  queen:      function(){ return card('Q','bb-green'); },
  king:       function(){ return card('K','bb-green'); },
  ace:        function(){ return card('A','bb-blue');  },
  fishingRod: fishingRod,
  tackleBox:  tackleBox,
  dragonfly:  dragonfly,
  bass:       bass,
  fisherman:  fisherman,
  moneyFish:  moneyFish
};
})();
