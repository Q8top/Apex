/* Sweet Bonanza 详情页路由 · 事件委托 · 不改 apex-app.js */
(function () {
  'use strict';

  /* 游戏名 → 详情页 */
  var ROUTES = {
    '糖果连连爆': 'sweet.html'
  };

  function resolve(card) {
    var label = card.getAttribute('aria-label') || '';
    if (ROUTES[label]) return ROUTES[label];
    var nameEl = card.querySelector('.apex-game-card-name');
    if (nameEl) {
      var txt = (nameEl.textContent || '').trim();
      if (ROUTES[txt]) return ROUTES[txt];
    }
    return null;
  }

  function onCapture(e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.classList && t.classList.contains('apex-game-card')) {
        var dest = resolve(t);
        if (dest) {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = dest;
          return;
        }
        return;
      }
      t = t.parentNode;
    }
  }

  document.addEventListener('click', onCapture, true);
  document.addEventListener('auxclick', function (e) {
    if (e.button === 1) onCapture(e);
  }, true);
})();
