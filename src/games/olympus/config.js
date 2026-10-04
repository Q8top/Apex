// @ts-check
/* Apex · Olympus 游戏配置
 * 只放"可公开"配置（游戏 ID / 名称 / 网格 / 下注档位 / API 端点）
 * 所有数学参数一律在服务端
 * 本文件不放任何敏感数据
 */

/** 游戏 ID（用于 API / 路由 / 存档） */
export const GAME_ID = 'olympus';

/** 展示名 */
export const GAME_NAME = '奥林匹斯之门';

/** 副标题 */
export const GAME_SUB = 'Pay Anywhere · Tumble 连锁';

/** 网格（与服务端一致） */
export const GRID = {
  COLS: 6,
  ROWS: 5,
  TOTAL: 30
};

/** 下注档位（最小单位：分） */
export const BET_STEPS = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

/** 默认下注索引（对应 ¥10.00） */
export const DEFAULT_BET_INDEX = 3;

/** Demo 初始余额（最小单位：分） */
export const DEMO_INITIAL_BALANCE = 100000;

/** API 端点 */
export const API = {
  SPIN_DEMO: '/api/slot/spin-demo',
  SPIN_REAL: '/api/slot/spin',
  ME: '/api/me'
};

/** 大奖分级阈值（赢奖 / 下注 倍数） */
export const BIGWIN_LEVELS = {
  BIG: 20,
  MEGA: 50,
  EPIC: 100
};

/** 免费旋转：一次 FS 中最多播放多少轮（防御性上限） */
export const FS_MAX_ROUNDS = 100;

/** 音效总开关默认值 */
export const DEFAULT_SOUND_ON = true;

/** 详情页 URL（游戏页返回时跳转） */
export const DETAIL_URL = '/game.html?id=olympus';
