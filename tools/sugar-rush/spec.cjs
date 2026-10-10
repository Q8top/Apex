/* Sugar Rush — internal math spec.
 * NOT shipped to production. Used by ref-sim.cjs for RTP validation only.
 * Numbers marked [TBD] need user confirmation against the reference game.
 */
'use strict';

module.exports = {
  meta: {
    id: 'sugar-rush',
    name: '甜蜜爆奖',
    nameEn: 'Sugar Rush',
    refGame: 'Pragmatic Play · Sugar Rush',
    version: '0.1.0-draft',
  },

  grid: { rows: 7, cols: 7, totalCells: 49 },
  matchMode: 'cluster-bfs',   // Sugar Rush：BFS 连通簇（与糖果的 scatter-count 不同）
  minMatch: 5,                // 连通 >= 5 才成簇
  minScatter: 3,              // 3/4/5/6 scatter 触发 FS

  symbols: {
    regular: [
      'blue_candy', 'green_candy', 'purple_candy', 'red_candy',
      'strawberry', 'orange', 'cherry', 'grape', 'mango',
    ],
    scatter: 'lollipop',
    multiplier: 'candy_bomb',
  },

  // 赔率 = 匹配数量 → bet 倍数。数量档位 [TBD]
  paytable: {
    blue_candy:   { 5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50, 9: 0.60, 10: 0.80, 11: 1.00, 12: 1.50 },
    green_candy:  { 5: 0.25, 6: 0.40, 7: 0.50, 8: 0.60, 9: 0.80, 10: 1.00, 11: 1.50, 12: 2.00 },
    purple_candy: { 5: 0.30, 6: 0.50, 7: 0.60, 8: 0.80, 9: 1.00, 10: 1.50, 11: 2.00, 12: 2.50 },
    red_candy:    { 5: 0.40, 6: 0.60, 7: 0.80, 8: 1.00, 9: 1.50, 10: 2.00, 11: 2.50, 12: 3.00 },
    strawberry:   { 5: 0.50, 6: 1.00, 7: 1.50, 8: 2.00, 9: 3.00, 10: 5.00, 11: 10.0, 12: 15.0 },
    orange:       { 5: 0.60, 6: 1.50, 7: 2.00, 8: 3.00, 9: 5.00, 10: 10.0, 11: 15.0, 12: 25.0 },
    cherry:       { 5: 0.75, 6: 2.00, 7: 3.00, 8: 5.00, 9: 10.0, 10: 15.0, 11: 25.0, 12: 50.0 },
    grape:        { 5: 1.00, 6: 3.00, 7: 5.00, 8: 10.0, 9: 15.0, 10: 25.0, 11: 50.0, 12: 100.0 },
    mango:        { 5: 2.00, 6: 5.00, 7: 10.0, 8: 25.0, 9: 50.0, 10: 100.0, 11: 250.0, 12: 500.0 },
  },

  // 基础旋转权重 [TBD]
  baseWeights: {
    blue_candy: 22, green_candy: 20, purple_candy: 18, red_candy: 16,
    strawberry: 14, orange: 12, cherry: 10, grape: 8, mango: 5,
  },

  // FS 触发
  bonus: {
    triggerScatterCount: 3,
    initialSpins: { 3: 10, 4: 12, 5: 15, 6: 20 },
    retriggerScatterCount: 3,
    retriggerSpins: 3,
    scatterPayout: { 3: 2, 4: 5, 5: 20, 6: 100 },
  },

  // FS 内倍率炸弹分布 [TBD]
  bombDist: [
    { v: 2, w: 300 }, { v: 3, w: 200 }, { v: 4, w: 150 },
    { v: 5, w: 120 }, { v: 6, w: 80 },  { v: 8, w: 80 },
    { v: 10, w: 60 }, { v: 12, w: 40 }, { v: 15, w: 30 },
    { v: 20, w: 20 }, { v: 25, w: 15 }, { v: 30, w: 10 },
    { v: 50, w: 5 },  { v: 100, w: 3 },
  ],

  // 目标（用来判定模拟是否达标）
  targets: {
    rtp: 0.965,
    maxWin: 5000,
    volatility: 'very-high',
    hitRate: 0.30,
  },
};
