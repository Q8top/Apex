/* Sweet · Event Bus
   模块间唯一通信方式。
   禁止跨模块直接调用彼此内部函数。
*/
(function(){
'use strict';

var map = {};

function on(name, fn){
  if (!map[name]) map[name] = [];
  map[name].push(fn);
}
function off(name, fn){
  if (!map[name]) return;
  var idx = map[name].indexOf(fn);
  if (idx >= 0) map[name].splice(idx, 1);
}
function emit(name, data){
  if (!map[name]) return;
  var list = map[name].slice();
  for (var i = 0; i < list.length; i++) {
    try { list[i](data); } catch(e){ console.error('[SweetEvent] ' + name, e); }
  }
}
function clear(){ map = {}; }

window.SweetEvents = { on: on, off: off, emit: emit, clear: clear };
})();
