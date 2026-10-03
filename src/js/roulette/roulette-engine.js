/* 欧洲/美式轮盘 · 引擎
   纯函数式：spin（随机数字）/ settle（按注单结算）
   注单格式：{ spot: 'red'|'black'|'straight:17'|'dozen1'|'column2'|'odd'|'even'|'low'|'high', amount: N }
*/
(function(){
'use strict';
var C = window.RouletteConfig;

function randInt(n){
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] % n;
}

/* 抽一个数字（欧洲 0-36，美式 -1/0-36） */
function spin(isAmerican){
  var wheel = isAmerican ? C.AMER_WHEEL : C.EURO_WHEEL;
  var idx = randInt(wheel.length);
  return wheel[idx];
}

/* 判断一个 spot 是否命中 number，返回净赔付倍数（0=不中，N=赢 N 倍净利） */
function spotPayout(spot, num){
  var P = C.PAYOUTS;
  if (spot === 'red')     return C.isRed(num) ? P.red : 0;
  if (spot === 'black')   return C.isBlack(num) ? P.black : 0;
  if (spot === 'odd')     return (num > 0 && num % 2 === 1) ? P.odd : 0;
  if (spot === 'even')    return (num > 0 && num % 2 === 0) ? P.even : 0;
  if (spot === 'low')     return (num >= 1 && num <= 18) ? P.low : 0;
  if (spot === 'high')    return (num >= 19 && num <= 36) ? P.high : 0;
  if (spot === 'dozen1')  return (num >= 1 && num <= 12) ? P.dozen1 : 0;
  if (spot === 'dozen2')  return (num >= 13 && num <= 24) ? P.dozen2 : 0;
  if (spot === 'dozen3')  return (num >= 25 && num <= 36) ? P.dozen3 : 0;
  if (spot === 'column1') return columnOf(num) === 1 ? P.column1 : 0;
  if (spot === 'column2') return columnOf(num) === 2 ? P.column2 : 0;
  if (spot === 'column3') return columnOf(num) === 3 ? P.column3 : 0;
  if (spot.indexOf('straight:') === 0) {
    var target = parseInt(spot.split(':')[1], 10);
    return target === num ? P.straight : 0;
  }
  return 0;
}

/* 数字在桌面 3 列中的列号（1/2/3），0/00 返回 0 */
function columnOf(num){
  if (num < 1 || num > 36) return 0;
  var m = num % 3;
  if (m === 1) return 1;
  if (m === 2) return 2;
  return 3;
}

/* 结算一张注单数组，返回 { totalBet, totalWin, netWin, hits: [...] } */
function settle(bets, num, scale){
  var s = scale || 1;
  var totalBet = 0, totalWin = 0, hits = [];
  for (var i = 0; i < bets.length; i++) {
    var b = bets[i];
    totalBet += b.amount;
    var m = spotPayout(b.spot, num);
    if (m > 0) {
      // 净赢 × scale，返还 = amount × (1 + m×scale)
      var net = b.amount * m * s;
      var back = b.amount + net;
      totalWin += back;
      hits.push({ spot: b.spot, amount: b.amount, mult: m, back: back });
    }
  }
  return { totalBet: totalBet, totalWin: totalWin, netWin: totalWin - totalBet, hits: hits };
}

window.RouletteEngine = {
  spin: spin,
  spotPayout: spotPayout,
  settle: settle,
  columnOf: columnOf,
  randInt: randInt
};
})();
