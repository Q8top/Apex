(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _state = window.ApexCoreState;

function GameRuntime(opts){
  opts = opts || {};
  if (!opts.provider) throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'provider required');
  if (!opts.wallet)   throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'wallet required');
  this.provider = opts.provider;
  this.wallet = opts.wallet;
  this.renderer = opts.renderer || null;
  var base = opts.state || _state.INITIAL_STATE;
  this.state = Object.assign({}, base);
}
GameRuntime.prototype.getState = function(){ return this.state; };

GameRuntime.prototype.init = function(){
  var self = this;
  return this.wallet.getBalance().then(function(bal){
    self.state = _state.reduce(self.state, { type: 'BALANCE_UPDATED', balanceMinor: bal });
    return self.state;
  });
};

GameRuntime.prototype.startSpin = function(opts){
  var self = this;
  opts = opts || {};
  if (this.state.phase !== 'idle'){
    return Promise.reject(_err.ApexError(_err.CODES.SPIN_NOT_ALLOWED, 'phase=' + this.state.phase));
  }
  var mode = opts.mode || this.state.mode;
  var betMinor = opts.betMinor == null ? this.state.betMinor : opts.betMinor;
  var spinId = opts.spinId || _uuid();

  self.state = _state.reduce(self.state, { type: 'SPIN_STARTED', spinId: spinId });

  return self.wallet.placeBet({ amountMinor: betMinor })
    .then(function(betRes){
      self.state = _state.reduce(self.state, { type: 'BALANCE_UPDATED', balanceMinor: betRes.balanceMinor });
      return self.provider.spin({ mode: mode, betMinor: betMinor, spinId: spinId });
    })
    .then(function(result){
      if (result.totalWinMinor > 0){
        return self.wallet.settle({ winMinor: result.totalWinMinor }).then(function(setRes){
          return { result: result, balanceMinor: setRes.balanceMinor };
        });
      }
      return { result: result, balanceMinor: self.state.balanceMinor };
    })
    .then(function(out){
      if (self.renderer && typeof self.renderer.play === 'function'){
        try { self.renderer.play(out.result); } catch(e){}
      }
      self.state = _state.reduce(self.state, {
        type: 'SPIN_RESOLVED',
        result: out.result,
        balanceMinor: out.balanceMinor
      });
      return out.result;
    })
    .catch(function(e){
      if (self.state.phase !== 'idle'){
        self.state = _state.reduce(self.state, { type: 'SPIN_FAILED' });
      }
      throw e;
    });
};

GameRuntime.prototype.startFreeSpins = function(spins){
  if (this.state.phase !== 'idle'){
    return Promise.reject(_err.ApexError(_err.CODES.SPIN_NOT_ALLOWED, 'phase=' + this.state.phase));
  }
  var n = Number.isSafeInteger(spins) && spins > 0 ? spins : 10;
  this.state = _state.reduce(this.state, { type: 'BONUS_STARTED', spins: n });
  return Promise.resolve(this.state);
};

GameRuntime.prototype.completeFreeSpin = function(){
  if (this.state.phase !== 'bonus'){
    return Promise.reject(_err.ApexError(_err.CODES.SPIN_NOT_ALLOWED, 'not in bonus'));
  }
  this.state = _state.reduce(this.state, { type: 'BONUS_SPIN_COMPLETED' });
  if (this.state.freeSpins.remaining === 0){
    this.state = _state.reduce(this.state, { type: 'BONUS_ENDED' });
  }
  return Promise.resolve(this.state);
};

GameRuntime.prototype.endFreeSpins = function(){
  if (this.state.phase === 'bonus'){
    this.state = _state.reduce(this.state, { type: 'BONUS_ENDED' });
  }
  return Promise.resolve(this.state);
};

GameRuntime.prototype.setBet = function(betMinor){
  this.state = _state.reduce(this.state, { type: 'BET_CHANGED', betMinor: betMinor });
  return this.state.betMinor;
};

GameRuntime.prototype.resetBalance = function(amount){
  var self = this;
  var a = Number.isSafeInteger(amount) && amount >= 0 ? amount : 100000;
  return Promise.resolve(self.wallet.reset(a)).then(function(){
    self.state = _state.reduce(self.state, { type: 'BALANCE_UPDATED', balanceMinor: a });
    return self.state.balanceMinor;
  });
};

function _uuid(){
  if (typeof crypto === 'undefined'){
    throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'crypto unavailable');
  }
  if (crypto.randomUUID) return crypto.randomUUID();
  if (!crypto.getRandomValues){
    throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'crypto.getRandomValues unavailable');
  }
  var b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  var hex = '';
  for (var j = 0; j < 16; j++) hex += (b[j] + 0x100).toString(16).slice(1);
  return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}

window.ApexCoreRuntime = Object.freeze({ GameRuntime: GameRuntime });
})();
