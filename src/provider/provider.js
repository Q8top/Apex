(function(){
'use strict';
var _err = window.ApexEngineErrors;
function GameProvider(){}
GameProvider.prototype.spin = function(request){
  return Promise.reject(_err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'NOT_IMPLEMENTED'));
};
window.ApexCoreProvider = Object.freeze({ GameProvider: GameProvider });
})();
