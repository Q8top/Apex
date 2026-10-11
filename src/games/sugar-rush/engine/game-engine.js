(function(){
'use strict';
var _ev = window.ApexSugarRushEvaluator;
var _tb = window.ApexSugarRushTumble;
var _bn = window.ApexSugarRushBonus;
var _mp = window.ApexSugarRushMathProfile;
var _rng = window.ApexSugarRushRng;
var _cap = window.ApexSugarRushCap;
var MAX_CASCADES = 100;
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
  // P0-7 Phase A1: engine runs ONE layer only.
  // FS session is managed by the server (see sugar-rush-spin.js).
  if (_bn.resolveBonusTrigger(baseScatter)){
    fsTriggered = true;
    rawWin += _bn.scatterPayout(baseScatter);
  }
  if (rawWin === 0 && knobs.pityRate > 0){
    var roll = baseRng.randomInt(10000) / 10000;
    if (roll < knobs.pityRate){
      rawWin = knobs.pityMin + (baseRng.randomInt(knobs.pityRange) / 100);
      cascades += 1;
    }
  }
  // P0-1: cap BEFORE payScale (semantic alignment)
  var capResult = _cap.applyCap(rawWin, knobs.payScale, knobs.maxWinMultiplier);
  var cappedRawWin = capResult.rawWin;
  var totalMult = cappedRawWin * knobs.payScale;
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
    fsRetriggers: fsRetriggers,
    cappedByMaxWin: capResult.capped,
    rawWinBeforeCap: rawWin
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

function spinBase(mode, betMinor, opts){
  opts = opts || {};
  var detail = !!opts.detail;
  var knobs = _mp.getProfile(mode);
  var rng = buildRngForMode(mode, false);
  var g0 = rng.generateGrid();
  var baseScatter = 0;
  for (var i = 0; i < g0.length; i++){ if (isScatter(g0[i])) baseScatter++; }
  var base = runCascades(g0, rng, detail);
  var rawWin = base.rawWin;
  var scatterBonus = 0;
  var fsTriggered = false;
  if (_bn.resolveBonusTrigger(baseScatter)){
    fsTriggered = true;
    scatterBonus = _bn.scatterPayout(baseScatter);
    rawWin += scatterBonus;
  }
  if (rawWin === 0 && knobs.pityRate > 0){
    var roll = rng.randomInt(10000) / 10000;
    if (roll < knobs.pityRate){
      rawWin = knobs.pityMin + (rng.randomInt(knobs.pityRange) / 100);
    }
  }
  var capResult = _cap.applyCap(rawWin, knobs.payScale, knobs.maxWinMultiplier);
  var totalMult = capResult.rawWin * knobs.payScale;
  var winMinor = Math.floor(betMinor * totalMult);
  var result = {
    mode: mode,
    baseOnly: true,
    finalGrid: base.grid,
    totalMultiplier: totalMult,
    winMinor: winMinor,
    cascades: base.cascades,
    scatterCount: baseScatter,
    fsTriggered: fsTriggered,
    fsSpinsAwarded: fsTriggered ? _bn.resolveInitialSpins(baseScatter) : 0,
    scatterPayout: scatterBonus,
    cappedByMaxWin: capResult.capped,
    rawWinBeforeCap: rawWin
  };
  if (detail){
    result.detail = {
      initialGrid: g0.slice(),
      baseSteps: base.steps,
      baseFinalGrid: base.grid.slice()
    };
  }
  return result;
}

function spinFree(mode, betMinor, opts){
  opts = opts || {};
  var detail = !!opts.detail;
  var knobs = _mp.getProfile(mode);
  var rng = buildRngForMode(mode, true);
  var MS = window.ApexSugarRushMultiplier.MarkState;
  var marks = new MS({ fromSnapshot: opts.marks || [] });
  var g0 = rng.generateGrid();
  var scatterCount = 0;
  for (var i = 0; i < g0.length; i++){ if (isScatter(g0[i])) scatterCount++; }
  var cur = g0;
  var rawWin = 0;
  var cascades = 0;
  var steps = detail ? [] : null;
  var safety = 0;
  while (safety++ < MAX_CASCADES){
    var ev = _ev.evaluate(cur);
    if (ev.winningPositions.length === 0) break;
    var clusterMult = 0;
    var upgradeInfo = [];
    var seedInfo = [];
    // 原版语义：先用当前乘数结算，再更新位置值
    for (var k = 0; k < ev.wins.length; k++){
      var w = ev.wins[k];
      var markSum = marks.sumInCluster(w.positions);
      clusterMult += w.payoutMultiplier * Math.max(1, markSum);
    }
    // 所有获胜位置统一更新（用于后续回合）
    var allWinningPositions = ev.winningPositions.slice();
    var up = marks.updateAfterWin(allWinningPositions);
    for (var u = 0; u < up.length; u++) upgradeInfo.push(up[u]);
    rawWin += clusterMult;
    cascades++;
    var nextGrid = _tb.tumble(cur, ev.winningPositions, rng);
    if (detail){
      steps.push({
        winningPositions: ev.winningPositions.slice(),
        wins: ev.wins.slice(),
        gridAfter: nextGrid.slice(),
        stepMult: clusterMult,
        upgrades: upgradeInfo.slice(),
        seeds: seedInfo.slice(),
        marksAfter: marks.visual()
      });
    }
    cur = nextGrid;
  }
  var fsRetriggered = _bn.resolveBonusTrigger(scatterCount);
  var retriggerSpins = fsRetriggered ? _bn.resolveRetrigger(scatterCount) : 0;
  var capResult = _cap.applyCap(rawWin, knobs.payScale, knobs.maxWinMultiplier);
  var totalMult = capResult.rawWin * knobs.payScale;
  var winMinor = Math.floor(betMinor * totalMult);
  var result = {
    mode: mode,
    fsOnly: true,
    finalGrid: cur,
    totalMultiplier: totalMult,
    winMinor: winMinor,
    cascades: cascades,
    scatterCount: scatterCount,
    fsTriggered: fsRetriggered,
    fsSpinsAwarded: retriggerSpins,
    marksAfter: marks.snapshot(),
    marksVisual: marks.visual(),
    cappedByMaxWin: capResult.capped,
    rawWinBeforeCap: rawWin
  };
  if (detail){
    result.detail = {
      initialGrid: g0.slice(),
      steps: steps,
      finalGrid: cur.slice(),
      marksFinal: marks.visual()
    };
  }
  return result;
}

window.ApexSugarRushGameEngine = Object.freeze({
  spin: playSpin,
  fsSpin: fsSpin,
  spinBase: spinBase,
  spinFree: spinFree,
  buildRngForMode: buildRngForMode
});
})();
