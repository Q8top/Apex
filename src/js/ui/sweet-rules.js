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

  // i18n helper: returns localized string or falls back to the key.
  function t(key) {
    var I = window.ApexI18n;
    if (!I || typeof I.t !== 'function') return key;
    var v = I.t(key);
    return (v == null || v === '') ? key : v;
  }

  var ID = 'sd-rules-root';

  var CONTENT = Object.freeze([
    Object.freeze({ h: 'rules.c1.h', p: 'rules.c1.p' }),
    Object.freeze({ h: 'rules.c2.h', p: 'rules.c2.p' }),
    Object.freeze({ h: 'rules.c3.h', p: 'rules.c3.p' }),
    Object.freeze({ h: 'rules.c4.h', p: 'rules.c4.p' }),
    Object.freeze({ h: 'rules.c5.h', p: 'rules.c5.p' }),
    Object.freeze({ h: 'rules.c6.h', p: 'rules.c6.p' }),
    Object.freeze({ h: 'rules.c7.h', p: 'rules.c7.p' }),
    Object.freeze({ h: 'rules.c8.h', p: 'rules.c8.p' }),
  ]);

  // ── 模块级状态 ────────────────────────────────────────────────────
  var root = null;
  var panel = null;
  var CORE = window.ApexSheetCore;
  var ctx = CORE.createContext(
    function () { return root; },
    function () { return panel; }
  );

  function lockScroll() { CORE.lockScroll(); }
  function unlockScroll() { CORE.unlockScroll(); }


  // ── 赔率表渲染 ────────────────────────────────────────────────
  var PAY_ORDER = [
    ['RED_HEART',    'rules.sym.red_heart',    'rules.pt.kind.high'],
    ['PURPLE_CANDY', 'rules.sym.purple_candy', 'rules.pt.kind.high'],
    ['GREEN_CANDY',  'rules.sym.green_candy',  'rules.pt.kind.high'],
    ['BLUE_CANDY',   'rules.sym.blue_candy',   'rules.pt.kind.high'],
    ['APPLE',        'rules.sym.apple',        'rules.pt.kind.fruit'],
    ['PLUM',         'rules.sym.plum',         'rules.pt.kind.fruit'],
    ['WATERMELON',   'rules.sym.watermelon',   'rules.pt.kind.fruit'],
    ['GRAPE',        'rules.sym.grape',        'rules.pt.kind.fruit'],
    ['BANANA',       'rules.sym.banana',       'rules.pt.kind.fruit']
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
    var PTL = window.ApexPaytableLocked;
    var PT = PTL && PTL.PAYTABLE_SNAPSHOT;
    if (!PT) return '';
    var html = '<section class="sd-rules-block sd-rules-pt">';
    html += '<h3>' + t('rules.pt.title') + '</h3>';
    html += '<p class="sd-rules-pt-note">' + t('rules.pt.note') + '</p>';
    html += '<div class="sd-pt-scroll"><table class="sd-pt-table">';
    html += '<thead><tr><th>' + t('rules.pt.col.symbol') + '</th><th>' + t('rules.pt.col.kind') + '</th>'
          + '<th>5</th><th>6</th><th>8</th><th>10</th><th>12</th><th>15</th></tr></thead>';
    html += '<tbody>';
    for (var i = 0; i < PAY_ORDER.length; i++) {
      var key = PAY_ORDER[i][0], nameK = PAY_ORDER[i][1], kindK = PAY_ORDER[i][2];
      var t = PT[key];
      if (!t) continue;
      var v5 = t[5], v6 = t[6], v8 = t[8], v10 = t[10], v12 = t[12], v15 = t[15];
      var svg = symSVG(key);
      html += '<tr>'
            + '<td class="sd-pt-sym"><span class="sd-pt-ic">' + svg + '</span>' + t(nameK) + '</td>'
            + '<td class="sd-pt-kind">' + t(kindK) + '</td>'
            + '<td>' + fmt(v5) + '</td>'
            + '<td>' + fmt(v6) + '</td>'
            + '<td>' + fmt(v8) + '</td>'
            + '<td>' + fmt(v10) + '</td>'
            + '<td>' + fmt(v12) + '</td>'
            + '<td class="sd-pt-top">' + fmt(v15) + '</td>'
            + '</tr>';
    }
    html += '</tbody></table></div></section>';

    html += '<section class="sd-rules-block sd-rules-pt">';
    html += '<h3>' + t('rules.special.title') + '</h3>';
    html += '<div class="sd-pt-scroll"><table class="sd-pt-table sd-pt-table--special">';
    html += '<thead><tr><th>' + t('rules.special.col.symbol') + '</th><th>' + t('rules.special.col.trigger') + '</th><th>' + t('rules.special.col.reward') + '</th></tr></thead>';
    var lp = symSVG('lollipop') || (window.ApexSymbolsV2 ? window.ApexSymbolsV2.get('lollipop', 'rules-lp') : '');
    var mb = symSVG('multiplier_bomb') || (window.ApexSymbolsV2 ? window.ApexSymbolsV2.get('multiplier_bomb', 'rules-mb') : '');
    html += '<tbody>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>' + t('rules.special.lollipop') + '</td><td>' + t('rules.special.trigger.4') + '</td><td>' + t('rules.special.reward.scatter4') + '</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>' + t('rules.special.lollipop') + '</td><td>' + t('rules.special.trigger.5') + '</td><td>' + t('rules.special.reward.scatter5') + '</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + lp + '</span>' + t('rules.special.lollipop') + '</td><td>' + t('rules.special.trigger.6') + '</td><td>' + t('rules.special.reward.scatter6') + '</td></tr>'
          + '<tr><td class="sd-pt-sym"><span class="sd-pt-ic">' + mb + '</span>' + t('rules.special.bomb') + '</td><td>' + t('rules.special.trigger.fs') + '</td><td>' + t('rules.special.reward.bomb') + '</td></tr>'
          + '</tbody></table></div></section>';
    return html;
  }

  function build() {
    var html = '';
    html += '<div class="sd-rules-backdrop" data-rules-close="1"></div>';
    html += '<div class="sd-rules-panel" role="dialog" aria-modal="true" aria-labelledby="sd-rules-title" tabindex="-1">';
    html += '<div class="sd-rules-handle"></div>';
    html += '<header class="sd-rules-header"><h2 id="sd-rules-title">' + t('menu.rules') + '</h2><button type=\"button\" class=\"sd-rules-close\" aria-label=\"' + t('rules.close') + '\" data-rules-close=\"1\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M6 6l12 12M18 6l-12 12\"/></svg></button></header>';
    html += '<div class="sd-rules-body">';
    for (var i = 0; i < CONTENT.length; i++) {
      html += '<section class="sd-rules-block">';
      html += '<h3>' + t(CONTENT[i].h) + '</h3>';
      html += '<p>' + t(CONTENT[i].p) + '</p>';
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
    try { if (window.ApexI18n && typeof window.ApexI18n.apply === 'function') window.ApexI18n.apply(root); } catch (e) {}
    try {
      var ns = root.querySelectorAll('[data-i18n]');
      for (var i = 0; i < ns.length; i++) {
        var k = ns[i].getAttribute('data-i18n');
        var v = window.ApexI18n && window.ApexI18n.t ? window.ApexI18n.t(k) : null;
        if (v && v !== k) ns[i].textContent = v;
      }
    } catch (e) {}
    panel = root.querySelector('.sd-rules-panel');
    return root;
  }

  function bindEsc() { CORE.bindEsc(ctx, function () { close(); }); }
  function unbindEsc() { CORE.unbindEsc(ctx); }

  function open() {
    CORE.open(ctx, { ensure: ensure });
  }

  function close() { CORE.close(ctx); }

  function isOpen() { return CORE.isOpen(ctx); }

  window.ApexRules = Object.freeze({
    open: open,
    close: close,
    isOpen: isOpen
  });
})();
