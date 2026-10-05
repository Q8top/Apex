/* ============================================================
 * Apex Olympius · RenderPlayer
 * ------------------------------------------------------------
 * 实现 GameEngine 的 12 个 Player 钩子契约。
 * 每个钩子 async，用 timeline.wait(ms) 制造异步边界。
 *
 * Step 3.3 改动：
 *   - 引入内部 VisualGrid，钩子进入时写入时间戳动画
 *   - 保留 visualState（向后兼容，GridRenderer Step 3.4 才切换）
 *   - 时间缩放唯一来源仍是 timeline.speed，_dur() 返回原值
 *
 * 禁：Math.random / eval / new Function
 * ============================================================ */

import { DURATION, SPEED } from './RenderConstants.js';
import { VisualGrid } from './VisualGrid.js';

export const VERSION = 'olympius-render-player-v1.1.0';

const GRID_COLS = 6;
const GRID_ROWS = 5;

export class RenderPlayer {
  constructor({ timeline, onHook = null, debug = false } = {}) {
    if (!timeline) throw new Error('RenderPlayer: timeline is required');
    this.timeline = timeline;
    this.onHook = onHook;
    this.debug = debug;

    /* 视觉状态（向后兼容 GridRenderer v1） */
    this.visualState = {
      grid: null,
      winning: [],
      destroying: [],
      multipliers: [],
      scatterCount: 0,
      fsSpins: 0,
      fsTotal: 0,
      bigWinTier: null,
      bigWinAmount: 0,
      lastTumble: null,
    };

    /* 时间戳网格（Step 3.4 起 GridRenderer 读这个） */
    this.visualGrid = new VisualGrid(GRID_COLS, GRID_ROWS);

    this._speedScale = SPEED.NORMAL;
  }

  _emit(name, payload) {
    if (this.debug) console.log('[Player]', name, payload || '');
    if (typeof this.onHook === 'function') {
      try { this.onHook(name, payload); }
      catch (e) { console.error('[Player] onHook error', e); }
    }
  }

  _dur(ms) {
    return ms;
  }

  _now() {
    return this.timeline.now;
  }

  async spinStart() {
    this._emit('spinStart', null);
    await this.timeline.wait(this._dur(DURATION.SPIN_CHARGE));
  }

  async reelsStop(grid) {
    const now = this._now();
    this.visualState.grid = grid ? grid.map((row) => row.slice()) : null;
    if (grid) {
      this.visualGrid.setGridAll(grid, {
        now: now,
        dur: DURATION.REEL_DROP,
        staggerPerCol: DURATION.REEL_STAGGER,
      });
    }
    this._emit('reelsStop', { rows: grid ? grid.length : 0 });
    const total = DURATION.REEL_DROP + DURATION.REEL_STAGGER * (GRID_COLS - 1);
    await this.timeline.wait(this._dur(total));
  }

  async winHighlight() {
    this._emit('winHighlight', null);
    await this.timeline.wait(this._dur(DURATION.WIN_HIGHLIGHT));
  }

  async symbolDestroy(positions) {
    const now = this._now();
    const arr = Array.isArray(positions) ? positions.slice() : [];
    this.visualState.destroying = arr;

    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      if (p && p.length >= 2) {
        this.visualGrid.animateDestroy(p[0], p[1], {
          now: now,
          dur: DURATION.SYMBOL_DESTROY,
        });
      }
    }

    this._emit('symbolDestroy', { count: arr.length });
    await this.timeline.wait(this._dur(DURATION.SYMBOL_DESTROY));
    this.visualState.destroying = [];
  }

  async tumble(gridBefore, gridAfter) {
    const now = this._now();
    this.visualState.lastTumble = {
      removed: this.visualState.destroying.slice(),
      gridBefore: gridBefore ? gridBefore.map((r) => r.slice()) : null,
      gridAfter: gridAfter ? gridAfter.map((r) => r.slice()) : null,
    };
    if (gridAfter) {
      this.visualState.grid = gridAfter.map((row) => row.slice());
      this.visualGrid.setGridAll(gridAfter, {
        now: now,
        dur: DURATION.TUMBLE_DROP,
        staggerPerCol: DURATION.REEL_STAGGER * 0.5,
      });
    }
    this._emit('tumble', { rows: gridAfter ? gridAfter.length : 0 });
    await this.timeline.wait(this._dur(DURATION.TUMBLE_DROP));
  }

  async multiplier(value) {
    this.visualState.multipliers.push(value);
    this._emit('multiplier', { value, total: this.visualState.multipliers.length });
    await this.timeline.wait(this._dur(DURATION.MULTIPLIER_DROP));
  }

  async scatterCheck(count) {
    this.visualState.scatterCount = count;
    this._emit('scatterCheck', { count });
    await this.timeline.wait(this._dur(DURATION.SCATTER_SWEEP));
  }

  async fsTrigger(spins) {
    this.visualState.fsSpins = spins;
    this._emit('fsTrigger', { spins });
    await this.timeline.wait(this._dur(DURATION.FS_TRIGGER));
  }

  async fsSpinStart(idx, total) {
    this.visualState.fsSpins = Math.max(0, total - idx);
    this.visualState.fsTotal = total;
    this._emit('fsSpinStart', { idx, total });
    await this.timeline.wait(this._dur(DURATION.SPIN_CHARGE));
  }

  async fsEnd(fs) {
    this._emit('fsEnd', {
      totalWin: fs ? fs.totalWin : 0,
      retriggers: fs ? fs.retriggers : 0,
    });
    await this.timeline.wait(this._dur(DURATION.SPIN_CHARGE));
  }

  async bigWin(tier, amount) {
    this.visualState.bigWinTier = tier;
    this.visualState.bigWinAmount = amount;
    this._emit('bigWin', { tier, amount });
    const total = DURATION.BIGWIN_INTRO + DURATION.BIGWIN_COUNT + DURATION.BIGWIN_OUTRO;
    await this.timeline.wait(this._dur(total));
    this.visualState.bigWinTier = null;
    this.visualState.bigWinAmount = 0;
  }

  async complete(result) {
    this._emit('complete', {
      totalWin: result ? result.totalWin : 0,
      hasFS: !!(result && result.freeSpins),
    });
    await this.timeline.wait(this._dur(120));
  }

  resetVisualState() {
    this.visualState.winning = [];
    this.visualState.destroying = [];
    this.visualState.multipliers = [];
    this.visualState.scatterCount = 0;
    this.visualState.fsSpins = 0;
    this.visualState.fsTotal = 0;
    this.visualState.bigWinTier = null;
    this.visualState.bigWinAmount = 0;
    this.visualState.lastTumble = null;
    this.visualGrid.clearAll();
  }

  setSpeed(scale) {
    if (!Number.isFinite(scale) || scale <= 0) {
      throw new Error('RenderPlayer.setSpeed: invalid');
    }
    this._speedScale = scale;
    this.timeline.setSpeed(scale);
  }

  getSpeed() { return this._speedScale; }
}
