(function(){
'use strict';
var M=window.ApexSRMain;if(!M)return;

function genSpinId(){
  var b=new Uint32Array(4);
  crypto.getRandomValues(b);
  var s='sr-';
  for(var i=0;i<b.length;i++){
    s+=b[i].toString(36);
  }
  return s+'x'+Date.now().toString(36);
}

function isReal(){ return (M.state.mode||'demo')==='real'; }

function pendingKey(){ return 'sr.pendingSpin.v1'; }

function getPending(){
  try{var v=sessionStorage.getItem(pendingKey());return v?JSON.parse(v):null;}
  catch(e){return null;}
}

function setPending(v){
  try{sessionStorage.setItem(pendingKey(),JSON.stringify(v));}catch(e){}
}

function clearPending(){
  try{sessionStorage.removeItem(pendingKey());}catch(e){}
}

function runRealSpin(betMinor){
  if(!window.apiClient||typeof window.apiClient.post!=='function'){
    return Promise.reject(new Error('api_client_unavailable'));
  }
  var pending=getPending();
  if(pending && (Date.now()-pending.startedAt)<30000){
    return Promise.reject(new Error('spin_in_flight'));
  }
  var spinId=genSpinId();
  setPending({spinId:spinId,startedAt:Date.now(),betMinor:betMinor});
  return window.apiClient.post('/api/game/sugar-rush-spin',
    { spinId:spinId, betMinor:betMinor, mode:'real' },
    { timeout:20000 }
  ).then(function(res){
    clearPending();
    if(!res || !res.success) throw new Error((res&&res.code)||'spin_failed');
    return res;
  });
}

function recoverPending(){
  var p=getPending();
  if(!p) return Promise.resolve(null);
  if(!window.apiClient||typeof window.apiClient.get!=='function') return Promise.resolve(null);
  return window.apiClient.get('/api/game/sugar-rush-spin-status?spinId='+encodeURIComponent(p.spinId))
    .then(function(res){
      if(res && res.success){ clearPending(); return res; }
      return null;
    })
    .catch(function(){ return null; });
}

window.ApexSRRealGate=Object.freeze({
  isReal:isReal,
  runRealSpin:runRealSpin,
  recoverPending:recoverPending,
  _genSpinId:genSpinId
});

M.onBoot(function(){
  recoverPending().then(function(res){
    if(res && window.ApexSRRender && res.result && res.result.finalGrid){
      window.ApexSRRender.renderGrid(res.result.finalGrid);
    }
  });
});
})();
