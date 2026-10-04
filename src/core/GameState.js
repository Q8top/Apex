// @ts-check
/* Apex · 游戏状态
 * 单一真相源：所有 UI / Render / Audio 都从这里读，不各自维护副本
 * 变更通过 set() / patch() 触发事件，禁止直接赋值
 */

import { eventBus } from './EventBus.js';
import { MODE, PHASE, QUALITY } from '../shared/constants.js';

/**
 * @typedef {Object} FSState
 * @property {boolean} active
 * @property {number} remaining
 * @property {number} awarded
 * @property {number} multiplier
 * @property {number} totalWin
 */

/**
 * @typedef {Object} GameStateShape
 * @property {string} phase
 * @property {string} mode
 * @property {boolean} ready
 * @property {boolean} spinning
 * @property {boolean} autoSpin
 * @property {boolean} soundEnabled
 * @property {number} bet           最小单位（分）
 * @property {number} balance       最小单位（分）
 * @property {number} lastWin       最小单位（分）
 * @property {number} currentWin    最小单位（分）
 * @property {number} totalWin      最小单位（分）
 * @property {FSState} fs
 * @property {string[]} grid        30 格符号 id
 * @property {number} spinToken
 * @property {string|null} spinId
 * @property {string} quality
 */

/** @returns {GameStateShape} */
function createInitial() {
  return {
    phase: PHASE.BOOT,
    mode: MODE.DEMO,
    ready: false,
    spinning: false,
    autoSpin: false,
    soundEnabled: true,
    bet: 1000,
    balance: 100000,
    lastWin: 0,
    currentWin: 0,
    totalWin: 0,
    fs: { active: false, remaining: 0, awarded: 0, multiplier: 0, totalWin: 0 },
    grid: [],
    spinToken: 0,
    spinId: null,
    quality: QUALITY.HIGH
  };
}

export class GameState {
  constructor(initial) {
    /** @type {GameStateShape} */
    this._data = Object.assign(createInitial(), initial || {});
    /** @type {Record<string, Set<(v:any)=>void>>} */
    this._watchers = {};
  }

  /** 只读快照 */
  snapshot() {
    return JSON.parse(JSON.stringify(this._data));
  }

  /** 读字段 */
  get(/** @type {keyof GameStateShape} */ key) {
    return this._data[key];
  }

  /**
   * 监听某字段变化
   * @param {string} key
   * @param {(value:any, prev:any)=>void} cb
   * @returns {() => void} 取消订阅
   */
  watch(key, cb) {
    if (!this._watchers[key]) this._watchers[key] = new Set();
    this._watchers[key].add(cb);
    return () => {
      const s = this._watchers[key];
      if (s) s.delete(cb);
    };
  }

  /**
   * 设置单个字段
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const prev = this._data[key];
    if (prev === value) return false;
    this._data[key] = value;
    this._notify(key, value, prev);
    return true;
  }

  /**
   * 批量更新（先合并，再逐个通知）
   * @param {Partial<GameStateShape>} patch
   */
  patch(patch) {
    const changed = [];
    for (const k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      const prev = this._data[k];
      const next = patch[k];
      if (prev === next) continue;
      this._data[k] = next;
      changed.push([k, next, prev]);
    }
    for (let i = 0; i < changed.length; i++) {
      this._notify(changed[i][0], changed[i][1], changed[i][2]);
    }
  }

  _notify(key, value, prev) {
    eventBus.emit('state:change', { key: key, value: value, prev: prev });
    eventBus.emit('state:' + key, value);
    const set = this._watchers[key];
    if (set) {
      set.forEach(function (cb) {
        try { cb(value, prev); } catch (e) { /* swallow */ }
      });
    }
  }

  // ── 领域方法（推荐用这些，而不是直接 set）──

  /** 进入 IDLE */
  setIdle() {
    this.patch({ spinning: false, phase: PHASE.IDLE });
  }

  /** 标记开始 Spin */
  markSpinning() {
    this.patch({ spinning: true, spinToken: this._data.spinToken + 1 });
    return this._data.spinToken;
  }

  /** 余额变化 */
  setBalance(minorUnits) {
    this.set('balance', Math.max(0, minorUnits | 0));
  }

  /** 加赢奖 */
  addWin(minorUnits) {
    const w = (minorUnits | 0);
    this.patch({
      balance: this._data.balance + w,
      lastWin: w,
      currentWin: this._data.currentWin + w,
      totalWin: this._data.totalWin + w
    });
  }

  /** 清零一局 */
  resetRound() {
    this.patch({ currentWin: 0, lastWin: 0 });
  }

  /** FS 状态更新 */
  updateFS(/** @type {Partial<FSState>} */ patch) {
    this._data.fs = Object.assign({}, this._data.fs, patch);
    eventBus.emit('state:fs', this._data.fs);
    eventBus.emit('state:change', { key: 'fs', value: this._data.fs, prev: null });
  }
}

/** 默认单例（游戏页启动时创建） */
export function createGameState(initial) {
  return new GameState(initial);
}
