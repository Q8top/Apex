// Apex 首页 v5 — 高级交互
// 依赖: GSAP + ScrollTrigger + Anime.js（defer 加载）
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  // ============ 工具 ============
  function haptic(ms) {
    try {
      if (navigator.vibrate && typeof navigator.vibrate === 'function') {
        navigator.vibrate(ms || 6);
      }
    } catch (e) {}
  }

  // CSPRNG 统一工具（避免 Math.random 触发安全扫描）
  // Canvas 粒子抖动，纯装饰用途。
  function cryptoRandom() {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }

  // ============ 认证检查 ============
  function checkAuth() {
    var controller = new AbortController();
    var tid = setTimeout(function () { controller.abort(); }, 8000);

    fetch('/api/me', {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal
    })
      .then(function (res) {
        clearTimeout(tid);
        if (res.status === 401) { location.replace('/'); return null; }
        return res.ok ? res.json().catch(function () { return null; }) : null;
      })
      .then(function (data) {
        if (!data || !data.success || !data.user) { location.replace('/'); return; }
        window.__apexUser = data.user;
        var nameEl = document.getElementById('topbar-username');
        if (nameEl) {
          var name = data.user.username || data.user.email || '用户';
          nameEl.textContent = name.length > 10 ? name.slice(0, 9) + '…' : name;
        }
      })
      .catch(function () { clearTimeout(tid); });
  }

  // ============ 登出 ============
  function logout() {
    if (!window.confirm('确认登出？')) return;
    haptic(20);

    var post = (window.apiClient && window.apiClient.post)
      ? window.apiClient.post('/api/logout', {})
      : fetch('/api/logout', { method: 'POST', credentials: 'include' });

    Promise.resolve(post)
      .then(function () {
        try {
          if (window.__apexBroadcast) window.__apexBroadcast.postMessage({ type: 'logout' });
        } catch (e) {}
        location.replace('/');
      })
      .catch(function () { location.replace('/'); });
  }

  // ============ Canvas 粒子背景 ============
  function initParticles() {
    var canvas = document.getElementById('hero-particles');
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var particles = [];
    var PARTICLE_COUNT = 34;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function create() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: cryptoRandom() * W,
          y: cryptoRandom() * H,
          r: cryptoRandom() * 1.6 + 0.4,
          vx: (cryptoRandom() - 0.5) * 0.35,
          vy: (cryptoRandom() - 0.5) * 0.35,
          a: cryptoRandom() * 0.5 + 0.15
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,209,135,' + p.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    create();
    draw();

    window.addEventListener('resize', function () {
      resize();
      create();
    }, { passive: true });
  }

  // ============ GSAP 入场动画 ============
  function initReveal() {
    if (!window.gsap || reduceMotion) {
      // 无 GSAP：直接显示
      var els = document.querySelectorAll('[data-apex-reveal]');
      for (var i = 0; i < els.length; i++) els[i].classList.add('apex-revealed');
      return;
    }

    var items = document.querySelectorAll('[data-apex-reveal]');
    items.forEach(function (el) {
      var delay = Number(el.dataset.delay || 0) / 1000;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: delay,
        ease: 'expo.out',
        onStart: function () { el.classList.add('apex-revealed'); }
      });
    });

    // 底部滚动触发
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      var scrollers = document.querySelectorAll('[data-apex-reveal="scroll"]');
      scrollers.forEach(function (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  }

  // ============ Anime.js 快捷分类交错入场 ============
  function initQuickStagger() {
    if (!window.anime || reduceMotion) return;
    var cats = document.querySelectorAll('.quick-cat');
    if (!cats.length) return;

    // 初始隐藏
    cats.forEach(function (c) {
      c.style.opacity = '0';
      c.style.transform = 'translateY(14px) scale(0.9)';
    });

    anime({
      targets: '.quick-cat',
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.9, 1],
      delay: anime.stagger(70, { start: 350 }),
      duration: 620,
      easing: 'easeOutExpo'
    });
  }

  // ============ 磁吸按钮 ============
  function initMagnetic() {
    if (reduceMotion) return;
    var btns = document.querySelectorAll('[data-apex-magnetic]');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      var cx = 0, cy = 0, raf = null;
      var RADIUS = 90;
      var STRENGTH = 0.28;

      function onMove(e) {
        var rect = btn.getBoundingClientRect();
        var mx = (e.touches ? e.touches[0].clientX : e.clientX);
        var my = (e.touches ? e.touches[0].clientY : e.clientY);
        var x = mx - (rect.left + rect.width / 2);
        var y = my - (rect.top + rect.height / 2);
        var dist = Math.sqrt(x * x + y * y);
        var t = Math.max(0, 1 - dist / (RADIUS * 3));
        var tx = x * STRENGTH * t;
        var ty = y * STRENGTH * t;
        if (window.gsap) {
          gsap.to(btn, { x: tx, y: ty, duration: 0.35, ease: 'power2.out' });
        } else {
          btn.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        }
      }

      function reset() {
        if (window.gsap) {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        } else {
          btn.style.transform = '';
        }
      }

      btn.addEventListener('mousemove', onMove, { passive: true });
      btn.addEventListener('mouseleave', reset, { passive: true });
      btn.addEventListener('touchmove', onMove, { passive: true });
      btn.addEventListener('touchend', reset, { passive: true });
    });
  }

  // ============ 一级 tabs ============
  function bindTopTabs() {
    var nav = document.getElementById('top-tabs');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab || tab.classList.contains('tab-more')) return;
      haptic(5);
      var all = nav.querySelectorAll('.tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      tab.classList.add('active');
      console.log('[home] tab:', tab.dataset.tab);
    });
  }

  // ============ Chip ============
  function bindChips() {
    var row = document.getElementById('chip-row');
    if (!row) return;

    row.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip || chip.classList.contains('chip-more')) return;
      haptic(5);
      var all = row.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      chip.classList.add('active');
    });
  }

  // ============ 底部导航 ============
  function bindBottomNav() {
    var nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.bn-item');
      if (!btn) return;
      haptic(8);
      var all = nav.querySelectorAll('.bn-item');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      console.log('[home] nav:', btn.dataset.key);
    });
  }

  // ============ Hero 圆点 ============
  function bindHeroDots() {
    var dots = document.querySelectorAll('.hero-dots i');
    if (!dots || dots.length < 2) return;
    var cur = 0;
    setInterval(function () {
      for (var i = 0; i < dots.length; i++) dots[i].classList.remove('active');
      cur = (cur + 1) % dots.length;
      dots[cur].classList.add('active');
    }, 3500);
  }

  // ============ 全局事件委托 ============
  function bindActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-apex-action]');
      if (!el) return;
      var action = el.getAttribute('data-apex-action');

      if (action === 'logout') {
        e.preventDefault();
        logout();
        return;
      }

      if (action === 'lang') {
        var strong = el.querySelector('span');
        if (strong) {
          var langs = ['中文', 'EN', 'ES', 'PT', 'FR'];
          var idx = langs.indexOf(strong.textContent.trim());
          strong.textContent = langs[(idx + 1) % langs.length];
          haptic(6);
        }
        return;
      }

      if (action === 'region') { haptic(6); return; }

      if (action === 'profile') { e.preventDefault(); return; }

      // 其他日志
      console.log('[home] action:', action, el.dataset.key || '');
    }, true);
  }

  // ============ 初始化 ============
  function init() {
    checkAuth();
    initParticles();
    initQuickStagger();
    initReveal();
    initMagnetic();
    bindTopTabs();
    bindChips();
    bindBottomNav();
    bindHeroDots();
    bindActions();
    console.log('[Apex] Home v5 已加载');
  }

  // GSAP/Anime 是 defer 加载，可能 DOM ready 时还没到 → 延迟一点
  function boot() {
    if (window.gsap && window.anime) {
      init();
    } else {
      setTimeout(function () {
        init();
      }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
