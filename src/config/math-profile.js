(function(){
'use strict';
/* Apex · 数学参数真值来源（版本化只读）
 * 挂载：window.ApexMathProfile
 *
 * 权重 key 格式：大写（BANANA / BLUE_CANDY / ...）—— 沿用现有 sweet-symbols.js
 * 权重值：正整数（新引擎 Rng 只接受 safe integer）
 * RTP 目标：real 88~93% / demo 130~250%
 */

var VERSION = '1.0.0';

var PROFILES = Object.freeze({
  real: Object.freeze({
    baseWeights: Object.freeze({
      BANANA: 14, GRAPE: 14, WATERMELON: 13, PLUM: 13, APPLE: 12,
      BLUE_CANDY: 6, GREEN_CANDY: 6, PURPLE_CANDY: 5, RED_HEART: 5
    }),
    scatterWeight: 1,
    multiplierWeight: 0,
    fsMultiplierWeight: 1,
    payScale: 2.48,
    maxWinMultiplier: 5000,
    pityRate: 0.0,
    pitySymbol: null,
    pityMinCount: 8,
    targetRtp: Object.freeze({ min: 0.88, max: 0.93, target: 0.9049 }),
    targetHitRate: Object.freeze({ min: 0.20, max: 0.35 })
  }),
  demo: Object.freeze({
    baseWeights: Object.freeze({
      BANANA: 14, GRAPE: 14, WATERMELON: 13, PLUM: 13, APPLE: 12,
      BLUE_CANDY: 6, GREEN_CANDY: 6, PURPLE_CANDY: 5, RED_HEART: 5
    }),
    scatterWeight: 3,
    multiplierWeight: 0,
    fsMultiplierWeight: 2,
    payScale: 3.60,
    maxWinMultiplier: 25000,
    pityRate: 0.35,
    pitySymbol: 'BANANA',
    pityMinCount: 8,
    targetRtp: Object.freeze({ min: 1.30, max: 2.50, target: 1.7842 }),
    targetHitRate: Object.freeze({ min: 0.45, max: 0.60 })
  })
});

function getProfile(mode){
  if (!Object.prototype.hasOwnProperty.call(PROFILES, mode)){
    throw new Error('MATH_PROFILE: unknown mode ' + mode);
  }
  return PROFILES[mode];
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
    var id = ID_MAP[k] || k.toLowerCase();
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
  var modes = Object.keys(PROFILES);
  for (var i = 0; i < modes.length; i++){
    var m = modes[i];
    var p = PROFILES[m];
    var keys = Object.keys(p.baseWeights);
    if (keys.length !== 9) throw new Error('MATH_PROFILE: ' + m + ' 需要 9 个 regular 符号');
    var total = 0;
    for (var j = 0; j < keys.length; j++){
      var w = p.baseWeights[keys[j]];
      if (!Number.isSafeInteger(w) || w <= 0){
        throw new Error('MATH_PROFILE: ' + m + '.' + keys[j] + ' 权重必须正整数');
      }
      total += w;
    }
    if (total <= 0) throw new Error('MATH_PROFILE: ' + m + ' 总权重为 0');
    if (!Number.isSafeInteger(p.scatterWeight) || p.scatterWeight < 0){
      throw new Error('MATH_PROFILE: ' + m + '.scatterWeight 必须非负整数');
    }
    if (!Number.isSafeInteger(p.multiplierWeight) || p.multiplierWeight < 0){
      throw new Error('MATH_PROFILE: ' + m + '.multiplierWeight 必须非负整数');
    }
    if (p.fsMultiplierWeight != null && (!Number.isSafeInteger(p.fsMultiplierWeight) || p.fsMultiplierWeight < 0)){
      throw new Error('MATH_PROFILE: ' + m + '.fsMultiplierWeight invalid');
    }
    if (!p.targetRtp || p.targetRtp.min >= p.targetRtp.max){
      throw new Error('MATH_PROFILE: ' + m + '.targetRtp 区间非法');
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
