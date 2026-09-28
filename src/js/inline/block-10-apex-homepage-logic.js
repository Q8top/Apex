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
