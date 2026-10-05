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

  /* ==========================================================
     游戏详情内容（gd-game-details-v1）
     仅当 GAME_DETAILS 存在该 gameId 时才渲染
     ========================================================== */

  function svgGem(gradId) {
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<polygon points="32,6 54,24 46,58 18,58 10,24" fill="url(#' + gradId + ')" ' +
        'stroke="rgba(0,0,0,.16)" stroke-width=".8" stroke-linejoin="round"/>' +
      '<polygon points="10,24 22,24 18,58" fill="#000" opacity=".14"/>' +
      '<polygon points="54,24 42,24 46,58" fill="#000" opacity=".14"/>' +
      '<polygon points="32,6 42,24 32,30 22,24" fill="#fff" opacity=".38"/>' +
      '<polygon points="22,24 42,24 46,58 18,58" fill="url(#' + gradId + ')" opacity=".35"/>' +
      '<path d="M32 6 L22 24 L32 30 L42 24 Z" fill="#fff" opacity=".22"/>' +
    '</svg>';
  }

  var SYMBOL_SVG = {
    zeus:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path d="M10 60 Q14 46 32 44 Q50 46 54 60 Z" fill="#ffffff" stroke="#c8c8ce" stroke-width="1"/>' +
        '<path d="M16 32 Q14 52 32 56 Q50 52 48 32 Q44 42 32 44 Q20 42 16 32 Z" ' +
          'fill="#f6f6f8" stroke="#c8c8ce" stroke-width="1"/>' +
        '<path d="M22 36 Q26 46 32 48 Q38 46 42 36" fill="none" stroke="#dedee4" stroke-width="1"/>' +
        '<ellipse cx="32" cy="30" rx="14" ry="16" fill="#f5d6b8" stroke="#d4a57d" stroke-width=".8"/>' +
        '<circle cx="26" cy="28" r="1.6" fill="#222"/>' +
        '<circle cx="38" cy="28" r="1.6" fill="#222"/>' +
        '<path d="M22 24 L28 25" stroke="#8b6508" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M42 24 L36 25" stroke="#8b6508" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M32 30 L31 34 L33 34" fill="none" stroke="#d4a57d" stroke-width=".8"/>' +
        '<path d="M18 18 L20 10 L26 15 L32 6 L38 15 L44 10 L46 18 Z" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1" stroke-linejoin="round"/>' +
        '<circle cx="32" cy="14" r="1.6" fill="#e74c3c"/>' +
      '</svg>',

    crown:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path d="M10 46 L14 20 L24 32 L32 14 L40 32 L50 20 L54 46 Z" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<path d="M14 20 L24 32 L18 32 Z" fill="#fff" opacity=".35"/>' +
        '<rect x="10" y="46" width="44" height="6" rx="2" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1"/>' +
        '<circle cx="32" cy="43" r="2.6" fill="#e74c3c"/>' +
        '<circle cx="20" cy="43" r="2" fill="#6c5ce7"/>' +
        '<circle cx="44" cy="43" r="2" fill="#6c5ce7"/>' +
      '</svg>',

    chalice:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path d="M16 12 L48 12 Q46 32 32 34 Q18 32 16 12 Z" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<path d="M22 12 L42 12 Q41 26 32 28 Q23 26 22 12 Z" fill="#fff" opacity=".25"/>' +
        '<rect x="29" y="34" width="6" height="12" fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1"/>' +
        '<rect x="20" y="46" width="24" height="6" rx="3" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1"/>' +
        '<ellipse cx="32" cy="12" rx="16" ry="2.5" fill="#fff4c8" stroke="#8b6508" stroke-width="1"/>' +
      '</svg>',

    ring:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<circle cx="32" cy="38" r="17" fill="none" stroke="url(#gdg-gold)" stroke-width="6"/>' +
        '<circle cx="32" cy="38" r="17" fill="none" stroke="#8b6508" stroke-width="1"/>' +
        '<circle cx="32" cy="38" r="14" fill="none" stroke="#8b6508" stroke-width=".6"/>' +
        '<polygon points="32,6 40,16 32,26 24,16" ' +
          'fill="url(#gdg-purple)" stroke="#4a3f9e" stroke-width="1"/>' +
        '<polygon points="32,8 37,16 32,22 27,16" fill="#fff" opacity=".42"/>' +
      '</svg>',

    hourglass:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<rect x="18" y="8" width="28" height="5" rx="1.5" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1"/>' +
        '<rect x="18" y="51" width="28" height="5" rx="1.5" ' +
          'fill="url(#gdg-gold)" stroke="#8b6508" stroke-width="1"/>' +
        '<path d="M22 13 Q22 28 32 32 Q42 28 42 13 Z" fill="#f5c542" opacity=".9" ' +
          'stroke="#8b6508" stroke-width="1"/>' +
        '<path d="M22 51 Q22 36 32 32 Q42 36 42 51 Z" fill="#f5c542" opacity=".9" ' +
          'stroke="#8b6508" stroke-width="1"/>' +
        '<path d="M26 13 Q26 24 32 28 Q38 24 38 13 Z" fill="#ffe9a6" opacity=".7"/>' +
        '<line x1="32" y1="13" x2="32" y2="32" stroke="#8b6508" stroke-width=".8"/>' +
        '<line x1="32" y1="32" x2="32" y2="51" stroke="#8b6508" stroke-width=".8"/>' +
      '</svg>',

    'gem-red':    svgGem('gdg-red'),
    'gem-purple': svgGem('gdg-purple'),
    'gem-blue':   svgGem('gdg-blue'),
    'gem-green':  svgGem('gdg-green'),
    'gem-yellow': svgGem('gdg-yellow')
  };

  var GAME_DETAILS = {
    olympus: {
      about: '奥林匹斯之门是一款以希腊神话为背景的电子游戏。玩家将置身于众神居住的奥林匹斯山巅，见证万神之王宙斯挥动雷霆之力，召唤连锁掉落与倍率奖励。每一次旋转都可能触发新的中奖组合，神王随机投下的倍率之球，让奖励层层叠加。',
      symbols: [
        { id: 'zeus',       name: '宙斯' },
        { id: 'crown',      name: '金冠' },
        { id: 'chalice',    name: '圣杯' },
        { id: 'ring',       name: '神戒' },
        { id: 'hourglass',  name: '沙漏' },
        { id: 'gem-red',    name: '红宝石' },
        { id: 'gem-purple', name: '紫宝石' },
        { id: 'gem-blue',   name: '蓝宝石' },
        { id: 'gem-green',  name: '绿宝石' },
        { id: 'gem-yellow', name: '黄宝石' }
      ],
      features: [
        { title: '连锁掉落', desc: '中奖符号结算后从盘面消失，新符号自上方掉落补位，一次旋转可连续触发多次中奖。' },
        { title: '倍率之球', desc: '万神之王宙斯随机投下倍率之球，数值从 ×2 起逐级递增，多个倍率可叠加计算。' },
        { title: '天降神迹', desc: '连续中奖累积能量，触发神迹奖励环节，获得额外的连续旋转机会。' },
        { title: '直达模式', desc: '可跳过等待，直接进入神迹奖励环节，体验高密度的连锁掉落。' }
      ],
      meta: [
        { k: '开发商', v: 'Pragmatic Play' },
        { k: '类型',   v: '电子游戏' },
        { k: '主题',   v: '希腊神话' },
        { k: '布局',   v: '6 × 5' },
        { k: '支付线', v: '20 条' },
        { k: '上线',   v: '2020 年' }
      ]
    }
  };

  (function renderGameDetails() {
    var data = GAME_DETAILS[gameId];
    if (!data) return;

    var aboutSec = document.getElementById('gdSecAbout');
    var aboutTxt = document.getElementById('gdAboutText');
    if (data.about && aboutSec && aboutTxt) {
      aboutTxt.textContent = data.about;
      aboutSec.hidden = false;
    }

    var symSec   = document.getElementById('gdSecSymbols');
    var symGrid  = document.getElementById('gdSymbolGrid');
    var symCount = document.getElementById('gdSymbolCount');
    if (data.symbols && data.symbols.length && symSec && symGrid) {
      var sh = '';
      for (var si = 0; si < data.symbols.length; si++) {
        var sym = data.symbols[si];
        sh += '<div class="gd-symbol" role="img" aria-label="' + sym.name + '">' +
                '<div class="gd-symbol-icon">' + (SYMBOL_SVG[sym.id] || '') + '</div>' +
                '<div class="gd-symbol-name">' + sym.name + '</div>' +
              '</div>';
      }
      symGrid.innerHTML = sh;
      if (symCount) symCount.textContent = '共 ' + data.symbols.length + ' 个';
      symSec.hidden = false;
    }

    var featSec  = document.getElementById('gdSecFeatures');
    var featList = document.getElementById('gdFeatureList');
    if (data.features && data.features.length && featSec && featList) {
      var fh = '';
      for (var fi = 0; fi < data.features.length; fi++) {
        var f = data.features[fi];
        fh += '<li class="gd-feature">' +
                '<span class="gd-feature-num">' + (fi + 1) + '</span>' +
                '<div class="gd-feature-body">' +
                  '<h3 class="gd-feature-title">' + f.title + '</h3>' +
                  '<p class="gd-feature-desc">' + f.desc + '</p>' +
                '</div>' +
              '</li>';
      }
      featList.innerHTML = fh;
      featSec.hidden = false;
    }

    var metaSec  = document.getElementById('gdSecMeta');
    var metaList = document.getElementById('gdMetaList');
    if (data.meta && data.meta.length && metaSec && metaList) {
      var mh = '';
      for (var mi = 0; mi < data.meta.length; mi++) {
        var m = data.meta[mi];
        mh += '<div class="gd-meta-item">' +
                '<dt class="gd-meta-k">' + m.k + '</dt>' +
                '<dd class="gd-meta-v">' + m.v + '</dd>' +
              '</div>';
      }
      metaList.innerHTML = mh;
      metaSec.hidden = false;
    }
  })();

  play();
})();
