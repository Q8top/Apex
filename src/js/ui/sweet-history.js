/* Apex · 游戏记录 Sheet
 * 数据源：内存数组（本轮不作持久化）
 */
(function () {
  'use strict';

  var ID = 'sd-history-root';
  var records = [];
  var MAX = 100;

  function push(rec) {
    records.unshift(rec);
    if (records.length > MAX) records.length = MAX;
  }

  function fmtMoney(minor) {
    var n = Number(minor) / 100;
    return '¥' + n.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    function p(v) { return v < 10 ? '0' + v : String(v); }
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
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
      html += '<li class="sd-hist-item">';
      html += '<span class="sd-hist-time">' + fmtTime(r.ts) + '</span>';
      html += '<span class="sd-hist-bet">下注 ' + fmtMoney(r.betMinor) + '</span>';
      html += '<span class="sd-hist-win">中奖 ' + fmtMoney(r.winMinor) + '</span>';
      html += '<span class="sd-hist-delta ' + cls + '">' + sign + fmtMoney(delta) + '</span>';
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  function build() {
    return ''
      + '<div class="sd-hist-backdrop" data-hist-close="1"></div>'
      + '<div class="sd-hist-panel" role="dialog" aria-modal="true" aria-labelledby="sd-hist-title">'
      +   '<div class="sd-hist-handle"></div>'
      +   '<header class="sd-hist-header"><h2 id="sd-hist-title">游戏记录</h2></header>'
      +   '<div class="sd-hist-body" id="sd-hist-body"></div>'
      + '</div>';
  }

  var root = null;
  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-hist-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-hist-close]')) close();
    });
    document.body.appendChild(root);
    return root;
  }

  function refresh() {
    var body = document.getElementById('sd-hist-body');
    if (body) body.innerHTML = renderList();
  }

  function open() {
    var r = ensure();
    refresh();
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

  function clear() { records.length = 0; }

  window.ApexHistory = {
    open: open, close: close, push: push, clear: clear,
    getRecords: function () { return records.slice(); }
  };
})();
