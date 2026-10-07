/* Apex · Sweet Bonanza Symbol Registry v1
 * 只定义数据结构，不接入渲染
 */
(function () {
  'use strict';

  // 11 个符号（5 水果 + 4 糖果 + 2 特殊）
  var SYMBOLS = {
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
  };

  var SYMBOL_META = {
    BANANA:       { tier: 'low',  weight: 14, label: '香蕉' },
    GRAPE:        { tier: 'low',  weight: 14, label: '葡萄' },
    WATERMELON:   { tier: 'low',  weight: 13, label: '西瓜' },
    PLUM:         { tier: 'low',  weight: 13, label: '李子' },
    APPLE:        { tier: 'low',  weight: 12, label: '苹果' },
    BLUE_CANDY:   { tier: 'high', weight: 6,  label: '蓝糖果' },
    GREEN_CANDY:  { tier: 'high', weight: 6,  label: '绿糖果' },
    PURPLE_CANDY: { tier: 'high', weight: 5,  label: '紫糖果' },
    RED_HEART:    { tier: 'high', weight: 5,  label: '红心糖' },
    LOLLIPOP:     { tier: 'scatter', weight: 1, label: '棒棒糖' },
    MULTIPLIER:   { tier: 'bonus',   weight: 2, label: '倍率' }
  };

  var SYMBOL_MATERIAL = {
    fruit:  { gloss: 0.55, roughness: 0.38, shadow: 0.18 },
    candy:  { gloss: 0.85, roughness: 0.12, shadow: 0.14 },
    jelly:  { gloss: 0.95, roughness: 0.08, shadow: 0.10, translucency: 0.15 },
    special:{ gloss: 0.90, roughness: 0.10, shadow: 0.12, emissive: true }
  };

  var LIGHT = { x: 0.32, y: 0.24, intensity: 0.92, softness: 0.7 };

  window.ApexSymbols = {
    SYMBOLS: SYMBOLS,
    SYMBOL_META: SYMBOL_META,
    SYMBOL_MATERIAL: SYMBOL_MATERIAL,
    LIGHT: LIGHT,
    getSymbolId: function (t) { return SYMBOLS[t] || null; },
    getAll: function () { return Object.keys(SYMBOLS); }
  };
})();

/* ============ 加权随机抽取 ============ */
(function () {
  'use strict';
  var A = window.ApexSymbols;
  if (!A) return;

  var KEYS = Object.keys(A.SYMBOL_META);
  var TOTAL = 0;
  for (var i = 0; i < KEYS.length; i++) {
    TOTAL += A.SYMBOL_META[KEYS[i]].weight;
  }

  A.pickSymbol = function () {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    var n = buf[0] % TOTAL;
    var acc = 0;
    for (var j = 0; j < KEYS.length; j++) {
      acc += A.SYMBOL_META[KEYS[j]].weight;
      if (n < acc) return KEYS[j];
    }
    return KEYS[0];
  };
})();
