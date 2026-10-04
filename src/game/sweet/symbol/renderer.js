/* Sweet · Symbol Renderer
   职责：symbol key → SVG string，带缓存。
   唯一出口：get(key)。
   不负责 DOM、不负责布局、不负责动画。
*/
(function(){
'use strict';

var cache = new Map();

function get(sym){
  if (cache.has(sym)) return cache.get(sym);
  var S = window.SweetSymbols;
  var svg = (S && S[sym]) ? S[sym]() : '';
  cache.set(sym, svg);
  return svg;
}

function clear(){ cache.clear(); }

function size(){ return cache.size; }

window.SweetSymbolRenderer = {
  get: get,
  clear: clear,
  size: size
};
})();
