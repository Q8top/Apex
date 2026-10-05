/* Sweet Bonanza 详情页 V2 · 程序化 SVG Symbol · 无框架 / 无 eval / 无 Math.random */
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
  function n2(v) { return Number(v).toFixed(2); }

  /* ── 形状库 ── */
  function pHeart(cx, cy, s) {
    return 'M ' + cx + ' ' + (cy + s * 0.78) +
      ' C ' + (cx - s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + (cx - s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + cx + ' ' + (cy - s * 0.36) +
      ' C ' + (cx + s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + (cx + s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + cx + ' ' + (cy + s * 0.78) + ' Z';
  }
  function pStar(cx, cy, r, pts, innerRatio) {
    var inner = r * (innerRatio || 0.44), step = Math.PI / pts, d = '';
    for (var i = 0; i < pts * 2; i++) {
      var rad = (i % 2 === 0) ? r : inner;
      var a = -Math.PI / 2 + i * step;
      d += (i === 0 ? 'M' : 'L') + n2(cx + Math.cos(a) * rad) + ' ' + n2(cy + Math.sin(a) * rad) + ' ';
    }
    return d + 'Z';
  }
  function pCircle(cx, cy, r) {
    return 'M ' + (cx - r) + ' ' + cy + ' a ' + r + ' ' + r + ' 0 1 0 ' + (r * 2) + ' 0 a ' + r + ' ' + r + ' 0 1 0 ' + (-r * 2) + ' 0 Z';
  }
  function pDrop(cx, cy, r) {
    return 'M ' + cx + ' ' + (cy - r * 1.3) +
      ' C ' + (cx + r * 0.85) + ' ' + (cy - r * 0.4) + ', ' + (cx + r) + ' ' + (cy + r * 0.42) + ', ' + cx + ' ' + (cy + r * 1.0) +
      ' C ' + (cx - r) + ' ' + (cy + r * 0.42) + ', ' + (cx - r * 0.85) + ' ' + (cy - r * 0.4) + ', ' + cx + ' ' + (cy - r * 1.3) + ' Z';
  }
  function pDiamond(cx, cy, r) {
    return 'M ' + cx + ' ' + (cy - r) +
      ' L ' + (cx + r * 0.82) + ' ' + (cy - r * 0.18) +
      ' L ' + (cx + r * 0.5) + ' ' + (cy + r) +
      ' L ' + (cx - r * 0.5) + ' ' + (cy + r) +
      ' L ' + (cx - r * 0.82) + ' ' + (cy - r * 0.18) + ' Z';
  }
  function pFlower(cx, cy, r, petals) {
    var inner = r * 0.44, step = Math.PI * 2 / petals, d = '';
    for (var i = 0; i < petals; i++) {
      var a1 = i * step - Math.PI / 2, a2 = a1 + step / 2, a3 = a1 + step;
      var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      var x2 = cx + Math.cos(a2) * inner, y2 = cy + Math.sin(a2) * inner;
      var x3 = cx + Math.cos(a3) * r, y3 = cy + Math.sin(a3) * r;
      if (i === 0) d += 'M ' + n2(x1) + ' ' + n2(y1);
      d += ' Q ' + n2(x2) + ' ' + n2(y2) + ' ' + n2(x3) + ' ' + n2(y3);
    }
    return d + 'Z';
  }
  function pRing(cx, cy, r) {
    return { d: pCircle(cx, cy, r) + ' ' + pCircle(cx, cy, r * 0.52), fillRule: 'evenodd' };
  }
  function pCandy(cx, cy, r) {
    return pCircle(cx, cy, r * 0.82) +
      ' M ' + (cx - r * 0.82) + ' ' + cy + ' L ' + (cx - r * 1.72) + ' ' + (cy - r * 0.58) + ' L ' + (cx - r * 1.72) + ' ' + (cy + r * 0.58) + ' Z' +
      ' M ' + (cx + r * 0.82) + ' ' + cy + ' L ' + (cx + r * 1.72) + ' ' + (cy - r * 0.58) + ' L ' + (cx + r * 1.72) + ' ' + (cy + r * 0.58) + ' Z';
  }
  function pLolli(cx, cy, r) {
    return pCircle(cx, cy - r * 0.22, r * 0.86) +
      ' M ' + (cx - r * 0.07) + ' ' + (cy + r * 0.6) + ' L ' + (cx + r * 0.07) + ' ' + (cy + r * 0.6) +
      ' L ' + (cx + r * 0.07) + ' ' + (cy + r * 1.5) + ' L ' + (cx - r * 0.07) + ' ' + (cy + r * 1.5) + ' Z';
  }
  function pBanana(cx, cy, r) {
    return 'M ' + (cx - r * 0.9) + ' ' + (cy - r * 0.4) +
      ' C ' + (cx - r * 0.5) + ' ' + (cy + r * 0.9) + ', ' + (cx + r * 0.7) + ' ' + (cy + r * 0.9) + ', ' + (cx + r * 0.95) + ' ' + (cy - r * 0.3) +
      ' L ' + (cx + r * 0.7) + ' ' + (cy - r * 0.4) +
      ' C ' + (cx + r * 0.5) + ' ' + (cy + r * 0.55) + ', ' + (cx - r * 0.3) + ' ' + (cy + r * 0.55) + ', ' + (cx - r * 0.62) + ' ' + (cy - r * 0.42) + ' Z';
  }
  function pGrape(cx, cy, r) {
    var d = '', grid = [[0,-1],[-0.7,-0.4],[0.7,-0.4],[-0.35,0.25],[0.35,0.25],[0,0.85],[0,-0.35],[0,0.25]];
    for (var i = 0; i < grid.length; i++) {
      d += pCircle(cx + grid[i][0] * r * 0.62, cy + grid[i][1] * r * 0.62, r * 0.42) + ' ';
    }
    return d.trim();
  }
  function pWatermelon(cx, cy, r) {
    return 'M ' + (cx - r) + ' ' + (cy - r * 0.3) +
      ' A ' + r + ' ' + r + ' 0 0 0 ' + (cx + r) + ' ' + (cy - r * 0.3) +
      ' L ' + (cx + r * 0.9) + ' ' + (cy - r * 0.15) +
      ' A ' + (r * 0.9) + ' ' + (r * 0.9) + ' 0 0 1 ' + (cx - r * 0.9) + ' ' + (cy - r * 0.15) + ' Z';
  }
  function pCherry(cx, cy, r) {
    return pCircle(cx - r * 0.5, cy + r * 0.35, r * 0.62) +
      ' ' + pCircle(cx + r * 0.5, cy + r * 0.35, r * 0.62) +
      ' M ' + (cx - r * 0.5) + ' ' + (cy - r * 0.2) +
      ' Q ' + (cx) + ' ' + (cy - r * 1.1) + ' ' + (cx + r * 0.5) + ' ' + (cy - r * 0.2);
  }

  var SHAPES = {
    heart:      pHeart,
    star5:      function (x, y, r) { return pStar(x, y, r, 5, 0.44); },
    star6:      function (x, y, r) { return pStar(x, y, r, 6, 0.5);  },
    circle:     pCircle,
    drop:       pDrop,
    diamond:    pDiamond,
    flower:     function (x, y, r) { return pFlower(x, y, r, 6); },
    flower4:    function (x, y, r) { return pFlower(x, y, r, 4); },
    ring:       pRing,
    candy:      pCandy,
    lollipop:   pLolli,
    banana:     pBanana,
    grape:      pGrape,
    watermelon: pWatermelon,
    cherry:     pCherry
  };

  /* ── Symbol Definition · 12 种 ── */
  var SYMBOLS = [
    { id: 'heart',      name: '红心糖',   shape: 'heart',      m8: '×0.5', m10: '×1',   m12: '×5',    theme: { main: '#ff3d7f', dark: '#7a0d34', light: '#ffc2d7' } },
    { id: 'star',       name: '星星糖',   shape: 'star5',      m8: '×0.4', m10: '×0.8', m12: '×4',    theme: { main: '#ffb300', dark: '#7a4d00', light: '#ffe79a' } },
    { id: 'diamond',    name: '钻石糖',   shape: 'diamond',    m8: '×0.3', m10: '×0.7', m12: '×3',    theme: { main: '#7c5cff', dark: '#2a1a85', light: '#d3c8ff' } },
    { id: 'drop',       name: '水滴糖',   shape: 'drop',       m8: '×0.25',m10: '×0.6', m12: '×2.5',  theme: { main: '#22c55e', dark: '#0a4d22', light: '#b3f0c6' } },
    { id: 'flower',     name: '花朵糖',   shape: 'flower',     m8: '×0.2', m10: '×0.5', m12: '×2',    theme: { main: '#ff7a00', dark: '#7a3700', light: '#ffd0a3' } },
    { id: 'banana',     name: '香蕉',     shape: 'banana',     m8: '×0.2', m10: '×0.5', m12: '×2',    theme: { main: '#facc15', dark: '#7a5c00', light: '#fef3a0' } },
    { id: 'grape',      name: '葡萄',     shape: 'grape',      m8: '×0.2', m10: '×0.5', m12: '×2',    theme: { main: '#a855f7', dark: '#4c1d95', light: '#e2ccff' } },
    { id: 'watermelon', name: '西瓜',     shape: 'watermelon', m8: '×0.2', m10: '×0.4', m12: '×1.5',  theme: { main: '#ef4444', dark: '#7a0d0d', light: '#ffc7c7' } },
    { id: 'cherry',     name: '樱桃',     shape: 'cherry',     m8: '×0.15',m10: '×0.4', m12: '×1.5',  theme: { main: '#dc2626', dark: '#7a0d0d', light: '#ffb3b3' } },
    { id: 'circle',     name: '圆糖',     shape: 'circle',     m8: '×0.1', m10: '×0.3', m12: '×1',    theme: { main: '#06b6d4', dark: '#074a5c', light: '#b3ecf5' } },
    { id: 'ring',       name: '甜甜圈',   shape: 'ring',       m8: '×0.1', m10: '×0.25',m12: '×0.8',  theme: { main: '#f43f5e', dark: '#7a0a20', light: '#ffc7d1' } },
    { id: 'lolli',      name: '棒棒糖',   shape: 'lollipop',   m8: '×0',   m10: '×0',   m12: 'SCATTER', theme: { main: '#fb7185', dark: '#7a0f28', light: '#ffd9df' } }
  ];

  /* ══════════════════════════════════════════════════════════
     SVG Generator · 多层立体
     主体渐变 + clip 高光 + 径向反光 + 顶部弧光 + 描边 + 装饰斑点 + 边缘光
     ══════════════════════════════════════════════════════════ */
  function buildSymbolArt(spec, size) {
    var uid = spec.id + '_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', { width: size, height: size });
    var defs = svg('defs');

    /* 主体线性渐变（暗→亮→暗，模拟球面） */
    var gBody = svg('linearGradient', { id: 'gb_' + uid, x1: '0.3', y1: '0', x2: '0.7', y2: '1' });
    gBody.appendChild(svg('stop', { offset: '0',    'stop-color': t.light }));
    gBody.appendChild(svg('stop', { offset: '0.32', 'stop-color': t.main  }));
    gBody.appendChild(svg('stop', { offset: '0.72', 'stop-color': t.main  }));
    gBody.appendChild(svg('stop', { offset: '1',    'stop-color': t.dark  }));
    defs.appendChild(gBody);

    /* 顶部高光径向 */
    var gTop = svg('radialGradient', { id: 'gt_' + uid, cx: '0.32', cy: '0.22', r: '0.6' });
    gTop.appendChild(svg('stop', { offset: '0',   'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    gTop.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#ffffff', 'stop-opacity': '0.25' }));
    gTop.appendChild(svg('stop', { offset: '1',   'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gTop);

    /* 底部反射光（模拟环境光） */
    var gBot = svg('radialGradient', { id: 'gbo_' + uid, cx: '0.7', cy: '0.85', r: '0.5' });
    gBot.appendChild(svg('stop', { offset: '0', 'stop-color': t.light, 'stop-opacity': '0.55' }));
    gBot.appendChild(svg('stop', { offset: '1', 'stop-color': t.light, 'stop-opacity': '0' }));
    defs.appendChild(gBot);

    /* 外阴影 filter */
    var fShadow = svg('filter', { id: 'fs_' + uid, x: '-40%', y: '-35%', width: '180%', height: '180%' });
    fShadow.appendChild(svg('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '1.8', result: 'b1' }));
    fShadow.appendChild(svg('feOffset', { in: 'b1', dx: '0', dy: '2.4', result: 'b2' }));
    fShadow.appendChild(svg('feComponentTransfer', { in: 'b2', result: 'b3' }));
    var merge = svg('feMerge');
    merge.appendChild(svg('feMergeNode', { in: 'b3' }));
    merge.appendChild(svg('feMergeNode', { in: 'SourceGraphic' }));
    fShadow.appendChild(merge);
    defs.appendChild(fShadow);

    /* clipPath 用于高光裁剪 */
    var clip = svg('clipPath', { id: 'cl_' + uid });
    var cp = svg('path', { d: '' });
    clip.appendChild(cp);
    defs.appendChild(clip);

    root.appendChild(defs);

    var cx = 50, cy = 50, r = 30;
    var sd = SHAPES[spec.shape](cx, cy, r);
    var d = (typeof sd === 'string') ? sd : sd.d;
    var fillRule = (typeof sd === 'object' && sd.fillRule) || 'nonzero';
    cp.setAttribute('d', d);
    if (fillRule === 'evenodd') cp.setAttribute('clip-rule', 'evenodd');

    /* ① 主体渐变 + 外阴影 */
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'url(#gb_' + uid + ')',
      filter: 'url(#fs_' + uid + ')'
    }));

    /* ② clip 内的高光层 */
    var gClip = svg('g', { 'clip-path': 'url(#cl_' + uid + ')' });
    gClip.appendChild(svg('rect', { x: '0', y: '0', width: '100', height: '100', fill: 'url(#gt_' + uid + ')' }));
    gClip.appendChild(svg('rect', { x: '0', y: '0', width: '100', height: '100', fill: 'url(#gbo_' + uid + ')' }));
    root.appendChild(gClip);

    /* ③ 顶部弧形反射光带 */
    var arch = svg('path', {
      d: 'M ' + (cx - r * 0.62) + ' ' + (cy - r * 0.55) +
         ' Q ' + cx + ' ' + (cy - r * 1.15) + ' ' + (cx + r * 0.62) + ' ' + (cy - r * 0.55),
      fill: 'none', stroke: '#ffffff', 'stroke-width': '3.2',
      'stroke-linecap': 'round', opacity: '0.55',
      'clip-path': 'url(#cl_' + uid + ')'
    });
    root.appendChild(arch);

    /* ④ 底部反光弧 */
    var arch2 = svg('path', {
      d: 'M ' + (cx - r * 0.5) + ' ' + (cy + r * 0.75) +
         ' Q ' + cx + ' ' + (cy + r * 1.05) + ' ' + (cx + r * 0.5) + ' ' + (cy + r * 0.75),
      fill: 'none', stroke: t.light, 'stroke-width': '2.6',
      'stroke-linecap': 'round', opacity: '0.7',
      'clip-path': 'url(#cl_' + uid + ')'
    });
    root.appendChild(arch2);

    /* ⑤ 主体描边（内侧亮线 + 外侧暗线） */
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule, fill: 'none',
      stroke: t.dark, 'stroke-width': '1.8', 'stroke-linejoin': 'round', opacity: '0.55'
    }));
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule, fill: 'none',
      stroke: '#ffffff', 'stroke-width': '0.9', 'stroke-linejoin': 'round',
      opacity: '0.55', transform: 'translate(0 -0.4)'
    }));

    /* ⑥ 装饰斑点（稳定伪随机） */
    var cnt = 2 + Math.floor(seeded(spec.id.length + 5) * 3);
    for (var i = 0; i < cnt; i++) {
      var s1 = seeded(i * 7 + spec.id.length);
      var s2 = seeded(i * 13 + spec.id.charCodeAt(0));
      var sx = cx + (s1 - 0.5) * r * 1.05;
      var sy = cy + (s2 - 0.5) * r * 0.85 - r * 0.15;
      var sr = 1.2 + s1 * 1.1;
      root.appendChild(svg('ellipse', {
        cx: n2(sx), cy: n2(sy),
        rx: n2(sr), ry: n2(sr * 0.62),
        fill: '#ffffff', opacity: n2(0.5 + s2 * 0.35),
        'clip-path': 'url(#cl_' + uid + ')'
      }));
    }

    /* ⑦ 形状专属装饰 */
    if (spec.shape === 'ring') {
      root.appendChild(svg('path', {
        d: 'M ' + (cx - r * 0.7) + ' ' + (cy - r * 0.4) +
           ' Q ' + cx + ' ' + (cy - r * 0.85) + ' ' + (cx + r * 0.7) + ' ' + (cy - r * 0.4),
        fill: 'none', stroke: '#ffffff', 'stroke-width': '2.2',
        'stroke-linecap': 'round', opacity: '0.75'
      }));
    }
    if (spec.shape === 'candy') {
      var gSparkle = svg('g', { opacity: '0.75' });
      gSparkle.appendChild(svg('path', {
        d: 'M ' + (cx - r * 1.4) + ' ' + (cy - r * 0.42) + ' l 0.9 0 l 0 -0.9 l 0.9 0 l 0 0.9 l 0.9 0 l 0 0.9 l -0.9 0 l 0 0.9 l -0.9 0 l 0 -0.9 l -0.9 0 Z',
        fill: '#ffffff', opacity: '0.85'
      }));
      root.appendChild(gSparkle);
    }
    if (spec.shape === 'lollipop') {
      for (var j = 1; j <= 3; j++) {
        root.appendChild(svg('path', {
          d: 'M ' + (cx - r * 0.7) + ' ' + (cy - r * 0.22) +
             ' Q ' + cx + ' ' + (cy - r * 0.22 - j * 3) + ' ' + (cx + r * 0.7) + ' ' + (cy - r * 0.22),
          fill: 'none', stroke: '#ffffff', 'stroke-width': '1.6',
          'stroke-linecap': 'round', opacity: n2(0.7 - j * 0.15)
        }));
      }
    }
    if (spec.shape === 'grape') {
      for (var k = 0; k < 4; k++) {
        var a = -Math.PI * 0.5 + k * 0.7;
        root.appendChild(svg('circle', {
          cx: n2(cx + Math.cos(a) * r * 0.15), cy: n2(cy + Math.sin(a) * r * 0.15 - r * 0.28),
          r: '1.1', fill: '#ffffff', opacity: '0.75'
        }));
      }
    }
    return root;
  }

  /* ── 页面数据 ── */
  var FAQ = [
    { q: '糖果连连爆的赔付方式是什么？', a: '采用「任意位置赔付」（Scatter Pays），同一种符号在网格任意位置出现 8 个及以上即触发赔付，与行列连线无关。' },
    { q: '如何触发免费旋转？',           a: '单局中同时出现 4 个及以上棒棒糖 Scatter 符号，即可获得 10 次免费旋转；出现 5 个或 6 个可获得更多次数。' },
    { q: '免费旋转中的倍数如何累加？',   a: '免费旋转期间若出现糖果炸弹，其倍数会被收集并累加至本轮最终赔付，单个炸弹倍数范围 ×2 ~ ×100。' },
    { q: '最大可以赢多少倍？',           a: '在最优触发条件下，理论最大赔付倍数为 ×21,100。' },
    { q: '下注档位有哪些？',             a: '0.20 ~ 100.00 共 12 档，可在底部操作栏调整。' },
    { q: '免费试玩与正式游戏有区别吗？', a: '免费试玩使用虚拟余额，游戏逻辑、赔率与正式游戏一致，可用于熟悉规则。' }
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

  /* ── 占位图：灰白图片图标 ── */
  function buildPlaceholder(item) {
    var ph = document.createElement('div');
    ph.className = 'sd-carousel__ph';

    var icon = document.createElement('div');
    icon.className = 'sd-carousel__ph-icon';
    var ic = svgRoot('0 0 48 48', { width: 72, height: 72 });
    ic.appendChild(svg('rect', { x: '4', y: '8', width: '40', height: '32', rx: '3', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }));
    ic.appendChild(svg('circle', { cx: '15', cy: '19', r: '3', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }));
    ic.appendChild(svg('path', { d: 'M 6 34 L 18 22 L 28 32 L 34 26 L 42 34', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    icon.appendChild(ic);
    ph.appendChild(icon);

    var lbl = document.createElement('div');
    lbl.className = 'sd-carousel__ph-label';
    lbl.textContent = '游戏画面';
    ph.appendChild(lbl);
    return ph;
  }

  /* ── 轮播 ── */
  function renderCarousel() {
    var track = document.getElementById('sd-carousel-track');
    var dots  = document.getElementById('sd-carousel-dots');
    if (!track || !dots) return;
    track.innerHTML = ''; dots.innerHTML = '';

    var N = 3;
    for (var i = 0; i < N; i++) {
      var slide = document.createElement('div');
      slide.className = 'sd-carousel__slide';
      slide.setAttribute('data-index', String(i));
      slide.appendChild(buildPlaceholder(null));
      track.appendChild(slide);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'sd-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      (function (idx) {
        dot.addEventListener('click', function () { scrollToSlide(idx); });
      })(i);
      dots.appendChild(dot);
    }
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
          var rr = slides[i].getBoundingClientRect();
          var dd = Math.abs((rr.left + rr.width / 2) - vCenter);
          if (dd < bestDist) { bestDist = dd; best = i; }
        }
        var allDots = dots.querySelectorAll('.sd-carousel__dot');
        for (var j = 0; j < allDots.length; j++) allDots[j].classList.toggle('is-active', j === best);
      });
    }, { passive: true });
  }

  /* ── 符号倍率表 ── */
  function renderSymbols() {
    var tbody = document.getElementById('sd-symbols');
    if (!tbody) return;
    tbody.innerHTML = '';

    SYMBOLS.forEach(function (spec) {
      var tr = document.createElement('tr');

      var td1 = document.createElement('td');
      var cell = document.createElement('div');
      cell.className = 'sd-sym-cell';
      var art = document.createElement('div');
      art.className = 'sd-sym-cell__art';
      art.appendChild(buildSymbolArt(spec, 34));
      cell.appendChild(art);
      var nm = document.createElement('span');
      nm.className = 'sd-sym-cell__name';
      nm.textContent = spec.name;
      cell.appendChild(nm);
      td1.appendChild(cell);
      tr.appendChild(td1);

      var isScatter = (spec.m12 === 'SCATTER');
      [spec.m8, spec.m10, spec.m12].forEach(function (v) {
        var td = document.createElement('td');
        var span = document.createElement('span');
        span.className = 'sd-mult' + (isScatter ? ' sd-mult--scatter' : '');
        span.textContent = v;
        td.appendChild(span);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
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
          navigator.share({ title: '糖果连连爆 Sweet Bonanza · Apex', text: '来看看这款高波动糖果老虎机', url: url }).catch(function () {});
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

  /* ── 底部操作栏 ── */
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
