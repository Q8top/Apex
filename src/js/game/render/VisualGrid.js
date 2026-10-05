/* ============================================================
 * Apex Olympius · VisualGrid
 * ------------------------------------------------------------
 * 时间戳驱动的 6×5 视觉网格状态容器。
 * 不持有时钟、不做绘制、不做数学运算。
 *
 * 每个 cell 存：
 *   { id: number, anim: { type, startAt, dur, from, to, easingName } | null }
 *
 * sample(r, c, now) 是纯读：给定时刻，返回插值后的几何参数。
 * 归一化：dx / dy 以 cell 为单位（1.0 = 一整个 cell 宽/高）。
 *
 * 禁：Math.random / eval / new Function
 * ============================================================ */

import { clamp01, lerp, easeOutCubic, easeInCubic, easeOutBack } from './Easing.js';

export const VERSION = 'olympius-visual-grid-v1.0.0';

const DEFAULT_ENTER_DUR = 420;
const DEFAULT_DESTROY_DUR = 260;
const DEFAULT_WIN_DUR = 320;

const ENTER_FROM = { dx: 0, dy: -1.4, scale: 0.85, alpha: 0.3, glow: 0, rotate: 0 };
const ENTER_TO   = { dx: 0, dy: 0,    scale: 1,    alpha: 1,   glow: 0, rotate: 0 };
const DESTROY_FROM = { dx: 0, dy: 0, scale: 1, alpha: 1, glow: 0, rotate: 0 };
const DESTROY_TO   = { dx: 0, dy: 0, scale: 0, alpha: 0, glow: 0, rotate: 0 };
const WIN_FROM = { dx: 0, dy: 0, scale: 1,    alpha: 1, glow: 0, rotate: 0 };
const WIN_TO   = { dx: 0, dy: 0, scale: 1.08, alpha: 1, glow: 1, rotate: 0 };

const EASINGS = {
  easeOutCubic: easeOutCubic,
  easeInCubic:  easeInCubic,
  easeOutBack:  easeOutBack,
};

const EMPTY_VIEW = Object.freeze({
  dx: 0, dy: 0, scale: 1, alpha: 1, glow: 0, rotate: 0, done: true,
});

export class VisualGrid {
  constructor(cols = 6, rows = 5) {
    if (!(cols > 0) || !(rows > 0)) throw new Error('VisualGrid: invalid dims');
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
    this._reset();
  }

  _reset() {
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({ id: -1, anim: null });
      }
      this.cells.push(row);
    }
  }

  setCell(r, c, id, anim) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
    this.cells[r][c] = { id: id, anim: anim || null };
    return true;
  }

  getCell(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
    return this.cells[r][c];
  }

  clearAnim(r, c) {
    const cell = this.getCell(r, c);
    if (cell) cell.anim = null;
  }

  clearAll() {
    this._reset();
  }
}

VisualGrid.prototype.setGridAll = function (grid, opts) {
  if (!Array.isArray(grid) || grid.length !== this.rows) return false;
  const o = opts || {};
  const now = o.now || 0;
  const dur = o.dur != null ? o.dur : DEFAULT_ENTER_DUR;
  const stagger = o.staggerPerCol || 0;

  for (let r = 0; r < this.rows; r++) {
    for (let c = 0; c < this.cols; c++) {
      const id = (grid[r] && grid[r][c] != null) ? grid[r][c] : -1;
      this.cells[r][c] = {
        id: id,
        anim: {
          type: 'enter',
          startAt: now + c * stagger,
          dur: dur,
          from: ENTER_FROM,
          to: ENTER_TO,
          easingName: 'easeOutCubic',
        },
      };
    }
  }
  return true;
};

VisualGrid.prototype.sample = function (r, c, now) {
  const cell = this.getCell(r, c);
  if (!cell || !cell.anim) return EMPTY_VIEW;

  const a = cell.anim;
  const dt = now - a.startAt;
  if (dt <= 0) return this._viewFrom(a.from, false);
  if (a.dur <= 0 || dt >= a.dur) return this._viewFrom(a.to, true);

  const t = clamp01(dt / a.dur);
  const fn = EASINGS[a.easingName] || easeOutCubic;
  const e = fn(t);
  return {
    dx:     lerp(a.from.dx     || 0, a.to.dx     || 0, e),
    dy:     lerp(a.from.dy     || 0, a.to.dy     || 0, e),
    scale:  lerp(a.from.scale  != null ? a.from.scale  : 1, a.to.scale  != null ? a.to.scale  : 1, e),
    alpha:  lerp(a.from.alpha  != null ? a.from.alpha  : 1, a.to.alpha  != null ? a.to.alpha  : 1, e),
    glow:   lerp(a.from.glow   || 0, a.to.glow   || 0, e),
    rotate: lerp(a.from.rotate || 0, a.to.rotate || 0, e),
    done: false,
  };
};

VisualGrid.prototype._viewFrom = function (v, done) {
  return {
    dx: v.dx || 0,
    dy: v.dy || 0,
    scale: v.scale != null ? v.scale : 1,
    alpha: v.alpha != null ? v.alpha : 1,
    glow: v.glow || 0,
    rotate: v.rotate || 0,
    done: done,
  };
};

VisualGrid.prototype.animateEnter = function (r, c, id, opts) {
  const o = opts || {};
  const now = o.now || 0;
  const dur = o.dur != null ? o.dur : DEFAULT_ENTER_DUR;
  const stagger = o.staggerMs || 0;
  return this.setCell(r, c, id, {
    type: 'enter',
    startAt: now + stagger,
    dur: dur,
    from: ENTER_FROM,
    to: ENTER_TO,
    easingName: 'easeOutCubic',
  }) !== false;
};

VisualGrid.prototype.animateDestroy = function (r, c, opts) {
  const cell = this.getCell(r, c);
  if (!cell) return false;
  const o = opts || {};
  const now = o.now || 0;
  const dur = o.dur != null ? o.dur : DEFAULT_DESTROY_DUR;
  cell.anim = {
    type: 'destroy',
    startAt: now,
    dur: dur,
    from: DESTROY_FROM,
    to: DESTROY_TO,
    easingName: 'easeInCubic',
  };
  return true;
};

VisualGrid.prototype.animateWin = function (r, c, opts) {
  const cell = this.getCell(r, c);
  if (!cell) return false;
  const o = opts || {};
  const now = o.now || 0;
  const dur = o.dur != null ? o.dur : DEFAULT_WIN_DUR;
  cell.anim = {
    type: 'win',
    startAt: now,
    dur: dur,
    from: WIN_FROM,
    to: WIN_TO,
    easingName: 'easeOutBack',
  };
  return true;
};
