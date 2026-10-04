// @ts-check
/* Apex · 全局常量
 * 所有跨模块共享的魔法数字 / 字符串集中在这里
 */

/** 金额精度：以最小单位（分）存储，避免浮点误差 */
export const MONEY_SCALE = 100;

/** 游戏网格 */
export const GRID = {
  COLS: 6,
  ROWS: 5,
  TOTAL: 30
};

/** 动画默认时长（毫秒） */
export const TIMING = {
  REEL_ACCEL: 200,
  REEL_CRUISE: 260,
  REEL_DECEL: 320,
  REEL_STAGGER: 60,
  WIN_HIGHLIGHT: 480,
  WIN_COUNTUP_BASE: 420,
  WIN_REMOVE: 220,
  TUMBLE_GRAVITY: 400,
  TUMBLE_SETTLE: 160,
  AUTO_DELAY: 700,
  BIGWIN_INTRO: 500,
  BIGWIN_COUNTUP: 1400,
  FS_ENTRANCE: 900,
  FS_SUMMARY: 3200,
  TOAST_DEFAULT: 1800
};

/** 质量等级 */
export const QUALITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/** 游戏阶段（State Machine 用） */
export const PHASE = {
  BOOT: 'BOOT',
  LOADING: 'LOADING',
  READY: 'READY',
  IDLE: 'IDLE',
  SPIN_REQUEST: 'SPIN_REQUEST',
  SPINNING: 'SPINNING',
  REEL_STOPPING: 'REEL_STOPPING',
  EVALUATING: 'EVALUATING',
  WIN_PRESENT: 'WIN_PRESENT',
  TUMBLE: 'TUMBLE',
  BONUS_CHECK: 'BONUS_CHECK',
  FS_ENTRANCE: 'FS_ENTRANCE',
  FS_ROUND: 'FS_ROUND',
  FS_SUMMARY: 'FS_SUMMARY',
  SETTLING: 'SETTLING',
  ERROR: 'ERROR'
};

/** 游戏模式 */
export const MODE = {
  DEMO: 'demo',
  REAL: 'real'
};

/** 音频效果名称 */
export const SFX = {
  CLICK: 'click',
  SPIN_START: 'spinStart',
  REEL_STOP: 'reelStop',
  LAND: 'land',
  WIN_SMALL: 'winSmall',
  WIN_MEDIUM: 'winMedium',
  WIN_LARGE: 'winLarge',
  MULTIPLIER: 'multiplier',
  SCATTER: 'scatter',
  TUMBLE: 'tumble',
  FS_START: 'fsStart',
  FS_END: 'fsEnd',
  BIGWIN: 'bigwin',
  MEGAWIN: 'megawin',
  EPICWIN: 'epicwin',
  ERROR: 'error'
};

/** 版本 */
export const VERSION = {
  MATH: 'MATH-001'
};
