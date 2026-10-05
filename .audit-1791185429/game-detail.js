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

  function polar(cx,cy,r,d){var a=(d-90)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];}
  function fmt(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}
  function svgGem(c){var cx=32,cy=32,ro=26,rt=12,o=[],t=[];for(var i=0;i<8;i++){o.push(polar(cx,cy,ro,i*45));t.push(polar(cx,cy,rt,i*45));}
    var s='<svg viewBox="0 0 64 64" aria-hidden="true">';for(var i=0;i<8;i++){var j=(i+1)%8;s+='<polygon points="'+fmt(t[i])+' '+fmt(t[j])+' '+fmt(o[j])+' '+fmt(o[i])+'" fill="'+c.f[i]+'" stroke="'+c.e+'" stroke-width=".3" stroke-linejoin="round"/>';}
    var tp='';for(var k=0;k<8;k++)tp+=fmt(t[k])+' ';s+='<polygon points="'+tp.trim()+'" fill="'+c.t+'"/>';
    s+='<polygon points="'+fmt(t[5])+' '+fmt(t[6])+' '+fmt(t[7])+' 32,32" fill="#fff" opacity=".28"/><polygon points="'+fmt(t[1])+' '+fmt(t[2])+' '+fmt(t[3])+' 32,32" fill="#000" opacity=".12"/>';
    var op='';for(var m=0;m<8;m++)op+=fmt(o[m])+' ';s+='<polygon points="'+op.trim()+'" fill="none" stroke="'+c.e+'" stroke-width="1.1" stroke-linejoin="round"/><polyline points="'+fmt(o[6])+' '+fmt(o[7])+'" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/></svg>';return s;}
  var G={red:{t:'#FFC4CD',f:['#FF6B7A','#E63950','#C11030','#8B0A22','#5A0616','#8B0A22','#C11030','#E63950'],e:'#3A0008'},purple:{t:'#DCC8FF',f:['#C098FF','#9B5DE5','#7A3FD1','#5B2BA8','#3D1B6E','#5B2BA8','#7A3FD1','#9B5DE5'],e:'#1A0A3D'},blue:{t:'#B8DEFF',f:['#6BC0FF','#2196F3','#0D6FD1','#0D47A1','#062A66','#0D47A1','#0D6FD1','#2196F3'],e:'#031843'},green:{t:'#C8F0C0',f:['#7CD17E','#43A047','#2E8B33','#1B5E20','#0A3310','#1B5E20','#2E8B33','#43A047'],e:'#052008'},yellow:{t:'#FFEDB0',f:['#FFD84D','#FFC107','#D9A000','#B8860B','#8A6600','#B8860B','#D9A000','#FFC107'],e:'#3D2900'}};
  var SYMBOL_SVG = {
    zeus:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="url(#gdg-disc-purple)"/><circle cx="32" cy="32" r="29" fill="none" stroke="url(#gdg-metal-gold)" stroke-width="1.8"/><circle cx="32" cy="32" r="26" fill="none" stroke="#FFF4C8" stroke-width=".5" opacity=".45"/><g fill="url(#gdg-metal-gold)"><path d="M19 24 Q18 15 24 12 Q28 10 32 12 Q36 10 40 12 Q46 15 45 24 Q42 20 38 19 Q35 18 32 19 Q29 18 26 19 Q22 20 19 24 Z"/><path d="M21 24 Q20 34 24 42 Q27 47 32 48 Q37 47 40 42 Q44 34 43 24 Q40 27 36 27 Q34 27 32 26 Q30 27 28 27 Q24 27 21 24 Z"/></g><circle cx="28" cy="29" r="1" fill="#3A2200"/><circle cx="36" cy="29" r="1" fill="#3A2200"/><path d="M23 37 Q26 43 32 45 Q38 43 41 37" fill="none" stroke="#8B6508" stroke-width=".6" opacity=".55"/><path d="M27 40 Q32 42 37 40" fill="none" stroke="#8B6508" stroke-width=".5" opacity=".45"/><g transform="translate(42,7)"><path d="M0 0 L-5 7 L-1 7 L-3 14 L5 5 L1 5 L3 0 Z" fill="#FFF4C8" stroke="#6B4A00" stroke-width=".5" stroke-linejoin="round"/></g><ellipse cx="24" cy="17" rx="4.5" ry="2.2" fill="#fff" opacity=".18"/></svg>',
    crown:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 28 Q14 22 18 22 L46 22 Q50 22 50 28 L50 34 L14 34 Z" fill="#8B1538"/><path d="M14 28 Q14 22 18 22 L46 22 Q50 22 50 28" fill="none" stroke="#6E0F2A" stroke-width=".6"/><path d="M18 24 L46 24 M18 28 L46 28 M18 32 L46 32" stroke="#6E0F2A" stroke-width=".4" opacity=".7"/><path d="M9 48 L13 26 L22 36 L32 16 L42 36 L51 26 L55 48 Z" fill="url(#gdg-metal-gold-diag)" stroke="#6B4A00" stroke-width="1.1" stroke-linejoin="round"/><path d="M13 26 L22 36 L32 16 L42 36 L51 26 L49 22 L42 32 L32 12 L22 32 L15 22 Z" fill="#FFF4C8" opacity=".5"/><rect x="8" y="46" width="48" height="8" rx="2.5" fill="url(#gdg-metal-gold)" stroke="#6B4A00" stroke-width="1"/><line x1="10" y1="50" x2="54" y2="50" stroke="#8B6508" stroke-width=".5" opacity=".55"/><circle cx="32" cy="50" r="2.6" fill="#D91E36" stroke="#5A0010" stroke-width=".5"/><circle cx="32" cy="49.4" r="1.2" fill="#FFB0BD" opacity=".6"/><circle cx="19" cy="50" r="2" fill="#6A3FBF" stroke="#3D1F7A" stroke-width=".5"/><circle cx="45" cy="50" r="2" fill="#6A3FBF" stroke="#3D1F7A" stroke-width=".5"/><circle cx="32" cy="16" r="2.4" fill="#FFE580" stroke="#6B4A00" stroke-width=".5"/><circle cx="31.2" cy="15.2" r="1" fill="#fff" opacity=".7"/><path d="M18 28 L19 40" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/></svg>',
    chalice:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="14" rx="17" ry="2.6" fill="#3A2200" stroke="#6B4A00" stroke-width=".6"/><ellipse cx="32" cy="14" rx="15" ry="1.8" fill="#6B4A00" opacity=".85"/><path d="M15 14 L49 14 Q47 35 32 37 Q17 35 15 14 Z" fill="url(#gdg-metal-gold-diag)" stroke="#6B4A00" stroke-width="1.1" stroke-linejoin="round"/><ellipse cx="32" cy="14" rx="17" ry="2.6" fill="none" stroke="url(#gdg-metal-gold)" stroke-width="1.4"/><path d="M20 16 Q20 30 30 34" fill="none" stroke="#FFF4C8" stroke-width="1.8" opacity=".7" stroke-linecap="round"/><path d="M24 19 Q26 24 24 29" fill="none" stroke="#8B6508" stroke-width=".7" opacity=".8"/><path d="M32 19 L32 33" fill="none" stroke="#8B6508" stroke-width=".6" opacity=".6"/><path d="M40 19 Q38 24 40 29" fill="none" stroke="#8B6508" stroke-width=".7" opacity=".8"/><path d="M27 22 Q32 24 37 22" fill="none" stroke="#8B6508" stroke-width=".6" opacity=".7"/><rect x="30" y="37" width="4" height="9" fill="url(#gdg-metal-gold)" stroke="#6B4A00" stroke-width=".6"/><circle cx="32" cy="41" r="1.4" fill="#FFF4C8" opacity=".6"/><ellipse cx="32" cy="49" rx="14" ry="3.4" fill="url(#gdg-metal-gold)" stroke="#6B4A00" stroke-width="1"/><ellipse cx="32" cy="47.4" rx="11.5" ry="2" fill="#FFF4C8" opacity=".45"/><circle cx="32" cy="11" r="2.2" fill="#6A3FBF" stroke="#3D1F7A" stroke-width=".5"/><circle cx="31.3" cy="10.3" r=".9" fill="#fff" opacity=".7"/></svg>',
    ring:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="42" rx="18" ry="15" fill="none" stroke="url(#gdg-metal-gold-diag)" stroke-width="6"/><ellipse cx="32" cy="42" rx="18" ry="15" fill="none" stroke="#6B4A00" stroke-width="1"/><ellipse cx="32" cy="42" rx="14.5" ry="11.6" fill="none" stroke="#8B6508" stroke-width=".5" opacity=".55"/><ellipse cx="32" cy="42" rx="21.5" ry="18.4" fill="none" stroke="#8B6508" stroke-width=".5" opacity=".55"/><path d="M14 42 Q13 28 21 27" fill="none" stroke="#FFF4C8" stroke-width="1.4" opacity=".75" stroke-linecap="round"/><path d="M50 42 Q51 56 43 57" fill="none" stroke="#6B4A00" stroke-width="1.2" opacity=".5" stroke-linecap="round"/><path d="M23 20 L28 11 L36 11 L41 20 L37 25 L27 25 Z" fill="url(#gdg-metal-gold)" stroke="#6B4A00" stroke-width=".9" stroke-linejoin="round"/><polygon points="32,5 41,14 32,24 23,14" fill="url(#gdg-ruby)" stroke="#3A0008" stroke-width="1" stroke-linejoin="round"/><polygon points="32,5 36,14 32,19 28,14" fill="#fff" opacity=".3"/><polygon points="32,5 41,14 36,14 32,10" fill="#FFB0BD" opacity=".55"/><polygon points="23,14 28,14 32,24 27,19" fill="#5A0616" opacity=".35"/></svg>',
    hourglass:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="13" y="5" width="38" height="6" rx="2" fill="url(#gdg-metal-gold-diag)" stroke="#6B4A00" stroke-width=".8"/><rect x="13" y="53" width="38" height="6" rx="2" fill="url(#gdg-metal-gold-diag)" stroke="#6B4A00" stroke-width=".8"/><line x1="15" y1="8" x2="49" y2="8" stroke="#FFF4C8" stroke-width=".5" opacity=".7"/><line x1="15" y1="56" x2="49" y2="56" stroke="#FFF4C8" stroke-width=".5" opacity=".7"/><path d="M19 11 Q19 27 32 32 Q45 27 45 11 Z" fill="#CDE8FF" opacity=".9" stroke="#6B4A00" stroke-width=".8"/><path d="M19 53 Q19 37 32 32 Q45 37 45 53 Z" fill="#CDE8FF" opacity=".9" stroke="#6B4A00" stroke-width=".8"/><path d="M22 13 Q22 26 32 31 Q42 26 42 13 Z" fill="url(#gdg-metal-gold)" opacity=".95"/><path d="M25 13 Q25 23 32 29 Q39 23 39 13 Z" fill="#FFF4C8" opacity=".7"/><path d="M22 51 Q22 41 32 34 Q42 41 42 51 Z" fill="url(#gdg-metal-gold)" opacity=".95"/><path d="M26 51 Q26 44 32 38 Q38 44 38 51 Z" fill="#FFF4C8" opacity=".55"/><line x1="32" y1="31" x2="32" y2="38" stroke="#F5D77B" stroke-width="1.6" stroke-linecap="round"/><circle cx="32" cy="35" r=".8" fill="#FFF4C8"/><path d="M23 15 Q23 24 27 29" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85" stroke-linecap="round"/><path d="M23 49 Q23 42 27 37" fill="none" stroke="#fff" stroke-width="1" opacity=".6" stroke-linecap="round"/></svg>',
    'gem-red':svgGem(G.red),'gem-purple':svgGem(G.purple),'gem-blue':svgGem(G.blue),'gem-green':svgGem(G.green),'gem-yellow':svgGem(G.yellow)
  };

  var GAME_DETAILS = {
    olympus: {
      about: ['奥林匹斯之门以希腊神话为蓝本，把玩家带到众神居住的奥林匹斯山巅。万神之王宙斯手握雷霆，俯瞰每一轮旋转——他的怒火随时会化作闪电劈落，把一次普通的旋转变成连锁不断的奖励风暴。','游戏采用 6 列 5 行的盘面，符号自上方掉落，只要相邻出现 3 个或以上相同图案即可组成中奖组合。中奖后符号原地消失，新的符号填补空位，若再次形成组合，将自动进入下一轮结算——连锁可以反复触发，一次旋转可能连续结算十几轮。','宙斯会在任意时刻投下倍率之球，数值从 ×2 起步逐级递增，多个倍率可叠加计算。当连锁累积到一定次数，将触发神迹奖励环节，进入高密度的连续掉落状态。'],
      symbols: [{id:'zeus',name:'宙斯'},{id:'crown',name:'金冠'},{id:'chalice',name:'圣杯'},{id:'ring',name:'神戒'},{id:'hourglass',name:'沙漏'},{id:'gem-red',name:'红宝石'},{id:'gem-purple',name:'紫宝石'},{id:'gem-blue',name:'蓝宝石'},{id:'gem-green',name:'绿宝石'},{id:'gem-yellow',name:'黄宝石'}],
      rules: [{t:'盘面结构',b:'游戏盘面为 6 列 × 5 行，共 30 个符号位。每次旋转时，所有符号自盘面上方掉落，填满全部位置后才开始结算。'},{t:'中奖判定',b:'盘面中相邻位置出现 3 个或以上相同符号，即可组成中奖组合。同一轮旋转中可同时存在多个组合，奖励逐一结算，互不影响。'},{t:'连锁掉落',b:'中奖符号结算后从盘面消失，上方符号下落补位，新的符号从顶部补充。若新盘面再次形成中奖组合，将自动进入下一轮结算，直至盘面不再出现新的中奖组合为止。'},{t:'倍率机制',b:'每轮结算时，万神之王宙斯可能随机投下倍率之球，数值从 ×2 起逐级递增。若盘面同时存在多个倍率之球，其数值将叠加后一并结算。'},{t:'神迹奖励',b:'连续连锁达到指定次数后，将触发神迹奖励环节。在此环节中，连锁掉落频率进一步提高，倍率之球的出现更为密集，可连续触发多轮奖励结算。'},{t:'特殊符号',b:'宙斯符号为最高倍率符号。金冠、圣杯、神戒、沙漏为高倍率符号。五色宝石（红、紫、蓝、绿、黄）为普通符号。所有符号均可参与连锁掉落与倍率结算。'}],
      features: [{title:'连锁掉落',desc:'中奖符号结算后从盘面消失，新符号自上方掉落补位，一次旋转可连续触发多次中奖。'},{title:'倍率之球',desc:'万神之王宙斯随机投下倍率之球，数值从 ×2 起逐级递增，多个倍率可叠加计算。'},{title:'天降神迹',desc:'连续中奖累积能量，触发神迹奖励环节，获得额外的连续旋转机会。'},{title:'直达模式',desc:'可跳过等待，直接进入神迹奖励环节，体验高密度的连锁掉落。'}],
      meta: [{k:'开发商',v:'Apex Studio'},{k:'发行商',v:'Apex Global Entertainment'},{k:'类型',v:'电子游戏'},{k:'主题',v:'希腊神话'},{k:'布局',v:'6 × 5'},{k:'中奖连线',v:'20 条'},{k:'上线',v:'2020 年'},{k:'语言',v:'简中 / English'},{k:'平台',v:'iOS / Android / Web'},{k:'操作',v:'单击旋转'}]
    }
  };

  (function renderGameDetails() {
    var data = GAME_DETAILS[gameId];
    if (!data) return;

    var aboutSec = document.getElementById('gdSecAbout');
    var aboutTxt = document.getElementById('gdAboutText');
    if (data.about && aboutSec && aboutTxt) {
      var ps = Array.isArray(data.about) ? data.about : [data.about], ah = '';
      for (var ai = 0; ai < ps.length; ai++) ah += '<p class="gd-about-p">' + ps[ai] + '</p>';
      aboutTxt.innerHTML = ah; aboutSec.hidden = false;
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
