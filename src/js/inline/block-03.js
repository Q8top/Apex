(function() {
    'use strict';

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userRe = /^[a-zA-Z0-9_]{6,20}$/;
    const strongPwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

    function setErr(input, msg) {
      const wrap = input.closest('.input-wrap');
      wrap.classList.add('error'); wrap.classList.remove('success');
      const err = input.closest('.input-group').querySelector('.field-error');
      if (err) { err.textContent = msg; err.classList.add('show'); }
    }
    function setOk(input) {
      const wrap = input.closest('.input-wrap');
      wrap.classList.remove('error'); wrap.classList.add('success');
      const err = input.closest('.input-group').querySelector('.field-error');
      if (err) err.classList.remove('show');
    }
    function clearState(input) {
      const wrap = input.closest('.input-wrap');
      wrap.classList.remove('error', 'success');
      const err = input.closest('.input-group').querySelector('.field-error');
      if (err) err.classList.remove('show');
    }

    // 注册账号
    const regUser = document.getElementById('reg-username');
    if (regUser) regUser.addEventListener('input', function() {
      if (!this.value) return clearState(this);
      userRe.test(this.value) ? setOk(this) : setErr(this, '账号需 6-20 位，仅限字母、数字、下划线');
    });

    // 注册邮箱
    const regEmail = document.getElementById('reg-email');
    if (regEmail) regEmail.addEventListener('input', function() {
      if (!this.value) return clearState(this);
      emailRe.test(this.value) ? setOk(this) : setErr(this, '请输入有效的邮箱地址');
    });

    // 注册密码 + 强度条
    // ========== 草稿自动保存 ==========
    var _draftKeys = {
      'login-account': 'apex_draft_login_account',
      'reg-username': 'apex_draft_reg_username',
      'reg-email': 'apex_draft_reg_email'
    };
    (function () {
      Object.keys(_draftKeys).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        try {
          var v = localStorage.getItem(_draftKeys[id]);
          if (v && !el.value) el.value = v;
        } catch (e) {}
        el.addEventListener('input', function () {
          try { localStorage.setItem(_draftKeys[id], el.value); } catch (e) {}
        });
      });
    })();
    function clearDrafts() {
      try {
        Object.keys(_draftKeys).forEach(function (id) { localStorage.removeItem(_draftKeys[id]); });
      } catch (e) {}
    }
    window.clearDrafts = clearDrafts;

    const regPwd = document.getElementById('reg-password');
    if (regPwd) regPwd.addEventListener('input', function() {
      const bars = document.querySelectorAll('#reg-strength .bar');
      bars.forEach(b => b.className = 'bar');
      renderPwdChecklist('reg-pwd-checklist', this.value);
      if (!this.value) return clearState(this);
      const regUserName = document.getElementById('reg-username');
      const ident = regUserName ? regUserName.value.trim() : '';
      const policy = window.ApexPasswordPolicy;
      const result = policy
        ? policy.scorePassword(this.value, ident)
        : { level: strongPwdRe.test(this.value) ? 3 : (this.value.length >= 8 ? 2 : 1), valid: strongPwdRe.test(this.value), message: '需至少 12 位，含大小写字母、数字和特殊字符' };
      bars.forEach((b, i) => {
        if (i < result.level) b.classList.add(result.level === 1 ? 'active-weak' : (result.level === 2 ? 'active-medium' : 'active-strong'));
      });
      if (result.valid) setOk(this);
      else setErr(this, result.message || '密码强度不足');
      renderPwdChecklist('reg-pwd-checklist', this.value);
    });

    // 确认密码
    const regConfirm = document.getElementById('reg-confirm');
    if (regConfirm) regConfirm.addEventListener('input', function() {
      const pwd = document.getElementById('reg-password').value;
      if (!this.value) return clearState(this);
      this.value === pwd ? setOk(this) : setErr(this, '两次输入的密码不一致');
    });

    // 忘记密码 - 邮箱
    const forgotEmail = document.getElementById('forgot-email');
    if (forgotEmail) forgotEmail.addEventListener('input', function() {
      if (!this.value) return clearState(this);
      emailRe.test(this.value) ? setOk(this) : setErr(this, '请输入有效的邮箱地址');
    });

    // 忘记密码 - 新密码
    const forgotNew = document.getElementById('forgot-newpwd');
    if (forgotNew) forgotNew.addEventListener('input', function() {
      renderPwdChecklist('forgot-pwd-checklist', this.value);
      if (!this.value) return clearState(this);
      const forgotEmailEl = document.getElementById('forgot-email');
      const ident = forgotEmailEl ? forgotEmailEl.value.trim() : '';
      const policy = window.ApexPasswordPolicy;
      const r = policy ? policy.validatePassword(this.value, ident)
                       : { valid: strongPwdRe.test(this.value), message: '需至少 12 位，含大小写字母、数字和特殊字符' };
      r.valid ? setOk(this) : setErr(this, r.message || '密码强度不足');
      renderPwdChecklist('forgot-pwd-checklist', this.value);
    });

    // 忘记密码 - 确认密码
    const forgotConfirm = document.getElementById('forgot-confirm');
    if (forgotConfirm) forgotConfirm.addEventListener('input', function() {
      const pwd = document.getElementById('forgot-newpwd').value;
      if (!this.value) return clearState(this);
      this.value === pwd ? setOk(this) : setErr(this, '两次输入的密码不一致');
    });

    // 6 位验证码自动跳转
    const codeInputs = document.querySelectorAll('#code-boxes input');
    codeInputs.forEach((input, i) => {
      input.addEventListener('input', () => {
        if (window.clearCodeBoxError) window.clearCodeBoxError(document.getElementById('code-boxes'));
        if (input.value && i < codeInputs.length - 1) codeInputs[i + 1].focus();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) codeInputs[i - 1].focus();
      });
    });

    // ========== Caps Lock 提示（所有密码框）==========
    ['login-password','reg-password','reg-confirm','forgot-newpwd','forgot-confirm'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && typeof window.attachCapsLockWarn === 'function') window.attachCapsLockWarn(el);
    });

        console.log('[Apex] 表单验证已加载');
  })();
