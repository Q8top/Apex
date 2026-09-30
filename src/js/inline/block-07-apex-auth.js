(function () {
  'use strict';

  window.showLoggedIn = function (user) {
    // P82-Fix: 登录后隐藏整个登录页外壳（Hero / 卡片 / 链接行 / 页脚）
    // 之前的实现只隐藏了认证卡片，但 .link-row 使用了 display:flex !important
    // 覆盖了 JS 的 style.display='none'，导致"在线客服/忘记密码"仍残留。
    // 现在通过在 <body> 上添加 class，让 CSS 用 !important 统一隐藏。

    // 1) 隐藏所有认证表单
    var formIds = [
      'login-method-picker', 'register-method-picker',
      'passkey-signup-form', 'login-form', 'register-form',
      'forgot-method-picker', 'passkey-recover-form', 'forgot-form'
    ];
    for (var i = 0; i < formIds.length; i++) {
      var el = document.getElementById(formIds[i]);
      if (el) el.style.display = 'none';
    }

    // 2) body 加 class，CSS 统一控制外壳显隐（!important 优先级最高）
    try {
      document.body.classList.add('apex-logged-in-active');
    } catch (e) {}

    // 3) 内联兜底（防止 CSS 未及时加载）
    try {
      var _hide = function (sel) {
        var n = document.querySelector(sel);
        if (n && n.style) {
          n.style.setProperty('display', 'none', 'important');
        }
      };
      _hide('.hero');
      _hide('.card-section');
      _hide('.link-row');
      _hide('.footer');
      _hide('#auth-tabs');
    } catch (e) {}

    // 4) 跳转到登录后首页（/home.html）
    //    home.html 会在加载时再次调用 /api/me 校验登录态，
    //    因此这里直接跳转是安全的。
    try {
      var targetPath = '/home?v=20260930c';
      var curPath = location.pathname;
      if (curPath !== '/home' && curPath !== '/home.html' && !curPath.startsWith('/home')) {
        location.replace(targetPath);
        return;
      }
    } catch (e) {}

    // 5) 兜底：若已在 home.html（浏览器前进后退），显示原欢迎卡片
    // 4) 显示登录后欢迎页
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
