// @ts-check
/* Apex · 下注控件
 * 职责：− / 当前下注 / +
 * 规则：
 *   - 档位从配置读（不写死）
 *   - Spin 中禁用
 *   - 到边界时对应按钮 disabled
 */

import { formatMoney } from '../shared/money.js';

export class BetControl {
  /**
   * @param {Object} deps
   * @param {HTMLElement} deps.minusBtn
   * @param {HTMLElement} deps.plusBtn
   * @param {HTMLElement} deps.valueEl
   * @param {number[]} deps.steps         下注档位（分）
   * @param {number} [deps.initialIndex]  默认档位索引
   * @param {(betMinor:number) => void} [deps.onChange]
   * @param {() => void} [deps.onClick]    点击音效用
   */
  constructor(deps) {
    if (!deps || !deps.minusBtn || !deps.plusBtn || !deps.valueEl) {
      throw new Error('BetControl: missing elements');
    }
    this._minus = deps.minusBtn;
    this._plus = deps.plusBtn;
    this._value = deps.valueEl;
    this._steps = (deps.steps && deps.steps.length) ? deps.steps.slice() : [100, 200, 500, 1000, 2000, 5000, 10000];
    this._idx = typeof deps.initialIndex === 'number' ? deps.initialIndex : 3;
    this._onChange = deps.onChange || function () {};
    this._onClick = deps.onClick || function () {};
    this._locked = false;
  }

  /** 绑定事件 */
  bind() {
    const self = this;
    this._minus.addEventListener('click', function () {
      if (self._locked) return;
      self._onClick();
      self.decrease();
    });
    this._plus.addEventListener('click', function () {
      if (self._locked) return;
      self._onClick();
      self.increase();
    });
    this._render();
  }

  /** 减小下注 */
  decrease() {
    if (this._idx <= 0) return;
    this._idx--;
    this._render();
    this._onChange(this.getBet());
  }

  /** 增大下注 */
  increase() {
    if (this._idx >= this._steps.length - 1) return;
    this._idx++;
    this._render();
    this._onChange(this.getBet());
  }

  /** 当前下注（分） */
  getBet() { return this._steps[this._idx]; }

  /** 当前档位索引 */
  getIndex() { return this._idx; }

  /** 锁定 / 解锁（Spin 中） */
  setLocked(v) {
    this._locked = !!v;
    this._render();
  }

  /** 重置到指定档位 */
  reset(index) {
    if (typeof index === 'number' && index >= 0 && index < this._steps.length) {
      this._idx = index;
      this._render();
      this._onChange(this.getBet());
    }
  }

  _render() {
    if (this._value) this._value.textContent = formatMoney(this._steps[this._idx]);
    const atMin = this._idx <= 0;
    const atMax = this._idx >= this._steps.length - 1;
    this._minus.disabled = this._locked || atMin;
    this._plus.disabled = this._locked || atMax;
  }
}
