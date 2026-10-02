/* Apex · 游戏详情页 */
(function(){
'use strict';

/* ---------- 游戏路由 ---------- */
var GAME_ROUTES = {
  'lucky-fruit': { html: '/slot.html',    symLib: 'SlotSymbols' },
  'olympus':     { html: '/olympus.html', symLib: 'OlympusSymbols' }
};
function currentGame() {
  var id = getParam('id') || 'lucky-fruit';
  return { id: id, route: GAME_ROUTES[id] || GAME_ROUTES['lucky-fruit'] };
}
function getSymLib() {
  var r = currentGame().route;
  return window[r.symLib] || null;
}

/* ---------- 游戏数据 ---------- */
var GAMES = {
  'lucky-fruit': {
    name: '幸运水果机',
    sub: '经典三轴老虎机 · 3×3',
    images: [],
    intro: '幸运水果机是一款 3×3 经典老虎机游戏。每局从最左侧开始连续匹配相同符号，连续出现 3 个相同符号即中奖。每条中奖线独立计算，可同时多条中奖。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '三个转轴依次停止，形成 3×3 结果矩阵',
      '从最左侧开始连续匹配 3 个相同符号即中奖',
      '共 5 条中奖线（3 横 + 2 斜），每条独立计算',
      '百搭（Wild）可替代除自己外的任意符号',
      '中奖金额 = 对应符号赔率 × 单线下注额'
    ],
    prizes: [
      { symbol: 'cherry', mult: '×14' },
      { symbol: 'lemon', mult: '×22' },
      { symbol: 'seven', mult: '×280' }
    ],
    paytable: [
      { symbol: 'cherry', mult: '×14' },
      { symbol: 'lemon', mult: '×22' },
      { symbol: 'orange', mult: '×28' },
      { symbol: 'grape', mult: '×42' },
      { symbol: 'watermelon', mult: '×56' },
      { symbol: 'bell', mult: '×84' },
      { symbol: 'bar', mult: '×140' },
      { symbol: 'seven', mult: '×280' },
      { symbol: 'goldenSeven', mult: '×700' },
      { symbol: 'wild', mult: '×840' }
    ],
    info: {
      '游戏类型': '经典老虎机',
      '游戏网格': '3 × 3',
      '中奖线': '5 条',
      '符号数量': '10 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '最大倍数': '×840',
      '上线日期': '2026-10-02'
    }
  },
  'olympus': {
    name: '奥林匹斯之门',
    sub: 'Cluster Pays · Tumble 连击',
    images: [],
    intro: '奥林匹斯之门是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，若再次形成中奖则触发连击，倍率依次递增。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次形成中奖则触发连击，倍率依次递增',
      '每个连击轮次可能掉落随机倍率，倍率相加后与当轮赢分相乘',
      '单局内可连续多次连击，直到不再形成新 cluster'
    ],
    prizes: [
      { symbol: 'gemBlue', mult: '8个×0.25' },
      { symbol: 'gemRed', mult: '8个×1.00' },
      { symbol: 'crown', mult: '8个×10.00' }
    ],
    paytable: [
      { symbol: 'gemBlue', mult: '8-9个×0.25 · 10-11个×0.75 · 12-30个×2' },
      { symbol: 'gemGreen', mult: '8-9个×0.40 · 10-11个×0.90 · 12-30个×4' },
      { symbol: 'gemYellow', mult: '8-9个×0.50 · 10-11个×1.00 · 12-30个×5' },
      { symbol: 'gemPurple', mult: '8-9个×0.80 · 10-11个×1.20 · 12-30个×8' },
      { symbol: 'gemRed', mult: '8-9个×1.00 · 10-11个×1.50 · 12-30个×10' },
      { symbol: 'crown', mult: '8-9个×10 · 10-11个×25 · 12-30个×50' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '8 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '最大倍率': '×5000（连击）',
      '上线日期': '2026-10-02'
    }
  }
};

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

  document.getElementById('gm-prizes').innerHTML = g.prizes.map(function(pr){
    var lib = getSymLib();
    var svg = (lib && pr.symbol && lib[pr.symbol])
      ? '<span class="gm-sym-inline">' + lib[pr.symbol]() + '</span>'
      : (pr.icon || '');
    return '<div class="gm-prize"><div class="gm-prize-icon">' + svg + '</div>' +
      '<div class="gm-prize-mult">' + esc(pr.mult) + '</div></div>';
  }).join('');

  document.getElementById('gm-paytable').innerHTML = g.paytable.map(function(pt){
    var lib = getSymLib();
    var symHtml;
    if (lib && pt.symbol && lib[pt.symbol]) {
      var svg = lib[pt.symbol]();
      symHtml = '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>' +
                '<span class="gm-sym-inline">' + svg + '</span>';
    } else {
      symHtml = esc(pt.combo || '');
    }
    return '<tr><td class="gm-combo">' + symHtml + '</td><td>' + esc(pt.mult) + '</td></tr>';
  }).join('');

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

})();
