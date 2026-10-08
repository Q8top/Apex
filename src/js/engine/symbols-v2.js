(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0; function nid(p) { _u += 1; return p + _u.toString(36); }

/* 糖果：左上弧形反光带 + 主体渐变 + 深色描边 */
function candy(p, c1, c2, c3, dk, shape) {
  var bd;
  if (shape === 'heart') bd = '<path d="M50,84 C24,64 8,46 8,30 C8,18 22,12 34,20 C42,25 50,38 50,38 C50,38 58,25 66,20 C78,12 92,18 92,30 C92,46 76,64 50,84 Z" fill="url(#' + p + '-b)" stroke="' + dk + '" stroke-width="2.2"/>';
  else if (shape === 'oval') bd = '<rect x="8" y="33" width="84" height="34" rx="17" fill="url(#' + p + '-b)" stroke="' + dk + '" stroke-width="2.2"/>';
  else if (shape === 'pent') bd = '<path d="M50,12 L84,38 L70,80 L30,80 L16,38 Z" fill="url(#' + p + '-b)" stroke="' + dk + '" stroke-width="2.2" stroke-linejoin="round"/>';
  else bd = '<rect x="16" y="16" width="68" height="68" rx="16" fill="url(#' + p + '-b)" stroke="' + dk + '" stroke-width="2.2"/>';
  return '<svg ' + H + '><defs>'
    + '<linearGradient id="' + p + '-b" x1="0.2" y1="0" x2="0.8" y2="1">'
    + '<stop offset="0%" stop-color="' + c1 + '"/><stop offset="45%" stop-color="' + c2 + '"/><stop offset="100%" stop-color="' + c3 + '"/></linearGradient>'
    + '<radialGradient id="' + p + '-h" cx="28%" cy="22%" r="45%"><stop offset="0%" stop-color="#FFF" stop-opacity="0.9"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="' + p + '-s"><feDropShadow dx="0" dy="2.5" stdDeviation="1.8" flood-color="#000" flood-opacity="0.4"/></filter></defs>'
    + '<g filter="url(#' + p + '-s)">' + bd + '</g>'
    + '<ellipse cx="34" cy="30" rx="16" ry="8" fill="url(#' + p + '-h)"/>'
    + '</svg>';
}
/* 水果：径向球体 + 边缘暗部 + 高光斑 */
function fruit(p, c1, c2, c3, dk, bd, dec) {
  return '<svg ' + H + '><defs>'
    + '<radialGradient id="' + p + '-b" cx="35%" cy="30%" r="72%">'
    + '<stop offset="0%" stop-color="' + c1 + '"/><stop offset="55%" stop-color="' + c2 + '"/><stop offset="100%" stop-color="' + c3 + '"/></radialGradient>'
    + '<radialGradient id="' + p + '-h" cx="28%" cy="24%" r="30%"><stop offset="0%" stop-color="#FFF" stop-opacity="0.85"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="' + p + '-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.42"/></filter></defs>'
    + '<g filter="url(#' + p + '-s)">' + bd + '</g>'
    + '<ellipse cx="34" cy="32" rx="12" ry="6" fill="url(#' + p + '-h)" transform="rotate(-25 34 32)"/>'
    + (dec || '') + '</svg>';
}

var S = {};
/* ---- 4 糖果 ---- */
S.blue_candy = candy('bc','#A6DFFF','#3B9EFF','#0A3A7A','#06306A','oval');
S.green_candy = candy('gc','#BFF592','#52C430','#0E5418','#084A10','pent');
S.purple_candy = candy('pc','#E8B8FF','#B040E0','#5A0A6A','#3A0548','square');
S.red_heart_candy = candy('rh','#FFB8B8','#E82838','#8A0A1A','#4A0505','heart');

/* ---- 5 水果 ---- */
S.banana = fruit('ba','#FFF090','#F5C518','#8B5A00','#5C3A00',
  '<path d="M14,38 Q20,22 38,20 Q62,20 78,42 Q90,60 80,72 Q72,80 62,70 Q50,54 32,48 Q18,42 14,38 Z" fill="url(#ba-b)" stroke="#5C3A00" stroke-width="2.2"/>'
  + '<circle cx="18" cy="37" r="2.5" fill="#3A2000"/><circle cx="78" cy="70" r="2.5" fill="#3A2000"/>'
  + '<path d="M28,34 Q40,28 54,34" stroke="#FFF" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>');

S.grape = fruit('gr','#7A4AC0','#5A2AA0','#2A0A54','#1A0430',
  '<ellipse cx="50" cy="24" rx="22" ry="10" fill="#4A2090" stroke="#1A0430" stroke-width="1.4"/>'
  + '<circle cx="30" cy="30" r="11" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="50" cy="28" r="11" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="70" cy="30" r="11" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="26" cy="48" r="10" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="46" cy="46" r="11" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="66" cy="48" r="10" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="36" cy="64" r="10" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="58" cy="64" r="10" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<circle cx="48" cy="78" r="9" fill="url(#gr-b)" stroke="#1A0430" stroke-width="1.2"/>'
  + '<path d="M50,14 Q48,22 50,28" stroke="#5C3A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  + '<path d="M54,20 Q68,14 80,20 Q70,30 54,26 Z" fill="#5FB040" stroke="#1B5510" stroke-width="1.2"/>',
  '<circle cx="28" cy="26" r="4" fill="#FFF" opacity="0.7"/><circle cx="46" cy="24" r="3.5" fill="#FFF" opacity="0.6"/>');

S.watermelon = fruit('wm','#8AD860','#4EA030','#1A6018','#0A3A08',
  '<circle cx="50" cy="54" r="34" fill="url(#wm-b)" stroke="#0A3A08" stroke-width="2.2"/>'
  + '<path d="M30,32 Q40,26 50,32 Q58,38 66,32" stroke="#2A7020" stroke-width="2" fill="none" opacity="0.4"/>'
  + '<path d="M26,48 Q38,42 48,48 Q58,54 68,48" stroke="#2A7020" stroke-width="2" fill="none" opacity="0.4"/>'
  + '<path d="M30,66 Q42,60 52,66 Q60,72 68,66" stroke="#2A7020" stroke-width="2" fill="none" opacity="0.4"/>');

S.plum = fruit('pl','#E080D0','#A0389F','#4A0A44','#3A0830',
  '<circle cx="50" cy="58" r="30" fill="url(#pl-b)" stroke="#3A0830" stroke-width="2.2"/>'
  + '<path d="M50,30 Q49,50 50,86" stroke="#3A0830" stroke-width="2" fill="none" opacity="0.55"/>'
  + '<path d="M50,28 Q50,18 48,10" stroke="#5C3A1E" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  + '<path d="M52,22 Q66,12 78,18 Q68,28 52,24 Z" fill="#5FB040" stroke="#1B5510" stroke-width="1.2"/>');

S.apple = fruit('ap','#FF8080','#E02838','#6A0A0A','#4A0505',
  '<path d="M50,32 Q42,18 30,20 Q16,22 14,36 Q12,52 26,66 Q38,80 50,82 Q62,80 74,66 Q88,52 86,36 Q84,22 70,20 Q58,18 50,32 Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="2.2"/>'
  + '<path d="M50,20 Q62,10 74,16 Q66,28 50,24 Z" fill="#5FB040" stroke="#1B5510" stroke-width="1.2"/>'
  + '<path d="M50,24 Q50,16 48,10" stroke="#5C3A1E" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  '<ellipse cx="32" cy="38" rx="11" ry="7" fill="#FFF" opacity="0.55" transform="rotate(-30 32 38)"/>');

/* ---- 棒棒糖 Scatter：红白螺旋 ---- */
S.lollipop = '<svg ' + H + '><defs>'
  + '<radialGradient id="lp-b" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#FF5050"/><stop offset="60%" stop-color="#E81828"/><stop offset="100%" stop-color="#8A0818"/></radialGradient>'
  + '<filter id="lp-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter></defs>'
  + '<circle cx="50" cy="42" r="32" fill="url(#lp-b)" stroke="#6A0010" stroke-width="2.4" filter="url(#lp-s)"/>'
  + '<path d="M50,10 Q74,12 82,38 Q80,58 58,64 Q38,62 32,44 Q32,32 44,28 Q58,28 62,42 Q60,52 50,52 Q42,50 42,44" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.95"/>'
  + '<path d="M50,72 Q48,84 46,94" stroke="#E8D0A0" stroke-width="5" fill="none" stroke-linecap="round"/>'
  + '<ellipse cx="34" cy="24" rx="10" ry="6" fill="#FFF" opacity="0.6" transform="rotate(-30 34 24)"/></svg>';

/* ---- 倍率炸弹：彩虹球 + 引线 + 火花 ---- */
S.multiplier_bomb = '<svg ' + H + '><defs>'
  + '<radialGradient id="mb-b" cx="35%" cy="30%" r="72%">'
  + '<stop offset="0%" stop-color="#FFF080"/><stop offset="35%" stop-color="#F05050"/><stop offset="70%" stop-color="#3080E0"/><stop offset="100%" stop-color="#3A0A5A"/></radialGradient>'
  + '<filter id="mb-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter></defs>'
  + '<circle cx="50" cy="56" r="32" fill="url(#mb-b)" stroke="#1A0430" stroke-width="2.4" filter="url(#mb-s)"/>'
  + '<path d="M22,46 Q40,40 50,56 Q60,72 78,66" stroke="#FFD060" stroke-width="3" fill="none" opacity="0.7"/>'
  + '<path d="M28,68 Q42,62 50,56 Q58,50 72,44" stroke="#40E0A0" stroke-width="3" fill="none" opacity="0.6"/>'
  + '<path d="M50,24 Q48,14 60,6" stroke="#3A2010" stroke-width="3" fill="none" stroke-linecap="round"/>'
  + '<circle cx="60" cy="6" r="4" fill="#FFD060"/><circle cx="60" cy="6" r="7" fill="#FFD060" opacity="0.35"/>'
  + '<text x="50" y="62" text-anchor="middle" font-size="15" font-weight="900" fill="#FFF" font-family="Arial,Helvetica,sans-serif" stroke="#1A0430" stroke-width="0.8">2x</text></svg>';

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
  VIEWBOX: '0 0 100 100', SVGS: Object.freeze(S), ALIASES: Object.freeze(A)
});
})();
