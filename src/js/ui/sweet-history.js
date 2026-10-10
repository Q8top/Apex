/* Apex · 游戏记录 Sheet
 * 数据源：内存数组（本轮不作持久化）
 *
 * 不变量：
 *   - push 入口校验 rec 结构，非法输入不污染列表
 *   - MAX 上限 100，超出丢弃最旧
 *   - close 用 clearTimeout 防时序竞态
 *   - ESC 关闭 + 焦点恢复；监听器仅 open 期间挂载
 *   - open/close 幂等
 *   - 所有 innerHTML 内容均为内部数字格式化，无 XSS 面
 *
 * TODO(P2)：金额前缀硬编码 ¥，待 rec 透传 currency 后改为动态。
 */
(function () {
  'use strict';

  var ID = 'sd-history-root';
  var BODY_SEL = '#sd-hist-body';
  var MAX = 100;
  var CLOSE_ANIM_MS = 300;
  var PLACEHOLDER = '—';

  var records = [];

  function isValidRec(rec) {
    if (!rec || typeof rec !== 'object') return false;
    if (!Number.isFinite(Number(rec.betMinor))) return false;
    if (!Number.isFinite(Number(rec.winMinor))) return false;
    if (!Number.isFinite(Number(rec.ts))) return false;
    return true;
  }

  function push(rec) {
    if (!isValidRec(rec)) return false;
    records.unshift({
      ts: Number(rec.ts),
      betMinor: Math.floor(Number(rec.betMinor)),
      winMinor: Math.floor(Number(rec.winMinor))
    });
    if (records.length > MAX) records.length = MAX;
    return true;
  }

  function fmtMoney(minor) {
    var n = Number(minor);
    if (!Number.isFinite(n)) return PLACEHOLDER;
    var yuan = n / 100;
    try {
      return '¥' + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(yuan);
    } catch (e) {
      return '¥' + Number(yuan).toFixed(2);
    }
  }

  function fmtTime(ts) {
    var n = Number(ts);
    if (!Number.isFinite(n)) return PLACEHOLDER;
    var d = new Date(n);
    if (isNaN(d.getTime())) return PLACEHOLDER;
    function p(v) { return v < 10 ? '0' + v : String(v); }
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  // 中奖分级（与 sweet-win-feedback.js 5 档一致）
  function levelOf(winMinor, betMinor) {
    if (!betMinor) return null;
    var r = winMinor / betMinor;
    if (r >= 100) return 'ultra';
    if (r >= 50)  return 'epic';
    if (r >= 20)  return 'mega';
    if (r >= 5)   return 'big';
    if (winMinor > 0) return 'normal';
    return null;
  }

  function renderList() {
    if (!records.length) {
      return '<p class="sd-hist-empty">暂无记录</p>';
    }
    var html = '<ul class="sd-hist-list">';
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var delta = r.winMinor - r.betMinor;
      var cls = delta >= 0 ? 'pos' : 'neg';
      var sign = delta >= 0 ? '+' : '';
      var lv = levelOf(r.winMinor, r.betMinor);
      html += '<li class="sd-hist-item">';
      html += '<span class="sd-hist-time">' + fmtTime(r.ts) + '</span>';
      html += '<span class="sd-hist-bet">下注 ' + fmtMoney(r.betMinor) + '</span>';
      html += '<span class="sd-hist-win">中奖 ' + fmtMoney(r.winMinor) + '</span>';
      html += '<span class="sd-hist-delta ' + cls + '">' + sign + fmtMoney(delta) + '</span>';
      if (lv) html += '<span class="sd-hist-lv sd-hist-lv--' + lv + '"></span>';
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  function build() {
    return ''
      + '<div class="sd-hist-backdrop" data-hist-close="1"></div>'
      + '<div class="sd-hist-panel" role="dialog" aria-modal="true" aria-labelledby="sd-hist-title" tabindex="-1">'
      +   '<div class="sd-hist-handle"></div>'
      +   '<header class="sd-hist-header"><h2 id="sd-hist-title">游戏记录</h2></header>'
      +   '<div class="sd-hist-body" id="sd-hist-body"></div>'
      + '</div>';
  }

  var root = null;
  var panel = null;
  var bodyEl = null;
  var closeTimer = null;
  var escHandler = null;
  var focusBefore = null;

  function lockScroll() {
    if (window.ApexSheetLock) window.ApexSheetLock.lock();
    else document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    if (window.ApexSheetLock) window.ApexSheetLock.unlock();
    else document.body.style.overflow = '';
  }

  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-hist-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-hist-close]')) close();
    });
    document.body.appendChild(root);
    panel = root.querySelector('.sd-hist-panel');
    bodyEl = root.querySelector(BODY_SEL);
    return root;
  }

  function refresh() {
    if (!bodyEl && root) bodyEl = root.querySelector(BODY_SEL);
    if (bodyEl) bodyEl.innerHTML = renderList();
  }

  function bindEsc() {
    if (escHandler) return;
    escHandler = function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) close();
    };
    document.addEventListener('keydown', escHandler);
  }
  function unbindEsc() {
    if (!escHandler) return;
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }

  function open() {
    var r = ensure();
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    var wasOpen = r.classList.contains('is-open');
    refresh();
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');

    if (!wasOpen) {
      lockScroll();
      focusBefore = (document.activeElement && document.activeElement !== document.body)
        ? document.activeElement : null;
      bindEsc();
    }
    if (panel && typeof panel.focus === 'function') {
      try { panel.focus(); } catch (e) {}
    }
  }

  function close() {
    if (!root || !root.classList.contains('is-open')) return;

    root.classList.remove('is-open');
    unlockScroll();
    unbindEsc();

    if (focusBefore && typeof focusBefore.focus === 'function') {
      try { focusBefore.focus(); } catch (e) {}
    }
    focusBefore = null;

    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      closeTimer = null;
      if (root && !root.classList.contains('is-open')) {
        root.setAttribute('hidden', '');
      }
    }, CLOSE_ANIM_MS);
  }

  function clear() {
    records.length = 0;
    if (isOpen()) refresh();   // 打开状态下清空立刻反映
  }

  function isOpen() {
    return !!(root && root.classList.contains('is-open'));
  }

  window.ApexHistory = Object.freeze({
    open: open,
    close: close,
    isOpen: isOpen,
    push: push,
    clear: clear,
    MAX: MAX,
    getRecords: function () { return records.slice(); }
  });
})();
