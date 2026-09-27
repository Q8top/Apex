window.apexLogout = function() {
    window.apiClient.post('/api/logout', {}).then(() => {
      // 认证状态唯一来源是 Cookie，登出后刷新即可回到登录页
      try { if (window.__apexBroadcast) window.__apexBroadcast.postMessage({ type: 'logout' }); } catch (e) {}
      location.reload();
    });
  };
