(function(){
'use strict';
var APP_ID='apex-app',LANG_KEY='apex_lang_v1';
var LANGS=[{c:'zh-CN',f:'\uD83C\uDDE8\uD83C\uDDF3',n:'\u7B80\u4F53\u4E2D\u6587'},{c:'zh-TW',f:'\uD83C\uDDED\uD83C\uDDF0',n:'\u7E41\u9AD4\u4E2D\u6587'},{c:'en',f:'\uD83C\uDDFA\uD83C\uDDF8',n:'English'},{c:'ja',f:'\uD83C\uDDEF\uD83C\uDDF5',n:'\u65E5\u672C\u8A9E'},{c:'ko',f:'\uD83C\uDDF0\uD83C\uDDF7',n:'\uD55C\uAD6D\uC5B4'},{c:'es',f:'\uD83C\uDDEA\uD83C\uDDF8',n:'Espa\u00F1ol'},{c:'fr',f:'\uD83C\uDDEB\uD83C\uDDF7',n:'Fran\u00E7ais'},{c:'de',f:'\uD83C\uDDE9\uD83C\uDDEA',n:'Deutsch'}];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function resolveLang(){
  var saved=null;try{saved=localStorage.getItem(LANG_KEY);}catch(e){}
  if(saved){var h=LANGS.filter(function(l){return l.c===saved;})[0];if(h)return h;}
  var nav=String(navigator.language||'en');
  return LANGS.filter(function(l){return l.c===nav;})[0]||LANGS.filter(function(l){return l.c.toLowerCase().split('-')[0]===nav.split('-')[0].toLowerCase();})[0]||LANGS[2];
}
function saveLang(c){try{localStorage.setItem(LANG_KEY,c);}catch(e){}}
function langMenuHTML(cur){
  return LANGS.map(function(l){
    var a=l.c===cur;
    return '<button type="button" role="menuitem" class="apex-lang-item'+(a?' active':'')+'" data-lang="'+l.c+'"><span class="apex-flag" aria-hidden="true">'+l.f+'</span><span class="apex-lang-item-label">'+l.n+'</span>'+(a?'<i class="ri-check-line apex-check" aria-hidden="true"></i>':'')+'</button>';
  }).join('');
}
function shellHTML(user){
  var lang=resolveLang();
  var name=(user&&user.username)?String(user.username):'';
  var hi=name?('\u4F60\u597D\uFF0C'+esc(name)):'\u4F60\u597D';
  return '<header class="apex-topbar"><div class="apex-topbar-inner"><div class="apex-search" role="search"><i class="ri-search-line" aria-hidden="true"></i><input type="search" id="apex-search-input" placeholder="\u641C\u7D22\u6E38\u620F\u3001\u6D3B\u52A8\u3001\u5185\u5BB9..." aria-label="\u641C\u7D22" autocomplete="off"><kbd class="apex-search-kbd" aria-hidden="true">\u2318K</kbd></div><div class="apex-actions"><button type="button" class="apex-icon-btn" id="apex-notif-btn" aria-label="\u901A\u77E5"><i class="ri-notification-3-line" aria-hidden="true"></i></button><div class="apex-lang-wrap"><button type="button" class="apex-lang-btn" id="apex-lang-btn" aria-haspopup="menu" aria-expanded="false"><span class="apex-flag" aria-hidden="true">'+lang.f+'</span><span class="apex-lang-label">'+lang.n+'</span><i class="ri-arrow-down-s-line" aria-hidden="true"></i></button><div class="apex-lang-menu" id="apex-lang-menu" role="menu">'+langMenuHTML(lang.c)+'</div></div></div></div></header><main class="apex-main"><div class="apex-main-inner"><section class="apex-welcome-card"><div class="apex-welcome-hi">'+hi+'</div><h1 class="apex-welcome-title">\u6B22\u8FCE\u56DE\u5230 Apex</h1><p class="apex-welcome-sub">\u5168\u7403\u5A31\u4E50\u6E38\u620F\u5E73\u53F0</p></section></div></main>';
}
function initLang(app){
  var btn=app.querySelector('#apex-lang-btn'),menu=app.querySelector('#apex-lang-menu');
  if(!btn||!menu)return;
  function toggle(v){menu.classList.toggle('open',v);btn.setAttribute('aria-expanded',v?'true':'false');}
  btn.addEventListener('click',function(e){e.stopPropagation();toggle(!menu.classList.contains('open'));});
  document.addEventListener('click',function(e){if(!btn.contains(e.target)&&!menu.contains(e.target))toggle(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open')){toggle(false);try{btn.focus();}catch(e2){}}});
  menu.addEventListener('click',function(e){
    var it=e.target.closest?e.target.closest('.apex-lang-item'):null;if(!it)return;
    var code=it.getAttribute('data-lang'),lang=LANGS.filter(function(l){return l.c===code;})[0];if(!lang)return;
    saveLang(code);
    btn.querySelector('.apex-flag').textContent=lang.f;
    btn.querySelector('.apex-lang-label').textContent=lang.n;
    menu.querySelectorAll('.apex-lang-item').forEach(function(x){
      var a=x.getAttribute('data-lang')===code;x.classList.toggle('active',a);
      var ck=x.querySelector('.apex-check');
      if(a&&!ck){var i=document.createElement('i');i.className='ri-check-line apex-check';i.setAttribute('aria-hidden','true');x.appendChild(i);}
      else if(!a&&ck){ck.remove();}
    });
    toggle(false);
    try{window.dispatchEvent(new CustomEvent('apex:language-changed',{detail:{code:code,lang:lang}}));}catch(e2){}
  });
}
function initNotif(app){
  var b=app.querySelector('#apex-notif-btn');if(!b)return;
  b.addEventListener('click',function(){
    var bd=b.querySelector('.apex-badge');if(!bd)return;
    bd.style.transition='transform .22s cubic-bezier(.4,0,.2,1),opacity .22s ease';
    bd.style.transform='scale(.4)';bd.style.opacity='0';
    setTimeout(function(){if(bd.parentNode)bd.parentNode.removeChild(bd);},260);
  });
}
function initSearch(app){
  var inp=app.querySelector('#apex-search-input');if(!inp)return;
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){var q=inp.value.trim();if(!q)return;try{window.dispatchEvent(new CustomEvent('apex:search',{detail:{query:q}}));}catch(e2){}}
  });
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();try{inp.focus();inp.select();}catch(e2){}}
  });
}
function show(user){
  var app=document.getElementById(APP_ID);
  if(!app){
    app=document.createElement('div');app.id=APP_ID;app.className='apex-app';
    app.innerHTML=shellHTML(user);
    document.body.appendChild(app);
    initLang(app);initNotif(app);initSearch(app);
  }
  var hi=app.querySelector('.apex-welcome-hi');
  if(hi&&user&&user.username)hi.textContent='\u4F60\u597D\uFF0C'+user.username;
  app.classList.add('show');
}
function hide(){var a=document.getElementById(APP_ID);if(a)a.classList.remove('show');}
window.__apexApp={show:show,hide:hide,LANGS:LANGS};
})();
