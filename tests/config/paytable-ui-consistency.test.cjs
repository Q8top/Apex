'use strict';
/* P1-M6: UI rules panel vs engine authoritative paytable. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const rules  = fs.readFileSync(ROOT + '/src/js/ui/sweet-rules.js', 'utf8');
const locked = fs.readFileSync(ROOT + '/src/config/paytable.locked.js', 'utf8');
const bonus  = fs.readFileSync(ROOT + '/src/engine/bonus.js', 'utf8');
const srcdemo= fs.readFileSync(ROOT + '/src/js/inline/sweet-demo.js', 'utf8');

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok    ' + n); pass++; } else { fail++; console.log('  FAIL  ' + n); } }
// All previous xfail() defects landed in Stage 6 batch A.

console.log('=== UI rules panel vs engine authority ===');

// Positive assertions (already correct, guard against regression)
t('engine locked declares MIN_MATCH 5', /var MIN_MATCH = 5;/.test(locked));
t('UI bomb tiers mention 2/3/5/8/10/15/20/25/50/100',
  /2\u00d7 ?\/ ?3\u00d7 ?\/ ?5\u00d7 ?\/ ?8\u00d7 ?\/ ?10\u00d7 ?\/ ?15\u00d7 ?\/ ?20\u00d7 ?\/ ?25\u00d7 ?\/ ?50\u00d7 ?\/ ?100\u00d7/.test(rules));
t('engine BOMB_VALUE_DIST has 2..100',
  /v: 2,/.test(bonus) && /v: 100,/.test(bonus));
t('UI bet tiers match BET_OPTIONS',
  /0\.20 ?\/ ?0\.50 ?\/ ?1 ?\/ ?2 ?\/ ?5 ?\/ ?10 ?\/ ?20 ?\/ ?50 ?\/ ?100/.test(rules));
t('BET_OPTIONS defined in sweet-demo',
  /BET_OPTIONS = Object\.freeze\(\[0\.2, ?0\.5, ?1, ?2, ?5, ?10, ?20, ?50, ?100\]\)/.test(srcdemo));
t('rule text now says 5 or more',
  /\u51fa\u73b0 5 \u4e2a\u53ca\u4ee5\u4e0a/.test(rules));

console.log('');
t('UI reads ApexPaytableLocked (not old ApexPaytable)',
  /window\.ApexPaytableLocked/.test(rules));
t('UI no longer reads old ApexPaytable.PAYTABLE',
  !/window\.ApexPaytable\s*&&\s*window\.ApexPaytable\.PAYTABLE/.test(rules));
t('UI header has all 6 tiers 5/6/8/10/12/15',
  /<th>5<\/th>/.test(rules) && /<th>6<\/th>/.test(rules) && /<th>8<\/th>/.test(rules)
  && /<th>10<\/th>/.test(rules) && /<th>12<\/th>/.test(rules) && /<th>15<\/th>/.test(rules));
t('UI no longer claims 8~9 / 10~11 / 12+',
  !/8~9 ?\u540c\u6863/.test(rules));
t('UI renders all 6 tier cells',
  /t\[5\]/.test(rules) && /t\[6\]/.test(rules) && /t\[8\]/.test(rules)
  && /t\[10\]/.test(rules) && /t\[12\]/.test(rules) && /t\[15\]/.test(rules));

console.log('');
console.log('[m6-ui-consistency] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
