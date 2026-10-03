/* Aces and Eights · 符号 */
(function(){
'use strict';
var DEFS_ID='ae-defs';
function ensureDefs(){
  if(typeof document==='undefined')return;
  if(document.getElementById(DEFS_ID))return;
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id=DEFS_ID;svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.setAttribute('style','position:absolute;overflow:hidden');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>'+
    '<linearGradient id="ae-7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff7a7a"/><stop offset="100%" stop-color="#a01818"/></linearGradient>'+
    '<linearGradient id="ae-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a2a2a"/><stop offset="100%" stop-color="#000"/></linearGradient>'+
    '<radialGradient id="ae-cherry" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff7a7a"/><stop offset="55%" stop-color="#dc3a3a"/><stop offset="100%" stop-color="#7a1010"/></radialGradient>'+
    '<radialGradient id="ae-bell" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '<linearGradient id="ae-ace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a4a9a"/><stop offset="100%" stop-color="#4a1a5a"/></linearGradient>'+
    '<linearGradient id="ae-eight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a4a8a"/><stop offset="100%" stop-color="#1a2a5a"/></linearGradient>'+
    '<radialGradient id="ae-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="55%" stop-color="#e8c25c"/><stop offset="100%" stop-color="#8a6020"/></radialGradient>'+
    '</defs>';
  document.body.appendChild(svg);
}
function wrap(i){ensureDefs();return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function card(ch,g){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="url(#'+g+')" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}
function cherry(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M50 20 Q44 24 42 36" stroke="#3a6a1a" stroke-width="2" fill="none"/><path d="M50 20 Q58 24 62 38" stroke="#3a6a1a" stroke-width="2" fill="none"/><circle cx="40" cy="54" r="16" fill="url(#ae-cherry)" stroke="#0a0a0a" stroke-width="2.2"/><circle cx="64" cy="58" r="16" fill="url(#ae-cherry)" stroke="#0a0a0a" stroke-width="2.2"/>'+hl(34,46,5,3,.6));}
function bell(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M30 68 L30 40 Q30 26 50 24 Q70 26 70 40 L70 68 Z" fill="url(#ae-bell)" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 68 L78 68 L78 74 L22 74 Z" fill="url(#ae-bell)" stroke="#0a0a0a" stroke-width="2"/><circle cx="50" cy="76" r="3" fill="url(#ae-gold)" stroke="#0a0a0a" stroke-width="1.4"/>'+hl(42,38,5,10,.4));}
function wild(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="url(#ae-gold)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+hl(34,40,6,3,.6));}
function scatter(){return wrap('<circle cx="50" cy="50" r="32" fill="url(#ae-gold)" stroke="#0a0a0a" stroke-width="2.4"/><path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2"/>'+hl(42,36,7,4,.6));}
window.LinesGameSymbols = {
  seven:function(){return card('7','ae-7');},
  bar:function(){return wrap('<rect x="20" y="40" width="60" height="20" rx="4" fill="url(#ae-bar)" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="14" font-weight="900" fill="#ffe9a0">BAR</text>');},
  ace:function(){return card('A','ae-ace');},
  eight:function(){return card('8','ae-eight');},
  cherry:cherry, bell:bell, wild:wild, scatter:scatter
};
})();
