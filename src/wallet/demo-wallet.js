(function(){
'use strict';
var _err = window.ApexEngineErrors;

function DemoWallet(initialMinor){
  if (initialMinor == null) initialMinor = 100000;
  if (!Number.isSafeInteger(initialMinor) || initialMinor < 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'initial balance must be non-negative integer');
  }
  this.balanceMinor = initialMinor;
}
DemoWallet.prototype.getBalance = function(){
  return Promise.resolve(this.balanceMinor);
};
DemoWallet.prototype.placeBet = function(req){
  var self = this;
  return Promise.resolve().then(function(){
    if (!req || !Number.isSafeInteger(req.amountMinor) || req.amountMinor <= 0){
      throw _err.ApexError(_err.CODES.INVALID_BET, 'amountMinor must be positive integer');
    }
    if (req.amountMinor > self.balanceMinor){
      throw _err.ApexError(_err.CODES.INSUFFICIENT_BALANCE, 'insufficient');
    }
    self.balanceMinor -= req.amountMinor;
    return { balanceMinor: self.balanceMinor };
  });
};
DemoWallet.prototype.settle = function(req){
  var self = this;
  return Promise.resolve().then(function(){
    if (!req || !Number.isSafeInteger(req.winMinor) || req.winMinor < 0){
      throw _err.ApexError(_err.CODES.INVALID_BET, 'winMinor must be non-negative integer');
    }
    self.balanceMinor += req.winMinor;
    return { balanceMinor: self.balanceMinor };
  });
};
DemoWallet.prototype.reset = function(amount){
  if (amount == null) amount = 100000;
  if (!Number.isSafeInteger(amount) || amount < 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'reset amount invalid');
  }
  this.balanceMinor = amount;
  return this.balanceMinor;
};
window.ApexCoreDemoWallet = Object.freeze({ DemoWallet: DemoWallet });
})();
