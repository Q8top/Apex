/* Apex - Near-miss highlighter (P2-4)
 *
 * When a regular symbol appears exactly (threshold - 1) times
 * (7 of 8 required), flag those cells with a soft glow so the
 * player perceives "so close".
 *
 * Pure logic: given a 30-length types array, returns an array of
 * indices to highlight. The caller applies the class.
 */
(function () {
  'use strict';

  var TRIGGER_COUNT = 7;   // threshold is 8

  function computeHighlightIndices(types, opts) {
    opts = opts || {};
    var triggerCount = Number.isSafeInteger(opts.triggerCount)
      ? opts.triggerCount : TRIGGER_COUNT;
    var isRegular = typeof opts.isRegular === 'function' ? opts.isRegular : null;

    if (!Array.isArray(types) || types.length === 0) return [];
    if (triggerCount <= 0) return [];

    var counts = {};
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      if (t == null) continue;
      counts[t] = (counts[t] || 0) + 1;
    }

    var near = {};
    var keys = Object.keys(counts);
    for (var k = 0; k < keys.length; k++) {
      var type = keys[k];
      if (counts[type] !== triggerCount) continue;
      if (isRegular && !isRegular(type)) continue;
      near[type] = 1;
    }
    if (Object.keys(near).length === 0) return [];

    var out = [];
    for (var j = 0; j < types.length; j++) {
      if (near[types[j]]) out.push(j);
    }
    return out;
  }

  function applyHighlight(boardEl, types, opts) {
    if (!boardEl || typeof boardEl.querySelectorAll !== 'function') return 0;
    var indices = computeHighlightIndices(types, opts);
    if (indices.length === 0) return 0;
    var cells = boardEl.querySelectorAll('.sd-sym');
    if (!cells || cells.length === 0) return 0;
    var applied = 0;
    for (var i = 0; i < indices.length; i++) {
      var c = cells[indices[i]];
      if (c && c.classList) { c.classList.add('is-near-miss'); applied++; }
    }
    return applied;
  }

  function clearHighlight(boardEl) {
    if (!boardEl || typeof boardEl.querySelectorAll !== 'function') return 0;
    var live = boardEl.querySelectorAll('.is-near-miss');
    var n = 0;
    for (var i = 0; i < live.length; i++) {
      if (live[i].classList) { live[i].classList.remove('is-near-miss'); n++; }
    }
    return n;
  }

  if (typeof window !== 'undefined') {
    window.ApexNearMiss = Object.freeze({
      computeHighlightIndices: computeHighlightIndices,
      applyHighlight: applyHighlight,
      clearHighlight: clearHighlight,
      TRIGGER_COUNT: TRIGGER_COUNT
    });
  }
})();
