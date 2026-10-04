// @ts-check
/* Apex · 余额显示
 * 职责：显示余额 / 下注 / 本轮赢得
 * 规则：金额格式化统一走 shared/money.js
 */

import { formatMoney, formatMoneyShort } from '../shared/money.js';
import { playClass } from '../animation/Animate.js';

export class Balance {
  /**
   * @param {Object} deps
   * @param {HTMLElement} deps.balanceEl
   * @param {HTMLElement} deps.betEl
   * @param {HTMLElement} deps.winEl
   */
  constructor(deps) {
    if (!deps || !deps.balanceEl) throw new Error('Balance: balanceEl required');
    this._balanceEl = deps.balanceEl;
    this._betEl = deps.betEl || null;
    this._winEl = deps.winEl || null;
    this._lastBalance = 0;
  }

  /** 设置余额（分） */
  setBalance(minorUnits) {
    const prev = this._lastBalance;
    this._lastBalance = minorUnits;
    if (this._balanceEl) {
      this._balanceEl.textContent = formatMoney(minorUnits);
      // 变化时 bump
      if (prev !== minorUnits && prev !== 0) {
        playClass(this._balanceEl, 'is-bump', 340);
      }
    }
  }

  /** 设置下注（分） */
  setBet(minorUnits) {
    if (this._betEl) this._betEl.textContent = formatMoney(minorUnits);
  }

  /** 设置本轮赢（分） */
  setWin(minorUnits) {
    if (this._winEl) this._winEl.textContent = formatMoneyShort(minorUnits);
  }
}
