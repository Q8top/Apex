// Apex 主页逻辑

window.showHomepage = function (user) {
  user = user || {};
  document.querySelectorAll('body > div').forEach(function (el) {
    if (el.id === 'apex-homepage' || el.id === 'apex-toast') return;
    if (el.classList && el.classList.contains('header')) return;
    el.style.display = 'none';
  });
  var header = document.querySelector('.header');
  if (header) header.style.display = 'none';

  var hp = document.getElementById('apex-homepage');
  if (hp) hp.style.display = 'block';

  // 同步当前语言
  try {
    var curLang = localStorage.getItem('apex_lang') || 'zh-CN';
    var meta = {
      'zh-CN': { flag: '🇨🇳', name: '中文' },
      'en':    { flag: '🇺🇸', name: 'English' },
      'ja':    { flag: '🇯🇵', name: '日本語' }
    };
    var m = meta[curLang] || meta['zh-CN'];
    var flagEl = document.getElementById('home-current-flag');
    var nameEl = document.getElementById('home-current-name');
    if (flagEl) flagEl.textContent = m.flag;
    if (nameEl) nameEl.textContent = m.name;
    document.querySelectorAll('#home-lang-menu .apex-lg-option').forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.lang === curLang);
    });
  } catch (e) {}
};

// 语言下拉
(function () {
  function init() {
    var btn = document.getElementById('home-lang-btn');
    var menu = document.getElementById('home-lang-menu');
    if (!btn || !menu || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = menu.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
    });

    menu.querySelectorAll('.apex-lg-option').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = opt.dataset.lang;
        var flag = opt.dataset.flag;
        var name = opt.dataset.name;
        try { localStorage.setItem('apex_lang', lang); } catch (err) {}
        var flagEl = document.getElementById('home-current-flag');
        var nameEl = document.getElementById('home-current-name');
        if (flagEl) flagEl.textContent = flag;
        if (nameEl) nameEl.textContent = name;
        menu.querySelectorAll('.apex-lg-option').forEach(function (el) {
          el.classList.toggle('is-active', el.dataset.lang === lang);
        });
        menu.classList.remove('is-open');
        btn.classList.remove('is-open');
        if (window.__setLang) window.__setLang(lang);
      });
    });

    document.addEventListener('click', function () {
      menu.classList.remove('is-open');
      btn.classList.remove('is-open');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 轮播
(function () {
  var track, dots, slides = 0, idx = 0, timer = null, INTERVAL = 4500;

  function go(n) {
    if (!track) return;
    idx = (n + slides) % slides;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    if (dots) {
      dots.querySelectorAll('.apex-cr-dot').forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
      });
    }
  }
  function start() { stop(); timer = setInterval(function () { go(idx + 1); }, INTERVAL); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  window.__apexCarouselPause = stop;
  window.__apexCarouselResume = start;

  function init() {
    track = document.getElementById('apex-cr-track');
    dots = document.getElementById('apex-cr-dots');
    if (!track) return;
    slides = track.querySelectorAll('.apex-cr-slide').length;
    if (slides <= 1) return;

    if (dots) {
      dots.querySelectorAll('.apex-cr-dot').forEach(function (d) {
        d.addEventListener('click', function () {
          go(Number(d.dataset.i) || 0);
          start();
        });
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    start();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-apex-action="coming-soon"]');
  if (el) {
    e.preventDefault();
    if (window.__apex && window.__apex.toast) {
      window.__apex.toast('功能开发中，敬请期待', 'info');
    }
  }
});


// 公告：改用 CSS 横向滚动（无需 JS）

// ============================================================
// 广告轮播：添加触摸滑动支持
// ============================================================
(function () {
  var viewport = null, track = null, dots = null;
  var slides = 0, idx = 0;
  var startX = 0, startY = 0, deltaX = 0, deltaY = 0;
  var isDragging = false, isHorizontal = null;
  var width = 0;

  function go(n, animate) {
    if (!track) return;
    idx = Math.max(0, Math.min(slides - 1, n));
    track.style.transition = animate === false ? 'none' : '';
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    if (dots) {
      dots.querySelectorAll('.apex-cr-dot').forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
      });
    }
  }

  function init() {
    var vp = document.querySelector('.apex-cr-viewport');
    var tk = document.getElementById('apex-cr-track');
    var dt = document.getElementById('apex-cr-dots');
    if (!vp || !tk) return;
    viewport = vp;
    track = tk;
    dots = dt;
    slides = track.querySelectorAll('.apex-cr-slide').length;
    width = vp.clientWidth;

    viewport.addEventListener('touchstart', onStart, { passive: true });
    viewport.addEventListener('touchmove', onMove, { passive: false });
    viewport.addEventListener('touchend', onEnd, { passive: true });
    viewport.addEventListener('touchcancel', onEnd, { passive: true });

    window.addEventListener('resize', function () {
      width = viewport.clientWidth;
      go(idx, false);
    });
  }

  function onStart(e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    deltaY = 0;
    isDragging = true;
    isHorizontal = null;
    track.classList.add('is-dragging');
    // 暂停自动播放
    if (window.__apexCarouselPause) window.__apexCarouselPause();
  }

  function onMove(e) {
    if (!isDragging) return;
    deltaX = e.touches[0].clientX - startX;
    deltaY = e.touches[0].clientY - startY;

    // 判断方向（只判断一次）
    if (isHorizontal === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontal === true) {
      e.preventDefault();
      var offset = -idx * width + deltaX;
      track.style.transform = 'translateX(' + offset + 'px)';
    }
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    // 恢复自动播放
    if (window.__apexCarouselResume) window.__apexCarouselResume();

    if (isHorizontal === true) {
      var threshold = Math.max(40, width * 0.15);
      if (deltaX > threshold) {
        go(idx - 1);
      } else if (deltaX < -threshold) {
        go(idx + 1);
      } else {
        go(idx);
      }
    } else {
      go(idx, false);
    }
    deltaX = 0;
    deltaY = 0;
    isHorizontal = null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// ============================================================
// 底部导航栏 - APEX-NAV-BIND
// ============================================================
(function () {
  function bind() {
    var nav = document.querySelector('.apex-nav');
    if (!nav) return;
    nav.querySelectorAll('.apex-nav-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var tab = item.dataset.tab;
        nav.querySelectorAll('.apex-nav-item').forEach(function (el) {
          el.classList.toggle('is-active', el === item);
        });
        // 首页以外的 tab 显示"开发中"提示
        if (tab !== 'home') {
          if (window.__apex && window.__apex.toast) {
            var labels = {
              promo: '优惠',
              assets: '资产',
              service: '客服',
              more: '更多',
              mine: '我的'
            };
            window.__apex.toast(labels[tab] + ' 功能开发中，敬请期待', 'info');
          }
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// ============================================================
// 二级 tab 栏 - APEX-TABS-BIND
// ============================================================
(function () {
  function bind() {
    var tabs = document.querySelector('.apex-tabs');
    if (!tabs) return;
    tabs.querySelectorAll('.apex-tabs-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var tab = item.dataset.tab;
        tabs.querySelectorAll('.apex-tabs-item').forEach(function (el) {
          el.classList.toggle('is-active', el === item);
        });
        if (tab !== 'lobby') {
          if (window.__apex && window.__apex.toast) {
            var labels = { recent: '最近', favorites: '收藏' };
            window.__apex.toast(labels[tab] + ' 功能开发中，敬请期待', 'info');
          }
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// ============================================================
// 左侧竖列导航 - APEX-SIDE-BIND
// ============================================================
(function () {
  var names = {
    hot: '热门',
    poker: '棋牌',
    slot: '电子',
    dice: '骰子/数学概率',
    sports: '体育',
    events: '赛事',
    instant: '即时游戏',
    esports: '电竞',
    special: '特殊/新型'
  };
  function bind() {
    var side = document.querySelector('.apex-side');
    if (!side) return;
    side.querySelectorAll('.apex-side-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var cat = item.dataset.cat;
        side.querySelectorAll('.apex-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === item);
        });
        var titleEl = document.getElementById('apex-content-title');
        if (titleEl) titleEl.textContent = names[cat] || cat;
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// ============================================================
// 分类导航列表 - APEX-CATS-BIND
// ============================================================
(function () {
  function bind() {
    var cats = document.querySelector('.apex-cats');
    if (!cats) return;
    cats.querySelectorAll('.apex-cat').forEach(function (item) {
      item.addEventListener('click', function () {
        var cat = item.dataset.cat;
        var name = item.querySelector('.apex-cat-text').textContent.trim();

        cats.querySelectorAll('.apex-cat').forEach(function (el) {
          el.classList.toggle('is-active', el === item);
        });

        // 跳到对应"页面"（实际是显示 toast，未来接真实路由）
        if (cat === 'hot') {
          if (window.__apex && window.__apex.toast) {
            window.__apex.toast('热门内容加载中…', 'info');
          }
        } else {
          if (window.__apex && window.__apex.toast) {
            window.__apex.toast(name + ' 页面开发中，敬请期待', 'info');
          }
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// ============================================================
// 热门全屏子页面 - APEX-HOT-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'poker', label: '棋牌热门', icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>', items: [
      { en: 'Baccarat', zh: '百家樂', icon: 'card' },
      { en: 'Blackjack', zh: '21点', icon: 'card' },
      { en: 'Texas Hold\'em', zh: '德州扑克', icon: 'card' },
      { en: 'Omaha', zh: '奥马哈', icon: 'card' },
      { en: 'Niu Niu', zh: '牛牛', icon: 'card' }
    ]},
    { key: 'slot', label: '电子热门', icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>', items: [
      { en: 'Slots', zh: '电子老虎机', icon: 'slot' },
      { en: 'Jackpot', zh: '累积奖池', icon: 'slot' },
      { en: 'Megaways', zh: 'Megaways', icon: 'slot' },
      { en: 'Hold & Win', zh: 'Hold & Win', icon: 'slot' },
      { en: 'Cluster Pays', zh: 'Cluster Pays', icon: 'slot' }
    ]},
    { key: 'dice', label: '骰子热门', icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>', items: [
      { en: 'Sic Bo', zh: '骰宝', icon: 'dice' },
      { en: 'Dice', zh: '骰子', icon: 'dice' },
      { en: 'Hi-Lo', zh: '高低', icon: 'dice' },
      { en: 'Craps', zh: 'Craps', icon: 'dice' },
      { en: 'Wheel', zh: '幸运转盘', icon: 'dice' }
    ]},
    { key: 'sports', label: '体育热门', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>', items: [
      { en: 'Football', zh: '足球', icon: 'sports' },
      { en: 'Basketball', zh: '篮球', icon: 'sports' },
      { en: 'Tennis', zh: '网球', icon: 'sports' },
      { en: 'Baseball', zh: '棒球', icon: 'sports' },
      { en: 'Ice Hockey', zh: '冰球', icon: 'sports' }
    ]},
    { key: 'events', label: '赛事热门', icon: '<path d="M12 3v18M8 7h8M5 12h14"/>', items: [
      { en: 'Horse Racing', zh: '赛马', icon: 'events' },
      { en: 'Greyhound Racing', zh: '赛狗', icon: 'events' },
      { en: 'Motor Racing', zh: '赛车', icon: 'events' },
      { en: 'Virtual Horse Racing', zh: '虚拟赛马', icon: 'events' },
      { en: 'Virtual Racing', zh: '虚拟赛车', icon: 'events' }
    ]},
    { key: 'instant', label: '即时游戏热门', icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>', items: [
      { en: 'Crash', zh: 'Crash', icon: 'instant' },
      { en: 'Mines', zh: 'Mines', icon: 'instant' },
      { en: 'Plinko', zh: 'Plinko', icon: 'instant' },
      { en: 'Keno', zh: '基诺', icon: 'instant' },
      { en: 'Bingo', zh: '宾果', icon: 'instant' }
    ]},
    { key: 'esports', label: '电竞热门', icon: '<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4"/>', items: [
      { en: 'League of Legends', zh: '英雄联盟', icon: 'esports' },
      { en: 'Counter-Strike', zh: 'CS', icon: 'esports' },
      { en: 'Dota 2', zh: 'Dota 2', icon: 'esports' },
      { en: 'Valorant', zh: '无畏契约', icon: 'esports' },
      { en: 'EA Sports FC', zh: 'EA Sports FC', icon: 'esports' }
    ]},
    { key: 'special', label: '特殊/新型热门', icon: '<path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>', items: [
      { en: 'Fantasy Sports', zh: '梦幻体育', icon: 'special' },
      { en: 'Prediction Market', zh: '预测市场', icon: 'special' },
      { en: 'Peer-to-Peer', zh: 'P2P', icon: 'special' },
      { en: 'Exchange', zh: '交易所模式', icon: 'special' },
      { en: 'Hybrid Games', zh: '混合玩法', icon: 'special' }
    ]}
  ];

  var ICON_MAP = {
    card:    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
    slot:    '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>',
    dice:    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    sports:  '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
    events:  '<path d="M12 3v18M8 7h8M5 12h14"/>',
    instant: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    esports: '<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4"/>',
    special: '<path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-hot-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-hot-page';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-hot-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">热门</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-hot-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(cat.icon)
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-hot-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    // 返回
    document.getElementById('apex-hot-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    // 左侧切换
    var sideEl = document.getElementById('apex-hot-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-hot-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var html = '';
    cat.items.forEach(function (it) {
      var ic = ICON_MAP[it.icon] || ICON_MAP.special;
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    // 点击子项
    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    // 绑定"热门"卡片点击
    var hotBtn = document.querySelector('.apex-cats .apex-cat[data-cat="hot"]');
    if (hotBtn) {
      hotBtn.addEventListener('click', function () {
        var page = document.getElementById('apex-hot-page');
        if (page) page.style.display = 'flex';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// APEX-HOT-FORCE: 强制修复热门按钮点击
(function () {
  function fix() {
    var hotBtn = document.querySelector('.apex-cats .apex-cat[data-cat="hot"]');
    if (!hotBtn) { setTimeout(fix, 150); return; }
    // 克隆替换，清掉所有旧监听器
    var nb = hotBtn.cloneNode(true);
    hotBtn.parentNode.replaceChild(nb, hotBtn);
    nb.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var page = document.getElementById('apex-hot-page');
      if (page) {
        page.style.display = 'flex';
      } else {
        setTimeout(function () {
          var p = document.getElementById('apex-hot-page');
          if (p) p.style.display = 'flex';
        }, 200);
      }
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    setTimeout(fix, 100);
  }
})();


// ============================================================
// 棋牌全屏子页面 - APEX-POKER-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'poker', label: '扑克', items: [
      { en: "Texas Hold'em", zh: '德州扑克' },
      { en: 'Omaha', zh: '奥马哈' },
      { en: 'Omaha Hi-Lo', zh: '奥马哈高低' },
      { en: 'Seven Card Stud', zh: '七张牌' },
      { en: 'Five Card Draw', zh: '五张牌' },
      { en: 'Short Deck Poker', zh: '短牌扑克' },
      { en: 'Caribbean Stud Poker', zh: '加勒比扑克' },
      { en: 'Three Card Poker', zh: '三张牌扑克' },
      { en: 'Pai Gow Poker', zh: '牌九扑克' }
    ]},
    { key: 'blackjack', label: '21点', items: [
      { en: 'Classic Blackjack', zh: '经典21点' },
      { en: 'European Blackjack', zh: '欧洲21点' },
      { en: 'Atlantic City Blackjack', zh: '大西洋城21点' },
      { en: 'Spanish 21', zh: '西班牙21点' },
      { en: 'Blackjack Switch', zh: '21点换牌' },
      { en: 'Pontoon', zh: '浮桥21点' }
    ]},
    { key: 'baccarat', label: '百家樂', items: [
      { en: 'Punto Banco', zh: '彭托银行' },
      { en: 'Mini Baccarat', zh: '迷你百家樂' },
      { en: 'Baccarat Banque', zh: '银行百家樂' },
      { en: 'Chemin de Fer', zh: '铁路百家樂' },
      { en: 'No Commission Baccarat', zh: '免佣百家樂' },
      { en: 'Speed Baccarat', zh: '极速百家樂' }
    ]},
    { key: 'asia', label: '亚洲棋牌', items: [
      { en: 'Niu Niu', zh: '牛牛' },
      { en: 'San Gong', zh: '三公' },
      { en: 'Dragon Tiger', zh: '龙虎' },
      { en: 'Teen Patti', zh: '印度三张' },
      { en: 'Andar Bahar', zh: '安达巴哈' },
      { en: 'Pai Gow', zh: '牌九' },
      { en: 'Fan Tan', zh: '番摊' },
      { en: 'Hoo Hey How', zh: '鱼虾蟹' }
    ]},
    { key: 'mahjong', label: '麻将', items: [
      { en: 'Mahjong', zh: '麻将' },
      { en: 'Hong Kong Mahjong', zh: '港式麻将' },
      { en: 'Japanese Mahjong', zh: '日麻' },
      { en: 'Riichi Mahjong', zh: '立直麻将' },
      { en: 'Chinese Mahjong', zh: '中式麻将' },
      { en: 'American Mahjong', zh: '美式麻将' }
    ]},
    { key: 'other', label: '其他棋牌', items: [
      { en: 'Casino War', zh: '赌场战争' },
      { en: 'Red Dog', zh: '红狗' },
      { en: 'War', zh: '战争' },
      { en: 'Pontoon', zh: '浮桥' },
      { en: 'Baccarat Variants', zh: '百家樂变体' },
      { en: 'Card Matching Games', zh: '纸牌配对' }
    ]}
  ];

  var ICONS = {
    poker:    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
    blackjack:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8"/>',
    baccarat: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10h6M9 14h6"/>',
    asia:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
    mahjong:  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/>',
    other:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-poker-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-poker-page';
    wrap.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-poker-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">棋牌</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-poker-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(ICONS[cat.key])
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-poker-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    document.getElementById('apex-poker-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    var sideEl = document.getElementById('apex-poker-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-poker-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var ic = ICONS[cat.key] || ICONS.poker;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    var pokerBtn = document.querySelector('.apex-cats .apex-cat[data-cat="poker"]');
    if (pokerBtn) {
      var nb = pokerBtn.cloneNode(true);
      pokerBtn.parentNode.replaceChild(nb, pokerBtn);
      nb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var page = document.getElementById('apex-poker-page');
        if (page) page.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();


// ============================================================
// 电子全屏子页面 - APEX-SLOT-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'slots', label: 'Slots', items: [
      { en: 'Classic Slots', zh: '经典老虎机' },
      { en: 'Video Slots', zh: '视频老虎机' },
      { en: '3-Reel Slots', zh: '三轴' },
      { en: '5-Reel Slots', zh: '五轴' },
      { en: 'Multi-Reel', zh: '多轴' },
      { en: 'Branded Slots', zh: '品牌主题' }
    ]},
    { key: 'jackpot', label: 'Jackpot', items: [
      { en: 'Progressive Jackpot', zh: '累进奖池' },
      { en: 'Fixed Jackpot', zh: '固定奖池' },
      { en: 'Local Jackpot', zh: '本地奖池' },
      { en: 'Network Jackpot', zh: '联网奖池' },
      { en: 'Mystery Jackpot', zh: '神秘奖池' }
    ]},
    { key: 'mech', label: '中奖机制', items: [
      { en: 'Megaways', zh: 'Megaways' },
      { en: 'Cluster Pays', zh: 'Cluster Pays' },
      { en: 'Ways to Win', zh: 'Ways to Win' },
      { en: 'Cascading Reels', zh: '连锁消除' },
      { en: 'Tumble', zh: 'Tumble' },
      { en: 'Hold & Win', zh: 'Hold & Win' },
      { en: 'All Ways', zh: 'All Ways' }
    ]},
    { key: 'bonus', label: 'Bonus类', items: [
      { en: 'Free Spins', zh: '免费旋转' },
      { en: 'Bonus Buy', zh: '奖励购买' },
      { en: 'Pick Bonus', zh: 'Pick Bonus' },
      { en: 'Gamble Feature', zh: 'Gamble Feature' },
      { en: 'Multiplier', zh: '倍率' },
      { en: 'Respins', zh: '重转' }
    ]},
    { key: 'vp', label: 'Video Poker', items: [
      { en: 'Jacks or Better', zh: 'Jacks or Better' },
      { en: 'Deuces Wild', zh: 'Deuces Wild' },
      { en: 'Joker Poker', zh: 'Joker Poker' },
      { en: 'Bonus Poker', zh: 'Bonus Poker' },
      { en: 'Aces & Faces', zh: 'Aces & Faces' }
    ]},
    { key: 'etable', label: '电子桌面', items: [
      { en: 'Electronic Baccarat', zh: '电子百家樂' },
      { en: 'Electronic Blackjack', zh: '电子21点' },
      { en: 'Electronic Roulette', zh: '电子轮盘' },
      { en: 'Electronic Sic Bo', zh: '电子骰宝' },
      { en: 'Electronic Craps', zh: '电子Craps' }
    ]},
    { key: 'other', label: '其他电子', items: [
      { en: 'Pachinko', zh: '弹珠机' },
      { en: 'Video Bingo', zh: '视频宾果' },
      { en: 'Video Keno', zh: '视频基诺' },
      { en: 'Fish Games', zh: '捕鱼游戏' },
      { en: 'Arcade Casino Games', zh: '街机类' }
    ]}
  ];

  var ICONS = {
    slots:   '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>',
    jackpot: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 10h6M9 14h6"/>',
    mech:    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    bonus:   '<path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    vp:      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
    etable:  '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h10M7 16h10"/>',
    other:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-slot-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-slot-page';
    wrap.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-slot-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">电子</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-slot-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(ICONS[cat.key])
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-slot-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    document.getElementById('apex-slot-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    var sideEl = document.getElementById('apex-slot-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-slot-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var ic = ICONS[cat.key] || ICONS.slots;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    var btn = document.querySelector('.apex-cats .apex-cat[data-cat="slot"]');
    if (btn) {
      var nb = btn.cloneNode(true);
      btn.parentNode.replaceChild(nb, btn);
      nb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var page = document.getElementById('apex-slot-page');
        if (page) page.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();


// ============================================================
// 骰子全屏子页面 - APEX-DICE-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'sicbo', label: 'Sic Bo', items: [
      { en: 'Big / Small', zh: '大小' },
      { en: 'Odd / Even', zh: '单双' },
      { en: 'Single Dice', zh: '单骰' },
      { en: 'Double Dice', zh: '双骰' },
      { en: 'Triple Dice', zh: '三骰' }
    ]},
    { key: 'craps', label: 'Craps', items: [
      { en: 'Pass Line', zh: '过线' },
      { en: "Don't Pass", zh: '不过线' },
      { en: 'Come', zh: '来注' },
      { en: "Don't Come", zh: '不来注' },
      { en: 'Proposition Bets', zh: '提议赌注' }
    ]},
    { key: 'dice', label: 'Dice', items: [
      { en: 'High / Low', zh: '高低' },
      { en: 'Odd / Even', zh: '单双' },
      { en: 'Over / Under', zh: '大小区间' },
      { en: 'Exact Number', zh: '指定点数' },
      { en: 'Dice Combination', zh: '组合' }
    ]},
    { key: 'hilo', label: 'Hi-Lo', items: [
      { en: 'High', zh: '高' },
      { en: 'Low', zh: '低' },
      { en: 'Same', zh: '相同' },
      { en: 'Higher / Lower', zh: '更高/更低' },
      { en: 'Multi-Round', zh: '多轮' }
    ]},
    { key: 'wheel', label: 'Wheel', items: [
      { en: 'Big Wheel', zh: '幸运大转盘' },
      { en: 'Money Wheel', zh: '金钱转盘' },
      { en: 'Number Wheel', zh: '数字转盘' },
      { en: 'Fortune Wheel', zh: '幸运轮' },
      { en: 'Multiplier Wheel', zh: '倍率转盘' }
    ]}
  ];

  var ICONS = {
    sicbo: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    craps: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/>',
    dice:  '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    hilo:  '<path d="M4 8 12 4 20 8v8l-8 4-8-4z"/><path d="M12 8v8M8 12h8"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-dice-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-dice-page';
    wrap.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-dice-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">骰子</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-dice-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(ICONS[cat.key])
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-dice-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    document.getElementById('apex-dice-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    var sideEl = document.getElementById('apex-dice-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-dice-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var ic = ICONS[cat.key] || ICONS.dice;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    var btn = document.querySelector('.apex-cats .apex-cat[data-cat="dice"]');
    if (btn) {
      var nb = btn.cloneNode(true);
      btn.parentNode.replaceChild(nb, btn);
      nb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var page = document.getElementById('apex-dice-page');
        if (page) page.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();


// ============================================================
// 体育全屏子页面 - APEX-SPORTS-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'football', label: '足球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Handicap', zh: '让球' },
      { en: 'Over / Under', zh: '大小' },
      { en: 'Correct Score', zh: '比分' },
      { en: 'Both Teams to Score', zh: '双方进球' }
    ]},
    { key: 'basketball', label: '篮球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Point Spread', zh: '分差' },
      { en: 'Over / Under', zh: '大小' },
      { en: 'Quarter Markets', zh: '单节' },
      { en: 'Player Props', zh: '球员数据' }
    ]},
    { key: 'tennis', label: '网球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Set Winner', zh: '盘胜' },
      { en: 'Game Handicap', zh: '局让' },
      { en: 'Total Games', zh: '总局数' },
      { en: 'Correct Score', zh: '正确比分' }
    ]},
    { key: 'baseball', label: '棒球', items: [
      { en: 'Moneyline', zh: '胜负' },
      { en: 'Run Line', zh: '让分' },
      { en: 'Total Runs', zh: '总分' },
      { en: 'Innings', zh: '单局' },
      { en: 'Player Props', zh: '球员数据' }
    ]},
    { key: 'hockey', label: '冰球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Puck Line', zh: '让分' },
      { en: 'Total Goals', zh: '总进球' },
      { en: 'Period Markets', zh: '单节' },
      { en: 'Correct Score', zh: '正确比分' }
    ]},
    { key: 'rugby', label: '橄榄球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Handicap', zh: '让分' },
      { en: 'Total Points', zh: '总分' },
      { en: 'Correct Score', zh: '正确比分' }
    ]},
    { key: 'cricket', label: '板球', items: [
      { en: 'Match Winner', zh: '胜负' },
      { en: 'Innings', zh: '局' },
      { en: 'Runs', zh: '得分' },
      { en: 'Player Performance', zh: '球员表现' }
    ]},
    { key: 'boxing', label: '拳击', items: [
      { en: 'Fight Winner', zh: '胜者' },
      { en: 'Method of Victory', zh: '获胜方式' },
      { en: 'Round', zh: '回合' },
      { en: 'Total Rounds', zh: '总回合' }
    ]},
    { key: 'mma', label: 'MMA', items: [
      { en: 'Fight Winner', zh: '胜者' },
      { en: 'Method of Victory', zh: '获胜方式' },
      { en: 'Round', zh: '回合' },
      { en: 'Fight Duration', zh: '比赛时长' }
    ]},
    { key: 'other', label: '其他体育', items: [
      { en: 'Golf', zh: '高尔夫' },
      { en: 'Volleyball', zh: '排球' },
      { en: 'Badminton', zh: '羽毛球' },
      { en: 'Table Tennis', zh: '乒乓球' },
      { en: 'Handball', zh: '手球' },
      { en: 'Darts', zh: '飞镖' },
      { en: 'Snooker', zh: '斯诺克' },
      { en: 'Cycling', zh: '自行车' },
      { en: 'Swimming', zh: '游泳' },
      { en: 'Athletics', zh: '田径' },
      { en: 'Skiing', zh: '滑雪' },
      { en: 'Motorsports', zh: '赛车' }
    ]}
  ];

  var ICONS = {
    football:   '<circle cx="12" cy="12" r="9"/><path d="M12 7l3 2v4l-3 2-3-2V9z"/>',
    basketball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5 5l14 14M19 5L5 19"/>',
    tennis:     '<circle cx="12" cy="12" r="9"/><path d="M5 5c3 3 3 11 0 14M19 5c-3 3-3 11 0 14"/>',
    baseball:   '<circle cx="12" cy="12" r="9"/><path d="M6 6c3 3 3 9 0 12M18 6c-3 3-3 9 0 12"/>',
    hockey:     '<circle cx="12" cy="12" r="9"/><path d="M4 10h16M4 14h16"/>',
    rugby:      '<ellipse cx="12" cy="12" rx="9" ry="6"/><path d="M8 9v6M12 9v6M16 9v6"/>',
    cricket:    '<circle cx="12" cy="12" r="9"/><path d="M8 5v14M16 5v14"/>',
    boxing:     '<path d="M6 6h6a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M14 8h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/>',
    mma:        '<circle cx="12" cy="12" r="9"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
    other:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-sports-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-sports-page';
    wrap.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-sports-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">体育</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-sports-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(ICONS[cat.key])
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-sports-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    document.getElementById('apex-sports-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    var sideEl = document.getElementById('apex-sports-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-sports-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var ic = ICONS[cat.key] || ICONS.other;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    var btn = document.querySelector('.apex-cats .apex-cat[data-cat="sports"]');
    if (btn) {
      var nb = btn.cloneNode(true);
      btn.parentNode.replaceChild(nb, btn);
      nb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var page = document.getElementById('apex-sports-page');
        if (page) page.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();


// ============================================================
// 赛事全屏子页面 - APEX-EVENTS-PAGE
// ============================================================
(function () {
  var DATA = [
    { key: 'horse', label: '赛马', items: [
      { en: 'Win', zh: '独赢' },
      { en: 'Place', zh: '位置' },
      { en: 'Each-Way', zh: '前二' },
      { en: 'Exacta', zh: '连赢' },
      { en: 'Quinella', zh: '连赢位置' },
      { en: 'Trifecta', zh: '三重彩' },
      { en: 'Superfecta', zh: '四重彩' }
    ]},
    { key: 'greyhound', label: '赛狗', items: [
      { en: 'Win', zh: '独赢' },
      { en: 'Place', zh: '位置' },
      { en: 'Forecast', zh: '预测' },
      { en: 'Exacta', zh: '连赢' },
      { en: 'Tricast', zh: '三连' }
    ]},
    { key: 'motor', label: '赛车', items: [
      { en: 'Formula 1', zh: 'F1 一级方程式' },
      { en: 'MotoGP', zh: 'MotoGP 摩托' },
      { en: 'NASCAR', zh: 'NASCAR' },
      { en: 'IndyCar', zh: 'IndyCar' },
      { en: 'Rally', zh: '拉力赛' }
    ]},
    { key: 'virtual', label: '虚拟赛事', items: [
      { en: 'Virtual Horse Racing', zh: '虚拟赛马' },
      { en: 'Virtual Greyhound', zh: '虚拟赛狗' },
      { en: 'Virtual Motor Racing', zh: '虚拟赛车' },
      { en: 'Virtual Football', zh: '虚拟足球' },
      { en: 'Virtual Cycling', zh: '虚拟自行车' }
    ]},
    { key: 'animal', label: '动物赛事', items: [
      { en: 'Camel Racing', zh: '骆驼赛' },
      { en: 'Pigeon Racing', zh: '信鸽赛' },
      { en: 'Other Animal Racing', zh: '其他动物赛' }
    ]},
    { key: 'pool', label: 'Pool / Tote', items: [
      { en: 'Win Pool', zh: '独赢池' },
      { en: 'Place Pool', zh: '位置池' },
      { en: 'Exacta Pool', zh: '连赢池' },
      { en: 'Trifecta Pool', zh: '三重彩池' },
      { en: 'Jackpot Pool', zh: '累积奖池' }
    ]}
  ];

  var ICONS = {
    horse:     '<path d="M4 18l2-8a3 3 0 0 1 3-2h4l3-2 2 3 3 1-2 2 2 6"/>',
    greyhound: '<path d="M3 14l4-4a3 3 0 0 1 4 0l4 2 4-1v4l-3 3H8z"/><circle cx="7" cy="10" r="1" fill="currentColor"/>',
    motor:     '<path d="M4 16l2-4 4-2h4l4 2 2 4"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/>',
    virtual:   '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M9 11l3 2 3-2"/><path d="M8 20h8"/>',
    animal:    '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 16c2 1 4 1 6 0"/>',
    pool:      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/>'
  };

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-events-page')) return;
    var wrap = document.createElement('div');
    wrap.id = 'apex-events-page';
    wrap.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-events-back">'
      + svg('<polyline points="15 18 9 12 15 6"/>')
      + '</button>'
      + '<div class="apex-hot-title">赛事</div>'
      + '</div>';

    var side = '<div class="apex-hot-side" id="apex-events-side">';
    DATA.forEach(function (cat, i) {
      side += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + svg(ICONS[cat.key])
        + '<span>' + cat.label + '</span>'
        + '</button>';
    });
    side += '</div>';

    var list = '<div class="apex-hot-list" id="apex-events-list"></div>';

    wrap.innerHTML = header + '<div class="apex-hot-body">' + side + list + '</div>';
    document.body.appendChild(wrap);

    document.getElementById('apex-events-back').addEventListener('click', function () {
      wrap.style.display = 'none';
    });

    var sideEl = document.getElementById('apex-events-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) {
          el.classList.toggle('is-active', el === btn);
        });
        renderList(key);
      });
    });

    renderList(DATA[0].key);
  }

  function renderList(key) {
    var listEl = document.getElementById('apex-events-list');
    if (!listEl) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;

    var ic = ICONS[cat.key] || ICONS.pool;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + svg(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        +   '<div class="apex-hot-item-title">' + it.en + '</div>'
        +   '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    listEl.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.dataset.name;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(name + ' 开发中，敬请期待', 'info');
        }
      });
    });
  }

  function init() {
    build();
    var btn = document.querySelector('.apex-cats .apex-cat[data-cat="events"]');
    if (btn) {
      var nb = btn.cloneNode(true);
      btn.parentNode.replaceChild(nb, btn);
      nb.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var page = document.getElementById('apex-events-page');
        if (page) page.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
