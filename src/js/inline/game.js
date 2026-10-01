/* Apex · 游戏详情页 */
(function(){
'use strict';

var GAMES = {
  'lucky-fruit': {
    name: '幸运水果机',
    sub: '经典老虎机 · 三轴转轮',
    images: [],  // 后期后台可上传；现在留空显示占位
    intro: '幸运水果机是一款经典的三轴老虎机游戏。玩法简单直观、节奏明快，玩家选择下注金额后点击开始，三个转轴同时转动，停止时若三个图标一致即为中奖，适合所有玩家快速上手。',
    rules: [
      '选择下注金额（单注 1 / 5 / 10 / 50 / 100）',
      '点击「开始游戏」启动三个转轴',
      '三个转轴依次停止，每个转轴随机显示一个图案',
      '三个图案完全相同时，按赔付表获得对应倍数奖励',
      '若三个图案不同，则本局未中奖，下注金额不予退还'
    ],
    prizes: [
      { icon: '🍒', mult: '×10' },
      { icon: '🍋', mult: '×25' },
      { icon: '7️⃣', mult: '×100' }
    ],
    paytable: [
      { combo: '🍒 🍒 🍒', mult: '×10' },
      { combo: '🍋 🍋 🍋', mult: '×25' },
      { combo: '🔔 🔔 🔔', mult: '×50' },
      { combo: '7️⃣ 7️⃣ 7️⃣', mult: '×100' }
    ],
    info: {
      '游戏类型': '经典老虎机',
      '游戏模式': '单人游戏',
      '游戏版本': 'V1.0',
      '上线日期': '2026-10-01',
      '赔付方式': '即时到账',
      '最低下注': '1',
      '最高下注': '100',
      '最大倍数': '×100'
    }
  }
};

function getParam(n) {
  var m = location.search.match(new RegExp('[?&]' + n + '=([^&]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

var id = getParam('id') || 'lucky-fruit';
var g = GAMES[id];

function notFound() {
  document.getElementById('gm-name').textContent = '游戏不存在';
  document.getElementById('gm-sub').textContent = '';
  document.getElementById('gm-intro').textContent = '未找到该游戏，请返回首页重新选择。';
}

function renderCarousel() {
  var track = document.getElementById('gm-carousel-track');
  var dots = document.getElementById('gm-carousel-dots');
  if (!track || !dots) return;
  var imgs = g.images && g.images.length ? g.images : [null, null, null];
  track.innerHTML = imgs.map(function(src){
    if (src) return '<div class="gm-carousel-slide"><img src="' + esc(src) + '" alt=""></div>';
    return '<div class="gm-carousel-slide"><div class="gm-slide-ph"><i class="ri-image-line" aria-hidden="true"></i><span>游戏画面</span></div></div>';
  }).join('');
  dots.innerHTML = imgs.map(function(_, i){
    return '<button type="button" class="gm-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" aria-label="' + (i+1) + '"></button>';
  }).join('');
  var dotEls = dots.querySelectorAll('.gm-dot');
  var n = imgs.length, cur = 0;
  function setA(i) { for (var k = 0; k < dotEls.length; k++) dotEls[k].classList.toggle('active', k === i); }
  function goto(i) { track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }); cur = i; setA(i); }
  // 自动轮播
  var timer = setInterval(function(){
    if (document.hidden) return;
    goto((cur + 1) % n);
  }, 3500);
  // 手动滑动时暂停 6s
  var paused = false;
  function pause() { paused = true; setTimeout(function(){ paused = false; }, 6000); }
  track.addEventListener('pointerdown', pause, { passive: true });
  track.addEventListener('touchstart', pause, { passive: true });
  var ticking = false;
  track.addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var w = track.clientWidth; if (!w) return;
      var i = Math.round(track.scrollLeft / w);
      if (i < 0) i = 0; if (i > n - 1) i = n - 1;
      if (i !== cur) { cur = i; setA(i); }
    });
  }, { passive: true });
  dots.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.gm-dot') : null;
    if (!b) return;
    var i = parseInt(b.getAttribute('data-idx'), 10) || 0;
    goto(i); pause();
  });
}

function render() {
  document.title = g.name + ' · Apex';
  document.getElementById('gm-top-title').textContent = g.name;
  document.getElementById('gm-name').textContent = g.name;
  document.getElementById('gm-sub').textContent = g.sub;
  document.getElementById('gm-intro').textContent = g.intro;
  document.getElementById('gm-rules').innerHTML = g.rules.map(function(r){ return '<li>' + esc(r) + '</li>'; }).join('');
  document.getElementById('gm-prizes').innerHTML = g.prizes.map(function(p){
    return '<div class="gm-prize"><div class="gm-prize-icon">' + p.icon + '</div><div class="gm-prize-mult">' + esc(p.mult) + '</div></div>';
  }).join('');
  document.getElementById('gm-paytable').innerHTML = g.paytable.map(function(p){
    return '<tr><td class="gm-combo">' + p.combo + '</td><td>' + esc(p.mult) + '</td></tr>';
  }).join('');
  var infoHtml = '';
  for (var k in g.info) { if (g.info.hasOwnProperty(k)) infoHtml += '<dt>' + esc(k) + '</dt><dd>' + esc(g.info[k]) + '</dd>'; }
  document.getElementById('gm-info').innerHTML = infoHtml;
  renderCarousel();
}

/* 收藏（金色星星） */
var FAV_KEY = 'apex_fav_games';
function loadFav(){ try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(e){ return []; } }
function saveFav(a){ try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch(e){} }
function isFav(){ return loadFav().indexOf(id) !== -1; }
function updateFavUI(){
  var b = document.getElementById('gm-fav'); if (!b) return;
  var i = b.querySelector('i');
  if (isFav()) { b.classList.add('active'); i.className = 'ri-star-fill'; }
  else { b.classList.remove('active'); i.className = 'ri-star-line'; }
}

function bindEvents() {
  document.getElementById('gm-fav').addEventListener('click', function(){
    var arr = loadFav(); var idx = arr.indexOf(id);
    if (idx === -1) arr.push(id); else arr.splice(idx, 1);
    saveFav(arr); updateFavUI();
  });
  document.getElementById('gm-support').addEventListener('click', function(){ alert('客服功能开发中'); });
  document.getElementById('gm-demo').addEventListener('click', function(){ alert('试玩功能开发中'); });
  document.getElementById('gm-start').addEventListener('click', function(){ alert('游戏引擎开发中'); });
  document.getElementById('gm-more').addEventListener('click', function(){ alert('更多操作开发中'); });
}

if (!g) { notFound(); } else { render(); bindEvents(); updateFavUI(); }

})();
