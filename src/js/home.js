/* ============================================================
   Apex v5 首页交互 · Part 4
   无框架 · 无 inline · 无 伪随机数 · CSP 安全
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var LANGS = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'pt', label: 'PT' },
    { code: 'fr', label: 'FR' }
  ];
  var LANG_KEY = 'apex_lang';
  var HERO_INTERVAL = 3500;

  /* ---------- 小工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
  }

  /* ---------- 认证 ---------- */
  function paintUser(me) {
    if (!me) return;
    var name = me.username || me.display_name || me.email || 'Guest';
    $$('.username').forEach(function (el) { el.textContent = name; });

    var initial = String(name).trim().charAt(0).toUpperCase() || 'A';
    $$('.avatar').forEach(function (el) {
      if (el.querySelector('svg') || el.querySelector('img')) return;
      if (el.querySelector('.avatar-initial')) return;
      var span = document.createElement('span');
      span.className = 'avatar-initial';
      span.textContent = initial;
      span.style.cssText =
        'font-weight:800;font-size:16px;color:#b8862d;font-family:inherit;';
      el.appendChild(span);
    });
  }

  function checkAuth() {
    return fetch('/api/me', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) {
        if (r.status === 401) {
          location.replace('/');
          return null;
        }
        if (!r.ok) return null;
        return r.json().catch(function () { return null; });
      })
      .then(function (me) { if (me) paintUser(me); return me; })
      .catch(function () { /* 网络错误不强制登出 */ });
  }

  /* ---------- 登出 ---------- */
  function doLogout() {
    buzz(12);
    var p;
    if (window.apiClient && typeof window.apiClient.post === 'function') {
      p = window.apiClient.post('/api/logout');
    } else {
      p = fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
    }
    Promise.resolve(p).catch(function () {}).then(function () {
      location.replace('/');
    });
  }

  /* ---------- active 切换 ---------- */
  function setActive(list, target) {
    list.forEach(function (el) { el.classList.remove('active'); });
    target.classList.add('active');
  }

  /* ---------- 语言循环 ---------- */
  var LANG_INDEX = 0;
  function paintLang() {
    var cur = LANGS[LANG_INDEX];
    $$('.glass-btn').forEach(function (btn) {
      if (!btn.querySelector('.ri-global-line')) return;
      var span = btn.querySelector('span');
      if (span) { span.textContent = cur.label; return; }
      Array.prototype.forEach.call(btn.childNodes, function (n) {
        if (n.nodeType === 3 && n.textContent.trim().length > 0) {
          n.textContent = cur.label;
        }
      });
    });
    document.documentElement.setAttribute(
      'lang',
      LANGS[LANG_INDEX].code === 'zh' ? 'zh-CN' : LANGS[LANG_INDEX].code
    );
  }
  function cycleLang() {
    buzz(8);
    LANG_INDEX = (LANG_INDEX + 1) % LANGS.length;
    try { localStorage.setItem(LANG_KEY, LANGS[LANG_INDEX].code); } catch (e) {}
    paintLang();
  }
  function initLang() {
    var saved = '';
    try { saved = localStorage.getItem(LANG_KEY) || ''; } catch (e) {}
    if (saved) {
      var idx = -1;
      for (var i = 0; i < LANGS.length; i++) {
        if (LANGS[i].code === saved) { idx = i; break; }
      }
      if (idx >= 0) LANG_INDEX = idx;
    }
    paintLang();
  }

  /* ---------- Hero Dots ---------- */
  var HERO_TIMER = null;
  var HERO_IDX = 0;
  function setHero(i) {
    var dots = $$('.hero-dots > i');
    if (!dots.length) return;
    HERO_IDX = ((i % dots.length) + dots.length) % dots.length;
    dots.forEach(function (d, k) {
      d.classList.toggle('active', k === HERO_IDX);
    });
  }
  function restartHeroTimer() {
    if (HERO_TIMER) clearInterval(HERO_TIMER);
    HERO_TIMER = setInterval(function () {
      setHero(HERO_IDX + 1);
    }, HERO_INTERVAL);
  }
  function initHero() {
    var dots = $$('.hero-dots > i');
    if (!dots.length) return;
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        buzz(6);
        setHero(i);
        restartHeroTimer();
      });
    });
    setHero(0);
    restartHeroTimer();
  }

  /* ---------- 事件委托 ---------- */
  function bindDelegate() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;

      /* data-apex-action 优先 */
      var actionEl = t.closest('[data-apex-action]');
      if (actionEl) {
        var act = actionEl.getAttribute('data-apex-action');
        if (act === 'logout') { ev.preventDefault(); doLogout(); return; }
        if (act === 'lang')   { ev.preventDefault(); cycleLang(); return; }
        if (act === 'back')   { ev.preventDefault(); history.back(); return; }
      }

      /* 顶部 tab */
      var tab = t.closest('.tabs .tab');
      if (tab && !tab.classList.contains('tab-more')) {
        buzz(6);
        setActive($$('.tab', tab.parentElement), tab);
        return;
      }

      /* chip */
      var chip = t.closest('.chip-row .chip');
      if (chip && !chip.classList.contains('chip-more')) {
        buzz(6);
        setActive($$('.chip', chip.parentElement), chip);
        return;
      }

      /* 底部导航 */
      var bn = t.closest('.bottom-nav .bn-item');
      if (bn) {
        buzz(8);
        setActive($$('.bn-item', bn.parentElement), bn);
        var href = bn.getAttribute('data-href') || bn.getAttribute('href');
        if (href && href !== '#' && href !== 'javascript:;') {
          location.href = href;
        }
        return;
      }

      /* 语言按钮兜底 */
      var gb = t.closest('.glass-btn');
      if (gb && gb.querySelector('.ri-global-line')) {
        ev.preventDefault();
        cycleLang();
        return;
      }
    }, false);
  }

  /* ---------- 入场动画（GSAP 可用则用，否则直接显示） ---------- */
  function softReveal() {
    var targets = $$('.section, .quick-cats, .promo, .help-row');
    if (!targets.length) return;
    if (typeof window.gsap !== 'undefined') {
      try {
        window.gsap.from(targets, {
          y: 18, opacity: 0, duration: 0.55,
          stagger: 0.06, ease: 'power2.out', clearProps: 'all'
        });
        return;
      } catch (e) { /* fall through to no-op */ }
    }
    /* 无 GSAP：内容已可见，无需处理 */
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initLang();
    initHero();
    bindDelegate();
    checkAuth();
    softReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
