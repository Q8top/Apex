/* ============================================================
   Apex Olympius · GameEngine.js
   核心引擎：串联 StateMachine + EventBus + MathEngine
   
   职责：
   - 接收玩家操作（playSpin / playFreeSpins）
   - 调用 MathEngine 生成结果
   - 按时间轴驱动状态机
   - 触发事件让 UI 播放动画
   - 保持输入锁定（非 IDLE 拒绝新请求）
   
   事件流（顺序）：
     spin:start      { bet, mode }
     spin:grid       { grid }              ← 初盘生成
     spin:round      { roundIdx, wins, roundWin }
     spin:tumble     { removed, gridBefore, gridAfter }
     spin:mult       { value, totalMult }
     spin:scatter    { count }
     spin:fs-trigger { spins }
     fs:start        { spins, initialSpins }
     fs:spin         { idx, total, grid, roundWin }
     fs:end          { totalWin, retriggers }
     spin:bigwin     { tier, amount }
     spin:end        { result }
   ============================================================ */

import { StateMachine, S } from './StateMachine.js';
import { EventBus } from './EventBus.js';
import { playSpin } from '../math/MathEngine.js';
import { classifyWin } from '../config/gameConfig.js';

/* ===== 默认 Player（Node 测试用，立即返回） ===== */
export class NoopPlayer {
  spinStart()           { return Promise.resolve(); }
  reelsStop()           { return Promise.resolve(); }
  winHighlight()        { return Promise.resolve(); }
  symbolDestroy()       { return Promise.resolve(); }
  tumble()              { return Promise.resolve(); }
  multiplier()          { return Promise.resolve(); }
  scatterCheck()        { return Promise.resolve(); }
  fsTrigger()           { return Promise.resolve(); }
  fsSpinStart()         { return Promise.resolve(); }
  fsEnd()               { return Promise.resolve(); }
  bigWin()              { return Promise.resolve(); }
  complete()            { return Promise.resolve(); }
}

export class GameEngine {
  constructor({ mode = 'demo', bet = 10, player = null, bus = null, sm = null, debug = false } = {}) {
    this.mode = mode;
    this.bet = bet;
    this.bus = bus || new EventBus({ debug });
    this.sm = sm || new StateMachine({ debug });
    this.player = player || new NoopPlayer();
    this._seedBase = 1;
    this._spinCounter = 0;
    this._debug = debug;
  }

  /* 便捷：返回 sm / bus 供 UI 订阅 */
  get state() { return this.sm.current; }
  isLocked()  { return this.sm.isLocked(); }

  setMode(mode) {
    if (mode !== 'demo' && mode !== 'real') throw new Error('GameEngine.setMode: unknown mode');
    this.mode = mode;
  }
  setBet(bet) {
    if (!Number.isFinite(bet) || bet <= 0) throw new Error('GameEngine.setBet: invalid bet');
    this.bet = bet;
  }
  setPlayer(player) { this.player = player; }

  /* ===== 主入口：一次完整 Spin ===== */
  async play() {
    if (this.isLocked()) {
      return { ok: false, reason: 'locked' };
    }

    this._spinCounter++;
    const seed = this._seedBase + this._spinCounter;
    const bet = this.bet;
    const mode = this.mode;

    this.sm.goTo(S.SPINNING);
    this.bus.emit('spin:start', { seed, bet, mode });

    // 调数学引擎
    const result = playSpin({ seed, bet, mode });
    this.bus.emit('spin:grid', { grid: result.initialGrid });
    await this.player.reelsStop(result.initialGrid);

    // 基础局 Tumble 循环
    this.sm.goTo(S.EVALUATING);
    await this._playTumbleRounds(result.tumbleRounds, /*isFS*/ false);

    // 倍率
    if (result.multipliers && result.multipliers.length > 0) {
      this.sm.goTo(S.MULTIPLIER);
      for (const m of result.multipliers) {
        this.bus.emit('spin:mult', { value: m.value, round: m.round, totalMult: result.totalMultiplier });
        await this.player.multiplier(m.value);
      }
    }

    // Scatter 检查
    this.sm.goTo(S.SCATTER_CHECK);
    this.bus.emit('spin:scatter', { count: result.scatterCount });
    await this.player.scatterCheck(result.scatterCount);

    // 免费旋转
    if (result.freeSpins) {
      this.sm.goTo(S.FS_TRIGGER);
      this.bus.emit('spin:fs-trigger', { spins: result.freeSpins.initialSpins });
      await this.player.fsTrigger(result.freeSpins.initialSpins);
      await this._playFreeSpins(result.freeSpins);
    }

    // 大赢
    const tier = classifyWin(result.totalWin, bet);
    if (tier) {
      this.sm.goTo(S.BIG_WIN);
      this.bus.emit('spin:bigwin', { tier, amount: result.totalWin });
      await this.player.bigWin(tier, result.totalWin);
    }

    // 结算
    this.sm.goTo(S.COMPLETE);
    this.bus.emit('spin:end', { result });
    await this.player.complete(result);

    this.sm.goTo(S.IDLE);
    return { ok: true, result };
  }

  /* ===== 基础局 Tumble 循环 ===== */
  async _playTumbleRounds(rounds, isFS) {
    for (const r of rounds) {
      this.bus.emit('spin:round', { roundIdx: r.round, wins: r.wins, roundWin: r.roundWin, isFS });

      // 高亮中奖
      this.sm.goTo(S.WINNING);
      await this.player.winHighlight(r.wins);

      // 消除
      this.sm.goTo(S.TUMBLING);
      await this.player.symbolDestroy(r.removedPositions);

      // 掉落
      this.bus.emit('spin:tumble', {
        removed: r.removedPositions,
        gridBefore: r.gridBefore,
        gridAfter: r.gridAfter
      });
      await this.player.tumble(r.gridBefore, r.gridAfter);

      // 回到评估
      this.sm.goTo(S.EVALUATING);
    }
  }

  /* ===== 免费旋转序列 ===== */
  async _playFreeSpins(fs) {
    this.sm.goTo(S.FREE_SPINS);
    this.bus.emit('fs:start', { spins: fs.initialSpins, total: fs.totalSpins });
    await this.player.fsSpinStart(0, fs.totalSpins);

    for (let i = 0; i < fs.spins.length; i++) {
      const spinRecord = fs.spins[i];
      this.bus.emit('fs:spin', {
        idx: i + 1,
        total: fs.totalSpins,
        grid: spinRecord.initialGrid,
        spinWin: spinRecord.spinWin
      });
      await this.player.fsSpinStart(i + 1, fs.totalSpins);

      // FS 内 Tumble
      await this._playTumbleRounds(spinRecord.tumbleRounds, true);
    }

    this.bus.emit('fs:end', { totalWin: fs.totalWin, retriggers: fs.retriggers, finalMult: fs.finalMultiplier });
    await this.player.fsEnd(fs);
  }

  /* ===== 强制解锁（异常兜底） ===== */
  forceReset() {
    this.sm.reset();
  }
}

export const VERSION = 'olympius-engine-v1.0.0';
