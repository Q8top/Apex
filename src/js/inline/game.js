/* Apex · 游戏详情页 */
(function(){
'use strict';

/* ---------- 游戏路由 ---------- */
var GAME_ROUTES = {
  'lucky-fruit': { html: '/slot.html',    symLib: 'SlotSymbols' },
  'olympus':     { html: '/olympus.html', symLib: 'OlympusSymbols' },
  'sweet':       { html: '/sweet.html',   symLib: 'SweetSymbols' },
  'sugar':       { html: '/sugar.html',   symLib: 'SugarSymbols' }
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
    sub: '经典三轴老虎机 · 3×3 · 5 条中奖线',
    images: [],
    intro: '幸运水果机是一款 3×3 经典老虎机游戏。每局同时结算 5 条固定中奖线（3 横 + 2 斜），每条线上连续 3 个相同符号即中奖。多条线可同时中奖，百搭（Wild）可替代除自己外任意符号。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '三个转轴依次停止，形成 3×3 结果矩阵',
      '同时结算 5 条固定中奖线（上行 / 中行 / 下行 / 主对角 / 副对角）',
      '每条线上 3 个符号相同即中奖，独立计算',
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
    sub: 'Cluster Pays · Tumble 连击 · 乘法器',
    images: [],
    intro: '奥林匹斯之门是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，若再次形成中奖则触发连击。每个连击轮次会掉落随机乘法器，作用于当轮赢分。4 个及以上 Zeus 触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次形成中奖则触发 Tumble 连击',
      '每个 Tumble 轮次随机掉落 1~2 个乘法器（×2 ~ ×1000），累加后与当轮赢分相乘',
      '出现 4 个及以上 Zeus（Scatter）触发免费旋转 15 次',
      '免费旋转中每次 Tumble 后可能额外掉落 Zeus，继续累积倍数'
    ],
    prizes: [
      { symbol: 'gemBlue', mult: '8个×0.25' },
      { symbol: 'gemRed', mult: '8个×1.00' },
      { symbol: 'crown', mult: '8个×10.00' }
    ],
    paytable: [
      { symbol: 'gemBlue',    mult: '8-9个×0.25 · 10-11个×0.75 · 12+个×2' },
      { symbol: 'gemGreen',   mult: '8-9个×0.40 · 10-11个×0.90 · 12+个×4' },
      { symbol: 'gemYellow',  mult: '8-9个×0.50 · 10-11个×1.00 · 12+个×5' },
      { symbol: 'gemPurple',  mult: '8-9个×0.80 · 10-11个×1.20 · 12+个×8' },
      { symbol: 'gemRed',     mult: '8-9个×1.00 · 10-11个×1.50 · 12+个×10' },
      { symbol: 'cup',        mult: '8-9个×1.50 · 10-11个×2.00 · 12+个×12' },
      { symbol: 'ring',       mult: '8-9个×2.00 · 10-11个×5.00 · 12+个×15' },
      { symbol: 'hourglass',  mult: '8-9个×2.50 · 10-11个×10.0 · 12+个×25' },
      { symbol: 'crown',      mult: '8-9个×10.0 · 10-11个×25.0 · 12+个×50' },
      { symbol: 'zeus',       mult: '4+ 个 → 免费旋转 15 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '10 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（4+ Zeus）',
      '最大倍率': '×5000（连击）',
      '上线日期': '2026-10-02'
    }
  },
  'sweet': {
    name: '甜蜜蜜',
    sub: 'Cluster Pays · 炸弹倍数 · 免费旋转',
    images: [],
    intro: '甜蜜蜜是一款 6×5 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 8 个及以上相同符号即形成中奖。中奖符号消失后上方符号下落补位，可连续触发 Tumble 连击。免费旋转中每次 Tumble 会掉落炸弹倍数，跨轮累积作用于赢分。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '6 列 × 5 行的网格生成 30 个符号',
      '相邻（水平/垂直）相同符号 ≥8 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '若再次中奖则触发 Tumble 连击',
      '出现 4 个及以上棒棒糖（Scatter）触发免费旋转',
      '免费旋转中每次 Tumble 会掉落炸弹倍数（×2 ~ ×100），跨轮累积后与赢分相乘'
    ],
    prizes: [
      { symbol: 'candyBlue', mult: '8个×0.25' },
      { symbol: 'banana', mult: '8个×2' },
      { symbol: 'plum', mult: '8个×10' }
    ],
    paytable: [
      { symbol: 'candyBlue',    mult: '8-9个×0.25 · 10-11个×0.75 · 12+个×2' },
      { symbol: 'candyGreen',   mult: '8-9个×0.40 · 10-11个×0.90 · 12+个×4' },
      { symbol: 'candyPurple',  mult: '8-9个×0.50 · 10-11个×1.00 · 12+个×5' },
      { symbol: 'candyRed',     mult: '8-9个×0.80 · 10-11个×1.20 · 12+个×8' },
      { symbol: 'candyOrange',  mult: '8-9个×1.00 · 10-11个×1.50 · 12+个×10' },
      { symbol: 'candyYellow',  mult: '8-9个×1.50 · 10-11个×2.00 · 12+个×12' },
      { symbol: 'banana',       mult: '8-9个×2.00 · 10-11个×5.00 · 12+个×15' },
      { symbol: 'grape',        mult: '8-9个×2.50 · 10-11个×10.0 · 12+个×25' },
      { symbol: 'watermelon',   mult: '8-9个×5.00 · 10-11个×15.0 · 12+个×40' },
      { symbol: 'apple',        mult: '8-9个×8.00 · 10-11个×20.0 · 12+个×45' },
      { symbol: 'plum',         mult: '8-9个×10.0 · 10-11个×25.0 · 12+个×50' },
      { symbol: 'lollipop',     mult: '4/5/6 个 → 免费旋转 10/12/15 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '6 × 5',
      '最小 cluster': '8 个',
      '符号数量': '12 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（4+ 棒棒糖）',
      '上线日期': '2026-10-02'
    }
  },
  'sugar': {
    name: '糖果狂欢',
    sub: 'Cluster Pays · 位置倍率 · 免费旋转',
    images: [],
    intro: '糖果狂欢是一款 7×7 的 Cluster Pays 老虎机。相邻（水平/垂直）出现 5 个及以上相同糖果即形成中奖。中奖符号消失后上方符号下落补位，同时在网格上随机位置附加倍率方块；中奖 cluster 覆盖到倍率方块时，该 cluster 赢分乘以覆盖格子的倍率总和。出现 3 个及以上棒棒糖触发免费旋转。',
    rules: [
      '点击 − / + 调整下注金额',
      '点击「旋转」启动一局',
      '7 列 × 7 行网格生成 49 个符号',
      '相邻（水平/垂直）相同糖果 ≥5 个即形成中奖',
      '中奖符号消失，上方符号下落，顶部补新',
      '每次 Tumble 后有概率在随机位置掉落倍率方块（×2 ~ ×128）',
      '中奖 cluster 覆盖格子上的倍率总和 × 该 cluster 赢分',
      '出现 3 个及以上棒棒糖（Scatter）触发免费旋转 10 次',
      '免费旋转中每次 Tumble 也会持续附加位置倍率，倍数可长期累积'
    ],
    prizes: [
      { symbol: 'candyBlue', mult: '5个×0.2' },
      { symbol: 'heart', mult: '5个×0.8' },
      { symbol: 'rainbow', mult: '15个×250' }
    ],
    paytable: [
      { symbol: 'candyBlue',   mult: '5-6个×0.2 · 7-8个×0.5 · 9-10个×1.5 · 11-12个×3 · 13-14个×6 · 15+个×15' },
      { symbol: 'candyGreen',  mult: '5-6个×0.25 · 7-8个×0.6 · 9-10个×2 · 11-12个×4 · 13-14个×8 · 15+个×20' },
      { symbol: 'candyYellow', mult: '5-6个×0.3 · 7-8个×0.8 · 9-10个×2.5 · 11-12个×5 · 13-14个×10 · 15+个×25' },
      { symbol: 'candyRed',    mult: '5-6个×0.4 · 7-8个×1 · 9-10个×3 · 11-12个×6 · 13-14个×12 · 15+个×30' },
      { symbol: 'candyPurple', mult: '5-6个×0.5 · 7-8个×1.5 · 9-10个×5 · 11-12个×10 · 13-14个×20 · 15+个×50' },
      { symbol: 'heart',       mult: '5-6个×0.8 · 7-8个×2 · 9-10个×8 · 11-12个×15 · 13-14个×30 · 15+个×75' },
      { symbol: 'star',        mult: '5-6个×1 · 7-8个×2.5 · 9-10个×10 · 11-12个×20 · 13-14个×40 · 15+个×100' },
      { symbol: 'rainbow',     mult: '5-6个×2 · 7-8个×5 · 9-10个×20 · 11-12个×50 · 13-14个×100 · 15+个×250' },
      { symbol: 'lollipop',    mult: '3+ 个 → 免费旋转 10 次' }
    ],
    info: {
      '游戏类型': 'Cluster Pays',
      '游戏网格': '7 × 7',
      '最小 cluster': '5 个',
      '符号数量': '9 种',
      '最低下注': '¥1',
      '最高下注': '¥100',
      '免费旋转': '支持（3+ 棒棒糖）',
      '位置倍率': '×2 ~ ×128',
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
