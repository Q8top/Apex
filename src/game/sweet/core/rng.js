/* Sweet · RNG
   默认模式：crypto.getRandomValues（生产）
   调试模式：seeded xorshift32（可复现）
   接口：RNG.rand() → [0, 1)

   生产环境唯一随机源。
   任何模块不得直接调用 crypto.getRandomValues。
*/
(function(){
'use strict';

var MODE = 'crypto';       // 'crypto' | 'seeded'
var _seed = 0;

function rand(){
  if (MODE === 'seeded') {
    _seed ^= _seed << 13;
    _seed ^= _seed >>> 17;
    _seed ^= _seed << 5;
    return ((_seed >>> 0) / 4294967296);
  }
  var b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 4294967296;
}

function setMode(m){
  MODE = (m === 'seeded') ? 'seeded' : 'crypto';
}
function seed(n){
  _seed = (n >>> 0) || 1;
  MODE = 'seeded';
}
function getMode(){ return MODE; }
function getSeed(){ return _seed; }

window.SweetRNG = {
  rand: rand,
  setMode: setMode,
  seed: seed,
  getMode: getMode,
  getSeed: getSeed
};
})();
