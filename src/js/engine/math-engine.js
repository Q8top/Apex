// Apex Engine · Math Engine
// 纯函数 · 无 DOM · 无 UI · 可确定性 Replay
// 依赖: RNG (xorshift128+) + SymbolSystem + config
// Node 可直接运行; 浏览器端通过 <script type="module"> 加载

import { RNG, seedFromString } from './rng.js';
import { SymbolSystem } from './symbol-system.js';

// ══════════════════════════════════════════════════════════
// 常量 & 工具
// ══════════════════════════════════════════════════════════

const CELL_EMPTY = null;

function cloneGrid(g) {
  return g.map(row => row.slice());
}

function flatGrid(g) {
  const out = [];
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[r].length; c++) out.push(g[r][c]);
  return out;
}

function countSymbols(flat) {
  const counts = new Map();
  for (const id of flat) {
    if (id == null) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

// ══════════════════════════════════════════════════════════
// MathEngine
// ══════════════════════════════════════════════════════════

export class MathEngine {
  constructor(config, options = {}) {
    if (!config || !config.game || !config.game.grid) {
      throw new TypeError('config.game.grid 缺失');
    }
    this.config = config;
    this.cols = config.game.grid.columns;
    this.rows = config.game.grid.rows;
    this.minCount = config.game.winRule.minimumCount;
    this.symbols = new SymbolSystem(config);
    this.mode = options.mode || 'demo';

    if (!config.modes || !config.modes[this.mode]) {
      throw new Error('未知模式: ' + this.mode);
    }
    this.modeConfig = config.modes[this.mode];

    // RNG: 必须显式提供 seed 或 rng 实例
    // 禁 Date.now() 兜底 (规范 S.36)
    if (options.rng) {
      if (typeof options.rng.next !== 'function') {
        throw new TypeError('options.rng 必须实现 next() 方法');
      }
      this.rng = options.rng;
    } else if (options.seed != null) {
      this.rng = new RNG(options.seed);
    } else {
      throw new Error('MathEngine 必须提供 seed 或 rng 实例');
    }
  }

  // ── 生成空网格 (rows × cols, 全 null) ──
  emptyGrid() {
    const g = [];
    for (let r = 0; r < this.rows; r++) {
      g.push(new Array(this.cols).fill(CELL_EMPTY));
    }
    return g;
  }

  // ── 生成初始盘面 (纯随机, 用于 fallback) ──
  rollGrid() {
    const grid = this.emptyGrid();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        grid[r][c] = this.symbols.pickNormal(this.rng);
      }
    }
    return grid;
  }

  // ── 掷命中骰子 ──
  // overrideRate: 可选, 用于 Free Spins 使用独立的 freeSpinHitRate
  // 缺省: 使用 modeConfig.hitRateTarget
  rollHitDecision(overrideRate) {
    let hr;
    if (overrideRate != null) {
      hr = overrideRate;
    } else {
      hr = this.modeConfig.hitRateTarget || 0.5;
    }
    if (typeof hr !== 'number' || hr < 0 || hr > 1) {
      throw new RangeError('hitRate 必须是 [0,1] 数值, 实际 ' + hr);
    }
    const isWin = this.rng.nextFloat() < hr;
    return { isWin };
  }

  // ── 取 Free Spins 内使用的 hitRate ──
  // 优先 freeSpinHitRate; 缺省 fallback 到 hitRateTarget (保持 demo 行为不变)
  getFreeSpinHitRate() {
    const cfg = this.modeConfig;
    if (cfg.freeSpinHitRate != null) {
      const v = cfg.freeSpinHitRate;
      if (typeof v !== 'number' || v < 0 || v > 1) {
        throw new RangeError('freeSpinHitRate 必须是 [0,1] 数值, 实际 ' + v);
      }
      return v;
    }
    return cfg.hitRateTarget || 0.5;
  }

  // ── 靶向网格生成 ──
  // isWin=true  → 保证至少有一个符号出现次数 >= minCount
  // isWin=false → 保证所有符号出现次数 <= minCount - 1
  rollGridTargeted(isWin) {
    const grid = this.emptyGrid();
    const total = this.rows * this.cols;
    const scatterId = this.symbols.getScatterId();
    const scatterRate = (this.modeConfig && this.modeConfig.scatterRate) || 0;

    // ── ① 位置表 ──
    const positions = [];
    for (let i = 0; i < total; i++) positions.push(i);
    this.rng.shuffle(positions);

    // ── ② 是否注入 Scatter (触发 Free Spins) ──
    // 若命中, 铺 4~6 个 scatter
    let scatterCount = 0;
    const injectScatter = scatterId && (this.rng.nextFloat() < scatterRate);
    if (injectScatter) {
      scatterCount = 4 + this.rng.int(0, 2); // 4, 5, 6
      scatterCount = Math.min(scatterCount, total);
      for (let k = 0; k < scatterCount; k++) {
        const pos = positions[k];
        const r = Math.floor(pos / this.cols);
        const c = pos % this.cols;
        grid[r][c] = scatterId;
      }
    }

    const usedPositions = positions.slice(0, scatterCount);
    const freePositions = positions.slice(scatterCount);

    // ── ③ 铺普通符号 ──
    if (isWin) {
      // 选一个中奖符号 (base 或 high)
      const winId = this.symbols.pickNormal(this.rng);
      // 需要的中奖数量: minCount 到 minCount + 额外 (受 freePositions 数量限制)
      const extraMax = Math.min(8, Math.max(0, freePositions.length - this.minCount));
      const need = this.minCount + this.rng.int(0, extraMax);
      const count = Math.min(need, freePositions.length);

      // 中奖符号放前 count 个 free 位置
      const counts = new Map();
      for (let k = 0; k < count; k++) {
        const pos = freePositions[k];
        const r = Math.floor(pos / this.cols);
        const c = pos % this.cols;
        grid[r][c] = winId;
      }
      counts.set(winId, count);

      // 其余位置: 避免任何符号 >= minCount
      for (let k = count; k < freePositions.length; k++) {
        const pos = freePositions[k];
        const r = Math.floor(pos / this.cols);
        const c = pos % this.cols;
        let attempts = 0;
        while (attempts < 30) {
          const cand = this.symbols.pickNormal(this.rng);
          const cur = counts.get(cand) || 0;
          if (cur < this.minCount - 1) {
            grid[r][c] = cand;
            counts.set(cand, cur + 1);
            break;
          }
          attempts++;
        }
        if (grid[r][c] == null) {
          grid[r][c] = this.symbols.pickNormal(this.rng);
        }
      }
      return grid;
    }

    // ── 未中奖: 所有普通符号 <= minCount - 1 ──
    const maxPerSymbol = this.minCount - 1;
    const counts = new Map();
    for (let k = 0; k < freePositions.length; k++) {
      const pos = freePositions[k];
      const r = Math.floor(pos / this.cols);
      const c = pos % this.cols;
      let attempts = 0;
      let placed = false;
      while (attempts < 30) {
        const cand = this.symbols.pickNormal(this.rng);
        const cur = counts.get(cand) || 0;
        if (cur < maxPerSymbol) {
          grid[r][c] = cand;
          counts.set(cand, cur + 1);
          placed = true;
          break;
        }
        attempts++;
      }
      if (!placed) {
        grid[r][c] = this.symbols.pickNormal(this.rng);
      }
    }
    return grid;
  }

  // ── 判奖 ──
  // 返回: { wins: [{ id, count, mult, payout }], totalPayout, totalMult, scatterCount, wildCount }
  evaluate(grid, bet) {
    const flat = flatGrid(grid);
    const counts = countSymbols(flat);

    const wins = [];
    let totalPayout = 0;
    let totalMult = 0;
    const winIds = [];

    for (const [id, count] of counts.entries()) {
      if (count < this.minCount) continue;
      if (this.symbols.isSpecial(id)) continue;

      const mult = this.symbols.payoutFor(id, count);
      if (mult <= 0) continue;

      const payout = mult * bet;
      wins.push({ id, count, mult, payout });
      totalPayout += payout;
      totalMult += mult;
      winIds.push(id);
    }

    const scatterId = this.symbols.getScatterId();
    const wildId = this.symbols.getWildId();
    const scatterCount = scatterId ? (counts.get(scatterId) || 0) : 0;
    const wildCount = wildId ? (counts.get(wildId) || 0) : 0;

    return {
      wins,
      totalPayout,
      totalMult,
      winIds,
      scatterCount,
      wildCount
    };
  }

  // ── 判奖 + 附加上下文（用于 UI / Simulator）──
  evaluateFull(grid, bet, context = {}) {
    const base = this.evaluate(grid, bet);
    return Object.assign({}, base, {
      bet,
      grid: cloneGrid(grid),
      context
    });
  }

  // ── 移除中奖符号 ──
  removeWins(grid, winIds) {
    const removed = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (winIds.includes(grid[r][c])) {
          removed.push({ r, c, id: grid[r][c] });
          grid[r][c] = CELL_EMPTY;
        }
      }
    }
    return removed;
  }

  // ── 下落 + 补位 ──
  dropAndRefill(grid) {
    for (let c = 0; c < this.cols; c++) {
      const col = [];
      for (let r = this.rows - 1; r >= 0; r--) {
        if (grid[r][c] != null) col.push(grid[r][c]);
      }
      for (let r = this.rows - 1; r >= 0; r--) {
        const idx = this.rows - 1 - r;
        grid[r][c] = (idx < col.length) ? col[idx] : this.symbols.pickNormal(this.rng);
      }
    }
    return grid;
  }

  // ── Tumble 连消循环 ──
  tumble(grid, bet) {
    const safetyLimit = (this.config.tumble && this.config.tumble.safetyLimit) || 50;
    let totalWin = 0;
    let tumbleCount = 0;
    const history = [];
    let safetyHit = false;

    let current = cloneGrid(grid);

    while (true) {
      const result = this.evaluate(current, bet);
      if (result.wins.length === 0) break;

      tumbleCount += 1;

      history.push({
        step: tumbleCount,
        wins: result.wins,
        winIds: result.winIds.slice(),
        totalPayout: result.totalPayout,
        totalMult: result.totalMult,
        scatterCount: result.scatterCount,
        wildCount: result.wildCount,
        gridBefore: cloneGrid(current)
      });

      totalWin += result.totalPayout;

      this.removeWins(current, result.winIds);
      this.dropAndRefill(current);

      if (tumbleCount >= safetyLimit) {
        safetyHit = true;
        break;
      }
    }

    return {
      totalWin,
      tumbleCount,
      history,
      finalGrid: current,
      safetyHit
    };
  }

  // ── 糖果炸弹倍数 (仅在 Free Spins 期间) ──
  rollBombMultiplier() {
    const cfg = this.config.freeSpins;
    if (!cfg || !cfg.bombMultipliers || !cfg.bombWeights) return 0;
    // 检查此局是否触发炸弹
    const bombRate = this.modeConfig.bombRate || 0;
    if (this.rng.nextFloat() >= bombRate) return 0;
    return this.rng.pickWeighted(cfg.bombMultipliers, cfg.bombWeights);
  }

  // ── 累积炸弹序列: 每个 tumble 步骤可能掉落一个炸弹 ──
  // 输入 tumble history, 输出 [{step, multiplier}] 与 accumulated
  accumulateBombs(tumbleHistory) {
    const list = [];
    let acc = 0;
    for (const h of tumbleHistory) {
      const m = this.rollBombMultiplier();
      if (m > 0) {
        list.push({ step: h.step, multiplier: m });
        acc += m;
      }
    }
    return { list, accumulated: acc };
  }

  // ── Free Spins 触发判定: scatterCount → 获得次数 ──
  freeSpinsAward(scatterCount) {
    const cfg = this.config.freeSpins;
    if (!cfg || !cfg.trigger) return 0;
    const keys = Object.keys(cfg.trigger).map(Number).sort((a, b) => b - a);
    for (const k of keys) {
      if (scatterCount >= k) return cfg.trigger[String(k)];
    }
    return 0;
  }

  // ── Retrigger: 在 Free Spins 内再触发 ──
  freeSpinsRetrigger(scatterCount) {
    const cfg = this.config.freeSpins;
    if (!cfg || !cfg.retrigger) return 0;
    const keys = Object.keys(cfg.retrigger).map(Number).sort((a, b) => b - a);
    for (const k of keys) {
      if (scatterCount >= k) return cfg.retrigger[String(k)];
    }
    return 0;
  }

  // ── Free Spins 循环 ──
  // 每次 spin: tumble 判奖 + 累积炸弹倍数
  // 累计炸弹倍数 = 本次序列内所有炸弹倍数之和
  // 本次序列总赢 = Σ(每次 tumble 赢 × 当前累积炸弹倍数)
  // 注: 累积炸弹倍数用于整个 Free Spins 序列
  playFreeSpins(bet, spinsAwarded) {
    const cfg = this.config.freeSpins || {};
    const maxRetrigger = (cfg.maxRetrigger == null) ? Infinity : cfg.maxRetrigger;
    const safetyLimit = cfg.safetyLimit || 100;

    let remaining = spinsAwarded;
    let played = 0;
    let retriggerCount = 0;
    let totalWin = 0;
    let totalBombMult = 0;

    const history = [];
    const bombList = [];

    while (remaining > 0 && played < safetyLimit) {
      remaining -= 1;
      played += 1;

      const fsHitRate = this.getFreeSpinHitRate();
      const decision = this.rollHitDecision(fsHitRate);
      const grid = this.rollGridTargeted(decision.isWin);
      const tumbleResult = this.tumble(grid, bet);

      // 每次 tumble step 可能掉炸弹
      const bombs = this.accumulateBombs(tumbleResult.history);
      totalBombMult += bombs.accumulated;
      for (const b of bombs.list) bombList.push(Object.assign({ spin: played }, b));

      // 本次 spin 赢 = tumble 赢 × (1 + 累积炸弹倍数 / 10)
      // 简化公式: 炸弹倍数按 x2/x5 直接加到倍率, 这里用 sum 累加到倍率
      // 更精确: 每次 tumble step 的赢 × 该步骤前累积倍数
      // 版本 1 先实现简化版: 序列内炸弹倍数直接加到总倍率
      const spinMult = 1 + (bombs.accumulated / 10);
      const spinWin = tumbleResult.totalWin * spinMult;
      totalWin += spinWin;

      history.push({
        spin: played,
        grid: cloneGrid(grid),
        tumble: tumbleResult,
        bombs: bombs.list,
        spinMult,
        spinWin
      });

      // Retrigger 判定: 本 spin 是否又触发 Scatter
      const scatterCount = tumbleResult.history[0]
        ? tumbleResult.history[0].scatterCount
        : 0;
      if (scatterCount > 0) {
        const extra = this.freeSpinsRetrigger(scatterCount);
        if (extra > 0 && retriggerCount < maxRetrigger) {
          remaining += extra;
          retriggerCount += 1;
          history[history.length - 1].retrigger = extra;
        }
      }
    }

    return {
      spinsPlayed: played,
      spinsRemaining: remaining,
      retriggerCount,
      totalWin,
      totalBombMult,
      bombList,
      history
    };
  }

  // ── 一局完整流程 (含 Free Spins 触发) ──
  // 返回: {
  //   bet, initialGrid, tumble, scatterCount, freeSpinsAwarded,
  //   freeSpinsResult, totalWin, mode
  // }
  playSpin(bet) {
    const decision = this.rollHitDecision();
    const initialGrid = this.rollGridTargeted(decision.isWin);
    const tumbleResult = this.tumble(initialGrid, bet);

    // Scatter 从初始 grid 判定（第一次判奖时的 scatterCount）
    const initEval = this.evaluate(initialGrid, bet);
    const scatterCount = initEval.scatterCount;
    const freeSpinsAwarded = this.freeSpinsAward(scatterCount);

    let freeSpinsResult = null;
    let freeSpinsWin = 0;

    if (freeSpinsAwarded > 0) {
      freeSpinsResult = this.playFreeSpins(bet, freeSpinsAwarded);
      freeSpinsWin = freeSpinsResult.totalWin;
    }

    const totalWin = tumbleResult.totalWin + freeSpinsWin;

    return {
      mode: this.mode,
      bet,
      isWinDecision: decision.isWin,
      initialGrid: cloneGrid(initialGrid),
      scatterCount,
      freeSpinsAwarded,
      tumble: tumbleResult,
      freeSpins: freeSpinsResult,
      baseWin: tumbleResult.totalWin,
      freeSpinsWin,
      totalWin,
      winRatio: bet > 0 ? (totalWin / bet) : 0
    };
  }
}

// ══════════════════════════════════════════════════════════
// 工厂函数
// ══════════════════════════════════════════════════════════

export function createMathEngine(config, options) {
  return new MathEngine(config, options);
}

// 便捷: 从 seed 字符串派生 engine (用于 Replay)
export function createMathEngineFromSeed(config, seedString, mode) {
  const seed = seedFromString(seedString);
  return new MathEngine(config, { seed, mode });
}
