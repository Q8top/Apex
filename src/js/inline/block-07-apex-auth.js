/* ============================================================
   Apex · 登录态处理（v8）
   登录成功后：隐藏登录壳 → 全屏白底 + 居中黑色「退出登录」按钮
   不再跳转 /home（该页面已下线）
   ============================================================ */
(function () {
  'use strict';

  var OVERLAY_ID = 'apex-post-login';

  function ensureOverlay() {
    var el = document.getElementById(OVERLAY_ID);
    if (el) return el;

    el = document.createElement('div');
    el.id = OVERLAY_ID;
    var s = el.style;
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.right = '0';
    s.bottom = '0';
    s.background = '#ffffff';
    s.display = 'flex';
    s.alignItems = 'center';
    s.justifyContent = 'center';
    s.zIndex = '9999';
    s.padding = '24px';

    var btn = document.createElement('button');
    btn.id = OVERLAY_ID + '-logout';
    btn.type = 'button';
    btn.textContent = '退出登录';
    var bs = btn.style;
    bs.padding = '14px 44px';
    bs.background = '#0a0a0a';
    bs.color = '#ffffff';
    bs.border = '0';
    bs.borderRadius = '999px';
    bs.fontSize = '15px';
    bs.fontWeight = '700';
    bs.fontFamily = 'inherit';
    bs.letterSpacing = '0.5px';
    bs.cursor = 'pointer';
    bs.boxShadow =
      '0 6px 18px rgba(10,10,10,.22), ' +
      'inset 0 1px 0 rgba(255,255,255,.12)';
    btn.addEventListener('click', doLogout);
    el.appendChild(btn);

    document.body.appendChild(el);
    return el;
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

  function showLoggedIn() {
    hideShell();
    ensureOverlay();
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

  window.showLoggedIn = showLoggedIn;
  window.apexLogout = doLogout;

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
        if (data && data.success && data.user) showLoggedIn();
      })
      .catch(function () { clearTimeout(timeoutId); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
