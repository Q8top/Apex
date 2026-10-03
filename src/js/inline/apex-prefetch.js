/* Apex · 悬停/触摸预加载（点击卡片前预取目标页） */
(function(){
'use strict';

var cache = {};

function prefetch(url){
  if (!url) return;
  if (cache[url]) return;
  cache[url] = 1;
  try {
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  } catch(e){}
}

function pickUrl(el){
  if (!el) return null;
  var href = el.getAttribute('href');
  if (!href) return null;
  if (href.charAt(0) === '#') return null;
  if (href.indexOf('javascript:') === 0) return null;
  if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('//') === 0) return null;
  return href;
}

/* 桌面：鼠标悬停 <a> 时预取 */
document.addEventListener('mouseover', function(e){
  var a = e.target.closest ? e.target.closest('a[href]') : null;
  var url = pickUrl(a);
  if (url) prefetch(url);
}, { passive: true, capture: true });

/* 移动端：touchstart 立即预取 */
document.addEventListener('touchstart', function(e){
  var a = e.target.closest ? e.target.closest('a[href]') : null;
  var url = pickUrl(a);
  if (url) prefetch(url);
}, { passive: true, capture: true });

/* 首页游戏卡片：hover/touch 时预取详情页 */
document.addEventListener('mouseover', function(e){
  var c = e.target.closest ? e.target.closest('.apex-game-card') : null;
  if (!c) return;
  var gid = c.getAttribute('data-game');
  if (!gid) return;
  prefetch('/game.html?id=' + encodeURIComponent(gid));
}, { passive: true });

document.addEventListener('touchstart', function(e){
  var c = e.target.closest ? e.target.closest('.apex-game-card') : null;
  if (!c) return;
  var gid = c.getAttribute('data-game');
  if (!gid) return;
  prefetch('/game.html?id=' + encodeURIComponent(gid));
}, { passive: true });

window.ApexPrefetch = { prefetch: prefetch };
})();
