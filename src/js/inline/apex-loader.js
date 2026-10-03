/* Apex 全局 loading —— 骨架屏（按页面类型渲染） */
(function(){
'use strict';

function getEl(){ return document.getElementById('apex-loader'); }

function detectPageType(){
  var p = location.pathname;
  if (p === '/' || p === '/index.html' || p === '/home' || p === '/home.html') return 'home';
  if (p === '/game.html' || p === '/game') return 'detail';
  if (/^\/(slot|olympus|sweet|sugar|starlight|bigbass|aviator|crash|jetx|blackjack|roulette-euro|roulette-amer|1001-mg|1001-mg2|10001-nights|10001-mega|1429-seas|5-lions|5-lions-gold|5-lions-mega|arabian-nights|asgardian|aces-eights|fengshui)(\.html)?$/.test(p)) return 'game';
  return 'generic';
}

function homeSkeleton(){
  var items = '';
  for (var i = 0; i < 9; i++) {
    items += '<div class="sk-home-item"><div class="sk sk-home-cover"></div><div class="sk sk-home-name"></div></div>';
  }
  return '<div class="sk-home">' +
    '<div class="sk-home-top">' +
      '<div class="sk sk-home-search"></div>' +
      '<div class="sk sk-home-btn"></div>' +
      '<div class="sk sk-home-lang"></div>' +
    '</div>' +
    '<div class="sk sk-home-carousel"></div>' +
    '<div class="sk sk-home-announce"></div>' +
    '<div class="sk-home-grid">' + items + '</div>' +
  '</div>';
}

function detailSkeleton(){
  return '<div class="sk-detail">' +
    '<div class="sk-detail-top">' +
      '<div class="sk sk-detail-back"></div>' +
      '<div class="sk sk-detail-title"></div>' +
      '<div class="sk sk-detail-more"></div>' +
    '</div>' +
    '<div class="sk sk-detail-carousel"></div>' +
    '<div class="sk-detail-block">' +
      '<div class="sk sk-detail-h2"></div>' +
      '<div class="sk sk-detail-line long"></div>' +
      '<div class="sk sk-detail-line med"></div>' +
      '<div class="sk sk-detail-line short"></div>' +
    '</div>' +
    '<div class="sk-detail-block">' +
      '<div class="sk sk-detail-h2"></div>' +
      '<div class="sk sk-detail-line long"></div>' +
      '<div class="sk sk-detail-line med"></div>' +
    '</div>' +
  '</div>';
}

function gameSkeleton(){
  var stats = '';
  for (var i = 0; i < 3; i++) stats += '<div class="sk sk-game-stat"></div>';
  var foot = '';
  for (var j = 0; j < 3; j++) foot += '<div class="sk sk-game-foot-btn"></div>';
  return '<div class="sk-game">' +
    '<div class="sk-game-bar">' +
      '<div class="sk sk-game-back"></div>' +
      '<div class="sk sk-game-brand"></div>' +
      '<div class="sk sk-game-sound"></div>' +
      '<div class="sk sk-game-menu"></div>' +
    '</div>' +
    '<div class="sk-game-stage"></div>' +
    '<div class="sk sk-game-win-label"></div>' +
    '<div class="sk sk-game-win-value"></div>' +
    '<div class="sk sk-game-action-btn"></div>' +
    '<div class="sk-game-stats">' + stats + '</div>' +
    '<div class="sk-game-bet">' +
      '<div class="sk sk-game-bet-btn"></div>' +
      '<div class="sk sk-game-bet-txt"></div>' +
      '<div class="sk sk-game-bet-btn"></div>' +
    '</div>' +
    '<div class="sk sk-game-spin"></div>' +
    '<div class="sk-game-foot">' + foot + '</div>' +
  '</div>';
}

function applySkeleton(){
  var e = getEl();
  if (!e) return;
  var t = detectPageType();
  var html;
  if (t === 'home') html = homeSkeleton();
  else if (t === 'detail') html = detailSkeleton();
  else if (t === 'game') html = gameSkeleton();
  else html = '<div class="apex-loader-spin" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border:3px solid #ececee;border-top-color:#0a0a0a;border-radius:50%;animation:apexSpin .8s linear infinite"></div>';

  // 换成骨架容器
  e.className = 'apex-skeleton';
  e.innerHTML = html;
}

function hide(){
  var e = getEl();
  if (!e || e.classList.contains('apex-hide')) return;
  e.classList.add('apex-hide');
  setTimeout(function(){ if (e.parentNode) e.parentNode.removeChild(e); }, 300);
}

function show(){
  var e = getEl();
  if (e) { e.classList.remove('apex-hide'); return; }
  e = document.createElement('div');
  e.id = 'apex-loader';
  e.className = 'apex-skeleton';
  document.body.appendChild(e);
  applySkeleton();
}

function arm(){
  // 先应用骨架
  applySkeleton();
  // 兜底隐藏
  setTimeout(hide, 900);
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
else arm();

window.ApexLoader = { show: show, hide: hide };
})();
