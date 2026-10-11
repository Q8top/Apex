(function(){
'use strict';
/* Apex Sugar Rush - Symbol SVG (original-parity redraw)
 * Internal ids preserved (blue_candy / green_candy / ...) for config
 * compatibility. Visual content matches original Pragmatic Play:
 *   blue_candy   -> 橙色软糖熊 (orange gummy bear)
 *   green_candy  -> 紫色软糖熊 (purple gummy bear)
 *   purple_candy -> 红色软糖熊 (red gummy bear)
 *   red_candy    -> 绿色星星糖 (green star candy)
 *   strawberry   -> 紫色果冻豆 (purple jelly bean)
 *   orange       -> 橙色爱心糖 (orange heart)
 *   mango        -> 粉色圆形糖果 (pink candy)
 *   lollipop     -> 棒棒糖 (scatter)
 * 8 symbols matching Pragmatic Play Sugar Rush:
 *   1. orange_bear   (lowest)
 *   2. purple_bear   (low)
 *   3. red_bear      (low)
 *   4. green_star    (mid)
 *   5. purple_jelly  (mid)
 *   6. orange_heart  (high)
 *   7. pink_candy    (highest)
 *   8. lollipop      (scatter)
 *
 * Style: multi-layer gradients + gloss + rim-light + drop-shadow
 * All symbols drawn in 100x100 viewBox, uid-isolated via nid().
 */
var H = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"';
var _u = 0;
function nid(p){ _u += 1; return p + _u.toString(36); }
function lg(id,x1,y1,x2,y2,st){
  var s = '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">';
  for (var i=0;i<st.length;i++){ var t=st[i];
    s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>';
  }
  return s + '</linearGradient>';
}
function rg(id,cx,cy,r,st){
  var s = '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">';
  for (var i=0;i<st.length;i++){ var t=st[i];
    s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>';
  }
  return s + '</radialGradient>';
}
function gloss(cx,cy,rx,ry,rot,op){
  var t = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '';
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#FFFFFF" opacity="' + op + '"' + t + '/>';
}
function shadow(cx,cy,rx,ry,op){
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity="' + op + '"/>';
}
function wrap(d,b){ return '<svg ' + H + '><defs>' + d + '</defs>' + b + '</svg>'; }

/* ================================================================
 * 1. ORANGE_BEAR (橙色软糖熊) - lowest paying
 * ================================================================ */
var S = {};
S.blue_candy = function(){
  var b='ob-b-'+(++_u), h='ob-h-'+(++_u), rim='ob-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#FFE8C0'],['12%','#FFB347'],['40%','#F97316'],['72%','#C2410C'],['100%','#7C2D12']]);
  d += rg(h,'38%','32%','60%',[['0%','#FFFFFF','0.95'],['22%','#FFFFFF','0.6'],['55%','#FFFFFF','0.12'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.3'],['100%','#7C2D12','0.4']]);
  var b1 = shadow(50,86,26,5,0.35);
  // bear body: rounded head + two ears
  b1 += '<ellipse cx="32" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="68" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="url(#'+b+')"/>';
  // ears inner
  b1 += '<ellipse cx="32" cy="30" rx="5" ry="5" fill="#FFD8A0" opacity="0.55"/>';
  b1 += '<ellipse cx="68" cy="30" rx="5" ry="5" fill="#FFD8A0" opacity="0.55"/>';
  // eyes
  b1 += '<circle cx="41" cy="50" r="3" fill="#3A1E00"/>';
  b1 += '<circle cx="59" cy="50" r="3" fill="#3A1E00"/>';
  b1 += '<circle cx="42" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  b1 += '<circle cx="60" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  // nose
  b1 += '<ellipse cx="50" cy="60" rx="4" ry="3" fill="#5C2A00"/>';
  // smile
  b1 += '<path d="M44,66 Q50,71 56,66" fill="none" stroke="#5C2A00" stroke-width="1.4" stroke-linecap="round"/>';
  // body gloss
  b1 += '<ellipse cx="42" cy="40" rx="12" ry="8" fill="url(#'+h+')" transform="rotate(-25 42 40)"/>';
  b1 += gloss(40,36,4,3,-25,0.9);
  // rim light
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="none" stroke="url(#'+rim+')" stroke-width="1.4"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 2. PURPLE_BEAR (紫色软糖熊)
 * ================================================================ */
S.green_candy = function(){
  var b='pb-b-'+(++_u), h='pb-h-'+(++_u), rim='pb-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#F3E5FF'],['12%','#C39BF6'],['40%','#8B46E0'],['72%','#5B1FA5'],['100%','#2A0F5C']]);
  d += rg(h,'38%','32%','60%',[['0%','#FFFFFF','0.95'],['22%','#FFFFFF','0.6'],['55%','#FFFFFF','0.12'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.3'],['100%','#2A0F5C','0.4']]);
  var b1 = shadow(50,86,26,5,0.35);
  b1 += '<ellipse cx="32" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="68" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="32" cy="30" rx="5" ry="5" fill="#D8B8FF" opacity="0.5"/>';
  b1 += '<ellipse cx="68" cy="30" rx="5" ry="5" fill="#D8B8FF" opacity="0.5"/>';
  b1 += '<circle cx="41" cy="50" r="3" fill="#1A0430"/>';
  b1 += '<circle cx="59" cy="50" r="3" fill="#1A0430"/>';
  b1 += '<circle cx="42" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  b1 += '<circle cx="60" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  b1 += '<ellipse cx="50" cy="60" rx="4" ry="3" fill="#2A0A48"/>';
  b1 += '<path d="M44,66 Q50,71 56,66" fill="none" stroke="#2A0A48" stroke-width="1.4" stroke-linecap="round"/>';
  b1 += '<ellipse cx="42" cy="40" rx="12" ry="8" fill="url(#'+h+')" transform="rotate(-25 42 40)"/>';
  b1 += gloss(40,36,4,3,-25,0.9);
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="none" stroke="url(#'+rim+')" stroke-width="1.4"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 3. RED_BEAR (红色软糖熊)
 * ================================================================ */
S.purple_candy = function(){
  var b='rb-b-'+(++_u), h='rb-h-'+(++_u), rim='rb-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#FFE5EA'],['12%','#FF8095'],['40%','#E11D48'],['72%','#8B0F2E'],['100%','#3A0614']]);
  d += rg(h,'38%','32%','60%',[['0%','#FFFFFF','0.95'],['22%','#FFFFFF','0.6'],['55%','#FFFFFF','0.12'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.3'],['100%','#3A0614','0.4']]);
  var b1 = shadow(50,86,26,5,0.35);
  b1 += '<ellipse cx="32" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="68" cy="30" rx="10" ry="10" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="url(#'+b+')"/>';
  b1 += '<ellipse cx="32" cy="30" rx="5" ry="5" fill="#FFC0CC" opacity="0.5"/>';
  b1 += '<ellipse cx="68" cy="30" rx="5" ry="5" fill="#FFC0CC" opacity="0.5"/>';
  b1 += '<circle cx="41" cy="50" r="3" fill="#2A040A"/>';
  b1 += '<circle cx="59" cy="50" r="3" fill="#2A040A"/>';
  b1 += '<circle cx="42" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  b1 += '<circle cx="60" cy="49" r="1.1" fill="#FFFFFF" opacity="0.9"/>';
  b1 += '<ellipse cx="50" cy="60" rx="4" ry="3" fill="#4A0814"/>';
  b1 += '<path d="M44,66 Q50,71 56,66" fill="none" stroke="#4A0814" stroke-width="1.4" stroke-linecap="round"/>';
  b1 += '<ellipse cx="42" cy="40" rx="12" ry="8" fill="url(#'+h+')" transform="rotate(-25 42 40)"/>';
  b1 += gloss(40,36,4,3,-25,0.9);
  b1 += '<ellipse cx="50" cy="55" rx="26" ry="28" fill="none" stroke="url(#'+rim+')" stroke-width="1.4"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 4. GREEN_STAR (绿色星星糖) - mid
 * ================================================================ */
S.red_candy = function(){
  var b='gs-b-'+(++_u), h='gs-h-'+(++_u), rim='gs-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#E8FFD8'],['14%','#A0E57E'],['42%','#4CB23B'],['74%','#1E7A1A'],['100%','#0A3D10']]);
  d += rg(h,'36%','30%','58%',[['0%','#FFFFFF','0.95'],['24%','#FFFFFF','0.58'],['58%','#FFFFFF','0.1'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.28'],['100%','#0A3D10','0.4']]);
  var b1 = shadow(50,86,24,5,0.35);
  // 5-point star path
  b1 += '<path d="M50,16 L60,40 L86,40 L66,56 L74,82 L50,66 L26,82 L34,56 L14,40 L40,40 Z" fill="url(#'+b+')"/>';
  b1 += '<path d="M50,16 L60,40 L86,40 L66,56 L74,82 L50,66 L26,82 L34,56 L14,40 L40,40 Z" fill="none" stroke="url(#'+rim+')" stroke-width="1.4" stroke-linejoin="round"/>';
  // inner star highlight
  b1 += '<path d="M50,24 L57,42 L76,42 L61,54 L67,74 L50,61 L33,74 L39,54 L24,42 L43,42 Z" fill="url(#'+h+')" opacity="0.6"/>';
  b1 += gloss(42,32,7,4,-25,0.85);
  b1 += gloss(39,29,3,2,-25,0.95);
  b1 += '<circle cx="62" cy="50" r="1.4" fill="#FFFFFF" opacity="0.6"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 5. PURPLE_JELLY (紫色果冻豆) - mid
 * ================================================================ */
S.strawberry = function(){
  var b='pj-b-'+(++_u), h='pj-h-'+(++_u), rim='pj-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#F3E5FF'],['12%','#C39BF6'],['42%','#8B46E0'],['74%','#5B1FA5'],['100%','#2A0F5C']]);
  d += rg(h,'36%','30%','56%',[['0%','#FFFFFF','0.95'],['24%','#FFFFFF','0.58'],['58%','#FFFFFF','0.1'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.28'],['100%','#2A0F5C','0.4']]);
  var b1 = shadow(50,86,28,5,0.35);
  // jelly bean: oval rotated
  b1 += '<ellipse cx="50" cy="52" rx="30" ry="34" fill="url(#'+b+')" transform="rotate(-15 50 52)"/>';
  b1 += '<ellipse cx="50" cy="52" rx="30" ry="34" fill="none" stroke="url(#'+rim+')" stroke-width="1.4" transform="rotate(-15 50 52)"/>';
  // inner gloss
  b1 += '<ellipse cx="42" cy="38" rx="15" ry="10" fill="url(#'+h+')" transform="rotate(-25 42 38)"/>';
  b1 += gloss(40,34,5,3.5,-25,0.9);
  b1 += gloss(38,31,2.4,1.7,-25,0.98);
  // bottom reflection
  b1 += '<ellipse cx="58" cy="72" rx="10" ry="4" fill="#FFFFFF" opacity="0.18"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 6. ORANGE_HEART (橙色爱心糖) - high
 * ================================================================ */
S.orange = function(){
  var b='oh-b-'+(++_u), h='oh-h-'+(++_u), rim='oh-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#FFF8E0'],['12%','#FFD080'],['40%','#F97316'],['72%','#C2410C'],['100%','#7C2D12']]);
  d += rg(h,'36%','30%','58%',[['0%','#FFFFFF','0.95'],['24%','#FFFFFF','0.58'],['58%','#FFFFFF','0.1'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.28'],['100%','#7C2D12','0.4']]);
  var b1 = shadow(50,86,24,5,0.35);
  // heart path
  b1 += '<path d="M50,82 C20,60 14,42 22,30 C30,20 46,22 50,38 C54,22 70,20 78,30 C86,42 80,60 50,82 Z" fill="url(#'+b+')"/>';
  b1 += '<path d="M50,82 C20,60 14,42 22,30 C30,20 46,22 50,38 C54,22 70,20 78,30 C86,42 80,60 50,82 Z" fill="none" stroke="url(#'+rim+')" stroke-width="1.4"/>';
  // inner highlight
  b1 += '<path d="M50,74 C26,56 22,42 28,34 C34,28 44,30 50,42 C56,30 66,28 72,34 C78,42 74,56 50,74 Z" fill="url(#'+h+')" opacity="0.55"/>';
  b1 += gloss(38,38,10,6,-30,0.85);
  b1 += gloss(34,34,4,2.6,-30,0.98);
  // sparkle
  b1 += '<circle cx="64" cy="50" r="1.6" fill="#FFFFFF" opacity="0.7"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 7. PINK_CANDY (粉色圆形糖果) - highest
 * ================================================================ */
S.mango = function(){
  var b='pc-b-'+(++_u), h='pc-h-'+(++_u), rim='pc-r-'+(++_u);
  var d = rg(b,'34%','28%','80%',[['0%','#FFF3FA'],['12%','#FFB5DA'],['40%','#ED2584'],['72%','#A20E55'],['100%','#5C052E']]);
  d += rg(h,'36%','30%','56%',[['0%','#FFFFFF','0.95'],['24%','#FFFFFF','0.58'],['58%','#FFFFFF','0.1'],['100%','#FFFFFF','0']]);
  d += lg(rim,'0','0','0','1',[['0%','#FFFFFF','0.3'],['100%','#5C052E','0.4']]);
  var b1 = shadow(50,86,26,5,0.35);
  // round candy
  b1 += '<circle cx="50" cy="52" r="32" fill="url(#'+b+')"/>';
  b1 += '<circle cx="50" cy="52" r="32" fill="none" stroke="url(#'+rim+')" stroke-width="1.4"/>';
  // swirl stripe
  b1 += '<path d="M26,46 Q40,36 50,46 Q60,56 74,46" fill="none" stroke="#FFD0E7" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>';
  b1 += '<path d="M26,58 Q40,68 50,58 Q60,48 74,58" fill="none" stroke="#FFD0E7" stroke-width="2.4" stroke-linecap="round" opacity="0.55"/>';
  b1 += '<ellipse cx="40" cy="38" rx="14" ry="9" fill="url(#'+h+')" transform="rotate(-28 40 38)"/>';
  b1 += gloss(38,34,4.5,3,-28,0.95);
  b1 += gloss(36,31,2,1.4,-28,1);
  b1 += '<circle cx="68" cy="58" r="2" fill="#FFFFFF" opacity="0.7"/>';
  return wrap(d, b1);
};

/* ================================================================
 * 8. LOLLIPOP (棒棒糖) - scatter
 * ================================================================ */
S.lollipop = function(){
  var c='lp-c-'+(++_u), ch='lp-h-'+(++_u), st='lp-st-'+(++_u), gl='lp-gl-'+(++_u);
  var d = rg(c,'30%','22%','82%',[['0%','#FFF3FA'],['14%','#FFC2E0'],['38%','#FF7AB8'],['68%','#ED2584'],['92%','#A20E55'],['100%','#5C052E']]);
  d += rg(ch,'34%','26%','58%',[['0%','#FFFFFF','0.98'],['22%','#FFFFFF','0.68'],['54%','#FFFFFF','0.15'],['100%','#FFFFFF','0']]);
  d += lg(st,'0','0','1','0',[['0%','#9E9E9E'],['35%','#FFFFFF'],['62%','#DCDCDC'],['100%','#8A8A8A']]);
  d += rg(gl,'50%','42%','58%',[['0%','#FFFFFF','0'],['78%','#FFB5DA','0.3'],['100%','#FF5AAC','0']]);
  var b1 = shadow(50,90,16,4,0.35);
  b1 += '<circle cx="50" cy="38" r="34" fill="url(#'+gl+')"/>';
  b1 += '<path d="M50 52 L50 90" stroke="#000" stroke-width="7" opacity="0.14" stroke-linecap="round"/>';
  b1 += '<path d="M49 52 L49 90" stroke="url(#'+st+')" stroke-width="4.5" stroke-linecap="round"/>';
  b1 += '<path d="M47.5 53 L47.5 89" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>';
  b1 += '<circle cx="50" cy="38" r="26" fill="url(#'+c+')"/>';
  b1 += '<circle cx="50" cy="38" r="20" fill="none" stroke="#FFD0E7" stroke-width="2" opacity="0.55"/>';
  // swirl
  b1 += '<path d="M38,30 C46,24 58,26 63,33 C68,41 62,50 54,52 C46,54 36,50 34,42 C32,34 40,27 48,26 C58,24 66,30 68,40" fill="none" stroke="#FFE5F2" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>';
  b1 += '<path d="M46,32 C51,29 56,31 58,35 C61,40 57,45 52,46 C47,47 43,44 43,40 C42,36 45,33 49,32" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>';
  b1 += '<ellipse cx="38" cy="26" rx="9" ry="6" fill="url(#'+ch+')" transform="rotate(-28 38 26)"/>';
  b1 += gloss(32,22,4.5,3,-28,0.95);
  b1 += gloss(30,20,2,1.4,-28,1);
  b1 += '<circle cx="68" cy="52" r="1.8" fill="#FFFFFF" opacity="0.7"/>';
  return wrap(d, b1);
};

/* ================================================================
 * Registry + aliases
 * ================================================================ */
var A = {};  // no aliases needed; ids match config
function rs(id){ if (S[id]) return id; if (A[id]) return A[id]; return null; }
function sc(svg, uid){
  if (!uid) return svg;
  var re = /id="([^"]+)"/g, ids = [], m, seen = {};
  while ((m = re.exec(svg)) !== null) ids.push(m[1]);
  for (var i = 0; i < ids.length; i++){
    var r = ids[i]; if (seen[r]) continue; seen[r] = true;
    var e = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    svg = svg.replace(new RegExp('id="' + e + '"', 'g'), 'id="' + r + '-' + uid + '"');
    svg = svg.replace(new RegExp('url\\(#' + e + '\\)', 'g'), 'url(#' + r + '-' + uid + ')');
  }
  return svg;
}
function get(id, uid){
  var k = rs(id); if (!k) return '';
  return sc(S[k](), uid);
}
function has(id){ return rs(id) !== null; }
function list(){ return Object.keys(S); }
window.ApexSugarRushSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  VIEWBOX: '0 0 100 100',
  SVGS: Object.freeze(S),
  ALIASES: Object.freeze(A)
});
})();
