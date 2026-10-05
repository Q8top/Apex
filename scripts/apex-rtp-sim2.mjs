#!/usr/bin/env node
/* Apex · Olympus RTP 模拟器 v3 */
import crypto from 'node:crypto';

const COLS = 6, ROWS = 5, N = COLS * ROWS;
let rbuf = new Uint32Array(16384), rptr = rbuf.length;
function rnd() {
  if (rptr >= rbuf.length) { crypto.getRandomValues(rbuf); rptr = 0; }
  return rbuf[rptr++] / 4294967296;
}

function pickWeighted(pool, totalW) {
  let r = rnd() * totalW;
  for (const p of pool) { r -= p.w; if (r <= 0) return p.id; }
  return pool[pool.length - 1].id;
}

function findWins(grid, balls, cfg) {
  const visited = new Uint8Array(N);
  const wins = [];
  for (let s = 0; s < N; s++) {
    if (visited[s]) continue;
    if (balls[s] !== undefined) { visited[s] = 1; continue; }
    const sym = grid[s];
    if (sym === 'scatter') { visited[s] = 1; continue; }
    const stack = [s], group = [];
    visited[s] = 1;
    while (stack.length) {
      const cur = stack.pop();
      group.push(cur);
      const r = (cur / COLS) | 0, c = cur % COLS;
      const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [di, dj] of DIRS) {
        const nr = r + di, nc = c + dj;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const ni = nr * COLS + nc;
        if (visited[ni] || balls[ni] !== undefined || grid[ni] !== sym) continue;
        visited[ni] = 1;
        stack.push(ni);
      }
    }
    const HIGH = { zeus: 1, crown: 1, chalice: 1, ring: 1, hourglass: 1 };
    const minN = HIGH[sym] ? 3 : (cfg.gemMin || 5);
    if (group.length >= minN) wins.push({ sym, count: group.length, positions: group });
  }
  return wins;
}

function dropDown(grid, pool, totalW) {
  for (let col = 0; col < COLS; col++) {
    const stack = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      const v = grid[r * COLS + col];
      if (v !== null) stack.push(v);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      const i = r * COLS + col;
      grid[i] = stack.length ? stack.shift() : pickWeighted(pool, totalW);
    }
  }
}

const VALS = [2,2,2,3,3,4,5,6,8,10,15,20,50];

function simulateSpin(cfg, isFS) {
  const grid = [];
  for (let i = 0; i < N; i++) grid.push(pickWeighted(cfg.pool, cfg.totalW));
  const balls = {};
  let total = 0;
  let ballContribution = 0;

  while (true) {
    let bcnt = 0; for (const k in balls) bcnt++;
    const rate = isFS ? cfg.dropBallRateFS : 0;
    if (rate > 0 && rnd() < rate && bcnt < 3) {
      const cand = [];
      for (let i = 0; i < N; i++) if (balls[i] === undefined) cand.push(i);
      if (cand.length) {
        const idx = cand[(rnd() * cand.length) | 0];
        balls[idx] = VALS[(rnd() * VALS.length) | 0];
      }
    }
    const wins = findWins(grid, balls, cfg);
    if (wins.length === 0) break;

    let chainWin = 0;
    for (const w of wins) {
      const pay = cfg.paytable[w.sym] || [0,0,0,0];
      chainWin += (pay[Math.min(w.count - 3, 7)] || 0) * (cfg.payScale || 1);
    }
    let chainMult = 0; for (const k in balls) chainMult += balls[k];
    const boosted = chainWin * (chainMult || 1);
    total += boosted;
    if (chainMult > 0) ballContribution += (boosted - chainWin);

    /* 球用完清空 */
    for (const k in balls) delete balls[k];

    for (const w of wins) for (const p of w.positions) grid[p] = null;
    dropDown(grid, cfg.pool, cfg.totalW);
  }

  let scatters = 0;
  for (let i = 0; i < N; i++) if (grid[i] === 'scatter') scatters++;
  return { win: total, scatters, isFS: !!isFS, ballContribution };
}

function simulateSession(cfg, paidSpins, label) {
  let totalBet = 0, totalWin = 0, hitCount = 0, fsTriggered = 0, totalSpins = 0, fsSpinsTotal = 0;
  let i = 0;
  const t0 = Date.now();
  while (i < paidSpins) {
    i++; totalBet++; totalSpins++;
    const r = simulateSpin(cfg, false);
    totalWin += r.win;
    if (r.win > 0) hitCount++;
    if (r.scatters >= 4) {
      fsTriggered++;
      let fs = 15, retrig = 0;
      while (fs > 0) {
        fs--; totalSpins++; fsSpinsTotal++;
        const fr = simulateSpin(cfg, true);
        totalWin += fr.win;
        if (fr.win > 0) hitCount++;
        if (fr.scatters >= 4 && retrig < 1) { fs += 15; retrig++; }
      }
    }
    if (i % 1000 === 0) {
      process.stdout.write('\r  ' + label + ' ' + i + '/' + paidSpins + ' (' + ((Date.now()-t0)/1000).toFixed(1) + 's)   ');
    }
  }
  process.stdout.write('\n');
  return {
    rtp:         (totalWin / totalBet * 100).toFixed(2) + '%',
    hitRate:     (hitCount / totalSpins * 100).toFixed(2) + '%',
    fsRate:      (fsTriggered / paidSpins * 100).toFixed(3) + '%',
    totalSpins,
    fsSpinsTotal
  };
}

/* tier 索引：count-3 → [3,4,5,6,7,8,9,10+] */
const PAYTABLE = {
  'zeus':       [1, 2, 5, 10, 25, 50, 100, 250],
  'crown':      [0.6, 1.5, 3, 6, 12, 25, 50, 100],
  'chalice':    [0.4, 1, 2, 5, 10, 20, 40, 80],
  'ring':       [0.3, 0.8, 1.5, 4, 8, 15, 30, 60],
  'hourglass':  [0.2, 0.5, 1, 2, 5, 10, 20, 40],
  'gem-red':    [0, 0, 0.5, 1, 2.5, 5, 10, 20],
  'gem-purple': [0, 0, 0.4, 0.8, 2, 4, 8, 16],
  'gem-blue':   [0, 0, 0.3, 0.6, 1.5, 3, 6, 12],
  'gem-green':  [0, 0, 0.2, 0.5, 1, 2.5, 5, 10],
  'gem-yellow': [0, 0, 0.2, 0.4, 0.8, 2, 4, 8]
};

function mkPool(weights) {
  const pool = []; let totalW = 0;
  for (const k in weights) { pool.push({ id: k, w: weights[k] }); totalW += weights[k]; }
  return { pool, totalW };
}

const BASE_W = {
  scatter: 8, zeus: 0.5, crown: 1, chalice: 3, ring: 5,
  hourglass: 10, 'gem-red': 20, 'gem-purple': 30, 'gem-blue': 40, 'gem-green': 50, 'gem-yellow': 60
};
const B = mkPool(BASE_W);

const spins = parseInt(process.argv[2] || '20000', 10);

const REAL = { pool: B.pool, totalW: B.totalW, paytable: PAYTABLE, dropBallRateFS: 0.15, payScale: 1.22, gemMin: 6 };
const DEMO = { pool: B.pool, totalW: B.totalW, paytable: PAYTABLE, dropBallRateFS: 0.20, payScale: 0.72, gemMin: 3 };

console.log('=== v4 双模式 / spins =', spins, '===\n');

console.log('--- REAL (payScale 2.4, gemMin 5) ---');
const r1 = simulateSession(REAL, spins, 'real');
console.log('RTP:      ', r1.rtp, ' [目标 88-93%]');
console.log('命中率:   ', r1.hitRate, ' [目标 20-35%]');
console.log('FS触发:   ', r1.fsRate);
console.log('总旋转:   ', r1.totalSpins);
console.log('');

console.log('--- DEMO (payScale 4.0, gemMin 4) ---');
const r2 = simulateSession(DEMO, spins, 'demo');
console.log('RTP:      ', r2.rtp, ' [目标 130-250%]');
console.log('命中率:   ', r2.hitRate, ' [目标 45-60%]');
console.log('FS触发:   ', r2.fsRate);
console.log('总旋转:   ', r2.totalSpins);
