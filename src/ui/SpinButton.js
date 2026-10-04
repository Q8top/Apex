// @ts-check
/* Apex · 旋转按钮
 * 职责：主 CTA
 * 状态：idle / spinning / disabled / auto
 * 规则：
 *   - 点击后立即 disabled，不等异步
 *   - 视觉用 class 切换，不动布局
 */

export class SpinButton {
  /**
   * @param {Object} deps
   * @param {HTMLElement} deps.root
   * @param {() => void} deps.onClick
   */
  constructor(deps) {
    if (!deps || !deps.root) throw new Error('SpinButton: root required');
    this._root = deps.root;
    this._onClick = deps.onClick || function () {};
    this._disabled = false;
    this._spinning = false;
    this._auto = false;
    this._bound = false;
  }

  /** 绑定事件 */
  bind() {
    if (this._bound) return;
    this._bound = true;
    const self = this;
    this._root.addEventListener('click', function () {
      if (self._disabled || self._spinning) return;
      self._onClick();
    });
  }

  /** 是否被禁用 */
  isDisabled() { return this._disabled; }

  /** 是否在旋转 */
  isSpinning() { return this._spinning; }

  /**
   * 设置状态
   * @param {'idle'|'spinning'|'disabled'|'auto'} state
   */
  setState(state) {
    const r = this._root;
    r.classList.remove('is-spinning', 'is-disabled', 'is-auto');

    switch (state) {
      case 'spinning':
        this._spinning = true;
        this._disabled = true;
        r.classList.add('is-spinning');
        r.setAttribute('aria-disabled', 'true');
        break;
      case 'disabled':
        this._spinning = false;
        this._disabled = true;
        r.classList.add('is-disabled');
        r.setAttribute('aria-disabled', 'true');
        break;
      case 'auto':
        this._spinning = false;
        this._disabled = false;
        this._auto = true;
        r.classList.add('is-auto');
        r.removeAttribute('aria-disabled');
        break;
      case 'idle':
      default:
        this._spinning = false;
        this._disabled = false;
        this._auto = false;
        r.removeAttribute('aria-disabled');
        break;
    }
  }

  /** 禁用 / 启用 */
  setEnabled(v) {
    if (v) this.setState('idle');
    else this.setState('disabled');
  }

  /** 显示为"停止"（Auto 运行时） */
  setLabel(text) {
    const label = this._root.querySelector('.ax-spin-label');
    if (label) label.textContent = text;
  }
}
