(function(){
'use strict';
var H='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u=0;function nid(p){_u+=1;return p+_u.toString(36);}
function lg(id,x1,y1,x2,y2,st){var s='<linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">';for(var i=0;i<st.length;i++){var t=st[i];s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}return s+'</linearGradient>';}
function rg(id,cx,cy,r,st){var s='<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'">';for(var i=0;i<st.length;i++){var t=st[i];s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}return s+'</radialGradient>';}
function shd(id,dy,bl,op){dy=dy==null?3:dy;bl=bl==null?2:bl;op=op==null?0.45:op;return '<filter id="'+id+'" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="'+dy+'" stdDeviation="'+bl+'" flood-color="#000" flood-opacity="'+op+'"/></filter>';}
function svg(d,b){return '<svg '+H+'><defs>'+d+'</defs>'+b+'</svg>';}

/* ==================== 5 水果 ==================== */
var BANANA = svg(
  lg('ba-b','0.1','0','0.7','1',[['0%','#FFF59A'],['25%','#FFD840'],['60%','#F0A000'],['100%','#805000']])
  +rg('ba-h','26%','22%','42%',[['0%','#FFF','0.9'],['100%','#FFF','0']])+shd('ba-s',2.5,2,0.5),
  '<path d="M14,36 Q20,20 38,18 Q64,20 80,42 Q92,60 82,74 Q74,82 62,74 Q50,58 32,50 Q18,44 14,36 Z" fill="url(#ba-b)" stroke="#4A2400" stroke-width="2.2" filter="url(#ba-s)"/>'
  +'<path d="M26,32 Q38,25 54,32" stroke="#FFF" stroke-width="3" fill="none" opacity="0.75" stroke-linecap="round"/>'
  +'<path d="M30,44 Q44,40 58,46" stroke="#FFF" stroke-width="1.8" fill="none" opacity="0.4" stroke-linecap="round"/>'
  +'<ellipse cx="16" cy="36" rx="3.5" ry="2.5" fill="#2A1400"/><ellipse cx="80" cy="72" rx="3.5" ry="2.5" fill="#2A1400"/>');

var GRAPE = svg(
  rg('gr-b','32%','28%','75%',[['0%','#9A6AD8'],['50%','#6A2AB0'],['100%','#2A0844']])
  +lg('gr-l','0','0','0','1',[['0%','#7FD650'],['100%','#2A7018']])
  +shd('gr-s',2.5,2,0.5),
  '<path d="M50,14 Q52,22 50,30" stroke="#5C3A1E" stroke-width="2.8" fill="none" stroke-linecap="round"/>'
  +'<path d="M50,18 Q66,10 80,16 Q72,28 52,26 Z" fill="url(#gr-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<path d="M48,18 Q34,10 20,16 Q28,28 48,26 Z" fill="url(#gr-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<g filter="url(#gr-s)" stroke="#1A0430" stroke-width="1.2">'
  +'<circle cx="30" cy="32" r="11" fill="url(#gr-b)"/><circle cx="50" cy="30" r="11" fill="url(#gr-b)"/><circle cx="70" cy="32" r="11" fill="url(#gr-b)"/>'
  +'<circle cx="24" cy="50" r="10" fill="url(#gr-b)"/><circle cx="42" cy="48" r="11" fill="url(#gr-b)"/><circle cx="60" cy="48" r="11" fill="url(#gr-b)"/><circle cx="76" cy="50" r="10" fill="url(#gr-b)"/>'
  +'<circle cx="32" cy="66" r="10" fill="url(#gr-b)"/><circle cx="50" cy="64" r="10" fill="url(#gr-b)"/><circle cx="68" cy="66" r="10" fill="url(#gr-b)"/>'
  +'<circle cx="40" cy="80" r="9" fill="url(#gr-b)"/><circle cx="60" cy="80" r="9" fill="url(#gr-b)"/>'
  +'</g>'
  +'<ellipse cx="28" cy="28" rx="3.5" ry="2" fill="#FFF" opacity="0.65"/><ellipse cx="48" cy="26" rx="3" ry="1.8" fill="#FFF" opacity="0.55"/><ellipse cx="24" cy="46" rx="3" ry="1.8" fill="#FFF" opacity="0.5"/>');

var WATERMELON = svg(
  rg('wm-b','32%','28%','80%',[['0%','#A0E880'],['35%','#5AB838'],['70%','#2A7020'],['100%','#0E3A08']])
  +rg('wm-h','26%','22%','35%',[['0%','#FFF','0.85'],['100%','#FFF','0']])+shd('wm-s',3,2.2,0.48),
  '<ellipse cx="50" cy="54" rx="35" ry="33" fill="url(#wm-b)" stroke="#0A3808" stroke-width="2.2" filter="url(#wm-s)"/>'
  +'<path d="M28,30 Q40,24 52,32 Q60,38 70,30" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.5" stroke-linecap="round"/>'
  +'<path d="M22,46 Q36,40 48,48 Q58,54 72,46" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.5" stroke-linecap="round"/>'
  +'<path d="M26,64 Q40,58 52,66 Q62,72 74,64" stroke="#2A7020" stroke-width="2.8" fill="none" opacity="0.5" stroke-linecap="round"/>'
  +'<ellipse cx="32" cy="32" rx="14" ry="8" fill="url(#wm-h)" transform="rotate(-25 32 32)"/>'
  +'<ellipse cx="62" cy="76" rx="10" ry="4" fill="#FFF" opacity="0.2" transform="rotate(-15 62 76)"/>');

var PLUM = svg(
  rg('pl-b','35%','30%','75%',[['0%','#E090D8'],['40%','#B040A8'],['100%','#4A0A44']])
  +rg('pl-h','28%','24%','40%',[['0%','#FFF','0.85'],['100%','#FFF','0']])
  +lg('pl-l','0','0','0','1',[['0%','#7FD650'],['100%','#2A7018']])+shd('pl-s',3,2.2,0.5),
  '<circle cx="50" cy="58" r="31" fill="url(#pl-b)" stroke="#3A0830" stroke-width="2.2" filter="url(#pl-s)"/>'
  +'<path d="M50,30 Q49,50 50,86" stroke="#3A0830" stroke-width="2.2" fill="none" opacity="0.6"/>'
  +'<path d="M50,28 Q50,18 48,10" stroke="#5C3A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  +'<path d="M52,22 Q68,12 80,18 Q70,30 52,26 Z" fill="url(#pl-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<ellipse cx="38" cy="44" rx="13" ry="8" fill="url(#pl-h)" transform="rotate(-25 38 44)"/>'
  +'<ellipse cx="46" cy="80" rx="12" ry="4" fill="#FFF" opacity="0.2"/>');

var APPLE = svg(
  rg('ap-b','33%','28%','78%',[['0%','#FF9090'],['38%','#E83040'],['75%','#A01020'],['100%','#5A0808']])
  +rg('ap-h','26%','22%','35%',[['0%','#FFF','0.9'],['100%','#FFF','0']])
  +lg('ap-l','0','0','0','1',[['0%','#7FD650'],['100%','#2A7018']])+shd('ap-s',3,2.2,0.5),
  '<path d="M50,30 Q42,16 28,18 Q14,20 12,36 Q10,54 24,68 Q38,82 50,84 Q62,82 76,68 Q90,54 88,36 Q86,20 72,18 Q58,16 50,30 Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="2.4" filter="url(#ap-s)"/>'
  +'<path d="M50,22 Q60,10 76,14 Q68,28 50,26 Z" fill="url(#ap-l)" stroke="#1A5410" stroke-width="1.2"/>'
  +'<path d="M50,26 Q50,16 48,8" stroke="#5C3A1E" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  +'<ellipse cx="30" cy="36" rx="14" ry="9" fill="url(#ap-h)" transform="rotate(-30 30 36)"/>'
  +'<ellipse cx="36" cy="46" rx="9" ry="5" fill="#FFF" opacity="0.35" transform="rotate(-30 36 46)"/>'
  +'<ellipse cx="50" cy="80" rx="18" ry="4" fill="#FFF" opacity="0.18"/>');

/* ==================== 4 糖果（含厚度） ==================== */
function candy(p,c1,c2,c3,dk,shape){
  var bd,dkShape;
  if(shape==='heart'){bd='M50,84 C24,64 8,46 8,30 C8,18 22,12 34,20 C42,25 50,38 50,38 C50,38 58,25 66,20 C78,12 92,18 92,30 C92,46 76,64 50,84 Z';}
  else if(shape==='oval'){bd='M28,32 Q50,28 72,32 Q94,32 94,50 Q94,68 72,68 Q50,72 28,68 Q6,68 6,50 Q6,32 28,32 Z';}
  else if(shape==='pent'){bd='M50,10 L86,38 L72,84 L28,84 L14,38 Z';}
  else{bd='M30,14 Q50,14 70,14 Q86,14 86,32 Q86,50 86,68 Q86,86 70,86 Q50,86 30,86 Q14,86 14,68 Q14,50 14,32 Q14,14 30,14 Z';}
  return svg(
    lg(p+'-b','0.15','0','0.8','1',[['0%',c1],['45%',c2],['100%',c3]])
    +rg(p+'-h','26%','22%','38%',[['0%','#FFF','0.9'],['100%','#FFF','0']])
    +shd(p+'-s',3,2,0.5),
    '<path d="'+bd+'" fill="'+dk+'" transform="translate(0,3.5)" opacity="0.95"/>'
    +'<path d="'+bd+'" fill="url(#'+p+'-b)" stroke="'+dk+'" stroke-width="2.2" stroke-linejoin="round" filter="url(#'+p+'-s)"/>'
    +'<ellipse cx="34" cy="30" rx="14" ry="7" fill="url(#'+p+'-h)"/>'
    +'<path d="M26,34 Q44,28 60,34" stroke="#FFF" stroke-width="2.5" fill="none" opacity="0.55" stroke-linecap="round"/>');
}
var BLUE_CANDY = candy('bc','#B8E8FF','#4A9EFF','#0A3A7A','#062A5A','oval');
var GREEN_CANDY = candy('gc','#C8F8A0','#52C430','#0E5418','#083A10','pent');
var PURPLE_CANDY = candy('pc','#F0C0FF','#B040E0','#5A0A6A','#3A0548','square');
var RED_HEART_CANDY = candy('rh','#FFB8B8','#E82838','#8A0A1A','#4A0505','heart');

/* ==================== 棒棒糖 Scatter ==================== */
var LOLLIPOP = svg(
  rg('lp-b','38%','32%','75%',[['0%','#FF7070'],['45%','#E82028'],['100%','#8A0818']])
  +rg('lp-h','32%','26%','35%',[['0%','#FFF','0.75'],['100%','#FFF','0']])
  +shd('lp-s',3,2.2,0.55),
  '<circle cx="50" cy="42" r="33" fill="url(#lp-b)" stroke="#6A0010" stroke-width="2.4" filter="url(#lp-s)"/>'
  +'<path d="M50,10 Q74,12 82,36 Q82,58 62,64 Q42,64 34,48 Q32,32 48,26 Q64,26 68,42 Q66,54 52,56 Q42,52 42,44" stroke="#FFF" stroke-width="5.5" fill="none" stroke-linecap="round" opacity="0.98"/>'
  +'<ellipse cx="36" cy="26" rx="11" ry="6" fill="url(#lp-h)" transform="rotate(-30 36 26)"/>'
  +'<path d="M50,75 Q48,85 46,95" stroke="#E8D0A0" stroke-width="5.5" fill="none" stroke-linecap="round"/>');

/* ==================== 倍率炸弹（彩虹扇形） ==================== */
var MULTIPLIER_BOMB = svg(
  rg('mb-hl','30%','26%','40%',[['0%','#FFF','0.9'],['100%','#FFF','0']])
  +shd('mb-s',3,2.4,0.55),
  '<path d="M50,54 L50,24 A30,30 0 0,1 76,39 Z" fill="#FF3030"/>'
  +'<path d="M50,54 L76,39 A30,30 0 0,1 76,69 Z" fill="#FF8030"/>'
  +'<path d="M50,54 L76,69 A30,30 0 0,1 50,84 Z" fill="#FFD040"/>'
  +'<path d="M50,54 L50,84 A30,30 0 0,1 24,69 Z" fill="#50C050"/>'
  +'<path d="M50,54 L24,69 A30,30 0 0,1 24,39 Z" fill="#4080E0"/>'
  +'<path d="M50,54 L24,39 A30,30 0 0,1 50,24 Z" fill="#A040E0"/>'
  +'<circle cx="50" cy="54" r="30" fill="none" stroke="#1A0430" stroke-width="2.4" filter="url(#mb-s)"/>'
  +'<ellipse cx="36" cy="34" rx="12" ry="7" fill="url(#mb-hl)" transform="rotate(-25 36 34)"/>'
  +'<path d="M50,24 Q48,14 60,6" stroke="#3A2010" stroke-width="3" fill="none" stroke-linecap="round"/>'
  +'<circle cx="60" cy="6" r="4.5" fill="#FFD060"/><circle cx="60" cy="6" r="8" fill="#FFD060" opacity="0.4"/>'
  +'<text x="50" y="61" text-anchor="middle" font-size="16" font-weight="900" fill="#FFF" font-family="Arial,Helvetica,sans-serif" stroke="#1A0430" stroke-width="0.9">2x</text>');

/* ==================== 注册表 ==================== */
var S = {
  banana: BANANA, grape: GRAPE, watermelon: WATERMELON, plum: PLUM, apple: APPLE,
  blue_candy: BLUE_CANDY, green_candy: GREEN_CANDY,
  purple_candy: PURPLE_CANDY, red_heart_candy: RED_HEART_CANDY,
  lollipop: LOLLIPOP, multiplier_bomb: MULTIPLIER_BOMB
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
