/* Apex · Fruit Symbols V4
 * 5 个水果 SVG。挂载：window.ApexFruitSvg
 * 用法：window.ApexFruitSvg.get('banana', 'uid1')
 *
 * V4 原则：
 *   - 真实水果轮廓 + 自然不对称
 *   - 真实果皮颜色 + 局部高光
 *   - 避免过度发光 / 完美对称 / 统一灰色底影
 */
(function () {
  'use strict';

  var VIEWBOX = '0 0 256 256';
  var SVG_HEAD = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX
    + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"';

  /* ============================================================
   * BANANA
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="banana-v4-body" x1="15%" y1="15%" x2="90%" y2="85%">'
    + '<stop offset="0%" stop-color="#FFF39A"/>'
    + '<stop offset="18%" stop-color="#FFE45A"/>'
    + '<stop offset="48%" stop-color="#F5C52C"/>'
    + '<stop offset="78%" stop-color="#DDA51A"/>'
    + '<stop offset="100%" stop-color="#A96E0A"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v4-light" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFF8B8" stop-opacity=".82"/>'
    + '<stop offset="55%" stop-color="#FFE765" stop-opacity=".30"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v4-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9D671A"/>'
    + '<stop offset="50%" stop-color="#67400F"/>'
    + '<stop offset="100%" stop-color="#351F08"/>'
    + '</linearGradient>'
    + '<filter id="banana-v4-soft" x="-30%" y="-30%" width="160%" height="170%">'
    + '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#775000" flood-opacity=".18"/>'
    + '</filter>'
    + '</defs>'
    + '<path d="M 73 43 C 67 49, 63 59, 61 72 C 58 91, 61 112, 70 130 C 79 149, 94 165, 111 175 C 126 184, 143 187, 157 181 C 174 174, 185 159, 190 140 C 193 129, 195 119, 201 117 C 207 115, 211 121, 210 128 C 208 151, 198 174, 181 189 C 164 204, 143 210, 121 206 C 96 202, 76 188, 62 169 C 47 148, 40 123, 42 98 C 44 75, 51 56, 61 45 C 65 40, 70 39, 73 43 Z" fill="url(#banana-v4-body)" filter="url(#banana-v4-soft)"/>'
    + '<path d="M 59 57 C 50 81, 51 108, 61 131 C 72 156, 91 177, 113 188 C 132 197, 153 194, 169 183" fill="none" stroke="url(#banana-v4-light)" stroke-width="12" stroke-linecap="round"/>'
    + '<path d="M 72 52 C 62 78, 64 108, 75 133" fill="none" stroke="#E0A817" stroke-width="3" opacity=".42" stroke-linecap="round"/>'
    + '<path d="M 68 47 C 65 40, 66 31, 72 25 C 77 20, 84 22, 85 28 C 86 33, 81 39, 78 44 L 77 50 Z" fill="url(#banana-v4-stem)"/>'
    + '<ellipse cx="77" cy="26" rx="6" ry="3.5" transform="rotate(-20 77 26)" fill="#382108"/>'
    + '<path d="M 197 116 C 202 112, 208 114, 210 120 C 212 125, 208 131, 202 133 L 195 128 Z" fill="#75490C"/>'
    + '<path d="M 78 68 C 70 94, 75 120, 87 143" fill="none" stroke="#B77A0C" stroke-width="1.5" opacity=".24" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="grape-v4-ball" cx="30%" cy="22%" r="78%">'
    + '<stop offset="0%" stop-color="#E4B8F5"/>'
    + '<stop offset="17%" stop-color="#B96EE1"/>'
    + '<stop offset="48%" stop-color="#7133AD"/>'
    + '<stop offset="78%" stop-color="#4D2185"/>'
    + '<stop offset="100%" stop-color="#301254"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-v4-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A7D94A"/>'
    + '<stop offset="48%" stop-color="#5BAA2F"/>'
    + '<stop offset="100%" stop-color="#2B6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-v4-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9A672B"/>'
    + '<stop offset="60%" stop-color="#654016"/>'
    + '<stop offset="100%" stop-color="#38220B"/>'
    + '</linearGradient>'
    + '</defs>'
    + '<path d="M 126 65 C 106 48, 84 43, 62 51 C 69 68, 88 78, 110 79 C 98 87, 94 98, 96 108 C 114 100, 125 86, 130 72 Z" fill="url(#grape-v4-leaf)"/>'
    + '<path d="M 130 69 C 143 48, 163 41, 183 46 C 175 63, 157 73, 135 75 Z" fill="url(#grape-v4-leaf)"/>'
    + '<path d="M 66 54 C 86 62, 105 68, 127 70" fill="none" stroke="#3C8127" stroke-width="2" opacity=".6"/>'
    + '<path d="M 135 70 C 150 61, 166 52, 180 48" fill="none" stroke="#3C8127" stroke-width="2" opacity=".6"/>'
    + '<path d="M 128 70 C 124 56, 120 44, 126 32 C 129 27, 136 25, 141 28" fill="none" stroke="url(#grape-v4-stem)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M 128 70 C 119 81, 108 91, 101 103 M 130 71 C 140 82, 150 92, 157 104" fill="none" stroke="url(#grape-v4-stem)" stroke-width="4" stroke-linecap="round"/>'
    + '<g>'
    + '<circle cx="127" cy="89" r="18" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="105" cy="110" r="20" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="149" cy="109" r="21" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="87" cy="132" r="19" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="125" cy="133" r="21" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="164" cy="133" r="20" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="103" cy="157" r="19" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="140" cy="158" r="20" fill="url(#grape-v4-ball)"/>'
    + '<circle cx="122" cy="180" r="17" fill="url(#grape-v4-ball)"/>'
    + '</g>'
    + '<g fill="#FFFFFF" opacity=".52">'
    + '<ellipse cx="121" cy="83" rx="5" ry="3" transform="rotate(-35 121 83)"/>'
    + '<ellipse cx="98" cy="103" rx="5" ry="3" transform="rotate(-38 98 103)"/>'
    + '<ellipse cx="143" cy="101" rx="5" ry="3" transform="rotate(-32 143 101)"/>'
    + '<ellipse cx="80" cy="125" rx="5" ry="3" transform="rotate(-35 80 125)"/>'
    + '<ellipse cx="118" cy="125" rx="5" ry="3" transform="rotate(-30 118 125)"/>'
    + '<ellipse cx="157" cy="126" rx="5" ry="3" transform="rotate(-35 157 126)"/>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * WATERMELON
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="melon-v4-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#338E45"/>'
    + '<stop offset="45%" stop-color="#176D36"/>'
    + '<stop offset="100%" stop-color="#0B4727"/>'
    + '</linearGradient>'
    + '<linearGradient id="melon-v4-light-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#D6F08E"/>'
    + '<stop offset="55%" stop-color="#8FCB55"/>'
    + '<stop offset="100%" stop-color="#57953B"/>'
    + '</linearGradient>'
    + '<radialGradient id="melon-v4-flesh" cx="42%" cy="30%" r="78%">'
    + '<stop offset="0%" stop-color="#FF8D91"/>'
    + '<stop offset="35%" stop-color="#FF666E"/>'
    + '<stop offset="70%" stop-color="#F04452"/>'
    + '<stop offset="100%" stop-color="#D8243B"/>'
    + '</radialGradient>'
    + '</defs>'
    + '<path d="M 47 139 C 55 103, 87 76, 126 74 C 166 72, 200 100, 209 139 L 202 169 C 185 191, 158 203, 127 204 C 96 203, 69 191, 53 169 Z" fill="url(#melon-v4-rind)"/>'
    + '<path d="M 53 140 C 61 108, 90 84, 126 82 C 162 80, 192 106, 202 140 L 196 162 C 179 182, 154 193, 127 193 C 100 193, 76 182, 59 162 Z" fill="url(#melon-v4-light-rind)"/>'
    + '<path d="M 59 140 C 68 113, 94 91, 127 90 C 160 89, 187 112, 196 140 L 190 153 C 173 170, 151 180, 127 180 C 103 180, 82 170, 65 153 Z" fill="#F8F7DC"/>'
    + '<path d="M 65 138 C 74 114, 97 97, 127 96 C 157 95, 181 114, 190 138 L 184 150 C 168 165, 149 173, 127 173 C 105 173, 86 165, 71 150 Z" fill="url(#melon-v4-flesh)"/>'
    + '<g fill="#382020">'
    + '<ellipse cx="93" cy="133" rx="4" ry="8" transform="rotate(-28 93 133)"/>'
    + '<ellipse cx="111" cy="117" rx="4" ry="8" transform="rotate(-13 111 117)"/>'
    + '<ellipse cx="130" cy="113" rx="4" ry="8" transform="rotate(4 130 113)"/>'
    + '<ellipse cx="150" cy="117" rx="4" ry="8" transform="rotate(16 150 117)"/>'
    + '<ellipse cx="169" cy="133" rx="4" ry="8" transform="rotate(26 169 133)"/>'
    + '<ellipse cx="127" cy="143" rx="4" ry="8"/>'
    + '<ellipse cx="108" cy="145" rx="4" ry="8" transform="rotate(-12 108 145)"/>'
    + '</g>'
    + '<path d="M 79 131 C 88 112, 108 101, 127 100" fill="none" stroke="#FFB1B1" stroke-width="5" stroke-linecap="round" opacity=".32"/>'
    + '<path d="M 62 151 C 82 177, 102 188, 127 189 M 127 189 C 154 188, 177 176, 195 151" fill="none" stroke="#3C8B3C" stroke-width="2" opacity=".45" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * PLUM
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="plum-v4-body" cx="30%" cy="22%" r="82%">'
    + '<stop offset="0%" stop-color="#D887A4"/>'
    + '<stop offset="17%" stop-color="#B94F79"/>'
    + '<stop offset="42%" stop-color="#8A315F"/>'
    + '<stop offset="72%" stop-color="#651F50"/>'
    + '<stop offset="100%" stop-color="#3E1237"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-v4-side" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#E194A9"/>'
    + '<stop offset="35%" stop-color="#B44770"/>'
    + '<stop offset="100%" stop-color="#641B4B"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v4-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A6D84D"/>'
    + '<stop offset="45%" stop-color="#5DA92F"/>'
    + '<stop offset="100%" stop-color="#2C6E27"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v4-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9B672B"/>'
    + '<stop offset="60%" stop-color="#603C15"/>'
    + '<stop offset="100%" stop-color="#321F0B"/>'
    + '</linearGradient>'
    + '</defs>'
    + '<path d="M 128 63 C 143 44, 163 37, 183 43 C 175 60, 158 72, 136 74 C 132 71, 130 67, 128 63 Z" fill="url(#plum-v4-leaf)"/>'
    + '<path d="M 135 68 C 151 59, 166 50, 179 45" fill="none" stroke="#3B7E29" stroke-width="2" stroke-linecap="round" opacity=".65"/>'
    + '<path d="M 127 64 C 125 51, 128 40, 135 31" fill="none" stroke="url(#plum-v4-stem)" stroke-width="8" stroke-linecap="round"/>'
    + '<path d="M 128 61 C 106 57, 86 64, 75 81 C 63 100, 62 125, 68 148 C 74 171, 87 190, 105 201 C 114 207, 122 210, 128 210 C 135 210, 144 207, 153 201 C 171 190, 184 171, 190 148 C 196 125, 193 100, 181 81 C 170 64, 150 57, 128 61 Z" fill="url(#plum-v4-body)"/>'
    + '<path d="M 101 71 C 80 82, 74 104, 76 128 C 78 151, 88 173, 106 188" fill="none" stroke="url(#plum-v4-side)" stroke-width="18" stroke-linecap="round" opacity=".72"/>'
    + '<path d="M 128 61 C 121 82, 119 104, 120 126 C 121 150, 125 177, 128 200" fill="none" stroke="#34122F" stroke-width="8" stroke-linecap="round" opacity=".52"/>'
    + '<path d="M 124 64 C 119 89, 120 113, 122 138" fill="none" stroke="#D18AA4" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>'
    + '<ellipse cx="116" cy="105" rx="54" ry="65" fill="#E7B2C7" opacity=".07"/>'
    + '<ellipse cx="99" cy="91" rx="16" ry="8" transform="rotate(-42 99 91)" fill="#FFFFFF" opacity=".22"/>'
    + '</svg>';

  /* ============================================================
   * APPLE
   * ============================================================ */
  var APPLE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="apple-v4-body" cx="31%" cy="22%" r="85%">'
    + '<stop offset="0%" stop-color="#FF9A9E"/>'
    + '<stop offset="18%" stop-color="#FF6269"/>'
    + '<stop offset="46%" stop-color="#EF303B"/>'
    + '<stop offset="73%" stop-color="#D11728"/>'
    + '<stop offset="94%" stop-color="#9E0D1C"/>'
    + '<stop offset="100%" stop-color="#720915"/>'
    + '</radialGradient>'
    + '<linearGradient id="apple-v4-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DA4C"/>'
    + '<stop offset="48%" stop-color="#61B32F"/>'
    + '<stop offset="100%" stop-color="#2F7728"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-v4-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#986229"/>'
    + '<stop offset="55%" stop-color="#624018"/>'
    + '<stop offset="100%" stop-color="#34210B"/>'
    + '</linearGradient>'
    + '</defs>'
    + '<path d="M 129 59 C 143 42, 162 35, 181 40 C 175 56, 159 68, 136 71 C 133 67, 131 63, 129 59 Z" fill="url(#apple-v4-leaf)"/>'
    + '<path d="M 135 65 C 150 56, 165 47, 177 42" fill="none" stroke="#3C8228" stroke-width="2" stroke-linecap="round" opacity=".65"/>'
    + '<path d="M 127 68 C 124 54, 126 42, 132 32" fill="none" stroke="url(#apple-v4-stem)" stroke-width="8" stroke-linecap="round"/>'
    + '<path d="M 128 70 C 116 59, 101 56, 88 61 C 68 68, 57 87, 58 111 C 59 140, 71 170, 89 191 C 101 204, 116 211, 128 212 C 140 211, 155 204, 167 191 C 185 170, 197 140, 198 111 C 199 87, 188 68, 168 61 C 155 56, 140 59, 128 70 Z" fill="url(#apple-v4-body)"/>'
    + '<path d="M 92 72 C 72 84, 67 108, 71 132 C 75 156, 88 179, 106 193" fill="none" stroke="#FF6B65" stroke-width="17" stroke-linecap="round" opacity=".30"/>'
    + '<path d="M 101 69 C 110 78, 119 82, 128 82 C 138 82, 147 77, 155 68" fill="none" stroke="#970C1A" stroke-width="9" stroke-linecap="round" opacity=".65"/>'
    + '<path d="M 108 69 C 116 76, 122 79, 128 79 C 135 79, 141 75, 148 69" fill="none" stroke="#650812" stroke-width="3.5" stroke-linecap="round" opacity=".65"/>'
    + '<ellipse cx="91" cy="94" rx="18" ry="10" transform="rotate(-42 91 94)" fill="#FFFFFF" opacity=".36"/>'
    + '<path d="M 80 96 C 73 113, 77 133, 85 145" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".18"/>'
    + '<ellipse cx="77" cy="110" rx="5" ry="3" transform="rotate(-40 77 110)" fill="#FFFFFF" opacity=".28"/>'
    + '</svg>';

  /* ============================================================
   * SVGS + ALIASES + 挂载
   * ============================================================ */
  var SVGS = {
    banana: BANANA_SVG,
    grape: GRAPE_SVG,
    watermelon: WATERMELON_SVG,
    plum: PLUM_SVG,
    apple: APPLE_SVG
  };

  var ALIASES = {
    'sb-fruit-banana':     'banana',
    'sb-fruit-grape':      'grape',
    'sb-fruit-watermelon': 'watermelon',
    'sb-fruit-plum':       'plum',
    'sb-fruit-apple':      'apple'
  };

  function resolveKey(id) {
    if (SVGS[id]) return id;
    if (ALIASES[id]) return ALIASES[id];
    return null;
  }

  function scopeIds(svg, uid) {
    if (!uid) return svg;
    var idRe = /id="([^"]+)"/g;
    var ids = [];
    var m;
    while ((m = idRe.exec(svg)) !== null) ids.push(m[1]);
    var seen = {};
    for (var i = 0; i < ids.length; i++) {
      var raw = ids[i];
      if (seen[raw]) continue;
      seen[raw] = true;
      var esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var idReg = new RegExp('id="' + esc + '"', 'g');
      var urlReg = new RegExp('url\\(#' + esc + '\\)', 'g');
      svg = svg.replace(idReg, 'id="' + raw + '-' + uid + '"');
      svg = svg.replace(urlReg, 'url(#' + raw + '-' + uid + ')');
    }
    return svg;
  }

  function get(id, uid) {
    var key = resolveKey(id);
    if (!key) return '';
    return scopeIds(SVGS[key], uid || '');
  }

  function has(id) { return resolveKey(id) !== null; }
  function list() { return Object.keys(SVGS); }

  window.ApexFruitSvg = Object.freeze({
    get: get,
    has: has,
    list: list,
    SVGS: Object.freeze(SVGS),
    ALIASES: Object.freeze(ALIASES)
  });

})();
