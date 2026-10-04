// @ts-check
/* Apex · Reel 滚动渲染器
 * 职责：
 *   - Spin 时显示 6 列滚动层（覆盖在 grid 上方）
 *   - 每列 accel → cruise → decel → stop，列间 stagger
 *   - 停止后自动淡出，揭示下面的 grid
 * 规则：不参与数学，只做视觉；支持 cancel
 */

import { GRID, TIMING } from '../shared/constants.js';
import { symbolRenderer } from './SymbolRenderer.js';
import { Timeline } from '../core/Timeline.js';
import { logger } from '../shared/logger.js';

export class ReelRenderer {
  /**
   * @param {HTMLElement} reelsLayer 覆盖层容器（position:absolute）
   * @param {HTMLElement} gridLayer 用于测量行高
   */
  constructor(reelsLayer, gridLayer) {
    if (!reelsLayer) throw new Error('ReelRenderer: reelsLayer required');
    this._el = reelsLayer;
    this._gridEl = gridLayer;
    this._tracks = [];
    this._timeline = null;
    this._ready = false;
  }

  /**
   * 播放 6 列滚动动画
   * @param {string[][]} targetGrid grid[col][row]
   * @returns {Promise<void>}
   */
  async spin(targetGrid) {
    if (this._ready) {
      logger.warn('ReelRenderer already running');
      return;
    }
    this._ready = true;

    const reelsEl = this._el;
    reelsEl.innerHTML = '';
    reelsEl.classList.add('is-active');

    // 测量
    const H = this._gridEl ? this._gridEl.clientHeight : 300;
    const styles = this._gridEl ? window.getComputedStyle(this._gridEl) : null;
    const padTop = styles ? (parseFloat(styles.paddingTop) || 0) : 8;
    const padBottom = styles ? (parseFloat(styles.paddingBottom) || 0) : 8;
    const gap = styles ? (parseFloat(styles.rowGap || styles.gap) || 4) : 4;
    const inner = H - padTop - padBottom - (GRID.ROWS - 1) * gap;
    const cellH = Math.max(24, inner / GRID.ROWS);
    const totalCellH = cellH + gap;

    // 每列要滚动的虚拟格子数
    const SCROLL_CELLS = 8;
    // 目标落位：初始可视区显示 SCROLL_CELLS 之后的前 ROWS 格
    const offsetTo = -SCROLL_CELLS * totalCellH;

    const tracks = [];
    const colFrag = document.createDocumentFragment();

    for (let c = 0; c < GRID.COLS; c++) {
      const col = document.createElement('div');
      col.className = 'ax-reel-col';

      const track = document.createElement('div');
      track.className = 'ax-reel-track';
      track.style.setProperty('--cell-h', cellH.toFixed(2) + 'px');
      track.style.setProperty('--cell-gap', gap + 'px');

      // 虚拟滚动格
      for (let i = 0; i < SCROLL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'ax-reel-cell';
        const sym = symbolRenderer.create(pickScrollSymbol(c, i));
        cell.appendChild(sym);
        track.appendChild(cell);
      }
      // 目标格
      for (let r = 0; r < GRID.ROWS; r++) {
        const cell = document.createElement('div');
        cell.className = 'ax-reel-cell';
        const sym = symbolRenderer.create(targetGrid[c][r]);
        cell.appendChild(sym);
        track.appendChild(cell);
      }

      track.style.transform = 'translate3d(0, 0, 0)';
      col.appendChild(track);
      colFrag.appendChild(col);
      tracks.push(track);
    }

    reelsEl.appendChild(colFrag);
    this._tracks = tracks;

    // 编排时间轴
    this._timeline = new Timeline();

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const delay = i * TIMING.REEL_STAGGER;
      const duration = TIMING.REEL_ACCEL + TIMING.REEL_CRUISE + TIMING.REEL_DECEL;

      const self = this;
      this._timeline.step(function () {
        return new Promise(function (resolve) {
          const t = setTimeout(function () {
            track.style.transition = 'transform ' + duration + 'ms cubic-bezier(.22,.68,.28,1)';
            track.style.transform = 'translate3d(0,' + offsetTo + 'px,0)';
            // 每列停止后触发事件
            const stopT = setTimeout(function () {
              self._emit('reel:stop', { col: i });
              resolve();
            }, duration + 20);
            self._timers = self._timers || new Set();
            self._timers.add(stopT);
          }, delay);
          self._timers = self._timers || new Set();
          self._timers.add(t);
        });
      });
    }

    // 等最后一列停下
    const lastStop = (GRID.COLS - 1) * TIMING.REEL_STAGGER +
                     (TIMING.REEL_ACCEL + TIMING.REEL_CRUISE + TIMING.REEL_DECEL);
    this._timeline.wait(lastStop + 60);
    // 淡出
    this._timeline.step(function () {
      reelsEl.classList.remove('is-active');
      return new Promise(function (r) { setTimeout(r, 200); });
    });
    this._timeline.step(function () {
      reelsEl.innerHTML = '';
      reelsEl.classList.remove('is-active');
    });

    await this._timeline.play();

    this._tracks = [];
    this._ready = false;
    this._timeline = null;
  }

  _emit(name, payload) {
    if (this._onEvent) {
      try { this._onEvent(name, payload); } catch (_) {}
    }
  }

  /** 设置事件回调 */
  onEvent(handler) {
    this._onEvent = handler;
  }

  /** 取消 */
  cancel() {
    if (this._timeline) this._timeline.cancel();
    if (this._timers) {
      this._timers.forEach(function (t) { clearTimeout(t); });
      this._timers.clear();
    }
    this._el.innerHTML = '';
    this._el.classList.remove('is-active');
    this._tracks = [];
    this._ready = false;
  }

  /** 是否正在播放 */
  isRunning() { return this._ready; }
}

/* 无依赖的伪随机（避免用 Math.random）：
 * 用当前时间 + 列号 + 序号的线性组合，取模到符号集
 * —— 这仅是视觉滚动格，不影响数学结果
 */
function pickScrollSymbol(col, idx) {
  const SYMS = ['GEM_BLUE', 'GEM_GREEN', 'GEM_PURPLE', 'GEM_RED', 'CHALICE', 'RING', 'HOURGLASS', 'CROWN'];
  const t = Date.now() & 0xffff;
  const n = (t + col * 31 + idx * 7) % SYMS.length;
  return SYMS[n];
}
