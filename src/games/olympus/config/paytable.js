// Apex Olympus - rules & constants read by the engine.
//
// Cross-checked against every reference in src/games/olympus/engine/:
//   matcher.js   reads MIN_MATCHES
//   round.js     reads SCATTER_TRIGGER, RETRIGGER_TRIGGER, FREE_SPINS_AWARD,
//                COLS, ROWS
//   tumble.js    reads ROWS, COLS
// Anything else that used to live here (RTP targets, payScale, mult chance,
// max-win) is now owned by the per-mode profile:
//   demo -> src/games/olympus/config/math-profile.js
//   real -> functions/games/olympus/config/real-profile.js

window.OlympusPaytable = Object.freeze({

  // ---- win condition ----
  MIN_MATCHES: 8,           // 8+ of the same symbol anywhere on the board

  // ---- board ----
  COLS: 6,
  ROWS: 5,

  // ---- free spins ----
  SCATTER_TRIGGER: 4,       // 4+ scatters trigger the bonus
  RETRIGGER_TRIGGER: 3,     // 3+ scatters during FS grant +5
  FREE_SPINS_AWARD: {
    4: 15,
    5: 20,
    6: 100,
    7: 200
  }
});
