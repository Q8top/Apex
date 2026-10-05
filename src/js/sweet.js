/* Sweet Bonanza V3 · 果冻糖果程序化 SVG · 无框架 / 无 eval / 无 Math.random */
(function () {
  'use strict';
  var TW_BANANA = "<path fill=\"#FFE8B6\" d=\"M28 2c2.684-1.342 5 4 3 13-1.106 4.977-5 9-9 12s-11-1-7-5 8-7 10-13c1.304-3.912 1-6 3-7z\"/><path fill=\"#FFD983\" d=\"M31 8c0 3-1 9-4 13s-7 5-4 1 5-7 6-11 2-7 2-3z\"/><path fill=\"#FFCC4D\" d=\"M22 20c-.296.592 1.167-3.833-3-6-1.984-1.032-10 1-4 1 3 0 4 2 2 4-.291.292-.489.603-.622.912-.417.346-.873.709-1.378 1.088-2.263 1.697-5.84 4.227-10 7-3 2-4 3-4 4 0 3 9 3 14 1s10-7 10-7l4-4c-3-4-7-2-7-2z\"/><path fill=\"#FFE8B6\" d=\"M22 20s1.792-4.729-3-7c-4.042-1.916-8-1-11 1s-2 4-3 5 1 2 3 0 8.316-4.895 11-4c3 1 2 2.999 3 5z\"/><path fill=\"#A6D388\" d=\"M26 35h-4c-2 0-3 1-4 1s-2-2 0-2 4 0 5-1 5 2 3 2z\"/><circle fill=\"#3E721D\" cx=\"18\" cy=\"35\" r=\"1\"/><path fill=\"#FFCC4D\" d=\"M32.208 28S28 35 26 35h-4c-2 0 0-1 1-2s5 0 5-6c0-3 4.208 1 4.208 1z\"/><path fill=\"#FFE8B6\" d=\"M26 19c3 0 8 3 7 9s-5 7-7 7h-2c-2 0-1-1 0-2s4 0 4-6c0-3-4-7-6-7 0 0 2-1 4-1z\"/><path fill=\"#FFD983\" d=\"M17 21c3 0 5 1 3 3-1.581 1.581-6 5-10 6s-8 1-5-1 9.764-8 12-8z\"/><path fill=\"#C1694F\" d=\"M2 31c1 0 1 0 1 .667C3 32.333 3 33 2 33s-1-1.333-1-1.333S1 31 2 31z\"/>";
  var TW_GRAPE = "<path fill=\"#77B255\" d=\"M9.999 12c-.15 0-.303-.034-.446-.106-4.38-2.19-7.484-7.526-8.501-10.578C.876.792 1.16.226 1.684.051c.525-.176 1.091.109 1.265.632.877 2.632 3.688 7.517 7.499 9.422.494.247.694.848.447 1.342-.176.351-.529.553-.896.553z\"/><circle fill=\"#553788\" cx=\"19\" cy=\"29\" r=\"7\"/><circle fill=\"#9266CC\" cx=\"10\" cy=\"15\" r=\"7\"/><circle fill=\"#AA8DD8\" cx=\"19\" cy=\"12\" r=\"7\"/><circle fill=\"#744EAA\" cx=\"27\" cy=\"18\" r=\"7\"/><circle fill=\"#744EAA\" cx=\"9\" cy=\"26\" r=\"7\"/><circle fill=\"#9266CC\" cx=\"18\" cy=\"21\" r=\"7\"/><circle fill=\"#9266CC\" cx=\"29\" cy=\"29\" r=\"7\"/>";
  var TW_WATERMELON = "<path fill=\"#5c913b\" d=\"M1.52 0C.55 2.2 0 4.61 0 7.15c0 9.98 8.32 18.07 18.58 18.07 8 0 14.8-4.92 17.42-11.81z\"/><path fill=\"#ffe8b6\" d=\"M3.44.75a15.6 15.6 0 0 0-1.38 6.41c0 8.87 7.4 16.06 16.52 16.06 7.13 0 13.18-4.4 15.5-10.55z\"/><path fill=\"#dd2e44\" d=\"M5.36 1.49c-.79 1.73-1.23 3.64-1.23 5.66 0 7.76 6.47 14.05 14.45 14.05 6.26 0 11.57-3.87 13.58-9.29z\"/><path d=\"M9.21 7.96c-.32.47-.77.73-1 .57s-.17-.67.14-1.15.77-.73 1-.57.17.67-.14 1.15m6.19 1.03c-.32.47-.77.73-1 .57s-.17-.67.14-1.15.77-.73 1-.57.17.67-.14 1.15m5.25 4.83c.05.57-.14 1.05-.42 1.07-.28.03-.56-.41-.61-.98s.14-1.05.42-1.07c.28-.03.56.41.61.98m-9.29-2.06c.05.57-.14 1.05-.42 1.07-.28.03-.56-.41-.61-.98s.14-1.05.42-1.07c.28-.03.56.41.61.98m4.03 5.52c-.34.46-.81.68-1.03.51-.23-.17-.13-.68.21-1.13.34-.46.81-.68 1.03-.51.23.17.13.68-.21 1.13m8.3.47c.28.5.31 1.01.06 1.15s-.68-.15-.96-.64c-.28-.5-.31-1.01-.06-1.15s.68.15.96.64m-7.24-5.19c.31.48.37.99.14 1.15-.24.16-.68-.1-1-.58-.31-.48-.37-.99-.14-1.14.24-.16.68.1 1 .58Zm9.27 1.63c-.34.46-.81.68-1.03.51-.23-.17-.13-.68.21-1.13.34-.46.81-.68 1.03-.51.23.17.14.68-.21 1.13\"/>";
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
  function renderTwemojiSymbol(spec, size, twContent, transform, cls) {
    var root = svgRoot('0 0 100 100', { width: size, height: size, 'class': 'sd-sym-art ' + cls });
    var defs = svg('defs');
    var uid = 'tw_' + hash(spec.id);
    var fs = svg('filter', { id: 'sh_' + uid, x: '-15%', y: '-15%', width: '130%', height: '135%' });
    fs.appendChild(svg('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '1.2', result: 'b' }));
    fs.appendChild(svg('feOffset', { in: 'b', dx: '0', dy: '2.4', result: 'o' }));
    var fm = svg('feMerge');
    fm.appendChild(svg('feMergeNode', { in: 'o' }));
    fm.appendChild(svg('feMergeNode', { in: 'SourceGraphic' }));
    fs.appendChild(fm);
    defs.appendChild(fs);

    /* 左上高光渐变 */
    var gl = svg('radialGradient', { id: 'gl_' + uid, cx: '0.35', cy: '0.30', r: '0.75' });
    gl.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.60' }));
    gl.appendChild(svg('stop', { offset: '0.6', 'stop-color': '#ffffff', 'stop-opacity': '0.15' }));
    gl.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gl);

    /* 右下暗影渐变 */
    var gd = svg('radialGradient', { id: 'gd_' + uid, cx: '0.68', cy: '0.72', r: '0.72' });
    gd.appendChild(svg('stop', { offset: '0', 'stop-color': '#000000', 'stop-opacity': '0.32' }));
    gd.appendChild(svg('stop', { offset: '0.6', 'stop-color': '#000000', 'stop-opacity': '0.08' }));
    gd.appendChild(svg('stop', { offset: '1', 'stop-color': '#000000', 'stop-opacity': '0' }));
    defs.appendChild(gd);

    root.appendChild(defs);
    root.appendChild(svg('ellipse', { cx: '50', cy: '84', rx: '17', ry: '2.4', fill: '#000000', opacity: '0.20' }));
    var gg = svg('g', { transform: transform, filter: 'url(#sh_' + uid + ')' });
    var parser = new DOMParser();
    var doc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + twContent + '</svg>', 'image/svg+xml');
    var kids = doc.documentElement.children;
    while (kids.length > 0) gg.appendChild(kids[0]);
    root.appendChild(gg);

    /* 左上白色高光（叠加在 Twemoji 之上） */
    root.appendChild(svg('circle', {
      cx: '50', cy: '50', r: '40',
      fill: 'url(#gl_' + uid + ')',
      'pointer-events': 'none'
    }));
    /* 右下暗影 */
    root.appendChild(svg('circle', {
      cx: '50', cy: '50', r: '40',
      fill: 'url(#gd_' + uid + ')',
      'pointer-events': 'none'
    }));

    return root;
  }

  function renderBanana(spec, size) {
    return renderTwemojiSymbol(spec, size, TW_BANANA, 'scale(2.7778)', 'sd-sym-art--banana');
  }

  function renderGrape(spec, size) {
    return renderTwemojiSymbol(spec, size, TW_GRAPE, 'scale(2.7778)', 'sd-sym-art--grape');
  }

  function renderWatermelon(spec, size) {
    var offY = (100 - 25.22 * 2.7778) / 2;
    return renderTwemojiSymbol(spec, size, TW_WATERMELON, 'translate(0 ' + offY.toFixed(2) + ') scale(2.7778)', 'sd-sym-art--watermelon');
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
