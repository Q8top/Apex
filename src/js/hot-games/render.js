/* Apex hot-games page. Reads window.ApexHotGames.CATS and renders
 * sidebar + grid. Click a card -> ApexModePicker -> ApexWaijaHome. */
(function () {
  'use strict';

  var DATA = window.ApexHotGames;
  if (!DATA || !DATA.CATS || !DATA.CATS.length) {
    console.error('[hot-games] data missing');
    return;
  }

  var sidebar = document.getElementById('hg-sidebar');
  var content = document.getElementById('hg-content');
  if (!sidebar || !content) {
    console.error('[hot-games] dom missing');
    return;
  }

  var currentKey = DATA.CATS[0].key;

  // Preload all game images once we have a UI, using the local asset if
  // present and otherwise the game icon will simply show as the dashed
  // placeholder box.
  function iconPath(id) {
    // Waija icon CDN per provider is not stable; we only ship 12 local
    // webp icons. Fall back to a generic dashed card.
    var known = {
      'waija-pragmaticslots/gates-of-olympus': '/assets/games/olympus.webp',
      'waija-pragmaticslots/sweet-bonanza':    '/assets/games/sweet.webp',
      'waija-pragmaticslots/sugar-rush':       '/assets/games/sugar.webp',
      'waija-pragmaticslots/big-bass-bonanza': '/assets/games/bass.webp',
      'waija-pragmaticslots/the-dog-house':    '/assets/games/dog.webp',
      'waija-pragmaticslots/buffalo-king':     '/assets/games/buffalo.webp',
      'waija-pragmaticslots/wolf-gold':        '/assets/games/wolf.webp',
      'waija-pragmaticslots/fruit-party':      '/assets/games/fruit.webp',
      'waija-bgaming/elvis-frog-in-vegas':     '',
    };
    return known[id] || '';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSidebar() {
    var html = '';
    for (var i = 0; i < DATA.CATS.length; i++) {
      var c = DATA.CATS[i];
      var active = c.key === currentKey ? ' is-active' : '';
      html += '<button type="button" class="hg-cat' + active +
              '" data-cat="' + esc(c.key) + '" aria-label="' + esc(c.label) + '">' +
              '<i class="' + esc(c.icon) + '" aria-hidden="true"></i>' +
              '<span>' + esc(c.label) + '</span>' +
              '</button>';
    }
    sidebar.innerHTML = html;
  }

  function renderGrid() {
    var cat = null;
    for (var i = 0; i < DATA.CATS.length; i++) {
      if (DATA.CATS[i].key === currentKey) { cat = DATA.CATS[i]; break; }
    }
    if (!cat || !cat.games || !cat.games.length) {
      content.innerHTML = '<div class="hg-empty">\u6682\u65E0\u6E38\u620F</div>';
      return;
    }
    var html = '<div class="hg-grid">';
    for (var j = 0; j < cat.games.length; j++) {
      var g = cat.games[j];
      var src = iconPath(g.id);
      var img = src
        ? '<img src="' + esc(src) + '" alt="" loading="lazy" draggable="false">'
        : '';
      html += '<div class="hg-card" data-game="' + esc(g.id) +
              '" data-name="' + esc(g.n) + '">' +
              '<span class="hg-card-icon">' + img + '</span>' +
              '<span class="hg-card-name">' + esc(g.n) + '</span>' +
              '</div>';
    }
    html += '</div>';
    content.innerHTML = html;
  }

  function onClickSidebar(e) {
    var btn = e.target && e.target.closest ? e.target.closest('.hg-cat') : null;
    if (!btn) return;
    var key = btn.getAttribute('data-cat');
    if (!key || key === currentKey) return;
    currentKey = key;
    renderSidebar();
    renderGrid();
    content.scrollTop = 0;
  }

  function onClickGrid(e) {
    var card = e.target && e.target.closest ? e.target.closest('.hg-card') : null;
    if (!card) return;
    var id = card.getAttribute('data-game');
    var name = card.getAttribute('data-name');
    if (!id) return;
    if (window.ApexModePicker && typeof window.ApexModePicker.open === 'function') {
      window.ApexModePicker.open({ game: { id: id, n: name, waijaId: id } });
    }
  }

  sidebar.addEventListener('click', onClickSidebar);
  content.addEventListener('click', onClickGrid);

  renderSidebar();
  renderGrid();
})();
