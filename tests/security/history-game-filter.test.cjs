'use strict';
/* 2.B.4 B4-6-1: history must not label sweet rows as another game. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(ROOT + '/functions/api/game/history.js', 'utf8');
let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== history game filter ===');
t('rejects unknown game', /game !== 'sweet' && game !== 'sugar-rush'/.test(src));
t('non-sweet returns notSupported', /notSupported: true/.test(src));
t('notSupported BEFORE DB query', src.indexOf('notSupported') < src.indexOf('FROM spins'));
t('items is empty array in branch', /items: \[\]/.test(src));
t('comment references stage4 SR todo', /APEX-stage4-sr/.test(src));

console.log('');
console.log('[b4-6-1] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
