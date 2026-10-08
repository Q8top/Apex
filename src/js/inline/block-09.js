/* Apex · 登出兜底
 * 若 block-07-apex-auth.js 已定义 window.apexLogout，则不覆盖
 */
(function () {
  'use strict';
  if (typeof window.apexLogout === 'function') return;

  window.apexLogout = function () {
    var p = (window.apiClient && typeof window.apiClient.post === 'function')
      ? window.apiClient.post('/api/logout', {})
      : Promise.resolve();
    Promise.resolve(p).catch(function () {}).then(function () {
      try {
        if (window.__apexBroadcast) {
          window.__apexBroadcast.postMessage({ type: 'logout' });
        }
      } catch (e) {}
      location.reload();
    });
  };
})();
