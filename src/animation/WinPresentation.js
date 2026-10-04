// @ts-check
/* Apex · 中奖播放
 * 职责：编排一轮中奖的视觉时间轴
 *   highlight → countUp → remove → tumble → respawn
 * 规则：
 *   - 数学结果由调用方传入，本模块不改数学
 *   - 支持 cancel
 *   - 每个阶段时长来自 TIMING
 */

import { TIMING } from '../shared/constants.js';
import { eventBus } from '../core/EventBus.js';
import { Timeline } from '../core/Timeline.js';
import { countUp, Ease } from './Animate.js';
import { logger } from '../shared/logger.js';

export class WinPresentation {
  /**
   * @param {Object} deps
   * @param {import('../render/StageRenderer.js').StageRenderer} deps.stage
   * @param {HTMLElement} deps.winAmountEl  显示赢奖金额的元素
   * @param {(v:number)=>string} [deps.formatter]
   * @param {(name:string, arg?:any)=>void} [deps.playSfx]
   */
  constructor(deps) {
    if (!deps || !deps.stage) throw new Error('WinPresentation: stage required');
    this._stage = deps.stage;
    this._winEl = deps.winAmountEl || null;
    this._fmt = deps.formatter || function (v) { return String(Math.round(v)); };
    this._sfx = deps.playSfx || function () {};
    this._current = null;
    this._displayedWin = 0;
  }

  /**
   * 重置累计显示值（每次 Spin 开始时调用）
   */
  reset() {
    this._displayedWin = 0;
    if (this._winEl) this._winEl.textContent = this._fmt(0);
  }

  /**
   * 播放一轮中奖
   * @param {Object} round
   * @param {Array<{symbol:string, count:number, cells:Array<[number,number]>, pay:number}>} round.wins
   * @param {number} round.roundWin    本轮赢（主单位，非整数）
   * @param {string[][]} round.grid    本轮网格
   * @param {string[][]|null} round.nextGrid  下一轮网格（无则为 null，表示最后一轮）
   * @param {number} round.tumbleIndex
   * @returns {Promise<void>}
   */
  async play(round) {
    this._current = new Timeline();
    const self = this;
    const stage = this._stage;

    // 收集所有中奖格
    const allCells = [];
    for (let i = 0; i < round.wins.length; i++) {
      const w = round.wins[i];
      for (let j = 0; j < w.cells.length; j++) allCells.push(w.cells[j]);
    }

    // 1. 高亮
    this._current.step(function () {
      stage.highlightWins(allCells);
      self._sfx('win_hit', { count: allCells.length });
      // 中奖格粒子爆炸（每个中奖格轻微光晕）
      for (let i = 0; i < Math.min(allCells.length, 12); i++) {
        const [c, r] = allCells[i];
        stage.burstAt(c, r, { count: 6, color: '#f5d76e', speed: 90, life: 500 });
      }
      return Promise.resolve();
    });

    // 2. 等待高亮
    this._current.wait(TIMING.WIN_HIGHLIGHT);

    // 3. 计数累计
    this._current.step(function () {
      if (!self._winEl) return Promise.resolve();
      const from = self._displayedWin;
      const to = self._displayedWin + round.roundWin;
      self._displayedWin = to;
      const counter = countUp(self._winEl, from, to, {
        duration: TIMING.WIN_COUNTUP_BASE,
        formatter: self._fmt,
        ease: Ease.outCubic
      });
      return counter.promise;
    });

    // 4. 消除 + 下落
    this._current.step(function () {
      stage.removeWins(allCells);
      return Promise.resolve();
    });

    this._current.wait(TIMING.WIN_REMOVE);

    // 5. 下落 / 补位（若有下一帧）
    if (round.nextGrid) {
      this._current.step(function () {
        stage.applyTumble(round.nextGrid, allCells);
        return Promise.resolve();
      });
      this._current.wait(TIMING.TUMBLE_GRAVITY);
      this._current.step(function () {
        stage.clearRespawn();
        return Promise.resolve();
      });
      this._current.wait(TIMING.TUMBLE_SETTLE);
    } else {
      // 最后一轮：清除状态
      this._current.step(function () {
        stage.clearWins();
        return Promise.resolve();
      });
      this._current.wait(120);
    }

    eventBus.emit('present:win:start', { tumbleIndex: round.tumbleIndex, roundWin: round.roundWin });

    try {
      await this._current.play();
    } catch (e) {
      logger.warn('WinPresentation cancelled or failed', e && e.message);
    } finally {
      eventBus.emit('present:win:end', { tumbleIndex: round.tumbleIndex });
      this._current = null;
    }
  }

  /** 取消当前播放 */
  cancel() {
    if (this._current) this._current.cancel();
  }
}
