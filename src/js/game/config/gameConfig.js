/* ============================================================
   Apex Olympius · gameConfig.js
   游戏基础配置 · 不含任何数学参数
   数学参数见：symbolConfig.js / paytableConfig.js
             multiplierConfig.js / freeSpinConfig.js
   ============================================================ */

/* ===== 盘面 ===== */
export const GRID = {
  COLS: 6,
  ROWS: 5
};

/* ===== 游戏模式 =====
   'demo' 与 'real' 的差异仅来自各自 mathConfig，
   本文件不参与数学决策。
*/
export const MODES = ['demo', 'real'];

/* ===== 下注阶梯 =====
   从最小下注到最大下注；UI 控制步进。
*/
export const BET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export const BET_DEFAULT = 10;

/* ===== 初始余额（仅 Demo 生效，Real 从账户读取） ===== */
export const INITIAL_BALANCE = {
  demo: 1000,
  real: 0
};

/* ===== Win Tier（仅视觉分级，不参与数学） =====
   单位：倍下注
   顺序：从低到高（渲染时按需取用）
*/
export const WIN_TIERS = [
  { key: 'big',    label: 'BIG WIN',    mult: 10   },
  { key: 'mega',   label: 'MEGA WIN',   mult: 50   },
  { key: 'super',  label: 'SUPER WIN',  mult: 100  },
  { key: 'epic',   label: 'EPIC WIN',   mult: 500  },
  { key: 'divine', label: 'DIVINE WIN', mult: 1000 }
];

/* 判断某个赢额属于哪一级（返回 null 表示不是大赢） */
export function classifyWin(winAmount, bet) {
  if (!bet || bet <= 0) return null;
  const mult = winAmount / bet;
  let tier = null;
  for (const t of WIN_TIERS) {
    if (mult >= t.mult) tier = t;
  }
  return tier;
}

/* ===== 单次 Spin 最大赢上限（倍下注） =====
   超出时截断；数学层在最终结算时应用。
*/
export const MAX_WIN_MULT = 5000;

/* ===== 动画速度倍率（仅视觉） ===== */
export const SPEED = {
  normal: 1.0,
  fast:   1.5,
  ultra:  2.0
};

/* ===== 版本号（便于日志） ===== */
export const VERSION = 'olympius-math-v1.0.0';
