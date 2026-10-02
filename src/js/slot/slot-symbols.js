/* 幸运水果 · 精致图标 SVG（2.5D 扁平 + 高光 + 柔阴影）
   统一：黑描边 2px + 高光椭圆 + 底部柔阴影
*/
(function(){
'use strict';

function svg(inner, vb) {
  return '<svg viewBox="0 0 ' + (vb || '100 100') + '" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
// 高光：柔和白色椭圆
function hl(cx, cy, rx, ry, op) {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#ffffff" opacity="' + (op || 0.55) + '"/>';
}
// 底部柔阴影
function sh(cx, cy, rx, ry) {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".10"/>';
}

/* 樱桃 —— 双果 + 叶柄 + 叶 */
function cherry() {
  return svg(
    sh(50, 82, 30, 3) +
    '<path d="M46 32 C40 22 32 18 26 20" stroke="#2f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M54 32 C60 22 68 18 74 20" stroke="#2f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M26 20 C36 12 48 14 50 24 C40 26 30 26 26 20 Z" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M28 21 L42 19" stroke="#0a0a0a" stroke-width="1" stroke-linecap="round" opacity=".5"/>' +
    // 果实 1
    '<circle cx="38" cy="60" r="17" fill="url(#c-red1)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    // 果实 2
    '<circle cx="64" cy="60" r="17" fill="url(#c-red2)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    hl(33, 54, 4.5, 3, 0.7) +
    hl(59, 54, 4.5, 3, 0.6) +
    
    '<text x="50" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="78" font-weight="900" fill="url(#c-7)" stroke="#0a0a0a" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">7</text>' +
    '<ellipse cx="38" cy="26" rx="4" ry="2.5" fill="#fff" opacity=".4"/>'
  );
}

/* 金色 7 —— 金渐变 + 星点 */
function goldenSeven() {
  return svg(
    sh(50, 84, 22, 3) +
    
    '<text x="50" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="78" font-weight="900" fill="url(#c-g7)" stroke="#0a0a0a" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">7</text>' +
    '<path d="M78 22 L80 26 L84 26 L81 28 L82 32 L78 30 L74 32 L75 28 L72 26 L76 26 Z" fill="#fff3a8"/>' +
    '<path d="M20 28 L21 31 L24 31 L22 33 L23 36 L20 34 L17 36 L18 33 L16 31 L19 31 Z" fill="#fff3a8" opacity=".8"/>' +
    '<ellipse cx="38" cy="26" rx="4" ry="2.5" fill="#fff" opacity=".5"/>'
  );
}

/* 百搭 Wild —— 金圆 + 白星 + 光晕环 */
function wild() {
  return svg(
    sh(50, 86, 26, 3) +
    
    '<circle cx="50" cy="54" r="30" fill="url(#c-wg)" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<circle cx="50" cy="54" r="24" fill="none" stroke="#fff3b8" stroke-width="1" opacity=".7"/>' +
    '<path d="M50 30 L56 47 L74 47 L60 58 L65 76 L50 66 L35 76 L40 58 L26 47 L44 47 Z" fill="#fff8e0" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="54" r="2.2" fill="#a07810" opacity=".35"/>'
  );
}

window.SlotSymbols = {
  cherry: cherry, lemon: lemon, orange: orange, grape: grape, watermelon: watermelon,
  bell: bell, bar: bar, seven: seven, goldenSeven: goldenSeven, wild: wild
};
})();
