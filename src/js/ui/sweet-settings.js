/* Apex · 游戏设置 Sheet
 * 音效 / 音乐 / 震动 / 极速 / 动画
 *
 * 不变量：
 *   - load 对每个 key 按 DEFAULTS 类型强校验，非法值丢弃用默认
 *   - set 走键白名单，未知键不写、不存、不广播
 *   - range 值钳制到 [0,1]；checkbox 强制布尔
 *   - onChange 收到冻结快照（不能改内部 state）
 *   - close 用 clearTimeout 防竞态；ESC / 焦点 / 幂等与 rules/history 对齐
 *   - 本模块不主动调 ApexAudio / ApexHaptics（无实例持有权），
 *     联动由上层通过 onChange 桥接
 *
 * TODO(P0-cross)：body scroll lock 目前模块内计数，跨 sheet 冲突。
 *                 待三份 UI 审完后统一抽 ApexSheetLock。
 */
(function () {
  'use strict';

  var ID = 'sd-settings-root';
  var KEY = 'apex.sweet.settings.v1';
  var CLOSE_ANIM_MS = 300;

  var DEFAULTS = Object.freeze({
    audioEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.9,
    hapticsEnabled: true,
    fastMode: false,
    animationsEnabled: true
  });

  var KEY_TYPES = Object.freeze({
    audioEnabled: 'bool',
    musicVolume: 'unit',
    sfxVolume: 'unit',
    hapticsEnabled: 'bool',
    fastMode: 'bool',
    animationsEnabled: 'bool'
  });

  var current = Object.assign({}, DEFAULTS);
  var onChangeFn = null;

  function coerce(k, v) {
    var t = KEY_TYPES[k];
    if (!t) return undefined;
    if (t === 'bool') return !!v;
    if (t === 'unit') {
      var n = Number(v);
      if (!Number.isFinite(n)) return undefined;
      return Math.max(0, Math.min(1, n));
    }
    return undefined;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      Object.keys(KEY_TYPES).forEach(function (k) {
        if (!(k in data)) return;
        var v = coerce(k, data[k]);
        if (v !== undefined) current[k] = v;
      });
    } catch (e) {}
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) {}
  }

  function snapshot() {
    return Object.freeze(Object.assign({}, current));
  }

  function notify() {
    if (typeof onChangeFn !== 'function') return;
    try { onChangeFn(snapshot()); } catch (e) {}
  }

  function set(patch) {
    if (!patch || typeof patch !== 'object') return snapshot();
    var dirty = false;
    Object.keys(patch).forEach(function (k) {
      if (!(k in KEY_TYPES)) return;                 // 白名单
      var v = coerce(k, patch[k]);
      if (v === undefined) return;                   // 非法值丢弃
      if (current[k] === v) return;
      current[k] = v;
      dirty = true;
    });
    if (!dirty) return snapshot();
    save();
    notify();
    return snapshot();
  }

  function reset() {
    current = Object.assign({}, DEFAULTS);
    save();
    if (isOpen()) syncUI();
    notify();
    return snapshot();
  }

  function build() {
    return ''
      + '<div class="sd-set-backdrop" data-set-close="1"></div>'
      + '<div class="sd-set-panel" role="dialog" aria-modal="true" aria-labelledby="sd-set-title" tabindex="-1">'
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

  var root = null;
  var panel = null;
  var closeTimer = null;
  var escHandler = null;
  var focusBefore = null;
  var openCount = 0;

  function lockScroll() {
    openCount++;
    if (openCount === 1) document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) document.body.style.overflow = '';
  }

  function ensure() {
    if (root) return root;
    root = document.createElement('div');
    root.id = ID;
    root.className = 'sd-set-root';
    root.setAttribute('hidden', '');
    root.innerHTML = build();
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-set-close]')) close();
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
      var patch = {};
      patch[k] = v;
      set(patch);
    });
    document.body.appendChild(root);
    panel = root.querySelector('.sd-set-panel');
    return root;
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
    syncUI();
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

  load();

  window.ApexSettings = Object.freeze({
    open: open,
    close: close,
    isOpen: isOpen,
    get: snapshot,
    set: set,
    reset: reset,
    DEFAULTS: DEFAULTS,
    onChange: function (fn) { onChangeFn = (typeof fn === 'function') ? fn : null; }
  });
})();
