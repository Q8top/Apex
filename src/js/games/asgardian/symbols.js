/* asgardian · 局内符号（北欧蓝） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#0a0a2a" stroke="#80a0ff" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#80a0ff" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#80a0ff"/><circle cx="79" cy="21" r="2.2" fill="#80a0ff"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#80a0ff"/><circle cx="79" cy="79" r="2.2" fill="#80a0ff"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#80a0ff" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)
  );
}
function hammer(){
  return wrap(shadow(92)+
    "<rect x=\"30\" y=\"26\" width=\"40\" height=\"22\" rx=\"3\" fill=\"#5a6a9a\" stroke=\"#1a2a5a\" stroke-width=\"2.6\"/>"+
    "<rect x=\"34\" y=\"30\" width=\"32\" height=\"6\" fill=\"#e8c25c\" stroke=\"#1a2a5a\" stroke-width=\"1.5\"/>"+
    "<rect x=\"44\" y=\"48\" width=\"12\" height=\"34\" rx=\"2\" fill=\"#5a6a9a\" stroke=\"#1a2a5a\" stroke-width=\"2.2\"/>"+
    "<path d=\"M38 82 L62 82 L58 92 L42 92 Z\" fill=\"#e8c25c\" stroke=\"#1a2a5a\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 30 L46 42 L54 42 Z\" fill=\"#ffe9a0\" opacity=\".85\"/>"+
    hl(38,32,6,2,.55)+
    "<path d=\"M24 30 L26 36 L32 38 L26 40 L24 46 L22 40 L16 38 L22 36 Z\" fill=\"#ffe9a0\" opacity=\".75\"/>"+
    "<path d=\"M78 34 L79 38 L83 39 L79 40 L78 44 L77 40 L73 39 L77 38 Z\" fill=\"#ffe9a0\" opacity=\".65\"/>"
  );
}
function cup(){
  return wrap(shadow(88)+
    "<path d=\"M28 30 L72 30 L68 52 Q62 66 50 66 Q38 66 32 52 Z\" fill=\"#80a0ff\" stroke=\"#1a2a5a\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>"+
    "<ellipse cx=\"50\" cy=\"30\" rx=\"22\" ry=\"4\" fill=\"#a0c0ff\" stroke=\"#1a2a5a\" stroke-width=\"1.6\"/>"+
    "<rect x=\"44\" y=\"66\" width=\"12\" height=\"12\" fill=\"#5a6a9a\" stroke=\"#1a2a5a\" stroke-width=\"1.8\"/>"+
    "<ellipse cx=\"50\" cy=\"80\" rx=\"16\" ry=\"3\" fill=\"#5a6a9a\" stroke=\"#1a2a5a\" stroke-width=\"1.8\"/>"+
    "<path d=\"M28 34 Q50 40 72 34\" stroke=\"#fff\" stroke-width=\"1.6\" fill=\"none\" opacity=\".55\"/>"+
    hl(40,40,5,3,.5)
  );
}
function ring(){
  return wrap(shadow(90)+
    "<circle cx=\"50\" cy=\"58\" r=\"22\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"7\"/>"+
    "<circle cx=\"50\" cy=\"58\" r=\"22\" fill=\"none\" stroke=\"#1a2a5a\" stroke-width=\"1.5\"/>"+
    "<path d=\"M50 20 L58 36 L50 48 L42 36 Z\" fill=\"#80a0ff\" stroke=\"#1a2a5a\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"+
    hl(46,30,3,3,.6)
  );
}
function rune(){
  return wrap(shadow(88)+
    "<rect x=\"30\" y=\"20\" width=\"40\" height=\"58\" rx=\"6\" fill=\"#1a2a5a\" stroke=\"#e8c25c\" stroke-width=\"2.4\"/>"+
    "<rect x=\"36\" y=\"26\" width=\"28\" height=\"46\" rx=\"3\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\".8\" opacity=\".55\"/>"+
    "<path d=\"M40 36 L60 36 M50 36 L50 64 M40 46 L60 46 M40 56 L60 56\" stroke=\"#80a0ff\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>"+
    hl(38,26,8,2,.4)
  );
}
function wild(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"none\" stroke=\"#80a0ff\" stroke-width=\"1\" opacity=\".5\"/>"+
    "<path d=\"M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32\" fill=\"none\" stroke=\"#80a0ff\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
  );
}
function scatter(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#5a6a9a\" stroke=\"#1a2a5a\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#1a2a5a\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>"+
    hl(38,34,8,5,.55)
  );
}
window.Sym_asgardian = {
  ten:function(){return letterCard('10');},
  jack:function(){return letterCard('J');},
  queen:function(){return letterCard('Q');},
  king:function(){return letterCard('K');},
  ace:function(){return letterCard('A');},
  star:rune, moon:ring, palace:cup, hero:hammer,
  wild:wild, scatter:scatter
};
})();
