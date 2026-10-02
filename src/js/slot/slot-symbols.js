/* 幸运水果 · 符号 SVG（v3 干净版）
   - 所有 gradient 定义在 slot.html 的 #slot-defs
   - 这里只引用 url(#c-xxx)，不再内嵌 defs
*/
(function(){
'use strict';

var DEFS_ID = 'apex-slot-defs-global';
function ensureDefs() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEFS_ID)) return;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('style', 'position:absolute;overflow:hidden');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML =
    '<defs>' +
    '<radialGradient id="c-red1" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ff7a7a"/><stop offset="70%" stop-color="#dc3a3a"/><stop offset="100%" stop-color="#a81f1f"/></radialGradient>' +
    '<radialGradient id="c-red2" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#f56b6b"/><stop offset="70%" stop-color="#c93030"/><stop offset="100%" stop-color="#951515"/></radialGradient>' +
    '<radialGradient id="c-lemon" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#fef2a0"/><stop offset="60%" stop-color="#f0d550"/><stop offset="100%" stop-color="#d4a828"/></radialGradient>' +
    '<radialGradient id="c-orange" cx="35%" cy="28%" r="80%"><stop offset="0%" stop-color="#ffb877"/><stop offset="60%" stop-color="#ef8a3e"/><stop offset="100%" stop-color="#c86320"/></radialGradient>' +
    '<radialGradient id="c-gp1" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#c89cf0"/><stop offset="60%" stop-color="#9060c0"/><stop offset="100%" stop-color="#603a90"/></radialGradient>' +
    '<radialGradient id="c-gp2" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#b088e0"/><stop offset="60%" stop-color="#7a4aa8"/><stop offset="100%" stop-color="#522e80"/></radialGradient>' +
    '<radialGradient id="c-wm" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#7ec26a"/><stop offset="70%" stop-color="#3f8f3f"/><stop offset="100%" stop-color="#1f6028"/></radialGradient>' +
    '<radialGradient id="c-wm2" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#ff8080"/><stop offset="70%" stop-color="#e5484d"/><stop offset="100%" stop-color="#b02028"/></radialGradient>' +
    '<linearGradient id="c-bell" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbe88a"/><stop offset="45%" stop-color="#e8b842"/><stop offset="100%" stop-color="#a07812"/></linearGradient>' +
    '<linearGradient id="c-bell2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8a830"/><stop offset="100%" stop-color="#8a6010"/></linearGradient>' +
    '<linearGradient id="c-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a2a2a"/><stop offset="50%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#000"/></linearGradient>' +
    '<linearGradient id="c-7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff7a7a"/><stop offset="55%" stop-color="#e53838"/><stop offset="100%" stop-color="#a01818"/></linearGradient>' +
    '<linearGradient id="c-g7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3a8"/><stop offset="45%" stop-color="#f0c33e"/><stop offset="100%" stop-color="#a07020"/></linearGradient>' +
    '<radialGradient id="c-wg" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff3b8"/><stop offset="60%" stop-color="#e8b83e"/><stop offset="100%" stop-color="#a07810"/></radialGradient>' +
    '</defs>';
  document.body.appendChild(svg);
}

function wrap(inner) {
  ensureDefs();
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}
function hl(cx, cy, rx, ry, op) {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#ffffff" opacity="' + (op || 0.55) + '"/>';
}
function shadow(cx, cy, rx, ry) {
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".10"/>';
}

function cherry() {
  return wrap(
    shadow(50, 82, 30, 3) +
    '<path d="M46 32 C40 22 32 18 26 20" stroke="#2f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M54 32 C60 22 68 18 74 20" stroke="#2f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M26 20 C36 12 48 14 50 24 C40 26 30 26 26 20 Z" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M28 21 L42 19" stroke="#0a0a0a" stroke-width="1" stroke-linecap="round" opacity=".5"/>' +
    '<circle cx="38" cy="60" r="17" fill="url(#c-red1)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    '<circle cx="64" cy="60" r="17" fill="url(#c-red2)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    hl(33, 54, 4.5, 3, 0.7) +
    hl(59, 54, 4.5, 3, 0.6)
  );
}

function lemon() {
  return wrap(
    shadow(50, 78, 30, 3) +
    '<path d="M16 56 C16 40 30 30 50 30 C70 30 84 40 84 56 C84 66 72 74 50 74 C28 74 16 66 16 56 Z" fill="url(#c-lemon)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M12 52 C12 46 20 46 20 52 C20 56 12 56 12 52 Z" fill="#e8c24a" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<path d="M80 52 C80 46 88 46 88 52 C88 56 80 56 80 52 Z" fill="#e8c24a" stroke="#0a0a0a" stroke-width="1.6"/>' +
    hl(38, 44, 8, 4, 0.65) +
    '<path d="M28 60 C34 66 44 68 52 66" stroke="#b8922a" stroke-width="1.2" fill="none" opacity=".4" stroke-linecap="round"/>'
  );
}

function orange() {
  return wrap(
    shadow(50, 84, 28, 3) +
    '<circle cx="50" cy="56" r="27" fill="url(#c-orange)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    '<path d="M50 30 C48 22 52 16 60 14 C62 22 58 28 50 30 Z" fill="#3f9a4a" stroke="#0a0a0a" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M50 30 L50 34" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round"/>' +
    hl(38, 46, 7, 4.5, 0.65) +
    '<path d="M32 70 C38 76 46 78 54 76" stroke="#a85a20" stroke-width="1.2" fill="none" opacity=".35" stroke-linecap="round"/>'
  );
}

function grape() {
  return wrap(
    shadow(50, 88, 26, 3) +
    '<path d="M50 22 C48 14 52 10 58 8" stroke="#2f6a30" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 22 C42 18 36 20 34 26" stroke="#3f9a4a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="42" cy="40" r="9.5" fill="url(#c-gp1)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="60" cy="40" r="9.5" fill="url(#c-gp2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="50" cy="55" r="9.5" fill="url(#c-gp1)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="33" cy="56" r="9.5" fill="url(#c-gp2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="67" cy="56" r="9.5" fill="url(#c-gp2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="42" cy="72" r="9.5" fill="url(#c-gp2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="58" cy="72" r="9.5" fill="url(#c-gp1)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    '<circle cx="50" cy="86" r="9" fill="url(#c-gp2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    hl(38, 36, 2.5, 2, 0.7) +
    hl(56, 36, 2.5, 2, 0.6)
  );
}

function watermelon() {
  return wrap(
    shadow(50, 78, 32, 3) +
    '<path d="M14 42 C14 42 50 12 86 42 C78 68 60 80 50 80 C40 80 22 68 14 42 Z" fill="url(#c-wm)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M20 44 C20 44 50 20 80 44 C74 64 60 74 50 74 C40 74 26 64 20 44 Z" fill="url(#c-wm2)" stroke="#0a0a0a" stroke-width="1.6"/>' +
    '<path d="M46 46 L44 34" stroke="#1a6a20" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M54 46 L56 34" stroke="#1a6a20" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="40" cy="52" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="54" cy="48" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="60" cy="58" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="46" cy="62" r="1.6" fill="#0a0a0a"/>' +
    '<circle cx="34" cy="58" r="1.6" fill="#0a0a0a"/>'
  );
}

function bell() {
  return wrap(
    shadow(50, 82, 28, 3) +
    '<path d="M50 22 C50 18 48 14 50 12 C52 14 50 18 50 22 Z" fill="#0a0a0a"/>' +
    '<path d="M50 22 C30 22 28 44 26 62 C25 68 28 70 34 70 L66 70 C72 70 75 68 74 62 C72 44 70 22 50 22 Z" fill="url(#c-bell)" stroke="#0a0a0a" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="70" rx="20" ry="3" fill="#8a6a10" opacity=".5"/>' +
    '<circle cx="50" cy="78" r="5" fill="url(#c-bell2)" stroke="#0a0a0a" stroke-width="1.8"/>' +
    hl(38, 38, 5, 8, 0.6) +
    '<path d="M34 30 C40 26 50 25 56 28" stroke="#fff8d0" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>'
  );
}

function bar() {
  return wrap(
    shadow(50, 74, 34, 3) +
    '<rect x="10" y="30" width="80" height="40" rx="10" fill="url(#c-bar)" stroke="#0a0a0a" stroke-width="2.2"/>' +
    '<rect x="14" y="34" width="72" height="32" rx="7" fill="none" stroke="#d4af37" stroke-width="1.2" opacity=".7"/>' +
    '<text x="50" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="900" fill="#f5d97a" letter-spacing="3">BAR</text>'
  );
}

function seven() {
  return wrap(
    shadow(50, 84, 22, 3) +
    '<text x="50" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="78" font-weight="900" fill="url(#c-7)" stroke="#0a0a0a" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">7</text>' +
    '<ellipse cx="38" cy="26" rx="4" ry="2.5" fill="#fff" opacity=".4"/>'
  );
}

function goldenSeven() {
  return wrap(
    shadow(50, 84, 22, 3) +
    '<text x="50" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="78" font-weight="900" fill="url(#c-g7)" stroke="#0a0a0a" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">7</text>' +
    '<path d="M78 22 L80 26 L84 26 L81 28 L82 32 L78 30 L74 32 L75 28 L72 26 L76 26 Z" fill="#fff3a8"/>' +
    '<path d="M20 28 L21 31 L24 31 L22 33 L23 36 L20 34 L17 36 L18 33 L16 31 L19 31 Z" fill="#fff3a8" opacity=".8"/>' +
    '<ellipse cx="38" cy="26" rx="4" ry="2.5" fill="#fff" opacity=".5"/>'
  );
}

function wild() {
  return wrap(
    shadow(50, 86, 26, 3) +
    '<circle cx="50" cy="54" r="30" fill="url(#c-wg)" stroke="#0a0a0a" stroke-width="2.6"/>' +
    '<circle cx="50" cy="54" r="24" fill="none" stroke="#fff3b8" stroke-width="1" opacity=".7"/>' +
    '<path d="M50 30 L56 47 L74 47 L60 58 L65 76 L50 66 L35 76 L40 58 L26 47 L44 47 Z" fill="#fff8e0" stroke="#0a0a0a" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="54" r="2.2" fill="#a07810" opacity=".35"/>'
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
