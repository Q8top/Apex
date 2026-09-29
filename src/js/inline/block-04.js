(function() {
    'use strict';

    const { toast, showSuccess } = window.__apex;

    // 首屏预热 CSRF cookie：若首次访问没有 cookie，主动 GET 一次让服务端下发
    (function warmupCsrf() {
      if (readApexCookie('__Host-apex_csrf') || readApexCookie('apex_csrf')) return;
      fetch('/api/health', { credentials: 'include', cache: 'no-store' }).catch(function(){});
    })();

    // ========== API 客户端 ==========
    // ========== 统一 Cookie 读取（仅非 HttpOnly 的 CSRF cookie） ==========
    function readApexCookie(name) {
      try {
        const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : '';
      } catch (e) {
        return '';
      }
    }

    // ========== 统一 API POST 客户端 ==========
    //  - 自动 credentials: include
    //  - 自动附加 X-CSRF-Token（优先 __Host-apex_csrf，回退 apex_csrf）
    //  - 只解析 application/json
    //  - 网络/解析错误统一返回 { success:false, message }
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
          headers,
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

    // ========== 字段级错误显示 ==========
    // ========== 密码清单渲染 ==========
    function renderPwdChecklist(containerId, password) {
      var el = document.getElementById(containerId);
      if (!el) return;
      var v = String(password || '');
      var items = [
        { label: '12 位以上',    ok: v.length >= 12 && v.length <= 128 },
        { label: '含小写',       ok: /[a-z]/.test(v) },
        { label: '含大写',       ok: /[A-Z]/.test(v) },
        { label: '含数字',       ok: /[0-9]/.test(v) },
        { label: '含特殊字符',   ok: /[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(v) }
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
        box.querySelector('button').onclick = function () {
          box.classList.remove('show');
          try { retryFn(); } catch (e) {}
        };
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
    }

    window.clearAllFieldErrors = function clearAllFieldErrors(rootEl) {
      const scope = rootEl || document;
      try {
        scope.querySelectorAll('.input-group').forEach(function (g) {
          g.querySelectorAll('.field-error').forEach(function (el) {
            el.classList.remove('show');
            el.textContent = '';
          });
        });
        scope.querySelectorAll('.input-wrap').forEach(function (w) {
          w.classList.remove('error', 'success');
        });
        scope.querySelectorAll('input[aria-invalid]').forEach(function (i) {
          i.removeAttribute('aria-invalid');
        });
      } catch (e) {}
    }

    window.shakeElement = function shakeElement(el) {
      if (!el) return;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      setTimeout(function () { el.classList.remove('shake'); }, 500);
    }

    window.showCaptchaError = function showCaptchaError(boxEl, msg) {
      if (!boxEl) return;
      boxEl.classList.add('error');
      shakeElement(boxEl);
      var errEl = boxEl.nextElementSibling;
      if (!errEl || !errEl.classList.contains('captcha-error')) {
        errEl = document.createElement('div');
        errEl.className = 'captcha-error';
        boxEl.parentNode.insertBefore(errEl, boxEl.nextSibling);
      }
      errEl.textContent = msg;
      errEl.classList.add('show');
    }

    window.clearCaptchaError = function clearCaptchaError(boxEl) {
      if (!boxEl) return;
      boxEl.classList.remove('error');
      var errEl = boxEl.nextElementSibling;
      if (errEl && errEl.classList.contains('captcha-error')) {
        errEl.classList.remove('show');
        errEl.textContent = '';
      }
    }

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
    }

    window.clearCheckboxError = function clearCheckboxError(cbEl) {
      if (!cbEl) return;
      var grp = cbEl.closest('.checkbox-group');
      if (!grp) return;
      grp.classList.remove('error');
      var errEl = grp.querySelector('.checkbox-error');
      if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
    }

    window.showCodeBoxError = function showCodeBoxError(containerEl, msg) {
      if (!containerEl) return;
      containerEl.classList.add('error');
      shakeElement(containerEl);
      var errEl = document.getElementById('code-boxes-error');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('show');
      } else {
        toast(msg, 'error');
      }
    }

    window.clearCodeBoxError = function clearCodeBoxError(containerEl) {
      if (!containerEl) return;
      containerEl.classList.remove('error');
      var errEl = document.getElementById('code-boxes-error');
      if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
    }

    window.attachCapsLockWarn = function attachCapsLockWarn(inputEl) {
      if (!inputEl) return;
      var wrap = inputEl.closest('.input-wrap');
      if (!wrap) return;
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
    }

    function setLoading(btn, loading) {
      if (loading) {
        btn.dataset.orig = btn.textContent;
        btn.textContent = '处理中...';
        btn.disabled = true;
      } else {
        btn.textContent = btn.dataset.orig;
        btn.disabled = false;
      }
      try {
        var form = btn.closest('#login-form, #register-form, #forgot-form') || btn.closest('.auth-card');
        if (form) {
          form.querySelectorAll('input, textarea, select').forEach(function (el) {
            if (el === btn) return;
            el.disabled = !!loading;
          });
        }
      } catch (e) {}
    }

    // ========== 登录 ==========
    document.getElementById('btn-login').addEventListener('click', async function() {
      const loginForm = document.getElementById('login-form');
      clearAllFieldErrors(loginForm);
      var _formErr = false, _formFirst = null;
      const accEl = document.getElementById('login-account');
      const pwdEl = document.getElementById('login-password');
      const account = accEl.value.trim();
      const password = pwdEl.value;
      if (!account) { showFieldError(accEl, '请输入账号', true); _formErr = true; if (!_formFirst) _formFirst = accEl; }
      if (!password) { showFieldError(pwdEl, '请输入密码', true); _formErr = true; if (!_formFirst) _formFirst = pwdEl; }
      if (!document.getElementById('login-agreement').checked) {
        showCheckboxError(document.getElementById('login-agreement'), '请先阅读并同意用户协议与隐私政策');
        return;
      }
      if (document.getElementById('login-captcha').dataset.status !== 'success') {
        showCaptchaError(document.getElementById('login-captcha'), '请先完成人机验证');
        return;
      }

      const captchaToken = document.getElementById('login-captcha').dataset.token || '';
      if (!captchaToken) { showCaptchaError(document.getElementById('forgot-captcha'), '请先完成人机验证'); return; }
      if (_formErr) return;
      setLoading(this, true);
      const result = await apiPost('/api/login', { account, password, captchaToken });
      setLoading(this, false);

      if (result.success) {
        // 认证状态唯一可信来源：Session Cookie + /api/me
        // 此处不再写入 localStorage（避免「本地显示已登录，但 Session 已过期」错位）
        toast('登录成功', 'success');
        setTimeout(() => {
        clearCaptchaError(document.getElementById('login-captcha'));
        clearCheckboxError(document.getElementById('login-agreement'));
        if (window.showLoggedIn) window.showLoggedIn(result.user);
      }, 800);
      } else {
        const code = result.code || '';
        const msg = result.message || '登录失败';
        if (code === 'invalid_credentials' || code === 'invalid_account' || /账号|用户名|密码|account|username|password/i.test(msg)) {
          showFieldError(accEl, msg);
        } else {
          toast(msg, 'error');
        }
      }
    });

    // ========== 注册 ==========
    document.getElementById('btn-register').addEventListener('click', async function() {
      clearAllFieldErrors(null);
      var _formErr = false, _formFirst = null;
      const userEl = document.getElementById('reg-username');
      const emailEl = document.getElementById('reg-email');
      const regPwdEl = document.getElementById('reg-password');
      const confirmEl = document.getElementById('reg-confirm');
      const username = userEl.value.trim();
      const email = emailEl.value.trim();
      const password = regPwdEl.value;
      const confirm = confirmEl.value;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const userRe = /^[a-zA-Z0-9_]{6,20}$/;
      const strongPwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
      if (!username) { showFieldError(userEl, '请输入账号', true); _formErr = true; if (!_formFirst) _formFirst = userEl; }
      if (!userRe.test(username)) { showFieldError(userEl, '账号需 6-20 位，仅限字母、数字、下划线', true); _formErr = true; if (!_formFirst) _formFirst = userEl; }
      if (!email) { showFieldError(emailEl, '请输入邮箱', true); _formErr = true; if (!_formFirst) _formFirst = emailEl; }
      if (!emailRe.test(email)) { showFieldError(emailEl, '邮箱格式错误', true); _formErr = true; if (!_formFirst) _formFirst = emailEl; }
      if (!password) { showFieldError(regPwdEl, '请输入密码', true); _formErr = true; if (!_formFirst) _formFirst = regPwdEl; }
      const policy = window.ApexPasswordPolicy;
      const pwdCheck = policy
        ? policy.validatePassword(password, username)
        : { valid: strongPwdRe.test(password), message: '密码强度不足' };
      if (!pwdCheck.valid) { showFieldError(regPwdEl, pwdCheck.message || '密码强度不足'); return; }
      if (!confirm) { showFieldError(confirmEl, '请再次输入密码', true); _formErr = true; if (!_formFirst) _formFirst = confirmEl; }
      else if (password !== confirm) { showFieldError(confirmEl, '两次密码不一致', true); _formErr = true; if (!_formFirst) _formFirst = confirmEl; }
      if (_formErr) return;
      if (!document.getElementById('reg-agreement').checked) {
        showCheckboxError(document.getElementById('reg-agreement'), '请先阅读并同意用户协议与隐私政策');
        return;
      }
      if (document.getElementById('reg-captcha').dataset.status !== 'success') {
        showCaptchaError(document.getElementById('reg-captcha'), '请先完成人机验证');
        return;
      }

      const captchaToken = document.getElementById('reg-captcha').dataset.token || '';
      if (!captchaToken) { showCaptchaError(document.getElementById('reg-captcha'), '请先完成人机验证'); return; }
      setLoading(this, true);
      const result = await apiPost('/api/register', { username, email, password, captchaToken });
      setLoading(this, false);

      if (result.success) {
        showSuccess('注册成功', '欢迎加入 Apex，您的账号已创建成功。');
      } else {
        const code = result.code || '';
        const msg = result.message || '注册失败';
        if (code === 'invalid_email' || /邮箱/i.test(msg)) {
          showFieldError(emailEl, msg);
        } else if (code === 'weak_password' || /密码/i.test(msg)) {
          showFieldError(regPwdEl, msg);
        } else if (code === 'invalid_username' || /账号|用户名/i.test(msg)) {
          showFieldError(userEl, msg);
        } else {
          toast(msg, 'error');
        }
      }
    });

    // ========== 发送验证码 ==========
    document.getElementById('btn-send-code').addEventListener('click', async function() {
      const forgotEmailEl2 = document.getElementById('forgot-email');
      const email = forgotEmailEl2.value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) { showFieldError(forgotEmailEl2, '请输入邮箱'); return; }
      if (!emailRe.test(email)) { showFieldError(forgotEmailEl2, '邮箱格式错误'); return; }

      setLoading(this, true);
      const result = await apiPost('/api/send-reset-code', { email });
      setLoading(this, false);

      if (result.success) {
        toast('验证码已发送', 'success');
        let c = 60;
        this.disabled = true;
        this.textContent = c + '秒后重发';
        const timer = setInterval(() => {
          c--;
          this.textContent = c + '秒后重发';
          if (c <= 0) { clearInterval(timer); this.textContent = '发送验证码'; this.disabled = false; }
        }, 1000);
      } else {
        toast(result.message || '发送失败', 'error');
      }
    });

    // ========== 重置密码 ==========
    document.getElementById('btn-reset').addEventListener('click', async function() {
      clearAllFieldErrors(null);
      var _formErr = false, _formFirst = null;
      const fEmailEl = document.getElementById('forgot-email');
      const fPwdEl = document.getElementById('forgot-newpwd');
      const fConfirmEl = document.getElementById('forgot-confirm');
      const email = fEmailEl.value.trim();
      const newPassword = fPwdEl.value;
      const confirm = fConfirmEl.value;
      let code = '';
      document.querySelectorAll('#code-boxes input').forEach(i => code += i.value);

      if (!email) { showFieldError(fEmailEl, '请输入邮箱', true); _formErr = true; if (!_formFirst) _formFirst = fEmailEl; }
      if (!newPassword) { showFieldError(fPwdEl, '请输入新密码', true); _formErr = true; if (!_formFirst) _formFirst = fPwdEl; }
      if (code.length !== 6) { showCodeBoxError(document.getElementById('code-boxes'), '请输入 6 位验证码'); return; }
      if (newPassword !== confirm) { showFieldError(fConfirmEl, '两次密码不一致'); return; }
      if (document.getElementById('forgot-captcha').dataset.status !== 'success') {
        showCaptchaError(document.getElementById('forgot-captcha'), '请先完成人机验证');
        return;
      }

      const captchaToken = document.getElementById('forgot-captcha').dataset.token || '';
      if (!captchaToken) { showCaptchaError(document.getElementById('login-captcha'), '请先完成人机验证'); return; }
      if (_formErr) return;
      setLoading(this, true);
      const result = await apiPost('/api/reset-password', { email, code, newPassword, captchaToken });
      setLoading(this, false);

      if (result.success) {
        showSuccess('重置成功', '您的密码已成功重置，请使用新密码登录。');
      } else {
        const code2 = result.code || '';
        const msg = result.message || '重置失败';
        if (code2 === 'weak_password') {
          showFieldError(fPwdEl, msg);
        } else if (code2 === 'invalid_email') {
          showFieldError(fEmailEl, msg);
        } else {
          toast(msg, 'error');
        }
      }
    });

    console.log('[Apex] API 对接已加载');
  })();
