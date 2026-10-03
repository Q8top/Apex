/* aces-eights · 局内符号（经典 3×3 黑金） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}

function seven(){
  return wrap(shadow(88)+
    "<rect x=\"14\" y=\"14\" width=\"72\" height=\"72\" rx=\"10\" fill=\"#7a0808\" stroke=\"#e8c25c\" stroke-width=\"2.6\"/>"+
    "<text x=\"50\" y=\"55\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Georgia,serif\" font-size=\"58\" font-weight=\"900\" fill=\"#ffe060\" stroke=\"#0a0a0a\" stroke-width=\"1\" paint-order=\"stroke\">7</text>"+
    hl(38,24,10,3,.5)
  );
}
function bar(){
  return wrap(shadow(88)+
    "<rect x=\"14\" y=\"26\" width=\"72\" height=\"48\" rx=\"6\" fill=\"#0a0a0a\" stroke=\"#e8c25c\" stroke-width=\"2.6\"/>"+
    "<rect x=\"18\" y=\"30\" width=\"64\" height=\"40\" rx=\"4\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1.2\" opacity=\".55\"/>"+
    "<text x=\"50\" y=\"52\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"900\" fill=\"#ffe060\" letter-spacing=\"2\">BAR</text>"+
    hl(28,32,8,2,.4)
  );
}
function cherry(){
  return wrap(shadow(90)+
    "<path d=\"M50 20 Q44 24 42 40\" stroke=\"#3a6a1a\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/>"+
    "<path d=\"M50 20 Q58 24 62 42\" stroke=\"#3a6a1a\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/>"+
    "<circle cx=\"40\" cy=\"58\" r=\"16\" fill=\"#c82828\" stroke=\"#4a0808\" stroke-width=\"2.4\"/>"+
    "<circle cx=\"64\" cy=\"60\" r=\"16\" fill=\"#c82828\" stroke=\"#4a0808\" stroke-width=\"2.4\"/>"+
    hl(35,50,5,3,.65)+hl(59,52,5,3,.65)
  );
}
function bell(){
  return wrap(shadow(88)+
    "<path d=\"M30 68 L30 42 Q30 26 50 24 Q70 26 70 42 L70 68 Z\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/>"+
    "<rect x=\"22\" y=\"68\" width=\"56\" height=\"8\" rx=\"3\" fill=\"#c9a227\" stroke=\"#5a3a08\" stroke-width=\"2\"/>"+
    "<circle cx=\"50\" cy=\"78\" r=\"3.5\" fill=\"#ffe060\" stroke=\"#5a3a08\" stroke-width=\"1.4\"/>"+
    hl(40,38,6,8,.4)
  );
}
function eight(){
  return wrap(shadow(88)+
    "<rect x=\"14\" y=\"14\" width=\"72\" height=\"72\" rx=\"10\" fill=\"#0a1a4a\" stroke=\"#80a0ff\" stroke-width=\"2.6\"/>"+
    "<text x=\"50\" y=\"55\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Georgia,serif\" font-size=\"58\" font-weight=\"900\" fill=\"#a8c0ff\" stroke=\"#0a0a0a\" stroke-width=\"1\" paint-order=\"stroke\">8</text>"+
    hl(38,24,10,3,.5)
  );
}
function ace(){
  return wrap(shadow(88)+
    "<rect x=\"14\" y=\"14\" width=\"72\" height=\"72\" rx=\"10\" fill=\"#7a1a4a\" stroke=\"#e8c25c\" stroke-width=\"2.6\"/>"+
    "<text x=\"50\" y=\"50\" text-anchor=\"middle\" dominant-baseline=\"central\" font-family=\"Georgia,serif\" font-size=\"42\" font-weight=\"900\" fill=\"#ffe060\" stroke=\"#0a0a0a\" stroke-width=\"1\" paint-order=\"stroke\">A</text>"+
    "<path d=\"M50 66 C44 72 40 76 40 80 C40 84 44 86 47 84 C49 83 50 81 50 79 C50 81 51 83 53 84 C56 86 60 84 60 80 C60 76 56 72 50 66 Z\" fill=\"#ffe060\" stroke=\"#0a0a0a\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/>"+
    hl(38,24,10,3,.5)
  );
}
function wild(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"1\" opacity=\".5\"/>"+
    "<circle cx=\"50\" cy=\"50\" r=\"36\" fill=\"#1a1a1a\" stroke=\"#e8c25c\" stroke-width=\"2.4\"/>"+
    "<path d=\"M22 34 L32 70 L42 50 L50 70 L58 50 L68 70 L78 34\" fill=\"none\" stroke=\"#e8c25c\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
  );
}
function scatter(){
  return wrap(
    "<circle cx=\"50\" cy=\"50\" r=\"34\" fill=\"#e8c25c\" stroke=\"#5a3a08\" stroke-width=\"2.6\"/>"+
    "<path d=\"M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z\" fill=\"#fff8d0\" stroke=\"#5a3a08\" stroke-width=\"1.2\"/>"+
    hl(38,34,8,5,.55)
  );
}

window.Sym_aces_eights = {
  seven:seven,
  bar:bar,
  cherry:cherry,
  bell:bell,
  ace:ace,
  eight:eight,
  wild:wild,
  scatter:scatter
};
})();
