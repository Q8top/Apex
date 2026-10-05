/* ============================================================
   Apex Olympius · multiplierConfig.js
   倍率符号配置
   
   机制：
   - 每次 Spin / 每次 FS 内部 Spin，有概率触发"降倍率"
   - 触发时从 MULT_VALUES 按 MULT_WEIGHTS 抽取数值
   - 同一轮内所有倍率累加（含 Tumble 过程）
   - 最终倍率作用于该轮总赢
   
   Demo/Real 差异：
   - 数值池不同（Demo 倾向低倍率，Real 倾向中等）
   - 触发概率不同（Demo 略高）
   ============================================================ */

/* ===== 倍率数值池（按升序排列）===== */
export const MULT_VALUES = [2, 3, 5, 10, 15, 20, 25, 50, 100, 500];

/* ===== 权重（下标对应 MULT_VALUES）===== */
export const MULT_WEIGHTS = {
  demo: [40, 30, 18, 6, 3, 1.5, 1, 0.3, 0.15, 0.05],
  real: [50, 25, 15, 5, 2.5, 1, 0.8, 0.2, 0.1, 0.02]
};

/* ===== 触发概率 =====
   1) 基础局（含每次 Tumble 后）每次"降倍率"的概率
   2) Free Spins 内部每次 Spin 的降倍率概率
*/
export const MULT_DROP_PROB = {
  demo: { base: 0.05, fs: 0.03 },
  real: { base: 0.02, fs: 0.015 }
};

/* ===== 辅助 ===== */
export function getMultValues() {
  return MULT_VALUES.slice();
}

export function getMultWeights(mode) {
  const w = MULT_WEIGHTS[mode];
  if (!w) throw new Error('multiplierConfig: unknown mode ' + mode);
  if (w.length !== MULT_VALUES.length) {
    throw new Error('multiplierConfig: 权重长度与倍率池不一致');
  }
  return w.slice();
}

export function getMultProb(mode, phase) {
  const cfg = MULT_DROP_PROB[mode];
  if (!cfg) throw new Error('multiplierConfig: unknown mode ' + mode);
  if (phase === 'fs')   return cfg.fs;
  if (phase === 'base') return cfg.base;
  throw new Error('multiplierConfig: unknown phase ' + phase);
}

/* ===== 期望值（测试/校准辅助）===== */
export function getExpectedMultiplier(mode) {
  const w = getMultWeights(mode);
  const total = w.reduce((a, b) => a + b, 0);
  return MULT_VALUES.reduce((sum, v, i) => sum + v * w[i] / total, 0);
}

/* ===== 校验 ===== */
export function validateConfig() {
  const errs = [];
  if (MULT_VALUES.length !== 10) errs.push('MULT_VALUES 长度应为 10');
  for (let i = 1; i < MULT_VALUES.length; i++) {
    if (MULT_VALUES[i] <= MULT_VALUES[i-1]) errs.push('MULT_VALUES 未严格递增');
  }
  for (const mode of ['demo', 'real']) {
    const w = MULT_WEIGHTS[mode];
    if (!Array.isArray(w) || w.length !== MULT_VALUES.length) {
      errs.push(`${mode} 权重长度错误`);
      continue;
    }
    if (w.some(x => x < 0)) errs.push(`${mode} 存在负权重`);
    if (w.reduce((a, b) => a + b, 0) <= 0) errs.push(`${mode} 权重总和 ≤ 0`);
    const p = MULT_DROP_PROB[mode];
    if (!p) { errs.push(`${mode} 缺少触发概率`); continue; }
    if (p.base < 0 || p.base > 1) errs.push(`${mode}.base 概率越界`);
    if (p.fs   < 0 || p.fs   > 1) errs.push(`${mode}.fs 概率越界`);
  }
  return errs;
}

export const VERSION = 'olympius-multiplier-v1.0.0';
