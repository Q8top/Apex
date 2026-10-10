'use strict';
// Apex P0-1b child evaluator.
// Usage: node tools/_eval-scale.cjs <scale> <seeds> <spins>
// Stdout: JSON {scale,rtps,worst}
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const SR = path.join(ROOT, 'src/games/sugar-rush');
const scale = parseFloat(process.argv[2]);
const seeds = parseInt(process.argv[3] || '3', 10);
const spins = parseInt(process.argv[4] || '8000', 10);
if (!Number.isFinite(scale)) {
  console.error('bad scale'); process.exit(2);
}
global.window = {};
require(path.join(SR, 'config/symbols.locked.js'));
require(path.join(SR, 'config/paytable.locked.js'));
require(path.join(SR, 'config/math-profile.js'));
const mp = global.window.ApexSugarRushMathProfile;
const orig = mp.getProfile;
const patched = Object.freeze({
  getProfile: function(m){
    if (m === 'real'){
      return Object.freeze(Object.assign({}, orig('real'), { payScale: scale }));
    }
    return orig(m);
  }
});
global.window.ApexSugarRushMathProfile = Object.freeze(
  Object.assign({}, mp, patched));
var mods = ['errors','grid','rng','payout','multiplier',
            'evaluator','tumble','bonus','cap','game-engine'];
mods.forEach(function(m){
  require(path.join(SR, 'engine', m + '.js'));
});
const E = global.window.ApexSugarRushGameEngine;
const rtps = [];
for (let k = 0; k < seeds; k++){
  let total = 0;
  for (let i = 0; i < spins; i++){
    total += E.spin('real', 100).winMinor;
  }
  rtps.push(total / (spins * 100));
}
const worst = Math.max.apply(null, rtps);
process.stdout.write(JSON.stringify({ scale: scale, rtps: rtps, worst: worst }));
