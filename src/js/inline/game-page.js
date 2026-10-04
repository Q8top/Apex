/* Apex 游戏详情页 - 轮播 + 自动播放 + 圆点 + 分享 */
(function(){
'use strict';

/* ===== 占位轮播：6 张"游戏画面"空框，等有真实素材再替换 ===== */
var SLIDE_COUNT = 6;

var AUTO_MS = 4000;
var PAUSE_AFTER_USER = 6000;

function init(){
  var track = document.getElementById('game-track');
  var dotsBox = document.getElementById('game-dots');
  if (!track || !dotsBox) return;

  var PH_SVG = '<svg viewBox="0 0 64 64" class="game-ph-icon" aria-hidden="true"><rect x="6" y="10" width="52" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="24" r="4" fill="currentColor"/><path d="M10 48 L26 32 L38 44 L46 36 L54 44 L54 50 L10 50 Z" fill="currentColor"/></svg>';

  /* ===== 渲染 slides（占位） ===== */
  var slidesHtml = '';
  for (var si = 0; si < SLIDE_COUNT; si++) {
    slidesHtml += '<div class="game-carousel-slide"><div class="game-carousel-placeholder">' + PH_SVG + '<div class="game-ph-label">游戏画面</div></div></div>';
  }
  track.innerHTML = slidesHtml;

  /* ===== 渲染 dots ===== */
  var dotsHtml = '';
  for (var di = 0; di < SLIDE_COUNT; di++) {
    dotsHtml += '<button type="button" class="game-dot' + (di===0?' active':'') + '" data-idx="' + di + '" aria-label="第 ' + (di+1) + ' 张"></button>';
  }
  dotsBox.innerHTML = dotsHtml;

  var dots = dotsBox.querySelectorAll('.game-dot');
  var n = SLIDE_COUNT;
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
