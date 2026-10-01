/* Lucky Fruit · 符号 SVG 定义
   统一风格：黑描边 + 白色高光 + 低饱和主色
   每个函数返回 SVG 字符串（内联，无外部依赖）
*/
(function(){
'use strict';

var S = 100; // viewBox 基准

function svg(inner) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' + inner + '</svg>';
}

/* 樱桃 */
function cherry() {
  return svg(
    '<path d="M50 30 Q46 18 36 16" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 30 Q54 18 64 16" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M34 16 Q46 12 52 20" stroke="#3f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="36" cy="62" r="17" fill="#d94b4b"/>' +
    '<circle cx="64" cy="62" r="17" fill="#c53030"/>' +
    '<circle cx="31" cy="56" r="4" fill="#ffffff" opacity=".55"/>' +
    '<circle cx="59" cy="56" r="4" fill="#ffffff" opacity=".55"/>' +
    '<circle cx="36" cy="62" r="17" fill="none" stroke="#0a0a0a" stroke-width="2"/>' +
    '<circle cx="64" cy="62" r="17" fill="none" stroke="#0a0a0a" stroke-width="2"/>'
  );
}

/* 柠檬 */
function lemon() {
  return svg(
    '<ellipse cx="50" cy="54" rx="30" ry="22" fill="#f2d14a"/>' +
    '<ellipse cx="50" cy="54" rx="30" ry="22" fill="none" stroke="#0a0a0a" stroke-width="2"/>' +
    '<path d="M20 54 Q14 54 16 48 Q18 44 22 48" fill="#f2d14a" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M80 54 Q86 54 84 60 Q82 64 78 60" fill="#f2d14a" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>' +
    '<ellipse cx="42" cy="46" rx="7" ry="4" fill="#ffffff" opacity=".55"/>'
  );
}

/* 橙子 */
function orange() {
  return svg(
    '<circle cx="50" cy="56" r="26" fill="#e8944a"/>' +
    '<circle cx="50" cy="56" r="26" fill="none" stroke="#0a0a0a" stroke-width="2"/>' +
    '<path d="M50 30 Q54 22 62 22" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<circle cx="62" cy="24" r="5" fill="#3f7a3a" stroke="#0a0a0a" stroke-width="1.5"/>' +
    '<circle cx="42" cy="48" r="6" fill="#ffffff" opacity=".5"/>'
  );
}

/* 葡萄 */
function grape() {
  return svg(
    '<path d="M50 24 Q54 16 62 14" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 24 Q42 20 40 26" stroke="#3f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="42" cy="44" r="9" fill="#8b5cb8" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="58" cy="44" r="9" fill="#7a4ba8" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="50" cy="58" r="9" fill="#8b5cb8" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="36" cy="60" r="9" fill="#7a4ba8" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="64" cy="60" r="9" fill="#7a4ba8" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="50" cy="74" r="9" fill="#6b3f99" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="40" cy="40" r="2.5" fill="#ffffff" opacity=".6"/>'
  );
}

/* 西瓜 */
function watermelon() {
  return svg(
    '<path d="M22 40 Q50 12 78 40 Q50 66 22 40 Z" fill="#4a9a4a" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M28 42 Q50 22 72 42 Q50 62 28 42 Z" fill="#e85a6a" stroke="#0a0a0a" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="42" cy="38" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="52" cy="34" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="62" cy="40" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="48" cy="48" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="58" cy="50" r="1.6" fill="#0a0a0a"/>'
  );
}

/* 铃铛 */
function bell() {
  return svg(
    '<path d="M50 22 Q32 22 32 44 L28 66 Q28 70 34 70 L66 70 Q72 70 72 66 L68 44 Q68 22 50 22 Z" fill="#e8b84a" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M50 22 Q46 16 54 14" stroke="#0a0a0a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="50" cy="76" r="5" fill="#c99a2e" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<path d="M40 34 Q50 30 60 34" stroke="#ffffff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>'
  );
}

/* BAR */
function bar() {
  return svg(
    '<rect x="16" y="34" width="68" height="34" rx="8" fill="#0a0a0a"/>' +
    '<rect x="16" y="34" width="68" height="34" rx="8" fill="none" stroke="#d4af37" stroke-width="2"/>' +
    '<text x="50" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="800" fill="#d4af37" letter-spacing="2">BAR</text>'
  );
}

/* 7 */
function seven() {
  return svg(
    '<text x="50" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="72" font-weight="900" fill="#d43c3c" stroke="#0a0a0a" stroke-width="2" paint-order="stroke" letter-spacing="-2">7</text>'
  );
}

/* 金色 7 */
function goldenSeven() {
  return svg(
    '<defs><linearGradient id="gld7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f5d97a"/><stop offset="100%" stop-color="#b8892a"/></linearGradient></defs>' +
    '<text x="50" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="72" font-weight="900" fill="url(#gld7)" stroke="#0a0a0a" stroke-width="2" paint-order="stroke" letter-spacing="-2">7</text>' +
    '<circle cx="76" cy="26" r="3" fill="#f5d97a" opacity=".9"/>' +
    '<circle cx="24" cy="30" r="2" fill="#f5d97a" opacity=".7"/>'
  );
}

/* Wild */
function wild() {
  return svg(
    '<defs><linearGradient id="wldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f5d97a"/><stop offset="100%" stop-color="#c8962e"/></linearGradient></defs>' +
    '<circle cx="50" cy="54" r="30" fill="url(#wldG)" stroke="#0a0a0a" stroke-width="2.4"/>' +
    '<path d="M50 30 L56 46 L74 46 L60 56 L66 74 L50 63 L34 74 L40 56 L26 46 L44 46 Z" fill="#ffffff" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>'
  );
}

window.SlotSymbols = {
  cherry: cherry,
  lemon: lemon,
  orange: orange,
  grape: grape,
  watermelon: watermelon,
  bell: bell,
  bar: bar,
  seven: seven,
  goldenSeven: goldenSeven,
  wild: wild
};

})();
