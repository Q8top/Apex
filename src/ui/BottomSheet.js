// @ts-check
/* Apex · Bottom Sheet
 * 职责：底部弹出面板（菜单 / 记录 / 赔付表）
 * 特性：
 *   - 从底部滑入
 *   - 拖拽下关闭（拖拽距离 > 120px 或向下速度 > 0.5 px/ms）
 *   - ESC 关闭 / 遮罩点击关闭
 *   - body scroll lock
 */

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.5;

export class BottomSheet {
  constructor() {
    this._wrap = null;
    this._escHandler = null;
    this._prevOverflow = '';
  }

  /**
   * 打开
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string|HTMLElement} opts.body     HTML 字符串 或 已构建的 DOM
   * @param {boolean} [opts.dismissible]
   * @returns {void}
   */
  open(opts) {
    if (this._wrap) this.close();
    const o = opts || {};
    const dismissible = o.dismissible !== false;

    const wrap = document.createElement('div');
    wrap.className = 'ax-sheet';

    const handle = '<div class="ax-sheet-handle"></div>';
    const head = '<div class="ax-sheet-head">'
      + '<span class="ax-sheet-title">' + escapeHtml(o.title || '') + '</span>'
      + '<button type="button" class="ax-sheet-close" data-close="1" aria-label="关闭">✕</button>'
      + '</div>';

    wrap.innerHTML = ''
      + '<div class="ax-sheet-mask" data-close="1"></div>'
      + '<div class="ax-sheet-panel" role="dialog" aria-modal="true">'
      +   handle + head
      +   '<div class="ax-sheet-body"></div>'
      + '</div>';

    const body = wrap.querySelector('.ax-sheet-body');
    if (body) {
      if (typeof o.body === 'string') body.innerHTML = o.body;
      else if (o.body instanceof HTMLElement) body.appendChild(o.body);
    }

    document.body.appendChild(wrap);
    this._wrap = wrap;
    this._prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const self = this;
    wrap.addEventListener('click', function (e) {
      const t = /** @type {HTMLElement} */ (e.target);
      if (t.closest('[data-close]') && dismissible) self.close();
    });

    this._escHandler = function (e) {
      if (e.key === 'Escape' && dismissible) self.close();
    };
    document.addEventListener('keydown', this._escHandler);

    // 拖拽关闭
    const panel = /** @type {HTMLElement} */ (wrap.querySelector('.ax-sheet-panel'));
    if (panel) this._bindDrag(panel);

    requestAnimationFrame(function () { wrap.classList.add('is-show'); });
  }

  _bindDrag(panel) {
    let sy = 0, dy = 0, t0 = 0, dragging = false;

    panel.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sy = e.touches[0].clientY;
      t0 = performance.now();
      dy = 0;
      dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      dy = e.touches[0].clientY - sy;
      if (dy > 0) {
        panel.style.transform = 'translateY(' + dy + 'px)';
      }
    }, { passive: true });

    const self = this;
    panel.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      panel.style.transform = '';
      const dt = Math.max(1, performance.now() - t0);
      const velocity = dy / dt;
      if (dy > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
        self.close();
      }
    }, { passive: true });
  }

  /** 关闭 */
  close() {
    const wrap = this._wrap;
    if (!wrap) return;
    this._wrap = null;

    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }

    document.body.style.overflow = this._prevOverflow || '';

    wrap.classList.remove('is-show');
    wrap.classList.add('is-exit');
    setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 260);
  }

  /** 是否打开 */
  isOpen() { return !!this._wrap; }
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 默认单例 */
export const bottomSheet = new BottomSheet();
