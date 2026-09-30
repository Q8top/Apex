/* ============================================================
   Apex · 登录态处理（v7）
   登录成功 → 跳转 /home
   /home 自己再做一次 /api/me 校验
   ============================================================ */
(function () {
  'use strict';

  var HOME_PATH = '/home';

  function goHome() {
    try {
      var cur = location.pathname;
      if (cur === HOME_PATH || cur === HOME_PATH + '.html') return;
      location.replace(HOME_PATH);
    } catch (e) {}
  }

  function hideShell() {
    var selectors = [
      '.hero', '.card-section', '.link-row', '.footer', '#auth-tabs',
      '#login-method-picker', '#register-method-picker',
      '#passkey-signup-form', '#login-form', '#register-form',
      '#forgot-method-picker', '#passkey-recover-form', '#forgot-form',
      '#apex-logged-in'
    ];
    selectors.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      Array.prototype.forEach.call(nodes, function (n) {
        if (n && n.style) n.style.setProperty('display', 'none', 'important');
      });
    });
    try { document.body.classList.add('apex-logged-in-active'); } catch (e) {}
  }

  function doLogout() {
    var p;
    if (window.apiClient && typeof window.apiClient.post === 'function') {
      p = window.apiClient.post('/api/logout');
    } else {
      p = fetch('/api/logout', { method: 'POST', credentials: 'include' });
    }
    Promise.resolve(p).catch(function () {}).then(function () {
      location.replace('/');
    });
  }

  window.apexLogout = doLogout;

  // 兼容旧接口名
  window.showLoggedIn = function () {
    hideShell();
    goHome();
  };

  function checkAuth() {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 8000);
    fetch('/api/me', {
      credentials: 'include',
      signal: controller.signal,
      cache: 'no-store'
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return res.json().catch(function () { return null; });
      })
      .then(function (data) {
        if (data && data.success && data.user) {
          hideShell();
          goHome();
        }
      })
      .catch(function () { clearTimeout(timeoutId); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
