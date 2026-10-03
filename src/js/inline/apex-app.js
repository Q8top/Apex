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
  return '<header class="apex-topbar"><div class="apex-topbar-inner"><div class="apex-search" role="search"><i class="ri-search-line" aria-hidden="true"></i><input type="search" id="apex-search-input" placeholder="\u641C\u7D22\u5185\u5BB9" aria-label="\u641C\u7D22" autocomplete="off"><kbd class="apex-search-kbd" aria-hidden="true">\u2318K</kbd></div><div class="apex-actions"><button type="button" class="apex-icon-btn apex-notif-btn" id="apex-notif-btn" aria-label="通知"><i class="ri-notification-4-line" aria-hidden="true"></i><span class="apex-notif-label">通知</span></button><div class="apex-lang-wrap"><button type="button" class="apex-lang-btn" id="apex-lang-btn" aria-haspopup="menu" aria-expanded="false"><span class="apex-flag" aria-hidden="true">'+lang.f+'</span><span class="apex-lang-label">'+lang.n+'</span><i class="ri-arrow-down-s-line" aria-hidden="true"></i></button><div class="apex-lang-menu" id="apex-lang-menu" role="menu">'+langMenuHTML(lang.c)+'</div></div></div></div></header><main class="apex-main"><div class="apex-main-inner"><div class="apex-carousel" id="apex-carousel"><div class="apex-carousel-track" id="apex-carousel-track"></div><div class="apex-carousel-dots" id="apex-carousel-dots" role="tablist"></div></div><div class="apex-announce" id="apex-announce"><span class="apex-announce-icon"><i class="ri-megaphone-line" aria-hidden="true"></i></span><span class="apex-announce-label">公告</span><div class="apex-announce-view" id="apex-announce-view"></div></div></div></main>';
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
    mountTabbar(app);
    initLang(app);initNotif(app);initSearch(app);initCarousel(app);initAnnounce(app);initTabbar(app);
  }
  var hi=app.querySelector('.apex-welcome-hi');
  if(hi&&user&&user.username)hi.textContent='\u4F60\u597D\uFF0C'+user.username;
  try{localStorage.setItem('apex_auth_hint','1');}catch(e){}
  try{document.documentElement.classList.add('apex-auth-hint');}catch(e){}
  app.classList.add('show');
}
function initCarousel(app){
  var t=app.querySelector('#apex-carousel-track'),d=app.querySelector('#apex-carousel-dots');
  if(!t||!d)return;
  var S=[
    {a:'WELCOME',b:'\u6B22\u8FCE\u56DE\u5230 Apex',c:'\u5168\u7403\u5A31\u4E50\u6E38\u620F\u5E73\u53F0 \u00B7 \u4E00\u7AD9\u5F0F\u4F53\u9A8C'},
    {a:'NEW',b:'\u66F4\u591A\u73A9\u6CD5\u5373\u5C06\u4E0A\u7EBF',c:'\u656C\u8BF7\u671F\u5F85\u5168\u65B0\u5A31\u4E50\u4F53\u9A8C'},
    {a:'NOTICE',b:'\u5B89\u5168\u63D0\u793A',c:'\u8BF7\u52FF\u5411\u4EFB\u4F55\u4EBA\u900F\u9732\u60A8\u7684\u8D26\u53F7\u5BC6\u7801'}
  ];
  t.innerHTML=S.map(function(s){return '<div class="apex-carousel-slide"><span class="apex-carousel-tag">'+s.a+'</span><h2 class="apex-carousel-title">'+s.b+'</h2><p class="apex-carousel-desc">'+s.c+'</p></div>';}).join('');
  d.innerHTML=S.map(function(_,i){return '<button type="button" class="apex-dot'+(i===0?' active':'')+'" data-idx="'+i+'" aria-label="'+(i+1)+'"></button>';}).join('');
  var dots=d.querySelectorAll('.apex-dot'),n=S.length,cur=0,AUTO=3500,PAUSE=6000;
  var timer=null,paused=false,pauseTimer=null;
  function setA(i){for(var k=0;k<dots.length;k++)dots[k].classList.toggle('active',k===i);}
  function goto(i){t.scrollTo({left:i*t.clientWidth,behavior:'smooth'});cur=i;setA(i);}
  function tick(){if(paused||document.hidden)return;goto((cur+1)%n);}
  function start(){stop();timer=setInterval(tick,AUTO);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function pauseTemporarily(){paused=true;if(pauseTimer)clearTimeout(pauseTimer);pauseTimer=setTimeout(function(){paused=false;},PAUSE);}
  start();
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else start();});
  t.addEventListener('pointerdown',pauseTemporarily,{passive:true});
  t.addEventListener('wheel',pauseTemporarily,{passive:true});
  t.addEventListener('touchstart',pauseTemporarily,{passive:true});
  var tick2=false;
  t.addEventListener('scroll',function(){
    if(tick2)return;tick2=true;
    requestAnimationFrame(function(){
      tick2=false;
      var w=t.clientWidth;if(!w)return;
      var i=Math.round(t.scrollLeft/w);
      if(i<0)i=0;if(i>n-1)i=n-1;
      if(i!==cur){cur=i;setA(i);}
    });
  },{passive:true});
  d.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.apex-dot'):null;
    if(!b)return;
    var i=parseInt(b.getAttribute('data-idx'),10)||0;
    goto(i);pauseTemporarily();
  });
}
function initAnnounce(app){
  var wrap=app.querySelector('#apex-announce');
  var v=app.querySelector('#apex-announce-view');
  if(!v||!wrap)return;
  // 数据结构：{ t: 时间字符串, c: 内容 }；将来后台接口只需返回同结构数组
  var M=[
    {t:'2026-10-01 15:00',c:'\u6B22\u8FCE\u6765\u5230 Apex\uFF0C\u795D\u60A8\u4F53\u9A8C\u6109\u5FEB\uFF01'},
    {t:'2026-09-30 18:20',c:'\u8BF7\u52FF\u5411\u4EFB\u4F55\u4EBA\u900F\u9732\u8D26\u53F7\u5BC6\u7801\u4E0E\u9A8C\u8BC1\u7801'},
    {t:'2026-09-28 10:00',c:'\u5E73\u53F0\u6B63\u5728\u6301\u7EED\u4F18\u5316\uFF0C\u611F\u8C22\u60A8\u7684\u652F\u6301'}
  ];
  window.__apexAnnouncements = M;
  var html=M.map(function(x,i){return '<span class="apex-announce-text">'+(i+1)+'. '+x.c+'</span>';}).join('');
  v.innerHTML='<div class="apex-announce-marquee" id="apex-announce-marquee">'+html+html+'</div>';
  var el=v.querySelector('#apex-announce-marquee');
  if(el){
    requestAnimationFrame(function(){
      var half=el.scrollWidth/2;if(!half)return;
      el.style.animationDuration=Math.max(14,Math.round(half/55))+'s';
    });
  }
  wrap.addEventListener('click',function(e){
    if(e.target.closest && e.target.closest('a'))return;
    location.href='/announcements.html';
  });
}
var APEX_GAMES={
  hot:[
    {id:'lucky-fruit',n:'\u5E78\u8FD0\u6C34\u679C\u673A',i:'ri-leaf-fill',c:'#b85050',img:'/assets/games/lucky-fruit.svg'},
    {id:'olympus',n:'\u5965\u6797\u5339\u65AF\u4E4B\u95E8',i:'ri-flashlight-fill',c:'#6a3fa8',img:'/assets/games/olympus.svg'},
    {id:'sweet',n:'\u751C\u871C\u871C',i:'ri-heart-3-fill',c:'#d63b8a',img:'/assets/games/sweet.svg'},
    {id:'sugar',n:'\u7CD6\u679C\u72C2\u6B22',i:'ri-leaf-fill',c:'#ff4d94',img:'/assets/games/sugar.svg'},
    {id:'starlight',n:'\u661F\u5149\u516C\u4E3B',i:'ri-star-fill',c:'#c54f9a',img:'/assets/games/starlight.svg'},
    {id:'bigbass',n:'\u5927\u9C7C\u5927\u4EA8',i:'ri-anchor-fill',c:'#2a6da8',img:'/assets/games/bigbass.svg'},
    {id:'aviator',n:'\u98DE\u884C\u5458',i:'ri-flight-takeoff-fill',c:'#e5484d',img:'/assets/games/aviator.svg'},
    {id:'crash',n:'\u5D29\u76D8',i:'ri-line-chart-fill',c:'#3a9a58',img:'/assets/games/crash.svg'},
    {id:'jetx',n:'\u55B7\u6C14\u673A',i:'ri-rocket-2-fill',c:'#a05ee0',img:'/assets/games/jetx.svg'},
    {id:'blackjack',n:'\u0032\u0031\u70B9',i:'ri-layout-grid-line',c:'#0a5a2a',img:'/assets/games/blackjack.svg'},
    {id:'roulette-euro',n:'\u6B27\u6D32\u8F6E\u76D8',i:'ri-loader-4-line',c:'#c82828',img:'/assets/games/roulette-euro.svg'},
    {id:'roulette-amer',n:'\u7F8E\u5F0F\u8F6E\u76D8',i:'ri-loader-4-line',c:'#8a6a18',img:'/assets/games/roulette-amer.svg'}
  ],
  slot:[
    {id:'1001-mg',n:'1001\u7CBE\u7075',i:'ri-magic-line',c:'#6a2f9a',img:'/assets/games/1001-mg.svg'},
    {id:'1001-mg2',n:'1001\u7CBE\u70752',i:'ri-gamepad-line',c:'#9a2f6a',img:'/assets/games/1001-mg2.svg'},
    {id:'10001-nights',n:'\u4E00\u4E07\u96F6\u4E00\u591C',i:'ri-gamepad-line',c:'#1a4a7a',img:'/assets/games/10001-nights.svg'},
    {id:'10001-mega',n:'\u4E00\u4E07\u96F6\u4E00\u591CMega',i:'ri-gamepad-line',c:'#c9481f',img:'/assets/games/10001-mega.svg'},
    {id:'1429-seas',n:'1429\u6D77\u57DF',i:'ri-gamepad-line',c:'#0a6a7a',img:'/assets/games/1429-seas.svg'},
    {id:'5-lions',n:'\u4E94\u72EE',i:'ri-gamepad-line',c:'#a85a1f',img:'/assets/games/5-lions.svg'},
    {id:'5-lions-gold',n:'\u4E94\u72EE\u9EC4\u91D1',i:'ri-gamepad-line',c:'#c9a227',img:'/assets/games/5-lions-gold.svg'},
    {id:'5-lions-mega',n:'\u4E94\u72EEMega',i:'ri-gamepad-line',c:'#7a2f1f',img:'/assets/games/5-lions-mega.svg'},
    {id:'arabian-nights',n:'\u4E00\u5343\u96F6\u4E00\u591C',i:'ri-gamepad-line',c:'#6a2a8a',img:'/assets/games/arabian-nights.svg'},
    {id:'asgardian',n:'\u963F\u65AF\u52A0\u5FB7',i:'ri-gamepad-line',c:'#2a3a8a',img:'/assets/games/asgardian.svg'},
    {id:'aces-eights',n:'A\u4E0E8',i:'ri-gamepad-line',c:'#1a1a1a',img:'/assets/games/aces-eights.svg'},
    {id:'fengshui',n:'\u98CE\u6C34\u70BC\u91D1',i:'ri-gamepad-line',c:'#1a6a3a',img:'/assets/games/fengshui.svg'}
  ]
};
function renderGames(box,catKey){
  var list=APEX_GAMES[catKey]||[];
  if(!list.length){box.innerHTML='';return;}
  var html='<div class="apex-game-grid">'+list.map(function(g){
    var inner=(g.img)?('<img class="apex-game-img" src="'+g.img+'" alt="'+g.n+'" loading="lazy">'):('<i class="'+g.i+'" aria-hidden="true"></i>');
    return '<div class="apex-game-card" data-game="'+g.id+'">'+
      '<div class="apex-game-cover" style="--c1:'+g.c+'">'+inner+'</div>'+
      '<div class="apex-game-name">'+g.n+'</div>'+
      '</div>';
  }).join('')+'</div>';
  if(catKey==='hot'||catKey==='slot'){
    html+='<button type="button" class="apex-more-games-btn" id="apex-more-games-btn" data-cat-src="'+catKey+'"><span>'+(catKey==='slot'?'更多电子游戏':'更多热门游戏')+'</span><i class="ri-arrow-right-line" aria-hidden="true"></i></button>';
  }
  box.innerHTML=html;
  if(!box.dataset.clickBound){
    box.dataset.clickBound='1';
    box.addEventListener('click',function(e){
      var c=e.target.closest?e.target.closest('.apex-game-card'):null;
      if(!c)return;
      var gid=c.getAttribute('data-game');
      if(gid)location.href='/game.html?id='+encodeURIComponent(gid);
    });
  }
}
function makeCats(){
  var CATS=[
    {k:'hot',   l:'\u70ED\u95E8\u6E38\u620F', i:'ri-fire-line'},
    {k:'slot',  l:'\u7535\u5B50\u6E38\u620F', i:'ri-gamepad-line'},
    {k:'roul',  l:'\u8F6E\u76D8\u6E38\u620F', i:'ri-loader-4-line'},
    {k:'card',  l:'\u7EB8\u724C\u6E38\u620F', i:'ri-file-list-3-line'},
    {k:'poker', l:'\u6251\u514B\u6E38\u620F', i:'ri-heart-3-line'},
    {k:'lott',  l:'\u5F69\u7968\u6E38\u620F', i:'ri-ticket-2-line'},
    {k:'bingo', l:'\u5BBE\u679C\u6E38\u620F', i:'ri-layout-grid-line'},
    {k:'sport', l:'\u4F53\u80B2\u6295\u6CE8', i:'ri-basketball-line'},
    {k:'virt',  l:'\u865A\u62DF\u8D5B\u4E8B', i:'ri-trophy-line'},
    {k:'mult',  l:'\u500D\u6570\u6E38\u620F', i:'ri-percent-line'},
    {k:'spec',  l:'\u7279\u8272\u73A9\u6CD5', i:'ri-star-line'}
  ];
  var wrap=document.createElement('div');
  wrap.className='apex-cats';
  var side=document.createElement('aside');
  side.className='apex-cats-sidebar';
  side.innerHTML=CATS.map(function(c,i){
    return '<button type="button" class="apex-cat-item'+(i===0?' active':'')+'" data-cat="'+c.k+'">'+
      '<i class="'+c.i+'" aria-hidden="true"></i>'+
      '<span>'+c.l+'</span>'+
      '</button>';
  }).join('');
  var content=document.createElement('section');
  content.className='apex-cats-content';
  content.setAttribute('data-cat-content',CATS[0].k);
  renderGames(content,CATS[0].k);
  wrap.appendChild(side);
  wrap.appendChild(content);
  side.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.apex-cat-item'):null;
    if(!b)return;
    var k=b.getAttribute('data-cat');
    side.querySelectorAll('.apex-cat-item').forEach(function(x){x.classList.toggle('active',x===b);});
    content.setAttribute('data-cat-content',k);
    renderGames(content,k);
    try{window.dispatchEvent(new CustomEvent('apex:cat-changed',{detail:{cat:k}}));}catch(e2){}
  });
  return wrap;
}
function mountTabbar(app){
  var main=app.querySelector('.apex-main');
  if(!main)return;
  var inner=main.querySelector('.apex-main-inner');
  if(!inner)return;
  var home=document.createElement('div');
  home.className='apex-pane active';
  home.setAttribute('data-pane','home');
  inner.parentNode.removeChild(inner);
  home.appendChild(inner);
  home.appendChild(makeCats());
  main.appendChild(home);
  var PANES=[
    {k:'activity',i:'ri-gift-line',t:'\u6D3B\u52A8\u529F\u80FD\u5373\u5C06\u4E0A\u7EBF'},
    {k:'asset',i:'ri-wallet-3-line',t:'\u8D44\u4EA7\u529F\u80FD\u5373\u5C06\u4E0A\u7EBF'},
    {k:'more',i:'ri-apps-2-line',t:'\u66F4\u591A\u529F\u80FD\u5373\u5C06\u4E0A\u7EBF'},
    {k:'mine',i:'ri-user-3-line',t:'\u4E2A\u4EBA\u4E2D\u5FC3\u5373\u5C06\u4E0A\u7EBF'}
  ];
  PANES.forEach(function(p){
    var el=document.createElement('div');
    el.className='apex-pane';el.setAttribute('data-pane',p.k);
    el.innerHTML='<div class="apex-placeholder"><i class="'+p.i+'" aria-hidden="true"></i><p>'+p.t+'</p></div>';
    main.appendChild(el);
  });
  var TABS=[
    {k:'home',l:'\u9996\u9875',li:'ri-home-5-line',fi:'ri-home-5-fill'},
    {k:'activity',l:'\u6D3B\u52A8',li:'ri-gift-line',fi:'ri-gift-fill'},
    {k:'asset',l:'\u8D44\u4EA7',li:'ri-wallet-3-line',fi:'ri-wallet-3-fill'},
    {k:'more',l:'\u66F4\u591A',li:'ri-apps-2-line',fi:'ri-apps-2-fill'},
    {k:'mine',l:'\u6211\u7684',li:'ri-user-3-line',fi:'ri-user-3-fill'}
  ];
  var nav=document.createElement('nav');
  nav.className='apex-tabbar';
  nav.setAttribute('role','tablist');
  nav.innerHTML=TABS.map(function(t,i){
    return '<button type="button" class="apex-tab'+(i===0?' active':'')+'" role="tab" data-tab="'+t.k+'">'+
      '<i class="'+t.li+'" aria-hidden="true"></i>'+
      '<i class="'+t.fi+'" aria-hidden="true"></i>'+
      '<span class="apex-tab-label">'+t.l+'</span>'+
      '</button>';
  }).join('');
  app.appendChild(nav);
}
function initTabbar(app){
  var nav=app.querySelector('.apex-tabbar');
  if(!nav)return;
  var main=app.querySelector('.apex-main');
  nav.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.apex-tab'):null;
    if(!b)return;
    var k=b.getAttribute('data-tab');
    nav.querySelectorAll('.apex-tab').forEach(function(x){x.classList.toggle('active',x===b);});
    main.querySelectorAll('.apex-pane').forEach(function(p){p.classList.toggle('active',p.getAttribute('data-pane')===k);});
    main.scrollTop=0;
    try{window.dispatchEvent(new CustomEvent('apex:tab-changed',{detail:{tab:k}}));}catch(e2){}
  });
}
function hide(){var a=document.getElementById(APP_ID);if(a)a.classList.remove('show');try{localStorage.removeItem('apex_auth_hint');}catch(e){}try{document.documentElement.classList.remove('apex-auth-hint');}catch(e){}}
window.__apexApp={show:show,hide:hide,LANGS:LANGS};

if(typeof ApexLoader!=="undefined"){try{ApexLoader.hide();}catch(e){}}

/* ===== 全屏"全部游戏"弹窗 ===== */
function buildAllGamesHTML(cat){
  var all = APEX_GAMES[cat||'hot'] || [];
  var grid = '<div class="apex-all-games-grid">';
  grid += all.map(function(g){
    var inner = (g.img) ? ('<img class="apex-game-img" src="'+g.img+'" alt="'+g.n+'" loading="lazy">') : ('<i class="'+g.i+'" aria-hidden="true"></i>');
    return '<div class="apex-all-games-card" data-game="'+g.id+'">' +
      '<div class="apex-game-cover" style="--c1:'+g.c+'">'+inner+'</div>' +
      '<div class="apex-game-name">'+g.n+'</div>' +
    '</div>';
  }).join('');
  grid += '</div>';
  return grid;
}

function initMoreGames(){
  if (document.getElementById('apex-all-games-modal')) return;

  var modal = document.createElement('div');
  modal.id = 'apex-all-games-modal';
  modal.className = 'apex-all-games-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML =
    '<div class="apex-all-games-mask"></div>' +
    '<div class="apex-all-games-box">' +
      '<div class="apex-all-games-head">' +
        '<div class="apex-all-games-title">全部游戏</div>' +
        '<button type="button" class="apex-all-games-x" aria-label="关闭">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="apex-all-games-body">' + buildAllGamesHTML() + '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var mask = modal.querySelector('.apex-all-games-mask');
  var xBtn = modal.querySelector('.apex-all-games-x');
  function close(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
  mask.addEventListener('click', close);
  xBtn.addEventListener('click', close);

  modal.querySelector('.apex-all-games-body').addEventListener('click', function(e){
    var c = e.target.closest ? e.target.closest('.apex-all-games-card') : null;
    if (!c) return;
    var gid = c.getAttribute('data-game');
    if (gid) location.href = '/game.html?id=' + encodeURIComponent(gid);
  });
}

document.addEventListener('click', function(e){
  var btn = e.target.closest ? e.target.closest('#apex-more-games-btn') : null;
  if (!btn) return;
  var cat = btn.getAttribute('data-cat-src') || 'hot';
  var modal = document.getElementById('apex-all-games-modal');
  if (!modal) { initMoreGames(cat); modal = document.getElementById('apex-all-games-modal'); }
  // 更新标题
  var title = modal.querySelector('.apex-all-games-title');
  if (title) title.textContent = cat === 'slot' ? '电子游戏' : '热门游戏';
  // 更新内容
  var body = modal.querySelector('.apex-all-games-body');
  if (body) body.innerHTML = buildAllGamesHTML(cat);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
});

})();
