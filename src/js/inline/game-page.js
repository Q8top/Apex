/* Apex 游戏详情页 - 轮播 + 自动播放 + 圆点 + 分享 + 底部操作
 * 关键设计：用户交互立即 stop()，松手后 PAUSE_AFTER_USER 才 start()
 */
(function(){
'use strict';

var SLIDE_COUNT = 6;
var AUTO_MS = 4000;
var PAUSE_AFTER_USER = 6000;
var SCROLL_GRACE = 900;

function init(){
  var track = document.getElementById('game-track');
  var dotsBox = document.getElementById('game-dots');
  if (!track || !dotsBox) return;

  var PH_SVG = '<svg viewBox="0 0 64 64" class="game-ph-icon" aria-hidden="true"><rect x="6" y="10" width="52" height="44" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="24" r="4" fill="currentColor"/><path d="M10 48 L26 32 L38 44 L46 36 L54 44 L54 50 L10 50 Z" fill="currentColor"/></svg>';

  var slidesHtml = '';
  for (var si = 0; si < SLIDE_COUNT; si++) {
    slidesHtml += '<div class="game-carousel-slide"><div class="game-carousel-placeholder">' + PH_SVG + '<div class="game-ph-label">游戏画面</div></div></div>';
  }
  track.innerHTML = slidesHtml;

  var dotsHtml = '';
  for (var di = 0; di < SLIDE_COUNT; di++) {
    dotsHtml += '<button type="button" class="game-dot' + (di===0?' active':'') + '" data-idx="' + di + '" aria-label="第 ' + (di+1) + ' 张"></button>';
  }
  dotsBox.innerHTML = dotsHtml;

  var dots = dotsBox.querySelectorAll('.game-dot');
  var n = SLIDE_COUNT;
  var cur = 0;
  var timer = null;
  var resumeTimer = null;
  var lastUserAt = 0;
  var lastScrollAt = 0;

  function setActive(i){
    for (var k = 0; k < dots.length; k++) {
      dots[k].classList.toggle('active', k === i);
    }
  }

  function goto(i){
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    var slideW = track.clientWidth;
    if (!slideW) return;
    track.scrollTo({left: i * slideW, behavior: 'smooth'});
    cur = i;
    setActive(i);
  }

  function tick(){
    if (document.hidden) return;
    /* 双保险：用户最近交互过 / 刚滑动过 → 本次不自动 */
    var now = Date.now();
    if (now - lastUserAt < AUTO_MS) return;
    if (now - lastScrollAt < SCROLL_GRACE) return;
    goto(cur + 1);
  }

  function start(){
    stop();
    timer = setInterval(tick, AUTO_MS);
  }
  function stop(){
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* 用户交互：立即停 + 延迟恢复 */
  function pauseByUser(){
    lastUserAt = Date.now();
    stop();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function(){
      resumeTimer = null;
      if (!document.hidden) start();
    }, PAUSE_AFTER_USER);
  }

  /* 滚动时同步圆点 + 记录时间（用户或程序触发的都算） */
  var scrollTick = false;
  track.addEventListener('scroll', function(){
    lastScrollAt = Date.now();
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function(){
      scrollTick = false;
      var w = track.clientWidth;
      if (!w) return;
      var i = Math.round(track.scrollLeft / w);
      if (i < 0) i = 0;
      if (i > n - 1) i = n - 1;
      if (i !== cur) { cur = i; setActive(i); }
    });
  }, {passive: true});

  /* 用户交互事件：任何都能触发暂停 */
  track.addEventListener('pointerdown', pauseByUser, {passive: true});
  track.addEventListener('touchstart', pauseByUser, {passive: true});
  track.addEventListener('mousedown', pauseByUser, {passive: true});
  track.addEventListener('wheel', pauseByUser, {passive: true});

  /* 圆点点击 */
  dotsBox.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.game-dot') : null;
    if (!b) return;
    var i = parseInt(b.getAttribute('data-idx'), 10) || 0;
    lastUserAt = Date.now();
    stop();
    goto(i);
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function(){
      resumeTimer = null;
      if (!document.hidden) start();
    }, PAUSE_AFTER_USER);
  });

  /* 窗口尺寸变化重定位 */
  var resizeTimer = null;
  window.addEventListener('resize', function(){
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      track.scrollTo({left: cur * track.clientWidth, behavior: 'auto'});
    }, 120);
  });

  /* 可见性切换 */
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) stop();
    else start();
  });

  /* 分享按钮 */
  var shareBtn = document.getElementById('game-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', function(){
      var data = {
        title: document.title,
        text: '奥林匹斯 · Apex Global Entertainment',
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function(){});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function(){
          var old = shareBtn.innerHTML;
          shareBtn.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i>';
          setTimeout(function(){ shareBtn.innerHTML = old; }, 1200);
        }).catch(function(){});
      }
    });
  }

  /* 底部操作栏 */
  var favBtn = document.getElementById('game-fav');
  if (favBtn) {
    favBtn.addEventListener('click', function(){
      var on = favBtn.classList.toggle('active');
      var i = favBtn.querySelector('i');
      if (i) i.className = on ? 'ri-star-fill' : 'ri-star-line';
    });
  }
  var supportBtn = document.getElementById('game-support');
  if (supportBtn) {
    supportBtn.addEventListener('click', function(){
      /* 暂无客服入口，先占位 */
    });
  }
  var trialBtn = document.getElementById('game-trial');
  if (trialBtn) {
    trialBtn.addEventListener('click', function(){
      /* 免费试用入口占位 */
    });
  }
  var startBtn = document.getElementById('game-start');
  if (startBtn) {
    startBtn.addEventListener('click', function(){
      /* 开始游戏入口占位 */
    });
  }

  /* ===== 赔付表渲染 ===== */
  var SYMBOLS = [
    {
      name: '皇冠',
      v: ['5x', '12x', '25x'],
      max: true,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 24 L4 12 L10 17 L16 8 L22 17 L28 12 L28 24 Z" fill="#fbbf24" stroke="#a16207" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="6" r="2" fill="#fde047" stroke="#a16207" stroke-width="1.2"/><rect x="4" y="24" width="24" height="3" rx="1" fill="#a16207"/></svg>'
    },
    {
      name: '红宝石',
      v: ['2.5x', '6x', '15x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 12 L16 29 L5 12 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 3 L11 12 L16 12 Z M16 3 L21 12 L16 12 Z" fill="#fca5a5" opacity=".9"/></svg>'
    },
    {
      name: '紫宝石',
      v: ['1.5x', '4x', '10x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 12 L16 29 L5 12 Z" fill="#a855f7" stroke="#6b21a8" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 3 L11 12 L16 12 Z M16 3 L21 12 L16 12 Z" fill="#d8b4fe" opacity=".9"/></svg>'
    },
    {
      name: '黄宝石',
      v: ['1x', '2.5x', '8x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 12 L16 29 L5 12 Z" fill="#facc15" stroke="#854d0e" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 3 L11 12 L16 12 Z M16 3 L21 12 L16 12 Z" fill="#fef08a" opacity=".9"/></svg>'
    },
    {
      name: '绿宝石',
      v: ['0.8x', '2x', '6x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 12 L16 29 L5 12 Z" fill="#10b981" stroke="#065f46" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 3 L11 12 L16 12 Z M16 3 L21 12 L16 12 Z" fill="#6ee7b7" opacity=".9"/></svg>'
    },
    {
      name: '蓝宝石',
      v: ['0.5x', '1.5x', '5x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 12 L16 29 L5 12 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 3 L11 12 L16 12 Z M16 3 L21 12 L16 12 Z" fill="#93c5fd" opacity=".9"/></svg>'
    },
    {
      name: '圣杯',
      v: ['0.4x', '1.2x', '4x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 6 L23 6 L23 14 Q23 20 16 22 Q9 20 9 14 Z" fill="#d4af37" stroke="#78350f" stroke-width="1.5" stroke-linejoin="round"/><rect x="14" y="22" width="4" height="4" fill="#78350f"/><rect x="10" y="26" width="12" height="2.5" rx="1" fill="#78350f"/></svg>'
    },
    {
      name: '沙漏',
      v: ['0.3x', '1x', '3x'],
      max: false,
      svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 4 L23 4 L23 7 L20 12 L20 20 L23 25 L23 28 L9 28 L9 25 L12 20 L12 12 L9 7 Z" fill="#a16207" stroke="#451a03" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 10 L19 10 L17 14 L15 14 Z M13 22 L19 22 L16 18 Z" fill="#fde047" opacity=".85"/></svg>'
    }
  ];

  var rowsEl = document.getElementById('game-payout-rows');
  if (rowsEl) {
    rowsEl.innerHTML = SYMBOLS.map(function(sym){
      var cells = sym.v.map(function(v, i){
        var cls = 'game-payout-val' + (i === 2 && sym.max ? ' game-payout-val--max' : '');
        return '<span class="' + cls + '">' + v + '</span>';
      }).join('');
      return '<div class="game-payout-row">' +
        '<span class="game-payout-symbol">' + sym.svg + sym.name + '</span>' +
        cells +
        '</div>';
    }).join('');
  }

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
