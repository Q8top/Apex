/* ============================================================
   Apex Olympius · symbolConfig.js
   符号定义 + 权重（严格对齐原版 Gates of Olympus）
   
   原版符号（10 个，无 WILD）：
     0 Crown    皇冠      最高价值
     1 Ring     戒指      高价值
     2 Chalice  圣杯      中价值
     3 Hourglass 沙漏     中价值
     4 Red      红宝石    低价值
     5 Purple   紫宝石    低价值
     6 Yellow   黄宝石    低价值
     7 Green    绿宝石    低价值
     8 Blue     蓝宝石    低价值
     9 Scatter  Zeus 闪电 特殊（4+ 触发免费旋转）
   
   说明：
   - Multiplier（倍率）是随机降落的球，不占网格，不属于符号
   - 无 WILD 符号
   ============================================================ */

export const SYMBOLS = [
  { id: 0, key: 'crown',     name: '皇冠',      tier: 'high',    fixed: false },
  { id: 1, key: 'ring',      name: '戒指',      tier: 'high',    fixed: false },
  { id: 2, key: 'chalice',   name: '圣杯',      tier: 'mid',     fixed: false },
  { id: 3, key: 'hourglass', name: '沙漏',      tier: 'mid',     fixed: false },
  { id: 4, key: 'red',       name: '红宝石',    tier: 'low',     fixed: false },
  { id: 5, key: 'purple',    name: '紫宝石',    tier: 'low',     fixed: false },
  { id: 6, key: 'yellow',    name: '黄宝石',    tier: 'low',     fixed: false },
  { id: 7, key: 'green',     name: '绿宝石',    tier: 'low',     fixed: false },
  { id: 8, key: 'blue',      name: '蓝宝石',    tier: 'low',     fixed: false },
  { id: 9, key: 'scatter',   name: 'SCATTER',   tier: 'scatter', fixed: true  }
];

export const SYMBOL_BY_ID  = Object.fromEntries(SYMBOLS.map(s => [s.id, s]));
export const SYMBOL_BY_KEY = Object.fromEntries(SYMBOLS.map(s => [s.key, s]));
export const SYMBOL_COUNT  = SYMBOLS.length;

/* 特殊符号 id（原版无 WILD，用 -1 表示） */
export const WILD_ID    = -1;
export const SCATTER_ID = 9;

/* ===== 权重（下标 = 符号 id）=====
   原版特点：
   - 高价值符号稀少（crown/ring 最低）
   - 低价值宝石较多
   - Scatter 最稀
*/
export const WEIGHTS = {
  demo: {
    /* demo hit 目标 45~60%：略提高集中度到 hit 45%+ */
    crown:     3,
    ring:      4,
    chalice:   5,
    hourglass: 7,
    red:       9,
    purple:    12,
    yellow:    15,
    green:     18,
    blue:      21,
    scatter:   3
  },
  real: {
    /* real hit 要 20~35%：更均匀（避免家族轻易凑齐） */
    crown:     5,
    ring:      6,
    chalice:   7,
    hourglass: 9,
    red:       11,
    purple:    13,
    yellow:    15,
    green:     16,
    blue:      17,
    scatter:   1
  }
};

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

export function getProbability(mode) {
  const w = getWeightArray(mode);
  const total = w.reduce((a, b) => a + b, 0);
  return w.map(v => v / total);
}

export function validateConfig() {
  const errs = [];
  SYMBOLS.forEach((s, i) => {
    if (s.id !== i) errs.push(`SYMBOLS[${i}].id 应为 ${i}，实际 ${s.id}`);
  });
  const keys = new Set();
  SYMBOLS.forEach(s => {
    if (keys.has(s.key)) errs.push('重复 key: ' + s.key);
    keys.add(s.key);
  });
  for (const mode of ['demo', 'real']) {
    const w = WEIGHTS[mode];
    SYMBOLS.forEach(s => {
      if (!(s.key in w)) errs.push(`${mode} 缺少权重: ${s.key}`);
      else if (w[s.key] < 0) errs.push(`${mode}.${s.key} 权重为负`);
    });
  }
  return errs;
}

export const VERSION = 'olympius-symbols-v2.0.0';
