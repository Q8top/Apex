/* Apex · 游戏设置 Sheet
 * 音效 / 音乐 / 震动 / 极速 / 动画
 */
(function () {
  'use strict';

  var ID = 'sd-settings-root';
  var KEY = 'apex.sweet.settings.v1';

  var DEFAULTS = {
    audioEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.9,
    hapticsEnabled: true,
    fastMode: false,
    animationsEnabled: true
  };

  var current = Object.assign({}, DEFAULTS);
  var onChange = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      Object.keys(DEFAULTS).forEach(function (k) {
        if (k in data) current[k] = data[k];
      });
    } catch (e) {}
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) {}
  }

  function set(patch) {
    Object.keys(patch).forEach(function (k) { current[k] = patch[k]; });
    save();
    if (typeof onChange === 'function') onChange(current);
  }

  function build() {
    return ''
      + '<div class="sd-set-backdrop" data-set-close="1"></div>'
      + '<div class="sd-set-panel" role="dialog" aria-modal="true" aria-labelledby="sd-set-title">'
      +   '<div class="sd-set-handle"></div>'
      +   '<header class="sd-set-header"><h2 id="sd-set-title">游戏设置</h2></header>'
      +   '<div class="sd-set-body">'
      +     '<label class="sd-set-row"><span>音效</span><input type="checkbox" data-k="audioEnabled"></label>'
      +     '<label class="sd-set-row"><span>音乐音量</span><input type="range" min="0" max="1" step="0.1" data-k="musicVolume"></label>'
      +     '<label class="sd-set-row"><span>音效音量</span><input type="range" min="0" max="1" step="0.1" data-k="sfxVolume"></label>'
      +     '<label class="sd-set-row"><span>震动反馈</span><input type="checkbox" data-k="hapticsEnabled"></label>'
      +     '<label class="sd-set-row"><span>极速模式</span><input type="checkbox" data-k="fastMode"></label>'
      +     '<label class="sd-set-row"><span>动画效果</span><input type="checkbox" data-k="animationsEnabled"></label>'
      +   '</div>'
      + '</div>';
  }

  function syncUI() {
    if (!root) return;
    var nodes = root.querySelectorAll('[data-k]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var k = el.getAttribute('data-k');
      var v = current[k];
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = String(v);
    }
  }

  var root = null;
  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-set-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-set-close]')) close();
    });
    root.addEventListener('input', function (e) {
      var el = e.target;
      if (!el || !el.getAttribute) return;
      var k = el.getAttribute('data-k');
      if (!k) return;
      var v;
      if (el.type === 'checkbox') v = el.checked;
      else if (el.type === 'range') v = parseFloat(el.value);
      else v = el.value;
      set((function () { var o = {}; o[k] = v; return o; })());
    });
    document.body.appendChild(root);
    return root;
  }

  function open() {
    var r = ensure();
    syncUI();
    r.removeAttribute('hidden');
    void r.offsetWidth;
    r.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!root) return;
    root.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { if (root) root.setAttribute('hidden', ''); }, 300);
  }

  load();

  window.ApexSettings = {
    open: open,
    close: close,
    get: function () { return Object.assign({}, current); },
    set: set,
    onChange: function (fn) { onChange = fn; },
    DEFAULTS: DEFAULTS
  };
})();
