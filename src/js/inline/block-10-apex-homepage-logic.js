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

  // 事件委托：拦截所有 .apex-hot-item[data-name="Baccarat"] 的点击
  function delegate() {
    if (window.__apexBaccaratBound) return;
    window.__apexBaccaratBound = true;

    document.addEventListener('click', function (e) {
      var item = e.target.closest('.apex-hot-item');
      if (!item) return;
      if (item.dataset.name === 'Baccarat') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        build();
        var page = document.getElementById('apex-baccarat-modes');
        if (page) page.style.display = 'flex';
      }
    }, true); // capture 阶段，抢在 toast 之前
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', delegate);
  } else {
    setTimeout(delegate, 100);
  }
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

  // 事件委托：点玩法卡片
  function delegate() {
    if (window.__apexRulesV3Bound) return;
    window.__apexRulesV3Bound = true;

    document.addEventListener('click', function (e) {
      var card = e.target.closest('.apex-mode-card');
      if (!card) return;
      var mode = card.dataset.mode;
      if (!mode) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openRulesPage(mode);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', delegate);
  } else {
    setTimeout(delegate, 250);
  }

  console.log('[Apex] Bind v3 已就绪');
})();
