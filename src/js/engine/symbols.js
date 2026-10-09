/* Apex · Symbol Registry · FINAL
 *
 * 11 个核心符号：
 *   01. banana            香蕉
 *   02. grape             葡萄
 *   03. watermelon        西瓜
 *   04. plum              李子
 *   05. apple             苹果
 *   06. blue_candy        蓝糖果
 *   07. green_candy       绿糖果
 *   08. purple_candy      紫糖果
 *   09. red_heart_candy   红心糖
 *   10. lollipop          棒棒糖
 *   11. multiplier_bomb   倍率炸弹
 *
 * 本文件只负责：ID / 类型 / 等级 / 资源 Key / 动画 Key / 音效 Key /
 *   统计/可访问性元数据 / 基础权重 / 符号能力 / 倍率炸弹规则
 *
 * 不负责：RTP / 赔率 / 随机数 / 消除 / 掉落 / 结算 / FreeSpin / Wallet
 *
 * 挂载：window.ApexEngineSymbols
 */
(function () {
  'use strict';

  /* 1. Symbol IDs */
  var SYMBOL_ID = Object.freeze({
    BANANA: 'banana',
    GRAPE: 'grape',
    WATERMELON: 'watermelon',
    PLUM: 'plum',
    APPLE: 'apple',
    BLUE_CANDY: 'blue_candy',
    GREEN_CANDY: 'green_candy',
    PURPLE_CANDY: 'purple_candy',
    RED_HEART_CANDY: 'red_heart_candy',
    LOLLIPOP: 'lollipop',
    MULTIPLIER_BOMB: 'multiplier_bomb'
  });

  /* 2. Symbol Kind */
  var SYMBOL_KIND = Object.freeze({
    REGULAR: 'regular',
    SPECIAL: 'special'
  });

  /* 3. Symbol Tier */
  var SYMBOL_TIER = Object.freeze({
    LOW: 'low',
    MID: 'mid',
    HIGH: 'high',
    FEATURE: 'feature'
  });

  /* 4. Symbol Category */
  var SYMBOL_CATEGORY = Object.freeze({
    FRUIT: 'fruit',
    CANDY: 'candy',
    SPECIAL: 'special'
  });

  /* 5. Base Symbol Definitions */
  var SYMBOLS = Object.freeze({

    // ============ BANANA ============
    [SYMBOL_ID.BANANA]: Object.freeze({
      id: SYMBOL_ID.BANANA,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.LOW,
      category: SYMBOL_CATEGORY.FRUIT,
      label: '香蕉',
      shortLabel: '香蕉',
      labelKey: 'symbol.banana',
      shortLabelKey: 'symbol.banana.short',
      assetKey: 'symbol_banana',
      textureKey: 'symbol_banana',
      atlasKey: 'symbols',
      spriteKey: 'banana',
      animationKey: 'symbol_banana',
      idleAnimationKey: 'symbol_banana_idle',
      winAnimationKey: 'symbol_banana_win',
      landAnimationKey: 'symbol_banana_land',
      tumbleAnimationKey: 'symbol_banana_tumble',
      destroyAnimationKey: 'symbol_banana_destroy',
      soundKey: 'symbol_banana',
      winSoundKey: 'symbol_banana_win',
      weight: 100,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 10,
      ariaLabelKey: 'aria.symbol.banana',
      descriptionKey: 'symbol.description.banana'
    }),

    // ============ GRAPE ============
    [SYMBOL_ID.GRAPE]: Object.freeze({
      id: SYMBOL_ID.GRAPE,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.LOW,
      category: SYMBOL_CATEGORY.FRUIT,
      label: '葡萄',
      shortLabel: '葡萄',
      labelKey: 'symbol.grape',
      shortLabelKey: 'symbol.grape.short',
      assetKey: 'symbol_grape',
      textureKey: 'symbol_grape',
      atlasKey: 'symbols',
      spriteKey: 'grape',
      animationKey: 'symbol_grape',
      idleAnimationKey: 'symbol_grape_idle',
      winAnimationKey: 'symbol_grape_win',
      landAnimationKey: 'symbol_grape_land',
      tumbleAnimationKey: 'symbol_grape_tumble',
      destroyAnimationKey: 'symbol_grape_destroy',
      soundKey: 'symbol_grape',
      winSoundKey: 'symbol_grape_win',
      weight: 95,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 10,
      ariaLabelKey: 'aria.symbol.grape',
      descriptionKey: 'symbol.description.grape'
    }),

    // ============ WATERMELON ============
    [SYMBOL_ID.WATERMELON]: Object.freeze({
      id: SYMBOL_ID.WATERMELON,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.MID,
      category: SYMBOL_CATEGORY.FRUIT,
      label: '西瓜',
      shortLabel: '西瓜',
      labelKey: 'symbol.watermelon',
      shortLabelKey: 'symbol.watermelon.short',
      assetKey: 'symbol_watermelon',
      textureKey: 'symbol_watermelon',
      atlasKey: 'symbols',
      spriteKey: 'watermelon',
      animationKey: 'symbol_watermelon',
      idleAnimationKey: 'symbol_watermelon_idle',
      winAnimationKey: 'symbol_watermelon_win',
      landAnimationKey: 'symbol_watermelon_land',
      tumbleAnimationKey: 'symbol_watermelon_tumble',
      destroyAnimationKey: 'symbol_watermelon_destroy',
      soundKey: 'symbol_watermelon',
      winSoundKey: 'symbol_watermelon_win',
      weight: 82,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 11,
      ariaLabelKey: 'aria.symbol.watermelon',
      descriptionKey: 'symbol.description.watermelon'
    }),

    // ============ PLUM ============
    [SYMBOL_ID.PLUM]: Object.freeze({
      id: SYMBOL_ID.PLUM,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.MID,
      category: SYMBOL_CATEGORY.FRUIT,
      label: '李子',
      shortLabel: '李子',
      labelKey: 'symbol.plum',
      shortLabelKey: 'symbol.plum.short',
      assetKey: 'symbol_plum',
      textureKey: 'symbol_plum',
      atlasKey: 'symbols',
      spriteKey: 'plum',
      animationKey: 'symbol_plum',
      idleAnimationKey: 'symbol_plum_idle',
      winAnimationKey: 'symbol_plum_win',
      landAnimationKey: 'symbol_plum_land',
      tumbleAnimationKey: 'symbol_plum_tumble',
      destroyAnimationKey: 'symbol_plum_destroy',
      soundKey: 'symbol_plum',
      winSoundKey: 'symbol_plum_win',
      weight: 78,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 11,
      ariaLabelKey: 'aria.symbol.plum',
      descriptionKey: 'symbol.description.plum'
    }),

    // ============ APPLE ============
    [SYMBOL_ID.APPLE]: Object.freeze({
      id: SYMBOL_ID.APPLE,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.FRUIT,
      label: '苹果',
      shortLabel: '苹果',
      labelKey: 'symbol.apple',
      shortLabelKey: 'symbol.apple.short',
      assetKey: 'symbol_apple',
      textureKey: 'symbol_apple',
      atlasKey: 'symbols',
      spriteKey: 'apple',
      animationKey: 'symbol_apple',
      idleAnimationKey: 'symbol_apple_idle',
      winAnimationKey: 'symbol_apple_win',
      landAnimationKey: 'symbol_apple_land',
      tumbleAnimationKey: 'symbol_apple_tumble',
      destroyAnimationKey: 'symbol_apple_destroy',
      soundKey: 'symbol_apple',
      winSoundKey: 'symbol_apple_win',
      weight: 68,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 12,
      ariaLabelKey: 'aria.symbol.apple',
      descriptionKey: 'symbol.description.apple'
    }),

    // ============ BLUE_CANDY ============
    [SYMBOL_ID.BLUE_CANDY]: Object.freeze({
      id: SYMBOL_ID.BLUE_CANDY,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.CANDY,
      label: '蓝糖果',
      shortLabel: '蓝糖',
      labelKey: 'symbol.blueCandy',
      shortLabelKey: 'symbol.blueCandy.short',
      assetKey: 'symbol_blue_candy',
      textureKey: 'symbol_blue_candy',
      atlasKey: 'symbols',
      spriteKey: 'blue_candy',
      animationKey: 'symbol_blue_candy',
      idleAnimationKey: 'symbol_blue_candy_idle',
      winAnimationKey: 'symbol_blue_candy_win',
      landAnimationKey: 'symbol_blue_candy_land',
      tumbleAnimationKey: 'symbol_blue_candy_tumble',
      destroyAnimationKey: 'symbol_blue_candy_destroy',
      soundKey: 'symbol_blue_candy',
      winSoundKey: 'symbol_blue_candy_win',
      weight: 58,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 13,
      ariaLabelKey: 'aria.symbol.blueCandy',
      descriptionKey: 'symbol.description.blueCandy'
    }),

    // ============ GREEN_CANDY ============
    [SYMBOL_ID.GREEN_CANDY]: Object.freeze({
      id: SYMBOL_ID.GREEN_CANDY,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.CANDY,
      label: '绿糖果',
      shortLabel: '绿糖',
      labelKey: 'symbol.greenCandy',
      shortLabelKey: 'symbol.greenCandy.short',
      assetKey: 'symbol_green_candy',
      textureKey: 'symbol_green_candy',
      atlasKey: 'symbols',
      spriteKey: 'green_candy',
      animationKey: 'symbol_green_candy',
      idleAnimationKey: 'symbol_green_candy_idle',
      winAnimationKey: 'symbol_green_candy_win',
      landAnimationKey: 'symbol_green_candy_land',
      tumbleAnimationKey: 'symbol_green_candy_tumble',
      destroyAnimationKey: 'symbol_green_candy_destroy',
      soundKey: 'symbol_green_candy',
      winSoundKey: 'symbol_green_candy_win',
      weight: 54,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 13,
      ariaLabelKey: 'aria.symbol.greenCandy',
      descriptionKey: 'symbol.description.greenCandy'
    }),

    // ============ PURPLE_CANDY ============
    [SYMBOL_ID.PURPLE_CANDY]: Object.freeze({
      id: SYMBOL_ID.PURPLE_CANDY,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.CANDY,
      label: '紫糖果',
      shortLabel: '紫糖',
      labelKey: 'symbol.purpleCandy',
      shortLabelKey: 'symbol.purpleCandy.short',
      assetKey: 'symbol_purple_candy',
      textureKey: 'symbol_purple_candy',
      atlasKey: 'symbols',
      spriteKey: 'purple_candy',
      animationKey: 'symbol_purple_candy',
      idleAnimationKey: 'symbol_purple_candy_idle',
      winAnimationKey: 'symbol_purple_candy_win',
      landAnimationKey: 'symbol_purple_candy_land',
      tumbleAnimationKey: 'symbol_purple_candy_tumble',
      destroyAnimationKey: 'symbol_purple_candy_destroy',
      soundKey: 'symbol_purple_candy',
      winSoundKey: 'symbol_purple_candy_win',
      weight: 50,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 13,
      ariaLabelKey: 'aria.symbol.purpleCandy',
      descriptionKey: 'symbol.description.purpleCandy'
    }),

    // ============ RED_HEART_CANDY ============
    [SYMBOL_ID.RED_HEART_CANDY]: Object.freeze({
      id: SYMBOL_ID.RED_HEART_CANDY,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.CANDY,
      label: '红心糖',
      shortLabel: '红心糖',
      labelKey: 'symbol.redHeartCandy',
      shortLabelKey: 'symbol.redHeartCandy.short',
      assetKey: 'symbol_red_heart_candy',
      textureKey: 'symbol_red_heart_candy',
      atlasKey: 'symbols',
      spriteKey: 'red_heart_candy',
      animationKey: 'symbol_red_heart_candy',
      idleAnimationKey: 'symbol_red_heart_candy_idle',
      winAnimationKey: 'symbol_red_heart_candy_win',
      landAnimationKey: 'symbol_red_heart_candy_land',
      tumbleAnimationKey: 'symbol_red_heart_candy_tumble',
      destroyAnimationKey: 'symbol_red_heart_candy_destroy',
      soundKey: 'symbol_red_heart_candy',
      winSoundKey: 'symbol_red_heart_candy_win',
      weight: 45,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 14,
      ariaLabelKey: 'aria.symbol.redHeartCandy',
      descriptionKey: 'symbol.description.redHeartCandy'
    }),

    // ============ LOLLIPOP ============
    [SYMBOL_ID.LOLLIPOP]: Object.freeze({
      id: SYMBOL_ID.LOLLIPOP,
      kind: SYMBOL_KIND.REGULAR,
      tier: SYMBOL_TIER.HIGH,
      category: SYMBOL_CATEGORY.CANDY,
      label: '棒棒糖',
      shortLabel: '棒棒糖',
      labelKey: 'symbol.lollipop',
      shortLabelKey: 'symbol.lollipop.short',
      assetKey: 'symbol_lollipop',
      textureKey: 'symbol_lollipop',
      atlasKey: 'symbols',
      spriteKey: 'lollipop',
      animationKey: 'symbol_lollipop',
      idleAnimationKey: 'symbol_lollipop_idle',
      winAnimationKey: 'symbol_lollipop_win',
      landAnimationKey: 'symbol_lollipop_land',
      tumbleAnimationKey: 'symbol_lollipop_tumble',
      destroyAnimationKey: 'symbol_lollipop_destroy',
      soundKey: 'symbol_lollipop',
      winSoundKey: 'symbol_lollipop_win',
      weight: 38,
      minMatch: 8,
      maxMatch: 15,
      canWin: true,
      canTumble: true,
      canTriggerFeature: false,
      canCarryMultiplier: false,
      renderPriority: 15,
      ariaLabelKey: 'aria.symbol.lollipop',
      descriptionKey: 'symbol.description.lollipop'
    }),

    // ============ MULTIPLIER_BOMB ============
    [SYMBOL_ID.MULTIPLIER_BOMB]: Object.freeze({
      id: SYMBOL_ID.MULTIPLIER_BOMB,
      kind: SYMBOL_KIND.SPECIAL,
      tier: SYMBOL_TIER.FEATURE,
      category: SYMBOL_CATEGORY.SPECIAL,
      label: '倍率炸弹',
      shortLabel: '倍率',
      labelKey: 'symbol.multiplierBomb',
      shortLabelKey: 'symbol.multiplierBomb.short',
      assetKey: 'symbol_multiplier_bomb',
      textureKey: 'symbol_multiplier_bomb',
      atlasKey: 'symbols',
      spriteKey: 'multiplier_bomb',
      animationKey: 'symbol_multiplier_bomb',
      idleAnimationKey: 'symbol_multiplier_bomb_idle',
      winAnimationKey: 'symbol_multiplier_bomb_win',
      landAnimationKey: 'symbol_multiplier_bomb_land',
      tumbleAnimationKey: 'symbol_multiplier_bomb_tumble',
      destroyAnimationKey: 'symbol_multiplier_bomb_destroy',
      activateAnimationKey: 'symbol_multiplier_bomb_activate',
      explodeAnimationKey: 'symbol_multiplier_bomb_explode',
      soundKey: 'symbol_multiplier_bomb',
      winSoundKey: 'symbol_multiplier_bomb_win',
      activateSoundKey: 'symbol_multiplier_bomb_activate',
      explodeSoundKey: 'symbol_multiplier_bomb_explode',
      weight: 0,
      minMatch: 0,
      maxMatch: 0,
      canWin: false,
      canTumble: false,
      canTriggerFeature: true,
      canCarryMultiplier: true,
      multiplierValues: Object.freeze([2, 3, 5, 10, 20, 50, 100]),
      minMultiplier: 2,
      maxMultiplier: 100,
      supportsMultipleMultipliers: true,
      renderPriority: 100,
      ariaLabelKey: 'aria.symbol.multiplierBomb',
      descriptionKey: 'symbol.description.multiplierBomb'
    })
  });

  /* 6. Symbol Groups */
  var FRUIT_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.BANANA,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.PLUM,
    SYMBOL_ID.APPLE
  ]);

  var CANDY_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.BLUE_CANDY,
    SYMBOL_ID.GREEN_CANDY,
    SYMBOL_ID.PURPLE_CANDY,
    SYMBOL_ID.RED_HEART_CANDY,
    SYMBOL_ID.LOLLIPOP
  ]);

  var PAYABLE_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.BANANA,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.PLUM,
    SYMBOL_ID.APPLE,
    SYMBOL_ID.BLUE_CANDY,
    SYMBOL_ID.GREEN_CANDY,
    SYMBOL_ID.PURPLE_CANDY,
    SYMBOL_ID.RED_HEART_CANDY,
    SYMBOL_ID.LOLLIPOP
  ]);

  var SPECIAL_SYMBOL_IDS = Object.freeze([SYMBOL_ID.MULTIPLIER_BOMB]);

  var ALL_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.BANANA,
    SYMBOL_ID.GRAPE,
    SYMBOL_ID.WATERMELON,
    SYMBOL_ID.PLUM,
    SYMBOL_ID.APPLE,
    SYMBOL_ID.BLUE_CANDY,
    SYMBOL_ID.GREEN_CANDY,
    SYMBOL_ID.PURPLE_CANDY,
    SYMBOL_ID.RED_HEART_CANDY,
    SYMBOL_ID.LOLLIPOP,
    SYMBOL_ID.MULTIPLIER_BOMB
  ]);

  /* 7. Tier Groups */
  var LOW_SYMBOL_IDS = Object.freeze([SYMBOL_ID.BANANA, SYMBOL_ID.GRAPE]);
  var MID_SYMBOL_IDS = Object.freeze([SYMBOL_ID.WATERMELON, SYMBOL_ID.PLUM]);
  var HIGH_SYMBOL_IDS = Object.freeze([
    SYMBOL_ID.APPLE,
    SYMBOL_ID.BLUE_CANDY,
    SYMBOL_ID.GREEN_CANDY,
    SYMBOL_ID.PURPLE_CANDY,
    SYMBOL_ID.RED_HEART_CANDY,
    SYMBOL_ID.LOLLIPOP
  ]);
  var FEATURE_SYMBOL_IDS = Object.freeze([SYMBOL_ID.MULTIPLIER_BOMB]);

  /* 8. Base Weight Table */
  var BASE_SYMBOL_WEIGHTS = Object.freeze({
    [SYMBOL_ID.BANANA]: 100,
    [SYMBOL_ID.GRAPE]: 95,
    [SYMBOL_ID.WATERMELON]: 82,
    [SYMBOL_ID.PLUM]: 78,
    [SYMBOL_ID.APPLE]: 68,
    [SYMBOL_ID.BLUE_CANDY]: 58,
    [SYMBOL_ID.GREEN_CANDY]: 54,
    [SYMBOL_ID.PURPLE_CANDY]: 50,
    [SYMBOL_ID.RED_HEART_CANDY]: 45,
    [SYMBOL_ID.LOLLIPOP]: 38
  });

  /* 9. Utility Functions */
  function getSymbol(symbolId) {
    return SYMBOLS[symbolId] || null;
  }

  function hasSymbol(symbolId) {
    return Object.prototype.hasOwnProperty.call(SYMBOLS, symbolId);
  }

  function isPayableSymbol(symbolId) {
    return PAYABLE_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }

  function isSpecialSymbol(symbolId) {
    return SPECIAL_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }

  function isFruitSymbol(symbolId) {
    return FRUIT_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }

  function isCandySymbol(symbolId) {
    return CANDY_SYMBOL_IDS.indexOf(symbolId) !== -1;
  }

  function isMultiplierBomb(symbolId) {
    return symbolId === SYMBOL_ID.MULTIPLIER_BOMB;
  }

  function canTumble(symbolId) {
    var s = getSymbol(symbolId);
    return Boolean(s && s.canTumble);
  }

  function canWin(symbolId) {
    var s = getSymbol(symbolId);
    return Boolean(s && s.canWin);
  }

  function canCarryMultiplier(symbolId) {
    var s = getSymbol(symbolId);
    return Boolean(s && s.canCarryMultiplier);
  }

  function getSymbolWeight(symbolId) {
    var w = BASE_SYMBOL_WEIGHTS[symbolId];
    return typeof w === 'number' ? w : 0;
  }

  function getTotalBaseWeight() {
    var total = 0;
    for (var i = 0; i < PAYABLE_SYMBOL_IDS.length; i++) {
      total += getSymbolWeight(PAYABLE_SYMBOL_IDS[i]);
    }
    return total;
  }

  /* 10. Weighted Table */
  function getWeightedSymbolTable() {
    var cumulativeWeight = 0;
    return PAYABLE_SYMBOL_IDS.map(function (symbolId) {
      var weight = getSymbolWeight(symbolId);
      cumulativeWeight += weight;
      return Object.freeze({
        id: symbolId,
        weight: weight,
        cumulativeWeight: cumulativeWeight
      });
    });
  }

  /* 11. Random Symbol Picker */
  function pickWeightedSymbol(randomInt) {
    if (typeof randomInt !== 'function') {
      throw new TypeError('pickWeightedSymbol(randomInt): randomInt must be a function');
    }
    var table = getWeightedSymbolTable();
    if (table.length === 0) {
      throw new Error('Symbol weighted table is empty.');
    }
    var totalWeight = table[table.length - 1].cumulativeWeight;
    var roll = randomInt(1, totalWeight);
    for (var i = 0; i < table.length; i++) {
      if (roll <= table[i].cumulativeWeight) {
        return table[i].id;
      }
    }
    return table[table.length - 1].id;
  }

  /* 12. Multiplier Helpers */
  function getMultiplierValues() {
    return SYMBOLS[SYMBOL_ID.MULTIPLIER_BOMB].multiplierValues;
  }

  function isValidMultiplier(value) {
    return getMultiplierValues().indexOf(value) !== -1;
  }

  function createMultiplierBomb(multiplier) {
    if (!isValidMultiplier(multiplier)) {
      throw new RangeError(
        'Invalid multiplier: ' + multiplier +
        '. Allowed values: ' + getMultiplierValues().join(', ')
      );
    }
    return Object.freeze({
      symbolId: SYMBOL_ID.MULTIPLIER_BOMB,
      multiplier: multiplier
    });
  }

  /* 13. Symbol Validation */
  function validateSymbols() {
    var errors = [];

    if (ALL_SYMBOL_IDS.length !== 11) {
      errors.push('Expected 11 symbols, got ' + ALL_SYMBOL_IDS.length);
    }

    var uniqueIds = {};
    for (var i = 0; i < ALL_SYMBOL_IDS.length; i++) {
      if (uniqueIds[ALL_SYMBOL_IDS[i]]) {
        errors.push('Duplicate symbol IDs detected.');
        break;
      }
      uniqueIds[ALL_SYMBOL_IDS[i]] = true;
    }

    for (var j = 0; j < ALL_SYMBOL_IDS.length; j++) {
      if (!hasSymbol(ALL_SYMBOL_IDS[j])) {
        errors.push('Missing symbol definition: ' + ALL_SYMBOL_IDS[j]);
      }
    }

    for (var k = 0; k < PAYABLE_SYMBOL_IDS.length; k++) {
      var pid = PAYABLE_SYMBOL_IDS[k];
      var ps = getSymbol(pid);
      if (!ps) { errors.push('Missing payable symbol: ' + pid); continue; }
      if (ps.kind !== SYMBOL_KIND.REGULAR) errors.push(pid + ': payable symbol must be REGULAR');
      if (!ps.canWin) errors.push(pid + ': payable symbol must have canWin=true');
      if (!ps.canTumble) errors.push(pid + ': payable symbol must have canTumble=true');
      if (!Number.isFinite(ps.weight)) errors.push(pid + ': invalid weight');
      if (ps.weight < 0) errors.push(pid + ': weight cannot be negative');
      if (!Number.isInteger(ps.minMatch) || ps.minMatch < 1) errors.push(pid + ': invalid minMatch');
      if (!Number.isInteger(ps.maxMatch) || ps.maxMatch < ps.minMatch) errors.push(pid + ': invalid maxMatch');
    }

    var bomb = getSymbol(SYMBOL_ID.MULTIPLIER_BOMB);
    if (!bomb) {
      errors.push('Multiplier bomb definition is missing.');
    } else {
      if (bomb.kind !== SYMBOL_KIND.SPECIAL) errors.push('Multiplier bomb must be SPECIAL.');
      if (bomb.canWin !== false) errors.push('Multiplier bomb must not be a normal payable symbol.');
      if (!Array.isArray(bomb.multiplierValues) || bomb.multiplierValues.length === 0) {
        errors.push('Multiplier bomb must have multiplierValues.');
      }
      if (bomb.minMultiplier < 1 || bomb.maxMultiplier < bomb.minMultiplier) {
        errors.push('Multiplier bomb multiplier range is invalid.');
      }
    }

    var totalWeight = getTotalBaseWeight();
    if (totalWeight <= 0) {
      errors.push('Total base symbol weight must be greater than zero.');
    }

    if (errors.length > 0) {
      throw new Error(
        'Symbol registry validation failed:\n' +
        errors.map(function (e) { return '- ' + e; }).join('\n')
      );
    }
    return true;
  }

  /* 14. Frozen Public API */
  var SYMBOL_API = Object.freeze({
    SYMBOL_ID: SYMBOL_ID,
    SYMBOL_KIND: SYMBOL_KIND,
    SYMBOL_TIER: SYMBOL_TIER,
    SYMBOL_CATEGORY: SYMBOL_CATEGORY,

    SYMBOLS: SYMBOLS,

    FRUIT_SYMBOL_IDS: FRUIT_SYMBOL_IDS,
    CANDY_SYMBOL_IDS: CANDY_SYMBOL_IDS,
    PAYABLE_SYMBOL_IDS: PAYABLE_SYMBOL_IDS,
    SPECIAL_SYMBOL_IDS: SPECIAL_SYMBOL_IDS,
    ALL_SYMBOL_IDS: ALL_SYMBOL_IDS,

    LOW_SYMBOL_IDS: LOW_SYMBOL_IDS,
    MID_SYMBOL_IDS: MID_SYMBOL_IDS,
    HIGH_SYMBOL_IDS: HIGH_SYMBOL_IDS,
    FEATURE_SYMBOL_IDS: FEATURE_SYMBOL_IDS,

    BASE_SYMBOL_WEIGHTS: BASE_SYMBOL_WEIGHTS,

    getSymbol: getSymbol,
    hasSymbol: hasSymbol,
    isPayableSymbol: isPayableSymbol,
    isSpecialSymbol: isSpecialSymbol,
    isFruitSymbol: isFruitSymbol,
    isCandySymbol: isCandySymbol,
    isMultiplierBomb: isMultiplierBomb,

    canTumble: canTumble,
    canWin: canWin,
    canCarryMultiplier: canCarryMultiplier,

    getSymbolWeight: getSymbolWeight,
    getTotalBaseWeight: getTotalBaseWeight,
    getWeightedSymbolTable: getWeightedSymbolTable,
    pickWeightedSymbol: pickWeightedSymbol,

    getMultiplierValues: getMultiplierValues,
    isValidMultiplier: isValidMultiplier,
    createMultiplierBomb: createMultiplierBomb,

    validateSymbols: validateSymbols
  });

  /* 15. Development-time validation */
  try {
    validateSymbols();
  } catch (e) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[ApexEngineSymbols] validation failed:', e.message);
    }
  }

  /* 16. Export */
  window.ApexEngineSymbols = SYMBOL_API;
})();
