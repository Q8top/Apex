(function(){
'use strict';
/* Apex · Demo Provider v4（Legacy Adapter）
 * 用新引擎（GameEngine）提供老的 window.ApexDemoProvider.create() 接口。
 * 老 provider 的返回值结构完全保留，sweet-demo.js 不用改一行。
 * 只跑一条路径：新引擎。
 */
var MP = window.ApexMathProfile;
var GE = window.ApexEngineGameEngine;
var EV = window.ApexEngineEvaluator;
var RG = window.ApexEngineRng;

var ID2KEY = {
  'banana':'BANANA', 'grape':'GRAPE', 'watermelon':'WATERMELON',
  'plum':'PLUM', 'apple':'APPLE',
  'blue_candy':'BLUE_CANDY', 'green_candy':'GREEN_CANDY',
  'purple_candy':'PURPLE_CANDY', 'red_heart_candy':'RED_HEART',
  'lollipop':'LOLLIPOP', 'multiplier_bomb':'MULTIPLIER'
};
function toKey(id){ return ID2KEY[id] || id; }
function gridToKeys(g){
  var out = new Array(g.length);
  for (var i = 0; i < g.length; i++) out[i] = toKey(g[i]);
  return out;
}

var _buf = new Uint32Array(1);
function randInt(max){ crypto.getRandomValues(_buf); return _buf[0] % max; }

function injectPity(grid, symbol, count){
  var g = grid.slice();
  var cur = 0;
  for (var i = 0; i < g.length; i++) if (g[i] === symbol) cur++;
  var need = count - cur;
  if (need <= 0) return g;
  var guard = 0;
  while (need > 0 && guard < 200){
    var idx = randInt(g.length);
    if (g[idx] !== symbol){ g[idx] = symbol; need--; }
    guard++;
  }
  return g;
}

function simulateDelay(minMs, maxMs){
  var span = Math.max(1, maxMs - minMs);
  var ms = minMs + randInt(span);
  return new Promise(function(resolve){ setTimeout(resolve, ms); });
}

var SPIN_COUNTER = 0;

function DemoProvider(opts){
  opts = opts || {};
  this.mode = (opts.mode === 'demo' || opts.mode === 'real') ? opts.mode : 'real';
  this.balanceMinor = Number(opts.initialBalance) || 1000000;
  var profile = MP.getProfile(this.mode);
  var weights = MP.buildRngWeights(this.mode);
  this.engine = new GE.GameEngine({
    rng: new RG.Rng(weights),
    maxTumbleSteps: 20,
    profile: profile
  });
  this.payScale = profile.payScale;
  this.pityRate = profile.pityRate;
  this.pitySymbol = profile.pitySymbol ? profile.pitySymbol.toLowerCase() : null;
  this.pityMinCount = profile.pityMinCount || 8;
}

DemoProvider.prototype.getBalance = function(){
  return { currency: 'CNY', minor: this.balanceMinor };
};
DemoProvider.prototype.getMode = function(){ return this.mode; };

DemoProvider.prototype.spin = function(req){
  var self = this;
  req = req || {};
  var mode = (req.mode === 'demo' || req.mode === 'real') ? req.mode : this.mode;
  var betMinor = Number(req.bet) || 200;
  var isFree = !!req.free;
  var before = this.balanceMinor;

  if (!isFree && this.balanceMinor < betMinor){
    return Promise.reject(new Error('insufficient'));
  }
  if (!isFree) this.balanceMinor -= betMinor;

  var payload;
  try {
    // P0-2: pity 已内聚到 engine；engine 会自己在本地生成盘面时按 profile 注入
    var res = this.engine.spin({
      mode: mode,
      betMinor: betMinor,
      spinId: 'demo_' + Date.now() + '_' + (++SPIN_COUNTER) + '_' + randInt(100000)
    });
    var gridSmall = res.grid;

    // 应用 payScale（与 simulator-v2 一致）
    var winMinor = Math.floor(betMinor * res.totalMultiplier * this.payScale);

    // 免费旋转倍率炸弹（对齐老 provider：1~3 个，总倍率乘在 win 上）
    var multipliers = [];
    var multiplierSum = 0;
    if (isFree && winMinor > 0){
      var mc = 1 + randInt(3);
      var allMp = [];
      for (var i = 0; i < res.cascades.length; i++){
        var mp = res.cascades[i].multiplierPositions;
        for (var j = 0; j < mp.length; j++) allMp.push(mp[j]);
      }
      if (allMp.length > 0){
        var vals = [2,3,5,10,25,50,100];
        for (var k = 0; k < Math.min(mc, allMp.length); k++){
          var val = vals[randInt(vals.length)];
          multipliers.push({ position: allMp[k], value: val });
          multiplierSum += val;
        }
        winMinor = winMinor * multiplierSum;
      }
    }

    this.balanceMinor += winMinor;

    // cascades → tumbles 转换（只保留有消除的步）
    var tumbles = [];
    var cascades = res.cascades;
    for (var n = 0; n < cascades.length; n++){
      if (cascades[n].removed.length > 0){
        var nextGrid = cascades[n+1] ? cascades[n+1].grid : cascades[n].grid;
        tumbles.push({
          removedPositions: cascades[n].removed.slice(),
          gridAfter: gridToKeys(nextGrid)
        });
      }
    }

    var finalGridSmall = cascades.length > 0
      ? cascades[cascades.length-1].grid
      : gridSmall;

    var feature = null;
    if (res.bonus.triggered && window.ApexBonus){
      feature = {
        triggered: true,
        scatterCount: res.bonus.scatterCount,
        initialSpins: window.ApexBonus.resolveInitialSpins(res.bonus.scatterCount)
      };
    }

    payload = {
      spinId: res.spinId,
      gameId: 'sweet',
      mode: mode,
      payScale: this.payScale,
      currency: 'CNY',
      bet: betMinor,
      balanceBefore: before,
      balanceAfter: this.balanceMinor,
      grid: gridToKeys(gridSmall),
      finalGrid: gridToKeys(finalGridSmall),
      tumbles: tumbles,
      totalWin: winMinor,
      feature: feature,
      multipliers: multipliers,
      multiplierSum: multiplierSum
    };
  } catch (e) {
    if (!isFree) this.balanceMinor += betMinor;
    return Promise.reject(e);
  }

  return simulateDelay(400, 900).then(function(){ return payload; });
};

DemoProvider.prototype.resetBalance = function(minor){
  var n = Math.floor(Number(minor) || 1000000);
  this.balanceMinor = n;
  return { currency: 'CNY', minor: n };
};

window.ApexDemoProvider = { create: function(o){ return new DemoProvider(o); } };
})();
