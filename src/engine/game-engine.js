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
  this.profile = opts.profile || null;   // P0-2: pity/maxWin per-mode profile
}

GameEngine.prototype.spin = function(request){
  request = request || {};
  var mode = request.mode || 'demo';
  var betMinor = request.betMinor;
  var spinId = request.spinId || _uuid();
  var isFree = !!request.isFree;

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
    // P0-2: pity 内聚 (demo profile 专用，非 FS 局)
    if (!isFree && this.profile &&
        this.profile.pityRate > 0 && this.profile.pitySymbol){
      var preEval = _eval.evaluate(grid);
      if (preEval.winningPositions.length === 0){
        var pityRoll = this.rng.randomInt(1000000) / 1000000;
        if (pityRoll < this.profile.pityRate){
          grid = _injectPity(grid,
            String(this.profile.pitySymbol).toLowerCase(),
            this.profile.pityMinCount || 8, this.rng);
        }
      }
    }
  }
  var cascades = [];
  var totalMultiplier = 0;
  var bonusTriggered = false;
  var bonusScatterCount = 0;
  var bonusScatterPayout = 0;
  var terminatedBySafetyLimit = false;
  var bombSum = 0;

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

    if (step === 0 && _bonus.resolveBonusTrigger(ev.scatterCount)){
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

  totalMultiplier += bonusScatterPayout;

  // P0-6b: 炸弹仅在 FS 中，每 spin 最多触发 1 次
  // 1/33 ~= 3% 触发率，配合 rollBombValue 的 ~5.6 期望值
  // 目标：avg bombFactor ~1.17，RTP +15% 以内
  if (isFree) {
    var BOMB_TRIGGER_DENOM = 33;
    if (this.rng.randomInt(BOMB_TRIGGER_DENOM) === 0) {
      bombSum = _bonus.rollBombValue(this.rng);
    }
  }

  var bombFactor = (bombSum > 0) ? (1 + bombSum) : 1;
  totalMultiplier = totalMultiplier * bombFactor;

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
    bombSum: bombSum,
    bombFactor: bombFactor,
    diagnostics: {
      tumbleCount: cascades.length,
      terminatedBySafetyLimit: terminatedBySafetyLimit
    }
  };
};

function _injectPity(grid, symbol, targetCount, rng){
  var out = grid.slice();
  var cur = 0;
  for (var i = 0; i < out.length; i++) if (out[i] === symbol) cur++;
  var need = targetCount - cur;
  if (need <= 0) return out;
  var guard = 0;
  while (need > 0 && guard < 500){
    var idx = rng.randomInt(out.length);
    if (out[idx] !== symbol){ out[idx] = symbol; need--; }
    guard++;
  }
  return out;
}

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
