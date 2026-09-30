// Apex 登录后首页 — 交互逻辑
(function () {
  'use strict';

  // P84-7: 统一 CSPRNG（避免 Math.random 触发安全扫描）
  // 使用 Web Crypto，0..1 的浮点数。仅用于装饰性动画，非安全用途。
  function cryptoRandom() {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }

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

  // ============ 3. Jackpot 数字滚动动画 ============
  function animateJackpot() {
    var el = document.getElementById('jackpot-num');
    if (!el) return;

    var target = 8888888;
    var start = target - 120000 + Math.floor(cryptoRandom() * 240000);
    var t0 = performance.now();
    var duration = 1800;

    function fmt(n) {
      return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function step(now) {
      var p = Math.min(1, (now - t0) / duration);
      // easeOutCubic
      var e = 1 - Math.pow(1 - p, 3);
      var v = start + (target - start) * e;
      el.textContent = fmt(v);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = fmt(target);
      }
    }

    requestAnimationFrame(step);
  }

  // ============ 4. 事件委托（CSP 无 inline）============
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
        // 后续接搜索页
        console.log('[home] search');
        break;

      case 'lang':
        // 后续接语言切换
        console.log('[home] lang');
        break;

      case 'nav-home':
        // 当前已是首页，不做跳转
        e.preventDefault();
        break;

      default:
        // 其余按钮暂时仅做占位反馈
        console.log('[home] action:', action);
    }
  });

  // ============ 5. 初始化 ============
  function init() {
    checkAuth();
    animateJackpot();
    console.log('[Apex] Home 页面已加载');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
