/* Apex Game Runtime · Demo Provider
 * 模拟服务器返回，仅供试玩模式
 * 正式模式结果必须由服务器权威生成
 */
(function () {
  'use strict';

  var SYM = ['BANANA','GRAPE','WATERMELON','PLUM','APPLE',
             'BLUE_CANDY','GREEN_CANDY','PURPLE_CANDY','RED_HEART'];

  function randInt(max) {
    var b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] % max;
  }

  function genGrid() {
    var g = [];
    for (var i = 0; i < 30; i++) g.push(SYM[randInt(SYM.length)]);
    return g;
  }

  function DemoProvider() {
    var balanceMinor = 1000000;

    function getBalance() {
      return { currency: 'CNY', minor: balanceMinor };
    }

    function spin(req) {
      var betMinor = Number(req && req.bet) || 200;
      var before = balanceMinor;
      balanceMinor -= betMinor;
      var grid = genGrid();
      var totalWin = 0;
      if (randInt(100) < 30) {
        var mult10 = randInt(20) + 1;
        totalWin = Math.floor(betMinor * mult10 / 10);
        balanceMinor += totalWin;
      }
      return Promise.resolve({
        spinId: 'demo_' + Date.now() + '_' + randInt(100000),
        grid: grid,
        bet: betMinor,
        balanceBefore: before,
        balanceAfter: balanceMinor,
        totalWin: totalWin,
        wins: [],
        tumbles: [],
        feature: null
      });
    }

    return { getBalance: getBalance, spin: spin };
  }

  window.ApexDemoProvider = { create: DemoProvider };
})();
