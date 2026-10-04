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

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
