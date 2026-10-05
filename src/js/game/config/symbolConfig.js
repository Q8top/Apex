/* ============================================================
   Apex Olympius · symbolConfig.js
   符号定义 + Demo/Real 两套权重
   
   原则：
   - 本文件只定义参数，不做数学决策
   - Demo 与 Real 的差异完全来自这里
   - 权重数组下标必须与 SYMBOLS[].id 对齐
   ============================================================ */

/* ===== 符号定义 =====
   id      : 0~9，必须连续
   key     : 唯一标识，渲染器按 key 取资源
   name    : 中文显示名
   tier    : 价值档（high / gem / low / wild / scatter）
   fixed   : 是否为特殊符号（不参与普通赔付）
*/
export const SYMBOLS = [
  { id: 0, key: 'crown',     name: '皇冠',     tier: 'high',    fixed: false },
  { id: 1, key: 'red',       name: '红宝石',   tier: 'gem',     fixed: false },
  { id: 2, key: 'purple',    name: '紫宝石',   tier: 'gem',     fixed: false },
  { id: 3, key: 'yellow',    name: '黄宝石',   tier: 'gem',     fixed: false },
  { id: 4, key: 'green',     name: '绿宝石',   tier: 'gem',     fixed: false },
  { id: 5, key: 'blue',      name: '蓝宝石',   tier: 'gem',     fixed: false },
  { id: 6, key: 'goblet',    name: '圣杯',     tier: 'low',     fixed: false },
  { id: 7, key: 'hourglass', name: '沙漏',     tier: 'low',     fixed: false },
  { id: 8, key: 'wild',      name: 'WILD',     tier: 'wild',    fixed: true  },
  { id: 9, key: 'scatter',   name: 'SCATTER',  tier: 'scatter', fixed: true  }
];

/* ===== 便捷映射 ===== */
export const SYMBOL_BY_ID   = Object.fromEntries(SYMBOLS.map(s => [s.id, s]));
export const SYMBOL_BY_KEY  = Object.fromEntries(SYMBOLS.map(s => [s.key, s]));
export const SYMBOL_COUNT   = SYMBOLS.length;

/* 特殊符号 id 常量（避免硬编码数字） */
export const WILD_ID    = 8;
export const SCATTER_ID = 9;

/* ===== 权重 =====
   数组下标 = 符号 id
   权重越高 = 出现越频繁
   
   设计目标（后续 Simulator 会验证）：
     - Demo: Hit Rate 45~60%, Scatter 触发约 1/40
     - Real: Hit Rate 20~35%, Scatter 触发约 1/180
*/
export const WEIGHTS = {
  demo: {
    /* demo 中间集中度：最高/最低 = 17/4 = 4.25 倍 */
    crown:     4,
    red:       5,
    purple:    6,
    yellow:    8,
    green:     10,
    blue:      12,
    goblet:    15,
    hourglass: 17,
    wild:      3,
    scatter:   3
  },
  real: {
    /* real 更均匀 + scatter 稀 */
    crown:     6,
    red:       7,
    purple:    8,
    yellow:    9,
    green:     10,
    blue:      11,
    goblet:    12,
    hourglass: 13,
    wild:      2,
    scatter:   1
  }
};

/* ===== 权重 → 数组（供 RNG.pickWeightedIndex 使用） ===== */
export function getWeightArray(mode) {
  const w = WEIGHTS[mode];
  if (!w) throw new Error('symbolConfig.getWeightArray: unknown mode ' + mode);
  return SYMBOLS.map(s => {
    const v = w[s.key];
    if (typeof v !== 'number' || v < 0) {
      throw new Error('symbolConfig: missing weight for ' + s.key + ' in mode ' + mode);
    }
    return v;
  });
}

/* ===== 权重 → 归一化概率（供测试/展示使用） ===== */
export function getProbability(mode) {
  const w = getWeightArray(mode);
  const total = w.reduce((a, b) => a + b, 0);
  return w.map(v => v / total);
}

/* ===== 加权表校验 ===== */
export function validateConfig() {
  const errs = [];
  // 1. id 必须 0..9 连续
  SYMBOLS.forEach((s, i) => {
    if (s.id !== i) errs.push(`SYMBOLS[${i}].id 应为 ${i}，实际 ${s.id}`);
  });
  // 2. key 唯一
  const keys = new Set();
  SYMBOLS.forEach(s => {
    if (keys.has(s.key)) errs.push('重复 key: ' + s.key);
    keys.add(s.key);
  });
  // 3. demo/real 权重覆盖所有符号
  for (const mode of ['demo', 'real']) {
    const w = WEIGHTS[mode];
    SYMBOLS.forEach(s => {
      if (!(s.key in w)) errs.push(`${mode} 缺少权重: ${s.key}`);
      else if (w[s.key] < 0) errs.push(`${mode}.${s.key} 权重为负`);
    });
  }
  return errs;
}

/* ===== 版本 ===== */
export const VERSION = 'olympius-symbols-v1.0.0';
