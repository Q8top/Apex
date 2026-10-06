/* Sweet Bonanza route: only the active game card navigates. All other catalog cards remain inert placeholders. */
(function () {
  'use strict';
  var ACTIVE = '糖果连连爆';
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document && !(t.classList && t.classList.contains('apex-game-card'))) t = t.parentNode;
    if (!t || t === document) return;
    var name = t.getAttribute('aria-label') || '';
    var nameEl = t.querySelector('.apex-game-card-name');
    if (!name && nameEl) name = (nameEl.textContent || '').trim();
    if (name === ACTIVE && t.getAttribute('data-active') === 'true') {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'sweet.html';
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
