(function(){
'use strict';
/* Apex · 数学参数真值来源（版本化只读）
 * 挂载：window.ApexMathProfile
 *
 * 权重 key 格式：大写（BANANA / BLUE_CANDY / ...）—— 沿用现有 sweet-symbols.js
 * 权重值：正整数（新引擎 Rng 只接受 safe integer）
 * RTP / 命中率目标：demo 档见下方 targetRtp / targetHitRate；
 * real 档参数物理隔离在 functions/_config/，客户端不可读。
 */

var VERSION = '1.0.0';

var PROFILES = Object.freeze({
  demo: Object.freeze({
    baseWeights: Object.freeze({
      BANANA: 14, GRAPE: 14, WATERMELON: 13, PLUM: 13, APPLE: 12,
      BLUE_CANDY: 6, GREEN_CANDY: 6, PURPLE_CANDY: 5, RED_HEART: 5
    }),
    scatterWeight: 4,
    multiplierWeight: 0,
    fsMultiplierWeight: 2,
    payScale: 1.555347,
    maxWinMultiplier: 25000,
    pityRate: 0.77,
    pitySymbol: 'BANANA',
    pityMinCount: 8,
    targetRtp: Object.freeze({ min: 1.30, max: 2.50, target: 1.7842 }),
    targetHitRate: Object.freeze({ min: 0.45, max: 0.60 })
  })
});

function getProfile(mode){
  // S1.6: real 档物理隔离在 functions/_config/，客户端禁止读取
  if (mode !== 'demo'){
    throw new Error('MATH_PROFILE: real profile is server-only');
  }
  return PROFILES.demo;
}

/* 给新引擎 Rng 用：合并 baseWeights + scatter + multiplier
 * key 统一转为新引擎 id（小写）
 */
var ID_MAP = Object.freeze({
  BANANA: 'banana',
  GRAPE: 'grape',
  WATERMELON: 'watermelon',
  PLUM: 'plum',
  APPLE: 'apple',
  BLUE_CANDY: 'blue_candy',
  GREEN_CANDY: 'green_candy',
  PURPLE_CANDY: 'purple_candy',
  RED_HEART: 'red_heart_candy',
  LOLLIPOP: 'lollipop',
  MULTIPLIER_BOMB: 'multiplier_bomb'
});

function buildRngWeights(mode, opts){
  opts = opts || {};
  var p = getProfile(mode);
  var out = {};
  var keys = Object.keys(p.baseWeights);
  for (var i = 0; i < keys.length; i++){
    var k = keys[i];
    var id = ID_MAP[k];
    if (!id) throw new Error('MATH_PROFILE: no ID_MAP entry for ' + k);
    out[id] = p.baseWeights[k];
  }
  if (p.scatterWeight > 0){
    out.lollipop = p.scatterWeight;
  }
  var mw = opts.fsMode ? (p.fsMultiplierWeight || 0) : (p.multiplierWeight || 0);
  if (mw > 0){
    out.multiplier_bomb = mw;
  }
  return out;
}

function validate(){
  // ID_MAP must cover baseWeights + scatter + multiplier exactly.
  var baseKeys = Object.keys(PROFILES.demo.baseWeights);
  var needIds = baseKeys.concat(['LOLLIPOP', 'MULTIPLIER_BOMB']);
  for (var n = 0; n < needIds.length; n++){
    if (!ID_MAP[needIds[n]]){
      throw new Error('MATH_PROFILE: ID_MAP missing ' + needIds[n]);
    }
  }
  var modes = Object.keys(PROFILES);
  for (var i = 0; i < modes.length; i++){
    var m = modes[i];
    var p = PROFILES[m];
    var keys = Object.keys(p.baseWeights);
    if (keys.length !== 9) throw new Error('MATH_PROFILE: ' + m + ' requires exactly 9 regular symbols');
    var total = 0;
    for (var j = 0; j < keys.length; j++){
      var w = p.baseWeights[keys[j]];
      if (!Number.isSafeInteger(w) || w <= 0){
        throw new Error('MATH_PROFILE: ' + m + '.' + keys[j] + ' weight must be positive integer');
      }
      total += w;
    }
    if (total <= 0) throw new Error('MATH_PROFILE: ' + m + ' total weight is 0');
    if (!Number.isSafeInteger(p.scatterWeight) || p.scatterWeight < 0){
      throw new Error('MATH_PROFILE: ' + m + '.scatterWeight must be non-negative integer');
    }
    if (!Number.isSafeInteger(p.multiplierWeight) || p.multiplierWeight < 0){
      throw new Error('MATH_PROFILE: ' + m + '.multiplierWeight must be non-negative integer');
    }
    // Upper bounds to prevent RNG saturation from accidental large weights.
    var W_MAX = 10000;
    if (p.scatterWeight > W_MAX) throw new Error('MATH_PROFILE: ' + m + '.scatterWeight > ' + W_MAX);
    if (p.multiplierWeight > W_MAX) throw new Error('MATH_PROFILE: ' + m + '.multiplierWeight > ' + W_MAX);
    if (p.fsMultiplierWeight != null && p.fsMultiplierWeight > W_MAX){
      throw new Error('MATH_PROFILE: ' + m + '.fsMultiplierWeight > ' + W_MAX);
    }
    if (!Number.isFinite(p.payScale) || p.payScale <= 0 || p.payScale > 10){
      throw new Error('MATH_PROFILE: ' + m + '.payScale out of range (0,10]');
    }
    if (!Number.isSafeInteger(p.maxWinMultiplier) || p.maxWinMultiplier <= 0){
      throw new Error('MATH_PROFILE: ' + m + '.maxWinMultiplier must be positive integer');
    }
    if (p.fsMultiplierWeight != null && (!Number.isSafeInteger(p.fsMultiplierWeight) || p.fsMultiplierWeight < 0)){
      throw new Error('MATH_PROFILE: ' + m + '.fsMultiplierWeight invalid');
    }
    if (!p.targetRtp || p.targetRtp.min >= p.targetRtp.max){
      throw new Error('MATH_PROFILE: ' + m + '.targetRtp range invalid');
    }
  }
  return true;
}

function totalWeight(mode){
  var p = getProfile(mode);
  var keys = Object.keys(p.baseWeights);
  var t = 0;
  for (var i = 0; i < keys.length; i++) t += p.baseWeights[keys[i]];
  return t + p.scatterWeight + p.multiplierWeight;
}

/* 校验模拟结果是否在 RTP / HitRate 目标内 */
function checkSimResult(mode, result){
  var p = getProfile(mode);
  var ok = true;
  var reasons = [];
  if (result.rtp < p.targetRtp.min){
    ok = false;
    reasons.push('RTP ' + result.rtp.toFixed(4) + ' < min ' + p.targetRtp.min);
  }
  if (result.rtp > p.targetRtp.max){
    ok = false;
    reasons.push('RTP ' + result.rtp.toFixed(4) + ' > max ' + p.targetRtp.max);
  }
  if (p.targetHitRate){
    if (result.hitRate < p.targetHitRate.min){
      ok = false;
      reasons.push('HitRate ' + result.hitRate.toFixed(4) + ' < min ' + p.targetHitRate.min);
    }
    if (result.hitRate > p.targetHitRate.max){
      ok = false;
      reasons.push('HitRate ' + result.hitRate.toFixed(4) + ' > max ' + p.targetHitRate.max);
    }
  }
  return { ok: ok, reasons: reasons };
}

window.ApexMathProfile = Object.freeze({
  VERSION: VERSION,
  PROFILES: PROFILES,
  ID_MAP: ID_MAP,
  getProfile: getProfile,
  buildRngWeights: buildRngWeights,
  validate: validate,
  totalWeight: totalWeight,
  checkSimResult: checkSimResult
});
})();
