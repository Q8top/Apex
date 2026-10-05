/* Sweet Bonanza 详情页 · 原生 JS，无框架 / 无 eval / 无 Math.random */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] != null) el.setAttribute(k, String(attrs[k]));
    return el;
  }
  function svgRoot(vb, extra) {
    var a = { viewBox: vb, xmlns: NS, 'aria-hidden': 'true', focusable: 'false' };
    if (extra) for (var k in extra) a[k] = extra[k];
    return svg('svg', a);
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function seeded(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }

  function heartPath(cx, cy, s) {
    return 'M ' + cx + ' ' + (cy + s * 0.78) +
      ' C ' + (cx - s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + (cx - s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + cx + ' ' + (cy - s * 0.36) +
      ' C ' + (cx + s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + (cx + s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + cx + ' ' + (cy + s * 0.78) + ' Z';
  }
  function starPath(cx, cy, r, pts) {
    var inner = r * 0.44, step = Math.PI / pts, d = '';
    for (var i = 0; i < pts * 2; i++) {
      var rad = (i % 2 === 0) ? r : inner;
      var a = -Math.PI / 2 + i * step;
      d += (i === 0 ? 'M' : 'L') + (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad).toFixed(2) + ' ';
    }
    return d + 'Z';
  }
  function circlePath(cx, cy, r) {
    return 'M ' + (cx - r) + ' ' + cy + ' a ' + r + ' ' + r + ' 0 1 0 ' + (r * 2) + ' 0 a ' + r + ' ' + r + ' 0 1 0 ' + (-r * 2) + ' 0 Z';
  }
  function dropPath(cx, cy, r) {
    return 'M ' + cx + ' ' + (cy - r * 1.28) +
      ' C ' + (cx + r * 0.82) + ' ' + (cy - r * 0.36) + ', ' + (cx + r) + ' ' + (cy + r * 0.42) + ', ' + cx + ' ' + (cy + r * 0.98) +
      ' C ' + (cx - r) + ' ' + (cy + r * 0.42) + ', ' + (cx - r * 0.82) + ' ' + (cy - r * 0.36) + ', ' + cx + ' ' + (cy - r * 1.28) + ' Z';
  }
  function diamondPath(cx, cy, r) {
    return 'M ' + cx + ' ' + (cy - r) + ' L ' + (cx + r * 0.86) + ' ' + cy + ' L ' + cx + ' ' + (cy + r) + ' L ' + (cx - r * 0.86) + ' ' + cy + ' Z';
  }
  function flowerPath(cx, cy, r, petals) {
    var inner = r * 0.44, step = Math.PI * 2 / petals, d = '';
    for (var i = 0; i < petals; i++) {
      var a1 = i * step - Math.PI / 2, a2 = a1 + step / 2, a3 = a1 + step;
      var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      var x2 = cx + Math.cos(a2) * inner, y2 = cy + Math.sin(a2) * inner;
      var x3 = cx + Math.cos(a3) * r, y3 = cy + Math.sin(a3) * r;
      if (i === 0) d += 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
      d += ' Q ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' ' + x3.toFixed(2) + ' ' + y3.toFixed(2);
    }
    return d + 'Z';
  }
  function ringPath(cx, cy, r) {
    return { d: circlePath(cx, cy, r) + ' ' + circlePath(cx, cy, r * 0.55), fillRule: 'evenodd' };
  }
  function candyPath(cx, cy, r) {
    return circlePath(cx, cy, r * 0.86) +
      ' M ' + (cx - r * 0.86) + ' ' + cy + ' L ' + (cx - r * 1.7) + ' ' + (cy - r * 0.55) + ' L ' + (cx - r * 1.7) + ' ' + (cy + r * 0.55) + ' Z' +
      ' M ' + (cx + r * 0.86) + ' ' + cy + ' L ' + (cx + r * 1.7) + ' ' + (cy - r * 0.55) + ' L ' + (cx + r * 1.7) + ' ' + (cy + r * 0.55) + ' Z';
  }
  function lollipopPath(cx, cy, r) {
    return circlePath(cx, cy - r * 0.18, r * 0.86) +
      ' M ' + (cx - r * 0.08) + ' ' + (cy + r * 0.62) + ' L ' + (cx + r * 0.08) + ' ' + (cy + r * 0.62) +
      ' L ' + (cx + r * 0.08) + ' ' + (cy + r * 1.42) + ' L ' + (cx - r * 0.08) + ' ' + (cy + r * 1.42) + ' Z';
  }

  var SHAPES = {
    heart: heartPath,
    star: function (x, y, r) { return starPath(x, y, r, 5); },
    circle: circlePath,
    drop: dropPath,
    diamond: diamondPath,
    flower: function (x, y, r) { return flowerPath(x, y, r, 6); },
    ring: ringPath,
    candy: candyPath,
    lollipop: lollipopPath
  };

  /* ── Symbol Definition ── */
  var SYMBOLS = [
    { id: 'heart',  name: '红心糖果', mult: '×5',      shape: 'heart',    theme: { main: '#ff3d7f', dark: '#8f0f39', light: '#ffb8d4' } },
    { id: 'star',   name: '星星糖',   mult: '×4',      shape: 'star',     theme: { main: '#ffb300', dark: '#8a5a00', light: '#ffe291' } },
    { id: 'gem',    name: '钻石糖',   mult: '×3',      shape: 'diamond',  theme: { main: '#7c5cff', dark: '#33209c', light: '#cabdff' } },
    { id: 'drop',   name: '水滴糖',   mult: '×2.5',    shape: 'drop',     theme: { main: '#22c55e', dark: '#0c5e28', light: '#aaf1c2' } },
    { id: 'flower', name: '花朵糖',   mult: '×2',      shape: 'flower',   theme: { main: '#ff7a00', dark: '#8f4000', light: '#ffcb90' } },
    { id: 'circle', name: '圆糖',     mult: '×1.5',    shape: 'circle',   theme: { main: '#06b6d4', dark: '#085164', light: '#a8edf6' } },
    { id: 'ring',   name: '甜甜圈',   mult: '×1',      shape: 'ring',     theme: { main: '#f43f5e', dark: '#7d0a20', light: '#fdcdd7' } },
    { id: 'candy',  name: '扭扭糖',   mult: '×0.8',    shape: 'candy',    theme: { main: '#ec4899', dark: '#7b0c4b', light: '#fcd0e6' } },
    { id: 'lolli',  name: '棒棒糖',   mult: 'SCATTER', shape: 'lollipop', theme: { main: '#facc15', dark: '#7a5b00', light: '#fef4b0' } }
  ];

  /* ── SVG Generator：主体 Path + 阴影 + Gradient + 高光 + Stroke + 装饰 ── */
  function buildSymbolArt(spec, size) {
    var uid = spec.id + '_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', { width: size, height: size });
    var defs = svg('defs');

    var grad = svg('linearGradient', { id: 'g_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svg('stop', { offset: '0',    'stop-color': t.light }));
    grad.appendChild(svg('stop', { offset: '0.45', 'stop-color': t.main  }));
    grad.appendChild(svg('stop', { offset: '1',    'stop-color': t.dark  }));
    defs.appendChild(grad);

    var hl = svg('radialGradient', { id: 'h_' + uid, cx: '0.34', cy: '0.28', r: '0.55' });
    hl.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.88' }));
    hl.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(hl);

    var strokeG = svg('linearGradient', { id: 's_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    strokeG.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    strokeG.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(strokeG);

    var filt = svg('filter', { id: 'sh_' + uid, x: '-30%', y: '-25%', width: '160%', height: '165%' });
    filt.appendChild(svg('feDropShadow', { dx: '0', dy: '2.2', stdDeviation: '2.6', 'flood-color': t.dark, 'flood-opacity': '0.38' }));
    defs.appendChild(filt);
    root.appendChild(defs);

    var cx = 50, cy = 52, r = 30;
    var sd = SHAPES[spec.shape](cx, cy, r);
    var d = (typeof sd === 'string') ? sd : sd.d;
    var fillRule = (typeof sd === 'object' && sd.fillRule) || 'nonzero';

    root.appendChild(svg('path', { d: d, 'fill-rule': fillRule, fill: 'url(#g_' + uid + ')', filter: 'url(#sh_' + uid + ')' }));
    root.appendChild(svg('path', { d: d, 'fill-rule': fillRule, fill: 'none', stroke: 'url(#s_' + uid + ')', 'stroke-width': '1.6', 'stroke-linejoin': 'round' }));
    root.appendChild(svg('path', { d: d, 'fill-rule': fillRule, fill: 'url(#h_' + uid + ')', opacity: '0.78' }));

    var count = 2 + Math.floor(seeded(spec.id.length + 3) * 3);
    for (var i = 0; i < count; i++) {
      var s1 = seeded(i * 7 + spec.id.length);
      var s2 = seeded(i * 13 + spec.id.charCodeAt(0));
      var sx = cx + (s1 - 0.5) * r * 1.15;
      var sy = cy + (s2 - 0.5) * r * 0.95 - r * 0.18;
      var sr = 1.4 + s1 * 1.2;
      root.appendChild(svg('ellipse', {
        cx: sx.toFixed(2), cy: sy.toFixed(2),
        rx: sr.toFixed(2), ry: (sr * 0.6).toFixed(2),
        fill: '#ffffff', opacity: (0.55 + s2 * 0.35).toFixed(2)
      }));
    }
    return root;
  }

  /* ── 页面数据 ── */
  var CAROUSEL = [
    { label: '游戏画面', sub: 'GAME SCREEN 01',   image: 'assets/games/sweet.webp' },
    { label: '免费旋转', sub: 'FREE SPINS',       image: null },
    { label: '倍数炸弹', sub: 'MULTIPLIER BOMBS', image: null },
    { label: '大额赔付', sub: 'BIG WIN',          image: null }
  ];

  var FAQ = [
    { q: '糖果连连爆的赔付方式是什么？', a: '采用「任意位置赔付」（Scatter Pays），同一种符号在网格任意位置出现 8 个及以上即触发赔付，与连线无关。' },
    { q: '如何触发免费旋转？',           a: '单局中同时出现 4 个及以上棒棒糖 Scatter 符号，即可获得 10 次免费旋转。' },
    { q: '免费旋转中的倍数如何累加？',   a: '免费旋转期间若出现糖果炸弹，倍数会被收集并累加到本轮最终赔付中，单个炸弹最高 ×100。' },
    { q: '最大可以赢多少倍？',           a: '在最高投注与最优倍数叠加下，理论最大赔付倍数为 ×21,100。' },
    { q: 'RTP 是多少？',                 a: '标准 RTP 为 96.48%。实际结果因投注档位与波动而异。' }
  ];

  var SIMILAR = [
    { name: '甜蜜爆奖', cover: 'assets/games/sugar.webp' },
    { name: '奥林匹斯', cover: 'assets/games/olympus.webp' },
    { name: '星爆',     cover: 'assets/games/starburst.webp' },
    { name: '巨型鲈鱼', cover: 'assets/games/bass.webp' },
    { name: '死亡之书', cover: 'assets/games/book.webp' },
    { name: '刚果探险', cover: 'assets/games/gonzo.webp' }
  ];

  /* ── Toast ── */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'sd-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { if (toastEl) toastEl.classList.remove('is-show'); }, 1800);
  }

  /* ── 轮播 ── */
  function buildPlaceholder(item) {
    var ph = document.createElement('div');
    ph.className = 'sd-carousel__ph';
    var lbl = document.createElement('div'); lbl.className = 'sd-carousel__ph-label'; lbl.textContent = item.label;
    var sub = document.createElement('div'); sub.className = 'sd-carousel__ph-sub';   sub.textContent = item.sub;
    ph.appendChild(lbl); ph.appendChild(sub);
    return ph;
  }

  function renderCarousel() {
    var track = document.getElementById('sd-carousel-track');
    var dots  = document.getElementById('sd-carousel-dots');
    if (!track || !dots) return;
    track.innerHTML = ''; dots.innerHTML = '';

    CAROUSEL.forEach(function (item, i) {
      var slide = document.createElement('div');
      slide.className = 'sd-carousel__slide';
      slide.setAttribute('data-index', String(i));

      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.label;
        img.loading = (i === 0) ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', function () {
          slide.innerHTML = '';
          slide.appendChild(buildPlaceholder(item));
        }, { once: true });
        slide.appendChild(img);
      } else {
        slide.appendChild(buildPlaceholder(item));
      }
      track.appendChild(slide);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'sd-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      dot.addEventListener('click', function () { scrollToSlide(i); });
      dots.appendChild(dot);
    });

    bindCarouselScroll();
  }

  function scrollToSlide(i) {
    var vp = document.getElementById('sd-carousel-viewport');
    if (!vp) return;
    var slides = vp.querySelectorAll('.sd-carousel__slide');
    if (slides[i]) slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function bindCarouselScroll() {
    var vp = document.getElementById('sd-carousel-viewport');
    var dots = document.getElementById('sd-carousel-dots');
    if (!vp || !dots) return;
    var raf = 0;
    vp.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var slides = vp.querySelectorAll('.sd-carousel__slide');
        var vRect = vp.getBoundingClientRect();
        var vCenter = vRect.left + vRect.width / 2;
        var best = 0, bestDist = Infinity;
        for (var i = 0; i < slides.length; i++) {
          var r = slides[i].getBoundingClientRect();
          var d = Math.abs((r.left + r.width / 2) - vCenter);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        var allDots = dots.querySelectorAll('.sd-carousel__dot');
        for (var j = 0; j < allDots.length; j++) allDots[j].classList.toggle('is-active', j === best);
      });
    }, { passive: true });
  }

  /* ── 符号倍率表 ── */
  function renderSymbols() {
    var wrap  = document.getElementById('sd-symbols');
    var badge = document.getElementById('sd-symbol-count');
    if (!wrap) return;
    wrap.innerHTML = '';

    SYMBOLS.forEach(function (spec) {
      var card = document.createElement('div');
      card.className = 'sd-symbol';

      var art = document.createElement('div');
      art.className = 'sd-symbol__art';
      art.appendChild(buildSymbolArt(spec, 48));
      card.appendChild(art);

      var name = document.createElement('div');
      name.className = 'sd-symbol__name';
      name.textContent = spec.name;
      card.appendChild(name);

      var mult = document.createElement('div');
      mult.className = 'sd-symbol__mult';
      mult.textContent = spec.mult;
      card.appendChild(mult);

      wrap.appendChild(card);
    });

    if (badge) badge.textContent = SYMBOLS.length + ' 个符号';
  }

  /* ── FAQ ── */
  function renderFaq() {
    var wrap = document.getElementById('sd-faq');
    if (!wrap) return;
    wrap.innerHTML = '';

    FAQ.forEach(function (item, i) {
      var el = document.createElement('div');
      el.className = 'sd-faq__item';

      var q = document.createElement('button');
      q.type = 'button';
      q.className = 'sd-faq__q';
      q.setAttribute('aria-expanded', 'false');
      q.setAttribute('aria-controls', 'faq-a-' + i);

      var qText = document.createElement('span');
      qText.textContent = item.q;
      q.appendChild(qText);

      var chev = document.createElement('span');
      chev.className = 'sd-faq__chev';
      var chevSvg = svgRoot('0 0 24 24', { width: 18, height: 18 });
      chevSvg.appendChild(svg('polyline', { points: '6 9 12 15 18 9', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      chev.appendChild(chevSvg);
      q.appendChild(chev);

      el.appendChild(q);

      var a = document.createElement('div');
      a.className = 'sd-faq__a';
      a.id = 'faq-a-' + i;
      var inner = document.createElement('div');
      inner.className = 'sd-faq__a-inner';
      var p = document.createElement('p');
      p.textContent = item.a;
      inner.appendChild(p);
      a.appendChild(inner);
      el.appendChild(a);

      q.addEventListener('click', function () {
        var open = el.classList.toggle('is-open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      wrap.appendChild(el);
    });
  }

  /* ── 相似游戏 ── */
  function renderSimilar() {
    var wrap = document.getElementById('sd-similar');
    if (!wrap) return;
    wrap.innerHTML = '';

    SIMILAR.forEach(function (g) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'sd-card';

      var cover = document.createElement('div');
      cover.className = 'sd-card__cover';
      var img = document.createElement('img');
      img.src = g.cover;
      img.alt = g.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      cover.appendChild(img);
      card.appendChild(cover);

      var name = document.createElement('div');
      name.className = 'sd-card__name';
      name.textContent = g.name;
      card.appendChild(name);

      card.addEventListener('click', function () { toast('即将上线：' + g.name); });
      wrap.appendChild(card);
    });
  }

  /* ── Tabs ── */
  function bindTabs() {
    var wrap   = document.getElementById('sd-tabs');
    var panels = document.getElementById('sd-tabpanels');
    if (!wrap || !panels) return;

    wrap.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== wrap && !t.classList.contains('sd-tab')) t = t.parentNode;
      if (!t || t === wrap) return;
      var key = t.getAttribute('data-tab');
      if (!key) return;

      var tabs = wrap.querySelectorAll('.sd-tab');
      for (var i = 0; i < tabs.length; i++) {
        var on = (tabs[i] === t);
        tabs[i].classList.toggle('is-active', on);
        tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      }
      var all = panels.querySelectorAll('.sd-tabpanel');
      for (var j = 0; j < all.length; j++) {
        all[j].classList.toggle('is-active', all[j].getAttribute('data-panel') === key);
      }
    });
  }

  /* ── Header ── */
  function bindHeader() {
    var back = document.getElementById('sd-back');
    if (back) {
      back.addEventListener('click', function () {
        if (window.history.length > 1) window.history.back();
        else window.location.href = 'index.html';
      });
    }

    var share = document.getElementById('sd-share');
    if (share) {
      share.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: '糖果连连爆 Sweet Bonanza · Apex', text: '来看看这款高波动糖果老虎机', url: url })
            .catch(function () {});
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url)
            .then(function () { toast('链接已复制'); })
            .catch(function () { toast('分享链接：' + url); });
          return;
        }
        toast('分享链接：' + url);
      });
    }
  }

  /* ── Bottom Action Bar ── */
  function bindBottom() {
    var fav = document.getElementById('sd-fav');
    if (fav) {
      fav.addEventListener('click', function () {
        var on = fav.classList.toggle('is-active');
        fav.setAttribute('aria-pressed', on ? 'true' : 'false');
        toast(on ? '已加入收藏' : '已取消收藏');
      });
    }

    var svc = document.getElementById('sd-service');
    if (svc) svc.addEventListener('click', function () { toast('客服即将接入'); });

    var demo = document.getElementById('sd-demo');
    if (demo) demo.addEventListener('click', function () { toast('免费试玩即将开放'); });

    var play = document.getElementById('sd-play');
    if (play) play.addEventListener('click', function () { toast('请先登录后开始游戏'); });
  }

  /* ── Init ── */
  function init() {
    renderCarousel();
    renderSymbols();
    renderFaq();
    renderSimilar();
    bindTabs();
    bindHeader();
    bindBottom();
    document.documentElement.classList.add('sd-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
