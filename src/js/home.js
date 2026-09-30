// Apex 首页 — 交互逻辑
// 设计参照：React Native 源 → 纯 HTML/CSS/JS 翻译
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
        // 顶部 VIP 徽章：若用户有 VIP 等级，可在此替换
        // （当前保留静态 "VIP1"）
      })
      .catch(function () {
        clearTimeout(tid);
        // 网络异常时保守处理：不跳转，允许用户重试
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

  // ============ 3. 顶部 tab 切换 ============
  function bindTopTabs() {
    var nav = document.getElementById('top-tabs');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn) return;
      var all = nav.querySelectorAll('.tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      // 后续可在此触发路由切换 / 内容加载
      console.log('[home] top tab:', btn.getAttribute('data-tab'));
    });
  }

  // ============ 4. 体育 tab 切换 ============
  function bindSportTabs() {
    var nav = document.getElementById('sport-tabs');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.sport-tab');
      if (!btn) return;
      var all = nav.querySelectorAll('.sport-tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      console.log('[home] sport tab:', btn.getAttribute('data-sport'));
    });
  }

  // ============ 5. 全局事件委托（data-apex-action）============
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

        case 'nav-home':
          e.preventDefault(); // 已在首页
          break;

        case 'search':
          // 后续接搜索页
          console.log('[home] search');
          break;

        case 'lang':
          // 后续接语言切换
          console.log('[home] lang');
          break;

        case 'profile':
          e.preventDefault();
          console.log('[home] profile');
          break;

        default:
          // 其他动作暂占位
          console.log('[home] action:', action, el.dataset.key || '');
      }
    });
  }

  // ============ 6. 初始化 ============
  function init() {
    checkAuth();
    bindTopTabs();
    bindSportTabs();
    bindActions();
    console.log('[Apex] Home 页面已加载');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
