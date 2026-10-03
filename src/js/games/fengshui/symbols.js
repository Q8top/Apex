/* fengshui · 局内符号（绿金风水） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}
function letterCard(txt){
  return wrap(
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#0a2a1a" stroke="#3aaa6a" stroke-width="2.4"/>'+
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="#3aaa6a" stroke-width="1" opacity=".55"/>'+
    '<circle cx="21" cy="21" r="2.2" fill="#3aaa6a"/><circle cx="79" cy="21" r="2.2" fill="#3aaa6a"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="#3aaa6a"/><circle cx="79" cy="79" r="2.2" fill="#3aaa6a"/>'+
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="#3aaa6a" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    hl(38,24,10,3,.4)
  );
}
function coin(){
  return wrap(shadow(88)+
    "<circle cx=\"50\" cy=\"52\" r=\"28\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.6\"/>"+
    "<rect x=\"38\" y=\"44\" width=\"24\" height=\"16\" fill=\"none\" stroke=\"#5a3a08\" stroke-width=\"2.4\"/>"+
    "<path d=\"M38 52 L62 52\" stroke=\"#5a3a08\" stroke-width=\"1.6\"/>"+
    hl(38,40,8,4,.55)
  );
}
function jade(){
  return wrap(shadow(88)+
    "<ellipse cx=\"50\" cy=\"52\" rx=\"22\" ry=\"28\" fill=\"#3aaa6a\" stroke=\"#0a3a18\" stroke-width=\"2.6\"/>"+
    "<circle cx=\"50\" cy=\"52\" r=\"8\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".55\"/>"+
    hl(42,38,6,5,.5)
  );
}
function dragon(){
  return wrap(shadow(88)+
    "<path d=\"M20 70 Q28 44 48 38 Q68 34 76 48 Q82 60 70 66 Q58 72 48 64\" fill=\"none\" stroke=\"#3aaa6a\" stroke-width=\"8\" stroke-linecap=\"round\"/>"+
    "<path d=\"M20 70 Q28 44 48 38 Q68 34 76 48 Q82 60 70 66 Q58 72 48 64\" fill=\"none\" stroke=\"#0a3a18\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>"+
    "<circle cx=\"76\" cy=\"48\" r=\"6\" fill=\"#3aaa6a\" stroke=\"#0a3a18\" stroke-width=\"1.8\"/>"+
    "<circle cx=\"74\" cy=\"46\" r=\"1.5\" fill=\"#0a0a0a\"/>"
  );
}
function phoenix(){
  return wrap(shadow(88)+
    "<path d=\"M50 20 Q40 22 38 32 Q36 44 46 52 Q40 64 32 70 Q48 70 56 56 Q64 64 76 66 Q68 54 62 46 Q68 38 64 28 Q58 22 50 20 Z\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>"+
    "<circle cx=\"54\" cy=\"32\" r=\"2\" fill=\"#0a0a0a\"/>"+
    hl(48,30,4,3,.6)
  );
}
function taichi(){
  return wrap(shadow(88)+
    "<circle cx=\"50\" cy=\"52\" r=\"32\" fill=\"#f0e8d0\" stroke=\"#0a0a0a\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 20 A32 32 0 0 1 50 84 A16 16 0 0 1 50 52 A16 16 0 0 0 50 20 Z\" fill=\"#3aaa6a\"/>"+
    "<circle cx=\"50\" cy=\"36\" r=\"3.5\" fill=\"#0a0a0a\"/>"+
    "<circle cx=\"50\" cy=\"68\" r=\"3.5\" fill=\"#f0e8d0\"/>"
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
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#3aaa6a\" stroke=\"#0a3a18\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#0a3a18\" stroke-width=\"1.2\"/>"+
    hl(38,34,8,5,.55)
  );
}
window.Sym_fengshui = {
  ten:function(){return letterCard('10');},
  jack:function(){return letterCard('J');},
  queen:function(){return letterCard('Q');},
  king:function(){return letterCard('K');},
  ace:function(){return letterCard('A');},
  coin:coin, jade:jade, dragon:dragon, phoenix:phoenix,
  star:coin, moon:jade, palace:dragon, hero:phoenix,
  wild:wild, scatter:scatter, taichi:taichi
};
})();
