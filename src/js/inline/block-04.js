(function () {
  'use strict';

  // 从 window.__apex 解构时做空引用 guard（避免 block-02 未加载时整体崩溃）
  var __apexRef = (typeof window !== 'undefined' && window.__apex) ? window.__apex : {};
  var toast = (typeof __apexRef.toast === 'function') ? __apexRef.toast : function (msg) {
    try { console.warn('[Apex] toast fallback:', msg); } catch (e) {}
  };
  var showSuccess = (typeof __apexRef.showSuccess === 'function') ? __apexRef.showSuccess : function () {};

  // 首屏预热 CSRF cookie：若首次访问没有 cookie，主动 GET 一次让服务端下发
  (function warmupCsrf() {
    try {
      if (readApexCookie('__Host-apex_csrf') || readApexCookie('apex_csrf')) return;
      fetch('/api/health', { credentials: 'include', cache: 'no-store' }).catch(function () {});
    } catch (e) {}
  })();

  // ========== 统一 Cookie 读取（仅非 HttpOnly 的 CSRF cookie） ==========
  function readApexCookie(name) {
    try {
      var key = String(name).replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) {
      return '';
    }
  }

  // ========== 统一 API POST 客户端 ==========
  async function apiPost(url, data, _retryCount) {
    _retryCount = _retryCount || 0;
    const headers = { 'Content-Type': 'application/json' };
    const csrf = readApexCookie('__Host-apex_csrf') || readApexCookie('apex_csrf');
    if (csrf) headers['X-CSRF-Token'] = csrf;

    let res;
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, 15000);
    try {
      res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err && err.name === 'AbortError') {
        return { success: false, message: '请求超时，请检查网络后重试' };
      }
      return { success: false, message: '网络异常，请检查连接后重试' };
    }
    clearTimeout(timeoutId);

    const ct = res.headers.get('Content-Type') || '';
    let payload = null;
    if (ct.indexOf('application/json') !== -1) {
      try {
        payload = await res.json();
      } catch (e) {
        payload = null;
      }
    }
    // CSRF 自愈：403 + csrf_invalid 时重试一次（服务端已 Set-Cookie 新 token）
    if (
      res.status === 403 &&
      _retryCount < 1 &&
      payload && typeof payload === 'object' && payload.code === 'csrf_invalid'
    ) {
      return apiPost(url, data, _retryCount + 1);
    }

    if (!payload || typeof payload !== 'object') {
      if (res.status === 403) return { success: false, message: 'CSRF 校验失败，请刷新页面后重试' };
      if (res.status === 429) return { success: false, message: '请求过于频繁，请稍后再试' };
      if (res.status >= 500) return { success: false, message: '服务器繁忙，请稍后再试' };
      return { success: false, message: '服务器响应异常' };
    }
    if (typeof payload.success !== 'boolean') payload.success = false;
    return payload;
  }

  // ========== 密码清单渲染 ==========
  function renderPwdChecklist(containerId, password) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var v = String(password || '');
    var items = [
      { label: '12 位以上',  ok: v.length >= 12 && v.length <= 128 },
      { label: '含小写',     ok: /[a-z]/.test(v) },
      { label: '含大写',     ok: /[A-Z]/.test(v) },
      { label: '含数字',     ok: /[0-9]/.test(v) },
      { label: '含特殊字符', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) }
    ];
    var html = items.map(function (it) {
      var cls = !v ? 'item' : (it.ok ? 'item ok' : 'item err');
      return '<span class="' + cls + '">' + it.label + '</span>';
    }).join('');
    el.innerHTML = html;
  }
  window.renderPwdChecklist = renderPwdChecklist;

  // ========== 网络错误重试框 ==========
  function showRetryBox(formSelector, retryFn) {
    try {
      var form = document.querySelector(formSelector);
      if (!form) return;
      var box = form.querySelector('.form-retry-box');
      if (!box) {
        box = document.createElement('div');
        box.className = 'form-retry-box';
        form.appendChild(box);
      }
      box.innerHTML = '网络异常，请检查后重试 <button type="button">重试</button>';
      box.classList.add('show');
      var btn = box.querySelector('button');
      if (btn) {
        btn.onclick = function () {
          box.classList.remove('show');
          try { retryFn(); } catch (e) {}
        };
      }
    } catch (e) {}
  }
  window.showRetryBox = showRetryBox;

  function clearRetryBox(formSelector) {
    try {
      var form = document.querySelector(formSelector);
      if (!form) return;
      var box = form.querySelector('.form-retry-box');
      if (box) box.classList.remove('show');
    } catch (e) {}
  }
  window.clearRetryBox = clearRetryBox;

  window.showFieldError = function showFieldError(inputEl, msg, skipFocus) {
    if (!inputEl) return;
    const wrap = inputEl.closest ? inputEl.closest('.input-wrap') : null;
    const grp = inputEl.closest ? inputEl.closest('.input-group') : null;
    if (wrap) {
      wrap.classList.add('error');
      wrap.classList.remove('success');
    }
    if (grp) {
      const errEl = grp.querySelector('.field-error');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('show');
      }
    }
    try { inputEl.setAttribute('aria-invalid', 'true'); } catch (e) {}
    if (!skipFocus) {
      try { inputEl.focus(); } catch (e) {}
    }
  };

  window.clearAllFieldErrors = function clearAllFieldErrors(rootEl) {
    const scope = rootEl || document;
    try {
      var groups = scope.querySelectorAll('.input-group');
      for (var gi = 0; gi < groups.length; gi++) {
        var errs = groups[gi].querySelectorAll('.field-error');
        for (var ei = 0; ei < errs.length; ei++) {
          errs[ei].classList.remove('show');
          errs[ei].textContent = '';
        }
      }
      var wraps = scope.querySelectorAll('.input-wrap');
      for (var wi = 0; wi < wraps.length; wi++) {
        wraps[wi].classList.remove('error', 'success');
      }
      var invalids = scope.querySelectorAll('input[aria-invalid]');
      for (var ii = 0; ii < invalids.length; ii++) {
        invalids[ii].removeAttribute('aria-invalid');
      }
    } catch (e) {}
  };

  window.shakeElement = function shakeElement(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 500);
  };

  window.showCaptchaError = function showCaptchaError(boxEl, msg) {
    if (!boxEl) return;
    boxEl.classList.add('error');
    window.shakeElement(boxEl);
    var errEl = boxEl.nextElementSibling;
    if (!errEl || !errEl.classList.contains('captcha-error')) {
      errEl = document.createElement('div');
      errEl.className = 'captcha-error';
      if (boxEl.parentNode) boxEl.parentNode.insertBefore(errEl, boxEl.nextSibling);
    }
    errEl.textContent = msg;
    errEl.classList.add('show');
  };

  window.clearCaptchaError = function clearCaptchaError(boxEl) {
    if (!boxEl) return;
    boxEl.classList.remove('error');
    var errEl = boxEl.nextElementSibling;
    if (errEl && errEl.classList.contains('captcha-error')) {
      errEl.classList.remove('show');
      errEl.textContent = '';
    }
  };

  window.showCheckboxError = function showCheckboxError(cbEl, msg) {
    if (!cbEl) return;
    var grp = cbEl.closest('.checkbox-group');
    if (!grp) return;
    grp.classList.add('error');
    var errEl = grp.querySelector('.checkbox-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'checkbox-error';
      grp.appendChild(errEl);
    }
    errEl.textContent = msg;
    errEl.classList.add('show');
    try { cbEl.focus(); } catch (e) {}
  };

  window.clearCheckboxError = function clearCheckboxError(cbEl) {
    if (!cbEl) return;
    var grp = cbEl.closest('.checkbox-group');
    if (!grp) return;
    grp.classList.remove('error');
    var errEl = grp.querySelector('.checkbox-error');
    if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
  };

  window.showCodeBoxError = function showCodeBoxError(containerEl, msg) {
    if (!containerEl) return;
    containerEl.classList.add('error');
    window.shakeElement(containerEl);
    var errEl = document.getElementById('code-boxes-error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('show');
    } else {
      toast(msg, 'error');
    }
  };

  window.clearCodeBoxError = function clearCodeBoxError(containerEl) {
    if (!containerEl) return;
    containerEl.classList.remove('error');
    var errEl = document.getElementById('code-boxes-error');
    if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
  };

  window.attachCapsLockWarn = function attachCapsLockWarn(inputEl) {
    if (!inputEl) return;
    var wrap = inputEl.closest('.input-wrap');
    if (!wrap || !wrap.parentNode) return;
    var warn = wrap.parentNode.querySelector('.capslock-warn');
    if (!warn) {
      warn = document.createElement('div');
      warn.className = 'capslock-warn';
      warn.textContent = '⚠️ 大写锁定已开启';
      wrap.parentNode.insertBefore(warn, wrap.nextSibling);
    }
    function check(e) {
      try {
        if (e.getModifierState && e.getModifierState('CapsLock')) warn.classList.add('show');
        else warn.classList.remove('show');
      } catch (err) {}
    }
    inputEl.addEventListener('keydown', check);
    inputEl.addEventListener('keyup', check);
    inputEl.addEventListener('blur', function () { warn.classList.remove('show'); });
  };

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.orig = btn.textContent;
      btn.textContent = '处理中...';
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.orig || btn.textContent;
      btn.disabled = false;
    }
    try {
      var form = btn.closest('#login-form, #register-form, #forgot-form') || btn.closest('.auth-card');
      if (form) {
        var fields = form.querySelectorAll('input, textarea, select');
        for (var i = 0; i < fields.length; i++) {
          if (fields[i] === btn) continue;
          fields[i].disabled = !!loading;
        }
      }
    } catch (e) {}
  }

  // ========== 登录 ==========
  var btnLogin = document.getElementById('btn-login');
  if (btnLogin) btnLogin.addEventListener('click', async function () {
    const loginForm = document.getElementById('login-form');
    window.clearAllFieldErrors(loginForm);
    var _formErr = false, _formFirst = null;
    const accEl = document.getElementById('login-account');
    const pwdEl = document.getElementById('login-password');
    if (!accEl || !pwdEl) return;
    const account = accEl.value.trim();
    const password = pwdEl.value;
    if (!account)  { window.showFieldError(accEl, '请输入账号', true); _formErr = true; if (!_formFirst) _formFirst = accEl; }
    if (!password) { window.showFieldError(pwdEl, '请输入密码', true); _formErr = true; if (!_formFirst) _formFirst = pwdEl; }

    const agreeEl = document.getElementById('login-agreement');
    if (agreeEl && !agreeEl.checked) {
      window.showCheckboxError(agreeEl, '请先阅读并同意用户协议与隐私政策');
      return;
    }
    const capEl = document.getElementById('login-captcha');
    if (capEl && capEl.dataset.status !== 'success') {
      window.showCaptchaError(capEl, '请先完成人机验证');
      return;
    }
    const captchaToken = capEl ? (capEl.dataset.token || '') : '';
    if (!captchaToken) {
      // P0-3 修正：之前错误引用 forgot-captcha
      if (capEl) window.showCaptchaError(capEl, '请先完成人机验证');
      return;
    }
    if (_formErr) return;

    setLoading(this, true);
    const result = await apiPost('/api/login', { account: account, password: password, captchaToken: captchaToken });
    setLoading(this, false);

    if (result.success) {
      toast('登录成功', 'success');
      setTimeout(function () {
        window.clearCaptchaError(capEl);
        window.clearCheckboxError(agreeEl);
        if (window.showLoggedIn) window.showLoggedIn(result.user);
      }, 800);
    } else {
      const code = result.code || '';
      const msg = result.message || '登录失败';
      if (code === 'email_not_verified') {
        window.showFieldError(accEl, msg, true);
        toast('请前往「忘记密码」页面，用注册邮箱重发验证邮件', 'error');
      } else if (code === 'invalid_credentials' || code === 'invalid_account' ||
                 /账号|用户名|密码|account|username|password/i.test(msg)) {
        window.showFieldError(accEl, msg);
      } else {
        toast(msg, 'error');
      }
    }
  });

  // ========== 注册 ==========
  var btnRegister = document.getElementById('btn-register');
  if (btnRegister) btnRegister.addEventListener('click', async function () {
    window.clearAllFieldErrors(null);
    var _formErr = false, _formFirst = null;
    const userEl = document.getElementById('reg-username');
    const emailEl = document.getElementById('reg-email');
    const regPwdEl = document.getElementById('reg-password');
    const confirmEl = document.getElementById('reg-confirm');
    if (!userEl || !emailEl || !regPwdEl || !confirmEl) return;
    const username = userEl.value.trim();
    const email = emailEl.value.trim();
    const password = regPwdEl.value;
    const confirm = confirmEl.value;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userRe = /^[a-zA-Z0-9_]{6,20}$/;
    const strongPwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

    if (!username) { window.showFieldError(userEl, '请输入账号', true); _formErr = true; if (!_formFirst) _formFirst = userEl; }
    if (!userRe.test(username)) { window.showFieldError(userEl, '账号需 6-20 位，仅限字母、数字、下划线', true); _formErr = true; if (!_formFirst) _formFirst = userEl; }
    if (!email) { window.showFieldError(emailEl, '请输入邮箱', true); _formErr = true; if (!_formFirst) _formFirst = emailEl; }
    if (!emailRe.test(email)) { window.showFieldError(emailEl, '邮箱格式错误', true); _formErr = true; if (!_formFirst) _formFirst = emailEl; }
    if (!password) { window.showFieldError(regPwdEl, '请输入密码', true); _formErr = true; if (!_formFirst) _formFirst = regPwdEl; }

    const policy = window.ApexPasswordPolicy;
    const pwdCheck = policy
      ? policy.validatePassword(password, username)
      : { valid: strongPwdRe.test(password), message: '密码强度不足' };
    if (!pwdCheck.valid) { window.showFieldError(regPwdEl, pwdCheck.message || '密码强度不足'); return; }

    if (!confirm) { window.showFieldError(confirmEl, '请再次输入密码', true); _formErr = true; if (!_formFirst) _formFirst = confirmEl; }
    else if (password !== confirm) { window.showFieldError(confirmEl, '两次密码不一致', true); _formErr = true; if (!_formFirst) _formFirst = confirmEl; }
    if (_formErr) return;

    const regAgree = document.getElementById('reg-agreement');
    if (regAgree && !regAgree.checked) {
      window.showCheckboxError(regAgree, '请先阅读并同意用户协议与隐私政策');
      return;
    }
    const regCap = document.getElementById('reg-captcha');
    if (regCap && regCap.dataset.status !== 'success') {
      window.showCaptchaError(regCap, '请先完成人机验证');
      return;
    }
    const captchaToken = regCap ? (regCap.dataset.token || '') : '';
    if (!captchaToken) {
      if (regCap) window.showCaptchaError(regCap, '请先完成人机验证');
      return;
    }

    setLoading(this, true);
    const result = await apiPost('/api/register', { username: username, email: email, password: password, captchaToken: captchaToken });
    setLoading(this, false);

    if (result.success) {
      showSuccess('注册成功', '欢迎加入 Apex，您的账号已创建成功。');
    } else {
      const code = result.code || '';
      const msg = result.message || '注册失败';
      if (code === 'invalid_email' || /邮箱/i.test(msg)) {
        window.showFieldError(emailEl, msg);
      } else if (code === 'weak_password' || /密码/i.test(msg)) {
        window.showFieldError(regPwdEl, msg);
      } else if (code === 'invalid_username' || /账号|用户名/i.test(msg)) {
        window.showFieldError(userEl, msg);
      } else {
        toast(msg, 'error');
      }
    }
  });

  // ========== 发送验证码 ==========
  var btnSendCode = document.getElementById('btn-send-code');
  if (btnSendCode) btnSendCode.addEventListener('click', async function () {
    const forgotEmailEl2 = document.getElementById('forgot-email');
    if (!forgotEmailEl2) return;
    const email = forgotEmailEl2.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { window.showFieldError(forgotEmailEl2, '请输入邮箱'); return; }
    if (!emailRe.test(email)) { window.showFieldError(forgotEmailEl2, '邮箱格式错误'); return; }

    setLoading(this, true);
    const result = await apiPost('/api/send-reset-code', { email: email });
    setLoading(this, false);

    if (result.success) {
      toast('验证码已发送', 'success');
      var c = 60;
      var self = this;
      self.disabled = true;
      self.textContent = c + '秒后重发';
      const timer = setInterval(function () {
        c--;
        if (c <= 0) {
          clearInterval(timer);
          self.textContent = '发送验证码';
          self.disabled = false;
          return;
        }
        self.textContent = c + '秒后重发';
      }, 1000);
    } else {
      toast(result.message || '发送失败', 'error');
    }
  });

  // ========== 重置密码 ==========
  var btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', async function () {
    window.clearAllFieldErrors(null);
    var _formErr = false, _formFirst = null;
    const fEmailEl = document.getElementById('forgot-email');
    const fPwdEl = document.getElementById('forgot-newpwd');
    const fConfirmEl = document.getElementById('forgot-confirm');
    if (!fEmailEl || !fPwdEl || !fConfirmEl) return;
    const email = fEmailEl.value.trim();
    const newPassword = fPwdEl.value;
    const confirm = fConfirmEl.value;
    var code = '';

    var codeInputs = document.querySelectorAll('#code-boxes input');
    for (var ci = 0; ci < codeInputs.length; ci++) code += codeInputs[ci].value;

    if (!email) { window.showFieldError(fEmailEl, '请输入邮箱', true); _formErr = true; if (!_formFirst) _formFirst = fEmailEl; }
    if (!newPassword) { window.showFieldError(fPwdEl, '请输入新密码', true); _formErr = true; if (!_formFirst) _formFirst = fPwdEl; }
    if (code.length !== 6) { window.showCodeBoxError(document.getElementById('code-boxes'), '请输入 6 位验证码'); return; }
    if (newPassword !== confirm) { window.showFieldError(fConfirmEl, '两次密码不一致'); return; }

    const forgotCap = document.getElementById('forgot-captcha');
    if (forgotCap && forgotCap.dataset.status !== 'success') {
      window.showCaptchaError(forgotCap, '请先完成人机验证');
      return;
    }
    const captchaToken = forgotCap ? (forgotCap.dataset.token || '') : '';
    if (!captchaToken) {
      // P0-4 修正：之前错误引用 login-captcha
      if (forgotCap) window.showCaptchaError(forgotCap, '请先完成人机验证');
      return;
    }
    if (_formErr) return;

    setLoading(this, true);
    const result = await apiPost('/api/reset-password', { email: email, code: code, newPassword: newPassword, captchaToken: captchaToken });
    setLoading(this, false);

    if (result.success) {
      showSuccess('重置成功', '您的密码已成功重置，请使用新密码登录。');
    } else {
      const code2 = result.code || '';
      const msg = result.message || '重置失败';
      if (code2 === 'weak_password') {
        window.showFieldError(fPwdEl, msg);
      } else if (code2 === 'invalid_email') {
        window.showFieldError(fEmailEl, msg);
      } else {
        toast(msg, 'error');
      }
    }
  });

})();
