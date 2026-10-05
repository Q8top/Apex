/* ============================================================
   Apex Olympius · paytableConfig.js
   赔付表（严格对齐原版）
   ============================================================ */

export const PAYTABLE = {
  0: [2.5, 6.0, 25.0],   // crown
  1: [2.0, 5.0, 15.0],   // ring
  2: [1.5, 4.0, 10.0],   // chalice
  3: [1.0, 2.5,  8.0],   // hourglass
  4: [0.8, 2.0,  6.0],   // red
  5: [0.6, 1.5,  5.0],   // purple
  6: [0.5, 1.2,  4.0],   // yellow
  7: [0.4, 1.0,  3.0],   // green
  8: [0.3, 0.8,  2.0]    // blue
};

export const MIN_MATCH = 8;
export const TIER_THRESHOLDS = [8, 10, 12];

export const SCATTER_PAY = [3.0, 5.0, 100.0];

export const PAY_SCALE = {
  demo: 0.65,  // 已达标（199.28%）
  real: 2.41   // 反推：95.24% × (2.41/2.55) ≈ 90%
};

export function getTierMultiplier(symbolId, count) {
  const row = PAYTABLE[symbolId];
  if (!row) return 0;
  if (count < MIN_MATCH) return 0;
  if (count >= 12) return row[2];
  if (count >= 10) return row[1];
  return row[0];
}

export function getScaledMultiplier(symbolId, count, mode) {
  const base = getTierMultiplier(symbolId, count);
  const scale = PAY_SCALE[mode];
  if (typeof scale !== "number") throw new Error("paytableConfig: unknown mode " + mode);
  return base * scale;
}

export function getScatterMultiplier(count) {
  if (count < 4) return 0;
  if (count >= 6) return SCATTER_PAY[2];
  if (count >= 5) return SCATTER_PAY[1];
  return SCATTER_PAY[0];
}

export function validatePaytable() {
  const errs = [];
  for (let id = 0; id <= 8; id++) {
    const row = PAYTABLE[id];
    if (!Array.isArray(row) || row.length !== 3) {
      errs.push("符号 " + id + " 赔付表缺失或档位数 ≠ 3");
      continue;
    }
    if (!(row[0] < row[1] && row[1] < row[2])) {
      errs.push("符号 " + id + " 赔付档位未严格递增: " + row.join(", "));
    }
  }
  for (let tier = 0; tier < 3; tier++) {
    for (let i = 1; i <= 8; i++) {
      if (PAYTABLE[i][tier] > PAYTABLE[i-1][tier]) {
        errs.push("第 " + tier + " 档：符号 " + i + " 应 ≤ 符号 " + (i-1));
      }
    }
  }
  if (SCATTER_PAY.length !== 3) errs.push("SCATTER_PAY 长度应为 3");
  if (!(SCATTER_PAY[0] < SCATTER_PAY[1] && SCATTER_PAY[1] < SCATTER_PAY[2])) {
    errs.push("SCATTER_PAY 档位未严格递增");
  }
  return errs;
}

export const VERSION = "olympius-paytable-v2.0.0";
