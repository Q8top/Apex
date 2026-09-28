window.showHomepage = function(user) {
    user = user || {};
    document.querySelectorAll('body > div').forEach(el => {
      if (el.id === 'apex-homepage' || el.id === 'apex-toast' || el.id === 'security-modal') return;
      el.style.display = 'none';
    });
    const hp = document.getElementById('apex-homepage');
    if (!hp) return;
    hp.style.display = 'block';
    document.getElementById('user-name').textContent = user.username || '用户';
    document.getElementById('user-email').textContent = user.email || '';
    document.getElementById('user-avatar').textContent = (user.username || 'A')[0].toUpperCase();

    // R24: 注册时间
    const createdEl = document.getElementById('user-created');
    if (createdEl && user.createdAt) {
      try {
        const d = new Date(String(user.createdAt).replace(' ', 'T') + (String(user.createdAt).includes('Z') ? '' : 'Z'));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        createdEl.textContent = '注册于 ' + y + '-' + m + '-' + day;
      } catch (e) { createdEl.textContent = ''; }
    }

    // emailVerified 动态化
    const evEl = document.getElementById('user-email-verified');
    if (evEl) {
      const verified = Boolean(user.emailVerified);
      evEl.textContent = verified ? '已验证' : '未验证';
      evEl.style.color = verified ? '#4ade80' : '#e63946';
      if (!verified) {
        evEl.style.cursor = 'pointer';
        evEl.title = '点击前往验证邮箱';
        evEl.onclick = function() {
          if (window.apiClient) {
            window.apiClient.post('/api/send-verify-email', { email: user.email })
              .then(function(r) { alert(r.message || '验证邮件已发送'); });
          }
        };
      }
    }

    // 用户等级动态（预留给未来角色扩展）
    const lvlEl = document.getElementById('user-level');
    if (lvlEl) {
      lvlEl.textContent = user.role === 'vip' ? 'VIP' : '标准用户';
    }
  };

  document.addEventListener('click', function(e) {
    // "即将开放" 卡片点击提示
    const card = e.target.closest('[data-coming-soon]');
    if (card) {
      e.preventDefault();
      if (window.__apex && window.__apex.toast) {
        window.__apex.toast('功能开发中，敬请期待', 'info');
      }
      return;
    }
  });

  document.addEventListener('click', async function(e) {
    if (e.target.closest('#security-center-link')) {
      e.preventDefault();
      const modalEl = document.getElementById('security-modal');
      modalEl.style.display = 'flex';
      // 焦点管理：聚焦关闭按钮
      setTimeout(function () {
        var closeBtn = modalEl.querySelector('[data-apex-action="hide-security-modal"]');
        if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
      }, 50);
      const data = await window.apiClient.get('/api/sessions');
      const list = document.getElementById('session-list');
      if (data.success && data.sessions) {
        // XSS 加固：用 DOM API 构建，禁止 HTML 字符串拼接
        list.replaceChildren();
        const frag = document.createDocumentFragment();
        for (const s of data.sessions) {
          const card = document.createElement('div');
          card.style.cssText = 'padding:12px;background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:10px;margin-bottom:8px;font-size:12px;';
          const title = document.createElement('div');
          title.style.cssText = 'font-weight:bold;color:' + (s.isCurrent ? '#4ade80' : '#fff') + ';';
          title.textContent = s.isCurrent ? '当前设备' : '其他设备';
          card.appendChild(title);
          const meta = document.createElement('div');
          meta.style.cssText = 'color:#8a8a8a;margin-top:4px;';
          meta.textContent = String(s.createdAt || '');
          card.appendChild(meta);
          if (s.device || s.userAgent) {
            const dev = document.createElement('div');
            dev.style.cssText = 'color:#888;margin-top:4px;word-break:break-all;';
            dev.textContent = String(s.device || s.userAgent);
            card.appendChild(dev);
          }
          frag.appendChild(card);
        }
        list.appendChild(frag);
      } else {
        list.replaceChildren();
        const empty = document.createElement('div');
        empty.style.cssText = 'color:#888;font-size:11px;';
        empty.textContent = '无法加载设备列表';
        list.appendChild(empty);
          // APEX-R25-RETRY
          const retryBtn = document.createElement('button');
          retryBtn.type = 'button';
          retryBtn.textContent = '重试';
          retryBtn.style.cssText = 'display:block;margin:8px auto 0;padding:8px 20px;background:rgba(212,175,55,0.08);color:#d4af37;border:1px solid rgba(212,175,55,0.3);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;min-height:36px;';
          retryBtn.onclick = function() {
            const secLink = document.getElementById('security-center-link');
            if (secLink) secLink.click();
          };
          list.appendChild(retryBtn);
      }
    }
  });

  window.revokeAllSessions = async function() {
    if (!confirm('确认撤销所有其他设备？')) return;
    const data = await window.apiClient.delete('/api/sessions');
    if (window.__apex && window.__apex.toast) window.__apex.toast(data.message || '操作完成', data.success ? 'success' : 'error');
    if (data.success) document.getElementById('security-modal').style.display = 'none';
  };


// R24: 登出确认包装
(function () {
  if (window.__apexLogoutConfirm) return;
  window.__apexLogoutConfirm = true;
  var _orig = window.apexLogout;
  window.apexLogout = function () {
    if (window.confirm('确定要退出登录吗？')) {
      if (typeof _orig === 'function') return _orig.apply(this, arguments);
    }
  };
})();
