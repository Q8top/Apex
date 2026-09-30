// Apex 首页 v4 — 现代白色系交互
(function () {
  'use strict';

  // ============ 工具：触觉反馈 ============
  function haptic(ms) {
    try {
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate(ms || 6);
      }
    } catch (e) {}
  }

  // ============ 1. 认证检查 ============
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
        var nameEl = document.getElementById('topbar-username');
        if (nameEl) {
          var name = data.user.username || data.user.email || '用户';
          nameEl.textContent = name.length > 10 ? name.slice(0, 9) + '…' : name;
        }
      })
      .catch(function () {
        clearTimeout(tid);
      });
  }

  // ============ 2. 登出 ============
  function logout() {
    if (!window.confirm('确认登出？')) return;
    haptic(20);

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
      .catch(function () { location.replace('/'); });
  }

  // ============ 3. 一级 tabs ============
  function bindTopTabs() {
    var nav = document.getElementById('top-tabs');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab || tab.classList.contains('tab-more')) return;
      haptic(5);

      var all = nav.querySelectorAll('.tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      tab.classList.add('active');

      console.log('[home] tab:', tab.dataset.tab);
    });
  }

  // ============ 4. 分类 chip ============
  function bindChips() {
    var row = document.getElementById('chip-row');
    if (!row) return;

    row.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip || chip.classList.contains('chip-more')) return;
      haptic(5);

      var all = row.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      chip.classList.add('active');
    });
  }

  // ============ 5. 底部导航 ============
  function bindBottomNav() {
    var nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.bn-item');
      if (!btn) return;
      haptic(8);

      var all = nav.querySelectorAll('.bn-item');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');

      var key = btn.dataset.key;
      console.log('[home] nav:', key);

      // 未来路由：
      // if (key === 'wallet') location.href = '/wallet';
      // if (key === 'me') location.href = '/me';
      // if (key === 'cat') location.href = '/categories';
    });
  }

  // ============ 6. Hero 圆点自动切换 ============
  function bindHeroDots() {
    var dots = document.querySelectorAll('.hero-dots i');
    if (!dots || dots.length < 2) return;
    var cur = 0;
    setInterval(function () {
      for (var i = 0; i < dots.length; i++) dots[i].classList.remove('active');
      cur = (cur + 1) % dots.length;
      dots[cur].classList.add('active');
    }, 3500);
  }

  // ============ 7. 全局事件委托 ============
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
          var strong = el.querySelector('span');
          if (strong) {
            var langs = ['中文', 'EN', 'ES', 'PT', 'FR'];
            var idx = langs.indexOf(strong.textContent.trim());
            strong.textContent = langs[(idx + 1) % langs.length];
            haptic(6);
          }
          break;

        case 'region':
          haptic(6);
          console.log('[home] region');
          break;

        case 'profile':
          e.preventDefault();
          console.log('[home] profile');
          break;

        default:
          console.log('[home] action:', action, el.dataset.key || '');
      }
    }, true);
  }

  // ============ 8. 初始化 ============
  function init() {
    checkAuth();
    bindTopTabs();
    bindChips();
    bindBottomNav();
    bindHeroDots();
    bindActions();
    console.log('[Apex] Home v4 已加载');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
