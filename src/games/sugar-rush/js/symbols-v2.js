(function(){
'use strict';
var _u = 0;
function nid(p){ _u += 1; return p + _u.toString(36); }
function lg(id,x1,y1,x2,y2,st){
  var s = '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">';
  for (var i=0;i<st.length;i++){ var t=st[i]; s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }
  return s + '</linearGradient>';
}
function rg(id,cx,cy,r,st){
  var s = '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">';
  for (var i=0;i<st.length;i++){ var t=st[i]; s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }
  return s + '</radialGradient>';
}
function gloss(cx,cy,rx,ry,rot,op){
  var t = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '';
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#FFFFFF" opacity="' + op + '"' + t + '/>';
}
function shadow(cx,cy,rx,ry,op){
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity="' + op + '"/>';
}
function wrap(d,b){ return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>' + d + '</defs>' + b + '</svg>'; }
var S = {};
var A = {};
// BLUE_CANDY
S.blue_candy = function(u){
  var id1='bc-o-'+u, id2='bc-b-'+u, id3='bc-h-'+u, id4='bc-r-'+u, id5='bc-bot-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#EAF5FF','0'],['72%','#7EB8FF','0.4'],['90%','#3E80D8','0.85'],['100%','#183F84','1']]);
  d += rg(id2,'32%','26%','78%',[['0%','#FFFFFF'],['8%','#DCEBFF'],['22%','#79B4FF'],['50%','#2E70D8'],['78%','#164F9E'],['100%','#062A63']]);
  d += rg(id3,'34%','28%','62%',[['0%','#FFFFFF','0.98'],['20%','#FFFFFF','0.72'],['52%','#FFFFFF','0.18'],['100%','#FFFFFF','0']]);
  d += rg(id4,'74%','74%','32%',[['0%','#C7E0FF','0.55'],['55%','#FFFFFF','0'],['100%','#FFFFFF','0']]);
  d += lg(id5,'0','0','0','1',[['0%','#FFFFFF','0'],['70%','#FFFFFF','0'],['100%','#041D45','0.4']]);
  var b = shadow(50,86,26,5,0.42);
  b += '<circle cx="50" cy="50" r="32" fill="url(#'+id1+')"/>';
  b += '<circle cx="50" cy="48" r="30" fill="url(#'+id2+')"/>';
  b += '<ellipse cx="50" cy="68" rx="22" ry="11" fill="url(#'+id5+')"/>';
  b += '<ellipse cx="38" cy="32" rx="17" ry="13" fill="url(#'+id3+')"/>';
  b += gloss(32,26,7,4.5,-32,0.95);
  b += gloss(30,24,3,2,-32,1);
  b += gloss(66,64,4,2.6,-20,0.65);
  b += '<circle cx="68" cy="58" r="1.6" fill="#FFFFFF" opacity="0.9"/>';
  b += '<ellipse cx="50" cy="76" rx="14" ry="3" fill="url(#'+id4+')"/>';
  return wrap(d, b);
};


// GREEN_CANDY
S.green_candy = function(u){
  var id1='gc-b-'+u, id2='gc-t-'+u, id3='gc-s-'+u, id4='gc-e-'+u, id5='gc-h-'+u;
  var d = lg(id1,'0','0','1','1',[['0%','#E4FFC8'],['16%','#A5EA6E'],['46%','#4EBE3E'],['76%','#1F7A1E'],['100%','#0A3D0E']]);
  d += lg(id2,'0','0','1','0',[['0%','#FFFFFF','0.78'],['38%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(id3,'0','0','0','1',[['0%','#0A3D0E','0'],['74%','#0A3D0E','0'],['100%','#031A08','0.5']]);
  d += lg(id4,'0','0','0','1',[['0%','#FFFFFF','0'],['38%','#FFFFFF','0.05'],['80%','#FFFFFF','0'],['100%','#031A08','0.4']]);
  d += rg(id5,'36%','30%','52%',[['0%','#FFFFFF','0.9'],['40%','#FFFFFF','0.3'],['100%','#FFFFFF','0']]);
  var b = shadow(50,88,25,5,0.42);
  b += '<polygon points="50,16 82,34 82,66 50,84 18,66 18,34" fill="url(#'+id1+')" stroke="#0A3D0E" stroke-width="1.5"/>';
  b += '<polygon points="50,16 82,34 82,66 50,84 18,66 18,34" fill="url(#'+id3+')"/>';
  b += '<polygon points="50,16 82,34 50,44 18,34" fill="url(#'+id2+')"/>';
  b += '<polygon points="50,22 76,37 76,63 50,78 24,63 24,37" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="1.4"/>';
  b += '<polygon points="50,16 82,34 82,66 50,84 18,66 18,34" fill="url(#'+id4+')"/>';
  b += '<ellipse cx="38" cy="30" rx="8" ry="5" fill="url(#'+id5+')" transform="rotate(-28 38 30)"/>';
  b += gloss(35,28,3.5,2.4,-30,0.95);
  return wrap(d, b);
};


// PURPLE_CANDY
S.purple_candy = function(u){
  var id1='pc-b-'+u, id2='pc-h-'+u, id3='pc-s-'+u, id4='pc-r-'+u, id5='pc-e-'+u;
  var d = rg(id1,'32%','26%','80%',[['0%','#FAF3FF'],['9%','#D9B8FB'],['28%','#A96DF2'],['56%','#7A3CC8'],['82%','#4E1A8F'],['100%','#230A52']]);
  d += lg(id2,'0','0','1','1',[['0%','#FFFFFF','0.7'],['28%','#FFFFFF','0.2'],['66%','#FFFFFF','0'],['100%','#FFFFFF','0']]);
  d += lg(id3,'0','0','0','1',[['0%','#FFFFFF','0'],['72%','#FFFFFF','0'],['100%','#2B0A56','0.42']]);
  d += rg(id4,'72%','74%','36%',[['0%','#D6B6FF','0.5'],['68%','#FFFFFF','0'],['100%','#FFFFFF','0']]);
  d += rg(id5,'34%','30%','60%',[['0%','#FFFFFF','0.82'],['44%','#FFFFFF','0.2'],['100%','#FFFFFF','0']]);
  var b = shadow(50,88,25,5,0.4);
  b += '<rect x="22" y="22" width="56" height="56" rx="12" fill="url(#'+id1+')" transform="rotate(8 50 50)"/>';
  b += '<rect x="22" y="22" width="56" height="56" rx="12" fill="url(#'+id3+')" transform="rotate(8 50 50)"/>';
  b += '<rect x="27" y="27" width="46" height="46" rx="9" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.3" transform="rotate(8 50 50)"/>';
  b += '<rect x="22" y="22" width="56" height="56" rx="12" fill="url(#'+id2+')" transform="rotate(8 50 50)"/>';
  b += '<rect x="26" y="26" width="48" height="48" rx="10" fill="url(#'+id4+')" transform="rotate(8 50 50)"/>';
  b += '<ellipse cx="38" cy="36" rx="11" ry="7" fill="url(#'+id5+')" transform="rotate(-28 38 36)"/>';
  b += gloss(33,31,4,3,-28,0.95);
  b += '<circle cx="66" cy="62" r="1.4" fill="#FFFFFF" opacity="0.85"/>';
  return wrap(d, b);
};


// RED_CANDY
S.red_candy = function(u){
  var id1='rc-o-'+u, id2='rc-b-'+u, id3='rc-h-'+u, id4='rc-s-'+u, id5='rc-r-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#FFE5EA','0'],['74%','#FF7A90','0.4'],['92%','#C11A3C','0.88'],['100%','#5C0820','1']]);
  d += rg(id2,'32%','26%','80%',[['0%','#FFFFFF'],['8%','#FFDCE3'],['22%','#FF8095'],['54%','#E11D48'],['82%','#8B0F2E'],['100%','#3A0614']]);
  d += rg(id3,'34%','28%','64%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.7'],['55%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(id4,'0','0','0','1',[['0%','#FFFFFF','0'],['70%','#FFFFFF','0'],['100%','#3A0614','0.45']]);
  d += rg(id5,'74%','74%','34%',[['0%','#FFC7D2','0.55'],['60%','#FFFFFF','0'],['100%','#FFFFFF','0']]);
  var b = shadow(50,86,26,5,0.44);
  b += '<circle cx="50" cy="50" r="32" fill="url(#'+id1+')"/>';
  b += '<circle cx="50" cy="48" r="30" fill="url(#'+id2+')"/>';
  b += '<ellipse cx="50" cy="68" rx="22" ry="11" fill="url(#'+id4+')"/>';
  b += '<circle cx="50" cy="48" r="21" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.3"/>';
  b += '<ellipse cx="38" cy="32" rx="17" ry="13" fill="url(#'+id3+')"/>';
  b += gloss(32,26,7,4.5,-32,0.95);
  b += gloss(30,24,3,2,-32,1);
  b += gloss(64,62,4,2.6,-22,0.6);
  b += '<ellipse cx="50" cy="76" rx="14" ry="3" fill="url(#'+id5+')"/>';
  return wrap(d, b);
};


// STRAWBERRY
S.strawberry = function(u){
  var id1='st-b-'+u, id2='st-h-'+u, id3='st-s-'+u, id4='st-l-'+u, id5='st-seed-'+u;
  var d = rg(id1,'36%','28%','84%',[['0%','#FFF0F3'],['9%','#FFB4C0'],['26%','#FF5A76'],['58%','#E11D48'],['84%','#8B0F2E'],['100%','#3A0614']]);
  d += rg(id2,'34%','30%','58%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.68'],['52%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(id3,'0','0','0','1',[['0%','#FFFFFF','0'],['74%','#FFFFFF','0'],['100%','#3A0614','0.42']]);
  d += rg(id4,'0%','0%','100%',[['0%','#86EFAC'],['60%','#22C55E'],['100%','#166534']]);
  d += rg(id5,'30%','30%','80%',[['0%','#FFFCE8'],['70%','#FFE9A8'],['100%','#C9963E']]);
  var b = shadow(50,86,24,5,0.44);
  b += '<path d="M50 22 C30 22 22 36 26 52 C28 68 42 82 50 88 C58 82 72 68 74 52 C78 36 70 22 50 22 Z" fill="url(#'+id1+')" stroke="#6B0A23" stroke-width="1.4"/>';
  b += '<path d="M50 22 C30 22 22 36 26 52 C28 68 42 82 50 88 C58 82 72 68 74 52 C78 36 70 22 50 22 Z" fill="url(#'+id3+')"/>';
  b += '<ellipse cx="42" cy="38" rx="14" ry="11" fill="url(#'+id2+')" transform="rotate(-30 42 38)"/>';
  var seeds = [[42,44],[58,44],[50,52],[38,58],[62,58],[50,66],[44,74],[56,74]];
  for (var i=0;i<seeds.length;i++){
    var sx=seeds[i][0], sy=seeds[i][1];
    b += '<ellipse cx="'+sx+'" cy="'+sy+'" rx="1.3" ry="2.1" fill="url(#'+id5+')"/>';
  }
  b += '<path d="M50 22 Q40 11 30 14 Q40 24 47 25 Z" fill="url(#'+id4+')" stroke="#14532D" stroke-width="0.8"/>';
  b += '<path d="M50 22 Q60 11 70 14 Q60 24 53 25 Z" fill="url(#'+id4+')" stroke="#14532D" stroke-width="0.8"/>';
  b += gloss(38,34,6,4,-30,0.85);
  b += gloss(35,31,2.6,1.8,-30,0.95);
  return wrap(d, b);
};


// ORANGE
S.orange = function(u){
  var id1='og-o-'+u, id2='og-b-'+u, id3='og-h-'+u, id4='og-s-'+u, id5='og-l-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#FFE9C0','0'],['74%','#FFB347','0.35'],['92%','#D97706','0.85'],['100%','#7C2D12','1']]);
  d += rg(id2,'34%','26%','84%',[['0%','#FFF8E4'],['8%','#FFE7A8'],['22%','#FFB347'],['54%','#F97316'],['82%','#9A3412'],['100%','#3A1408']]);
  d += rg(id3,'36%','28%','60%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.7'],['54%','#FFFFFF','0.18'],['100%','#FFFFFF','0']]);
  d += lg(id4,'0','0','0','1',[['0%','#FFFFFF','0'],['72%','#FFFFFF','0'],['100%','#3A1408','0.42']]);
  d += rg(id5,'0%','0%','100%',[['0%','#86EFAC'],['60%','#22C55E'],['100%','#166534']]);
  var b = shadow(50,86,26,5,0.42);
  b += '<circle cx="50" cy="52" r="30" fill="url(#'+id1+')"/>';
  b += '<circle cx="50" cy="50" r="28" fill="url(#'+id2+')"/>';
  b += '<ellipse cx="50" cy="70" rx="20" ry="10" fill="url(#'+id4+')"/>';
  var dots = [[40,48],[60,46],[50,58],[38,64],[62,62],[44,72],[56,72]];
  for (var i=0;i<dots.length;i++){
    b += '<circle cx="'+dots[i][0]+'" cy="'+dots[i][1]+'" r="0.85" fill="#7C2D12" opacity="0.6"/>';
  }
  b += '<ellipse cx="38" cy="36" rx="15" ry="11" fill="url(#'+id3+')"/>';
  b += '<path d="M50 22 Q62 12 70 22 Q60 30 50 26 Z" fill="url(#'+id5+')" stroke="#14532D" stroke-width="0.9"/>';
  b += '<path d="M50 22 Q52 14 56 10" stroke="#78350F" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  b += gloss(33,30,6,4,-28,0.9);
  b += gloss(31,28,2.4,1.7,-28,1);
  return wrap(d, b);
};


// CHERRY
S.cherry = function(u){
  var id1='ch-o-'+u, id2='ch-b-'+u, id3='ch-h-'+u, id4='ch-s-'+u, id5='ch-st-'+u, id6='ch-l-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#FFE5EA','0'],['74%','#FF5A76','0.4'],['92%','#B10E33','0.88'],['100%','#4A0518','1']]);
  d += rg(id2,'32%','26%','80%',[['0%','#FFFFFF'],['8%','#FFDCE3'],['22%','#FF8095'],['54%','#DC2626'],['82%','#8B0F2E'],['100%','#3A0614']]);
  d += rg(id3,'34%','28%','64%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.7'],['55%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(id4,'0','0','0','1',[['0%','#FFFFFF','0'],['70%','#FFFFFF','0'],['100%','#3A0614','0.45']]);
  d += lg(id5,'0','0','0','1',[['0%','#4D7C0F'],['60%','#3F6212'],['100%','#1A2E05']]);
  d += rg(id6,'0%','0%','100%',[['0%','#86EFAC'],['60%','#22C55E'],['100%','#166534']]);
  var b = shadow(50,88,23,5,0.42);
  b += '<path d="M38 44 Q42 26 54 20" fill="none" stroke="url(#'+id5+')" stroke-width="2.6" stroke-linecap="round"/>';
  b += '<path d="M62 44 Q58 26 54 20" fill="none" stroke="url(#'+id5+')" stroke-width="2.6" stroke-linecap="round"/>';
  b += '<path d="M54 20 Q64 12 74 18 Q64 28 54 24 Z" fill="url(#'+id6+')" stroke="#14532D" stroke-width="0.9"/>';
  b += '<circle cx="37" cy="64" r="17" fill="url(#'+id1+')"/>';
  b += '<circle cx="63" cy="64" r="17" fill="url(#'+id1+')"/>';
  b += '<circle cx="37" cy="62" r="16" fill="url(#'+id2+')"/>';
  b += '<circle cx="63" cy="62" r="16" fill="url(#'+id2+')"/>';
  b += '<ellipse cx="37" cy="72" rx="11" ry="5" fill="url(#'+id4+')"/>';
  b += '<ellipse cx="63" cy="72" rx="11" ry="5" fill="url(#'+id4+')"/>';
  b += '<ellipse cx="31" cy="56" rx="8" ry="6" fill="url(#'+id3+')" transform="rotate(-28 31 56)"/>';
  b += '<ellipse cx="57" cy="56" rx="8" ry="6" fill="url(#'+id3+')" transform="rotate(-28 57 56)"/>';
  b += gloss(27,52,3.5,2.4,-28,0.95);
  b += gloss(53,52,3.5,2.4,-28,0.95);
  b += gloss(25,50,1.6,1.1,-28,1);
  b += gloss(51,50,1.6,1.1,-28,1);
  return wrap(d, b);
};


// GRAPE
S.grape = function(u){
  var id1='gr-o-'+u, id2='gr-b-'+u, id3='gr-h-'+u, id4='gr-i-'+u, id5='gr-st-'+u, id6='gr-l-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#F3E5FF','0'],['74%','#8B46E0','0.4'],['92%','#4A1490','0.85'],['100%','#1E0642','1']]);
  d += rg(id2,'32%','24%','80%',[['0%','#FAF3FF'],['9%','#C9A0FF'],['26%','#8B46E0'],['56%','#5B1FA5'],['82%','#3A0F73'],['100%','#1E0642']]);
  d += rg(id3,'34%','28%','60%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.68'],['54%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += rg(id4,'38%','32%','58%',[['0%','#FFFFFF','0.55'],['60%','#FFFFFF','0']]);
  d += lg(id5,'0','0','0','1',[['0%','#4D7C0F'],['60%','#3F6212'],['100%','#1A2E05']]);
  d += rg(id6,'0%','0%','100%',[['0%','#86EFAC'],['60%','#22C55E'],['100%','#166534']]);
  var b = shadow(50,90,24,4.5,0.42);
  b += '<path d="M50 18 Q54 8 62 4" stroke="url(#'+id5+')" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  b += '<path d="M50 16 Q62 10 70 18 Q60 28 50 22 Z" fill="url(#'+id6+')" stroke="#14532D" stroke-width="0.9"/>';
  b += '<path d="M50 16 Q38 10 30 18 Q40 28 50 22 Z" fill="url(#'+id6+')" stroke="#14532D" stroke-width="0.9"/>';
  var grapePos = [[34,38,11.5],[50,34,12],[66,38,11.5],[42,54,11.5],[58,54,11.5],[34,70,10.5],[50,76,10.5],[66,70,10.5]];
  for (var i=0;i<grapePos.length;i++){
    var g=grapePos[i];
    b += '<circle cx="'+g[0]+'" cy="'+g[1]+'" r="'+(g[2]+0.5)+'" fill="url(#'+id1+')"/>';
  }
  for (var j=0;j<grapePos.length;j++){
    var g2=grapePos[j];
    b += '<circle cx="'+g2[0]+'" cy="'+g2[1]+'" r="'+g2[2]+'" fill="url(#'+id2+')"/>';
  }
  for (var k=0;k<grapePos.length;k++){
    var g3=grapePos[k];
    b += '<circle cx="'+g3[0]+'" cy="'+g3[1]+'" r="'+g3[2]+'" fill="url(#'+id4+')"/>';
  }
  var hi = [[30,33,3.5,2.8],[46,29,3.5,2.8],[62,33,3.5,2.8],[38,50,3.5,2.8],[54,50,3.5,2.8],[30,65,3,2.4],[46,71,3,2.4],[62,65,3,2.4]];
  for (var m=0;m<hi.length;m++){
    var h=hi[m];
    b += gloss(h[0],h[1],h[2],h[3],-25,0.92);
  }
  b += gloss(42,25,2.6,1.8,-25,1);
  b += gloss(58,25,2.6,1.8,-25,1);
  return wrap(d, b);
};


// MANGO
S.mango = function(u){
  var id1='mg-o-'+u, id2='mg-b-'+u, id3='mg-h-'+u, id4='mg-s-'+u, id5='mg-l-'+u, id6='mg-st-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#FFF6CC','0'],['74%','#FFD166','0.35'],['92%','#D97706','0.85'],['100%','#5C2A03','1']]);
  d += rg(id2,'36%','26%','84%',[['0%','#FFFCE8'],['8%','#FFE7A8'],['22%','#FFC947'],['52%','#F59E0B'],['82%','#B45309'],['100%','#451A03']]);
  d += rg(id3,'38%','28%','62%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.72'],['52%','#FFFFFF','0.18'],['100%','#FFFFFF','0']]);
  d += lg(id4,'0','0','0','1',[['0%','#FFFFFF','0'],['72%','#FFFFFF','0'],['100%','#451A03','0.42']]);
  d += rg(id5,'0%','0%','100%',[['0%','#86EFAC'],['60%','#22C55E'],['100%','#166534']]);
  d += lg(id6,'0','0','0','1',[['0%','#A16207'],['60%','#78350F'],['100%','#3F1E04']]);
  var b = shadow(50,88,27,5,0.42);
  b += '<ellipse cx="50" cy="54" rx="27" ry="31" fill="url(#'+id1+')" transform="rotate(-10 50 54)"/>';
  b += '<ellipse cx="50" cy="52" rx="25" ry="29" fill="url(#'+id2+')" transform="rotate(-10 50 54)"/>';
  b += '<ellipse cx="50" cy="70" rx="18" ry="9" fill="url(#'+id4+')" transform="rotate(-10 50 54)"/>';
  b += '<path d="M30 46 Q50 44 70 62" fill="none" stroke="rgba(80,30,0,0.26)" stroke-width="1.3"/>';
  b += '<path d="M52 24 Q51 14 47 8" stroke="url(#'+id6+')" stroke-width="3" fill="none" stroke-linecap="round"/>';
  b += '<path d="M48 14 Q60 4 72 10 Q62 24 50 20 Z" fill="url(#'+id5+')" stroke="#14532D" stroke-width="0.9"/>';
  b += '<ellipse cx="40" cy="36" rx="13" ry="9" fill="url(#'+id3+')" transform="rotate(-28 40 36)"/>';
  b += gloss(34,30,5,3.4,-28,0.92);
  b += gloss(32,28,2.2,1.5,-28,1);
  return wrap(d, b);
};


// LOLLIPOP (scatter)
S.lollipop = function(u){
  var c='lp-c-'+u, cs='lp-cs-'+u, ch='lp-h-'+u, st='lp-st-'+u, sst='lp-sst-'+u, gl='lp-gl-'+u;
  var d = rg(c,'30%','22%','82%',[['0%','#FFF3FA'],['14%','#FFC2E0'],['38%','#FF7AB8'],['68%','#ED2584'],['92%','#A20E55'],['100%','#5C052E']]);
  d += rg(cs,'70%','74%','42%',[['0%','#8A0A47','0.55'],['55%','#FFFFFF','0'],['100%','#FFFFFF','0']]);
  d += rg(ch,'34%','26%','58%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.68'],['54%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(st,'0','0','1','0',[['0%','#9E9E9E'],['35%','#FFFFFF'],['62%','#DCDCDC'],['100%','#8A8A8A']]);
  d += lg(sst,'0','0','1','0',[['0%','#FFFFFF','0.9'],['50%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += rg(gl,'50%','42%','58%',[['0%','#FFFFFF','0'],['78%','#FFB5DA','0.3'],['100%','#FF5AAC','0']]);
  var b = shadow(50,90,16,4,0.35);
  b += '<circle cx="50" cy="38" r="34" fill="url(#'+gl+')"/>';
  b += '<path d="M50 52 L50 90" stroke="#000" stroke-width="7" opacity="0.14" stroke-linecap="round"/>';
  b += '<path d="M49 52 L49 90" stroke="url(#'+st+')" stroke-width="4.5" stroke-linecap="round"/>';
  b += '<path d="M47.5 53 L47.5 89" stroke="url(#'+sst+')" stroke-width="1.4" stroke-linecap="round"/>';
  b += '<circle cx="50" cy="38" r="26" fill="url(#'+c+')"/>';
  b += '<circle cx="50" cy="38" r="26" fill="url(#'+cs+')"/>';
  b += '<circle cx="50" cy="38" r="20" fill="none" stroke="#FFD0E7" stroke-width="2" opacity="0.55"/>';
  b += '<path d="M38 30 C46 24 58 26 63 33 C68 41 62 50 54 52 C46 54 36 50 34 42 C32 34 40 27 48 26 C58 24 66 30 68 40" fill="none" stroke="#FFE5F2" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>';
  b += '<path d="M46 32 C51 29 56 31 58 35 C61 40 57 45 52 46 C47 47 43 44 43 40 C42 36 45 33 49 32" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>';
  b += '<ellipse cx="38" cy="26" rx="9" ry="6" fill="url(#'+ch+')" transform="rotate(-28 38 26)"/>';
  b += gloss(32,22,4.5,3,-28,0.95);
  b += gloss(30,20,2,1.4,-28,1);
  b += '<circle cx="68" cy="52" r="1.8" fill="#FFFFFF" opacity="0.7"/>';
  return wrap(d, b);
};


// MULTIPLIER_BOMB
S.multiplier_bomb = function(u){
  var id1='mb-o-'+u, id2='mb-b-'+u, id3='mb-h-'+u, id4='mb-gl-'+u, id5='mb-gr-'+u, id6='mb-fl-'+u;
  var d = rg(id1,'50%','50%','50%',[['0%','#FFF6CC','0'],['74%','#FCD34D','0.35'],['92%','#D97706','0.85'],['100%','#5C2A03','1']]);
  d += rg(id2,'34%','26%','82%',[['0%','#FFFCE8'],['8%','#FFE7A8'],['22%','#FCD34D'],['54%','#F59E0B'],['82%','#B45309'],['100%','#451A03']]);
  d += rg(id3,'34%','26%','62%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.72'],['54%','#FFFFFF','0.18'],['100%','#FFFFFF','0']]);
  d += rg(id4,'50%','50%','50%',[['0%','#FDE047','0'],['58%','#FDE047','0.42'],['82%','#FDE047','0.28'],['100%','#FDE047','0']]);
  d += lg(id5,'0','0','0','1',[['0%','#FFFFFF','0'],['72%','#FFFFFF','0'],['100%','#451A03','0.42']]);
  d += rg(id6,'50%','50%','30%',[['0%','#FFFBEA','0.9'],['50%','#FDE047','0.4'],['100%','#FDE047','0']]);
  var b = shadow(50,86,27,5,0.42);
  b += '<circle cx="50" cy="48" r="42" fill="url(#'+id4+')"/>';
  b += '<circle cx="50" cy="48" r="30" fill="url(#'+id1+')"/>';
  b += '<circle cx="50" cy="48" r="28" fill="url(#'+id2+')"/>';
  b += '<ellipse cx="50" cy="70" rx="20" ry="9" fill="url(#'+id5+')"/>';
  b += '<circle cx="50" cy="48" r="28" fill="url(#'+id6+')"/>';
  b += '<path d="M50 22 L56 39 L74 39 L59 49 L65 66 L50 56 L35 66 L41 49 L26 39 L44 39 Z" fill="#FFF9B0" opacity="0.52"/>';
  b += '<circle cx="50" cy="48" r="28" fill="none" stroke="#B66A00" stroke-width="1.8"/>';
  b += '<text x="50" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="900" fill="#8A4600" style="paint-order:stroke;stroke:#FFF4A2;stroke-width:1.2">x</text>';
  b += '<ellipse cx="38" cy="32" rx="11" ry="7" fill="url(#'+id3+')" transform="rotate(-28 38 32)"/>';
  b += gloss(33,28,4.5,3,-28,0.95);
  b += gloss(31,26,2,1.4,-28,1);
  return wrap(d, b);
};


// aliases
A['sb-candy-blue'] = 'blue_candy';
A['sb-candy-green'] = 'green_candy';
A['sb-candy-purple'] = 'purple_candy';
A['sb-candy-red'] = 'red_candy';
A['sb-fruit-strawberry'] = 'strawberry';
A['sb-fruit-orange'] = 'orange';
A['sb-fruit-cherry'] = 'cherry';
A['sb-fruit-grape'] = 'grape';
A['sb-fruit-mango'] = 'mango';
A['sb-scatter-lollipop'] = 'lollipop';
A['sb-multiplier-bomb'] = 'candy_bomb';

function rs(id){ if (S[id]) return id; if (A[id]) return A[id]; return null; }
function get(id){
  var k = rs(id);
  if (!k) return '';
  var u = nid('s');
  return S[k](u);
}
function has(id){ return rs(id) !== null; }
function list(){ return Object.keys(S); }

window.ApexSugarRushSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  SVGS: Object.freeze(S),
  ALIASES: Object.freeze(A)
});
})();
