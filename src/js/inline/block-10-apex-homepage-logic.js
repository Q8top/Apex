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


// 即时游戏全屏子页面 - APEX-INSTANT-PAGE
(function () {
  var DATA = [
    { key: 'crash', label: 'Crash', items: [
      { en: 'Classic Crash', zh: '经典 Crash' },
      { en: 'Turbo Crash', zh: '极速 Crash' },
      { en: 'Multiplier Crash', zh: '倍率 Crash' },
      { en: 'Auto Cashout', zh: '自动兑现' },
      { en: 'Progressive Crash', zh: '渐进 Crash' }
    ]},
    { key: 'mines', label: 'Mines', items: [
      { en: 'Classic Mines', zh: '经典 Mines' },
      { en: 'Grid Mines', zh: '网格 Mines' },
      { en: 'Multi-Mines', zh: '多雷 Mines' },
      { en: 'Progressive Mines', zh: '渐进 Mines' }
    ]},
    { key: 'plinko', label: 'Plinko', items: [
      { en: 'Classic Plinko', zh: '经典 Plinko' },
      { en: 'Multiplier Plinko', zh: '倍率 Plinko' },
      { en: 'Risk Plinko', zh: '风险 Plinko' },
      { en: 'Progressive Plinko', zh: '渐进 Plinko' }
    ]},
    { key: 'tower', label: 'Tower', items: [
      { en: 'Classic Tower', zh: '经典 Tower' },
      { en: 'Multiplier Tower', zh: '倍率 Tower' },
      { en: 'Risk Tower', zh: '风险 Tower' },
      { en: 'Progressive Tower', zh: '渐进 Tower' }
    ]},
    { key: 'limbo', label: 'Limbo', items: [
      { en: 'Classic Limbo', zh: '经典 Limbo' },
      { en: 'High Multiplier Limbo', zh: '高倍率 Limbo' },
      { en: 'Multi-Round Limbo', zh: '多轮 Limbo' }
    ]},
    { key: 'dice', label: 'Dice', items: [
      { en: 'Roll Over', zh: '大于' },
      { en: 'Roll Under', zh: '小于' },
      { en: 'High / Low', zh: '高低' },
      { en: 'Multiplier Dice', zh: '倍率骰子' }
    ]},
    { key: 'keno', label: 'Keno', items: [
      { en: 'Classic Keno', zh: '经典基诺' },
      { en: '20/80 Keno', zh: '20/80 基诺' },
      { en: 'Multi-Draw Keno', zh: '多期基诺' },
      { en: 'Speed Keno', zh: '极速基诺' },
      { en: 'Video Keno', zh: '视频基诺' }
    ]},
    { key: 'bingo', label: 'Bingo', items: [
      { en: '30-Ball Bingo', zh: '30 球宾果' },
      { en: '50-Ball Bingo', zh: '50 球宾果' },
      { en: '75-Ball Bingo', zh: '75 球宾果' },
      { en: '80-Ball Bingo', zh: '80 球宾果' },
      { en: '90-Ball Bingo', zh: '90 球宾果' }
    ]},
    { key: 'scratch', label: 'Scratch', items: [
      { en: 'Scratch Cards', zh: '刮刮卡' },
      { en: 'Digital Scratch', zh: '数字刮刮乐' },
      { en: 'Instant Scratch', zh: '即开刮刮乐' },
      { en: 'Progressive Scratch', zh: '渐进刮刮乐' }
    ]},
    { key: 'instant', label: '即时赢', items: [
      { en: 'Match 3', zh: '三消' },
      { en: 'Match 4', zh: '四消' },
      { en: 'Pick & Win', zh: '选赢' },
      { en: 'Prize Reveal', zh: '揭奖' },
      { en: 'Instant Jackpot', zh: '即开奖池' },
      { en: 'Instant Bonus', zh: '即开奖励' }
    ]}
  ];

  var I = {
    crash:   '<path d="M3 17l6-6 4 4 8-9"/><path d="M17 6h4v4"/>',
    mines:   '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19"/>',
    plinko:  '<circle cx="12" cy="4" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="6" cy="20" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
    tower:   '<path d="M6 20V8h12v12"/><path d="M6 12h12M6 16h12"/>',
    limbo:   '<path d="M4 12h16M12 4v16"/>',
    dice:    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    keno:    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    bingo:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    scratch: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h3M7 14h3"/>',
    instant: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'
  };

  function s(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-instant-page')) return;
    var w = document.createElement('div');
    w.id = 'apex-instant-page';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var hd = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-instant-back">' + s('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">即时游戏</div>'
      + '</div>';

    var sd = '<div class="apex-hot-side" id="apex-instant-side">';
    DATA.forEach(function (cat, i) {
      sd += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + s(I[cat.key]) + '<span>' + cat.label + '</span></button>';
    });
    sd += '</div>';

    w.innerHTML = hd + '<div class="apex-hot-body">' + sd + '<div class="apex-hot-list" id="apex-instant-list"></div></div>';
    document.body.appendChild(w);

    document.getElementById('apex-instant-back').addEventListener('click', function () { w.style.display = 'none'; });

    var sideEl = document.getElementById('apex-instant-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) { el.classList.toggle('is-active', el === b); });
        render(k);
      });
    });
    render(DATA[0].key);
  }

  function render(key) {
    var le = document.getElementById('apex-instant-list');
    if (!le) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;
    var ic = I[cat.key] || I.instant;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + s(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        + '<div class="apex-hot-item-title">' + it.en + '</div>'
        + '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + s('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    le.innerHTML = html;
    le.scrollTop = 0;
    le.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (window.__apex && window.__apex.toast) window.__apex.toast(el.dataset.name + ' 开发中，敬请期待', 'info');
      });
    });
  }

  function init() {
    build();
    var b = document.querySelector('.apex-cats .apex-cat[data-cat="instant"]');
    if (b) {
      var nb = b.cloneNode(true);
      b.parentNode.replaceChild(nb, b);
      nb.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var p = document.getElementById('apex-instant-page');
        if (p) p.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 100);
})();


// 电竞全屏子页面 - APEX-ESPORTS-PAGE
(function () {
  var DATA = [
    { key: 'lol', label: '英雄联盟', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Map Winner', zh: '单图胜负' },
      { en: 'Total Kills', zh: '总击杀' },
      { en: 'First Blood', zh: '首杀' },
      { en: 'First Tower', zh: '首塔' }
    ]},
    { key: 'cs', label: 'Counter-Strike', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Map Winner', zh: '单图胜负' },
      { en: 'Round Handicap', zh: '局让分' },
      { en: 'Total Rounds', zh: '总局数' },
      { en: 'Player Performance', zh: '选手表现' }
    ]},
    { key: 'dota', label: 'Dota 2', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Map Winner', zh: '单图胜负' },
      { en: 'Total Kills', zh: '总击杀' },
      { en: 'First Blood', zh: '首杀' },
      { en: 'First Tower', zh: '首塔' }
    ]},
    { key: 'valorant', label: '无畏契约', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Map Winner', zh: '单图胜负' },
      { en: 'Round Handicap', zh: '局让分' },
      { en: 'Total Rounds', zh: '总局数' },
      { en: 'First Map', zh: '首图' }
    ]},
    { key: 'pubg', label: 'PUBG', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Tournament Winner', zh: '锦标赛冠军' },
      { en: 'Placement', zh: '名次' },
      { en: 'Total Kills', zh: '总击杀' }
    ]},
    { key: 'fc', label: 'EA Sports FC', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Correct Score', zh: '正确比分' },
      { en: 'Total Goals', zh: '总进球' },
      { en: 'Handicap', zh: '让分' }
    ]},
    { key: 'rl', label: 'Rocket League', items: [
      { en: 'Match Winner', zh: '比赛胜负' },
      { en: 'Map Winner', zh: '单图胜负' },
      { en: 'Total Goals', zh: '总进球' },
      { en: 'Handicap', zh: '让分' }
    ]},
    { key: 'other', label: '其他电竞', items: [
      { en: 'Overwatch 2', zh: '守望先锋 2' },
      { en: 'Rainbow Six Siege', zh: '彩虹六号' },
      { en: 'StarCraft II', zh: '星际争霸 II' },
      { en: 'Warcraft III', zh: '魔兽争霸 III' },
      { en: 'Call of Duty', zh: '使命召唤' },
      { en: 'Fortnite', zh: '堡垒之夜' },
      { en: 'Mobile Legends', zh: 'Mobile Legends' },
      { en: 'Honor of Kings', zh: '王者荣耀' },
      { en: 'Free Fire', zh: 'Free Fire' }
    ]}
  ];

  var I = {
    lol:      '<path d="M4 20l4-4M20 4l-4 4M12 4v16M4 12h16"/>',
    cs:       '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 12h9"/>',
    dota:     '<path d="M4 12 12 4l8 8-8 8z"/><path d="M12 4v16M4 12h16"/>',
    valorant: '<path d="M4 6v12M20 6v12M8 6l4 8 4-8"/>',
    pubg:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h10"/>',
    fc:       '<circle cx="12" cy="12" r="9"/><path d="M12 7l3 2v4l-3 2-3-2V9z"/>',
    rl:       '<circle cx="9" cy="14" r="3"/><circle cx="15" cy="14" r="3"/><path d="M9 8h6"/>',
    other:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>'
  };

  function s(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-esports-page')) return;
    var w = document.createElement('div');
    w.id = 'apex-esports-page';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var hd = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-esports-back">' + s('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">电竞</div>'
      + '</div>';

    var sd = '<div class="apex-hot-side" id="apex-esports-side">';
    DATA.forEach(function (cat, i) {
      sd += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + s(I[cat.key]) + '<span>' + cat.label + '</span></button>';
    });
    sd += '</div>';

    w.innerHTML = hd + '<div class="apex-hot-body">' + sd + '<div class="apex-hot-list" id="apex-esports-list"></div></div>';
    document.body.appendChild(w);

    document.getElementById('apex-esports-back').addEventListener('click', function () { w.style.display = 'none'; });

    var sideEl = document.getElementById('apex-esports-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) { el.classList.toggle('is-active', el === b); });
        render(k);
      });
    });
    render(DATA[0].key);
  }

  function render(key) {
    var le = document.getElementById('apex-esports-list');
    if (!le) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;
    var ic = I[cat.key] || I.other;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + s(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        + '<div class="apex-hot-item-title">' + it.en + '</div>'
        + '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + s('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    le.innerHTML = html;
    le.scrollTop = 0;
    le.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (window.__apex && window.__apex.toast) window.__apex.toast(el.dataset.name + ' 开发中，敬请期待', 'info');
      });
    });
  }

  function init() {
    build();
    var b = document.querySelector('.apex-cats .apex-cat[data-cat="esports"]');
    if (b) {
      var nb = b.cloneNode(true);
      b.parentNode.replaceChild(nb, b);
      nb.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var p = document.getElementById('apex-esports-page');
        if (p) p.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 100);
})();


// 特殊/新型全屏子页面 - APEX-SPECIAL-PAGE
(function () {
  var DATA = [
    { key: 'fantasy', label: '梦幻体育', items: [
      { en: 'Fantasy Football', zh: '梦幻足球' },
      { en: 'Fantasy Basketball', zh: '梦幻篮球' },
      { en: 'Fantasy Baseball', zh: '梦幻棒球' },
      { en: 'Fantasy Cricket', zh: '梦幻板球' },
      { en: 'Fantasy Hockey', zh: '梦幻冰球' }
    ]},
    { key: 'predict', label: '预测市场', items: [
      { en: 'Sports Events', zh: '体育事件' },
      { en: 'Entertainment', zh: '娱乐事件' },
      { en: 'Economic Events', zh: '经济事件' },
      { en: 'Weather Events', zh: '天气事件' },
      { en: 'Other Events', zh: '其他事件' }
    ]},
    { key: 'p2p', label: 'P2P', items: [
      { en: 'Peer-to-Peer', zh: '点对点' },
      { en: 'Head-to-Head', zh: '一对一' },
      { en: 'Player Pools', zh: '玩家池' },
      { en: 'Tournament Pools', zh: '锦标赛池' }
    ]},
    { key: 'exchange', label: 'Exchange', items: [
      { en: 'Back / Lay', zh: '买/卖' },
      { en: 'Sports Exchange', zh: '体育交易所' },
      { en: 'Racing Exchange', zh: '赛马交易所' },
      { en: 'Event Exchange', zh: '事件交易所' }
    ]},
    { key: 'skill', label: 'Skill Games', items: [
      { en: 'Skill Poker', zh: '技巧扑克' },
      { en: 'Fantasy Games', zh: '梦幻游戏' },
      { en: 'Competitive Card Games', zh: '竞技卡牌' },
      { en: 'Competitive Arcade Games', zh: '竞技街机' }
    ]},
    { key: 'hybrid', label: 'Hybrid', items: [
      { en: 'Slot + Table', zh: '老虎机 + 桌面' },
      { en: 'Slot + Bingo', zh: '老虎机 + 宾果' },
      { en: 'Bingo + Arcade', zh: '宾果 + 街机' },
      { en: 'Poker + Slots', zh: '扑克 + 老虎机' },
      { en: 'Sports + Fantasy', zh: '体育 + 梦幻' }
    ]},
    { key: 'show', label: 'Game Show', items: [
      { en: 'Wheel Games', zh: '转盘游戏' },
      { en: 'Quiz Games', zh: '问答游戏' },
      { en: 'Prize Games', zh: '奖品游戏' },
      { en: 'Random Pick Games', zh: '随机抽取' }
    ]},
    { key: 'vgames', label: 'Virtual', items: [
      { en: 'Virtual Sports', zh: '虚拟体育' },
      { en: 'Virtual Racing', zh: '虚拟赛马' },
      { en: 'Virtual Football', zh: '虚拟足球' },
      { en: 'Virtual Animals', zh: '虚拟动物' }
    ]},
    { key: 'novel', label: 'Novel', items: [
      { en: 'Multiplier Games', zh: '倍率游戏' },
      { en: 'Social Games', zh: '社交玩法' },
      { en: 'Tournament Games', zh: '锦标赛玩法' },
      { en: 'Progressive Games', zh: '累进玩法' },
      { en: 'Community Games', zh: '社区玩法' }
    ]}
  ];

  var I = {
    fantasy: '<path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    predict: '<path d="M3 12h4l3-9 4 18 3-9h4"/>',
    p2p:     '<circle cx="9" cy="12" r="3"/><circle cx="15" cy="12" r="3"/>',
    exchange:'<path d="M4 8h12l-3-3M20 16H8l3 3"/>',
    skill:   '<path d="M6 4v16M18 4v16M9 8h6M9 16h6"/>',
    hybrid:  '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    show:    '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
    vgames:  '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 10h3M8 14h8"/>',
    novel:   '<path d="M4 6h16M4 12h16M4 18h10"/>'
  };

  function s(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-special-page')) return;
    var w = document.createElement('div');
    w.id = 'apex-special-page';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:500;display:none;flex-direction:column;overflow:hidden;';

    var hd = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-special-back">' + s('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">特殊 / 新型</div>'
      + '</div>';

    var sd = '<div class="apex-hot-side" id="apex-special-side">';
    DATA.forEach(function (cat, i) {
      sd += '<button class="apex-hot-side-item' + (i === 0 ? ' is-active' : '') + '" data-key="' + cat.key + '">'
        + s(I[cat.key]) + '<span>' + cat.label + '</span></button>';
    });
    sd += '</div>';

    w.innerHTML = hd + '<div class="apex-hot-body">' + sd + '<div class="apex-hot-list" id="apex-special-list"></div></div>';
    document.body.appendChild(w);

    document.getElementById('apex-special-back').addEventListener('click', function () { w.style.display = 'none'; });

    var sideEl = document.getElementById('apex-special-side');
    sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.key;
        sideEl.querySelectorAll('.apex-hot-side-item').forEach(function (el) { el.classList.toggle('is-active', el === b); });
        render(k);
      });
    });
    render(DATA[0].key);
  }

  function render(key) {
    var le = document.getElementById('apex-special-list');
    if (!le) return;
    var cat = DATA.find(function (c) { return c.key === key; });
    if (!cat) return;
    var ic = I[cat.key] || I.novel;
    var html = '';
    cat.items.forEach(function (it) {
      html += '<div class="apex-hot-item" data-name="' + it.en + '">'
        + '<div class="apex-hot-item-icon">' + s(ic) + '</div>'
        + '<div class="apex-hot-item-info">'
        + '<div class="apex-hot-item-title">' + it.en + '</div>'
        + '<div class="apex-hot-item-sub">' + it.zh + '</div>'
        + '</div>'
        + '<span class="apex-hot-item-arrow">' + s('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</div>';
    });
    le.innerHTML = html;
    le.scrollTop = 0;
    le.querySelectorAll('.apex-hot-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (window.__apex && window.__apex.toast) window.__apex.toast(el.dataset.name + ' 开发中，敬请期待', 'info');
      });
    });
  }

  function init() {
    build();
    var b = document.querySelector('.apex-cats .apex-cat[data-cat="special"]');
    if (b) {
      var nb = b.cloneNode(true);
      b.parentNode.replaceChild(nb, b);
      nb.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var p = document.getElementById('apex-special-page');
        if (p) p.style.display = 'flex';
      }, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 100);
})();


// ============================================================
// 百家樂玩法选择 - APEX-BACCARAT-MODES
// ============================================================
(function () {
  var MODES = [
    { en: 'Punto Banco',           zh: '彭托银行' },
    { en: 'Mini Baccarat',         zh: '迷你百家樂' },
    { en: 'No Commission Baccarat',zh: '免佣百家樂' },
    { en: 'Speed Baccarat',        zh: '极速百家樂' },
    { en: 'Baccarat Variants',     zh: '百家樂变体' }
  ];

  var ICON = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10h6M9 14h6"/>';

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function build() {
    if (document.getElementById('apex-baccarat-modes')) return;

    var w = document.createElement('div');
    w.id = 'apex-baccarat-modes';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:600;display:none;flex-direction:column;overflow:hidden;';

    var hd = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-baccarat-back">' + svg('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">百家樂</div>'
      + '</div>';

    var list = '<div class="apex-mode-list">';
    MODES.forEach(function (m) {
      list += '<button class="apex-mode-card" data-mode="' + m.en + '">'
        + '<div class="apex-mode-icon">' + svg(ICON) + '</div>'
        + '<div class="apex-mode-info">'
        +   '<div class="apex-mode-title">' + m.en + '</div>'
        +   '<div class="apex-mode-sub">' + m.zh + '</div>'
        + '</div>'
        + '<span class="apex-mode-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</button>';
    });
    list += '</div>';

    w.innerHTML = hd + list;
    document.body.appendChild(w);

    document.getElementById('apex-baccarat-back').addEventListener('click', function () {
      w.style.display = 'none';
    });

    w.querySelectorAll('.apex-mode-card').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.dataset.mode;
        if (window.__apex && window.__apex.toast) {
          window.__apex.toast(mode + ' 游戏开发中，敬请期待', 'info');
        }
      });
    });
  }

  // 百家樂独立监听已禁用（统一走通用组件）
})();


// ============================================================



// ============================================================



// ============================================================
// 规则页 v3 - 分层信息架构
// ============================================================
(function () {
  var SLIDES = [
    { title: '图一', sub: 'Banner 1' },
    { title: '图二', sub: 'Banner 2' },
    { title: '图三', sub: 'Banner 3' },
    { title: '图四', sub: 'Banner 4' }
  ];

  var RULES = {
    'Punto Banco': {
      zh: '标准百家樂',
      tagline: '比较庄（Banker）与闲（Player）的最终点数，9 点为最高点数。玩家选择投注项目后，发牌、补牌及结算均按照固定规则自动完成。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '选择你要投注的项目：庄（Banker）／闲（Player）／和（Tie）／庄对／闲对' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌，系统自动完成。' },
        { n: 3, title: '自动补牌', desc: '根据固定规则判断是否需要第三张牌，玩家无需决定要牌或停牌。' },
        { n: 4, title: '比较点数', desc: '最终点数越接近 9 点的一方获胜。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: [
          '8 + 7 = 15 → 5 点',
          '9 + 6 + 8 = 23 → 3 点'
        ],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '如果庄或闲的前两张牌合计为 8 点或 9 点，称为"天牌（Natural）"。出现天牌时，按照规则不再补第三张牌。',
        examples: [
          '闲：4 + 4 = 8 点 → 闲家天牌',
          '庄：K + 9 = 9 点 → 庄家天牌'
        ],
        note: '若双方均为天牌，则直接比较 8 点或 9 点。'
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '闲家 0–5 点补牌，6–7 点停牌；庄家按照固定规则自动判断。'
      },
      outcome: {
        desc: '比较庄与闲的最终点数：',
        rows: [
          { cond: '庄点数 > 闲点数', result: '庄胜' },
          { cond: '闲点数 > 庄点数', result: '闲胜' },
          { cond: '庄点数 = 闲点数', result: '和（Tie）' }
        ]
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      oddsExample: '例如：下注 100 于庄，庄胜时净赢 95，并返还下注本金 100。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。本版本规则：',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ],
        example: '例如：庄 6 点 · 闲 6 点 → 和局'
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家的前两张牌牌面相同（如 7♠ + 7♥）' },
          { t: '闲对 Player Pair', d: '闲家的前两张牌牌面相同（如 K♣ + K♦）' }
        ],
        note: '标准百家樂对子通常以前两张牌 Rank 相同为准，例如 7+7、K+K。'
      },
      examples: [
        { title: '示例 01｜闲胜', lines: ['闲：7 + 2 = 9 点', '庄：4 + 3 = 7 点'], result: '结果：闲胜' },
        { title: '示例 02｜补第三张牌', lines: ['闲：4 + 2 = 6 点 → 补牌', '第三张：7', '最终：4 + 2 + 7 = 13 → 3 点'], result: '系统继续按庄家规则判断是否补牌。' },
        { title: '示例 03｜和局', lines: ['闲：8 + K = 8 点', '庄：5 + 3 = 8 点'], result: '结果：和局（Tie）' }
      ],
      terms: [
        { en: 'Banker', zh: '庄，庄家一方' },
        { en: 'Player', zh: '闲，闲家一方' },
        { en: 'Tie', zh: '和，庄、闲最终点数相同' },
        { en: 'Natural', zh: '天牌，前两张牌合计为 8 或 9 点' },
        { en: 'Banker Pair', zh: '庄对，庄家前两张牌构成对子' },
        { en: 'Player Pair', zh: '闲对，闲家前两张牌构成对子' },
        { en: 'Point', zh: '点数，庄、闲最终牌面点数，最高为 9 点' }
      ],
      faq: [
        { q: '我可以选择第三张牌吗？', a: '不能。庄、闲是否补第三张牌，以及补哪一张牌，均由发牌结果和固定规则决定。' },
        { q: '10、J、Q、K 算多少点？', a: '均为 0 点。' },
        { q: '为什么 8 + 7 是 5 点？', a: '15 只取个位数：8 + 7 = 15 → 5 点。' },
        { q: '9 点是不是最大的？', a: '是。百家樂最终点数范围为 0–9 点，其中 9 点最高。' },
        { q: '庄和闲都是 8 点怎么办？', a: '判定为和局（Tie）。' },
        { q: '天牌还会继续发第三张牌吗？', a: '不会。庄或闲前两张牌合计为 8 或 9 点时，按照规则停止补牌。' },
        { q: '庄和闲哪个一定更容易赢？', a: '不能根据单局结果确定。每局发牌结果具有随机性，历史结果不能保证下一局结果。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。玩家无法控制具体发牌结果或第三张牌。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },
    'Mini Baccarat': {
      zh: '迷你百家樂',
      tagline: '标准百家樂的小型版本，赌桌更紧凑、节奏更快、限红更低，非常适合新手与快速下注。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '庄（Banker）、闲（Player）、和（Tie），或庄对／闲对。' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌，荷官固定担任庄家。' },
        { n: 3, title: '自动补牌', desc: '按标准百家樂规则判断是否补第三张，玩家无需决策。' },
        { n: 4, title: '比较点数', desc: '点数更接近 9 点的一方获胜。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂完全相同；区别在于赌桌更小（通常 7 座）、限红更低、节奏更快。'
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同（如 7♠ + 7♥）' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同（如 K♣ + K♦）' }
        ]
      },
      terms: [
        { en: 'Banker', zh: '庄，庄家一方' },
        { en: 'Player', zh: '闲，闲家一方' },
        { en: 'Tie', zh: '和，庄闲最终点数相同' },
        { en: 'Natural', zh: '天牌，前两张牌合计为 8 或 9 点' },
        { en: 'Mini Table', zh: '迷你桌，座位少、限红低' }
      ],
      faq: [
        { q: '迷你百家樂和标准百家樂有什么不同？', a: '规则完全一致，只是赌桌更小、限红更低、节奏更快，适合新手。' },
        { q: '庄家由谁担任？', a: '庄家由荷官固定担任，玩家只下注庄或闲，不参与发牌。' },
        { q: '我可以选择第三张牌吗？', a: '不能，补牌规则由系统自动执行。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'No Commission Baccarat': {
      zh: '免佣百家樂',
      tagline: '取消庄家赢时 5% 抽水；庄以 6 点取胜时仅赔 0.5 倍作为补偿，适合长期押庄的玩家。',
      quickStart: [
        { n: 1, title: '选择投注', desc: '庄（Banker）、闲（Player）、和（Tie），或庄对／闲对。' },
        { n: 2, title: '自动发牌', desc: '庄、闲各发两张牌。' },
        { n: 3, title: '自动补牌', desc: '按标准规则补第三张，玩家无需决策。' },
        { n: 4, title: '比较点数', desc: '点数更接近 9 点的一方获胜；庄以 6 点赢时赔付减半。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂一致；唯一区别：庄赢不抽 5% 佣金，但庄以 6 点赢只赔 0.5 倍。'
      },
      odds: [
        { name: '庄赢（非 6 点）', value: '1 赔 1' },
        { name: '庄赢（6 点）', value: '1 赔 0.5' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 / 闲对', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'No Commission', zh: '免佣，庄赢不抽 5% 佣金' },
        { en: 'Banker 6', zh: '庄家以 6 点赢，赔付减半' },
        { en: 'Commission', zh: '佣金，标准百家樂抽 5%' }
      ],
      faq: [
        { q: '为什么庄以 6 点赢只赔 0.5 倍？', a: '这是免佣规则对"取消抽水"的补偿，长期统计上更接近公平。' },
        { q: '免佣百家樂更适合什么玩家？', a: '适合长期高频押庄的玩家，避免每局抽水。' },
        { q: '除 6 点外其他赔付和标准百家樂一样吗？', a: '是的，闲、和、对子赔率都相同。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'Speed Baccarat': {
      zh: '极速百家樂',
      tagline: '节奏加速版百家樂，每局约 27 秒（标准约 48 秒），下注窗口更短，适合熟练玩家连续高频下注。',
      quickStart: [
        { n: 1, title: '快速下注', desc: '下注窗口约 15 秒，比标准桌更短。' },
        { n: 2, title: '极速发牌', desc: '荷官发牌节奏明显加快。' },
        { n: 3, title: '自动补牌', desc: '补牌规则与标准百家樂完全一致。' },
        { n: 4, title: '立即结算', desc: '一局结束立即开始下一局，几乎无缝衔接。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '规则与标准百家樂完全一致，仅节奏更快：一局约 27 秒、下注窗口约 15 秒。'
      },
      odds: [
        { name: '庄 Banker', value: '1 赔 0.95' },
        { name: '闲 Player', value: '1 赔 1' },
        { name: '和 Tie', value: '1 赔 8' },
        { name: '庄对 Banker Pair', value: '1 赔 11' },
        { name: '闲对 Player Pair', value: '1 赔 11' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'Speed', zh: '极速，节奏加快版' },
        { en: 'Bet Window', zh: '下注窗口，一局中可下注的时间' },
        { en: 'Round Time', zh: '每局时长' }
      ],
      faq: [
        { q: '极速百家樂一局多长时间？', a: '约 27 秒，标准百家樂约 48 秒。' },
        { q: '我是不是很容易赶不上下注？', a: '下注窗口约 15 秒，建议提前设定好下注方案。' },
        { q: '规则和标准百家樂一样吗？', a: '完全一致，只是节奏更快。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },

    'Baccarat Variants': {
      zh: '百家樂变体',
      tagline: '在标准百家樂基础上加入额外下注选项与附加赔率的衍生玩法合集，为熟悉规则的玩家提供更多策略。',
      quickStart: [
        { n: 1, title: '选择变体', desc: '常见变体包括 Dragon Bonus、Panda 8、Fortune 6、Squeeze 等。' },
        { n: 2, title: '基础下注', desc: '庄、闲、和的基本下注方式与标准百家樂一致。' },
        { n: 3, title: '附加注', desc: '根据变体不同，可额外押 Dragon / Panda / Fortune 6 等。' },
        { n: 4, title: '结算', desc: '基础注 + 附加注分别独立结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应牌面点数' },
          { k: '10 / J / Q / K', v: '0 点' }
        ],
        note: '庄、闲所有牌的总点数只取个位数。',
        examples: ['8 + 7 = 15 → 5 点', '9 + 6 + 8 = 23 → 3 点'],
        order: '9 点 > 8 点 > 7 点 > … > 0 点'
      },
      natural: {
        desc: '若庄或闲的前两张牌合计为 8 点或 9 点，称为天牌（Natural），不再补第三张牌。',
        examples: ['闲：4 + 4 = 8 点 → 闲家天牌', '庄：K + 9 = 9 点 → 庄家天牌']
      },
      thirdCard: {
        playerRules: [
          { range: '0 – 5 点', action: '补第三张牌' },
          { range: '6 – 7 点', action: '停牌' },
          { range: '8 – 9 点', action: '天牌，不补牌' }
        ],
        bankerRules: [
          { pt: '0 – 2', cond: '任意', action: '补牌' },
          { pt: '3', cond: '0 – 7、9', action: '补牌' },
          { pt: '3', cond: '8', action: '停牌' },
          { pt: '4', cond: '2 – 7', action: '补牌' },
          { pt: '4', cond: '0、1、8、9', action: '停牌' },
          { pt: '5', cond: '4 – 7', action: '补牌' },
          { pt: '5', cond: '0 – 3、8、9', action: '停牌' },
          { pt: '6', cond: '6 – 7', action: '补牌' },
          { pt: '6', cond: '0 – 5、8、9', action: '停牌' },
          { pt: '7', cond: '任意', action: '停牌' }
        ],
        collapsedSummary: '基础规则与标准百家樂一致；差异在于附加注及对应高赔率。'
      },
      odds: [
        { name: 'Dragon Bonus（自然 9 赢）', value: '1 赔 30' },
        { name: 'Panda 8（闲 8 点赢）', value: '1 赔 25' },
        { name: 'Fortune 6（庄 6 点赢）', value: '1 赔 15' },
        { name: '标准庄 / 闲', value: '1 赔 0.95 / 1 赔 1' },
        { name: '标准和（Tie）', value: '1 赔 8' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '如果庄与闲最终点数相同，则判定为和局。',
        rows: [
          { bet: '庄 / 闲 投注', rule: '退回本金' },
          { bet: '和（Tie）投注', rule: '按照 1 赔 8 结算' }
        ]
      },
      pair: {
        desc: '对子投注独立于庄／闲胜负进行结算。',
        rows: [
          { t: '庄对 Banker Pair', d: '庄家前两张牌牌面相同' },
          { t: '闲对 Player Pair', d: '闲家前两张牌牌面相同' }
        ]
      },
      terms: [
        { en: 'Dragon Bonus', zh: '龙加奖，押对自然赢额外加赔' },
        { en: 'Panda 8', zh: '熊猫 8，闲家以 8 点赢额外加赔' },
        { en: 'Fortune 6', zh: '财富 6，庄家以 6 点赢赔付翻倍' },
        { en: 'Squeeze', zh: '捏牌百家樂，实况慢镜头捏牌' }
      ],
      faq: [
        { q: '变体百家樂和标准百家樂有多大不同？', a: '基础规则完全一致，主要差异在附加注类型与对应高赔率。' },
        { q: '新手适合玩变体吗？', a: '建议先熟悉标准百家樂，再尝试附加注，避免误操作。' },
        { q: 'Dragon Bonus 是什么？', a: '若庄或闲以自然 8 或 9 点取胜，押对一方可获得高额额外赔付。' }
      ],
      disclaimer: '本游戏根据预设百家樂规则自动完成发牌、补牌及结算。不同游戏版本可能存在赔率、佣金或特殊投注规则差异，请以当前游戏页面显示的规则及赔率为准。'
    },
    'Classic Blackjack': {
      zh: '经典21点',
      tagline: '目标：让手中牌点数尽量接近 21 点但不超过。超过 21 点（Bust）立即输，达到 21 点为最强牌。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家 1 张明牌 1 张暗牌。' },
        { n: 2, title: '选择操作', desc: '可选择 Hit（要牌）、Stand（停牌）、Double（加倍）、Split（分牌）。' },
        { n: 3, title: '庄家开牌', desc: '你停牌后，庄家翻暗牌并按规则要牌至 17 点或以上。' },
        { n: 4, title: '比点结算', desc: '比谁更接近 21 点但不超；超 21 点爆牌（Bust）即输。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 点或 11 点（自动取最有利值）' }
        ],
        note: '手牌总点数 = 所有牌点数相加。A 可算 1 或 11，系统自动取不爆牌的最大值。',
        examples: [
          'A + 6 = 7 点或 17 点（自动选 17）',
          'A + 6 + K = 17 点（A 只能算 1）',
          '10 + 10 = 20 点'
        ],
        order: '21 点（Blackjack）> 20 点 > 19 点 > … > 0 点；超过 21 点为 Bust'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K，即 21 点，称为"Blackjack"（天生 21 点），是本游戏最强牌。',
        examples: [
          'A + K = Blackjack（21 点）',
          'A + 10 = Blackjack（21 点）'
        ],
        note: '若你 Blackjack 而庄家不是，通常赔率 1 赔 1.5（3:2）。'
      },
      odds: [
        { name: 'Blackjack（天生 21 点）', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '和局（Push）', value: '退回本金' },
        { name: '保险（Insurance）', value: '1 赔 2' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位；本金按结算规则返还。',
      tie: {
        desc: '若你与庄家点数相同，判定为和局（Push）：',
        rows: [
          { bet: '你与庄家同点数', rule: '退回本金' },
          { bet: '双 Blackjack', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '特殊组合：',
        rows: [
          { t: 'Blackjack', d: '前两张 A + 10/J/Q/K，直接获胜' },
          { t: 'Bust（爆牌）', d: '手牌超过 21 点，立即输' },
          { t: 'Soft Hand（软牌）', d: '手牌含 A 且算 11 点不爆' },
          { t: 'Hard Hand（硬牌）', d: '手牌不含 A 或 A 只能算 1 点' }
        ]
      },
      terms: [
        { en: 'Hit', zh: '要牌，再拿一张' },
        { en: 'Stand', zh: '停牌，不再要牌' },
        { en: 'Double', zh: '加倍，赌注翻倍后再拿一张' },
        { en: 'Split', zh: '分牌，两张同点拆成两手' },
        { en: 'Surrender', zh: '投降，放弃一半赌注' },
        { en: 'Insurance', zh: '保险，庄家明牌为 A 时可投' },
        { en: 'Blackjack', zh: '天生 21 点（前两张 A + 10）' },
        { en: 'Bust', zh: '爆牌，超过 21 点' },
        { en: 'Push', zh: '和局，退回本金' }
      ],
      faq: [
        { q: 'A 算 1 还是 11？', a: '系统自动取不爆牌的最大值。如 A + 6 会算 17 点（软牌）。' },
        { q: '庄家在多少点停牌？', a: '标准规则下庄家在 17 点及以上停牌。' },
        { q: 'Blackjack 和 21 点有区别吗？', a: '有。Blackjack 特指前两张 A + 10/J/Q/K，赔付更高（1 赔 1.5）。' },
        { q: '什么时候可以分牌？', a: '当你前两张牌点数相同时（如 8+8、K+Q）。' },
        { q: '保险值得买吗？', a: '长期来看保险对玩家不利，仅当庄家明牌为 A 时可选，谨慎使用。' }
      ],
      disclaimer: '本游戏根据预设 21 点规则自动结算。不同游戏版本可能存在规则差异（如庄家软 17 是否要牌、能否加倍、能否投降等），请以当前游戏页面显示的规则为准。'
    },

    'European Blackjack': {
      zh: '欧洲21点',
      tagline: '欧洲流行的 21 点变体，庄家一开始只有 1 张牌（没有暗牌），但如果你爆牌庄家直接获胜。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家先只发 1 张明牌（无暗牌）。' },
        { n: 2, title: '选择操作', desc: 'Hit / Stand / Double / Split 均可，但规则略有不同。' },
        { n: 3, title: '庄家补牌', desc: '你停牌后，庄家先补 1 张暗牌，再按规则要牌。' },
        { n: 4, title: '比点结算', desc: '爆牌立即输；否则比较点数，更接近 21 点者胜。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点（自动取最有利值）' }
        ],
        note: 'A 可算 1 或 11，系统自动取不爆牌的最大值。',
        examples: ['A + 9 = 20 点', '10 + K = 20 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，为 Blackjack（21 点）。',
        examples: ['A + K = Blackjack'],
        note: '部分规则下欧洲 21 点 Blackjack 只赔 1:1（而非 3:2）。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1.5（部分版本 1 赔 1）' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '和局（Push）', value: '退回本金' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '欧洲 21 点特色：',
        rows: [
          { t: 'No Hole Card', d: '庄家开局无暗牌' },
          { t: 'Bust and Lose', d: '你爆牌立即输，庄家无需再要牌' },
          { t: 'No Peek', d: '庄家不会提前检查是否 Blackjack' }
        ]
      },
      terms: [
        { en: 'No Hole Card', zh: '无暗牌' },
        { en: 'Hit', zh: '要牌' },
        { en: 'Stand', zh: '停牌' },
        { en: 'Double', zh: '加倍' },
        { en: 'Split', zh: '分牌' },
        { en: 'Blackjack', zh: '天生 21 点' }
      ],
      faq: [
        { q: '欧洲 21 点和美式有什么不同？', a: '主要差异：庄家开局只有 1 张明牌，没有暗牌；你爆牌庄家立即获胜，不需要再补牌。' },
        { q: 'Blackjack 赔付是多少？', a: '多数欧洲 21 点赔 1:1.5，部分版本为 1:1，请查看游戏页面显示。' },
        { q: '可以加倍吗？', a: '通常可以，但部分版本限定只在特定点数上（如 9/10/11）加倍。' }
      ],
      disclaimer: '本游戏根据预设欧洲 21 点规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Spanish 21': {
      zh: '西班牙21点',
      tagline: '从 52 张牌中移除 4 张 10，玩家有多种红利操作（如红利加倍、投降、重新分牌），更利于玩家。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '使用 48 张牌（去掉 4 张 10），你获得 2 张明牌，庄家 1 明 1 暗。' },
        { n: 2, title: '选择操作', desc: 'Hit / Stand / Double / Split / Surrender 均可，无 10 让玩家更容易拿 21 点。' },
        { n: 3, title: '庄家开牌', desc: '你停牌后，庄家翻暗牌并按规则要牌至 17 点或以上。' },
        { n: 4, title: '结算', desc: '比点；21 点赔付 3:2，普通获胜 1:1。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 9', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: '牌组中去掉 4 张 10，其余规则与标准 21 点一致。',
        examples: ['A + K = 21 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，为 Blackjack（21 点），赔付 3:2。',
        examples: ['A + K = Blackjack'],
        note: '西班牙 21 点还有其他红利牌型，如 5 张 21 点自动获胜。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '五张 21 点（5-Card 21）', value: '1 赔 1.5' },
        { name: '六张 21 点', value: '1 赔 2' },
        { name: '七张 21 点', value: '1 赔 3' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: '西班牙 21 点特色奖励：',
        rows: [
          { t: '5-Card 21', d: '用 5 张牌达到 21 点，赔付 3:2' },
          { t: '6-Card 21', d: '用 6 张牌达到 21 点，赔付 2:1' },
          { t: '7-Card 21', d: '用 7 张牌达到 21 点，赔付 3:1' },
          { t: '红利分牌', d: '分牌后可加倍，红利更多' }
        ]
      },
      terms: [
        { en: '48-Card Deck', zh: '48 张牌组（无 10）' },
        { en: '5-Card 21', zh: '五张 21 点，红利赔付' },
        { en: 'Surrender', zh: '投降，放弃一半赌注' },
        { en: 'Double Down Rescue', zh: '加倍后投降保一半' }
      ],
      faq: [
        { q: '为什么没有 10 点牌？', a: '西班牙 21 点从 52 张牌中去掉 4 张 10，让玩家更容易拿到 21 点。' },
        { q: '5 张 21 点怎么赔？', a: '通常 1 赔 1.5，具体请以当前游戏页面显示为准。' },
        { q: '可以加倍后投降吗？', a: '西班牙 21 点特有的"加倍救援"（Double Down Rescue），可以保住一半赌注。' }
      ],
      disclaimer: '本游戏根据预设西班牙 21 点规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Blackjack Switch': {
      zh: '21点换牌',
      tagline: '你同时玩两手牌，并可以将两手牌的第二张牌互换。庄家 22 点为和局（Push），但 Blackjack 只赔 1:1。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你同时获得两手牌（各 2 张），庄家 1 明 1 暗。' },
        { n: 2, title: '选择换牌', desc: '可选择是否将两手牌的第二张互换，让牌型更有利。' },
        { n: 3, title: '逐手操作', desc: '对两手牌分别进行 Hit / Stand / Double / Split。' },
        { n: 4, title: '结算', desc: '比点；庄家 22 点直接 Push（和局）。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: '你同时打两手牌，每手独立计算点数。',
        examples: ['A + 9 = 20 点', '10 + K = 20 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时为 Blackjack，但本变体只赔 1:1（而非 3:2）。',
        examples: ['A + K = Blackjack'],
        note: '作为"换牌"的补偿，Blackjack 赔付被降低。'
      },
      odds: [
        { name: 'Blackjack', value: '1 赔 1' },
        { name: '普通获胜', value: '1 赔 1' },
        { name: '庄家 22 点（Bust 特殊）', value: 'Push（退回本金）' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '以下情况为和局：',
        rows: [
          { bet: '你与庄家同点数', rule: '退回本金' },
          { bet: '庄家爆牌至 22 点', rule: '退回本金（特殊规则）' }
        ]
      },
      pair: {
        desc: '核心机制：',
        rows: [
          { t: 'Switch（换牌）', d: '将两手牌的第二张互换' },
          { t: '22 Push', d: '庄家 22 点为和局，抵消庄家优势' },
          { t: 'Double After Split', d: '分牌后可以加倍' }
        ]
      },
      terms: [
        { en: 'Switch', zh: '换牌，第二张牌互换' },
        { en: 'Two Hands', zh: '两手牌' },
        { en: '22 Push', zh: '庄家 22 点为和局' }
      ],
      faq: [
        { q: '换牌是强制的吗？', a: '不强制，你可以在下注前选择换或不换。' },
        { q: '为什么 Blackjack 只赔 1:1？', a: '因为换牌让玩家有更大优势，因此 Blackjack 赔付被降低。' },
        { q: '庄家 22 点怎么算？', a: '本变体中庄家爆牌至 22 点判定为和局（Push），退回本金。' }
      ],
      disclaimer: '本游戏根据预设 21 点换牌规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },

    'Super Fun 21': {
      zh: '超级 21 点',
      tagline: '21 点变体，几乎任何形式的 21 点都能获得额外奖励，玩家有更多低风险机会。',
      quickStart: [
        { n: 1, title: '开局发牌', desc: '你获得 2 张明牌，庄家 1 明 1 暗。' },
        { n: 2, title: '操作', desc: 'Hit / Stand / Double / Split / Surrender 均可，加倍后可以再要牌。' },
        { n: 3, title: '庄家开牌', desc: '庄家按规则要牌至 17 点或以上。' },
        { n: 4, title: '结算', desc: '比点 + 特殊组合奖励。' }
      ],
      pointCalc: {
        rows: [
          { k: '2 – 10', v: '对应牌面点数' },
          { k: 'J / Q / K', v: '10 点' },
          { k: 'A', v: '1 或 11 点' }
        ],
        note: 'A 可算 1 或 11，系统自动取最有利值。',
        examples: ['A + 9 = 20 点', 'A + A + 9 = 21 点'],
        order: '21 点 > 20 点 > 19 点 > … > 0 点'
      },
      natural: {
        desc: '前两张牌为 A + 10/J/Q/K 时，Blackjack 通常赔 1:1（而非 3:2）。',
        examples: ['A + K = Blackjack'],
        note: '作为补偿，Super Fun 21 允许"加倍后继续要牌"。'
      },
      odds: [
        { name: 'Blackjack（一般）', value: '1 赔 1' },
        { name: 'Blackjack（黑桃 A + 黑桃 Blackjack）', value: '1 赔 2' },
        { name: '钻石 Blackjack（6 张未爆）', value: '1 赔 1.5' },
        { name: '五张或以上未爆牌获胜', value: '1 赔 1.5' },
        { name: '普通获胜', value: '1 赔 1' }
      ],
      oddsNote: '"1 赔 X"表示每下注 1 单位，获胜后净赢取 X 单位。',
      tie: {
        desc: '若你与庄家点数相同：',
        rows: [
          { bet: '同点数', rule: '退回本金' }
        ]
      },
      pair: {
        desc: 'Super Fun 21 特殊奖励：',
        rows: [
          { t: '钻石 Blackjack', d: '6 张牌达到 21 点（未爆）赔 1:1.5' },
          { t: '黑桃 Blackjack', d: '黑桃 A + 黑桃 J/Q/K 赔 2:1' },
          { t: '5+ 张未爆', d: '用 5 张或以上牌未爆获胜，赔 1:1.5' },
          { t: '自由加倍', d: '加倍后可以继续要牌' },
          { t: '投降', d: '部分版本支持 Surrender' }
        ]
      },
      terms: [
        { en: 'Diamond Blackjack', zh: '钻石 Blackjack，6 张 21 点' },
        { en: 'Free Double', zh: '自由加倍，加倍后可继续要牌' },
        { en: '5-Card Charlie', zh: '5 张牌未爆自动获胜' }
      ],
      faq: [
        { q: '为什么 Blackjack 只赔 1:1？', a: '因为 Super Fun 21 有更多特殊奖励，因此基础 Blackjack 赔付被降低。' },
        { q: '加倍后能继续要牌吗？', a: '可以，这是 Super Fun 21 的特色规则。' },
        { q: '5 张未爆牌怎么赔？', a: '用 5 张或以上牌未爆获胜，可获 1:1.5 赔付。' }
      ],
      disclaimer: '本游戏根据预设 Super Fun 21 规则自动结算。不同版本规则差异较大，请以当前游戏页面显示的规则为准。'
    },
    "Texas Hold'em": {
      zh: '德州扑克',
      tagline: '全球最流行的扑克游戏。2 张底牌 + 5 张公共牌，用 7 张牌中最好的 5 张组成牌型，多轮下注决胜负。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '庄家左边的两人分别下小盲注和大盲注。' },
        { n: 2, title: '发底牌', desc: '每位玩家发 2 张只有自己可见的底牌。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 → 翻牌圈 → 转牌圈 → 河牌圈，每轮可下注 / 跟注 / 加注 / 弃牌。' },
        { n: 4, title: '比牌', desc: '剩余玩家摊牌，用 7 张牌中最好的 5 张比牌型大小。' }
      ],
      pointCalc: {
        rows: [
          { k: '7 张牌', v: '2 张底牌 + 5 张公共牌' },
          { k: '选 5 张', v: '组成最好的 5 张牌型' },
          { k: '比牌顺序', v: '见下方牌型等级' }
        ],
        note: '牌型越稀有排名越高，同牌型再比点数大小。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺', '9♥ 9♦ 9♣ 9♠ K♦ = 四条'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '牌型等级（从高到低）：',
        examples: [
          '皇家同花顺：A-K-Q-J-10 同花',
          '同花顺：5 张连续且同花',
          '四条：4 张同点数',
          '葫芦：3 张 + 1 对',
          '同花：5 张同花色但顺序不连续'
        ],
        note: '同牌型下比高牌点数。例如 A 高同花大于 K 高同花。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' },
        { name: '弃牌', value: '放弃已投入筹码' }
      ],
      oddsNote: '德州扑克赔率取决于底池总额，非固定 1 赔 X；最终赔率由底池除以你的投入计算。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型等级相同 + 高牌点数相同', rule: '平分底池' },
          { bet: '无法决出胜负', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: 'Blinds（盲注）', d: '强制下注，小盲 / 大盲由庄家位置决定' },
          { t: 'Button（庄家）', d: '每轮移动一位玩家，决定下注顺序' },
          { t: 'Flop（翻牌圈）', d: '发出 3 张公共牌 + 一轮下注' },
          { t: 'Turn（转牌圈）', d: '第 4 张公共牌 + 一轮下注' },
          { t: 'River（河牌圈）', d: '第 5 张公共牌 + 最后一轮下注' }
        ]
      },
      terms: [
        { en: 'Hole Cards', zh: '底牌，只有自己可见' },
        { en: 'Flop / Turn / River', zh: '翻牌 / 转牌 / 河牌圈' },
        { en: 'Check', zh: '过牌，不下注' },
        { en: 'Call', zh: '跟注，跟上当前下注额' },
        { en: 'Raise', zh: '加注，提高下注额' },
        { en: 'Fold', zh: '弃牌，放弃手牌' },
        { en: 'All-in', zh: '全下，投入全部筹码' },
        { en: 'Pot', zh: '底池，所有筹码的池子' },
        { en: 'Showdown', zh: '摊牌' }
      ],
      faq: [
        { q: '德州扑克是玩家对玩家吗？', a: '是，德州扑克是一种玩家之间的对战游戏，玩家互相比牌，而不是和庄家对赌。' },
        { q: '最大可以拿几张公共牌？', a: '公共牌有 5 张，加上你的 2 张底牌，共 7 张，从中选最好的 5 张。' },
        { q: '什么时候可以全下（All-in）？', a: '任何时候都可以，但风险极大，需要谨慎判断。' },
        { q: '如何判断谁先下注？', a: '翻牌前从大盲注左边开始；翻牌后从小盲注位置（庄家左边第一个仍在玩的玩家）开始。' },
        { q: '盲注会变化吗？', a: '现金局盲注固定；锦标赛中盲注会按时间递增。' }
      ],
      disclaimer: '本游戏根据预设德州扑克规则自动完成发牌、下注及结算。不同版本可能存在盲注结构、下注上限、底牌处理等差异，请以当前游戏页面显示的规则为准。'
    },

    "Short Deck Hold'em": {
      zh: '短牌德州扑克',
      tagline: '去掉 2-5 的 36 张牌版本，三条大于顺子，同花大于葫芦。更刺激、更 All-in，深受高手喜爱。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '盲注结构与传统德州相似。' },
        { n: 2, title: '发底牌', desc: '每位玩家 2 张底牌，牌组只含 6-A（36 张）。' },
        { n: 3, title: '四轮下注', desc: 'Pre-flop / Flop / Turn / River 各一轮下注。' },
        { n: 4, title: '比牌', desc: '使用短牌特殊牌型等级（三条 > 顺子）。' }
      ],
      pointCalc: {
        rows: [
          { k: '牌组大小', v: '36 张（去掉 2 / 3 / 4 / 5）' },
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '从 7 张牌中选最好的 5 张' }
        ],
        note: '短牌中顺子难度变高，因此三条比顺子更强。',
        examples: ['A♦ K♦ Q♦ J♦ 10♦ = 皇家同花顺', '9♣ 9♥ 9♠ 9♦ A♠ = 四条'],
        order: '皇家同花顺 > 同花顺 > 四条 > 同花 > 葫芦 > 三条 > 顺子 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '短牌特殊规则（与传统德州对比）：',
        examples: [
          '三条 > 顺子（传统：顺子 > 三条）',
          '同花 > 葫芦（传统：葫芦 > 同花）',
          'A 可作为 5 或 10 使用，两种顺子并存'
        ],
        note: '因为牌组去掉了小牌，顺子更难成，所以三条被提升。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '短牌德州赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌点数相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '短牌特色：',
        rows: [
          { t: '36-Card Deck', d: '36 张牌（无 2-5）' },
          { t: 'Ante / Button Blind', d: '常见 Ante 代替小盲' },
          { t: 'Flush > Full House', d: '同花大于葫芦' },
          { t: 'Trips > Straight', d: '三条大于顺子' }
        ]
      },
      terms: [
        { en: 'Short Deck', zh: '短牌' },
        { en: '36-Card', zh: '36 张牌' },
        { en: 'Ante', zh: '底注，所有人强制下注' },
        { en: 'Button Blind', zh: '庄家盲，庄家位代替小盲' }
      ],
      faq: [
        { q: '短牌为什么三条比顺子大？', a: '因为去掉了 2-5，顺子更难成，所以三条被提升到顺子之上。' },
        { q: '短牌比传统德州好赢吗？', a: '难度相近但节奏更快，翻牌前 All-in 更常见。' },
        { q: 'A 可以作为 5 或 10 吗？', a: '可以，短牌允许 A-6-7-8-9 和 10-J-Q-K-A 两种顺子。' }
      ],
      disclaimer: '本游戏根据预设短牌德州规则自动完成发牌、下注及结算。不同版本可能在牌型等级上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Fast Fold Poker': {
      zh: '快速弃牌扑克',
      tagline: '弃牌后立即进入新桌，无需等待其他人。也叫 Zoom / Rush / Speed Poker，节奏极快。',
      quickStart: [
        { n: 1, title: '进入池子', desc: '选择盲注级别，系统自动匹配对手。' },
        { n: 2, title: '快速发牌', desc: '你立即收到 2 张底牌，与其他同级别玩家一起成桌。' },
        { n: 3, title: '决策', desc: '下注 / 跟注 / 加注 / 弃牌，与普通德州一致。' },
        { n: 4, title: '弃牌 → 换桌', desc: '若你弃牌，系统立即把你放进新牌局，无需等待。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '从 7 张中选最好的 5 张' },
          { k: '比牌', v: '与传统德州一致' }
        ],
        note: '牌型等级与传统德州完全一致。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'Fast Fold 的核心机制：',
        examples: [
          '弃牌后立即进入新牌桌',
          '每手牌都是全新对手',
          '无需等待其他人完成牌局'
        ],
        note: '适合喜欢高频游戏、不想久等的玩家。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: 'Rake（佣金）', value: '通常为底池的 2.5% - 5%' }
      ],
      oddsNote: '现金局通常抽 Rake；具体数额请以当前游戏页面为准。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'Fast Fold 特色：',
        rows: [
          { t: 'Fast Fold', d: '弃牌即换桌' },
          { t: 'Anonymous', d: '不显示对方用户名' },
          { t: 'Same Stake Pool', d: '只匹配同盲注级别玩家' }
        ]
      },
      terms: [
        { en: 'Zoom Poker', zh: 'PokerStars 品牌的 Fast Fold' },
        { en: 'Rush Poker', zh: 'Full Tilt 品牌的 Fast Fold' },
        { en: 'Speed Poker', zh: 'iPoker 品牌的 Fast Fold' },
        { en: 'Pool', zh: '玩家池，同级别匹配池' }
      ],
      faq: [
        { q: 'Fast Fold 和普通现金局有什么不同？', a: '主要区别是弃牌后立即进入新牌局，无需等待其他人完成当前牌局。' },
        { q: '可以在 Fast Fold 里慢慢玩吗？', a: '可以，但时间限制较严格，超时会被自动弃牌。' },
        { q: 'Fast Fold 公平吗？', a: '是公平的，牌局由随机数生成，玩家池按盲注级别匹配。' }
      ],
      disclaimer: '本游戏根据预设快速弃牌规则自动完成发牌、下注及结算。不同平台品牌不同（Zoom / Rush / Speed），请以当前游戏页面显示的规则为准。'
    },

    'Tournament Poker': {
      zh: '锦标赛扑克',
      tagline: '多桌同时比赛，盲注随时间递增，筹码归零即淘汰，直到产生冠军。',
      quickStart: [
        { n: 1, title: '买入参赛', desc: '支付固定买入（Buy-in）获得起始筹码。' },
        { n: 2, title: '按盲注游戏', desc: '盲注每隔几分钟递增，玩家筹码不变。' },
        { n: 3, title: '淘汰赛制', desc: '筹码归零立即淘汰，无法再买入（或限定次）。' },
        { n: 4, title: '进入钱圈', desc: '存活到奖金区即获得收益，越靠前收益越高。' }
      ],
      pointCalc: {
        rows: [
          { k: '起始筹码', v: '由买入决定，通常 1,000 - 10,000' },
          { k: '盲注结构', v: '每 3 - 10 分钟递增一次' },
          { k: '底牌 / 公共牌', v: '与传统德州一致' }
        ],
        note: '锦标赛的核心是筹码管理，而非一手牌输赢。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '传统德州牌型等级'
      },
      natural: {
        desc: '锦标赛特殊机制：',
        examples: [
          '盲注随时间递增，压力逐渐升高',
          '筹码归零即淘汰',
          '可多次买入（Rebuy 赛制）或单次买入',
          '奖励按名次分配'
        ],
        note: '常见赛制：Rebuy（重买）、Freezeout（单次买入）、Turbo（极速）、Hyper-Turbo（超极速）。'
      },
      odds: [
        { name: '奖金分配', value: '通常前 10%-15% 玩家进入钱圈' },
        { name: '冠军占比', value: '常占总奖池 20%-30%' },
        { name: '买入费', value: '固定' }
      ],
      oddsNote: '锦标赛赔率取决于参赛人数及名次分配，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型相同 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '锦标赛关键术语：',
        rows: [
          { t: 'Buy-in', d: '买入，参赛费用' },
          { t: 'Rebuy', d: '重买，筹码耗尽后再次买入' },
          { t: 'Add-on', d: '增购，中断时额外买入' },
          { t: 'Blind Level', d: '盲注级别，随时间递增' },
          { t: 'ITM', d: 'In The Money，进入奖金区' }
        ]
      },
      terms: [
        { en: 'Freezeout', zh: '单次买入锦标赛' },
        { en: 'Rebuy', zh: '重买赛制' },
        { en: 'Turbo', zh: '极速赛，盲注增长快' },
        { en: 'Hyper-Turbo', zh: '超极速赛' },
        { en: 'Bubble', zh: '泡沫期，快到钱圈时' },
        { en: 'Final Table', zh: '决赛桌' }
      ],
      faq: [
        { q: '筹码用完了还能继续吗？', a: '看赛制：Rebuy 赛可以重买；Freezeout 赛淘汰出局。' },
        { q: '盲注递增会影响策略吗？', a: '会，盲注越高越要激进，否则筹码被蚕食。' },
        { q: 'ITM 是什么意思？', a: 'In The Money，进入奖金区，至少能获得一点奖金。' },
        { q: '什么是泡沫期？', a: '距离进入奖金区只剩一两名玩家时的紧张期。' }
      ],
      disclaimer: '本游戏根据预设锦标赛规则自动完成发牌、下注及结算。不同赛事的盲注结构、重买次数、奖金分配均可能不同，请以当前游戏页面显示的规则为准。'
    },

    'Heads-Up Poker': {
      zh: '单挑扑克',
      tagline: '仅两位玩家对战，位置决定盲注。常用于 SNG 决胜、单挑决斗，是扑克技巧最纯粹的对决形式。',
      quickStart: [
        { n: 1, title: '两人对战', desc: '仅两位玩家参与。' },
        { n: 2, title: '盲注分配', desc: '庄家位下小盲，对手下大盲，翻牌前庄家先行动。' },
        { n: 3, title: '四轮下注', desc: '与德州扑克一致。' },
        { n: 4, title: '比牌', desc: '摊牌比牌型，胜者获得底池。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '2 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成', v: '7 张中选最好的 5 张' }
        ],
        note: '牌型等级与传统德州完全一致。',
        examples: ['A♠ K♠ Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'Heads-Up 核心特点：',
        examples: [
          '仅 2 位玩家，位置每手互换',
          '庄家位（Button）= 小盲',
          '翻牌前庄家先行动，翻牌后大盲先行动'
        ],
        note: '单挑中位置极其关键，庄家位有巨大优势。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: 'SNG 决赛', value: '胜者获得约定奖金' }
      ],
      oddsNote: 'Heads-Up 赔率取决于底池总额或约定奖金。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'Heads-Up 特色：',
        rows: [
          { t: 'Button Blind', d: '庄家位下小盲' },
          { t: 'Position Swap', d: '每手互换位置' },
          { t: 'Higher Stakes', d: '单挑赛筹码上升快' }
        ]
      },
      terms: [
        { en: 'Heads-Up', zh: '单挑，两人对战' },
        { en: 'Button Blind', zh: '庄家位盲注' },
        { en: 'Sit & Go', zh: '坐满即开赛（SNG）' },
        { en: '3-Bet', zh: '三次加注，翻牌前再加注' }
      ],
      faq: [
        { q: 'Heads-Up 与普通德州有什么不同？', a: '只有两位玩家，位置每手互换；翻牌前庄家先行动，翻牌后大盲先行动。' },
        { q: '单挑牌局策略一样吗？', a: '不一样。单挑中起手牌范围更广，攻击性更强。' },
        { q: '什么是 SNG？', a: 'Sit & Go：坐满即开赛的锦标赛，常用于 Heads-Up 决胜负。' }
      ],
      disclaimer: '本游戏根据预设单挑德州规则自动完成发牌、下注及结算。不同赛事可能在盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },
    'Omaha': {
      zh: '奥马哈',
      tagline: '每位玩家 4 张底牌 + 5 张公共牌，但只能用底牌中的 2 张 + 公共牌中的 3 张组成 5 张牌型。比德州更刺激、成牌更大。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家发 4 张底牌（德州只有 2 张）。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 → 翻牌圈 → 转牌圈 → 河牌圈。' },
        { n: 4, title: '比牌', desc: '必须用底牌中的恰好 2 张 + 公共牌中的恰好 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成规则', v: '底牌 2 张 + 公共牌 3 张 = 5 张' },
          { k: '比牌', v: '与德州扑克相同牌型等级' }
        ],
        note: '关键区别：必须用 2+3 组合，不能像德州一样任选 5 张。',
        examples: ['底牌 A♠ K♠ 5♦ 5♣，公共牌 Q♠ J♠ 10♠ 3♥ 2♦', '→ 用 A♠ K♠ + Q♠ J♠ 10♠ = 皇家同花顺'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '奥马哈与传统德州最大的差异是"必须用 2+3 张牌"。',
        examples: [
          '底牌 A♦ A♣ K♠ K♥，公共牌 A♠ A♥ 2♦ 3♣ 4♥',
          '→ 用 A♦ A♣ + A♠ A♥ 2♦ = 四条 A（只能用底牌 2 张）',
          '不能用底牌 4 张 + 公共牌 1 张，也不能用底牌 1 张 + 公共牌 4 张'
        ],
        note: '正因 4 张底牌，奥马哈比德州更容易成大牌，因此下注更激烈。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '奥马哈赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌点数相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '奥马哈关键术语：',
        rows: [
          { t: '4 Hole Cards', d: '4 张底牌' },
          { t: '2+3 Rule', d: '底牌 2 张 + 公共牌 3 张' },
          { t: 'PLO', d: 'Pot-Limit Omaha（限底池奥马哈）' },
          { t: 'Wraps', d: '多顺子听牌' }
        ]
      },
      terms: [
        { en: 'Hole Cards', zh: '底牌（4 张）' },
        { en: 'Board', zh: '公共牌（5 张）' },
        { en: '2+3 Rule', zh: '底牌 2 张 + 公共牌 3 张组合' },
        { en: 'Nuts', zh: '坚果，当前最强可能牌' },
        { en: 'Wraps', zh: '多顺子听牌' },
        { en: 'All-in', zh: '全下' }
      ],
      faq: [
        { q: '奥马哈和德州最大的区别？', a: '奥马哈每位玩家 4 张底牌，且必须用底牌 2 张 + 公共牌 3 张；德州只有 2 张底牌，任意选 5 张。' },
        { q: '可以用 1 张底牌 + 4 张公共牌吗？', a: '不可以，必须恰好 2 张底牌 + 3 张公共牌。' },
        { q: '为什么奥马哈下注更激进？', a: '4 张底牌让玩家更容易成大牌，牌力更接近，因此下注更激烈。' },
        { q: '什么是 PLO？', a: 'Pot-Limit Omaha：底池限注奥马哈，最大下注额为底池金额。' }
      ],
      disclaimer: '本游戏根据预设奥马哈规则自动完成发牌、下注及结算。不同版本可能在底池限注、盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Omaha Hi-Lo': {
      zh: '奥马哈高低',
      tagline: '奥马哈变体——底池分为"高牌"和"低牌"两半，符合条件的低牌也能赢。低牌必须由 5 张不重复且都小于 8 的牌组成。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '与奥马哈相同，小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 4 张底牌。' },
        { n: 3, title: '四轮下注', desc: '与奥马哈一致，翻牌前 / 翻牌 / 转牌 / 河牌。' },
        { n: 4, title: '比牌', desc: '底池分两半：一半给高牌赢家，一半给低牌赢家。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组合规则', v: '底牌 2 张 + 公共牌 3 张（与奥马哈相同）' },
          { k: '低牌条件', v: '5 张不重复且点数 ≤ 8（A 算 1）' }
        ],
        note: '低牌必须由 5 张不同点数的牌组成，且都 ≤ 8（A 可作 1）。',
        examples: ['A-2-3-4-5 = 最佳低牌（轮子）', 'A-2-3-4-6 = 次佳低牌', '有对子或含 9+ 的牌不构成低牌'],
        order: '低牌越小越好：A-2-3-4-5 为最佳'
      },
      natural: {
        desc: 'Hi-Lo 的核心机制：',
        examples: [
          '高牌按传统奥马哈规则比大小',
          '低牌由 5 张不同点数且 ≤ 8 的牌组成',
          '如没有玩家组成合格低牌，则高牌赢家独得全部底池'
        ],
        note: '常见术语：Scoop（同时赢高+低）获得全部底池；Split（分高+低）各得一半。'
      },
      odds: [
        { name: '赢家通吃（Scoop）', value: '获得全部底池' },
        { name: '平分高/低（Split）', value: '高/低各得一半' },
        { name: '无合格低牌', value: '高牌赢家独得全部' }
      ],
      oddsNote: '奥马哈高低赔率取决于底池总额及分池情况。',
      tie: {
        desc: '若两位玩家牌型完全相同：',
        rows: [
          { bet: '高牌相同', rule: '平分高牌部分' },
          { bet: '低牌相同', rule: '平分低牌部分' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: 'Scoop', d: '同时赢高牌和低牌，独得底池' },
          { t: 'Split', d: '一人赢高、一人赢低' },
          { t: 'Qualified Low', d: '合格低牌（5 张 ≤ 8）' },
          { t: 'Wheel', d: '轮子，A-2-3-4-5' }
        ]
      },
      terms: [
        { en: 'Hi-Lo', zh: '高/低分池' },
        { en: 'Scoop', zh: '独得底池' },
        { en: 'Split', zh: '分池' },
        { en: 'Wheel', zh: 'A-2-3-4-5 最佳低牌' },
        { en: 'Qualified Low', zh: '合格低牌' }
      ],
      faq: [
        { q: '什么是"合格低牌"？', a: '5 张不重复且都 ≤ 8 的牌（A 算 1）。不符合条件的玩家不参与低牌争夺。' },
        { q: '如果没人有低牌怎么办？', a: '高牌赢家独得全部底池。' },
        { q: 'Scoop 是什么意思？', a: 'Scoop 指同一位玩家既赢高牌又赢低牌，独得全部底池。' },
        { q: 'A 在低牌里算几点？', a: 'A 在低牌里算 1 点。' }
      ],
      disclaimer: '本游戏根据预设奥马哈高低规则自动完成发牌、下注及结算。不同版本可能在低牌判定标准上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Pot-Limit Omaha': {
      zh: '底池限注奥马哈',
      tagline: '奥马哈最流行的现金局形式：最大下注额 = 当前底池金额。节奏稳健，观赏性强，是职业玩家最爱。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 4 张底牌。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 / 翻牌 / 转牌 / 河牌，每轮下注上限 = 底池。' },
        { n: 4, title: '比牌', desc: '底牌 2 张 + 公共牌 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '4 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组成规则', v: '底牌 2 张 + 公共牌 3 张' },
          { k: '下注上限', v: '当前底池金额' }
        ],
        note: 'PLO 与普通奥马哈唯一的规则差异是下注上限为底池，但打法节奏完全不同。',
        examples: ['底池 $100 → 最大下注 $100', '底牌 2+3 组合规则不变'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: 'PLO 的下注机制：',
        examples: [
          '翻牌前：最大加注 = 底池',
          '翻牌后：最大下注 = 当前底池',
          '加注规则：Pot Raise = 底池 + 你要跟注的金额',
          '相比 NLH（无限注德州），PLO 风险更可控'
        ],
        note: 'PLO 是职业玩家最爱的现金局形式之一，兼顾节奏与策略。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: 'PLO 赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: 'PLO 关键术语：',
        rows: [
          { t: 'Pot-Limit', d: '底池限注' },
          { t: 'Pot Raise', d: '底池加注' },
          { t: 'Rebuy', d: '重买' },
          { t: 'Cap', d: '每人最大投入' }
        ]
      },
      terms: [
        { en: 'Pot-Limit', zh: '底池限注' },
        { en: 'Pot Raise', zh: '底池加注' },
        { en: 'Nuts', zh: '当前最强可能牌' },
        { en: 'Tilt', zh: '情绪失控后乱下注' }
      ],
      faq: [
        { q: 'PLO 和普通奥马哈有什么不同？', a: '底牌、组合、比牌规则完全相同；唯一差异是下注上限为底池。' },
        { q: '为什么 PLO 更流行？', a: '相比无限注，PLO 风险更可控；相比限注，PLO 又更刺激，是职业玩家的主流现金局形式。' },
        { q: '底池加注怎么算？', a: 'Pot Raise = 底池总额 + 你跟注的金额 + 你加注的金额。' }
      ],
      disclaimer: '本游戏根据预设底池限注奥马哈规则自动完成发牌、下注及结算。不同平台可能在 Rake、盲注结构上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Five Card Omaha': {
      zh: '五张奥马哈',
      tagline: '奥马哈变体——每位玩家 5 张底牌（而非 4 张），成牌更容易、牌力更接近，精彩程度更高。',
      quickStart: [
        { n: 1, title: '下盲注', desc: '与奥马哈相同，小盲 / 大盲由庄家位置决定。' },
        { n: 2, title: '发底牌', desc: '每位玩家 5 张底牌（比奥马哈多 1 张）。' },
        { n: 3, title: '四轮下注', desc: '翻牌前 / 翻牌 / 转牌 / 河牌。' },
        { n: 4, title: '比牌', desc: '底牌 2 张 + 公共牌 3 张，组成最好的 5 张牌型。' }
      ],
      pointCalc: {
        rows: [
          { k: '底牌', v: '5 张' },
          { k: '公共牌', v: '5 张' },
          { k: '组合规则', v: '底牌 2 张 + 公共牌 3 张' },
          { k: '比牌', v: '与奥马哈相同牌型等级' }
        ],
        note: '五张奥马哈的底牌多 1 张，成牌概率显著提升，牌力更接近。',
        examples: ['5 张底牌让玩家有更多 2 张组合可能', '成牌更频繁，All-in 更常见'],
        order: '皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌'
      },
      natural: {
        desc: '五张奥马哈的关键特点：',
        examples: [
          '5 张底牌 → C(5,2) = 10 种底牌组合',
          '传统奥马哈 4 张底牌 → C(4,2) = 6 种组合',
          '成牌更频繁，听牌更多，牌力更强',
          '常用 PLO5 表示 Pot-Limit Five Card Omaha'
        ],
        note: '五张奥马哈是 PLO 的进阶版本，在职业牌手中越来越流行。'
      },
      odds: [
        { name: '赢家通吃', value: '获得全部底池' },
        { name: '平分底池', value: '牌型相同时平分' }
      ],
      oddsNote: '五张奥马哈赔率取决于底池总额，非固定 1 赔 X。',
      tie: {
        desc: '若两位玩家最终牌型完全相同时：',
        rows: [
          { bet: '牌型 + 高牌相同', rule: '平分底池' }
        ]
      },
      pair: {
        desc: '五张奥马哈关键：',
        rows: [
          { t: '5 Hole Cards', d: '5 张底牌' },
          { t: '10 Combinations', d: '10 种底牌组合可能' },
          { t: 'PLO5', d: 'Pot-Limit Five Card Omaha 缩写' },
          { t: 'High Variance', d: '波动大，成牌频繁' }
        ]
      },
      terms: [
        { en: 'PLO5', zh: '底池限注五张奥马哈' },
        { en: '5-Card', zh: '五张底牌' },
        { en: 'Combinations', zh: '底牌组合数' },
        { en: 'Wrap', zh: '多顺子听牌' }
      ],
      faq: [
        { q: '五张奥马哈和普通奥马哈的区别？', a: '底牌从 4 张增加到 5 张，其他规则完全一致。' },
        { q: '为什么成牌更频繁？', a: '5 张底牌提供 10 种 2 张组合，比 4 张底牌的 6 种更多，成牌概率显著提升。' },
        { q: 'PLO5 是什么？', a: 'Pot-Limit Five Card Omaha：底池限注五张奥马哈。' }
      ],
      disclaimer: '本游戏根据预设五张奥马哈规则自动完成发牌、下注及结算。不同平台可能在盲注、Rake 上有差异，请以当前游戏页面显示的规则为准。'
    }
,
    'Niu Niu': {
      zh: '牛牛',
      tagline: '亚洲最流行的扑克变体。每位玩家 5 张牌，3 张牌组合成 10 的倍数（牛），另 2 张牌决定牛几。牌型简单刺激，节奏极快。',
      quickStart: [
        { n: 1, title: '下注', desc: '庄家 / 闲家 / 平倍 / 翻倍 等多个位置可选。' },
        { n: 2, title: '发牌', desc: '庄家与每位闲家各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '从 5 张牌中取 3 张，点数相加为 10 的倍数即"有牛"，剩余 2 张相加取个位数为"牛几"。' },
        { n: 4, title: '比牌', desc: '牛数越大越强，牛牛最强；同牛数再比单张牌大小。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点（也就是 0 点）' }
        ],
        note: '3 张牌组合成 10 的倍数称为"牛"，剩余 2 张牌之和的个位数就是牛几。',
        examples: [
          '3 + 4 + 3 = 10（牛），另 2 张 5 + 6 = 11 → 牛一',
          '2 + 8 + 10 = 20（牛），另 2 张 7 + 8 = 15 → 牛五',
          '5 张牌任意 3 张都无法凑成 10 的倍数 → 无牛'
        ],
        order: '牛牛 > 牛九 > 牛八 > 牛七 > 牛六 > 牛五 > 牛四 > 牛三 > 牛二 > 牛一 > 无牛'
      },
      natural: {
        desc: '特殊牌型（牛牛规则的核心看点）：',
        examples: [
          '五小牛：5 张牌点数都 < 5，且总和 ≤ 10（最强牌型）',
          '炸弹牛：5 张牌中有 4 张点数相同',
          '五花牛：5 张牌都是 J/Q/K',
          '牛牛：3 张凑 10，另 2 张之和也是 10 的倍数'
        ],
        note: '特殊牌型优先级：五小牛 > 炸弹牛 > 五花牛 > 牛牛 > 牛九...'
      },
      odds: [
        { name: '五小牛', value: '最高倍数（通常 5 倍或更高）' },
        { name: '炸弹牛', value: '4 倍' },
        { name: '五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 / 牛八 / 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' },
        { name: '无牛', value: '输（或 1 倍）' }
      ],
      oddsNote: '实际倍数因平台而异；「1 赔 X」表示每下注 1 单位获胜后净赢取 X 单位。',
      tie: {
        desc: '若庄与闲牛数相同时，比牌规则如下：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张牌' },
          { bet: '最大单张也相同', rule: '比最大牌的花色（黑桃 > 红桃 > 梅花 > 方块）' }
        ]
      },
      pair: {
        desc: '关键术语：',
        rows: [
          { t: '牛 (Ngau)', d: '3 张牌凑成 10 的倍数' },
          { t: '无牛', d: '任意 3 张都无法凑成 10 的倍数' },
          { t: '牛牛', d: '3 张凑 10 + 另 2 张也是 10 的倍数' },
          { t: '五小牛', d: '5 张牌都 < 5，总和 ≤ 10' },
          { t: '炸弹牛', d: '4 张点数相同' }
        ]
      },
      terms: [
        { en: 'Niu Niu', zh: '牛牛' },
        { en: 'Ngau', zh: '牛' },
        { en: 'No Ngau', zh: '无牛' },
        { en: 'Ngau Ngau', zh: '牛牛' },
        { en: 'Five Small', zh: '五小牛' },
        { en: 'Bomb', zh: '炸弹牛' },
        { en: 'Five Flowers', zh: '五花牛' }
      ],
      faq: [
        { q: '牛牛怎么判断牛几？', a: '5 张牌中取 3 张相加为 10 的倍数即"有牛"，剩余 2 张相加取个位数，如 5+6=11 就是牛一。' },
        { q: '无牛是什么意思？', a: '5 张牌中任意 3 张都无法凑成 10 的倍数。' },
        { q: '什么是五小牛？', a: '5 张牌点数都小于 5，且总和 ≤ 10，是牛牛最强牌型。' },
        { q: '炸弹牛是什么？', a: '5 张牌中有 4 张点数相同，如四张 7 + 一张 A。' },
        { q: '花色有影响吗？', a: '仅当牛数相同且最大单张也相同时，才比花色大小（黑桃 > 红桃 > 梅花 > 方块）。' }
      ],
      disclaimer: '本游戏根据预设牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数、特殊牌型上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Classic Niu Niu': {
      zh: '经典牛牛',
      tagline: '牛牛的基础版本——标准 5 张牌，标准倍数，规则清晰易上手，是入门牛牛的最佳选择。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '3 张 + 10 的倍数规则。' },
        { n: 4, title: '比牌', desc: '牛数越大越强；同牛比单张。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '3 张凑 10 的倍数为牛，另 2 张取个位数为牛几。',
        examples: ['3+4+3=10，5+6=11 → 牛一', '5 张牌无法凑 10 → 无牛'],
        order: '牛牛 > 牛九 > 牛八 > 牛七 > 牛六 > 牛五 > 牛四 > 牛三 > 牛二 > 牛一 > 无牛'
      },
      natural: {
        desc: '经典牛牛的固定规则：',
        examples: [
          '五小牛：5 张都 < 5 且总和 ≤ 10',
          '炸弹牛：4 张相同',
          '五花牛：5 张都是 J/Q/K',
          '牛牛：3+2 组合都凑 10 的倍数'
        ],
        note: '特殊牌型倍数统一：五小牛 > 炸弹牛 = 五花牛 > 牛牛 > 牛九...'
      },
      odds: [
        { name: '五小牛', value: '5 倍' },
        { name: '炸弹牛 / 五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 ~ 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' }
      ],
      oddsNote: '倍数固定，实际赔率以下注规则为准。',
      tie: {
        desc: '牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '经典牛牛特色：',
        rows: [
          { t: 'Standard Rules', d: '标准 5 张牌、固定倍数' },
          { t: 'Simple', d: '无额外附加注，规则最清晰' },
          { t: 'Beginner Friendly', d: '适合新手入门' }
        ]
      },
      terms: [
        { en: 'Classic', zh: '经典' },
        { en: 'Standard Rules', zh: '标准规则' },
        { en: 'Beginner Friendly', zh: '新手友好' }
      ],
      faq: [
        { q: '经典牛牛和普通牛牛有什么不同？', a: '规则基本一致，经典牛牛倍数固定、无附加注，更容易上手。' },
        { q: '新手推荐玩哪种？', a: '推荐先玩经典牛牛熟悉规则，再尝试超级牛牛或奖励牛牛。' }
      ],
      disclaimer: '本游戏根据预设经典牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Super Niu Niu': {
      zh: '超级牛牛',
      tagline: '牛牛进阶版——加入更多特殊牌型和更高倍数，如超级五小牛、超级炸弹等，刺激度大幅提升。',
      quickStart: [
        { n: 1, title: '下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 3, title: '组合牛牌', desc: '标准 3+2 组合。' },
        { n: 4, title: '结算', desc: '特殊牌型倍数更高。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '超级牛牛新增特殊牌型：',
        examples: [
          '超级五小牛：5 张都 < 5 且总和 ≤ 10，倍数提升至 7-10 倍',
          '超级炸弹牛：4 张相同 + 额外倍率',
          '同花牛：5 张牌同一花色',
          '顺子牛：5 张牌连续'
        ],
        note: '超级牛牛的特殊牌型更多、倍数更高。'
      },
      odds: [
        { name: '超级五小牛', value: '7 - 10 倍' },
        { name: '超级炸弹牛', value: '5 - 6 倍' },
        { name: '同花牛 / 顺子牛', value: '4 - 5 倍' },
        { name: '五花牛', value: '4 倍' },
        { name: '牛牛', value: '3 倍' },
        { name: '牛七 ~ 牛九', value: '2 倍' },
        { name: '牛一 ~ 牛六', value: '1 倍' }
      ],
      oddsNote: '实际倍数因平台而异。',
      tie: {
        desc: '牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '超级牛牛特色：',
        rows: [
          { t: '超级五小牛', d: '更高倍数（7-10 倍）' },
          { t: '同花牛', d: '5 张同一花色' },
          { t: '顺子牛', d: '5 张连续牌' },
          { t: 'High Volatility', d: '波动大，刺激度高' }
        ]
      },
      terms: [
        { en: 'Super', zh: '超级' },
        { en: 'Same Suit', zh: '同花牛' },
        { en: 'Straight', zh: '顺子牛' },
        { en: 'High Volatility', zh: '高波动' }
      ],
      faq: [
        { q: '超级牛牛和经典牛牛的区别？', a: '超级牛牛增加特殊牌型（如同花牛、顺子牛），倍数也更高。' },
        { q: '超级五小牛怎么算？', a: '5 张牌都 < 5 且总和 ≤ 10，倍数通常 7-10 倍。' },
        { q: '适合什么玩家？', a: '适合追求刺激、能承受高波动的高阶玩家。' }
      ],
      disclaimer: '本游戏根据预设超级牛牛规则自动完成发牌、组合及结算。不同平台可能在倍数、特殊牌型上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Bonus Niu Niu': {
      zh: '奖励牛牛',
      tagline: '牛牛变体——除基础牛数外，加入多种附加注和奖励机制，如押牛牛、押特定牛数、押特殊牌型，增加玩法深度。',
      quickStart: [
        { n: 1, title: '基础下注', desc: '选择庄 / 闲 / 平倍 / 翻倍。' },
        { n: 2, title: '附加注', desc: '可额外押"出牛牛"、"出五小牛"、"出炸弹牛"等。' },
        { n: 3, title: '发牌', desc: '庄闲各 5 张牌。' },
        { n: 4, title: '结算', desc: '基础注 + 附加注分别独立结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典牛牛一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '奖励牛牛特色：',
        examples: [
          '基础牛牛：3+2 组合，标准倍数',
          '附加注：押"开出牛牛"或"开出五小牛"',
          '连开奖励：连续开出特定牌型可获额外奖励',
          '庄闲对押：庄和闲各下一个注，双重刺激'
        ],
        note: '附加注让玩家在基础玩法之外有更多策略选择。'
      },
      odds: [
        { name: '基础牛牛', value: '3 倍' },
        { name: '附加：出牛牛', value: '5 - 8 倍' },
        { name: '附加：出五小牛', value: '20 - 50 倍' },
        { name: '附加：出炸弹牛', value: '15 - 30 倍' },
        { name: '附加：出五花牛', value: '10 - 20 倍' }
      ],
      oddsNote: '附加注赔率较高，中奖概率较低，请理性下注。',
      tie: {
        desc: '基础注牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '奖励牛牛特色：',
        rows: [
          { t: 'Side Bets', d: '附加注类型' },
          { t: 'Bonus on Ngau Ngau', d: '开出牛牛额外奖励' },
          { t: 'Streak Bonus', d: '连开奖励' },
          { t: 'Double Bet', d: '庄闲双押' }
        ]
      },
      terms: [
        { en: 'Bonus', zh: '奖励' },
        { en: 'Side Bet', zh: '附加注' },
        { en: 'Streak', zh: '连开' },
        { en: 'Double Bet', zh: '双押' }
      ],
      faq: [
        { q: '奖励牛牛和经典牛牛的区别？', a: '奖励牛牛增加多种附加注和连开奖励，玩法更丰富。' },
        { q: '附加注有优势吗？', a: '附加注赔率高，但中奖概率低，长期看平衡。' },
        { q: '连开奖励是什么？', a: '连续多局开出特定牌型可获得额外奖励。' }
      ],
      disclaimer: '本游戏根据预设奖励牛牛规则自动完成发牌、组合及结算。不同平台可能在附加注类型、倍率上有差异，请以当前游戏页面显示的规则为准。'
    },

    'Variant Niu Niu': {
      zh: '变体牛牛',
      tagline: '牛牛变体合集——包含多种变体规则，如换牌牛牛、无牛翻倍、明牌牛牛等，让游戏更具策略性。',
      quickStart: [
        { n: 1, title: '选择变体', desc: '如换牌牛牛 / 明牌牛牛 / 无牛翻倍。' },
        { n: 2, title: '下注', desc: '选择庄 / 闲。' },
        { n: 3, title: '发牌 + 变体操作', desc: '根据变体不同，可能允许换牌或明牌。' },
        { n: 4, title: '比牌', desc: '牛数越大越强；变体特殊规则可能影响结算。' }
      ],
      pointCalc: {
        rows: [
          { k: 'A', v: '1 点' },
          { k: '2 – 9', v: '对应点数' },
          { k: '10 / J / Q / K', v: '10 点' }
        ],
        note: '牛几规则与经典牛牛一致。',
        examples: ['3+4+3=10，5+6=11 → 牛一'],
        order: '特殊牌型 > 牛牛 > 牛九 > ... > 牛一 > 无牛'
      },
      natural: {
        desc: '常见牛牛变体：',
        examples: [
          '换牌牛牛：可换 1-2 张牌再组合',
          '明牌牛牛：部分牌面公开，增加策略性',
          '无牛翻倍：出现"无牛"时翻倍赔付',
          '双庄牛牛：两位庄家，玩家可选押哪一方',
          '倍数牛牛：不同牛数对应不同倍数（更细致）'
        ],
        note: '变体规则多样，具体以当前游戏页面显示为准。'
      },
      odds: [
        { name: '基础牛牛', value: '3 倍' },
        { name: '无牛翻倍', value: '若出现无牛，翻倍结算' },
        { name: '换牌牛牛', value: '换牌后赔率可能调整' },
        { name: '双庄牛牛', value: '两位庄家分别结算' }
      ],
      oddsNote: '变体规则多样，实际赔率以当前游戏页面显示的规则为准。',
      tie: {
        desc: '基础牛数相同时：',
        rows: [
          { bet: '牛数相同', rule: '比最大单张' },
          { bet: '最大单张相同', rule: '比花色' }
        ]
      },
      pair: {
        desc: '变体牛牛特色：',
        rows: [
          { t: 'Swap Niu Niu', d: '换牌牛牛' },
          { t: 'Open Card', d: '明牌牛牛' },
          { t: 'No Ngau Multiplier', d: '无牛翻倍' },
          { t: 'Double Banker', d: '双庄牛牛' }
        ]
      },
      terms: [
        { en: 'Variant', zh: '变体' },
        { en: 'Swap', zh: '换牌' },
        { en: 'Open Card', zh: '明牌' },
        { en: 'Double Banker', zh: '双庄' }
      ],
      faq: [
        { q: '变体牛牛和经典牛牛的区别？', a: '变体牛牛引入换牌、明牌、无牛翻倍等特殊规则，策略性更强。' },
        { q: '换牌牛牛能换几张？', a: '通常允许换 1-2 张，具体以当前游戏页面显示为准。' },
        { q: '哪种变体最刺激？', a: '无牛翻倍和明牌牛牛刺激度较高。' }
      ],
      disclaimer: '本游戏根据预设变体牛牛规则自动完成发牌、组合及结算。不同平台差异较大，请以当前游戏页面显示的规则为准。'
    }

  };

  window.__apexApexRulesV3 = RULES;
  window.__apexApexSlidesV3 = SLIDES;

  console.log('[Apex] RULES v3 Punto Banco 数据已写入');
})();


// ============================================================
// 渲染函数 v3 - APEX-RENDER-V3
// ============================================================
(function () {
  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildCarousel(slides) {
    var html = '<div class="apex-rules-carousel"><div class="apex-rules-track" id="apex-rules-track">';
    slides.forEach(function (sl) {
      html += '<div class="apex-rules-slide"><div class="apex-rules-slide-title">' + esc(sl.title) + '</div>'
        + '<div class="apex-rules-slide-sub">' + esc(sl.sub) + '</div></div>';
    });
    html += '</div><div class="apex-rules-dots" id="apex-rules-dots">';
    slides.forEach(function (sl, i) {
      html += '<span class="apex-rules-dot' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '"></span>';
    });
    html += '</div></div>';
    return html;
  }

  function buildHead(modeName, rule) {
    return '<div class="apex-rules-head">'
      + '<div class="apex-rules-name">' + esc(modeName) + '</div>'
      + '<div class="apex-rules-cname">' + esc(rule.zh) + '</div>'
      + '<div class="apex-rules-tagline">' + esc(rule.tagline) + '</div>'
      + '</div>';
  }

  function buildQuickStart(qs) {
    if (!qs || !qs.length) return '';
    var rows = '';
    qs.forEach(function (s) {
      rows += '<div class="apex-step">'
        + '<div class="apex-step-num">' + s.n + '</div>'
        + '<div class="apex-step-body">'
        + '<div class="apex-step-t">' + esc(s.title) + '</div>'
        + '<div class="apex-step-d">' + esc(s.desc) + '</div>'
        + '</div></div>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">快速开始</div><div class="apex-steps">' + rows + '</div></div>';
  }

  function buildPointCalc(pc) {
    if (!pc) return '';
    var t = '<table class="apex-tbl"><thead><tr><th>牌面</th><th style="text-align:right;">点数</th></tr></thead><tbody>';
    pc.rows.forEach(function (r) {
      t += '<tr><td>' + esc(r.k) + '</td><td>' + esc(r.v) + '</td></tr>';
    });
    t += '</tbody></table>';
    var ex = '';
    (pc.examples || []).forEach(function (e) { ex += '<div class="apex-ex-line">' + esc(e) + '</div>'; });
    return '<div class="apex-rs"><div class="apex-rs-title">点数怎么算？</div>'
      + t
      + '<div class="apex-rs-text" style="margin-top:12px;">' + esc(pc.note) + '</div>'
      + '<div style="margin-top:8px;">' + ex + '</div>'
      + (pc.order ? '<div class="apex-rs-text" style="margin-top:10px;color:#ff6b00;font-weight:700;">' + esc(pc.order) + '</div>' : '')
      + '</div>';
  }

  function buildNatural(nat) {
    if (!nat) return '';
    var ex = '';
    (nat.examples || []).forEach(function (e) { ex += '<div class="apex-ex-line">' + esc(e) + '</div>'; });
    return '<div class="apex-rs"><div class="apex-rs-title">天牌 Natural</div>'
      + '<div class="apex-rs-text">' + esc(nat.desc) + '</div>'
      + '<div style="margin-top:10px;">' + ex + '</div>'
      + (nat.note ? '<div class="apex-rs-text" style="margin-top:10px;color:#8a8a8a;">' + esc(nat.note) + '</div>' : '')
      + '</div>';
  }

  function buildThirdCard(tc) {
    if (!tc) return '';
    var playerRows = '';
    (tc.playerRules || []).forEach(function (r) {
      playerRows += '<tr><td>' + esc(r.range) + '</td><td>' + esc(r.action) + '</td></tr>';
    });
    var playerTable = '<table class="apex-tbl"><thead><tr><th>闲家前两张牌</th><th style="text-align:right;">处理</th></tr></thead><tbody>' + playerRows + '</tbody></table>';

    var bankerRows = '';
    (tc.bankerRules || []).forEach(function (r) {
      bankerRows += '<tr><td>' + esc(r.pt) + '</td><td>' + esc(r.cond) + '</td><td>' + esc(r.action) + '</td></tr>';
    });
    var bankerTable = '<table class="apex-tbl"><thead><tr><th>庄家点数</th><th>闲家第三张</th><th style="text-align:right;">操作</th></tr></thead><tbody>' + bankerRows + '</tbody></table>';

    return '<div class="apex-rs"><div class="apex-rs-title">第三张牌规则</div>'
      + '<div class="apex-rs-text" style="margin-bottom:12px;">' + esc(tc.collapsedSummary) + '</div>'
      + '<details class="apex-fold"><summary>闲家规则</summary><div class="apex-fold-body">' + playerTable + '</div></details>'
      + '<details class="apex-fold"><summary>庄家规则（完整表）</summary><div class="apex-fold-body">' + bankerTable + '</div></details>'
      + '<div class="apex-rs-text" style="margin-top:12px;color:#8a8a8a;">第三张牌由系统根据固定规则自动决定，玩家无法选择。</div>'
      + '</div>';
  }

  function buildOutcome(oc) {
    if (!oc) return '';
    var rows = '';
    (oc.rows || []).forEach(function (r) {
      rows += '<tr><td>' + esc(r.cond) + '</td><td>' + esc(r.result) + '</td></tr>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">如何判定胜负</div>'
      + '<div class="apex-rs-text" style="margin-bottom:10px;">' + esc(oc.desc) + '</div>'
      + '<table class="apex-tbl"><tbody>' + rows + '</tbody></table>'
      + '</div>';
  }

  function buildOdds(odds, note, example) {
    if (!odds) return '';
    var rows = '';
    odds.forEach(function (o) {
      rows += '<tr><td>' + esc(o.name) + '</td><td>' + esc(o.value) + '</td></tr>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">赔率与派彩</div>'
      + '<table class="apex-tbl odds">' + rows + '</table>'
      + (note ? '<div class="apex-rs-text" style="margin-top:12px;color:#8a8a8a;font-size:12px;line-height:1.7;">' + esc(note) + '</div>' : '')
      + (example ? '<div class="apex-ex"><div class="apex-ex-line">' + esc(example) + '</div></div>' : '')
      + '</div>';
  }

  function buildTie(tie) {
    if (!tie) return '';
    var rows = '';
    (tie.rows || []).forEach(function (r) {
      rows += '<tr><td>' + esc(r.bet) + '</td><td>' + esc(r.rule) + '</td></tr>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">和局如何处理</div>'
      + '<div class="apex-rs-text" style="margin-bottom:10px;">' + esc(tie.desc) + '</div>'
      + '<table class="apex-tbl">' + rows + '</table>'
      + (tie.example ? '<div class="apex-ex"><div class="apex-ex-line">' + esc(tie.example) + '</div></div>' : '')
      + '</div>';
  }

  function buildPair(pair) {
    if (!pair) return '';
    var rows = '';
    (pair.rows || []).forEach(function (r) {
      rows += '<tr><td>' + esc(r.t) + '</td><td>' + esc(r.d) + '</td></tr>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">什么是对子？</div>'
      + '<div class="apex-rs-text" style="margin-bottom:10px;">' + esc(pair.desc) + '</div>'
      + '<table class="apex-tbl">' + rows + '</table>'
      + (pair.note ? '<div class="apex-rs-text" style="margin-top:10px;color:#8a8a8a;font-size:12px;">' + esc(pair.note) + '</div>' : '')
      + '</div>';
  }

  function buildExamples(exs) {
    if (!exs || !exs.length) return '';
    var html = '';
    exs.forEach(function (e) {
      var lines = '';
      (e.lines || []).forEach(function (l) { lines += '<div class="apex-ex-line">' + esc(l) + '</div>'; });
      html += '<div class="apex-ex">'
        + '<div class="apex-ex-title">' + esc(e.title) + '</div>'
        + lines
        + '<div class="apex-ex-result">' + esc(e.result) + '</div>'
        + '</div>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">示例牌局</div>' + html + '</div>';
  }

  function buildTerms(terms) {
    if (!terms || !terms.length) return '';
    var html = '';
    terms.forEach(function (t) {
      html += '<div class="apex-term"><div class="apex-term-en">' + esc(t.en) + '</div><div class="apex-term-zh">' + esc(t.zh) + '</div></div>';
    });
    return '<div class="apex-rs"><div class="apex-rs-title">常用术语</div>'
      + '<details class="apex-fold" open><summary>展开 / 收起</summary><div class="apex-fold-body"><div class="apex-terms">' + html + '</div></div></details>'
      + '</div>';
  }

  function buildFaq(faq) {
    if (!faq || !faq.length) return '';
    var html = '<div class="apex-faq">';
    faq.forEach(function (item, i) {
      html += '<details class="apex-faq-item"' + (i === 0 ? ' open' : '') + '>'
        + '<summary class="apex-faq-q">' + esc(item.q) + '</summary>'
        + '<div class="apex-faq-a">' + esc(item.a) + '</div>'
        + '</details>';
    });
    html += '</div>';
    return '<div class="apex-rs"><div class="apex-rs-title">常见问题 FAQ</div>' + html + '</div>';
  }

  function buildDisclaimer(text) {
    if (!text) return '';
    return '<div class="apex-disclaimer">'
      + '<div class="apex-disclaimer-title">重要说明</div>'
      + esc(text)
      + '</div>';
  }

  window.__apexBuildRulesPage = function (modeName, rule, slides) {
    var body = '<div class="apex-rules-body">'
      + buildCarousel(slides)
      + buildHead(modeName, rule)
      + buildQuickStart(rule.quickStart)
      + buildPointCalc(rule.pointCalc)
      + buildNatural(rule.natural)
      + buildThirdCard(rule.thirdCard)
      + buildOutcome(rule.outcome)
      + buildOdds(rule.odds, rule.oddsNote, rule.oddsExample)
      + buildTie(rule.tie)
      + buildPair(rule.pair)
      + buildExamples(rule.examples)
      + buildTerms(rule.terms)
      + buildFaq(rule.faq)
      + buildDisclaimer(rule.disclaimer)
      + '</div>';

    var hd = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-rules-back">' + svg('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">' + esc(modeName) + '</div>'
      + '</div>';

    var footer = '<div class="apex-rules-footer">'
      + '<button class="apex-rules-icon-btn" id="apex-rules-share" aria-label="分享">' + svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-3.8M8.6 13.4l6.8 3.8"/>') + '</button>'
      + '<button class="apex-rules-icon-btn" id="apex-rules-fav" aria-label="收藏">' + svg('<path d="M12 3l2.7 6 6.3.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9 9.3 9z"/>') + '</button>'
      + '<button class="apex-rules-try-btn" id="apex-rules-try">免费试玩</button>'
      + '<button class="apex-rules-start" id="apex-rules-start">开始游戏</button>'
      + '</div>';

    return hd + body + footer;
  };

  console.log('[Apex] Render v3 已就绪');
})();


// ============================================================
// 规则页事件绑定 v3 - APEX-BIND-V3
// ============================================================
(function () {
  function openRulesPage(modeName) {
    var RULES = window.__apexApexRulesV3 || {};
    var SLIDES = window.__apexApexSlidesV3 || [];

    var rule = RULES[modeName];
    if (!rule) {
      // 其他 4 个玩法暂时用简化提示
      if (window.__apex && window.__apex.toast) {
        window.__apex.toast(modeName + ' 规则页开发中', 'info');
      }
      return;
    }

    // 删除旧页
    var old = document.getElementById('apex-rules-page');
    if (old) old.remove();

    // 新建页
    var w = document.createElement('div');
    w.id = 'apex-rules-page';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:700;display:flex;flex-direction:column;overflow:hidden;';
    w.innerHTML = window.__apexBuildRulesPage(modeName, rule, SLIDES);
    document.body.appendChild(w);

    // 返回
    document.getElementById('apex-rules-back').addEventListener('click', function () { w.remove(); });

    // 分享
    document.getElementById('apex-rules-share').addEventListener('click', function () {
      var url = location.origin + location.pathname;
      var title = 'Apex ' + modeName;
      if (navigator.share) {
        navigator.share({ title: title, text: 'Apex Entertainment - ' + modeName, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          if (window.__apex && window.__apex.toast) window.__apex.toast('链接已复制', 'success');
        }).catch(function () {
          if (window.__apex && window.__apex.toast) window.__apex.toast('分享链接：' + url, 'info');
        });
      } else {
        if (window.__apex && window.__apex.toast) window.__apex.toast('分享链接：' + url, 'info');
      }
    });

    // 收藏
    var favBtn = document.getElementById('apex-rules-fav');
    var favKey = 'apex_fav_' + modeName;
    try { if (localStorage.getItem(favKey) === '1') favBtn.classList.add('is-active'); } catch (e) {}
    favBtn.addEventListener('click', function () {
      var isFav = favBtn.classList.toggle('is-active');
      try { localStorage.setItem(favKey, isFav ? '1' : '0'); } catch (e) {}
      if (window.__apex && window.__apex.toast) {
        window.__apex.toast(isFav ? '已收藏' : '已取消收藏', 'success');
      }
    });

    // 免费试玩
    document.getElementById('apex-rules-try').addEventListener('click', function () {
      if (window.__apex && window.__apex.toast) {
        window.__apex.toast(modeName + ' 免费试玩模式接入中', 'info');
      }
    });

    // 开始游戏
    document.getElementById('apex-rules-start').addEventListener('click', function () {
      if (window.__apex && window.__apex.toast) {
        window.__apex.toast(modeName + ' 游戏接入中，敬请期待', 'info');
      }
    });

    // 轮播
    (function initCarousel() {
      var track = document.getElementById('apex-rules-track');
      var dots = document.getElementById('apex-rules-dots');
      if (!track || !dots) return;
      var total = SLIDES.length || 4;
      var idx = 0, timer = null, INTERVAL = 4000;

      function go(n, animate) {
        idx = (n + total) % total;
        track.style.transition = animate === false ? 'none' : '';
        track.style.transform = 'translateX(-' + (idx * 100) + '%)';
        dots.querySelectorAll('.apex-rules-dot').forEach(function (d, i) {
          d.classList.toggle('is-active', i === idx);
        });
      }
      function start() { stop(); timer = setInterval(function () { go(idx + 1); }, INTERVAL); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      dots.querySelectorAll('.apex-rules-dot').forEach(function (d) {
        d.addEventListener('click', function () {
          go(Number(d.dataset.i) || 0);
          start();
        });
      });

      var startX = 0, deltaX = 0, isDragging = false, w = 0;
      track.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        deltaX = 0;
        isDragging = true;
        w = track.clientWidth;
        track.style.transition = 'none';
        stop();
      }, { passive: true });
      track.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        deltaX = e.touches[0].clientX - startX;
        var offset = -idx * w + deltaX;
        track.style.transform = 'translateX(' + offset + 'px)';
      }, { passive: true });
      track.addEventListener('touchend', function () {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = '';
        var threshold = Math.max(40, w * 0.15);
        if (deltaX > threshold) go(idx - 1);
        else if (deltaX < -threshold) go(idx + 1);
        else go(idx);
        start();
      }, { passive: true });

      start();
    })();
  }

  // 事件委托：三级导航
  //   .apex-mode-card (子页面里的模式卡片) → 规则页
  //   .apex-hot-item 若在 MODES_MAP → 模式页
  //   .apex-hot-item 若在 RULES     → 规则页
  function delegate() {
    if (window.__apexRulesV3Bound) return;
    window.__apexRulesV3Bound = true;

    document.addEventListener('click', function (e) {
      // ─── Level 1: 模式卡片 → 规则页 ───
      var modeCard = e.target.closest('.apex-mode-card');
      if (modeCard && modeCard.dataset.mode) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openRulesPage(modeCard.dataset.mode);
        return;
      }

      // ─── Level 2/3: 玩法卡片 ───
      var hotItem = e.target.closest('.apex-hot-item');
      if (!hotItem || !hotItem.dataset.name) return;

      var name = hotItem.dataset.name;
      var RULES = window.__apexApexRulesV3 || {};
      var MODES = window.__apexModesMap || {};

      // 有完整规则数据 → 直接打开规则页
      if (RULES[name]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openRulesPage(name);
        return;
      }

      // 有模式列表 → 打开模式页
      if (MODES[name]) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (typeof window.__apexOpenModesPage === 'function') {
          window.__apexOpenModesPage(name, MODES[name]);
        }
        return;
      }

      // 都没有 → 保持原 toast 行为
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', delegate);
  } else {
    setTimeout(delegate, 250);
  }

  console.log('[Apex] Bind v3 已就绪');
})();


// ============================================================
// 通用模式选择页 + 模式映射表 - APEX-GENERIC-MODES
// ============================================================
(function () {
  // 每个玩法的模式列表（英文名 + 中文名）
  var MODES_MAP = {
    'Baccarat': [
      { en: 'Punto Banco', zh: '彭托银行' },
      { en: 'Mini Baccarat', zh: '迷你百家樂' },
      { en: 'No Commission Baccarat', zh: '免佣百家樂' },
      { en: 'Speed Baccarat', zh: '极速百家樂' },
      { en: 'Baccarat Variants', zh: '百家樂变体' }
    ],
    'Blackjack': [
      { en: 'Classic Blackjack', zh: '经典21点' },
      { en: 'European Blackjack', zh: '欧洲21点' },
      { en: 'Spanish 21', zh: '西班牙21点' },
      { en: 'Blackjack Switch', zh: '21点换牌' },
      { en: 'Super Fun 21', zh: '超级21点' }
    ],
    "Texas Hold'em": [
      { en: "Texas Hold'em", zh: '德州扑克' },
      { en: "Short Deck Hold'em", zh: '短牌德州' },
      { en: 'Fast Fold Poker', zh: '快速弃牌' },
      { en: 'Tournament Poker', zh: '锦标赛扑克' },
      { en: 'Heads-Up Poker', zh: '单挑扑克' }
    ],
    'Omaha': [
      { en: 'Omaha', zh: '奥马哈' },
      { en: 'Omaha Hi-Lo', zh: '奥马哈高低' },
      { en: 'Pot-Limit Omaha', zh: '底池限注奥马哈' },
      { en: 'Five Card Omaha', zh: '五张奥马哈' }
    ],
    'Niu Niu': [
      { en: 'Niu Niu', zh: '牛牛' },
      { en: 'Classic Niu Niu', zh: '经典牛牛' },
      { en: 'Super Niu Niu', zh: '超级牛牛' },
      { en: 'Bonus Niu Niu', zh: '奖励牛牛' },
      { en: 'Variant Niu Niu', zh: '变体牛牛' }
    ]
  };

  window.__apexModesMap = MODES_MAP;

  var ICON = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10h6M9 14h6"/>';

  function svg(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.__apexOpenModesPage = function (title, modes) {
    if (!modes || !modes.length) return;

    // 删除旧页
    var old = document.getElementById('apex-modes-page');
    if (old) old.remove();

    var w = document.createElement('div');
    w.id = 'apex-modes-page';
    w.style.cssText = 'position:fixed;inset:0;background:#f5f5f7;z-index:600;display:flex;flex-direction:column;overflow:hidden;';

    var header = '<div class="apex-hot-header">'
      + '<button class="apex-hot-back" aria-label="返回" id="apex-modes-back">' + svg('<polyline points="15 18 9 12 15 6"/>') + '</button>'
      + '<div class="apex-hot-title">' + esc(title) + '</div>'
      + '</div>';

    var list = '<div class="apex-mode-list">';
    modes.forEach(function (m) {
      list += '<button class="apex-mode-card" data-mode="' + esc(m.en) + '">'
        + '<div class="apex-mode-icon">' + svg(ICON) + '</div>'
        + '<div class="apex-mode-info">'
        +   '<div class="apex-mode-title">' + esc(m.en) + '</div>'
        +   '<div class="apex-mode-sub">' + esc(m.zh) + '</div>'
        + '</div>'
        + '<span class="apex-mode-arrow">' + svg('<polyline points="9 6 15 12 9 18"/>') + '</span>'
        + '</button>';
    });
    list += '</div>';

    w.innerHTML = header + list;
    document.body.appendChild(w);

    document.getElementById('apex-modes-back').addEventListener('click', function () {
      w.remove();
    });

    // 模式卡片点击由主委托逻辑处理（.apex-mode-card → RULES → 规则页）
    console.log('[Apex] 通用模式页已打开：' + title + ' (' + modes.length + ' 个模式)');
  };

  console.log('[Apex] 通用模式组件已就绪');
})();
