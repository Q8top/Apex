'use strict';
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../..');
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
require(ROOT + '/src/config/math-profile.js');
var pass = 0, fail = 0;
function t(n, c, e) {
  if (c) { pass++; console.log('  ok   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (e ? ' :: ' + e : '')); }
}
var MP = globalThis.window.ApexMathProfile;

// --- mount / freeze ---
t('mounted', !!MP);
t('outer frozen', Object.isFrozen(MP));
t('PROFILES frozen', Object.isFrozen(MP.PROFILES));
t('demo frozen', Object.isFrozen(MP.PROFILES.demo));
t('baseWeights frozen', Object.isFrozen(MP.PROFILES.demo.baseWeights));
t('ID_MAP frozen', Object.isFrozen(MP.ID_MAP));

// --- PROFILES contains ONLY demo (no real leak) ---
var modes = Object.keys(MP.PROFILES);
t('only demo mode present', modes.length === 1 && modes[0] === 'demo', 'got ' + modes.join(','));

// --- ID_MAP coverage ---
var baseKeys = Object.keys(MP.PROFILES.demo.baseWeights);
t('9 baseWeights keys', baseKeys.length === 9, 'got ' + baseKeys.length);
var needIds = baseKeys.concat(['LOLLIPOP', 'MULTIPLIER_BOMB']);
var mapMiss = [];
needIds.forEach(function(k){ if (!MP.ID_MAP[k]) mapMiss.push(k); });
t('ID_MAP covers all 11', mapMiss.length === 0, 'missing ' + mapMiss.join(','));

// --- ID_MAP has no extras ---
var mapKeys = Object.keys(MP.ID_MAP);
t('ID_MAP has exactly 11', mapKeys.length === 11, 'got ' + mapKeys.length);

// --- ID_MAP values unique ---
var vals = mapKeys.map(function(k){ return MP.ID_MAP[k]; });
var uniq = {}; var dup = [];
vals.forEach(function(v){ if (uniq[v]) dup.push(v); uniq[v] = 1; });
t('ID_MAP values unique', dup.length === 0, 'dups ' + dup.join(','));

// --- ID_MAP values match symbols.locked ids ---
require(ROOT + '/src/config/symbols.locked.js');
var SL = globalThis.window.ApexSymbolsLocked;
var symIds = SL.list();
var mapToSym = [];
Object.keys(MP.ID_MAP).forEach(function(k){
  var v = MP.ID_MAP[k];
  if (symIds.indexOf(v) === -1) mapToSym.push(k + '->' + v);
});
t('all ID_MAP values exist in symbols.locked', mapToSym.length === 0, mapToSym.join(','));

// --- getProfile guard ---
t('getProfile(demo) ok', !!MP.getProfile('demo'));
var g1threw = false; try { MP.getProfile('real'); } catch (e) { g1threw = true; }
t('getProfile(real) throws', g1threw);
var g2threw = false; try { MP.getProfile(''); } catch (e) { g2threw = true; }
t('getProfile(empty) throws', g2threw);
var g3threw = false; try { MP.getProfile(null); } catch (e) { g3threw = true; }
t('getProfile(null) throws', g3threw);

// --- buildRngWeights ---
var w = MP.buildRngWeights('demo', {});
t('buildRngWeights returns object', w && typeof w === 'object');
t('returns 10 keys (9+scatter)', Object.keys(w).length === 10, 'got ' + Object.keys(w).length);
var w2 = MP.buildRngWeights('demo', { fsMode: true });
t('fsMode adds multiplier_bomb', typeof w2.multiplier_bomb === 'number' && w2.multiplier_bomb > 0);
var w3 = MP.buildRngWeights('demo', { fsMode: false });
t('non-fs has no multiplier_bomb (weight=0)', w3.multiplier_bomb === undefined);
// every value integer > 0
var allPos = true;
Object.keys(w).forEach(function(k){ if (!Number.isSafeInteger(w[k]) || w[k] <= 0) allPos = false; });
t('all weights safe positive ints', allPos);

// --- validate() ---
var vOk = false;
try { vOk = MP.validate(); } catch (e) { vOk = 'threw: ' + e.message; }
t('validate() -> true', vOk === true, String(vOk));

// --- totalWeight ---
var tw = MP.totalWeight('demo');
t('totalWeight positive int', Number.isSafeInteger(tw) && tw > 0, 'got ' + tw);

// --- checkSimResult boundaries (no numbers printed) ---
var p = MP.getProfile('demo');
var below = MP.checkSimResult('demo', { rtp: p.targetRtp.min - 0.01, hitRate: (p.targetHitRate.min + p.targetHitRate.max) / 2 });
t('checkSimResult: below-min rejected', below.ok === false && below.reasons.length > 0);
var above = MP.checkSimResult('demo', { rtp: p.targetRtp.max + 0.01, hitRate: (p.targetHitRate.min + p.targetHitRate.max) / 2 });
t('checkSimResult: above-max rejected', above.ok === false);
var within = MP.checkSimResult('demo', { rtp: p.targetRtp.target, hitRate: (p.targetHitRate.min + p.targetHitRate.max) / 2 });
t('checkSimResult: on-target accepted', within.ok === true);
var hrLow = MP.checkSimResult('demo', { rtp: p.targetRtp.target, hitRate: p.targetHitRate.min - 0.01 });
t('checkSimResult: low hitRate rejected', hrLow.ok === false);

// --- client file must not contain 'real' profile data ---
var src = fs.readFileSync(ROOT + '/src/config/math-profile.js', 'utf8');
t('client file: no real: entry', !/real\s*:\s*Object\.freeze/.test(src));
t('client file: getProfile guard present', src.indexOf('real profile is server-only') !== -1 || src.indexOf('real 参数不可在客户端读取') !== -1);

console.log('');
console.log('========== config/math-profile ==========');
console.log('pass: ' + pass + '  fail: ' + fail);
process.exit(fail === 0 ? 0 : 1);
