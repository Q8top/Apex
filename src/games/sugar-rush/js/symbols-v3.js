(function(){
'use strict';
/* Apex Sugar Rush - Symbol Renderer v3
 * 11 symbols, 100x100 viewBox, uid-isolated via nid().
 * Shared defs sprite mirrors Sweet's symbols-v2 _ensureDefsSprite.
 */
var VB='0 0 100 100';
var HEAD='xmlns="http://www.w3.org/2000/svg" viewBox="'+VB+'" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u=0;
function nid(p){_u+=1;return p+_u.toString(36);}
function lg(id,x1,y1,x2,y2,st){
  var s='<linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">';
  for(var i=0;i<st.length;i++){var t=st[i];
    s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}
  return s+'</linearGradient>';
}
function rg(id,cx,cy,r,st){
  var s='<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'">';
  for(var i=0;i<st.length;i++){var t=st[i];
    s+='<stop offset="'+t[0]+'" stop-color="'+t[1]+'"'+(t[2]!==undefined?' stop-opacity="'+t[2]+'"':'')+'/>';}
  return s+'</radialGradient>';
}
function el(tag,attrs){
  var s='<'+tag;
  for(var k in attrs){if(attrs.hasOwnProperty(k))s+=' '+k+'="'+attrs[k]+'"';}
  return s+'/>';
}
function gloss(cx,cy,rx,ry,rot,op){
  var t=rot?' transform="rotate('+rot+' '+cx+' '+cy+')"':'';
  return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#FFFFFF" opacity="'+op+'"'+t+'/>';
}
function shadow(cx,cy,rx,ry,op){
  return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#000" opacity="'+op+'"/>';
}
var BUILDERS={};
function register(id,fn){BUILDERS[id]=fn;}
function get(id){var f=BUILDERS[id];if(!f)return '';return '<svg '+HEAD+'>'+f()+'</svg>';}
function render(id,el){if(!el)return;var s=get(id);if(s)el.innerHTML=s;}
/* ===== Bears ===== */
function _bear(c){
  var uid=nid('b');
  var bg=uid+'g';
  var s='<defs>'+lg(bg,'20%','15%','80%','92%',[[0,c.hi],[0.42,c.mid],[1,c.lo]])+'</defs>';
  s+=el('ellipse',{cx:30,cy:22,rx:11,ry:11,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:70,cy:22,rx:11,ry:11,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:30,cy:22,rx:4.5,ry:4.5,fill:c.inner,opacity:0.75});
  s+=el('ellipse',{cx:70,cy:22,rx:4.5,ry:4.5,fill:c.inner,opacity:0.75});
  s+=el('ellipse',{cx:50,cy:60,rx:34,ry:36,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:32,cy:88,rx:13,ry:7,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:68,cy:88,rx:13,ry:7,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:20,cy:58,rx:9,ry:11,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:80,cy:58,rx:9,ry:11,fill:'url(#'+bg+')'});
  s+=el('ellipse',{cx:41,cy:50,rx:3.2,ry:3.8,fill:'#1A0E1F'});
  s+=el('ellipse',{cx:59,cy:50,rx:3.2,ry:3.8,fill:'#1A0E1F'});
  s+=el('circle',{cx:42,cy:48.6,r:1,fill:'#FFFFFF'});
  s+=el('circle',{cx:60,cy:48.6,r:1,fill:'#FFFFFF'});
  s+=el('ellipse',{cx:50,cy:60,rx:4,ry:3,fill:'#2A1024',opacity:0.85});
  s+='<path d="M47 64 Q50 67 53 64" stroke="#2A1024" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  s+=el('ellipse',{cx:36,cy:40,rx:12,ry:9,fill:'#FFFFFF',opacity:0.18});
  s+=el('ellipse',{cx:38,cy:42,rx:6,ry:4,fill:'#FFFFFF',opacity:0.35});
  return s;
}
register('blue_candy',function(){return _bear({hi:'#FFE7B8',mid:'#FF9A2E',lo:'#A84E00',inner:'#FFF0C8'});});
register('green_candy',function(){return _bear({hi:'#EACFFF',mid:'#B04BE0',lo:'#5A1B85',inner:'#F4E4FF'});});
register('purple_candy',function(){return _bear({hi:'#FFC8C8',mid:'#E84A4A',lo:'#871313',inner:'#FFE4E4'});});
/* ===== Star + Jellybean ===== */
register('red_candy',function(){
  var uid=nid('st');var g1=uid+'a',g2=uid+'b';
  var s='<defs>';
  s+=lg(g1,'25%','15%','75%','85%',[[0,'#C8FF8A'],[0.45,'#5BCB2E'],[1,'#1F6B0E']]);
  s+=lg(g2,'50%','50%','50%','100%',[[0,'#FFFFFF',0.55],[1,'#FFFFFF',0]]);
  s+='</defs>';
  var pts='';
  for(var i=0;i<10;i++){var ang=-Math.PI/2+i*Math.PI/5;var r=(i%2===0)?38:16;
    var x=50+r*Math.cos(ang);var y=52+r*Math.sin(ang);
    pts+=(i?' L':'M')+x.toFixed(2)+' '+y.toFixed(2);}
  s+='<path d="'+pts+' Z" fill="url(#'+g1+')" stroke="#1F6B0E" stroke-width="1.4" stroke-linejoin="round"/>';
  s+=el('ellipse',{cx:42,cy:38,rx:12,ry:8,fill:'#FFFFFF',opacity:0.35,transform:'rotate(-25 42 38)'});
  s+=el('ellipse',{cx:44,cy:40,rx:6,ry:3.5,fill:'#FFFFFF',opacity:0.55,transform:'rotate(-25 44 40)'});
  s+='<path d="'+pts+' Z" fill="url(#'+g2+')" opacity="0.25"/>';
  return s;
});
register('strawberry',function(){
  var uid=nid('jb');var g=uid+'g';
  var s='<defs>';
  s+=lg(g,'18%','15%','82%','88%',[[0,'#E9C7FF'],[0.42,'#9B4AE0'],[1,'#4A1472']]);
  s+='</defs>';
  s+='<g transform="rotate(-22 50 50)">';
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'url(#'+g+')'});
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'none',stroke:'#3A0D5E','stroke-width':1.2});
  s+=el('ellipse',{cx:40,cy:44,rx:14,ry:7,fill:'#FFFFFF',opacity:0.4,transform:'rotate(-12 40 44)'});
  s+=el('ellipse',{cx:42,cy:45,rx:7,ry:3,fill:'#FFFFFF',opacity:0.6,transform:'rotate(-12 42 45)'});
  s+=el('ellipse',{cx:65,cy:60,rx:8,ry:3,fill:'#2A0A45',opacity:0.35});
  s+='</g>';
  return s;
});
/* ===== Heart + Ball ===== */
register('orange',function(){
  var uid=nid('ht');var g=uid+'g',h=uid+'h';
  var s='<defs>';
  s+=lg(g,'20%','15%','85%','90%',[[0,'#FFE2A8'],[0.42,'#FF8A1E'],[1,'#A63A00']]);
  s+=lg(h,'30%','15%','70%','55%',[[0,'#FFFFFF',0.75],[1,'#FFFFFF',0]]);
  s+='</defs>';
  s+='<path d="M50 88 C22 68 10 50 12 34 C14 18 28 12 40 18 C46 21 50 27 50 32 C50 27 54 21 60 18 C72 12 86 18 88 34 C90 50 78 68 50 88 Z" fill="url(#'+g+')" stroke="#7A2600" stroke-width="1.4" stroke-linejoin="round"/>';
  s+='<path d="M50 88 C22 68 10 50 12 34 C14 18 28 12 40 18 C46 21 50 27 50 32 C50 27 54 21 60 18 C72 12 86 18 88 34 C90 50 78 68 50 88 Z" fill="url(#'+h+')" opacity="0.9"/>';
  s+=el('ellipse',{cx:32,cy:36,rx:9,ry:6,fill:'#FFFFFF',opacity:0.55,transform:'rotate(-32 32 36)'});
  s+=el('ellipse',{cx:34,cy:38,rx:4,ry:2.5,fill:'#FFFFFF',opacity:0.85,transform:'rotate(-32 34 38)'});
  s+=el('ellipse',{cx:68,cy:36,rx:5,ry:3,fill:'#FFFFFF',opacity:0.4,transform:'rotate(28 68 36)'});
  return s;
});
register('mango',function(){
  var uid=nid('bl');var g=uid+'g',h=uid+'h',rim=uid+'r';
  var s='<defs>';
  s+=rg(g,'38%','34%','68%',[[0,'#FFE8F2'],[0.32,'#FF8FBE'],[0.78,'#E23A7C'],[1,'#8E1245']]);
  s+=rg(h,'35%','30%','45%',[[0,'#FFFFFF',0.85],[1,'#FFFFFF',0]]);
  s+=lg(rim,'30%','25%','70%','80%',[[0,'#FFFFFF',0.7],[0.5,'#FFFFFF',0.1],[1,'#7A0E3A',0.5]]);
  s+='</defs>';
  s+=el('circle',{cx:50,cy:52,r:36,fill:'url(#'+g+')'});
  s+=el('circle',{cx:50,cy:52,r:36,fill:'url(#'+rim+')'});
  s+=el('circle',{cx:50,cy:52,r:36,fill:'none',stroke:'#7A0E3A','stroke-width':1});
  s+=el('ellipse',{cx:38,cy:36,rx:14,ry:9,fill:'#FFFFFF',opacity:0.5,transform:'rotate(-32 38 36)'});
  s+=el('ellipse',{cx:40,cy:37,rx:6,ry:4,fill:'#FFFFFF',opacity:0.85,transform:'rotate(-32 40 37)'});
  s+=el('ellipse',{cx:64,cy:68,rx:9,ry:4,fill:'#5A0828',opacity:0.28,transform:'rotate(-25 64 68)'});
  return s;
});
/* ===== Scatter + Bomb ===== */
register('lollipop',function(){
  var uid=nid('sc');
  var gr=uid+'r',gl=uid+'l',gb=uid+'b';
  var s='<defs>';
  s+=lg(gr,'25%','10%','75%','90%',[[0,'#FFB4C8'],[0.4,'#E8264F'],[1,'#7A0E2A']]);
  s+=lg(gl,'30%','20%','70%','80%',[[0,'#FFFFFF',0.6],[0.55,'#FFFFFF',0.15],[1,'#FFFFFF',0.05]]);
  s+=lg(gb,'50%','30%','50%','75%',[[0,'#7FB4FF'],[1,'#1E5BB8']]);
  s+='</defs>';
  s+=el('path',{d:'M20 78 L80 78 L72 72 L28 72 Z',fill:'#5A0A22'});
  s+=el('ellipse',{cx:50,cy:76,rx:22,ry:5,fill:'#3A0514'});
  s+=el('path',{d:'M28 72 Q22 60 26 40 Q30 22 50 18 Q70 22 74 40 Q78 60 72 72 Z',fill:'url(#'+gr+')'});
  s+=el('path',{d:'M28 72 Q22 60 26 40 Q30 22 50 18 Q70 22 74 40 Q78 60 72 72 Z',fill:'url(#'+gl+')'});
  s+='<path d="M28 72 Q22 60 26 40 Q30 22 50 18 Q70 22 74 40 Q78 60 72 72 Z" fill="none" stroke="#5A0A22" stroke-width="1.2"/>';
  s+=el('ellipse',{cx:50,cy:40,rx:20,ry:22,fill:'#0E1630',opacity:0.55});
  var cols=['#FFD23A','#FF5A8A','#7ED957','#5AC8FA','#B85CF2','#FF8A1E'];
  var pts=[[42,34,6],[56,32,5.5],[50,44,6.5],[38,46,5],[60,46,5],[48,54,5.5]];
  for(var i=0;i<pts.length;i++){
    var p=pts[i];var c=cols[i%cols.length];
    s+=el('circle',{cx:p[0],cy:p[1],r:p[2],fill:c});
    s+=el('circle',{cx:p[0]-p[2]*0.3,cy:p[1]-p[2]*0.35,r:p[2]*0.35,fill:'#FFFFFF',opacity:0.75});
  }
  s+=el('path',{d:'M32 20 L68 20 L60 8 L40 8 Z',fill:'url(#'+gr+')',stroke:'#5A0A22','stroke-width':1});
  s+=el('path',{d:'M18 68 L26 60 L28 72 Z',fill:'#E8264F',stroke:'#5A0A22','stroke-width':0.8});
  s+=el('path',{d:'M82 68 L74 60 L72 72 Z',fill:'#E8264F',stroke:'#5A0A22','stroke-width':0.8});
  s+=el('path',{d:'M20 78 L80 78 L74 84 L26 84 Z',fill:'url(#'+gb+')',opacity:0.85});
  s+=el('circle',{cx:50,cy:78,r:3.5,fill:'#FFD23A',stroke:'#7A0E2A','stroke-width':0.8});
  return s;
});
register('candy_bomb',function(){
  var uid=nid('cb');
  var g=uid+'g',sh=uid+'s',sp=uid+'p';
  var s='<defs>';
  s+=rg(g,'35%','30%','60%',[[0,'#FFFFFF'],[0.28,'#FFE066'],[0.62,'#FF8A1E'],[1,'#8E1A00']]);
  s+=rg(sp,'38%','32%','50%',[[0,'#FFFFFF',0.9],[1,'#FFFFFF',0]]);
  s+='</defs>';
  s+=el('circle',{cx:50,cy:56,r:32,fill:'#2A0A14'});
  s+=el('circle',{cx:50,cy:54,r:32,fill:'url(#'+g+')'});
  s+='<path d="M62 22 Q66 14 60 8 Q70 8 74 16 Q76 22 72 28" stroke="#7A3A00" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  s+=el('circle',{cx:72,cy:24,r:4,fill:'#FFD23A'});
  s+=el('circle',{cx:72,cy:24,r:6,fill:'#FFD23A',opacity:0.35});
  s+=el('ellipse',{cx:36,cy:40,rx:11,ry:8,fill:'#FFFFFF',opacity:0.75,transform:'rotate(-30 36 40)'});
  s+=el('ellipse',{cx:38,cy:42,rx:5,ry:3,fill:'#FFFFFF',opacity:0.95,transform:'rotate(-30 38 42)'});
  s+=el('ellipse',{cx:60,cy:72,rx:10,ry:4,fill:'#3A0010',opacity:0.4,transform:'rotate(-20 60 72)'});
  return s;
});
window.ApexSRSymbolsV3=Object.freeze({
  get:get,render:render,register:register,
  has:function(id){return !!BUILDERS[id];},
  list:function(){return Object.keys(BUILDERS);},
  _el:el,_lg:lg,_rg:rg,_gloss:gloss,_shadow:shadow,_nid:nid
});
})();
