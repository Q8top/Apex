/* Apex · 游戏规则页
 * 全屏 sheet，从底部升起；不依赖 UI 框架
 */
(function () {
  'use strict';

  var ID = 'sd-rules-root';

  var CONTENT = [
    { h: '玩法说明', p: '6 列 × 5 行棋盘。每次旋转后生成 30 个符号，相同符号数量达标即中奖。' },
    { h: '中奖规则', p: 'Pay Anywhere：同一种符号出现 8 个及以上即中奖，位置无需相邻。' },
    { h: '连消（Tumble）', p: '中奖符号消失，上方符号下落补位，形成新棋盘；若再次中奖则继续连消，直至无中奖。' },
    { h: 'Scatter 棒棒糖', p: '单次旋转出现 4~6 个棒棒糖触发免费旋转：4 个 10 局 / 5 个 12 局 / 6 个 15 局。' },
    { h: '免费旋转中再次触发', p: '3 个及以上棒棒糖可再增加 5 局免费旋转。' },
    { h: '倍率炸弹', p: '免费旋转期间出现，倍数包括 2× 3× 5× 10× 25× 50× 100×。' },
    { h: '下注金额', p: '0.20 / 0.50 / 1 / 2 / 5 / 10 / 20 / 50 / 100，共 9 档。' },
    { h: '试玩模式说明', p: '试玩模式使用虚拟余额，仅供体验玩法与规则，不涉及真实资金。' }
  ];

  function build() {
    var html = '';
    html += '<div class="sd-rules-backdrop" data-rules-close="1"></div>';
    html += '<div class="sd-rules-panel" role="dialog" aria-modal="true" aria-labelledby="sd-rules-title">';
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

  var root = null;
  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-rules-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      if (t.closest('[data-rules-close]')) { close(); }
    });
    document.body.appendChild(root);
    return root;
  }

  function open() {
    var r = ensure();
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!root) return;
    root.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (root) root.setAttribute('hidden', '');
    }, 300);
  }

  window.ApexRules = { open: open, close: close };
})();
