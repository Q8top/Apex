/* 1001 MG 2 · 符号（粉紫配色） */
(function(){
'use strict';
var DEFS_ID='mg2-defs';
function ensureDefs(){
  if(typeof document==='undefined')return;
  if(document.getElementById(DEFS_ID))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id=DEFS_ID;svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>'+
    '<linearGradient id="g2-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6a4a7a"/><stop offset="100%" stop-color="#2a1a3a"/></linearGradient>'+
    '<linearGradient id="g2-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a4a8a"/><stop offset="100%" stop-color="#3a1a4a"/></linearGradient>'+
    '<linearGradient id="g2-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a4a9a"/><stop offset="100%" stop-color="#4a1a5a"/></linearGradient>'+
    '<linearGradient id="g2-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9a4aaa"/><stop offset="100%" stop-color="#5a1a6a"/></linearGradient>'+
    '<linearGradient id="g2-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aa4aba"/><stop offset="100%" stop-color="#6a1a7a"/></linearGradient>'+
    '<radialGradient id="g2-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '<radialGradient id="g2-pink" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffd0e8"/><stop offset="55%" stop-color="#e050a0"/><stop offset="100%" stop-color="#7a1a58"/></radialGradient>'+
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(inner){ensureDefs();return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function card(ch,g){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+g+')" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}

function bottle(){
  return wrap(
    '<ellipse cx="50" cy="82" rx="20" ry="3" fill="#000" opacity=".2"/>'+
    '<path d="M42 30 L42 42 Q34 48 34 60 L34 74 Q34 80 42 80 L58 80 Q66 80 66 74 L66 60 Q66 48 58 42 L58 30 Z" fill="url(#g2-pink)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>'+
    '<rect x="40" y="24" width="20" height="8" rx="3" fill="url(#g2-gold)" stroke="#0a0a0a" stroke-width="1.6"/>'+
    '<circle cx="50" cy="60" r="6" fill="#ffe9a0" opacity=".7"/>'+
    hl(42,52,5,3,.55)
  );
}
function ring(){
  return wrap(
    '<ellipse cx="50" cy="86" rx="18" ry="3" fill="#000" opacity=".2"/>'+
    '<circle cx="50" cy="60" r="22" fill="none" stroke="url(#g2-gold)" stroke-width="8"/>'+
    '<circle cx="50" cy="60" r="22" fill="none" stroke="#0a0a0a" stroke-width="1.5"/>'+
    '<path d="M50 20 L60 36 L50 50 L40 36 Z" fill="url(#g2-pink)" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>'+
    hl(42,30,3,4,.6)
  );
}
function carpet(){
  return wrap(
    '<ellipse cx="50" cy="82" rx="26" ry="4" fill="#000" opacity=".2"/>'+
    '<path d="M14 58 Q30 48 50 50 Q70 52 86 60 L82 72 Q50 60 18 72 Z" fill="url(#g2-b)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>'+
    '<path d="M22 62 L78 58 M20 66 L80 64" stroke="#e8c25c" stroke-width="1.5" opacity=".75"/>'+
    hl(30,54,6,3,.5)
  );
}
function princess(){
  return wrap(
    '<ellipse cx="50" cy="88" rx="22" ry="3" fill="#000" opacity=".2"/>'+
    '<path d="M50 22 Q58 22 60 30 Q64 36 62 46 Q60 54 50 56 Q40 54 38 46 Q36 36 40 30 Q42 22 50 22 Z" fill="url(#g2-c)" stroke="#0a0a0a" stroke-width="2.2"/>'+
    '<path d="M32 88 Q36 64 50 62 Q64 64 68 88 Z" fill="url(#g2-c)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>'+
    '<path d="M42 26 L42 18 L48 22 L50 14 L52 22 L58 18 L58 26 Z" fill="url(#g2-gold)" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>'+
    '<circle cx="45" cy="38" r="2" fill="#0a0a0a"/><circle cx="55" cy="38" r="2" fill="#0a0a0a"/>'+
    hl(44,32,4,2,.5)
  );
}
function wild(){
  return wrap(
    '<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/>'+
    '<path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="url(#g2-gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="#0a0a0a" stroke-width="1.2" opacity=".5"/>'+
    hl(34,40,6,3,.6)
  );
}
function scatter(){
  return wrap(
    '<circle cx="50" cy="50" r="32" fill="url(#g2-pink)" stroke="#0a0a0a" stroke-width="2.4"/>'+
    '<path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2" stroke-linejoin="round"/>'+
    '<circle cx="66" cy="62" r="3" fill="#fff8d0" opacity=".9"/>'+
    '<circle cx="34" cy="62" r="2" fill="#fff8d0" opacity=".75"/>'+
    hl(42,36,7,4,.6)
  );
}

window.LinesGameSymbols = {
  ten:function(){return card('10','g2-a');},
  jack:function(){return card('J','g2-a');},
  queen:function(){return card('Q','g2-b');},
  king:function(){return card('K','g2-c');},
  ace:function(){return card('A','g2-d');},
  bottle:bottle, ring:ring, carpet:carpet, princess:princess,
  wild:wild, scatter:scatter
};
})();
