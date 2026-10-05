/* Apex Olympus · AnimationScheduler
 * 提供统一的动画时长控制 + 定时器管理 + 后台暂停
 */
(function(){
'use strict';

var SPEED = {
  normal: 1.0,
  fast:   1.5,
  ultra:  2.0
};

var state = {
  speed: 'normal',
  paused: false,
  timers: [],       // { id, fn, fireAt }
  rafId: 0
};

/* === 时长缩放：所有动画时长必须走这里 === */
function ms(base){
  var s = SPEED[state.speed] || 1.0;
  return Math.max(16, Math.round(base / s));
}

/* === 设置速度 === */
function setSpeed(name){
  if (!SPEED[name]) name = 'normal';
  state.speed = name;
  console.log('[Apex][anim] speed=' + name + ' (' + SPEED[name] + 'x)');
}

function getSpeed(){ return state.speed; }

/* === 暂停（页面不可见时调用）=== */
function pause(){
  if (state.paused) return;
  state.paused = true;
  if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = 0; }
}

/* === 恢复 === */
function resume(){
  if (!state.paused) return;
  state.paused = false;
}

/* === 统一 setTimeout：返回 id，可被 clear === */
function after(baseMs, fn){
  var delay = ms(baseMs);
  var id = setTimeout(fn, delay);
  return id;
}

/* === 统一 rAF：帧驱动（用于高频动画） === */
function raf(fn){
  var loop = function(t){
    if (state.paused) {
      state.rafId = 0;
      return;
    }
    var keep = fn(t);
    if (keep !== false) state.rafId = requestAnimationFrame(loop);
    else state.rafId = 0;
  };
  state.rafId = requestAnimationFrame(loop);
}

function stopRaf(){
  if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = 0; }
}

/* === visibility 自动暂停/恢复 === */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) pause();
    else resume();
  });
}

/* === 导出 === */
window.ApexAnim = {
  ms: ms,
  setSpeed: setSpeed,
  getSpeed: getSpeed,
  pause: pause,
  resume: resume,
  after: after,
  raf: raf,
  stopRaf: stopRaf,
  SPEED: SPEED
};

console.log('[Apex][anim] AnimationScheduler ready');
})();
