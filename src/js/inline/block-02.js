(function () {
  'use strict';

  // P11-I: UI 随机数也走 CSPRNG，消除 Math.random，统一安全基线
  const apexUIRandom = (() => {
    const buf = new Uint32Array(1);
    return function () {
      crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    };
  })();

  // ========== 1. 小眼睛 ==========
  const EYE_OPEN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_CLOSED = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  window.togglePwd = function (el) {
    if (!el || !el.closest) return;
    var wrap = el.closest('.input-wrap');
    if (!wrap) return;
    var p = wrap.querySelector('input');
    if (!p) return;
    p.type = p.type === 'password' ? 'text' : 'password';
    el.innerHTML = p.type === 'password' ? EYE_OPEN : EYE_CLOSED;
  };

  // ========== 3. Toast ==========
  var toastTimer = 0;
  function toast(msg, type) {
    let t = document.getElementById('apex-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'apex-toast';
      document.body.appendChild(t);
    }
    t.textContent = String(msg || '');
    t.classList.remove('apex-toast-info', 'apex-toast-error', 'apex-toast-success');
    if (type === 'error') t.classList.add('apex-toast-error');
    else if (type === 'success') t.classList.add('apex-toast-success');
    else t.classList.add('apex-toast-info');
    t.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.opacity = '0'; }, 3000);
  }

  // ========== 4. 成功页 ==========
  function showSuccess(title, desc) {
    ['login-method-picker','register-method-picker','passkey-signup-form','login-form','register-form','forgot-form'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const tabs = document.getElementById('auth-tabs');
    if (tabs) tabs.style.display = 'none';

    let page = document.getElementById('apex-success-page');
    if (!page) {
      var host = document.querySelector('.auth-card');
      if (!host) return;
      page = document.createElement('div');
      page.id = 'apex-success-page';
      page.style.cssText = 'text-align:center;padding:20px 0;';
      host.appendChild(page);
    }
    page.replaceChildren();

    var _iconWrap = document.createElement('div');
    _iconWrap.style.cssText = 'width:64px;height:64px;margin:0 auto 16px;background:rgba(74,222,128,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;';
    _iconWrap.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#4ade80" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
    var _h3 = document.createElement('h3');
    _h3.style.cssText = 'color:#fff;margin-bottom:8px;font-size:18px;';
    _h3.textContent = String(title || '');
    var _p = document.createElement('p');
    _p.style.cssText = 'color:#888;font-size:13px;margin-bottom:24px;';
    _p.textContent = String(desc || '');
    var _btn = document.createElement('button');
    _btn.className = 'btn-primary';
    _btn.id = 'apex-success-btn';
    _btn.textContent = '立即登录';
    page.appendChild(_iconWrap);
    page.appendChild(_h3);
    page.appendChild(_p);
    page.appendChild(_btn);
    page.style.display = 'block';

    var okBtn = document.getElementById('apex-success-btn');
    if (okBtn) {
      okBtn.onclick = function () {
        page.style.display = 'none';
        switchTo('login-form');
      };
    }
  }

  // ========== 5. 表单切换 ==========
  function switchTo(formId) {
    try {
      if (typeof clearAllFieldErrors === 'function') clearAllFieldErrors(null);
      ['login-captcha','reg-captcha','forgot-captcha','recover-captcha'].forEach(function (id) {
        if (typeof clearCaptchaError === 'function') {
          clearCaptchaError(document.getElementById(id));
        }
      });
      ['login-agreement','reg-agreement'].forEach(function (id) {
        if (typeof clearCheckboxError === 'function') {
          clearCheckboxError(document.getElementById(id));
        }
      });
      if (typeof clearCodeBoxError === 'function') {
        clearCodeBoxError(document.getElementById('code-boxes'));
        clearCodeBoxError(document.getElementById('recover-code-boxes'));
      }
      ['login-method-picker','register-method-picker','passkey-signup-form','passkey-recover-form','forgot-method-picker','forgot-form','login-form','register-form'].forEach(function (sid) {
        var sel = document.getElementById(sid);
        if (!sel) return;
        var msgs = sel.querySelectorAll('.inline-msg');
        for (var m = 0; m < msgs.length; m++) {
          msgs[m].classList.remove('show');
          msgs[m].textContent = '';
        }
      });
    } catch (e) {}

    var _allSectionIds = ['login-method-picker','register-method-picker','passkey-signup-form','login-form','register-form','forgot-method-picker','passkey-recover-form','forgot-form'];
    for (var _i = 0; _i < _allSectionIds.length; _i += 1) {
      var _el = document.getElementById(_allSectionIds[_i]);
      if (_el) _el.style.display = 'none';
    }
    var _target = document.getElementById(formId);
    if (_target) {
      _target.style.display = 'block';
      _target.classList.remove('form-fade-in');
      void _target.offsetWidth;
      _target.classList.add('form-fade-in');
    }
    var sp = document.getElementById('apex-success-page');
    if (sp) sp.style.display = 'none';

    var tabs = document.getElementById('auth-tabs');
    var _isForgotSide = (formId === 'forgot-form' || formId === 'forgot-method-picker' || formId === 'passkey-recover-form');
    if (tabs) tabs.style.display = _isForgotSide ? 'none' : 'flex';

    var _isLoginSide = (formId === 'login-form' || formId === 'login-method-picker' || formId === 'forgot-method-picker' || formId === 'passkey-recover-form' || formId === 'forgot-form');
    var _isRegSide = (formId === 'register-form' || formId === 'register-method-picker' || formId === 'passkey-signup-form');
    var tabLogin = document.getElementById('tab-login');
    var tabReg = document.getElementById('tab-register');
    if (tabLogin) tabLogin.classList.toggle('active', _isLoginSide);
    if (tabReg) tabReg.classList.toggle('active', _isRegSide);
  }

  var tabLoginEl = document.getElementById('tab-login');
  if (tabLoginEl) tabLoginEl.addEventListener('click', function () { switchTo('login-method-picker'); });
  var tabRegEl = document.getElementById('tab-register');
  if (tabRegEl) tabRegEl.addEventListener('click', function () { switchTo('register-method-picker'); });
  var forgotPwdEl = document.getElementById('forgot-pwd');
  if (forgotPwdEl) forgotPwdEl.addEventListener('click', function (e) { e.preventDefault(); switchTo('forgot-method-picker'); });

  // ========== Enter 提交 ==========
  [["login-account","btn-login"],["login-password","btn-login"],
   ["reg-username","btn-register"],["reg-email","btn-register"],
   ["reg-password","btn-register"],["reg-confirm","btn-register"],
   ["forgot-email","btn-send-code"],["forgot-newpwd","btn-reset"],
   ["forgot-confirm","btn-reset"]].forEach(function (pair) {
    var inp = document.getElementById(pair[0]);
    var btn = document.getElementById(pair[1]);
    if (!inp || !btn) return;
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); btn.click(); }
    });
  });

  // ========== 多标签同步登出 ==========
  try {
    if (window.BroadcastChannel) {
      var apexBC = new BroadcastChannel('apex_auth');
      apexBC.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'logout') {
          try { location.reload(); } catch (x) {}
        }
      });
      window.__apexBroadcast = apexBC;
    }
  } catch (e) {}

  // ========== 方式选择卡片事件 ==========
  (function () {
    function on(id, fn) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', fn);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
      });
    }

    on('login-back', function () { switchTo('login-method-picker'); });
    on('register-back', function () { switchTo('register-method-picker'); });
    on('passkey-signup-back', function () { switchTo('register-method-picker'); });

    function checkAgreement(id, label) {
      var cb = document.getElementById(id);
      if (!cb) return true;
      if (!cb.checked) {
        if (typeof window.showCheckboxError === 'function') {
          window.showCheckboxError(cb, label);
        } else {
          toast('请先阅读并同意用户协议与隐私政策', 'error');
        }
        return false;
      }
      if (typeof window.clearCheckboxError === 'function') window.clearCheckboxError(cb);
      return true;
    }

    on('pick-login-password', function () {
      if (!checkAgreement('login-agreement', '请先阅读并同意用户协议与隐私政策')) return;
      switchTo('login-form');
    });
    on('pick-login-passkey', function () {
      if (!checkAgreement('login-agreement', '请先阅读并同意用户协议与隐私政策')) return;
      if (window.__apexPasskey && window.__apexPasskey.login) {
        window.__apexPasskey.login();
      } else {
        toast('浏览器不支持 Passkey', 'error');
      }
    });
    on('pick-forgot-password', function () { switchTo('forgot-form'); });
    on('pick-forgot-passkey', function () {
      if (!window.__apexPasskey || !window.__apexPasskey.isSupported || !window.__apexPasskey.isSupported()) {
        toast('浏览器不支持 Passkey', 'error');
        return;
      }
      switchTo('passkey-recover-form');
    });
    on('forgot-picker-back', function () { switchTo('login-method-picker'); });
    on('forgot-back', function () { switchTo('forgot-method-picker'); });
    on('passkey-recover-back', function () { switchTo('forgot-method-picker'); });

    var btnRecover = document.getElementById('btn-recover-send-code');
    if (btnRecover) {
      btnRecover.addEventListener('click', function () {
        if (window.__apexPasskey && window.__apexPasskey.recoverSendCode) {
          window.__apexPasskey.recoverSendCode();
        } else {
          toast('功能未加载', 'error');
        }
      });
    }

    var btnRecoverVerify = document.getElementById('btn-passkey-recover');
    if (btnRecoverVerify) {
      btnRecoverVerify.addEventListener('click', function () {
        if (window.__apexPasskey && window.__apexPasskey.recoverVerify) {
          window.__apexPasskey.recoverVerify();
        } else {
          toast('功能未加载', 'error');
        }
      });
    }

    on('pick-register-password', function () {
      if (!checkAgreement('reg-agreement', '请先阅读并同意用户协议与隐私政策')) return;
      switchTo('register-form');
    });
    on('pick-register-passkey', function () {
      if (!checkAgreement('reg-agreement', '请先阅读并同意用户协议与隐私政策')) return;
      if (!window.__apexPasskey || !window.__apexPasskey.isSupported || !window.__apexPasskey.isSupported()) {
        toast('浏览器不支持 Passkey', 'error');
        return;
      }
      switchTo('passkey-signup-form');
    });

    var back = document.getElementById('passkey-signup-back');
    if (back) {
      back.addEventListener('click', function (e) {
        e.preventDefault();
        switchTo('register-method-picker');
      });
    }

    var btnSu = document.getElementById('btn-passkey-signup');
    if (btnSu) {
      btnSu.addEventListener('click', function () {
        if (window.__apexPasskey && window.__apexPasskey.signup) {
          window.__apexPasskey.signup();
        } else {
          toast('浏览器不支持 Passkey', 'error');
        }
      });
    }
  })();

  // ========== 初始状态（硬保险）==========
  function __apexInitPicker() {
    var all = ['login-method-picker','register-method-picker','passkey-signup-form','login-form','register-form','forgot-form'];
    for (var i = 0; i < all.length; i += 1) {
      var el = document.getElementById(all[i]);
      if (el) el.style.display = 'none';
    }
    var target = document.getElementById('login-method-picker');
    if (target) target.style.display = 'block';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __apexInitPicker);
  } else {
    __apexInitPicker();
  }

  window.__apex = Object.freeze({ toast: toast, showSuccess: showSuccess, switchTo: switchTo });
})();
