/* Apex · Symbol Renderer Facade（C-3 渲染门面）
 *
 * 职责：源优先级 + 单源降级 + PLACEHOLDER 兜底 + bootCheck()。
 *
 * 源优先级：
 *   1) ApexSymbolsV2.get()         —— 新 V2 SVG（uid 隔离）
 *   2) ApexEngineSymbolRender      —— 旧引擎分发（内部再走 FruitSvg / painters）
 *   3) PLACEHOLDER                 —— 灰底 + 首字母，永不空白
 *
 * 契约：
 *   - render(id, opts) 恒返回含 <svg> 的字符串（除非 id 完全非法，返回空 PLACEHOLDER）
 *   - bootCheck() 返回结构化报告，不抛错
 *   - 不改 ApexSymbolsV2 / ApexEngineSymbolRender 语义
 */
(function () {
  'use strict';

  var _uid = 0;
  function nextUid() {
    _uid += 1;
    return 'rf-' + _uid.toString(36);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildClass(opts) {
    var state = opts.state || 'idle';
    var cls = 'slot-symbol slot-symbol--' + state;
    if (opts.highlighted) cls += ' slot-symbol--highlighted';
    return cls;
  }

  function sizeOf(opts) {
    return opts.size == null ? '100%' : opts.size;
  }

  function injectAttrs(svg, opts) {
    if (!svg || svg.indexOf('<svg') < 0) return svg;
    // 已经带 class="slot-symbol 的，不重复注入
    if (svg.indexOf('class="slot-symbol') >= 0) return svg;
    var styleAttr = ' class="' + buildClass(opts) + '" aria-hidden="true"'
      + ' style="width:' + sizeOf(opts) + ';height:' + sizeOf(opts) + ';" ';
    return svg.replace(/<svg(\s|>)/, '<svg' + styleAttr + '$1');
  }

  function placeholder(symbolId, opts) {
    opts = opts || {};
    var label = symbolId ? String(symbolId).charAt(0).toUpperCase() : '?';
    var size = sizeOf(opts);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100"'
      + ' xmlns="http://www.w3.org/2000/svg"'
      + ' preserveAspectRatio="xMidYMid meet"'
      + ' aria-hidden="true" class="' + buildClass(opts) + ' slot-symbol--placeholder"'
      + ' data-placeholder="' + esc(symbolId) + '">'
      + '<rect x="6" y="6" width="88" height="88" rx="14" fill="#3A2F4A" stroke="#8B7BA8" stroke-width="2"/>'
      + '<text x="50" y="60" text-anchor="middle" font-family="Arial, sans-serif"'
      + ' font-size="34" font-weight="700" fill="#C8B8DD">' + esc(label) + '</text>'
      + '</svg>';
  }

  function tryV2(symbolId, opts) {
    var V2 = window.ApexSymbolsV2;
    if (!V2 || typeof V2.has !== 'function' || typeof V2.get !== 'function') return null;
    try {
      if (!V2.has(symbolId)) return null;
      var svg = V2.get(symbolId, nextUid());
      if (!svg || svg.indexOf('<svg') < 0) return null;
      return injectAttrs(svg, opts);
    } catch (e) {
      return null;
    }
  }

  function tryLegacy(symbolId, opts) {
    var ER = window.ApexEngineSymbolRender;
    if (!ER || typeof ER.render !== 'function') return null;
    try {
      var out = ER.render(symbolId, opts);
      if (!out || out.indexOf('<svg') < 0) return null;
      return out;
    } catch (e) {
      return null;
    }
  }

  function resolveSource(symbolId) {
    var V2 = window.ApexSymbolsV2;
    if (V2 && typeof V2.has === 'function') {
      try { if (V2.has(symbolId)) return 'v2'; } catch (e) {}
    }
    var ER = window.ApexEngineSymbolRender;
    if (ER && typeof ER.has === 'function') {
      try { if (ER.has(symbolId)) return 'legacy'; } catch (e) {}
    }
    return 'placeholder';
  }

  function render(symbolId, opts) {
    opts = opts || {};
    var out = tryV2(symbolId, opts);
    if (out) return out;
    out = tryLegacy(symbolId, opts);
    if (out) return out;
    return placeholder(symbolId, opts);
  }

  function bootCheck() {
    var report = {
      sources: {
        v2: !!(window.ApexSymbolsV2 && typeof window.ApexSymbolsV2.get === 'function'),
        legacy: !!(window.ApexEngineSymbolRender && typeof window.ApexEngineSymbolRender.render === 'function'),
        locked: !!(window.ApexSymbolsLocked && (typeof window.ApexSymbolsLocked.list === 'function' || typeof window.ApexSymbolsLocked.get === 'function'))
      },
      symbols: {},
      missing: [],
      totalChecked: 0,
      ok: true
    };

    var ids = [];
    try {
      var SL = window.ApexSymbolsLocked;
      if (SL && typeof SL.list === 'function') ids = SL.list();
      else if (SL && SL.SYMBOLS) ids = Object.keys(SL.SYMBOLS);
    } catch (e) {}

    if (ids.length === 0) {
      // 退回 V2 list + legacy list
      try {
        if (window.ApexSymbolsV2 && typeof window.ApexSymbolsV2.list === 'function') {
          ids = window.ApexSymbolsV2.list();
        }
      } catch (e) {}
    }

    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var src = resolveSource(id);
      var sample = null;
      try { sample = render(id, { size: '1px', state: 'idle' }); } catch (e) {}
      var svgOk = !!(sample && sample.indexOf('<svg') >= 0);
      var renderable = svgOk && src !== 'placeholder';
      report.symbols[id] = { source: src, renderable: renderable };
      if (!renderable) {
        report.missing.push(id);
        report.ok = false;
      }
      report.totalChecked++;
    }

    // 无任何真实源时，整体标记为不通过
    if (!report.sources.v2 && !report.sources.legacy) {
      report.ok = false;
    }

    // 校验 PLACEHOLDER 自身可生成
    try {
      var ph = placeholder('__test__', { size: '1px' });
      if (!ph || ph.indexOf('<svg') < 0) {
        report.ok = false;
        report.placeholderBroken = true;
      }
    } catch (e) {
      report.ok = false;
      report.placeholderBroken = true;
    }

    return Object.freeze(report);
  }

  window.ApexRenderer = Object.freeze({
    render: render,
    resolveSource: resolveSource,
    placeholder: placeholder,
    bootCheck: bootCheck
  });
})();
