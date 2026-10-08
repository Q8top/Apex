/* Apex · Fruit Symbols V7 (微调版)
 * 5 个水果 SVG。挂载：window.ApexFruitSvg
 *
 * V7 定位：不是大改版，是 V6 微调
 *   - BANANA：重构轮廓（去 U 型记忆，弯曲中心不居中，两端钝圆）
 *   - GRAPE：11 颗尺寸阶梯明显 + 层叠感 + 梗真插入
 *   - WATERMELON：外轮廓轻微不规则（保留 V6 其余）
 *   - PLUM：横向 +10% / 纵向 -6%（用 transform scale）
 *   - APPLE：保持 V6 不变
 */
(function () {
  'use strict';

  var VIEWBOX = '0 0 256 256';
  var SVG_HEAD = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX
    + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"';

  /* ============================================================
   * BANANA (V11) —— 按用户 V5 规格
   *   BANANA_PATH：上端细 / 中段厚 / 尾端收尖
   *   颜色：梗 #70410E / 深 #D99A16 / 中 #F3C52E / 亮 #FFE66B
   *   阴影：opacity 0.06（几乎不可见）
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="banana-v11-body" x1="18%" y1="12%" x2="82%" y2="88%">'
    + '<stop offset="0%" stop-color="#FFE66B"/>'
    + '<stop offset="34%" stop-color="#F3C52E"/>'
    + '<stop offset="68%" stop-color="#D99A16"/>'
    + '<stop offset="100%" stop-color="#70410E"/>'
    + '</linearGradient>'
    + '<filter id="banana-v11-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="8"/>'
    + '</filter>'
    + '</defs>'
    + '<path d="M 73 42 C 68 48, 64 57, 62 69 C 59 87, 61 105, 68 121 C 76 140, 89 156, 105 166 C 120 176, 137 180, 151 174 C 167 167, 176 152, 181 135 C 184 126, 186 117, 191 114 C 196 111, 202 114, 204 120 C 207 128, 203 143, 197 156 C 190 176, 177 192, 161 200 C 142 210, 121 208, 103 199 C 82 189, 65 174, 54 154 C 43 134, 39 111, 42 91 C 45 70, 53 51, 64 43 C 68 40, 71 40, 73 42 Z" fill="url(#banana-v11-body)"/>'
    /* 尾部蒂头 */
    + '<path d="M 71 41 C 73 36, 78 34, 82 36 C 80 39, 75 42, 73 42 Z" fill="#5B4A20" opacity="0.8"/>'
    /* 克制的高光（外弧） */
    + '<path d="M 65 80 C 63 100, 68 130, 85 150 C 100 165, 120 170, 135 166" fill="none" stroke="#FFF7A1" stroke-width="4" stroke-linecap="round" opacity="0.3"/>'
    /* 极淡阴影 */
    + '<ellipse cx="125" cy="210" rx="60" ry="6" fill="#000" opacity=".06" filter="url(#banana-v11-shadow)"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE (V11) —— 按用户 V5 规格
   *   9 颗大小不一（r=17~21）+ 每颗独立旋转角
   *   整串落影：opacity 0.10 / blur 12
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="grape-v11-ball" cx="30%" cy="22%" r="80%">'
    + '<stop offset="0%" stop-color="#E9C2F8"/>'
    + '<stop offset="16%" stop-color="#BC73E4"/>'
    + '<stop offset="46%" stop-color="#6D2FA8"/>'
    + '<stop offset="78%" stop-color="#41187A"/>'
    + '<stop offset="100%" stop-color="#26104A"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-v11-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A7D94A"/>'
    + '<stop offset="48%" stop-color="#5BAA2F"/>'
    + '<stop offset="100%" stop-color="#2B6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-v11-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#966026"/>'
    + '<stop offset="60%" stop-color="#5C3A12"/>'
    + '<stop offset="100%" stop-color="#2F1D08"/>'
    + '</linearGradient>'
    + '<filter id="grape-v11-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="12"/>'
    + '</filter>'
    + '</defs>'
    + '<path d="M 126 62 C 108 45, 86 41, 63 49 C 71 67, 90 77, 111 78 C 100 87, 96 99, 99 109 C 116 100, 127 86, 131 70 Z" fill="url(#grape-v11-leaf)"/>'
    + '<path d="M 130 66 C 144 45, 165 38, 185 43 C 178 60, 160 71, 138 74 Z" fill="url(#grape-v11-leaf)"/>'
    + '<path d="M 68 52 C 88 60, 107 67, 127 68" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    + '<path d="M 136 67 C 152 58, 168 49, 182 45" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    + '<path d="M 127 68 C 124 53, 120 41, 126 30 C 130 24, 138 23, 143 26" fill="none" stroke="url(#grape-v11-stem)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M 127 68 C 118 80, 108 90, 100 102 M 130 69 C 140 80, 150 90, 157 102 M 127 68 C 123 78, 121 88, 122 98" fill="none" stroke="url(#grape-v11-stem)" stroke-width="3.5" stroke-linecap="round"/>'
    + '<circle cx="128" cy="86" r="17" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="107" cy="104" r="19" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="147" cy="106" r="20" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="89" cy="126" r="18" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="124" cy="127" r="21" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="163" cy="130" r="18" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="101" cy="151" r="19" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="137" cy="153" r="20" fill="url(#grape-v11-ball)"/>'
    + '<circle cx="119" cy="177" r="17" fill="url(#grape-v11-ball)"/>'
    + '<g>'
    + '<ellipse cx="123.2" cy="80.9" rx="4.1" ry="2.4" transform="rotate(15 123.2 80.9)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="101.7" cy="98.3" rx="4.6" ry="2.7" transform="rotate(-20 101.7 98.3)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="141.4" cy="100.0" rx="4.8" ry="2.8" transform="rotate(10 141.4 100.0)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="84.0" cy="120.6" rx="4.3" ry="2.5" transform="rotate(30 84.0 120.6)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="118.1" cy="120.7" rx="5.0" ry="2.9" transform="rotate(-5 118.1 120.7)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="158.0" cy="124.6" rx="4.3" ry="2.5" transform="rotate(-15 158.0 124.6)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="95.7" cy="145.3" rx="4.6" ry="2.7" transform="rotate(45 95.7 145.3)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="131.4" cy="147.0" rx="4.8" ry="2.8" transform="rotate(-35 131.4 147.0)" fill="#FFFFFF" opacity=".52"/>'
    + '<ellipse cx="114.2" cy="171.9" rx="4.1" ry="2.4" transform="rotate(0 114.2 171.9)" fill="#FFFFFF" opacity=".52"/>'
    + '</g>'
    + '<ellipse cx="128" cy="200" rx="58" ry="8" fill="#000" opacity=".10" filter="url(#grape-v11-shadow)"/>'
    + '</svg>';

  /* ============================================================
   * WATERMELON (V12) —— 按用户 V5 规格
   *   5 层结构：深绿外皮 #1B5E20 → 绿皮 #388E3C → 白瓤 #F1F8E9 → 红肉
   *   4 颗自然散落籽 + 轻微水润高光 + 极浅落影
   *   阴影：opacity 0.06 / blur 10（切片几乎不落影）
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="watermelon-v12-red" cx="42%" cy="30%" r="80%">'
    + '<stop offset="0%" stop-color="#FF8D91"/>'
    + '<stop offset="35%" stop-color="#FF6570"/>'
    + '<stop offset="72%" stop-color="#F04452"/>'
    + '<stop offset="100%" stop-color="#D8243B"/>'
    + '</radialGradient>'
    + '<filter id="watermelon-v12-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="10"/>'
    + '</filter>'
    + '</defs>'
    /* 1. 深绿外皮 */
    + '<path d="M 48 137 C 54 111, 72 92, 96 82 C 118 73, 142 73, 163 82 C 187 92, 202 111, 208 137 C 201 160, 187 179, 166 190 C 145 202, 110 204, 88 193 C 67 182, 53 162, 48 137 Z" fill="#1B5E20"/>'
    /* 2. 绿皮 */
    + '<path d="M 52 137 C 57 114, 74 97, 96 88 C 116 79, 138 79, 158 88 C 180 97, 194 114, 200 137 C 194 158, 180 175, 160 185 C 140 195, 110 197, 90 188 C 70 178, 56 158, 52 137 Z" fill="#388E3C"/>'
    /* 3. 白瓤 */
    + '<path d="M 58 137 C 62 117, 78 102, 98 94 C 116 87, 135 87, 152 94 C 172 102, 185 117, 190 137 C 185 155, 172 170, 154 178 C 136 186, 110 188, 92 180 C 74 172, 62 155, 58 137 Z" fill="#F1F8E9"/>'
    /* 4. 红肉 */
    + '<path d="M 65 137 C 68 121, 83 109, 100 102 C 115 96, 132 96, 147 102 C 164 109, 175 121, 180 137 C 175 151, 164 163, 149 170 C 134 176, 111 178, 96 170 C 81 163, 70 149, 65 137 Z" fill="url(#watermelon-v12-red)"/>'
    /* 5. 4 颗自然散落籽 */
    + '<ellipse cx="120" cy="115" rx="2" ry="4" fill="#1A1A1A" transform="rotate(30 120 115)" opacity=".8"/>'
    + '<ellipse cx="145" cy="125" rx="2.5" ry="4.5" fill="#1A1A1A" transform="rotate(-15 145 125)" opacity=".8"/>'
    + '<ellipse cx="100" cy="135" rx="2" ry="3.5" fill="#1A1A1A" transform="rotate(45 100 135)" opacity=".8"/>'
    + '<ellipse cx="130" cy="155" rx="2" ry="4" fill="#1A1A1A" transform="rotate(-30 130 155)" opacity=".8"/>'
    /* 6. 水润高光（克制） */
    + '<path d="M 85 115 C 95 105, 110 102, 120 102" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".15"/>'
    /* 7. 极浅落影 */
    + '<ellipse cx="128" cy="205" rx="65" ry="8" fill="#000" opacity=".06" filter="url(#watermelon-v12-shadow)"/>'
    + '</svg>';

  /* ============================================================
   * PLUM (V7) —— V6 基础上横向 +8% / 纵向 -6%
   *   用 <g transform> 包裹整个李子主体，等比压扁一点
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="plum-v7-body" cx="28%" cy="20%" r="88%">'
    + '<stop offset="0%" stop-color="#E79FB8"/>'
    + '<stop offset="14%" stop-color="#C45982"/>'
    + '<stop offset="40%" stop-color="#903161"/>'
    + '<stop offset="70%" stop-color="#5F1C4A"/>'
    + '<stop offset="92%" stop-color="#3B1135"/>'
    + '<stop offset="100%" stop-color="#290928"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-v7-side" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#E69CB0"/>'
    + '<stop offset="38%" stop-color="#B44C72"/>'
    + '<stop offset="100%" stop-color="#51173F"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v7-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A6D84D"/>'
    + '<stop offset="45%" stop-color="#5DA92F"/>'
    + '<stop offset="100%" stop-color="#2C6E27"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v7-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8F5C24"/>'
    + '<stop offset="60%" stop-color="#523010"/>'
    + '<stop offset="100%" stop-color="#2A1706"/>'
    + '</linearGradient>'
    + '<filter id="plum-v7-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.09 */
    + '<ellipse cx="128" cy="208" rx="54" ry="5" fill="#000" opacity=".09" filter="url(#plum-v7-shadow)"/>'
    /* 叶 + 梗 */
    + '<path d="M 128 64 C 143 45, 163 38, 184 44 C 176 61, 158 73, 136 75 C 132 72, 130 68, 128 64 Z" fill="url(#plum-v7-leaf)"/>'
    + '<path d="M 135 69 C 152 60, 167 51, 180 46" fill="none" stroke="#3B7E29" stroke-width="2" stroke-linecap="round" opacity=".62"/>'
    + '<path d="M 128 65 C 126 51, 129 40, 136 31" fill="none" stroke="url(#plum-v7-stem)" stroke-width="7.5" stroke-linecap="round"/>'
    /* 李子主体（V7：加 transform 压扁一点） */
    + '<g transform="translate(128,135) scale(1.13,0.91) translate(-128,-135)">'
    + '<path d="M 128 62 C 106 58, 85 65, 73 82 C 61 100, 57 124, 61 148 C 66 172, 79 191, 100 201 C 111 206, 121 208, 128 208 C 136 208, 146 206, 157 201 C 177 191, 191 172, 196 148 C 200 124, 196 100, 184 82 C 172 65, 151 58, 128 62 Z" fill="url(#plum-v7-body)"/>'
    /* 顶部微凹阴影 */
    + '<path d="M 116 63 Q 128 72 140 63" fill="none" stroke="#3F0E30" stroke-width="4" stroke-linecap="round" opacity=".42"/>'
    /* 左侧反光 */
    + '<path d="M 99 71 C 79 83, 71 105, 73 128 C 75 152, 85 174, 103 188" fill="none" stroke="url(#plum-v7-side)" stroke-width="15" stroke-linecap="round" opacity=".66"/>'
    /* 中央深沟 */
    + '<path d="M 128 63 C 124 82, 122 102, 123 122 C 124 146, 127 172, 128 197" fill="none" stroke="#451539" stroke-width="6" stroke-linecap="round" opacity=".40"/>'
    + '<path d="M 124 67 C 120 90, 120 112, 122 136" fill="none" stroke="#D98DA6" stroke-width="2" stroke-linecap="round" opacity=".36"/>'
    /* 果粉 */
    + '<ellipse cx="115" cy="106" rx="54" ry="60" fill="#E7B2C7" opacity=".055"/>'
    /* 高光 */
    + '<ellipse cx="98" cy="90" rx="15" ry="7" transform="rotate(-42 98 90)" fill="#FFFFFF" opacity=".20"/>'
    + '<ellipse cx="91" cy="106" rx="4.2" ry="2.4" transform="rotate(-42 91 106)" fill="#FFE2F0" opacity=".24"/>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * APPLE (V7) —— 保持 V6 不变
   * ============================================================ */
  var APPLE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="apple-v7-body" cx="30%" cy="21%" r="86%">'
    + '<stop offset="0%" stop-color="#FF9BA0"/>'
    + '<stop offset="18%" stop-color="#FF5F68"/>'
    + '<stop offset="46%" stop-color="#EA2C38"/>'
    + '<stop offset="74%" stop-color="#C61425"/>'
    + '<stop offset="94%" stop-color="#930B19"/>'
    + '<stop offset="100%" stop-color="#650712"/>'
    + '</radialGradient>'
    + '<linearGradient id="apple-v7-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DA4C"/>'
    + '<stop offset="48%" stop-color="#61B32F"/>'
    + '<stop offset="100%" stop-color="#2F7728"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-v7-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8E5B27"/>'
    + '<stop offset="55%" stop-color="#563616"/>'
    + '<stop offset="100%" stop-color="#2C1B09"/>'
    + '</linearGradient>'
    + '<filter id="apple-v7-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="128" cy="208" rx="50" ry="5" fill="#000" opacity=".10" filter="url(#apple-v7-shadow)"/>'
    + '<path d="M 129 60 C 143 42, 162 34, 182 40 C 176 56, 159 68, 136 71 C 133 67, 131 63, 129 60 Z" fill="url(#apple-v7-leaf)"/>'
    + '<path d="M 135 66 C 150 57, 165 48, 178 43" fill="none" stroke="#3C8228" stroke-width="2" stroke-linecap="round" opacity=".60"/>'
    + '<path d="M 127 69 C 124 54, 126 42, 132 32" fill="none" stroke="url(#apple-v7-stem)" stroke-width="8" stroke-linecap="round"/>'
    + '<path d="M 128 70 C 114 58, 98 55, 86 61 C 64 69, 52 90, 54 114 C 56 143, 70 172, 88 192 C 100 205, 115 212, 128 212 C 140 211, 155 204, 167 191 C 185 170, 197 140, 198 111 C 199 87, 188 68, 168 61 C 155 56, 140 59, 128 70 Z" fill="url(#apple-v7-body)"/>'
    + '<path d="M 90 73 C 71 85, 66 108, 70 132 C 74 156, 87 179, 105 193" fill="none" stroke="#FF6B65" stroke-width="14" stroke-linecap="round" opacity=".22"/>'
    + '<path d="M 102 70 C 111 79, 120 83, 128 83 C 137 83, 146 78, 155 69" fill="none" stroke="#8C101B" stroke-width="7.5" stroke-linecap="round" opacity=".52"/>'
    + '<path d="M 108 70 C 116 77, 122 80, 128 80 C 135 80, 141 76, 148 70" fill="none" stroke="#5F0713" stroke-width="3" stroke-linecap="round" opacity=".52"/>'
    + '<ellipse cx="90" cy="94" rx="16" ry="9" transform="rotate(-42 90 94)" fill="#FFFFFF" opacity=".20"/>'
    + '<path d="M 79 96 C 72 113, 76 133, 84 145" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".12"/>'
    + '<ellipse cx="76" cy="110" rx="4" ry="2.4" transform="rotate(-40 76 110)" fill="#FFFFFF" opacity=".20"/>'
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
