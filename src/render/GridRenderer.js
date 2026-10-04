// @ts-check
/* Apex · 网格渲染器
 * 职责：
 *   - 6×5 网格 DOM 初始化（一次建立，后续只更新 class / transform）
 *   - 行高根据容器尺寸自动计算（CSS 变量 --row-h）
 *   - 中奖高亮 / 变暗 / 消除 / 下落
 *   - Resize / orientationchange 自适应
 * 规则：不参与数学，只做视觉
 */

import { GRID } from '../shared/constants.js';
import { symbolRenderer } from './SymbolRenderer.js';
import { logger } from '../shared/logger.js';

export class GridRenderer {
  /**
   * @param {HTMLElement} container 6×5 网格容器（CSS 已定位）
   */
  constructor(container) {
    if (!container) throw new Error('GridRenderer: container required');
    this._el = container;
    /** @type {HTMLElement[][]} 列 / 行 → 符号 DOM */
    this._cells = [];
    this._ready = false;
    this._onResize = this._recalc.bind(this);
    this._resizeTimer = 0;
  }

  /** 初始化网格 DOM（只调用一次） */
  mount() {
    if (this._ready) return;
    const cols = GRID.COLS;
    const rows = GRID.ROWS;
    const frag = document.createDocumentFragment();

    for (let c = 0; c < cols; c++) {
      const col = document.createElement('div');
      col.className = 'ax-col';
      col.setAttribute('data-col', String(c));
      const colCells = [];
      for (let r = 0; r < rows; r++) {
        const sym = symbolRenderer.create('GEM_BLUE');
        sym.setAttribute('data-col', String(c));
        sym.setAttribute('data-row', String(r));
        sym.style.setProperty('--row', String(r));
        col.appendChild(sym);
        colCells.push(sym);
      }
      frag.appendChild(col);
      this._cells.push(colCells);
    }

    this._el.innerHTML = '';
    this._el.appendChild(frag);
    this._el.classList.add('ax-grid--mounted');
    this._ready = true;

    // Resize 监听（去抖）
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);

    this._recalc();
    logger.debug('GridRenderer mounted');
  }

  /** 重新计算行高（写在 CSS 变量 --row-h 上） */
  _recalc() {
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    const self = this;
    this._resizeTimer = window.setTimeout(function () {
      const H = self._el.clientHeight;
      if (!H) return;
      const styles = window.getComputedStyle(self._el);
      const padTop = parseFloat(styles.paddingTop) || 0;
      const padBottom = parseFloat(styles.paddingBottom) || 0;
      const gap = parseFloat(styles.rowGap || styles.gap) || 0;
      const inner = H - padTop - padBottom - (GRID.ROWS - 1) * gap;
      const rowH = inner / GRID.ROWS;
      if (rowH > 0) {
        self._el.style.setProperty('--row-h', rowH.toFixed(2) + 'px');
      }
    }, 60);
  }

  /** 强制重新计算（外部可调） */
  refresh() {
    this._recalc();
  }

  /**
   * 填充整个网格（grid[col][row]）
   * @param {string[][]} grid
   */
  fill(grid) {
    if (!this._ready) return;
    for (let c = 0; c < GRID.COLS; c++) {
      for (let r = 0; r < GRID.ROWS; r++) {
        const el = this._cells[c][r];
        el.classList.remove('is-winning', 'is-dimmed', 'is-removing', 'is-respawning', 'is-landing');
        symbolRenderer.update(el, grid[c][r]);
      }
    }
  }

  /**
   * 清空所有状态
   */
  clearStates() {
    if (!this._ready) return;
    for (let c = 0; c < GRID.COLS; c++) {
      for (let r = 0; r < GRID.ROWS; r++) {
        this._cells[c][r].classList.remove(
          'is-winning', 'is-dimmed', 'is-removing', 'is-respawning', 'is-landing', 'is-special', 'is-multiplier'
        );
      }
    }
  }

  /**
   * 高亮中奖格（其他变暗）
   * @param {Array<[number, number]>} cells
   */
  highlight(cells) {
    if (!this._ready) return;
    // 先全部 dim
    for (let c = 0; c < GRID.COLS; c++) {
      for (let r = 0; r < GRID.ROWS; r++) {
        this._cells[c][r].classList.add('is-dimmed');
      }
    }
    // 中奖格高亮
    for (let i = 0; i < cells.length; i++) {
      const [c, r] = cells[i];
      const el = this._cells[c] && this._cells[c][r];
      if (el) {
        el.classList.remove('is-dimmed');
        el.classList.add('is-winning');
      }
    }
  }

  /**
   * 标记中奖格消除
   * @param {Array<[number, number]>} cells
   */
  remove(cells) {
    if (!this._ready) return;
    for (let i = 0; i < cells.length; i++) {
      const [c, r] = cells[i];
      const el = this._cells[c] && this._cells[c][r];
      if (el) el.classList.add('is-removing');
    }
  }

  /**
   * 应用下一帧网格（用于 Tumble 下落 + 补位）
   * @param {string[][]} nextGrid
   * @param {Array<[number, number]>} removedCells 哪些格是全新补位（入场动画）
   */
  applyTumble(nextGrid, removedCells) {
    if (!this._ready) return;
    const removedSet = new Set();
    for (let i = 0; i < removedCells.length; i++) {
      removedSet.add(removedCells[i][0] + '_' + removedCells[i][1]);
    }
    for (let c = 0; c < GRID.COLS; c++) {
      for (let r = 0; r < GRID.ROWS; r++) {
        const el = this._cells[c][r];
        el.classList.remove('is-winning', 'is-dimmed', 'is-removing');
        symbolRenderer.update(el, nextGrid[c][r]);
        el.style.setProperty('--row', String(r));
        if (removedSet.has(c + '_' + r)) {
          el.classList.add('is-respawning');
        }
      }
    }
  }

  /**
   * 完成后清除入场类
   */
  clearRespawn() {
    if (!this._ready) return;
    const els = this._el.querySelectorAll('.ax-symbol.is-respawning');
    for (let i = 0; i < els.length; i++) els[i].classList.remove('is-respawning');
  }

  /**
   * 获取指定格
   * @param {number} col
   * @param {number} row
   * @returns {HTMLElement|null}
   */
  cell(col, row) {
    if (!this._ready) return null;
    const c = this._cells[col];
    return c ? c[row] || null : null;
  }

  /** 销毁 */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    this._cells = [];
    this._ready = false;
    this._el.innerHTML = '';
  }
}
