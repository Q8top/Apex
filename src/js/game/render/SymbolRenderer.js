/* ============================================================
 * Apex Olympius · SymbolRenderer
 * ------------------------------------------------------------
 * 10 个符号的程序化矢量绘制。
 * Path2D 顶层构建并缓存；每帧只做 ctx.fill(path)。
 *
 * 坐标系：符号定义在 32×32 viewBox 内，draw 自动缩放。
 * Node 环境无 Path2D 时用 FakePath2D 占位（仅记录指令）。
 *
 * 契约：
 *   draw(ctx, symbolId, cx, cy, size, state = {})
 *     cx, cy : 符号中心屏幕坐标
 *     size   : 符号边长（正数）
 *     state  : { alpha, scale, rotate, glow }
 *
 * 依赖：无（纯 Canvas 2D API）
 * 禁：Math.random / eval / new Function
 * ============================================================ */

export const VERSION = 'olympius-symbol-renderer-v1.0.0';

/* ---------- Path2D 环境兼容 ---------- */
const PathImpl = (() => {
  if (typeof Path2D !== 'undefined') return Path2D;
  class FakePath2D {
    constructor() { this.d = []; }
    moveTo(x, y) { this.d.push(['M', x, y]); }
    lineTo(x, y) { this.d.push(['L', x, y]); }
    arc(cx, cy, r, s, e) { this.d.push(['A', cx, cy, r, s, e]); }
    bezierCurveTo(a, b, c, d, e, f) { this.d.push(['C', a, b, c, d, e, f]); }
    quadraticCurveTo(a, b, c, d) { this.d.push(['Q', a, b, c, d]); }
    closePath() { this.d.push(['Z']); }
  }
  return FakePath2D;
})();

const TAU = Math.PI * 2;

const mk = (cmds) => {
  const p = new PathImpl();
  for (let i = 0; i < cmds.length; i++) {
    const c = cmds[i];
    const op = c[0];
    if (op === 'M') p.moveTo(c[1], c[2]);
    else if (op === 'L') p.lineTo(c[1], c[2]);
    else if (op === 'A') p.arc(c[1], c[2], c[3], c[4], c[5]);
    else if (op === 'Z') p.closePath();
  }
  return p;
};

/* ---------- 调色板（按 symbolId 0-9） ---------- */
const PALETTE = {
  0: { base: '#c89b2a', hi: '#f7d774' },  // crown 金
  1: { base: '#c89b2a', hi: '#a855f7' },  // ring  金环 + 紫宝石
  2: { base: '#c89b2a', hi: '#fef3c7' },  // chalice
  3: { base: '#c89b2a', hi: '#fef08a' },  // hourglass
  4: { base: '#991b1b', hi: '#ef4444' },  // red
  5: { base: '#6b21a8', hi: '#a855f7' },  // purple
  6: { base: '#854d0e', hi: '#facc15' },  // yellow
  7: { base: '#065f46', hi: '#10b981' },  // green
  8: { base: '#1e3a8a', hi: '#3b82f6' },  // blue
  9: { base: '#a16207', hi: '#fde047' },  // scatter
};

export const SYMBOL_IDS = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

/* ---------- 符号几何（32×32 viewBox） ---------- */
const SHAPES = {
  0: {  // crown
    base: [['M',3,26],['L',4,11],['L',9,17],['L',16,7],['L',23,17],['L',28,11],['L',29,26],['Z']],
    hi:   [['M',7,22],['L',7,15],['L',9,17],['L',16,10],['L',23,17],['L',25,15],['L',25,22],['Z']],
  },
  1: {  // ring（外圆 - 内圆，evenodd 空心）
    base: [['M',26,16],['A',16,16,10,0,TAU],['Z'],['M',23,16],['A',16,16,7,0,TAU],['Z']],
    hi:   [['M',16,2],['L',21,9],['L',16,14],['L',11,9],['Z']],
  },
  2: {  // chalice（杯 + 柄 + 底座）
    base: [
      ['M',10,6],['L',22,6],['L',21,14],['L',16,20],['L',11,14],['Z'],
      ['M',14,20],['L',18,20],['L',18,26],['L',14,26],['Z'],
      ['M',10,26],['L',22,26],['L',22,29],['L',10,29],['Z'],
    ],
    hi: [
      ['M',12,8],['L',14,8],['L',13.2,15],['L',12,15],['Z'],
      ['M',16,8],['A',16,13,2,0,TAU],['Z'],
    ],
  },
  3: {  // hourglass
    base: [
      ['M',6,3],['L',26,3],['L',26,6],['L',6,6],['Z'],
      ['M',6,26],['L',26,26],['L',26,29],['L',6,29],['Z'],
      ['M',10,7],['L',22,7],['L',16,15],['Z'],
      ['M',16,17],['L',10,25],['L',22,25],['Z'],
    ],
    hi: [
      ['M',15,15],['L',17,15],['L',17,17],['L',15,17],['Z'],
      ['M',12,8],['L',14,8],['L',13.2,12],['L',12.2,12],['Z'],
    ],
  },
  4: {  // red gem
    base: [['M',16,2],['L',28,13],['L',16,30],['L',4,13],['Z']],
    hi:   [['M',16,2],['L',28,13],['L',16,13],['Z']],
  },
  5: {  // purple gem
    base: [['M',16,2],['L',28,13],['L',16,30],['L',4,13],['Z']],
    hi:   [['M',16,2],['L',28,13],['L',16,13],['Z']],
  },
  6: {  // yellow gem
    base: [['M',16,2],['L',28,13],['L',16,30],['L',4,13],['Z']],
    hi:   [['M',16,2],['L',28,13],['L',16,13],['Z']],
  },
  7: {  // green gem
    base: [['M',16,2],['L',28,13],['L',16,30],['L',4,13],['Z']],
    hi:   [['M',16,2],['L',28,13],['L',16,13],['Z']],
  },
  8: {  // blue gem
    base: [['M',16,2],['L',28,13],['L',16,30],['L',4,13],['Z']],
    hi:   [['M',16,2],['L',28,13],['L',16,13],['Z']],
  },
  9: {  // scatter bolt
    base: [['M',18,3],['L',9,18],['L',15,18],['L',11,29],['L',22,14],['L',16,14],['Z']],
    hi:   [['M',16.5,7],['L',12,17],['L',15,17],['L',13.5,24],['L',20,13.5],['L',16.5,13.5],['Z']],
  },
};

/* ---------- 构建并缓存 ---------- */
function buildAll() {
  const out = new Map();
  for (const id of SYMBOL_IDS) {
    const s = SHAPES[id];
    out.set(id, { base: mk(s.base), hi: mk(s.hi) });
  }
  return out;
}

const CACHE = buildAll();

/* ---------- SymbolRenderer ---------- */
export class SymbolRenderer {
  constructor({ debug = false } = {}) {
    this.debug = debug;
    this._drawCount = 0;
  }

  get drawCount() { return this._drawCount; }

  draw(ctx, symbolId, cx, cy, size, state = {}) {
    const paths = CACHE.get(symbolId);
    if (!paths) {
      if (this.debug) console.warn('[SymbolRenderer] unknown id', symbolId);
      return false;
    }
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !(size > 0)) return false;

    const alpha  = state.alpha  != null ? state.alpha  : 1;
    const scale  = state.scale  != null ? state.scale  : 1;
    const rotate = state.rotate != null ? state.rotate : 0;
    const glow   = state.glow   != null ? state.glow   : 0;

    const unit = size / 32;
    const totalScale = unit * scale;
    if (totalScale <= 0) return false;

    const pal = PALETTE[symbolId];

    ctx.save();
    ctx.translate(cx, cy);
    if (rotate) ctx.rotate(rotate);
    ctx.scale(totalScale, totalScale);
    ctx.translate(-16, -16);
    ctx.globalAlpha = alpha;

    if (glow > 0) {
      ctx.shadowColor = pal.hi;
      ctx.shadowBlur = (10 * glow) / totalScale;
    }

    ctx.fillStyle = pal.base;
    ctx.fill(paths.base, 'evenodd');

    ctx.fillStyle = pal.hi;
    ctx.fill(paths.hi, 'evenodd');

    ctx.restore();
    this._drawCount++;
    return true;
  }
}
