(function () {
  'use strict';

  var EYE_OPEN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" '
    + 'stroke="currentColor" stroke-width="2">'
    + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>'
    + '<circle cx="12" cy="12" r="3"/></svg>';

  var nodes = document.querySelectorAll('.btn-toggle');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].innerHTML = EYE_OPEN;
  }
})();
