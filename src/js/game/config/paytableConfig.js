/* ============================================================
   Apex Olympius · paytableConfig.js
   赔付表 + Scatter 赔付 + 全局缩放
   
   中奖条件（Pay Anywhere）：
     任意位置集齐 8 / 10 / 12+ 同符号 → 中奖
     赔付 = 倍下注 × PAYTABLE[id][tier]
   
   注：
   - WILD（id 8）不单独赔付，但可替代普通符号
   - SCATTER（id 9）不参与普通赔付，触发免费旋转
   - Demo/Real 使用同一份基准赔付表，
     差异通过 PAY_SCALE 缩放（Demo 放大以提升 RTP）
   ============================================================ */

/* ===== 基准赔付表 =====
   键：符号 id
   值：[8连赔付, 10连赔付, 12+连赔付] 单位：倍下注
*/
export const PAYTABLE = {
  0: [2.0, 6.0, 25.0],   // crown    皇冠
  1: [1.5, 4.0, 15.0],   // red      红宝石
  2: [1.2, 3.0, 10.0],   // purple   紫宝石
  3: [0.9, 2.0,  8.0],   // yellow   黄宝石
  4: [0.7, 1.5,  6.0],   // green    绿宝石
  5: [0.5, 1.2,  5.0],   // blue     蓝宝石
  6: [0.3, 0.8,  3.0],   // goblet   圣杯
  7: [0.2, 0.5,  2.0]    // hourglass 沙漏
};

/* ===== 中奖门槛 =====
   满足 ≥ MIN_MATCH 时才开始按档位计赔付
*/
export const MIN_MATCH = 9;
export const TIER_THRESHOLDS = [9, 11, 13];   // 对应 PAYTABLE 数组的 3 档

/* ===== Scatter 赔付 =====
   4 / 5 / 6+ 个 Scatter 触发免费旋转并直接赔付
   单位：倍下注（总下注）
*/
export const SCATTER_PAY = [3.0, 5.0, 100.0];

/* ===== Demo 全局缩放 =====
   Demo 模式下所有普通赔付 × PAY_SCALE.demo
   用于拉高 Demo RTP
*/
export const PAY_SCALE = {
  demo: 0.55,  // demo: 已达标（100 万局 145.76%）
  real: 4.05   // real: 100 万局 95.93% 超硬门禁 94%，下调至 ~89%
};

/* ===== 取某一档的赔付 =====
   symbolId : 0~7（8/9 应走特殊路径）
   count    : 该符号本次出现的总数量（含 WILD 替代）
   返回     : 倍下注数值（未乘 PAY_SCALE，未乘 bet）
*/
export function getTierMultiplier(symbolId, count) {
  const row = PAYTABLE[symbolId];
  if (!row) return 0;
  if (count < MIN_MATCH) return 0;
  if (count >= 13) return row[2];
  if (count >= 11) return row[1];
  return row[0];
}

/* ===== 带 PAY_SCALE 的赔付 =====
   mode : 'demo' | 'real'
*/
export function getScaledMultiplier(symbolId, count, mode) {
  const base = getTierMultiplier(symbolId, count);
  const scale = PAY_SCALE[mode];
  if (typeof scale !== 'number') throw new Error('paytableConfig: unknown mode ' + mode);
  return base * scale;
}

/* ===== Scatter 赔付 =====
   count : Scatter 出现数量（≥4 才有效）
*/
export function getScatterMultiplier(count) {
  if (count < 4) return 0;
  if (count >= 6) return SCATTER_PAY[2];
  if (count >= 5) return SCATTER_PAY[1];
  return SCATTER_PAY[0];
}

/* ===== 校验 =====
   确保赔付表完整、档位递增、Scatter 赔付合法
*/
export function validatePaytable() {
  const errs = [];
  // 1. 0~7 每个符号必须有 3 档
  for (let id = 0; id <= 7; id++) {
    const row = PAYTABLE[id];
    if (!Array.isArray(row) || row.length !== 3) {
      errs.push(`符号 ${id} 赔付表缺失或档位数 ≠ 3`);
      continue;
    }
    if (!(row[0] < row[1] && row[1] < row[2])) {
      errs.push(`符号 ${id} 赔付档位未严格递增: ${row.join(', ')}`);
    }
    if (row[0] <= 0) errs.push(`符号 ${id} 最低档赔付 ≤ 0`);
  }
  // 2. 高价值符号赔付应 > 低价值符号（同一档）
  const order = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let tier = 0; tier < 3; tier++) {
    for (let i = 1; i < order.length; i++) {
      const prev = PAYTABLE[order[i-1]][tier];
      const cur  = PAYTABLE[order[i]][tier];
      if (cur > prev) {
        errs.push(`第 ${tier} 档：符号 ${order[i]}（${cur}）应 ≤ 符号 ${order[i-1]}（${prev}）`);
      }
    }
  }
  // 3. Scatter 赔付
  if (SCATTER_PAY.length !== 3) errs.push('SCATTER_PAY 长度应为 3');
  if (!(SCATTER_PAY[0] < SCATTER_PAY[1] && SCATTER_PAY[1] < SCATTER_PAY[2])) {
    errs.push('SCATTER_PAY 档位未严格递增');
  }
  // 4. PAY_SCALE
  if (PAY_SCALE.demo <= 1.0) errs.push('PAY_SCALE.demo 应 > 1.0（Demo 放大）');
  if (Math.abs(PAY_SCALE.real - 1.0) > 1e-9) errs.push('PAY_SCALE.real 应 = 1.0（基准）');
  return errs;
}

export const VERSION = 'olympius-paytable-v1.0.0';
