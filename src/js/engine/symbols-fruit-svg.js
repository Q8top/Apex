/* Apex · Fruit Symbols V6 (真实水果版)
 * 5 个水果 SVG。挂载：window.ApexFruitSvg
 *
 * V6 相对 V5 的关键重构：
 *   针对用户反馈"仍然像 SVG 图标"，不再补细节，而是重做形态语言
 *   - BANANA：从"U/月牙"改成"真实弯曲香蕉"（两端粗细不一 + 内弧外弧不平行）
 *   - GRAPE：上部小 / 中部最大 / 底部收窄（摆脱糖球堆叠感）
 *   - WATERMELON / PLUM / APPLE：Part 2 按规格微调
 *   - 阴影进一步弱化（不追求"漂浮图标"感）
 */
(function () {
  'use strict';

  var VIEWBOX = '0 0 256 256';
  var SVG_HEAD = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + VIEWBOX
    + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"';

  /* ============================================================
   * BANANA (V6) —— 真实弯曲香蕉
   *
   * 结构要点：
   *   - 梗端（左/上）较粗，尾端（右/下）收尖
   *   - 外弧长 + 内弧短（不平行）
   *   - 靠近梗部有微黄绿色
   *   - 尾部有深棕色干燥点
   *   - 极轻阴影（opacity 0.06）
   * ============================================================ */
  var BANANA_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    /* 主体渐变：从黄绿 → 亮黄 → 金黄 → 深黄 → 棕 */
    + '<linearGradient id="banana-v6-body" x1="15%" y1="8%" x2="85%" y2="95%">'
    + '<stop offset="0%" stop-color="#DFE470"/>'
    + '<stop offset="12%" stop-color="#FFEE55"/>'
    + '<stop offset="38%" stop-color="#F7CA26"/>'
    + '<stop offset="68%" stop-color="#DFA317"/>'
    + '<stop offset="88%" stop-color="#AD720A"/>'
    + '<stop offset="100%" stop-color="#6B4206"/>'
    + '</linearGradient>'
    /* 内侧浅色条（香蕉芯） */
    + '<linearGradient id="banana-v6-core" x1="0%" y1="0%" x2="100%" y2="0%">'
    + '<stop offset="0%" stop-color="#FFFCB8" stop-opacity=".62"/>'
    + '<stop offset="60%" stop-color="#FFE77A" stop-opacity=".22"/>'
    + '<stop offset="100%" stop-color="#FFF" stop-opacity="0"/>'
    + '</linearGradient>'
    /* 梗 */
    + '<linearGradient id="banana-v6-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#967C2E"/>'
    + '<stop offset="45%" stop-color="#5C4610"/>'
    + '<stop offset="100%" stop-color="#2B1D06"/>'
    + '</linearGradient>'
    /* 极轻阴影 */
    + '<filter id="banana-v6-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    /* 极轻阴影 opacity 0.06 */
    + '<ellipse cx="128" cy="207" rx="52" ry="5" fill="#000" opacity=".06" filter="url(#banana-v6-shadow)"/>'
    /* 真实弯曲香蕉主体 */
    + '<path d="M 55 45 C 40 65, 33 95, 38 125 C 45 160, 72 190, 110 205 C 148 218, 185 210, 205 185 C 218 168, 222 145, 220 128 C 217 112, 210 108, 204 116 C 202 122, 202 132, 200 145 C 196 168, 180 186, 155 195 C 128 204, 100 200, 80 185 C 60 168, 50 140, 50 115 C 50 88, 55 65, 65 50 C 68 46, 58 40, 55 45 Z" fill="url(#banana-v6-body)"/>'
    /* 内侧亮线 */
    + '<path d="M 62 56 C 52 75, 47 100, 51 124 C 57 152, 80 180, 112 194 C 142 205, 172 203, 190 189" fill="none" stroke="url(#banana-v6-core)" stroke-width="10" stroke-linecap="round"/>'
    /* 皮纹（不平行） */
    + '<path d="M 68 62 C 60 82, 58 108, 64 132" fill="none" stroke="#C8920F" stroke-width="2.2" opacity=".30" stroke-linecap="round"/>'
    + '<path d="M 188 155 C 182 175, 168 188, 148 195" fill="none" stroke="#A06806" stroke-width="2" opacity=".26" stroke-linecap="round"/>'
    /* 梗端（左/上，略粗） */
    + '<path d="M 55 45 C 51 36, 54 27, 62 22 C 68 18, 76 21, 76 28 C 76 33, 71 38, 67 43 L 66 50 Z" fill="url(#banana-v6-stem)"/>'
    /* 梗部微绿点 */
    + '<circle cx="63" cy="27" r="3" fill="#8DA030" opacity=".68"/>'
    /* 梗部切面 */
    + '<ellipse cx="64" cy="24" rx="5" ry="2.8" transform="rotate(-25 64 24)" fill="#2A1B05"/>'
    /* 尾端（右/下，收尖 + 深棕干燥点） */
    + '<path d="M 220 128 C 224 122, 230 122, 232 128 C 233 133, 229 138, 224 139 L 218 134 Z" fill="#5C3806"/>'
    /* 尾部干燥点 */
    + '<circle cx="228" cy="131" r="2.2" fill="#2B1703"/>'
    + '<circle cx="226" cy="128" r="1" fill="#7A4E10" opacity=".7"/>'
    + '</svg>';

  /* ============================================================
   * GRAPE (V6) —— 上部小 / 中部最大 / 底部收窄
   *
   * 结构要点：
   *   - 上部 2 颗 r=14~15
   *   - 中部 4 颗 r=18~20（最大）
   *   - 底部 3 颗 r=15~17（收窄）
   *   - 位置不完全对称
   *   - 高光位置独立
   * ============================================================ */
  var GRAPE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="grape-v6-ball" cx="30%" cy="22%" r="78%">'
    + '<stop offset="0%" stop-color="#E9C2F8"/>'
    + '<stop offset="16%" stop-color="#BC73E4"/>'
    + '<stop offset="46%" stop-color="#6D2FA8"/>'
    + '<stop offset="78%" stop-color="#41187A"/>'
    + '<stop offset="100%" stop-color="#26104A"/>'
    + '</radialGradient>'
    + '<linearGradient id="grape-v6-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A7D94A"/>'
    + '<stop offset="48%" stop-color="#5BAA2F"/>'
    + '<stop offset="100%" stop-color="#2B6D28"/>'
    + '</linearGradient>'
    + '<linearGradient id="grape-v6-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#966026"/>'
    + '<stop offset="60%" stop-color="#5C3A12"/>'
    + '<stop offset="100%" stop-color="#2F1D08"/>'
    + '</linearGradient>'
    + '<filter id="grape-v6-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="8"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.08 */
    + '<ellipse cx="128" cy="200" rx="48" ry="5" fill="#000" opacity=".08" filter="url(#grape-v6-shadow)"/>'
    /* 双叶 */
    + '<path d="M 126 62 C 108 45, 86 41, 63 49 C 71 67, 90 77, 111 78 C 100 87, 96 99, 99 109 C 116 100, 127 86, 131 70 Z" fill="url(#grape-v6-leaf)"/>'
    + '<path d="M 130 66 C 144 45, 165 38, 185 43 C 178 60, 160 71, 138 74 Z" fill="url(#grape-v6-leaf)"/>'
    + '<path d="M 68 52 C 88 60, 107 67, 127 68" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    + '<path d="M 136 67 C 152 58, 168 49, 182 45" fill="none" stroke="#3C8127" stroke-width="1.8" opacity=".55"/>'
    /* 主梗 + 分枝（梗真正插入葡萄串中心） */
    + '<path d="M 127 68 C 124 53, 120 41, 126 30 C 130 24, 138 23, 143 26" fill="none" stroke="url(#grape-v6-stem)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M 127 68 C 118 80, 108 90, 100 102 M 130 69 C 140 80, 150 90, 157 102 M 127 68 C 123 78, 121 88, 122 98" fill="none" stroke="url(#grape-v6-stem)" stroke-width="3.5" stroke-linecap="round"/>'
    /* 上部（2 颗，小） */
    + '<circle cx="121" cy="82" r="14" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="137" cy="82" r="14.5" fill="url(#grape-v6-ball)"/>'
    /* 中部（4 颗，最大） */
    + '<circle cx="105" cy="104" r="19" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="127" cy="106" r="20" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="149" cy="104" r="19.5" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="128" cy="128" r="20.5" fill="url(#grape-v6-ball)"/>'
    /* 底部（3 颗，略收窄） */
    + '<circle cx="112" cy="150" r="17" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="144" cy="150" r="16.5" fill="url(#grape-v6-ball)"/>'
    + '<circle cx="128" cy="170" r="15" fill="url(#grape-v6-ball)"/>'
    /* 每颗独立高光（不完全对齐） */
    + '<g fill="#FFFFFF" opacity=".48">'
    + '<ellipse cx="116" cy="77" rx="4" ry="2.4" transform="rotate(-32 116 77)"/>'
    + '<ellipse cx="132" cy="77" rx="4" ry="2.4" transform="rotate(-40 132 77)"/>'
    + '<ellipse cx="99" cy="98" rx="5" ry="3" transform="rotate(-42 99 98)"/>'
    + '<ellipse cx="121" cy="99" rx="5" ry="3" transform="rotate(-30 121 99)"/>'
    + '<ellipse cx="143" cy="98" rx="5" ry="3" transform="rotate(-28 143 98)"/>'
    + '<ellipse cx="122" cy="122" rx="5" ry="3" transform="rotate(-35 122 122)"/>'
    + '<ellipse cx="106" cy="144" rx="4.5" ry="2.6" transform="rotate(-38 106 144)"/>'
    + '<ellipse cx="138" cy="145" rx="4.5" ry="2.6" transform="rotate(-32 138 145)"/>'
    + '<ellipse cx="123" cy="165" rx="4" ry="2.2" transform="rotate(-36 123 165)"/>'
    + '</g>'
    + '</svg>';

  /* ============================================================
   * WATERMELON (V6) —— 更真实厚切片
   *
   * 相对 V5：
   *   - 外轮廓左右不对称（左侧略高）
   *   - 分层更明显：深绿皮 → 浅绿皮 → 白瓤 → 红肉
   *   - 籽不工整排列
   *   - 阴影 0.05（切片不需要落影）
   * ============================================================ */
  var WATERMELON_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<linearGradient id="melon-v6-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#2E8A42"/>'
    + '<stop offset="45%" stop-color="#146532"/>'
    + '<stop offset="100%" stop-color="#083F21"/>'
    + '</linearGradient>'
    + '<linearGradient id="melon-v6-light-rind" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#DDF49C"/>'
    + '<stop offset="55%" stop-color="#8FCB55"/>'
    + '<stop offset="100%" stop-color="#4E8F35"/>'
    + '</linearGradient>'
    + '<radialGradient id="melon-v6-flesh" cx="40%" cy="28%" r="82%">'
    + '<stop offset="0%" stop-color="#FF9093"/>'
    + '<stop offset="34%" stop-color="#FF636E"/>'
    + '<stop offset="70%" stop-color="#EA3F52"/>'
    + '<stop offset="100%" stop-color="#C81F34"/>'
    + '</radialGradient>'
    + '<filter id="melon-v6-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="10"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.05（切片几乎不需要落影） */
    + '<ellipse cx="128" cy="202" rx="66" ry="5" fill="#000" opacity=".05" filter="url(#melon-v6-shadow)"/>'
    /* 外皮（左侧略高，非对称） */
    + '<path d="M 46 138 C 52 110, 70 90, 96 79 C 120 70, 146 71, 168 81 C 189 92, 203 112, 208 138 C 200 161, 185 179, 163 189 C 141 200, 108 202, 87 192 C 66 181, 51 161, 46 138 Z" fill="url(#melon-v6-rind)"/>'
    /* 浅绿皮 */
    + '<path d="M 54 138 C 60 113, 77 95, 100 85 C 122 77, 145 77, 164 86 C 183 96, 196 114, 201 138 C 194 158, 180 175, 160 185 C 140 195, 110 197, 89 187 C 71 177, 58 158, 54 138 Z" fill="url(#melon-v6-light-rind)"/>'
    /* 白瓤 */
    + '<path d="M 61 138 C 67 117, 84 102, 105 93 C 124 86, 143 86, 160 93 C 178 103, 190 118, 195 138 C 188 155, 175 170, 156 179 C 138 189, 111 190, 92 181 C 77 172, 64 156, 61 138 Z" fill="#FBFBE0"/>'
    /* 红肉（偏移左） */
    + '<path d="M 68 138 C 74 120, 89 107, 108 99 C 125 93, 141 93, 156 99 C 173 107, 184 120, 188 138 C 182 154, 169 167, 152 176 C 137 184, 113 185, 96 177 C 82 169, 71 154, 68 138 Z" fill="url(#melon-v6-flesh)"/>'
    /* 8 颗籽（不工整排列） */
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
    /* 自然高光 */
    + '<path d="M 81 130 C 91 113, 110 103, 128 102" fill="none" stroke="#FFB4B4" stroke-width="4" stroke-linecap="round" opacity=".24"/>'
    /* 外皮自然纹路 */
    + '<path d="M 60 152 C 78 178, 102 190, 128 191" fill="none" stroke="#3A853C" stroke-width="1.6" opacity=".40" stroke-linecap="round"/>'
    + '<path d="M 128 191 C 154 190, 178 178, 196 152" fill="none" stroke="#2C6B2C" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>'
    + '</svg>';

  /* ============================================================
   * PLUM (V6) —— 更圆扁（不是梨形）+ 顶部微凹 + 明显果沟
   * ============================================================ */
  var PLUM_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="plum-v6-body" cx="28%" cy="20%" r="88%">'
    + '<stop offset="0%" stop-color="#E394AE"/>'
    + '<stop offset="14%" stop-color="#BE5379"/>'
    + '<stop offset="40%" stop-color="#8B2C5B"/>'
    + '<stop offset="70%" stop-color="#5C1946"/>'
    + '<stop offset="92%" stop-color="#390F33"/>'
    + '<stop offset="100%" stop-color="#270925"/>'
    + '</radialGradient>'
    + '<linearGradient id="plum-v6-side" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#E69CB0"/>'
    + '<stop offset="38%" stop-color="#B44C72"/>'
    + '<stop offset="100%" stop-color="#51173F"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v6-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A6D84D"/>'
    + '<stop offset="45%" stop-color="#5DA92F"/>'
    + '<stop offset="100%" stop-color="#2C6E27"/>'
    + '</linearGradient>'
    + '<linearGradient id="plum-v6-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8F5C24"/>'
    + '<stop offset="60%" stop-color="#523010"/>'
    + '<stop offset="100%" stop-color="#2A1706"/>'
    + '</linearGradient>'
    + '<filter id="plum-v6-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.09 */
    + '<ellipse cx="128" cy="208" rx="50" ry="5" fill="#000" opacity=".09" filter="url(#plum-v6-shadow)"/>'
    /* 叶 + 梗 */
    + '<path d="M 128 64 C 143 45, 163 38, 184 44 C 176 61, 158 73, 136 75 C 132 72, 130 68, 128 64 Z" fill="url(#plum-v6-leaf)"/>'
    + '<path d="M 135 69 C 152 60, 167 51, 180 46" fill="none" stroke="#3B7E29" stroke-width="2" stroke-linecap="round" opacity=".62"/>'
    + '<path d="M 128 65 C 126 51, 129 40, 136 31" fill="none" stroke="url(#plum-v6-stem)" stroke-width="7.5" stroke-linecap="round"/>'
    /* 圆扁成熟李形（更宽更矮） */
    + '<path d="M 128 62 C 106 58, 85 65, 73 82 C 61 100, 57 124, 61 148 C 66 172, 79 191, 100 201 C 111 206, 121 208, 128 208 C 136 208, 146 206, 157 201 C 177 191, 191 172, 196 148 C 200 124, 196 100, 184 82 C 172 65, 151 58, 128 62 Z" fill="url(#plum-v6-body)"/>'
    /* 顶部微凹阴影 */
    + '<path d="M 116 63 Q 128 72 140 63" fill="none" stroke="#3F0E30" stroke-width="4" stroke-linecap="round" opacity=".42"/>'
    /* 左侧反光 */
    + '<path d="M 99 71 C 79 83, 71 105, 73 128 C 75 152, 85 174, 103 188" fill="none" stroke="url(#plum-v6-side)" stroke-width="15" stroke-linecap="round" opacity=".66"/>'
    /* 中央深沟（暗沟 + 边缘柔光） */
    + '<path d="M 128 63 C 124 82, 122 102, 123 122 C 124 146, 127 172, 128 197" fill="none" stroke="#451539" stroke-width="6" stroke-linecap="round" opacity=".40"/>'
    + '<path d="M 124 67 C 120 90, 120 112, 122 136" fill="none" stroke="#D98DA6" stroke-width="2" stroke-linecap="round" opacity=".36"/>'
    /* 果粉 */
    + '<ellipse cx="115" cy="106" rx="54" ry="60" fill="#E7B2C7" opacity=".055"/>'
    /* 高光（顶部偏粉紫） */
    + '<ellipse cx="98" cy="90" rx="15" ry="7" transform="rotate(-42 98 90)" fill="#FFFFFF" opacity=".20"/>'
    + '<ellipse cx="91" cy="106" rx="4.2" ry="2.4" transform="rotate(-42 91 106)" fill="#FFE2F0" opacity=".24"/>'
    + '</svg>';

  /* ============================================================
   * APPLE (V6) —— 微调：高光进一步弱化 + 更自然不对称
   * ============================================================ */
  var APPLE_SVG = '<svg ' + SVG_HEAD + '>'
    + '<defs>'
    + '<radialGradient id="apple-v6-body" cx="30%" cy="21%" r="86%">'
    + '<stop offset="0%" stop-color="#FF9BA0"/>'
    + '<stop offset="18%" stop-color="#FF5F68"/>'
    + '<stop offset="46%" stop-color="#EA2C38"/>'
    + '<stop offset="74%" stop-color="#C61425"/>'
    + '<stop offset="94%" stop-color="#930B19"/>'
    + '<stop offset="100%" stop-color="#650712"/>'
    + '</radialGradient>'
    + '<linearGradient id="apple-v6-leaf" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#A9DA4C"/>'
    + '<stop offset="48%" stop-color="#61B32F"/>'
    + '<stop offset="100%" stop-color="#2F7728"/>'
    + '</linearGradient>'
    + '<linearGradient id="apple-v6-stem" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#8E5B27"/>'
    + '<stop offset="55%" stop-color="#563616"/>'
    + '<stop offset="100%" stop-color="#2C1B09"/>'
    + '</linearGradient>'
    + '<filter id="apple-v6-shadow" x="-20%" y="-20%" width="140%" height="160%">'
    + '<feGaussianBlur stdDeviation="9"/>'
    + '</filter>'
    + '</defs>'
    /* 阴影 0.10 */
    + '<ellipse cx="128" cy="208" rx="50" ry="5" fill="#000" opacity=".10" filter="url(#apple-v6-shadow)"/>'
    /* 叶 + 梗 */
    + '<path d="M 129 60 C 143 42, 162 34, 182 40 C 176 56, 159 68, 136 71 C 133 67, 131 63, 129 60 Z" fill="url(#apple-v6-leaf)"/>'
    + '<path d="M 135 66 C 150 57, 165 48, 178 43" fill="none" stroke="#3C8228" stroke-width="2" stroke-linecap="round" opacity=".60"/>'
    + '<path d="M 127 69 C 124 54, 126 42, 132 32" fill="none" stroke="url(#apple-v6-stem)" stroke-width="8" stroke-linecap="round"/>'
    /* 苹果主体（左侧更鼓，右侧稍平） */
    + '<path d="M 128 70 C 114 58, 98 55, 86 61 C 64 69, 52 90, 54 114 C 56 143, 70 172, 88 192 C 100 205, 115 212, 128 212 C 140 211, 155 204, 167 191 C 185 170, 197 140, 198 111 C 199 87, 188 68, 168 61 C 155 56, 140 59, 128 70 Z" fill="url(#apple-v6-body)"/>'
    /* 左侧红橙反射（更柔） */
    + '<path d="M 90 73 C 71 85, 66 108, 70 132 C 74 156, 87 179, 105 193" fill="none" stroke="#FF6B65" stroke-width="14" stroke-linecap="round" opacity=".22"/>'
    /* 顶部凹陷（双层） */
    + '<path d="M 102 70 C 111 79, 120 83, 128 83 C 137 83, 146 78, 155 69" fill="none" stroke="#8C101B" stroke-width="7.5" stroke-linecap="round" opacity=".52"/>'
    + '<path d="M 108 70 C 116 77, 122 80, 128 80 C 135 80, 141 76, 148 70" fill="none" stroke="#5F0713" stroke-width="3" stroke-linecap="round" opacity=".52"/>'
    /* 高光进一步弱化（.25 → .20） */
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
