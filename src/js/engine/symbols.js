/* Apex · Candy Tumble · Symbol Definitions (v2)
 *
 * 新增模块：与现有 math/paytable.js 完全独立。
 * 现有数学仍走 src/js/inline/sweet-symbols.js 的 BASE_SYMBOL_KEYS。
 *
 * 本文件只定义符号元数据，不做：
 *   - RTP 计算
 *   - 赔付计算
 *   - RNG
 *   - 余额变更
 *
 * 架构位置：
 *   symbols.js → grid.js → evaluator.js → paytable.js → payout.js
 */
(function () {
  'use strict';

  /* =========================================================
   * SYMBOL IDS
   * ======================================================= */
  var SYMBOL_ID = Object.freeze({
    // High / Premium
    CRYSTAL_HEART: 'crystal_heart',
    GOLDEN_CROWN:  'golden_crown',
    RAINBOW_RING:  'rainbow_ring',
    STAR_GEM:      'star_gem',
    // Low / Regular
    BLUEBERRY:     'blueberry',
    GRAPE:         'grape',
    WATERMELON:    'watermelon',
    LEMON_DROP:    'lemon_drop',
    // Feature
    SCATTER:       'scatter',
    MULTIPLIER:    'multiplier'
  });

  /* =========================================================
   * KIND / TIER / CATEGORY
   * ======================================================= */
  var SYMBOL_KIND = Object.freeze({
    REGULAR:    'regular',
    SCATTER:    'scatter',
    MULTIPLIER: 'multiplier'
  });

  var SYMBOL_TIER = Object.freeze({
    LOW:     'low',
    HIGH:    'high',
    FEATURE: 'feature'
  });

  var SYMBOL_CATEGORY = Object.freeze({
    FRUIT:   'fruit',
    CANDY:   'candy',
    GEM:     'gem',
    FEATURE: 'feature'
  });

  /* =========================================================
   * SYMBOL DEFINITIONS
   *
   * 注：weight 是基础池权重，但不代表 RTP 已完成校准。
   *     最终 RTP 必须由 Monte Carlo 验证。
   * ======================================================= */
  var SYMBOL_DEFINITIONS = {};

  // ─── CRYSTAL_HEART ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.CRYSTAL_HEART] = {
    id: SYMBOL_ID.CRYSTAL_HEART,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.HIGH,
    category: SYMBOL_CATEGORY.GEM,
    labelKey: 'symbols.crystalHeart',
    shortLabelKey: 'symbols.crystalHeartShort',
    assetKey: 'symbol-crystal-heart',
    animationKey: 'symbol-crystal-heart',
    soundKey: 'symbol-crystal-heart',
    weight: 5,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 40,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.crystalHeart'
  };

  // ─── GOLDEN_CROWN ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.GOLDEN_CROWN] = {
    id: SYMBOL_ID.GOLDEN_CROWN,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.HIGH,
    category: SYMBOL_CATEGORY.CANDY,
    labelKey: 'symbols.goldenCrown',
    shortLabelKey: 'symbols.goldenCrownShort',
    assetKey: 'symbol-golden-crown',
    animationKey: 'symbol-golden-crown',
    soundKey: 'symbol-golden-crown',
    weight: 6,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 39,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.goldenCrown'
  };

  // ─── RAINBOW_RING ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.RAINBOW_RING] = {
    id: SYMBOL_ID.RAINBOW_RING,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.HIGH,
    category: SYMBOL_CATEGORY.CANDY,
    labelKey: 'symbols.rainbowRing',
    shortLabelKey: 'symbols.rainbowRingShort',
    assetKey: 'symbol-rainbow-ring',
    animationKey: 'symbol-rainbow-ring',
    soundKey: 'symbol-rainbow-ring',
    weight: 7,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 38,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.rainbowRing'
  };

  // ─── STAR_GEM ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.STAR_GEM] = {
    id: SYMBOL_ID.STAR_GEM,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.HIGH,
    category: SYMBOL_CATEGORY.GEM,
    labelKey: 'symbols.starGem',
    shortLabelKey: 'symbols.starGemShort',
    assetKey: 'symbol-star-gem',
    animationKey: 'symbol-star-gem',
    soundKey: 'symbol-star-gem',
    weight: 8,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 37,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.starGem'
  };

  // ─── BLUEBERRY ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.BLUEBERRY] = {
    id: SYMBOL_ID.BLUEBERRY,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.LOW,
    category: SYMBOL_CATEGORY.FRUIT,
    labelKey: 'symbols.blueberry',
    shortLabelKey: 'symbols.blueberryShort',
    assetKey: 'symbol-blueberry',
    animationKey: 'symbol-blueberry',
    soundKey: 'symbol-blueberry',
    weight: 15,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 30,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.blueberry'
  };

  // ─── GRAPE ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.GRAPE] = {
    id: SYMBOL_ID.GRAPE,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.LOW,
    category: SYMBOL_CATEGORY.FRUIT,
    labelKey: 'symbols.grape',
    shortLabelKey: 'symbols.grapeShort',
    assetKey: 'symbol-grape',
    animationKey: 'symbol-grape',
    soundKey: 'symbol-grape',
    weight: 17,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 29,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.grape'
  };

  // ─── WATERMELON ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.WATERMELON] = {
    id: SYMBOL_ID.WATERMELON,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.LOW,
    category: SYMBOL_CATEGORY.FRUIT,
    labelKey: 'symbols.watermelon',
    shortLabelKey: 'symbols.watermelonShort',
    assetKey: 'symbol-watermelon',
    animationKey: 'symbol-watermelon',
    soundKey: 'symbol-watermelon',
    weight: 19,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 28,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.watermelon'
  };

  // ─── LEMON_DROP ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.LEMON_DROP] = {
    id: SYMBOL_ID.LEMON_DROP,
    kind: SYMBOL_KIND.REGULAR,
    tier: SYMBOL_TIER.LOW,
    category: SYMBOL_CATEGORY.CANDY,
    labelKey: 'symbols.lemonDrop',
    shortLabelKey: 'symbols.lemonDropShort',
    assetKey: 'symbol-lemon-drop',
    animationKey: 'symbol-lemon-drop',
    soundKey: 'symbol-lemon-drop',
    weight: 23,
    minMatch: 8,
    maxMatch: 15,
    canTumble: true,
    canWin: true,
    canTriggerBonus: false,
    canCarryMultiplier: false,
    renderPriority: 27,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.lemonDrop'
  };

  // ─── SCATTER ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.SCATTER] = {
    id: SYMBOL_ID.SCATTER,
    kind: SYMBOL_KIND.SCATTER,
    tier: SYMBOL_TIER.FEATURE,
    category: SYMBOL_CATEGORY.FEATURE,
    labelKey: 'symbols.scatter',
    shortLabelKey: 'symbols.scatterShort',
    assetKey: 'symbol-scatter',
    animationKey: 'symbol-scatter',
    soundKey: 'symbol-scatter',
    weight: 4,
    minMatch: null,
    maxMatch: null,
    canTumble: false,
    canWin: false,
    canTriggerBonus: true,
    canCarryMultiplier: false,
    renderPriority: 100,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.scatter',
    feature: Object.freeze({
      triggerCount: 4,
      initialSpins: 10,
      retriggerCount: 3,
      retriggerSpins: 5
    })
  };

  // ─── MULTIPLIER ───
  SYMBOL_DEFINITIONS[SYMBOL_ID.MULTIPLIER] = {
    id: SYMBOL_ID.MULTIPLIER,
    kind: SYMBOL_KIND.MULTIPLIER,
    tier: SYMBOL_TIER.FEATURE,
    category: SYMBOL_CATEGORY.FEATURE,
    labelKey: 'symbols.multiplier',
    shortLabelKey: 'symbols.multiplierShort',
    assetKey: 'symbol-multiplier',
    animationKey: 'symbol-multiplier',
    soundKey: 'symbol-multiplier',
    weight: 0,
    minMatch: null,
    maxMatch: null,
    canTumble: false,
    canWin: false,
    canTriggerBonus: false,
    canCarryMultiplier: true,
    renderPriority: 110,
    ariaRole: 'img',
    ariaLabelKey: 'symbols.multiplier',
    feature: Object.freeze({
      allowedValues: Object.freeze([2, 3, 5, 10, 20, 50, 100]),
      minValue: 2,
      maxValue: 100
    })
  };

  /* =========================================================
   * FROZEN PUBLIC SYMBOL TABLE
   * ======================================================= */
  var SYMBOLS = {};
  Object.keys(SYMBOL_DEFINITIONS).forEach(function (id) {
    SYMBOLS[id] = Object.freeze(SYMBOL_DEFINITIONS[id]);
  });
  Object.freeze(SYMBOLS);

  /* =========================================================
   * ID GROUPS
   * ======================================================= */
  var REGULAR_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.CRYSTAL_HEART,
    SYMBOL_ID.GOLDEN_CROWN,
    SYMBOL_ID.RAINBOW_RING,
    SYMBOL_ID.STAR_GEM,
    SYMBOL_ID.BLUEBERRY,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.LEMON_DROP
  ]);

  var FEATURE_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.SCATTER,
    SYMBOL_ID.MULTIPLIER
  ]);

  var PAYABLE_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.CRYSTAL_HEART,
    SYMBOL_ID.GOLDEN_CROWN,
    SYMBOL_ID.RAINBOW_RING,
    SYMBOL_ID.STAR_GEM,
    SYMBOL_ID.BLUEBERRY,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.LEMON_DROP
  ]);

  var HIGH_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.CRYSTAL_HEART,
    SYMBOL_ID.GOLDEN_CROWN,
    SYMBOL_ID.RAINBOW_RING,
    SYMBOL_ID.STAR_GEM
  ]);

  var LOW_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.BLUEBERRY,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.LEMON_DROP
  ]);

  /* =========================================================
   * BASE SYMBOL WEIGHTS
   * ======================================================= */
  var BASE_SYMBOL_WEIGHTS = Object.freeze({
    crystal_heart: 5,
    golden_crown:  6,
    rainbow_ring:  7,
    star_gem:      8,
    blueberry:     15,
    grape:         17,
    watermelon:    19,
    lemon_drop:    23
  });

  /* =========================================================
   * VALIDATION
   * ======================================================= */
  function validateSymbolWeights(weights) {
    weights = weights || BASE_SYMBOL_WEIGHTS;
    var errors = [];
    for (var i = 0; i < REGULAR_SYMBOL_IDS.length; i++) {
      var symbolId = REGULAR_SYMBOL_IDS[i];
      var value = weights[symbolId];
      if (!Number.isFinite(value)) {
        errors.push(symbolId + ': weight must be finite');
        continue;
      }
      if (value <= 0) {
        errors.push(symbolId + ': weight must be > 0');
      }
    }
    var keys = Object.keys(weights);
    for (var k = 0; k < keys.length; k++) {
      if (REGULAR_SYMBOL_IDS.indexOf(keys[k]) === -1) {
        errors.push(keys[k] + ': unknown regular symbol');
      }
    }
    if (errors.length > 0) {
      throw new Error('INVALID_SYMBOL_WEIGHTS:\n' + errors.join('\n'));
    }
    return true;
  }

  function getTotalBaseWeight(weights) {
    weights = weights || BASE_SYMBOL_WEIGHTS;
    validateSymbolWeights(weights);
    var total = 0;
    for (var i = 0; i < REGULAR_SYMBOL_IDS.length; i++) {
      total += weights[REGULAR_SYMBOL_IDS[i]];
    }
    return total;
  }

  function getWeightedSymbolTable(weights) {
    weights = weights || BASE_SYMBOL_WEIGHTS;
    validateSymbolWeights(weights);
    var cumulative = 0;
    var table = [];
    for (var i = 0; i < REGULAR_SYMBOL_IDS.length; i++) {
      var symbolId = REGULAR_SYMBOL_IDS[i];
      cumulative += weights[symbolId];
      table.push(Object.freeze({
        symbolId: symbolId,
        weight: weights[symbolId],
        cumulativeWeight: cumulative
      }));
    }
    return Object.freeze(table);
  }

  /* =========================================================
   * LOOKUP
   * ======================================================= */
  function getSymbol(symbolId) {
    var symbol = SYMBOLS[symbolId];
    if (!symbol) throw new Error('UNKNOWN_SYMBOL: ' + symbolId);
    return symbol;
  }

  function hasSymbol(symbolId) {
    return Object.prototype.hasOwnProperty.call(SYMBOLS, symbolId);
  }

  /* =========================================================
   * TYPE CHECKS
   * ======================================================= */
  function isRegularSymbol(symbolId) {
    return REGULAR_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }
  function isFeatureSymbol(symbolId) {
    return FEATURE_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }
  function isPayableSymbol(symbolId) {
    return PAYABLE_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }
  function isScatter(symbolId) {
    return symbolId === SYMBOL_ID.SCATTER;
  }
  function isMultiplier(symbolId) {
    return symbolId === SYMBOL_ID.MULTIPLIER;
  }

  /* =========================================================
   * METADATA GETTERS
   * ======================================================= */
  function getSymbolKind(symbolId)     { return getSymbol(symbolId).kind; }
  function getSymbolTier(symbolId)     { return getSymbol(symbolId).tier; }
  function getSymbolCategory(symbolId) { return getSymbol(symbolId).category; }

  function getMinMatch(symbolId) {
    if (!isRegularSymbol(symbolId)) return null;
    return getSymbol(symbolId).minMatch;
  }

  function getSymbolAssetKey(symbolId)     { return getSymbol(symbolId).assetKey; }
  function getSymbolAnimationKey(symbolId) { return getSymbol(symbolId).animationKey; }
  function getSymbolSoundKey(symbolId)     { return getSymbol(symbolId).soundKey; }

  function getScatterRules()    { return SYMBOLS[SYMBOL_ID.SCATTER].feature; }
  function getMultiplierRules() { return SYMBOLS[SYMBOL_ID.MULTIPLIER].feature; }

  /* =========================================================
   * FULL VALIDATION
   * ======================================================= */
  function validateSymbols() {
    var errors = [];

    var ids = Object.keys(SYMBOL_ID).map(function (k) { return SYMBOL_ID[k]; });
    var seen = {};
    for (var i = 0; i < ids.length; i++) {
      if (seen[ids[i]]) errors.push('Duplicate SYMBOL_ID: ' + ids[i]);
      seen[ids[i]] = true;
    }

    var keys = Object.keys(SYMBOLS);
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k];
      var symbol = SYMBOLS[id];
      if (symbol.id !== id)          errors.push(id + ': id mismatch');
      if (!symbol.kind)              errors.push(id + ': missing kind');
      if (!symbol.tier)              errors.push(id + ': missing tier');
      if (!symbol.assetKey)          errors.push(id + ': missing assetKey');
      if (!symbol.labelKey)          errors.push(id + ': missing labelKey');
    }

    for (var r = 0; r < REGULAR_SYMBOL_IDS.length; r++) {
      var rid = REGULAR_SYMBOL_IDS[r];
      var rs = SYMBOLS[rid];
      if (!rs)                                    { errors.push('Missing regular: ' + rid); continue; }
      if (rs.kind !== SYMBOL_KIND.REGULAR)        errors.push(rid + ': invalid kind');
      if (!rs.canWin)                             errors.push(rid + ': must be winnable');
      if (!rs.canTumble)                          errors.push(rid + ': must tumble');
      if (!Number.isFinite(rs.weight))            errors.push(rid + ': invalid weight');
    }

    var scatter = SYMBOLS[SYMBOL_ID.SCATTER];
    if (scatter.kind !== SYMBOL_KIND.SCATTER) errors.push('Scatter kind invalid');
    if (!scatter.canTriggerBonus)             errors.push('Scatter must trigger bonus');

    var multiplier = SYMBOLS[SYMBOL_ID.MULTIPLIER];
    if (multiplier.kind !== SYMBOL_KIND.MULTIPLIER) errors.push('Multiplier kind invalid');
    if (multiplier.weight !== 0)                    errors.push('Multiplier weight must be 0');
    if (!multiplier.canCarryMultiplier)             errors.push('Multiplier must carry value');

    if (errors.length > 0) {
      throw new Error('SYMBOL_VALIDATION_FAILED:\n' + errors.join('\n'));
    }
    validateSymbolWeights();
    return true;
  }

  /* =========================================================
   * EXPORT
   * ======================================================= */
  window.ApexEngineSymbols = Object.freeze({
    // Constants
    SYMBOL_ID: SYMBOL_ID,
    SYMBOL_KIND: SYMBOL_KIND,
    SYMBOL_TIER: SYMBOL_TIER,
    SYMBOL_CATEGORY: SYMBOL_CATEGORY,

    // Tables
    SYMBOLS: SYMBOLS,
    REGULAR_SYMBOL_IDS: REGULAR_SYMBOL_IDS,
    FEATURE_SYMBOL_IDS: FEATURE_SYMBOL_IDS,
    PAYABLE_SYMBOL_IDS: PAYABLE_SYMBOL_IDS,
    HIGH_SYMBOL_IDS: HIGH_SYMBOL_IDS,
    LOW_SYMBOL_IDS: LOW_SYMBOL_IDS,
    BASE_SYMBOL_WEIGHTS: BASE_SYMBOL_WEIGHTS,

    // Functions
    validateSymbolWeights: validateSymbolWeights,
    getTotalBaseWeight: getTotalBaseWeight,
    getWeightedSymbolTable: getWeightedSymbolTable,
    getSymbol: getSymbol,
    hasSymbol: hasSymbol,
    isRegularSymbol: isRegularSymbol,
    isFeatureSymbol: isFeatureSymbol,
    isPayableSymbol: isPayableSymbol,
    isScatter: isScatter,
    isMultiplier: isMultiplier,
    getSymbolKind: getSymbolKind,
    getSymbolTier: getSymbolTier,
    getSymbolCategory: getSymbolCategory,
    getMinMatch: getMinMatch,
    getSymbolAssetKey: getSymbolAssetKey,
    getSymbolAnimationKey: getSymbolAnimationKey,
    getSymbolSoundKey: getSymbolSoundKey,
    getScatterRules: getScatterRules,
    getMultiplierRules: getMultiplierRules,
    validateSymbols: validateSymbols,

    // Default
    default: SYMBOLS
  });
})();
