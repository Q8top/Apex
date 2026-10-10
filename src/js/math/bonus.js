/* Apex · Bonus Engine (frontend adapter)
 * 定义：Scatter 触发 / 免费旋转次数 / Retrigger 规则
 * 只负责规则数据，不涉及动画与 UI
 *
 * P0-3: 数值从 ApexEngineBonus.BONUS_RULES 单源读取（引擎权威），
 * 避免前后端再次分叉。加载顺序保证 engine/bonus.js 先于本脚本。
 *
 * 接口约定（P0-1）：
 *   调用方（game-provider-demo.js）在 Bonus 免费旋转中产出的中奖，
 *   必须同样施加 MODE_PROFILE[mode].payScale，否则 simulator 报出的
 *   demo RTP 会被高估（bonus 局不计 payScale 就等于变相降 RTP）。
 */
(function () {
  'use strict';

  var RAND_BUF = new Uint32Array(1);   // 复用，避免热路径反复分配

  // P0-3: 从引擎读取权威值（engine/bonus.js 已先加载）
  var ENG = (typeof window !== 'undefined'
    && window.ApexEngineBonus
    && window.ApexEngineBonus.BONUS_RULES) || {};

  var BONUS_CONFIG = Object.freeze({
    scatterSymbol: 'LOLLIPOP',
    triggerMin: (ENG.triggerScatterCount != null) ? ENG.triggerScatterCount : 4,
    triggerMax: 6,
    // freeSpins4/5/6 保留前端定义（引擎暂只暴露 initialSpins=10）
    // TODO: 待引擎支持 4/5/6 -> 10/12/15 后改为单源
    freeSpins4: 10,
    freeSpins5: 12,
    freeSpins6: 15,
    retriggerMin: (ENG.retriggerScatterCount != null) ? ENG.retriggerScatterCount : 4,
    retriggerAdd: (ENG.retriggerSpins != null) ? ENG.retriggerSpins : 2,
    maxFreeSpins: 200,
    multiplierSymbol: 'MULTIPLIER',
    multiplierValues: Object.freeze([2, 3, 5, 10, 25, 50, 100])
  });

  // 一致性断言：数值一旦分叉立即报警（开发期）
  try {
    if (typeof console !== 'undefined' && console.assert) {
      console.assert(BONUS_CONFIG.triggerMin === 4, 'P0-3: triggerMin mismatch');
      console.assert(BONUS_CONFIG.retriggerMin === 4, 'P0-3: retriggerMin mismatch');
      console.assert(BONUS_CONFIG.retriggerAdd === 2, 'P0-3: retriggerAdd mismatch');
    }
  } catch (e) {}

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
