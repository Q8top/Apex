(function () {
  'use strict';

  window.showLoggedIn = function (user) {
    var formIds = [
      'login-method-picker', 'register-method-picker',
      'passkey-signup-form', 'login-form', 'register-form',
      'forgot-method-picker', 'passkey-recover-form', 'forgot-form'
    ];
    for (var i = 0; i < formIds.length; i++) {
      var el = document.getElementById(formIds[i]);
      if (el) el.style.display = 'none';
    }
    var tabs = document.getElementById('auth-tabs');
    if (tabs) tabs.style.display = 'none';
    var cardSection = document.querySelector('.card-section');
    if (cardSection) cardSection.style.display = 'none';
    var linkRow = document.querySelector('.link-row');
    if (linkRow) linkRow.style.display = 'none';

    var el = document.getElementById('apex-logged-in');
    if (el) {
      el.style.display = 'block';
      var userEl = document.getElementById('apex-logged-in-user');
      if (userEl) {
        var name = (user && (user.username || user.email)) || '用户';
        userEl.textContent = name;
      }
    }
  };

  function doLogout() {
    if (typeof window.apexLogout === 'function') {
      window.apexLogout();
    } else {
      window.apiClient.post('/api/logout', {}).then(function () {
        location.reload();
      });
    }
  }

  function bindLogout() {
    var btn = document.getElementById('apex-logged-in-logout');
    if (btn) btn.addEventListener('click', doLogout);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLogout);
  } else {
    bindLogout();
  }

  // 自动登录检查
  var controller = new AbortController();
  var timeoutId = setTimeout(function () { controller.abort(); }, 8000);
  fetch('/api/me', { credentials: 'include', signal: controller.signal, cache: 'no-store' })
    .then(function (res) {
      clearTimeout(timeoutId);
      if (res.status === 401) return { success: false };
      if (!res.ok) return { success: false };
      return res.json().catch(function () { return { success: false }; });
    })
    .then(function (data) {
      if (data && data.success && data.user) window.showLoggedIn(data.user);
    })
    .catch(function () { clearTimeout(timeoutId); });

  console.log('[Apex] Auth 模块已加载');
})();
