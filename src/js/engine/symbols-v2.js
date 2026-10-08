(function () {
'use strict';
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
  + 'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
  + 'aria-hidden="true" focusable="false"';
var _u = 0;
function nextUid(p) { _u += 1; return p + _u.toString(36); }

/* ---------- 6 糖果共用生成器 ---------- */
function candy(p, c1, c2, c3, st) {
  return '<svg ' + H + '><defs>'
  + '<linearGradient id="' + p + '-b" x1="15%" y1="10%" x2="85%" y2="95%">'
  +   '<stop offset="0%" stop-color="' + c1 + '"/>'
  +   '<stop offset="45%" stop-color="' + c2 + '"/>'
  +   '<stop offset="100%" stop-color="' + c3 + '"/>'
  + '</linearGradient>'
  + '<radialGradient id="' + p + '-h" cx="32%" cy="28%" r="45%">'
  +   '<stop offset="0%" stop-color="#FFF" stop-opacity="0.9"/>'
  +   '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
  + '</radialGradient>'
  + '<filter id="' + p + '-s" x="-25%" y="-25%" width="150%" height="150%">'
  +   '<feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>'
  + '</filter>'
  + '</defs>'
  + '<path d="M20,42 L8,34 L14,42 L5,50 L14,58 L8,66 L20,58 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.3" stroke-linejoin="round" filter="url(#' + p + '-s)"/>'
  + '<path d="M80,42 L92,34 L86,42 L95,50 L86,58 L92,66 L80,58 Z" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.3" stroke-linejoin="round" filter="url(#' + p + '-s)"/>'
  + '<ellipse cx="50" cy="50" rx="30" ry="22" fill="url(#' + p + '-b)" stroke="' + st + '" stroke-width="1.6" filter="url(#' + p + '-s)"/>'
  + '<ellipse cx="42" cy="42" rx="15" ry="10" fill="url(#' + p + '-h)"/>'
  + '<path d="M36,42 Q50,36 64,42 Q50,44 36,42 Z" fill="#FFF" opacity="0.7"/>'
  + '<circle cx="60" cy="56" r="1.8" fill="#FFF" opacity="0.3"/>'
  + '<circle cx="66" cy="49" r="1.2" fill="#FFF" opacity="0.25"/>'
  + '</svg>';
}

/* ---------- 5 水果 ---------- */
var BANANA = '<svg ' + H + '><defs>'
  + '<linearGradient id="ban-b" x1="20%" y1="10%" x2="80%" y2="90%"><stop offset="0%" stop-color="#FFE66B"/><stop offset="50%" stop-color="#F5C518"/><stop offset="100%" stop-color="#8B5A00"/></linearGradient>'
  + '<radialGradient id="ban-h" cx="32%" cy="28%" r="42%"><stop offset="0%" stop-color="#FFF" stop-opacity="0.95"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
  + '<filter id="ban-s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.4"/></filter>'
  + '</defs>'
  + '<path d="M22,30Q30,18 48,22Q68,26 80,48Q86,60 78,70Q72,76 64,70Q52,58 36,54Q22,50 18,40Q16,34 22,30Z" fill="url(#ban-b)" stroke="#5C3A00" stroke-width="1.2" filter="url(#ban-s)"/>'
  + '<ellipse cx="34" cy="34" rx="10" ry="5" fill="url(#ban-h)" transform="rotate(-25 34 34)"/>'
  + '<path d="M28,34Q40,30 54,38Q42,36 28,38Z" fill="#FFF" opacity="0.5"/>'
  + '</svg>';

var GRAPE = '<svg ' + H + '><defs>'
  + '<radialGradient id="grp-b" cx="35%" cy="30%" r="60%"><stop offset="0%" stop-color="#C77DDF"/><stop offset="55%" stop-color="#7E3BAF"/><stop offset="100%" stop-color="#3A1054"/></radialGradient>'
  + '<linearGradient id="grp-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7FD65F"/><stop offset="100%" stop-color="#2E7A1E"/></linearGradient>'
  + '<filter id="grp-s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity="0.45"/></filter>'
  + '</defs>'
  + '<path d="M50,12Q50,20 50,26" stroke="#5C3A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  + '<path d="M52,18Q60,10 72,14Q64,22 52,22Z" fill="url(#grp-l)" stroke="#1B5510" stroke-width="0.8"/>'
  + '<g filter="url(#grp-s)" stroke="#2A0A44" stroke-width="0.6">'
  + '<circle cx="36" cy="34" r="11" fill="url(#grp-b)"/><circle cx="62" cy="34" r="11" fill="url(#grp-b)"/><circle cx="48" cy="34" r="10" fill="url(#grp-b)"/>'
  + '<circle cx="30" cy="48" r="10" fill="url(#grp-b)"/><circle cx="50" cy="48" r="11" fill="url(#grp-b)"/><circle cx="68" cy="48" r="10" fill="url(#grp-b)"/>'
  + '<circle cx="38" cy="62" r="10" fill="url(#grp-b)"/><circle cx="58" cy="62" r="10" fill="url(#grp-b)"/>'
  + '<circle cx="48" cy="76" r="9" fill="url(#grp-b)"/>'
  + '</g>'
  + '<ellipse cx="34" cy="30" rx="4" ry="2.5" fill="#FFF" opacity="0.6"/>'
  + '</svg>';

var WATERMELON = '<svg ' + H + '><defs>'
  + '<linearGradient id="wm-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF6B7A"/><stop offset="60%" stop-color="#E02030"/><stop offset="100%" stop-color="#A01020"/></linearGradient>'
  + '<linearGradient id="wm-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5FB040"/><stop offset="100%" stop-color="#2E7A1E"/></linearGradient>'
  + '<filter id="wm-s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.4"/></filter>'
  + '</defs>'
  + '<path d="M18,30 L82,30 L50,86Z" fill="url(#wm-f)" stroke="#6B0B0B" stroke-width="1" filter="url(#wm-s)"/>'
  + '<path d="M12,32Q50,8 88,32Q88,40 82,40Q50,18 18,40Q12,40 12,32Z" fill="url(#wm-r)" stroke="#1A4D10" stroke-width="1"/>'
  + '<ellipse cx="34" cy="44" rx="1.3" ry="2" fill="#0A0A0A"/><ellipse cx="50" cy="42" rx="1.3" ry="2" fill="#0A0A0A"/><ellipse cx="66" cy="44" rx="1.3" ry="2" fill="#0A0A0A"/>'
  + '<ellipse cx="42" cy="58" rx="1.3" ry="2" fill="#0A0A0A"/><ellipse cx="58" cy="58" rx="1.3" ry="2" fill="#0A0A0A"/>'
  + '<path d="M30,44Q34,42 38,52" stroke="#FFF" stroke-width="1.5" opacity="0.55" fill="none"/>'
  + '</svg>';

var PLUM = '<svg ' + H + '><defs>'
  + '<radialGradient id="pl-b" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#E08FD0"/><stop offset="50%" stop-color="#A0308F"/><stop offset="100%" stop-color="#4A0A44"/></radialGradient>'
  + '<radialGradient id="pl-h" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#FFF" stop-opacity="0.7"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
  + '<filter id="pl-s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.42"/></filter>'
  + '</defs>'
  + '<path d="M50,24Q50,16 48,10" stroke="#5C3A1E" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  + '<path d="M50,22Q60,14 70,18Q62,26 50,24Z" fill="#5FA84A" stroke="#1B5510" stroke-width="0.8"/>'
  + '<ellipse cx="50" cy="54" rx="32" ry="26" fill="url(#pl-b)" stroke="#3A0A30" stroke-width="1.2" filter="url(#pl-s)"/>'
  + '<path d="M50,28Q47,54 50,80" stroke="#3A0A30" stroke-width="1.4" fill="none" opacity="0.55"/>'
  + '<ellipse cx="40" cy="46" rx="11" ry="7" fill="url(#pl-h)"/>'
  + '</svg>';

var APPLE = '<svg ' + H + '><defs>'
  + '<linearGradient id="ap-b" x1="20%" y1="10%" x2="80%" y2="90%"><stop offset="0%" stop-color="#FF7A7A"/><stop offset="45%" stop-color="#E02030"/><stop offset="100%" stop-color="#6A0A0A"/></linearGradient>'
  + '<radialGradient id="ap-h" cx="35%" cy="30%" r="50%"><stop offset="0%" stop-color="#FFF" stop-opacity="0.85"/><stop offset="100%" stop-color="#FFF" stop-opacity="0"/></radialGradient>'
  + '<filter id="ap-s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity="0.42"/></filter>'
  + '</defs>'
  + '<path d="M50,30Q44,18 32,20Q22,22 20,34Q18,48 28,62Q38,76 50,80Q62,76 72,62Q82,48 80,34Q78,22 68,20Q56,18 50,30Z" fill="url(#ap-b)" stroke="#4A0505" stroke-width="1.2" filter="url(#ap-s)"/>'
  + '<ellipse cx="36" cy="38" rx="9" ry="6" fill="url(#ap-h)" transform="rotate(-25 36 38)"/>'
  + '<path d="M50,20Q58,12 68,16Q64,24 50,24Z" fill="#5FA84A" stroke="#1B5510" stroke-width="0.8"/>'
  + '<path d="M50,22Q50,14 48,9" stroke="#5C3A1E" stroke-width="2" fill="none" stroke-linecap="round"/>'
  + '</svg>';

/* ---------- 注册表 ---------- */
var SVGS = {
  banana: BANANA,
  grape: GRAPE,
  watermelon: WATERMELON,
  plum: PLUM,
  apple: APPLE,
  blue_candy: candy('bc', '#8AD8FF', '#3B9EFF', '#0E3E7A', '#0A2E5A'),
  green_candy: candy('gc', '#B5F5A0', '#4EC22E', '#0A5418', '#0A4D10'),
  purple_candy: candy('pc', '#E0A8FF', '#A040D0', '#3A0A5A', '#2A0845'),
  red_heart_candy: candy('rh', '#FFA0A0', '#E02030', '#6A0A0A', '#4A0505'),
  lollipop: candy('lp', '#FFE0A0', '#FF8030', '#8A2A00', '#4A1500'),
  multiplier_bomb: candy('mb', '#FFD060', '#FF3030', '#5A0000', '#3A0000')
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

function get(id, uid) {
  var raw = SVGS[id];
  if (!raw) return '';
  return scopeIds(raw, uid || nextUid('s'));
}
function has(id) { return Object.prototype.hasOwnProperty.call(SVGS, id); }
function list() { return Object.keys(SVGS); }

window.ApexSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  VIEWBOX: '0 0 100 100',
  SVGS: Object.freeze(SVGS)
});
})();
