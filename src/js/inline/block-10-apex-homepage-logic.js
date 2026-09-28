// Apex 主页逻辑
window.showHomepage = function (user) {
  user = user || {};

  // 隐藏所有顶层 div（除主页、toast、安全中心 modal、header）
  document.querySelectorAll('body > div').forEach(function (el) {
    if (el.id === 'apex-homepage' || el.id === 'apex-toast' || el.id === 'security-modal') return;
    if (el.classList && el.classList.contains('header')) return; // 顶层语言切换保留
    el.style.display = 'none';
  });
  // 主页显示时，隐藏顶层的 header
  var header = document.querySelector('.header');
  if (header) header.style.display = 'none';

  const hp = document.getElementById('apex-homepage');
  if (hp) hp.style.display = 'block';

  // 填充用户名
  var nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.username || '用户';

  // 上次登录时间
  var lastEl = document.getElementById('user-last-login');
  if (lastEl && user.lastLoginAt) {
    try {
      var raw = String(user.lastLoginAt).replace(' ', 'T');
      if (!raw.includes('Z') && !raw.includes('+')) raw += 'Z';
      var d = new Date(raw);
      var fmt = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
      lastEl.textContent = '上次登录：' + fmt;
    } catch (e) { lastEl.textContent = '上次登录：--'; }
  } else if (lastEl) {
    lastEl.textContent = '上次登录：首次登录';
  }

  // 钱包余额（真实数据）
  var balEl = document.getElementById('user-balance');
  if (balEl) {
    var bal = Number(user.walletBalance) || 0;
    balEl.textContent = '$ ' + bal.toFixed(2);
  }

  // 语言：同步主页顶部按钮
  try {
    var curLang = localStorage.getItem('apex_lang') || 'zh-CN';
    var flags = { 'zh-CN': '🇨🇳', 'en': '🇺🇸', 'ja': '🇯🇵' };
    var names = { 'zh-CN': '简体中文', 'en': 'English', 'ja': '日本語' };
    var flagEl = document.getElementById('home-current-flag');
    if (flagEl && flags[curLang]) flagEl.textContent = flags[curLang];
  } catch (e) {}
};

// 主页语言按钮：点击弹出选择菜单
(function bindHomeLang() {
  function bind() {
    var btn = document.getElementById('home-lang-btn');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var langs = [
        { code: 'zh-CN', flag: '🇨🇳', name: '简体中文' },
        { code: 'en', flag: '🇺🇸', name: 'English' },
        { code: 'ja', flag: '🇯🇵', name: '日本語' }
      ];
      // 复用顶层的 lang-menu 或者自己建浮层
      var menu = document.getElementById('lang-menu');
      if (menu) {
        menu.classList.toggle('show');
        // 同步菜单位置到主页按钮
        var rect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.right = '14px';
        menu.style.top = (rect.bottom + 8) + 'px';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

// 占位按钮点击提示
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-apex-action="coming-soon"]');
  if (el) {
    e.preventDefault();
    if (window.__apex && window.__apex.toast) {
      window.__apex.toast('功能开发中，敬请期待', 'info');
    }
  }
});
