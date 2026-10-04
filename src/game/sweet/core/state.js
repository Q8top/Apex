/* Sweet · State Machine
   所有游戏流程的唯一状态源。
   每次 spin / FS / settle 均生成新 generation；
   任何 async callback 首行检查 gen === State.gen() 才允许推进。
*/
(function(){
'use strict';

var S = {
  IDLE:         'IDLE',
  SPINNING:     'SPINNING',
  EVALUATING:   'EVALUATING',
  WIN_PRESENT:  'WIN_PRESENT',
  TUMBLE:       'TUMBLE',
  FS_ENTRANCE:  'FS_ENTRANCE',
  FS_ROUND:     'FS_ROUND',
  FS_SUMMARY:   'FS_SUMMARY',
  SETTLING:     'SETTLING',
  ERROR:        'ERROR'
};

var current = S.IDLE;
var generation = 0;
var listeners = [];

function get(){ return current; }
function gen(){ return generation; }
function isCurrent(g){ return g === generation; }

function to(next){
  if (current === next) return;
  var prev = current;
  current = next;
  for (var i = 0; i < listeners.length; i++) {
    try { listeners[i](prev, next); } catch(e){ console.error('[SweetState] listener err', e); }
  }
}

function next(){ generation++; return generation; }

function onTransition(fn){ listeners.push(fn); }

function reset(){ current = S.IDLE; generation++; }

window.SweetState = {
  S: S,
  get: get,
  gen: gen,
  isCurrent: isCurrent,
  to: to,
  next: next,
  onTransition: onTransition,
  reset: reset
};
})();
