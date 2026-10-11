(function(){
'use strict';
var KEY='apex.sr.settings.v2';
var D={sound:true,music:0.7,sfx:0.8,haptic:true,fast:false,anim:true};
var S=null,root=null,body=null;
var T={sound:'\u97f3\u6548',music:'\u97f3\u4e50\u97f3\u91cf',sfx:'\u97f3\u6548\u97f3\u91cf',haptic:'\u9707\u52a8\u53cd\u9988',fast:'\u6781\u901f\u6a21\u5f0f',anim:'\u52a8\u753b\u6548\u679c'};
function load(){
  try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);for(var k in D)if(k in o)D[k]=o[k];}}catch(e){}
  S=D;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  if(window.ApexSRSettingsBus)window.ApexSRSettingsBus.emit(S);
  if(window.ApexAudioBridge&&window.ApexAudioBridge.setVolume)window.ApexAudioBridge.setVolume(S.sfx);
}
function buildSwitch(k){
  var b=document.createElement('button');b.type='button';b.className='sr-set-switch';
  b.setAttribute('role','switch');b.setAttribute('aria-checked',S[k]?'true':'false');
  b.setAttribute('aria-label',T[k]);
  var kn=document.createElement('span');kn.className='sr-set-knob';b.appendChild(kn);
  b.addEventListener('click',function(){
    S[k]=!S[k];b.setAttribute('aria-checked',S[k]?'true':'false');save();
  });
  return b;
}
function buildSlider(k){
  var i=document.createElement('input');i.type='range';i.min='0';i.max='1';i.step='0.05';
  i.value=String(S[k]);i.className='sr-set-slider';i.setAttribute('aria-label',T[k]);
  i.addEventListener('input',function(){S[k]=parseFloat(i.value);save();});
  return i;
}
function row(k,kind){
  var d=document.createElement('div');d.className='sr-set-row';
  var l=document.createElement('span');l.className='sr-set-label';l.textContent=T[k];
  d.appendChild(l);d.appendChild(kind==='slider'?buildSlider(k):buildSwitch(k));
  return d;
}
function buildBody(){
  var f=document.createDocumentFragment();
  f.appendChild(row('sound','switch'));
  f.appendChild(row('music','slider'));
  f.appendChild(row('sfx','slider'));
  f.appendChild(row('haptic','switch'));
  f.appendChild(row('fast','switch'));
  f.appendChild(row('anim','switch'));
  var ab=document.createElement('div');ab.className='sr-about';
  ab.innerHTML='<b>\u7248\u672c</b> 1.0.0<br><b>\u7b26\u53f7</b> 9';
  f.appendChild(ab);return f;
}
function ensure(){
  if(root)return true;
  root=document.createElement('div');root.className='sr-sheet-root';root.hidden=true;
  var bd=document.createElement('div');bd.className='sr-sheet-backdrop';
  var sh=document.createElement('div');sh.className='sr-sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');
  var hd=document.createElement('div');hd.className='sr-sheet-handle';
  var hh=document.createElement('header');hh.className='sr-sheet-header';
  var tt=document.createElement('h2');tt.className='sr-sheet-title';tt.textContent='\u6e38\u620f\u8bbe\u7f6e';hh.appendChild(tt);
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
  body.innerHTML='';body.appendChild(buildBody());
  root.hidden=false;void root.offsetWidth;root.classList.add('is-open');
}
function close(){
  if(root.hidden)return;
  root.classList.remove('is-open');
  setTimeout(function(){root.hidden=true;},300);
}
function get(k){load();return S[k];}
window.ApexSRSettings=Object.freeze({open:open,close:close,get:get,all:function(){load();return JSON.parse(JSON.stringify(S));}});
})();
