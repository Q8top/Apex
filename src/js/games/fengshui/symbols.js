/* Alchemy of Feng Shui · 符号 */
(function(){
'use strict';
var DEFS_ID='fs-defs';
function ensureDefs(){
  if(typeof document==='undefined')return;
  if(document.getElementById(DEFS_ID))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id=DEFS_ID;svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>'+
    '<linearGradient id="fs-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a6a5a"/><stop offset="100%" stop-color="#1a2a20"/></linearGradient>'+
    '<linearGradient id="fs-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a7a6a"/><stop offset="100%" stop-color="#2a3a30"/></linearGradient>'+
    '<linearGradient id="fs-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6a8a7a"/><stop offset="100%" stop-color="#3a4a40"/></linearGradient>'+
    '<linearGradient id="fs-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a9a8a"/><stop offset="100%" stop-color="#4a5a50"/></linearGradient>'+
    '<linearGradient id="fs-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8aaa9a"/><stop offset="100%" stop-color="#5a6a60"/></linearGradient>'+
    '<radialGradient id="fs-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '<radialGradient id="fs-jade" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#b0ffd0"/><stop offset="55%" stop-color="#3aaa6a"/><stop offset="100%" stop-color="#0a5a2a"/></radialGradient>'+
    '<radialGradient id="fs-dragon" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe060"/><stop offset="55%" stop-color="#e0a020"/><stop offset="100%" stop-color="#7a5000"/></radialGradient>'+
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(i){ensureDefs();return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function card(ch,g){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+g+')" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}
function coin(){return wrap('<ellipse cx="50" cy="86" rx="20" ry="3" fill="#000" opacity=".2"/><circle cx="50" cy="52" r="26" fill="url(#fs-gold)" stroke="#0a0a0a" stroke-width="2.4"/><rect x="42" y="44" width="16" height="16" fill="none" stroke="#0a0a0a" stroke-width="2.4"/>'+hl(40,40,6,3,.6));}
function jade(){return wrap('<ellipse cx="50" cy="86" rx="20" ry="3" fill="#000" opacity=".2"/><ellipse cx="50" cy="52" rx="24" ry="30" fill="url(#fs-jade)" stroke="#0a0a0a" stroke-width="2.4"/><circle cx="50" cy="52" r="8" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>'+hl(40,36,6,5,.55));}
function dragon(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M20 70 Q30 40 50 34 Q70 30 78 46 Q84 60 70 68 Q58 74 48 66" fill="none" stroke="url(#fs-dragon)" stroke-width="8" stroke-linecap="round"/><circle cx="78" cy="46" r="6" fill="url(#fs-dragon)" stroke="#0a0a0a" stroke-width="1.8"/><circle cx="76" cy="44" r="1.5" fill="#0a0a0a"/>'+hl(44,42,6,3,.55));}
function phoenix(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M50 22 Q40 24 38 34 Q36 46 46 54 Q40 66 32 72 Q48 72 56 58 Q64 66 76 68 Q68 56 62 48 Q68 40 64 30 Q58 24 50 22 Z" fill="url(#fs-gold)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/><circle cx="54" cy="34" r="2" fill="#0a0a0a"/>'+hl(48,32,4,3,.6));}
function wild(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="url(#fs-gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+hl(34,40,6,3,.6));}
function scatter(){return wrap('<circle cx="50" cy="50" r="32" fill="url(#fs-jade)" stroke="#0a0a0a" stroke-width="2.4"/><path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2"/>'+hl(42,36,7,4,.6));}
window.LinesGameSymbols = {
  ten:function(){return card('10','fs-a');},
  jack:function(){return card('J','fs-a');},
  queen:function(){return card('Q','fs-b');},
  king:function(){return card('K','fs-c');},
  ace:function(){return card('A','fs-d');},
  coin:coin, jade:jade, dragon:dragon, phoenix:phoenix,
  wild:wild, scatter:scatter
};
})();
