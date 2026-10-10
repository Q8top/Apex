'use strict';
const base = require('./base.cjs');
const tumble = require('./tumble.cjs');
const profiles = require('./profiles.cjs');
const spec = require('./spec.cjs');

function runSim(mode, n) {
  const knobs = profiles.getKnobs(mode);
  const rng = base.makeRng(mode);
  let hits = 0, rawMult = 0, maxRaw = 0, cascSum = 0;
  for (let i = 0; i < n; i++) {
    const g = base.makeGrid(rng);
    const r = tumble.tumble(g, rng);
    if (r.totalMult > 0) {
      hits++;
      rawMult += r.totalMult;
      if (r.totalMult > maxRaw) maxRaw = r.totalMult;
      cascSum += r.cascades;
    }
  }
  const rawRtp = rawMult / n;
  const rtp = rawRtp * knobs.payScale;
  const hitRate = hits / n;
  return {
    mode, n,
    rawRtp: rawRtp,
    payScale: knobs.payScale,
    rtp: rtp,
    hitRate: hitRate,
    maxRaw: maxRaw,
    avgCascades: cascSum / Math.max(hits, 1),
  };
}

const N = parseInt(process.argv[2] || '50000', 10);
console.log('[SIM] n=' + N + ' mode=base+tumble only (no FS)');
console.log('');

for (const mode of ['real', 'demo']) {
  const r = runSim(mode, N);
  console.log('--- ' + r.mode + ' ---');
  console.log('  rawRtp        = ' + r.rawRtp.toFixed(4));
  console.log('  payScale      = ' + r.payScale.toFixed(2));
  console.log('  rtp (raw*pay) = ' + r.rtp.toFixed(4) + '  (' + (r.rtp*100).toFixed(2) + '%)');
  console.log('  hitRate       = ' + (r.hitRate*100).toFixed(2) + '%');
  console.log('  maxRawMult    = ' + r.maxRaw.toFixed(2));
  console.log('  avgCascades   = ' + r.avgCascades.toFixed(3));
  const chk = profiles.checkSimResult(mode, { rtp: r.rtp, hitRate: r.hitRate });
  console.log('  gate          = ' + (chk.ok ? 'PASS' : 'FAIL: ' + chk.reasons.join('; ')));
  console.log('');
}
