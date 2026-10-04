/* Gates of Olympus · 服务端数学配置
 *
 * 🔒 机密文件 — 严禁以任何形式暴露到前端
 *    · 此文件位于 functions/_math/ 下，Cloudflare Pages 路由不暴露
 *    · 严禁 import 到 src/ 下的任何前端文件
 *    · 严禁通过 API 响应体输出 PAYTABLE / 权重 / scale 值
 *    · 严禁写入 Console 日志
 *
 * ⚠️ 双模式 RTP 规则（全站通用）：
 *   real  RTP 目标 90%（区间 88~93%，硬上限 94%）
 *   demo  RTP = real × 2（约 180%）
 *   实现：demo 跑 3 次取最优 + scaleDemo = scaleReal × 2
 */

export const GRID = {
  cols: 6,
  rows: 5,
  minMatch: 8,
  maxTumbles: 100
};

export const SYMBOLS = {
  GEM_BLUE:   { tier: 'low',     weight: 15 },
  GEM_GREEN:  { tier: 'low',     weight: 15 },
  GEM_PURPLE: { tier: 'low',     weight: 14 },
  GEM_RED:    { tier: 'low',     weight: 14 },
  CHALICE:    { tier: 'mid',     weight: 11 },
  RING:       { tier: 'mid',     weight: 11 },
  HOURGLASS:  { tier: 'mid',     weight: 11 },
  CROWN:      { tier: 'high',    weight: 6 },
  SCATTER:    { tier: 'special', weight: 3 }
};

export const PAYTABLE = {
  GEM_BLUE:   { 8: 0.10, 10: 0.20, 12: 0.50 },
  GEM_GREEN:  { 8: 0.12, 10: 0.24, 12: 0.60 },
  GEM_PURPLE: { 8: 0.15, 10: 0.30, 12: 0.75 },
  GEM_RED:    { 8: 0.20, 10: 0.40, 12: 1.00 },
  CHALICE:    { 8: 0.30, 10: 0.60, 12: 1.50 },
  RING:       { 8: 0.40, 10: 0.80, 12: 2.00 },
  HOURGLASS:  { 8: 0.50, 10: 1.00, 12: 2.50 },
  CROWN:      { 8: 1.00, 10: 2.00, 12: 5.00 }
};

export const PAYOUT = {
  scaleReal: 9.21,
  scaleDemo: 8.05,
  demoCounts: 3,
  maxWinMultiplier: 5000
};

export const TARGET = {
  rtpReal: 0.90,
  rtpRealMin: 0.88,
  rtpRealMax: 0.93,
  rtpRealHardCap: 0.94,
  hitRateReal: 0.22
};

export const META = {
  gameId: 'olympus',
  mathVersion: 'MATH-001'
};
