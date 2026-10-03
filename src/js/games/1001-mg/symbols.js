/* 1001 MG · 符号（简化版：纯色，无 defs） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function card(ch,bg){return wrap('<rect x="14" y="14" width="72" height="72" rx="12" fill="'+bg+'" stroke="#e8c25c" stroke-width="2.4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="42" font-weight="900" fill="#ffe9a0">'+ch+'</text>'+hl(30,30,5,3,.5));}
function lamp(){return wrap('<ellipse cx="50" cy="80" rx="24" ry="4" fill="#000" opacity=".2"/><ellipse cx="50" cy="62" rx="30" ry="16" fill="#d9a83e" stroke="#0a0a0a" stroke-width="2.4"/><path d="M78 54 Q86 44 92 40 Q88 48 86 54" stroke="#d9a83e" stroke-width="4" fill="none"/><circle cx="92" cy="38" r="4" fill="#d9a83e" stroke="#0a0a0a" stroke-width="1.5"/><rect x="42" y="46" width="16" height="6" rx="3" fill="#d9a83e" stroke="#0a0a0a" stroke-width="1.5"/>'+hl(38,58,7,3,.6));}
function carpet(){return wrap('<ellipse cx="50" cy="82" rx="26" ry="4" fill="#000" opacity=".2"/><path d="M14 60 Q30 50 50 52 Q70 54 86 62 L82 72 Q50 62 18 72 Z" fill="#c84a4a" stroke="#0a0a0a" stroke-width="2.4" stroke-linejoin="round"/>'+hl(30,54,6,3,.55));}
function palace(){return wrap('<ellipse cx="50" cy="86" rx="28" ry="4" fill="#000" opacity=".2"/><path d="M20 78 L20 40 L28 40 L28 30 L34 30 L34 40 L42 40 L42 24 L50 16 L58 24 L58 40 L66 40 L66 30 L72 30 L72 40 L80 40 L80 78 Z" fill="#7a4aa8" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/><rect x="34" y="58" width="32" height="20" rx="3" fill="#e8c25c" stroke="#0a0a0a" stroke-width="1.8"/>'+hl(38,42,5,8,.35));}
function genie(){return wrap('<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity=".2"/><path d="M50 14 Q60 14 62 24 Q66 30 64 40 Q62 50 50 52 Q38 50 36 40 Q34 30 38 24 Q40 14 50 14 Z" fill="#8a4ae0" stroke="#0a0a0a" stroke-width="2.2"/><path d="M30 88 Q34 62 50 60 Q66 62 70 88 Z" fill="#8a4ae0" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="44" cy="34" r="2.5" fill="#0a0a0a"/><circle cx="56" cy="34" r="2.5" fill="#0a0a0a"/>'+hl(42,26,4,3,.5));}
function wild(){return wrap('<ellipse cx="50" cy="86" rx="22" ry="3" fill="#000" opacity=".2"/><path d="M20 30 L30 70 L40 46 L50 70 L60 30 L70 70 L80 30" fill="none" stroke="#e8c25c" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'+hl(34,40,6,3,.6));}
function scatter(){return wrap('<circle cx="50" cy="50" r="32" fill="#f0a020" stroke="#0a0a0a" stroke-width="2.4"/><path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40 Z" fill="#fff8d0" stroke="#0a0a0a" stroke-width="1.2"/>'+hl(42,36,7,4,.6));}
window.LinesGameSymbols = {
  ten:function(){return card('10','#4a4a5a');},
  jack:function(){return card('J','#5a4a6a');},
  queen:function(){return card('Q','#6a4a7a');},
  king:function(){return card('K','#7a4a8a');},
  ace:function(){return card('A','#8a4a9a');},
  lamp:lamp, carpet:carpet, palace:palace, genie:genie,
  wild:wild, scatter:scatter
};
})();
