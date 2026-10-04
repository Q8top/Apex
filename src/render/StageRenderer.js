// @ts-check
/* Apex · 舞台渲染器
 * 职责：
 *   - 创建 6 层结构：Background / Character / Grid / Reels / FX / Win
 *   - 组装 GridRenderer / ReelRenderer / FXRenderer
 *   - 对外暴露统一 API：setGrid / playSpin / highlightWins / tumble / burst
 * 规则：
 *   - 只做视觉，不参与数学
 *   - 后台时自动暂停 FX
 */

import { GRID, TIMING } from '../shared/constants.js';
import { eventBus } from '../core/EventBus.js';
import { logger } from '../shared/logger.js';
import { Timeline } from '../core/Timeline.js';
import { GridRenderer } from './GridRenderer.js';
import { ReelRenderer } from './ReelRenderer.js';
import { FXRenderer } from './FXRenderer.js';

export class StageRenderer {
  /**
   * @param {HTMLElement} root Stage 根容器（CSS 已 position:relative）
   */
  constructor(root) {
    if (!root) throw new Error('StageRenderer: root required');
    this._root = root;
    this._mounted = false;

    /** @type {HTMLElement|null} */
    this._bgLayer = null;
    /** @type {HTMLElement|null} */
    this._charLayer = null;
    /** @type {HTMLElement|null} */
    this._gridLayer = null;
    /** @type {HTMLElement|null} */
    this._reelsLayer = null;
    /** @type {HTMLCanvasElement|null} */
    this._fxCanvas = null;
    /** @type {HTMLElement|null} */
    this._winLayer = null;

    /** @type {GridRenderer|null} */
    this.grid = null;
    /** @type {ReelRenderer|null} */
    this.reels = null;
    /** @type {FXRenderer|null} */
    this.fx = null;
  }

  /** 建立 6 层结构（只调用一次） */
  mount() {
    if (this._mounted) return;
    const root = this._root;
    root.classList.add('ax-stage');
    root.innerHTML = '';

    this._bgLayer = this._layer('ax-layer-bg');
    this._charLayer = this._layer('ax-layer-character');
    this._gridLayer = this._layer('ax-layer-grid');
    this._reelsLayer = this._layer('ax-layer-reels');
    this._winLayer = this._layer('ax-layer-win');

    // FX Canvas（覆盖全舞台）
    this._fxCanvas = document.createElement('canvas');
    this._fxCanvas.className = 'ax-layer-fx';
    this._fxCanvas.setAttribute('aria-hidden', 'true');
    root.appendChild(this._fxCanvas);

    // 子渲染器
    this.grid = new GridRenderer(this._gridLayer);
    this.grid.mount();

    this.reels = new ReelRenderer(this._reelsLayer, this._gridLayer);
    this.reels.onEvent((name, payload) => {
      eventBus.emit(name, payload);
    });

    this.fx = new FXRenderer(this._fxCanvas);

    // 生命周期监听
    eventBus.on('lifecycle:background', () => {
      if (this.fx) this.fx.pause();
    });
    eventBus.on('lifecycle:foreground', () => {
      if (this.fx) this.fx.resume();
      if (this.grid) this.grid.refresh();
    });

    this._mounted = true;
    logger.debug('StageRenderer mounted');
  }

  _layer(cls) {
    const el = document.createElement('div');
    el.className = cls;
    this._root.appendChild(el);
    return el;
  }

  // ── 对外 API ──

  /**
   * 填充网格（不带动画）
   * @param {string[][]} grid
   */
  setGrid(grid) {
    if (this.grid) this.grid.fill(grid);
  }

  /**
   * 播放 Reel 滚动动画
   * @param {string[][]} grid
   * @returns {Promise<void>}
   */
  async playSpin(grid) {
    if (!this.reels) return;
    await this.reels.spin(grid);
  }

  /**
   * 高亮中奖格（其他变暗）
   * @param {Array<[number, number]>} cells
   */
  highlightWins(cells) {
    if (this.grid) this.grid.highlight(cells);
  }

  /** 清除所有中奖状态 */
  clearWins() {
    if (this.grid) this.grid.clearStates();
  }

  /**
   * 消除中奖格
   * @param {Array<[number, number]>} cells
   */
  removeWins(cells) {
    if (this.grid) this.grid.remove(cells);
  }

  /**
   * Tumble 下落 + 补位
   * @param {string[][]} nextGrid
   * @param {Array<[number, number]>} removedCells
   */
  applyTumble(nextGrid, removedCells) {
    if (this.grid) this.grid.applyTumble(nextGrid, removedCells);
  }

  /** 清除入场动画类 */
  clearRespawn() {
    if (this.grid) this.grid.clearRespawn();
  }

  /**
   * 在指定格位置播放粒子爆炸
   * @param {number} col
   * @param {number} row
   * @param {{color?:string|string[], count?:number}} [opts]
   */
  burstAt(col, row, opts) {
    if (!this.fx || !this.grid) return;
    const cell = this.grid.cell(col, row);
    if (!cell) return;
    const canvasRect = this._fxCanvas.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const x = cellRect.left + cellRect.width / 2 - canvasRect.left;
    const y = cellRect.top + cellRect.height / 2 - canvasRect.top;
    this.fx.burst(x, y, opts);
  }

  /**
   * 高亮整个网格区域爆炸（用于 BigWin / FS 入场）
   * @param {{color?:string|string[], count?:number}} [opts]
   */
  burstCenter(opts) {
    if (!this.fx) return;
    const rect = this._fxCanvas.getBoundingClientRect();
    this.fx.burst(rect.width / 2, rect.height / 2, opts);
  }

  /**
   * 舞台光晕脉冲
   * @param {string} [color]
   */
  pulseGlow(color) {
    if (!this.fx) return;
    const rect = this._fxCanvas.getBoundingClientRect();
    this.fx.glow(rect.width / 2, rect.height / 2, { color: color || '#f5d76e', radius: 40 });
  }

  /** 切换 FS 模式（舞台变紫） */
  setFreeSpinMode(on) {
    if (!this._root) return;
    this._root.classList.toggle('is-fs-mode', !!on);
  }

  /** 取消所有动画 */
  cancelAll() {
    if (this.reels) this.reels.cancel();
    if (this.fx) this.fx.clear();
  }

  /** 销毁 */
  destroy() {
    this.cancelAll();
    if (this.grid) this.grid.destroy();
    if (this.fx) this.fx.destroy();
    this._root.innerHTML = '';
    this._mounted = false;
  }
}

/** 便捷函数：等待所有视觉过渡完成（用于 timeline） */
export function visualDelay(ms) {
  return new Timeline().wait(ms).play();
}
