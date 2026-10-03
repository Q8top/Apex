/* 1429-seas · 局内符号（大航海主题） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#042830" stroke="#5ad0e0" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#5ad0e0" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#5ad0e0"/><circle cx="79" cy="21" r="2.2" fill="#5ad0e0"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#5ad0e0"/><circle cx="79" cy="79" r="2.2" fill="#5ad0e0"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#5ad0e0" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)+hl(50,42,14,4,.18)
  );
}
function ship(){
  return wrap(shadow(92)+
    "<path d=\"M40 138 Q60 128 80 138 T120 138 T160 138\" stroke=\"#5ad0e0\" stroke-width=\"3\" fill=\"none\" opacity=\".6\"/>"+
    "<path d=\"M28 68 L28 86 L74 86 Q80 78 78 68 Z\" fill=\"#8a5018\" stroke=\"#2a1408\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>"+
    "<rect x=\"26\" y=\"22\" width=\"4\" height=\"50\" rx=\"2\" fill=\"#8a5018\" stroke=\"#2a1408\" stroke-width=\"1.6\"/>"+
    "<path d=\"M28 26 L60 32 L60 62 L28 62 Z\" fill=\"#fff8e8\" stroke=\"#2a1408\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M28 32 L28 56\" stroke=\"#2a1408\" stroke-width=\"1\" opacity=\".35\"/>"+
    "<path d=\"M33 38 L55 42 M33 50 L55 52\" stroke=\"#8a5018\" stroke-width=\"1.2\" opacity=\".6\"/>"+
    "<path d=\"M14 100 Q32 94 50 100 T86 100\" stroke=\"#5ad0e0\" stroke-width=\"3\" fill=\"none\" opacity=\".7\" stroke-linecap=\"round\"/>"
  );
}
function compass(){
  return wrap(shadow(88)+
    "<circle cx=\"50\" cy=\"52\" r=\"32\" fill=\"#0a3a4a\" stroke=\"#e8c25c\" stroke-width=\"3\"/>"+
    "<circle cx=\"50\" cy=\"52\" r=\"26\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1.2\" opacity=\".6\"/>"+
    "<path d=\"M50 26 L54 46 L74 50 L54 54 L50 78 L46 54 L26 50 L46 46 Z\" fill=\"#e8c25c\" stroke=\"#2a1408\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 26 L46 46 L50 50 L54 46 Z\" fill=\"#fff\" opacity=\".6\"/>"+
    "<circle cx=\"50\" cy=\"52\" r=\"3\" fill=\"#2a1408\"/>"+
    hl(38,38,6,3,.5)
  );
}
function pirate(){
  return wrap(shadow(92)+
    "<path d=\"M28 88 Q32 58 50 54 Q68 58 72 88 Z\" fill=\"#3a2010\" stroke=\"#1a0a04\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M40 72 L60 72\" stroke=\"#e8c25c\" stroke-width=\"2\"/>"+
    "<circle cx=\"50\" cy=\"40\" r=\"14\" fill=\"#e8c0a0\" stroke=\"#1a0a04\" stroke-width=\"2.2\"/>"+
    "<path d=\"M34 34 L66 34 L66 38 L34 38 Z\" fill=\"#2a1408\" stroke=\"#1a0a04\" stroke-width=\"1.6\"/>"+
    "<path d=\"M50 24 Q54 22 58 24 L58 34 L42 34 L42 24 Q46 22 50 24 Z\" fill=\"#2a1408\" stroke=\"#1a0a04\" stroke-width=\"1.6\"/>"+
    "<circle cx=\"44\" cy=\"46\" r=\"2\" fill=\"#0a0a0a\"/>"+
    "<circle cx=\"56\" cy=\"46\" r=\"2\" fill=\"#0a0a0a\"/>"+
    "<path d=\"M42 48 L46 50 M54 50 L58 48\" stroke=\"#1a0a04\" stroke-width=\"1.4\"/>"
  );
}
function wild(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1\" opacity=\".5\"/>"+
    "<path d=\"M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
  );
}
function scatter(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#5ad0e0\" stroke=\"#0a3a4a\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#0a3a4a\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>"+
    hl(38,34,8,5,.55)
  );
}
window.Sym_1429_seas = {
  ten:function(){return letterCard('10');},
  jack:function(){return letterCard('J');},
  queen:function(){return letterCard('Q');},
  king:function(){return letterCard('K');},
  ace:function(){return letterCard('A');},
  star:ship, moon:compass, palace:pirate, hero:ship,
  wild:wild, scatter:scatter
};
})();
