/* 1001 MG · 局内符号 SVG（阿拉伯神话 · 精修版） */
(function(){
'use strict';
function wrap(i){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+i+'</svg>';}

/* 通用高光/阴影 */
function hl(cx,cy,rx,ry,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(op||.55)+'"/>';}
function shadow(cy){return '<ellipse cx="50" cy="'+(cy||88)+'" rx="26" ry="4" fill="#000" opacity=".22"/>';}

/* ───── 数字/字母牌（统一风格：深紫底 + 金色描边 + 大字符 + 高光） ───── */
function letterCard(txt, accent){
  return wrap(
    /* 卡片底 + 边框 */
    '<rect x="12" y="12" width="76" height="76" rx="10" fill="#1a0f2a" stroke="'+accent+'" stroke-width="2.4"/>'+
    /* 内金线 */
    '<rect x="17" y="17" width="66" height="66" rx="7" fill="none" stroke="'+accent+'" stroke-width="1" opacity=".55"/>'+
    /* 四角小装饰 */
    '<circle cx="21" cy="21" r="2.2" fill="'+accent+'"/>'+
    '<circle cx="79" cy="21" r="2.2" fill="'+accent+'"/>'+
    '<circle cx="21" cy="79" r="2.2" fill="'+accent+'"/>'+
    '<circle cx="79" cy="79" r="2.2" fill="'+accent+'"/>'+
    /* 主字符 */
    '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="900" fill="'+accent+'" stroke="#0a0a0a" stroke-width=".8" paint-order="stroke">'+txt+'</text>'+
    /* 顶部高光 */
    hl(38,24,10,3,.4)+
    hl(50,42,14,4,.18)
  );
}

/* ───── 神灯（阿拉丁金灯） ───── */
function lamp(){
  return wrap(
    shadow(88)+
    /* 灯身主体 */
    '<ellipse cx="50" cy="66" rx="30" ry="14" fill="#d9a83e" stroke="#5a3a08" stroke-width="2.4"/>'+
    /* 顶部凸起 */
    '<ellipse cx="50" cy="54" rx="18" ry="6" fill="#e8c25c" stroke="#5a3a08" stroke-width="2"/>'+
    /* 盖 */
    '<rect x="38" y="46" width="24" height="6" rx="3" fill="#c9942a" stroke="#5a3a08" stroke-width="1.8"/>'+
    /* 小圆顶 */
    '<circle cx="50" cy="42" r="4" fill="#e8c25c" stroke="#5a3a08" stroke-width="1.6"/>'+
    /* 壶嘴（右侧弯管） */
    '<path d="M78 64 Q88 58 92 48 L96 50 Q92 62 82 70 Z" fill="#c9942a" stroke="#5a3a08" stroke-width="2" stroke-linejoin="round"/>'+
    /* 壶嘴小圆 */
    '<circle cx="94" cy="49" r="3" fill="#e8c25c" stroke="#5a3a08" stroke-width="1.4"/>'+
    /* 把手（左侧） */
    '<path d="M22 60 Q14 58 12 66 Q14 74 22 72" fill="none" stroke="#5a3a08" stroke-width="3" stroke-linecap="round"/>'+
    /* 表面花纹 */
    '<path d="M30 66 Q50 60 70 66" fill="none" stroke="#5a3a08" stroke-width=".8" opacity=".35"/>'+
    /* 高光 */
    hl(38,62,10,4,.5)+
    hl(58,70,6,2.5,.3)+
    /* 金色光芒 */
    '<path d="M50 30 L52 36 L58 38 L52 40 L50 46 L48 40 L42 38 L48 36 Z" fill="#ffe9a0" opacity=".75"/>'
  );
}

/* ───── 飞毯（波斯地毯飘浮） ───── */
function carpet(){
  return wrap(
    shadow(88)+
    /* 地毯主体（略拱起） */
    '<path d="M14 62 Q30 54 50 56 Q70 58 86 66 L82 76 Q50 68 18 76 Z" fill="#b83232" stroke="#4a0808" stroke-width="2.4" stroke-linejoin="round"/>'+
    /* 内侧花纹带 */
    '<path d="M22 66 Q50 60 78 66" fill="none" stroke="#e8c25c" stroke-width="1.6" opacity=".85"/>'+
    '<path d="M22 72 Q50 66 78 72" fill="none" stroke="#e8c25c" stroke-width="1.2" opacity=".6"/>'+
    /* 中央菱形图案 */
    '<path d="M50 60 L58 66 L50 72 L42 66 Z" fill="#e8c25c" stroke="#4a0808" stroke-width="1.2"/>'+
    /* 左右飘角 */
    '<path d="M14 62 L6 58 L12 66 Z" fill="#b83232" stroke="#4a0808" stroke-width="1.4" stroke-linejoin="round"/>'+
    '<path d="M86 66 L94 62 L88 70 Z" fill="#b83232" stroke="#4a0808" stroke-width="1.4" stroke-linejoin="round"/>'+
    /* 飘浮气流 */
    '<path d="M22 84 Q40 80 58 84" fill="none" stroke="#fff" stroke-width="1" opacity=".35" stroke-linecap="round"/>'+
    hl(30,64,6,2,.5)
  );
}

/* ───── 宫殿（阿拉伯穹顶） ───── */
function palace(){
  return wrap(
    shadow(90)+
    /* 主体墙 */
    '<rect x="20" y="46" width="60" height="42" fill="#6a3a9a" stroke="#2a0a5a" stroke-width="2.2"/>'+
    /* 中央大门 */
    '<path d="M42 88 L42 66 Q50 60 58 66 L58 88 Z" fill="#e8c25c" stroke="#2a0a5a" stroke-width="1.8"/>'+
    /* 中央穹顶 */
    '<path d="M34 46 Q34 26 50 22 Q66 26 66 46 Z" fill="#8a4ae0" stroke="#2a0a5a" stroke-width="2.2" stroke-linejoin="round"/>'+
    /* 两侧小塔 */
    '<rect x="18" y="34" width="10" height="54" fill="#6a3a9a" stroke="#2a0a5a" stroke-width="1.8"/>'+
    '<rect x="72" y="34" width="10" height="54" fill="#6a3a9a" stroke="#2a0a5a" stroke-width="1.8"/>'+
    /* 塔顶尖锥 */
    '<path d="M18 34 L23 22 L28 34 Z" fill="#8a4ae0" stroke="#2a0a5a" stroke-width="1.6" stroke-linejoin="round"/>'+
    '<path d="M72 34 L77 22 L82 34 Z" fill="#8a4ae0" stroke="#2a0a5a" stroke-width="1.6" stroke-linejoin="round"/>'+
    /* 顶部小旗 */
    '<path d="M50 22 L50 14 L58 17 L50 20" fill="#e8c25c" stroke="#2a0a5a" stroke-width="1"/>'+
    /* 窗户 */
    '<rect x="28" y="56" width="6" height="10" fill="#ffe9a0" stroke="#2a0a5a" stroke-width="1"/>'+
    '<rect x="66" y="56" width="6" height="10" fill="#ffe9a0" stroke="#2a0a5a" stroke-width="1"/>'+
    hl(40,34,6,3,.5)
  );
}

/* ───── 精灵（阿拉伯人物） ───── */
function genie(){
  return wrap(
    shadow(92)+
    /* 身体（长袍） */
    '<path d="M30 88 Q32 60 50 56 Q68 60 70 88 Z" fill="#7a3ad0" stroke="#3a0a70" stroke-width="2.2" stroke-linejoin="round"/>'+
    /* 长袍腰带 */
    '<path d="M40 72 L60 72" stroke="#e8c25c" stroke-width="2"/>'+
    /* 头部 */
    '<circle cx="50" cy="42" r="14" fill="#c8a0f0" stroke="#3a0a70" stroke-width="2.2"/>'+
    /* 头巾 */
    '<path d="M36 42 Q36 28 50 26 Q64 28 64 42 Q60 36 50 36 Q40 36 36 42 Z" fill="#7a3ad0" stroke="#3a0a70" stroke-width="1.8" stroke-linejoin="round"/>'+
    /* 头巾宝珠 */
    '<circle cx="50" cy="24" r="3" fill="#e8c25c" stroke="#3a0a70" stroke-width="1.2"/>'+
    /* 眼睛 */
    '<ellipse cx="45" cy="42" rx="1.6" ry="2" fill="#0a0a0a"/>'+
    '<ellipse cx="55" cy="42" rx="1.6" ry="2" fill="#0a0a0a"/>'+
    /* 微笑 */
    '<path d="M46 48 Q50 51 54 48" stroke="#3a0a70" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
    /* 双臂 */
    '<path d="M30 70 Q24 76 26 84" stroke="#3a0a70" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    '<path d="M70 70 Q76 76 74 84" stroke="#3a0a70" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    /* 发光 */
    hl(44,36,4,2,.6)
  );
}

/* ───── Wild（金 W + 光环） ───── */
function wild(){
  return wrap(
    /* 光环底 */
    '<circle cx="50" cy="50" r="42" fill="none" stroke="#e8c25c" stroke-width="1" opacity=".5"/>'+
    '<circle cx="50" cy="50" r="38" fill="none" stroke="#e8c25c" stroke-width=".8" opacity=".35"/>'+
    /* W */
    '<path d="M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32" fill="none" stroke="#e8c25c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<path d="M18 32 L28 72 L40 50 L50 72 L60 50 L72 72 L82 32" fill="none" stroke="#0a0a0a" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>'+
    /* 高光 */
    '<path d="M22 34 L28 56" stroke="#fff" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>'+
    /* 火花 */
    '<path d="M50 14 L52 20 L58 22 L52 24 L50 30 L48 24 L42 22 L48 20 Z" fill="#ffe9a0" opacity=".9"/>'
  );
}

/* ───── Scatter（金色星月） ───── */
function scatter(){
  return wrap(
    /* 底圆 */
    '<circle cx="50" cy="50" r="34" fill="#f0a020" stroke="#7a4008" stroke-width="2.6"/>'+
    '<circle cx="50" cy="50" r="30" fill="none" stroke="#ffe9a0" stroke-width="1" opacity=".6"/>'+
    /* 中央星 */
    '<path d="M50 26 L53 40 L68 42 L53 44 L50 58 L47 44 L32 42 L47 40 Z" fill="#fff8d0" stroke="#7a4008" stroke-width="1.2" stroke-linejoin="round"/>'+
    /* 周围小星 */
    '<path d="M72 68 L73 72 L77 73 L73 74 L72 78 L71 74 L67 73 L71 72 Z" fill="#fff8d0" opacity=".9"/>'+
    '<path d="M28 30 L29 34 L33 35 L29 36 L28 40 L27 36 L23 35 L27 34 Z" fill="#fff8d0" opacity=".8"/>'+
    hl(38,34,8,5,.55)
  );
}

window.Sym_1001_mg = {
  ten:   function(){return letterCard('10','#e8c25c');},
  jack:  function(){return letterCard('J','#c8a8f0');},
  queen: function(){return letterCard('Q','#c8a8f0');},
  king:  function(){return letterCard('K','#c8a8f0');},
  ace:   function(){return letterCard('A','#e8c25c');},
  lamp:  lamp,
  carpet:carpet,
  palace:palace,
  genie: genie,
  wild:  wild,
  scatter:scatter
};
})();
