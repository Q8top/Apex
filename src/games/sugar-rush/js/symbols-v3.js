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
  var gA=uid+'A', gB=uid+'B', gR=uid+'R', gE=uid+'E', gN=uid+'N';
  var s='<defs>';
  /* 主体渐变：底部深 -> 中段主色 -> 顶部亮 */
  s+=lg(gA,'22%','14%','78%','94%',[[0,c.hi],[0.34,c.mid],[0.78,c.mid2],[1,c.lo]]);
  /* 边缘光（rim light）：右下反光 */
  s+=lg(gR,'70%','25%','92%','90%',[[0,'#FFFFFF',0],[0.55,'#FFFFFF',0.28],[1,'#FFFFFF',0.05]]);
  /* 高光块 */
  s+=lg(gE,'28%','22%','72%','58%',[[0,'#FFFFFF',0.72],[0.6,'#FFFFFF',0.18],[1,'#FFFFFF',0]]);
  /* 内耳 */
  s+=rg(gN,'50%','50%','50%',[[0,c.inner,0.95],[1,c.inner,0.35]]);
  s+='</defs>';
  /* ---- 耳（外 + 内） ---- */
  s+=el('ellipse',{cx:29,cy:22,rx:12,ry:12,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:71,cy:22,rx:12,ry:12,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:29,cy:22,rx:12,ry:12,fill:'url(#'+gR+')'});
  s+=el('ellipse',{cx:71,cy:22,rx:12,ry:12,fill:'url(#'+gR+')'});
  s+=el('ellipse',{cx:29,cy:23,rx:5,ry:5,fill:'url(#'+gN+')'});
  s+=el('ellipse',{cx:71,cy:23,rx:5,ry:5,fill:'url(#'+gN+')'});
  /* ---- 头（大方圆） ---- */
  s+=el('ellipse',{cx:50,cy:59,rx:35,ry:37,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:50,cy:59,rx:35,ry:37,fill:'url(#'+gR+')'});
  /* 底部淡阴影圈（让立体感更强） */
  s+=el('ellipse',{cx:50,cy:83,rx:26,ry:8,fill:c.lo,opacity:0.32});
  /* ---- 脚 ---- */
  s+=el('ellipse',{cx:31,cy:89,rx:14,ry:7.5,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:69,cy:89,rx:14,ry:7.5,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:31,cy:89,rx:14,ry:7.5,fill:'url(#'+gR+')',opacity:0.7});
  s+=el('ellipse',{cx:69,cy:89,rx:14,ry:7.5,fill:'url(#'+gR+')',opacity:0.7});
  /* ---- 手 ---- */
  s+=el('ellipse',{cx:19,cy:57,rx:10,ry:12,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:81,cy:57,rx:10,ry:12,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:19,cy:57,rx:10,ry:12,fill:'url(#'+gR+')',opacity:0.55});
  s+=el('ellipse',{cx:81,cy:57,rx:10,ry:12,fill:'url(#'+gR+')',opacity:0.55});
  /* ---- 眼睛（带眼白高光） ---- */
  s+=el('ellipse',{cx:41,cy:50,rx:3.6,ry:4.4,fill:'#1A0E1F'});
  s+=el('ellipse',{cx:59,cy:50,rx:3.6,ry:4.4,fill:'#1A0E1F'});
  s+=el('circle',{cx:42.2,cy:48.3,r:1.15,fill:'#FFFFFF'});
  s+=el('circle',{cx:60.2,cy:48.3,r:1.15,fill:'#FFFFFF'});
  s+=el('circle',{cx:40.3,cy:51.7,r:0.6,fill:'#FFFFFF',opacity:0.55});
  s+=el('circle',{cx:58.3,cy:51.7,r:0.6,fill:'#FFFFFF',opacity:0.55});
  /* ---- 口鼻 ---- */
  s+=el('ellipse',{cx:50,cy:60,rx:4.4,ry:3.2,fill:'#2A1024',opacity:0.92});
  s+=el('ellipse',{cx:50,cy:58.6,rx:2,ry:1,fill:'#FFFFFF',opacity:0.35});
  s+='<path d="M46.6 64.2 Q50 67.4 53.4 64.2" stroke="#2A1024" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  s+='<path d="M50 63 L50 65.2" stroke="#2A1024" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  /* ---- 主体高光 ---- */
  s+=el('ellipse',{cx:35,cy:38,rx:13,ry:9,fill:'#FFFFFF',opacity:0.16,transform:'rotate(-22 35 38)'});
  s+=el('ellipse',{cx:37,cy:40,rx:6.5,ry:4,fill:'#FFFFFF',opacity:0.5,transform:'rotate(-22 37 40)'});
  /* 顶部小亮点 */
  s+=el('ellipse',{cx:33,cy:32,rx:3,ry:1.6,fill:'#FFFFFF',opacity:0.75,transform:'rotate(-30 33 32)'});
  return s;
}
register('blue_candy',function(){return _bear({hi:'#FFEBBA',mid:'#FF9A2E',mid2:'#D96A00',lo:'#9C4A00',inner:'#FFE0A8'});});
register('green_candy',function(){return _bear({hi:'#EACFFF',mid:'#B04BE0',lo:'#5A1B85',inner:'#F4E4FF'});});
register('purple_candy',function(){return _bear({hi:'#FFC8C8',mid:'#E84A4A',lo:'#871313',inner:'#FFE4E4'});});
/* ===== Star + Jellybean ===== */
register('red_candy',function(){
  var uid=nid('st');
  var gA=uid+'A', gB=uid+'B', gE=uid+'E', gL=uid+'L';
  var s='<defs>';
  /* 主体：底部深绿 -> 中段亮绿 -> 顶部黄绿 */
  s+=lg(gA,'28%','12%','72%','92%',[[0,'#D6FF8A'],[0.34,'#6BD832'],[0.72,'#2FA018'],[1,'#105A08']]);
  /* 内发光：中心亮，边缘暗（球面感） */
  s+=rg(gB,'50%','45%','62%',[[0,'#FFFFFF',0.32],[0.55,'#FFFFFF',0.06],[1,'#FFFFFF',0]]);
  /* 边缘光 */
  s+=lg(gL,'78%','20%','94%','82%',[[0,'#FFFFFF',0],[0.5,'#FFFFFF',0.35],[1,'#FFFFFF',0.05]]);
  /* 主高光块 */
  s+=lg(gE,'30%','22%','62%','54%',[[0,'#FFFFFF',0.82],[1,'#FFFFFF',0]]);
  s+='</defs>';
  /* 星形轮廓（10 顶点：5 外 5 内） */
  var pts=[];
  for(var i=0;i<10;i++){
    var ang=-Math.PI/2 + i*Math.PI/5;
    var r=(i%2===0)?39:15;
    var x=50+r*Math.cos(ang);
    var y=52+r*Math.sin(ang);
    pts.push([x,y]);
  }
  function polyStr(ids){
    var out='';
    for(var k=0;k<ids.length;k++){
      var p=pts[ids[k]];
      out+=(k?' L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2);
    }
    return out+' Z';
  }
  var full=polyStr([0,1,2,3,4,5,6,7,8,9]);
  /* 主体 */
  s+='<path d="'+full+'" fill="url(#'+gA+')" stroke="#0C4806" stroke-width="1.6" stroke-linejoin="round"/>';
  /* 内发光覆盖 */
  s+='<path d="'+full+'" fill="url(#'+gB+')"/>';
  /* 边缘光覆盖 */
  s+='<path d="'+full+'" fill="url(#'+gL+')" opacity="0.9"/>';
  /* 面切：从中心到每个外顶点画细线，营造棱面感 */
  s+='<g stroke="#0A3D05" stroke-width="0.55" opacity="0.32" fill="none">';
  for(var j=0;j<5;j++){
    var tip=pts[j*2];
    s+='<line x1="50" y1="52" x2="'+tip[0].toFixed(2)+'" y2="'+tip[1].toFixed(2)+'"/>';
  }
  s+='</g>';
  /* 主高光块 */
  s+='<path d="'+polyStr([0,1,2,9])+'" fill="url(#'+gE+')" opacity="0.85"/>';
  /* 尖角小亮点 */
  s+='<ellipse cx="40" cy="38" rx="6" ry="2.6" fill="#FFFFFF" opacity="0.85" transform="rotate(-30 40 38)"/>';
  s+='<ellipse cx="44" cy="40" rx="2.6" ry="1.2" fill="#FFFFFF" opacity="0.95" transform="rotate(-30 44 40)"/>';
  /* 底部描暗 */
  s+='<path d="'+polyStr([4,5,6,7,8])+'" fill="#0A3D05" opacity="0.16"/>';
  return s;
});
register('strawberry',function(){
  var uid=nid('jb');
  var gA=uid+'A', gB=uid+'B', gE=uid+'E', gL=uid+'L';
  var s='<defs>';
  /* 主体：顶部亮紫 -> 中段深紫 -> 底部略亮（半透明感） */
  s+=lg(gA,'18%','12%','82%','90%',[[0,'#EFD0FF'],[0.24,'#B964F0'],[0.58,'#7A1ECF'],[0.82,'#4A0E85'],[1,'#7A2AAB']]);
  /* 顶部高光条 */
  s+=lg(gE,'50%','16%','50%','54%',[[0,'#FFFFFF',0.92],[0.7,'#FFFFFF',0.28],[1,'#FFFFFF',0]]);
  /* 边缘光 */
  s+=lg(gL,'72%','30%','94%','82%',[[0,'#FFFFFF',0],[0.55,'#FFFFFF',0.28],[1,'#FFFFFF',0.04]]);
  /* 内发光球面 */
  s+=rg(gB,'50%','40%','70%',[[0,'#FFFFFF',0.28],[0.6,'#FFFFFF',0.04],[1,'#FFFFFF',0]]);
  s+='</defs>';
  s+='<g transform="rotate(-22 50 50)">';
  /* 主体（椭圆豆形） */
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'url(#'+gA+')'});
  /* 底部暗影 */
  s+=el('ellipse',{cx:50,cy:62,rx:30,ry:11,fill:'#3A0864',opacity:0.35});
  /* 内发光 */
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'url(#'+gB+')'});
  /* 边缘光 */
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'url(#'+gL+')'});
  /* 描边 */
  s+=el('ellipse',{cx:50,cy:52,rx:36,ry:22,fill:'none',stroke:'#2E0654','stroke-width':1.2});
  /* 内描边（更细） */
  s+=el('ellipse',{cx:50,cy:52,rx:33.5,ry:19.5,fill:'none',stroke:'#D08AF0','stroke-width':0.7,opacity:0.35});
  /* 顶部宽高光条 */
  s+=el('ellipse',{cx:46,cy:42,rx:22,ry:6.5,fill:'url(#'+gE+')'});
  /* 顶部针尖亮点 */
  s+=el('ellipse',{cx:44,cy:40,rx:8,ry:2.4,fill:'#FFFFFF',opacity:0.95});
  /* 底部小反光（半透明感） */
  s+=el('ellipse',{cx:56,cy:64,rx:14,ry:3,fill:'#EFD0FF',opacity:0.28});
  s+='</g>';
  return s;
});
register('orange',function(){
  var uid=nid('ht');
  var gA=uid+'A',gE=uid+'E',gL=uid+'L',gS=uid+'S';
  var s='<defs>';
  s+=lg(gA,'22%','10%','82%','92%',[[0,'#FFEFA8'],[0.32,'#FF9F1E'],[0.72,'#E55A08'],[1,'#8A2A00']]);
  s+=lg(gE,'30%','14%','68%','52%',[[0,'#FFFFFF',0.9],[0.7,'#FFFFFF',0.2],[1,'#FFFFFF',0]]);
  s+=lg(gL,'76%','30%','96%','86%',[[0,'#FFFFFF',0],[0.55,'#FFFFFF',0.35],[1,'#FFFFFF',0.06]]);
  s+=rg(gS,'50%','40%','58%',[[0,'#FFFFFF',0.22],[1,'#FFFFFF',0]]);
  s+='</defs>';
  var hp='M50 89 C20 68 8 50 11 33 C14 17 29 11 41 18 C46 21 50 28 50 33';
  hp+=' C50 28 54 21 59 18 C71 11 86 17 89 33 C92 50 80 68 50 89 Z';
  s+='<path d="'+hp+'" fill="#8A2A00" opacity="0.35" transform="translate(0,2)"/>';
  s+='<path d="'+hp+'" fill="url(#'+gA+')"/>';
  s+='<path d="'+hp+'" fill="url(#'+gS+')"/>';
  s+='<path d="'+hp+'" fill="url(#'+gL+')"/>';
  s+='<path d="'+hp+'" fill="none" stroke="#7A2000" stroke-width="1.3" stroke-linejoin="round"/>';
  s+=el('ellipse',{cx:31,cy:36,rx:10,ry:6.5,fill:'url(#'+gE+')',transform:'rotate(-32 31 36)'});
  s+=el('ellipse',{cx:33,cy:38,rx:4.5,ry:2.6,fill:'#FFFFFF',opacity:0.95,transform:'rotate(-32 33 38)'});
  s+=el('ellipse',{cx:28,cy:30,rx:2.2,ry:1.1,fill:'#FFFFFF',opacity:0.85,transform:'rotate(-32 28 30)'});
  s+=el('ellipse',{cx:68,cy:36,rx:5.5,ry:3,fill:'#FFFFFF',opacity:0.42,transform:'rotate(28 68 36)'});
  return s;
});

register('mango',function(){
  var uid=nid('bl');
  var gA=uid+'A',gE=uid+'E',gB=uid+'B',gL=uid+'L',gD=uid+'D';
  var s='<defs>';
  s+=rg(gA,'36%','32%','70%',[[0,'#FFEFF7'],[0.22,'#FFA3CB'],[0.55,'#E82B6E'],[0.82,'#A80F46'],[1,'#6B0528']]);
  s+=rg(gE,'32%','26%','38%',[[0,'#FFFFFF',0.95],[0.6,'#FFFFFF',0.28],[1,'#FFFFFF',0]]);
  s+=lg(gB,'50%','58%','50%','96%',[[0,'#FFFFFF',0],[0.6,'#FFB4D0',0.32],[1,'#FFFFFF',0.5]]);
  s+=lg(gL,'72%','26%','98%','82%',[[0,'#FFFFFF',0],[0.55,'#FFFFFF',0.32],[1,'#FFFFFF',0.05]]);
  var d1='50%',d2='88%',d3='42%';
  s+=rg(gD,d1,d2,d3,[[0,'#3A0014',0.42],[1,'#3A0014',0]]);
  s+='</defs>';
  s+=el('circle',{cx:50,cy:54,r:37,fill:'url(#'+gD+')'});
  s+=el('circle',{cx:50,cy:52,r:36,fill:'url(#'+gA+')'});
  s+=el('ellipse',{cx:50,cy:68,rx:28,ry:13,fill:'url(#'+gB+')',opacity:0.7});
  s+=el('circle',{cx:50,cy:52,r:36,fill:'url(#'+gL+')'});
  s+=el('circle',{cx:50,cy:52,r:36,fill:'none',stroke:'#5A0520','stroke-width':1.1});
  s+=el('circle',{cx:50,cy:52,r:33.5,fill:'none',stroke:'#FFB4D0','stroke-width':0.6,opacity:0.45});
  s+=el('ellipse',{cx:36,cy:34,rx:13,ry:9.5,fill:'url(#'+gE+')',transform:'rotate(-30 36 34)'});
  s+=el('ellipse',{cx:38,cy:35,rx:6,ry:3.6,fill:'#FFFFFF',opacity:0.98,transform:'rotate(-30 38 35)'});
  s+=el('ellipse',{cx:32,cy:30,rx:2.6,ry:1.4,fill:'#FFFFFF',opacity:0.9,transform:'rotate(-30 32 30)'});
  s+=el('ellipse',{cx:66,cy:70,rx:9,ry:3.4,fill:'#3A0014',opacity:0.38,transform:'rotate(-25 66 70)'});
  return s;
});
register('lollipop',function(){
  var uid=nid('sc');
  var gR=uid+'R',gL=uid+'L',gW=uid+'W',gM=uid+'M';
  var s='<defs>';
  s+=lg(gR,'24%','8%','76%','92%',[[0,'#FFB6CC'],[0.32,'#E8264F'],[0.72,'#A00E33'],[1,'#6B0620']]);
  s+=lg(gL,'30%','12%','70%','80%',[[0,'#FFFFFF',0.55],[0.5,'#FFFFFF',0.14],[1,'#FFFFFF',0.03]]);
  s+=lg(gW,'50%','14%','50%','78%',[[0,'#C8E0FF',0.85],[0.5,'#8FB8E8',0.5],[1,'#FFFFFF',0.18]]);
  s+=lg(gM,'30%','20%','70%','70%',[[0,'#FFFFFF',0.7],[0.5,'#D8D8D8',0.3],[1,'#7A7A7A',0.4]]);
  s+='</defs>';
  s+=el('path',{d:'M22 80 L78 80 L70 74 L30 74 Z',fill:'#4A0818'});
  s+=el('ellipse',{cx:50,cy:78,rx:22,ry:5,fill:'#2A0410'});
  s+=el('path',{d:'M28 74 Q20 60 24 38 Q28 20 50 16 Q72 20 76 38 Q80 60 72 74 Z',fill:'url(#'+gM+')'});
  s+=el('path',{d:'M28 74 Q20 60 24 38 Q28 20 50 16 Q72 20 76 38 Q80 60 72 74 Z',fill:'url(#'+gR+')'});
  s+=el('path',{d:'M28 74 Q20 60 24 38 Q28 20 50 16 Q72 20 76 38 Q80 60 72 74 Z',fill:'url(#'+gL+')'});
  s+='<path d="M28 74 Q20 60 24 38 Q28 20 50 16 Q72 20 76 38 Q80 60 72 74 Z" fill="none" stroke="#4A0818" stroke-width="1.2"/>';
  s+=el('ellipse',{cx:50,cy:42,rx:21,ry:23,fill:'#0C1428',opacity:0.55});
  s+=el('ellipse',{cx:50,cy:42,rx:21,ry:23,fill:'url(#'+gW+')'});
  s+=el('ellipse',{cx:38,cy:34,rx:6,ry:9,fill:'#FFFFFF',opacity:0.38,transform:'rotate(-20 38 34)'});
  var cols=['#FFD23A','#FF5A8A','#7ED957','#5AC8FA','#B85CF2','#FF8A1E','#FF3A5A'];
  var pts=[[42,34,6],[56,32,5.5],[50,44,6.5],[38,46,5],[60,46,5],[48,54,5.5],[56,56,4.5]];
  for(var i=0;i<pts.length;i++){
    var p=pts[i];var c=cols[i%cols.length];
    var gi='gi'+i+'_'+uid;
    s+=rg(gi,(p[0]+'%'),(p[1]+'%'),'70%',[[0,'#FFFFFF',0.85],[0.35,c,0.9],[1,c,0.7]]);
    s+=el('circle',{cx:p[0],cy:p[1],r:p[2],fill:'url(#'+gi+')'});
    s+=el('circle',{cx:p[0]-p[2]*0.35,cy:p[1]-p[2]*0.4,r:p[2]*0.32,fill:'#FFFFFF',opacity:0.9});
  }
  s+=el('path',{d:'M32 18 L68 18 L60 6 L40 6 Z',fill:'url(#'+gM+')',stroke:'#4A0818','stroke-width':1});
  s+=el('path',{d:'M32 18 L68 18 L60 6 L40 6 Z',fill:'url(#'+gR+')',opacity:0.85});
  s+=el('path',{d:'M16 70 L26 60 L28 72 Z',fill:'#E8264F',stroke:'#4A0818','stroke-width':0.9});
  s+=el('path',{d:'M84 70 L74 60 L72 72 Z',fill:'#E8264F',stroke:'#4A0818','stroke-width':0.9});
  s+=el('path',{d:'M16 70 L26 60 L28 72 Z',fill:'url(#'+gL+')',opacity:0.5});
  s+=el('path',{d:'M84 70 L74 60 L72 72 Z',fill:'url(#'+gL+')',opacity:0.5});
  s+=el('path',{d:'M22 80 L78 80 L70 86 L30 86 Z',fill:'#C8204A'});
  s+=el('circle',{cx:50,cy:82,r:3.5,fill:'#FFD23A',stroke:'#6B0620','stroke-width':0.8});
  return s;
});

register('candy_bomb',function(){
  var uid=nid('cb');
  var gA=uid+'A',gE=uid+'E',gR=uid+'R',gD=uid+'D';
  var s='<defs>';
  s+=rg(gA,'34%','28%','62%',[[0,'#FFFFFF'],[0.18,'#FFE066'],[0.5,'#FF8A1E'],[0.82,'#C24000'],[1,'#5A1200']]);
  s+=rg(gE,'30%','24%','32%',[[0,'#FFFFFF',0.98],[0.55,'#FFFFFF',0.3],[1,'#FFFFFF',0]]);
  s+=lg(gR,'76%','28%','98%','86%',[[0,'#FFFFFF',0],[0.55,'#FFFFFF',0.35],[1,'#FFFFFF',0.06]]);
  s+=rg(gD,'50%','92%','46%',[[0,'#2A0000',0.55],[1,'#2A0000',0]]);
  s+='</defs>';
  s+=el('circle',{cx:50,cy:58,r:34,fill:'url(#'+gD+')'});
  s+=el('circle',{cx:50,cy:56,r:33,fill:'#2A0A14'});
  s+=el('circle',{cx:50,cy:55,r:32,fill:'url(#'+gA+')'});
  s+=el('circle',{cx:50,cy:55,r:32,fill:'url(#'+gR+')'});
  s+=el('circle',{cx:50,cy:55,r:32,fill:'none',stroke:'#3A0000','stroke-width':1.1});
  s+=el('circle',{cx:50,cy:55,r:29,fill:'none',stroke:'#FFD080','stroke-width':0.6,opacity:0.5});
  s+='<path d="M64 24 Q68 14 62 6 Q74 8 76 18 Q78 26 72 32" stroke="#7A3A00" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  s+='<path d="M64 24 Q68 14 62 6 Q74 8 76 18 Q78 26 72 32" stroke="#FFD23A" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/>';
  s+=el('circle',{cx:74,cy:22,r:5,fill:'#FF3A1A',opacity:0.55});
  s+=el('circle',{cx:74,cy:22,r:3.8,fill:'#FFD23A'});
  s+=el('circle',{cx:75,cy:21,r:1.6,fill:'#FFFFFF',opacity:0.95});
  s+=el('ellipse',{cx:34,cy:38,rx:12,ry:8.5,fill:'url(#'+gE+')',transform:'rotate(-30 34 38)'});
  s+=el('ellipse',{cx:36,cy:39,rx:5.5,ry:3.4,fill:'#FFFFFF',opacity:0.98,transform:'rotate(-30 36 39)'});
  s+=el('ellipse',{cx:30,cy:33,rx:2.4,ry:1.3,fill:'#FFFFFF',opacity:0.9,transform:'rotate(-30 30 33)'});
  s+=el('ellipse',{cx:60,cy:74,rx:11,ry:3.6,fill:'#2A0000',opacity:0.5,transform:'rotate(-18 60 74)'});
  return s;
});
window.ApexSRSymbolsV3=Object.freeze({
  get:get,render:render,register:register,
  has:function(id){return !!BUILDERS[id];},
  list:function(){return Object.keys(BUILDERS);},
  _el:el,_lg:lg,_rg:rg,_gloss:gloss,_shadow:shadow,_nid:nid
});
})();
