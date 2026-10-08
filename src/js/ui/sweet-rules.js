/* Apex · 游戏规则页
 * 全屏 sheet，从底部升起；不依赖 UI 框架
 *
 * 关键不变量：
 *   - open/close 幂等，重复 open 不产生多个 DOM 节点
 *   - close 的收起动画用 clearTimeout 防时序竞态
 *   - 多 sheet 共享 body scroll lock（openCount 计数）
 *   - ESC 关闭 + 焦点恢复；监听器仅在 open 期间挂载
 *   - CONTENT / 导出对象冻结
 *
 * TODO(P2): 文案 i18n 化 —— 需在 i18n.js 补 rules.* 键后
 *          把 CONTENT 换成 i18n key 读取
 */
(function () {
  'use strict';

  var ID = 'sd-rules-root';
  var CLOSE_ANIM_MS = 300;

  var CONTENT = Object.freeze([
    Object.freeze({ h: '玩法说明', p: '6 列 × 5 行棋盘。每次旋转后生成 30 个符号，相同符号数量达标即中奖。' }),
    Object.freeze({ h: '中奖规则', p: 'Pay Anywhere：同一种符号出现 8 个及以上即中奖，位置无需相邻。' }),
    Object.freeze({ h: '连消（Tumble）', p: '中奖符号消失，上方符号下落补位，形成新棋盘；若再次中奖则继续连消，直至无中奖。' }),
    Object.freeze({ h: 'Scatter 棒棒糖', p: '单次旋转出现 4~6 个棒棒糖触发免费旋转：4 个 10 局 / 5 个 12 局 / 6 个 15 局。' }),
    Object.freeze({ h: '免费旋转中再次触发', p: '3 个及以上棒棒糖可再增加 5 局免费旋转。' }),
    Object.freeze({ h: '倍率炸弹', p: '免费旋转期间出现，倍数包括 2× 3× 5× 10× 25× 50× 100×。' }),
    Object.freeze({ h: '下注金额', p: '0.20 / 0.50 / 1 / 2 / 5 / 10 / 20 / 50 / 100，共 9 档。' }),
    Object.freeze({ h: '试玩模式说明', p: '试玩模式使用虚拟余额，仅供体验玩法与规则，不涉及真实资金。' })
  ]);

  // ── 模块级状态 ────────────────────────────────────────────────────
  var root = null;
  var panel = null;
  var closeTimer = null;
  var escHandler = null;
  var focusBefore = null;
  var openCount = 0;   // 共享 scroll lock 计数

  function lockScroll() {
    openCount++;
    if (openCount === 1) document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) document.body.style.overflow = '';
  }

  function build() {
    var html = '';
    html += '<div class="sd-rules-backdrop" data-rules-close="1"></div>';
    html += '<div class="sd-rules-panel" role="dialog" aria-modal="true" aria-labelledby="sd-rules-title" tabindex="-1">';
    html += '<div class="sd-rules-handle"></div>';
    html += '<header class="sd-rules-header"><h2 id="sd-rules-title">游戏规则</h2></header>';
    html += '<div class="sd-rules-body">';
    for (var i = 0; i < CONTENT.length; i++) {
      html += '<section class="sd-rules-block">';
      html += '<h3>' + CONTENT[i].h + '</h3>';
      html += '<p>' + CONTENT[i].p + '</p>';
      html += '</section>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-rules-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-rules-close]')) close();
    });
    document.body.appendChild(root);
    panel = root.querySelector('.sd-rules-panel');
    return root;
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

  function isOpen() {
    return !!(root && root.classList.contains('is-open'));
  }

  window.ApexRules = Object.freeze({
    open: open,
    close: close,
    isOpen: isOpen
  });
})();
