'use strict';
const crypto = require('crypto');
const spec = require('./spec.cjs');
const profiles = require('./profiles.cjs');

const GRID_ROWS = spec.grid.rows;
const GRID_COLS = spec.grid.cols;
const TOTAL = spec.grid.totalCells;

function randInt(max) {
  if (max <= 0 || !Number.isSafeInteger(max)) throw new Error('randInt bad max');
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = Buffer.alloc(4);
  while (true) {
    crypto.randomFillSync(buf);
    const v = buf.readUInt32BE(0);
    if (v < limit) return v % max;
  }
}

function makeRng(mode, opts) {
  opts = opts || {};
  const knobs = profiles.getKnobs(mode || 'real');
  const inFs = !!opts.fsMode;
  const entries = [];
  let total = 0;
  for (const k of spec.symbols.regular) {
    entries.push([k, spec.baseWeights[k]]);
    total += spec.baseWeights[k];
  }
  const scatterW = inFs ? knobs.fsScatterWeight || 0 : knobs.scatterWeight;
  if (scatterW > 0) {
    entries.push([spec.symbols.scatter, scatterW]);
    total += scatterW;
  }
  const multW = inFs ? (knobs.fsMultiplierWeight || 0) : (knobs.multiplierWeight || 0);
  if (multW > 0) {
    entries.push([spec.symbols.multiplier, multW]);
    total += multW;
  }
  return {
    totalWeight: total,
    pick: function () {
      let r = randInt(total);
      for (const e of entries) {
        if (r < e[1]) return e[0];
        r -= e[1];
      }
      return entries[0][0];
    }
  };
}

function makeGrid(rng) {
  const g = new Array(TOTAL);
  for (let i = 0; i < TOTAL; i++) g[i] = rng.pick();
  return g;
}

function idx(r, c) { return r * GRID_COLS + c; }

function findClusters(grid, symbolId) {
  const seen = new Uint8Array(TOTAL);
  const clusters = [];
  for (let i = 0; i < TOTAL; i++) {
    if (seen[i] || grid[i] !== symbolId) continue;
    const queue = [i];
    seen[i] = 1;
    const cluster = [];
    while (queue.length) {
      const p = queue.shift();
      cluster.push(p);
      const r = Math.floor(p / GRID_COLS);
      const c = p % GRID_COLS;
      if (r > 0 && !seen[idx(r-1,c)] && grid[idx(r-1,c)] === symbolId) { seen[idx(r-1,c)] = 1; queue.push(idx(r-1,c)); }
      if (r < GRID_ROWS-1 && !seen[idx(r+1,c)] && grid[idx(r+1,c)] === symbolId) { seen[idx(r+1,c)] = 1; queue.push(idx(r+1,c)); }
      if (c > 0 && !seen[idx(r,c-1)] && grid[idx(r,c-1)] === symbolId) { seen[idx(r,c-1)] = 1; queue.push(idx(r,c-1)); }
      if (c < GRID_COLS-1 && !seen[idx(r,c+1)] && grid[idx(r,c+1)] === symbolId) { seen[idx(r,c+1)] = 1; queue.push(idx(r,c+1)); }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function evaluate(grid) {
  const wins = [];
  const winningPositions = [];
  const multiplierPositions = [];
  let totalMult = 0;
  let scatterCount = 0;
  for (let i = 0; i < TOTAL; i++) {
    if (grid[i] === spec.symbols.scatter) scatterCount++;
    else if (grid[i] === spec.symbols.multiplier) multiplierPositions.push(i);
  }
  for (const sym of spec.symbols.regular) {
    const clusters = findClusters(grid, sym);
    for (const cl of clusters) {
      if (cl.length < spec.minMatch) continue;
      const table = spec.paytable[sym];
      const keys = Object.keys(table).map(Number).sort(function(a,b){return b-a;});
      let payout = 0;
      for (const k of keys) {
        if (cl.length >= k) { payout = table[k]; break; }
      }
      if (payout > 0) {
        wins.push({ symbol: sym, count: cl.length, payoutMultiplier: payout, positions: cl });
        totalMult += payout;
        for (const p of cl) winningPositions.push(p);
      }
    }
  }
  return { wins, winningPositions, payoutMultiplier: totalMult, scatterCount, multiplierPositions };
}

module.exports = { randInt, makeRng, makeGrid, evaluate, findClusters };
