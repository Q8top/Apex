/* 全部电子游戏 · 分类导航 + 游戏列表 */
(function(){
'use strict';

/* ═══ 分类（名字统一 3~4 字） ═══ */
var CATS = [
  { k:'slot',    l:'老虎机',   i:'ri-gamepad-fill'  },
  { k:'jackpot', l:'累积大奖', i:'ri-trophy-fill'   },
  { k:'baccara', l:'百家乐',   i:'ri-vip-crown-fill'},
  { k:'bj',      l:'二十一点', i:'ri-layout-grid-fill'},
  { k:'roulette',l:'轮盘',     i:'ri-loader-4-line' },
  { k:'dice',    l:'骰宝',     i:'ri-dice-fill'     },
  { k:'dt',      l:'龙虎',     i:'ri-fire-fill'     },
  { k:'poker',   l:'扑克',     i:'ri-heart-3-fill'  },
  { k:'fish',    l:'捕鱼',     i:'ri-anchor-fill'   },
  { k:'crash',   l:'爆奖飞行', i:'ri-flight-takeoff-fill'},
  { k:'plinko',  l:'弹珠',     i:'ri-focus-3-fill'  },
  { k:'instant', l:'即时游戏', i:'ri-flashlight-fill'},
  { k:'wheel',   l:'转盘',     i:'ri-refresh-fill'  },
  { k:'bingo',   l:'宾果',     i:'ri-layout-masonry-fill'},
  { k:'arcade',  l:'街机',     i:'ri-rocket-2-fill' }
];

/* ═══ 各分类下的游戏（只有老虎机有 12 款） ═══ */
var GAMES = {
  slot: [
    { id:'1001-mg',        n:'1001精灵',      img:'/assets/games/1001-mg.svg' },
    { id:'1001-mg2',       n:'1001精灵2',     img:'/assets/games/1001-mg2.svg' },
    { id:'10001-nights',   n:'一万零一夜',    img:'/assets/games/10001-nights.svg' },
    { id:'10001-mega',     n:'一万零一夜M',   img:'/assets/games/10001-mega.svg' },
    { id:'1429-seas',      n:'1429海域',      img:'/assets/games/1429-seas.svg' },
    { id:'5-lions',        n:'五狮',          img:'/assets/games/5-lions.svg' },
    { id:'5-lions-gold',   n:'五狮黄金',      img:'/assets/games/5-lions-gold.svg' },
    { id:'5-lions-mega',   n:'五狮Mega',      img:'/assets/games/5-lions-mega.svg' },
    { id:'arabian-nights', n:'一千零一夜',    img:'/assets/games/arabian-nights.svg' },
    { id:'asgardian',      n:'阿斯加德',      img:'/assets/games/asgardian.svg' },
    { id:'aces-eights',    n:'A与8',          img:'/assets/games/aces-eights.svg' },
    { id:'fengshui',       n:'风水炼金',      img:'/assets/games/fengshui.svg' }
  ]
};

var $side = document.getElementById('ag-side');
var $content = document.getElementById('ag-content');
var KEY = 'apex_allgames_cat_v1';

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
  });
}

/* ═══ 侧栏渲染 ═══ */
function renderSide(activeK){
  $side.innerHTML = CATS.map(function(c){
    return '<button type="button" class="ag-cat' + (c.k === activeK ? ' active' : '') + '" role="tab" data-cat="' + c.k + '">' +
      '<i class="' + c.i + '" aria-hidden="true"></i>' +
      '<span>' + esc(c.l) + '</span>' +
    '</button>';
  }).join('');
}

/* ═══ 内容渲染 ═══ */
function renderContent(k){
  var list = GAMES[k] || [];
  if (!list.length) {
    $content.innerHTML =
      '<div class="ag-empty">' +
        '<i class="ri-inbox-archive-line" aria-hidden="true"></i>' +
        '<div>该分类暂时没有游戏</div>' +
      '</div>';
    return;
  }
  $content.innerHTML = '<div class="ag-grid">' + list.map(function(g){
    return '<div class="ag-card" data-game="' + esc(g.id) + '">' +
      '<div class="ag-card-cover"><img src="' + esc(g.img) + '" alt="' + esc(g.n) + '" loading="lazy"></div>' +
      '<div class="ag-card-name">' + esc(g.n) + '</div>' +
    '</div>';
  }).join('') + '</div>';
}

/* ═══ 切换分类 ═══ */
function switchCat(k){
  try { sessionStorage.setItem(KEY, k); } catch(e){}
  renderSide(k);
  renderContent(k);
}

/* ═══ 初始 ═══ */
function init(){
  var saved = 'slot';
  try {
    var v = sessionStorage.getItem(KEY);
    if (v) {
      for (var i = 0; i < CATS.length; i++) { if (CATS[i].k === v) { saved = v; break; } }
    }
  } catch(e){}

  renderSide(saved);
  renderContent(saved);

  $side.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.ag-cat') : null;
    if (!b) return;
    var k = b.getAttribute('data-cat');
    if (k) switchCat(k);
  });

  $content.addEventListener('click', function(e){
    var c = e.target.closest ? e.target.closest('.ag-card') : null;
    if (!c) return;
    var gid = c.getAttribute('data-game');
    if (gid) location.href = '/game.html?id=' + encodeURIComponent(gid);
  });

  if (typeof ApexLoader !== 'undefined') {
    try { ApexLoader.hide(); } catch(e){}
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
