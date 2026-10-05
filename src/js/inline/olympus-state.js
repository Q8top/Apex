/* Apex Olympus · State Machine
 * 显式状态 + 合法转换表，杜绝状态矛盾
 */
(function(){
'use strict';

var TRANSITIONS = {
  IDLE:        ['SPINNING'],
  SPINNING:    ['EVALUATING', 'WINNING', 'COMPLETE'],
  EVALUATING:  ['WINNING', 'COMPLETE'],
  WINNING:     ['TUMBLING', 'MULTIPLIER', 'FS_TRIGGER', 'COMPLETE'],
  TUMBLING:    ['EVALUATING', 'WINNING'],
  MULTIPLIER:  ['WINNING', 'COMPLETE'],
  FS_TRIGGER:  ['FREE_SPINS'],
  FREE_SPINS:  ['WINNING', 'BIG_WIN', 'COMPLETE'],
  BIG_WIN:     ['COMPLETE'],
  COMPLETE:    ['IDLE']
};

var st = {
  current: 'IDLE',
  enteredAt: 0,
  history: [],
  listeners: {}
};

function canTransition(from, to){
  var a = TRANSITIONS[from];
  return a ? a.indexOf(to) >= 0 : false;
}

function enter(name, meta){
  if (name === st.current) return true;
  if (!canTransition(st.current, name)) {
    console.warn('[Apex][state] illegal: ' + st.current + ' -> ' + name);
    return false;
  }
  var prev = st.current;
  st.current = name;
  st.enteredAt = (typeof performance !== 'undefined') ? performance.now() : Date.now();
  st.history.push({ from: prev, to: name, at: st.enteredAt, meta: meta || null });
  if (st.history.length > 200) st.history.shift();
  var hs = st.listeners[name] || [];
  for (var i = 0; i < hs.length; i++) {
    try { hs[i](meta); } catch (e) { /* swallow */ }
  }
  return true;
}

function onEnter(name, fn){
  if (!st.listeners[name]) st.listeners[name] = [];
  st.listeners[name].push(fn);
}

function is(name){ return st.current === name; }

function reset(){
  st.current = 'IDLE';
  st.history = [];
}

window.ApexState = {
  TRANSITIONS: TRANSITIONS,
  enter: enter,
  onEnter: onEnter,
  is: is,
  reset: reset,
  get current(){ return st.current; },
  get history(){ return st.history.slice(); }
};

console.log('[Apex][state] StateMachine ready');
})();
