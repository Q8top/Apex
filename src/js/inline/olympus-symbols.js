/* Apex Olympus 符号库 —— 10 个精致 SVG（内联，无外部依赖）
 * viewBox 0 0 100 100，每个带渐变 + 切面 + 高光
 */
(function(){
'use strict';

var S = {};

/* ============ 皇冠（最高价值）============ */
S.crown = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="cr-g" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fef9c3"/>\
<stop offset="0.3" stop-color="#fbbf24"/>\
<stop offset="0.75" stop-color="#d97706"/>\
<stop offset="1" stop-color="#78350f"/>\
</linearGradient>\
<linearGradient id="cr-b" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#b45309"/>\
<stop offset="0.5" stop-color="#fcd34d"/>\
<stop offset="1" stop-color="#b45309"/>\
</linearGradient>\
</defs>\
<path d="M12 72 L14 28 L30 46 L50 14 L70 46 L86 28 L88 72 Z" fill="url(#cr-g)" stroke="#78350f" stroke-width="2.5" stroke-linejoin="round"/>\
<path d="M14 28 L30 46 L50 14 L70 46 L86 28 L87 32 L70 50 L50 18 L30 50 L13 32 Z" fill="#fef9c3" opacity="0.7"/>\
<rect x="10" y="72" width="80" height="14" rx="3" fill="url(#cr-b)" stroke="#78350f" stroke-width="2.5"/>\
<rect x="13" y="75" width="74" height="3" fill="#fef3c7" opacity="0.7"/>\
<circle cx="32" cy="79" r="4.5" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.2"/>\
<circle cx="31" cy="78" r="1.5" fill="#fca5a5"/>\
<circle cx="50" cy="79" r="4.5" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.2"/>\
<circle cx="49" cy="78" r="1.5" fill="#bfdbfe"/>\
<circle cx="68" cy="79" r="4.5" fill="#10b981" stroke="#065f46" stroke-width="1.2"/>\
<circle cx="67" cy="78" r="1.5" fill="#6ee7b7"/>\
<circle cx="50" cy="14" r="4" fill="#fef3c7" stroke="#78350f" stroke-width="1.5"/>\
<circle cx="50" cy="13" r="1.5" fill="#fff"/>\
</svg>';

/* ============ 通用宝石（6 边形切面）============ */
function gem(defsId, g1, g2, g3, stroke, light, hi) {
  return '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="' + defsId + '" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="' + g1 + '"/>\
<stop offset="0.45" stop-color="' + g2 + '"/>\
<stop offset="1" stop-color="' + g3 + '"/>\
</linearGradient>\
</defs>\
<polygon points="50,8 88,30 88,70 50,92 12,70 12,30" fill="url(#' + defsId + ')" stroke="' + stroke + '" stroke-width="2.5" stroke-linejoin="round"/>\
<polygon points="50,8 88,30 50,50 12,30" fill="' + light + '" opacity="0.55"/>\
<polygon points="12,30 50,50 12,70" fill="#000" opacity="0.15"/>\
<polygon points="50,50 88,30 88,70 50,92" fill="#000" opacity="0.25"/>\
<polygon points="50,8 68,28 50,28 32,28" fill="' + hi + '" opacity="0.7"/>\
<circle cx="38" cy="24" r="4" fill="#ffffff" opacity="0.85"/>\
<circle cx="64" cy="70" r="2.5" fill="#ffffff" opacity="0.5"/>\
</svg>';
}

S.red    = gem('rd-g', '#fca5a5', '#ef4444', '#7f1d1d', '#7f1d1d', '#fca5a5', '#fecaca');
S.purple = gem('pp-g', '#d8b4fe', '#a855f7', '#581c87', '#581c87', '#d8b4fe', '#e9d5ff');
S.yellow = gem('yl-g', '#fef08a', '#facc15', '#713f12', '#713f12', '#fef08a', '#fef9c3');
S.green  = gem('gr-g', '#6ee7b7', '#10b981', '#064e3b', '#064e3b', '#6ee7b7', '#a7f3d0');
S.blue   = gem('bl-g', '#93c5fd', '#3b82f6', '#1e3a8a', '#1e3a8a', '#93c5fd', '#bfdbfe');

/* ============ 圣杯 ============ */
S.goblet = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="gb-g" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#78350f"/>\
<stop offset="0.25" stop-color="#fcd34d"/>\
<stop offset="0.5" stop-color="#fef9c3"/>\
<stop offset="0.75" stop-color="#fcd34d"/>\
<stop offset="1" stop-color="#78350f"/>\
</linearGradient>\
</defs>\
<ellipse cx="50" cy="92" rx="22" ry="4" fill="#a16207" stroke="#78350f" stroke-width="1.5"/>\
<rect x="36" y="86" width="28" height="6" rx="2" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>\
<rect x="46" y="64" width="8" height="24" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>\
<ellipse cx="50" cy="64" rx="6" ry="2" fill="#fef9c3" opacity="0.7"/>\
<path d="M22 18 L78 18 L74 48 Q70 64 50 66 Q30 64 26 48 Z" fill="url(#gb-g)" stroke="#78350f" stroke-width="2.5" stroke-linejoin="round"/>\
<ellipse cx="50" cy="18" rx="28" ry="5" fill="#fcd34d" stroke="#78350f" stroke-width="2"/>\
<ellipse cx="50" cy="18" rx="22" ry="3" fill="#78350f" opacity="0.5"/>\
<path d="M32 24 Q32 46 40 58" fill="none" stroke="#fff" stroke-width="2" opacity="0.7" stroke-linecap="round"/>\
<circle cx="50" cy="38" r="5" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.2"/>\
<circle cx="48.5" cy="36.5" r="1.5" fill="#fca5a5"/>\
</svg>';

/* ============ 沙漏 ============ */
S.hourglass = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="hg-w" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#451a03"/>\
<stop offset="0.3" stop-color="#b45309"/>\
<stop offset="0.5" stop-color="#fcd34d"/>\
<stop offset="0.7" stop-color="#b45309"/>\
<stop offset="1" stop-color="#451a03"/>\
</linearGradient>\
<linearGradient id="hg-s" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde047"/>\
<stop offset="1" stop-color="#a16207"/>\
</linearGradient>\
</defs>\
<rect x="14" y="6" width="72" height="10" rx="3" fill="url(#hg-w)" stroke="#451a03" stroke-width="2"/>\
<rect x="14" y="84" width="72" height="10" rx="3" fill="url(#hg-w)" stroke="#451a03" stroke-width="2"/>\
<rect x="18" y="8" width="64" height="2" fill="#fef9c3" opacity="0.6"/>\
<rect x="18" y="86" width="64" height="2" fill="#fef9c3" opacity="0.6"/>\
<path d="M26 16 L74 16 L60 44 L60 56 L74 84 L26 84 L40 56 L40 44 Z" fill="#fef3c7" opacity="0.35" stroke="#78350f" stroke-width="2" stroke-linejoin="round"/>\
<polygon points="30,20 70,20 58,44 42,44" fill="url(#hg-s)"/>\
<polygon points="30,80 70,80 50,60" fill="url(#hg-s)"/>\
<rect x="48" y="44" width="4" height="16" fill="#fbbf24" opacity="0.8"/>\
<path d="M34 20 Q36 44 40 60" fill="none" stroke="#fff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>\
</svg>';

/* ============ WILD ============ */
S.wild = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="wd-g" cx="0.5" cy="0.4" r="0.7">\
<stop offset="0" stop-color="#c4b5fd"/>\
<stop offset="0.6" stop-color="#7c3aed"/>\
<stop offset="1" stop-color="#4c1d95"/>\
</radialGradient>\
<linearGradient id="wd-gold" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fef9c3"/>\
<stop offset="1" stop-color="#d4af37"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="42" fill="url(#wd-g)" stroke="#d4af37" stroke-width="3"/>\
<circle cx="50" cy="50" r="36" fill="none" stroke="#fef9c3" stroke-width="1" opacity="0.5"/>\
<path d="M22 38 L30 72 L50 48 L70 72 L78 38 L66 38 L60 54 L50 38 L40 54 L34 38 Z" fill="url(#wd-gold)" stroke="#78350f" stroke-width="1.5" stroke-linejoin="round"/>\
<circle cx="34" cy="30" r="4" fill="#fff" opacity="0.6"/>\
</svg>';

/* ============ SCATTER（闪电）============ */
S.scatter = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="sc-g" cx="0.5" cy="0.5" r="0.6">\
<stop offset="0" stop-color="#fef3c7"/>\
<stop offset="0.5" stop-color="#fb923c"/>\
<stop offset="1" stop-color="#c2410c"/>\
</radialGradient>\
<linearGradient id="sc-bolt" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fef9c3"/>\
<stop offset="0.5" stop-color="#fbbf24"/>\
<stop offset="1" stop-color="#d97706"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="40" fill="url(#sc-g)" opacity="0.9"/>\
<circle cx="50" cy="50" r="40" fill="none" stroke="#fef3c7" stroke-width="2.5"/>\
<path d="M58 16 L28 56 L48 56 L38 86 L74 42 L52 42 Z" fill="url(#sc-bolt)" stroke="#78350f" stroke-width="2" stroke-linejoin="round"/>\
<path d="M52 22 L34 52 L46 52 Z" fill="#ffffff" opacity="0.7"/>\
</svg>';

/* ============ 导出 ============ */
window.ApexOlympusSymbols = {
  list: S,
  /* 按引擎 SYMBOLS 顺序返回 SVG */
  byIndex: function(idx){
    var keys = ['crown','red','purple','yellow','green','blue','goblet','hourglass','wild','scatter'];
    return S[keys[idx]] || '';
  }
};

})();
