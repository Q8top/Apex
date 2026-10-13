'use strict';
/* P1-M4: maxTumbleSteps must be uniform across client/server/sim. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
function r(p){ return fs.readFileSync(ROOT + '/' + p, 'utf8'); }

const demo    = r('src/provider/demo-adapter.js');
const spin    = r('functions/api/game/spin.js');
const sim     = r('tests/math/simulator-v2.cjs');
const cliEng  = r('src/engine/game-engine.js');
const srvEng  = r('functions/_engine/game-engine.js');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== maxTumbleSteps uniformity ===');
t('demo-adapter uses 100', /maxTumbleSteps:\s*100/.test(demo));
t('demo-adapter no longer uses 20', !/maxTumbleSteps:\s*20\b/.test(demo));
t('spin.js uses 100', /maxTumbleSteps:\s*100/.test(spin));
t('simulator-v2 uses 100', /maxTumbleSteps:\s*100/.test(sim));
t('client engine default 100', /maxTumbleSteps\s*==\s*null\s*\?\s*100/.test(cliEng));
t('server engine default 100', /maxTumbleSteps\s*==\s*null\s*\?\s*100/.test(srvEng));

console.log('');
console.log('[m4-tumble-steps] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
