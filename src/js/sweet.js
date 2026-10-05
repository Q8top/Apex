/* Sweet Bonanza V3 · 果冻糖果程序化 SVG · 无框架 / 无 eval / 无 Math.random */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function svg(t, a) { var e = document.createElementNS(NS, t); if (a) for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k) && a[k] != null) e.setAttribute(k, String(a[k])); return e; }
  function svgRoot(vb, x) { var a = { viewBox: vb, xmlns: NS, 'aria-hidden': 'true', focusable: 'false' }; if (x) for (var k in x) a[k] = x[k]; return svg('svg', a); }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function seeded(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function n2(v) { return Number(v).toFixed(2); }

  /* ── 形状库（心 / 星 / 钻石 / 水滴 / 花朵 / 甜甜圈 / 圆 / 棒棒糖 / 香蕉 / 葡萄 / 西瓜 / 樱桃 / 彩虹糖） ── */
  function pHeart(cx, cy, s) {
    return 'M ' + cx + ' ' + (cy + s * 0.78) +
      ' C ' + (cx - s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + (cx - s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + cx + ' ' + (cy - s * 0.36) +
      ' C ' + (cx + s * 0.88) + ' ' + (cy - s * 1.08) + ', ' + (cx + s * 1.45) + ' ' + (cy - s * 0.12) + ', ' + cx + ' ' + (cy + s * 0.78) + ' Z';
  }
  function pStar(cx, cy, r, pts, ir) {
    var inner = r * (ir || 0.44), step = Math.PI / pts, d = '';
    for (var i = 0; i < pts * 2; i++) {
      var rad = (i % 2 === 0) ? r : inner, a = -Math.PI / 2 + i * step;
      d += (i === 0 ? 'M' : 'L') + n2(cx + Math.cos(a) * rad) + ' ' + n2(cy + Math.sin(a) * rad) + ' ';
    }
    return d + 'Z';
  }
  function pCircle(cx, cy, r) { return 'M ' + (cx - r) + ' ' + cy + ' a ' + r + ' ' + r + ' 0 1 0 ' + (r * 2) + ' 0 a ' + r + ' ' + r + ' 0 1 0 ' + (-r * 2) + ' 0 Z'; }
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
    return { d: pCircle(cx, cy, r) + ' ' + pCircle(cx, cy, r * 0.42), fillRule: 'evenodd' };
  }
  function pLolli(cx, cy, r) {
    return pCircle(cx, cy - r * 0.22, r * 0.86) +
      ' M ' + (cx - r * 0.07) + ' ' + (cy + r * 0.6) + ' L ' + (cx + r * 0.07) + ' ' + (cy + r * 0.6) +
      ' L ' + (cx + r * 0.07) + ' ' + (cy + r * 1.5) + ' L ' + (cx - r * 0.07) + ' ' + (cy + r * 1.5) + ' Z';
  }
  function pBanana(cx, cy, r) {
    return 'M ' + n2(cx + r * 0.73) + ' ' + n2(cy - r * 0.73) +
      ' C ' + n2(cx + r * 1.07) + ' ' + n2(cy + r * 0.00) + ', ' + n2(cx + r * 0.67) + ' ' + n2(cy + r * 1.00) + ', ' + n2(cx - r * 0.33) + ' ' + n2(cy + r * 1.17) +
      ' C ' + n2(cx - r * 0.73) + ' ' + n2(cy + r * 1.23) + ', ' + n2(cx - r * 0.93) + ' ' + n2(cy + r * 1.00) + ', ' + n2(cx - r * 0.83) + ' ' + n2(cy + r * 0.80) +
      ' C ' + n2(cx - r * 0.67) + ' ' + n2(cy + r * 0.73) + ', ' + n2(cx - r * 0.40) + ' ' + n2(cy + r * 0.80) + ', ' + n2(cx - r * 0.17) + ' ' + n2(cy + r * 0.87) +
      ' C ' + n2(cx + r * 0.27) + ' ' + n2(cy + r * 0.60) + ', ' + n2(cx + r * 0.50) + ' ' + n2(cy + r * 0.07) + ', ' + n2(cx + r * 0.43) + ' ' + n2(cy - r * 0.40) +
      ' C ' + n2(cx + r * 0.40) + ' ' + n2(cy - r * 0.60) + ', ' + n2(cx + r * 0.53) + ' ' + n2(cy - r * 0.73) + ', ' + n2(cx + r * 0.73) + ' ' + n2(cy - r * 0.73) +
      ' Z';
  }
  function pGrape(cx, cy, r) {
    /* 8 颗球，倒三角排列（像真葡萄串）*/
    var grid = [
      [-0.55, -0.45], [0.0, -0.55], [0.55, -0.45],
      [-0.30, 0.05], [0.30, 0.05],
      [-0.15, 0.55], [0.15, 0.55],
      [0.0, 0.95]
    ];
    var d = '', sparks = [];
    for (var i = 0; i < grid.length; i++) {
      var gx = cx + grid[i][0] * r * 0.62;
      var gy = cy + grid[i][1] * r * 0.62;
      var gr = r * 0.36;
      d += pCircle(gx, gy, gr) + ' ';
      /* 每颗球：左上大高光 + 右下小反光 */
      sparks.push({ cx: gx - gr * 0.38, cy: gy - gr * 0.42, r: gr * 0.32, opacity: 0.88 });
      sparks.push({ cx: gx + gr * 0.44, cy: gy + gr * 0.42, r: gr * 0.14, opacity: 0.40 });
    }
    return { d: d.trim(), sparks: sparks };
  }
  function pWatermelon(cx, cy, r) {
    /* 外层绿皮（较大的楔形） */
    return 'M ' + n2(cx - r * 0.95) + ' ' + n2(cy - r * 0.30) +
      ' Q ' + n2(cx) + ' ' + n2(cy - r * 1.15) + ' ' + n2(cx + r * 0.95) + ' ' + n2(cy - r * 0.30) +
      ' Q ' + n2(cx + r * 0.42) + ' ' + n2(cy + r * 0.42) + ' ' + n2(cx) + ' ' + n2(cy + r * 0.95) +
      ' Q ' + n2(cx - r * 0.42) + ' ' + n2(cy + r * 0.42) + ' ' + n2(cx - r * 0.95) + ' ' + n2(cy - r * 0.30) +
      ' Z';
  }
  function pCherry(cx, cy, r) {
    return pCircle(cx - r * 0.5, cy + r * 0.35, r * 0.62) +
      ' ' + pCircle(cx + r * 0.5, cy + r * 0.35, r * 0.62) +
      ' M ' + (cx - r * 0.5) + ' ' + (cy - r * 0.2) +
      ' Q ' + (cx) + ' ' + (cy - r * 1.1) + ' ' + (cx + r * 0.5) + ' ' + (cy - r * 0.2);
  }
  function pWild(cx, cy, r) {
    return pCircle(cx, cy, r);
  }

  var SHAPES = {
    heart: pHeart,
    star5: function (x, y, r) { return pStar(x, y, r, 5, 0.44); },
    star6: function (x, y, r) { return pStar(x, y, r, 6, 0.5); },
    circle: pCircle,
    drop: pDrop,
    diamond: pDiamond,
    flower: function (x, y, r) { return pFlower(x, y, r, 6); },
    ring: pRing,
    lollipop: pLolli,
    banana: pBanana,
    grape: pGrape,
    watermelon: pWatermelon,
    cherry: pCherry,
    wild: pWild
  };

  /* ── Symbol Definition · 13 种（12 基础 + 1 Wild） ── */
  var SYMBOLS = [
    { id: 'banana',     name: '香蕉',   type: 'base',    shape: 'banana',     m8: '×0.2',  m10: '×0.5',  m12: '×2',      theme: { main: '#facc15', dark: '#7a5c00', light: '#fef3a0', accent: '#ff9b00' } },
    { id: 'grape',      name: '葡萄',   type: 'base',    shape: 'grape',      m8: '×0.2',  m10: '×0.5',  m12: '×2',      theme: { main: '#a855f7', dark: '#4c1d95', light: '#e2ccff', accent: '#7c5cff' } },
    { id: 'watermelon', name: '西瓜',   type: 'base',    shape: 'watermelon', m8: '×0.2',  m10: '×0.4',  m12: '×1.5',    theme: { main: '#22c55e', dark: '#14532d', light: '#bbf7d0', accent: '#ef4444' } },
    { id: 'cherry',     name: '樱桃',   type: 'base',    shape: 'cherry',     m8: '×0.15', m10: '×0.4',  m12: '×1.5',    theme: { main: '#dc2626', dark: '#7a0d0d', light: '#ffb3b3', accent: '#22c55e' } },
    { id: 'circle',     name: '圆糖',   type: 'base',    shape: 'circle',     m8: '×0.1',  m10: '×0.3',  m12: '×1',      theme: { main: '#06b6d4', dark: '#074a5c', light: '#b3ecf5', accent: '#0284c7' } },
    { id: 'ring',       name: '甜甜圈', type: 'base',    shape: 'ring',       m8: '×0.1',  m10: '×0.25', m12: '×0.8',    theme: { main: '#f43f5e', dark: '#7a0a20', light: '#ffc7d1', accent: '#fb923c' } },
    { id: 'flower',     name: '花朵糖', type: 'high',    shape: 'flower',     m8: '×0.2',  m10: '×0.5',  m12: '×2',      theme: { main: '#ff7a00', dark: '#7a3700', light: '#ffd0a3', accent: '#ffb300' } },
    { id: 'drop',       name: '水滴糖', type: 'high',    shape: 'drop',       m8: '×0.25', m10: '×0.6',  m12: '×2.5',    theme: { main: '#22c55e', dark: '#0a4d22', light: '#b3f0c6', accent: '#06b6d4' } },
    { id: 'diamond',    name: '钻石糖', type: 'high',    shape: 'diamond',    m8: '×0.3',  m10: '×0.7',  m12: '×3',      theme: { main: '#7c5cff', dark: '#2a1a85', light: '#d3c8ff', accent: '#06b6d4' } },
    { id: 'star',       name: '星星糖', type: 'high',    shape: 'star5',      m8: '×0.4',  m10: '×0.8',  m12: '×4',      theme: { main: '#ffb300', dark: '#7a4d00', light: '#ffe79a', accent: '#ff3d7f' } },
    { id: 'heart',      name: '红心糖', type: 'high',    shape: 'heart',      m8: '×0.5',  m10: '×1',    m12: '×5',      theme: { main: '#ff3d7f', dark: '#7a0d34', light: '#ffc2d7', accent: '#ffb300' } },
    { id: 'lolli',      name: '棒棒糖', type: 'scatter', shape: 'lollipop',   m8: '—',     m10: '—',     m12: 'SCATTER', theme: { main: '#fb7185', dark: '#7a0f28', light: '#ffd9df', accent: '#facc15' } },
    { id: 'wild',       name: '彩虹糖', type: 'wild',    shape: 'wild',       m8: '—',     m10: '—',     m12: 'WILD',    theme: { main: '#ec4899', dark: '#4c1d95', light: '#fcd0e6', accent: '#06b6d4' } }
  ];

  /* ══════════════════════════════════════════════════════════
     SVG Generator · 4 层结构（阴影 / 主体 / 渐变高光 / 描边装饰）
     统一 viewBox 0 0 100 100 · 果冻糖果质感
     ══════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════
     专用渲染器 · 每个符号 6 层结构
     阴影 → 主体 → 内侧暗面 → 主高光 → 反光 → 装饰
     ══════════════════════════════════════════════════════ */

  /* ─── 香蕉：细长弯月 + 蒂尾 + 主反光 ─── */
  function renderBanana(spec, size) {
    var t = spec.theme;
    var uid = 'ban_' + hash(t.main);
    var root = svgRoot('0 0 100 100', { width: size, height: size, 'class': 'sd-sym-art sd-sym-art--banana' });
    var defs = svg('defs');

    var gBody = svg('linearGradient', { id: 'bgb_' + uid, x1: '0.2', y1: '0.1', x2: '0.7', y2: '1' });
    gBody.appendChild(svg('stop', { offset: '0', 'stop-color': '#fff5b0' }));
    gBody.appendChild(svg('stop', { offset: '0.35', 'stop-color': '#fbbf24' }));
    gBody.appendChild(svg('stop', { offset: '0.75', 'stop-color': '#eab308' }));
    gBody.appendChild(svg('stop', { offset: '1', 'stop-color': '#854d0e' }));
    defs.appendChild(gBody);

    var gSkin = svg('linearGradient', { id: 'bgs_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gSkin.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.7' }));
    gSkin.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gSkin);

    var cpId = 'bcp_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: '' });
    clip.appendChild(cp);
    defs.appendChild(clip);
    root.appendChild(defs);

    var cx = 50, cy = 50, r = 30;
    /* 香蕉本体：emoji 🍌 斜弯月（柄右上 → 尾左下，凸面向右下） */
    var d = 'M ' + n2(cx + r * 0.83) + ' ' + n2(cy - r * 1.13) +
      /* 外弧：从柄端沿右下凸出到尾部 */
      ' C ' + n2(cx + r * 1.20) + ' ' + n2(cy - r * 0.75) + ', ' + n2(cx + r * 1.38) + ' ' + n2(cy + r * 0.05) + ', ' + n2(cx + r * 0.78) + ' ' + n2(cy + r * 0.65) +
      ' C ' + n2(cx + r * 0.28) + ' ' + n2(cy + r * 1.22) + ', ' + n2(cx - r * 0.72) + ' ' + n2(cy + r * 1.32) + ', ' + n2(cx - r * 1.17) + ' ' + n2(cy + r * 0.80) +
      /* 内弧：从尾部沿左上凹回收 */
      ' C ' + n2(cx - r * 0.85) + ' ' + n2(cy + r * 0.90) + ', ' + n2(cx - r * 0.18) + ' ' + n2(cy + r * 0.82) + ', ' + n2(cx + r * 0.28) + ' ' + n2(cy + r * 0.35) +
      ' C ' + n2(cx + r * 0.72) + ' ' + n2(cy - r * 0.12) + ', ' + n2(cx + r * 0.92) + ' ' + n2(cy - r * 0.65) + ', ' + n2(cx + r * 0.83) + ' ' + n2(cy - r * 1.13) + ' Z';
    cp.setAttribute('d', d);

    /* ① 底部阴影 */
    root.appendChild(svg('ellipse', {
      cx: n2(cx + r * 0.05), cy: n2(cy + r * 1.35),
      rx: n2(r * 0.75), ry: n2(r * 0.10),
      fill: '#78350f', opacity: '0.22'
    }));
    /* ② 主体 */
    root.appendChild(svg('path', { d: d, fill: 'url(#bgb_' + uid + ')' }));
    /* ③ 内亮线（顶部反射） */
    root.appendChild(svg('path', {
      d: d, fill: 'none', stroke: '#ffffff', 'stroke-width': '2.4', 'stroke-linejoin': 'round',
      transform: 'translate(0 -0.6)', opacity: '0.7',
      'clip-path': 'url(#' + cpId + ')'
    }));
    /* ④ 主高光（沿外弧偏内） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.72) + ' ' + n2(cy + r * 1.02) +
         ' Q ' + n2(cx + r * 0.30) + ' ' + n2(cy + r * 1.18) + ' ' + n2(cx + r * 0.85) + ' ' + n2(cy + r * 0.30),
      fill: 'none', stroke: '#ffffff', 'stroke-width': '3.2', 'stroke-linecap': 'round',
      opacity: '0.82', 'clip-path': 'url(#' + cpId + ')'
    }));
    /* ⑤ 反光（下部） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.55) + ' ' + n2(cy + r * 1.05) +
         ' Q ' + n2(cx) + ' ' + n2(cy + r * 1.25) + ' ' + n2(cx + r * 0.55) + ' ' + n2(cy + r * 1.0),
      fill: 'none', stroke: '#fef3c7', 'stroke-width': '2.0', 'stroke-linecap': 'round',
      opacity: '0.65', 'clip-path': 'url(#' + cpId + ')'
    }));
    /* ⑥ 两端蒂部暗色 */
    root.appendChild(svg('ellipse', {
      cx: n2(cx + r * 0.82), cy: n2(cy - r * 1.10),
      rx: n2(r * 0.14), ry: n2(r * 0.10),
      fill: '#4a2206', opacity: '0.9',
      transform: 'rotate(-40 ' + n2(cx + r * 0.82) + ' ' + n2(cy - r * 1.10) + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));
    root.appendChild(svg('ellipse', {
      cx: n2(cx - r * 1.13), cy: n2(cy + r * 0.80),
      rx: n2(r * 0.12), ry: n2(r * 0.09),
      fill: '#4a2206', opacity: '0.75',
      transform: 'rotate(30 ' + n2(cx - r * 1.13) + ' ' + n2(cy + r * 0.80) + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));
    return root;
  }

  /* ─── 葡萄：8 颗球 × (径向渐变 + 描边 + 高光) + 梗叶 ─── */
  function renderGrape(spec, size) {
    var t = spec.theme;
    var uid = 'grp_' + hash(t.main);
    var root = svgRoot('0 0 100 100', { width: size, height: size, 'class': 'sd-sym-art sd-sym-art--grape' });
    var defs = svg('defs');

    /* 每颗球的径向渐变（左上光源） */
    var gBall = svg('radialGradient', { id: 'grb_' + uid, cx: '0.35', cy: '0.30', r: '0.75' });
    gBall.appendChild(svg('stop', { offset: '0', 'stop-color': '#f3e8ff' }));
    gBall.appendChild(svg('stop', { offset: '0.35', 'stop-color': '#a855f7' }));
    gBall.appendChild(svg('stop', { offset: '0.8', 'stop-color': '#7c3aed' }));
    gBall.appendChild(svg('stop', { offset: '1', 'stop-color': '#4c1d95' }));
    defs.appendChild(gBall);

    var gLeaf = svg('linearGradient', { id: 'grl_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gLeaf.appendChild(svg('stop', { offset: '0', 'stop-color': '#4ade80' }));
    gLeaf.appendChild(svg('stop', { offset: '1', 'stop-color': '#15803d' }));
    defs.appendChild(gLeaf);
    root.appendChild(defs);

    var cx = 50, cy = 50, r = 30;
    var grid = [
      [-0.55, -0.42], [0.0, -0.52], [0.55, -0.42],
      [-0.30, 0.06], [0.30, 0.06],
      [-0.15, 0.55], [0.15, 0.55],
      [0.0, 0.98]
    ];
    var gr = r * 0.34;

    /* ① 底部阴影 */
    root.appendChild(svg('ellipse', {
      cx: n2(cx), cy: n2(cy + r * 1.28),
      rx: n2(r * 0.72), ry: n2(r * 0.10),
      fill: '#3b0764', opacity: '0.25'
    }));

    /* ② 叶子（后层，在球体后面） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.92) +
         ' Q ' + n2(cx - r * 0.7) + ' ' + n2(cy - r * 1.35) + ' ' + n2(cx - r * 1.0) + ' ' + n2(cy - r * 0.85) +
         ' Q ' + n2(cx - r * 0.55) + ' ' + n2(cy - r * 0.72) + ' ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.92) + ' Z',
      fill: 'url(#grl_' + uid + ')', stroke: '#14532d', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx + r * 0.04) + ' ' + n2(cy - r * 0.92) +
         ' Q ' + n2(cx + r * 0.65) + ' ' + n2(cy - r * 1.3) + ' ' + n2(cx + r * 0.98) + ' ' + n2(cy - r * 0.82) +
         ' Q ' + n2(cx + r * 0.55) + ' ' + n2(cy - r * 0.7) + ' ' + n2(cx + r * 0.04) + ' ' + n2(cy - r * 0.92) + ' Z',
      fill: 'url(#grl_' + uid + ')', stroke: '#14532d', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));

    /* ③ 8 颗葡萄球 */
    for (var i = 0; i < grid.length; i++) {
      var gx = cx + grid[i][0] * r * 0.62;
      var gy = cy + grid[i][1] * r * 0.62 + r * 0.06;
      root.appendChild(svg('circle', {
        cx: n2(gx), cy: n2(gy), r: n2(gr),
        fill: 'url(#grb_' + uid + ')',
        stroke: '#4c1d95', 'stroke-width': '0.9', 'stroke-opacity': '0.7'
      }));
      /* 每颗球：左上大高光 */
      root.appendChild(svg('ellipse', {
        cx: n2(gx - gr * 0.34), cy: n2(gy - gr * 0.40),
        rx: n2(gr * 0.34), ry: n2(gr * 0.24),
        fill: '#ffffff', opacity: '0.75',
        transform: 'rotate(-30 ' + n2(gx - gr * 0.34) + ' ' + n2(gy - gr * 0.40) + ')'
      }));
      /* 每颗球：右下小反光 */
      root.appendChild(svg('ellipse', {
        cx: n2(gx + gr * 0.42), cy: n2(gy + gr * 0.48),
        rx: n2(gr * 0.16), ry: n2(gr * 0.10),
        fill: '#ffffff', opacity: '0.35'
      }));
    }

    /* ④ 顶部紫色梗（在球体之上） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.05) + ' ' + n2(cy - r * 0.65) +
         ' Q ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.95) + ' ' + n2(cx + r * 0.02) + ' ' + n2(cy - r * 1.15) +
         ' L ' + n2(cx + r * 0.10) + ' ' + n2(cy - r * 1.12) +
         ' Q ' + n2(cx + r * 0.08) + ' ' + n2(cy - r * 0.92) + ' ' + n2(cx + r * 0.04) + ' ' + n2(cy - r * 0.62) + ' Z',
      fill: '#5b21b6', stroke: '#2e1065', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));

    return root;
  }

  /* ─── 西瓜：绿皮 + 浅绿内圈 + 红瓤 + 纤维 + 5 籽 ─── */
  function renderWatermelon(spec, size) {
    var t = spec.theme;
    var uid = 'wml_' + hash(t.main);
    var root = svgRoot('0 0 100 100', { width: size, height: size, 'class': 'sd-sym-art sd-sym-art--watermelon' });
    var defs = svg('defs');

    var gRind = svg('linearGradient', { id: 'wmr_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gRind.appendChild(svg('stop', { offset: '0', 'stop-color': '#22c55e' }));
    gRind.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#15803d' }));
    gRind.appendChild(svg('stop', { offset: '1', 'stop-color': '#14532d' }));
    defs.appendChild(gRind);

    var gRind2 = svg('linearGradient', { id: 'wmr2_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gRind2.appendChild(svg('stop', { offset: '0', 'stop-color': '#dcfce7' }));
    gRind2.appendChild(svg('stop', { offset: '1', 'stop-color': '#86efac' }));
    defs.appendChild(gRind2);

    var gPulp = svg('radialGradient', { id: 'wmp_' + uid, cx: '0.5', cy: '0.15', r: '0.9' });
    gPulp.appendChild(svg('stop', { offset: '0', 'stop-color': '#fca5a5' }));
    gPulp.appendChild(svg('stop', { offset: '0.4', 'stop-color': '#ef4444' }));
    gPulp.appendChild(svg('stop', { offset: '1', 'stop-color': '#b91c1c' }));
    defs.appendChild(gPulp);

    var cpId = 'wcp_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: '' });
    clip.appendChild(cp);
    defs.appendChild(clip);
    root.appendChild(defs);

    var cx = 50, cy = 50, r = 30;

    /* 外层绿皮楔形（尖朝上，圆弧在下） */
    var dOuter = 'M ' + n2(cx) + ' ' + n2(cy - r * 1.05) +
      ' Q ' + n2(cx + r * 0.55) + ' ' + n2(cy - r * 0.4) + ' ' + n2(cx + r * 0.98) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx) + ' ' + n2(cy + r * 1.05) + ' ' + n2(cx - r * 0.98) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx - r * 0.55) + ' ' + n2(cy - r * 0.4) + ' ' + n2(cx) + ' ' + n2(cy - r * 1.05) + ' Z';

    /* 内层浅绿圈（翻转） */
    var dMid = 'M ' + n2(cx) + ' ' + n2(cy - r * 0.88) +
      ' Q ' + n2(cx + r * 0.48) + ' ' + n2(cy - r * 0.32) + ' ' + n2(cx + r * 0.86) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx) + ' ' + n2(cy + r * 0.92) + ' ' + n2(cx - r * 0.86) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx - r * 0.48) + ' ' + n2(cy - r * 0.32) + ' ' + n2(cx) + ' ' + n2(cy - r * 0.88) + ' Z';

    /* 红瓤（翻转） */
    var dPulp = 'M ' + n2(cx) + ' ' + n2(cy - r * 0.72) +
      ' Q ' + n2(cx + r * 0.40) + ' ' + n2(cy - r * 0.25) + ' ' + n2(cx + r * 0.72) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx) + ' ' + n2(cy + r * 0.76) + ' ' + n2(cx - r * 0.72) + ' ' + n2(cy + r * 0.22) +
      ' Q ' + n2(cx - r * 0.40) + ' ' + n2(cy - r * 0.25) + ' ' + n2(cx) + ' ' + n2(cy - r * 0.72) + ' Z';
    cp.setAttribute('d', dPulp);

    /* ① 底部阴影 */
    root.appendChild(svg('ellipse', {
      cx: n2(cx), cy: n2(cy + r * 1.05),
      rx: n2(r * 0.62), ry: n2(r * 0.10),
      fill: '#14532d', opacity: '0.28'
    }));

    /* ② 外层绿皮 */
    root.appendChild(svg('path', { d: dOuter, fill: 'url(#wmr_' + uid + ')', stroke: '#14532d', 'stroke-width': '1.4', 'stroke-linejoin': 'round' }));
    /* ③ 内层浅绿圈 */
    root.appendChild(svg('path', { d: dMid, fill: 'url(#wmr2_' + uid + ')' }));
    /* ④ 红瓤 */
    root.appendChild(svg('path', { d: dPulp, fill: 'url(#wmp_' + uid + ')' }));

    /* ⑤ 红瓤内纤维纹理（3 条白弧） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.5) + ' ' + n2(cy + r * 0.1) + ' Q ' + n2(cx) + ' ' + n2(cy + r * 0.55) + ' ' + n2(cx + r * 0.5) + ' ' + n2(cy + r * 0.1),
      fill: 'none', stroke: '#fecaca', 'stroke-width': '1.4', 'stroke-linecap': 'round', opacity: '0.7',
      'clip-path': 'url(#' + cpId + ')'
    }));
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.35) + ' ' + n2(cy - 2) + ' Q ' + n2(cx) + ' ' + n2(cy + r * 0.35) + ' ' + n2(cx + r * 0.35) + ' ' + n2(cy - 2),
      fill: 'none', stroke: '#fecaca', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '0.55',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* ⑥ 黑籽 5 颗（每颗带高光） */
    var seeds = [[-0.42, -0.05], [-0.18, -0.28], [0.18, -0.28], [0.42, -0.05], [0.0, -0.45]];
    for (var i = 0; i < seeds.length; i++) {
      var sx = cx + seeds[i][0] * r;
      var sy = cy + seeds[i][1] * r;
      root.appendChild(svg('ellipse', {
        cx: n2(sx), cy: n2(sy), rx: '2.4', ry: '3.4',
        fill: '#0a0a0a', 'clip-path': 'url(#' + cpId + ')'
      }));
      root.appendChild(svg('ellipse', {
        cx: n2(sx - 0.8), cy: n2(sy - 1.2), rx: '0.8', ry: '1.2',
        fill: '#ffffff', opacity: '0.75', 'clip-path': 'url(#' + cpId + ')'
      }));
    }

    /* ⑦ 反光弧（下方） */
    root.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.5) + ' ' + n2(cy + r * 0.4) + ' Q ' + n2(cx) + ' ' + n2(cy + r * 0.78) + ' ' + n2(cx + r * 0.5) + ' ' + n2(cy + r * 0.4),
      fill: 'none', stroke: '#ffffff', 'stroke-width': '2.2', 'stroke-linecap': 'round', opacity: '0.7'
    }));

    return root;
  }

  /* ─── 通用渲染器（其他 10 个符号） ─── */
  function buildSymbolArt(spec, size, opts) {
    if (spec.shape === 'banana') return renderBanana(spec, size);
    if (spec.shape === 'grape') return renderGrape(spec, size);
    if (spec.shape === 'watermelon') return renderWatermelon(spec, size);
    return buildGenericSymbolArt(spec, size, opts);
  }
  function buildGenericSymbolArt(spec, size, opts) {
    opts = opts || {};
    var uid = spec.id + '_' + hash(spec.theme.main);
    var t = spec.theme;
    var cls = 'sd-sym-art sd-sym-art--' + spec.id;
    var root = svgRoot('0 0 100 100', { width: size, height: size, 'class': cls });
    var defs = svg('defs');

    /* 主体径向渐变（球面感，不依赖 filter） */
    var gBody = svg('radialGradient', { id: 'gb_' + uid, cx: '0.35', cy: '0.30', r: '0.9' });
    gBody.appendChild(svg('stop', { offset: '0',    'stop-color': t.light }));
    gBody.appendChild(svg('stop', { offset: '0.30', 'stop-color': t.main }));
    gBody.appendChild(svg('stop', { offset: '0.70', 'stop-color': t.main }));
    gBody.appendChild(svg('stop', { offset: '1',    'stop-color': t.dark }));
    defs.appendChild(gBody);

    /* 顶部高光径向 */
    var gTop = svg('radialGradient', { id: 'gt_' + uid, cx: '0.32', cy: '0.22', r: '0.65' });
    gTop.appendChild(svg('stop', { offset: '0',   'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    gTop.appendChild(svg('stop', { offset: '0.42', 'stop-color': '#ffffff', 'stop-opacity': '0.28' }));
    gTop.appendChild(svg('stop', { offset: '1',   'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gTop);

    /* 底部环境反光 */
    var gBot = svg('radialGradient', { id: 'gbo_' + uid, cx: '0.68', cy: '0.86', r: '0.55' });
    gBot.appendChild(svg('stop', { offset: '0', 'stop-color': t.light, 'stop-opacity': '0.6' }));
    gBot.appendChild(svg('stop', { offset: '1', 'stop-color': t.light, 'stop-opacity': '0' }));
    defs.appendChild(gBot);


    /* clipPath */
    var cpId = 'cl_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: '' });
    clip.appendChild(cp);
    defs.appendChild(clip);
    root.appendChild(defs);

    var cx = 50, cy = 50, r = 30;
    var sd = SHAPES[spec.shape](cx, cy, r);
    var d, fillRule = 'nonzero', sparks = [];
    if (typeof sd === 'string') { d = sd; }
    else { d = sd.d; fillRule = sd.fillRule || 'nonzero'; sparks = sd.sparks || []; }
    cp.setAttribute('d', d);
    if (fillRule === 'evenodd') cp.setAttribute('clip-rule', 'evenodd');

    /* ① 阴影层（视觉底） */
    var gShadow = svg('g', { 'class': 'sd-sym-shadow' });
    gShadow.appendChild(svg('ellipse', {
      cx: n2(cx), cy: n2(cy + r * 1.05),
      rx: n2(r * 0.72), ry: n2(r * 0.12),
      fill: t.dark, opacity: '0.18'
    }));
    root.appendChild(gShadow);

    /* ② 阴影层：深色 path 偏移 1.8px */
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: t.dark, opacity: '0.48',
      transform: 'translate(0 2.2)'
    }));

    /* ②.5 白色外描边 */
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'none', stroke: '#ffffff', 'stroke-width': '2.4',
      'stroke-linejoin': 'round'
    }));

    /* ③ 主体层：径向渐变 */
    var gBase = svg('g', { 'class': 'sd-sym-body' });
    gBase.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'url(#gb_' + uid + ')'
    }));
    root.appendChild(gBase);

    /* ③ 渐变高光层（clip 内） */
    var gGrad = svg('g', { 'class': 'sd-sym-grad', 'clip-path': 'url(#' + cpId + ')' });
    gGrad.appendChild(svg('rect', { x: '0', y: '0', width: '100', height: '100', fill: 'url(#gt_' + uid + ')' }));
    gGrad.appendChild(svg('rect', { x: '0', y: '0', width: '100', height: '100', fill: 'url(#gbo_' + uid + ')' }));
    root.appendChild(gGrad);

    /* ④ 描边 + 装饰层 */
    var gHi = svg('g', { 'class': 'sd-sym-hi' });

    /* 外描边 */
    gHi.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule, fill: 'none',
      stroke: t.dark, 'stroke-width': '2.2', 'stroke-linejoin': 'round', opacity: '0.85'
    }));
    /* 内亮线（偏移 -0.5 模拟玻璃边缘） */
    gHi.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule, fill: 'none',
      stroke: '#ffffff', 'stroke-width': '1.1', 'stroke-linejoin': 'round',
      opacity: '0.75', transform: 'translate(0 -0.5)',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 左上大高光椭球（超高亮） */
    gHi.appendChild(svg('ellipse', {
      cx: n2(cx - r * 0.30), cy: n2(cy - r * 0.40),
      rx: n2(r * 0.46), ry: n2(r * 0.26),
      fill: '#ffffff', opacity: '0.95',
      transform: 'rotate(-30 ' + n2(cx - r * 0.30) + ' ' + n2(cy - r * 0.40) + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));
    /* 左上高光核心亮点 */
    gHi.appendChild(svg('ellipse', {
      cx: n2(cx - r * 0.36), cy: n2(cy - r * 0.46),
      rx: n2(r * 0.16), ry: n2(r * 0.10),
      fill: '#ffffff', opacity: '1',
      transform: 'rotate(-30 ' + n2(cx - r * 0.36) + ' ' + n2(cy - r * 0.46) + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 右下反光椭球 */
    gHi.appendChild(svg('ellipse', {
      cx: n2(cx + r * 0.42), cy: n2(cy + r * 0.5),
      rx: n2(r * 0.34), ry: n2(r * 0.16),
      fill: '#ffffff', opacity: '0.32',
      transform: 'rotate(20 ' + n2(cx + r * 0.42) + ' ' + n2(cy + r * 0.5) + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 顶部弧形反射带 */
    gHi.appendChild(svg('path', {
      d: 'M ' + n2(cx - r * 0.6) + ' ' + n2(cy - r * 0.55) +
         ' Q ' + n2(cx) + ' ' + n2(cy - r * 1.18) + ' ' + n2(cx + r * 0.6) + ' ' + n2(cy - r * 0.55),
      fill: 'none', stroke: '#ffffff', 'stroke-width': '3.4',
      'stroke-linecap': 'round', opacity: '0.6',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 葡萄：每颗球加深色描边（颗颗分明） */

    /* ── sparks（葡萄等） ── */
    if (sparks.length) {
      var gSp = svg('g', { 'class': 'sd-sym-specks', 'clip-path': 'url(#' + cpId + ')' });
      for (var si = 0; si < sparks.length; si++) {
        var sp = sparks[si];
        gSp.appendChild(svg('circle', {
          cx: n2(sp.cx), cy: n2(sp.cy), r: n2(sp.r),
          fill: '#ffffff', opacity: n2(sp.opacity != null ? sp.opacity : 0.7)
        }));
      }
      gHi.appendChild(gSp);
    }

    /* 装饰斑点 */
    var cnt = 2 + Math.floor(seeded(spec.id.length + 5) * 3);
    for (var i = 0; i < cnt; i++) {
      var s1 = seeded(i * 7 + spec.id.length);
      var s2 = seeded(i * 13 + spec.id.charCodeAt(0));
      gHi.appendChild(svg('ellipse', {
        cx: n2(cx + (s1 - 0.5) * r * 1.05),
        cy: n2(cy + (s2 - 0.5) * r * 0.85 - r * 0.15),
        rx: n2(1.2 + s1 * 1.1), ry: n2((1.2 + s1 * 1.1) * 0.62),
        fill: '#ffffff', opacity: n2(0.5 + s2 * 0.35),
        'clip-path': 'url(#' + cpId + ')'
      }));
    }

    /* 形状专属装饰 */
    if (spec.shape === 'ring') {
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.6) + ' ' + n2(cy - r * 0.45) +
           ' Q ' + n2(cx) + ' ' + n2(cy - r * 0.95) + ' ' + n2(cx + r * 0.6) + ' ' + n2(cy - r * 0.45),
        fill: 'none', stroke: '#ffffff', 'stroke-width': '2.2', 'stroke-linecap': 'round', opacity: '0.8'
      }));
    }
    if (spec.shape === 'lollipop') {
      var halo = svg('g', { 'class': 'sd-sym-halo' });
      var neon = [t.accent, '#ff3d7f', '#06b6d4', '#22c55e', '#7c5cff', '#facc15'];
      for (var hi = 0; hi < 6; hi++) {
        var ang = hi * Math.PI / 3;
        halo.appendChild(svg('circle', {
          cx: n2(cx + Math.cos(ang) * r * 1.05),
          cy: n2(cy + Math.sin(ang) * r * 1.05),
          r: '2.2', fill: neon[hi], opacity: '0.9'
        }));
      }
      gHi.appendChild(halo);
      var sparkle = svg('g', { 'class': 'sd-sym-spark', opacity: '0.9' });
      for (var k = 1; k <= 3; k++) {
        sparkle.appendChild(svg('circle', {
          cx: n2(cx + Math.cos(k * 2.1) * r * 0.55),
          cy: n2(cy - r * 0.22 + Math.sin(k * 2.1) * r * 0.55),
          r: n2(1.4 + k * 0.3), fill: '#ffffff', opacity: '0.85'
        }));
      }
      gHi.appendChild(sparkle);
    }
    if (spec.shape === 'star5' || spec.shape === 'star6') {
      gHi.appendChild(svg('path', {
        d: pStar(cx, cy, r * 0.55, 5, 0.5),
        fill: '#ffffff', opacity: '0.35', 'class': 'sd-sym-spark',
        'clip-path': 'url(#' + cpId + ')'
      }));
    }
    if (spec.shape === 'heart') {
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.35) + ' ' + n2(cy - r * 0.4) +
           ' Q ' + n2(cx - r * 0.2) + ' ' + n2(cy - r * 0.7) + ' ' + n2(cx) + ' ' + n2(cy - r * 0.55),
        fill: 'none', stroke: '#ffffff', 'stroke-width': '2.4', 'stroke-linecap': 'round', opacity: '0.85'
      }));
    }
    if (spec.shape === 'diamond') {
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.6) + ' ' + n2(cy - r * 0.55) + ' L ' + n2(cx + r * 0.1) + ' ' + n2(cy + r * 0.55),
        stroke: '#ffffff', 'stroke-width': '1.6', 'stroke-linecap': 'round', opacity: '0.5',
        'class': 'sd-sym-shine', 'clip-path': 'url(#' + cpId + ')'
      }));
    }
    if (spec.shape === 'grape') {
      /* 紫色梗 */
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.05) + ' ' + n2(cy - r * 0.65) +
           ' Q ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.95) + ' ' + n2(cx + r * 0.02) + ' ' + n2(cy - r * 1.15) +
           ' L ' + n2(cx + r * 0.10) + ' ' + n2(cy - r * 1.12) +
           ' Q ' + n2(cx + r * 0.08) + ' ' + n2(cy - r * 0.92) + ' ' + n2(cx + r * 0.04) + ' ' + n2(cy - r * 0.62) +
           ' Z',
        fill: '#5b21b6', stroke: '#2e1065', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
      }));
      /* 左侧大叶 */
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.98) +
           ' Q ' + n2(cx - r * 0.62) + ' ' + n2(cy - r * 1.18) + ' ' + n2(cx - r * 0.78) + ' ' + n2(cy - r * 0.72) +
           ' Q ' + n2(cx - r * 0.42) + ' ' + n2(cy - r * 0.66) + ' ' + n2(cx - r * 0.02) + ' ' + n2(cy - r * 0.98) + ' Z',
        fill: '#4ade80', stroke: '#166534', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
      }));
      /* 叶脉 */
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.04) + ' ' + n2(cy - r * 0.94) + ' Q ' + n2(cx - r * 0.42) + ' ' + n2(cy - r * 1.02) + ' ' + n2(cx - r * 0.68) + ' ' + n2(cy - r * 0.76),
        fill: 'none', stroke: '#166534', 'stroke-width': '1', 'stroke-linecap': 'round', opacity: '0.75'
      }));
      /* 右侧小叶 */
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx + r * 0.06) + ' ' + n2(cy - r * 0.98) +
           ' Q ' + n2(cx + r * 0.58) + ' ' + n2(cy - r * 1.14) + ' ' + n2(cx + r * 0.76) + ' ' + n2(cy - r * 0.72) +
           ' Q ' + n2(cx + r * 0.42) + ' ' + n2(cy - r * 0.66) + ' ' + n2(cx + r * 0.06) + ' ' + n2(cy - r * 0.98) + ' Z',
        fill: '#22c55e', stroke: '#166534', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
      }));
    }
    if (spec.shape === 'watermelon') {
      var seeds = [[-0.4,0.05],[-0.15,0.25],[0.15,0.25],[0.4,0.05],[-0.28,-0.15],[0.28,-0.15]];
      for (var wi = 0; wi < seeds.length; wi++) {
        gHi.appendChild(svg('ellipse', {
          cx: n2(cx + seeds[wi][0] * r), cy: n2(cy + seeds[wi][1] * r),
          rx: '1.6', ry: '2.4', fill: t.dark, opacity: '0.55',
          'clip-path': 'url(#' + cpId + ')'
        }));
      }
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.75) + ' ' + n2(cy - r * 0.1) +
           ' Q ' + n2(cx) + ' ' + n2(cy - r * 0.75) + ' ' + n2(cx + r * 0.75) + ' ' + n2(cy - r * 0.1),
        fill: 'none', stroke: '#ffffff', 'stroke-width': '2.6',
        'stroke-linecap': 'round', opacity: '0.7',
        'clip-path': 'url(#' + cpId + ')'
      }));
    }
    if (spec.shape === 'cherry') {
      var balls = [[-0.5, 0.35, 0.62], [0.5, 0.35, 0.62]];
      for (var ci = 0; ci < balls.length; ci++) {
        var bx = cx + balls[ci][0] * r, by = cy + balls[ci][1] * r, br = balls[ci][2] * r;
        gHi.appendChild(svg('circle', { cx: n2(bx - br * 0.32), cy: n2(by - br * 0.38), r: n2(br * 0.32), fill: '#ffffff', opacity: '0.85' }));
        gHi.appendChild(svg('circle', { cx: n2(bx + br * 0.36), cy: n2(by + br * 0.42), r: n2(br * 0.16), fill: '#ffffff', opacity: '0.45' }));
      }
      gHi.appendChild(svg('path', {
        d: 'M ' + n2(cx - r * 0.5) + ' ' + n2(cy - r * 0.2) +
           ' Q ' + n2(cx) + ' ' + n2(cy - r * 1.1) + ' ' + n2(cx + r * 0.5) + ' ' + n2(cy - r * 0.2),
        fill: 'none', stroke: '#22c55e', 'stroke-width': '2.4', 'stroke-linecap': 'round'
      }));
    }
    if (spec.shape === 'wild') {
      /* 彩虹环 */
      var rbow = svg('g', { 'class': 'sd-sym-glow', 'clip-path': 'url(#' + cpId + ')' });
      var cols = ['#ff3d7f', '#ffb300', '#22c55e', '#06b6d4', '#7c5cff'];
      for (var c = 0; c < cols.length; c++) {
        rbow.appendChild(svg('circle', {
          cx: n2(cx), cy: n2(cy), r: n2(r * (0.92 - c * 0.12)),
          fill: 'none', stroke: cols[c], 'stroke-width': '3.4', opacity: '0.85'
        }));
      }
      gHi.appendChild(rbow);
    }

    root.appendChild(gHi);
    return root;
  }

  /* ── 数据 ── */
  var FAQ = [
    { q: '糖果连连爆的赔付方式是什么？', a: '采用「任意位置赔付」（Scatter Pays），同一种符号在网格任意位置出现 8 个及以上即触发赔付，与行列连线无关。' },
    { q: '如何触发免费旋转？',           a: '单局中同时出现 4 个及以上棒棒糖 Scatter 符号，即可获得 10 次免费旋转；5 个为 12 次，6 个为 15 次。' },
    { q: '免费旋转中的倍数如何累加？',   a: '免费旋转期间若出现糖果炸弹，其倍数会被收集并累加至本轮最终赔付，单个炸弹倍数范围 ×2 ~ ×100。' },
    { q: '最大可以赢多少倍？',           a: '在最优触发条件下，理论最大赔付倍数为 ×21,100。' },
    { q: '彩虹糖 WILD 有什么作用？',      a: '彩虹糖可替代任意基础或高级符号参与结算，但不会替代棒棒糖 Scatter。' },];

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

  /* ── 占位图 ── */
  function buildPlaceholder() {
    var ph = document.createElement('div');
    ph.className = 'sd-carousel__ph';
    ph.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:10px;position:absolute;inset:0;box-sizing:border-box;margin:0;padding:0;';
    var icon = document.createElement('div');
    icon.className = 'sd-carousel__ph-icon';
    var ic = svgRoot('0 0 48 48', { width: 64, height: 64 });
    ic.appendChild(svg('rect', { x: '5', y: '9', width: '38', height: '30', rx: '4', fill: 'none', stroke: '#8a8a96', 'stroke-width': '2.6', 'stroke-linejoin': 'round' }));
    ic.appendChild(svg('circle', { cx: '16', cy: '19', r: '3.2', fill: 'none', stroke: '#8a8a96', 'stroke-width': '2.6' }));
    ic.appendChild(svg('path', { d: 'M 7 34 L 18 23 L 28 32 L 34 26 L 41 33', fill: 'none', stroke: '#8a8a96', 'stroke-width': '2.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
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
    var dots = document.getElementById('sd-carousel-dots');
    if (!track || !dots) return;
    track.innerHTML = ''; dots.innerHTML = '';
    var N = 3;
    for (var i = 0; i < N; i++) {
      var slide = document.createElement('div');
      slide.className = 'sd-carousel__slide';
      slide.setAttribute('data-index', String(i));
      slide.appendChild(buildPlaceholder());
      track.appendChild(slide);
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'sd-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      (function (idx) { dot.addEventListener('click', function () { scrollToSlide(idx); }); })(i);
      dots.appendChild(dot);
    }
    bindCarouselScroll();
  }
  function scrollToSlide(i) {
    var vp = document.getElementById('sd-carousel-viewport');
    if (!vp) return;
    var slides = vp.querySelectorAll('.sd-carousel__slide');
    if (slides[i]) slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
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
    /* 排序：base → high → scatter → wild */
    var order = { base: 0, high: 1, scatter: 2, wild: 3 };
    var list = SYMBOLS.slice().sort(function (a, b) { return order[a.type] - order[b.type]; });
    list.forEach(function (spec) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td');
      var cell = document.createElement('div');
      cell.className = 'sd-sym-cell';
      var art = document.createElement('div');
      art.className = 'sd-sym-cell__art';
      art.appendChild(buildSymbolArt(spec, 24));
      cell.appendChild(art);
      var nm = document.createElement('span');
      nm.className = 'sd-sym-cell__name';
      nm.textContent = spec.name;
      cell.appendChild(nm);
      td1.appendChild(cell);
      tr.appendChild(td1);

      var isSpecial = (spec.type === 'scatter' || spec.type === 'wild');
      [spec.m8, spec.m10, spec.m12].forEach(function (v) {
        var td = document.createElement('td');
        var span = document.createElement('span');
        span.className = 'sd-mult' + (isSpecial ? ' sd-mult--scatter' : '');
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
      var cs = svgRoot('0 0 24 24', { width: 18, height: 18 });
      cs.appendChild(svg('polyline', { points: '6 9 12 15 18 9', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      chev.appendChild(cs);
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
    var wrap = document.getElementById('sd-tabs');
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
    if (back) back.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'index.html';
    });
    var share = document.getElementById('sd-share');
    if (share) share.addEventListener('click', function () {
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

  /* ── Bottom ── */
  function bindBottom() {
    var fav = document.getElementById('sd-fav');
    if (fav) fav.addEventListener('click', function () {
      var on = fav.classList.toggle('is-active');
      fav.setAttribute('aria-pressed', on ? 'true' : 'false');
      toast(on ? '已加入收藏' : '已取消收藏');
    });
    var svc = document.getElementById('sd-service');
    if (svc) svc.addEventListener('click', function () { toast('客服即将接入'); });
    var demo = document.getElementById('sd-demo');
    if (demo) demo.addEventListener('click', function () {
      window.location.href = 'sweet-demo.html?mode=demo';
    });
    var play = document.getElementById('sd-play');
    if (play) play.addEventListener('click', function () {
      window.location.href = 'sweet-demo.html?mode=play';
    });
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

  /* ═══ 暴露接口给试玩 / 正式游戏页复用 ═══ */
  window.ApexSweetSymbols = {
    list: SYMBOLS,
    build: function (specId, size) {
      for (var i = 0; i < SYMBOLS.length; i++) {
        if (SYMBOLS[i].id === specId) return buildSymbolArt(SYMBOLS[i], size);
      }
      return null;
    }
  };
})();
