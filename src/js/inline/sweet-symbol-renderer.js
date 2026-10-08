/* Apex · Sweet Bonanza Symbol Renderer
 * 用 DOM API 生成 <svg><use>，避免超长字符串拼接
 *
 * 不变量：
 *   - symbolId 必须是非空字符串；非法返回 null，不生成 <use href="#null">
 *   - renderBoard / renderGrid 要求第二参为数组，否则跳过
 *   - 单格渲染失败不影响整盘渲染（跳过，不抛错）
 *   - 无 XSS 面：symbolId 只进入 setAttribute，不拼 HTML 字符串
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // Step 6b：优先使用新引擎渲染器（src/js/engine/symbols-render.js）
  // 若不可用，则回退到本文件的 <svg><use> 方式
  function tryEngineRender(symbolId, opts) {
    if (typeof window === 'undefined') return '';
    var R = window.ApexEngineSymbolRender;
    if (!R || typeof R.render !== 'function') return '';
    if (!R.has(symbolId)) return '';
    try {
      return R.render(symbolId, opts || {});
    } catch (e) {
      return '';
    }
  }
  var XLINK_NS = 'http://www.w3.org/1999/xlink';

  // 视觉错觉算法：137 为质数，对 36 取模保证分布均匀；
  // /10 把 [0,36) 映射到 [0,3.6) 秒的入场延迟
  var STAGGER_MUL = 137;
  var STAGGER_MOD = 36;
  var STAGGER_DIV = 10;

  function safeId(v) {
    return (typeof v === 'string' && v.length > 0) ? v : null;
  }

  function createSymbol(symbolId) {
    var id = safeId(symbolId);
    if (!id) return null;

    // 优先：用新引擎渲染器（返回完整 SVG 字符串 → 包成 DOM）
    var engineHtml = tryEngineRender(id, { size: '100%' });
    if (engineHtml) {
      var wrap = document.createElement('div');
      wrap.className = 'sb-symbol-wrap';
      wrap.style.width = '100%';
      wrap.style.height = '100%';
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.justifyContent = 'center';
      wrap.innerHTML = engineHtml;
      return wrap;
    }

    // 回退：旧的 <svg><use> 方式
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 160');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'sb-symbol');

    var use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + id);
    // 兼容老 Safari：同时写 xlink:href（新标准已废弃但无害）
    try { use.setAttributeNS(XLINK_NS, 'xlink:href', '#' + id); } catch (e) {}
    svg.appendChild(use);
    return svg;
  }

  function stagger(index) {
    var n = Number(index);
    if (!Number.isFinite(n)) n = 0;
    return (((n * STAGGER_MUL) % STAGGER_MOD) / STAGGER_DIV).toFixed(2) + 's';
  }

  function createCell(symbolId, index) {
    var svg = createSymbol(symbolId);
    if (!svg) return null;

    var cell = document.createElement('div');
    cell.className = 'sd-sym';

    svg.style.setProperty('--sd-sym-delay', stagger(index));

    if (window.ApexSymbols && typeof window.ApexSymbols.getScaleById === 'function') {
      var sc = window.ApexSymbols.getScaleById(symbolId);
      if (typeof sc === 'number' && Number.isFinite(sc)) {
        svg.style.setProperty('--symbol-scale', String(sc));
      }
    }

    cell.appendChild(svg);
    return cell;
  }

  function renderBoard(container, symbolIds) {
    if (!container) return false;
    if (!Array.isArray(symbolIds)) return false;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < symbolIds.length; i++) {
      var cell = createCell(symbolIds[i], i);
      if (cell) frag.appendChild(cell);
    }
    container.replaceChildren(frag);
    return true;
  }

  function renderGrid(container, symbolTypes) {
    if (!container) return false;
    if (!Array.isArray(symbolTypes)) return false;
    if (!window.ApexSymbols || typeof window.ApexSymbols.getSymbolId !== 'function') {
      return false;
    }

    var frag = document.createDocumentFragment();
    for (var i = 0; i < symbolTypes.length; i++) {
      var id = window.ApexSymbols.getSymbolId(symbolTypes[i]);
      var cell = createCell(id, i);
      if (cell) frag.appendChild(cell);
    }
    container.replaceChildren(frag);
    return true;
  }

  window.ApexSymbolRenderer = Object.freeze({
    createSymbol: createSymbol,
    createCell: createCell,
    renderBoard: renderBoard,
    renderGrid: renderGrid
  });
})();
