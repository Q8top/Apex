/* arabian-nights · 局内符号（紫金） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#1a0a2a" stroke="#c8a8f0" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#c8a8f0" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#c8a8f0"/><circle cx="79" cy="21" r="2.2" fill="#c8a8f0"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#c8a8f0"/><circle cx="79" cy="79" r="2.2" fill="#c8a8f0"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#c8a8f0" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)
  );
}
function lamp(){
  return wrap(shadow(88)+
    "<ellipse cx=\"50\" cy=\"66\" rx=\"30\" ry=\"14\" fill=\"#8a4ae0\" stroke=\"#3a0a70\" stroke-width=\"2.4\"/>"+
    "<ellipse cx=\"50\" cy=\"54\" rx=\"18\" ry=\"6\" fill=\"#a86ae0\" stroke=\"#3a0a70\" stroke-width=\"2\"/>"+
    "<rect x=\"38\" y=\"46\" width=\"24\" height=\"6\" rx=\"3\" fill=\"#7a3ac0\" stroke=\"#3a0a70\" stroke-width=\"1.8\"/>"+
    "<circle cx=\"50\" cy=\"42\" r=\"4\" fill=\"#a86ae0\" stroke=\"#3a0a70\" stroke-width=\"1.6\"/>"+
    "<path d=\"M78 64 Q88 58 92 48 L96 50 Q92 62 82 70 Z\" fill=\"#7a3ac0\" stroke=\"#3a0a70\" stroke-width=\"2\" stroke-linejoin=\"round\"/>"+
    "<circle cx=\"94\" cy=\"49\" r=\"3\" fill=\"#a86ae0\" stroke=\"#3a0a70\" stroke-width=\"1.4\"/>"+
    "<path d=\"M22 60 Q14 58 12 66 Q14 74 22 72\" fill=\"none\" stroke=\"#3a0a70\" stroke-width=\"3\" stroke-linecap=\"round\"/>"+
    hl(38,62,10,4,.5)+
    "<path d=\"M50 30 L52 36 L58 38 L52 40 L50 46 L48 40 L42 38 L48 36 Z\" fill=\"#ffe9a0\" opacity=\".85\"/>"
  );
}
function carpet(){
  return wrap(shadow(88)+
    "<path d=\"M14 62 Q30 54 50 56 Q70 58 86 66 L82 76 Q50 68 18 76 Z\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M22 66 Q50 60 78 66\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1.6\"/>"+
    "<path d=\"M50 60 L58 66 L50 72 L42 66 Z\" fill=\"#e8c25c\" stroke=\"#3a0a5a\" stroke-width=\"1.2\"/>"+
    "<path d=\"M14 62 L6 58 L12 66 Z\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M86 66 L94 62 L88 70 Z\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/>"+
    hl(30,64,6,2,.5)
  );
}
function palace(){
  return wrap(shadow(90)+
    "<rect x=\"20\" y=\"46\" width=\"60\" height=\"42\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"2.2\"/>"+
    "<path d=\"M42 88 L42 66 Q50 60 58 66 L58 88 Z\" fill=\"#e8c25c\" stroke=\"#3a0a5a\" stroke-width=\"1.8\"/>"+
    "<path d=\"M34 46 Q34 26 50 22 Q66 26 66 46 Z\" fill=\"#8a4ae0\" stroke=\"#3a0a5a\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<rect x=\"18\" y=\"34\" width=\"10\" height=\"54\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"1.8\"/>"+
    "<rect x=\"72\" y=\"34\" width=\"10\" height=\"54\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"1.8\"/>"+
    "<path d=\"M18 34 L23 22 L28 34 Z\" fill=\"#8a4ae0\" stroke=\"#3a0a5a\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M72 34 L77 22 L82 34 Z\" fill=\"#8a4ae0\" stroke=\"#3a0a5a\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M50 22 L50 14 L58 17 L50 20\" fill=\"#e8c25c\" stroke=\"#3a0a5a\" stroke-width=\"1\"/>"+
    hl(40,34,6,3,.5)
  );
}
function hero(){
  return wrap(shadow(92)+
    "<path d=\"M28 88 Q32 58 50 54 Q68 58 72 88 Z\" fill=\"#8a4ae0\" stroke=\"#3a0a5a\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/>"+
    "<path d=\"M40 72 L60 72\" stroke=\"#e8c25c\" stroke-width=\"2\"/>"+
    "<circle cx=\"50\" cy=\"40\" r=\"14\" fill=\"#d0b0f0\" stroke=\"#3a0a5a\" stroke-width=\"2.2\"/>"+
    "<path d=\"M36 40 Q36 26 50 24 Q64 26 64 40 Q60 34 50 34 Q40 34 36 40 Z\" fill=\"#6a2a8a\" stroke=\"#3a0a5a\" stroke-width=\"1.8\"/>"+
    "<circle cx=\"50\" cy=\"22\" r=\"3\" fill=\"#e8c25c\" stroke=\"#3a0a5a\" stroke-width=\"1.2\"/>"+
    "<ellipse cx=\"45\" cy=\"42\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<ellipse cx=\"55\" cy=\"42\" rx=\"1.6\" ry=\"2\" fill=\"#0a0a0a\"/>"+
    "<path d=\"M45 48 Q50 52 55 48\" stroke=\"#3a0a5a\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"/>"
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
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#8a4ae0\" stroke=\"#3a0a5a\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#3a0a5a\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/>"+
    hl(38,34,8,5,.55)
  );
}
window.Sym_arabian_nights = {
  ten:function(){return letterCard('10');},
  jack:function(){return letterCard('J');},
  queen:function(){return letterCard('Q');},
  king:function(){return letterCard('K');},
  ace:function(){return letterCard('A');},
  star:lamp, moon:carpet, palace:palace, hero:hero,
  wild:wild, scatter:scatter
};
})();
