(function () {
  'use strict';

  /* ==========================================================
     游戏中文名
     ========================================================== */
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
  var AUTOPLAY_MS     = 3500;
  var RESUME_DELAY    = 5000;
  var SWIPE_RATIO     = 0.12;
  var VELOCITY_PXMS   = 0.35;
  var MIN_DIST_FOR_V  = 20;
  var AXIS_LOCK_PX    = 5;

  /* ==========================================================
     DOM
     ========================================================== */
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

  /* ==========================================================
     符号渲染辅助
     ========================================================== */
  function toCamelId(id) {
    return String(id).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }
  function renderSymbol(id) {
    if (!window.ApexOlympusSymbols) return '';
    return window.ApexOlympusSymbols.render(toCamelId(id));
  }

  /* ==========================================================
     轮播
     ========================================================== */
  var index = 0, total = IMAGE_COUNT;
  var autoTimer = null, resumeTimer = null;
  var dragging = false, lockAxis = null;
  var startX = 0, startY = 0, deltaX = 0, startT = 0, slideW = 1;
  var rafId = null, pendingTx = 0;

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
      resumeTimer = null; play();
    }, RESUME_DELAY);
  }
  function cancelResume() {
    if (resumeTimer) { window.clearTimeout(resumeTimer); resumeTimer = null; }
  }

  function flushMove() {
    rafId = null;
    track.style.transform = 'translate3d(' + pendingTx + '%, 0, 0)';
  }

  function beginDrag(x, y) {
    if (dragging) return;
    dragging = true; lockAxis = null;
    deltaX = 0; startX = x; startY = y;
    startT = Date.now();
    slideW = carousel.clientWidth || 1;
    stop(); cancelResume();
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    track.classList.add('is-dragging');
  }

  function moveDrag(x, y, evt) {
    if (!dragging) return;
    var dx = x - startX, dy = y - startY;
    if (!lockAxis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      lockAxis = (Math.abs(dx) > Math.abs(dy)) ? 'x' : 'y';
      if (lockAxis === 'y') { endDrag(); return; }
    }
    if (lockAxis !== 'x') return;
    deltaX = dx;
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
    var vx = deltaX / dt;
    var threshold = slideW * SWIPE_RATIO;
    var fastEnough = Math.abs(deltaX) >= MIN_DIST_FOR_V && Math.abs(vx) >= VELOCITY_PXMS;
    if      (deltaX <= -threshold || (fastEnough && vx < 0)) next();
    else if (deltaX >=  threshold || (fastEnough && vx > 0)) prev();
    else                                                     setTransform(true);
    deltaX = 0; lockAxis = null;
    scheduleResume();
  }

  buildSlides();
  buildDots();
  setTransform(false);

  carousel.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    beginDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!dragging || e.touches.length !== 1) return;
    moveDrag(e.touches[0].clientX, e.touches[0].clientY, e);
  }, { passive: false });

  document.addEventListener('touchend',    endDrag);
  document.addEventListener('touchcancel', endDrag);

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

  dotsBox.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== dotsBox && !t.classList.contains('gd-dot')) t = t.parentNode;
    if (!t || t === dotsBox) return;
    goTo(Number(t.getAttribute('data-index')) || 0, true);
    scheduleResume();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { prev(); scheduleResume(); }
    if (e.key === 'ArrowRight') { next(); scheduleResume(); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); cancelResume(); }
    else                 { scheduleResume(); }
  });

  /* ==========================================================
     返回 / 分享
     ========================================================== */
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    });
  }

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

  /* ==========================================================
     Toast
     ========================================================== */
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

  /* ==========================================================
     底部导航
     ========================================================== */
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

  if (favBtn) favBtn.addEventListener('click', function () {
    favOn = !favOn;
    try { window.localStorage.setItem(FAV_KEY, favOn ? '1' : '0'); } catch (err) {}
    renderFav();
    toast(favOn ? '已收藏' : '已取消收藏');
  });
  var PLAY_READY = { olympus: true };
  function gotoPlay(mode) {
    if (!PLAY_READY[gameId]) { toast('该游戏即将开放'); return; }
    window.location.href = '/play.html?game=' + encodeURIComponent(gameId) + '&mode=' + mode;
  }
  if (serviceBtn) serviceBtn.addEventListener('click', function () { toast('客服功能即将开放'); });
  if (demoBtn)    demoBtn.addEventListener('click',    function () { gotoPlay('demo'); });
  if (playBtn)    playBtn.addEventListener('click',    function () { gotoPlay('real'); });

  function featureIcon(name){
    var I = {
      bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="#6A50C8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z"/></svg>',
      x2:'<svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6 L11 12 L5 18 M11 6 L17 12 L11 18 M18 6 L18 18"/></svg>',
      star:'<svg viewBox="0 0 24 24" fill="none" stroke="#E6A028" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z"/></svg>',
      play:'<svg viewBox="0 0 24 24" fill="none" stroke="#2E8B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 L19 12 L5 20 Z"/></svg>'
    };
    return I[name] || I.bolt;
  }

  var SIMILAR_NAMES = {
    sugar:'甜蜜爆奖', starburst:'星爆', gonzo:'刚果探险',
    dog:'狗狗之家', book:'死亡之书', bass:'巨型鲈鱼',
    sweet:'糖果连连爆', olympus:'奥林匹斯之门', buffalo:'水牛之王',
    wolf:'狼黄金', fruit:'水果派对', megaways:'大富翁'
  };

  /* ==========================================================
     游戏详情数据（仅 olympus）
     ========================================================== */
  var GAME_DETAILS = {
    olympus: {
      about: [
        '奥林匹斯之门以希腊神话为主题，玩家将跟随万神之王宙斯登上奥林匹斯山巅，体验连锁掉落与倍率叠加的核心玩法。',
        '游戏采用 6×5 盘面，任意相邻 3 个或以上相同符号即可组成中奖组合。中奖符号消失后由新符号补位，连锁可持续触发；宙斯随机投下倍率之球，最高可层层叠加。'
      ],
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
      rules: [
        { t: '盘面结构', b: '游戏盘面为 6 列 × 5 行，共 30 个符号位。每次旋转时，所有符号自盘面上方掉落，填满全部位置后才开始结算。' },
        { t: '中奖判定', b: '盘面中相邻位置出现 3 个或以上相同符号，即可组成中奖组合。同一轮旋转中可同时存在多个组合，奖励逐一结算，互不影响。' },
        { t: '连锁掉落', b: '中奖符号结算后从盘面消失，上方符号下落补位，新的符号从顶部补充。若新盘面再次形成中奖组合，将自动进入下一轮结算，直至盘面不再出现新的中奖组合为止。' },
        { t: '倍率机制', b: '每轮结算时，万神之王宙斯可能随机投下倍率之球，数值从 ×2 起逐级递增。若盘面同时存在多个倍率之球，其数值将叠加后一并结算。' },
        { t: '神迹奖励', b: '连续连锁达到指定次数后，将触发神迹奖励环节。在此环节中，连锁掉落频率进一步提高，倍率之球的出现更为密集，可连续触发多轮奖励结算。' },
        { t: '特殊符号', b: '宙斯符号为最高倍率符号。金冠、圣杯、神戒、沙漏为高倍率符号。五色宝石（红、紫、蓝、绿、黄）为普通符号。所有符号均可参与连锁掉落与倍率结算。' }
      ],
      paytable: [
        { id: 'zeus',       name: '宙斯',   pay: [2.5, 10,  25,  100] },
        { id: 'crown',      name: '金冠',   pay: [2,   8,   20,  50]  },
        { id: 'chalice',    name: '圣杯',   pay: [1.5, 5,   15,  40]  },
        { id: 'ring',       name: '神戒',   pay: [1.2, 4,   12,  30]  },
        { id: 'hourglass',  name: '沙漏',   pay: [1,   3,   10,  25]  },
        { id: 'gem-red',    name: '红宝石', pay: [0.5, 2,   5,   12]  },
        { id: 'gem-purple', name: '紫宝石', pay: [0.4, 1.5, 4,   10]  },
        { id: 'gem-blue',   name: '蓝宝石', pay: [0.3, 1,   3,   8]   },
        { id: 'gem-green',  name: '绿宝石', pay: [0.2, 0.8, 2.5, 6]   },
        { id: 'gem-yellow', name: '黄宝石', pay: [0.2, 0.5, 2,   5]   }
      ],
      features: [
        { icon: 'bolt', title: '连锁掉落', desc: '中奖符号结算后消失，新符号自上方补位，一次旋转可连续触发多轮中奖。' },
        { icon: 'x2',   title: '倍率之球', desc: '宙斯随机投下倍率之球，数值从 ×2 起逐级递增，多个倍率可叠加计算。' },
        { icon: 'star', title: '天降神迹', desc: '连锁累积到指定次数触发神迹奖励，进入高密度连续掉落状态。' },
        { icon: 'play', title: '直达模式', desc: '可跳过等待，直接进入神迹奖励环节，体验高密度连锁掉落。' }
      ],
      similar: ['sugar', 'starburst', 'gonzo', 'dog', 'book', 'bass'],
      faq: [
        { q: '这款游戏怎么玩？', a: '相邻位置出现 3 个或以上相同符号即可组成中奖组合。中奖符号消失后新符号补位，连锁可反复触发。' },
        { q: '免费旋转怎么触发？', a: '命中 4 个以上闪电 Scatter 触发 15 次免费旋转，期间所有倍率累加至本局总倍率。' },
        { q: '倍率符号是怎么算的？', a: '每轮旋转中，宙斯可能降下 ×2–×2500 的倍率符号，同一轮内的所有倍率合并计算。' },
        { q: '最大能赢多少？', a: '连锁掉落与倍率之球层层叠加，可触发高倍收益。具体倍数视盘面组合而定。' }
      ]
    }
  };

  /* ==========================================================
     详情渲染
     ========================================================== */
  (function renderGameDetails() {
    if (window.ApexOlympusSymbols && window.ApexOlympusSymbols.ensureDefs) {
      window.ApexOlympusSymbols.ensureDefs();
    }

    var data = GAME_DETAILS[gameId];
    if (!data) return;

    /* 关于游戏 */
    var aboutSec = document.getElementById('gdSecAbout');
    var aboutTxt = document.getElementById('gdAboutText');
    if (data.about && aboutSec && aboutTxt) {
      var ps = Array.isArray(data.about) ? data.about : [data.about], ah = '';
      for (var ai = 0; ai < ps.length; ai++) ah += '<p class="gd-about-p">' + ps[ai] + '</p>';
      aboutTxt.innerHTML = ah;
      aboutSec.hidden = false;
    }

    /* 游戏规则 */
    var ruleSec  = document.getElementById('gdSecRules');
    var ruleList = document.getElementById('gdRuleList');
    if (data.rules && data.rules.length && ruleSec && ruleList) {
      var rh = '';
      for (var ri = 0; ri < data.rules.length; ri++) {
        var r = data.rules[ri];
        rh += '<li class="gd-rule">' +
                '<h3 class="gd-rule-title">' + r.t + '</h3>' +
                '<p class="gd-rule-body">' + r.b + '</p>' +
              '</li>';
      }
      ruleList.innerHTML = rh;
      ruleSec.hidden = false;
    }

    /* 符号倍率 */
    var paySec = document.getElementById('gdSecPay');
    var payBox = document.getElementById('gdPaytable');
    if (data.paytable && data.paytable.length && paySec && payBox) {
      var ph = '<div class="gd-payhead">' +
                 '<span>符号</span><span>3 连线</span><span>4 连线</span>' +
                 '<span>5 连线</span><span>6 连线</span>' +
               '</div>';
      for (var pi = 0; pi < data.paytable.length; pi++) {
        var pt = data.paytable[pi];
        ph += '<div class="gd-payrow">' +
                '<div class="gd-paysym">' + renderSymbol(pt.id) +
                  '<span class="gd-paysym-name">' + pt.name + '</span>' +
                '</div>';
        for (var qi = 0; qi < 4; qi++) {
          ph += '<div class="gd-payval' + (qi === 3 ? ' is-top' : '') + '">' + pt.pay[qi] + '×</div>';
        }
        ph += '</div>';
      }
      payBox.innerHTML = ph;
      paySec.hidden = false;
    }

    /* 常见问题 */
    var faqSec = document.getElementById('gdSecFaq');
    var faqBox = document.getElementById('gdFaq');
    if (data.faq && data.faq.length && faqSec && faqBox) {
      var qh = '';
      for (var qi = 0; qi < data.faq.length; qi++) {
        var f = data.faq[qi];
        qh += '<details class="gd-faq-item">' +
                '<summary class="gd-faq-q"><span>' + f.q + '</span>' +
                  '<svg class="gd-faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
                '</summary>' +
                '<div class="gd-faq-a">' + f.a + '</div>' +
              '</details>';
      }
      faqBox.innerHTML = qh;
      faqSec.hidden = false;
    }

    /* 相似游戏 */
    var simSec = document.getElementById('gdSecSimilar');
    var simBox = document.getElementById('gdSimilar');
    if (data.similar && data.similar.length && simSec && simBox) {
      var sh = '';
      for (var xi = 0; xi < data.similar.length; xi++) {
        var sid = data.similar[xi];
        var sname = SIMILAR_NAMES[sid] || sid;
        sh += '<a class="gd-similar-item" href="/game-detail.html?game=' + sid + '">' +
                '<div class="gd-similar-cover"><img src="/assets/games/' + sid + '.webp" alt="' + sname + '" loading="lazy"></div>' +
                '<div class="gd-similar-name">' + sname + '</div>' +
              '</a>';
      }
      simBox.innerHTML = sh;
      simSec.hidden = false;
    }

    /* 游戏特色 */
    var featSec  = document.getElementById('gdSecFeatures');
    var featList = document.getElementById('gdFeatureList');
    if (data.features && data.features.length && featSec && featList) {
      var fh = '';
      for (var fi = 0; fi < data.features.length; fi++) {
        var f = data.features[fi];
        fh += '<li class="gd-feature">' +
                '<span class="gd-feature-icon">' + featureIcon(f.icon) + '</span>' +
                '<div class="gd-feature-body">' +
                  '<h3 class="gd-feature-title">' + f.title + '</h3>' +
                  '<p class="gd-feature-desc">' + f.desc + '</p>' +
                '</div>' +
              '</li>';
      }
      featList.innerHTML = fh;
      featSec.hidden = false;
    }
  })();

  play();
})();
