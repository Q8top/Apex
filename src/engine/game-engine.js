(function(){
'use strict';
var _err = window.ApexEngineErrors;
var _grid = window.ApexEngineGrid;
var _eval = window.ApexEngineEvaluator;
var _tumble = window.ApexEngineTumble;
var _bonus = window.ApexEngineBonus;
var _pay = window.ApexEnginePayout;

/* P1-M5: only Node and local dev allow gridOverride. */
var ALLOW_GRID_OVERRIDE = (typeof location === 'undefined') ||
  (location.hostname === 'localhost' ||
   location.hostname === '127.0.0.1');

function GameEngine(opts){
  opts = opts || {};
  if (!opts.rng) throw _err.ApexError(_err.CODES.INVALID_WEIGHTS, 'rng required');
  this.rng = opts.rng;
  this.maxTumbleSteps = opts.maxTumbleSteps == null ? 100 : opts.maxTumbleSteps;
  this.profile = opts.profile || null;   // P0-2: pity/maxWin per-mode profile

  /* P0-1 接线：payScale / maxWinMultiplier（施工单终版） */
  var p = this.profile || {};
  this.payScale = (typeof p.payScale === 'number' && isFinite(p.payScale) && p.payScale > 0)
    ? p.payScale : 1;
  this.maxWinMultiplier = (Number.isSafeInteger(p.maxWinMultiplier) && p.maxWinMultiplier > 0)
    ? p.maxWinMultiplier : 0;
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
  // S1.7: 客户端生产环境拒绝 real；测试/本地环境放行（CI 需要）
  var _isProd = (typeof location !== 'undefined') &&
    location.hostname &&
    location.hostname !== 'localhost' &&
    location.hostname !== '127.0.0.1' &&
    !/\.pages\.dev$/.test(location.hostname) &&
    !/[?&]__test=1/.test(location.search || '');
  if (mode === 'real' && _isProd){
    throw _err.ApexError(_err.CODES.INVALID_MODE, 'client engine is demo-only');
  }
  if (!Number.isSafeInteger(betMinor) || betMinor <= 0){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'betMinor must be positive integer');
  }
  if (typeof spinId !== 'string' || spinId.length < 10){
    throw _err.ApexError(_err.CODES.INVALID_BET, 'spinId must be string >= 10 chars');
  }

  var grid = null;
  if (request.gridOverride != null){
    // S1.7: 客户端生产禁用
    if (!ALLOW_GRID_OVERRIDE){
      throw _err.ApexError(_err.CODES.INVALID_GRID_SIZE, 'gridOverride disabled in production');
    }
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

  var bombPositionsAll = [];
  for (var step = 0; step < this.maxTumbleSteps; step++){
    var ev = _eval.evaluate(grid);
    // S1.1: 收集本步真实落在盘面的炸弹（原版语义：炸弹是符号，不是概率）
    for (var b = 0; b < ev.multiplierPositions.length; b++){
      bombSum += _bonus.rollBombValue(this.rng);
      bombPositionsAll.push(ev.multiplierPositions[b]);
    }
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

  totalMultiplier += bonusScatterPayout;

  // S1.1: 原版语义 — bombSum 直接作为乘数
  var bombFactor = (bombSum > 0) ? bombSum : 1;
  totalMultiplier = totalMultiplier * bombFactor;

  /* P0-1：Max Win 硬截断（在 payScale 之前截断，与 SR cap.js 语义一致） */
  var rawMultiplier = totalMultiplier;
  var cappedByMaxWin = false;
  if (this.maxWinMultiplier > 0) {
    var rawCap = this.maxWinMultiplier / this.payScale;
    if (rawMultiplier > rawCap) { rawMultiplier = rawCap; cappedByMaxWin = true; }
  }
  var scaledMultiplier = rawMultiplier * this.payScale;
  var totalWinMinor = _pay.calculatePayout(betMinor, scaledMultiplier);

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
    totalMultiplier: scaledMultiplier,
    rawMultiplier: rawMultiplier,
    payScale: this.payScale,
    cappedByMaxWin: cappedByMaxWin,
    totalWinMinor: totalWinMinor,
    bombSum: bombSum,
    bombFactor: bombFactor,
    bombPositions: bombPositionsAll,
    rawMultiplier: totalMultiplier,
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
