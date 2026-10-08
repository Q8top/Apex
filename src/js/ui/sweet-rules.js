/* Apex · 游戏规则页
 * 全屏 sheet，从底部升起；不依赖 UI 框架
 *
 * 关键不变量：
 *   - open/close 幂等，重复 open 不产生多个 DOM 节点
 *   - close 的收起动画用 clearTimeout 防时序竞态
 *   - 多 sheet 共享 body scroll lock（ApexSheetLock）
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
    Object.freeze({ h: 'Scatter 棒棒糖', p: '单次旋转出现 4 个及以上触发免费旋转，每次固定 10 局：4 个 = 3× 派彩 + 10 FS；5 个 = 5× 派彩 + 10 FS；6 个 = 100× 派彩 + 10 FS。' }),
    Object.freeze({ h: '免费旋转中再次触发', p: '免费旋转期间再次出现 4 个及以上棒棒糖，按相同规则再触发 10 局。' }),
    Object.freeze({ h: '倍率炸弹', p: '仅免费旋转期间出现，倍率 2× ~ 100×。同一轮（一次旋转的所有连消）结束时，场上所有炸弹的倍率相加，共同作用于本轮总派彩。' }),
    Object.freeze({ h: '下注金额', p: '0.20 / 0.50 / 1 / 2 / 5 / 10 / 20 / 50 / 100，共 9 档。' }),
    Object.freeze({ h: '试玩模式说明', p: '试玩模式使用虚拟余额，仅供体验玩法与规则，不涉及真实资金。' })
  ]);

  // ── 模块级状态 ────────────────────────────────────────────────────
  var root = null;
  var panel = null;
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


  // ── 赔率表渲染 ────────────────────────────────────────────────
  var PAY_ORDER = [
    ['RED_HEART',    '红心糖',   '普通高赔'],
    ['PURPLE_CANDY', '紫色方糖', '普通高赔'],
    ['GREEN_CANDY',  '绿色糖',   '普通高赔'],
    ['BLUE_CANDY',   '蓝色糖',   '普通高赔'],
    ['APPLE',        '苹果',     '普通水果'],
    ['PLUM',         '李子',     '普通水果'],
    ['WATERMELON',   '西瓜',     '普通水果'],
    ['GRAPE',        '葡萄',     '普通水果'],
    ['BANANA',       '香蕉',     '普通水果']
  ];
  // 符号 key → ApexSymbolsV2 的 id
  var SYM_ID = {
    RED_HEART: 'red_heart_candy', PURPLE_CANDY: 'purple_candy',
    GREEN_CANDY: 'green_candy', BLUE_CANDY: 'blue_candy',
    APPLE: 'apple', PLUM: 'plum', WATERMELON: 'watermelon',
    GRAPE: 'grape', BANANA: 'banana'
  };
  function symSVG(key) {
    var V2 = window.ApexSymbolsV2;
    if (!V2) return '';
    var id = SYM_ID[key] || key;
    try { return V2.get(id, 'rules-' + key); } catch (e) { return ''; }
  }

  function fmt(v) {
    if (v == null) return '—';
    return String(v) + '×';
  }

  function buildPaytable() {
    var PT = window.ApexPaytable && window.ApexPaytable.PAYTABLE;
    if (!PT) return '';
    var html = '<section class="sd-rules-block sd-rules-pt">';
    html += '<h3>赔率表（Pay Anywhere）</h3>';
    html += '<p class="sd-rules-pt-note">同种符号出现 8 个及以上即中奖，'
          + '位置无需相邻。8~9 同档，10~11 同档，12+ 最高档。</p>';
    html += '<div class="sd-pt-scroll"><table class="sd-pt-table">';
    html += '<thead><tr><th>符号</th><th>类型</th>'
          + '<th>8</th><th>9</th><th>10</th><th>11</th><th>12+</th></tr></thead>';
    html += '<tbody>';
    for (var i = 0; i < PAY_ORDER.length; i++) {
      var key = PAY_ORDER[i][0], name = PAY_ORDER[i][1], kind = PAY_ORDER[i][2];
      var t = PT[key];
      if (!t) continue;
      var v8 = t[8], v10 = t[10], v12 = t[12];
      var svg = symSVG(key);
      html += '<tr>'
            + '<td class="sd-pt-sym"><span class="sd-pt-ic">' + svg + '</span>' + name + '</td>'
            + '<td class="sd-pt-kind">' + kind + '</td>'
            + '<td>' + fmt(v8) + '</td>'
            + '<td>' + fmt(v8) + '</td>'
            + '<td>' + fmt(v10) + '</td>'
            + '<td>' + fmt(v10) + '</td>'
            + '<td class="sd-pt-top">' + fmt(v12) + '</td>'
            + '</tr>';
    }
    html += '</tbody></table></div></section>';

    html += '<section class="sd-rules-block sd-rules-pt">';
    html += '<h3>特殊符号</h3>';
    html += '<div class="sd-pt-scroll"><table class="sd-pt-table sd-pt-table--special">';
    html += '<thead><tr><th>符号</th><th>触发条件</th><th>奖励</th></tr></thead>';
    var lp = symSVG('lollipop') || (window.ApexSymbolsV2 ? window.ApexSymbolsV2.get('lollipop', 'rules-lp') : '');
    var mb = symSVG('multiplier_bomb') || (window.ApexSymbolsV2 ? window.ApexSymbolsV2.get('multiplier_bomb', 'rules-mb') : '');
    html += '<tbody>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>棒棒糖</td><td>4 个</td><td>3× 派彩 + 10 FS</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>棒棒糖</td><td>5 个</td><td>5× 派彩 + 10 FS</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>棒棒糖</td><td>6 个</td><td>100× 派彩 + 10 FS</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + mb + '</span>倍率炸弹</td><td>仅 Free Spins</td><td>×2 ~ ×100，同轮倍率相加</td></tr>'
          + '</tbody></table></div></section>';
    return html;
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
    html += buildPaytable();
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
