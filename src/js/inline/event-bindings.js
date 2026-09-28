/* ==========================================================================
   Apex · 内联事件集中绑定（替代 onXxx=""，供 CSP 去掉 script-src unsafe-inline）
   - 元素通过 data-apex-action 声明行为
   - 与旧 onclick/onpointerdown 语义 1:1 对应
   - 加载时机：DOMContentLoaded
   ========================================================================== */
(function () {
  'use strict';

  function bindOne(el, eventName, handler) {
    el.addEventListener(eventName, handler, false);
  }

  function init() {
    document.querySelectorAll('[data-apex-action]').forEach(function (el) {
      var action = el.getAttribute('data-apex-action');
      switch (action) {

        /* --- 6 处 event.stopPropagation() --- */
        case 'stop-prop':
          bindOne(el, 'click', function (e) { e.stopPropagation(); });
          break;

        /* --- 5 处 window.startCaptcha(this) --- */
        case 'start-captcha':
          bindOne(el, 'click', function (e) {
            if (typeof window.startCaptcha === 'function') {
              window.startCaptcha(e.currentTarget);
            }
          });
          break;

        /* --- 5 处 onpointerdown="preventDefault(); togglePwd(this)" --- */
        case 'toggle-pwd':
          var toggleFn = function (e) {
            e.preventDefault();
            if (typeof window.togglePwd === 'function') {
              window.togglePwd(e.currentTarget);
            }
          };
          bindOne(el, 'pointerdown', toggleFn);
          // 键盘可访问：Enter/Space 触发
          bindOne(el, 'keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleFn(e);
            }
          });
          break;

        /* --- 1 处 window.apexLogout && window.apexLogout() --- */
        case 'logout':
          bindOne(el, 'click', function () {
            if (typeof window.apexLogout === 'function') {
              window.apexLogout();
            }
          });
          break;

        /* --- 关闭 security-modal --- */
        case 'hide-security-modal':
          bindOne(el, 'click', function () {
            var m = document.getElementById('security-modal');
            if (m) m.style.display = 'none';
          });
          break;

        /* --- security-modal + 切到 forgot-form --- */
        case 'security-modal-forgot':
          bindOne(el, 'click', function () {
            var m = document.getElementById('security-modal');
            if (m) m.style.display = 'none';
            if (window.__apex && typeof window.__apex.switchTo === 'function') {
              window.__apex.switchTo('forgot-form');
            }
          });
          break;

        /* --- revokeAllSessions() --- */
        case 'revoke-sessions':
          bindOne(el, 'click', function () {
            if (typeof window.revokeAllSessions === 'function') {
              window.revokeAllSessions();
            }
          });
          break;

        /* --- alert('登录日志功能即将开放') --- */
        case 'login-logs-soon':
          bindOne(el, 'click', function () {
            alert('登录日志功能即将开放');
          });
          break;

        /* --- L69 大 IIFE：注销 SW + 清缓存 + reload --- */
        case 'sw-reset':
          bindOne(el, 'click', function () {
            if (navigator.serviceWorker) {
              navigator.serviceWorker.getRegistrations()
                .then(function (rs) {
                  return Promise.all(rs.map(function (r) { return r.unregister(); }));
                })
                .then(function () {
                  if (window.caches) {
                    return caches.keys().then(function (ks) {
                      return Promise.all(ks.map(function (k) { return caches.delete(k); }));
                    });
                  }
                })
                .then(function () { location.reload(true); });
            } else {
              location.reload(true);
            }
          });
          break;

        default:
          /* 未知 action，不静默忽略 */
          if (window.console) {
            console.warn('[event-bindings] 未识别的 data-apex-action:', action);
          }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Esc 关闭 modal + 焦点管理
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var m = document.getElementById('security-modal');
      if (m && m.style.display !== 'none' && m.style.display !== '') {
        m.style.display = 'none';
        // 返回焦点到 security-center-link
        var trigger = document.getElementById('security-center-link');
        if (trigger && typeof trigger.focus === 'function') trigger.focus();
      }
    }
  });

  // modal 首次显示时自动聚焦关闭按钮
  if (!window.__apexModalEsc) {
    window.__apexModalEsc = true;
    var _origShow = null;
    Object.defineProperty(window, '__apexModalWatch', {
      configurable: true,
      set: function (v) { _origShow = v; }
    });
  }
})();
