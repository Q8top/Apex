// Apex 首页 — 交互逻辑
// 融合原内联脚本 + 保留认证检查 / 登出 / CSP 安全
(function () {
  'use strict';

  // ============ 1. 认证检查：未登录 → 跳回登录页 ============
  function checkAuth() {
    var controller = new AbortController();
    var tid = setTimeout(function () { controller.abort(); }, 8000);

    fetch('/api/me', {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal
    })
      .then(function (res) {
        clearTimeout(tid);
        if (res.status === 401) {
          location.replace('/');
          return null;
        }
        return res.ok ? res.json().catch(function () { return null; }) : null;
      })
      .then(function (data) {
        if (!data || !data.success || !data.user) {
          location.replace('/');
          return;
        }
        window.__apexUser = data.user;
      })
      .catch(function () {
        clearTimeout(tid);
      });
  }

  // ============ 2. 登出 ============
  function logout() {
    if (!window.confirm('确认登出？')) return;

    var post = (window.apiClient && window.apiClient.post)
      ? window.apiClient.post('/api/logout', {})
      : fetch('/api/logout', { method: 'POST', credentials: 'include' });

    Promise.resolve(post)
      .then(function () {
        try {
          if (window.__apexBroadcast) {
            window.__apexBroadcast.postMessage({ type: 'logout' });
          }
        } catch (e) {}
        location.replace('/');
      })
      .catch(function () {
        location.replace('/');
      });
  }

  // ============ 3. 顶部分类切换 ============
  function bindTopCategories() {
    var wrap = document.getElementById('casino-category');
    if (!wrap) return;

    wrap.addEventListener('click', function (e) {
      var item = e.target.closest('.casino-category');
      if (!item) return;

      var all = wrap.querySelectorAll('.casino-category');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      item.classList.add('active');

      console.log('[home] top category:', item.textContent.trim());
    });
  }

  // ============ 4. 体育分类切换 ============
  function bindSports() {
    var wrap = document.getElementById('sports-tabs');
    if (!wrap) return;

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.sport-tab');
      if (!btn) return;

      var all = wrap.querySelectorAll('.sport-tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');

      console.log('[home] sport tab:', btn.textContent.trim());
    });
  }

  // ============ 5. 底部导航切换 ============
  function bindBottomNav() {
    var nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.bottom-nav-item');
      if (!btn) return;

      var all = nav.querySelectorAll('.bottom-nav-item');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');

      var key = btn.getAttribute('data-key');
      console.log('[home] bottom nav:', key);

      // 后续可路由跳转：
      // if (key === 'wallet') location.href = '/wallet.html';
      // if (key === 'me') location.href = '/me.html';
      // if (key === 'games') location.href = '/games.html';
      // if (key === 'sports') location.href = '/sports.html';
    });
  }

  // ============ 6. 语言切换 ============
  function bindLanguage() {
    var btn = document.querySelector('.language-selector');
    if (!btn) return;

    var LANGUAGES = ['中文', 'English', 'Español', 'Português', 'Français'];

    btn.addEventListener('click', function () {
      var strong = btn.querySelector('strong');
      if (!strong) return;

      var current = strong.textContent.trim();
      var idx = LANGUAGES.indexOf(current);
      idx = (idx + 1) % LANGUAGES.length;
      strong.textContent = LANGUAGES[idx];

      console.log('[home] language:', LANGUAGES[idx]);
    });
  }

  // ============ 7. Banner 圆点自动切换 ============
  function bindHeroDots() {
    var dots = document.querySelectorAll('.hero-dots i');
    if (!dots || dots.length < 2) return;

    var current = 0;

    setInterval(function () {
      for (var i = 0; i < dots.length; i++) dots[i].classList.remove('active');
      current = (current + 1) % dots.length;
      dots[current].classList.add('active');
    }, 3500);
  }

  // ============ 8. 全局事件委托（data-apex-action）============
  function bindActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-apex-action]');
      if (!el) return;
      var action = el.getAttribute('data-apex-action');

      switch (action) {
        case 'logout':
          e.preventDefault();
          logout();
          break;

        case 'search':
          console.log('[home] search');
          break;

        case 'lang':
          // 已由 bindLanguage 处理
          break;

        case 'msg':
        case 'notice':
        case 'menu':
        case 'profile':
        case 'banner':
        case 'quick':
        case 'game':
        case 'hall':
        case 'sport':
        case 'jackpot':
        case 'activity':
        case 'vip':
        case 'svc':
        case 'foot':
        case 'more-hot':
        case 'more-hall':
        case 'more-sports':
        case 'more-recent':
        case 'more-favorites':
          console.log('[home] action:', action, el.dataset.key || '');
          break;

        default:
          console.log('[home] action:', action);
      }
    });
  }

  // ============ 9. 初始化 ============
  function init() {
    checkAuth();
    bindTopCategories();
    bindSports();
    bindBottomNav();
    bindLanguage();
    bindHeroDots();
    bindActions();
    console.log('[Apex] Home 页面已加载');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
