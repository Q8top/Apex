(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0;
function nid(p) { _u += 1; return p + _u.toString(36); }

/* 通用糖果生成器：双层路径模拟立体倒角 */
function candy(p, c1, c2, c3, dark, shape, mark) {
  var body;
  if (shape === 'heart') {
    body = '<path d="M50,82 C26,63 12,45 12,32 C12,20 24,14 34,22 C41,27 50,39 50,39 C50,39 59,27 66,22 C76,14 88,20 88,32 C88,45 74,63 50,82 Z" fill="url(#' + p + '-b)" stroke="' + dark + '" stroke-width="1.8"/>';
  } else if (shape === 'oval') {
    body = '<rect x="10" y="30" width="80" height="40" rx="20" fill="url(#' + p + '-b)" stroke="' + dark + '" stroke-width="1.8"/>';
  } else if (shape === 'pent') {
    body = '<path d="M50,14 L82,38 L70,80 L30,80 L18,38 Z" fill="url(#' + p + '-b)" stroke="' + dark + '" stroke-width="1.8" stroke-linejoin="round"/>';
  } else if (shape === 'hex') {
    body = '<path d="M30,18 L70,18 L86,50 L70,82 L30,82 L14,50 Z" fill="url(#' + p + '-b)" stroke="' + dark + '" stroke-width="1.8" stroke-linejoin="round"/>';
  } else {
    body = '<rect x="18" y="18" width="64" height="64" rx="12" fill="url(#' + p + '-b)" stroke="' + dark + '" stroke-width="1.8"/>';
  }
  return '<svg ' + H + '><defs>'
    + '<linearGradient id="' + p + '-b" x1="0" y1="0" x2="0.3" y2="1">'
    + '<stop offset="0%" stop-color="' + c1 + '"/>'
    + '<stop offset="45%" stop-color="' + c2 + '"/>'
    + '<stop offset="100%" stop-color="' + c3 + '"/></linearGradient>'
    + '<linearGradient id="' + p + '-hl" x1="0" y1="0" x2="0.6" y2="0.8">'
    + '<stop offset="0%" stop-color="#FFF" stop-opacity="0.75"/>'
    + '<stop offset="60%" stop-color="#FFF" stop-opacity="0"/></linearGradient>'
    + '<filter id="' + p + '-s"><feDropShadow dx="0" dy="2.2" stdDeviation="1.6" flood-color="#000" flood-opacity="0.4"/></filter>'
    + '</defs>'
    + '<g filter="url(#' + p + '-s)">' + body + '</g>'
    + '<path d="M24,30 L44,22 L28,68" stroke="url(#' + p + '-hl)" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.55"/>'
    + (mark || '') + '</svg>';
}

/* 水果生成器：深色粗描边 + 高光 */
function fruit(p, c1, c2, c3, dark, body, decor) {
  return '<svg ' + H + '><defs>'
    + '<linearGradient id="' + p + '-b" x1="0" y1="0" x2="0.3" y2="1">'
    + '<stop offset="0%" stop-color="' + c1 + '"/>'
    + '<stop offset="50%" stop-color="' + c2 + '"/>'
    + '<stop offset="100%" stop-color="' + c3 + '"/></linearGradient>'
    + '<radialGradient id="' + p + '-h" cx="35%" cy="28%" r="45%">'
    + '<stop offset="0%" stop-color="#FFF" stop-opacity="0.7"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="' + p + '-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.45"/></filter>'
    + '</defs>'
    + '<g filter="url(#' + p + '-s)">' + body + '</g>'
    + '<ellipse cx="36" cy="34" rx="13" ry="7" fill="url(#' + p + '-h)" transform="rotate(-25 36 34)"/>'
    + (decor || '') + '</svg>';
}

var S = {};

/* ---- 4 糖果 ---- */
S.blue_candy = candy('bc', '#B0E4FF', '#4A9EFF', '#0A3A7A', '#06306A', 'oval',
  '<ellipse cx="40" cy="42" rx="16" ry="7" fill="#FFF" opacity="0.35" transform="rotate(-10 40 42)"/>');

S.green_candy = candy('gc', '#C8F8A8', '#52C430', '#0A5418', '#084A10', 'pent',
  '<path d="M38,30 Q50,26 62,30" stroke="#FFF" stroke-width="1.8" fill="none" opacity="0.5" stroke-linecap="round"/>');

S.purple_candy = candy('pc', '#E8C0FF', '#A848D8', '#3A0A5A', '#2A0845', 'square',
  '<rect x="30" y="30" width="22" height="10" rx="5" fill="#FFF" opacity="0.35" transform="rotate(-15 41 35)"/>');

S.red_heart_candy = candy('rh', '#FFC0C0', '#E82838', '#6A0A0A', '#4A0505', 'heart',
  '<path d="M50,64 C42,58 36,51 36,45 C36,41 40,39 44,42 C46,44 50,49 50,49 C50,49 54,44 56,42 C60,39 64,41 64,45 C64,51 58,58 50,64 Z" fill="#FFF" opacity="0.95"/>');

/* ---- 5 水果 ---- */
S.banana = fruit('ba', '#FFE86B', '#F5C518', '#A06000', '#4A3000',
  '<path d="M16,36 Q22,22 40,22 Q62,24 78,44 Q88,58 80,70 Q72,78 62,68 Q50,52 34,48 Q18,44 15,40 Z" fill="url(#ba-b)" stroke="#4A3000" stroke-width="2.2"/>'
  + '<path d="M26,34 Q38,30 52,36" stroke="#FFF" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>');

S.grape = fruit('gr', '#D090F0', '#8A3ABF', '#3A1054', '#2A0844',
  '<circle cx="34" cy="30" r="12" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="52" cy="28" r="12" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="68" cy="32" r="11" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="28" cy="48" r="11" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="48" cy="46" r="12" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="68" cy="48" r="11" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="36" cy="64" r="11" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="56" cy="64" r="11" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<circle cx="48" cy="78" r="9" fill="url(#gr-b)" stroke="#2A0844" stroke-width="1.2"/>'
  + '<path d="M50,14 Q52,22 50,30" stroke="#5C3A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  + '<path d="M54,20 Q66,12 78,18 Q70,28 54,26 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="1"/>',
  '<circle cx="30" cy="26" r="4" fill="#FFF" opacity="0.6"/>');

S.watermelon = fruit('wm', '#70D050', '#3E8A28', '#1A4D10', '#0A3A08',
  '<circle cx="50" cy="54" r="34" fill="url(#wm-b)" stroke="#0A3A08" stroke-width="2.2"/>'
  + '<path d="M50,20 Q48,28 50,36" stroke="#1A4D10" stroke-width="2" fill="none" opacity="0.4"/>'
  + '<path d="M30,28 Q42,24 50,30 Q58,36 66,30" stroke="#1A4D10" stroke-width="1.8" fill="none" opacity="0.3"/>'
  + '<path d="M26,44 Q38,40 48,46 Q58,52 68,44" stroke="#1A4D10" stroke-width="1.8" fill="none" opacity="0.3"/>');

S.plum = fruit('pl', '#E8A0D8', '#A0389F', '#4A0A44', '#3A0830',
  '<circle cx="50" cy="58" r="30" fill="url(#pl-b)" stroke="#3A0830" stroke-width="2.2"/>'
  + '<path d="M50,30 Q48,46 50,84" stroke="#3A0830" stroke-width="1.8" fill="none" opacity="0.5"/>'
  + '<path d="M50,28 Q50,18 48,10" stroke="#5C3A1E" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  + '<path d="M52,22 Q64,12 76,18 Q66,28 52,24 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="1"/>');

S.apple = fruit('ap', '#FF8A8A', '#E02838', '#6A0A0A', '#4A0505',
  '<path d="M50,32 Q42,18 30,20 Q18,22 16,34 Q14,50 26,64 Q38,78 50,82 Q62,78 74,64 Q86,50 84,34 Q82,22 70,20 Q58,18 50,32 Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="2.2"/>'
  + '<path d="M50,20 Q60,12 72,16 Q66,26 50,24 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="1"/>'
  + '<path d="M50,24 Q50,16 48,10" stroke="#5C3A1E" stroke-width="2" fill="none" stroke-linecap="round"/>');

/* ---- 棒棒糖 Scatter ---- */
S.lollipop = '<svg ' + H + '><defs>'
  + '<radialGradient id="lp-b" cx="35%" cy="30%" r="60%">'
  + '<stop offset="0%" stop-color="#FFD0E0"/><stop offset="60%" stop-color="#FF4081"/><stop offset="100%" stop-color="#8A0030"/></radialGradient>'
  + '<filter id="lp-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.45"/></filter>'
  + '</defs>'
  + '<circle cx="50" cy="40" r="30" fill="url(#lp-b)" stroke="#6A0020" stroke-width="2.2" filter="url(#lp-s)"/>'
  + '<path d="M50,10 A30,30 0 0 1 80,40" stroke="#FFF" stroke-width="7" fill="none" opacity="0.7"/>'
  + '<path d="M50,70 A30,30 0 0 1 20,40" stroke="#FFF" stroke-width="7" fill="none" opacity="0.4"/>'
  + '<path d="M50,70 Q48,82 46,94" stroke="#C8A878" stroke-width="5" fill="none" stroke-linecap="round"/>'
  + '<ellipse cx="38" cy="28" rx="10" ry="6" fill="#FFF" opacity="0.5" transform="rotate(-30 38 28)"/>'
  + '</svg>';

/* ---- 倍率炸弹 ---- */
S.multiplier_bomb = '<svg ' + H + '><defs>'
  + '<radialGradient id="mb-b" cx="35%" cy="30%" r="60%">'
  + '<stop offset="0%" stop-color="#FFE080"/><stop offset="50%" stop-color="#FF3838"/><stop offset="100%" stop-color="#6A0000"/></radialGradient>'
  + '<filter id="mb-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter>'
  + '</defs>'
  + '<circle cx="50" cy="56" r="30" fill="url(#mb-b)" stroke="#3A0000" stroke-width="2.2" filter="url(#mb-s)"/>'
  + '<path d="M50,26 Q50,14 60,8" stroke="#5C3A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  + '<circle cx="60" cy="8" r="5" fill="#FFD060" opacity="0.9"/>'
  + '<circle cx="60" cy="8" r="8" fill="#FFD060" opacity="0.3"/>'
  + '<text x="50" y="62" text-anchor="middle" font-size="16" font-weight="bold" fill="#FFF" font-family="Arial,Helvetica,sans-serif" stroke="#000" stroke-width="0.5">2x</text>'
  + '</svg>';

var A = {
  'sb-candy-blue':'blue_candy','sb-candy-green':'green_candy','sb-candy-purple':'purple_candy','sb-candy-heart':'red_heart_candy',
  'sb-fruit-banana':'banana','sb-fruit-grape':'grape','sb-fruit-watermelon':'watermelon','sb-fruit-plum':'plum','sb-fruit-apple':'apple',
  'sb-scatter-lollipop':'lollipop','sb-multiplier-bomb':'multiplier_bomb',
  'BLUE_CANDY':'blue_candy','GREEN_CANDY':'green_candy','PURPLE_CANDY':'purple_candy','RED_HEART_CANDY':'red_heart_candy','RED_HEART':'red_heart_candy',
  'BANANA':'banana','GRAPE':'grape','WATERMELON':'watermelon','PLUM':'plum','APPLE':'apple','LOLLIPOP':'lollipop','MULTIPLIER_BOMB':'multiplier_bomb'
};

function sc(svg, uid) {
  if (!uid) return svg;
  var re = /id="([^"]+)"/g, ids = [], m, seen = {};
  while ((m = re.exec(svg)) !== null) ids.push(m[1]);
  for (var i = 0; i < ids.length; i++) {
    var r = ids[i]; if (seen[r]) continue; seen[r] = true;
    var e = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    svg = svg.replace(new RegExp('id="' + e + '"', 'g'), 'id="' + r + '-' + uid + '"');
    svg = svg.replace(new RegExp('url\\(#' + e + '\\)', 'g'), 'url(#' + r + '-' + uid + ')');
  }
  return svg;
}
function rs(id) {
  if (Object.prototype.hasOwnProperty.call(S, id)) return id;
  if (Object.prototype.hasOwnProperty.call(A, id)) return A[id];
  return null;
}
function get(id, uid) { var k = rs(id); if (!k) return ''; return sc(S[k], uid || nid('s')); }
function has(id) { return rs(id) !== null; }
function list() { return Object.keys(S); }

window.ApexSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  VIEWBOX: '0 0 100 100',
  SVGS: Object.freeze(S),
  ALIASES: Object.freeze(A)
});
})();
