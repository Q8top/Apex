(function() {
    'use strict';

  // P11-I: UI 随机数也走 CSPRNG，消除 Math.random，统一安全基线
  const apexUIRandom = (() => {
    const buf = new Uint32Array(1);
    return function() {
      crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    };
  })();

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
      const _sp1=document.createElement('span');_sp1.textContent=lang.flag;const _sp2=document.createElement('span');_sp2.textContent=lang.name;item.replaceChildren(_sp1,_sp2);
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
      let _splashHidden = false;
      const _hideSplash = function() {
        if (_splashHidden) return;
        _splashHidden = true;
        try {
          splash.classList.add('hide');
          sessionStorage.setItem('apex_splash_shown', 'true');
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
        } catch (e) {}
      };
      setTimeout(_hideSplash, 5000);
      const interval = setInterval(() => {
        progress += Math.floor(apexUIRandom() * 2) + 2;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        progressText.textContent='APEX 系统加载中... '+progress+'%';
        if (progress === 100) {
          clearInterval(interval);
          progressText.textContent='APEX系统加载完成';
          setTimeout(_hideSplash, 800);
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
