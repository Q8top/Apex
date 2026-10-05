/* ============================================================
 * Apex Olympius · Renderer 常量
 * ------------------------------------------------------------
 * 只放"渲染层"专用数值常量。
 * 数学 / 游戏规则常量一律从 src/js/game/config/ 读取，禁止在此重复。
 * ============================================================ */

export const VERSION = 'olympius-render-constants-v1.0.0';

/* ---------- 画布 / 像素比 ---------- */
export const DPR_MAX = 2;                 // 4K 手机不超 2x，避免超大 Canvas
export const CANVAS_ID = 'olympius-stage';

/* ---------- 响应式断点（px） ---------- */
export const BREAKPOINT = Object.freeze({
  XS: 320, SM: 375, MD: 430, LG: 768, XL: 1024, XXL: 1440,
});

/* ---------- 布局 ---------- */
export const MOBILE_MAX_WIDTH = 460;      // 移动端游戏舞台最大宽度
export const GRID_ASPECT = 6 / 5;         // 6 列 × 5 行

/* ---------- 粒子池 ---------- */
export const PARTICLE_MAX = Object.freeze({
  DESKTOP: 1200,
  MOBILE: 350,
  LOW: 180,
});
export const PARTICLE_MOBILE_THRESHOLD = 768;

/* ---------- 动画时长（ms） ---------- */
export const DURATION = Object.freeze({
  SPIN_CHARGE: 280,
  REEL_DROP: 520,
  REEL_STAGGER: 60,
  WIN_HIGHLIGHT: 320,
  SYMBOL_DESTROY: 260,
  TUMBLE_DROP: 380,
  MULTIPLIER_DROP: 420,
  SCATTER_SWEEP: 300,
  FS_TRIGGER: 900,
  BIGWIN_INTRO: 600,
  BIGWIN_COUNT: 1600,
  BIGWIN_OUTRO: 500,
});

/* ---------- 速度模式 ---------- */
export const SPEED = Object.freeze({
  NORMAL: 1.0,
  FAST: 0.5,
});

/* ---------- 相机 FX ---------- */
export const CAMERA = Object.freeze({
  SHAKE_SPIN: 1.5,
  SHAKE_WIN: 3.0,
  SHAKE_BIGWIN: 8.0,
  SHAKE_MEGA: 12.0,
  SHAKE_EPIC: 16.0,
  MOBILE_SHAKE_SCALE: 0.6,
});

/* ---------- 可访问性 ---------- */
export const A11Y = Object.freeze({
  REDUCED_MOTION_SCALE: 0.3,
});

/* ---------- 调试 ---------- */
export const DEBUG = Object.freeze({
  LOG_EVENTS: false,
});
