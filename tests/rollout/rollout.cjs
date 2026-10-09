'use strict';
/* Apex D-4 rollout bucketing test.
 * Invariants:
 *   - deterministic: same (userId, flag) -> same bucket
 *   - distribution: uniform-ish over 0..9999
 *   - fail-safe: missing/invalid percent -> 0%
 *   - monotonic: higher percent -> superset of lower percent
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '../..');

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require('crypto').webcrypto;
}
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;

(async function () {
  var mod = await import(path.join(ROOT, 'functions/_rollout.js'));
  var bucketOf = mod.bucketOf;
  var rolloutCheck = mod.rolloutCheck;
  var parsePercent = mod.parsePercent;
  var envKeyFor = mod.envKeyFor;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
  }

  // ============================================================
  // 1) parsePercent
  // ============================================================
  console.log('\n=== 1) parsePercent ===');
  t('1a undefined -> 0', parsePercent(undefined) === 0);
  t('1b null -> 0', parsePercent(null) === 0);
  t('1c "" -> 0', parsePercent('') === 0);
  t('1d NaN -> 0', parsePercent('not-a-number') === 0);
  t('1e -5 -> 0', parsePercent(-5) === 0);
  t('1f 0 -> 0', parsePercent(0) === 0);
  t('1g 50 -> 50', parsePercent(50) === 50);
  t('1h 100 -> 100', parsePercent(100) === 100);
  t('1i 150 -> 100', parsePercent(150) === 100);
  t('1j "50" -> 50', parsePercent('50') === 50);
  t('1k 33.7 -> 33', parsePercent(33.7) === 33);
  t('1l Infinity -> 0', parsePercent(Infinity) === 0);

  // ============================================================
  // 2) envKeyFor
  // ============================================================
  console.log('\n=== 2) envKeyFor ===');
  t('2a basic', envKeyFor('FEATURE_X') === 'ROLLOUT_FEATURE_X_PERCENT');
  t('2b lowercase normalized', envKeyFor('feature_x') === 'ROLLOUT_FEATURE_X_PERCENT');
  t('2c spaces become underscores', envKeyFor('a b c') === 'ROLLOUT_A_B_C_PERCENT');

  // ============================================================
  // 3) bucketOf determinism
  // ============================================================
  console.log('\n=== 3) bucketOf determinism ===');
  var b1a = await bucketOf(12345, 'FLAG_A');
  var b1b = await bucketOf(12345, 'FLAG_A');
  t('3a same input -> same bucket', b1a === b1b);
  t('3b bucket in [0, 10000)', b1a >= 0 && b1a < 10000, 'got ' + b1a);

  var b2 = await bucketOf(12345, 'FLAG_B');
  t('3c different flag -> different bucket (usually)', b1a !== b2, 'a=' + b1a + ' b=' + b2);

  var b3 = await bucketOf(99999, 'FLAG_A');
  t('3d different user -> different bucket (usually)', b1a !== b3, 'a=' + b1a + ' c=' + b3);

  // ============================================================
  // 4) distribution over 5000 users
  // ============================================================
  console.log('\n=== 4) distribution ===');
  var buckets = [];
  for (var uid = 1; uid <= 5000; uid++) {
    buckets.push(await bucketOf(uid, 'DISTRO'));
  }
  var minB = Math.min.apply(null, buckets);
  var maxB = Math.max.apply(null, buckets);
  t('4a min >= 0', minB >= 0);
  t('4b max < 10000', maxB < 10000);

  // 10 bins of 1000 each: each should be ~10% (allow 5%-15%)
  var bins = new Array(10).fill(0);
  for (var i = 0; i < buckets.length; i++) bins[Math.floor(buckets[i] / 1000)]++;
  var allInRange = bins.every(function (c) { return c > 250 && c < 750; });
  t('4c all 10 bins within 5%-15%', allInRange, 'bins=' + JSON.stringify(bins));

  // distinct count sanity: should be many unique values
  var uniq = {};
  for (var k = 0; k < buckets.length; k++) uniq[buckets[k]] = 1;
  var uniqCount = Object.keys(uniq).length;
  t('4d unique in [3500,4500]', uniqCount >= 3500 && uniqCount <= 4500, 'got ' + uniqCount);

  // ============================================================
  // 5) rolloutCheck: percent edges
  // ============================================================
  console.log('\n=== 5) rolloutCheck edges ===');
  var r0 = await rolloutCheck({}, 12345, 'FLAG_A');
  t('5a missing env -> percent 0', r0.percent === 0);
  t('5b missing env -> inRollout false', r0.inRollout === false);
  t('5c flag normalized', r0.flag === 'FLAG_A');

  var r100 = await rolloutCheck({ ROLLOUT_FLAG_A_PERCENT: '100' }, 12345, 'FLAG_A');
  t('5d 100% -> inRollout true', r100.inRollout === true);

  var r0b = await rolloutCheck({ ROLLOUT_FLAG_A_PERCENT: '0' }, 12345, 'FLAG_A');
  t('5e 0% -> inRollout false', r0b.inRollout === false);

  var rBad = await rolloutCheck({ ROLLOUT_FLAG_A_PERCENT: 'banana' }, 12345, 'FLAG_A');
  t('5f invalid percent -> 0', rBad.percent === 0);
  t('5g invalid percent -> inRollout false', rBad.inRollout === false);

  var rCap = await rolloutCheck({ ROLLOUT_FLAG_A_PERCENT: '999' }, 12345, 'FLAG_A');
  t('5h >100 capped at 100', rCap.percent === 100);
  t('5i >100 -> inRollout true', rCap.inRollout === true);

  // ============================================================
  // 6) monotonicity: 50% is subset of 100%, 25% subset of 50%
  // ============================================================
  console.log('\n=== 6) monotonicity ===');
  var userSet = [];
  for (var u = 1; u <= 1000; u++) userSet.push(u);

  var in25 = [], in50 = [], in100 = [];
  for (var idx = 0; idx < userSet.length; idx++) {
    var uu = userSet[idx];
    var a25 = await rolloutCheck({ ROLLOUT_X_PERCENT: '25' }, uu, 'X');
    var a50 = await rolloutCheck({ ROLLOUT_X_PERCENT: '50' }, uu, 'X');
    var a100 = await rolloutCheck({ ROLLOUT_X_PERCENT: '100' }, uu, 'X');
    if (a25.inRollout) in25.push(uu);
    if (a50.inRollout) in50.push(uu);
    if (a100.inRollout) in100.push(uu);
  }
  t('6a 100% covers all 1000 users', in100.length === 1000, 'got ' + in100.length);

  var subset25of50 = in25.every(function (u) { return in50.indexOf(u) >= 0; });
  t('6b 25% subset of 50%', subset25of50);
  var subset50of100 = in50.every(function (u) { return in100.indexOf(u) >= 0; });
  t('6c 50% subset of 100%', subset50of100);

  // Rough size check: 25% ~ 250 of 1000 (allow 15%-35%)
  t('6d 25% count in [150, 350]', in25.length >= 150 && in25.length <= 350, 'got ' + in25.length);
  t('6e 50% count in [400, 600]', in50.length >= 400 && in50.length <= 600, 'got ' + in50.length);

  // ============================================================
  // 7) Stable across different env values
  // ============================================================
  console.log('\n=== 7) bucket stable across env ===');
  var s1 = await rolloutCheck({ ROLLOUT_Y_PERCENT: '10' }, 42, 'Y');
  var s2 = await rolloutCheck({ ROLLOUT_Y_PERCENT: '90' }, 42, 'Y');
  t('7a bucket stable across percent', s1.bucket === s2.bucket, s1.bucket + ' vs ' + s2.bucket);
  t('7b threshold scales with percent', s2.threshold > s1.threshold);

  // ============================================================
  // 8) bucketOf arg validation
  // ============================================================
  console.log('\n=== 8) bucketOf validation ===');
  var threw = false;
  try { await bucketOf(undefined, 'X'); } catch (e) { threw = true; }
  t('8a undefined userId throws', threw);
  var threw2 = false;
  try { await bucketOf(null, 'X'); } catch (e) { threw2 = true; }
  t('8b null userId throws', threw2);

  // empty salt defaults to 'default'
  var bDefault = await bucketOf(7, '');
  var bExplicit = await bucketOf(7, 'default');
  t('8c empty salt == "default"', bDefault === bExplicit, bDefault + ' vs ' + bExplicit);

  console.log('\n========== rollout ==========');
  console.log('pass: ' + pass + '  fail: ' + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
