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

  const hp = document.getElementById('apex-homepage');
  if (hp) hp.style.display = 'block';

  // 同步当前语言
  try {
    var curLang = localStorage.getItem('apex_lang') || 'zh-CN';
    var flags = { 'zh-CN': '🇨🇳', 'en': '🇺🇸', 'ja': '🇯🇵' };
    var flagEl = document.getElementById('home-current-flag');
    if (flagEl && flags[curLang]) flagEl.textContent = flags[curLang];
    // 高亮菜单项
    document.querySelectorAll('#apex-homepage .apex-lang-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.lang === curLang);
    });
  } catch (e) {}
};

// 语言下拉
(function bindLang() {
  function init() {
    var btn = document.getElementById('home-lang-btn');
    var menu = document.getElementById('home-lang-menu');
    if (!btn || !menu || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle('show');
      btn.classList.toggle('open');
    });

    menu.querySelectorAll('.apex-lang-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = item.dataset.lang;
        var flag = item.dataset.flag;
        try { localStorage.setItem('apex_lang', lang); } catch (err) {}
        var flagEl = document.getElementById('home-current-flag');
        if (flagEl) flagEl.textContent = flag;
        menu.classList.remove('show');
        btn.classList.remove('open');
        document.querySelectorAll('#apex-homepage .apex-lang-item').forEach(function (el) {
          el.classList.toggle('active', el.dataset.lang === lang);
        });
        if (window.__setLang) window.__setLang(lang);
      });
    });

    document.addEventListener('click', function () {
      menu.classList.remove('show');
      btn.classList.remove('open');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 广告轮播
(function carousel() {
  var track = null;
  var dots = null;
  var slides = 0;
  var idx = 0;
  var timer = null;
  var INTERVAL = 4000;

  function go(n) {
    if (!track) return;
    idx = (n + slides) % slides;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    if (dots) {
      dots.querySelectorAll('.apex-carousel-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === idx);
      });
    }
  }

  function start() {
    stop();
    timer = setInterval(function () { go(idx + 1); }, INTERVAL);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function init() {
    track = document.getElementById('apex-carousel-track');
    dots = document.getElementById('apex-carousel-dots');
    if (!track) return;
    slides = track.querySelectorAll('.apex-carousel-slide').length;
    if (slides <= 1) return;

    if (dots) {
      dots.querySelectorAll('.apex-carousel-dot').forEach(function (d) {
        d.addEventListener('click', function () {
          go(Number(d.dataset.index) || 0);
          start();
        });
      });
    }

    // 页面可见性控制
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

// 占位按钮
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-apex-action="coming-soon"]');
  if (el) {
    e.preventDefault();
    if (window.__apex && window.__apex.toast) {
      window.__apex.toast('功能开发中，敬请期待', 'info');
    }
  }
});
