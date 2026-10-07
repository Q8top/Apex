/* Apex · Candy Tumble Paytable
 * 8+ 相同符号中奖（Pay Anywhere）
 * 赔率为 bet 的倍数：实际支付 = bet * 倍数
 * 数值为占位演示，正式模型需数学验证后配置
 */
(function () {
  'use strict';

  var PAYTABLE = Object.freeze({
    BANANA:       Object.freeze({ 8: 0.20, 10: 0.50, 12: 1.00 }),
    GRAPE:        Object.freeze({ 8: 0.25, 10: 0.60, 12: 1.20 }),
    WATERMELON:   Object.freeze({ 8: 0.30, 10: 0.70, 12: 1.50 }),
    PLUM:         Object.freeze({ 8: 0.30, 10: 0.70, 12: 1.50 }),
    APPLE:        Object.freeze({ 8: 0.35, 10: 0.80, 12: 1.80 }),
    BLUE_CANDY:   Object.freeze({ 8: 0.50, 10: 1.20, 12: 2.50 }),
    GREEN_CANDY:  Object.freeze({ 8: 0.50, 10: 1.20, 12: 2.50 }),
    PURPLE_CANDY: Object.freeze({ 8: 0.60, 10: 1.50, 12: 3.00 }),
    RED_HEART:    Object.freeze({ 8: 0.80, 10: 2.00, 12: 5.00 })
  });

  var MIN_MATCH = 8;

  function getMultiplier(symbolType, count) {
    var table = PAYTABLE[symbolType];
    if (!table) return 0;
    if (count < MIN_MATCH) return 0;
    var keys = Object.keys(table).map(Number).sort(function (a, b) { return b - a; });
    for (var i = 0; i < keys.length; i++) {
      if (count >= keys[i]) return table[keys[i]];
    }
    return 0;
  }

  window.ApexPaytable = Object.freeze({
    PAYTABLE: PAYTABLE,
    MIN_MATCH: MIN_MATCH,
    getMultiplier: getMultiplier,
    getSymbols: function () { return Object.keys(PAYTABLE); }
  });
})();
