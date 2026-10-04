// @ts-check
/* Apex · 时间轴
 * 目的：替代散落的 setTimeout / setInterval
 * 能力：顺序 / 并行 / 等待 / 取消 / 快进
 * 规则：所有动画步骤通过 Timeline 编排，支持一键 cancel
 */

import { logger } from '../shared/logger.js';

/** @typedef {() => void | Promise<void>} Step */

export class Timeline {
  constructor() {
    /** @type {Array<{type:string, fn?:Step, ms?:number}>} */
    this._steps = [];
    this._cancelled = false;
    this._skipped = false;
    this._running = false;
    /** @type {Set<number>} */
    this._timers = new Set();
  }

  /** 添加一步（立即执行，等待其 Promise） */
  step(/** @type {Step} */ fn) {
    this._steps.push({ type: 'step', fn });
    return this;
  }

  /** 等待毫秒 */
  wait(/** @type {number} */ ms) {
    this._steps.push({ type: 'wait', ms });
    return this;
  }

  /** 并行：多个步骤同时启动 */
  parallel(/** @type {Step[]} */ fns) {
    this._steps.push({ type: 'parallel', fn: async function () {
      await Promise.all(fns.map(function (f) {
        return Promise.resolve().then(function () { return f(); });
      }));
    } });
    return this;
  }

  /** 顺序：等价于多次 step */
  sequence(/** @type {Step[]} */ fns) {
    for (let i = 0; i < fns.length; i++) this.step(fns[i]);
    return this;
  }

  /** 播放 */
  async play() {
    if (this._running) {
      logger.warn('timeline already running');
      return;
    }
    this._running = true;
    try {
      for (let i = 0; i < this._steps.length; i++) {
        if (this._cancelled) break;
        const s = this._steps[i];
        if (s.type === 'step' && s.fn) {
          if (this._skipped) continue;
          await s.fn();
        } else if (s.type === 'wait') {
          if (this._skipped) continue;
          await this._sleep(s.ms || 0);
        } else if (s.type === 'parallel' && s.fn) {
          if (this._skipped) continue;
          await s.fn();
        }
      }
    } catch (e) {
      logger.error('timeline play threw', e && e.message);
    } finally {
      this._running = false;
    }
  }

  _sleep(ms) {
    const self = this;
    return new Promise(function (resolve) {
      const t = setTimeout(function () {
        self._timers.delete(t);
        resolve();
      }, ms);
      self._timers.add(t);
    });
  }

  /** 取消：停止后续步骤，但不影响已完成的 */
  cancel() {
    this._cancelled = true;
    this._timers.forEach(function (t) { clearTimeout(t); });
    this._timers.clear();
    return this;
  }

  /** 快进：跳过所有 wait，只执行 step（用于 Turbo / 恢复场景） */
  skip() {
    this._skipped = true;
    return this;
  }

  /** 是否已取消 */
  isCancelled() { return this._cancelled; }

  /** 是否正在播放 */
  isRunning() { return this._running; }

  /** 重置（可复用） */
  reset() {
    this._steps = [];
    this._cancelled = false;
    this._skipped = false;
    this._timers.forEach(function (t) { clearTimeout(t); });
    this._timers.clear();
    return this;
  }

  /** 静态便捷方法：等待 ms */
  static wait(ms) {
    return new Timeline().wait(ms).play();
  }
}
