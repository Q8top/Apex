/* ============================================================
   Apex Olympius · freeSpinConfig.js
   免费旋转配置
   
   机制：
   - 基础局结束时统计 Scatter 数量
   - ≥4 个 → 触发 FS，奖励次数按档位
   - FS 期间若某次 Spin 又出现 ≥3 个 Scatter → 概率重触发
   - FS 结束 → 回到基础局
   ============================================================ */

/* ===== 触发门槛 → 奖励次数 =====
   scatter 数量 4 / 5 / 6+ 分别对应下面的奖励
*/
export const FS_TRIGGER_THRESHOLD = 4;
export const FS_AWARD_TABLE = [
  { scatters: 4, spins: 15 },
  { scatters: 5, spins: 20 },
  { scatters: 6, spins: 25 }
];

/* ===== FS 内重触发 =====
   FS 期间某次 Spin 出现 ≥ FS_RETRIGGER_THRESHOLD 个 Scatter
   → 按 FS_RETRIGGER_PROB 概率触发
   → 增加 FS_RETRIGGER_AWARD 次
*/
export const FS_RETRIGGER_THRESHOLD = 3;
export const FS_RETRIGGER_AWARD = 5;
export const FS_RETRIGGER_PROB = {
  demo: 0.35,
  real: 0.15
};

/* ===== FS 内部倍率作用方式 =====
   'accumulate' : 每次 FS 降落倍率都累加到本轮总倍率（默认，原版机制）
   'per-spin'   : 每次 FS 倍率只作用于该次 Spin
*/
export const FS_MULT_MODE = 'accumulate';

/* ===== 辅助 ===== */
export function getFsAward(scatterCount) {
  if (scatterCount < FS_TRIGGER_THRESHOLD) return 0;
  // 找到最高满足的档位
  let spins = 0;
  for (const row of FS_AWARD_TABLE) {
    if (scatterCount >= row.scatters) spins = row.spins;
  }
  return spins;
}

export function getRetriggerProb(mode) {
  const p = FS_RETRIGGER_PROB[mode];
  if (typeof p !== 'number') throw new Error('freeSpinConfig: unknown mode ' + mode);
  return p;
}

/* ===== 校验 ===== */
export function validateConfig() {
  const errs = [];
  if (FS_TRIGGER_THRESHOLD !== 4) errs.push('FS_TRIGGER_THRESHOLD 应为 4');
  if (FS_AWARD_TABLE.length !== 3) errs.push('FS_AWARD_TABLE 应有 3 档');
  for (let i = 1; i < FS_AWARD_TABLE.length; i++) {
    if (FS_AWARD_TABLE[i].scatters <= FS_AWARD_TABLE[i-1].scatters)
      errs.push('FS_AWARD_TABLE scatter 门槛未递增');
    if (FS_AWARD_TABLE[i].spins <= FS_AWARD_TABLE[i-1].spins)
      errs.push('FS_AWARD_TABLE spins 奖励未递增');
  }
  if (FS_RETRIGGER_THRESHOLD < 1) errs.push('FS_RETRIGGER_THRESHOLD 应 ≥ 1');
  if (FS_RETRIGGER_AWARD < 1) errs.push('FS_RETRIGGER_AWARD 应 ≥ 1');
  for (const mode of ['demo', 'real']) {
    const p = FS_RETRIGGER_PROB[mode];
    if (typeof p !== 'number' || p < 0 || p > 1)
      errs.push(`${mode} 重触发概率越界`);
  }
  return errs;
}

export const VERSION = 'olympius-freespin-v1.0.0';
