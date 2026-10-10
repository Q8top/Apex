(function(){
'use strict';
var _ev = window.ApexSugarRushEvaluator;
var _tb = window.ApexSugarRushTumble;
var _bn = window.ApexSugarRushBonus;
var _mp = window.ApexSugarRushMathProfile;
var _rng = window.ApexSugarRushRng;
var MAX_CASCADES = 60;
var MAX_FS_SPINS = 500;

function buildRngForMode(mode, fsMode){
  var w = _mp.buildRngWeights(mode, { fsMode: !!fsMode });
  return new _rng.Rng(w);
}

function isScatter(id){ return window.ApexSugarRushSymbolsLocked.kindOf(id) === 'scatter'; }
function isMultiplier(id){ return window.ApexSugarRushSymbolsLocked.kindOf(id) === 'multiplier'; }

function runCascades(grid, rng, detail){
  var cur = grid;
  var rawWin = 0;
  var cascades = 0;
  var steps = detail ? [] : null;
  var safety = 0;
  while (safety++ < MAX_CASCADES){
    var r = _ev.evaluate(cur);
    if (r.payoutMultiplier <= 0) break;
    rawWin += r.payoutMultiplier;
    cascades++;
    var next = _tb.tumble(cur, r.winningPositions, rng);
    if (detail) steps.push({ winningPositions: r.winningPositions.slice(), wins: r.wins.slice(), gridAfter: next.slice(), stepMult: r.payoutMultiplier });
    cur = next;
  }
  return { grid: cur, rawWin: rawWin, cascades: cascades, steps: steps };
}

function fsSpin(fsRng, detail){
  var grid = fsRng.generateGrid();
  var scatterCount = 0;
  var bombSum = 0;
  var bombPositions = [];
  for (var i = 0; i < grid.length; i++){
    if (isScatter(grid[i])) scatterCount++;
    else if (isMultiplier(grid[i])){ bombSum += _bn.rollBombValue(fsRng); bombPositions.push(i); }
  }
  var r = runCascades(grid, fsRng, detail);
  var mult = bombSum > 0 ? bombSum : 1;
  return {
    winMult: r.rawWin * mult,
    rawWin: r.rawWin,
    scatterCount: scatterCount,
    cascades: r.cascades,
    bombSum: bombSum,
    bombPositions: bombPositions,
    finalGrid: r.grid,
    detail: detail ? { initialGrid: grid.slice(), steps: r.steps, finalGrid: r.grid.slice() } : undefined
  };
}

function playSpin(mode, betMinor, opts){
  opts = opts || {};
  var detail = !!opts.detail;
  var knobs = _mp.getProfile(mode);
  var baseRng = buildRngForMode(mode, false);
  var fsRng = buildRngForMode(mode, true);
  var g0 = baseRng.generateGrid();
  var baseScatter = 0;
  for (var i = 0; i < g0.length; i++){ if (isScatter(g0[i])) baseScatter++; }
  var base = runCascades(g0, baseRng, detail);
  var rawWin = base.rawWin;
  var cascades = base.cascades;
  var fsTriggered = false;
  var fsSpinsPlayed = 0;
  var fsRawWin = 0;
  var fsRetriggers = 0;
  var fsDetail = detail ? [] : null;
  if (_bn.resolveBonusTrigger(baseScatter)){
    fsTriggered = true;
    var spins = _bn.resolveInitialSpins(baseScatter);
    rawWin += _bn.scatterPayout(baseScatter);
    var played = 0;
    while (played < spins && played < MAX_FS_SPINS){
      played++;
      var fr = fsSpin(fsRng, detail);
      fsRawWin += fr.winMult;
      cascades += fr.cascades;
      if (detail) fsDetail.push(fr.detail);
      var rt = _bn.resolveRetrigger(fr.scatterCount);
      if (rt > 0){ spins += rt; fsRetriggers++; }
    }
    fsSpinsPlayed = played;
    rawWin += fsRawWin;
  }
  if (rawWin === 0 && knobs.pityRate > 0){
    var roll = baseRng.randomInt(10000) / 10000;
    if (roll < knobs.pityRate){
      rawWin = knobs.pityMin + (baseRng.randomInt(knobs.pityRange) / 100);
      cascades += 1;
    }
  }
  var totalMult = rawWin * knobs.payScale;
  if (totalMult > knobs.maxWinMultiplier) totalMult = knobs.maxWinMultiplier;
  var winMinor = Math.floor(betMinor * totalMult);
  var result = {
    mode: mode,
    finalGrid: base.grid,
    totalMultiplier: totalMult,
    winMinor: winMinor,
    cascades: cascades,
    scatterCount: baseScatter,
    fsTriggered: fsTriggered,
    fsSpinsPlayed: fsSpinsPlayed,
    fsRawWin: fsRawWin,
    fsRetriggers: fsRetriggers
  };
  if (detail){
    result.detail = {
      initialGrid: g0.slice(),
      baseSteps: base.steps,
      baseFinalGrid: base.grid.slice(),
      fsDetail: fsDetail,
      payScale: knobs.payScale
    };
  }
  return result;
}

window.ApexSugarRushGameEngine = Object.freeze({
  spin: playSpin,
  fsSpin: fsSpin,
  buildRngForMode: buildRngForMode
});
})();
