/* Apex · Fruit Symbols SVG (v1)
 * 5 个水果的完整 SVG。挂载：window.ApexFruitSvg
 * 用法：window.ApexFruitSvg.get('banana', 'uid1')
 */
(function () {
  'use strict';

  var VIEWBOX = '0 0 256 256';
  var SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX
    + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"'
    + ' role="img" focusable="false"';

  /* ============================================================
   * BANANA
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_ATTRS + '>'
    + '<defs>'
    + '<linearGradient id="banana-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#FFF48A"/>'
    + '<stop offset="18%" stop-color="#FFE85A"/>'
    + '<stop offset="48%" stop-color="#F8C928"/>'
    + '<stop offset="78%" stop-color="#E9A916"/>'
    + '<stop offset="100%" stop-color="#C8840C"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-inner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFF6A5"/>'
    + '<stop offset="45%" stop-color="#FFD93D"/>'
    + '<stop offset="100%" stop-color="#EAA916"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-highlight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.82"/>'
    + '<stop offset="55%" stop-color="#FFF7A6" stop-opacity="0.38"/>'
    + '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-stem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8A5A10"/>'
    + '<stop offset="40%" stop-color="#B77913"/>'
    + '<stop offset="70%" stop-color="#70410B"/>'
    + '<stop offset="100%" stop-color="#4D2D08"/>'
    + '</linearGradient>'
    + '<filter id="banana-shadow" x="-40%" y="-40%" width="180%" height="200%">'
    + '<feGaussianBlur stdDeviation="5"/>'
    + '</filter>'
    + '<filter id="banana-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">'
    + '<feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#6B4A00" flood-opacity="0.20"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="126" cy="218" rx="70" ry="10" fill="#000000" opacity="0.13" filter="url(#banana-shadow)"/>'
    + '<path d="M 73 47 C 79 42, 88 43, 92 50 C 94 55, 92 62, 89 69 C 85 80, 84 91, 88 104 C 94 123, 105 139, 120 150 C 136 162, 151 166, 164 159 C 177 152, 184 139, 188 124 C 191 112, 196 108, 202 112 C 208 116, 208 126, 206 136 C 203 158, 192 179, 174 191 C 154 205, 131 206, 109 195 C 83 183, 65 161, 56 136 C 47 111, 48 84, 58 62 C 61 55, 67 50, 73 47 Z" fill="url(#banana-body-gradient)" filter="url(#banana-soft-shadow)"/>'
    + '<path d="M 69 61 C 63 83, 64 107, 74 130 C 85 155, 103 175, 126 184 C 148 193, 170 184, 184 168 C 171 179, 153 182, 135 174 C 113 164, 96 146, 87 125 C 77 102, 75 80, 82 60 Z" fill="url(#banana-inner-gradient)" opacity="0.88"/>'
    + '<path d="M 68 61 C 60 84, 63 111, 74 134 C 86 159, 105 177, 128 186" fill="none" stroke="url(#banana-highlight-gradient)" stroke-width="9" stroke-linecap="round" opacity="0.85"/>'
    + '<path d="M 72 47 C 69 40, 71 31, 78 25 C 83 21, 90 23, 91 29 C 92 34, 87 39, 84 43 L 82 51 Z" fill="url(#banana-stem-gradient)"/>'
    + '<ellipse cx="80" cy="27" rx="7" ry="4" transform="rotate(-25 80 27)" fill="#4E2B08" opacity="0.9"/>'
    + '<path d="M 196 111 C 201 107, 207 110, 209 116 C 211 122, 207 128, 202 130 L 194 127 Z" fill="#85510A"/>'
    + '<path d="M 78 79 C 72 104 78 130 91 149" fill="none" stroke="#D69A16" stroke-width="2" opacity="0.28" stroke-linecap="round"/>'
    + '<path d="M 179 131 C 174 151 163 165 147 173" fill="none" stroke="#B9760A" stroke-width="2" opacity="0.22" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_ATTRS + '>'
    + '<defs>'
    + '<radialGradient id="grape-ball-gradient" cx="30%" cy="22%" r="80%">'
    + '<stop offset="0%" stop-color="#E9C7FF"/>'
    + '<stop offset="18%" stop-color="#B77AE8"/>'
    + '<stop offset="55%" stop-color="#7135B5"/>'
    + '<stop offset="82%" stop-color="#4E218B"/>'
    + '<stop offset="100%" stop-color="#35145F"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DF49"/>'
    + '<stop offset="40%" stop-color="#62B92D"/>'
    + '<stop offset="100%" stop-color="#2E7E22"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-stem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9C6A25"/>'
    + '<stop offset="50%" stop-color="#6B4315"/>'
    + '<stop offset="100%" stop-color="#40260D"/>'
    + '</linearGradient>'
    + '<filter id="grape-shadow" x="-50%" y="-50%" width="200%" height="220%">'
    + '<feGaussianBlur stdDeviation="4"/>'
    + '</filter>'
    + '<filter id="grape-ball-shadow" x="-40%" y="-40%" width="180%" height="190%">'
    + '<feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#321052" flood-opacity="0.25"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="128" cy="220" rx="55" ry="8" fill="#000" opacity="0.12" filter="url(#grape-shadow)"/>'
    + '<path d="M 126 67 C 102 52, 79 47, 58 56 C 72 69, 90 79, 112 80 C 99 91, 96 103, 100 113 C 116 104, 127 91, 132 76 Z" fill="url(#grape-leaf-gradient)"/>'
    + '<path d="M 63 60 C 83 66, 104 72, 127 72" fill="none" stroke="#3D8E23" stroke-width="2.2" stroke-linecap="round" opacity="0.65"/>'
    + '<path d="M 128 71 C 139 51, 157 43, 178 47 C 169 65, 151 76, 131 79 Z" fill="url(#grape-leaf-gradient)"/>'
    + '<path d="M 128 70 C 126 57, 119 48, 121 37 C 123 29, 130 24, 137 25 C 142 26, 145 31, 143 35" fill="none" stroke="url(#grape-stem-gradient)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M 127 69 C 117 82, 108 91, 100 102 M 131 69 C 141 81, 151 91, 159 103" fill="none" stroke="url(#grape-stem-gradient)" stroke-width="4" stroke-linecap="round"/>'
    + '<circle cx="128" cy="91" r="20" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="105" cy="112" r="21" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="151" cy="112" r="21" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="88" cy="136" r="21" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="128" cy="137" r="22" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="168" cy="136" r="21" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="106" cy="164" r="20" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<circle cx="148" cy="164" r="20" fill="url(#grape-ball-gradient)" filter="url(#grape-ball-shadow)"/>'
    + '<g fill="#FFFFFF" opacity="0.58">'
    + '<ellipse cx="121" cy="84" rx="6" ry="4" transform="rotate(-35 121 84)"/>'
    + '<ellipse cx="98" cy="105" rx="6" ry="4" transform="rotate(-35 98 105)"/>'
    + '<ellipse cx="144" cy="105" rx="6" ry="4" transform="rotate(-35 144 105)"/>'
    + '<ellipse cx="81" cy="129" rx="6" ry="4" transform="rotate(-35 81 129)"/>'
    + '<ellipse cx="121" cy="129" rx="6" ry="4" transform="rotate(-35 121 129)"/>'
    + '<ellipse cx="161" cy="129" rx="6" ry="4" transform="rotate(-35 161 129)"/>'
    + '<ellipse cx="99" cy="157" rx="6" ry="4" transform="rotate(-35 99 157)"/>'
    + '<ellipse cx="141" cy="157" rx="6" ry="4" transform="rotate(-35 141 157)"/>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * WATERMELON
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_ATTRS + '>'
    + '<defs>'
    + '<linearGradient id="watermelon-rind-dark" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#2E8E43"/>'
    + '<stop offset="55%" stop-color="#187238"/>'
    + '<stop offset="100%" stop-color="#0D512B"/>'
    + '</linearGradient>'
    + '<linearGradient id="watermelon-rind-light" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#D9F59A"/>'
    + '<stop offset="45%" stop-color="#A7D85B"/>'
    + '<stop offset="100%" stop-color="#6DAF3D"/>'
    + '</linearGradient>'
    + '<radialGradient id="watermelon-flesh" cx="45%" cy="35%" r="80%">'
    + '<stop offset="0%" stop-color="#FF858B"/>'
    + '<stop offset="38%" stop-color="#FF626E"/>'
    + '<stop offset="75%" stop-color="#EF3F52"/>'
    + '<stop offset="100%" stop-color="#D9273D"/>'
    + '</radialGradient>'
    + '<linearGradient id="watermelon-highlight" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.42"/>'
    + '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<filter id="watermelon-shadow" x="-40%" y="-40%" width="180%" height="200%">'
    + '<feGaussianBlur stdDeviation="4"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="128" cy="216" rx="69" ry="9" fill="#000" opacity="0.12" filter="url(#watermelon-shadow)"/>'
    + '<path d="M 43 153 A 85 85 0 0 1 213 153 L 207 169 A 79 79 0 0 0 49 169 Z" fill="url(#watermelon-rind-dark)"/>'
    + '<path d="M 50 153 A 78 78 0 0 1 206 153 L 201 163 A 72 72 0 0 0 55 163 Z" fill="url(#watermelon-rind-light)"/>'
    + '<path d="M 55 151 A 73 73 0 0 1 201 151 L 198 158 A 68 68 0 0 0 58 158 Z" fill="#F5F7D9"/>'
    + '<path d="M 59 151 A 69 69 0 0 1 197 151 L 191 153 A 63 63 0 0 0 65 153 Z" fill="url(#watermelon-flesh)"/>'
    + '<path d="M 62 148 A 66 66 0 0 1 194 148 L 188 152 A 60 60 0 0 0 68 152 Z" fill="#F44959" opacity="0.42"/>'
    + '<g fill="#3A2020">'
    + '<ellipse cx="91" cy="137" rx="4" ry="8" transform="rotate(-22 91 137)"/>'
    + '<ellipse cx="112" cy="119" rx="4" ry="8" transform="rotate(-12 112 119)"/>'
    + '<ellipse cx="136" cy="116" rx="4" ry="8" transform="rotate(8 136 116)"/>'
    + '<ellipse cx="160" cy="126" rx="4" ry="8" transform="rotate(20 160 126)"/>'
    + '<ellipse cx="174" cy="143" rx="4" ry="8" transform="rotate(25 174 143)"/>'
    + '<ellipse cx="73" cy="145" rx="4" ry="8" transform="rotate(-28 73 145)"/>'
    + '</g>'
    + '<g fill="#8B5656" opacity="0.55">'
    + '<ellipse cx="90" cy="134" rx="1.5" ry="3" transform="rotate(-22 90 134)"/>'
    + '<ellipse cx="111" cy="116" rx="1.5" ry="3" transform="rotate(-12 111 116)"/>'
    + '<ellipse cx="135" cy="113" rx="1.5" ry="3" transform="rotate(8 135 113)"/>'
    + '</g>'
    + '<path d="M 76 142 A 54 54 0 0 1 174 125" fill="none" stroke="url(#watermelon-highlight)" stroke-width="7" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * PLUM
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_ATTRS + '>'
    + '<defs>'
    + '<radialGradient id="plum-body-gradient" cx="32%" cy="23%" r="85%">'
    + '<stop offset="0%" stop-color="#D97A9D"/>'
    + '<stop offset="16%" stop-color="#B84C79"/>'
    + '<stop offset="42%" stop-color="#8F2E61"/>'
    + '<stop offset="70%" stop-color="#68214F"/>'
    + '<stop offset="92%" stop-color="#49183F"/>'
    + '<stop offset="100%" stop-color="#32112F"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-side-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#E38AA8"/>'
    + '<stop offset="35%" stop-color="#AF3F6E"/>'
    + '<stop offset="75%" stop-color="#722250"/>'
    + '<stop offset="100%" stop-color="#421637"/>'
    + '</linearGradient>'
    + '<radialGradient id="plum-bloom" cx="45%" cy="35%" r="70%">'
    + '<stop offset="0%" stop-color="#E6A9BF" stop-opacity="0.25"/>'
    + '<stop offset="100%" stop-color="#A9789B" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9BCB42"/>'
    + '<stop offset="40%" stop-color="#58A82F"/>'
    + '<stop offset="100%" stop-color="#2C6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-stem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9B682D"/>'
    + '<stop offset="60%" stop-color="#654018"/>'
    + '<stop offset="100%" stop-color="#3E270F"/>'
    + '</linearGradient>'
    + '<filter id="plum-shadow" x="-40%" y="-40%" width="180%" height="200%">'
    + '<feGaussianBlur stdDeviation="5"/>'
    + '</filter>'
    + '<filter id="plum-body-shadow" x="-30%" y="-30%" width="160%" height="180%">'
    + '<feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#32102D" flood-opacity="0.28"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="128" cy="218" rx="57" ry="9" fill="#000" opacity="0.13" filter="url(#plum-shadow)"/>'
    + '<path d="M 130 62 C 144 44, 164 38, 183 44 C 174 61, 157 73, 136 74 C 133 70, 131 66, 130 62 Z" fill="url(#plum-leaf-gradient)"/>'
    + '<path d="M 135 68 C 151 60, 165 53, 178 47" fill="none" stroke="#3F812A" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>'
    + '<path d="M 128 61 C 125 50, 127 39, 134 31" fill="none" stroke="url(#plum-stem-gradient)" stroke-width="8" stroke-linecap="round"/>'
    + '<path d="M 128 57 C 104 54, 82 65, 72 84 C 60 106, 62 139, 76 165 C 88 188, 106 202, 128 205 C 150 202, 168 188, 180 165 C 194 139, 196 106, 184 84 C 174 65, 152 54, 128 57 Z" fill="url(#plum-body-gradient)" filter="url(#plum-body-shadow)"/>'
    + '<path d="M 111 68 C 88 76, 76 100, 77 126 C 78 152, 89 174, 107 188" fill="none" stroke="url(#plum-side-gradient)" stroke-width="17" stroke-linecap="round" opacity="0.72"/>'
    + '<path d="M 127 60 C 119 80, 117 103, 119 126 C 121 151, 125 177, 128 197" fill="none" stroke="#32122F" stroke-width="7" stroke-linecap="round" opacity="0.48"/>'
    + '<path d="M 124 62 C 119 88, 120 112, 122 136" fill="none" stroke="#D58AA6" stroke-width="2.5" stroke-linecap="round" opacity="0.42"/>'
    + '<ellipse cx="119" cy="105" rx="61" ry="72" fill="url(#plum-bloom)"/>'
    + '<ellipse cx="101" cy="91" rx="17" ry="9" transform="rotate(-40 101 91)" fill="#FFFFFF" opacity="0.28"/>'
    + '<ellipse cx="92" cy="107" rx="6" ry="3" transform="rotate(-42 92 107)" fill="#FFFFFF" opacity="0.24"/>'
    + '</svg>';

  /* ============================================================
   * APPLE
   * ============================================================ */
  var APPLE_SVG = '<svg ' + SVG_ATTRS + '>'
    + '<defs>'
    + '<radialGradient id="apple-body-gradient" cx="34%" cy="24%" r="84%">'
    + '<stop offset="0%" stop-color="#FF9B9E"/>'
    + '<stop offset="18%" stop-color="#FF6268"/>'
    + '<stop offset="45%" stop-color="#F1323C"/>'
    + '<stop offset="72%" stop-color="#D71928"/>'
    + '<stop offset="92%" stop-color="#A90F20"/>'
    + '<stop offset="100%" stop-color="#760B19"/>'
    + '</radialGradient>'
    + '<linearGradient id="apple-side-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#FF555C"/>'
    + '<stop offset="50%" stop-color="#D51A2B"/>'
    + '<stop offset="100%" stop-color="#8B0B18"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DB4B"/>'
    + '<stop offset="40%" stop-color="#62B52F"/>'
    + '<stop offset="100%" stop-color="#2F7927"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-stem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9B672B"/>'
    + '<stop offset="50%" stop-color="#684116"/>'
    + '<stop offset="100%" stop-color="#3C250D"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.80"/>'
    + '<stop offset="55%" stop-color="#FFD8D8" stop-opacity="0.24"/>'
    + '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<filter id="apple-shadow" x="-40%" y="-40%" width="180%" height="200%">'
    + '<feGaussianBlur stdDeviation="5"/>'
    + '</filter>'
    + '<filter id="apple-body-shadow" x="-30%" y="-30%" width="160%" height="180%">'
    + '<feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#620813" flood-opacity="0.28"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="128" cy="219" rx="61" ry="9" fill="#000" opacity="0.13" filter="url(#apple-shadow)"/>'
    + '<path d="M 130 59 C 142 42, 160 34, 180 39 C 174 55, 158 68, 136 71 C 133 68, 131 64, 130 59 Z" fill="url(#apple-leaf-gradient)"/>'
    + '<path d="M 135 65 C 150 56, 165 47, 176 41" fill="none" stroke="#3E8428" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>'
    + '<path d="M 126 66 C 124 54, 125 42, 131 32" fill="none" stroke="url(#apple-stem-gradient)" stroke-width="9" stroke-linecap="round"/>'
    + '<path d="M 128 68 C 116 57, 98 54, 84 61 C 64 70, 53 89, 54 113 C 55 141, 68 174, 88 193 C 101 205, 116 211, 128 212 C 140 211, 155 205, 168 193 C 188 174, 201 141, 202 113 C 203 89, 192 70, 172 61 C 158 54, 140 57, 128 68 Z" fill="url(#apple-body-gradient)" filter="url(#apple-body-shadow)"/>'
    + '<path d="M 94 72 C 71 83, 65 108, 70 133 C 75 159, 89 180, 107 194" fill="none" stroke="url(#apple-side-gradient)" stroke-width="19" stroke-linecap="round" opacity="0.60"/>'
    + '<path d="M 101 68 C 109 77, 118 81, 128 82 C 138 81, 147 77, 155 68" fill="none" stroke="#9B0D1C" stroke-width="9" stroke-linecap="round" opacity="0.62"/>'
    + '<path d="M 108 69 C 116 76, 121 78, 128 79 C 135 78, 140 76, 148 69" fill="none" stroke="#6E0916" stroke-width="4" stroke-linecap="round" opacity="0.52"/>'
    + '<ellipse cx="95" cy="94" rx="20" ry="10" transform="rotate(-42 95 94)" fill="url(#apple-highlight-gradient)"/>'
    + '<path d="M 83 91 C 73 112, 78 137, 88 151" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.27"/>'
    + '<ellipse cx="77" cy="109" rx="5" ry="3" transform="rotate(-42 77 109)" fill="#FFFFFF" opacity="0.30"/>'
    + '</svg>';

  /* ============================================================
   * 收集 + 别名 + 挂载
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
