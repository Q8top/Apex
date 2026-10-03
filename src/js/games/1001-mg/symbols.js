/* 1001 Mystery Genie · 符号 SVG（阿拉伯神话主题：紫金） */
(function(){
'use strict';
var DEFS_ID='mg-sym-defs';
function ensureDefs(){
  if(typeof document==='undefined')return;
  if(document.getElementById(DEFS_ID))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id=DEFS_ID;svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>'+
    '<linearGradient id="mg-ten" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a4a5a"/><stop offset="100%" stop-color="#1a1a2a"/></linearGradient>'+
    '<linearGradient id="mg-jack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a4a6a"/><stop offset="100%" stop-color="#2a1a3a"/></linearGradient>'+
    '<linearGradient id="mg-queen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6a4a7a"/><stop offset="100%" stop-color="#3a1a4a"/></linearGradient>'+
    '<linearGradient id="mg-king" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a4a8a"/><stop offset="100%" stop-color="#4a1a5a"/></linearGradient>'+
    '<linearGradient id="mg-ace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a4a9a"/><stop offset="100%" stop-color="#5a1a6a"/></linearGradient>'+
    '<radialGradient id="mg-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '<radialGradient id="mg-lamp" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#d9a83e"/><stop offset="100%" stop-color="#7a4a10"/></radialGradient>'+
    '<linearGradient id="mg-carpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c84a4a"/><stop offset="50%" stop-color="#8a2a2a"/><stop offset="100%" stop-color="#4a0a0a"/></linearGradient>'+
    '<radialGradient id="mg-palace" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#c89ae0"/><stop offset="60%" stop-color="#7a4aa8"/><stop offset="100%" stop-color="#3a1a5a"/></radialGradient>'+
    '<radialGradient id="mg-genie" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#d8b0ff"/><stop offset="55%" stop-color="#8a4ae0"/><stop offset="100%" stop-color="#3a0a70"/></radialGradient>'+
    '<radialGradient id="mg-scatter" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="50%" stop-color="#f0a020"/><stop offset="100%" stop-color="#8a4008"/></radialGradient>'+
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(inner){ensureDefs();return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}

function card(ch,g){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+g+')" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}

function lamp(){return wrap(
  '<ellipse cx="50" cy="80" rx="24" ry="4" fill="#000" opacity=".2"/>'+
  '<ellipse cx="50" cy="62" rx="30" ry="16" fill="url(#mg-lamp)" stroke="#0a0a0a" stroke-width="2.4"/>'+
  '<path d="M78 54 Q86 44 92 40 Q88 48 86 54" stroke="url(#mg-lamp)" stroke-width="4" fill="none" stroke-linecap="round"/>'+
  '<circle cx="92" cy="38" r="4" fill="url(#mg-lamp)" stroke="#0a0a0a" stroke-width="1.5"/>'+
  '<path d="M36 48 Q34 38 38 32 Q42 26 50 28 Q58 26 62 32 Q66 38 64 48" stroke="#e8c25c" stroke-width="2" fill="none"/>'+
  '<rect x="42" y="46" width="16" height="6" rx="3" fill="url(#mg-lamp)" stroke="#0a0a0a" stroke-width="1.5"/>'+
  hl(38,58,7,3,.6)
);}

function carpet(){return wrap(
  '<ellipse cx="50" cy="82" rx="26" ry="4" fill="#000" opacity=".2"/>'+
  '<path d="M14 60 Q30 50 50 52 Q70 54 86 62 L82 72 Q50 62 18 72 Z" fill="url(#mg-carpet)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>'+
  '<path d="M22 64 L78 60" stroke="#e8c25c" stroke-width="1.5" opacity=".8"/>'+
  '<path d="M20 68 L80 66" stroke="#e8c25c" stroke-width="1.5" opacity=".6"/>'+
  '<circle cx="30" cy="58" r="2" fill="#e8c25c"/><circle cx="50" cy="56" r="2" fill="#e8c25c"/><circle cx="70" cy="58" r="2" fill="#e8c25c"/>'+
  hl(30,54,6,3,.55)
);}

function palace(){return wrap(
  '<ellipse cx="50" cy="86" rx="28" ry="4" fill="#000" opacity=".2"/>'+
  '<path d="M20 78 L20 40 L28 40 L28 30 L34 30 L34 40 L42 40 L42 24 L50 16 L58 24 L58 40 L66 40 L66 30 L72 30 L72 40 L80 40 L80 78 Z" fill="url(#mg-palace)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>'+
  '<rect x="34" y="58" width="32" height="20" rx="3" fill="#e8c25c" stroke="#0a0a0a" stroke-width="1.8"/>'+
  '<path d="M50 58 L50 78 M34 68 L66 68" stroke="#0a0a0a" stroke-width="1.2" opacity=".7"/>'+
  '<circle cx="50" cy="22" r="4" fill="#e8c25c" stroke="#0a0a0a" stroke-width="1.5"/>'+
  hl(38,42,5,8,.35)
);}

function genie(){return wrap(
  '<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity=".2"/>'+
  '<path d="M50 14 Q60 14 62 24 Q66 30 64 40 Q62 50 50 52 Q38 50 36 40 Q34 30 38 24 Q40 14 50 14 Z" fill="url(#mg-genie)" stroke="#0a0a0a" stroke-width="2.2"/>'+
  '<path d="M30 88 Q34 62 50 60 Q66 62 70 88 Z" fill="url(#mg-genie)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>'+
  '<circle cx="44" cy="34" r="2.5" fill="#0a0a0a"/><circle cx="56" cy="34" r="2.5" fill="#0a0a0a"/>'+
  '<path d="M46 42 Q50 45 54 42" stroke="#0a0a0a" stroke-width="1.5" fill="none"/>'+
  '<path d="M50 60 L50 88 M38 72 L62 72" stroke="#0a0a0a" stroke-width="1" opacity=".35"/>'+
  hl(42,26,4,3,.5)
);}

function wild(){return wrap(
  '<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/>'+
  '<path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="url(#mg-gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="#0a0a0a" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>'+
  hl(34,40,6,3,.6)
);}

function scatter(){return wrap(
  '<circle cx="50" cy="50" r="32" fill="url(#mg-scatter)" stroke="#0a0a0a" stroke-width="2.4"/>'+
  '<path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2" stroke-linejoin="round"/>'+
  '<circle cx="66" cy="62" r="3" fill="#fff8d0" opacity=".9"/>'+
  '<circle cx="34" cy="62" r="2" fill="#fff8d0" opacity=".75"/>'+
  hl(42,36,7,4,.6)
);}

window.LinesGameSymbols = {
  ten:function(){return card('10','mg-ten');},
  jack:function(){return card('J','mg-jack');},
  queen:function(){return card('Q','mg-queen');},
  king:function(){return card('K','mg-king');},
  ace:function(){return card('A','mg-ace');},
  lamp:lamp, carpet:carpet, palace:palace, genie:genie,
  wild:wild, scatter:scatter
};
})();
