/* Apex · Bonus Engine
 * 定义：Scatter 触发 / 免费旋转次数 / Retrigger 规则
 * 只负责规则数据，不涉及动画与 UI
 *
 * 接口约定（P0-1）：
 *   调用方（game-provider-demo.js）在 Bonus 免费旋转中产出的中奖，
 *   必须同样施加 MODE_PROFILE[mode].payScale，否则 simulator 报出的
 *   demo RTP 会被高估（bonus 局不计 payScale 就等于变相降 RTP）。
 */
(function () {
  'use strict';

  var RAND_BUF = new Uint32Array(1);   // 复用，避免热路径反复分配
  var BONUS_CONFIG = Object.freeze({
    scatterSymbol: 'LOLLIPOP',
    triggerMin: 4,
    triggerMax: 6,
    freeSpins4: 10,
    freeSpins5: 12,
    freeSpins6: 15,
    retriggerMin: 4,
    retriggerAdd: 2,
    maxFreeSpins: 200,
    multiplierSymbol: 'MULTIPLIER',
    multiplierValues: Object.freeze([2, 3, 5, 10, 25, 50, 100])
  });

  function countScatter(grid) {
    var n = 0;
    for (var i = 0; i < grid.length; i++) {
      if (grid[i] === BONUS_CONFIG.scatterSymbol) n++;
    }
    return n;
  }

  function resolveInitialSpins(scatterCount) {
    var c = BONUS_CONFIG;
    if (scatterCount >= c.triggerMax) return c.freeSpins6;   // 含 7+ 兜底
    if (scatterCount === 5) return c.freeSpins5;
    if (scatterCount === 4) return c.freeSpins4;
    return 0;
  }

  function shouldTrigger(grid) {
    return countScatter(grid) >= BONUS_CONFIG.triggerMin;
  }

  function resolveRetrigger(scatterCount, currentRemaining) {
    var c = BONUS_CONFIG;
    if (scatterCount < c.retriggerMin) return 0;
    if (!(currentRemaining >= 0)) currentRemaining = 0;    // 防御：非法入参
    var capped = Math.min(currentRemaining + c.retriggerAdd, c.maxFreeSpins);
    return Math.max(0, capped - currentRemaining);         // 钳制，防倒扣
  }

  function pickMultiplier() {
    var vals = BONUS_CONFIG.multiplierValues;
    crypto.getRandomValues(RAND_BUF);
    return vals[RAND_BUF[0] % vals.length];   // 注：极小取模偏差，对 RTP 无影响
  }

  window.ApexBonus = Object.freeze({
    CONFIG: BONUS_CONFIG,
    countScatter: countScatter,
    resolveInitialSpins: resolveInitialSpins,
    shouldTrigger: shouldTrigger,
    resolveRetrigger: resolveRetrigger,
    pickMultiplier: pickMultiplier
  });
})();
