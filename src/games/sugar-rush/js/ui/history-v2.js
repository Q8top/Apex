(function(){
'use strict';
var KEY='apex.sr.history.v2', MAX=50;
var root=null,body=null;
var items=[];
function load(){
  try{var r=localStorage.getItem(KEY);if(r)items=JSON.parse(r)||[];}catch(e){items=[];}
  if(!Array.isArray(items))items=[];
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)));}catch(e){}}
function push(rec){
  load();
  items.unshift({t:Date.now(),bet:rec.bet|0,win:rec.win|0,fs:!!rec.fs});
  if(items.length>MAX)items.length=MAX;
  save();
}
function clear(){items=[];save();}
function fmtMoney(minor){
  var v=(minor/100).toFixed(2);
  return '\u00a5'+v;
}
function fmtTime(ts){
  var d=new Date(ts);
  var p=function(n){return n<10?'0'+n:''+n;};
  return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
}
function buildSummary(){
  var sum={n:items.length,bet:0,win:0,wins:0};
  for(var i=0;i<items.length;i++){
    sum.bet+=items[i].bet;sum.win+=items[i].win;
    if(items[i].win>0)sum.wins++;
  }
  var wrap=document.createElement('div');wrap.className='sr-hist-summary';
  var cards=[
    ['\u603b\u5c40\u6570',String(sum.n)],
    ['\u4e2d\u5956\u6b21\u6570',String(sum.wins)],
    ['\u603b\u4e0b\u6ce8',fmtMoney(sum.bet)],
    ['\u603b\u4e2d\u5956',fmtMoney(sum.win)]
  ];
  for(var k=0;k<cards.length;k++){
    var c=document.createElement('div');c.className='sr-hist-card';
    var l=document.createElement('span');l.className='sr-hist-card-label';l.textContent=cards[k][0];
    var v=document.createElement('span');v.className='sr-hist-card-value';v.textContent=cards[k][1];
    c.appendChild(l);c.appendChild(v);wrap.appendChild(c);
  }
  return wrap;
}
function buildList(){
  var wrap=document.createElement('div');wrap.className='sr-hist-list';
  var h=document.createElement('h3');h.className='sr-hist-h';h.textContent='\u6700\u8fd1\u8bb0\u5f55';wrap.appendChild(h);
  if(!items.length){
    var e=document.createElement('div');e.className='sr-hist-empty';e.textContent='\u6682\u65e0\u8bb0\u5f55';
    wrap.appendChild(e);return wrap;
  }
  for(var i=0;i<items.length;i++){
    var it=items[i];
    var r=document.createElement('div');r.className='sr-hist-row';
    var left=document.createElement('div');
    var b=document.createElement('div');b.className='sr-hist-bet';b.textContent='\u4e0b\u6ce8 '+fmtMoney(it.bet);
    var m=document.createElement('div');m.className='sr-hist-meta';
    m.textContent=fmtTime(it.t)+' \u00b7 '+(it.fs?'FS \u00b7 ':'')+'\u4e2d\u5956 '+fmtMoney(it.win);
    left.appendChild(b);left.appendChild(m);
    var net=it.win-it.bet;
    var w=document.createElement('div');
    w.className='sr-hist-win '+(net>0?'pos':'neg');
    w.textContent=(net>0?'+':'')+fmtMoney(net);
    r.appendChild(left);r.appendChild(w);
    wrap.appendChild(r);
  }
  return wrap;
}
function ensure(){
  if(root)return true;
  root=document.createElement('div');root.className='sr-sheet-root';root.hidden=true;
  var bd=document.createElement('div');bd.className='sr-sheet-backdrop';
  var sh=document.createElement('div');sh.className='sr-sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');
  var hd=document.createElement('div');hd.className='sr-sheet-handle';
  var hh=document.createElement('header');hh.className='sr-sheet-header';
  var tt=document.createElement('h2');tt.className='sr-sheet-title';tt.textContent='\u6e38\u620f\u8bb0\u5f55';hh.appendChild(tt);
  body=document.createElement('div');body.className='sr-sheet-nav';
  sh.appendChild(hd);sh.appendChild(hh);sh.appendChild(body);
  root.appendChild(bd);root.appendChild(sh);
  (document.getElementById('sr-app')||document.body).appendChild(root);
  bd.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!root.hidden)close();});
  return true;
}
function open(){
  if(!ensure())return;load();
  body.innerHTML='';body.appendChild(buildSummary());body.appendChild(buildList());
  root.hidden=false;void root.offsetWidth;root.classList.add('is-open');
}
function close(){
  if(root.hidden)return;
  root.classList.remove('is-open');
  setTimeout(function(){root.hidden=true;},300);
}
load();
window.ApexSRHistory=Object.freeze({
  open:open,close:close,push:push,clear:clear,
  count:function(){load();return items.length;}
});
})();
