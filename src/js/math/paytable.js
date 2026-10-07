/* Apex · Candy Tumble Paytable
 * 8+ 相同符号中奖（Pay Anywhere）
 * 赔率为 bet 的倍数：实际支付 = bet * 倍数
 * 数值经模拟校准，目标 RTP 88%~93%
 */
(function () {
  'use strict';

  var PAYTABLE = Object.freeze({
    BANANA:       Object.freeze({ 8: 1.0,  10: 2.0,  12: 7.0 }),
    GRAPE:        Object.freeze({ 8: 1.0,  10: 3.0,  12: 8.0 }),
    WATERMELON:   Object.freeze({ 8: 1.5,  10: 3.5,  12: 10.0 }),
    PLUM:         Object.freeze({ 8: 1.5,  10: 3.5,  12: 10.0 }),
    APPLE:        Object.freeze({ 8: 2.0,  10: 5.0,  12: 13.0 }),
    BLUE_CANDY:   Object.freeze({ 8: 2.5,  10: 7.0,  12: 18.0 }),
    GREEN_CANDY:  Object.freeze({ 8: 2.5,  10: 7.0,  12: 18.0 }),
    PURPLE_CANDY: Object.freeze({ 8: 3.5,  10: 9.0,  12: 22.0 }),
    RED_HEART:    Object.freeze({ 8: 5.0,  10: 13.0, 12: 36.0 })
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
