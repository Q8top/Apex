// Apex Olympus - tumble tunables (safe to edit, engine reads these)

window.OlympusTumbleConfig = (function () {
  'use strict';
  return Object.freeze({
    // Probability that a single refilled cell becomes a multiplier
    // symbol instead of a normal symbol. Try 0.02-0.06.
    MULT_CHANCE: 0.035,

    // Hard cap on tumble steps per spin (safety)
    MAX_STEPS: 40,

    // When true, multiplier symbols on the board are summed and
    // applied to the round total after the last step.
    APPLY_MULT: true
  });
})();
