// @ts-check
/* Apex · Modal
 * 职责：居中弹窗（确认对话框 / 游戏说明 / 错误提示）
 * 规则：
 *   - 单例管理，同时只允许一个 Modal
 *   - 支持 ESC 关闭 / 遮罩点击关闭
 *   - body scroll lock
 *   - 焦点管理（打开时 focus 到主按钮）
 *   - 返回 Promise（点击哪个按钮）
 */

export class Modal {
  constructor() {
    this._wrap = null;
    this._resolve = null;
    this._escHandler = null;
    this._prevOverflow = '';
  }

  /**
   * 显示
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} [opts.body]
   * @param {Array<{label:string, value:any, primary?:boolean, danger?:boolean}>} [opts.buttons]
   * @param {boolean} [opts.dismissible] 默认 true
   * @returns {Promise<any>} 点击按钮返回 value，遮罩 / ESC 关闭返回 null
   */
  show(opts) {
    if (this._wrap) this.close(null);

    const o = opts || {};
    const buttons = o.buttons || [{ label: '确定', value: true, primary: true }];
    const dismissible = o.dismissible !== false;

    const wrap = document.createElement('div');
    wrap.className = 'ax-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');

    const btnHtml = buttons.map(function (b, i) {
      const cls = 'ax-modal-btn'
        + (b.primary ? ' is-primary' : '')
        + (b.danger ? ' is-danger' : '');
      return '<button type="button" class="' + cls + '" data-idx="' + i + '">'
        + escapeHtml(b.label) + '</button>';
    }).join('');

    wrap.innerHTML = ''
      + '<div class="ax-modal-mask" data-close="1"></div>'
      + '<div class="ax-modal-card">'
      +   '<div class="ax-modal-title">' + escapeHtml(o.title || '') + '</div>'
      +   (o.body ? '<div class="ax-modal-body">' + escapeHtml(o.body) + '</div>' : '')
      +   '<div class="ax-modal-actions">' + btnHtml + '</div>'
      + '</div>';

    document.body.appendChild(wrap);
    this._wrap = wrap;

    // body scroll lock
    this._prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const self = this;

    // 点击按钮 / 遮罩
    wrap.addEventListener('click', function (e) {
      const t = /** @type {HTMLElement} */ (e.target);
      const closeMask = t.closest('[data-close]');
      if (closeMask) {
        if (dismissible) self.close(null);
        return;
      }
      const btn = /** @type {HTMLElement} */ (t.closest('.ax-modal-btn'));
      if (btn) {
        const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        self.close(buttons[idx] ? buttons[idx].value : null);
      }
    });

    // ESC
    this._escHandler = function (e) {
      if (e.key === 'Escape' && dismissible) self.close(null);
    };
    document.addEventListener('keydown', this._escHandler);

    // 动画入场
    requestAnimationFrame(function () { wrap.classList.add('is-show'); });

    // 焦点到 primary
    const primaryIdx = buttons.findIndex(function (b) { return b.primary; });
    const focusIdx = primaryIdx >= 0 ? primaryIdx : 0;
    setTimeout(function () {
      const btn = wrap.querySelector('[data-idx="' + focusIdx + '"]');
      if (btn) /** @type {HTMLElement} */ (btn).focus();
    }, 60);

    return new Promise(function (resolve) {
      self._resolve = resolve;
    });
  }

  /** 关闭 */
  close(value) {
    const wrap = this._wrap;
    if (!wrap) return;
    this._wrap = null;
    const resolve = this._resolve;
    this._resolve = null;

    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }

    document.body.style.overflow = this._prevOverflow || '';

    wrap.classList.remove('is-show');
    wrap.classList.add('is-exit');
    setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 220);

    if (resolve) resolve(value);
  }

  /** 是否显示中 */
  isOpen() { return !!this._wrap; }
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 默认单例 */
export const modal = new Modal();
