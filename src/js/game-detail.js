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

  var PLACEHOLDER     = '/assets/games/placeholder-game-screen.svg';
  var IMAGE_COUNT     = 5;
  var AUTOPLAY_MS     = 3500;   /* 自动轮播间隔 */
  var RESUME_DELAY    = 5000;   /* 手动操作后冷却时长 */
  var SWIPE_RATIO     = 0.12;   /* 位移阈值：宽度的 12% */
  var VELOCITY_PXMS   = 0.35;   /* 速度阈值：350 px/s */
  var MIN_DIST_FOR_V  = 20;     /* 走速度判定时至少要移动这么多 px */
  var AXIS_LOCK_PX    = 5;      /* 轴向锁定像素 */

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

  var index       = 0;
  var total       = IMAGE_COUNT;
  var autoTimer   = null;
  var resumeTimer = null;

  var dragging    = false;
  var lockAxis    = null;   /* null | 'x' | 'y' */
  var startX      = 0;
  var startY      = 0;
  var deltaX      = 0;
  var startT      = 0;
  var slideW      = 1;
  var rafId       = null;
  var pendingTx   = 0;

  /* ---------- 构建 ---------- */
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
      track.classList.add('is-dragging');
      track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
      void track.offsetWidth;
      track.classList.remove('is-dragging');
    } else {
      track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
    }
    syncDots();
  }
  function goTo(i, animate) {
    index = ((i % total) + total) % total;
    setTransform(animate);
  }
  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  /* ---------- 自动播放 / 冷却 ---------- */
  function play() {
    stop();
    autoTimer = window.setInterval(next, AUTOPLAY_MS);
  }
  function stop() {
    if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
  }
  function scheduleResume() {
    cancelResume();
    resumeTimer = window.setTimeout(function () {
      resumeTimer = null;
      play();
    }, RESUME_DELAY);
  }
  function cancelResume() {
    if (resumeTimer) { window.clearTimeout(resumeTimer); resumeTimer = null; }
  }

  /* ---------- 拖动核心 ---------- */
  function flushMove() {
    rafId = null;
    track.style.transform = 'translate3d(' + pendingTx + '%, 0, 0)';
  }

  function beginDrag(x, y) {
    if (dragging) return;
    dragging = true;
    lockAxis = null;
    deltaX   = 0;
    startX   = x;
    startY   = y;
    startT   = Date.now();
    slideW   = carousel.clientWidth || 1;

    stop();
    cancelResume();
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    track.classList.add('is-dragging');
  }

  function moveDrag(x, y, evt) {
    if (!dragging) return;
    var dx = x - startX;
    var dy = y - startY;

    if (!lockAxis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      lockAxis = (Math.abs(dx) > Math.abs(dy)) ? 'x' : 'y';
      if (lockAxis === 'y') { endDrag(); return; }
    }
    if (lockAxis !== 'x') return;

    deltaX    = dx;
    pendingTx = (-index * 100) + (deltaX / slideW) * 100;
    if (rafId === null) rafId = window.requestAnimationFrame(flushMove);

    if (evt && evt.cancelable) evt.preventDefault();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }

    track.classList.remove('is-dragging');
    void track.offsetWidth;

    var dt = Math.max(1, Date.now() - startT);
    var vx = deltaX / dt;                            /* px / ms */
    var threshold = slideW * SWIPE_RATIO;

    var fastEnough   = Math.abs(deltaX) >= MIN_DIST_FOR_V &&
                       Math.abs(vx)     >= VELOCITY_PXMS;
    var farEnoughL   = deltaX <= -threshold;
    var farEnoughR   = deltaX >=  threshold;

    if (farEnoughL || (fastEnough && vx < 0))      next();
    else if (farEnoughR || (fastEnough && vx > 0)) prev();
    else                                           setTransform(true);

    deltaX   = 0;
    lockAxis = null;
    scheduleResume();
  }

  /* ---------- 事件绑定 ---------- */
  buildSlides();
  buildDots();
  setTransform(false);

  /* 触摸通道 */
  carousel.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    beginDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    if (e.touches.length !== 1) return;
    moveDrag(e.touches[0].clientX, e.touches[0].clientY, e);
  }, { passive: false });

  document.addEventListener('touchend',    endDrag);
  document.addEventListener('touchcancel', endDrag);

  /* 鼠标通道（桌面） */
  carousel.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    moveDrag(e.clientX, e.clientY, null);
  });
  document.addEventListener('mouseup', endDrag);

  /* 圆点 */
  dotsBox.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== dotsBox && !t.classList.contains('gd-dot')) t = t.parentNode;
    if (!t || t === dotsBox) return;
    goTo(Number(t.getAttribute('data-index')) || 0, true);
    scheduleResume();
  });

  /* 键盘 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { prev(); scheduleResume(); }
    if (e.key === 'ArrowRight') { next(); scheduleResume(); }
  });

  /* 页面可见性 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); cancelResume(); }
    else                 { scheduleResume(); }
  });

  /* 返回 */
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    });
  }

  /* 分享 */
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

  /* Toast */
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

  /* ---------- 底部导航（gd-actionbar-wired） ---------- */
  var favBtn     = document.getElementById('gdFav');
  var serviceBtn = document.getElementById('gdService');
  var demoBtn    = document.getElementById('gdDemo');
  var playBtn    = document.getElementById('gdPlay');

  var FAV_KEY = 'apex.fav.' + gameId;
  var favOn = false;
  try { favOn = window.localStorage.getItem(FAV_KEY) === '1'; } catch (err) {}

  function renderFav() {
    if (!favBtn) return;
    favBtn.classList.toggle('is-fav', favOn);
    favBtn.setAttribute('aria-pressed', favOn ? 'true' : 'false');
    var lbl = favBtn.querySelector('.gd-action-label');
    if (lbl) lbl.textContent = favOn ? '已收藏' : '收藏';
  }
  renderFav();

  if (favBtn) {
    favBtn.addEventListener('click', function () {
      favOn = !favOn;
      try { window.localStorage.setItem(FAV_KEY, favOn ? '1' : '0'); } catch (err) {}
      renderFav();
      toast(favOn ? '已收藏' : '已取消收藏');
    });
  }
  if (serviceBtn) {
    serviceBtn.addEventListener('click', function () { toast('客服功能即将开放'); });
  }
  if (demoBtn) {
    demoBtn.addEventListener('click', function () { toast('免费试玩即将开放'); });
  }
  if (playBtn) {
    playBtn.addEventListener('click', function () { toast('开始游戏即将开放'); });
  }

  play();
})();
