/* 10001-nights · 局内符号 SVG（精修版） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#4a1008" stroke="#5ad0e0" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#5ad0e0" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#5ad0e0"/>'+
    '<circle cx="79" cy="21" r="2.2" fill="#5ad0e0"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#5ad0e0"/>'+
    '<circle cx="79" cy="79" r="2.2" fill="#5ad0e0"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#5ad0e0" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)+hl(50,42,14,4,.18)
  );
}

function star(){
  return wrap(shadow(88)+
    "<path d=\"M50 16 L58 42 L86 42 L64 60 L72 88 L50 70 L28 88 L36 60 L14 42 L42 42 Z\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 24 L55 40 L50 50\" stroke=\"#fff\" stroke-width=\"2\" fill=\"none\" opacity=\".7\" stroke-linecap=\"round\"/>"+
    hl(40,36,5,3,.55)
  );
}
function moon(){
  return wrap(shadow(88)+
    "<path d=\"M62 22 A32 32 0 1 0 62 78 A26 26 0 1 1 62 22 Z\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M56 32 A22 22 0 0 0 56 68\" stroke=\"#fff8d0\" stroke-width=\"2.4\" fill=\"none\" opacity=\".7\" stroke-linecap=\"round\"/>"+
    "<circle cx=\"36\" cy=\"44\" r=\"2.5\" fill=\"#fff8d0\" opacity=\".9\"/>"+
    "<circle cx=\"28\" cy=\"58\" r=\"1.8\" fill=\"#fff8d0\" opacity=\".75\"/>"
  );
}
function palace(){
  return wrap(shadow(90)+
    "<rect x=\"20\" y=\"46\" width=\"60\" height=\"42\" fill=\"#a03018\" stroke=\"#4a1008\" stroke-width=\"2.2\"/>"+
    "<path d=\"M42 88 L42 66 Q50 60 58 66 L58 88 Z\" fill=\"#e8c25c\" stroke=\"#4a1008\" stroke-width=\"1.8\"/>"+
    "<path d=\"M34 46 Q34 26 50 22 Q66 26 66 46 Z\" fill=\"#e87040\" stroke=\"#4a1008\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<rect x=\"18\" y=\"34\" width=\"10\" height=\"54\" fill=\"#a03018\" stroke=\"#4a1008\" stroke-width=\"1.8\"/>"+
    "<rect x=\"72\" y=\"34\" width=\"10\" height=\"54\" fill=\"#a03018\" stroke=\"#4a1008\" stroke-width=\"1.8\"/>"+
    "<path d=\"M18 34 L23 22 L28 34 Z\" fill=\"#e87040\" stroke=\"#4a1008\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M72 34 L77 22 L82 34 Z\" fill=\"#e87040\" stroke=\"#4a1008\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 22 L50 14 L58 17 L50 20\" fill=\"#e8c25c\" stroke=\"#4a1008\" stroke-width=\"1\"/>"+
    "<rect x=\"28\" y=\"56\" width=\"6\" height=\"10\" fill=\"#ffe9a0\" stroke=\"#4a1008\" stroke-width=\"1\"/>"+
    "<rect x=\"66\" y=\"56\" width=\"6\" height=\"10\" fill=\"#ffe9a0\" stroke=\"#4a1008\" stroke-width=\"1\"/>"+
    hl(40,34,6,3,.5)
  );
}
function hero(){
  return wrap(shadow(92)+
    "<path d=\"M28 88 Q32 58 50 54 Q68 58 72 88 Z\" fill=\"#a03018\" stroke=\"#4a1008\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M40 72 L60 72\" stroke=\"#e8c25c\" stroke-width=\"2\"/>"+
    "<circle cx=\"50\" cy=\"40\" r=\"14\" fill=\"#ffd8c0\" stroke=\"#4a1008\" stroke-width=\"2.2\"/>"+
    "<path d=\"M36 40 Q36 26 50 24 Q64 26 64 40 L60 38 L40 38 Z\" fill=\"#a03018\" stroke=\"#4a1008\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/>"+
    "<ellipse cx=\"45\" cy=\"42\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<ellipse cx=\"55\" cy=\"42\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<path d=\"M45 48 Q50 52 55 48\" stroke=\"#4a1008\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/>"+
    hl(44,34,4,2,.6)
  );
}
function wild(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1\" opacity=\".5\"/>"+
    "<path d=\"M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M22 34 L28 56\" stroke=\"#fff\" stroke-width=\"2\" fill=\"none\" opacity=\".6\" stroke-linecap=\"round\"/>"
  );
}
function scatter(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#e87040\" stroke=\"#4a1008\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#4a1008\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M72 68 L73 72 L77 73 L73 74 L72 78 L71 74 L67 73 L71 72 Z\" fill=\"#fff8d0\" opacity=\".9\"/>"+
    hl(38,34,8,5,.55)
  );
}

window.Sym_10001_mega = {
  ten:   function(){return letterCard('10');},
  jack:  function(){return letterCard('J');},
  queen: function(){return letterCard('Q');},
  king:  function(){return letterCard('K');},
  ace:   function(){return letterCard('A');},
  star:star, moon:moon, palace:palace, hero:hero, wild:wild, scatter:scatter
};
})();
