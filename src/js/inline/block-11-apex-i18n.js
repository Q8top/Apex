(function() {
    // 翻译缓存
    const cache = {};

    // 当前语言
    window.__currentLang = localStorage.getItem('apex_lang') || 'zh-CN';

    // 加载翻译文件
    async function loadTranslations(lang) {
      if (cache[lang]) return cache[lang];
      try {
        const res = await fetch('/i18n/' + lang + '.json');
        if (!res.ok) throw new Error('not found');
        cache[lang] = await res.json();
        return cache[lang];
      } catch (e) {
        // 回退到英文
        if (lang !== 'en') return loadTranslations('en');
        return {};
      }
    }

    // 翻译函数
    window.t = function(key) {
      const dict = cache[window.__currentLang] || {};
      return dict[key] || key;
    };

    // 遍历所有 [data-i18n] 元素并替换文本
    async function applyTranslations(lang) {
      window.__currentLang = lang;
      await loadTranslations(lang);

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = window.t(key);
        if (text && text !== key) el.textContent = text;
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = window.t(key);
        if (text && text !== key) el.placeholder = text;
      });

      localStorage.setItem('apex_lang', lang);
      // 更新语言切换按钮
      const flagEl = document.getElementById('current-flag');
      const langEl = document.getElementById('current-lang');
      const meta = {
        'zh-CN': { flag: '🇨🇳', name: '简体中文' },
        'en': { flag: '🇺🇸', name: 'English' },
        'ja': { flag: '🇯🇵', name: '日本語' },
      };
      if (meta[lang] && flagEl && langEl) {
        flagEl.textContent = meta[lang].flag;
        langEl.textContent = meta[lang].name;
      }
    }

    window.__setLang = applyTranslations;

    // 页面加载时应用当前语言
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyTranslations(window.__currentLang));
    } else {
      applyTranslations(window.__currentLang);
    }

    console.log('[Apex] i18n 已启用，当前语言：', window.__currentLang);
  })();
