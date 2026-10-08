(function(){
'use strict';
var _err = window.ApexEngineErrors;

function ServerProvider(opts){
  opts = opts || {};
  this.baseUrl = opts.baseUrl || '';
  this.fetchImpl = opts.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
}
ServerProvider.prototype.spin = function(request){
  var self = this;
  return Promise.resolve().then(function(){
    if (!self.fetchImpl){
      throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'no fetch');
    }
    if (!request || typeof request !== 'object' || !request.spinId){
      throw _err.ApexError(_err.CODES.INVALID_RESULT, 'request.spinId required');
    }
    return self.fetchImpl(self.baseUrl + '/game/spin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': request.spinId
      },
      body: JSON.stringify(request)
    }).then(function(resp){
      if (!resp.ok){
        throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'HTTP ' + resp.status);
      }
      return resp.json();
    });
  });
};
ServerProvider.prototype.reconcile = function(spinId){
  var self = this;
  return Promise.resolve().then(function(){
    if (!self.fetchImpl){
      throw _err.ApexError(_err.CODES.PROVIDER_UNAVAILABLE, 'no fetch');
    }
    return self.fetchImpl(self.baseUrl + '/game/spin/' + encodeURIComponent(spinId))
      .then(function(resp){
        if (resp.status === 404) return null;
        if (!resp.ok) throw _err.ApexError(_err.CODES.NETWORK_ERROR, 'HTTP ' + resp.status);
        return resp.json();
      });
  });
};
window.ApexCoreServerProvider = Object.freeze({ ServerProvider: ServerProvider });
})();
