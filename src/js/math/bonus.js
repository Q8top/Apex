/* Apex · Bonus Engine
 * 定义：Scatter 触发 / 免费旋转次数 / Retrigger 规则
 * 只负责规则数据，不涉及动画与 UI
 */
(function () {
  'use strict';

  var BONUS_CONFIG = Object.freeze({
    scatterSymbol: 'LOLLIPOP',
    triggerMin: 4,
    triggerMax: 6,
    freeSpins4: 10,
    freeSpins5: 12,
    freeSpins6: 15,
    retriggerMin: 3,
    retriggerAdd: 5,
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
    if (scatterCount >= 6) return c.freeSpins6;
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
    var add = c.retriggerAdd;
    var next = currentRemaining + add;
    return Math.min(next, c.maxFreeSpins) - currentRemaining;
  }

  function pickMultiplier() {
    var vals = BONUS_CONFIG.multiplierValues;
    var b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return vals[b[0] % vals.length];
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
