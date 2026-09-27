// Apex Passkey 前端
// 依赖：window.apiClient（由 src/js/apiClient.js 提供）
(function () {
  'use strict';

  function b64uToBuf(b64u) {
    const s = String(b64u || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    const bin = atob(s + pad);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  }

  function bufToB64u(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function detectDeviceName() {
    const ua = navigator.userAgent || '';
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) {
      const m = ua.match(/Android [^;]+;\s*([^)]+)\)/);
      return m ? m[1].trim() : 'Android 设备';
    }
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Linux/.test(ua)) return 'Linux PC';
    return '我的设备';
  }

  // 精确检测：设备是否有可用的平台验证器（指纹/面容/PIN）
  async function isPlatformAvailable() {
    if (!isSupported()) return false;
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
      return true; // 老 API 不存在时退回同步检测结果
    }
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      return false;
    }
  }

  function isSupported() {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
  }

  function friendlyError(e) {
    const name = e && e.name ? e.name : '';
    if (name === 'NotAllowedError') return '操作已取消或超时';
    if (name === 'InvalidStateError') return '该设备已经绑定过了';
    if (name === 'NotSupportedError') return '当前浏览器不支持 Passkey';
    if (name === 'SecurityError') return '需要 HTTPS 环境';
    if (name === 'AbortError') return '操作已中止';
    return (e && e.message) || '操作失败';
  }

  // 优先显示到当前可见的 picker/form 内联位置
  function toast(msg, type) {
    type = type || 'error';
    try {
      var targetIds = [
        'login-method-picker',
        'register-method-picker',
        'passkey-signup-form',
        'passkey-recover-form',
        'forgot-method-picker',
        'forgot-form',
        'login-form',
        'register-form'
      ];
      var target = null;
      for (var i = 0; i < targetIds.length; i += 1) {
        var el = document.getElementById(targetIds[i]);
        if (el && el.offsetHeight > 0) {
          target = el;
          break;
        }
      }
      if (target) {
        var msgEl = target.querySelector('.inline-msg');
        if (!msgEl) {
          msgEl = document.createElement('div');
          msgEl.className = 'inline-msg';
          target.appendChild(msgEl);
        }
        msgEl.textContent = msg;
        msgEl.className = 'inline-msg show ' + (type === 'success' ? 'success' : 'error');
        clearTimeout(msgEl._timer);
        msgEl._timer = setTimeout(function () { msgEl.classList.remove('show'); }, 5000);
        return;
      }
    } catch (e) {}
    // Fallback: 屏幕中央 toast
    try { if (window.__apex && window.__apex.toast) window.__apex.toast(msg, type); }
    catch (e) {}
  }

  // ============ 绑定 ============
  async function register() {
    if (!(await isPlatformAvailable())) { toast('当前设备或浏览器不支持 Passkey'); return; }

    const defaultName = detectDeviceName();
    const nameInput = window.prompt('给这个设备起个名字（方便区分）：', defaultName);
    if (nameInput === null) return;
    const deviceName = String(nameInput).trim().substring(0, 40) || defaultName;

    try {
      const res = await window.apiClient.post('/api/passkey/register-challenge', {});
      if (!res || !res.success) { toast((res && res.message) || '获取挑战失败'); return; }

      const pk = res.publicKey;
      const publicKey = {
        challenge: b64uToBuf(pk.challenge),
        rp: pk.rp,
        user: {
          id: new TextEncoder().encode(pk.user.id),
          name: pk.user.name,
          displayName: pk.user.displayName,
        },
        pubKeyCredParams: pk.pubKeyCredParams,
        timeout: pk.timeout || 60000,
        attestation: pk.attestation || 'none',
        authenticatorSelection: pk.authenticatorSelection,
        excludeCredentials: (pk.excludeCredentials || []).map(function (c) {
          return { type: c.type, id: b64uToBuf(c.id), transports: c.transports };
        }),
      };

      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) { toast('绑定已取消'); return; }

      const att = credential.response;
      const payload = {
        challengeId: res.challengeId,
        rawId: bufToB64u(credential.rawId),
        response: {
          clientDataJSON: bufToB64u(att.clientDataJSON),
          attestationObject: bufToB64u(att.attestationObject),
        },
        transports: att.getTransports ? att.getTransports() : [],
        deviceName: deviceName,
      };

      const vr = await window.apiClient.post('/api/passkey/register-verify', payload);
      if (vr && vr.success) {
        toast('Passkey 绑定成功', 'success');
        load();
      } else {
        toast((vr && vr.message) || '绑定失败');
      }
    } catch (e) {
      console.error('[Passkey] register:', e);
      toast('绑定失败：' + friendlyError(e));
    }
  }

  // ============ 登录 ============
  // 防抖：避免用户反复点击触发限流
  var _passkeyLoginInProgress = false;

  async function login() {
    if (_passkeyLoginInProgress) { toast('正在处理，请稍候', 'error'); return; }
    if (!(await isPlatformAvailable())) { toast('当前设备或浏览器不支持 Passkey，请使用账号密码登录', 'error'); return; }
    _passkeyLoginInProgress = true;

    const accEl = document.getElementById('login-account');
    const account = accEl ? accEl.value.trim() : '';

    try {
      const res = await window.apiClient.post('/api/passkey/login-challenge', { account: account });

      // ============ A) 获取 challenge 失败 ============
      if (!res || !res.success) {
        const code = res && res.code;
        if (code === 'rate_limited') {
          toast('操作过于频繁，请稍等 60 秒后重试', 'error');
        } else if (code === 'csrf_invalid') {
          toast('页面已过期，请刷新后重试', 'error');
        } else if (code === 'internal_error' || code === 'config_invalid') {
          toast('服务器繁忙，请稍后重试', 'error');
        } else {
          toast((res && res.message) || '获取挑战失败，请重试', 'error');
        }
        return;
      }

      const pk = res.publicKey;
      const allowCreds = pk.allowCredentials || [];

      // ============ B) 输入了账号但该账号未绑定 Passkey ============
      if (account && allowCreds.length === 0) {
        toast('该账号未绑定 Passkey，请使用账号密码登录', 'error');
        return;
      }

      const publicKey = {
        challenge: b64uToBuf(pk.challenge),
        rpId: pk.rpId,
        timeout: pk.timeout || 60000,
        userVerification: pk.userVerification || 'preferred',
        allowCredentials: allowCreds.map(function (c) {
          return { type: c.type, id: b64uToBuf(c.id), transports: c.transports };
        }),
      };

      // ============ C) 弹指纹/面容 ============
      let assertion;
      try {
        assertion = await navigator.credentials.get({ publicKey: publicKey });
      } catch (err) {
        const name = err && err.name;
        if (name === 'NotAllowedError') {
          if (!account) {
            toast('未检测到已绑定的 Passkey，请先用账号密码登录并绑定', 'error');
          } else {
            toast('操作已取消', 'error');
          }
        } else if (name === 'AbortError') {
          toast('操作超时，请重试', 'error');
        } else if (name === 'NotSupportedError') {
          toast('当前设备不支持 Passkey', 'error');
        } else if (name === 'SecurityError') {
          toast('安全校验失败，请用 HTTPS 打开页面', 'error');
        } else if (name === 'InvalidStateError') {
          toast('设备状态异常，请重试', 'error');
        } else {
          toast('登录失败：' + friendlyError(err), 'error');
        }
        return;
      }

      if (!assertion) { toast('操作已取消', 'error'); return; }

      const a = assertion.response;
      const payload = {
        challengeId: res.challengeId,
        rawId: bufToB64u(assertion.rawId),
        response: {
          clientDataJSON: bufToB64u(a.clientDataJSON),
          authenticatorData: bufToB64u(a.authenticatorData),
          signature: bufToB64u(a.signature),
          userHandle: a.userHandle ? bufToB64u(a.userHandle) : null,
        },
      };

      // ============ D) 后端验证 ============
      const vr = await window.apiClient.post('/api/passkey/login-verify', payload);
      if (vr && vr.success) {
        toast('登录成功', 'success');
        setTimeout(function () {
          if (window.showHomepage) window.showHomepage(vr.user);
        }, 600);
      } else {
        const vcode = vr && vr.code;
        if (vcode === 'credential_not_found') {
          toast('该设备未注册到此账号，请使用账号密码登录', 'error');
        } else if (vcode === 'invalid_signature') {
          toast('验证失败，请重试或使用账号密码登录', 'error');
        } else if (vcode === 'counter_regression') {
          toast('安全校验失败，请删除后重新绑定', 'error');
        } else if (vcode === 'account_disabled') {
          toast('账号已被禁用', 'error');
        } else if (vcode === 'invalid_challenge') {
          toast('操作超时，请重新点击', 'error');
        } else {
          toast((vr && vr.message) || '登录失败', 'error');
        }
      }
    } catch (e) {
      console.error('[Passkey] login:', e);
      const msg = (e && e.message) ? e.message : '';
      if (msg.indexOf('网络') !== -1 || msg.indexOf('fetch') !== -1 || msg.indexOf('timeout') !== -1) {
        toast('网络异常，请检查网络后重试', 'error');
      } else {
        toast('登录失败：' + friendlyError(e), 'error');
      }
    } finally {
      _passkeyLoginInProgress = false;
    }
  }

  // ============ 无密码注册 ============
  async function signup() {
    if (!(await isPlatformAvailable())) { toast('当前设备或浏览器不支持 Passkey'); return; }

    const uEl = document.getElementById('signup-username');
    const eEl = document.getElementById('signup-email');
    const cEl = document.getElementById('signup-captcha');
    const aEl = document.getElementById('signup-agreement');

    if (!uEl || !eEl || !cEl) { toast('表单元素缺失'); return; }

    const username = uEl.value.trim();
    const email = eEl.value.trim().toLowerCase();
    const userRe = /^[a-zA-Z0-9_]{6,20}$/;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username) { toast('请输入账号'); uEl.focus(); return; }
    if (!userRe.test(username)) { toast('账号需 6-20 位，仅限字母、数字、下划线'); uEl.focus(); return; }
    if (!email) { toast('请输入邮箱'); eEl.focus(); return; }
    if (!emailRe.test(email)) { toast('邮箱格式错误'); eEl.focus(); return; }
    // 鲁棒检查：优先看全局 token，其次看 dataset.token，最后才看 status
    var captchaToken = window.__captchaToken
      || cEl.dataset.token
      || '';
    if (!captchaToken) {
      if (cEl.dataset.status === 'verifying') {
        toast('人机验证正在处理，请稍候 1 秒再试');
      } else {
        toast('请先完成人机验证');
      }
      return;
    }

    const btn = document.getElementById('btn-passkey-signup');
    if (btn) { btn.disabled = true; btn.textContent = '处理中...'; }

    try {
      const res = await window.apiClient.post('/api/passkey/signup-challenge', {
        username: username,
        email: email,
        captchaToken: captchaToken,
      });
      if (!res || !res.success) { toast((res && res.message) || '获取挑战失败'); return; }

      const pk = res.publicKey;
      const publicKey = {
        challenge: b64uToBuf(pk.challenge),
        rp: pk.rp,
        user: {
          id: new TextEncoder().encode(pk.user.id),
          name: pk.user.name,
          displayName: pk.user.displayName,
        },
        pubKeyCredParams: pk.pubKeyCredParams,
        timeout: pk.timeout || 60000,
        attestation: pk.attestation || 'none',
        authenticatorSelection: pk.authenticatorSelection,
        excludeCredentials: [],
      };

      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) { toast('注册已取消'); return; }

      const att = credential.response;
      const payload = {
        username: username,
        email: email,
        challengeId: res.challengeId,
        rawId: bufToB64u(credential.rawId),
        response: {
          clientDataJSON: bufToB64u(att.clientDataJSON),
          attestationObject: bufToB64u(att.attestationObject),
        },
        transports: att.getTransports ? att.getTransports() : [],
        deviceName: detectDeviceName(),
      };

      const vr = await window.apiClient.post('/api/passkey/signup-verify', payload);
      if (vr && vr.success) {
        toast('注册成功', 'success');
        setTimeout(function () {
          if (window.showHomepage) window.showHomepage(vr.user);
        }, 600);
      } else {
        toast((vr && vr.message) || '注册失败');
      }
    } catch (e) {
      console.error('[Passkey] signup:', e);
      toast('注册失败：' + friendlyError(e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🔐 使用 Passkey 创建账号'; }
    }
  }

  // ============ Passkey 找回（发码）============
  async function recoverSendCode() {
    const emailEl = document.getElementById('recover-email');
    const captchaEl = document.getElementById('recover-captcha');
    const btn = document.getElementById('btn-recover-send-code');
    if (!emailEl || !captchaEl) return;

    const email = emailEl.value.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { toast('请输入邮箱'); emailEl.focus(); return; }
    if (!emailRe.test(email)) { toast('邮箱格式错误'); emailEl.focus(); return; }
    if (captchaEl.dataset.status !== 'success') { toast('请先完成人机验证'); return; }
    const captchaToken = captchaEl.dataset.token || '';
    if (!captchaToken) { toast('请先完成人机验证'); return; }

    if (btn) { btn.disabled = true; btn.textContent = '发送中...'; }

    try {
      const res = await window.apiClient.post('/api/passkey/recover-challenge', {
        email: email,
        captchaToken: captchaToken,
      });
      if (!res || !res.success) {
        toast((res && res.message) || '发送失败');
        if (btn) { btn.disabled = false; btn.textContent = '发送验证码'; }
        return;
      }
      window.__recoverChallenge = {
        challengeId: res.challengeId,
        challenge: res.challenge,
        email: email,
      };
      toast('验证码已发送', 'success');
      let c = 60;
      btn.disabled = true;
      btn.textContent = c + '秒后重发';
      const timer = setInterval(function () {
        c -= 1;
        btn.textContent = c + '秒后重发';
        if (c <= 0) {
          clearInterval(timer);
          btn.textContent = '发送验证码';
          btn.disabled = false;
        }
      }, 1000);
    } catch (e) {
      console.error('[Passkey] recoverSendCode:', e);
      toast('发送失败：' + friendlyError(e));
      if (btn) { btn.disabled = false; btn.textContent = '发送验证码'; }
    }
  }

  // ============ Passkey 找回（重新绑定）============
  async function recoverVerify() {
    if (!(await isPlatformAvailable())) { toast('当前设备或浏览器不支持 Passkey'); return; }

    const emailEl = document.getElementById('recover-email');
    if (!emailEl) return;
    const email = emailEl.value.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { toast('请输入邮箱'); emailEl.focus(); return; }
    if (!emailRe.test(email)) { toast('邮箱格式错误'); emailEl.focus(); return; }

    let code = '';
    document.querySelectorAll('#recover-code-boxes input').forEach(function (i) { code += i.value; });
    if (code.length !== 6) {
      if (window.showCodeBoxError) {
        window.showCodeBoxError(document.getElementById('recover-code-boxes'), '请输入 6 位验证码');
      } else {
        toast('请输入 6 位验证码');
      }
      return;
    }

    const stored = window.__recoverChallenge;
    if (!stored || !stored.challengeId || !stored.challenge || stored.email !== email) {
      toast('请先点击发送验证码');
      return;
    }

    const btn = document.getElementById('btn-passkey-recover');
    if (btn) { btn.disabled = true; btn.textContent = '处理中...'; }

    try {
      const host = location.hostname;
      const publicKey = {
        challenge: b64uToBuf(stored.challenge),
        rp: { id: host, name: 'Apex Entertainment' },
        user: {
          id: new TextEncoder().encode('recover-' + stored.challengeId),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
        excludeCredentials: [],
      };

      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) { toast('操作已取消'); return; }

      const att = credential.response;
      const payload = {
        email: email,
        code: code,
        challengeId: stored.challengeId,
        rawId: bufToB64u(credential.rawId),
        response: {
          clientDataJSON: bufToB64u(att.clientDataJSON),
          attestationObject: bufToB64u(att.attestationObject),
        },
        transports: att.getTransports ? att.getTransports() : [],
        deviceName: detectDeviceName(),
      };

      const vr = await window.apiClient.post('/api/passkey/recover-verify', payload);
      if (vr && vr.success) {
        toast('找回成功', 'success');
        window.__recoverChallenge = null;
        setTimeout(function () {
          if (window.showHomepage) window.showHomepage(vr.user);
        }, 600);
      } else {
        toast((vr && vr.message) || '找回失败');
      }
    } catch (e) {
      console.error('[Passkey] recoverVerify:', e);
      toast('找回失败：' + friendlyError(e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🔐 用新设备重新绑定 Passkey'; }
    }
  }

  // ============ 列出 + 删除 ============
  async function load() {
    const listEl = document.getElementById('passkey-list');
    if (!listEl) return;

    try {
      const res = await window.apiClient.get('/api/passkey/list');
      if (!res || !res.success) { listEl.textContent = '无法加载'; return; }

      listEl.replaceChildren();

      if (!res.passkeys || res.passkeys.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'color:#888;font-size:11px;padding:6px 0;';
        empty.textContent = '尚未绑定任何 Passkey';
        listEl.appendChild(empty);
        return;
      }

      for (const pk of res.passkeys) {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#1a1a1a;border-radius:8px;margin-bottom:6px;font-size:11px;';

        const info = document.createElement('div');
        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-weight:bold;color:#fff;';
        nameEl.textContent = pk.deviceName || 'Passkey';
        info.appendChild(nameEl);

        const metaEl = document.createElement('div');
        metaEl.style.cssText = 'color:#666;margin-top:2px;font-size:10px;';
        metaEl.textContent = '绑定于 ' + (pk.createdAt ? String(pk.createdAt).slice(0, 10) : '未知');
        info.appendChild(metaEl);

        item.appendChild(info);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '删除';
        delBtn.style.cssText = 'background:transparent;border:1px solid #e63946;color:#e63946;font-size:10px;padding:3px 10px;border-radius:6px;cursor:pointer;';
        delBtn.addEventListener('click', (function (pkId) {
          return async function () {
            if (!window.confirm('确认删除该 Passkey？删除后此设备将无法再用它登录。')) return;
            const dr = await window.apiClient.post('/api/passkey/delete', { credentialId: pkId });
            if (dr && dr.success) { toast('已删除', 'success'); load(); }
            else { toast((dr && dr.message) || '删除失败'); }
          };
        })(pk.id));
        item.appendChild(delBtn);

        listEl.appendChild(item);
      }
    } catch (e) {
      console.error('[Passkey] list:', e);
      listEl.textContent = '加载失败';
    }
  }

  // ============ 导出 + 自动绑定 ============
  // 检测设备是否支持 Passkey，不支持则灰化卡片
  async function __disablePasskeyCards() {
    var ok = await isPlatformAvailable();
    if (ok) return;
    ['pick-login-passkey', 'pick-register-passkey', 'pick-forgot-passkey'].forEach(function (id) {
      var card = document.getElementById(id);
      if (!card) return;
      card.classList.add('disabled');
      card.setAttribute('aria-disabled', 'true');
      card.removeAttribute('tabindex');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __disablePasskeyCards);
  } else {
    __disablePasskeyCards();
  }

  window.__apexPasskey = {
    isSupported: isSupported,
    register: register,
    login: login,
    signup: signup,
    recoverSendCode: recoverSendCode,
    recoverVerify: recoverVerify,
    load: load,
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!isSupported()) {
      const bl = document.getElementById('btn-login-passkey');
      if (bl) bl.style.display = 'none';
      const br = document.getElementById('btn-register-passkey');
      if (br) br.style.display = 'none';
      const wrap = document.getElementById('passkey-login-wrap');
      if (wrap) wrap.style.display = 'none';
      return;
    }

    const bl = document.getElementById('btn-login-passkey');
    if (bl) bl.addEventListener('click', login);

    const br = document.getElementById('btn-register-passkey');
    if (br) br.addEventListener('click', register);
  });

  console.log('[Apex] Passkey 前端已加载');
})();
