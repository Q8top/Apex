(function(){
  // 如果检测到有 Service Worker 注册，显示提示
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(rs){
      if (rs && rs.length > 0) {
        var b = document.getElementById('apex-refresh-banner');
        if (b) b.style.display = 'block';
      }
    });
  }
})();
