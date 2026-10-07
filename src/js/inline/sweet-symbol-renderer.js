/* Apex · Sweet Bonanza Symbol Renderer
 * 用 DOM API 生成 <svg><use>，避免超长字符串拼接
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';

  function createSymbol(symbolId) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 160');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'sb-symbol');
    var use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + symbolId);
    use.setAttributeNS(XLINK_NS, 'xlink:href', '#' + symbolId);
    svg.appendChild(use);
    return svg;
  }

  function createCell(symbolId, index) {
    var cell = document.createElement('div');
    cell.className = 'sd-sym';
    var svg = createSymbol(symbolId);
    var delay = ((index * 137) % 36) / 10;
    svg.style.setProperty('--sd-sym-delay', delay.toFixed(2) + 's');
    cell.appendChild(svg);
    return cell;
  }

  function renderBoard(container, symbolIds) {
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < symbolIds.length; i++) {
      frag.appendChild(createCell(symbolIds[i], i));
    }
    container.replaceChildren(frag);
  }

  window.ApexSymbolRenderer = Object.freeze({
    createSymbol: createSymbol,
    createCell: createCell,
    renderBoard: renderBoard
  });
})();
