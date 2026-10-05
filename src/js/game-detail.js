(function () {
  'use strict';

  /* 游戏名映射（后续接入其他游戏时在此补充） */
  var GAME_NAMES = {
    olympus: '奥林匹斯之门'
  };

  var PLACEHOLDER  = '/assets/games/placeholder-game-screen.svg';
  var IMAGE_COUNT  = 5;      /* 占位图数量，后期由管理员后台决定 */
  var AUTOPLAY_MS  = 3500;   /* 自动轮播间隔 */
  var SWIPE_RATIO  = 0.18;   /* 松手翻页阈值（占宽度比例） */

  var page      = document.querySelector('.gd-page');
  var carousel  = document.getElementById('gdCarousel');
  var track     = document.getElementById('gdTrack');
  var dotsBox   = document.getElementById('gdDots');
  var titleEl   = document.querySelector('.gd-title');
  var backBtn   = document.getElementById('gdBack');
  var shareBtn  = document.getElementById('gdShare');
  var toastEl   = document.getElementById('gdToast');

  if (!carousel || !track || !dotsBox) return;

  /* ---------- URL 参数 ---------- */
  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;

  if (page && page.setAttribute) page.setAttribute('data-game-id', gameId);
  if (titleEl) titleEl.textContent = gameName;
  document.title = gameName + ' · Apex';

  /* ---------- 状态 ---------- */
  var index     = 0;
  var total     = IMAGE_COUNT;
  var timer     = null;
  var dragging  = false;
  var lockAxis  = null;   /* null | 'x' | 'y' */
  var startX    = 0;
  var startY    = 0;
  var deltaX    = 0;
  var slideW    = 1;

  /* ---------- 构建 slides ---------- */
  function buildSlides() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var slide = document.createElement('div');
      slide.className = 'gd-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', (i + 1) + ' / ' + total);

      var img = document.createElement('img');
      img.src = PLACEHOLDER;
      img.alt = gameName + ' 游戏画面 ' + (i + 1);
      img.draggable = false;
      img.loading = (i === 0) ? 'eager' : 'lazy';

      slide.appendChild(img);
      frag.appendChild(slide);
    }
    track.appendChild(frag);
  }

  /* ---------- 构建圆点 ---------- */
  function buildDots() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gd-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      dot.setAttribute('data-index', String(i));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      if (i === 0) dot.classList.add('is-active');
      frag.appendChild(dot);
    }
    dotsBox.appendChild(frag);
  }

  /* ---------- 渲染 ---------- */
  function render(animate) {
    if (animate === false) track.style.transition = 'none';
    else                   track.style.transition = '';

    track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';

    if (animate === false) {
      void track.offsetWidth;          /* 强制 reflow */
      track.style.transition = '';
    }
    syncDots();
  }

  function syncDots() {
    var dots = dotsBox.children;
    for (var i = 0; i < dots.length; i++) {
      var active = (i === index);
      dots[i].classList.toggle('is-active', active);
      dots[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }
  }

  function goTo(i, animate) {
    index = ((i % total) + total) % total;   /* 循环 */
    render(animate);
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  /* ---------- 自动轮播 ---------- */
  function play() {
    stop();
    timer = window.setInterval(next, AUTOPLAY_MS);
  }
  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  /* ---------- 手势（Pointer Events，触摸 / 鼠标通用） ---------- */
  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    lockAxis = null;
    deltaX   = 0;
    startX   = e.clientX;
    startY   = e.clientY;
    slideW   = carousel.clientWidth || 1;

    stop();                                   /* 手动开始 → 暂停自动 */
    track.style.transition = 'none';

    if (carousel.setPointerCapture) {
      try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
    }
  }

  function onMove(e) {
    if (!dragging) return;

    var dx = e.clientX - startX;
    var dy = e.clientY - startY;

    if (!lockAxis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      lockAxis = (Math.abs(dx) > Math.abs(dy)) ? 'x' : 'y';
      if (lockAxis === 'y') { cancelDrag(); return; }   /* 纵向滚动，交还页面 */
    }
    if (lockAxis !== 'x') return;

    deltaX = dx;
    var pct = (deltaX / slideW) * 100;
    track.style.transform = 'translate3d(' + (-index * 100 + pct) + '%, 0, 0)';

    if (e.cancelable) e.preventDefault();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;

    var threshold = slideW * SWIPE_RATIO;
    if      (deltaX <= -threshold) next();
    else if (deltaX >=  threshold) prev();
    else                           render();

    deltaX  = 0;
    lockAxis = null;
    play();                                   /* 手动结束 → 恢复自动 */
  }

  function cancelDrag() {
    dragging = false;
    deltaX   = 0;
    lockAxis = null;
    render();
  }

  /* ---------- 绑定 ---------- */
  buildSlides();
  buildDots();
  render(false);

  carousel.addEventListener('pointerdown',  onDown);
  carousel.addEventListener('pointermove',  onMove, { passive: false });
  carousel.addEventListener('pointerup',    onUp);
  carousel.addEventListener('pointercancel', onUp);
  carousel.addEventListener('pointerleave', function (e) {
    if (dragging && e.pointerType === 'mouse') onUp();
  });

  dotsBox.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== dotsBox && !t.classList.contains('gd-dot')) t = t.parentNode;
    if (!t || t === dotsBox) return;
    goTo(Number(t.getAttribute('data-index')) || 0);
    play();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { prev(); play(); }
    if (e.key === 'ArrowRight') { next(); play(); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else play();
  });

  /* ---------- 返回 ---------- */
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    });
  }

  /* ---------- 分享 ---------- */
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url  = window.location.href;
      var data = { title: gameName, text: gameName, url: url };

      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(function () { toast('链接已复制'); })
          .catch(function () { toast('复制失败，请手动复制'); });
        return;
      }
      toast(url);
    });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 1800);
  }

  play();
})();
