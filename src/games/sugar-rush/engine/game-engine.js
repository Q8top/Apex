(function(){
'use strict';
var _g = window.ApexSugarRushGrid;
var _rng = window.ApexSugarRushRng;
var _ev = window.ApexSugarRushEvaluator;
var _tb = window.ApexSugarRushTumble;
var _bn = window.ApexSugarRushBonus;
var _mp = window.ApexSugarRushMathProfile;
var MAX_CASCADES = 60;
var MAX_FS_SPINS = 500;

function buildRngForMode(mode, fsMode){
  var w = _mp.buildRngWeights(mode, { fsMode: !!fsMode });
  return new _rng.Rng(w);
}

function rollBombValue(rng){
  return _bn.rollBombValue(rng);
}

function fsSpin(fsRng){
  var grid = fsRng.generateGrid();
  var scatterCount = 0;
  var bombSum = 0;
  for (var i = 0; i < grid.length; i++){
    var kind = window.ApexSugarRushSymbolsLocked.kindOf(grid[i]);
    if (kind === 'scatter') scatterCount++;
    else if (kind === 'multiplier') bombSum += rollBombValue(fsRng);
  }
  var rawWin = 0;
  var cascades = 0;
  var cur = grid;
  var safety = 0;
  while (safety++ < MAX_CASCADES){
    var r = _ev.evaluate(cur);
    if (r.payoutMultiplier <= 0) break;
    rawWin += r.payoutMultiplier;
    cascades++;
    cur = _tb.tumble(cur, r.winningPositions, fsRng);
  }
  var mult = bombSum > 0 ? bombSum : 1;
  return { winMult: rawWin * mult, scatterCount: scatterCount, cascades: cascades, bombSum: bombSum, finalGrid: cur };
}

function playSpin(mode, betMinor){
  var knobs = _mp.getProfile(mode);
  var baseRng = buildRngForMode(mode, false);
  var fsRng = buildRngForMode(mode, true);
  var g0 = baseRng.generateGrid();
  var baseScatter = 0;
  for (var i = 0; i < g0.length; i++){
    if (window.ApexSugarRushSymbolsLocked.kindOf(g0[i]) === 'scatter') baseScatter++;
  }
  var rawWin = 0;
  var cascades = 0;
  var cur = g0;
  var safety = 0;
  while (safety++ < MAX_CASCADES){
    var r = _ev.evaluate(cur);
    if (r.payoutMultiplier <= 0) break;
    rawWin += r.payoutMultiplier;
    cascades++;
    cur = _tb.tumble(cur, r.winningPositions, baseRng);
  }
  var fsTriggered = false;
  var fsSpinsPlayed = 0;
  var fsRawWin = 0;
  var fsRetriggers = 0;
  if (_bn.resolveBonusTrigger(baseScatter)){
    fsTriggered = true;
    var spins = _bn.resolveInitialSpins(baseScatter);
    rawWin += _bn.scatterPayout(baseScatter);
    var played = 0;
    while (played < spins && played < MAX_FS_SPINS){
      played++;
      var fr = fsSpin(fsRng);
      fsRawWin += fr.winMult;
      cascades += fr.cascades;
      var rt = _bn.resolveRetrigger(fr.scatterCount);
      if (rt > 0) { spins += rt; fsRetriggers++; }
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
  if (totalMult > knobs.maxWinMultiplier){
    totalMult = knobs.maxWinMultiplier;
  }
  var winMinor = Math.floor(betMinor * totalMult);
  return {
    mode: mode,
    finalGrid: cur,
    totalMultiplier: totalMult,
    winMinor: winMinor,
    cascades: cascades,
    scatterCount: baseScatter,
    fsTriggered: fsTriggered,
    fsSpinsPlayed: fsSpinsPlayed,
    fsRawWin: fsRawWin,
    fsRetriggers: fsRetriggers
  };
}

window.ApexSugarRushGameEngine = Object.freeze({
  spin: playSpin,
  fsSpin: fsSpin,
  buildRngForMode: buildRngForMode
});
})();
