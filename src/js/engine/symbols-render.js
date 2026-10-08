/* Apex · Candy Tumble · Symbol Renderer (v2)
 *
 * 11 个符号的内联 SVG 渲染器。
 * 使用新 symbols.js 的 ID（banana / grape / ...）作为 key，
 * 同时兼容旧 HTML symbol id（sb-fruit-banana 等）。
 *
 * 挂载：window.ApexEngineSymbolRender
 */
(function () {
  'use strict';

  var uid = 0;
  function nextUid(prefix) {
    uid += 1;
    return prefix + '-' + uid.toString(36);
  }

  /* =========================================================
   * ID 映射
   *   新 symbols.js ID → painter key
   *   旧 HTML symbol id → painter key（兼容）
   * ======================================================= */
  var ID_TO_KEY = {
    // ---- 新 symbols.js ID ----
    'banana':         'BANANA',
    'grape':          'GRAPE',
    'watermelon':     'WATERMELON',
    'plum':           'PLUM',
    'apple':          'APPLE',
    'blue_candy':     'BLUE_CANDY',
    'green_candy':    'GREEN_CANDY',
    'purple_candy':   'PURPLE_CANDY',
    'red_heart_candy':'RED_HEART_CANDY',
    'lollipop':       'LOLLIPOP',
    'multiplier_bomb':'MULTIPLIER_BOMB',
    // ---- 旧 HTML symbol id（兼容）----
    'sb-fruit-banana':     'BANANA',
    'sb-fruit-grape':      'GRAPE',
    'sb-fruit-watermelon': 'WATERMELON',
    'sb-fruit-plum':       'PLUM',
    'sb-fruit-apple':      'APPLE',
    'sb-candy-blue':       'BLUE_CANDY',
    'sb-candy-green':      'GREEN_CANDY',
    'sb-candy-purple':     'PURPLE_CANDY',
    'sb-candy-heart':      'RED_HEART_CANDY',
    'sb-scatter-lollipop': 'LOLLIPOP',
    'sb-multiplier-bomb':  'MULTIPLIER_BOMB'
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
   * painters
   * ======================================================= */
  var PAINTERS = {};

  // ─────────────────────────────────────────────
  // 🍌 BANANA —— 粗月牙 + 双茎 + 内高光线
  // ─────────────────────────────────────────────
  PAINTERS.BANANA = function (u) {
    var body = 'ban-body-' + u;
    var hl = 'ban-hl-' + u;
    return '<defs>'
      + linear(body, '0.1', '0', '0.85', '1', [
          ['0%', '#FFFDE7'],
          ['12%', '#FFF59D'],
          ['38%', '#FFD93D'],
          ['68%', '#F5B700'],
          ['92%', '#B87200'],
          ['100%', '#7A4A00']
        ])
      + linear(hl, '0', '0', '1', '0', [
          ['0%', '#FFFFFF', '0.9'],
          ['60%', '#FFF9B0', '0.35'],
          ['100%', '#FFFFFF', '0']
        ])
      + '</defs>'
      + groundShadow(50, 84, 32, 6, 0.42)
      // 香蕉主体（粗月牙）
      + '<path d="M14 24'
      + ' C12 46 24 68 46 76'
      + ' C68 82 84 66 86 42'
      + ' C87 34 84 27 79 21'
      + ' L72 25'
      + ' C76 40 74 56 64 62'
      + ' C48 70 32 54 30 34'
      + ' L28 24 Z"'
      + ' fill="url(#' + body + ')" stroke="#8B5500" stroke-width="1.4" stroke-linejoin="round"/>'
      // 内层高光弧形
      + '<path d="M22 30 C24 50 34 64 50 70 C64 74 76 62 80 46"'
      + ' fill="none" stroke="#FFFACD" stroke-width="3.5" stroke-linecap="round" opacity="0.72"/>'
      // 主高光条
      + '<path d="M28 32 C30 46 38 58 50 64"'
      + ' fill="none" stroke="url(#' + hl + ')" stroke-width="4.5" stroke-linecap="round"/>'
      // 次高光（更细）
      + '<path d="M38 42 C40 54 46 62 54 66"'
      + ' fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>'
      // 左茎（深色小方块）
      + '<path d="M14 24 C12 20 14 15 18 14 C22 13 24 17 23 21 L22 26 Z" fill="#8B5500"/>'
      + '<path d="M16 17 C18 15 20 16 21 18" fill="none" stroke="#FFE082" stroke-width="1.4" stroke-linecap="round"/>'
      // 右茎
      + '<path d="M79 21 C79 16 82 13 86 14 C90 16 89 21 86 25 L82 27 Z" fill="#7A4A00"/>'
      + '<path d="M83 16 C85 15 87 17 86 19" fill="none" stroke="#FFCC66" stroke-width="1.3" stroke-linecap="round"/>'
      // 主高光
      + gloss(34, 32, 7, 5.5, -32, 0.9);
  };

  // ─────────────────────────────────────────────
  // 🍇 GRAPE —— 8 颗交错 + 顶部叶 + 藤蔓
  // ─────────────────────────────────────────────
  PAINTERS.GRAPE = function (u) {
    var body = 'grp-body-' + u;
    var inner = 'grp-inner-' + u;
    return '<defs>'
      + radial(body, '32%', '26%', '76%', [
          ['0%', '#F3E5FF'],
          ['18%', '#C9A0FF'],
          ['48%', '#8B46E0'],
          ['76%', '#5B1FA5'],
          ['100%', '#2A0F5C']
        ])
      + radial(inner, '38%', '32%', '60%', [
          ['0%', '#FFFFFF', '0.55'],
          ['60%', '#FFFFFF', '0']
        ])
      + '</defs>'
      + groundShadow(50, 88, 24, 4, 0.42)
      // 藤蔓
      + '<path d="M50 20 Q54 10(- 62 6" stroke22="#4D7C0F" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
      // 双叶
      + '<path d="M50 18 Q62 12 68 20 Q60 28 50 24 Z" fill="#65A30D" stroke="#3F6212" stroke-width="1"/>'
      + '<path d="M50 18 Q38 12 32 20 Q40 28 50 24 Z" fill="#84CC16" stroke="#3F6212" stroke-width="1"/>'
      // 8 颗葡萄（3-2-3 布局）
      // Row 1
      + '<circle cx="34" cy="38" r="12" fill="url(#' + body + ')"/>'
      + '<circle cx="50" cy="34" r="12.5" fill="url(#' + body + ')"/>'
      + '<circle cx="66" cy="38" r="12" fill="url(#' + body + ')"/>'
      // Row 2
      + '<circle cx="42" cy="55" r="12" fill="url(#' + body + ')"/>'
      + '<circle cx="58" cy="55" r="12" fill="url(#' + body + ')"/>'
      // Row 3
      + '<circle cx="34" cy="70" r="11" fill="url(#' + body + ')"/>'
      + '<circle cx="50" cy="76" r="11" fill="url(#' + body + ')"/>'
      + '<circle cx="66" cy="70" r="11" fill="url(#' + body + ')"/>'
      // 每颗的顶部内反光
      + '<circle cx="34" cy="38" r="12" fill="url(#' + inner + ')"/>'
      + '<circle cx="50" cy="34" r="12.5" fill="url(#' + inner + ')"/>'
      + '<circle cx="66" cy="38" r="12" fill="url(#' + inner + ')"/>'
      + '<circle cx="42" cy="55" r="12" fill="url(#' + inner + ')"/>'
      + '<circle cx="58" cy="55" r="12" fill="url(#' + inner + ')"/>'
      + '<circle cx="34" cy="70" r="11" fill="url(#' + inner + ')"/>'
      + '<circle cx="50" cy="76" r="11" fill="url(#' + inner + ')"/>'
      + '<circle cx="66" cy="70" r="11" fill="url(#' + inner + ')"/>'
      // 高光点
      + gloss(30, 33, 3.5, 2.8, -25, 0.9)
      + gloss(46, 29, 3.5, 2.8, -25, 0.9)
      + gloss(62, 33, 3.5, 2.8, -25, 0.9)
      + gloss(38, 50, 3.5, 2.8, -25, 0.9)
      + gloss(54, 50, 3.5, 2.8, -25, 0.9)
      + gloss(30, 65, 3, 2.4, -25, 0.9)
      + gloss(46, 71, 3, 2.4, -25, 0.9)
      + gloss(62, 65, 3, 2.4, -25, 0.9);
  };

  // ─────────────────────────────────────────────
  // 🍉 WATERMELON —— 半圆切片 + 分层 + 6 籽
  // ─────────────────────────────────────────────
  PAINTERS.WATERMELON = function (u) {
    var flesh = 'wm-flesh-' + u;
    return '<defs>'
      + radial(flesh, '50%', '38%', '80%', [
          ['0%', '#FFB3BE'],
          ['38%', '#FF5A72'],
          ['78%', '#C5112E'],
          ['100%', '#8B0018']
        ])
      + '</defs>'
      + groundShadow(50, 86, 30, 5, 0.45)
      // 7 层从外到内
      // 1. 深绿皮
      + '<path d="M12 78 A44 44 0 0 1 88 78 Z" fill="#14532D"/>'
      // 2. 亮绿皮
      + '<path d="M15 78 A41 41 0 0 1 85 78 Z" fill="#22C55E"/>'
      // 3. 皮内淡纹
      + '<path d="M18 78 A38 38 0 0 1 82 78 Z" fill="#86EFAC"/>'
      // 4. 白瓤
      + '<path d="M21 78 A35 35 0 0 1 79 78 Z" fill="#F0FDF4"/>'
      // 5. 红肉
      + '<path d="M25 78 A31 31 0 0 1 75 78 Z" fill="url(#' + flesh + ')"/>'
      // 6. 高光
      + gloss(38, 62, 12, 5, -30, 0.42)
      + gloss(34, 56, 5, 2.5, -30, 0.65)
      // 7. 6 颗籽（交错排列）
      + '<ellipse cx="38" cy="58" rx="2.2" ry="4" fill="#0F172A" transform="rotate(-32 38 58)"/>'
      + '<ellipse cx="50" cy="55" rx="2.2" ry="4" fill="#0F172A" transform="rotate(-10 50 55)"/>'
      + '<ellipse cx="62" cy="58" rx="2.2" ry="4" fill="#0F172A" transform="rotate(24 62 58)"/>'
      + '<ellipse cx="40" cy="68" rx="2.2" ry="4" fill="#0F172A" transform="rotate 40 68)"/>'
      + '<ellipse cx="60" cy="68" rx="2.2" ry="4" fill="#0F172A" transform="rotate(18 60 68)"/>'
      + '<ellipse cx="50" cy="72" rx="2" ry="3.6" fill="#0F172A"/>';
  };

  // ─────────────────────────────────────────────
  // 🍑 PLUM —— 长茄子形 + 纵向沟槽 + 顶叶
  // ─────────────────────────────────────────────
  PAINTERS.PLUM = function (u) {
    var body = 'plm-body-' + u;
    var shade = 'plm-shade-' + u;
    return '<defs>'
      + radial(body, '36%', '24%', '82%', [
          ['0%', '#F3E9FF'],
          ['20%', '#C6A4F5'],
          ['52%', '#8B5CF6'],
          ['82%', '#5B21B6'],
          ['100%', '#2A0F5C']
        ])
      + linear(shade, '0', '0', '0', '1', [
          ['0%', 'rgba(0,0,0,0)'],
          ['100%', 'rgba(30,10,70,.35)']
        ])
      + '</defs>'
      + groundShadow(50, 88, 22, 4, 0.42)
      // 叶子
      + '<path d="M50 14 Q60 8 68 14 Q60 24 52 22 Z" fill="#65A30D" stroke="#3F6212" stroke-width="1"/>'
      + '<path d="M50 14 Q40 8 32 14 Q40 24 48 22 Z" fill="#84CC16" stroke="#3F6212" stroke-width="1"/>'
      + '<path d="M50 14 Q50 8 54 4" stroke="#4D7C0F" stroke-width="2" fill="none" stroke-linecap="round"/>'
      // 主体（茄子形：上宽下窄）
      + '<path d="M50 20'
      + ' C34 20 26 34 26 50'
      + ' C26 68 38 84 50 86'
      + ' C62 84 74 68 74 50'
      + ' C74 34 66 20 50 20 Z"'
      + ' fill="url(#' + body + ')" stroke="#4C1D95" stroke-width="1.5"/>'
      // 纵向沟槽
      + '<path d="M50 26 Q48 54 50 82" stroke="rgba(40,10,80,.35)" stroke-width="1.4" fill="none"/>'
      // 侧面暗调
      + '<path d="M50 20 C34 20 26 34 26 50 C26 68 38 84 50 86"'
      + ' fill="url(#' + shade + ')"/>'
      // 高光
      + gloss(40, 38, 9, 6, -30, 0.55)
      + gloss(34, 32, 4, 3, -30, 0.85);
  };

  // ─────────────────────────────────────────────
  // 🍎 APPLE —— 苹果凹陷 + 叶子 + 蒂
  // ─────────────────────────────────────────────
  PAINTERS.APPLE = function (u) {
    var body = 'apl-body-' + u;
    var shade = 'apl-shade-' + u;
    return '<defs>'
      + radial(body, '34%', '26%', '82%', [
          ['0%', '#FFD9D9'],
          ['18%', '#FF7A7A'],
          ['48%', '#DC2626'],
          ['78%', '#991B1B'],
          ['100%', '#450A0A']
        ])
      + linear(shade, '0', '0', '0', '1', [
          ['0%', 'rgba(0,0,0,0)'],
          ['100%', 'rgba(60,10,10,.3)']
        ])
      + '</defs>'
      + groundShadow(50, 86, 26, 5, 0.42)
      // 主体（带顶部凹陷）
      + '<path d="M50 24'
      + ' C38 12 20 18 18 38'
      + ' C16 58 30 82 50 84'
      + ' C70 82 84 58 82 38'
      + ' C80 18 62 12 50 24 Z"'
      + ' fill="url(#' + body + ')" stroke="#7F1D1D" stroke-width="1.4"/>'
      // 顶部凹陷阴影
      + '<path d="M40 26 Q50 34 60 26 Q54 22 50 22 Q46 22 40 26 Z"'
      + ' fill="rgba(60,10,10,.45)"/>'
      // 侧面暗调
      + '<path d="M50 24 C62 12 80 18 82 38 C84 58 70 82 50 84"'
      + ' fill="url(#' + shade + ')"/>'
      // 蒂
      + '<path d="M50 22 Q49 14 46 8" stroke="#78350F" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      // 叶子
      + '<path d="M48 14 Q60 4 70 10 Q62 22 50 18 Z" fill="#22C55E" stroke="#15803D" stroke-width="1"/>'
      // 主高光
      + gloss(36, 38, 10, 7, -28, 0.6)
      + gloss(31, 32, 4.5, 3.2, -28, 0.9);
  };

  /* =========================================================
   * 6 个糖果类符号（100 viewBox）
   * ======================================================= */

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

  // --- RED_HEART_CANDY ---
  PAINTERS.RED_HEART_CANDY = function (u) {
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
      + '<path d="M50 78 C46 74 24 60 24 44 C24 32 33 26 42 29 C46 30 49 33 50 37 C51 33 54 30 58 29 C67 26 76 32 76 44 C76 60 54 74 50 78 Z" fill="url(#' + body + ')"/>'
      + '<path d="M50 76 C46 72 26 59 26 45 C26 34 34 29 42 32 C45 33 48 35 50 39 C52 35 55 33 58 32 C66 29 74 34 74 45 C74 59 54 72 50 76 Z" fill="url(#' + inner + ')"/>'
      + '<path d="M26 50 C32 66 44 76 50 78 C56 76 68 66 74 50 C68 64 58 71 50 71 C42 71 32 64 26 50 Z" fill="url(#' + bottom + ')"/>'
      + gloss(38, 36, 10, 7, -25, 0.55)
      + gloss(33, 32, 5, 3.5, -25, 0.82);
  };

  // --- LOLLIPOP (scatter) ---
  PAINTERS.LOLLIPOP = function (u) {
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
      + '<path d="M40 30 C47 25 57 27 62 33 C67 39 63 48 56 51 C48 54 39 50 36 43 C32 35 38 28 46 27 C56 25 64 31 66 39" fill="none" stroke="#FFE5F2" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>'
      + '<path d="M46 33 C51 30 56 31 58 35 C61 40 57 44 53 45 C48 47 43 44 43 40 C42 36 45 34 49 33" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.72"/>'
      + gloss(40, 29, 7, 5, -25, 0.88)
      + '<circle cx="35" cy="36" r="1.8" fill="#FFFFFF" opacity="0.55"/>';
  };

  // --- MULTIPLIER_BOMB ---
  PAINTERS.MULTIPLIER_BOMB = function (u) {
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
   * ======================================================= */
  function render(symbolId, opts) {
    opts = opts || {};
    var u = nextUid('s');
    var size = opts.size == null ? '100%' : opts.size;
    var state = opts.state || 'idle';
    var cls = 'slot-symbol slot-symbol--' + state;
    if (opts.highlighted) cls += ' slot-symbol--highlighted';

    // ① 5 个水果：优先走 ApexFruitSvg（新 SVG，256 viewBox，含 filter）
    if (window.ApexFruitSvg && window.ApexFruitSvg.has(symbolId)) {
      var svg = window.ApexFruitSvg.get(symbolId, u);
      if (svg) {
        // 注入 class 与 style（fruit SVG 根已有 viewBox/width/height）
        return svg.replace(
          '<svg ',
          '<svg class="' + cls + '" aria-hidden="true" style="width:' + size + ';height:' + size + ';" '
        );
      }
    }

    // ② 其余符号（糖果 6 个）：走老 painter（100 viewBox）
    var key = ID_TO_KEY[symbolId] || symbolId;
    var painter = PAINTERS[key];
    if (!painter) return '';

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

  window.ApexEngineSymbolRender = Object.freeze({
    render: render,
    has: has,
    list: list,
    PAINTERS: Object.freeze(PAINTERS),
    ID_TO_KEY: Object.freeze(ID_TO_KEY)
  });
})();
