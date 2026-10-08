(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _grid = window.ApexEngineGrid;
var _eval = window.ApexEngineEvaluator;
var _tumble = window.ApexEngineTumble;
var _bonus = window.ApexEngineBonus;
var _pay = window.ApexEnginePayout;

function GameEngine(opts){
  opts = opts || {};
  if (!opts.rng) throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, 'rng required');
  this.rng = opts.rng;
  this.maxTumbleSteps = opts.maxTumbleSteps == null ? 100 : opts.maxTumbleSteps;
}

GameEngine.prototype.spin = function(request){
  request = request || {};
  var mode = request.mode || 'demo';
  var betMinor = request.betMinor;
  var spinId = request.spinId || _uuid();

  if (mode !== 'demo' && mode !== 'real'){
    throw _err.ApexError(_err.CODES.INVALID_MODE, 'mode must be demo|real');
  }
  if (!Number.isSafeInteger(betMinor) || betMinor <= 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'betMinor must be positive integer');
  }
  if (typeof spinId !== 'string' || spinId.length < 10){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'spinId must be string >= 10 chars');
  }

  var grid = null;
  if (request.gridOverride != null){
    if (!Array.isArray(request.gridOverride) || request.gridOverride.length !== _grid.GRID.size){
      throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'gridOverride must be 30-length array');
    }
    grid = request.gridOverride.slice();
  } else {
    grid = this.rng.generateGrid();
  }
  var cascades = [];
  var totalMultiplier = 0;
  var bonusTriggered = false;
  var bonusScatterCount = 0;
  var bonusScatterPayout = 0;
  var terminatedBySafetyLimit = false;

  for (var step = 0; step < this.maxTumbleSteps; step++){
    var ev = _eval.evaluate(grid);
    var cascade = {
      index: step,
      grid: grid.slice(),
      wins: ev.wins,
      removed: ev.winningPositions.slice(),
      multiplier: ev.payoutMultiplier,
      scatterCount: ev.scatterCount,
      multiplierPositions: ev.multiplierPositions.slice()
    };
    cascades.push(cascade);

    if (!bonusTriggered && _bonus.resolveBonusTrigger(ev.scatterCount)){
      bonusTriggered = true;
      bonusScatterCount = ev.scatterCount;
      bonusScatterPayout = _bonus.scatterPayout(ev.scatterCount);
    }

    if (ev.winningPositions.length === 0){
      break;
    }
    totalMultiplier += ev.payoutMultiplier;

    if (step === this.maxTumbleSteps - 1){
      terminatedBySafetyLimit = true;
      break;
    }

    grid = _tumble.tumble(grid, ev.winningPositions, this.rng);
  }

  var totalWinMinor = _pay.calculatePayout(betMinor, totalMultiplier);

  return {
    version: 1,
    spinId: spinId,
    mode: mode,
    betMinor: betMinor,
    grid: cascades.length > 0 ? cascades[0].grid.slice() : grid.slice(),
    cascades: cascades,
    bonus: {
      triggered: bonusTriggered,
      scatterCount: bonusScatterCount,
      scatterPayout: bonusScatterPayout,
      awardedSpins: bonusTriggered ? _bonus.BONUS_RULES.initialSpins : 0,
      retriggered: false
    },
    totalMultiplier: totalMultiplier,
    totalWinMinor: totalWinMinor,
    diagnostics: {
      tumbleCount: cascades.length,
      terminatedBySafetyLimit: terminatedBySafetyLimit
    }
  };
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

window.ApexEngineGameEngine = Object.freeze({ GameEngine: GameEngine });
})();
