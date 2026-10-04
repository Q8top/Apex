// @ts-check
/* Apex · Toast
 * 职责：底部弹出短提示
 * 规则：
 *   - 单例管理，同一时刻只有一个 toast
 *   - 连续调用会替换内容并重置计时
 *   - 不阻塞交互（pointer-events: none）
 */

import { TIMING } from '../shared/constants.js';

export class Toast {
  /**
   * @param {Object} [opts]
   * @param {number} [opts.duration]  默认 TIMING.TOAST_DEFAULT
   */
  constructor(opts) {
    this._duration = (opts && opts.duration) || TIMING.TOAST_DEFAULT;
    this._el = null;
    this._timer = 0;
    this._hideTimer = 0;
    this._mounted = false;
  }

  /** 挂载到 body（懒加载） */
  _ensureMounted() {
    if (this._mounted) return;
    const el = document.createElement('div');
    el.className = 'ax-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    this._el = el;
    this._mounted = true;
  }

  /**
   * 显示
   * @param {string} message
   * @param {{duration?:number, type?:'info'|'success'|'error'}} [opts]
   */
  show(message, opts) {
    this._ensureMounted();
    const el = this._el;
    if (!el) return;

    const duration = (opts && opts.duration) || this._duration;
    const type = (opts && opts.type) || 'info';

    el.textContent = String(message || '');
    el.setAttribute('data-type', type);
    el.classList.add('is-show');

    if (this._timer) clearTimeout(this._timer);
    if (this._hideTimer) clearTimeout(this._hideTimer);

    const self = this;
    this._timer = window.setTimeout(function () {
      el.classList.remove('is-show');
      self._hideTimer = window.setTimeout(function () {
        self._hideTimer = 0;
      }, 300);
    }, duration);
  }

  /** 快捷：成功提示 */
  success(msg) { this.show(msg, { type: 'success' }); }
  /** 快捷：错误提示 */
  error(msg) { this.show(msg, { type: 'error', duration: 2400 }); }
  /** 快捷：普通提示 */
  info(msg) { this.show(msg, { type: 'info' }); }

  /** 立即隐藏 */
  hide() {
    if (this._timer) { clearTimeout(this._timer); this._timer = 0; }
    if (this._el) this._el.classList.remove('is-show');
  }

  /** 销毁 */
  destroy() {
    this.hide();
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
    this._mounted = false;
  }
}

/** 默认单例 */
export const toast = new Toast();
