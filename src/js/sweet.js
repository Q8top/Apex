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
  }  function pFlower(cx, cy, r, petals) {
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
  }  /* ── Symbol Definition · 13 种（12 基础 + 1 Wild） ── */
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
  /* ══════════════════════════════════════════════════════════
     buildGummy · 商业级 8 层果冻渲染
       1. Ground shadow
       2. Base (dark underlay)
       3. Main radial gradient
       4. Ambient occlusion (bottom, clip)
       5. Specular highlight (top-left, clip)
       6. Rim light (top arc, clip)
       7. Stroke (dark outer + light inner)
       8. Custom decoration
     ══════════════════════════════════════════════════════════ */
  function buildGummy(spec, size, opts) {
    opts = opts || {};
    var uid = spec.id + '_g_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--' + spec.id
    });
    var defs = svg('defs');

    var gMain = svg('radialGradient', { id: 'gm_' + uid, cx: '0.35', cy: '0.28', r: '0.85' });
    gMain.appendChild(svg('stop', { offset: '0',    'stop-color': t.light }));
    gMain.appendChild(svg('stop', { offset: '0.35', 'stop-color': t.main }));
    gMain.appendChild(svg('stop', { offset: '0.75', 'stop-color': t.main }));
    gMain.appendChild(svg('stop', { offset: '1',    'stop-color': t.dark }));
    defs.appendChild(gMain);

    var gAO = svg('radialGradient', { id: 'ao_' + uid, cx: '0.6', cy: '0.9', r: '0.7' });
    gAO.appendChild(svg('stop', { offset: '0', 'stop-color': t.dark, 'stop-opacity': '0.7' }));
    gAO.appendChild(svg('stop', { offset: '1', 'stop-color': t.dark, 'stop-opacity': '0' }));
    defs.appendChild(gAO);

    var gSpec = svg('radialGradient', { id: 'sp_' + uid, cx: '0.35', cy: '0.25', r: '0.6' });
    gSpec.appendChild(svg('stop', { offset: '0',   'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    gSpec.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#ffffff', 'stop-opacity': '0.3' }));
    gSpec.appendChild(svg('stop', { offset: '1',   'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gSpec);

    var gRim = svg('linearGradient', { id: 'rm_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gRim.appendChild(svg('stop', { offset: '0',   'stop-color': '#ffffff', 'stop-opacity': '0.9' }));
    gRim.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#ffffff', 'stop-opacity': '0.1' }));
    gRim.appendChild(svg('stop', { offset: '1',   'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gRim);

    var cpId = 'cp_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cpPath = svg('path', { d: opts.d || '' });
    clip.appendChild(cpPath);
    defs.appendChild(clip);

    root.appendChild(defs);

    var d = opts.d;
    var fillRule = opts.fillRule || 'nonzero';

    if (!opts.noShadow) {
      root.appendChild(svg('ellipse', {
        cx: '50', cy: '88', rx: '26', ry: '4',
        fill: '#000000', opacity: '0.28'
      }));
    }

    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: t.dark, opacity: '0.85',
      transform: 'translate(0 1.2)'
    }));

    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'url(#gm_' + uid + ')'
    }));

    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'url(#ao_' + uid + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));

    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'url(#sp_' + uid + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));

    root.appendChild(svg('path', {
      d: opts.rimPath || 'M 26 40 Q 50 12 74 40',
      fill: 'none',
      stroke: 'url(#rm_' + uid + ')',
      'stroke-width': '3.5',
      'stroke-linecap': 'round',
      opacity: '0.85',
      'clip-path': 'url(#' + cpId + ')'
    }));

    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'none', stroke: t.dark, 'stroke-width': '1.5',
      'stroke-linejoin': 'round', opacity: '0.9'
    }));
    root.appendChild(svg('path', {
      d: d, 'fill-rule': fillRule,
      fill: 'none', stroke: '#ffffff', 'stroke-width': '0.8',
      'stroke-linejoin': 'round', opacity: '0.55',
      transform: 'translate(0 -0.5)',
      'clip-path': 'url(#' + cpId + ')'
    }));

    if (opts.decorate) opts.decorate(root, svg, uid, t, cpId);

    return root;
  }

  /* ─── 香蕉 · 斜弯月 ─── */
  function renderBanana(spec, size) {
    return buildGummy(spec, size, {
      d: 'M 78 18 C 84 32, 74 52, 52 66 C 34 78, 18 74, 16 64 C 22 72, 38 72, 56 60 C 72 50, 78 32, 74 20 Z',
      rimPath: 'M 22 60 Q 44 78 68 46',
      decorate: function (root, svg, uid, t, cpId) {
        root.appendChild(svg('ellipse', {
          cx: '76', cy: '20', rx: '4', ry: '3',
          fill: '#3b1f08', opacity: '0.95',
          transform: 'rotate(-20 76 20)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        root.appendChild(svg('ellipse', {
          cx: '17', cy: '63', rx: '4', ry: '3',
          fill: '#3b1f08', opacity: '0.9',
          transform: 'rotate(30 17 63)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        root.appendChild(svg('path', {
          d: 'M 30 60 Q 52 74 72 44',
          fill: 'none', stroke: '#ffffff', 'stroke-width': '3',
          'stroke-linecap': 'round', opacity: '0.95',
          'clip-path': 'url(#' + cpId + ')'
        }));
      }
    });
  }

  /* ─── 葡萄 · 8 颗球 + 梗叶 ─── */
  function renderGrape(spec, size) {
    var uid = spec.id + '_grape_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--grape'
    });
    var defs = svg('defs');
    var gBall = svg('radialGradient', { id: 'gb_' + uid, cx: '0.35', cy: '0.3', r: '0.8' });
    gBall.appendChild(svg('stop', { offset: '0',   'stop-color': '#f3e8ff' }));
    gBall.appendChild(svg('stop', { offset: '0.3', 'stop-color': t.main }));
    gBall.appendChild(svg('stop', { offset: '0.8', 'stop-color': '#7c3aed' }));
    gBall.appendChild(svg('stop', { offset: '1',   'stop-color': '#3b0764' }));
    defs.appendChild(gBall);
    var gLeaf = svg('linearGradient', { id: 'gl_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gLeaf.appendChild(svg('stop', { offset: '0', 'stop-color': '#4ade80' }));
    gLeaf.appendChild(svg('stop', { offset: '1', 'stop-color': '#166534' }));
    defs.appendChild(gLeaf);
    root.appendChild(defs);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '90', rx: '26', ry: '3.5',
      fill: '#000000', opacity: '0.3'
    }));
    root.appendChild(svg('path', {
      d: 'M 50 30 Q 22 18 14 34 Q 26 40 50 30 Z',
      fill: 'url(#gl_' + uid + ')',
      stroke: '#14532d', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));
    root.appendChild(svg('path', {
      d: 'M 50 30 Q 78 18 86 34 Q 74 40 50 30 Z',
      fill: 'url(#gl_' + uid + ')',
      stroke: '#14532d', 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));

    var balls = [
      [-0.55, -0.42], [0.0, -0.5], [0.55, -0.42],
      [-0.32, 0.05],  [0.32, 0.05],
      [-0.16, 0.55],  [0.16, 0.55],
      [0.0, 0.98]
    ];
    var cx = 50, cy = 50, r = 26;
    for (var i = 0; i < balls.length; i++) {
      var bx = cx + balls[i][0] * r;
      var by = cy + balls[i][1] * r + 4;
      var br = r * 0.34;
      root.appendChild(svg('circle', {
        cx: n2(bx), cy: n2(by), r: n2(br),
        fill: 'url(#gb_' + uid + ')',
        stroke: '#3b0764', 'stroke-width': '0.8', 'stroke-opacity': '0.7'
      }));
      root.appendChild(svg('ellipse', {
        cx: n2(bx - br * 0.32), cy: n2(by - br * 0.38),
        rx: n2(br * 0.32), ry: n2(br * 0.22),
        fill: '#ffffff', opacity: '0.9',
        transform: 'rotate(-30 ' + n2(bx - br * 0.32) + ' ' + n2(by - br * 0.38) + ')'
      }));
      root.appendChild(svg('ellipse', {
        cx: n2(bx + br * 0.35), cy: n2(by + br * 0.45),
        rx: n2(br * 0.22), ry: n2(br * 0.1),
        fill: '#ffffff', opacity: '0.3'
      }));
    }
    root.appendChild(svg('path', {
      d: 'M 50 30 L 50 18',
      fill: 'none', stroke: '#3b0764', 'stroke-width': '2.5',
      'stroke-linecap': 'round'
    }));
    return root;
  }

  /* ─── 西瓜 · 扇形切片 ─── */
  function renderWatermelon(spec, size) {
    var uid = spec.id + '_wm_' + hash(spec.theme.main);
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--watermelon'
    });
    var defs = svg('defs');
    var gRind = svg('radialGradient', { id: 'gr_' + uid, cx: '0.5', cy: '0.1', r: '1' });
    gRind.appendChild(svg('stop', { offset: '0',   'stop-color': '#4ade80' }));
    gRind.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#15803d' }));
    gRind.appendChild(svg('stop', { offset: '1',   'stop-color': '#14532d' }));
    defs.appendChild(gRind);
    var gPulp = svg('radialGradient', { id: 'gp_' + uid, cx: '0.5', cy: '0.2', r: '0.9' });
    gPulp.appendChild(svg('stop', { offset: '0',   'stop-color': '#fca5a5' }));
    gPulp.appendChild(svg('stop', { offset: '0.35','stop-color': '#ef4444' }));
    gPulp.appendChild(svg('stop', { offset: '1',   'stop-color': '#b91c1c' }));
    defs.appendChild(gPulp);
    var gWhite = svg('radialGradient', { id: 'gw_' + uid, cx: '0.5', cy: '0.1', r: '1' });
    gWhite.appendChild(svg('stop', { offset: '0', 'stop-color': '#f0fdf4' }));
    gWhite.appendChild(svg('stop', { offset: '1', 'stop-color': '#bbf7d0' }));
    defs.appendChild(gWhite);
    var cpId = 'wcp_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: '' });
    clip.appendChild(cp);
    defs.appendChild(clip);
    root.appendChild(defs);

    var cx = 50, cy = 52, r = 38;
    var dOuter = 'M ' + (cx - r) + ' ' + cy +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy +
      ' L ' + (cx + r * 0.9) + ' ' + (cy + 4) +
      ' A ' + (r * 0.9) + ' ' + (r * 0.9) + ' 0 0 0 ' + (cx - r * 0.9) + ' ' + (cy + 4) + ' Z';
    var dWhite = 'M ' + (cx - r * 0.94) + ' ' + (cy + 1) +
      ' A ' + (r * 0.94) + ' ' + (r * 0.94) + ' 0 0 1 ' + (cx + r * 0.94) + ' ' + (cy + 1) +
      ' L ' + (cx + r * 0.82) + ' ' + (cy + 5) +
      ' A ' + (r * 0.82) + ' ' + (r * 0.82) + ' 0 0 0 ' + (cx - r * 0.82) + ' ' + (cy + 5) + ' Z';
    var dPulp = 'M ' + (cx - r * 0.86) + ' ' + (cy + 2) +
      ' A ' + (r * 0.86) + ' ' + (r * 0.86) + ' 0 0 1 ' + (cx + r * 0.86) + ' ' + (cy + 2) +
      ' L ' + (cx + r * 0.76) + ' ' + (cy + 6) +
      ' A ' + (r * 0.76) + ' ' + (r * 0.76) + ' 0 0 0 ' + (cx - r * 0.76) + ' ' + (cy + 6) + ' Z';
    cp.setAttribute('d', dPulp);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '92', rx: '26', ry: '3',
      fill: '#000000', opacity: '0.3'
    }));
    root.appendChild(svg('path', {
      d: dOuter, fill: 'url(#gr_' + uid + ')',
      stroke: '#052e16', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
    }));
    root.appendChild(svg('path', { d: dWhite, fill: 'url(#gw_' + uid + ')' }));
    root.appendChild(svg('path', { d: dPulp, fill: 'url(#gp_' + uid + ')' }));

    root.appendChild(svg('path', {
      d: 'M ' + (cx - r * 0.6) + ' ' + (cy - r * 0.55) +
         ' A ' + (r * 0.6) + ' ' + (r * 0.6) + ' 0 0 1 ' + (cx + r * 0.6) + ' ' + (cy - r * 0.55),
      fill: 'none', stroke: '#ffffff', 'stroke-width': '3',
      'stroke-linecap': 'round', opacity: '0.6'
    }));

    var seeds = [[-0.42, 0.42], [-0.18, 0.52], [0.18, 0.52], [0.42, 0.42], [-0.3, 0.7], [0.3, 0.7]];
    for (var i = 0; i < seeds.length; i++) {
      var sx = cx + seeds[i][0] * r;
      var sy = cy + seeds[i][1] * r;
      root.appendChild(svg('ellipse', {
        cx: n2(sx), cy: n2(sy),
        rx: '1.8', ry: '2.6',
        fill: '#1a1a1a',
        'clip-path': 'url(#' + cpId + ')'
      }));
    }
    return root;
  }

  /* ─── 樱桃 · 双球 + 梗 ─── */
  function renderCherry(spec, size) {
    var uid = spec.id + '_ch_' + hash(spec.theme.main);
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--cherry'
    });
    var defs = svg('defs');
    var gBall = svg('radialGradient', { id: 'gbc_' + uid, cx: '0.35', cy: '0.3', r: '0.8' });
    gBall.appendChild(svg('stop', { offset: '0',   'stop-color': '#fecaca' }));
    gBall.appendChild(svg('stop', { offset: '0.3', 'stop-color': '#ef4444' }));
    gBall.appendChild(svg('stop', { offset: '0.8', 'stop-color': '#b91c1c' }));
    gBall.appendChild(svg('stop', { offset: '1',   'stop-color': '#7f1d1d' }));
    defs.appendChild(gBall);
    root.appendChild(defs);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '90', rx: '24', ry: '3',
      fill: '#000000', opacity: '0.32'
    }));

    var lx = 36, ly = 64, lr = 18;
    var rx = 64, ry = 64, rr = 18;

    root.appendChild(svg('path', {
      d: 'M ' + lx + ' ' + (ly - lr * 0.7) + ' Q 50 12 ' + rx + ' ' + (ry - rr * 0.7),
      fill: 'none', stroke: '#166534', 'stroke-width': '2.4',
      'stroke-linecap': 'round'
    }));
    root.appendChild(svg('path', {
      d: 'M 50 20 Q 44 12 38 18 Q 44 24 50 20 Z',
      fill: '#22c55e', stroke: '#14532d', 'stroke-width': '0.8'
    }));

    root.appendChild(svg('circle', {
      cx: lx, cy: ly, r: lr,
      fill: 'url(#gbc_' + uid + ')',
      stroke: '#7f1d1d', 'stroke-width': '1'
    }));
    root.appendChild(svg('circle', {
      cx: rx, cy: ry, r: rr,
      fill: 'url(#gbc_' + uid + ')',
      stroke: '#7f1d1d', 'stroke-width': '1'
    }));

    root.appendChild(svg('ellipse', {
      cx: lx - lr * 0.35, cy: ly - lr * 0.42,
      rx: lr * 0.36, ry: lr * 0.24,
      fill: '#ffffff', opacity: '0.9',
      transform: 'rotate(-30 ' + (lx - lr * 0.35) + ' ' + (ly - lr * 0.42) + ')'
    }));
    root.appendChild(svg('ellipse', {
      cx: lx - lr * 0.45, cy: ly - lr * 0.5,
      rx: lr * 0.14, ry: lr * 0.09,
      fill: '#ffffff', opacity: '1'
    }));
    root.appendChild(svg('ellipse', {
      cx: rx - rr * 0.35, cy: ry - rr * 0.42,
      rx: rr * 0.36, ry: rr * 0.24,
      fill: '#ffffff', opacity: '0.9',
      transform: 'rotate(-30 ' + (rx - rr * 0.35) + ' ' + (ry - rr * 0.42) + ')'
    }));
    root.appendChild(svg('ellipse', {
      cx: rx - rr * 0.45, cy: ry - rr * 0.5,
      rx: rr * 0.14, ry: rr * 0.09,
      fill: '#ffffff', opacity: '1'
    }));
    root.appendChild(svg('ellipse', {
      cx: lx + lr * 0.4, cy: ly + lr * 0.42,
      rx: lr * 0.24, ry: lr * 0.11,
      fill: '#ffffff', opacity: '0.35'
    }));
    root.appendChild(svg('ellipse', {
      cx: rx + rr * 0.4, cy: ry + rr * 0.42,
      rx: rr * 0.24, ry: rr * 0.11,
      fill: '#ffffff', opacity: '0.35'
    }));
    return root;
  }

  /* ─── 圆糖 · 蓝球 ─── */
  function renderRoundCandy(spec, size) {
    return buildGummy(spec, size, {
      d: pCircle(50, 50, 36),
      rimPath: 'M 22 40 Q 50 16 78 40',
      decorate: function (root, svg, uid, t, cpId) {
        root.appendChild(svg('ellipse', {
          cx: '36', cy: '32', rx: '9', ry: '5',
          fill: '#ffffff', opacity: '0.95',
          transform: 'rotate(-30 36 32)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        root.appendChild(svg('ellipse', {
          cx: '34', cy: '28', rx: '3.5', ry: '2',
          fill: '#ffffff', opacity: '1',
          transform: 'rotate(-30 34 28)',
          'clip-path': 'url(#' + cpId + ')'
        }));
      }
    });
  }

  /* ─── 甜甜圈 ─── */
  function renderDonut(spec, size) {
    var uid = spec.id + '_dn_' + hash(spec.theme.main);
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--donut'
    });
    var defs = svg('defs');
    var gDough = svg('radialGradient', { id: 'gd_' + uid, cx: '0.35', cy: '0.3', r: '0.8' });
    gDough.appendChild(svg('stop', { offset: '0',   'stop-color': '#fde68a' }));
    gDough.appendChild(svg('stop', { offset: '0.4', 'stop-color': '#d97706' }));
    gDough.appendChild(svg('stop', { offset: '1',   'stop-color': '#78350f' }));
    defs.appendChild(gDough);
    var gGlaze = svg('radialGradient', { id: 'gg_' + uid, cx: '0.35', cy: '0.3', r: '0.9' });
    gGlaze.appendChild(svg('stop', { offset: '0',   'stop-color': '#fda4af' }));
    gGlaze.appendChild(svg('stop', { offset: '0.4', 'stop-color': '#f43f5e' }));
    gGlaze.appendChild(svg('stop', { offset: '1',   'stop-color': '#9f1239' }));
    defs.appendChild(gGlaze);
    root.appendChild(defs);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '90', rx: '24', ry: '3',
      fill: '#000000', opacity: '0.3'
    }));

    var d = pCircle(50, 52, 36) + ' ' + pCircle(50, 52, 15);
    var cpId = 'dcp_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: d, 'clip-rule': 'evenodd' });
    clip.appendChild(cp);
    defs.appendChild(clip);

    root.appendChild(svg('path', {
      d: d, 'fill-rule': 'evenodd',
      fill: 'url(#gd_' + uid + ')'
    }));
    root.appendChild(svg('path', {
      d: 'M 14 52 A 36 36 0 0 1 86 52 L 86 46 A 36 36 0 0 0 14 46 Z M 35 52 A 15 15 0 0 0 65 52 L 65 46 A 15 15 0 0 1 35 46 Z',
      'fill-rule': 'evenodd',
      fill: 'url(#gg_' + uid + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));
    root.appendChild(svg('path', {
      d: d, 'fill-rule': 'evenodd',
      fill: 'none', stroke: '#4c0519', 'stroke-width': '1.6',
      'stroke-linejoin': 'round'
    }));
    root.appendChild(svg('path', {
      d: 'M 22 42 Q 50 18 78 42',
      fill: 'none', stroke: '#ffffff', 'stroke-width': '3',
      'stroke-linecap': 'round', opacity: '0.6',
      'clip-path': 'url(#' + cpId + ')'
    }));

    var sprinkles = [
      [30, 34, -20, '#facc15'], [46, 26, 40, '#60a5fa'], [62, 32, 20, '#a3e635'],
      [24, 48, 30, '#f472b6'], [74, 44, -10, '#fb923c'], [42, 46, 60, '#c084fc'],
      [58, 46, -40, '#22d3ee'], [50, 60, 10, '#fde047']
    ];
    for (var i = 0; i < sprinkles.length; i++) {
      var sp = sprinkles[i];
      root.appendChild(svg('rect', {
        x: (sp[0] - 3), y: (sp[1] - 1),
        width: '6', height: '2', rx: '1',
        fill: sp[3],
        transform: 'rotate(' + sp[2] + ' ' + sp[0] + ' ' + sp[1] + ')',
        'clip-path': 'url(#' + cpId + ')',
        opacity: '0.95'
      }));
    }
    return root;
  }

  /* ─── 花朵糖 · 六瓣花 ─── */
  function renderFlower(spec, size) {
    return buildGummy(spec, size, {
      d: pFlower(50, 50, 38, 6),
      rimPath: 'M 26 36 Q 50 10 74 36',
      decorate: function (root, svg, uid, t, cpId) {
        /* 中心圆 */
        root.appendChild(svg('circle', {
          cx: '50', cy: '50', r: '10',
          fill: '#fbbf24', stroke: '#92400e', 'stroke-width': '1.2'
        }));
        root.appendChild(svg('circle', {
          cx: '50', cy: '50', r: '5.5',
          fill: '#fde68a', opacity: '0.9'
        }));
        root.appendChild(svg('ellipse', {
          cx: '47', cy: '47', rx: '2.2', ry: '1.4',
          fill: '#ffffff', opacity: '0.95'
        }));
      }
    });
  }

  /* ─── 水滴糖 · 倒水滴 ─── */
  function renderDrop(spec, size) {
    return buildGummy(spec, size, {
      d: pDrop(50, 50, 34),
      rimPath: 'M 40 42 Q 50 28 60 42',
      decorate: function (root, svg, uid, t, cpId) {
        root.appendChild(svg('ellipse', {
          cx: '40', cy: '42', rx: '6', ry: '3.5',
          fill: '#ffffff', opacity: '0.95',
          transform: 'rotate(-20 40 42)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        root.appendChild(svg('ellipse', {
          cx: '42', cy: '36', rx: '2.4', ry: '1.4',
          fill: '#ffffff', opacity: '1',
          transform: 'rotate(-20 42 36)',
          'clip-path': 'url(#' + cpId + ')'
        }));
      }
    });
  }

  /* ─── 钻石糖 · 五边形宝石 ─── */
  function renderDiamond(spec, size) {
    var uid = spec.id + '_dm_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--diamond'
    });
    var defs = svg('defs');
    var gTop = svg('linearGradient', { id: 'dt_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gTop.appendChild(svg('stop', { offset: '0', 'stop-color': '#e0d5ff' }));
    gTop.appendChild(svg('stop', { offset: '1', 'stop-color': t.main }));
    defs.appendChild(gTop);
    var gBot = svg('linearGradient', { id: 'db_' + uid, x1: '0', y1: '0', x2: '0', y2: '1' });
    gBot.appendChild(svg('stop', { offset: '0', 'stop-color': t.main }));
    gBot.appendChild(svg('stop', { offset: '1', 'stop-color': t.dark }));
    defs.appendChild(gBot);
    var gSpec = svg('radialGradient', { id: 'ds_' + uid, cx: '0.35', cy: '0.25', r: '0.6' });
    gSpec.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    gSpec.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gSpec);
    root.appendChild(defs);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '88', rx: '22', ry: '3',
      fill: '#000000', opacity: '0.32'
    }));

    /* 外轮廓：五边形宝石 */
    var outer = 'M 50 12 L 84 32 L 84 68 L 50 88 L 16 68 L 16 32 Z';
    /* 上部（亮） */
    var top = 'M 50 12 L 84 32 L 50 50 L 16 32 Z';
    /* 下部（暗） */
    var bot = 'M 50 50 L 84 32 L 84 68 L 50 88 L 16 68 L 16 32 Z';

    root.appendChild(svg('path', {
      d: outer, fill: 'url(#db_' + uid + ')',
      stroke: t.dark, 'stroke-width': '1.5', 'stroke-linejoin': 'round'
    }));
    root.appendChild(svg('path', {
      d: top, fill: 'url(#dt_' + uid + ')',
      stroke: t.dark, 'stroke-width': '1.2', 'stroke-linejoin': 'round'
    }));
    /* 菱形切面 */
    root.appendChild(svg('path', {
      d: 'M 50 12 L 50 88',
      fill: 'none', stroke: '#ffffff', 'stroke-width': '0.8', opacity: '0.5'
    }));
    root.appendChild(svg('path', {
      d: 'M 16 32 L 84 32',
      fill: 'none', stroke: '#ffffff', 'stroke-width': '0.8', opacity: '0.5'
    }));
    root.appendChild(svg('path', {
      d: 'M 16 68 L 84 68',
      fill: 'none', stroke: '#ffffff', 'stroke-width': '0.8', opacity: '0.3'
    }));
    /* 左上高光 */
    root.appendChild(svg('path', {
      d: 'M 22 30 L 46 18 L 38 38 Z',
      fill: '#ffffff', opacity: '0.85'
    }));
    /* 微星芒 */
    root.appendChild(svg('path', {
      d: 'M 60 24 L 62 28 L 66 30 L 62 32 L 60 36 L 58 32 L 54 30 L 58 28 Z',
      fill: '#ffffff', opacity: '0.9'
    }));
    return root;
  }

  /* ─── 星星糖 · 五角星 ─── */
  function renderStar(spec, size) {
    return buildGummy(spec, size, {
      d: pStar(50, 52, 38, 5, 0.45),
      rimPath: 'M 30 34 Q 50 14 70 34',
      decorate: function (root, svg, uid, t, cpId) {
        /* 内星（小） */
        root.appendChild(svg('path', {
          d: pStar(50, 54, 18, 5, 0.45),
          fill: '#ffffff', opacity: '0.4',
          'clip-path': 'url(#' + cpId + ')'
        }));
        /* 左上尖高光 */
        root.appendChild(svg('ellipse', {
          cx: '36', cy: '30', rx: '5', ry: '3',
          fill: '#ffffff', opacity: '0.95',
          transform: 'rotate(-40 36 30)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        /* 微闪 */
        root.appendChild(svg('path', {
          d: 'M 62 22 L 63.5 25 L 66.5 26.5 L 63.5 28 L 62 31 L 60.5 28 L 57.5 26.5 L 60.5 25 Z',
          fill: '#ffffff', opacity: '0.9'
        }));
      }
    });
  }

  /* ─── 红心糖 ─── */
  function renderHeart(spec, size) {
    return buildGummy(spec, size, {
      d: pHeart(50, 48, 34),
      rimPath: 'M 28 38 Q 36 20 50 30 Q 64 20 72 38',
      decorate: function (root, svg, uid, t, cpId) {
        /* 左上大高光 */
        root.appendChild(svg('ellipse', {
          cx: '34', cy: '34', rx: '7', ry: '4',
          fill: '#ffffff', opacity: '0.95',
          transform: 'rotate(-30 34 34)',
          'clip-path': 'url(#' + cpId + ')'
        }));
        root.appendChild(svg('ellipse', {
          cx: '31', cy: '30', rx: '2.6', ry: '1.5',
          fill: '#ffffff', opacity: '1',
          transform: 'rotate(-30 31 30)',
          'clip-path': 'url(#' + cpId + ')'
        }));
      }
    });
  }

  /* ─── 棒棒糖 · 圆盘 + 棍 + 螺旋 ─── */
  function renderLollipop(spec, size) {
    var uid = spec.id + '_lp_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--lolli'
    });
    var defs = svg('defs');
    var gMain = svg('radialGradient', { id: 'lp_' + uid, cx: '0.35', cy: '0.3', r: '0.8' });
    gMain.appendChild(svg('stop', { offset: '0',   'stop-color': t.light }));
    gMain.appendChild(svg('stop', { offset: '0.3', 'stop-color': t.main }));
    gMain.appendChild(svg('stop', { offset: '0.85','stop-color': '#e11d48' }));
    gMain.appendChild(svg('stop', { offset: '1',   'stop-color': '#7f1d1d' }));
    defs.appendChild(gMain);
    var cpId = 'lpc_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: pCircle(50, 38, 28) });
    clip.appendChild(cp);
    defs.appendChild(clip);
    /* 霓虹 halo */
    var gHalo = svg('radialGradient', { id: 'lh_' + uid, cx: '0.5', cy: '0.5', r: '0.5' });
    gHalo.appendChild(svg('stop', { offset: '0.5', 'stop-color': '#facc15', 'stop-opacity': '0' }));
    gHalo.appendChild(svg('stop', { offset: '1',   'stop-color': '#facc15', 'stop-opacity': '0.7' }));
    defs.appendChild(gHalo);
    root.appendChild(defs);

    /* 棍 */
    root.appendChild(svg('rect', {
      x: '47', y: '62', width: '6', height: '28', rx: '3',
      fill: '#fef3c7', stroke: '#a16207', 'stroke-width': '1'
    }));
    /* 地面阴影 */
    root.appendChild(svg('ellipse', {
      cx: '50', cy: '92', rx: '8', ry: '2',
      fill: '#000000', opacity: '0.3'
    }));
    /* 圆盘 */
    root.appendChild(svg('circle', {
      cx: '50', cy: '38', r: '28',
      fill: 'url(#lp_' + uid + ')',
      stroke: '#7f1d1d', 'stroke-width': '1.5'
    }));
    /* 螺旋（3 圈白线，旋转中） */
    root.appendChild(svg('path', {
      d: 'M 50 10 C 65 14, 78 26, 74 42 C 70 58, 50 62, 38 54 C 26 46, 28 30, 40 24 C 52 18, 62 26, 60 38',
      fill: 'none', stroke: '#ffffff', 'stroke-width': '2.2',
      'stroke-linecap': 'round', opacity: '0.85',
      'clip-path': 'url(#' + cpId + ')'
    }));
    /* 左上高光 */
    root.appendChild(svg('ellipse', {
      cx: '38', cy: '26', rx: '8', ry: '5',
      fill: '#ffffff', opacity: '0.9',
      transform: 'rotate(-30 38 26)',
      'clip-path': 'url(#' + cpId + ')'
    }));
    root.appendChild(svg('ellipse', {
      cx: '34', cy: '22', rx: '3', ry: '1.8',
      fill: '#ffffff', opacity: '1',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 霓虹光晕 */
    root.appendChild(svg('circle', {
      cx: '50', cy: '38', r: '36',
      fill: 'url(#lh_' + uid + ')',
      opacity: '0.9'
    }));

    return root;
  }

  /* ─── 彩虹糖 · WILD 彩虹环 ─── */
  function renderWild(spec, size) {
    var uid = spec.id + '_wd_' + hash(spec.theme.main);
    var t = spec.theme;
    var root = svgRoot('0 0 100 100', {
      width: size, height: size,
      'class': 'sd-sym-art sd-sym-art--wild'
    });
    var defs = svg('defs');

    var colors = ['#ff3d7f', '#ffb300', '#22c55e', '#06b6d4', '#7c5cff', '#ec4899'];
    for (var i = 0; i < colors.length; i++) {
      var gRing = svg('linearGradient', { id: 'wr_' + uid + '_' + i, x1: '0', y1: '0', x2: '1', y2: '1' });
      gRing.appendChild(svg('stop', { offset: '0', 'stop-color': colors[i] }));
      gRing.appendChild(svg('stop', { offset: '1', 'stop-color': colors[(i + 1) % colors.length] }));
      defs.appendChild(gRing);
    }

    var cpId = 'wdc_' + uid;
    var clip = svg('clipPath', { id: cpId });
    var cp = svg('path', { d: pCircle(50, 50, 36) });
    clip.appendChild(cp);
    defs.appendChild(clip);

    var gSpec = svg('radialGradient', { id: 'ws_' + uid, cx: '0.35', cy: '0.28', r: '0.7' });
    gSpec.appendChild(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.95' }));
    gSpec.appendChild(svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
    defs.appendChild(gSpec);
    root.appendChild(defs);

    root.appendChild(svg('ellipse', {
      cx: '50', cy: '88', rx: '24', ry: '3',
      fill: '#000000', opacity: '0.3'
    }));

    /* 彩虹环（同心圆） */
    var rings = [
      { r: 34, i: 0, w: 8 },
      { r: 26, i: 1, w: 7 },
      { r: 18, i: 2, w: 6 },
      { r: 10, i: 3, w: 5 },
      { r: 4,  i: 4, w: 4 }
    ];
    for (var k = 0; k < rings.length; k++) {
      root.appendChild(svg('circle', {
        cx: '50', cy: '50', r: rings[k].r,
        fill: 'none',
        stroke: 'url(#wr_' + uid + '_' + rings[k].i + ')',
        'stroke-width': rings[k].w,
        'clip-path': 'url(#' + cpId + ')'
      }));
    }

    /* 白色高光 */
    root.appendChild(svg('circle', {
      cx: '50', cy: '50', r: '36',
      fill: 'url(#ws_' + uid + ')',
      'clip-path': 'url(#' + cpId + ')'
    }));

    /* 外描边 */
    root.appendChild(svg('circle', {
      cx: '50', cy: '50', r: '36',
      fill: 'none', stroke: '#4c1d95',
      'stroke-width': '1.5', opacity: '0.85'
    }));

    /* 外圈 sparkle */
    for (var si = 0; si < 5; si++) {
      var a = (si / 5) * Math.PI * 2 - Math.PI / 2;
      var sx = 50 + Math.cos(a) * 42;
      var sy = 50 + Math.sin(a) * 42;
      root.appendChild(svg('path', {
        d: 'M ' + n2(sx) + ' ' + n2(sy - 3) +
           ' L ' + n2(sx + 1.2) + ' ' + n2(sy - 1.2) +
           ' L ' + n2(sx + 3) + ' ' + n2(sy) +
           ' L ' + n2(sx + 1.2) + ' ' + n2(sy + 1.2) +
           ' L ' + n2(sx) + ' ' + n2(sy + 3) +
           ' L ' + n2(sx - 1.2) + ' ' + n2(sy + 1.2) +
           ' L ' + n2(sx - 3) + ' ' + n2(sy) +
           ' L ' + n2(sx - 1.2) + ' ' + n2(sy - 1.2) + ' Z',
        fill: '#ffffff', opacity: n2(0.55 + (si % 2) * 0.35)
      }));
    }

    return root;
  }

  /* ══════════════════════════════════════════════════════════
     Dispatcher · 按 spec.shape 选择渲染器
     ══════════════════════════════════════════════════════════ */
  function buildSymbolArt(spec, size) {
    switch (spec.shape) {
      case 'banana':     return renderBanana(spec, size);
      case 'grape':      return renderGrape(spec, size);
      case 'watermelon': return renderWatermelon(spec, size);
      case 'cherry':     return renderCherry(spec, size);
      case 'circle':     return renderRoundCandy(spec, size);
      case 'ring':       return renderDonut(spec, size);
      case 'flower':     return renderFlower(spec, size);
      case 'drop':       return renderDrop(spec, size);
      case 'diamond':    return renderDiamond(spec, size);
      case 'star5':      return renderStar(spec, size);
      case 'star6':      return renderStar(spec, size);
      case 'heart':      return renderHeart(spec, size);
      case 'lollipop':   return renderLollipop(spec, size);
      case 'wild':       return renderWild(spec, size);
      default:           return renderRoundCandy(spec, size);
    }
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
