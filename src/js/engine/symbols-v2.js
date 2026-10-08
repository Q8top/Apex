(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0;
function nextUid(p) { _u += 1; return p + _u.toString(36); }

/* ============================================================
 * 糖果生成器（原版 Sweet Bonanza 风格）
 *   形状：方形糖块 + 两端三角糖纸
 *   技术：LinearGradient 主体明暗 + RadialGradient 高光
 *        + Stroke 描边 + feDropShadow 投影
 * ============================================================ */
function candy(p, c1, c2, c3, st, heart) {
  return '<svg ' + H + '><defs>'
  + '<linearGradient id="' + p + '-b" x1="15%" y1="10%" x2="85%" y2="95%">'
  +   '<stop offset="0%" stop-color="' + c1 + '"/>'
  +   '<stop offset="45%" stop-color="' + c2 + '"/>'
  +   '<stop offset="100%" stop-color="' + c3 + '"/>'
  + '</linearGradient>'
  + '<radialGradient id="' + p + '-h" cx="32%" cy="28%" r="50%">'
  +   '<stop offset="0%" stop-color="#FFF" stop-opacity="0.85"/>'
  +   '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
  + '</radialGradient>'
  + '<filter id="' + p + '-s" x="-25%" y="-25%" width="150%" height="150%">'
  +   '<feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.42"/>'
  + '</filter>'
  + '</defs>'
  + '<path d="M18,38 L6,30 L12,42 L3,50 L12,58 L6,70 L18,62 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.4" stroke-linejoin="round" filter="url(#' + p + '-s)"/>'
  + '<path d="M82,38 L94,30 L88,42 L97,50 L88,58 L94,70 L82,62 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.4" stroke-linejoin="round" filter="url(#' + p + '-s)"/>'
  + '<rect x="22" y="36" width="56" height="28" rx="6" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.6" filter="url(#' + p + '-s)"/>'
  + '<ellipse cx="42" cy="44" rx="16" ry="6" fill="url(#' + p + '-h)"/>'
  + '<path d="M32,44 Q50,38 68,44" stroke="#FFF" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>'
  + (heart ? '<path d="M50,57 C46,53 42,51 42,47 C42,44 45,43 47,44 C48,45 50,46 50,48 C50,46 52,45 53,44 C55,43 58,44 58,47 C58,51 54,53 50,57 Z" fill="#FFF" opacity="0.9"/>' : '')
  + '</svg>';
}

var SVGS = {};
SVGS.blue_candy      = candy('bc', '#8AD8FF', '#3B9EFF', '#0E3E7A', '#0A2E5A', false);
SVGS.green_candy     = candy('gc', '#B5F5A0', '#4EC22E', '#0A5418', '#0A4D10', false);
SVGS.purple_candy    = candy('pc', '#E0A8FF', '#A040D0', '#3A0A5A', '#2A0845', false);
SVGS.red_heart_candy = candy('rh', '#FFA0A0', '#E02030', '#6A0A0A', '#4A0505', true);

/* @@INSERT_SYMBOLS@@ */

var ALIASES = {
  'sb-candy-blue': 'blue_candy',
  'sb-candy-green': 'green_candy',
  'sb-candy-purple': 'purple_candy',
  'sb-candy-heart': 'red_heart_candy',
  'sb-fruit-banana': 'banana',
  'sb-fruit-grape': 'grape',
  'sb-fruit-watermelon': 'watermelon',
  'sb-fruit-plum': 'plum',
  'sb-fruit-apple': 'apple',
  'sb-scatter-lollipop': 'lollipop',
  'sb-multiplier-bomb': 'multiplier_bomb',
  'BANANA': 'banana',
  'GRAPE': 'grape',
  'WATERMELON': 'watermelon',
  'PLUM': 'plum',
  'APPLE': 'apple',
  'BLUE_CANDY': 'blue_candy',
  'GREEN_CANDY': 'green_candy',
  'PURPLE_CANDY': 'purple_candy',
  'RED_HEART_CANDY': 'red_heart_candy',
  'RED_HEART': 'red_heart_candy',
  'LOLLIPOP': 'lollipop',
  'MULTIPLIER_BOMB': 'multiplier_bomb'
};

function scopeIds(svg, uid) {
  if (!uid) return svg;
  var re = /id="([^"]+)"/g, ids = [], m, seen = {};
  while ((m = re.exec(svg)) !== null) ids.push(m[1]);
  for (var i = 0; i < ids.length; i++) {
    var raw = ids[i];
    if (seen[raw]) continue;
    seen[raw] = true;
    var esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    svg = svg.replace(new RegExp('id="' + esc + '"', 'g'), 'id="' + raw + '-' + uid + '"');
    svg = svg.replace(new RegExp('url\\(#' + esc + '\\)', 'g'), 'url(#' + raw + '-' + uid + ')');
  }
  return svg;
}

function resolve(id) {
  if (Object.prototype.hasOwnProperty.call(SVGS, id)) return id;
  if (Object.prototype.hasOwnProperty.call(ALIASES, id)) return ALIASES[id];
  return null;
}
function get(id, uid) {
  var key = resolve(id);
  if (!key) return '';
  return scopeIds(SVGS[key], uid || nextUid('s'));
}
function has(id) { return resolve(id) !== null; }
function list() { return Object.keys(SVGS); }

window.ApexSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  VIEWBOX: '0 0 100 100',
  SVGS: Object.freeze(SVGS),
  ALIASES: Object.freeze(ALIASES)
});
})();
