/* Apex · 页面过渡（淡出 → 跳转 → 淡入） */
(function(){
'use strict';

var DUR_OUT = 200;   // 离开动画 200ms
var DUR_IN  = 260;   // 进入动画 260ms

/* ─── 页面进入：opacity 0 → 1 ─── */
function enter(){
  var b = document.body;
  if(!b) return;
  b.style.transition = 'none';
  b.style.opacity = '0';
  void b.offsetWidth;
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      b.style.transition = 'opacity ' + DUR_IN + 'ms ease';
      b.style.opacity = '1';
    });
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', enter);
} else {
  enter();
}

/* ─── 页面离开：opacity 1 → 0 ─── */
var leaving = false;
function leave(url, useBack){
  if(leaving) return;
  leaving = true;
  var b = document.body;
  if(b){
    b.style.transition = 'opacity ' + DUR_OUT + 'ms ease';
    b.style.opacity = '0';
  }
  setTimeout(function(){
    if(useBack){
      try {
        if(window.history && history.length > 1) { history.back(); return; }
      } catch(e){}
    }
    location.href = url;
  }, DUR_OUT);
}

/* ─── 全局拦截内部 <a> 点击 ─── */
document.addEventListener('click', function(e){
  if(e.defaultPrevented) return;
  if(e.button !== 0) return;          // 只处理左键
  if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // 保留修饰键
  var a = e.target.closest ? e.target.closest('a') : null;
  if(!a) return;
  var href = a.getAttribute('href');
  if(!href) return;
  if(href.charAt(0) === '#') return;
  if(href.indexOf('javascript:') === 0) return;
  if(href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0) return;
  if(a.target === '_blank' || a.hasAttribute('download')) return;
  e.preventDefault();
  var useBack = a.classList.contains('apex-back') || a.hasAttribute('data-back');
  leave(href, useBack);
}, true);

/* ─── 浏览器返回时也要淡入 ─── */
window.addEventListener('pageshow', function(e){
  if(e.persisted){
    var b = document.body;
    if(b){ b.style.transition = 'none'; b.style.opacity = '1'; }
    leaving = false;
  }
});

window.ApexTransition = { leave: leave, enter: enter };
})();
