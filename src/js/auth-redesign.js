// ApexTop - 动态文字轮播
(function() {
  'use strict';
  var features = [
    '下一代 AI 生产力工具',
    '垂直行业 SaaS 解决方案',
    '高精准 B2B 线索平台',
    '全球付费数据库与专业目录',
    '面向特定职业的自动化引擎',
    '垂直电商工具与插件生态',
    '求职与职业发展智能工具',
    'SEO 内容网站与专业资讯平台'
  ];
  
  var index = 0;
  var textEl = document.getElementById('feature-text');
  var badgeEl = document.getElementById('dynamic-badge');
  
  if (!textEl || !badgeEl) return;
  
  function updateText() {
    // 简单的淡出淡入动画
    textEl.style.opacity = 0;
    textEl.style.transform = 'translateY(5px)';
    textEl.style.transition = 'all 0.3s ease';
    
    setTimeout(function() {
      textEl.textContent = features[index];
      textEl.style.opacity = 1;
      textEl.style.transform = 'translateY(0)';
      
      // 改变 dot 颜色以区分不同业务
      var colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0d9488', '#4f46e5', '#d97706'];
      var dot = badgeEl.querySelector('.dot');
      if (dot) {
        dot.style.backgroundColor = colors[index % colors.length];
        dot.style.boxShadow = '0 0 10px ' + colors[index % colors.length];
      }
      
      index = (index + 1) % features.length;
    }, 300);
  }
  
  setInterval(updateText, 3000);
})();
