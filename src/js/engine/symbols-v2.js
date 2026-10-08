(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0;
function nextUid(p) { _u += 1; return p + _u.toString(36); }

/* 糖果（参考原版 Sweet Bonanza 方形糖块）
 *   - 圆角方形主体（rect rx=14）
 *   - 顶部白色反光条（横向弧）
 *   - 左上斜向高光渐变
 *   - 深色描边 + feDropShadow
 *   - 红心糖中心白色心形 */
function candy(p, c1, c2, c3, st, heart) {
  var body = '<defs>'
    + '<linearGradient id="' + p + '-b" x1="0" y1="0" x2="0" y2="1">'
    +   '<stop offset="0%" stop-color="' + c1 + '"/>'
    +   '<stop offset="55%" stop-color="' + c2 + '"/>'
    +   '<stop offset="100%" stop-color="' + c3 + '"/>'
    + '</linearGradient>'
    + '<linearGradient id="' + p + '-hl" x1="0" y1="0" x2="0.7" y2="1">'
    +   '<stop offset="0%" stop-color="#FFF" stop-opacity="0.72"/>'
    +   '<stop offset="55%" stop-color="#FFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<filter id="' + p + '-s" x="-20%" y="-20%" width="140%" height="140%">'
    +   '<feDropShadow dx="0" dy="2.2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.42"/>'
    + '</filter>'
    + '</defs>';
  var base = '<rect x="16" y="16" width="68" height="68" rx="14" '
    + 'fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.8" '
    + 'filter="url(#' + p + '-s)"/>';
  var glow = '<path d="M24,26 L50,20 L30,76 L22,74 Z" fill="url(#' + p + '-hl)"/>';
  var shine = '<path d="M28,34 Q50,26 72,34" stroke="#FFF" stroke-width="1.8" '
    + 'fill="none" opacity="0.55" stroke-linecap="round"/>';
  var mark = heart
    ? '<path d="M50,66 C42,60 34,55 34,48 C34,43 39,40 44,44 '
      + 'C47,46 50,51 50,51 C50,51 53,46 56,44 C61,40 66,43 66,48 '
      + 'C66,55 58,60 50,66 Z" fill="#FFF" opacity="0.95"/>'
    : '';
  return '<svg ' + H + '>' + body + base + glow + shine + mark + '</svg>';
}

var SVGS = {};
SVGS.blue_candy      = candy('bc', '#A6E3FF', '#3B9EFF', '#0E3E7A', '#0A2E5A', false);
SVGS.green_candy     = candy('gc', '#CBF8B4', '#4EC22E', '#0A5418', '#0A4D10', false);
SVGS.purple_candy    = candy('pc', '#E9BCFF', '#A040D0', '#3A0A5A', '#2A0845', false);
SVGS.red_heart_candy = candy('rh', '#FFB4B4', '#E02030', '#6A0A0A', '#4A0505', true);

var ALIASES = {
  'sb-candy-blue': 'blue_candy',
  'sb-candy-green': 'green_candy',
  'sb-candy-purple': 'purple_candy',
  'sb-candy-heart': 'red_heart_candy',
  'BLUE_CANDY': 'blue_candy',
  'GREEN_CANDY': 'green_candy',
  'PURPLE_CANDY': 'purple_candy',
  'RED_HEART_CANDY': 'red_heart_candy',
  'RED_HEART': 'red_heart_candy'
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
