(function () {
  'use strict';

  var GAME_NAMES = {
    olympus:   '奥林匹斯之门',
    sweet:     '糖果连连爆',
    sugar:     '甜蜜爆奖',
    bass:      '巨型鲈鱼',
    dog:       '狗狗之家',
    book:      '死亡之书',
    starburst: '星爆',
    gonzo:     '刚果探险',
    buffalo:   '水牛之王',
    wolf:      '狼黄金',
    fruit:     '水果派对',
    megaways:  '大富翁'
  };

  var PLACEHOLDER  = '/assets/games/placeholder-game-screen.svg';
  var IMAGE_COUNT  = 5;
  var AUTOPLAY_MS  = 3500;
  var SWIPE_RATIO  = 0.18;
  var AXIS_LOCK_PX = 8;

  var page      = document.querySelector('.gd-page');
  var carousel  = document.getElementById('gdCarousel');
  var track     = document.getElementById('gdTrack');
  var dotsBox   = document.getElementById('gdDots');
  var titleEl   = document.querySelector('.gd-title');
  var backBtn   = document.getElementById('gdBack');
  var shareBtn  = document.getElementById('gdShare');
  var toastEl   = document.getElementById('gdToast');

  if (!carousel || !track || !dotsBox) return;

  var params   = new URLSearchParams(window.location.search);
  var gameId   = params.get('game') || 'olympus';
  var gameName = GAME_NAMES[gameId] || GAME_NAMES.olympus;

  if (page && page.setAttribute) page.setAttribute('data-game-id', gameId);
  if (titleEl) titleEl.textContent = gameName;
  document.title = gameName + ' · Apex';

  var index     = 0;
  var total     = IMAGE_COUNT;
  var timer     = null;
  var dragging  = false;
  var lockAxis  = null;
  var startX    = 0;
  var startY    = 0;
  var deltaX    = 0;
  var slideW    = 1;
  var rafId     = null;
  var pendingTx = 0;
  var activePid = null;

  /* ---------- 结构 ---------- */
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

  function syncDots() {
    var dots = dotsBox.children;
    for (var i = 0; i < dots.length; i++) {
      var active = (i === index);
      dots[i].classList.toggle('is-active', active);
      dots[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }
  }

  /* ---------- 渲染 ---------- */
  function setTransform(animate) {
    if (animate === false) {
      track.style.transition = 'none';
      track.style.transform  = 'translate3d(' + (-index * 100) + '%, 0, 0)';
      void track.offsetWidth;
      track.style.transition = '';
    } else {
      track.style.transition = '';
      track.style.transform  = 'translate3d(' + (-index * 100) + '%, 0, 0)';
    }
    syncDots();
  }

  function goTo(i, animate) {
    index = ((i % total) + total) % total;
    setTransform(animate);
  }
  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  /* ---------- 自动轮播 ---------- */
  function play() {
    stop();
    timer = window.setInterval(next, AUTOPLAY_MS);
  }
  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  /* ---------- 拖动（rAF 节流） ---------- */
  function flushMove() {
    rafId = null;
    track.style.transform = 'translate3d(' + pendingTx + '%, 0, 0)';
  }

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activePid !== null) return;

    activePid = e.pointerId;
    dragging  = true;
    lockAxis  = null;
    deltaX    = 0;
    startX    = e.clientX;
    startY    = e.clientY;
    slideW    = carousel.clientWidth || 1;

    stop();                                        /* 手动开始 → 停自动 */
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }

    track.style.transition = 'none';
    void track.offsetWidth;                        /* 强制 reflow，杜绝残留过渡 */

    if (carousel.setPointerCapture) {
      try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
    }
  }

  function onMove(e) {
    if (!dragging || e.pointerId !== activePid) return;

    var dx = e.clientX - startX;
    var dy = e.clientY - startY;

    if (!lockAxis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      lockAxis = (Math.abs(dx) > Math.abs(dy)) ? 'x' : 'y';
      if (lockAxis === 'y') { cancelDrag(); return; }   /* 纵向 → 交还页面滚动 */
    }
    if (lockAxis !== 'x') return;

    deltaX    = dx;
    pendingTx = (-index * 100) + (deltaX / slideW) * 100;
    if (rafId === null) rafId = window.requestAnimationFrame(flushMove);

    if (e.cancelable) e.preventDefault();
  }

  function onUp(e) {
    if (!dragging) return;
    if (e && e.pointerId !== undefined && e.pointerId !== activePid) return;

    dragging  = false;
    activePid = null;
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }

    var threshold = slideW * SWIPE_RATIO;
    track.style.transition = '';

    if      (deltaX <= -threshold) next();
    else if (deltaX >=  threshold) prev();
    else                           setTransform(true);

    deltaX   = 0;
    lockAxis = null;
    play();                                        /* 手动结束 → 恢复自动 */
  }

  function cancelDrag() {
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    dragging  = false;
    activePid = null;
    deltaX    = 0;
    lockAxis  = null;
    setTransform(true);
  }

  /* ---------- 初始化 ---------- */
  buildSlides();
  buildDots();
  setTransform(false);

  carousel.addEventListener('pointerdown',   onDown);
  carousel.addEventListener('pointermove',   onMove, { passive: false });
  carousel.addEventListener('pointerup',     onUp);
  carousel.addEventListener('pointercancel', onUp);

  dotsBox.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== dotsBox && !t.classList.contains('gd-dot')) t = t.parentNode;
    if (!t || t === dotsBox) return;
    goTo(Number(t.getAttribute('data-index')) || 0, true);
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
