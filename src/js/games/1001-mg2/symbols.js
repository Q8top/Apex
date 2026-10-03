/* 1001-mg2 · 局内符号 SVG（精修版） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#2a0a1a" stroke="#e050a0" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#e050a0" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#e050a0"/>'+
    '<circle cx="79" cy="21" r="2.2" fill="#e050a0"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#e050a0"/>'+
    '<circle cx="79" cy="79" r="2.2" fill="#e050a0"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#e050a0" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)+hl(50,42,14,4,.18)
  );
}

function bottle(){
  return wrap(shadow(88)+
    "<ellipse cx=\"50\" cy=\"62\" rx=\"22\" ry=\"26\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"2.4\"/>"+
    "<rect x=\"44\" y=\"26\" width=\"12\" height=\"14\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"2\"/>"+
    "<rect x=\"40\" y=\"20\" width=\"20\" height=\"8\" rx=\"3\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"1.8\"/>"+
    "<circle cx=\"50\" cy=\"62\" r=\"8\" fill=\"#ffe9a0\" opacity=\".85\" stroke=\"#7a1a58\" stroke-width=\"1.4\"/>"+
    "<path d=\"M48 58 L52 62 L48 66 Z\" fill=\"#7a1a58\"/>"+
    hl(40,52,6,3,.5)+hl(50,80,8,2,.3)
  );
}
function ring(){
  return wrap(shadow(90)+
    "<circle cx=\"50\" cy=\"60\" r=\"24\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"8\"/>"+
    "<circle cx=\"50\" cy=\"60\" r=\"24\" fill=\"none\" stroke=\"#5a3a08\" stroke-width=\"1.5\"/>"+
    "<path d=\"M50 20 L60 38 L50 52 L40 38 Z\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 24 L54 34 L50 42\" stroke=\"#fff\" stroke-width=\"1.6\" fill=\"none\" opacity=\".55\" stroke-linecap=\"round\"/>"+
    hl(44,30,3,4,.6)
  );
}
function carpet(){
  return wrap(shadow(88)+
    "<path d=\"M14 62 Q30 54 50 56 Q70 58 86 66 L82 76 Q50 68 18 76 Z\" fill=\"#b83232\" stroke=\"#4a0808\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M22 66 Q50 60 78 66\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1.6\" opacity=\".85\"/>"+
    "<path d=\"M50 60 L58 66 L50 72 L42 66 Z\" fill=\"#e8c25c\" stroke=\"#4a0808\" stroke-width=\"1.2\"/>"+
    "<path d=\"M14 62 L6 58 L12 66 Z\" fill=\"#b83232\" stroke=\"#4a0808\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M86 66 L94 62 L88 70 Z\" fill=\"#b83232\" stroke=\"#4a0808\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/>"+
    hl(30,64,6,2,.5)
  );
}
function princess(){
  return wrap(shadow(92)+
    "<path d=\"M30 88 Q32 60 50 56 Q68 60 70 88 Z\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<circle cx=\"50\" cy=\"42\" r=\"14\" fill=\"#ffd0e8\" stroke=\"#7a1a58\" stroke-width=\"2.2\"/>"+
    "<path d=\"M36 42 Q36 26 50 24 Q64 26 64 42 Q60 34 50 34 Q40 34 36 42 Z\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"1.8\"/>"+
    "<circle cx=\"50\" cy=\"22\" r=\"3\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"1.2\"/>"+
    "<ellipse cx=\"45\" cy=\"44\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<ellipse cx=\"55\" cy=\"44\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<path d=\"M46 50 Q50 53 54 50\" stroke=\"#7a1a58\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/>"+
    hl(44,36,4,2,.6)
  );
}
function wild(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1\" opacity=\".5\"/>"+
    "<path d=\"M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M22 34 L28 56\" stroke=\"#fff\" stroke-width=\"2\" fill=\"none\" opacity=\".6\" stroke-linecap=\"round\"/>"+
    "<path d=\"M50 14 L52 20 L58 22 L52 24 L50 30 L48 24 L42 22 L48 20 Z\" fill=\"#ffe9a0\" opacity=\".9\"/>"
  );
}
function scatter(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#e050a0\" stroke=\"#7a1a58\" stroke-width=\"2.6\"/>"+
    "<circle cx=\"50\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"#ffd0e8\" stroke-width=\"1\" opacity=\".6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#7a1a58\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M72 68 L73 72 L77 73 L73 74 L72 78 L71 74 L67 73 L71 72 Z\" fill=\"#fff8d0\" opacity=\".9\"/>"+
    hl(38,34,8,5,.55)
  );
}

window.Sym_1001_mg2 = {
  ten:   function(){return letterCard('10');},
  jack:  function(){return letterCard('J');},
  queen: function(){return letterCard('Q');},
  king:  function(){return letterCard('K');},
  ace:   function(){return letterCard('A');},
  bottle:bottle, ring:ring, carpet:carpet, princess:princess, wild:wild, scatter:scatter
};
})();
