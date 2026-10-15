// Apex Olympus - paytable and rules
// Engine follows Pay-Anywhere: N or more of the same symbol anywhere on
// the 6x5 board triggers a win (no adjacency required, matching original
// Gates of Olympus).

window.OlympusPaytable = Object.freeze({

  // --- win condition ---
  MIN_MATCHES: 8,           // need 8+ of same symbol anywhere
  MAX_WIN_X: 5000,          // max win = 5000x bet (original cap)

  // --- pay tiers for normal symbols (bet multipliers) ---
  // Each row [8, 9, 10, 11, 12+] is read from symbols.js sym-N.pay

  // --- free spins ---
  SCATTER_TRIGGER: 4,       // 4+ scatter triggers free spins
  FREE_SPINS_AWARD: {
    4: 15,
    5: 20,
    6: 100
  },

  // --- multiplier ---
  // Multiplier symbols drop as painted gems (sym-0..sym-3). Their
  // face value is defined in symbols.js; after a tumble sequence ends
  // all values are summed, then applied to the total win.
  MULTIPLIER_SUM_MODE: "add",   // values added together (per original)

  // --- paytable scaling (used by round.js) ---
  // Applied to every symbol pay row so the same board layout can
  // produce two different RTPs (real vs demo) without changing the
  // weights. Tuned in /tmp/oly-tune.py.
  RTP_SCALE_REAL: 0.4200,
  RTP_SCALE_DEMO: 0.1760,

  // --- tumble multiplier ---
  MULT_CHANCE_REAL: 0.010,
  MULT_CHANCE_DEMO: 0.015,

  // --- RTP targets (fixed, do not silently change) ---
  RTP: {
    DEMO_MIN: 1.30,         // 130%
    DEMO_MAX: 2.50,         // 250%
    REAL_MIN: 0.88,         // 88%
    REAL_MAX: 0.93,         // 93%
    REAL_HARD_CAP: 0.94     // 94% - never exceed
  },

  HIT_RATE: {
    DEMO_MIN: 0.45,         // 45%
    DEMO_MAX: 0.60,
    REAL_MIN: 0.20,
    REAL_MAX: 0.35
  },

  // --- board ---
  COLS: 6,
  ROWS: 5,
  GRID: 30,

  // --- scatter handling ---
  // Scatter pays nothing on its own, only triggers free spins.
  SCATTER_PAYS: false
});
