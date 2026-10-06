// Apex UI - Engine Adapter
// 职责: 把 Phase 1 MathEngine 的 GameResult 转换为 UI 可消费的 ViewModel
// 无 DOM 依赖, 无业务状态
// MathEngine / RNG / Config 是唯一数学权威

import { createMathEngine } from '../engine/math-engine.js';

// === tier 计算 (从 config.bigWinThresholds 读) ===
export function computeTier(ratio, thresholds) {
  if (!(ratio > 0)) return 'none';
  const t = thresholds || {};
  const big   = (t.big   != null) ? t.big   : 10;
  const mega  = (t.mega  != null) ? t.mega  : 30;
  const sup   = (t.super != null) ? t.super : 60;
  const epic  = (t.epic  != null) ? t.epic  : 150;
  if (ratio < big)  return 'small';
  if (ratio < mega) return 'nice';
  if (ratio < sup)  return 'big';
  if (ratio < epic) return 'mega';
  return 'epic';
}

// === ViewModel 构造 (纯函数) ===
// 从 GameResult 提取 UI 所需字段, 不改动原对象
export function buildViewModel(gameResult, config) {
  if (!gameResult || typeof gameResult !== 'object') {
    throw new TypeError('buildViewModel: gameResult 必须是对象');
  }
  const thresholds = (config && config.bigWinThresholds) || null;

  // 从 tumble.history 收集所有 winIds (去重)
  const winIdSet = new Set();
  const tumbleSteps = [];
  if (gameResult.tumble && Array.isArray(gameResult.tumble.history)) {
    for (const step of gameResult.tumble.history) {
      if (step.winIds && Array.isArray(step.winIds)) {
        for (const id of step.winIds) winIdSet.add(id);
      }
      tumbleSteps.push({
        step: step.step,
        winIds: step.winIds ? step.winIds.slice() : [],
        totalPayout: step.totalPayout || 0,
        totalMult: step.totalMult || 0,
        scatterCount: step.scatterCount || 0
      });
    }
  }

  // 免费旋转摘要
  let freeSpinsView = null;
  if (gameResult.freeSpins) {
    const fs = gameResult.freeSpins;
    const fsSteps = [];
    if (Array.isArray(fs.history)) {
      for (const h of fs.history) {
        fsSteps.push({
          spin: h.spin,
          spinWin: h.spinWin || 0,
          spinMult: h.spinMult || 1,
          bombs: h.bombs ? h.bombs.slice() : [],
          grid: h.grid ? h.grid.map(function (r) { return r.slice(); }) : null
        });
      }
    }
    freeSpinsView = {
      spinsPlayed: fs.spinsPlayed || 0,
      spinsRemaining: fs.spinsRemaining || 0,
      retriggerCount: fs.retriggerCount || 0,
      totalWin: fs.totalWin || 0,
      totalBombMult: fs.totalBombMult || 0,
      bombList: fs.bombList ? fs.bombList.slice() : [],
      history: fsSteps
    };
  }

  const ratio = (typeof gameResult.winRatio === 'number')
    ? gameResult.winRatio
    : (gameResult.bet > 0 ? gameResult.totalWin / gameResult.bet : 0);

  return {
    // 盘面 (2D id[][])
    grid:      gameResult.initialGrid ? gameResult.initialGrid.map(function (r) { return r.slice(); }) : [],
    finalGrid: (gameResult.tumble && gameResult.tumble.finalGrid)
                 ? gameResult.tumble.finalGrid.map(function (r) { return r.slice(); })
                 : [],

    // 中奖
    totalWin:    gameResult.totalWin || 0,
    baseWin:     gameResult.baseWin || 0,
    freeSpinsWin:gameResult.freeSpinsWin || 0,
    winRatio:    ratio,
    tier:        computeTier(ratio, thresholds),
    winIds:      Array.from(winIdSet),
    scatterCount:gameResult.scatterCount || 0,

    // 连消
    tumbleCount: (gameResult.tumble && gameResult.tumble.tumbleCount) || 0,
    tumbleSteps: tumbleSteps,
    safetyHit:   (gameResult.tumble && gameResult.tumble.safetyHit) || false,

    // 免费旋转
    freeSpinsAwarded: gameResult.freeSpinsAwarded || 0,
    freeSpins:        freeSpinsView,

    // 元信息
    bet:  gameResult.bet,
    mode: gameResult.mode
  };
}

// === EngineAdapter ===
export class EngineAdapter {
  constructor(config, opts) {
    if (!config || !config.game) {
      throw new TypeError('EngineAdapter: config.game 缺失');
    }
    opts = opts || {};
    this.config = config;
    this.mode = opts.mode || 'demo';
    if (this.mode !== 'demo' && this.mode !== 'real') {
      throw new Error('EngineAdapter: mode 必须是 demo 或 real');
    }
    // seed 支持 number / string / 未提供 (默认时间戳仅限 UI 临时会话)
    this.seed = (opts.seed != null) ? opts.seed : (Date.now() % 2147483647);
    this._engine = null;
    this._createEngine();
  }

  _createEngine() {
    this._engine = createMathEngine(this.config, {
      seed: this.seed,
      mode: this.mode
    });
  }

  // === 主入口: 执行一局 ===
  // 返回 { raw: GameResult, view: ViewModel }
  playSpin(bet) {
    if (typeof bet !== 'number' || !(bet > 0)) {
      throw new TypeError('playSpin: bet 必须是正数');
    }
    const raw = this._engine.playSpin(bet);
    const view = buildViewModel(raw, this.config);
    return { raw: raw, view: view };
  }

  // === 切换模式 (demo/real) ===
  // 重新创建 engine (新 seed, 保持 RNG 隔离)
  setMode(mode) {
    if (mode !== 'demo' && mode !== 'real') {
      throw new Error('setMode: mode 必须是 demo 或 real');
    }
    if (mode === this.mode) return;
    this.mode = mode;
    this._createEngine();
  }

  // === 重置 seed (新会话) ===
  reseed(seed) {
    if (seed == null) {
      throw new TypeError('reseed: seed 不可为空');
    }
    this.seed = seed;
    this._createEngine();
  }

  // === 预览盘面 (不消耗 bet, 用于页面加载初始展示) ===
  previewGrid() {
    const g = this._engine.rollGrid();
    return g.map(function (r) { return r.slice(); });
  }

  // === 只读访问 ===
  getConfig() { return this.config; }
  getMode()   { return this.mode; }
  getSeed()   { return this.seed; }
}

// === 工厂函数 ===
export function createEngineAdapter(config, opts) {
  return new EngineAdapter(config, opts);
}
