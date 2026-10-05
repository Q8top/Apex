/* Apex Olympus 符号库 v3 —— 菱形钻石宝石（原版风格） */
(function(){
'use strict';

var S = {};

/* ============================================================
   皇冠（最高价值）
   ============================================================ */
S.crown = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="c-g1" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff7d6"/>\
<stop offset="0.25" stop-color="#fde68a"/>\
<stop offset="0.55" stop-color="#f4c430"/>\
<stop offset="0.85" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<linearGradient id="c-g2" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde68a"/>\
<stop offset="0.5" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#7a4a08"/>\
</linearGradient>\
<radialGradient id="c-red" cx="0.35" cy="0.3" r="0.7">\
<stop offset="0" stop-color="#fecaca"/>\
<stop offset="0.5" stop-color="#dc2626"/>\
<stop offset="1" stop-color="#7f1d1d"/>\
</radialGradient>\
<radialGradient id="c-blue" cx="0.35" cy="0.3" r="0.7">\
<stop offset="0" stop-color="#bfdbfe"/>\
<stop offset="0.5" stop-color="#2563eb"/>\
<stop offset="1" stop-color="#1e3a8a"/>\
</radialGradient>\
<radialGradient id="c-green" cx="0.35" cy="0.3" r="0.7">\
<stop offset="0" stop-color="#a7f3d0"/>\
<stop offset="0.5" stop-color="#059669"/>\
<stop offset="1" stop-color="#064e3b"/>\
</radialGradient>\
</defs>\
<path d="M10 32 L10 72 L90 72 L90 32 L72 48 L50 14 L28 48 Z" fill="url(#c-g1)" stroke="#6a3a08" stroke-width="1.8" stroke-linejoin="round"/>\
<path d="M10 32 L28 48 L50 14 L72 48 L90 32 L88 36 L72 52 L50 18 L28 52 L12 36 Z" fill="#fff7d6" opacity="0.65"/>\
<path d="M50 14 L28 48 L50 52 Z" fill="#fff7d6" opacity="0.35"/>\
<path d="M50 14 L72 48 L50 52 Z" fill="#6a3a08" opacity="0.4"/>\
<rect x="8" y="72" width="84" height="14" rx="3" fill="url(#c-g2)" stroke="#6a3a08" stroke-width="1.8"/>\
<rect x="11" y="75" width="78" height="2.5" fill="#fff7d6" opacity="0.65"/>\
<rect x="11" y="82" width="78" height="1.5" fill="#5a3a08" opacity="0.5"/>\
<circle cx="50" cy="14" r="5" fill="url(#c-red)" stroke="#6a3a08" stroke-width="1.2"/>\
<ellipse cx="48.5" cy="12.5" rx="1.5" ry="1" fill="#fff" opacity="0.85"/>\
<circle cx="28" cy="48" r="3.5" fill="url(#c-blue)" stroke="#6a3a08" stroke-width="1"/>\
<ellipse cx="27" cy="47" rx="1" ry="0.7" fill="#fff" opacity="0.75"/>\
<circle cx="72" cy="48" r="3.5" fill="url(#c-green)" stroke="#6a3a08" stroke-width="1"/>\
<ellipse cx="71" cy="47" rx="1" ry="0.7" fill="#fff" opacity="0.75"/>\
<circle cx="28" cy="80" r="3" fill="url(#c-red)" stroke="#5a3a08" stroke-width="0.9"/>\
<circle cx="50" cy="80" r="3" fill="url(#c-blue)" stroke="#5a3a08" stroke-width="0.9"/>\
<circle cx="72" cy="80" r="3" fill="url(#c-green)" stroke="#5a3a08" stroke-width="0.9"/>\
<path d="M14 36 L14 70 L22 70 L22 40 Z" fill="#fff" opacity="0.28"/>\
</svg>';

/* ============================================================
   菱形宝石（4 切面钻石）
   ============================================================ */
function gem(id, bright, mid, dark, deep, edge){
  return '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="' + id + '-a" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="' + bright + '"/>\
<stop offset="0.5" stop-color="' + mid + '"/>\
<stop offset="1" stop-color="' + deep + '"/>\
</linearGradient>\
<linearGradient id="' + id + '-b" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0" stop-color="' + mid + '"/>\
<stop offset="1" stop-color="' + dark + '"/>\
</linearGradient>\
</defs>\
<!-- 外轮廓：菱形 -->\
<path d="M50 6 L88 34 L88 66 L50 94 L12 66 L12 34 Z" fill="url(#' + id + '-a)" stroke="' + edge + '" stroke-width="2" stroke-linejoin="round"/>\
<!-- 上方亮面（切面 1）-->\
<path d="M50 6 L88 34 L50 42 L12 34 Z" fill="' + bright + '"/>\
<!-- 左切面（切面 2）-->\
<path d="M12 34 L50 42 L50 94 L12 66 Z" fill="' + mid + '"/>\
<!-- 右切面（切面 3）-->\
<path d="M88 34 L50 42 L50 94 L88 66 Z" fill="url(#' + id + '-b)" opacity="0.95"/>\
<!-- 内阴影 -->\
<path d="M50 42 L88 34 L88 66 L50 94 Z" fill="' + deep + '" opacity="0.15"/>\
<!-- 顶面高光 -->\
<path d="M50 6 L68 22 L50 28 L32 22 Z" fill="#ffffff" opacity="0.55"/>\
<!-- 左侧小反光 -->\
<path d="M12 34 L30 42 L14 52 Z" fill="#ffffff" opacity="0.3"/>\
<!-- 高光点 -->\
<circle cx="40" cy="20" r="3" fill="#ffffff" opacity="0.9"/>\
<circle cx="62" cy="60" r="2" fill="#ffffff" opacity="0.5"/>\
<circle cx="28" cy="55" r="1.5" fill="#ffffff" opacity="0.4"/>\
<!-- 边线高光 -->\
<path d="M12 34 L50 6 L88 34" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>\
</svg>';
}

S.red    = gem('rd', '#fecaca', '#f87171', '#b91c1c', '#7f1d1d', '#7f1d1d');
S.purple = gem('pp', '#e9d5ff', '#c084fc', '#7c3aed', '#5b21b6', '#581c87');
S.yellow = gem('yl', '#fef9c3', '#fde047', '#eab308', '#a16207', '#713f12');
S.green  = gem('gr', '#a7f3d0', '#34d399', '#10b981', '#047857', '#064e3b');
S.blue   = gem('bl', '#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a');

/* ============================================================
   圣杯
   ============================================================ */
S.goblet = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="gb-b" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#6a3a08"/>\
<stop offset="0.15" stop-color="#d4a017"/>\
<stop offset="0.4" stop-color="#fff7d6"/>\
<stop offset="0.55" stop-color="#f4c430"/>\
<stop offset="0.8" stop-color="#d4a017"/>\
<stop offset="1" stop-color="#6a3a08"/>\
</linearGradient>\
<linearGradient id="gb-s" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#7a4a08"/>\
</linearGradient>\
<linearGradient id="gb-base" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde68a"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<radialGradient id="gb-red" cx="0.35" cy="0.3" r="0.7">\
<stop offset="0" stop-color="#fca5a5"/>\
<stop offset="0.5" stop-color="#dc2626"/>\
<stop offset="1" stop-color="#7f1d1d"/>\
</radialGradient>\
</defs>\
<ellipse cx="50" cy="92" rx="22" ry="3.5" fill="#5a3a08"/>\
<ellipse cx="50" cy="90" rx="22" ry="3.5" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.2"/>\
<rect x="38" y="84" width="24" height="6" rx="2" fill="url(#gb-s)" stroke="#5a3a08" stroke-width="1.2"/>\
<rect x="46" y="62" width="8" height="24" fill="url(#gb-s)" stroke="#5a3a08" stroke-width="1.2"/>\
<ellipse cx="50" cy="62" rx="6" ry="2" fill="#fde68a" stroke="#5a3a08" stroke-width="0.8"/>\
<path d="M22 16 L78 16 L74 46 Q70 62 50 64 Q30 62 26 46 Z" fill="url(#gb-b)" stroke="#5a3a08" stroke-width="1.8" stroke-linejoin="round"/>\
<ellipse cx="50" cy="16" rx="28" ry="5" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.8"/>\
<ellipse cx="50" cy="16" rx="22" ry="3" fill="#5a3a08" opacity="0.8"/>\
<ellipse cx="50" cy="15" rx="20" ry="2" fill="#3a2408" opacity="0.95"/>\
<path d="M30 22 Q30 44 38 58" fill="none" stroke="#fff7d6" stroke-width="2.5" opacity="0.85" stroke-linecap="round"/>\
<circle cx="50" cy="36" r="5" fill="url(#gb-red)" stroke="#5a3a08" stroke-width="1"/>\
<ellipse cx="48.5" cy="34.5" rx="1.5" ry="1" fill="#fff" opacity="0.85"/>\
<path d="M24 16 Q50 22 76 16" fill="none" stroke="#fff7d6" stroke-width="0.8" opacity="0.6"/>\
</svg>';

/* ============================================================
   沙漏
   ============================================================ */
S.hourglass = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<linearGradient id="hg-w" x1="0" y1="0" x2="1" y2="0">\
<stop offset="0" stop-color="#4a2a08"/>\
<stop offset="0.25" stop-color="#8a5a10"/>\
<stop offset="0.5" stop-color="#d4a017"/>\
<stop offset="0.75" stop-color="#8a5a10"/>\
<stop offset="1" stop-color="#4a2a08"/>\
</linearGradient>\
<linearGradient id="hg-s" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fde047"/>\
<stop offset="1" stop-color="#b45309"/>\
</linearGradient>\
<linearGradient id="hg-gl" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>\
<stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/>\
</linearGradient>\
</defs>\
<rect x="10" y="5" width="80" height="11" rx="3" fill="url(#hg-w)" stroke="#2a1a04" stroke-width="1.5"/>\
<rect x="13" y="7.5" width="74" height="2" fill="#fff7d6" opacity="0.55"/>\
<rect x="10" y="84" width="80" height="11" rx="3" fill="url(#hg-w)" stroke="#2a1a04" stroke-width="1.5"/>\
<rect x="13" y="86.5" width="74" height="2" fill="#fff7d6" opacity="0.55"/>\
<path d="M22 16 L78 16 L62 42 L62 58 L78 84 L22 84 L38 58 L38 42 Z" fill="url(#hg-gl)" stroke="#7a4a08" stroke-width="1.8" stroke-linejoin="round"/>\
<path d="M36 20 L64 20 L57 42 L43 42 Z" fill="url(#hg-s)"/>\
<path d="M36 20 L50 20 L46 42 L43 42 Z" fill="#fde047" opacity="0.6"/>\
<path d="M32 80 L68 80 L50 58 Z" fill="url(#hg-s)"/>\
<path d="M42 80 L58 80 L50 60 Z" fill="#fde047" opacity="0.6"/>\
<rect x="48.5" y="42" width="3" height="16" fill="#fbbf24" opacity="0.85"/>\
<path d="M28 20 Q30 42 34 60" fill="none" stroke="#fff" stroke-width="1.8" opacity="0.65" stroke-linecap="round"/>\
</svg>';

/* ============================================================
   WILD
   ============================================================ */
S.wild = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="wd-b" cx="0.5" cy="0.35" r="0.75">\
<stop offset="0" stop-color="#c4b5fd"/>\
<stop offset="0.4" stop-color="#8b5cf6"/>\
<stop offset="0.8" stop-color="#6d28d9"/>\
<stop offset="1" stop-color="#4c1d95"/>\
</radialGradient>\
<linearGradient id="wd-r" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff7d6"/>\
<stop offset="0.5" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#8a5a10"/>\
</linearGradient>\
<linearGradient id="wd-w" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#fff7d6"/>\
<stop offset="0.4" stop-color="#f4c430"/>\
<stop offset="1" stop-color="#a06008"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="46" fill="#3a1a6a"/>\
<circle cx="50" cy="50" r="44" fill="url(#wd-b)" stroke="url(#wd-r)" stroke-width="3"/>\
<circle cx="50" cy="50" r="38" fill="none" stroke="#fef9c3" stroke-width="1.2" opacity="0.7"/>\
<ellipse cx="38" cy="28" rx="14" ry="8" fill="#fff" opacity="0.28"/>\
<path d="M20 36 L28 68 L42 50 L50 74 L58 50 L72 68 L80 36 L70 36 L66 50 L58 38 L50 52 L42 38 L34 50 L30 36 Z" fill="url(#wd-w)" stroke="#7a4a08" stroke-width="1.5" stroke-linejoin="round"/>\
<path d="M20 36 L28 68 L42 50 L50 74 Z" fill="#fff7d6" opacity="0.4"/>\
</svg>';

/* ============================================================
   SCATTER（闪电）
   ============================================================ */
S.scatter = '\
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
<defs>\
<radialGradient id="sc-b" cx="0.5" cy="0.5" r="0.5">\
<stop offset="0" stop-color="#fef3c7"/>\
<stop offset="0.45" stop-color="#fb923c"/>\
<stop offset="0.8" stop-color="#c2410c"/>\
<stop offset="1" stop-color="#7c2d12"/>\
</radialGradient>\
<linearGradient id="sc-l" x1="0" y1="0" x2="0" y2="1">\
<stop offset="0" stop-color="#ffffff"/>\
<stop offset="0.3" stop-color="#fef9c3"/>\
<stop offset="0.7" stop-color="#fbbf24"/>\
<stop offset="1" stop-color="#d97706"/>\
</linearGradient>\
</defs>\
<circle cx="50" cy="50" r="46" fill="#7c2d12" opacity="0.4"/>\
<circle cx="50" cy="50" r="42" fill="url(#sc-b)" stroke="#fde047" stroke-width="3"/>\
<circle cx="50" cy="50" r="36" fill="none" stroke="#fef3c7" stroke-width="1.2" opacity="0.85"/>\
<path d="M60 14 L28 54 L46 54 L38 86 L74 44 L54 44 L62 14 Z" fill="url(#sc-l)" stroke="#7a4a08" stroke-width="2" stroke-linejoin="round"/>\
<path d="M60 14 L46 36 L54 36 L46 54 Z" fill="#ffffff" opacity="0.85"/>\
<circle cx="72" cy="26" r="2.5" fill="#fef9c3" opacity="0.85"/>\
<circle cx="80" cy="52" r="1.8" fill="#fef9c3" opacity="0.7"/>\
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
