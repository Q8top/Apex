(function() {
  'use strict';

  // ============================================================
  // 初始化所有密码框的小眼睛图标
  // ============================================================
  const EYE_OPEN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  document.querySelectorAll('.btn-toggle').forEach(function (el) { el.innerHTML = EYE_OPEN; });

  console.log('[Apex] 小眼睛图标已初始化');
})();
