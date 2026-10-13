'use strict';
/* P0-SEC-1: spin response DTO whitelist contract.
   Static source inspection of functions/api/game/spin.js.
   Fails if new internal fields are exposed via pickSpinResult. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const P = path.join(ROOT, 'functions/api/game/spin.js');
const src = fs.readFileSync(P, 'utf8');

let passed = 0, failed = 0;
function t(name, cond){
  if (cond){ console.log('  ok   ' + name); passed++; }
  else { console.log('  FAIL ' + name); failed++; }
}

console.log('=== spin DTO contract ===');

t('pickSpinResult defined',
  /function\s+pickSpinResult\s*\(/.test(src));
t('body uses pickSpinResult',
  /result:\s*pickSpinResult\(spinResult\)/.test(src));
t('raw result: spinResult removed',
  !/result:\s*spinResult\s*,/.test(src));

const m = src.match(/function\s+pickSpinResult[\s\S]*?\n\}/);
const body = m ? m[0] : '';
t('pickSpinResult body found', body.length > 0);

// must-have whitelist fields
for (const f of ['spinId','mode','betMinor','grid','cascades',
                 'bonus','totalMultiplier','totalWinMinor','cappedByMaxWin']) {
  t('whitelist keeps ' + f, new RegExp('\\b' + f + ':').test(body));
}

// must-NOT-have internal fields
for (const f of ['payScale','rawMultiplier','diagnostics',
                 'bombSum','bombFactor','bombPositions']) {
  t('whitelist excludes ' + f, !new RegExp('\\b' + f + ':').test(body));
}

console.log('');
console.log('[spin-dto] passed=' + passed + ' failed=' + failed);
process.exit(failed === 0 ? 0 : 1);
