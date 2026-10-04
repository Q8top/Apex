/* Apex 游戏详情页 - 轮播 + 自动播放 + 圆点 + 分享 */
(function(){
'use strict';

/* ===== 占位图：暂时用游戏封面 + 其他游戏的图 ===== */
var SLIDES = [
  {img:'/assets/games/olympus.webp',  alt:'奥林匹斯 - 游戏画面 1'},
  {img:'/assets/games/sweet.webp',    alt:'奥林匹斯 - 游戏画面 2'},
  {img:'/assets/games/sugar.webp',    alt:'奥林匹斯 - 游戏画面 3'},
  {img:'/assets/games/book.webp',     alt:'奥林匹斯 - 游戏画面 4'},
  {img:'/assets/games/gonzo.webp',    alt:'奥林匹斯 - 游戏画面 5'},
  {img:'/assets/games/megaways.webp', alt:'奥林匹斯 - 游戏画面 6'}
];

var AUTO_MS = 4000;
var PAUSE_AFTER_USER = 6000;

function init(){
  var track = document.getElementById('game-track');
  var dotsBox = document.getElementById('game-dots');
  if (!track || !dotsBox) return;

  /* ===== 渲染 slides ===== */
  track.innerHTML = SLIDES.map(function(s){
    return '<div class="game-carousel-slide"><div class="game-carousel-img" role="img" aria-label="' + s.alt + '" style="background-image:url(\'' + s.img + '\')"></div></div>';
  }).join('');

  /* ===== 渲染 dots ===== */
  dotsBox.innerHTML = SLIDES.map(function(_, i){
    return '<button type="button" class="game-dot' + (i===0?' active':'') + '" data-idx="' + i + '" aria-label="第 ' + (i+1) + ' 张"></button>';
  }).join('');

  var dots = dotsBox.querySelectorAll('.game-dot');
  var n = SLIDES.length;
  var cur = 0;
  var timer = null;
  var paused = false;
  var pauseTimer = null;

  function setActive(i){
    for (var k = 0; k < dots.length; k++) {
      dots[k].classList.toggle('active', k === i);
    }
  }

  function goto(i){
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    var slideW = track.clientWidth;
    if (!slideW) return;
    track.scrollTo({left: i * slideW, behavior: 'smooth'});
    cur = i;
    setActive(i);
  }

  function tick(){
    if (paused || document.hidden) return;
    goto(cur + 1);
  }

  function start(){ stop(); timer = setInterval(tick, AUTO_MS); }
  function stop(){ if (timer) { clearInterval(timer); timer = null; } }
  function pauseTemporarily(){
    paused = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(function(){ paused = false; }, PAUSE_AFTER_USER);
  }

  /* ===== 滚动时同步圆点 ===== */
  var scrollTick = false;
  track.addEventListener('scroll', function(){
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function(){
      scrollTick = false;
      var w = track.clientWidth;
      if (!w) return;
      var i = Math.round(track.scrollLeft / w);
      if (i < 0) i = 0;
      if (i > n - 1) i = n - 1;
      if (i !== cur) { cur = i; setActive(i); }
    });
  }, {passive: true});

  /* ===== 用户交互时暂停 ===== */
  track.addEventListener('pointerdown', pauseTemporarily, {passive: true});
  track.addEventListener('touchstart', pauseTemporarily, {passive: true});
  track.addEventListener('wheel', pauseTemporarily, {passive: true});

  /* ===== 圆点点击跳转 ===== */
  dotsBox.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.game-dot') : null;
    if (!b) return;
    var i = parseInt(b.getAttribute('data-idx'), 10) || 0;
    goto(i);
    pauseTemporarily();
  });

  /* ===== 窗口尺寸变化时重定位 ===== */
  var resizeTimer = null;
  window.addEventListener('resize', function(){
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      track.scrollTo({left: cur * track.clientWidth, behavior: 'auto'});
    }, 120);
  });

  /* ===== 可见性切换 ===== */
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) stop(); else start();
  });

  /* ===== 分享按钮 ===== */
  var shareBtn = document.getElementById('game-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', function(){
      var data = {
        title: document.title,
        text: '奥林匹斯 · Apex Global Entertainment',
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function(){});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function(){
          var old = shareBtn.innerHTML;
          shareBtn.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i>';
          setTimeout(function(){ shareBtn.innerHTML = old; }, 1200);
        }).catch(function(){});
      }
    });
  }

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
