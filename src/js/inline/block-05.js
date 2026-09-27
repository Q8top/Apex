(function() {
    'use strict';

    // ============================================================
    // 1. 语言切换（30 国）
    // ============================================================
    
  // 语言列表（真实支持）
  const languages = [
    { code: 'zh-CN', flag: '🇨🇳', name: '简体中文' },
    { code: 'en',    flag: '🇺🇸', name: 'English' },
    { code: 'ja',    flag: '🇯🇵', name: '日本語' },
  ];

  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');
  const currentFlag = document.getElementById('current-flag');
  const currentLang = document.getElementById('current-lang');

  if (langBtn && langMenu) {
    langMenu.innerHTML = '';
    languages.forEach(lang => {
      const item = document.createElement('div');
      item.className = 'lang-item';
      item.innerHTML = '<span>' + lang.flag + '</span><span>' + lang.name + '</span>';
      item.onclick = (e) => {
        e.stopPropagation();
        currentFlag.textContent = lang.flag;
        currentLang.textContent = lang.name;
        langMenu.classList.remove('show');
        if (window.__setLang) window.__setLang(lang.code);
      };
      langMenu.appendChild(item);
    });

    langBtn.addEventListener('click', (e) => { e.stopPropagation(); langMenu.classList.toggle('show'); });
    document.addEventListener('click', () => langMenu.classList.remove('show'));
  }


    // ============================================================
    // 2. 加载页逻辑（仅首次进入）
    // ============================================================
    (function() {
      const splash = document.getElementById('apex-splash-screen');
      if (!splash) return;

      if (sessionStorage.getItem('apex_splash_shown') === 'true') {
        splash.style.display = 'none';
        return;
      }

      splash.style.display = 'flex';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      const progressBar = document.getElementById('splash-progress-bar');
      const progressText = document.getElementById('splash-progress-text');

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 2) + 2;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        progressText.innerHTML = 'APEX 系统加载中... <span>' + progress + '%</span>';
        if (progress === 100) {
          clearInterval(interval);
          progressText.innerHTML = 'APEX系统加载完成';
          setTimeout(() => {
            splash.classList.add('hide');
            sessionStorage.setItem('apex_splash_shown', 'true');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
          }, 800);
        }
      }, 100);
    })();

    // ============================================================
    // 3. 初始化所有小眼睛图标
    // ============================================================
    const EYE_OPEN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    document.querySelectorAll('.btn-toggle').forEach(el => { el.innerHTML = EYE_OPEN; });

    console.log('[Apex] 语言、加载页、小眼睛已初始化');
  })();
