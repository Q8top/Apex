(function(){
'use strict';
/* Apex · Server Provider Adapter (real 模式)
 * 对接 /api/game/spin，把服务端结果转成老 provider 格式，
 * 让 sweet-demo.js 不用改一行。
 *
 * 关键：real 模式所有数学结果由服务端权威给出，前端只展示。
 */
var _err = window.ApexEngineErrors;

var ID2KEY = {
  'banana':'BANANA', 'grape':'GRAPE', 'watermelon':'WATERMELON',
  'plum':'PLUM', 'apple':'APPLE',
  'blue_candy':'BLUE_CANDY', 'green_candy':'GREEN_CANDY',
  'purple_candy':'PURPLE_CANDY', 'red_heart_candy':'RED_HEART',
  'lollipop':'LOLLIPOP', 'multiplier_bomb':'MULTIPLIER'
};
function toKey(id){ return ID2KEY[id] || id; }
function gridToKeys(g){
  if (!g) return g;
  var out = new Array(g.length);
  for (var i = 0; i < g.length; i++) out[i] = toKey(g[i]);
  return out;
}

function uuid(){
  if (typeof crypto === 'undefined') throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'crypto unavailable');
  if (crypto.randomUUID) return crypto.randomUUID();
  var b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  var hex = '';
  for (var i = 0; i < 16; i++) hex += (b[i] + 0x100).toString(16).slice(1);
  return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}

function toLegacy(result, betMinor, balanceBefore, balanceAfter, winMinor){
  var cascades = result.cascades || [];
  var tumbles = [];
  for (var n = 0; n < cascades.length; n++){
    if (cascades[n].removed && cascades[n].removed.length > 0){
      var nextGrid = cascades[n+1] ? cascades[n+1].grid : cascades[n].grid;
      tumbles.push({
        removedPositions: cascades[n].removed.slice(),
        gridAfter: gridToKeys(nextGrid)
      });
    }
  }
  var finalGrid = cascades.length > 0
    ? cascades[cascades.length - 1].grid
    : result.grid;

  var feature = null;
  if (result.bonus && result.bonus.triggered){
    feature = {
      triggered: true,
      scatterCount: result.bonus.scatterCount,
      initialSpins: result.bonus.awardedSpins || 10
    };
  }

  return {
    spinId: result.spinId,
    gameId: 'sweet',
    mode: result.mode,
    currency: 'CNY',
    bet: betMinor,
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    grid: gridToKeys(result.grid),
    finalGrid: gridToKeys(finalGrid),
    tumbles: tumbles,
    totalWin: winMinor,
    feature: feature,
    multipliers: [],
    multiplierSum: 0
  };
}

function ServerProvider(opts){
  opts = opts || {};
  this.mode = 'real';
  this.client = opts.client || (typeof window !== 'undefined' ? window.apiClient : null);
  if (!this.client) throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'apiClient required');
  this.lastBalance = null;
}

ServerProvider.prototype.getBalance = function(){
  var self = this;
  return this.client.get('/api/me').then(function(resp){
    if (!resp || !resp.success || !resp.user){
      throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'not authenticated');
    }
    self.lastBalance = resp.user.walletBalance;
    return { currency: 'CNY', minor: self.lastBalance };
  });
};

ServerProvider.prototype.getMode = function(){ return 'real'; };

ServerProvider.prototype.resetBalance = function(){
  return Promise.reject(_err.ApexError(_err.CODES.INVALID_BET, 'real 模式不支持重置余额'));
};

ServerProvider.prototype.spin = function(req){
  var self = this;
  req = req || {};
  var betMinor = Number(req.bet) || 0;
  var isFree = !!req.free;
  var spinId = req.spinId || uuid();

  return this.client.post('/api/game/spin', {
    spinId: spinId,
    betMinor: betMinor,
    mode: 'real',
    isFree: isFree
  }).then(function(resp){
    if (!resp || resp.success !== true){
      var msg = (resp && resp.message) || '服务器错误';
      var code = (resp && resp.code) || 'unknown';
      var e = _err.ApexError(_err.CODES.INVALID_RESULT, msg);
      e.serverCode = code;
      e.balance = resp && resp.balance;
      throw e;
    }
    var r = resp.result || {};
    r.spinId = r.spinId || spinId;
    r.mode = 'real';
    self.lastBalance = resp.balanceAfter;
    return toLegacy(r, betMinor, resp.balanceBefore, resp.balanceAfter, resp.winMinor);
  });
};

window.ApexServerProvider = Object.freeze({ create: function(o){ return new ServerProvider(o); } });
})();
