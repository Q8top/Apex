/* Apex · Fruit Symbols V5 (自然水果版)
 * 5 个水果 SVG。挂载：window.ApexFruitSvg
 *
 * V5 相对 V4 的关键改动：
 *   1. BANANA：改用用户提供的新路径（去 U 型感，自然弯曲）
 *   2. GRAPE：9 颗大小完全不同（r=17~21 不等）+ 非对齐位置
 *   3. WATERMELON：厚切片轮廓（非纯椭圆）
 *   4. PLUM：圆润成熟李形 + 中央深沟（V5 单独塑形）
 *   5. APPLE：顶部凹陷加强 + 弱化高光
 *   6. 阴影：每水果独立（不再统一灰色椭圆）
 *      banana 0.08 / grape 0.10 / watermelon 0.06
 *      plum 0.10 / apple 0.11
 */
(function () {
  'use strict';

  var VIEWBOX = '0 0 256 256';
  var SVG_HEAD = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX
    + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"';

  /* ============================================================
   * BANANA (V5)
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="banana-v5-body" x1="18%" y1="10%" x2="85%" y2="90%">'
    + '<stop offset="0%" stop-color="#FFF7A0"/>'
    + '<stop offset="20%" stop-color="#FFE85C"/>'
    + '<stop offset="50%" stop-color="#F5C42C"/>'
    + '<stop offset="80%" stop-color="#D89E17"/>'
    + '<stop offset="100%" stop-color="#9E6A0A"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v5-light" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFFBC8" stop-opacity=".68"/>'
    + '<stop offset="60%" stop-color="#FFEC7A" stop-opacity=".18"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v5-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#9A6317"/>'
    + '<stop offset="55%" stop-color="#5E380D"/>'
    + '<stop offset="100%" stop-color="#2F1B06"/>'
    + '</linearGradient>'
    + '<filter id="banana-v5-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="8"/>'
    + '</filter>'
    + '<filter id="banana-v5-soft" x="-30%" y="-30%" width="160%" height="170%">'
    + '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#7C5400" flood-opacity=".14"/>'
    + '</filter>'
    + '</defs>'
    /* 独立软阴影：opacity 0.08 / blur 8 / scaleX 0.65 */
    + '<ellipse cx="128" cy="207" rx="55" ry="6" fill="#000" opacity=".08" filter="url(#banana-v5-shadow)"/>'
    + '<path d="M 73 42 C 68 48, 64 57, 62 69 C 59 87, 61 105, 68 121 C 76 140, 89 156, 105 166 C 120 176, 137 180, 151 174 C 167 167, 176 152, 181 135 C 184 126, 186 117, 191 114 C 196 111, 202 114, 204 120 C 207 128, 203 143, 197 156 C 190 176, 177 192, 161 200 C 142 210, 121 208, 103 199 C 82 189, 65 174, 54 154 C 43 134, 39 111, 42 91 C 45 70, 53 51, 64 43 C 68 40, 71 40, 73 42 Z" fill="url(#banana-v5-body)" filter="url(#banana-v5-soft)"/>'
    + '<path d="M 60 56 C 52 79, 52 104, 60 126 C 70 150, 86 168, 106 178 C 124 186, 145 185, 160 177" fill="none" stroke="url(#banana-v5-light)" stroke-width="9" stroke-linecap="round" opacity=".72"/>'
    + '<path d="M 74 54 C 66 78, 68 106, 78 128" fill="none" stroke="#DAA118" stroke-width="2.5" opacity=".35" stroke-linecap="round"/>'
    /* 顶部梗 */
    + '<path d="M 70 46 C 66 39, 67 30, 73 24 C 78 19, 85 21, 86 27 C 87 32, 82 37, 79 42 L 78 49 Z" fill="url(#banana-v5-stem)"/>'
    + '<ellipse cx="78" cy="25" rx="5.5" ry="3" transform="rotate(-22 78 25)" fill="#341D06"/>'
    /* 尾部尖 */
    + '<path d="M 193 112 C 199 109, 205 111, 207 116 C 209 121, 205 127, 199 129 L 192 124 Z" fill="#6E420A"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE (V5) —— 9 颗不同尺寸 / 非对齐
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="grape-v5-ball" cx="30%" cy="22%" r="78%">'
    + '<stop offset="0%" stop-color="#E7BFF5"/>'
    + '<stop offset="18%" stop-color="#B96EE1"/>'
    + '<stop offset="48%" stop-color="#6D2FA8"/>'
    + '<stop offset="80%" stop-color="#45197C"/>'
    + '<stop offset="100%" stop-color="#2A0E4D"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-v5-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A7D94A"/>'
    + '<stop offset="48%" stop-color="#5BAA2F"/>'
    + '<stop offset="100%" stop-color="#2B6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-v5-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#966026"/>'
    + '<stop offset="60%" stop-color="#5C3A12"/>'
    + '<stop offset="100%" stop-color="#2F1D08"/>'
    + '</linearGradient>'
    + '<filter id="grape-v5-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    /* 独立阴影：opacity 0.10 / blur 9 / scaleX 0.72 */
    + '<ellipse cx="128" cy="201" rx="52" ry="6" fill="#000" opacity=".10" filter="url(#grape-v5-shadow)"/>'
    /* 双叶（自然不对称） */
    + '<path d="M 126 64 C 108 46, 86 42, 63 50 C 71 68, 90 78, 111 79 C 100 88, 96 100, 99 110 C 116 101, 127 87, 131 71 Z" fill="url(#grape-v5-leaf)"/>'
    + '<path d="M 130 68 C 144 47, 165 40, 185 45 C 178 62, 160 73, 138 76 Z" fill="url(#grape-v5-leaf)"/>'
    + '<path d="M 68 53 C 88 61, 107 68, 127 70" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    + '<path d="M 136 69 C 152 60, 168 51, 182 47" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    /* 主梗 + 分枝 */
    + '<path d="M 127 69 C 123 55, 118 43, 124 31 C 128 25, 136 24, 141 27" fill="none" stroke="url(#grape-v5-stem)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M 127 70 C 118 82, 108 92, 100 104 M 130 71 C 141 82, 151 92, 158 105" fill="none" stroke="url(#grape-v5-stem)" stroke-width="4" stroke-linecap="round"/>'
    /* 9 颗非均匀葡萄 */
    + '<circle cx="128" cy="86"  r="17" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="107" cy="104" r="19" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="147" cy="106" r="20" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="89"  cy="126" r="18" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="124" cy="127" r="21" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="163" cy="130" r="18" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="101" cy="151" r="19" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="137" cy="153" r="20" fill="url(#grape-v5-ball)"/>'
    + '<circle cx="119" cy="177" r="17" fill="url(#grape-v5-ball)"/>'
    /* 非对齐高光 */
    + '<g fill="#FFFFFF" opacity=".48">'
    + '<ellipse cx="122" cy="80" rx="4.5" ry="2.8" transform="rotate(-35 122 80)"/>'
    + '<ellipse cx="100" cy="97"  rx="5"   ry="3"   transform="rotate(-42 100 97)"/>'
    + '<ellipse cx="141" cy="98"  rx="5"   ry="3"   transform="rotate(-28 141 98)"/>'
    + '<ellipse cx="82"  cy="119" rx="4.5" ry="2.6" transform="rotate(-38 82 119)"/>'
    + '<ellipse cx="117" cy="119" rx="5"   ry="3"   transform="rotate(-32 117 119)"/>'
    + '<ellipse cx="157" cy="123" rx="4.5" ry="2.6" transform="rotate(-40 157 123)"/>'
    + '<ellipse cx="95"  cy="145" rx="4.5" ry="2.8" transform="rotate(-36 95 145)"/>'
    + '<ellipse cx="130" cy="146" rx="4.5" ry="2.8" transform="rotate(-30 130 146)"/>'
    + '<ellipse cx="113" cy="170" rx="4"   ry="2.4" transform="rotate(-35 113 170)"/>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * WATERMELON (V5) —— 厚切片
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="melon-v5-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#2F8A43"/>'
    + '<stop offset="48%" stop-color="#156A34"/>'
    + '<stop offset="100%" stop-color="#0A4525"/>'
    + '</linearGradient>'
    + '<linearGradient id="melon-v5-light-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#DBF39B"/>'
    + '<stop offset="50%" stop-color="#95D05A"/>'
    + '<stop offset="100%" stop-color="#5A9B3D"/>'
    + '</linearGradient>'
    + '<radialGradient id="melon-v5-flesh" cx="42%" cy="30%" r="80%">'
    + '<stop offset="0%" stop-color="#FF9093"/>'
    + '<stop offset="38%" stop-color="#FF6570"/>'
    + '<stop offset="72%" stop-color="#ED4253"/>'
    + '<stop offset="100%" stop-color="#CF2438"/>'
    + '</radialGradient>'
    + '<filter id="melon-v5-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="10"/>'
    + '</filter>'
    + '</defs>'
    /* 独立阴影：opacity 0.06 / blur 10 / scaleX 0.82 */
    + '<ellipse cx="128" cy="203" rx="68" ry="6" fill="#000" opacity=".06" filter="url(#melon-v5-shadow)"/>'
    /* 厚切片外皮（自然不规则） */
    + '<path d="M 48 137 C 54 111, 72 92, 96 82 C 118 73, 142 73, 163 82 C 187 92, 202 111, 208 137 C 201 160, 187 179, 166 190 C 145 202, 110 204, 88 193 C 67 182, 53 162, 48 137 Z" fill="url(#melon-v5-rind)"/>'
    /* 浅绿皮 */
    + '<path d="M 55 137 C 61 114, 78 97, 100 88 C 120 80, 142 80, 161 88 C 182 97, 196 114, 201 137 C 195 158, 182 175, 162 185 C 142 196, 111 198, 90 187 C 71 177, 59 159, 55 137 Z" fill="url(#melon-v5-light-rind)"/>'
    /* 白瓤 */
    + '<path d="M 62 137 C 68 118, 84 103, 105 94 C 123 87, 141 87, 158 94 C 177 103, 189 118, 194 137 C 189 155, 176 170, 159 179 C 141 189, 113 191, 94 181 C 78 172, 66 156, 62 137 Z" fill="#FAFAE0"/>'
    /* 红肉（略偏左） */
    + '<path d="M 69 137 C 75 121, 89 108, 108 100 C 124 94, 140 94, 155 100 C 172 108, 183 121, 187 137 C 183 152, 171 165, 156 173 C 140 182, 115 184, 98 175 C 84 167, 73 153, 69 137 Z" fill="url(#melon-v5-flesh)"/>'
    /* 7 颗黑籽 */
    + '<g fill="#352020">'
    + '<ellipse cx="97"  cy="127" rx="3.5" ry="7.5" transform="rotate(-30 97 127)"/>'
    + '<ellipse cx="115" cy="112" rx="3.5" ry="7.5" transform="rotate(-14 115 112)"/>'
    + '<ellipse cx="133" cy="109" rx="3.5" ry="7.5" transform="rotate(4 133 109)"/>'
    + '<ellipse cx="151" cy="113" rx="3.5" ry="7.5" transform="rotate(18 151 113)"/>'
    + '<ellipse cx="168" cy="128" rx="3.5" ry="7.5" transform="rotate(28 168 128)"/>'
    + '<ellipse cx="126" cy="140" rx="3.5" ry="7.5"/>'
    + '<ellipse cx="108" cy="142" rx="3.5" ry="7.5" transform="rotate(-12 108 142)"/>'
    + '</g>'
    + '<path d="M 82 130 C 92 113, 110 103, 128 102" fill="none" stroke="#FFB4B4" stroke-width="4.5" stroke-linecap="round" opacity=".28"/>'
    + '</svg>';

  /* ============================================================
   * PLUM (V5) —— 圆润成熟李形 + 中央深沟（V5 单独塑形）
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="plum-v5-body" cx="28%" cy="20%" r="85%">'
    + '<stop offset="0%" stop-color="#DE8FA8"/>'
    + '<stop offset="16%" stop-color="#BB5179"/>'
    + '<stop offset="40%" stop-color="#892C5A"/>'
    + '<stop offset="70%" stop-color="#5F1B49"/>'
    + '<stop offset="92%" stop-color="#3D1136"/>'
    + '<stop offset="100%" stop-color="#2A0B26"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-v5-side" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#E69CB0"/>'
    + '<stop offset="38%" stop-color="#B44C72"/>'
    + '<stop offset="100%" stop-color="#5A1B46"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v5-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A6D84D"/>'
    + '<stop offset="45%" stop-color="#5DA92F"/>'
    + '<stop offset="100%" stop-color="#2C6E27"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v5-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#956026"/>'
    + '<stop offset="60%" stop-color="#5A3712"/>'
    + '<stop offset="100%" stop-color="#2E1B08"/>'
    + '</linearGradient>'
    + '<filter id="plum-v5-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '<filter id="plum-v5-soft" x="-30%" y="-30%" width="160%" height="170%">'
    + '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#320F2D" flood-opacity=".18"/>'
    + '</filter>'
    + '</defs>'
    /* 独立阴影：opacity 0.10 / blur 9 / scaleX 0.68 */
    + '<ellipse cx="128" cy="206" rx="48" ry="6" fill="#000" opacity=".10" filter="url(#plum-v5-shadow)"/>'
    /* 叶 + 梗 */
    + '<path d="M 128 63 C 143 44, 163 37, 184 43 C 176 60, 158 72, 136 74 C 132 71, 130 67, 128 63 Z" fill="url(#plum-v5-leaf)"/>'
    + '<path d="M 135 68 C 152 59, 167 50, 180 45" fill="none" stroke="#3B7E29" stroke-width="2" stroke-linecap="round" opacity=".62"/>'
    + '<path d="M 127 64 C 125 51, 128 40, 135 31" fill="none" stroke="url(#plum-v5-stem)" stroke-width="8" stroke-linecap="round"/>'
    /* 成熟李子主体（略扁 + 顶部微凹） */
    + '<path d="M 128 61 C 110 57, 92 62, 79 76 C 66 90, 62 111, 65 132 C 68 154, 79 176, 96 191 C 108 202, 120 207, 128 208 C 137 207, 149 202, 161 191 C 178 176, 188 154, 191 132 C 194 110, 190 90, 177 76 C 164 62, 146 57, 128 61 Z" fill="url(#plum-v5-body)" filter="url(#plum-v5-soft)"/>'
    /* 左侧自然果肉反光 */
    + '<path d="M 101 70 C 81 82, 74 104, 76 128 C 78 151, 88 173, 106 188" fill="none" stroke="url(#plum-v5-side)" stroke-width="16" stroke-linecap="round" opacity=".68"/>'
    /* 中央深沟（分段绘制：暗沟 + 边缘柔光） */
    + '<path d="M 128 62 C 123 82, 121 103, 122 124 C 123 148, 126 174, 128 199" fill="none" stroke="#4B183D" stroke-width="6" stroke-linecap="round" opacity=".42"/>'
    + '<path d="M 124 66 C 120 90, 120 112, 122 137" fill="none" stroke="#D98DA6" stroke-width="2" stroke-linecap="round" opacity=".38"/>'
    /* 果粉 */
    + '<ellipse cx="115" cy="104" rx="52" ry="64" fill="#E7B2C7" opacity=".06"/>'
    /* 非常克制的高光 */
    + '<ellipse cx="99" cy="90" rx="15" ry="7.5" transform="rotate(-42 99 90)" fill="#FFFFFF" opacity=".20"/>'
    + '<ellipse cx="92" cy="106" rx="4.5" ry="2.5" transform="rotate(-42 92 106)" fill="#FFFFFF" opacity=".22"/>'
    + '</svg>';

  /* ============================================================
   * APPLE (V5) —— 保留 V4 方向，微调：顶部凹陷更深 + 高光弱化
   * ============================================================ */
  var APPLE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="apple-v5-body" cx="30%" cy="21%" r="85%">'
    + '<stop offset="0%" stop-color="#FF9B9F"/>'
    + '<stop offset="18%" stop-color="#FF6369"/>'
    + '<stop offset="46%" stop-color="#EE2F3B"/>'
    + '<stop offset="74%" stop-color="#CF1728"/>'
    + '<stop offset="94%" stop-color="#9C0D1B"/>'
    + '<stop offset="100%" stop-color="#710915"/>'
    + '</radialGradient>'
    + '<linearGradient id="apple-v5-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DA4C"/>'
    + '<stop offset="48%" stop-color="#61B32F"/>'
    + '<stop offset="100%" stop-color="#2F7728"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-v5-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#94602A"/>'
    + '<stop offset="55%" stop-color="#5E3C17"/>'
    + '<stop offset="100%" stop-color="#321F0A"/>'
    + '</linearGradient>'
    + '<filter id="apple-v5-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '<filter id="apple-v5-soft" x="-30%" y="-30%" width="160%" height="170%">'
    + '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#5B0712" flood-opacity=".18"/>'
    + '</filter>'
    + '</defs>'
    /* 独立阴影：opacity 0.11 / blur 9 / scaleX 0.70 */
    + '<ellipse cx="128" cy="207" rx="50" ry="6" fill="#000" opacity=".11" filter="url(#apple-v5-shadow)"/>'
    /* 叶 + 梗 */
    + '<path d="M 129 59 C 143 42, 162 35, 182 40 C 176 56, 159 68, 136 71 C 133 67, 131 63, 129 59 Z" fill="url(#apple-v5-leaf)"/>'
    + '<path d="M 135 65 C 150 56, 165 47, 178 42" fill="none" stroke="#3C8228" stroke-width="2" stroke-linecap="round" opacity=".62"/>'
    + '<path d="M 127 68 C 124 54, 126 42, 132 32" fill="none" stroke="url(#apple-v5-stem)" stroke-width="8" stroke-linecap="round"/>'
    /* 苹果主体（左侧略鼓，非完全对称） */
    + '<path d="M 128 70 C 115 58, 100 55, 87 60 C 66 68, 55 88, 56 112 C 57 141, 70 171, 88 192 C 100 205, 115 212, 128 212 C 140 211, 155 204, 167 191 C 185 170, 197 140, 198 111 C 199 87, 188 68, 168 61 C 155 56, 140 59, 128 70 Z" fill="url(#apple-v5-body)" filter="url(#apple-v5-soft)"/>'
    /* 左侧红橙自然反射（更柔） */
    + '<path d="M 92 72 C 72 84, 67 108, 71 132 C 75 156, 88 179, 106 193" fill="none" stroke="#FF6B65" stroke-width="15" stroke-linecap="round" opacity=".26"/>'
    /* 顶部凹陷（加深） */
    + '<path d="M 102 70 C 111 79, 120 83, 128 83 C 137 83, 146 78, 155 69" fill="none" stroke="#8C101B" stroke-width="8" stroke-linecap="round" opacity=".55"/>'
    + '<path d="M 108 70 C 116 77, 122 80, 128 80 C 135 80, 141 76, 148 70" fill="none" stroke="#5F0713" stroke-width="3" stroke-linecap="round" opacity=".55"/>'
    /* 高光弱化（.36 → .25） */
    + '<ellipse cx="91" cy="94" rx="17" ry="9.5" transform="rotate(-42 91 94)" fill="#FFFFFF" opacity=".25"/>'
    + '<path d="M 80 96 C 73 113, 77 133, 85 145" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" opacity=".15"/>'
    + '<ellipse cx="77" cy="110" rx="4.5" ry="2.6" transform="rotate(-40 77 110)" fill="#FFFFFF" opacity=".22"/>'
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
