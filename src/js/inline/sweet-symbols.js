/* Apex · Sweet Bonanza Symbol Registry v3
 * 只负责资产数据，不负责抽签概率
 */
(function () {
  'use strict';

  var SYMBOLS = Object.freeze({
    BANANA:       'sb-fruit-banana',
    GRAPE:        'sb-fruit-grape',
    WATERMELON:   'sb-fruit-watermelon',
    PLUM:         'sb-fruit-plum',
    APPLE:        'sb-fruit-apple',
    BLUE_CANDY:   'sb-candy-blue',
    GREEN_CANDY:  'sb-candy-green',
    PURPLE_CANDY: 'sb-candy-purple',
    RED_HEART:    'sb-candy-heart',
    LOLLIPOP:     'sb-scatter-lollipop',
    MULTIPLIER:   'sb-multiplier-bomb'
  });

  var SYMBOL_META = Object.freeze({
    BANANA:       { group: 'fruit',   material: 'organic',        label: '香蕉',   scale: 0.92 },
    GRAPE:        { group: 'fruit',   material: 'organic',        label: '葡萄',   scale: 0.84 },
    WATERMELON:   { group: 'fruit',   material: 'organic',        label: '西瓜',   scale: 0.88 },
    PLUM:         { group: 'fruit',   material: 'organic',        label: '李子',   scale: 0.84 },
    APPLE:        { group: 'fruit',   material: 'organic',        label: '苹果',   scale: 0.86 },
    BLUE_CANDY:   { group: 'candy',   material: 'gel',            label: '蓝糖果', scale: 0.78 },
    GREEN_CANDY:  { group: 'candy',   material: 'gel',            label: '绿糖果', scale: 0.80 },
    PURPLE_CANDY: { group: 'candy',   material: 'gel',            label: '紫糖果', scale: 0.78 },
    RED_HEART:    { group: 'candy',   material: 'gel',            label: '红心糖', scale: 0.80 },
    LOLLIPOP:     { group: 'scatter', material: 'hard-candy',     label: '棒棒糖', scale: 0.92 },
    MULTIPLIER:   { group: 'feature', material: 'metallic-candy', label: '倍率',   scale: 0.86 }
  });

  var SYMBOL_MATERIAL = Object.freeze({
    organic:          { saturation: 1.00, highlight: 0.42, transmission: 0.10, rim: 0.08, shadow: 0.18 },
    gel:              { saturation: 1.08, highlight: 0.72, transmission: 0.28, rim: 0.18, shadow: 0.30 },
    'hard-candy':     { saturation: 1.05, highlight: 0.82, transmission: 0.18, rim: 0.24, shadow: 0.22 },
    'metallic-candy': { saturation: 1.02, highlight: 0.88, transmission: 0.06, rim: 0.42, shadow: 0.32 }
  });

  var LIGHT = Object.freeze({
    x: 0.30, y: 0.20,
    keyIntensity: 1.0,
    fillIntensity: 0.82,
    rimIntensity: 0.42,
    shadowIntensity: 0.24,
    specularPower: 72
  });

  /* ============ 抽签池（分离 base / scatter / feature）============ */
  var BASE_SYMBOL_KEYS = Object.freeze([
    'BANANA', 'GRAPE', 'WATERMELON', 'PLUM', 'APPLE',
    'BLUE_CANDY', 'GREEN_CANDY', 'PURPLE_CANDY', 'RED_HEART'
  ]);
  var SCATTER_SYMBOL_KEYS = Object.freeze(['LOLLIPOP']);
  var FEATURE_SYMBOL_KEYS = Object.freeze(['MULTIPLIER']);

  // 权重只在 base 池内部有效
  var BASE_WEIGHTS = Object.freeze({
    BANANA: 14, GRAPE: 14, WATERMELON: 13, PLUM: 13, APPLE: 12,
    BLUE_CANDY: 6, GREEN_CANDY: 6, PURPLE_CANDY: 5, RED_HEART: 5
  });

  var BASE_TOTAL = BASE_SYMBOL_KEYS.reduce(function (s, k) { return s + BASE_WEIGHTS[k]; }, 0);

  function pickFrom(keys, weights) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    if (!weights) return keys[buf[0] % keys.length];
    var n = buf[0] % weights.total;
    var acc = 0;
    for (var i = 0; i < keys.length; i++) {
      acc += weights.map[keys[i]] || 0;
      if (n < acc) return keys[i];
    }
    return keys[0];
  }

  /* 普通抽取：9 个 base 符号，不含 scatter/feature */
  function pickBase() {
    return pickFrom(BASE_SYMBOL_KEYS, { total: BASE_TOTAL, map: BASE_WEIGHTS });
  }

  /* 旧 API 兼容：默认走 base 池 */
  function pickSymbol() {
    return pickBase();
  }

  function getSymbolId(t) { return SYMBOLS[t] || null; }
  function getScale(t) {
    var m = SYMBOL_META[t];
    return m ? m.scale : 1;
  }
  function getMaterial(t) {
    var m = SYMBOL_META[t];
    return m ? SYMBOL_MATERIAL[m.material] : null;
  }

  window.ApexSymbols = Object.freeze({
    SYMBOLS: SYMBOLS,
    SYMBOL_META: SYMBOL_META,
    SYMBOL_MATERIAL: SYMBOL_MATERIAL,
    LIGHT: LIGHT,
    BASE_SYMBOL_KEYS: BASE_SYMBOL_KEYS,
    SCATTER_SYMBOL_KEYS: SCATTER_SYMBOL_KEYS,
    FEATURE_SYMBOL_KEYS: FEATURE_SYMBOL_KEYS,
    pickSymbol: pickSymbol,
    pickBase: pickBase,
    getSymbolId: getSymbolId,
    getScale: getScale,
    getMaterial: getMaterial,
    getAll: function () { return Object.keys(SYMBOLS); }
  });
})();
