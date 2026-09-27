(function() {
  'use strict';
  // 自动登录：调用 /api/me（Cookie 自动发送）
  // 加 8s 超时避免网络卡住时首页无限等待
  var controller = new AbortController();
  var timeoutId = setTimeout(function () { controller.abort(); }, 8000);

  fetch('/api/me', {
    credentials: 'include',
    signal: controller.signal,
    cache: 'no-store'
  })
    .then(function (res) {
      clearTimeout(timeoutId);
      if (res.status === 401) return { success: false };
      if (!res.ok) return { success: false };
      return res.json().catch(function () { return { success: false }; });
    })
    .then(function (data) {
      if (data && data.success && data.user) {
        if (typeof window.showHomepage === 'function') {
          window.showHomepage(data.user);
        }
      }
    })
    .catch(function (err) {
      // 超时/网络错误：静默保留登录表单（用户可手动登录）
      if (err && err.name === 'AbortError') {
        // 超时，不阻塞 UI
      }
    })
    .finally(function () {
      clearTimeout(timeoutId);
    });
})();
