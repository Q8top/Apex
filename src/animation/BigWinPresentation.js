// @ts-check
/* Apex · 大奖弹幕
 * 职责：BIG WIN / MEGA WIN / EPIC WIN 分级播放
 * 流程：
 *   screen darken → title reveal → count up → particle burst → final lock → exit
 * 规则：
 *   - 阈值由调用方传入（不在本模块写死）
 *   - 支持 cancel
 *   - 数学结果由外部传入，不改数学
 */

import { TIMING } from '../shared/constants.js';
import { eventBus } from '../core/EventBus.js';
import { countUp, Ease, playClass } from './Animate.js';
import { logger } from '../shared/logger.js';

/** 默认阈值（可按倍数覆盖） */
export const DEFAULT_LEVELS = {
  BIG:  20,
  MEGA: 50,
  EPIC: 100
};

export class BigWinPresentation {
  /**
   * @param {Object} deps
   * @param {HTMLElement} deps.overlay    遮罩容器（CSS 控制显隐）
   * @param {HTMLElement} deps.titleEl    标题元素
   * @param {HTMLElement} deps.amountEl   数字元素
   * @param {(v:number)=>string} [deps.formatter]
   * @param {(name:string, arg?:any)=>void} [deps.playSfx]
   * @param {import('../render/StageRenderer.js').StageRenderer} [deps.stage]
   * @param {{BIG?:number, MEGA?:number, EPIC?:number}} [deps.levels]
   */
  constructor(deps) {
    if (!deps || !deps.overlay) throw new Error('BigWinPresentation: overlay required');
    this._overlay = deps.overlay;
    this._title = deps.titleEl || null;
    this._amount = deps.amountEl || null;
    this._fmt = deps.formatter || function (v) { return String(Math.round(v)); };
    this._sfx = deps.playSfx || function () {};
    this._stage = deps.stage || null;
    this._levels = Object.assign({}, DEFAULT_LEVELS, deps.levels || {});
    this._running = false;
    this._cancelled = false;
    this._counter = null;
  }

  /**
   * 判断赢奖属于哪个等级
   * @param {number} winMultiplier  赢奖 / 下注
   * @returns {'NONE'|'BIG'|'MEGA'|'EPIC'}
   */
  classify(winMultiplier) {
    const m = Number(winMultiplier) || 0;
    if (m >= this._levels.EPIC) return 'EPIC';
    if (m >= this._levels.MEGA) return 'MEGA';
    if (m >= this._levels.BIG) return 'BIG';
    return 'NONE';
  }

  /**
   * 播放
   * @param {number} totalWin       赢奖（主单位）
   * @param {number} bet            下注（主单位）
   * @returns {Promise<'NONE'|'BIG'|'MEGA'|'EPIC'>}
   */
  async play(totalWin, bet) {
    if (this._running) {
      logger.warn('BigWinPresentation already running');
      return 'NONE';
    }
    const mult = bet > 0 ? (totalWin / bet) : 0;
    const level = this.classify(mult);
    if (level === 'NONE') return 'NONE';

    this._running = true;
    this._cancelled = false;

    const overlay = this._overlay;
    const title = this._title;
    const amount = this._amount;

    const label = level === 'EPIC' ? 'EPIC WIN'
                : level === 'MEGA' ? 'MEGA WIN'
                : 'BIG WIN';

    // 1. 显示遮罩 + 标题
    overlay.setAttribute('data-level', level.toLowerCase());
    overlay.classList.add('is-show');
    playClass(overlay, 'is-enter', 600);

    if (title) {
      title.textContent = label;
      title.classList.remove('is-anim');
      void title.offsetWidth;
      title.classList.add('is-anim');
    }

    // 音效
    this._sfx(level === 'EPIC' ? 'epicwin' : level === 'MEGA' ? 'megawin' : 'bigwin');

    // 2. 数字从 0 滚到 totalWin
    await this._delay(240);
    if (this._cancelled) return level;

    if (amount) {
      amount.textContent = this._fmt(0);
      this._counter = countUp(amount, 0, totalWin, {
        duration: TIMING.BIGWIN_COUNTUP,
        formatter: this._fmt,
        ease: Ease.outExpo
      });
      await this._counter.promise;
      this._counter = null;
    } else {
      await this._delay(TIMING.BIGWIN_COUNTUP);
    }

    if (this._cancelled) return level;

    // 3. 粒子爆发
    if (this._stage) {
      const color = level === 'EPIC' ? ['#ff3d8d', '#7b61ff', '#f4c542']
                  : level === 'MEGA' ? ['#7b61ff', '#f4c542']
                  : ['#f4c542', '#ff6cab'];
      this._stage.burstCenter({ color: color, count: 60, speed: 260, life: 1200 });
      this._stage.pulseGlow(color[0]);
    }

    // 4. 数字脉冲（强调）
    if (amount) {
      playClass(amount, 'is-pulse', 500);
    }

    // 5. 停留展示
    await this._delay(1100);
    if (this._cancelled) return level;

    // 6. 退出
    overlay.classList.remove('is-enter');
    overlay.classList.add('is-exit');
    await this._delay(420);
    overlay.classList.remove('is-show', 'is-exit');
    overlay.removeAttribute('data-level');

    this._running = false;
    eventBus.emit('present:bigwin:end', { level: level, totalWin: totalWin });
    return level;
  }

  _delay(ms) {
    const self = this;
    return new Promise(function (resolve) {
      const t = setTimeout(function () {
        if (self._cancelled) { resolve(); return; }
        resolve();
      }, ms);
      self._timers = self._timers || new Set();
      self._timers.add(t);
    });
  }

  /** 取消 */
  cancel() {
    this._cancelled = true;
    this._running = false;
    if (this._counter) { this._counter.cancel(); this._counter = null; }
    if (this._timers) {
      this._timers.forEach(function (t) { clearTimeout(t); });
      this._timers.clear();
    }
    this._overlay.classList.remove('is-show', 'is-enter', 'is-exit');
    this._overlay.removeAttribute('data-level');
  }

  isRunning() { return this._running; }
}
