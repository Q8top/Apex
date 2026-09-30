/* ============================================================
   Apex · 登录后首页交互 v7
   用户名脱敏：只显示「用户 {id}」
   ============================================================ */
(function () {
  'use strict';

  var LANGS = [
    { code: 'zh', flag: '🇨🇳', label: '中文' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'pt', flag: '🇵🇹', label: 'Português' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' }
  ];
  var LANG_KEY = 'apex_lang';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
  }

  /* ---------- Toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  /* ---------- 语言 ---------- */
  function findLang(code) {
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].code === code) return i;
    }
    return 0;
  }
  function paintLang(idx) {
    var cur = LANGS[idx];
    var flagEl  = $('#lang-flag');
    var labelEl = $('#lang-label');
    if (flagEl)  flagEl.textContent  = cur.flag;
    if (labelEl) labelEl.textContent = cur.label;
    document.documentElement.setAttribute(
      'lang', cur.code === 'zh' ? 'zh-CN' : cur.code
    );
    $$('.lang-menu li').forEach(function (li) {
      var on = li.getAttribute('data-lang') === cur.code;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function closeMenu() {
    var menu = $('#lang-menu');
    var btn  = $('#lang-btn');
    if (menu) menu.hidden = true;
    if (btn)  btn.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    var menu = $('#lang-menu');
    var btn  = $('#lang-btn');
    if (menu) menu.hidden = false;
    if (btn)  btn.setAttribute('aria-expanded', 'true');
  }
  function initLang() {
    var saved = '';
    try { saved = localStorage.getItem(LANG_KEY) || ''; } catch (e) {}
    paintLang(saved ? findLang(saved) : 0);

    var btn = $('#lang-btn');
    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        buzz(6);
        var menu = $('#lang-menu');
        if (menu && menu.hidden) openMenu(); else closeMenu();
      });
    }
    $$('.lang-menu li').forEach(function (li) {
      li.addEventListener('click', function () {
        var code = li.getAttribute('data-lang');
        paintLang(findLang(code));
        try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
        buzz(10);
        closeMenu();
      });
    });
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest('.wc-head')) closeMenu();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeMenu();
    });
  }

  /* ---------- 用户信息（脱敏） ---------- */
  function paintUser(user) {
    if (!user) return;
    var id = user.id || user.user_id || user.uid || '';
    var nEl = $('#profile-name');
    var iEl = $('#profile-id');
    if (nEl) nEl.textContent = id ? ('用户 ' + id) : '用户';
    if (iEl) iEl.textContent = id ? ('ID: ' + id) : 'ID: --';
  }

  function checkAuth() {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 8000);
    fetch('/api/me', {
      credentials: 'include',
      signal: controller.signal,
      cache: 'no-store'
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (res.status === 401) {
          location.replace('/');
          return null;
        }
        if (!res.ok) return null;
        return res.json().catch(function () { return null; });
      })
      .then(function (data) {
        if (!data) return;
        paintUser(data.user || data);
      })
      .catch(function () { clearTimeout(timeoutId); });
  }

  /* ---------- 退出 ---------- */
  function doLogout() {
    buzz(12);
    var p;
    if (window.apiClient && typeof window.apiClient.post === 'function') {
      p = window.apiClient.post('/api/logout');
    } else {
      p = fetch('/api/logout', { method: 'POST', credentials: 'include' });
    }
    Promise.resolve(p).catch(function () {}).then(function () {
      location.replace('/');
    });
  }

  /* ---------- 事件委托 ---------- */
  function bindDelegate() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var el = t.closest('[data-apex-action]');
      if (!el) return;
      var act = el.getAttribute('data-apex-action');
      buzz(8);

      switch (act) {
        case 'profile':
          ev.preventDefault();
          toast('个人资料正在开发中');
          break;
        case 'support':
          toast('在线客服正在接入中');
          break;
        case 'notify':
          toast('暂无新通知');
          break;
        case 'settings':
          toast('设置功能开发中');
          break;
        case 'logout':
          ev.preventDefault();
          doLogout();
          break;
      }
    }, false);
  }

  function boot() {
    initLang();
    bindDelegate();
    checkAuth();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
