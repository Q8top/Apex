/* Apex · Olympus 符号库 — 内联 SVG，纯编程 */
(function(){
'use strict';

var DEFS_ID = 'olympus-symbol-defs';
function ensureDefs(){
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id = DEFS_ID; svg.setAttribute('aria-hidden','true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML =
    '<defs>'
    + '<radialGradient id="oly-disk" cx=".38" cy=".32" r=".78">'
      + '<stop offset="0" stop-color="#9A78E0"/><stop offset=".45" stop-color="#5A3AA0"/><stop offset="1" stop-color="#200A50"/></radialGradient>'
    + '<linearGradient id="oly-gold" x1=".3" y1="0" x2=".7" y2="1">'
      + '<stop offset="0" stop-color="#FFF8C8"/><stop offset=".18" stop-color="#FFDC70"/>'
      + '<stop offset=".42" stop-color="#E8A828"/><stop offset=".72" stop-color="#B87A10"/>'
      + '<stop offset=".92" stop-color="#7A5000"/><stop offset="1" stop-color="#C89018"/></linearGradient>'
    + '<linearGradient id="oly-gold-lt" x1=".3" y1="0" x2=".7" y2="1">'
      + '<stop offset="0" stop-color="#FFFCE8"/><stop offset=".5" stop-color="#FFE888"/><stop offset="1" stop-color="#D8A020"/></linearGradient>'
    + '<linearGradient id="oly-gold-diag" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="#FFF4B0"/><stop offset=".3" stop-color="#F0C040"/>'
      + '<stop offset=".65" stop-color="#A87810"/><stop offset="1" stop-color="#6A4600"/></linearGradient>'
    + '<linearGradient id="oly-cloth" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#B02858"/><stop offset=".5" stop-color="#801C40"/><stop offset="1" stop-color="#4A0820"/></linearGradient>'
    + '<linearGradient id="oly-glass" x1=".3" y1="0" x2=".7" y2="1">'
      + '<stop offset="0" stop-color="#E8F4FF"/><stop offset=".5" stop-color="#A8D0F0"/><stop offset="1" stop-color="#5A88C0"/></linearGradient>'
    + '<filter id="oly-grain" x="-8%" y="-8%" width="116%" height="116%">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>'
      + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.62  0 0 0 0 0.62  0 0 0 0.09 0" result="na"/>'
      + '<feComposite in="na" in2="SourceGraphic" operator="in" result="nc"/>'
      + '<feMorphology in="SourceAlpha" operator="erode" radius="0.7" result="er"/>'
      + '<feComposite in="SourceGraphic" in2="er" operator="out" result="rim"/>'
      + '<feGaussianBlur in="rim" stdDeviation="0.45" result="rb"/>'
      + '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="nc"/><feMergeNode in="rb"/></feMerge>'
    + '</filter>'
    + '</defs>';
  document.body.appendChild(svg);
}

function wrap(i,t){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-tier="'+(t||'common')+'">'
       + '<g filter="url(#oly-grain)">'+i+'</g></svg>';
}
function hl(cx,cy,rx,ry,op){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op==null?.6:op)+'"/>'; }
function sh(cx,cy,rx,ry,op){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#000" opacity="'+(op==null?.14:op)+'"/>'; }
function arc(d,c,w,op){ return '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+(w||.8)+'" opacity="'+(op==null?.65:op)+'" stroke-linecap="round"/>'; }
function star(cx,cy,r){
  return '<line x1="'+cx+'" y1="'+(cy-r)+'" x2="'+cx+'" y2="'+(cy+r)+'" stroke="#fff" stroke-width=".9" opacity=".9"/>'
       + '<line x1="'+(cx-r)+'" y1="'+cy+'" x2="'+(cx+r)+'" y2="'+cy+'" stroke="#fff" stroke-width=".9" opacity=".9"/>'
       + '<line x1="'+(cx-r*.6)+'" y1="'+(cy-r*.6)+'" x2="'+(cx+r*.6)+'" y2="'+(cy+r*.6)+'" stroke="#fff" stroke-width=".6" opacity=".65"/>'
       + '<line x1="'+(cx-r*.6)+'" y1="'+(cy+r*.6)+'" x2="'+(cx+r*.6)+'" y2="'+(cy-r*.6)+'" stroke="#fff" stroke-width=".6" opacity=".65"/>';
}
function pts2str(p){ var s=''; for (var i=0;i<p.length;i++) s += p[i][0].toFixed(2)+','+p[i][1].toFixed(2)+' '; return s.trim(); }
function poly(p, fill, stroke, sw){
  return '<polygon points="'+pts2str(p)+'" fill="'+(fill||'none')+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+(sw||1)+'" stroke-linejoin="round"':'')+'/>';
}

/* ---------- 宙斯 · 完全中轴对称 ---------- */
function zeus(){
  var s = sh(50,92,30,3,.18);
  s += '<circle cx="50" cy="50" r="42" fill="url(#oly-disk)"/>';
  s += '<circle cx="50" cy="50" r="42" fill="none" stroke="#6A4600" stroke-width="2.4"/>';
  s += '<circle cx="50" cy="50" r="39" fill="none" stroke="url(#oly-gold)" stroke-width="2.6"/>';
  s += '<circle cx="50" cy="50" r="36.5" fill="none" stroke="#FFF8C8" stroke-width=".5" opacity=".7"/>';
  /* 对称光芒线（8 条，从中心向外，只在盘面边缘） */
  for (var a=0; a<8; a++){
    var ang = (a*45 - 90) * Math.PI/180;
    var x1 = 50 + 32*Math.cos(ang), y1 = 50 + 32*Math.sin(ang);
    var x2 = 50 + 37*Math.cos(ang), y2 = 50 + 37*Math.sin(ang);
    s += '<line x1="'+x1.toFixed(2)+'" y1="'+y1.toFixed(2)+'" x2="'+x2.toFixed(2)+'" y2="'+y2.toFixed(2)+'" stroke="url(#oly-gold)" stroke-width="1.6" opacity=".85" stroke-linecap="round"/>';
  }
  /* 底部王座弧（金弧） */
  s += '<path d="M28 76 Q50 64 72 76" fill="none" stroke="url(#oly-gold)" stroke-width="3.2" stroke-linecap="round"/>';
  s += '<path d="M30 78 Q50 67 70 78" fill="none" stroke="#FFFCE8" stroke-width="1" opacity=".7" stroke-linecap="round"/>';
  /* 中央大闪电（居中，粗犷） */
  s += '<path d="M50 14 L38 48 L46 48 L38 86 L62 50 L54 50 L62 14 Z" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width="1.6" stroke-linejoin="round"/>';
  /* 闪电左高光 */
  s += '<path d="M50 14 L42 48 L45 48 L43 72" fill="none" stroke="#FFFCE8" stroke-width="1.4" opacity=".95" stroke-linecap="round" stroke-linejoin="round"/>';
  /* 闪电右暗面 */
  s += '<path d="M62 14 L56 46 L59 46 L56 62" fill="none" stroke="#7A5000" stroke-width="1" opacity=".55" stroke-linecap="round"/>';
  /* 盘面左上高光 */
  s += hl(30,26,12,8,.28);
  s += hl(28,24,6,3.5,.5);
  return s;
}

/* ---------- 金冠 · 5 尖对称（中心最高） ---------- */
function crown(){
  var s = sh(50,90,32,3,.18);
  /* 绒布底 */
  s += '<path d="M17 42 Q17 38 21 38 L79 38 Q83 38 83 42 L83 55 L17 55 Z" fill="url(#oly-cloth)" stroke="#4A0820" stroke-width=".7"/>';
  for (var i=0;i<6;i++){ var x=22+i*11; s += '<line x1="'+x+'" y1="39" x2="'+x+'" y2="54" stroke="#3A0518" stroke-width=".5" opacity=".7"/>'; }
  /* 5 尖主体：左右对称，中心最高 */
  s += '<path d="M11 62 L22 30 L36 48 L50 12 L64 48 L78 30 L89 62 Z" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.5" stroke-linejoin="round"/>';
  /* 左上高光带 */
  s += '<path d="M22 30 L36 48 L50 12 L50 22 L36 54 L24 36 Z" fill="#FFFCE8" opacity=".48"/>';
  /* 左右对称丝光弧 */
  s += arc('M28 34 Q32 44 38 52','#FFFCE8',1.2,.85);
  s += arc('M72 34 Q68 44 62 52','#7A5000',.9,.5);
  /* 底部金座 */
  s += '<rect x="9" y="60" width="82" height="14" rx="3" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2"/>';
  s += '<line x1="12" y1="64" x2="88" y2="64" stroke="#FFFCE8" stroke-width="1" opacity=".95"/>';
  s += '<line x1="12" y1="68" x2="88" y2="68" stroke="#7A5000" stroke-width=".5" opacity=".7"/>';
  s += '<line x1="12" y1="71" x2="88" y2="71" stroke="#7A5000" stroke-width=".4" opacity=".5"/>';
  /* 底座珍珠（左右对称：5 颗） */
  var pxs = [18, 34, 50, 66, 82];
  for (var p=0; p<pxs.length; p++){
    var px = pxs[p];
    var isC = (px === 50);
    s += '<circle cx="'+px+'" cy="67" r="'+(isC?3.2:2.4)+'" fill="'+(isC?'#D91E36':'#6A3FBF')+'" stroke="'+(isC?'#5A0010':'#3D0A70')+'" stroke-width=".6"/>';
    s += '<ellipse cx="'+(px-1.2)+'" cy="65.8" rx=".9" ry=".6" fill="#fff" opacity=".9"/>';
  }
  /* 顶尖宝石（中心 + 左右两尖） */
  s += '<circle cx="50" cy="12" r="2.6" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".8"/>';
  s += '<ellipse cx="49.2" cy="10.8" rx="1" ry=".7" fill="#fff" opacity=".95"/>';
  s += '<circle cx="22" cy="30" r="1.8" fill="#FFE888" stroke="#6A4600" stroke-width=".6"/>';
  s += '<circle cx="78" cy="30" r="1.8" fill="#FFE888" stroke="#6A4600" stroke-width=".6"/>';
  return s;
}

/* ---------- 圣杯 · 加对称雕花 ---------- */
function chalice(){
  var s = sh(50,90,22,3,.16);
  s += '<ellipse cx="50" cy="22" rx="28" ry="5" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2"/>';
  s += '<ellipse cx="50" cy="22.5" rx="23" ry="3.4" fill="#3A2200"/>';
  s += '<ellipse cx="50" cy="22.5" rx="23" ry="3.4" fill="none" stroke="#6A4600" stroke-width=".6"/>';
  s += '<path d="M22 22 L78 22 Q74 56 50 60 Q26 56 22 22 Z" fill="url(#oly-gold-diag)" stroke="#6A4600" stroke-width="1.3" stroke-linejoin="round"/>';
  s += '<path d="M26 26 Q28 48 42 56" fill="none" stroke="#FFFCE8" stroke-width="2.6" opacity=".9" stroke-linecap="round"/>';
  s += '<path d="M30 28 Q32 44 42 52" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/>';
  s += '<path d="M74 26 Q72 48 60 56" fill="none" stroke="#5A3A00" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
  /* 左右对称雕花（藤蔓） */
  s += arc('M32 28 Q36 44 44 52','#7A5000',1.4,.85);
  s += arc('M68 28 Q64 44 56 52','#7A5000',1.4,.85);
  s += arc('M38 26 Q50 30 62 26','#7A5000',1.2,.75);
  s += arc('M36 36 Q50 40 64 36','#7A5000',1.2,.7);
  s += arc('M40 46 Q50 49 60 46','#7A5000',1,.6);
  s += arc('M32 28 Q36 44 44 52','#FFFCE8',.5,.55);
  s += arc('M68 28 Q64 44 56 52','#FFFCE8',.5,.55);
  s += '<circle cx="50" cy="38" r="2.2" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".6"/>';
  s += '<ellipse cx="49.2" cy="37.2" rx=".7" ry=".5" fill="#fff" opacity=".95"/>';
  s += '<circle cx="46" cy="28" r="1.2" fill="#7A5000" opacity=".7"/>';
  s += '<circle cx="54" cy="28" r="1.2" fill="#7A5000" opacity=".7"/>';
  s += '<rect x="46" y="60" width="8" height="14" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1"/>';
  s += '<line x1="48" y1="62" x2="48" y2="72" stroke="#FFFCE8" stroke-width=".9" opacity=".9"/>';
  s += '<ellipse cx="50" cy="78" rx="24" ry="5" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2"/>';
  s += '<ellipse cx="50" cy="76.6" rx="19" ry="2.4" fill="#FFFCE8" opacity=".75"/>';
  s += '<ellipse cx="50" cy="76" rx="15" ry="1.8" fill="#FFE888" opacity=".6"/>';
  s += '<circle cx="50" cy="14" r="3.6" fill="#8B50D8" stroke="#3D0A70" stroke-width=".8"/>';
  s += '<ellipse cx="48.6" cy="12.6" rx="1.2" ry=".9" fill="#fff" opacity=".95"/>';
  return s;
}

/* ---------- 神戒 ---------- */
function ring(){
  var s = sh(50,90,28,3,.17);
  var cx=50, cy=62, rx=28, ry=22;
  s += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="url(#oly-gold)" stroke-width="8"/>';
  s += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="#6A4600" stroke-width=".8"/>';
  s += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(rx-3.6)+'" ry="'+(ry-3.6)+'" fill="none" stroke="#6A4600" stroke-width=".5" opacity=".65"/>';
  s += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(rx+3.6)+'" ry="'+(ry+3.6)+'" fill="none" stroke="#6A4600" stroke-width=".5" opacity=".65"/>';
  s += arc('M22 62 Q22 44 34 42','#FFFCE8',2,.9);
  s += arc('M24 62 Q24 48 34 46','#fff',1,.6);
  s += arc('M78 62 Q78 80 66 82','#5A3A00',2,.55);
  s += '<path d="M33 40 L40 27 L60 27 L67 40 L60 46 L40 46 Z" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2" stroke-linejoin="round"/>';
  s += arc('M36 38 Q42 30 50 29','#FFFCE8',1.4,.9);
  s += '<polygon points="50,10 62,26 50,42 38,26" fill="#E63950" stroke="#3A0008" stroke-width="1.2" stroke-linejoin="round"/>';
  s += '<polygon points="50,10 62,26 50,30 38,26" fill="#FF8898" opacity=".88"/>';
  s += '<polygon points="50,10 56,20 50,26 44,20" fill="#FFE0E8" opacity=".75"/>';
  s += '<polygon points="50,10 62,26 56,26 50,14" fill="#fff" opacity=".38"/>';
  s += '<polyline points="50,10 62,26" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85" stroke-linecap="round"/>';
  s += '<ellipse cx="46" cy="18" rx="2" ry="1.4" fill="#fff" opacity=".95"/>';
  return s;
}

/* ---------- 沙漏 · 加顶部金珠 ---------- */
function hourglass(){
  var s = sh(50,92,22,3,.16);
  s += '<rect x="20" y="10" width="60" height="9" rx="2.5" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2"/>';
  s += '<line x1="23" y1="13" x2="77" y2="13" stroke="#FFFCE8" stroke-width="1" opacity=".95"/>';
  s += '<line x1="23" y1="17" x2="77" y2="17" stroke="#7A5000" stroke-width=".5" opacity=".7"/>';
  s += '<rect x="20" y="81" width="60" height="9" rx="2.5" fill="url(#oly-gold)" stroke="#6A4600" stroke-width="1.2"/>';
  s += '<line x1="23" y1="84" x2="77" y2="84" stroke="#FFFCE8" stroke-width="1" opacity=".95"/>';
  s += '<line x1="23" y1="88" x2="77" y2="88" stroke="#7A5000" stroke-width=".5" opacity=".7"/>';
  s += '<path d="M28 19 Q28 42 50 50 Q72 42 72 19 Z" fill="url(#oly-glass)" stroke="#5A88C0" stroke-width=".9" opacity=".92"/>';
  s += '<path d="M28 81 Q28 58 50 50 Q72 58 72 81 Z" fill="url(#oly-glass)" stroke="#5A88C0" stroke-width=".9" opacity=".92"/>';
  s += '<path d="M32 21 Q32 38 50 46 Q68 38 68 21 Z" fill="url(#oly-gold)" opacity=".95"/>';
  s += '<path d="M36 21 Q36 34 50 42 Q64 34 64 21 Z" fill="#FFE888" opacity=".8"/>';
  s += '<path d="M32 79 Q32 60 50 54 Q68 60 68 79 Z" fill="url(#oly-gold)" opacity=".95"/>';
  s += '<path d="M36 79 Q36 64 50 58 Q64 64 64 79 Z" fill="#FFE888" opacity=".75"/>';
  s += '<line x1="50" y1="46" x2="50" y2="56" stroke="#FFE888" stroke-width="1.6" stroke-linecap="round"/>';
  s += '<circle cx="50" cy="50" r="1" fill="#FFFCE8"/><circle cx="50" cy="54" r=".8" fill="#FFFCE8" opacity=".85"/>';
  s += arc('M32 23 Q32 36 42 44','#fff',1.5,.95);
  s += arc('M32 77 Q32 64 42 56','#fff',1.2,.75);
  /* 顶部 + 底部对称金珠 */
  s += '<circle cx="50" cy="6" r="3.4" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".8"/>';
  s += '<ellipse cx="49" cy="4.8" rx="1.2" ry=".8" fill="#fff" opacity=".95"/>';
  s += '<circle cx="50" cy="94" r="3.4" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".8"/>';
  s += '<ellipse cx="49" cy="92.8" rx="1.2" ry=".8" fill="#fff" opacity=".95"/>';
  /* 左右对称金饰（小圆点 + 短金线） */
  s += '<circle cx="20" cy="14.5" r="2" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".6"/>';
  s += '<circle cx="80" cy="14.5" r="2" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".6"/>';
  s += '<circle cx="20" cy="85.5" r="2" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".6"/>';
  s += '<circle cx="80" cy="85.5" r="2" fill="url(#oly-gold-lt)" stroke="#6A4600" stroke-width=".6"/>';
  /* 玻璃反光加强 */
  s += arc('M32 22 Q32 36 42 44','#fff',1.8,.95);
  s += arc('M33 24 Q33 34 40 41','#fff',1,.7);
  return s;
}

/* ---------- 宝石（8 切面 + 台面 + 星芒） ---------- */
function makeGem(c){
  var cx=50, cy=50, r=40, tr=18, i, j;
  var pts=[], tt=[];
  for (i=0;i<8;i++){
    var a=(i*45-90)*Math.PI/180;
    pts.push([cx+r*Math.cos(a), cy+r*Math.sin(a)]);
    tt.push([cx+tr*Math.cos(a), cy+tr*Math.sin(a)]);
  }
  var s = sh(50,92,26,2.6,.2);
  for (i=0;i<8;i++){
    j=(i+1)%8;
    s += '<polygon points="'+cx+','+cy+' '+pts[i][0].toFixed(2)+','+pts[i][1].toFixed(2)+' '+pts[j][0].toFixed(2)+','+pts[j][1].toFixed(2)+'" fill="'+c.shades[i]+'" stroke="'+c.edge+'" stroke-width=".4" stroke-linejoin="round"/>';
  }
  s += poly(tt, c.table, null, 0);
  s += poly(tt, null, c.edge, .5);
  s += hl(cx-8, cy-8, 9, 5.5, .5);
  s += hl(cx-10, cy-11, 4, 2.2, .85);
  s += poly(pts, null, c.rim, 1.3);
  s += poly(pts, null, c.edge, .5);
  s += '<polyline points="'+pts[6][0].toFixed(2)+','+pts[6][1].toFixed(2)+' '+pts[7][0].toFixed(2)+','+pts[7][1].toFixed(2)+'" fill="none" stroke="#fff" stroke-width="1.4" opacity=".9" stroke-linecap="round"/>';
  s += '<polyline points="'+pts[7][0].toFixed(2)+','+pts[7][1].toFixed(2)+' '+pts[0][0].toFixed(2)+','+pts[0][1].toFixed(2)+'" fill="none" stroke="#fff" stroke-width="1" opacity=".6" stroke-linecap="round"/>';
  s += star(cx+18, cy-14, 3.5);
  return s;
}

var GEMS = {
  gemRed:    {table:'#FFD0D8', shades:['#FFA0B0','#F05070','#D02040','#A80828','#7A0018','#A80828','#D02040','#F05070'], edge:'#3A0008', rim:'#FF8898'},
  gemPurple: {table:'#E8D0FF', shades:['#D8B8FF','#B078F0','#9050E0','#7030B8','#4A1080','#7030B8','#9050E0','#B078F0'], edge:'#1A0A3D', rim:'#B890FF'},
  gemBlue:   {table:'#C8E8FF', shades:['#A0D8FF','#60B0F8','#3090E8','#1060C0','#083888','#1060C0','#3090E8','#60B0F8'], edge:'#031843', rim:'#80C0FF'},
  gemGreen:  {table:'#C8F8D0', shades:['#A8F0B0','#70D880','#40B050','#208030','#0A5018','#208030','#40B050','#70D880'], edge:'#052008', rim:'#90F0A0'},
  gemYellow: {table:'#FFF0B0', shades:['#FFE878','#FFD040','#F0B020','#C08810','#885A00','#C08810','#F0B020','#FFD040'], edge:'#3D2900', rim:'#FFE090'}
};

var R = {
  zeus:{t:'premier',f:zeus}, crown:{t:'high',f:crown}, chalice:{t:'high',f:chalice},
  ring:{t:'high',f:ring}, hourglass:{t:'high',f:hourglass},
  gemRed:{t:'common',f:function(){return makeGem(GEMS.gemRed);}},
  gemPurple:{t:'common',f:function(){return makeGem(GEMS.gemPurple);}},
  gemBlue:{t:'common',f:function(){return makeGem(GEMS.gemBlue);}},
  gemGreen:{t:'common',f:function(){return makeGem(GEMS.gemGreen);}},
  gemYellow:{t:'common',f:function(){return makeGem(GEMS.gemYellow);}}
};

window.ApexOlympusSymbols = {
  ensureDefs: ensureDefs,
  render: function(id){ var e = R[id]; return e ? wrap(e.f(), e.t) : ''; }
};
})();
