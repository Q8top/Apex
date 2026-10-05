/* Apex Olympus 符号库 v3 —— 菱形钻石宝石（原版风格） */
(function(){
'use strict';

var S = {};

/* ============================================================
   皇冠（最高价值）
   ============================================================ */
S.crown = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="c-m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7d6"/><stop offset="0.3" stop-color="#fde68a"/><stop offset="0.6" stop-color="#e0a800"/><stop offset="0.9" stop-color="#8a5a10"/><stop offset="1" stop-color="#5a3a08"/></linearGradient><linearGradient id="c-m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="0.5" stop-color="#d4a017"/><stop offset="1" stop-color="#6a3a08"/></linearGradient><radialGradient id="c-rd" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#fecaca"/><stop offset="0.45" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/></radialGradient><radialGradient id="c-bl" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#bfdbfe"/><stop offset="0.45" stop-color="#2563eb"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient><radialGradient id="c-gn" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#a7f3d0"/><stop offset="0.45" stop-color="#059669"/><stop offset="1" stop-color="#064e3b"/></radialGradient></defs><!-- 3 个尖顶 --><path d="M14 26 L22 16 L30 42 Z" fill="url(#c-m1)" stroke="#5a3a08" stroke-width="1.5" stroke-linejoin="round"/><path d="M42 14 L50 4 L58 14 L50 42 Z" fill="url(#c-m1)" stroke="#5a3a08" stroke-width="1.5" stroke-linejoin="round"/><path d="M70 26 L78 16 L86 26 L70 42 Z" fill="url(#c-m1)" stroke="#5a3a08" stroke-width="1.5" stroke-linejoin="round"/><!-- 主体 --><path d="M14 26 L86 26 L86 72 L14 72 Z" fill="url(#c-m1)" stroke="#5a3a08" stroke-width="1.8"/><!-- 主面高光 --><path d="M14 26 L86 26 L86 34 L14 34 Z" fill="#fff7d6" opacity="0.6"/><!-- 左暗面 --><path d="M14 34 L30 34 L30 72 L14 72 Z" fill="#5a3a08" opacity="0.25"/><!-- 右暗面 --><path d="M70 34 L86 34 L86 72 L70 72 Z" fill="#5a3a08" opacity="0.3"/><!-- 底边 --><rect x="10" y="72" width="80" height="14" rx="3" fill="url(#c-m2)" stroke="#5a3a08" stroke-width="1.8"/><rect x="13" y="75" width="74" height="2.5" fill="#fff7d6" opacity="0.7"/><rect x="13" y="82" width="74" height="1.5" fill="#3a2408" opacity="0.5"/><!-- 3 颗顶宝石 --><circle cx="50" cy="14" r="5" fill="url(#c-rd)" stroke="#5a3a08" stroke-width="1.2"/><ellipse cx="48.5" cy="12.5" rx="1.5" ry="1" fill="#fff" opacity="0.85"/><circle cx="22" cy="20" r="3.2" fill="url(#c-bl)" stroke="#5a3a08" stroke-width="1"/><circle cx="78" cy="20" r="3.2" fill="url(#c-gn)" stroke="#5a3a08" stroke-width="1"/><!-- 底边 3 宝石 --><circle cx="30" cy="79" r="3.5" fill="url(#c-rd)" stroke="#3a2408" stroke-width="1"/><circle cx="50" cy="79" r="3.5" fill="url(#c-bl)" stroke="#3a2408" stroke-width="1"/><circle cx="70" cy="79" r="3.5" fill="url(#c-gn)" stroke="#3a2408" stroke-width="1"/></svg>';

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

S.red = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rd-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fecaca"/><stop offset="0.5" stop-color="#f87171"/><stop offset="1" stop-color="#b91c1c"/></linearGradient><linearGradient id="rd-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient><linearGradient id="rd-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b91c1c"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient></defs><!-- 外轮廓：八边形钻石 --><path d="M30 20 L70 20 L88 42 L78 82 L50 94 L22 82 L12 42 Z"      fill="url(#rd-g1)" stroke="#7f1d1d" stroke-width="1.5" stroke-linejoin="round"/><!-- 冠部：左右 2 大三角切面 --><path d="M30 20 L12 42 L50 46 Z" fill="#fca5a5" opacity="0.9"/><path d="M70 20 L88 42 L50 46 Z" fill="#b91c1c" opacity="0.85"/><!-- 台面（顶部小矩形，最亮）--><path d="M38 22 L62 22 L66 34 L34 34 Z" fill="#ffffff" opacity="0.85"/><!-- 冠部前切面（中央三角）--><path d="M34 34 L66 34 L50 46 Z" fill="#fecaca" opacity="0.95"/><!-- 腰线分割 --><path d="M12 42 L88 42" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/><!-- 亭部：左右 2 大三角 + 前方 2 中三角 --><path d="M12 42 L22 82 L50 46 Z" fill="#fecaca" opacity="0.7"/><path d="M88 42 L78 82 L50 46 Z" fill="#7f1d1d" opacity="0.9"/><path d="M50 46 L22 82 L50 94 Z" fill="#f87171" opacity="0.85"/><path d="M50 46 L78 82 L50 94 Z" fill="#b91c1c" opacity="0.75"/><!-- 中心高光点 --><circle cx="42" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/><circle cx="58" cy="62" r="1.8" fill="#ffffff" opacity="0.55"/><circle cx="34" cy="56" r="1.5" fill="#ffffff" opacity="0.45"/></svg>';
S.purple = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pp-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="0.5" stop-color="#c084fc"/><stop offset="1" stop-color="#7c3aed"/></linearGradient><linearGradient id="pp-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c084fc"/><stop offset="1" stop-color="#5b21b6"/></linearGradient><linearGradient id="pp-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#5b21b6"/></linearGradient></defs><!-- 外轮廓：八边形钻石 --><path d="M30 20 L70 20 L88 42 L78 82 L50 94 L22 82 L12 42 Z"      fill="url(#pp-g1)" stroke="#581c87" stroke-width="1.5" stroke-linejoin="round"/><!-- 冠部：左右 2 大三角切面 --><path d="M30 20 L12 42 L50 46 Z" fill="#d8b4fe" opacity="0.9"/><path d="M70 20 L88 42 L50 46 Z" fill="#7c3aed" opacity="0.85"/><!-- 台面（顶部小矩形，最亮）--><path d="M38 22 L62 22 L66 34 L34 34 Z" fill="#ffffff" opacity="0.85"/><!-- 冠部前切面（中央三角）--><path d="M34 34 L66 34 L50 46 Z" fill="#e9d5ff" opacity="0.95"/><!-- 腰线分割 --><path d="M12 42 L88 42" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/><!-- 亭部：左右 2 大三角 + 前方 2 中三角 --><path d="M12 42 L22 82 L50 46 Z" fill="#e9d5ff" opacity="0.7"/><path d="M88 42 L78 82 L50 46 Z" fill="#5b21b6" opacity="0.9"/><path d="M50 46 L22 82 L50 94 Z" fill="#c084fc" opacity="0.85"/><path d="M50 46 L78 82 L50 94 Z" fill="#7c3aed" opacity="0.75"/><!-- 中心高光点 --><circle cx="42" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/><circle cx="58" cy="62" r="1.8" fill="#ffffff" opacity="0.55"/><circle cx="34" cy="56" r="1.5" fill="#ffffff" opacity="0.45"/></svg>';
S.yellow = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="yl-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset="0.5" stop-color="#fde047"/><stop offset="1" stop-color="#eab308"/></linearGradient><linearGradient id="yl-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#a16207"/></linearGradient><linearGradient id="yl-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eab308"/><stop offset="1" stop-color="#a16207"/></linearGradient></defs><!-- 外轮廓：八边形钻石 --><path d="M30 20 L70 20 L88 42 L78 82 L50 94 L22 82 L12 42 Z"      fill="url(#yl-g1)" stroke="#713f12" stroke-width="1.5" stroke-linejoin="round"/><!-- 冠部：左右 2 大三角切面 --><path d="M30 20 L12 42 L50 46 Z" fill="#fef08a" opacity="0.9"/><path d="M70 20 L88 42 L50 46 Z" fill="#eab308" opacity="0.85"/><!-- 台面（顶部小矩形，最亮）--><path d="M38 22 L62 22 L66 34 L34 34 Z" fill="#ffffff" opacity="0.85"/><!-- 冠部前切面（中央三角）--><path d="M34 34 L66 34 L50 46 Z" fill="#fef9c3" opacity="0.95"/><!-- 腰线分割 --><path d="M12 42 L88 42" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/><!-- 亭部：左右 2 大三角 + 前方 2 中三角 --><path d="M12 42 L22 82 L50 46 Z" fill="#fef9c3" opacity="0.7"/><path d="M88 42 L78 82 L50 46 Z" fill="#a16207" opacity="0.9"/><path d="M50 46 L22 82 L50 94 Z" fill="#fde047" opacity="0.85"/><path d="M50 46 L78 82 L50 94 Z" fill="#eab308" opacity="0.75"/><!-- 中心高光点 --><circle cx="42" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/><circle cx="58" cy="62" r="1.8" fill="#ffffff" opacity="0.55"/><circle cx="34" cy="56" r="1.5" fill="#ffffff" opacity="0.45"/></svg>';
S.green = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gr-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="0.5" stop-color="#34d399"/><stop offset="1" stop-color="#10b981"/></linearGradient><linearGradient id="gr-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#047857"/></linearGradient><linearGradient id="gr-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#047857"/></linearGradient></defs><!-- 外轮廓：八边形钻石 --><path d="M30 20 L70 20 L88 42 L78 82 L50 94 L22 82 L12 42 Z"      fill="url(#gr-g1)" stroke="#064e3b" stroke-width="1.5" stroke-linejoin="round"/><!-- 冠部：左右 2 大三角切面 --><path d="M30 20 L12 42 L50 46 Z" fill="#6ee7b7" opacity="0.9"/><path d="M70 20 L88 42 L50 46 Z" fill="#10b981" opacity="0.85"/><!-- 台面（顶部小矩形，最亮）--><path d="M38 22 L62 22 L66 34 L34 34 Z" fill="#ffffff" opacity="0.85"/><!-- 冠部前切面（中央三角）--><path d="M34 34 L66 34 L50 46 Z" fill="#a7f3d0" opacity="0.95"/><!-- 腰线分割 --><path d="M12 42 L88 42" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/><!-- 亭部：左右 2 大三角 + 前方 2 中三角 --><path d="M12 42 L22 82 L50 46 Z" fill="#a7f3d0" opacity="0.7"/><path d="M88 42 L78 82 L50 46 Z" fill="#047857" opacity="0.9"/><path d="M50 46 L22 82 L50 94 Z" fill="#34d399" opacity="0.85"/><path d="M50 46 L78 82 L50 94 Z" fill="#10b981" opacity="0.75"/><!-- 中心高光点 --><circle cx="42" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/><circle cx="58" cy="62" r="1.8" fill="#ffffff" opacity="0.55"/><circle cx="34" cy="56" r="1.5" fill="#ffffff" opacity="0.45"/></svg>';
S.blue = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bl-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfdbfe"/><stop offset="0.5" stop-color="#60a5fa"/><stop offset="1" stop-color="#3b82f6"/></linearGradient><linearGradient id="bl-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient><linearGradient id="bl-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><!-- 外轮廓：八边形钻石 --><path d="M30 20 L70 20 L88 42 L78 82 L50 94 L22 82 L12 42 Z"      fill="url(#bl-g1)" stroke="#1e3a8a" stroke-width="1.5" stroke-linejoin="round"/><!-- 冠部：左右 2 大三角切面 --><path d="M30 20 L12 42 L50 46 Z" fill="#93c5fd" opacity="0.9"/><path d="M70 20 L88 42 L50 46 Z" fill="#3b82f6" opacity="0.85"/><!-- 台面（顶部小矩形，最亮）--><path d="M38 22 L62 22 L66 34 L34 34 Z" fill="#ffffff" opacity="0.85"/><!-- 冠部前切面（中央三角）--><path d="M34 34 L66 34 L50 46 Z" fill="#bfdbfe" opacity="0.95"/><!-- 腰线分割 --><path d="M12 42 L88 42" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/><!-- 亭部：左右 2 大三角 + 前方 2 中三角 --><path d="M12 42 L22 82 L50 46 Z" fill="#bfdbfe" opacity="0.7"/><path d="M88 42 L78 82 L50 46 Z" fill="#1d4ed8" opacity="0.9"/><path d="M50 46 L22 82 L50 94 Z" fill="#60a5fa" opacity="0.85"/><path d="M50 46 L78 82 L50 94 Z" fill="#3b82f6" opacity="0.75"/><!-- 中心高光点 --><circle cx="42" cy="30" r="2.5" fill="#ffffff" opacity="0.95"/><circle cx="58" cy="62" r="1.8" fill="#ffffff" opacity="0.55"/><circle cx="34" cy="56" r="1.5" fill="#ffffff" opacity="0.45"/></svg>';

/* ============================================================
   圣杯
   ============================================================ */
S.goblet = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gb-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a08"/><stop offset="0.2" stop-color="#d4a017"/><stop offset="0.45" stop-color="#fff7d6"/><stop offset="0.55" stop-color="#fde68a"/><stop offset="0.8" stop-color="#d4a017"/><stop offset="1" stop-color="#5a3a08"/></linearGradient><linearGradient id="gb-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c430"/><stop offset="1" stop-color="#6a3a08"/></linearGradient><linearGradient id="gb-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#8a5a10"/></linearGradient><radialGradient id="gb-rd" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#fca5a5"/><stop offset="0.5" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/></radialGradient></defs><!-- 底 --><ellipse cx="50" cy="92" rx="22" ry="3.5" fill="#5a3a08"/><ellipse cx="50" cy="90" rx="22" ry="3.5" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.2"/><rect x="38" y="84" width="24" height="6" rx="2" fill="url(#gb-s)" stroke="#5a3a08" stroke-width="1.2"/><!-- 杯身 --><path d="M22 16 L78 16 L74 46 Q70 62 50 64 Q30 62 26 46 Z" fill="url(#gb-b)" stroke="#5a3a08" stroke-width="1.8" stroke-linejoin="round"/><!-- 杯内阴影 --><path d="M28 18 L72 18 L70 42 Q68 54 50 56 L50 18 Z" fill="#5a3a08" opacity="0.15"/><!-- 高光弧 --><path d="M30 22 Q30 44 38 58" fill="none" stroke="#fff7d6" stroke-width="2.5" opacity="0.85" stroke-linecap="round"/><path d="M34 24 Q35 38 40 50" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.6" stroke-linecap="round"/><!-- 杯口 --><ellipse cx="50" cy="16" rx="28" ry="5" fill="url(#gb-base)" stroke="#5a3a08" stroke-width="1.8"/><ellipse cx="50" cy="16" rx="22" ry="3" fill="#5a3a08" opacity="0.8"/><ellipse cx="50" cy="15" rx="20" ry="2" fill="#2a1a04" opacity="0.95"/><ellipse cx="42" cy="14" rx="6" ry="1.2" fill="#fff7d6" opacity="0.4"/><!-- 柱 --><rect x="46" y="62" width="8" height="24" fill="url(#gb-s)" stroke="#5a3a08" stroke-width="1.2"/><ellipse cx="50" cy="62" rx="6" ry="2" fill="#fde68a" stroke="#5a3a08" stroke-width="0.8"/><!-- 红宝石 --><circle cx="50" cy="36" r="5" fill="url(#gb-rd)" stroke="#5a3a08" stroke-width="1"/><ellipse cx="48.5" cy="34.5" rx="1.5" ry="1" fill="#fff" opacity="0.9"/></svg>';

/* ============================================================
   沙漏
   ============================================================ */
S.hourglass = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hg-w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2408"/><stop offset="0.3" stop-color="#8a5a10"/><stop offset="0.5" stop-color="#d4a017"/><stop offset="0.7" stop-color="#8a5a10"/><stop offset="1" stop-color="#3a2408"/></linearGradient><linearGradient id="hg-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#a16207"/></linearGradient><linearGradient id="hg-gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.1"/></linearGradient></defs><!-- 上下木框 --><rect x="8" y="4" width="84" height="12" rx="3" fill="url(#hg-w)" stroke="#2a1a04" stroke-width="1.5"/><rect x="11" y="6.5" width="78" height="2" fill="#fff7d6" opacity="0.6"/><rect x="11" y="11" width="78" height="1.2" fill="#2a1a04" opacity="0.7"/><rect x="8" y="84" width="84" height="12" rx="3" fill="url(#hg-w)" stroke="#2a1a04" stroke-width="1.5"/><rect x="11" y="86.5" width="78" height="2" fill="#fff7d6" opacity="0.6"/><!-- 玻璃 --><path d="M20 16 L80 16 L60 42 L60 58 L80 84 L20 84 L40 58 L40 42 Z" fill="url(#hg-gl)" stroke="#6a3a08" stroke-width="1.8" stroke-linejoin="round"/><!-- 上沙 --><path d="M34 20 L66 20 L58 42 L42 42 Z" fill="url(#hg-s)"/><path d="M36 22 L50 22 L48 42 L42 42 Z" fill="#fde047" opacity="0.7"/><!-- 下沙 --><path d="M32 80 L68 80 L50 58 Z" fill="url(#hg-s)"/><path d="M42 80 L58 80 L50 60 Z" fill="#fde047" opacity="0.7"/><!-- 下落沙线 --><rect x="48.5" y="42" width="3" height="16" fill="#fbbf24"/><rect x="49" y="42" width="1" height="16" fill="#fff" opacity="0.6"/><!-- 玻璃反光 --><path d="M28 20 Q30 42 34 60" fill="none" stroke="#fff" stroke-width="2" opacity="0.65" stroke-linecap="round"/><circle cx="60" cy="30" r="1.5" fill="#fff" opacity="0.5"/></svg>';

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
