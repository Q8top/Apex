/* Apex Olympus 符号库 v2 —— 顶级 SVG
 * 每符号：多层渐变 + 切面 + 金属高光 + 内阴影
 */
(function(){
'use strict';

var S = {};

/* ============================================================
   皇冠（最高价值）
   ============================================================ */
S.crown = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="cr-m1" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff8dc"/>\
<stop offset="0.2" stop-color="#fde68a"/>\
<stop offset="0.5" stop-color="#f4c430"/>\
<stop offset="0.8" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<linearGradient id="cr-m2" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#8a5a10"/>\
<stop offset="0.2" stop-color="#f4c430"/>\
<stop offset="0.5" stop-color="#fff8dc"/>\
<stop offset="0.8" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<linearGradient id="cr-base" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde68a"/>\
<stop offset="0.5" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#7a4a08"/>\
</linearGradient>\
<radialGradient id="cr-red" cx="0.35" cy="0.3" r="0.75">\
<stop offset="0" stop-color="#fca5a5"/>\
<stop offset="0.4" stop-color="#dc2626"/>\
<stop offset="1" stop-color="#7f1d1d"/>\
</radialGradient>\
<radialGradient id="cr-blue" cx="0.35" cy="0.3" r="0.75">\
<stop offset="0" stop-color="#bfdbfe"/>\
<stop offset="0.4" stop-color="#2563eb"/>\
<stop offset="1" stop-color="#1e3a8a"/>\
</radialGradient>\
<radialGradient id="cr-green" cx="0.35" cy="0.3" r="0.75">\
<stop offset="0" stop-color="#a7f3d0"/>\
<stop offset="0.4" stop-color="#059669"/>\
<stop offset="1" stop-color="#064e3b"/>\
</radialGradient>\
</defs>\
<path d="M8 30 L8 72 L92 72 L92 30 L76 46 L50 12 L24 46 Z" fill="url(#cr-m1)" stroke="#7a4a08" stroke-width="1.8" stroke-linejoin="round"/>\
<path d="M8 30 L24 46 L50 12 L76 46 L92 30 L90 34 L76 50 L50 16 L24 50 L10 34 Z" fill="#fff8dc" opacity="0.75"/>\
<path d="M50 12 L24 46 L50 50 Z" fill="#fff8dc" opacity="0.25"/>\
<path d="M50 12 L76 46 L50 50 Z" fill="#7a4a08" opacity="0.35"/>\
<rect x="6" y="72" width="88" height="16" rx="3" fill="url(#cr-base)" stroke="#7a4a08" stroke-width="1.8"/>\
<rect x="9" y="75" width="82" height="2.5" fill="#fff8dc" opacity="0.7"/>\
<rect x="9" y="84" width="82" height="1.5" fill="#5a3a08" opacity="0.5"/>\
<circle cx="50" cy="12" r="5" fill="url(#cr-red)" stroke="#7a4a08" stroke-width="1.2"/>\
<ellipse cx="48.5" cy="10.5" rx="1.5" ry="1" fill="#fff" opacity="0.85"/>\
<circle cx="24" cy="46" r="3.5" fill="url(#cr-blue)" stroke="#7a4a08" stroke-width="1"/>\
<ellipse cx="23" cy="45" rx="1" ry="0.7" fill="#fff" opacity="0.75"/>\
<circle cx="76" cy="46" r="3.5" fill="url(#cr-green)" stroke="#7a4a08" stroke-width="1"/>\
<ellipse cx="75" cy="45" rx="1" ry="0.7" fill="#fff" opacity="0.75"/>\
<circle cx="30" cy="80" r="3.2" fill="url(#cr-red)" stroke="#5a3a08" stroke-width="0.9"/>\
<circle cx="29" cy="79" r="1" fill="#fff" opacity="0.7"/>\
<circle cx="50" cy="80" r="3.2" fill="url(#cr-blue)" stroke="#5a3a08" stroke-width="0.9"/>\
<circle cx="49" cy="79" r="1" fill="#fff" opacity="0.7"/>\
<circle cx="70" cy="80" r="3.2" fill="url(#cr-green)" stroke="#5a3a08" stroke-width="0.9"/>\
<circle cx="69" cy="79" r="1" fill="#fff" opacity="0.7"/>\
<path d="M12 34 L12 70 L20 70 L20 38 Z" fill="#fff" opacity="0.3"/>\
</svg>';

/* ============================================================
   通用宝石（切面 + 高光）
   ============================================================ */
function gem(id, top, upper, mid, lower, edge){
  return '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="' + id + '-a" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="' + top + '"/>\
<stop offset="0.5" stop-color="' + upper + '"/>\
<stop offset="1" stop-color="' + lower + '"/>\
</linearGradient>\
<linearGradient id="' + id + '-b" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0" stop-color="' + upper + '"/>\
<stop offset="1" stop-color="' + lower + '"/>\
</linearGradient>\
</defs>\
<path d="M50 6 L86 30 L86 70 L50 94 L14 70 L14 30 Z" fill="url(#' + id + '-a)" stroke="' + edge + '" stroke-width="2" stroke-linejoin="round"/>\
<path d="M50 6 L86 30 L50 50 L14 30 Z" fill="' + top + '"/>\
<path d="M14 30 L50 50 L50 94 L14 70 Z" fill="' + upper + '"/>\
<path d="M50 50 L86 30 L86 70 L50 94 Z" fill="url(#' + id + '-b)" opacity="0.85"/>\
<path d="M50 6 L68 24 L50 30 L32 24 Z" fill="#ffffff" opacity="0.55"/>\
<path d="M14 30 L32 42 L14 50 Z" fill="#ffffff" opacity="0.28"/>\
<path d="M50 50 L68 56 L50 68 L32 56 Z" fill="' + mid + '" opacity="0.35"/>\
<circle cx="38" cy="20" r="3.5" fill="#ffffff" opacity="0.9"/>\
<circle cx="64" cy="66" r="2" fill="#ffffff" opacity="0.55"/>\
<circle cx="26" cy="42" r="1.5" fill="#ffffff" opacity="0.45"/>\
<path d="M14 30 L50 6 L86 30" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.5"/>\
</svg>';
}

S.red    = gem('rd', '#fecaca', '#f87171', '#ef4444', '#991b1b', '#7f1d1d');
S.purple = gem('pp', '#e9d5ff', '#c084fc', '#a855f7', '#6b21a8', '#581c87');
S.yellow = gem('yl', '#fef9c3', '#fde047', '#eab308', '#854d0e', '#713f12');
S.green  = gem('gr', '#a7f3d0', '#6ee7b7', '#10b981', '#065f46', '#064e3b');
S.blue   = gem('bl', '#bfdbfe', '#93c5fd', '#3b82f6', '#1e40af', '#1e3a8a');

/* ============================================================
   圣杯
   ============================================================ */
S.goblet = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="gb-body" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#7a4a08"/>\
<stop offset="0.15" stop-color="#d4a017"/>\
<stop offset="0.35" stop-color="#fff8dc"/>\
<stop offset="0.5" stop-color="#f4c430"/>\
<stop offset="0.75" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#7a4a08"/>\
</linearGradient>\
<linearGradient id="gb-stem" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#f4c430"/>\
<stop offset="0.5" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#7a4a08"/>\
</linearGradient>\
<linearGradient id="gb-base" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde68a"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<radialGradient id="gb-red" cx="0.35" cy="0.3" r="0.75">\
<stop offset="0" stop-color="#fca5a5"/>\
<stop offset="0.4" stop-color="#dc2626"/>\
<stop offset="1" stop-color="#7f1d1d"/>\
</radialGradient>\
</defs>\
<ellipse cx="50" cy="92" rx="24" ry="4" fill="#5a3a08"/>\
<ellipse cx="50" cy="90" rx="24" ry="4" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.2"/>\
<ellipse cx="50" cy="89" rx="18" ry="2.5" fill="#fff8dc" opacity="0.35"/>\
<rect x="38" y="84" width="24" height="6" rx="2" fill="url(#gb-stem)" stroke="#5a3a08" stroke-width="1.2"/>\
<rect x="46" y="62" width="8" height="24" fill="url(#gb-stem)" stroke="#5a3a08" stroke-width="1.2"/>\
<ellipse cx="50" cy="62" rx="6" ry="2" fill="#fde68a" stroke="#5a3a08" stroke-width="0.8"/>\
<path d="M20 16 L80 16 L76 46 Q72 62 50 64 Q28 62 24 46 Z" fill="url(#gb-body)" stroke="#5a3a08" stroke-width="1.8" stroke-linejoin="round"/>\
<ellipse cx="50" cy="16" rx="30" ry="5.5" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.8"/>\
<ellipse cx="50" cy="16" rx="24" ry="3.5" fill="#5a3a08" opacity="0.75"/>\
<ellipse cx="50" cy="15" rx="22" ry="2.5" fill="#3a2408" opacity="0.9"/>\
<path d="M28 22 Q28 44 36 58" fill="none" stroke="#fff8dc" stroke-width="2.2" opacity="0.8" stroke-linecap="round"/>\
<path d="M32 24 Q33 38 38 50" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>\
<circle cx="50" cy="36" r="5" fill="url(#gb-red)" stroke="#5a3a08" stroke-width="1"/>\
<ellipse cx="48.5" cy="34.5" rx="1.5" ry="1" fill="#fff" opacity="0.85"/>\
<path d="M22 16 Q50 22 78 16" fill="none" stroke="#fff8dc" stroke-width="0.8" opacity="0.6"/>\
</svg>';

/* ============================================================
   沙漏
   ============================================================ */
S.hourglass = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="hg-wood" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#4a2a08"/>\
<stop offset="0.2" stop-color="#8a5a10"/>\
<stop offset="0.5" stop-color="#d4a017"/>\
<stop offset="0.8" stop-color="#8a5a10"/>\
<stop offset="1" stop-color="#4a2a08"/>\
</linearGradient>\
<linearGradient id="hg-sand" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde047"/>\
<stop offset="1" stop-color="#b45309"/>\
</linearGradient>\
<linearGradient id="hg-glass" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>\
<stop offset="1" stop-color="#ffffff" stop-opacity="0.15"/>\
</linearGradient>\
</defs>\
<rect x="10" y="5" width="80" height="11" rx="3" fill="url(#hg-wood)" stroke="#2a1a04" stroke-width="1.5"/>\
<rect x="13" y="7.5" width="74" height="2" fill="#fff8dc" opacity="0.5"/>\
<rect x="13" y="12" width="74" height="1.2" fill="#2a1a04" opacity="0.7"/>\
<rect x="10" y="84" width="80" height="11" rx="3" fill="url(#hg-wood)" stroke="#2a1a04" stroke-width="1.5"/>\
<rect x="13" y="86.5" width="74" height="2" fill="#fff8dc" opacity="0.5"/>\
<path d="M22 16 L78 16 L62 42 L62 58 L78 84 L22 84 L38 58 L38 42 Z" fill="url(#hg-glass)" stroke="#7a4a08" stroke-width="1.8" stroke-linejoin="round"/>\
<path d="M34 20 L66 20 L58 42 L42 42 Z" fill="url(#hg-sand)"/>\
<path d="M34 20 L50 20 L46 42 L42 42 Z" fill="#fde047" opacity="0.6"/>\
<path d="M30 80 L70 80 L50 58 Z" fill="url(#hg-sand)"/>\
<path d="M42 80 L58 80 L50 60 Z" fill="#fde047" opacity="0.6"/>\
<rect x="48" y="42" width="4" height="16" fill="#fbbf24" opacity="0.85"/>\
<rect x="48.7" y="42" width="1" height="16" fill="#fff" opacity="0.6"/>\
<path d="M28 20 Q30 42 34 60" fill="none" stroke="#fff" stroke-width="1.8" opacity="0.7" stroke-linecap="round"/>\
<path d="M30 22 L34 22" stroke="#fff8dc" stroke-width="1.2" opacity="0.6"/>\
<path d="M25 82 L75 82" stroke="#fff8dc" stroke-width="0.8" opacity="0.5"/>\
</svg>';

/* ============================================================
   WILD（紫色金属圆盘 + 金色 W）
   ============================================================ */
S.wild = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="wd-bg" cx="0.5" cy="0.35" r="0.75">\
<stop offset="0" stop-color="#c4b5fd"/>\
<stop offset="0.4" stop-color="#8b5cf6"/>\
<stop offset="0.8" stop-color="#6d28d9"/>\
<stop offset="1" stop-color="#4c1d95"/>\
</radialGradient>\
<linearGradient id="wd-ring" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff8dc"/>\
<stop offset="0.5" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<linearGradient id="wd-w" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff8dc"/>\
<stop offset="0.4" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#a06008"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="46" fill="#3a1a6a"/>\
<circle cx="50" cy="50" r="44" fill="url(#wd-bg)" stroke="url(#wd-ring)" stroke-width="3"/>\
<circle cx="50" cy="50" r="38" fill="none" stroke="#fef9c3" stroke-width="1.2" opacity="0.7"/>\
<circle cx="50" cy="50" r="36" fill="none" stroke="#4c1d95" stroke-width="0.8" opacity="0.5"/>\
<ellipse cx="38" cy="28" rx="14" ry="8" fill="#fff" opacity="0.28"/>\
<path d="M18 36 L26 68 L40 50 L50 74 L60 50 L74 68 L82 36 L72 36 L68 50 L60 38 L52 52 L44 38 L36 50 L32 36 Z" fill="url(#wd-w)" stroke="#7a4a08" stroke-width="1.5" stroke-linejoin="round"/>\
<path d="M18 36 L26 68 L40 50 L50 74 Z" fill="#fff8dc" opacity="0.35"/>\
<circle cx="26" cy="68" r="3" fill="#fef9c3" opacity="0.6"/>\
<circle cx="50" cy="74" r="3" fill="#fef9c3" opacity="0.6"/>\
<circle cx="74" cy="68" r="3" fill="#fef9c3" opacity="0.6"/>\
</svg>';

/* ============================================================
   SCATTER（闪电 + 光晕）
   ============================================================ */
S.scatter = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="sc-bg" cx="0.5" cy="0.5" r="0.5">\
<stop offset="0" stop-color="#fef3c7"/>\
<stop offset="0.4" stop-color="#fb923c"/>\
<stop offset="0.75" stop-color="#c2410c"/>\
<stop offset="1" stop-color="#7c2d12"/>\
</radialGradient>\
<linearGradient id="sc-bolt" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#ffffff"/>\
<stop offset="0.25" stop-color="#fef9c3"/>\
<stop offset="0.6" stop-color="#fbbf24"/>\
<stop offset="1" stop-color="#d97706"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="46" fill="#7c2d12" opacity="0.5"/>\
<circle cx="50" cy="50" r="42" fill="url(#sc-bg)" stroke="#fde047" stroke-width="3"/>\
<circle cx="50" cy="50" r="36" fill="none" stroke="#fef3c7" stroke-width="1.2" opacity="0.8"/>\
<path d="M60 12 L26 54 L46 54 L36 88 L76 42 L54 42 L64 12 Z" fill="url(#sc-bolt)" stroke="#7a4a08" stroke-width="2" stroke-linejoin="round"/>\
<path d="M60 12 L44 36 L54 36 L46 54 Z" fill="#ffffff" opacity="0.85"/>\
<circle cx="72" cy="24" r="3" fill="#fef9c3" opacity="0.85"/>\
<circle cx="82" cy="50" r="2" fill="#fef9c3" opacity="0.7"/>\
<circle cx="24" cy="76" r="2.5" fill="#fef9c3" opacity="0.7"/>\
</svg>';

/* ============ 导出 ============ */
window.ApexOlympusSymbols = {
  list: S,
  byIndex: function(idx){
    var keys = ['crown','red','purple','yellow','green','blue','goblet','hourglass','wild','scatter'];
    return S[keys[idx]] || '';
  }
};

})();
