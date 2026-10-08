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
   * BANANA (V8) —— 上半段陡弧 + 中间厚 + 尾端钝圆
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="banana-v8-body" x1="12%" y1="10%" x2="88%" y2="92%">'
    + '<stop offset="0%" stop-color="#D4DE55"/>'
    + '<stop offset="10%" stop-color="#F3E54E"/>'
    + '<stop offset="34%" stop-color="#EFC124"/>'
    + '<stop offset="62%" stop-color="#D39711"/>'
    + '<stop offset="86%" stop-color="#9C6509"/>'
    + '<stop offset="100%" stop-color="#5C3A05"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v8-core" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFFCC4" stop-opacity=".55"/>'
    + '<stop offset="62%" stop-color="#FFE27A" stop-opacity=".16"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
    + '</linearGradient>'
    + '<linearGradient id="banana-v8-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8B9A3B"/>'
    + '<stop offset="40%" stop-color="#564713"/>'
    + '<stop offset="100%" stop-color="#241705"/>'
    + '</linearGradient>'
    + '<filter id="banana-v8-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    + '<ellipse cx="130" cy="212" rx="55" ry="5" fill="#000" opacity=".06" filter="url(#banana-v8-shadow)"/>'
    /* 主体：上半段陡弧（梗根→中段快速下弯）+ 腰部更厚 + 尾端钝圆不完美 */
    + '<path d="M 74 46 C 62 56, 51 76, 48 100 C 45 132, 64 162, 96 182 C 128 202, 166 204, 192 190 C 210 180, 220 162, 218 148 C 217 136, 208 132, 204 140 C 200 156, 190 170, 172 180 C 148 194, 118 194, 96 182 C 74 170, 60 148, 58 122 C 56 96, 64 72, 76 58 Z" fill="url(#banana-v8-body)"/>'
    /* 内侧亮线 */
    + '<path d="M 66 60 C 56 80, 52 106, 56 130 C 63 160, 88 184, 122 194 C 152 202, 182 196, 198 182" fill="none" stroke="url(#banana-v8-core)" stroke-width="8.5" stroke-linecap="round"/>'
    /* 皮纹（不平行） */
    + '<path d="M 72 68 C 64 88, 62 112, 68 136" fill="none" stroke="#C09011" stroke-width="1.8" opacity=".26" stroke-linecap="round"/>'
    + '<path d="M 190 158 C 184 174, 172 186, 154 192" fill="none" stroke="#94640A" stroke-width="1.6" opacity=".20" stroke-linecap="round"/>'
    /* 短梗（比 V7 更短） */
    + '<path d="M 74 46 C 71 38, 73 31, 78 27 C 83 24, 88 27, 88 32 C 88 36, 84 40, 81 44 L 80 49 Z" fill="url(#banana-v8-stem)"/>'
    + '<circle cx="80" cy="30" r="2.8" fill="#8DA030" opacity=".68"/>'
    + '<ellipse cx="80" cy="28" rx="4.5" ry="2.2" transform="rotate(-22 80 28)" fill="#251905"/>'
    /* 尾端：不完美收尖，钝圆带小挫 */
    + '<path d="M 218 148 C 223 143, 229 145, 229 150 C 229 155, 224 158, 219 157 L 216 152 Z" fill="#5A3605"/>'
    + '<circle cx="226" cy="150" r="1.8" fill="#2A1703"/>'
    + '<circle cx="223" cy="147" r="0.9" fill="#7A4E10" opacity=".72"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE (V7) —— 11 颗尺寸阶梯 + 层叠感 + 梗真插入
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="grape-v7-ball" cx="28%" cy="20%" r="80%">'
    + '<stop offset="0%" stop-color="#EBC6FA"/>'
    + '<stop offset="16%" stop-color="#BE76E6"/>'
    + '<stop offset="46%" stop-color="#6C2DA6"/>'
    + '<stop offset="78%" stop-color="#3F1776"/>'
    + '<stop offset="100%" stop-color="#230D46"/>'
    + '</radialGradient>'
    + '<radialGradient id="grape-v7-shade" cx="70%" cy="75%" r="55%">'
    + '<stop offset="0%" stop-color="#1B0738" stop-opacity=".42"/>'
    + '<stop offset="100%" stop-color="#1B0738" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-v7-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A7D94A"/>'
    + '<stop offset="48%" stop-color="#5BAA2F"/>'
    + '<stop offset="100%" stop-color="#2B6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-v7-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8F5C22"/>'
    + '<stop offset="60%" stop-color="#543410"/>'
    + '<stop offset="100%" stop-color="#281707"/>'
    + '</linearGradient>'
    + '<filter id="grape-v7-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="8"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 */
    + '<ellipse cx="128" cy="204" rx="50" ry="5" fill="#000" opacity=".08" filter="url(#grape-v7-shadow)"/>'
    /* 双叶 */
    + '<path d="M 126 62 C 108 44, 85 40, 62 48 C 70 66, 89 77, 111 78 C 100 87, 96 99, 99 109 C 116 100, 127 86, 131 70 Z" fill="url(#grape-v7-leaf)"/>'
    + '<path d="M 130 66 C 144 45, 165 38, 186 43 C 178 60, 160 72, 138 74 Z" fill="url(#grape-v7-leaf)"/>'
    + '<path d="M 68 51 C 88 59, 107 66, 127 68" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".52"/>'
    + '<path d="M 136 67 C 152 58, 168 49, 183 45" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".52"/>'
    /* 主梗（真正插入串内） */
    + '<path d="M 127 68 C 125 52, 121 40, 127 29 C 131 23, 138 22, 143 26" fill="none" stroke="url(#grape-v7-stem)" stroke-width="7" stroke-linecap="round"/>'
    /* 分枝（切入葡萄之间） */
    + '<path d="M 127 68 C 116 78, 106 88, 98 100 M 130 69 C 142 79, 152 89, 160 102 M 127 68 C 124 78, 122 88, 122 98 M 127 68 C 127 78, 128 88, 129 100" fill="none" stroke="url(#grape-v7-stem)" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>'
    /* ============ 11 颗葡萄（尺寸阶梯 + 位置微偏移） ============ */
    /* 顶部 2 颗小 (r=13, 14) */
    + '<g transform="translate(128,128) scale(1.10,0.95) translate(-128,-128)">'
    + '<circle cx="119" cy="82" r="13"   fill="url(#grape-v7-ball)"/>'
    + '<circle cx="137" cy="83" r="14"   fill="url(#grape-v7-ball)"/>'
    /* 中上 2 颗 (r=17, 18) */
    + '<circle cx="102" cy="104" r="17"  fill="url(#grape-v7-ball)"/>'
    + '<circle cx="148" cy="103" r="17.5" fill="url(#grape-v7-ball)"/>'
    /* 中部 3 颗最大 (r=19, 20, 19) */
    + '<circle cx="88"  cy="126" r="19"  fill="url(#grape-v7-ball)"/>'
    + '<circle cx="118" cy="128" r="20"  fill="url(#grape-v7-ball)"/>'
    + '<circle cx="150" cy="126" r="19"  fill="url(#grape-v7-ball)"/>'
    /* 中下 2 颗 (r=18, 17) */
    + '<circle cx="104" cy="152" r="18"  fill="url(#grape-v7-ball)"/>'
    + '<circle cx="134" cy="154" r="17"  fill="url(#grape-v7-ball)"/>'
    /* 底部 2 颗最小 (r=14, 13) */
    + '<circle cx="119" cy="174" r="14"  fill="url(#grape-v7-ball)"/>'
    + '<circle cx="141" cy="175" r="13"  fill="url(#grape-v7-ball)"/>'
    /* 每颗底部阴影（增加层叠感） */
    + '<g fill="url(#grape-v7-shade)">'
    + '<circle cx="119" cy="82" r="13"/>'
    + '<circle cx="137" cy="83" r="14"/>'
    + '<circle cx="102" cy="104" r="17"/>'
    + '<circle cx="148" cy="103" r="17.5"/>'
    + '<circle cx="88"  cy="126" r="19"/>'
    + '<circle cx="118" cy="128" r="20"/>'
    + '<circle cx="150" cy="126" r="19"/>'
    + '<circle cx="104" cy="152" r="18"/>'
    + '<circle cx="134" cy="154" r="17"/>'
    + '<circle cx="119" cy="174" r="14"/>'
    + '<circle cx="141" cy="175" r="13"/>'
    + '</g>'
    /* 每颗独立高光（位置/角度微不同） */
    + '<g fill="#FFFFFF" opacity=".52">'
    + '<ellipse cx="114" cy="77" rx="4" ry="2.4" transform="rotate(-35 114 77)"/>'
    + '<ellipse cx="132" cy="78" rx="4" ry="2.4" transform="rotate(-28 132 78)"/>'
    + '<ellipse cx="96"  cy="98" rx="5" ry="2.8" transform="rotate(-40 96 98)"/>'
    + '<ellipse cx="142" cy="97" rx="5" ry="2.8" transform="rotate(-30 142 97)"/>'
    + '<ellipse cx="82"  cy="120" rx="5" ry="2.8" transform="rotate(-38 82 120)"/>'
    + '<ellipse cx="112" cy="122" rx="5" ry="3" transform="rotate(-32 112 122)"/>'
    + '<ellipse cx="144" cy="120" rx="5" ry="2.8" transform="rotate(-42 144 120)"/>'
    + '<ellipse cx="98"  cy="146" rx="5" ry="2.8" transform="rotate(-36 98 146)"/>'
    + '<ellipse cx="128" cy="148" rx="4.8" ry="2.6" transform="rotate(-30 128 148)"/>'
    + '<ellipse cx="114" cy="169" rx="4" ry="2.4" transform="rotate(-35 114 169)"/>'
    + '<ellipse cx="136" cy="170" rx="4" ry="2.2" transform="rotate(-32 136 170)"/>'
    + '</g>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * WATERMELON (V7) —— V6 基础上外轮廓轻微不规则
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="melon-v7-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#2E8A42"/>'
    + '<stop offset="45%" stop-color="#146532"/>'
    + '<stop offset="100%" stop-color="#083F21"/>'
    + '</linearGradient>'
    + '<linearGradient id="melon-v7-light-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#DDF49C"/>'
    + '<stop offset="55%" stop-color="#8FCB55"/>'
    + '<stop offset="100%" stop-color="#4E8F35"/>'
    + '</linearGradient>'
    + '<radialGradient id="melon-v7-flesh" cx="40%" cy="28%" r="82%">'
    + '<stop offset="0%" stop-color="#FF9093"/>'
    + '<stop offset="34%" stop-color="#FF636E"/>'
    + '<stop offset="70%" stop-color="#EA3F52"/>'
    + '<stop offset="100%" stop-color="#C81F34"/>'
    + '</radialGradient>'
    + '<filter id="melon-v7-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="10"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.05 */
    + '<ellipse cx="128" cy="204" rx="66" ry="5" fill="#000" opacity=".05" filter="url(#melon-v7-shadow)"/>'
    /* 外皮（V7：左肩稍高 + 右边缘不规则 + 底部略斜） */
    + '<path d="M 44 139 C 50 110, 68 89, 95 78 C 120 68, 147 69, 169 80 C 191 91, 206 112, 210 139 C 202 163, 186 181, 163 191 C 140 203, 106 204, 85 194 C 63 182, 49 162, 44 139 Z" fill="url(#melon-v7-rind)"/>'
    /* 浅绿皮 */
    + '<path d="M 53 138 C 59 113, 76 95, 100 85 C 122 77, 146 77, 165 87 C 185 96, 198 114, 203 138 C 195 159, 181 176, 160 186 C 139 197, 109 198, 88 188 C 69 177, 57 158, 53 138 Z" fill="url(#melon-v7-light-rind)"/>'
    /* 白瓤 */
    + '<path d="M 61 138 C 67 117, 84 102, 105 93 C 124 86, 143 86, 160 93 C 178 103, 190 118, 195 138 C 188 155, 175 170, 156 179 C 138 189, 111 190, 92 181 C 77 172, 64 156, 61 138 Z" fill="#FBFBE0"/>'
    /* 红肉 */
    + '<path d="M 68 138 C 74 120, 89 107, 108 99 C 125 93, 141 93, 156 99 C 173 107, 184 120, 188 138 C 182 154, 169 167, 152 176 C 137 184, 113 185, 96 177 C 82 169, 71 154, 68 138 Z" fill="url(#melon-v7-flesh)"/>'
    /* 8 颗籽（不工整） */
    + '<g fill="#332020">'
    + '<ellipse cx="98"  cy="126" rx="3.2" ry="7"   transform="rotate(-32 98 126)"/>'
    + '<ellipse cx="116" cy="111" rx="3.4" ry="7.2" transform="rotate(-16 116 111)"/>'
    + '<ellipse cx="135" cy="108" rx="3.4" ry="7.2" transform="rotate(6 135 108)"/>'
    + '<ellipse cx="153" cy="112" rx="3.2" ry="7"   transform="rotate(20 153 112)"/>'
    + '<ellipse cx="169" cy="127" rx="3" ry="6.8"   transform="rotate(30 169 127)"/>'
    + '<ellipse cx="128" cy="141" rx="3.2" ry="7"   transform="rotate(2 128 141)"/>'
    + '<ellipse cx="108" cy="142" rx="3" ry="6.8"   transform="rotate(-16 108 142)"/>'
    + '<ellipse cx="148" cy="145" rx="3" ry="6.8"   transform="rotate(22 148 145)"/>'
    + '</g>'
    /* 高光 */
    + '<path d="M 81 130 C 91 113, 110 103, 128 102" fill="none" stroke="#FFB4B4" stroke-width="4" stroke-linecap="round" opacity=".24"/>'
    /* 外皮纹（保留） */
    + '<path d="M 58 153 C 76 179, 101 191, 128 192" fill="none" stroke="#3A853C" stroke-width="1.6" opacity=".40" stroke-linecap="round"/>'
    + '<path d="M 128 192 C 155 191, 179 179, 197 153" fill="none" stroke="#2C6B2C" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * PLUM (V7) —— V6 基础上横向 +8% / 纵向 -6%
   *   用 <g transform> 包裹整个李子主体，等比压扁一点
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="plum-v7-body" cx="28%" cy="20%" r="88%">'
    + '<stop offset="0%" stop-color="#E394AE"/>'
    + '<stop offset="14%" stop-color="#BE5379"/>'
    + '<stop offset="40%" stop-color="#8B2C5B"/>'
    + '<stop offset="70%" stop-color="#5C1946"/>'
    + '<stop offset="92%" stop-color="#390F33"/>'
    + '<stop offset="100%" stop-color="#270925"/>'
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
