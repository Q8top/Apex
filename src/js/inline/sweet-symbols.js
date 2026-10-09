/* Apex · Symbol Registry v4
 * 只负责资产数据，不负责抽签概率
 *
 * 不变量：
 *   - SYMBOL_META / SYMBOL_MATERIAL 深层冻结，运行时不可改
 *   - getSymbolId / getScale / getMaterial 用 hasOwnProperty 查表，
 *     避免命中原型链（'__proto__' / 'constructor'）
 *   - BASE_SYMBOL_KEYS 每项在 SYMBOLS / SYMBOL_META / BASE_WEIGHTS 中
 *     必须存在且权重为正 —— init 阶段自检，缺失即抛错
 *   - pickFrom 复用模块级 RAND_BUF，不在热路径 new
 *   - pickBase 复用模块级 WEIGHTS_REF，不每次建对象
 */
(function () {
  'use strict';

  var RAND_BUF = new Uint32Array(1);
  var owns = Object.prototype.hasOwnProperty;

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

  var SYMBOL_META_RAW = {
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
  };

  var SYMBOL_MATERIAL_RAW = {
    organic:          { saturation: 1.00, highlight: 0.42, transmission: 0.10, rim: 0.08, shadow: 0.18 },
    gel:              { saturation: 1.08, highlight: 0.72, transmission: 0.28, rim: 0.18, shadow: 0.30 },
    'hard-candy':     { saturation: 1.05, highlight: 0.82, transmission: 0.18, rim: 0.24, shadow: 0.22 },
    'metallic-candy': { saturation: 1.02, highlight: 0.88, transmission: 0.06, rim: 0.42, shadow: 0.32 }
  };

  // 深层冻结
  Object.keys(SYMBOL_META_RAW).forEach(function (k) {
    Object.freeze(SYMBOL_META_RAW[k]);
  });
  Object.freeze(SYMBOL_META_RAW);
  Object.keys(SYMBOL_MATERIAL_RAW).forEach(function (k) {
    Object.freeze(SYMBOL_MATERIAL_RAW[k]);
  });
  Object.freeze(SYMBOL_MATERIAL_RAW);

  var SYMBOL_META = SYMBOL_META_RAW;
  var SYMBOL_MATERIAL = SYMBOL_MATERIAL_RAW;

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

  /* ============ init 自检：BASE_SYMBOL_KEYS 与三张表对齐 ============ */
  (function selfCheck() {
    var total = 0;
    for (var i = 0; i < BASE_SYMBOL_KEYS.length; i++) {
      var k = BASE_SYMBOL_KEYS[i];
      if (!owns.call(SYMBOLS, k)) {
        throw new Error('symbols: BASE_SYMBOL_KEYS 中的 ' + k + ' 未在 SYMBOLS 定义');
      }
      if (!owns.call(SYMBOL_META, k)) {
        throw new Error('symbols: BASE_SYMBOL_KEYS 中的 ' + k + ' 未在 SYMBOL_META 定义');
      }
      var w = BASE_WEIGHTS[k];
      if (!(w > 0)) {
        throw new Error('symbols: BASE_SYMBOL_KEYS 中的 ' + k + ' 权重缺失或非正');
      }
      total += w;
    }
    if (total <= 0) throw new Error('symbols: BASE_TOTAL <= 0');
  })();

  var BASE_TOTAL = BASE_SYMBOL_KEYS.reduce(function (s, k) {
    return s + BASE_WEIGHTS[k];
  }, 0);

  // pickBase 复用同一引用，避免每次调用 new
  var BASE_POOL_REF = Object.freeze({ total: BASE_TOTAL, map: BASE_WEIGHTS });

  function pickFrom(keys, weights) {
    crypto.getRandomValues(RAND_BUF);
    if (!weights) return keys[RAND_BUF[0] % keys.length];
    var n = RAND_BUF[0] % weights.total;
    var acc = 0;
    for (var i = 0; i < keys.length; i++) {
      var w = weights.map[keys[i]];
      if (!(w > 0)) throw new Error('symbols: pickFrom 权重缺失 ' + keys[i]);
      acc += w;
      if (n < acc) return keys[i];
    }
    return keys[0];
  }

  /* 普通抽取：9 个 base 符号，不含 scatter/feature */
  function pickBase() {
    return pickFrom(BASE_SYMBOL_KEYS, BASE_POOL_REF);
  }

  /* 旧 API 兼容：默认走 base 池 */
  function pickSymbol() {
    return pickBase();
  }

  function getSymbolId(t) {
    if (typeof t !== 'string' || !owns.call(SYMBOLS, t)) return null;
    return SYMBOLS[t];
  }

  var ID_TO_KEY = (function () {
    var m = {};
    Object.keys(SYMBOLS).forEach(function (k) {
      m[SYMBOLS[k]] = k;
    });
    return Object.freeze(m);
  })();

  function getScaleById(symbolId) {
    if (typeof symbolId !== 'string' || !owns.call(ID_TO_KEY, symbolId)) return 1;
    var k = ID_TO_KEY[symbolId];
    if (!owns.call(SYMBOL_META, k)) return 1;
    var s = SYMBOL_META[k].scale;
    return (typeof s === 'number' && Number.isFinite(s)) ? s : 1;
  }

  function getScale(t) {
    if (typeof t !== 'string' || !owns.call(SYMBOL_META, t)) return 1;
    var s = SYMBOL_META[t].scale;
    return (typeof s === 'number' && Number.isFinite(s)) ? s : 1;
  }

  function getMaterial(t) {
    if (typeof t !== 'string' || !owns.call(SYMBOL_META, t)) return null;
    var mat = SYMBOL_META[t].material;
    if (typeof mat !== 'string' || !owns.call(SYMBOL_MATERIAL, mat)) return null;
    return SYMBOL_MATERIAL[mat];
  }

  window.ApexSymbols = Object.freeze({
    SYMBOLS: SYMBOLS,
    SYMBOL_META: SYMBOL_META,
    SYMBOL_MATERIAL: SYMBOL_MATERIAL,
    LIGHT: LIGHT,
    BASE_SYMBOL_KEYS: BASE_SYMBOL_KEYS,
    BASE_WEIGHTS: BASE_WEIGHTS,
    BASE_TOTAL: BASE_TOTAL,
    SCATTER_SYMBOL_KEYS: SCATTER_SYMBOL_KEYS,
    FEATURE_SYMBOL_KEYS: FEATURE_SYMBOL_KEYS,
    pickSymbol: pickSymbol,
    pickBase: pickBase,
    getSymbolId: getSymbolId,
    getScaleById: getScaleById,
    getScale: getScale,
    getMaterial: getMaterial,
    getAll: function () { return Object.keys(SYMBOLS); }
  });
})();
