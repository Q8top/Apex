// @ts-check
/* Apex · Free Spins 播放
 * 职责：编排 FS 的完整视觉序列
 *   enter → per-round(赢奖循环) → summary → exit
 * 规则：
 *   - 每轮内部通过 WinPresentation 播放
 *   - 支持 cancel
 *   - 数学结果由外部传入
 */

import { TIMING } from '../shared/constants.js';
import { eventBus } from '../core/EventBus.js';
import { countUp, Ease, playClass } from './Animate.js';
import { logger } from '../shared/logger.js';

export class FreeSpinPresentation {
  /**
   * @param {Object} deps
   * @param {import('../render/StageRenderer.js').StageRenderer} [deps.stage]
   * @param {HTMLElement} deps.bannerEl        FS 横幅（顶部）
   * @param {HTMLElement} deps.countLeftEl     剩余次数
   * @param {HTMLElement} deps.countTotalEl    总次数
   * @param {HTMLElement} deps.summaryEl       汇总遮罩
   * @param {HTMLElement} deps.summaryAmountEl 汇总金额
   * @param {import('./WinPresentation.js').WinPresentation} deps.winPresenter
   * @param {(v:number)=>string} [deps.formatter]
   * @param {(name:string, arg?:any)=>void} [deps.playSfx]
   */
  constructor(deps) {
    if (!deps || !deps.bannerEl || !deps.winPresenter) {
      throw new Error('FreeSpinPresentation: bannerEl + winPresenter required');
    }
    this._stage = deps.stage || null;
    this._banner = deps.bannerEl;
    this._countLeft = deps.countLeftEl || null;
    this._countTotal = deps.countTotalEl || null;
    this._summary = deps.summaryEl || null;
    this._summaryAmount = deps.summaryAmountEl || null;
    this._winPresenter = deps.winPresenter;
    this._fmt = deps.formatter || function (v) { return String(Math.round(v)); };
    this._sfx = deps.playSfx || function () {};
    this._running = false;
    this._cancelled = false;
    this._timers = new Set();
  }

  /**
   * 播放完整 FS 序列
   * @param {Object} fs
   * @param {number} fs.awarded
   * @param {Array<{initialGrid:string[][], tumbles:any[], totalWin:number}>} fs.rounds
   * @param {number} fs.totalWin
   * @returns {Promise<void>}
   */
  async play(fs) {
    if (this._running) { logger.warn('FS already running'); return; }
    this._running = true;
    this._cancelled = false;

    try {
      await this._enter(fs.awarded);

      const rounds = fs.rounds || [];
      for (let i = 0; i < rounds.length; i++) {
        if (this._cancelled) break;
        await this._playRound(rounds[i], i, fs.awarded);
      }

      if (!this._cancelled) {
        await this._summaryShow(fs.totalWin);
      }

      await this._exit();
    } catch (e) {
      logger.warn('FS presentation error', e && e.message);
    } finally {
      this._running = false;
      eventBus.emit('present:fs:end', { totalWin: fs.totalWin });
    }
  }

  async _enter(awarded) {
    // 舞台切紫
    if (this._stage) this._stage.setFreeSpinMode(true);

    // 横幅显示
    this._banner.classList.add('is-show');
    if (this._countLeft) this._countLeft.textContent = String(awarded);
    if (this._countTotal) this._countTotal.textContent = String(awarded);

    playClass(this._banner, 'is-enter', 700);
    this._sfx('fs_start');

    // 粒子爆发
    if (this._stage) {
      this._stage.burstCenter({ color: ['#7b61ff', '#ff3d8d'], count: 50, speed: 220, life: 1000 });
    }

    eventBus.emit('present:fs:enter', { awarded: awarded });
    await this._delay(TIMING.FS_ENTRANCE);
  }

  async _playRound(round, index, total) {
    // 更新剩余次数
    const left = total - index;
    if (this._countLeft) this._countLeft.textContent = String(left);

    // 显示本轮初始网格
    if (this._stage) {
      this._stage.setGrid(round.initialGrid);
    }
    await this._delay(180);

    // 逐 tumble 播放
    const tumbles = round.tumbles || [];
    for (let j = 0; j < tumbles.length; j++) {
      if (this._cancelled) return;
      const t = tumbles[j];
      const nextGrid = (j + 1 < tumbles.length) ? tumbles[j + 1].grid : null;
      await this._winPresenter.play({
        wins: t.wins || [],
        roundWin: t.roundWin || 0,
        grid: t.grid,
        nextGrid: nextGrid,
        tumbleIndex: index * 100 + j
      });
    }

    eventBus.emit('present:fs:round', { index: index, remaining: left });
    await this._delay(120);
  }

  async _summaryShow(totalWin) {
    if (!this._summary) {
      await this._delay(TIMING.FS_SUMMARY);
      return;
    }
    // 隐藏横幅
    this._banner.classList.remove('is-show');

    // 显示汇总
    this._summary.classList.add('is-show');
    playClass(this._summary, 'is-enter', 600);

    if (this._summaryAmount) {
      this._summaryAmount.textContent = this._fmt(0);
      await countUp(this._summaryAmount, 0, totalWin, {
        duration: 900,
        formatter: this._fmt,
        ease: Ease.outExpo
      }).promise;
    } else {
      await this._delay(900);
    }

    this._sfx('fs_end');

    if (this._stage) {
      this._stage.burstCenter({ color: ['#f5d76e', '#ffe98a'], count: 40, speed: 180, life: 900 });
    }

    await this._delay(TIMING.FS_SUMMARY);
  }

  async _exit() {
    if (this._summary) {
      this._summary.classList.remove('is-enter');
      this._summary.classList.add('is-exit');
      await this._delay(360);
      this._summary.classList.remove('is-show', 'is-exit');
    }
    this._banner.classList.remove('is-show', 'is-enter');

    if (this._stage) this._stage.setFreeSpinMode(false);

    eventBus.emit('present:fs:exit');
  }

  _delay(ms) {
    const self = this;
    return new Promise(function (resolve) {
      const t = setTimeout(function () {
        self._timers.delete(t);
        resolve();
      }, ms);
      self._timers.add(t);
    });
  }

  /** 取消 */
  cancel() {
    this._cancelled = true;
    this._running = false;
    this._timers.forEach(function (t) { clearTimeout(t); });
    this._timers.clear();
    this._winPresenter.cancel();
    this._banner.classList.remove('is-show', 'is-enter');
    if (this._summary) this._summary.classList.remove('is-show', 'is-enter', 'is-exit');
    if (this._stage) this._stage.setFreeSpinMode(false);
  }

  isRunning() { return this._running; }
}
