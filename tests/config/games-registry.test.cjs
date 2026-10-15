'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/games/registry.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var R = globalThis.window.ApexGamesRegistry;

t('mounted', !!R);
t('outer frozen', Object.isFrozen(R));
t('GAMES frozen array', Array.isArray(R.GAMES) && Object.isFrozen(R.GAMES));
t('getById is fn', typeof R.getById === 'function');
t('validate is fn', typeof R.validate === 'function');
t('12 games', R.GAMES.length === 12, 'got ' + R.GAMES.length);

// id uniqueness + shape
var seen = {}; var dup = [];
var idOk = true, nOk = true, srcOk = true;
R.GAMES.forEach(function(g){
  if (typeof g.id !== 'string' || !/^[a-z0-9-]+$/.test(g.id)) idOk = false;
  if (seen[g.id]) dup.push(g.id); else seen[g.id] = 1;
  if (typeof g.n !== 'string' || !g.n) nOk = false;
  if (typeof g.src !== 'string' || !g.src) srcOk = false;
});
t('all id format ok', idOk);
t('no duplicate id', dup.length === 0, dup.join(','));
t('all have n', nOk);
t('all have src', srcOk);

// live games
var live = R.GAMES.filter(function(g){ return !!g.live; });
t('exactly 0 live', live.length === 0, 'got ' + live.length);
var liveIds = live.map(function(g){ return g.id; }).sort();
t('live id list empty', liveIds.length === 0, liveIds.join(','));

// entry enum + page requires url
var entryBad = [], pageNoUrl = [];
R.GAMES.forEach(function(g){
  if (g.entry != null && g.entry !== 'modal' && g.entry !== 'page') entryBad.push(g.id);
  if (g.entry === 'page' && (typeof g.url !== 'string' || !g.url)) pageNoUrl.push(g.id);
});
t('entry enum clean', entryBad.length === 0, entryBad.join(','));
t('entry=page has url', pageNoUrl.length === 0, pageNoUrl.join(','));

// validate() returns true
var vOk = false;
try { vOk = R.validate(); } catch (e) { vOk = 'threw: ' + e.message; }
t('validate() -> true', vOk === true, String(vOk));

// getById semantics
t('getById(sweet).id=sweet', R.getById('sweet').id === 'sweet');
t('getById(sugar-rush).url undefined', R.getById('sugar-rush').url === undefined);
t('getById(unknown) -> null', R.getById('__never__') === null);
t('getById(null) -> null', R.getById(null) === null);

// source: apex-app calls ApexModePicker for every game card
var app = fs.readFileSync(ROOT + '/src/js/inline/apex-app.js', 'utf8');
t('apex-app calls ApexModePicker', app.indexOf('ApexModePicker') !== -1);
t('apex-app does not hardcode entry=page nav', app.indexOf('location.href = g.url') === -1);

console.log('');
console.log('========== config/games-registry ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
