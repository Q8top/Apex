/* Gates of Olympus · 详情页交互
 * 收藏 / 在线客服 / 更多菜单 / 未登录拦截 / 返回
 */
(function () {
  'use strict';

  var FAV_KEY = 'apex_favs';
  var GAME_ID = 'olympus';

  var $ = function (sel) { return document.querySelector(sel); };

  // ── 收藏 ──
  function readFavs() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeFavs(o) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(o)); } catch (e) {}
  }
  function isFav() { return !!readFavs()[GAME_ID]; }
  function toggleFav() {
    var o = readFavs();
    if (o[GAME_ID]) { delete o[GAME_ID]; } else { o[GAME_ID] = 1; }
    writeFavs(o);
    renderFavBtn();
    toast(o[GAME_ID] ? '已加入收藏' : '已取消收藏');
  }
  function renderFavBtn() {
    var btn = $('#action-fav');
    if (!btn) return;
    var on = isFav();
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-label', on ? '取消收藏' : '收藏');
    // 图标切换：空心星 ↔ 实心星
    var svg = btn.querySelector('svg');
    if (svg) {
      if (on) {
        svg.setAttribute('fill', 'currentColor');
      } else {
        svg.setAttribute('fill', 'none');
      }
    }
  }

  // ── Toast ──
  function toast(msg, ms) {
    var el = $('#detail-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'detail-toast';
      el.className = 'detail-toast';
      document.body.appendChild(el);
    }
    el.textContent = String(msg || '');
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, ms || 1800);
  }

  // ── Bottom Sheet ──
  function openSheet(title, bodyHtml) {
    closeSheet();
    var wrap = document.createElement('div');
    wrap.className = 'detail-sheet-wrap';
    wrap.id = 'detail-sheet-wrap';
    wrap.innerHTML = ''
      + '<div class="detail-sheet-mask" data-close="1"></div>'
      + '<div class="detail-sheet" role="dialog" aria-modal="true">'
      +   '<div class="detail-sheet-handle"></div>'
      +   '<div class="detail-sheet-head">'
      +     '<span class="detail-sheet-title">' + title + '</span>'
      +     '<button type="button" class="detail-sheet-close" data-close="1" aria-label="关闭">✕</button>'
      +   '</div>'
      +   '<div class="detail-sheet-body">' + bodyHtml + '</div>'
      + '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('show'); });

    wrap.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-close]') : null;
      if (t) closeSheet();
    });

    // 下滑关闭
    var sheet = wrap.querySelector('.detail-sheet');
    var sy = 0, dy = 0, dragging = false;
    sheet.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sy = e.touches[0].clientY;
      dragging = true;
      sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      dy = e.touches[0].clientY - sy;
      if (dy > 0) sheet.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    sheet.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      sheet.style.transform = '';
      if (dy > 100) closeSheet();
      dy = 0;
    }, { passive: true });
  }
  function closeSheet() {
    var w = $('#detail-sheet-wrap');
    if (!w) return;
    w.classList.remove('show');
    setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 260);
  }

  // ── 更多菜单 ──
  function openMore() {
    var fav = isFav();
    var html = ''
      + '<button type="button" class="detail-sheet-item" data-act="fav">'
      +   '<svg viewBox="0 0 24 24" fill="' + (fav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.9 6.1L21 10l-4.5 4.4L17.7 21 12 17.8 6.3 21l1.2-6.6L3 10l6.1-.9L12 3z"/></svg>'
      +   '<span>' + (fav ? '取消收藏' : '加入收藏') + '</span>'
      + '</button>'
      + '<button type="button" class="detail-sheet-item" data-act="share">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>'
      +   '<span>分享给好友</span>'
      + '</button>'
      + '<button type="button" class="detail-sheet-item" data-act="report">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
      +   '<span>举报游戏</span>'
      + '</button>';
    openSheet('更多操作', html);

    var body = document.querySelector('.detail-sheet-body');
    if (!body) return;
    body.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'fav') { toggleFav(); closeSheet(); }
      else if (act === 'share') {
        var url = location.origin + '/olympus.html';
        if (navigator.share) {
          navigator.share({ title: '奥林匹斯之门', text: '来看看这款游戏', url: url }).catch(function () {});
          closeSheet();
        } else {
          try { navigator.clipboard.writeText(url); toast('链接已复制'); } catch (e2) { toast('分享功能受限'); }
          closeSheet();
        }
      } else if (act === 'report') {
        toast('已收到反馈，我们会尽快处理');
        closeSheet();
      }
    });
  }

  // ── 在线客服 ──
  function openSupport() {
    var html = ''
      + '<div class="detail-sheet-text">客服正在接通中……</div>'
      + '<div class="detail-sheet-sub">如需帮助，也可通过首页「我的 → 反馈」联系我们。</div>'
      + '<button type="button" class="detail-sheet-btn" data-close="1">知道了</button>';
    openSheet('在线客服', html);
  }

  // ── 未登录拦截 ──
  var authCache = null; // null=未查 / true / false
  function checkAuth() {
    if (authCache !== null) return Promise.resolve(authCache);
    if (!window.apiClient || !window.apiClient.get) {
      return fetch('/api/me', { credentials: 'include', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { authCache = !!(j && j.success); return authCache; })
        .catch(function () { authCache = false; return false; });
    }
    return window.apiClient.get('/api/me')
      .then(function (j) { authCache = !!(j && j.success); return authCache; })
      .catch(function () { authCache = false; return false; });
  }

  function onStartGame(e) {
    e.preventDefault();
    checkAuth().then(function (ok) {
      if (ok) {
        location.href = '/olympus-play.html?mode=real';
      } else {
        toast('请先登录');
        setTimeout(function () { location.href = '/'; }, 900);
      }
    });
  }

  // ── 返回 ──
  function onBack(e) {
    e.preventDefault();
    if (history.length > 1) {
      history.back();
    } else {
      location.href = '/';
    }
  }

  // ── 绑定 ──
  function bind() {
    var back = document.querySelector('.nav-back');
    if (back) back.addEventListener('click', onBack);

    var menu = document.querySelector('.nav-menu');
    if (menu) menu.addEventListener('click', openMore);

    var fav = document.getElementById('action-fav');
    if (fav) fav.addEventListener('click', toggleFav);

    var sup = document.getElementById('action-support');
    if (sup) sup.addEventListener('click', openSupport);

    var start = document.getElementById('action-start-real');
    if (start) start.addEventListener('click', onStartGame);

    renderFavBtn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
