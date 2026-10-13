'use strict';
/* P1-M5: client gridOverride must be Node/local only. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const eng = fs.readFileSync(ROOT + '/src/engine/game-engine.js', 'utf8');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { fail++; console.log('  FAIL ' + n); } }

console.log('=== gridOverride allowlist ===');
// positive: Node + localhost allowed
t('allows Node (typeof location undefined)',
  /ALLOW_GRID_OVERRIDE = \(typeof location === 'undefined'\)/.test(eng));
t('allows localhost', /location\.hostname === 'localhost'/.test(eng));
t('allows 127.0.0.1', /location\.hostname === '127\.0\.0\.1'/.test(eng));
// negative: pages.dev and ?__test=1 removed from gridOverride gate
const block = eng.match(/var ALLOW_GRID_OVERRIDE[\s\S]*?;/);
const body = block ? block[0] : '';
t('does NOT mention pages.dev in gridOverride allowlist',
  body.indexOf('pages.dev') === -1);
t('does NOT mention __test=1 in gridOverride allowlist',
  body.indexOf('__test=1') === -1);

console.log('');
console.log('[m5-gridoverride] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
