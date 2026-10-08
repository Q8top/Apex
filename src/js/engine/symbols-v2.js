(function () {
  'use strict';

  var VIEWBOX = '0 0 100 100';
  var SVG_HEAD = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX + '"'
    + ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet"'
    + ' aria-hidden="true" focusable="false"';

  var uidCounter = 0;
  function nextUid(p) { uidCounter += 1; return p + uidCounter.toString(36); }

  /* ==========================================================
   * BLUE_CANDY —— 蓝糖果（v2 技术栈示范）
   *   技术：LinearGradient（主体明暗）+ RadialGradient（高光）
   *        + Path/Ellipse（轮廓）+ Stroke（描边突出）
   *        + Opacity（半透明高光）+ feDropShadow（投影）
   *        + 多层组合（光晕 / 拧花 / 主体 / 高光 / 反光条 / 气泡）
   * ========================================================== */
  var BLUE_CANDY =
    '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="bc-body" x1="15%" y1="10%" x2="85%" y2="95%">'
    +   '<stop offset="0%" stop-color="#8AD8FF"/>'
    +   '<stop offset="42%" stop-color="#3B9EFF"/>'
    +   '<stop offset="100%" stop-color="#0E3E7A"/>'
    + '</linearGradient>'
    + '<radialGradient id="bc-hl" cx="32%" cy="30%" r="52%">'
    +   '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>'
    +   '<stop offset="55%" stop-color="#FFFFFF" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<radialGradient id="bc-glow" cx="50%" cy="50%" r="50%">'
    +   '<stop offset="0%" stop-color="#7DD3FF" stop-opacity="0.55"/>'
    +   '<stop offset="100%" stop-color="#7DD3FF" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<filter id="bc-sh" x="-25%" y="-25%" width="150%" height="150%">'
    +   '<feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#000" flood-opacity="0.38"/>'
    + '</filter>'
    + '</defs>'
    + '<circle cx="50" cy="50" r="44" fill="url(#bc-glow)"/>'
    + '<path d="M22,40 L10,34 L16,42 L7,50 L16,58 L10,66 L22,60 Z" fill="url(#bc-body)" stroke="#0A2E5A" stroke-width="1.3" stroke-linejoin="round" filter="url(#bc-sh)"/>'
    + '<path d="M78,40 L90,34 L84,42 L93,50 L84,58 L90,66 L78,60 Z" fill="url(#bc-body)" stroke="#0A2E5A" stroke-width="1.3" stroke-linejoin="round" filter="url(#bc-sh)"/>'
    + '<ellipse cx="50" cy="50" rx="30" ry="22" fill="url(#bc-body)" stroke="#0A2E5A" stroke-width="1.6" filter="url(#bc-sh)"/>'
    + '<ellipse cx="42" cy="42" rx="15" ry="10" fill="url(#bc-hl)"/>'
    + '<path d="M36,42 Q50,36 64,42 Q50,44 36,42 Z" fill="#FFFFFF" opacity="0.72"/>'
    + '<circle cx="60" cy="56" r="2" fill="#FFFFFF" opacity="0.28"/>'
    + '<circle cx="66" cy="49" r="1.4" fill="#FFFFFF" opacity="0.22"/>'
    + '<circle cx="36" cy="58" r="1.7" fill="#FFFFFF" opacity="0.22"/>'
    + '</svg>';

  var SVGS = { blue_candy: BLUE_CANDY };

  function scopeIds(svg, uid) {
    if (!uid) return svg;
    var re = /id="([^"]+)"/g, ids = [], m, seen = {};
    while ((m = re.exec(svg)) !== null) ids.push(m[1]);
    for (var i = 0; i < ids.length; i++) {
      var raw = ids[i];
      if (seen[raw]) continue;
      seen[raw] = true;
      var esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      svg = svg.replace(new RegExp('id="' + esc + '"', 'g'),
                        'id="' + raw + '-' + uid + '"');
      svg = svg.replace(new RegExp('url\\(#' + esc + '\\)', 'g'),
                        'url(#' + raw + '-' + uid + ')');
    }
    return svg;
  }

  function get(id, uid) {
    var raw = SVGS[id];
    if (!raw) return '';
    return scopeIds(raw, uid || nextUid('s'));
  }
  function has(id) { return Object.prototype.hasOwnProperty.call(SVGS, id); }
  function list() { return Object.keys(SVGS); }

  window.ApexSymbolsV2 = Object.freeze({
    get: get, has: has, list: list,
    VIEWBOX: VIEWBOX,
    SVGS: Object.freeze(SVGS)
  });
})();
