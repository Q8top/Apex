/* Gates of Olympus · 详情页轮播
 * 数据驱动：SLIDES 为空 → 渲染占位；有 URL → 渲染 img
 * 后期接入管理后台时，把 SLIDES 换成 fetch /api/game/olympus/slides 即可
 */
(function () {
  'use strict';

  // ⚙️ 数据源（后期由管理后台替换）
  var SLIDES = [];            // 例：['/assets/games/olympus-scene-1.svg', ...]
  var PLACEHOLDER_COUNT = 3;  // SLIDES 为空时默认显示占位张数

  var AUTO_MS = 3500;         // 自动播放间隔
  var PAUSE_MS = 6000;        // 用户操作后暂停自动播放时间

  var elTrack = document.getElementById('preview-track');
  var elDots = document.getElementById('preview-dots');
  if (!elTrack || !elDots) return;

  var slides = SLIDES.length > 0
    ? SLIDES.map(function (src) { return { src: src }; })
    : Array.from({ length: PLACEHOLDER_COUNT }, function () { return { src: null }; });

  var total = slides.length;
  var cur = 0;
  var timer = null;
  var paused = false;
  var pauseTimer = null;

  // ── 渲染 slides ──
  var trackHtml = '';
  slides.forEach(function (s) {
    trackHtml += '<div class="preview-slide">';
    if (s.src) {
      trackHtml += '<img src="' + s.src + '" alt="" loading="lazy">';
    } else {
      trackHtml += '<svg class="preview-ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">'
        + '<rect x="3" y="4" width="18" height="16" rx="2"/>'
        + '<circle cx="8.5" cy="9.5" r="1.5"/>'
        + '<path d="M3 17l4.5-4.5L12 17l3.5-4.5L21 17"/>'
        + '</svg>'
        + '<span class="preview-ph-text">游戏画面</span>';
    }
    trackHtml += '</div>';
  });
  elTrack.innerHTML = trackHtml;

  // ── 渲染圆点 ──
  var dotsHtml = '';
  for (var i = 0; i < total; i++) {
    dotsHtml += '<span class="dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>';
  }
  elDots.innerHTML = dotsHtml;
  var dotEls = elDots.querySelectorAll('.dot');

  // ── 切换 ──
  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    cur = i;
    elTrack.style.transform = 'translateX(' + (-cur * 100) + '%)';
    for (var k = 0; k < dotEls.length; k++) {
      dotEls[k].classList.toggle('active', k === cur);
    }
  }

  function next() { goTo(cur + 1); }

  // ── 自动播放 ──
  function start() {
    stop();
    timer = setInterval(function () {
      if (!paused && !document.hidden) next();
    }, AUTO_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function pauseTemp() {
    paused = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(function () { paused = false; }, PAUSE_MS);
  }

  // ── 触摸手势 ──
  var startX = 0, startY = 0, dragging = false, moved = false;
  elTrack.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragging = true;
    moved = false;
    elTrack.style.transition = 'none';
  }, { passive: true });

  elTrack.addEventListener('touchmove', function (e) {
    if (!dragging || e.touches.length !== 1) return;
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (!moved && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) moved = true;
    if (moved) {
      var offset = -cur * elTrack.clientWidth + dx;
      elTrack.style.transform = 'translateX(' + offset + 'px)';
    }
  }, { passive: true });

  elTrack.addEventListener('touchend', function (e) {
    if (!dragging) return;
    dragging = false;
    elTrack.style.transition = '';
    if (!moved) return;
    var dx = (e.changedTouches[0].clientX - startX);
    var threshold = elTrack.clientWidth * 0.2;
    if (dx > threshold) goTo(cur - 1);
    else if (dx < -threshold) goTo(cur + 1);
    else goTo(cur);
    pauseTemp();
  }, { passive: true });

  // ── 圆点点击 ──
  elDots.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.dot') : null;
    if (!t) return;
    var idx = parseInt(t.getAttribute('data-idx'), 10) || 0;
    goTo(idx);
    pauseTemp();
  });

  // ── 页面可见性 ──
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // ── 初始化 ──
  goTo(0);
  start();

  // 暴露给未来管理后台
  window.__olympusDetail = {
    setSlides: function (arr) { SLIDES = arr; location.reload(); }
  };
})();
