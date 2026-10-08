/* Apex · Candy Tumble · Symbol Renderer (v1)
 *
 * 12 个符号的内联 SVG 渲染器。
 * 与 math 完全独立：接收 symbolId，返回 SVG 字符串。
 *
 * 挂载：window.ApexEngineSymbolRender
 *
 * 用途：
 *   sweet-symbol-renderer.js 会优先调用本模块；
 *   若本模块不可用，则回退到旧的 <symbol>/<use> 方式。
 */
(function () {
  'use strict';

  var uid = 0;
  function nextUid(prefix) {
    uid += 1;
    return prefix + '-' + uid.toString(36);
  }

  /* =========================================================
   * ID 映射：HTML 里的 symbol id → painter key
   *
   * 现有 sweet-symbols.js 使用：
   *   BANANA → 'sb-fruit-banana'
   *   GRAPE  → 'sb-fruit-grape'
   *   ...
   * 我们做反向映射。
   * ======================================================= */
  var ID_TO_KEY = {
    'sb-fruit-banana':     'BANANA',
    'sb-fruit-grape':      'GRAPE',
    'sb-fruit-watermelon': 'WATERMELON',
    'sb-fruit-plum':       'PLUM',
    'sb-fruit-apple':      'APPLE',
    'sb-candy-blue':       'BLUE_CANDY',
    'sb-candy-green':      'GREEN_CANDY',
    'sb-candy-purple':     'PURPLE_CANDY',
    'sb-candy-heart':      'RED_HEART',
    'sb-scatter-lollipop': 'SCATTER',
    'sb-multiplier-bomb':  'MULTIPLIER'
  };

  /* =========================================================
   * 工具
   * ======================================================= */
  function groundShadow(cx, cy, rx, ry, opacity) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx
      + '" ry="' + ry + '" fill="#000" opacity="' + opacity + '"/>';
  }

  function gloss(cx, cy, rx, ry, rot, opacity) {
    var t = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '';
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry
      + '" fill="#FFFFFF" opacity="' + opacity + '"' + t + '/>';
  }

  function radial(id, cx, cy, r, stops) {
    var s = '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">';
    for (var i = 0; i < stops.length; i++) {
      s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"'
        + (stops[i][2] ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
    }
    return s + '</radialGradient>';
  }

  function linear(id, x1, y1, x2, y2, stops) {
    var s = '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1
      + '" x2="' + x2 + '" y2="' + y2 + '">';
    for (var i = 0; i < stops.length; i++) {
      s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"'
        + (stops[i][2] ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
    }
    return s + '</linearGradient>';
  }

  /* =========================================================
   * 12 个 painter
   * ======================================================= */
  var PAINTERS = {};

  // --- BANANA ---
  PAINTERS.BANANA = function (u) {
    var body = 'ban-body-' + u;
    var hl = 'ban-hl-' + u;
    return '<defs>'
      + linear(body, '0', '0', '1', '1', [
          ['0%', '#FFF8A0'], ['18%', '#FFE54A'], ['45%', '#FFC600'],
          ['76%', '#F09A00'], ['100%', '#B96600']
        ])
      + linear(hl, '0', '0', '1', '0', [
          ['0%', '#FFFFFF', '0.85'], ['55%', '#FFF8A5', '0.4'], ['100%', '#FFFFFF', '0']
        ])
      + '</defs>'
      + groundShadow(51, 83, 29, 6, 0.42)
      + '<path d="M17 26 C17 45 28 65 48 70 C66 75 79 61 81 43 C82 37 80 30 76 24 L70 27 C72 42 66 53 56 56 C42 60 29 46 27 27 Z"'
      + ' fill="url(#' + body + ')" stroke="#B87800" stroke-width="1.5" stroke-linejoin="round"/>'
      + '<path d="M20 27 C22 44 31 59 48 66 C61 70 74 60 78 45"'
      + ' fill="none" stroke="#FFF58B" stroke-width="3" stroke-linecap="round" opacity="0.65"/>'
      + '<path d="M25 29 C27 43 34 54 44 59"'
      + ' fill="none" stroke="url(#' + hl + ')" stroke-width="4" stroke-linecap="round" opacity="0.9"/>'
      + '<path d="M17 26 C15 22 16 17 20 16 C23 15 25 18 25 21 L24 28" fill="#DDA000"/>'
      + '<path d="M76 24 C76 19 78 16 81 17 C84 18 84 23 81 27 L78 30" fill="#B86E00"/>'
      + gloss(31, 27, 8, 6, -27, 0.92);
  };

  // --- GRAPE ---
  PAINTERS.GRAPE = function (u) {
    var body = 'grp-body-' + u;
    return '<defs>'
      + radial(body, '34%', '28%', '72%', [
          ['0%', '#E9D5FF'], ['26%', '#B985EE'], ['60%', '#7C3AED'],
          ['88%', '#4C1D95'], ['100%', '#2A0F5C']
        ])
      + '</defs>'
      + groundShadow(50, 84, 24, 5, 0.4)
      + '<path d="M50 24 Q48 12 56 8 Q54 18 54 24 Z" fill="#4D7C0F"/>'
      + '<path d="M50 20 Q62 14 70 20 Q62 28 52 26 Z" fill="#65A30D"/>'
      + '<circle cx="42" cy="38" r="14" fill="url(#' + body + ')"/>'
      + '<circle cx="58" cy="38" r="14" fill="url(#' + body + ')"/>'
      + '<circle cx="50" cy="52" r="14" fill="url(#' + body + ')"/>'
      + '<circle cx="42" cy="52" r="14" fill="url(#' + body + ')"/>'
      + '<circle cx="58" cy="52" r="14" fill="url(#' + body + ')"/>'
      + '<circle cx="50" cy="66" r="14" fill="url(#' + body + ')"/>'
      + gloss(38, 33, 5, 3.5, -25, 0.85)
      + gloss(54, 33, 5, 3.5, -25, 0.85)
      + gloss(46, 47, 5, 3.5, -25, 0.85)
      + gloss(62, 47, 5, 3.5, -25, 0.85)
      + gloss(46, 61, 5, 3.5, -25, 0.85);
  };

  // --- WATERMELON ---
  PAINTERS.WATERMELON = function (u) {
    var flesh = 'wm-flesh-' + u;
    return '<defs>'
      + linear(flesh, '0', '0', '0', '1', [
          ['0%', '#FF8797'], ['55%', '#EE3F56'], ['100%', '#9C0D24']
        ])
      + '</defs>'
      + groundShadow(50, 86, 28, 5, 0.42)
      + '<path d="M20 80 A60 60 0 0 1 140 80 Z" fill="#14532D"/>'
      + '<path d="M26 80 A54 54 0 0 1 134 80 Z" fill="#22C55E"/>'
      + '<path d="M32 80 A48 48 0 0 1 128 80 Z" fill="#F0FDF4"/>'
      + '<path d="M36 80 A44 44 0 0 1 124 80 Z" fill="url(#' + flesh + ')"/>'
      + gloss(58, 58, 10, 5, -24, 0.5)
      + '<ellipse cx="60" cy="68" rx="2.6" ry="4.5" fill="#0F172A" transform="rotate(-22 60 68)"/>'
      + '<ellipse cx="80" cy="66" rx="2.6" ry="4.5" fill="#0F172A" transform="rotate(-6 80 66)"/>'
      + '<ellipse cx="100" cy="70" rx="2.6" ry="4.5" fill="#0F172A" transform="rotate(15 100 70)"/>'
      + '<ellipse cx="70" cy="76" rx="2.6" ry="4.5" fill="#0F172A" transform="rotate(-10 70 76)"/>'
      + '<ellipse cx="90" cy="76" rx="2.6" ry="4.5" fill="#0F172A" transform="rotate(10 90 76)"/>';
  };

  // --- PLUM ---
  PAINTERS.PLUM = function (u) {
    var body = 'plm-body-' + u;
    return '<defs>'
      + radial(body, '34%', '26%', '78%', [
          ['0%', '#E5D4FF'], ['24%', '#A78BFA'], ['60%', '#6D28D9'],
          ['88%', '#4C1D95'], ['100%', '#2A0F5C']
        ])
      + '</defs>'
      + groundShadow(50, 84, 24, 5, 0.42)
      + '<path d="M50 24 Q56 14 64 16 Q58 26 52 28 Z" fill="#4D7C0F"/>'
      + '<path d="M50 26 Q52 18 58 14" stroke="#4D7C0F" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<ellipse cx="50" cy="52" rx="30" ry="28" fill="url(#' + body + ')"/>'
      + '<path d="M50 26 Q48 50 50 80" stroke="rgba(40,10,80,.3)" stroke-width="1.5" fill="none"/>'
      + gloss(38, 38, 10, 7, -28, 0.55)
      + gloss(32, 32, 4, 3, -28, 0.82);
  };

  // --- APPLE ---
  PAINTERS.APPLE = function (u) {
    var body = 'apl-body-' + u;
    return '<defs>'
      + radial(body, '34%', '26%', '78%', [
          ['0%', '#FFE0E0'], ['22%', '#F87171'], ['58%', '#DC2626'],
          ['86%', '#7F1D1D'], ['100%', '#450A0A']
        ])
      + '</defs>'
      + groundShadow(50, 84, 24, 5, 0.42)
      + '<path d="M50 80 C42 75 25 62 25 46 C25 34 35 25 46 29 C48 30 50 32 50 34 C50 32 52 30 54 29 C65 25 75 34 75 46 C75 62 58 75 50 80 Z"'
      + ' fill="url(#' + body + ')"/>'
      + '<path d="M50 30 Q50 18 56 14" stroke="#78350F" stroke-width="3" fill="none" stroke-linecap="round"/>'
      + '<path d="M50 22 Q62 14 70 18 Q64 28 54 26 Z" fill="#22C55E"/>'
      + gloss(38, 40, 10, 7, -25, 0.55)
      + gloss(33, 34, 4, 3, -25, 0.82);
  };

  // --- BLUE_CANDY ---
  PAINTERS.BLUE_CANDY = function (u) {
    var body = 'bc-body-' + u;
    var edge = 'bc-edge-' + u;
    var shine = 'bc-shine-' + u;
    return '<defs>'
      + radial(body, '30%', '23%', '78%', [
          ['0%', '#F4FAFF'], ['9%', '#B5D7FF'], ['28%', '#579AFF'],
          ['55%', '#246AD7'], ['82%', '#0D438F'], ['100%', '#061F50']
        ])
      + linear(edge, '0', '0', '1', '1', [
          ['0%', '#91C4FF', '0.7'], ['55%', '#1E61C7', '0.25'], ['100%', '#00183D', '0.9']
        ])
      + radial(shine, '30%', '20%', '70%', [
          ['0%', '#FFFFFF', '0.95'], ['35%', '#FFFFFF', '0.45'], ['100%', '#FFFFFF', '0']
        ])
      + '</defs>'
      + groundShadow(50, 83, 25, 4.8, 0.42)
      + '<circle cx="50" cy="50" r="31" fill="url(#' + edge + ')"/>'
      + '<circle cx="50" cy="48" r="28.5" fill="url(#' + body + ')"/>'
      + '<ellipse cx="38" cy="34" rx="19" ry="17" fill="url(#' + shine + ')"/>'
      + gloss(31, 27, 8, 6, -25, 0.92)
      + '<circle cx="64" cy="62" r="2.2" fill="#DCEBFF" opacity="0.8"/>'
      + '<circle cx="69" cy="58" r="1" fill="#FFFFFF" opacity="0.75"/>';
  };

  // --- GREEN_CANDY ---
  PAINTERS.GREEN_CANDY = function (u) {
    var body = 'gc-body-' + u;
    var shade = 'gc-shade-' + u;
    return '<defs>'
      + linear(body, '0', '0', '1', '1', [
          ['0%', '#E6FFD9'], ['22%', '#A0E57E'], ['55%', '#4CB23B'],
          ['85%', '#1E7A1A'], ['100%', '#0C4410']
        ])
      + linear(shade, '0', '0', '0', '1', [
          ['0%', 'rgba(0,0,0,0)'], ['100%', 'rgba(4,32,8,.32)']
        ])
      + '</defs>'
      + groundShadow(50, 86, 24, 5, 0.42)
      + '<polygon points="50,18 80,36 80,66 50,84 20,66 20,36" fill="url(#' + body + ')" stroke="#1E7A1A" stroke-width="1.5"/>'
      + '<polygon points="50,18 80,36 80,66 50,84 20,66 20,36" fill="url(#' + shade + ')"/>'
      + '<polygon points="50,24 74,38 74,62 50,76 26,62 26,38" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>'
      + gloss(40, 34, 8, 5, -30, 0.6);
  };

  // --- PURPLE_CANDY ---
  PAINTERS.PURPLE_CANDY = function (u) {
    var body = 'pc-body-' + u;
    var shade = 'pc-shade-' + u;
    return '<defs>'
      + radial(body, '34%', '26%', '76%', [
          ['0%', '#F3E5FF'], ['24%', '#C39BF6'], ['58%', '#8B46E0'],
          ['86%', '#5B1FA5'], ['100%', '#340F66']
        ])
      + linear(shade, '0', '0', '0', '1', [
          ['0%', 'rgba(0,0,0,0)'], ['100%', 'rgba(28,6,58,.34)']
        ])
      + '</defs>'
      + groundShadow(50, 84, 24, 5, 0.42)
      + '<rect x="28" y="28" width="44" height="44" rx="10" fill="url(#' + body + ')" transform="rotate(8 50 50)"/>'
      + '<rect x="28" y="28" width="44" height="44" rx="10" fill="url(#' + shade + ')" transform="rotate(8 50 50)"/>'
      + '<rect x="32" y="32" width="36" height="36" rx="8" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" transform="rotate(8 50 50)"/>'
      + gloss(40, 38, 8, 5, -28, 0.6);
  };

  // --- RED_HEART ---
  PAINTERS.RED_HEART = function (u) {
    var body = 'rh-body-' + u;
    var inner = 'rh-inner-' + u;
    var bottom = 'rh-bottom-' + u;
    return '<defs>'
      + radial(body, '32%', '24%', '80%', [
          ['0%', '#FFF0F2'], ['12%', '#FFB4BD'], ['34%', '#FF6476'],
          ['64%', '#E52E47'], ['84%', '#A50F2D'], ['100%', '#5D0819']
        ])
      + radial(inner, '38%', '30%', '68%', [
          ['0%', '#FFF', '0.35'], ['25%', '#FFD9DF', '0.20'],
          ['58%', '#FF6578', '0.05'], ['100%', '#5C0818', '0']
        ])
      + linear(bottom, '0', '0', '0', '1', [
          ['0%', '#8C1028', '0'], ['72%', '#7A0B22', '0.14'], ['100%', '#420511', '0.46']
        ])
      + '</defs>'
      + groundShadow(50, 84, 24, 5, 0.42)
      + '<path d="M50 78 C46 74 24 60 24 44 C24 32 33 26 42 29 C46 30 49 33 50 37 C51 33 54 30 58 29 C67 26 76 32 76 44 C76 60 54 74 50 78 Z"'
      + ' fill="url(#' + body + ')"/>'
      + '<path d="M50 76 C46 72 26 59 26 45 C26 34 34 29 42 32 C45 33 48 35 50 39 C52 35 55 33 58 32 C66 29 74 34 74 45 C74 59 54 72 50 76 Z"'
      + ' fill="url(#' + inner + ')"/>'
      + '<path d="M26 50 C32 66 44 76 50 78 C56 76 68 66 74 50 C68 64 58 71 50 71 C42 71 32 64 26 50 Z"'
      + ' fill="url(#' + bottom + ')"/>'
      + gloss(38, 36, 10, 7, -25, 0.55)
      + gloss(33, 32, 5, 3.5, -25, 0.82);
  };

  // --- SCATTER (LOLLIPOP) ---
  PAINTERS.SCATTER = function (u) {
    var candy = 'lp-candy-' + u;
    var stick = 'lp-stick-' + u;
    return '<defs>'
      + radial(candy, '30%', '20%', '80%', [
          ['0%', '#FFF3FA'], ['16%', '#FFB5DA'], ['40%', '#FF61AC'],
          ['72%', '#ED2584'], ['100%', '#970B4C']
        ])
      + linear(stick, '0', '0', '1', '0', [
          ['0%', '#EAEAEA'], ['35%', '#FFFFFF'], ['60%', '#D7D7D7'], ['100%', '#A8A8A8']
        ])
      + '</defs>'
      + groundShadow(50, 88, 15, 4, 0.32)
      + '<path d="M50 53 L50 88" stroke="#000" stroke-width="6" opacity="0.15" stroke-linecap="round"/>'
      + '<path d="M49 53 L49 88" stroke="url(#' + stick + ')" stroke-width="4" stroke-linecap="round"/>'
      + '<path d="M48 54 L48 87" stroke="#FFFFFF" stroke-width="1.2" opacity="0.82" stroke-linecap="round"/>'
      + '<circle cx="50" cy="39" r="25" fill="url(#' + candy + ')" stroke="#A40E53" stroke-width="1.5"/>'
      + '<circle cx="50" cy="39" r="20" fill="none" stroke="#FFD0E7" stroke-width="2" opacity="0.58"/>'
      + '<path d="M40 30 C47 25 57 27 62 33 C67 39 63 48 56 51 C48 54 39 50 36 43 C32 35 38 28 46 27 C56 25 64 31 66 39"'
      + ' fill="none" stroke="#FFE5F2" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>'
      + '<path d="M46 33 C51 30 56 31 58 35 C61 40 57 44 53 45 C48 47 43 44 43 40 C42 36 45 34 49 33"'
      + ' fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.72"/>'
      + gloss(40, 29, 7, 5, -25, 0.88)
      + '<circle cx="35" cy="36" r="1.8" fill="#FFFFFF" opacity="0.55"/>';
  };

  // --- MULTIPLIER ---
  PAINTERS.MULTIPLIER = function (u) {
    var body = 'ml-body-' + u;
    var halo = 'ml-halo-' + u;
    return '<defs>'
      + radial(body, '38%', '32%', '72%', [
          ['0%', '#FFF7D6'], ['22%', '#FDE047'], ['55%', '#F59E0B'],
          ['85%', '#B45309'], ['100%', '#451A03']
        ])
      + radial(halo, '50%', '50%', '50%', [
          ['60%', 'rgba(253,224,71,0)'],
          ['85%', 'rgba(253,224,71,0.32)'],
          ['100%', 'rgba(253,224,71,0)']
        ])
      + '</defs>'
      + groundShadow(50, 84, 26, 5, 0.4)
      + '<circle cx="50" cy="48" r="40" fill="url(#' + halo + ')"/>'
      + '<circle cx="50" cy="48" r="29" fill="url(#' + body + ')" stroke="#B66A00" stroke-width="1.8"/>'
      + '<path d="M50 22 L56 39 L74 39 L59 49 L65 66 L50 56 L35 66 L41 49 L26 39 L44 39 Z" fill="#FFF4A2" opacity="0.42"/>'
      + '<text x="50" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="900" fill="#8A4600">&#215;</text>'
      + gloss(38, 31, 10, 6, -25, 0.45);
  };

  /* =========================================================
   * 渲染入口
   *
   * render(symbolId, options) → 完整 SVG 字符串
   * ======================================================= */
  function render(symbolId, opts) {
    opts = opts || {};
    var key = ID_TO_KEY[symbolId] || symbolId;   // 允许直接传 key
    var painter = PAINTERS[key];
    if (!painter) return '';

    var u = nextUid('s');
    var size = opts.size == null ? '100%' : opts.size;
    var state = opts.state || 'idle';
    var cls = 'slot-symbol slot-symbol--' + state;
    if (opts.highlighted) cls += ' slot-symbol--highlighted';

    var inner = painter(u);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100"'
      + ' xmlns="http://www.w3.org/2000/svg"'
      + ' preserveAspectRatio="xMidYMid meet"'
      + ' aria-hidden="true" class="' + cls + '">'
      + inner
      + '</svg>';
  }

  function has(symbolId) {
    var key = ID_TO_KEY[symbolId] || symbolId;
    return Object.prototype.hasOwnProperty.call(PAINTERS, key);
  }

  function list() {
    return Object.keys(PAINTERS);
  }

  /* =========================================================
   * 导出
   * ======================================================= */
  window.ApexEngineSymbolRender = Object.freeze({
    render: render,
    has: has,
    list: list,
    PAINTERS: Object.freeze(PAINTERS),
    ID_TO_KEY: Object.freeze(ID_TO_KEY)
  });
})();
