(function(){
'use strict';
var _err = window.ApexEngineErrors;
function Wallet(){}
Wallet.prototype.getBalance = function(){
  return Promise.reject(_err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'NOT_IMPLEMENTED'));
};
Wallet.prototype.placeBet = function(){
  return Promise.reject(_err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'NOT_IMPLEMENTED'));
};
Wallet.prototype.settle = function(){
  return Promise.reject(_err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'NOT_IMPLEMENTED'));
};
window.ApexCoreWallet = Object.freeze({ Wallet: Wallet });
})();
