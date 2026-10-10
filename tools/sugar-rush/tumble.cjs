'use strict';
const base = require('./base.cjs');
const spec = require('./spec.cjs');

const GRID_ROWS = spec.grid.rows;
const GRID_COLS = spec.grid.cols;
const TOTAL = spec.grid.totalCells;
const MAX_CASCADES = 60;

function idx(r, c) { return r * GRID_COLS + c; }

function removePositions(grid, positions) {
  const out = grid.slice();
  for (const p of positions) out[p] = null;
  return out;
}

function refillColumns(grid, rng) {
  const out = grid.slice();
  for (let c = 0; c < GRID_COLS; c++) {
    const colVals = [];
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      const v = out[idx(r, c)];
      if (v !== null) colVals.push(v);
    }
    while (colVals.length < GRID_ROWS) colVals.push(rng.pick());
    for (let r = 0; r < GRID_ROWS; r++) {
      out[idx(r, c)] = colVals[GRID_ROWS - 1 - r];
    }
  }
  return out;
}

function tumble(grid, rng) {
  let cur = grid.slice();
  let totalMult = 0;
  let cascades = 0;
  const steps = [];
  let safety = 0;
  while (safety++ < MAX_CASCADES) {
    const r = base.evaluate(cur);
    if (r.payoutMultiplier <= 0) break;
    cascades++;
    totalMult += r.payoutMultiplier;
    steps.push({ removed: r.winningPositions.slice(), mult: r.payoutMultiplier });
    cur = refillColumns(removePositions(cur, r.winningPositions), rng);
  }
  if (safety >= MAX_CASCADES) throw new Error('tumble runaway');
  return { totalMult: totalMult, cascades: cascades, steps: steps, finalGrid: cur };
}

module.exports = { tumble: tumble, refillColumns: refillColumns, removePositions: removePositions };
