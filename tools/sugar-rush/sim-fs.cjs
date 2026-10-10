'use strict';
const base = require('./base.cjs');
const tumble = require('./tumble.cjs');
const profiles = require('./profiles.cjs');
const spec = require('./spec.cjs');

const TOTAL = spec.grid.totalCells;

function rollBombValue(bombDist) {
  const totalW = bombDist.reduce(function(a,b){return a+b.w;}, 0);
  let r = base.randInt(totalW);
  for (const e of bombDist) {
    if (r < e.w) return e.v;
    r -= e.w;
  }
  return bombDist[0].v;
}

function fsSpin(rng, knobs) {
  let grid = base.makeGrid(rng);
  let scatterCount = 0;
  let bombSum = 0;
  for (let i = 0; i < TOTAL; i++) {
    if (grid[i] === spec.symbols.scatter) scatterCount++;
    else if (grid[i] === spec.symbols.multiplier) bombSum += rollBombValue(spec.bombDist);
  }
  let rawWin = 0;
  let cascades = 0;
  let safety = 0;
  while (safety++ < 60) {
    const r = base.evaluate(grid);
    if (r.payoutMultiplier <= 0) break;
    rawWin += r.payoutMultiplier;
    cascades++;
    grid = tumble.refillColumns(tumble.removePositions(grid, r.winningPositions), rng);
  }
  const mult = bombSum > 0 ? bombSum : 1;
  return {
    winMult: rawWin * mult,
    retrigger: scatterCount >= spec.bonus.retriggerScatterCount ? spec.bonus.retriggerSpins : 0,
    cascades: cascades,
    bombSum: bombSum,
  };
}

function playSpin(mode) {
  const knobs = profiles.getKnobs(mode);
  const baseRng = base.makeRng(mode);
  const fsRng = base.makeRng(mode, { fsMode: true });

  const g0 = base.makeGrid(baseRng);
  let scatterCount0 = 0;
  for (let i = 0; i < TOTAL; i++) if (g0[i] === spec.symbols.scatter) scatterCount0++;

  const br = tumble.tumble(g0, baseRng);
  let totalWin = br.totalMult;
  let cascades = br.cascades;
  let fsTriggered = false;
  let fsSpins = 0;
  let fsWin = 0;

  // pity：未中奖时按概率强制给一次保底赢
  if (totalWin === 0 && knobs.pityRate > 0) {
    const roll = base.randInt(10000) / 10000;
    if (roll < knobs.pityRate) {
      totalWin = knobs.pityMin + (base.randInt(knobs.pityRange) / 100);
      cascades += 1;
    }
  }

  if (scatterCount0 >= spec.bonus.triggerScatterCount) {
    fsTriggered = true;
    let spins = spec.bonus.initialSpins[scatterCount0] || spec.bonus.initialSpins[6];
    totalWin += spec.bonus.scatterPayout[scatterCount0] || 0;
    let played = 0;
    while (played < spins && played < 500) {
      played++;
      const r = fsSpin(fsRng, knobs);
      fsWin += r.winMult;
      cascades += r.cascades;
      spins += r.retrigger;
    }
    fsSpins = played;
    totalWin += fsWin;
  }

  return {
    finalWin: totalWin * knobs.payScale,
    baseWin: br.totalMult,
    fsWin: fsWin,
    fsTriggered: fsTriggered,
    fsSpins: fsSpins,
    cascades: cascades,
    scatterCount0: scatterCount0,
  };
}

function runSim(mode, n) {
  const knobs = profiles.getKnobs(mode);
  let totalWin = 0, hits = 0, fsCount = 0, fsWinSum = 0, maxWin = 0, cascSum = 0, spinSum = 0;
  for (let i = 0; i < n; i++) {
    const r = playSpin(mode);
    totalWin += r.finalWin;
    if (r.finalWin > 0) hits++;
    if (r.fsTriggered) { fsCount++; fsWinSum += r.fsWin; spinSum += r.fsSpins; }
    if (r.finalWin > maxWin) maxWin = r.finalWin;
    cascSum += r.cascades;
  }
  return {
    mode: mode, n: n,
    rtp: totalWin / n,
    hitRate: hits / n,
    fsRate: fsCount / n,
    avgFsWin: fsCount > 0 ? fsWinSum / fsCount : 0,
    avgFsSpins: fsCount > 0 ? spinSum / fsCount : 0,
    maxWin: maxWin,
    avgCascades: cascSum / n,
  };
}

const N = parseInt(process.argv[2] || '50000', 10);
console.log('[SIM-FS] n=' + N + ' (base + tumble + FS + bombs)');
console.log('');
for (const mode of ['real', 'demo']) {
  const r = runSim(mode, N);
  console.log('--- ' + r.mode + ' ---');
  console.log('  rtp          = ' + r.rtp.toFixed(4) + '  (' + (r.rtp*100).toFixed(2) + '%)');
  console.log('  hitRate      = ' + (r.hitRate*100).toFixed(2) + '%');
  console.log('  fsRate       = ' + (r.fsRate*100).toFixed(3) + '%  (1 per ' + (r.fsRate > 0 ? Math.round(1/r.fsRate) : 'inf') + ' spins)');
  console.log('  avgFsWin     = ' + r.avgFsWin.toFixed(2));
  console.log('  avgFsSpins   = ' + r.avgFsSpins.toFixed(1));
  console.log('  maxWin       = ' + r.maxWin.toFixed(2));
  console.log('  avgCascades  = ' + r.avgCascades.toFixed(3));
  const chk = profiles.checkSimResult(r.mode, { rtp: r.rtp, hitRate: r.hitRate });
  console.log('  gate         = ' + (chk.ok ? 'PASS' : 'FAIL: ' + chk.reasons.join('; ')));
  console.log('');
}
