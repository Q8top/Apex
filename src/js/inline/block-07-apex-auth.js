/* Apex · 登录态（v10）
 * 修复：doLogout 里 clearTimeout(t) 引用未定义变量
 */
(function () {
  'use strict';

  function hideShell() {
    var sel = ['.hero', '.card-section', '.link-row', '.footer', '#auth-tabs',
      '#login-method-picker', '#register-method-picker', '#passkey-signup-form',
      '#login-form', '#register-form', '#forgot-method-picker',
      '#passkey-recover-form', '#forgot-form', '#apex-logged-in'];
    sel.forEach(function (s) {
      var ns = document.querySelectorAll(s);
      Array.prototype.forEach.call(ns, function (n) {
        if (n && n.style) n.style.setProperty('display', 'none', 'important');
      });
    });
    try { document.body.classList.add('apex-logged-in-active'); } catch (e) {}
  }

  function showLoggedIn(user) {
    try { localStorage.setItem('apex_auth_hint', '1'); } catch (e) {}
    try { document.body.classList.remove('apex-booting'); } catch (e) {}
    hideShell();
    if (window.__apexApp && typeof window.__apexApp.show === 'function') {
      try { window.__apexApp.show(user || null); }
      catch (e) { /* UI 层异常不阻断登录态 */ }
    }
  }

  function doLogout() {
    var p = (window.apiClient && typeof window.apiClient.post === 'function')
      ? window.apiClient.post('/api/logout')
      : fetch('/api/logout', { method: 'POST', credentials: 'include' });

    Promise.resolve(p).catch(function () {
      try { document.body.classList.remove('apex-booting'); } catch (e) {}
    }).then(function () {
      if (window.__apexApp && typeof window.__apexApp.hide === 'function') {
        try { window.__apexApp.hide(); } catch (e) {}
      }
      try { localStorage.removeItem('apex_auth_hint'); } catch (e) {}
      try { document.documentElement.classList.remove('apex-auth-hint'); } catch (e) {}
      location.replace('/');
    });
  }

  window.showLoggedIn = showLoggedIn;
  window.apexLogout = doLogout;

  function handleAuthResult(d) {
    if (d && d.success && d.user) {
      showLoggedIn(d.user);
    } else {
      try { document.body.classList.remove('apex-booting'); } catch (e) {}
      try { localStorage.removeItem('apex_auth_hint'); } catch (e) {}
    }
  }

  function handleAuthFail() {
    try { document.body.classList.remove('apex-booting'); } catch (e) {}
  }

  function checkAuth() {
    if (typeof AbortController !== 'function') {
      fetch('/api/me', { credentials: 'include', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
        .then(handleAuthResult)
        .catch(handleAuthFail);
      return;
    }
    var c = new AbortController();
    var t = setTimeout(function () { c.abort(); }, 8000);
    fetch('/api/me', { credentials: 'include', signal: c.signal, cache: 'no-store' })
      .then(function (r) { clearTimeout(t); return r.ok ? r.json().catch(function () { return null; }) : null; })
      .then(handleAuthResult)
      .catch(function () { clearTimeout(t); handleAuthFail(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
