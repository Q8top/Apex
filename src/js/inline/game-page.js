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
    { name: '皇冠',   v: ['5x',   '12x', '25x'],  max: true,  svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset=".3" stop-color="#fbbf24"/><stop offset=".7" stop-color="#d97706"/><stop offset="1" stop-color="#78350f"/></linearGradient><linearGradient id="cwb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b45309"/><stop offset=".5" stop-color="#fcd34d"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><path d="M3 22 L4 8 L10 15 L16 5 L22 15 L28 8 L29 22 Z" fill="url(#cw)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 8 L10 15 L16 5 L22 15 L28 8 L28.5 10 L22 17 L16 7 L10 17 L4.5 10 Z" fill="#fef9c3" opacity=".55"/><circle cx="16" cy="12" r="2.2" fill="#dc2626" stroke="#7f1d1d" stroke-width=".8"/><circle cx="15.3" cy="11.3" r=".9" fill="#fca5a5" opacity=".9"/><circle cx="8" cy="17" r="1.5" fill="#3b82f6" stroke="#1e3a8a" stroke-width=".7"/><circle cx="7.6" cy="16.6" r=".5" fill="#bfdbfe"/><circle cx="24" cy="17" r="1.5" fill="#10b981" stroke="#065f46" stroke-width=".7"/><circle cx="23.6" cy="16.6" r=".5" fill="#6ee7b7"/><circle cx="16" cy="5" r="1.2" fill="#fef3c7" stroke="#78350f" stroke-width=".6"/><rect x="3" y="22" width="26" height="3" rx="1" fill="url(#cwb)" stroke="#78350f" stroke-width="1"/><rect x="4.5" y="22.7" width="23" height=".9" fill="#fef3c7" opacity=".7"/><rect x="4.5" y="24.2" width="23" height=".5" fill="#451a03" opacity=".3"/></svg>' },
    { name: '红宝石', v: ['2.5x', '6x',  '15x'],  max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="rga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fca5a5"/><stop offset=".45" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient><linearGradient id="rgb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fca5a5"/><stop offset="1" stop-color="#fecaca"/></linearGradient></defs><path d="M16 2 L28 11 L16 30 L4 11 Z" fill="url(#rga)" stroke="#7f1d1d" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 2 L28 11 L16 11 Z" fill="#fca5a5" opacity=".95"/><path d="M16 2 L4 11 L16 11 Z" fill="url(#rgb)" opacity=".85"/><path d="M4 11 L16 11 L16 30 Z" fill="#7f1d1d" opacity=".45"/><path d="M28 11 L16 11 L16 30 Z" fill="#ef4444" opacity=".25"/><path d="M16 2 L28 11" stroke="#fca5a5" stroke-width=".7" opacity=".9" fill="none"/><path d="M16 2 L4 11" stroke="#fca5a5" stroke-width=".7" opacity=".6" fill="none"/><path d="M14 5 L15.8 4 L16.4 8.5 L14.8 9.2 Z" fill="#ffffff" opacity=".8"/><circle cx="11" cy="9" r=".8" fill="#ffffff" opacity=".85"/><circle cx="21" cy="12" r=".6" fill="#ffffff" opacity=".6"/></svg>' },
    { name: '紫宝石', v: ['1.5x', '4x',  '10x'],  max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="pga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b4fe"/><stop offset=".45" stop-color="#a855f7"/><stop offset="1" stop-color="#581c87"/></linearGradient><linearGradient id="pgb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8b4fe"/><stop offset="1" stop-color="#e9d5ff"/></linearGradient></defs><path d="M16 2 L28 11 L16 30 L4 11 Z" fill="url(#pga)" stroke="#581c87" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 2 L28 11 L16 11 Z" fill="#d8b4fe" opacity=".95"/><path d="M16 2 L4 11 L16 11 Z" fill="url(#pgb)" opacity=".85"/><path d="M4 11 L16 11 L16 30 Z" fill="#581c87" opacity=".45"/><path d="M28 11 L16 11 L16 30 Z" fill="#a855f7" opacity=".25"/><path d="M16 2 L28 11" stroke="#d8b4fe" stroke-width=".7" opacity=".9" fill="none"/><path d="M16 2 L4 11" stroke="#d8b4fe" stroke-width=".7" opacity=".6" fill="none"/><path d="M14 5 L15.8 4 L16.4 8.5 L14.8 9.2 Z" fill="#ffffff" opacity=".8"/><circle cx="11" cy="9" r=".8" fill="#ffffff" opacity=".85"/><circle cx="21" cy="12" r=".6" fill="#ffffff" opacity=".6"/></svg>' },
    { name: '黄宝石', v: ['1x',   '2.5x','8x'],   max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="yga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset=".45" stop-color="#facc15"/><stop offset="1" stop-color="#713f12"/></linearGradient><linearGradient id="ygb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#fef9c3"/></linearGradient></defs><path d="M16 2 L28 11 L16 30 L4 11 Z" fill="url(#yga)" stroke="#713f12" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 2 L28 11 L16 11 Z" fill="#fef08a" opacity=".95"/><path d="M16 2 L4 11 L16 11 Z" fill="url(#ygb)" opacity=".85"/><path d="M4 11 L16 11 L16 30 Z" fill="#713f12" opacity=".45"/><path d="M28 11 L16 11 L16 30 Z" fill="#facc15" opacity=".25"/><path d="M16 2 L28 11" stroke="#fef08a" stroke-width=".7" opacity=".9" fill="none"/><path d="M16 2 L4 11" stroke="#fef08a" stroke-width=".7" opacity=".6" fill="none"/><path d="M14 5 L15.8 4 L16.4 8.5 L14.8 9.2 Z" fill="#ffffff" opacity=".8"/><circle cx="11" cy="9" r=".8" fill="#ffffff" opacity=".85"/><circle cx="21" cy="12" r=".6" fill="#ffffff" opacity=".6"/></svg>' },
    { name: '绿宝石', v: ['0.8x', '2x',  '6x'],   max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="gga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ee7b7"/><stop offset=".45" stop-color="#10b981"/><stop offset="1" stop-color="#064e3b"/></linearGradient><linearGradient id="ggb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6ee7b7"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient></defs><path d="M16 2 L28 11 L16 30 L4 11 Z" fill="url(#gga)" stroke="#064e3b" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 2 L28 11 L16 11 Z" fill="#6ee7b7" opacity=".95"/><path d="M16 2 L4 11 L16 11 Z" fill="url(#ggb)" opacity=".85"/><path d="M4 11 L16 11 L16 30 Z" fill="#064e3b" opacity=".45"/><path d="M28 11 L16 11 L16 30 Z" fill="#10b981" opacity=".25"/><path d="M16 2 L28 11" stroke="#6ee7b7" stroke-width=".7" opacity=".9" fill="none"/><path d="M16 2 L4 11" stroke="#6ee7b7" stroke-width=".7" opacity=".6" fill="none"/><path d="M14 5 L15.8 4 L16.4 8.5 L14.8 9.2 Z" fill="#ffffff" opacity=".8"/><circle cx="11" cy="9" r=".8" fill="#ffffff" opacity=".85"/><circle cx="21" cy="12" r=".6" fill="#ffffff" opacity=".6"/></svg>' },
    { name: '蓝宝石', v: ['0.5x', '1.5x','5x'],   max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="bga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset=".45" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient><linearGradient id="bgb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#bfdbfe"/></linearGradient></defs><path d="M16 2 L28 11 L16 30 L4 11 Z" fill="url(#bga)" stroke="#1e3a8a" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 2 L28 11 L16 11 Z" fill="#93c5fd" opacity=".95"/><path d="M16 2 L4 11 L16 11 Z" fill="url(#bgb)" opacity=".85"/><path d="M4 11 L16 11 L16 30 Z" fill="#1e3a8a" opacity=".45"/><path d="M28 11 L16 11 L16 30 Z" fill="#3b82f6" opacity=".25"/><path d="M16 2 L28 11" stroke="#93c5fd" stroke-width=".7" opacity=".9" fill="none"/><path d="M16 2 L4 11" stroke="#93c5fd" stroke-width=".7" opacity=".6" fill="none"/><path d="M14 5 L15.8 4 L16.4 8.5 L14.8 9.2 Z" fill="#ffffff" opacity=".8"/><circle cx="11" cy="9" r=".8" fill="#ffffff" opacity=".85"/><circle cx="21" cy="12" r=".6" fill="#ffffff" opacity=".6"/></svg>' },
    { name: '圣杯',   v: ['0.4x', '1.2x','4x'],   max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="gv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#78350f"/><stop offset=".25" stop-color="#fcd34d"/><stop offset=".5" stop-color="#fef9c3"/><stop offset=".75" stop-color="#fcd34d"/><stop offset="1" stop-color="#78350f"/></linearGradient><linearGradient id="gvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#92400e"/></linearGradient></defs><ellipse cx="16" cy="27" rx="8" ry="1.8" fill="url(#gvs)" stroke="#78350f" stroke-width="1"/><rect x="10" y="24.5" width="12" height="2.5" fill="url(#gvs)" stroke="#78350f" stroke-width=".9"/><rect x="14.4" y="21" width="3.2" height="4" fill="url(#gvs)" stroke="#78350f" stroke-width=".8"/><ellipse cx="16" cy="21" rx="2" ry=".7" fill="#fef9c3" opacity=".5"/><path d="M8 6 L24 6 L23 15 Q22 21 16 22 Q10 21 9 15 Z" fill="url(#gv)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="16" cy="6" rx="8" ry="1.6" fill="url(#gvs)" stroke="#78350f" stroke-width="1"/><ellipse cx="16" cy="6" rx="6.5" ry="1" fill="#78350f" opacity=".5"/><path d="M11 8.5 Q11 15 13.5 19" fill="none" stroke="#ffffff" stroke-width="1" opacity=".7" stroke-linecap="round"/><path d="M21 8.5 Q21 15 19 19" fill="none" stroke="#78350f" stroke-width=".8" opacity=".5" stroke-linecap="round"/><circle cx="16" cy="13" r="2" fill="#dc2626" stroke="#7f1d1d" stroke-width=".7"/><circle cx="15.4" cy="12.4" r=".8" fill="#fca5a5" opacity=".9"/><path d="M9 8 Q16 9.5 23 8" fill="none" stroke="#fef3c7" stroke-width=".6" opacity=".6"/></svg>' },
    { name: '沙漏',   v: ['0.3x', '1x',  '3x'],   max: false, svg: '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#451a03"/><stop offset=".25" stop-color="#b45309"/><stop offset=".5" stop-color="#fcd34d"/><stop offset=".75" stop-color="#b45309"/><stop offset="1" stop-color="#451a03"/></linearGradient><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset="1" stop-color="#a16207"/></linearGradient></defs><rect x="5" y="3" width="22" height="3.2" rx="1.2" fill="url(#hg)" stroke="#451a03" stroke-width="1"/><rect x="6" y="3.7" width="20" height=".8" fill="#fef9c3" opacity=".65"/><rect x="5" y="25.8" width="22" height="3.2" rx="1.2" fill="url(#hg)" stroke="#451a03" stroke-width="1"/><rect x="6" y="26.5" width="20" height=".8" fill="#fef9c3" opacity=".65"/><path d="M8.5 6.2 L23.5 6.2 L19.5 12.5 L19.5 19.5 L23.5 25.8 L8.5 25.8 L12.5 19.5 L12.5 12.5 Z" fill="#fef9c3" opacity=".35" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 7.5 L22 7.5 L18.5 12 L13.5 12 Z" fill="url(#hs)"/><path d="M10 7.5 L22 7.5 L18.5 12 L13.5 12 Z" fill="none" stroke="#78350f" stroke-width=".5" opacity=".6"/><path d="M15.5 12.5 L16.5 12.5 L16.3 19.5 L15.7 19.5 Z" fill="#fbbf24"/><path d="M10 24.8 L22 24.8 L16 20 Z" fill="url(#hs)"/><path d="M10 24.8 L22 24.8 L16 20 Z" fill="none" stroke="#78350f" stroke-width=".5" opacity=".6"/><path d="M11 8.5 Q12.5 14 12.7 20" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".7" stroke-linecap="round"/><circle cx="13" cy="9" r=".5" fill="#fef9c3" opacity=".9"/><circle cx="19" cy="9" r=".5" fill="#fef9c3" opacity=".9"/><circle cx="16.8" cy="14" r=".4" fill="#fde047" opacity=".9"/></svg>' }
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

  /* ===== 底栏按钮涟漪 ===== */
  var actionBtns = document.querySelectorAll('.game-action-btn, .game-action-plain, .game-action-primary');
  actionBtns.forEach(function(btn){
    btn.addEventListener('pointerdown', function(e){
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 1.2;
      var sp = document.createElement('span');
      sp.className = 'game-action-ripple';
      sp.style.width = size + 'px';
      sp.style.height = size + 'px';
      sp.style.left = (e.clientX - r.left) + 'px';
      sp.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(sp);
      setTimeout(function(){ if (sp.parentNode) sp.parentNode.removeChild(sp); }, 520);
    });
  });

  /* ===== FAQ 折叠 ===== */
  var FAQ = [
    {q:'这款游戏怎么玩？', a:'在 6×5 的网格上，任意位置集齐 8 个以上同种符号即可获胜，无需连成直线。获胜后符号消失，新符号从上方落下，可能连续触发多次获胜。'},
    {q:'免费旋转怎么触发？', a:'一次旋转中出现 4 个以上闪电 Scatter 符号即触发 15 次免费旋转。期间所有倍率符号累加至本局总倍率，有机会打出更高奖励。'},
    {q:'倍率符号是怎么算的？', a:'每轮旋转中，宙斯可能随机降下 2x 到 2500x 的倍率符号。同一轮内出现的所有倍率会相加合并，作为本局的总倍率。'},
    {q:'最大能赢多少？', a:'单局理论上限为 2500 倍，触发免费旋转并叠加多个高倍率符号时可接近上限。'}
  ];
  var faqBox = document.getElementById('game-faq');
  if (faqBox) {
    faqBox.innerHTML = FAQ.map(function(item, i){
      return '<div class="game-faq-item' + (i===0?' open':'') + '">' +
        '<button type="button" class="game-faq-q" aria-expanded="' + (i===0?'true':'false') + '">' +
        '<span>' + item.q + '</span>' +
        '<i class="ri-arrow-down-s-line" aria-hidden="true"></i>' +
        '</button>' +
        '<div class="game-faq-a"><div class="game-faq-a-inner">' + item.a + '</div></div>' +
        '</div>';
    }).join('');
    faqBox.addEventListener('click', function(e){
      var q = e.target.closest ? e.target.closest('.game-faq-q') : null;
      if (!q) return;
      var item = q.parentNode;
      var isOpen = item.classList.contains('open');
      faqBox.querySelectorAll('.game-faq-item').forEach(function(it){
        it.classList.remove('open');
        var qq = it.querySelector('.game-faq-q');
        if (qq) qq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ===== 相似游戏 ===== */
  var SIMILAR = [
    {id:'sweet',    n:'糖果连连爆', img:'/assets/games/sweet.webp'},
    {id:'sugar',    n:'甜蜜爆奖',   img:'/assets/games/sugar.webp'},
    {id:'starburst',n:'星爆',       img:'/assets/games/starburst.webp'},
    {id:'gonzo',    n:'刚果探险',   img:'/assets/games/gonzo.webp'},
    {id:'fruit',    n:'水果派对',   img:'/assets/games/fruit.webp'},
    {id:'book',     n:'死亡之书',   img:'/assets/games/book.webp'}
  ];
  var similarBox = document.getElementById('game-similar');
  if (similarBox) {
    similarBox.innerHTML = SIMILAR.map(function(g){
      return '<a class="game-similar-card" href="/' + g.id + '.html" aria-label="' + g.n + '">' +
        '<span class="game-similar-cover" style="background-image:url(\'' + g.img + '\')"></span>' +
        '<span class="game-similar-name">' + g.n + '</span>' +
        '</a>';
    }).join('');
  }

  /* ============================================================
     Overlay 游戏层
     ============================================================ */
  (function initOverlay(){
    var overlay = document.getElementById('og-overlay');
    if (!overlay) return;

    /* ============================================================
       粒子系统（canvas）
       ============================================================ */
    var PCanvas = document.getElementById('og-particles');
    var Pctx = PCanvas ? PCanvas.getContext('2d') : null;
    var particles = [];
    var particlesRaf = 0;

    function resizeParticles(){
      if (!PCanvas) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = overlay.clientWidth, h = overlay.clientHeight;
      PCanvas.width = w * dpr;
      PCanvas.height = h * dpr;
      if (Pctx) Pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function particleTick(){
      if (!Pctx || !PCanvas) return;
      var w = overlay.clientWidth, h = overlay.clientHeight;
      Pctx.clearRect(0, 0, w, h);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy += p.g;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.rot += p.vr;
        if (p.life <= 0 || p.y > h + 40) { particles.splice(i, 1); continue; }
        Pctx.save();
        Pctx.globalAlpha = Math.max(0, p.life);
        Pctx.translate(p.x, p.y);
        Pctx.rotate(p.rot);
        Pctx.fillStyle = p.color;
        if (p.shape === 'star') {
          Pctx.shadowBlur = 12;
          Pctx.shadowColor = p.color;
          Pctx.beginPath();
          for (var j = 0; j < 5; j++) {
            var a = (j * 4 * Math.PI / 5) - Math.PI / 2;
            var r = (j % 2 === 0) ? p.size : p.size * 0.45;
            Pctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          Pctx.closePath();
          Pctx.fill();
        } else {
          Pctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
        }
        Pctx.restore();
      }
      if (particles.length > 0) {
        particlesRaf = requestAnimationFrame(particleTick);
      } else {
        particlesRaf = 0;
        Pctx.clearRect(0, 0, w, h);
      }
    }

    function spawnParticles(x, y, count, colors, opts){
      opts = opts || {};
      for (var i = 0; i < count; i++) {
        var angle = Math.random ? 0 : 0; // 用 crypto
        var buf = new Uint32Array(2);
        crypto.getRandomValues(buf);
        var a = (buf[0] / 4294967296) * Math.PI * 2;
        var sp = 3 + (buf[1] / 4294967296) * 6;
        var col = colors[Math.floor((buf[0] / 4294967296) * colors.length)] || '#f4d47a';
        particles.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 3,
          g: opts.gravity !== undefined ? opts.gravity : 0.25,
          size: opts.size || (3 + ((buf[1] / 4294967296) * 4)),
          color: col,
          life: 1.0,
          decay: 0.012 + ((buf[0] / 4294967296) * 0.01),
          rot: (buf[1] / 4294967296) * Math.PI,
          vr: ((buf[0] / 4294967296) - 0.5) * 0.4,
          shape: opts.shape || 'rect'
        });
      }
      if (!particlesRaf) particlesRaf = requestAnimationFrame(particleTick);
    }

    /* 中奖时全屏爆发 */
    function burstFromCell(cellEl, isBig){
      if (!cellEl) return;
      var rect = cellEl.getBoundingClientRect();
      var ovRect = overlay.getBoundingClientRect();
      var x = rect.left - ovRect.left + rect.width * 0.5;
      var y = rect.top - ovRect.top + rect.height * 0.5;
      var colors = ['#f4d47a', '#fde68a', '#fff8dc', '#fbbf24', '#d4a017'];
      spawnParticles(x, y, isBig ? 24 : 12, colors, { shape: 'star', size: 6 + (isBig ? 3 : 0) });
    }

    /* 屏幕震动 */
    function shake(heavy){
      if (!overlay) return;
      if (!state.shake) return;
      var cls = heavy ? 'shake-heavy' : 'shake-light';
      overlay.classList.remove('shake-light', 'shake-heavy');
      void overlay.offsetWidth;
      overlay.classList.add(cls);
      setTimeout(function(){ overlay.classList.remove(cls); }, 600);
    }

    /* 全屏金闪 */
    var flashEl = document.getElementById('og-flash');
    function flash(){
      if (!flashEl) return;
      flashEl.classList.remove('show');
      void flashEl.offsetWidth;
      flashEl.classList.add('show');
    }

    /* 数字滚动 */
    function animateNumber(el, from, to, duration){
      if (!el) return;
      var start = performance.now();
      function tick(now){
        var t = (now - start) / duration;
        if (t > 1) t = 1;
        var e = 1 - Math.pow(1 - t, 3);
        var v = from + (to - from) * e;
        el.textContent = (v < 0 ? '-' : '+') + '¥' + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resizeParticles);
    setTimeout(resizeParticles, 100);

    // 安全随机整数（项目硬约束：禁普通伪随机）
    function randInt(n){
      var buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % n;
    }

    var gridEl  = document.getElementById('og-grid');
    var closeBtn= document.getElementById('og-close');
    var modeEl  = document.getElementById('og-mode');
    var betDisp = document.getElementById('og-bet-disp');
    var betDec  = document.getElementById('og-bet-dec');
    var betInc  = document.getElementById('og-bet-inc');
    var balanceEl = document.getElementById('og-balance');
    var winTotalEl= document.getElementById('og-win-total');
    var curWinVal = document.getElementById('og-current-win-value');
    var winBanner = document.getElementById('og-win');
    var winAmt    = document.getElementById('og-win-amt');
    var spinBtn   = document.getElementById('og-spin');

    var E = window.ApexOlympus;
    var A = window.ApexAudio;
    if (!E) { console.error('[Apex] 引擎未加载'); return; }

    var state = {
      mode: 'demo',
      balance: 1000,
      bet: 10,
      win: 0,
      spinning: false,
      sound: true,
      grid: null,
      inFreeSpins: false,
      auto: false,
      autoTimer: null,
      autoCount: 0,
      music: true,
      shake: true,
      fast: false
    };

    // -------- 渲染网格 --------
    var SYM_LIB = window.ApexOlympusSymbols;
    function renderGrid(grid, animate){
      var html = '';
      for (var r = 0; r < E.ROWS; r++) {
        for (var c = 0; c < E.COLS; c++) {
          var sym = grid[r][c];
          var def = E.SYMBOLS[sym];
          var svg = SYM_LIB ? SYM_LIB.byIndex(sym) : '';
          var cls = 'og-cell sym-' + sym + (animate ? ' dropping' : '');
          var style = animate ? ' style="animation-delay:' + ((c * 40 + r * 25) + 'ms') + '"' : '';
          html += '<div class="' + cls + '" data-r="' + r + '" data-c="' + c + '" data-sym="' + def.name + '"' + style + '>' + svg + '</div>';
        }
      }
      gridEl.innerHTML = html;
    }

    // -------- 标记中奖 --------
    function markWins(hits, removed){
      var cells = gridEl.querySelectorAll('.og-cell');
      var winEls = [];
      cells.forEach(function(el){
        var key = el.getAttribute('data-r') + ',' + el.getAttribute('data-c');
        if (removed.indexOf(key) >= 0) { el.classList.add('winning'); winEls.push(el); }
      });
      if (A && hits && hits.length > 0) {
        var maxTier = 0;
        hits.forEach(function(h){ if (h.tier > maxTier) maxTier = h.tier; });
        A.sWin(maxTier);
      }
      if (winEls.length > 0) {
        var big = winEls.length >= 10;
        winEls.slice(0, 8).forEach(function(el){
          burstFromCell(el, big);
        });
        // 只有大赢才震屏（普通中奖不震，避免影响体验）
        if (big) {
          shake(true);
          flash();
        }
      }
    }

    // -------- 移除并掉落 --------
    function removeAndDrop(removed, newGrid, nextCb){
      var cells = gridEl.querySelectorAll('.og-cell');
      cells.forEach(function(el){
        var key = el.getAttribute('data-r') + ',' + el.getAttribute('data-c');
        if (removed.indexOf(key) >= 0) el.classList.add('removing');
      });
      setTimeout(function(){
        if (A) A.sTumble();
        renderGrid(newGrid, true);
        setTimeout(nextCb, 500);
      }, 380);
    }

    // -------- 格式化金额 --------
    function money(n){
      return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // -------- 更新 HUD --------
    function updateHud(){
      if (balanceEl) balanceEl.textContent = money(state.balance);
      if (betDisp)   betDisp.textContent   = money(state.bet);
      var hudBet = document.getElementById('og-hud-bet');
      if (hudBet) hudBet.textContent = money(state.bet);
      if (winTotalEl) winTotalEl.textContent = money(state.win);
    }

    // -------- 余额操作按钮 --------
    var balanceAction = document.getElementById('og-balance-action');
    var balanceActionLabel = document.getElementById('og-balance-action-label');
    function updateBalanceAction(){
      if (!balanceAction || !balanceActionLabel) return;
      if (state.mode === 'demo') {
        balanceAction.setAttribute('data-action', 'reset');
        balanceActionLabel.textContent = '重置余额';
      } else {
        balanceAction.setAttribute('data-action', 'recharge');
        balanceActionLabel.textContent = '充值余额';
      }
    }

    // -------- 打开 / 关闭 --------
    function open(mode){
      state.mode = mode;
      state.balance = (mode === 'demo') ? 1000 : 0;
      state.bet = 10;
      state.win = 0;
      stopAuto();
      if (modeEl) modeEl.textContent = (mode === 'demo') ? '试玩模式' : '真实模式';
      overlay.setAttribute('data-mode', mode);
      updateBalanceAction();
      // 首次生成
      var cfg = E.CONFIG[mode];
      state.grid = E.makeGrid(cfg);
      renderGrid(state.grid, true);
      updateHud();
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (A) { A.unlock(); A.bgmStart('base'); }
      syncSettings();
    }
    function close(){
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (A) A.bgmStop();
      stopAuto();
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    var trialBtn = document.getElementById('game-trial');
    if (trialBtn) trialBtn.addEventListener('click', function(){ open('demo'); });
    var startBtn = document.getElementById('game-start');
    if (startBtn) startBtn.addEventListener('click', function(){ open('real'); });

    // 下注 -/+
    var BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    if (betDec) betDec.addEventListener('click', function(){
      var i = BET_STEPS.indexOf(state.bet);
      if (i > 0) { state.bet = BET_STEPS[i-1]; updateHud(); if (A) A.sClick(); }
    });
    if (betInc) betInc.addEventListener('click', function(){
      var i = BET_STEPS.indexOf(state.bet);
      if (i >= 0 && i < BET_STEPS.length - 1) { state.bet = BET_STEPS[i+1]; updateHud(); if (A) A.sClick(); }
    });

    // 声音开关
    var soundBtn = document.getElementById('og-sound');
    function updateSoundIcon(){
      if (!soundBtn) return;
      var ic = soundBtn.querySelector('i');
      if (ic) ic.className = state.sound ? 'ri-volume-up-line' : 'ri-volume-mute-line';
    }
    if (soundBtn) soundBtn.addEventListener('click', function(){
      state.sound = !state.sound;
      updateSoundIcon();
      if (A) A.setEnabled(state.sound);
    });

    // 重置/充值余额
    if (balanceAction) {
      balanceAction.addEventListener('click', function(){
        var action = balanceAction.getAttribute('data-action');
        if (action === 'reset') {
          state.balance = 1000;
          state.win = 0;
          updateHud();
          if (A) A.sClick();
        } else {
          if (window.__apexCharge) window.__apexCharge();
          else alert('充值功能开发中');
        }
      });
    }

    // -------- 旋转（核心） --------
    function showWin(amount){
      if (curWinVal) {
        curWinVal.textContent = '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        curWinVal.classList.add('win');
      }
      if (!winBanner || !winAmt) return;
      winBanner.classList.add('show');
      animateNumber(winAmt, 0, amount, 900);
      setTimeout(function(){ winBanner.classList.remove('show'); }, 1800);
      // 大赢音效 + 震屏
      if (A && amount > state.bet * 50) {
        A.sBigWin();
        shake(true);
        flash();
      }
    }

    // ============ 弹层控制 ============
    function openModal(id){
      var m = document.getElementById(id);
      if (!m) return;
      m.classList.add('show');
      m.setAttribute('aria-hidden', 'false');
      if (A) A.sClick();
    }
    function closeModal(m){
      m.classList.remove('show');
      m.setAttribute('aria-hidden', 'true');
      if (A) A.sClick();
    }
    document.querySelectorAll('.og-modal').forEach(function(m){
      m.addEventListener('click', function(e){
        if (e.target.closest && e.target.closest('[data-close]')) closeModal(m);
      });
    });

    // ============ 赔付表 ============
    function renderPaytable(){
      var box = document.getElementById('og-paytable-body');
      if (!box) return;
      var SYM_LIB = window.ApexOlympusSymbols;
      var html = '<div class="og-paytable-head"><span>符号</span><span>8 连</span><span>10 连</span><span>12+ 连</span></div>';
      for (var i = 0; i <= 7; i++) {
        var def = E.SYMBOLS[i];
        var svg = SYM_LIB ? SYM_LIB.byIndex(i) : '';
        var v = def.pay;
        var maxCls = (i === 0) ? ' og-paytable-val--max' : '';
        html += '<div class="og-paytable-row">' +
          '<span class="og-paytable-sym">' + svg + '</span>' +
          '<span class="og-paytable-name">' + def.name + '</span>' +
          '<span class="og-paytable-val">' + v[0] + 'x</span>' +
          '<span class="og-paytable-val">' + v[1] + 'x</span>' +
          '<span class="og-paytable-val' + maxCls + '">' + v[2] + 'x</span>' +
          '</div>';
      }
      var wildSvg = SYM_LIB ? SYM_LIB.byIndex(8) : '';
      var scatSvg = SYM_LIB ? SYM_LIB.byIndex(9) : '';
      html += '<div class="og-paytable-row">' +
        '<span class="og-paytable-sym">' + wildSvg + '</span>' +
        '<span class="og-paytable-name">WILD</span>' +
        '<span class="og-paytable-val" style="grid-column: span 3; text-align:right; color:#8a8a8e; font-size:11px; font-weight:500;">代替除 SCATTER 外任意符号</span>' +
        '</div>';
      html += '<div class="og-paytable-row">' +
        '<span class="og-paytable-sym">' + scatSvg + '</span>' +
        '<span class="og-paytable-name">SCATTER</span>' +
        '<span class="og-paytable-val" style="grid-column: span 3; text-align:right; color:#8a8a8e; font-size:11px; font-weight:500;">4/5/6 个触发 15/20/25 次免费旋转</span>' +
        '</div>';
      box.innerHTML = html;
    }

    // ============ 记录（按模式分离）============
    var history = [];  // 全部记录

    function pushHistory(bet, win, mode, extra){
      var now = new Date();
      var t = ('0'+now.getHours()).slice(-2) + ':' + ('0'+now.getMinutes()).slice(-2) + ':' + ('0'+now.getSeconds()).slice(-2);
      extra = extra || {};
      history.unshift({
        time: t,
        bet: bet,
        win: win,
        mode: mode,           // 'demo' / 'real' / 'demo+fs' / 'real+fs'
        fs: extra.fs || 0,
        mult: extra.mult || 1,
        scatter: extra.scatter || 0,
        tumbles: extra.tumbles || 0,
        big: extra.big || false
      });
      if (history.length > 200) history.pop();
      renderHistory();
    }

    /* 按当前模式过滤 */
    function currentList(){
      var m = state.mode === 'demo' ? 'demo' : 'real';
      return history.filter(function(h){ return h.mode.indexOf(m) === 0; });
    }

    function calcStats(list){
      var spins = list.length;
      var totalBet = 0, totalWin = 0;
      list.forEach(function(h){ totalBet += h.bet; totalWin += h.win; });
      var net = totalWin - totalBet;
      var spinsEl = document.getElementById('og-hs-spins');
      if (!spinsEl) return;
      spinsEl.textContent = spins;
      document.getElementById('og-hs-bet').textContent = '¥' + totalBet.toFixed(2);
      document.getElementById('og-hs-win').textContent = '¥' + totalWin.toFixed(2);
      var netEl = document.getElementById('og-hs-net');
      netEl.textContent = (net >= 0 ? '+' : '') + '¥' + net.toFixed(2);
      netEl.classList.remove('win', 'lose');
      if (net > 0) netEl.classList.add('win');
      else if (net < 0) netEl.classList.add('lose');
    }

    function renderHistory(){
      var box = document.getElementById('og-history-list');
      if (!box) return;

      var list = currentList();
      calcStats(list);

      // 更新模式标签
      var label = document.getElementById('og-history-mode-label');
      if (label) {
        if (state.mode === 'demo') {
          label.textContent = '试玩';
          label.className = 'og-history-mode-label demo';
        } else {
          label.textContent = '真实';
          label.className = 'og-history-mode-label real';
        }
      }

      if (list.length === 0) {
        box.innerHTML = '<div class="og-history-empty">暂无记录</div>';
        return;
      }

      box.innerHTML = list.map(function(h){
        var net = h.win - h.bet;
        var cls = net > 0 ? ' og-history-amount--win' : (net < 0 ? ' og-history-amount--lose' : '');
        var sign = net > 0 ? '+' : '';
        var tags = '';
        if (h.fs > 0) tags += '<span class="og-history-tag og-history-tag--fs"><i class="ri-flashlight-fill"></i>免费旋转 ×' + h.fs + '</span>';
        if (h.mult > 1) tags += '<span class="og-history-tag og-history-tag--mult">倍率 ×' + h.mult + '</span>';
        if (h.scatter >= 4) tags += '<span class="og-history-tag og-history-tag--scatter">SCATTER ×' + h.scatter + '</span>';
        if (h.tumbles >= 2) tags += '<span class="og-history-tag og-history-tag--tumble">连击 ×' + h.tumbles + '</span>';
        if (h.big) tags += '<span class="og-history-tag og-history-tag--big">大赢</span>';
        var modeLabel = h.mode.indexOf('fs') >= 0 ? (h.mode.indexOf('demo') === 0 ? '试玩·FS' : '真实·FS') : (h.mode === 'demo' ? '试玩' : '真实');

        var detailHtml = '<div class="og-history-detail">';
        detailHtml += '<div class="og-history-detail-row"><span>下注</span><span>¥' + h.bet.toFixed(2) + '</span></div>';
        detailHtml += '<div class="og-history-detail-row"><span>中奖</span><span>¥' + h.win.toFixed(2) + '</span></div>';
        if (h.mult > 1) detailHtml += '<div class="og-history-detail-row"><span>倍率</span><span>×' + h.mult + '</span></div>';
        if (h.fs > 0) detailHtml += '<div class="og-history-detail-row"><span>免费旋转</span><span>' + h.fs + ' 次</span></div>';
        if (h.tumbles > 0) detailHtml += '<div class="og-history-detail-row"><span>连击</span><span>' + h.tumbles + ' 次</span></div>';
        if (h.scatter > 0) detailHtml += '<div class="og-history-detail-row"><span>Scatter</span><span>' + h.scatter + ' 个</span></div>';
        detailHtml += '<div class="og-history-detail-row"><span>净盈亏</span><span>' + sign + '¥' + net.toFixed(2) + '</span></div>';
        detailHtml += '</div>';

        return '<div class="og-history-item' + (h.big ? ' big-win' : '') + '">' +
          '<div class="og-history-line1">' +
            '<span class="og-history-time">' + h.time + '</span>' +
            '<span class="og-history-mode">' + modeLabel + '</span>' +
          '</div>' +
          '<div class="og-history-line2">' +
            '<span>下注 ¥' + h.bet.toFixed(2) + '</span>' +
            '<span>中奖 ¥' + h.win.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="og-history-tags">' + tags + '</div>' +
          '<div class="og-history-amount' + cls + '">' + sign + '¥' + net.toFixed(2) + '</div>' +
          detailHtml +
          '</div>';
      }).join('');

      // 点击展开
      box.querySelectorAll('.og-history-item').forEach(function(it){
        it.addEventListener('click', function(){
          it.classList.toggle('expanded');
        });
      });
    }

    // 清空按钮（只清当前模式的）
    var clearBtn = document.getElementById('og-history-clear');
    if (clearBtn) clearBtn.addEventListener('click', function(){
      var list = currentList();
      if (list.length === 0) return;
      var modeName = state.mode === 'demo' ? '试玩' : '真实';
      if (!confirm('清空全部' + modeName + '记录？')) return;
      var m = state.mode === 'demo' ? 'demo' : 'real';
      history = history.filter(function(h){ return h.mode.indexOf(m) !== 0; });
      renderHistory();
    });

    // ============ 设置菜单（P1-11 补回） ============
    var menuBtn = document.getElementById('og-menu');
    var setSoundBtn = document.getElementById('og-set-sound');
    var setSoundVal = document.getElementById('og-set-sound-val');
    var setMusicBtn = document.getElementById('og-set-music');
    var setMusicVal = document.getElementById('og-set-music-val');
    var setShakeBtn = document.getElementById('og-set-shake');
    var setShakeVal = document.getElementById('og-set-shake-val');
    var setFastBtn = document.getElementById('og-set-fast');
    var setFastVal = document.getElementById('og-set-fast-val');

    function syncSettings(){
      if (setSoundVal) setSoundVal.classList.toggle('on', state.sound);
      if (setMusicVal) setMusicVal.classList.toggle('on', state.music);
      if (setShakeVal) setShakeVal.classList.toggle('on', state.shake);
      if (setFastVal)  setFastVal.classList.toggle('on', state.fast);
    }

    if (menuBtn) menuBtn.addEventListener('click', function(){
      syncSettings();
      openModal('og-menu-modal');
    });
    if (setSoundBtn) setSoundBtn.addEventListener('click', function(){
      state.sound = !state.sound;
      if (A) A.setEnabled(state.sound);
      syncSettings();
      if (A) A.sClick();
    });
    if (setMusicBtn) setMusicBtn.addEventListener('click', function(){
      state.music = !state.music;
      if (A) {
        if (state.music) A.bgmStart('base');
        else A.bgmStop();
      }
      syncSettings();
      if (A && state.music) A.sClick();
    });
    if (setShakeBtn) setShakeBtn.addEventListener('click', function(){
      state.shake = !state.shake;
      syncSettings();
      if (A) A.sClick();
    });
    if (setFastBtn) setFastBtn.addEventListener('click', function(){
      state.fast = !state.fast;
      syncSettings();
      if (A) A.sClick();
    });

    // ============ 绑定弹层按钮 ============    // ============ 绑定弹层按钮 ============
    var paytableBtn = document.getElementById('og-paytable');
    if (paytableBtn) paytableBtn.addEventListener('click', function(){
      renderPaytable();
      openModal('og-paytable-modal');
    });
    var historyBtn = document.getElementById('og-history');
    if (historyBtn) historyBtn.addEventListener('click', function(){
      renderHistory();
      openModal('og-history-modal');
    });
    // 打开 overlay 时重置 renderHistory 显示
    // （open() 里已调用 updateHud，record 会在打开时自动 filter）

    // -------- FS 徽章控制 --------
    var fsBadge = document.getElementById('og-fs-badge');
    var fsCur = document.getElementById('og-fs-cur');
    var fsMax = document.getElementById('og-fs-max');
    var fsMult = document.getElementById('og-fs-mult');

    function showFsBadge(cur, max, mult){
      if (!fsBadge) return;
      var wasShown = fsBadge.classList.contains('show');
      fsBadge.classList.add('show');
      if (fsCur) fsCur.textContent = cur;
      if (fsMax) fsMax.textContent = max;
      if (fsMult) fsMult.textContent = '×' + mult;
      if (A) {
        if (!wasShown && cur === 1) A.sScatter();
        else if (cur > 1) A.sFsTick(cur);
      }
    }
    function updateFsMult(mult){
      if (!fsMult) return;
      fsMult.textContent = '×' + mult;
      fsMult.classList.remove('bump');
      void fsMult.offsetWidth;
      fsMult.classList.add('bump');
    }
    function hideFsBadge(){
      if (fsBadge) fsBadge.classList.remove('show');
    }

    // -------- 通用：播放一串 tumble --------
    function playTumbles(tumbles, onDone){
      var idx = 0;
      function next(){
        if (idx >= tumbles.length) { onDone(); return; }
        var t = tumbles[idx];
        markWins(t.hits, t.removed);
        setTimeout(function(){
          removeAndDrop(t.removed, t.gridAfter, function(){
            idx++;
            setTimeout(next, 180);
          });
        }, 450);
      }
      next();
    }

    // -------- FS 完整播放 --------
    function playFreeSpinsSequence(fsResult, bet){
      var spins = fsResult.spins;
      var idx = 0;
      var totalFsWin = 0;

      function nextSpin(){
        if (idx >= spins.length) {
          hideFsBadge();
          onAllDone();
          return;
        }
        var sp = spins[idx];
        showFsBadge(idx + 1, spins.length, sp.mult > 0 ? sp.mult : 1);

        // 渲染初始网格
        if (sp.tumbles.length > 0) {
          var firstGrid = sp.tumbles[0].gridBefore;
          renderGrid(firstGrid, true);
          setTimeout(function(){
            playTumbles(sp.tumbles, function(){
              totalFsWin += sp.baseWin * (sp.mult > 0 ? sp.mult : 1);
              idx++;
              setTimeout(nextSpin, 300);
            });
          }, 500);
        } else {
          idx++;
          setTimeout(nextSpin, 300);
        }
      }

      function onAllDone(){
        // 累加 FS 总赢
        var totalWin = fsResult.totalWin * bet;
        state.win += totalWin;
        state.balance += totalWin;
        updateHud();
        if (totalWin > 0) showWin(totalWin);
        if (A) A.sFsEnd();
        if (A) A.bgmSetMode('base');
        pushHistory(0, totalWin, state.mode + '+fs', {
          fs: fsResult.played,
          mult: fsResult.finalMult,
          scatter: 0,
          tumbles: 0,
          big: totalWin > bet * 50
        });
        state.spinning = false;
        state.inFreeSpins = false;
        spinBtn.disabled = false;
        maybeAutoNext();
      }

      state.inFreeSpins = true;
      if (A) A.bgmSetMode('fs');
      nextSpin();
    }

    // ============ 自动旋转 ============
    var autoBtn = document.getElementById('og-auto');
    var AUTO_INTERVAL = 700;   // 每轮间隔（ms）
    var AUTO_MAX = 50;         // 最大轮数

    function stopAuto(){
      state.auto = false;
      state.autoCount = 0;
      if (state.autoTimer) { clearTimeout(state.autoTimer); state.autoTimer = null; }
      if (autoBtn) autoBtn.classList.remove('active');
    }
    function maybeAutoNext(){
      if (!state.auto) return;
      if (state.autoCount >= AUTO_MAX) { stopAuto(); return; }
      if (state.mode === 'real' && state.balance < state.bet) { stopAuto(); alert('余额不足'); return; }
      state.autoTimer = setTimeout(function(){
        state.autoCount++;
        spin();
      }, AUTO_INTERVAL);
    }
    if (autoBtn) {
      autoBtn.addEventListener('click', function(){
        if (A) A.sClick();
        if (state.auto) {
          stopAuto();
        } else {
          state.auto = true;
          state.autoCount = 0;
          autoBtn.classList.add('active');
          // 立即开始第一轮
          if (!state.spinning) {
            state.autoCount++;
            spin();
          }
        }
      });
    }
    // 关闭 overlay / 切换模式时停自动
    if (closeBtn) closeBtn.addEventListener('click', stopAuto);

    function spin(){
      if (state.spinning) return;
      if (state.mode === 'real' && state.balance < state.bet) {
        if (state.auto) stopAuto();
        alert('余额不足，请充值');
        return;
      }
      state.spinning = true;
      spinBtn.disabled = true;
      if (A) A.sSpin();

      // 扣注
      if (state.mode === 'real') state.balance -= state.bet;
      state.win = 0;
      updateHud();
      if (curWinVal) { curWinVal.textContent = '¥0.00'; curWinVal.classList.remove('win'); }

      // 跑一局
      var cfg = E.CONFIG[state.mode];
      var result = E.playOnce(cfg);

      // 初始化网格
      state.grid = result.initial;
      renderGrid(state.grid, true);
      if (winBanner) winBanner.classList.remove('show');

      // 依次播放每一轮 tumble
      var roundIdx = 0;
      var totalWin = 0;
      var bet = state.bet;

      function playRound(){
        if (roundIdx >= result.tumbles.length) {
          // 基础局结束
          var baseWin = result.baseWin * bet;
          state.win = baseWin;
          state.balance += baseWin;
          updateHud();

          // 有 FS → 播 FS；没 FS → 收工
          if (result.freeSpins > 0 && result.fsResult) {
            setTimeout(function(){
              showWin(baseWin);
              setTimeout(function(){
                playFreeSpinsSequence(result.fsResult, bet);
              }, 800);
            }, 300);
          } else {
            if (baseWin > 0) showWin(baseWin);
            // 收集本局信息
            var maxTier = 0;
            var totalHits = 0;
            result.tumbles.forEach(function(t){
              t.hits.forEach(function(hh){
                totalHits += hh.count;
                if (hh.tier > maxTier) maxTier = hh.tier;
              });
            });
            pushHistory(bet, baseWin, state.mode, {
              fs: result.freeSpins || 0,
              mult: result.multiplier || 1,
              scatter: result.scatter || 0,
              tumbles: result.tumbles.length,
              big: baseWin > bet * 50
            });
            state.spinning = false;
            spinBtn.disabled = false;
            maybeAutoNext();
          }
          return;
        }

        var t = result.tumbles[roundIdx];
        markWins(t.hits, t.removed);
        setTimeout(function(){
          removeAndDrop(t.removed, t.gridAfter, function(){
            roundIdx++;
            setTimeout(playRound, 200);
          });
        }, 500);
      }

      // 起手
      setTimeout(playRound, 400);
      if (A) A.sDrop();
    }
    if (spinBtn) spinBtn.addEventListener('click', spin);

  })();

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
