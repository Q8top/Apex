'use strict';
function loadAll() {
  global.window = {};
  var cfg = ['symbols.locked','paytable.locked','math-profile'];
  var eng = ['errors','grid','rng','payout','multiplier','evaluator','tumble','bonus','game-engine'];
  cfg.forEach(function(m){ require('../../../src/games/sugar-rush/config/'+m+'.js'); });
  eng.forEach(function(m){ require('../../../src/games/sugar-rush/engine/'+m+'.js'); });
}
module.exports = { loadAll: loadAll };
