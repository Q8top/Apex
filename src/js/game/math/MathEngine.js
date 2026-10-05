/* ============================================================
   Apex Olympius · MathEngine.js
   核心数学引擎：Grid / Pay Anywhere / Win / Tumble / Multiplier / FS

   规则：
   - 6×5 网格
   - Pay Anywhere：任意位置 ≥8 个同符号即中奖
   - WILD 替代除 SCATTER 外任意符号
   - SCATTER 不参与普通赔付，≥4 触发 FS
   - 中奖后 Tumble（消除+补位），循环至无中奖
   - 每次 Tumble 检查倍率触发，倍率累加
   - 最终 = baseWin × totalMultiplier + FS收益 + Scatter赔付
   ============================================================ */

import { RNG } from './RNG.js';
import { GRID } from '../config/gameConfig.js';
import { WILD_ID, SCATTER_ID, getWeightArray } from '../config/symbolConfig.js';
import { getScaledMultiplier, getScatterMultiplier, PAY_SCALE, MIN_MATCH } from '../config/paytableConfig.js';
import * as Mult from '../config/multiplierConfig.js';
import * as FS from '../config/freeSpinConfig.js';

const { COLS, ROWS } = GRID;
const MAX_TUMBLES = 40;

/* ============ 网格生成 ============ */
export function generateGrid(rng, mode) {
  const w = getWeightArray(mode);
  const g = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(rng.pickWeightedIndex(w));
    g.push(row);
  }
  return g;
}

/* ============ 扫描 + 中奖检测 ============ */
export function findWins(grid) {
  const counts = {};
  const wildPos = [];
  const scatterPos = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = grid[r][c];
      if (id === WILD_ID) wildPos.push([r, c]);
      else if (id === SCATTER_ID) scatterPos.push([r, c]);
      else {
        if (!counts[id]) counts[id] = { n: 0, positions: [] };
        counts[id].n++;
        counts[id].positions.push([r, c]);
      }
    }
  }
  const wildN = wildPos.length;
  const wins = [];
  for (const [idStr, data] of Object.entries(counts)) {
    const id = parseInt(idStr, 10);
    const total = data.n + wildN;
    if (total >= MIN_MATCH) {
      wins.push({
        symbolId: id,
        count: total,
        baseCount: data.n,
        wildCount: wildN,
        positions: [...data.positions, ...wildPos]
      });
    }
  }
  return { wins, scatterPos, wildPos };
}

/* ============ 单轮赔付计算 ============ */
export function calcRoundWin(wins, bet, mode) {
  const details = [];
  let total = 0;
  for (const w of wins) {
    const mult = getScaledMultiplier(w.symbolId, w.count, mode);
    const amount = mult * bet;
    total += amount;
    details.push({ ...w, multiplier: mult, amount });
  }
  return { total, details };
}

/* ============ Tumble 补位 ============ */
export function applyTumble(grid, removedPositions, rng, mode) {
  const removedSet = new Set(removedPositions.map(([r, c]) => r + ',' + c));
  const w = getWeightArray(mode);
  const newGrid = grid.map(row => row.slice());
  for (let c = 0; c < COLS; c++) {
    const remaining = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!removedSet.has(r + ',' + c)) remaining.push(grid[r][c]);
    }
    let idx = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (idx < remaining.length) newGrid[r][c] = remaining[idx++];
      else newGrid[r][c] = rng.pickWeightedIndex(w);
    }
  }
  return newGrid;
}

/* ============ 免费旋转（内部） ============ */
function playFreeSpins(rng, bet, mode, initialSpins) {
  const gridRng   = rng.fork('fs-grid');
  const tumbleRng = rng.fork('fs-tumble');
  const multRng   = rng.fork('fs-mult');
  const retrigRng = rng.fork('fs-retrig');

  const result = {
    initialSpins,
    totalSpins: 0,
    retriggers: 0,
    spins: [],
    totalWin: 0,
    finalMultiplier: 0
  };

  let remaining = initialSpins;
  let totalMult = 0;

  while (remaining > 0) {
    remaining--;
    result.totalSpins++;

    let grid = generateGrid(gridRng, mode);
    const spinRecord = { initialGrid: grid.map(r => r.slice()), tumbleRounds: [], spinWin: 0 };
    let lastScatterCount = 0;
    let spinBaseWin = 0;

    for (let round = 0; round < MAX_TUMBLES; round++) {
      const { wins, scatterPos } = findWins(grid);
      lastScatterCount = scatterPos.length;

      // FS 阶段倍率触发
      const multProb = Mult.getMultProb(mode, 'fs');
      if (multRng.next() < multProb) {
        const weights = Mult.getMultWeights(mode);
        const idx = multRng.pickWeightedIndex(weights);
        totalMult += Mult.MULT_VALUES[idx];
      }

      if (wins.length === 0) break;

      const roundDetail = calcRoundWin(wins, bet, mode);
      spinBaseWin += roundDetail.total;

      const positions = [];
      for (const w of wins) for (const [r, c] of w.positions) positions.push([r, c]);

      spinRecord.tumbleRounds.push({
        round,
        wins: roundDetail.details,
        roundWin: roundDetail.total,
        gridBefore: grid.map(row => row.slice())
      });

      grid = applyTumble(grid, positions, tumbleRng, mode);
      spinRecord.tumbleRounds[spinRecord.tumbleRounds.length - 1].gridAfter = grid.map(row => row.slice());
    }

    // FS 内倍率累加后作用于本次
    const effMult = totalMult > 0 ? totalMult : 1;
    spinRecord.spinWin = spinBaseWin * effMult;
    result.totalWin += spinRecord.spinWin;
    result.spins.push(spinRecord);

    // 重触发
    if (lastScatterCount >= FS.FS_RETRIGGER_THRESHOLD) {
      const p = FS.getRetriggerProb(mode);
      if (retrigRng.next() < p) {
        remaining += FS.FS_RETRIGGER_AWARD;
        result.retriggers++;
      }
    }
  }

  result.finalMultiplier = totalMult;
  return result;
}

/* ============ 主入口：完整一次 Spin ============ */
export function playSpin({ seed, bet, mode }) {
  if (!Number.isFinite(bet) || bet <= 0) {
    throw new Error('playSpin: bet must be positive number');
  }
  if (mode !== 'demo' && mode !== 'real') {
    throw new Error('playSpin: mode must be demo | real');
  }

  const rng       = new RNG(seed);
  const gridRng   = rng.fork('grid');
  const tumbleRng = rng.fork('tumble');
  const multRng   = rng.fork('mult');

  const result = {
    seed: rng.seed,
    mode,
    bet,
    initialGrid: null,
    tumbleRounds: [],
    multipliers: [],
    totalMultiplier: 1,
    baseWin: 0,
    scatterCount: 0,
    scatterWin: 0,
    freeSpins: null,
    totalWin: 0
  };

  let grid = generateGrid(gridRng, mode);
  result.initialGrid = grid.map(row => row.slice());

  let accumBaseWin = 0;
  let totalMult = 0;
  let lastScatters = [];

  for (let round = 0; round < MAX_TUMBLES; round++) {
    const { wins, scatterPos } = findWins(grid);
    lastScatters = scatterPos;

    // 每轮检查倍率触发
    const multProb = Mult.getMultProb(mode, 'base');
    if (multRng.next() < multProb) {
      const weights = Mult.getMultWeights(mode);
      const idx = multRng.pickWeightedIndex(weights);
      const value = Mult.MULT_VALUES[idx];
      totalMult += value;
      result.multipliers.push({ round, value });
    }

    if (wins.length === 0) break;

    const roundDetail = calcRoundWin(wins, bet, mode);
    accumBaseWin += roundDetail.total;

    const positions = [];
    for (const w of wins) for (const [r, c] of w.positions) positions.push([r, c]);

    result.tumbleRounds.push({
      round,
      wins: roundDetail.details,
      roundWin: roundDetail.total,
      removedPositions: positions,
      gridBefore: grid.map(row => row.slice())
    });

    grid = applyTumble(grid, positions, tumbleRng, mode);
    result.tumbleRounds[result.tumbleRounds.length - 1].gridAfter = grid.map(row => row.slice());
  }

  result.baseWin = accumBaseWin;
  result.totalMultiplier = totalMult > 0 ? totalMult : 1;
  result.scatterCount = lastScatters.length;

  // Scatter 赔付
  if (result.scatterCount >= 4) {
    const scatterBase = getScatterMultiplier(result.scatterCount);
    result.scatterWin = scatterBase * PAY_SCALE[mode] * bet;
  }

  // Scatter → FS
  const fsAward = FS.getFsAward(result.scatterCount);
  if (fsAward > 0) {
    const fsRng = rng.fork('fs');
    result.freeSpins = playFreeSpins(fsRng, bet, mode, fsAward);
  }

  // 最终结算
  const winFromBase = result.baseWin * result.totalMultiplier;
  const fsWin = result.freeSpins ? result.freeSpins.totalWin : 0;
  result.totalWin = winFromBase + fsWin + result.scatterWin;

  return result;
}

export const VERSION = 'olympius-math-v1.0.0';
