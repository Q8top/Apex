(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _GE = window.ApexEngineGameEngine;

function LocalDemoProvider(opts){
  opts = opts || {};
  if (!opts.engine) throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'engine required');
  this.engine = opts.engine;
}
LocalDemoProvider.prototype.spin = function(request){
  var self = this;
  return Promise.resolve().then(function(){
    if (!request || typeof request !== 'object'){
      throw _err.ApexError(_err.CODES.INVALID_RESULT, 'request required');
    }
    if (request.mode !== 'demo'){
      throw _err.ApexError(_err.CODES.INVALID_MODE, 'demo provider only');
    }
    return self.engine.spin(request);
  });
};
window.ApexCoreLocalDemoProvider = Object.freeze({ LocalDemoProvider: LocalDemoProvider });
})();
