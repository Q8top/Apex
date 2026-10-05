/* ============================================================
 * Apex Olympius · GridRenderer
 * ------------------------------------------------------------
 * 6×5 网格布局与符号分发。不画符号本身（委托 SymbolRenderer）。
 *
 * Step 3.4 改动：
 *   - 优先从 player.visualGrid 读 cell id 与时间戳动画
 *   - 用 timeline.now 采样 → dx/dy/scale/alpha/glow
 *   - 兼容旧路径（player.visualState.grid，无动画）
 *
 * 契约：
 *   render(ctx, w, h) : 每帧调用
 *
 * 布局：
 *   cell = min(availW/6, availH/5)，居中，不拉伸
 *
 * 禁：Math.random / eval / new Function
 * ============================================================ */

export const VERSION = 'olympius-grid-renderer-v1.1.0';

export const GRID_COLS = 6;
export const GRID_ROWS = 5;

const PAD_RATIO = 0.04;
const CELL_GAP_RATIO = 0.04;

export class GridRenderer {
  constructor({ player, symbolRenderer, timeline = null, debug = false } = {}) {
    if (!player) throw new Error('GridRenderer: player is required');
    if (!symbolRenderer) throw new Error('GridRenderer: symbolRenderer is required');
    this.player = player;
    this.symbolRenderer = symbolRenderer;
    this.timeline = timeline;
    this.debug = debug;

    this._layout = null;
    this._lastKey = '';
    this._lastDrawCount = 0;
  }

  get layout() { return this._layout; }
  get drawCount() { return this._lastDrawCount; }
}

GridRenderer.prototype._computeLayout = function (w, h) {
  const key = w + 'x' + h;
  if (key === this._lastKey && this._layout) return this._layout;

  const pad = Math.min(w, h) * PAD_RATIO;
  const availW = Math.max(1, w - pad * 2);
  const availH = Math.max(1, h - pad * 2);
  const cell = Math.min(availW / GRID_COLS, availH / GRID_ROWS);
  const gridW = cell * GRID_COLS;
  const gridH = cell * GRID_ROWS;
  const ox = (w - gridW) / 2;
  const oy = (h - gridH) / 2;

  this._layout = { w: w, h: h, pad: pad, cell: cell, gridW: gridW, gridH: gridH, ox: ox, oy: oy };
  this._lastKey = key;
  return this._layout;
};

GridRenderer.prototype._resolveNow = function () {
  if (this.timeline && Number.isFinite(this.timeline.now)) return this.timeline.now;
  return 0;
};

GridRenderer.prototype._cellView = function (r, c, now) {
  const vg = this.player.visualGrid;
  if (vg && typeof vg.sample === 'function') {
    const cell = vg.getCell(r, c);
    if (cell) {
      if (cell.id == null || cell.id < 0) return null;
      const s = vg.sample(r, c, now);
      return { id: cell.id, view: s };
    }
  }
  // 兼容旧路径
  const grid = this.player.visualState && this.player.visualState.grid;
  if (grid && grid[r] && grid[r][c] != null && grid[r][c] >= 0) {
    return {
      id: grid[r][c],
      view: { dx: 0, dy: 0, scale: 1 - CELL_GAP_RATIO, alpha: 1, glow: 0, rotate: 0, done: true },
    };
  }
  return null;
};

GridRenderer.prototype.render = function (ctx, w, h) {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    this._lastDrawCount = 0;
    return 0;
  }

  const layout = this._computeLayout(w, h);
  const cell = layout.cell;
  const ox = layout.ox;
  const oy = layout.oy;
  const half = cell / 2;
  const now = this._resolveNow();

  let drawn = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const hit = this._cellView(r, c, now);
      if (!hit) continue;

      const v = hit.view;
      const cx = ox + c * cell + half + (v.dx || 0) * cell;
      const cy = oy + r * cell + half + (v.dy || 0) * cell;

      const state = {
        alpha: v.alpha != null ? v.alpha : 1,
        scale: (v.scale != null ? v.scale : 1) * (1 - CELL_GAP_RATIO),
        rotate: v.rotate || 0,
        glow: v.glow || 0,
      };

      const ok = this.symbolRenderer.draw(ctx, hit.id, cx, cy, cell, state);
      if (ok) drawn++;
    }
  }

  this._lastDrawCount = drawn;
  return drawn;
};
