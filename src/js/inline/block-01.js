(function () {
  'use strict';
  // 如果检测到有 Service Worker 注册，显示提示
  if (!('serviceWorker' in navigator)) return;
  if (typeof navigator.serviceWorker.getRegistrations !== 'function') return;
  navigator.serviceWorker.getRegistrations().then(function (rs) {
    if (!rs || rs.length === 0) return;
    var b = document.getElementById('apex-refresh-banner');
    if (b) b.style.display = 'block';
  }).catch(function () { /* 权限或隐私模式，静默 */ });
})();
