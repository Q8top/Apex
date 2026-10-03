/* 10001-nights · 符号 */
(function(){
'use strict';
var DEFS_ID='lm-defs';
function ensureDefs(){
  if(typeof document==='undefined')return;
  if(document.getElementById(DEFS_ID))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id=DEFS_ID;svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>'+
    '<linearGradient id="lm-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a2f1f"/><stop offset="100%" stop-color="#1a1a2a"/></linearGradient>'+
    '<linearGradient id="lm-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a3f2f"/><stop offset="100%" stop-color="#2a1a3a"/></linearGradient>'+
    '<linearGradient id="lm-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9a4f3f"/><stop offset="100%" stop-color="#3a1a4a"/></linearGradient>'+
    '<linearGradient id="lm-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aa5f4f"/><stop offset="100%" stop-color="#4a1a5a"/></linearGradient>'+
    '<linearGradient id="lm-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ba6f5f"/><stop offset="100%" stop-color="#5a1a6a"/></linearGradient>'+
    '<radialGradient id="lm-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '<radialGradient id="lm-hi" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#e08a50"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#7a1a58"/></radialGradient>'+
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(i){ensureDefs();return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function card(ch,g){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+g+')" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}
function star(){return wrap('<ellipse cx="50" cy="86" rx="20" ry="3" fill="#000" opacity=".2"/><path d="M50 16 L58 42 L86 42 L64 60 L72 88 L50 70 L28 88 L36 60 L14 42 L42 42 Z" fill="url(#lm-gold)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>'+hl(44,32,6,4,.7));}
function moon(){return wrap('<ellipse cx="50" cy="86" rx="20" ry="3" fill="#000" opacity=".2"/><path d="M62 20 A34 34 0 1 0 62 82 A28 28 0 1 1 62 20 Z" fill="url(#lm-hi)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/><circle cx="36" cy="44" r="3" fill="#fff8d0" opacity=".9"/><circle cx="28" cy="62" r="2" fill="#fff8d0" opacity=".75"/>'+hl(50,34,4,3,.5));}
function palace(){return wrap('<ellipse cx="50" cy="86" rx="26" ry="4" fill="#000" opacity=".2"/><path d="M20 78 L20 40 L28 40 L28 30 L34 30 L34 40 L42 40 L42 24 L50 16 L58 24 L58 40 L66 40 L66 30 L72 30 L72 40 L80 40 L80 78 Z" fill="url(#lm-c)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/><rect x="34" y="58" width="32" height="20" rx="3" fill="#e8c25c" stroke="#0a0a0a" stroke-width="1.8"/><circle cx="50" cy="22" r="4" fill="#e8c25c" stroke="#0a0a0a" stroke-width="1.5"/>'+hl(38,42,5,8,.35));}
function hero(){return wrap('<ellipse cx="50" cy="88" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M50 14 Q60 14 62 24 Q66 30 64 40 Q62 50 50 52 Q38 50 36 40 Q34 30 38 24 Q40 14 50 14 Z" fill="url(#lm-d)" stroke="#0a0a0a" stroke-width="2.2"/><path d="M30 88 Q34 62 50 60 Q66 62 70 88 Z" fill="url(#lm-d)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="44" cy="34" r="2.5" fill="#0a0a0a"/><circle cx="56" cy="34" r="2.5" fill="#0a0a0a"/><path d="M46 42 Q50 45 54 42" stroke="#0a0a0a" stroke-width="1.5" fill="none"/>'+hl(42,26,4,3,.5));}
function wild(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="url(#lm-gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+hl(34,40,6,3,.6));}
function scatter(){return wrap('<circle cx="50" cy="50" r="32" fill="url(#lm-hi)" stroke="#0a0a0a" stroke-width="2.4"/><path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2" stroke-linejoin="round"/>'+hl(42,36,7,4,.6));}
window.Sym_5_lions_mega = {
  ten:function(){return card('10','lm-a');},
  jack:function(){return card('J','lm-a');},
  queen:function(){return card('Q','lm-b');},
  king:function(){return card('K','lm-c');},
  ace:function(){return card('A','lm-d');},
  star:star, moon:moon, palace:palace, hero:hero,
  wild:wild, scatter:scatter
};
})();
