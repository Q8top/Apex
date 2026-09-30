/* ============================================================
   Apex · 登录态处理（v6）
   登录成功后：隐藏登录壳 → 只显示一个「退出登录」按钮
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
    bs.background = 'linear-gradient(135deg, #F5D77F, #D4A03E)';
    bs.color = '#1a1208';
    bs.border = '0';
    bs.borderRadius = '999px';
    bs.fontSize = '15px';
    bs.fontWeight = '800';
    bs.fontFamily = 'inherit';
    bs.letterSpacing = '0.5px';
    bs.cursor = 'pointer';
    bs.boxShadow =
      '0 10px 26px rgba(212,160,62,.5), ' +
      'inset 0 1px 0 rgba(255,255,255,.5), ' +
      'inset 0 -2px 4px rgba(0,0,0,.12)';
    btn.addEventListener('click', doLogout);
    el.appendChild(btn);

    document.body.appendChild(el);
    return el;
  }

  function hideSelector(sel) {
    var nodes = document.querySelectorAll(sel);
    Array.prototype.forEach.call(nodes, function (n) {
      if (n && n.style) n.style.setProperty('display', 'none', 'important');
    });
  }

  function showLoggedIn() {
    var selectors = [
      '.hero', '.card-section', '.link-row', '.footer', '#auth-tabs',
      '#login-method-picker', '#register-method-picker',
      '#passkey-signup-form', '#login-form', '#register-form',
      '#forgot-method-picker', '#passkey-recover-form', '#forgot-form',
      '#apex-logged-in'
    ];
    selectors.forEach(function (sel) { hideSelector(sel); });

    try { document.body.classList.add('apex-logged-in-active'); } catch (e) {}

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
