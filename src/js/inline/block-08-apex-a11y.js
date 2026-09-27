(function() {
    // 1. 给所有输入框补充无障碍属性
    document.querySelectorAll('input').forEach(input => {
      if (!input.id) return;
      // 确保 label 关联
      const label = input.closest('.input-group')?.querySelector('label');
      if (label && !label.htmlFor) label.htmlFor = input.id;
      // aria-label 描述
      if (!input.getAttribute('aria-label') && input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });

    // 2. 给所有按钮补充 aria-label
    document.querySelectorAll('.btn-primary').forEach(btn => {
      if (!btn.getAttribute('aria-label') && btn.textContent.trim()) {
        btn.setAttribute('aria-label', btn.textContent.trim());
      }
    });

    // 3. 给密码小眼睛添加 aria-label
    document.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', '显示或隐藏密码');
      btn.setAttribute('tabindex', '0');
    });

    // 4. 给 Tab 补充无障碍状态
    document.querySelectorAll('.tab').forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    });

    // 5. 给语言切换按钮补充 aria-label
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.setAttribute('aria-label', '切换语言');
      langBtn.setAttribute('aria-haspopup', 'true');
    }

    // 6. 键盘可访问性：所有 [role=button] 支持 Enter/Space 触发
    document.querySelectorAll('[role="button"]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });

    // 7. 加载页添加 aria-hidden（读屏器忽略它）
    const splash = document.getElementById('apex-splash-screen');
    if (splash) splash.setAttribute('aria-hidden', 'true');

    console.log('[Apex] a11y 优化已应用');
  })();
