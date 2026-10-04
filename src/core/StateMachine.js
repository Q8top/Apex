// @ts-check
/* Apex · 状态机
 * 目的：所有状态变更走显式路径，禁止随意修改 phase
 * 规则：
 *   - 只有定义的转换才被允许
 *   - 每次转换触发事件（供 Render / Audio / UI 订阅）
 *   - 转换函数支持守卫（guard）和副作用（onEnter / onExit）
 */

import { logger } from '../shared/logger.js';
import { eventBus } from './EventBus.js';

/**
 * @typedef {Object} StateDef
 * @property {string[]} [from]   允许从哪些状态进入
 * @property {() => void} [onEnter]
 * @property {() => void} [onExit]
 */

export class StateMachine {
  /**
   * @param {Record<string, StateDef>} states
   * @param {string} initial
   * @param {string} [eventPrefix] 事件前缀（默认 'state'）
   */
  constructor(states, initial, eventPrefix) {
    if (!states || !states[initial]) {
      throw new Error('StateMachine: invalid states or initial');
    }
    this._states = states;
    this._current = initial;
    this._prefix = eventPrefix || 'state';
    this._history = [initial];
    this._maxHistory = 50;
  }

  /** @returns {string} */
  getState() { return this._current; }

  /** @returns {string[]} 历史（倒序，最新在前） */
  getHistory() { return this._history.slice().reverse(); }

  /**
   * 能否从 current 转到 target
   * @param {string} target
   * @returns {boolean}
   */
  canGoTo(target) {
    if (!this._states[target]) return false;
    if (target === this._current) return false;
    const def = this._states[target];
    if (!def.from || def.from.length === 0) return true;
    return def.from.indexOf(this._current) !== -1;
  }

  /**
   * 转换状态
   * @param {string} target
   * @param {any} [context] 附加上下文（会传给事件）
   * @returns {boolean}
   */
  transition(target, context) {
    if (!this._states[target]) {
      logger.error('state: unknown target', target);
      return false;
    }
    if (!this.canGoTo(target)) {
      logger.warn('state: illegal transition', this._current, '→', target);
      return false;
    }

    const from = this._current;
    const fromDef = this._states[from];
    const toDef = this._states[target];

    // onExit
    if (fromDef && typeof fromDef.onExit === 'function') {
      try { fromDef.onExit(); }
      catch (e) { logger.error('state.onExit threw', from, e && e.message); }
    }

    this._current = target;
    this._history.unshift(target);
    if (this._history.length > this._maxHistory) this._history.pop();

    // 事件
    eventBus.emit(this._prefix + ':change', { from: from, to: target, context: context || null });
    eventBus.emit(this._prefix + ':' + target, { from: from, context: context || null });

    // onEnter
    if (toDef && typeof toDef.onEnter === 'function') {
      try { toDef.onEnter(); }
      catch (e) { logger.error('state.onEnter threw', target, e && e.message); }
    }

    logger.debug('state', from, '→', target);
    return true;
  }

  /**
   * 强制重置（仅 Debug 用）
   * @param {string} target
   */
  reset(target) {
    if (!this._states[target]) {
      logger.error('state.reset unknown', target);
      return;
    }
    this._current = target;
    this._history = [target];
    eventBus.emit(this._prefix + ':reset', { to: target });
  }
}

/** 游戏阶段定义（配合 constants.PHASE 使用） */
export const PHASE_TRANSITIONS = {
  BOOT:           { from: [] },
  LOADING:        { from: ['BOOT'] },
  READY:          { from: ['LOADING'] },
  IDLE:           { from: ['READY', 'SETTLING', 'ERROR'] },
  SPIN_REQUEST:   { from: ['IDLE'] },
  SPINNING:       { from: ['SPIN_REQUEST'] },
  REEL_STOPPING:  { from: ['SPINNING'] },
  EVALUATING:     { from: ['REEL_STOPPING'] },
  WIN_PRESENT:    { from: ['EVALUATING', 'TUMBLE'] },
  TUMBLE:         { from: ['WIN_PRESENT'] },
  BONUS_CHECK:    { from: ['EVALUATING', 'TUMBLE'] },
  FS_ENTRANCE:    { from: ['BONUS_CHECK'] },
  FS_ROUND:       { from: ['FS_ENTRANCE', 'FS_SUMMARY'] },
  FS_SUMMARY:     { from: ['FS_ROUND'] },
  SETTLING:       { from: ['EVALUATING', 'BONUS_CHECK', 'FS_SUMMARY'] },
  ERROR:          { from: ['IDLE', 'SPINNING', 'EVALUATING', 'SETTLING', 'BONUS_CHECK', 'FS_ROUND'] }
};

/**
 * 创建游戏状态机
 * @returns {StateMachine}
 */
export function createGameStateMachine() {
  return new StateMachine(PHASE_TRANSITIONS, 'BOOT', 'phase');
}
