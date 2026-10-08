(function(){
'use strict';
var H='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u=0;function nid(p){_u+=1;return p+_u.toString(36);}
function lg(id,x1,y1,x2,y2,st){var s='<linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">';for(var i=0;i<st.length;i++){var t=st[i];s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}return s+'</linearGradient>';}
function rg(id,cx,cy,r,st){var s='<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'">';for(var i=0;i<st.length;i++){var t=st[i];s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}return s+'</radialGradient>';}
/* 双层阴影：近 + 远 */
function shd2(id){return '<filter id="'+id+'" x="-40%" y="-40%" width="180%" height="180%">'
  +'<feDropShadow dx="0" dy="1.2" stdDeviation="0.8" flood-color="#000" flood-opacity="0.45"/>'
  +'<feDropShadow dx="0" dy="3.5" stdDeviation="2.2" flood-color="#000" flood-opacity="0.28"/></filter>';}
function svg(d,b){return '<svg '+H+'><defs>'+d+'</defs>'+b+'</svg>';}

/* ==================== 5 水果 ==================== */
var BANANA = svg(
  lg('ba-b','0.1','0','0.7','1',[['0%','#FFF8A0'],['22%','#FFDC48'],['55%','#F5A800'],['85%','#B86800'],['100%','#704000']])
  +rg('ba-h','26%','22%','45%',[['0%','#FFF','0.95'],['100%','#FFF','0']])
  +shd2('ba-s'),
  '<path d="M14,36 Q20,20 38,18 Q64,20 80,42 Q92,60 82,74 Q74,82 62,74 Q50,58 32,50 Q18,44 14,36 Z" fill="url(#ba-b)" stroke="#3A1E00" stroke-width="2.2" filter="url(#ba-s)"/>'
  +'<path d="M26,32 Q38,25 54,32" stroke="#FFF" stroke-width="3.2" fill="none" opacity="0.8" stroke-linecap="round"/>'
  +'<path d="M30,44 Q44,40 58,46" stroke="#FFF" stroke-width="1.8" fill="none" opacity="0.45" stroke-linecap="round"/>'
  +'<path d="M18,58 Q28,54 38,58" stroke="#FFF" stroke-width="1.4" fill="none" opacity="0.25" stroke-linecap="round"/>'
  +'<ellipse cx="15" cy="35" rx="3.5" ry="2.8" fill="#2A1400"/><ellipse cx="81" cy="73" rx="3.5" ry="2.8" fill="#2A1400"/>'
  +'<ellipse cx="14" cy="33" rx="1.6" ry="1" fill="#6A4420" opacity="0.7"/><ellipse cx="80" cy="71" rx="1.6" ry="1" fill="#6A4420" opacity="0.7"/>');

var GRAPE = svg(
  rg('gr-b1','32%','28%','75%',[['0%','#B088E8'],['48%','#7A36C0'],['100%','#2A0844']])
  +rg('gr-b2','32%','28%','75%',[['0%','#A070D8'],['48%','#6A2AB0'],['100%','#1E0638']])
  +rg('gr-b3','32%','28%','75%',[['0%','#C098F0'],['48%','#8A4AD0'],['100%','#3A1060']])
  +lg('gr-l','0','0','0','1',[['0%','#88E058'],['100%','#2A7018']])
  +shd2('gr-s'),
  '<path d="M50,12 Q52,22 50,30" stroke="#5C3A1E" stroke-width="2.8" fill="none" stroke-linecap="round"/>'
  +'<path d="M50,16 Q66,8 82,14 Q74,28 52,26 Z" fill="url(#gr-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<path d="M48,16 Q32,8 18,14 Q26,28 48,26 Z" fill="url(#gr-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<path d="M50,22 L50,30" stroke="#1A5410" stroke-width="1" opacity="0.5"/>'
  +'<g filter="url(#gr-s)" stroke="#1A0430" stroke-width="1.2">'
  +'<circle cx="28" cy="32" r="10" fill="url(#gr-b2)"/><circle cx="50" cy="30" r="11" fill="url(#gr-b1)"/><circle cx="72" cy="32" r="10" fill="url(#gr-b2)"/>'
  +'<circle cx="22" cy="49" r="9.5" fill="url(#gr-b2)"/><circle cx="41" cy="48" r="11" fill="url(#gr-b3)"/><circle cx="60" cy="48" r="11" fill="url(#gr-b1)"/><circle cx="78" cy="50" r="9.5" fill="url(#gr-b2)"/>'
  +'<circle cx="30" cy="65" r="10" fill="url(#gr-b3)"/><circle cx="50" cy="64" r="10.5" fill="url(#gr-b2)"/><circle cx="70" cy="66" r="10" fill="url(#gr-b1)"/>'
  +'<circle cx="40" cy="80" r="9" fill="url(#gr-b1)"/><circle cx="60" cy="80" r="9" fill="url(#gr-b2)"/>'
  +'</g>'
  +'<ellipse cx="26" cy="28" rx="3.2" ry="1.8" fill="#FFF" opacity="0.7"/>'
  +'<ellipse cx="47" cy="26" rx="3.5" ry="2" fill="#FFF" opacity="0.75"/>'
  +'<ellipse cx="38" cy="44" rx="3.5" ry="2" fill="#FFF" opacity="0.65"/>'
  +'<ellipse cx="57" cy="44" rx="3" ry="1.8" fill="#FFF" opacity="0.55"/>'
  +'<ellipse cx="27" cy="62" rx="3" ry="1.8" fill="#FFF" opacity="0.5"/>');

var WATERMELON = svg(
  rg('wm-b','32%','28%','82%',[['0%','#B0F090'],['30%','#5AB838'],['65%','#2A7020'],['100%','#0E3A08']])
  +rg('wm-h','26%','22%','38%',[['0%','#FFF','0.9'],['100%','#FFF','0']])
  +rg('wm-dk','50%','110%','60%',[['0%','#000','0.3'],['100%','#000','0']])
  +shd2('wm-s'),
  '<ellipse cx="50" cy="54" rx="35" ry="33" fill="url(#wm-b)" stroke="#0A3808" stroke-width="2.2" filter="url(#wm-s)"/>'
  +'<path d="M28,30 Q40,24 52,32 Q60,38 72,30" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.55" stroke-linecap="round"/>'
  +'<path d="M22,46 Q36,40 48,48 Q58,54 74,46" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.55" stroke-linecap="round"/>'
  +'<path d="M26,64 Q40,58 52,66 Q62,72 74,64" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.55" stroke-linecap="round"/>'
  +'<ellipse cx="50" cy="78" rx="32" ry="10" fill="url(#wm-dk)"/>'
  +'<ellipse cx="32" cy="32" rx="14" ry="8" fill="url(#wm-h)" transform="rotate(-25 32 32)"/>'
  +'<ellipse cx="60" cy="30" rx="6" ry="3" fill="#FFF" opacity="0.35" transform="rotate(-20 60 30)"/>');

var PLUM = svg(
  rg('pl-b','35%','30%','78%',[['0%','#F0A0E8'],['40%','#B040A8'],['78%','#701070'],['100%','#3A0830']])
  +rg('pl-h','28%','24%','42%',[['0%','#FFF','0.9'],['100%','#FFF','0']])
  +rg('pl-dk','50%','110%','60%',[['0%','#000','0.28'],['100%','#000','0']])
  +lg('pl-l','0','0','0','1',[['0%','#88E058'],['100%','#2A7018']])
  +shd2('pl-s'),
  '<circle cx="50" cy="58" r="31" fill="url(#pl-b)" stroke="#3A0830" stroke-width="2.2" filter="url(#pl-s)"/>'
  +'<path d="M50,30 Q49,50 50,86" stroke="#3A0830" stroke-width="2.2" fill="none" opacity="0.6"/>'
  +'<path d="M50,28 Q50,18 48,10" stroke="#5C3A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  +'<path d="M52,22 Q68,12 80,18 Q70,30 52,26 Z" fill="url(#pl-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<ellipse cx="50" cy="80" rx="28" ry="9" fill="url(#pl-dk)"/>'
  +'<ellipse cx="38" cy="44" rx="13" ry="8" fill="url(#pl-h)" transform="rotate(-25 38 44)"/>'
  +'<ellipse cx="62" cy="40" rx="5" ry="2.5" fill="#FFF" opacity="0.35" transform="rotate(-20 62 40)"/>');

var APPLE = svg(
  rg('ap-b','33%','28%','80%',[['0%','#FFA0A0'],['30%','#F03848'],['68%','#B01828'],['100%','#5A0808']])
  +rg('ap-h','26%','22%','38%',[['0%','#FFF','0.95'],['100%','#FFF','0']])
  +rg('ap-dk','50%','110%','60%',[['0%','#000','0.3'],['100%','#000','0']])
  +lg('ap-l','0','0','0','1',[['0%','#88E058'],['100%','#2A7018']])
  +shd2('ap-s'),
  '<path d="M50,30 Q42,16 28,18 Q14,20 12,36 Q10,54 24,68 Q38,82 50,84 Q62,82 76,68 Q90,54 88,36 Q86,20 72,18 Q58,16 50,30 Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="2.4" filter="url(#ap-s)"/>'
  +'<path d="M50,22 Q60,10 76,14 Q68,28 50,26 Z" fill="url(#ap-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<path d="M50,26 Q50,16 48,8" stroke="#5C3A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  +'<ellipse cx="50" cy="82" rx="34" ry="9" fill="url(#ap-dk)"/>'
  +'<ellipse cx="30" cy="36" rx="14" ry="9" fill="url(#ap-h)" transform="rotate(-30 30 36)"/>'
  +'<ellipse cx="36" cy="46" rx="9" ry="5" fill="#FFF" opacity="0.4" transform="rotate(-30 36 46)"/>'
  +'<ellipse cx="62" cy="34" rx="5" ry="2.5" fill="#FFF" opacity="0.35" transform="rotate(-25 62 34)"/>');

/* ==================== 4 糖果（含厚度 + 内高光边） ==================== */
function candy(p,c1,c2,c3,dk,shape){
  var bd;
  if(shape==='heart'){bd='M50,84 C24,64 8,46 8,30 C8,18 22,12 34,20 C42,25 50,38 50,38 C50,38 58,25 66,20 C78,12 92,18 92,30 C92,46 76,64 50,84 Z';}
  else if(shape==='oval'){bd='M28,32 Q50,28 72,32 Q94,32 94,50 Q94,68 72,68 Q50,72 28,68 Q6,68 6,50 Q6,32 28,32 Z';}
  else if(shape==='pent'){bd='M50,10 L86,38 L72,84 L28,84 L14,38 Z';}
  else{bd='M30,14 Q50,14 70,14 Q86,14 86,32 Q86,50 86,68 Q86,86 70,86 Q50,86 30,86 Q14,86 14,68 Q14,50 14,32 Q14,14 30,14 Z';}
  return svg(
    lg(p+'-b','0.15','0','0.8','1',[['0%',c1],['45%',c2],['100%',c3]])
    +rg(p+'-h','26%','22%','40%',[['0%','#FFF','0.95'],['100%','#FFF','0']])
    +rg(p+'-in','50%','50%','75%',[['60%','#000','0'],['100%','#000','0.28']])
    +shd2(p+'-s'),
    '<path d="'+bd+'" fill="'+dk+'" transform="translate(0,4)" opacity="0.95"/>'
    +'<path d="'+bd+'" fill="url(#'+p+'-b)" stroke="'+dk+'" stroke-width="2.4" stroke-linejoin="round" filter="url(#'+p+'-s)"/>'
    +'<path d="'+bd+'" fill="none" stroke="#FFF" stroke-width="1.2" stroke-linejoin="round" opacity="0.35" transform="scale(0.92) translate(4.3,4.3)"/>'
    +'<path d="'+bd+'" fill="url(#'+p+'-in)" opacity="0.65"/>'
    +'<ellipse cx="34" cy="30" rx="14" ry="7" fill="url(#'+p+'-h)"/>'
    +'<path d="M26,34 Q44,28 60,34" stroke="#FFF" stroke-width="2.6" fill="none" opacity="0.6" stroke-linecap="round"/>'
    +'<path d="M30,44 Q46,42 60,46" stroke="#FFF" stroke-width="1.2" fill="none" opacity="0.25" stroke-linecap="round"/>');
}
var BLUE_CANDY = candy('bc','#B8E8FF','#4A9EFF','#0A3A7A','#062A5A','oval');
var GREEN_CANDY = candy('gc','#D0F8B0','#52C430','#0E5418','#083A10','pent');
var PURPLE_CANDY = candy('pc','#F0C0FF','#B040E0','#5A0A6A','#3A0548','square');
var RED_HEART_CANDY = candy('rh','#FFC0C0','#E82838','#8A0A1A','#4A0505','heart');

/* ==================== 棒棒糖 ==================== */
var LOLLIPOP = svg(
  rg('lp-b','38%','32%','78%',[['0%','#FF7878'],['45%','#E82028'],['100%','#7A0515']])
  +rg('lp-h','32%','26%','38%',[['0%','#FFF','0.8'],['100%','#FFF','0']])
  +rg('lp-in','50%','50%','75%',[['60%','#000','0'],['100%','#000','0.35']])
  +shd2('lp-s'),
  '<circle cx="50" cy="42" r="33" fill="url(#lp-b)" stroke="#6A0010" stroke-width="2.4" filter="url(#lp-s)"/>'
  +'<circle cx="50" cy="42" r="33" fill="url(#lp-in)" opacity="0.7"/>'
  +'<path d="M50,10 Q74,12 82,36 Q82,58 62,64 Q42,64 34,48 Q32,32 48,26 Q64,26 68,42 Q66,54 52,56 Q42,52 42,44" stroke="#000" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.35"/>'
  +'<path d="M50,10 Q74,12 82,36 Q82,58 62,64 Q42,64 34,48 Q32,32 48,26 Q64,26 68,42 Q66,54 52,56 Q42,52 42,44" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.98"/>'
  +'<ellipse cx="34" cy="26" rx="11" ry="6" fill="url(#lp-h)" transform="rotate(-30 34 26)"/>'
  +'<path d="M50,74 Q48,85 46,95" stroke="#E8D0A0" stroke-width="5.5" fill="none" stroke-linecap="round"/>'
  +'<path d="M50,74 L50,95" stroke="#9A7040" stroke-width="1" fill="none" opacity="0.5"/>');

/* ==================== 彩虹炸弹 ==================== */
var MULTIPLIER_BOMB = svg(
  lg('mb-f1','0','0','0.3','1',[['0%','#FF6060'],['100%','#B01010']])
  +lg('mb-f2','0','0','0.3','1',[['0%','#FFB060'],['100%','#C06000']])
  +lg('mb-f3','0','0','0.3','1',[['0%','#FFE880'],['100%','#C09800']])
  +lg('mb-f4','0','0','0.3','1',[['0%','#88E070'],['100%','#207020']])
  +lg('mb-f5','0','0','0.3','1',[['0%','#70B0F0'],['100%','#103890']])
  +lg('mb-f6','0','0','0.3','1',[['0%','#C080E8'],['100%','#501890']])
  +rg('mb-hl','30%','26%','42%',[['0%','#FFF','0.95'],['100%','#FFF','0']])
  +rg('mb-in','50%','50%','78%',[['60%','#000','0'],['100%','#000','0.4']])
  +shd2('mb-s'),
  '<path d="M50,54 L50,24 A30,30 0 0,1 76,39 Z" fill="url(#mb-f1)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<path d="M50,54 L76,39 A30,30 0 0,1 76,69 Z" fill="url(#mb-f2)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<path d="M50,54 L76,69 A30,30 0 0,1 50,84 Z" fill="url(#mb-f3)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<path d="M50,54 L50,84 A30,30 0 0,1 24,69 Z" fill="url(#mb-f4)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<path d="M50,54 L24,69 A30,30 0 0,1 24,39 Z" fill="url(#mb-f5)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<path d="M50,54 L24,39 A30,30 0 0,1 50,24 Z" fill="url(#mb-f6)" stroke="#1A0430" stroke-width="1.2"/>'
  +'<circle cx="50" cy="54" r="30" fill="url(#mb-in)" opacity="0.6"/>'
  +'<circle cx="50" cy="54" r="30" fill="none" stroke="#1A0430" stroke-width="2.4" filter="url(#mb-s)"/>'
  +'<circle cx="50" cy="54" r="30" fill="none" stroke="#FFF" stroke-width="1" opacity="0.35"/>'
  +'<ellipse cx="36" cy="34" rx="13" ry="8" fill="url(#mb-hl)" transform="rotate(-25 36 34)"/>'
  +'<ellipse cx="64" cy="44" rx="5" ry="2.5" fill="#FFF" opacity="0.3" transform="rotate(-20 64 44)"/>'
  +'<path d="M50,24 Q48,14 60,6" stroke="#3A2010" stroke-width="3" fill="none" stroke-linecap="round"/>'
  +'<circle cx="60" cy="6" r="4.5" fill="#FFD060"/><circle cx="60" cy="6" r="9" fill="#FFD060" opacity="0.35"/>'
  +'<path d="M62,4 L62,-2 M64,6 L70,4 M58,2 L54,-4" stroke="#FFE080" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>'
  +'<text x="50" y="61" text-anchor="middle" font-size="16" font-weight="900" fill="#FFF" font-family="Arial,Helvetica,sans-serif" stroke="#1A0430" stroke-width="0.9">2x</text>');

/* ==================== 注册表 ==================== */
var S = {
  banana:BANANA, grape:GRAPE, watermelon:WATERMELON, plum:PLUM, apple:APPLE,
  blue_candy:BLUE_CANDY, green_candy:GREEN_CANDY,
  purple_candy:PURPLE_CANDY, red_heart_candy:RED_HEART_CANDY,
  lollipop:LOLLIPOP, multiplier_bomb:MULTIPLIER_BOMB
};
var A = {
  'sb-candy-blue':'blue_candy','sb-candy-green':'green_candy','sb-candy-purple':'purple_candy','sb-candy-heart':'red_heart_candy',
  'sb-fruit-banana':'banana','sb-fruit-grape':'grape','sb-fruit-watermelon':'watermelon','sb-fruit-plum':'plum','sb-fruit-apple':'apple',
  'sb-scatter-lollipop':'lollipop','sb-multiplier-bomb':'multiplier_bomb',
  'BLUE_CANDY':'blue_candy','GREEN_CANDY':'green_candy','PURPLE_CANDY':'purple_candy','RED_HEART_CANDY':'red_heart_candy','RED_HEART':'red_heart_candy',
  'BANANA':'banana','GRAPE':'grape','WATERMELON':'watermelon','PLUM':'plum','APPLE':'apple','LOLLIPOP':'lollipop','MULTIPLIER_BOMB':'multiplier_bomb'
};
function sc(svg,uid){if(!uid)return svg;var re=/id="([^"]+)"/g,ids=[],m,seen={};while((m=re.exec(svg))!==null)ids.push(m[1]);for(var i=0;i<ids.length;i++){var r=ids[i];if(seen[r])continue;seen[r]=true;var e=r.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');svg=svg.replace(new RegExp('id="'+e+'"','g'),'id="'+r+'-'+uid+'"');svg=svg.replace(new RegExp('url\\(#'+e+'\\)','g'),'url(#'+r+'-'+uid+')');}return svg;}
function rs(id){if(Object.prototype.hasOwnProperty.call(S,id))return id;if(Object.prototype.hasOwnProperty.call(A,id))return A[id];return null;}
function get(id,uid){var k=rs(id);if(!k)return '';return sc(S[k],uid||nid('s'));}
function has(id){return rs(id)!==null;}
function list(){return Object.keys(S);}
window.ApexSymbolsV2 = Object.freeze({get:get,has:has,list:list,VIEWBOX:'0 0 100 100',SVGS:Object.freeze(S),ALIASES:Object.freeze(A)});
})();
