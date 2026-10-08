(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0;
function nid(p) { _u += 1; return p + _u.toString(36); }

function G(p, c1, c2, c3, st, body, mark) {
  return '<svg ' + H + '><defs>'
    + '<linearGradient id="' + p + '-b" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="' + c1 + '"/>'
    + '<stop offset="50%" stop-color="' + c2 + '"/>'
    + '<stop offset="100%" stop-color="' + c3 + '"/></linearGradient>'
    + '<radialGradient id="' + p + '-h" cx="35%" cy="30%" r="50%">'
    + '<stop offset="0%" stop-color="#FFF" stop-opacity="0.85"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="' + p + '-s"><feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.4"/></filter>'
    + '</defs>'
    + '<g filter="url(#' + p + '-s)">' + body + '</g>'
    + '<ellipse cx="36" cy="34" rx="12" ry="7" fill="url(#' + p + '-h)" transform="rotate(-20 36 34)"/>'
    + (mark || '') + '</svg>';
}

function C(p, c1, c2, c3, st, shape, mark) {
  var b;
  if (shape === 'heart') b = '<path d="M50,80 C28,62 16,46 16,34 C16,22 28,16 38,23 C44,27 50,36 50,36 C50,36 56,27 62,23 C72,16 84,22 84,34 C84,46 72,62 50,80 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.8"/>';
  else if (shape === 'oval') b = '<rect x="14" y="30" width="72" height="40" rx="20" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.8"/>';
  else if (shape === 'pent') b = '<path d="M50,16 L80,40 L68,76 L32,76 L20,40 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.8" stroke-linejoin="round"/>';
  else b = '<rect x="20" y="20" width="60" height="60" rx="14" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.8"/>';
  return G(p, c1, c2, c3, st, b, mark);
}

var S = {};
S.blue_candy = C('bc','#7EC8FF','#3B9EFF','#0E3E7A','#0A2E5A','oval');
S.green_candy = C('gc','#A8F0A0','#4EC22E','#0A5418','#0A4D10','pent');
S.purple_candy = C('pc','#D8A0FF','#A040D0','#3A0A5A','#2A0845','square');
S.red_heart_candy = C('rh','#FFB0B0','#E02030','#6A0A0A','#4A0505','heart',
  '<path d="M50,62 C42,56 36,50 36,45 C36,41 40,39 44,42 C46,44 50,48 50,48 C50,48 54,44 56,42 C60,39 64,41 64,45 C64,50 58,56 50,62 Z" fill="#FFF" opacity="0.9"/>');

S.banana = G('ba','#FFE66B','#F5C518','#8B5A00','#5C3A00',
  '<path d="M20,32 Q26,20 44,22 Q66,25 80,46 Q88,58 80,68 Q72,76 64,68 Q52,54 34,50 Q20,46 18,38 Q17,34 20,32 Z" fill="url(#ba-b)" stroke="#5C3A00" stroke-width="1.5"/>');

S.grape = G('gr','#C77DDF','#7E3BAF','#3A1054','#2A0A44',
  '<circle cx="36" cy="34" r="12" fill="url(#gr-b)"/><circle cx="64" cy="34" r="12" fill="url(#gr-b)"/><circle cx="50" cy="34" r="11" fill="url(#gr-b)"/>'
  + '<circle cx="28" cy="50" r="11" fill="url(#gr-b)"/><circle cx="50" cy="50" r="12" fill="url(#gr-b)"/><circle cx="72" cy="50" r="11" fill="url(#gr-b)"/>'
  + '<circle cx="38" cy="66" r="11" fill="url(#gr-b)"/><circle cx="62" cy="66" r="11" fill="url(#gr-b)"/><circle cx="50" cy="78" r="9" fill="url(#gr-b)"/>'
  + '<path d="M50,14 Q50,22 50,28" stroke="#5C3A1E" stroke-width="2.5" fill="none"/>'
  + '<path d="M52,20 Q60,12 72,16 Q64,24 52,24 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="0.8"/>',
  '<circle cx="32" cy="30" r="4" fill="#FFF" opacity="0.5"/>');

S.watermelon = G('wm','#5FB040','#3E8A28','#1A4D10','#0A3A08',
  '<circle cx="50" cy="50" r="34" fill="url(#wm-b)" stroke="#0A3A08" stroke-width="1.8"/>'
  + '<path d="M30,30 Q40,24 50,28 Q60,32 66,26" stroke="#1A4D10" stroke-width="2.5" fill="none" opacity="0.6"/>'
  + '<path d="M26,44 Q36,38 46,42 Q56,46 62,40" stroke="#1A4D10" stroke-width="2.5" fill="none" opacity="0.6"/>'
  + '<path d="M30,58 Q40,52 50,56 Q60,60 66,54" stroke="#1A4D10" stroke-width="2.5" fill="none" opacity="0.6"/>');

S.plum = G('pl','#E08FD0','#A0308F','#4A0A44','#3A0A30',
  '<circle cx="50" cy="56" r="30" fill="url(#pl-b)" stroke="#3A0A30" stroke-width="1.8"/>'
  + '<path d="M50,28 Q48,42 50,80" stroke="#3A0A30" stroke-width="1.5" fill="none" opacity="0.5"/>'
  + '<path d="M50,26 Q50,18 48,12" stroke="#5C3A1E" stroke-width="2.2" fill="none"/>'
  + '<path d="M50,22 Q60,14 70,18 Q62,26 50,24 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="0.8"/>');

S.apple = G('ap','#FF7A7A','#E02030','#6A0A0A','#4A0505',
  '<path d="M50,30 Q44,18 32,20 Q22,22 20,34 Q18,48 28,62 Q38,76 50,80 Q62,76 72,62 Q82,48 80,34 Q78,22 68,20 Q56,18 50,30 Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="1.5"/>'
  + '<path d="M50,20 Q58,12 68,16 Q64,24 50,24 Z" fill="#5FA84A" stroke="#1B5510" stroke-width="0.8"/>'
  + '<path d="M50,22 Q50,14 48,9" stroke="#5C3A1E" stroke-width="2" fill="none"/>');

S.lollipop = G('lp','#FFB6D9','#FF4081','#8A0030','#6A0020',
  '<circle cx="50" cy="42" r="28" fill="url(#lp-b)" stroke="#6A0020" stroke-width="1.8"/>'
  + '<path d="M50,14 A28,28 0 0 1 78,42" stroke="#FFF" stroke-width="6" fill="none" opacity="0.6"/>'
  + '<path d="M50,14 A28,28 0 0 0 22,42" stroke="#FF4081" stroke-width="6" fill="none" opacity="0.4"/>'
  + '<path d="M50,70 L50,92" stroke="#8A6030" stroke-width="4" stroke-linecap="round"/>');

S.multiplier_bomb = G('mb','#FFD060','#FF3030','#5A0000','#3A0000',
  '<circle cx="50" cy="54" r="28" fill="url(#mb-b)" stroke="#3A0000" stroke-width="1.8"/>'
  + '<path d="M50,26 Q50,16 58,10" stroke="#5C3A1E" stroke-width="2.5" fill="none"/>'
  + '<circle cx="58" cy="10" r="4" fill="#FFD060"/>'
  + '<text x="50" y="60" text-anchor="middle" font-size="14" font-weight="bold" fill="#FFF" font-family="Arial">2x</text>');

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
    var r = ids[i];
    if (seen[r]) continue;
    seen[r] = true;
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
