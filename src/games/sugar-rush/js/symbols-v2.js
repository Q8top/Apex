(function(){
'use strict';
var _u = 0;
function nid(p){ _u += 1; return p + _u.toString(36); }
function lg(id,x1,y1,x2,y2,st){
  var s = '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">';
  for (var i=0;i<st.length;i++){ var t=st[i]; s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }
  return s + '</linearGradient>';
}
function rg(id,cx,cy,r,st){
  var s = '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">';
  for (var i=0;i<st.length;i++){ var t=st[i]; s += '<stop offset="' + t[0] + '" stop-color="' + t[1] + '"' + (t[2]!==undefined ? ' stop-opacity="' + t[2] + '"' : '') + '/>'; }
  return s + '</radialGradient>';
}
function gloss(cx,cy,rx,ry,rot,op){
  var t = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '';
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#FFFFFF" opacity="' + op + '"' + t + '/>';
}
function shadow(cx,cy,rx,ry,op){
  return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity="' + op + '"/>';
}
function wrap(d,b){ return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>' + d + '</defs>' + b + '</svg>'; }
var S = {};
var A = {};
// BLUE_CANDY
S.blue_candy = function(u){
  var b='bc-b-'+u, e='bc-e-'+u, sh='bc-s-'+u;
  var d = rg(b,'30%','23%','78%',[['0%','#F4FAFF'],['9%','#B5D7FF'],['28%','#579AFF'],['55%','#246AD7'],['82%','#0D438F'],['100%','#061F50']]);
  d += lg(e,'0','0','1','1',[['0%','#91C4FF','0.7'],['55%','#1E61C7','0.25'],['100%','#00183D','0.9']]);
  d += rg(sh,'30%','20%','70%',[['0%','#FFFFFF','0.95'],['35%','#FFFFFF','0.45'],['100%','#FFFFFF','0']]);
  var body = shadow(50,83,25,4.8,0.42);
  body += '<circle cx="50" cy="50" r="31" fill="url(#' + e + ')"/>';
  body += '<circle cx="50" cy="48" r="28.5" fill="url(#' + b + ')"/>';
  body += '<ellipse cx="38" cy="34" rx="19" ry="17" fill="url(#' + sh + ')"/>';
  body += gloss(31,27,8,6,-25,0.92);
  body += '<circle cx="64" cy="62" r="2.2" fill="#DCEBFF" opacity="0.8"/>';
  return wrap(d, body);
};

// GREEN_CANDY
S.green_candy = function(u){
  var b='gc-b-'+u, sh='gc-s-'+u;
  var d = lg(b,'0','0','1','1',[['0%','#E6FFD9'],['22%','#A0E57E'],['55%','#4CB23B'],['85%','#1E7A1A'],['100%','#0C4410']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(4,32,8,.32)']]);
  var body = shadow(50,86,24,5,0.42);
  body += '<polygon points="50,18 80,36 80,66 50,84 20,66 20,36" fill="url(#' + b + ')" stroke="#1E7A1A" stroke-width="1.5"/>';
  body += '<polygon points="50,18 80,36 80,66 50,84 20,66 20,36" fill="url(#' + sh + ')"/>';
  body += '<polygon points="50,24 74,38 74,62 50,76 26,62 26,38" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>';
  body += gloss(40,34,8,5,-30,0.6);
  return wrap(d, body);
};

// PURPLE_CANDY
S.purple_candy = function(u){
  var b='pc-b-'+u, sh='pc-s-'+u;
  var d = rg(b,'34%','26%','76%',[['0%','#F3E5FF'],['24%','#C39BF6'],['58%','#8B46E0'],['86%','#5B1FA5'],['100%','#340F66']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(28,6,58,.34)']]);
  var body = shadow(50,84,24,5,0.42);
  body += '<rect x="28" y="28" width="44" height="44" rx="10" fill="url(#' + b + ')" transform="rotate(8 50 50)"/>';
  body += '<rect x="28" y="28" width="44" height="44" rx="10" fill="url(#' + sh + ')" transform="rotate(8 50 50)"/>';
  body += '<rect x="32" y="32" width="36" height="36" rx="8" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" transform="rotate(8 50 50)"/>';
  body += gloss(40,38,8,5,-28,0.6);
  return wrap(d, body);
};

// RED_CANDY
S.red_candy = function(u){
  var b='rc-b-'+u, sh='rc-s-'+u;
  var d = rg(b,'32%','26%','80%',[['0%','#FFE0E5'],['22%','#FF8095'],['56%','#E11D48'],['84%','#8B0F2E'],['100%','#4A0518']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(60,6,20,.32)']]);
  var body = shadow(50,84,24,5,0.42);
  body += '<circle cx="50" cy="50" r="30" fill="url(#' + b + ')"/>';
  body += '<circle cx="50" cy="50" r="30" fill="url(#' + sh + ')"/>';
  body += '<circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>';
  body += gloss(38,34,10,7,-25,0.7);
  body += '<circle cx="66" cy="62" r="2" fill="#FFD0D8" opacity="0.75"/>';
  return wrap(d, body);
};

// STRAWBERRY
S.strawberry = function(u){
  var b='st-b-'+u, sh='st-s-'+u;
  var d = rg(b,'36%','28%','82%',[['0%','#FFE0E8'],['24%','#FF8098'],['58%','#E11D48'],['86%','#8B0F2E'],['100%','#4A0518']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(60,6,20,.30)']]);
  var body = shadow(50,86,24,5,0.42);
  // main strawberry shape (rounded triangle pointing down)
  body += '<path d="M50 22 C32 22 24 34 26 50 C28 68 42 82 50 86 C58 82 72 68 74 50 C76 34 68 22 50 22 Z" fill="url(#' + b + ')" stroke="#7F1D2E" stroke-width="1.4"/>';
  body += '<path d="M50 22 C32 22 24 34 26 50 C28 68 42 82 50 86 C58 82 72 68 74 50 C76 34 68 22 50 22 Z" fill="url(#' + sh + ')"/>';
  // seeds
  body += '<ellipse cx="42" cy="42" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="58" cy="42" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="50" cy="50" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="38" cy="56" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="62" cy="56" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="50" cy="64" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="44" cy="72" rx="1.2" ry="2" fill="#FFE4B0"/>';
  body += '<ellipse cx="56" cy="72" rx="1.2" ry="2" fill="#FFE4B0"/>';
  // leaves
  body += '< path d="M50 2212 Q40 32 16 Q40 24 46 24 Z" fill="#22C55E" stroke="#15803D" stroke-width="0.8"/>';
  body += '<path d="M50 22 Q60 12 68 16 Q60 24 54 24 Z" fill="#22C55E" stroke="#15803D" stroke-width="0.8"/>';
  body += gloss(40,36,7,5,-25,0.55);
  return wrap(d, body);
};

// ORANGE
S.orange = function(u){
  var b='or-b-'+u, sh='or-s-'+u;
  var d = rg(b,'34%','26%','84%',[['0%','#FFE9C0'],['22%','#FFB347'],['56%','#F97316'],['84%','#9A3412'],['100%','#431407']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(60,20,4,.32)']]);
  var body = shadow(50,86,26,5,0.42);
  body += '<circle cx="50" cy="52" r="30" fill="url(#' + b + ')"/>';
  body += '<circle cx="50" cy="52" r="30" fill="url(#' + sh + ')"/>';
  // texture dots
  body += '<circle cx="40" cy="48" r="0.9" fill="#7A2A08" opacity="0.55"/>';
  body += '<circle cx="58" cy="46" r="0.9" fill="#7A2A08" opacity="0.55"/>';
  body += '<circle cx="50" cy="58" r="0.9" fill="#7A2A08" opacity="0.55"/>';
  body += '<circle cx="44" cy="66" r="0.9" fill="#7A2A08" opacity="0.55"/>';
  body += '<circle cx="58" cy="64" r="0.9" fill="#7A2A08" opacity="0.55"/>';
  // leaf
  body += '<path d="M50 22 Q62 14 68 22 Q58 28 50 26 Z" fill="#22C55E" stroke="#15803D" stroke-width="0.8"/>';
  body += gloss(38,38,9,6,-28,0.65);
  return wrap(d, body);
};

// CHERRY
S.cherry = function(u){
  var b='ch-b-'+u, sh='ch-s-'+u;
  var d = rg(b,'34%','26%','82%',[['0%','#FFD5DD'],['22%','#FF6577'],['58%','#DC2626'],['86%','#991B1B'],['100%','#450A0A']]);
  d += lg(sh,'0','0','0','1',[['0%','rgba(0,0,0,0)'],['100%','rgba(60,10,10,.30)']]);
  var body = shadow(50,86,22,4,0.42);
  // two cherries
  body += '<circle cx="38" cy="62" r="17" fill="url(#' + b + ')"/>';
  body += '<circle cx="62" cy="62" r="17" fill="url(#' + b + ')"/>';
  body += '<circle cx="38" cy="62" r="17" fill="url(#' + sh + ')"/>';
  body += '<circle cx="62" cy="62" r="17" fill="url(#' + sh + ')"/>';
  // stems
  body += '<path d="M38 45 Q40 30 52 22" fill="none" stroke="#4D7C0F" stroke-width="2.4" stroke-linecap="round"/>';
  body += '<path d="M62 45 Q60 30 52 22" fill="none" stroke="#4D7C0F" stroke-width="2.4" stroke-linecap="round"/>';
  // leaf
  body += '<path d="M52 22 Q64 16 72 22 Q62 30 52 26 Z" fill="#22C55E" stroke="#15803D" stroke-width="0.8"/>';
  // highlights
  body += gloss(32,56,5,4,-25,0.85);
  body += gloss(56,56,5,4,-25,0.85);
  return wrap(d, body);
};

// GRAPE
S.grape = function(u){
  var b='gr-b-'+u, sh='gr-s-'+u;
  var d = rg(b,'34%','24%','80%',[['0%','#F3E5FF'],['18%','#C9A0FF'],['48%','#8B46E0'],['76%','#5B1FA5'],['100%','#2A0F5C']]);
  d += rg(sh,'38%','32%','60%',[['0%','#FFFFFF','0.55'],['60%','#FFFFFF','0']]);
  var body = shadow(50,90,24,4,0.42);
  // vine + leaf
  body += '<path d="M50 20 Q54 10 62 6" stroke="#4D7C0F" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  body += '<path d="M50 18 Q62 12 68 20 Q60 28 50 24 Z" fill="#65A30D" stroke="#3F6212" stroke-width="1"/>';
  body += '<path d="M50 18 Q38 12 32 20 Q40 28 50 24 Z" fill="#84CC16" stroke="#3F6212" stroke-width="1"/>';
  // 8 grapes
  body += '<circle cx="34" cy="38" r="11" fill="url(#' + b + ')"/>';
  body += '<circle cx="50" cy="34" r="11.5" fill="url(#' + b + ')"/>';
  body += '<circle cx="66" cy="38" r="11" fill="url(#' + b + ')"/>';
  body += '<circle cx="42" cy="54" r="11" fill="url(#' + b + ')"/>';
  body += '<circle cx="58" cy="54" r="11" fill="url(#' + b + ')"/>';
  body += '<circle cx="34" cy="70" r="10" fill="url(#' + b + ')"/>';
  body += '<circle cx="50" cy="76" r="10" fill="url(#' + b + ')"/>';
  body += '<circle cx="66" cy="70" r="10" fill="url(#' + b + ')"/>';
  // highlights
  body += gloss(30,33,3.5,2.8,-25,0.9);
  body += gloss(46,29,3.5,2.8,-25,0.9);
  body += gloss(62,33,3.5,2.8,-25,0.9);
  body += gloss(38,50,3.5,2.8,-25,0.9);
  body += gloss(54,50,3.5,2.8,-25,0.9);
  return wrap(d, body);
};

// MANGO
S.mango = function(u){
  var b='mg-b-'+u, sh='mg-s-'+u;
  var d = rg(b,'36%','28%','82%',[['0%','#FFF6CC'],['22%','#FFD166'],['56%','#F59E0B'],['84%','#B45309'],['100%','#451A03']]);
  d += rg(sh,'36%','28%','58%',[['0%','#FFFFFF','0.5'],['60%','#FFFFFF','0']]);
  var body = shadow(50,86,26,5,0.42);
  // mango body (oval, slightly angled)
  body += '<ellipse cx="50" cy="54" rx="26" ry="30" fill="url(#' + b + ')" transform="rotate(-10 50 54)"/>';
  body += '<ellipse cx="50" cy="54" rx="26" ry="30" fill="url(#' + sh + ')" transform="rotate(-10 50 54)"/>';
  // seam line
  body += '<path d="M30 44 Q50 42 70 60" fill="none" stroke="rgba(80,30,0,0.28)" stroke-width="1.2"/>';
  // stem + leaf
  body += '<path d="M52 26 Q50 16 46 10" stroke="#78350F" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  body += '<path d="M48 16 Q60 6 70 12 Q62 24 50 20 Z" fill="#22C55E" stroke="#15803D" stroke-width="0.9"/>';
  // highlights
  body += gloss(38,42,8,6,-28,0.7);
  body += gloss(34,36,4,3,-28,0.9);
  return wrap(d, body);
};

// LOLLIPOP (scatter)
S.lollipop = function(u){
  var c='lp-c-'+u, st='lp-st-'+u;
  var d = rg(c,'30%','20%','80%',[['0%','#FFF3FA'],['16%','#FFB5DA'],['40%','#FF61AC'],['72%','#ED2584'],['100%','#970B4C']]);
  d += lg(st,'0','0','1','0',[['0%','#EAEAEA'],['35%','#FFFFFF'],['60%','#D7D7D7'],['100%','#A8A8A8']]);
  var body = shadow(50,88,15,4,0.32);
  body += '<path d="M50 53 L50 88" stroke="#000" stroke-width="6" opacity="0.15" stroke-linecap="round"/>';
  body += '<path d="M49 53 L49 88" stroke="url(#' + st + ')" stroke-width="4" stroke-linecap="round"/>';
  body += '<path d="M48 54 L48 87" stroke="#FFFFFF" stroke-width="1.2" opacity="0.82" stroke-linecap="round"/>';
  body += '<circle cx="50" cy="39" r="25" fill="url(#' + c + ')" stroke="#A40E53" stroke-width="1.5"/>';
  body += '<circle cx="50" cy="39" r="20" fill="none" stroke="#FFD0E7" stroke-width="2" opacity="0.58"/>';
  body += '<path d="M40 30 C47 25 57 27 62 33 C67 39 63 48 56 51 C48 54 39 50 36 43 C32 35 38 28 46 27 C56 25 64 31 66 39" fill="none" stroke="#FFE5F2" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>';
  body += gloss(40,29,7,5,-25,0.88);
  body += '<circle cx="35" cy="36" r="1.8" fill="#FFFFFF" opacity="0.55"/>';
  return wrap(d, body);
};

// MULTIPLIER_BOMB
S.multiplier_bomb = function(u){
  var b='ml-b-'+u, h='ml-h-'+u;
  var d = rg(b,'38%','32%','72%',[['0%','#FFF7D6'],['22%','#FDE047'],['55%','#F59E0B'],['85%','#B45309'],['100%','#451A03']]);
  d += rg(h,'50%','50%','50%',[['60%','rgba(253,224,71,0)'],['85%','rgba(253,224,71,0.32)'],['100%','rgba(253,224,71,0)']]);
  var body = shadow(50,84,26,5,0.4);
  body += '<circle cx="50" cy="48" r="40" fill="url(#' + h + ')"/>';
  body += '<circle cx="50" cy="48" r="29" fill="url(#' + b + ')" stroke="#B66A00" stroke-width="1.8"/>';
  body += '<path d="M50 22 L56 39 L74 39 L59 49 L65 66 L50 56 L35 66 L41 49 L26 39 L44 39 Z" fill="#FFF4A2" opacity="0.42"/>';
  body += '<text x="50" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="900" fill="#8A4600">x</text>';
  body += gloss(38,31,10,6,-25,0.45);
  return wrap(d, body);
};

// aliases
A['sb-candy-blue'] = 'blue_candy';
A['sb-candy-green'] = 'green_candy';
A['sb-candy-purple'] = 'purple_candy';
A['sb-candy-red'] = 'red_candy';
A['sb-fruit-strawberry'] = 'strawberry';
A['sb-fruit-orange'] = 'orange';
A['sb-fruit-cherry'] = 'cherry';
A['sb-fruit-grape'] = 'grape';
A['sb-fruit-mango'] = 'mango';
A['sb-scatter-lollipop'] = 'lollipop';
A['sb-multiplier-bomb'] = 'candy_bomb';

function rs(id){ if (S[id]) return id; if (A[id]) return A[id]; return null; }
function get(id){
  var k = rs(id);
  if (!k) return '';
  var u = nid('s');
  return S[k](u);
}
function has(id){ return rs(id) !== null; }
function list(){ return Object.keys(S); }

window.ApexSugarRushSymbolsV2 = Object.freeze({
  get: get, has: has, list: list,
  SVGS: Object.freeze(S),
  ALIASES: Object.freeze(A)
});
})();
