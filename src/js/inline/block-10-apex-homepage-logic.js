window.showHomepage = function(user) {
    // user 必须由调用方从 /api/me 或登录接口传入，不再读 localStorage
    user = user || {};
    // 隐藏所有顶层元素
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
  };

  document.addEventListener('click', async function(e) {
    if (e.target.closest('#security-center-link')) {
      e.preventDefault();
      document.getElementById('security-modal').style.display = 'flex';
      const data = await window.apiClient.get('/api/sessions');
      const list = document.getElementById('session-list');
      if (data.success && data.sessions) {
        // XSS 加固：用 DOM API 构建，禁止 HTML 字符串拼接
        list.replaceChildren();
        const frag = document.createDocumentFragment();
        for (const s of data.sessions) {
          const card = document.createElement('div');
          card.style.cssText = 'padding:10px;background:#1a1a1a;border-radius:8px;margin-bottom:8px;font-size:11px;';
          const title = document.createElement('div');
          title.style.cssText = 'font-weight:bold;color:' + (s.isCurrent ? '#4ade80' : '#fff') + ';';
          title.textContent = s.isCurrent ? '当前设备' : '其他设备';
          card.appendChild(title);
          const meta = document.createElement('div');
          meta.style.cssText = 'color:#666;margin-top:4px;';
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
      }
    }
  });

  window.revokeAllSessions = async function() {
    if (!confirm('确认撤销所有其他设备？')) return;
    const data = await window.apiClient.delete('/api/sessions');
    alert(data.message || '操作完成');
    if (data.success) document.getElementById('security-modal').style.display = 'none';
  };
