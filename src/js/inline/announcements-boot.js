/* Apex · Announcements 页面引导脚本
 * 从 announcements.html 内联 <script> 外移（CSP 收紧后内联不生效）
 * 作用：渲染前检查 auth hint，并处理浏览器后退缓存 (pageshow) */
(function () {
  'use strict';

  function setVisibility() {
    try {
      if (localStorage.getItem('apex_auth_hint') === '1') {
        document.documentElement.style.visibility = 'hidden';
      } else {
        document.documentElement.style.visibility = '';
      }
    } catch (e) {}
  }

  setVisibility();
  window.addEventListener('pageshow', setVisibility);
})();
