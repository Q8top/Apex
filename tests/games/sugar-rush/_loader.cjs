'use strict';
function loadAll() {
  global.window = {};
  var cfg = ['symbols.locked','paytable.locked','math-profile'];
  var eng = ['errors','grid','rng','payout','multiplier','evaluator','tumble','bonus','cap','game-engine'];
  cfg.forEach(function(m){ require('../../../src/games/sugar-rush/config/'+m+'.js'); });
require('../../../functions/games/sugar-rush/config/math-profile.real.js');
(function(){
  var w = globalThis.window || globalThis;
  var demo = w.ApexSugarRushMathProfile;
  var real = w.ApexSugarRushMathProfileReal;
  if (!real) {
    console.log('[loader][FATAL] ApexSugarRushMathProfileReal missing');
    throw new Error('real profile not loaded');
  }
  var _idMap = demo.ID_MAP;
  var _getProfile = function(m){
    if (m === 'real') return real.getReal();
    return demo.getProfile(m);
  };
  w.ApexSugarRushMathProfile = Object.freeze({
    VERSION: demo.VERSION, PROFILES: demo.PROFILES, ID_MAP: _idMap,
    buildRngWeights: function(mode, opts){
      opts = opts || {};
      var p = _getProfile(mode);
      var out = {};
      var keys = Object.keys(p.baseWeights);
      for (var i = 0; i < keys.length; i++){
        var id = _idMap[keys[i]] || keys[i].toLowerCase();
        out[id] = p.baseWeights[keys[i]];
      }
      if (p.scatterWeight > 0) out.lollipop = p.scatterWeight;
      var mw = opts.fsMode ? p.fsMultiplierWeight : p.multiplierWeight;
      if (mw > 0) out.candy_bomb = mw;
      return out;
    },
    validate: demo.validate,
    getProfile: _getProfile
  });
})();
  eng.forEach(function(m){ require('../../../src/games/sugar-rush/engine/'+m+'.js'); });
}
module.exports = { loadAll: loadAll };
