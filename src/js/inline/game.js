/* Apex · 游戏详情页 */
(function(){
'use strict';

/* ---------- 游戏路由 ---------- */
var GAME_ROUTES = {};
function currentGame() {
  var id = getParam('id') || '';
  return { id: id, route: GAME_ROUTES[id] || null };
}
/* 符号无 SVG 时的降级显示：彩色圆点 + 名字 */
var SYM_COLORS = {};
function fallbackSymbol(sym){
  var c = SYM_COLORS[sym] || '#888';
  return '<span class="gm-fallback-dot" style="background:'+c+'"></span>';
}

function getSymLib() {
  var r = currentGame().route;
  return window[r.symLib] || null;
}

/* ---------- 游戏数据 ---------- */
var GAMES = {};

/* ---------- 工具 ---------- */
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
  // 关键：即使游戏不存在，返回键也要能点
  var back = document.getElementById('gm-back');
  if (back) {
    back.addEventListener('click', function(e){
      e.preventDefault();
      // 优先 history.back()，失败则跳首页
      try { if (window.history.length > 1) history.back(); else location.replace('/'); }
      catch(err) { location.replace('/'); }
    });
  }
  // 隐藏无效按钮（免费试玩、开始游戏、收藏）
  ['gm-fav','gm-demo','gm-start','gm-support','gm-more'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) { el.disabled = true; el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }
  });
}

/* ---------- 轮播 ---------- */
function renderCarousel() {
  var track = document.getElementById('gm-carousel-track');
  var dots = document.getElementById('gm-carousel-dots');
  if (!track || !dots) return;
  var imgs = (g.images && g.images.length) ? g.images : [null, null, null];
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
  setInterval(function(){ if (document.hidden) return; goto((cur + 1) % n); }, 3500);
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

/* ---------- 渲染 ---------- */
function render() {
  document.title = g.name + ' · Apex';
  document.getElementById('gm-top-title').textContent = g.name;
  document.getElementById('gm-name').textContent = g.name;
  document.getElementById('gm-sub').textContent = g.sub;
  document.getElementById('gm-intro').textContent = g.intro;

  document.getElementById('gm-rules').innerHTML = g.rules.map(function(r){
    return '<li>' + esc(r) + '</li>';
  }).join('');

  var prizesEl = document.getElementById('gm-prizes');
  if (!g.prizes || !g.prizes.length) {
    prizesEl.innerHTML = '<p style="color:#999;font-size:13px;padding:8px 0;">本游戏不含固定赔付表，规则见上方说明。</p>';
  } else {
  prizesEl.innerHTML = g.prizes.map(function(pr){
    var lib = getSymLib();
    var svg = (lib && pr.symbol && lib[pr.symbol])
      ? '<span class="gm-sym-inline">' + lib[pr.symbol]() + '</span>'
      : (pr.icon || '');
    return '<div class="gm-prize"><div class="gm-prize-icon">' + svg + '</div>' +
      '<div class="gm-prize-mult">' + esc(pr.mult) + '</div></div>';
  }).join('');
  }

  var paytableEl = document.getElementById('gm-paytable');
  if (!g.paytable || !g.paytable.length) {
    paytableEl.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;font-size:13px;padding:12px 0;">本游戏不含固定赔付表，实时倍率由系统随机生成。</td></tr>';
  } else {
  paytableEl.innerHTML = g.paytable.map(function(pt){
    var lib = getSymLib();
    var symHtml;
    if (lib && pt.symbol && lib[pt.symbol]) {
      var svg = lib[pt.symbol]();
      symHtml = '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>';
    } else if (pt.symbol) {
      symHtml = fallbackSymbol(pt.symbol) +
                '<span class="gm-sym-name">' + esc(pt.symbol) + '</span>';
    } else {
      symHtml = esc(pt.combo || '');
    }
    var tiers = String(pt.mult == null ? '' : pt.mult).split('·').map(function(x){ return x.trim(); }).filter(Boolean);
                          var multHtml = tiers.length > 1 ? tiers.map(function(t){ return '<span class="gm-tier">' + esc(t) + '</span>'; }).join('') : esc(pt.mult);
                          return '<tr><td class="gm-combo">' + symHtml + '</td><td class="gm-mult">' + multHtml + '</td></tr>';
  }).join('');
  }

  var infoHtml = '';
  for (var k in g.info) {
    if (g.info.hasOwnProperty(k)) infoHtml += '<dt>' + esc(k) + '</dt><dd>' + esc(g.info[k]) + '</dd>';
  }
  document.getElementById('gm-info').innerHTML = infoHtml;

  renderCarousel();
}

/* ---------- 收藏 ---------- */
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

/* ---------- 事件 ---------- */
function bindEvents() {
  document.getElementById('gm-fav').addEventListener('click', function(){
    var arr = loadFav(); var idx = arr.indexOf(id);
    if (idx === -1) arr.push(id); else arr.splice(idx, 1);
    saveFav(arr); updateFavUI();
  });
  document.getElementById('gm-support').addEventListener('click', function(){ alert('客服功能开发中'); });
  document.getElementById('gm-demo').addEventListener('click', function(){
    location.href = currentGame().route.html + '?mode=demo';
  });
  document.getElementById('gm-start').addEventListener('click', function(){
    location.href = currentGame().route.html + '?mode=real';
  });
  document.getElementById('gm-more').addEventListener('click', function(){ alert('更多操作开发中'); });

  var back = document.getElementById('gm-back');
  if (back) back.addEventListener('click', function(e){
    e.preventDefault();
    location.replace('/');
  });
}

if (!g) { notFound(); } else { render(); bindEvents(); updateFavUI(); }


if (typeof ApexLoader !== 'undefined') { try { ApexLoader.hide(); } catch(e){} }

/* ===== bfcache 恢复时重新检查（防止侧滑返回显示旧状态） ===== */
window.addEventListener('pageshow', function(e){
  if (e.persisted) {
    // 从 bfcache 恢复
    try {
      var idNow = getParam('id') || 'lucky-fruit';
      var gNow = GAMES[idNow];
      if (gNow) {
        // 有效游戏 → 重渲染确保显示正确
        render();
        bindEvents();
        updateFavUI();
      } else {
        notFound();
      }
      if (typeof ApexLoader !== 'undefined') { try { ApexLoader.hide(); } catch(err){} }
    } catch(err) {
      // 兜底：直接跳首页
      location.replace('/');
    }
  }
});

})();
