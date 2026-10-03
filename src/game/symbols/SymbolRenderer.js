/* Apex · SymbolRenderer
   统一渲染入口：缓存 + 分层规范
   每个 Symbol 输出 <svg viewBox="0 0 100 100">...</svg>
*/
(function(){
'use strict';

var cache = new Map();

function wrap(inner){
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + inner + '</svg>';
}

/* 底部软阴影（椭圆 + 降低不透明度） */
function softShadow(cx, cy, rx, ry, mat){
  var op = (mat && mat.softShadow) || 0.16;
  return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#000" opacity="'+op+'"/>';
}

/* 顶部高光（白色椭圆） */
function topHighlight(cx, cy, rx, ry, mat){
  var op = (mat && mat.topHighlight) || 0.6;
  return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+op+'"/>';
}

/* 边缘光（左上白色细线） */
function rimLight(d, mat, w){
  var op = (mat && mat.rimLight) || 0.45;
  var stroke = (mat && mat.rimColor) || '#ffffff';
  var sw = w || 1.4;
  return '<path d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" opacity="'+op+'" stroke-linecap="round"/>';
}

/* 底部反射（浅色曲线） */
function reflection(d, mat){
  var op = (mat && mat.bottomReflection) || 0.18;
  return '<path d="'+d+'" fill="none" stroke="#fff" stroke-width="1" opacity="'+op+'" stroke-linecap="round"/>';
}

/* 主描边（深色） */
function outline(d, mat, fill){
  var stroke = (mat && mat.outline) || '#0a0a0a';
  var sw = (mat && mat.outlineW) || 2.2;
  return '<path d="'+d+'" fill="'+(fill||'none')+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';
}

window.SymbolRenderer = {
  wrap: wrap,
  softShadow: softShadow,
  topHighlight: topHighlight,
  rimLight: rimLight,
  reflection: reflection,
  outline: outline,

  render: function(id){
    if (cache.has(id)) return cache.get(id);
    var svg = '';
    if (window.SweetCandySymbols && window.SweetCandySymbols[id]) {
      svg = window.SweetCandySymbols[id]();
    } else if (window.SweetFruitSymbols && window.SweetFruitSymbols[id]) {
      svg = window.SweetFruitSymbols[id]();
    } else if (window.SweetScatterSymbols && window.SweetScatterSymbols[id]) {
      svg = window.SweetScatterSymbols[id]();
    }
    cache.set(id, svg);
    return svg;
  },

  clearCache: function(){ cache.clear(); }
};
})();
