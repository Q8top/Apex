// @ts-check
/* Apex · 事件总线
 * 用途：跨模块通信，解耦 UI / Render / Audio / Game
 * 规则：State 是真相，Event 是通知
 */

import { logger } from '../shared/logger.js';

/** @typedef {(payload: any) => void} Handler */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Handler>>} */
    this._map = new Map();
    /** @type {Set<Handler>} */
    this._wildcard = new Set();
    this._debug = false;
  }

  /** 打开调试日志 */
  enableDebug() { this._debug = true; }

  /**
   * 订阅
   * @param {string} event
   * @param {Handler} handler
   * @returns {() => void} 取消订阅函数
   */
  on(event, handler) {
    if (typeof event !== 'string' || typeof handler !== 'function') {
      logger.warn('eventBus.on invalid args');
      return function () {};
    }
    if (event === '*') {
      this._wildcard.add(handler);
      return () => this._wildcard.delete(handler);
    }
    let set = this._map.get(event);
    if (!set) {
      set = new Set();
      this._map.set(event, set);
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  /**
   * 一次性订阅
   * @param {string} event
   * @param {Handler} handler
   * @returns {() => void}
   */
  once(event, handler) {
    const self = this;
    const wrap = function (payload) {
      self.off(event, wrap);
      handler(payload);
    };
    return this.on(event, wrap);
  }

  /**
   * 取消订阅
   * @param {string} event
   * @param {Handler} handler
   */
  off(event, handler) {
    if (event === '*') {
      this._wildcard.delete(handler);
      return;
    }
    const set = this._map.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this._map.delete(event);
    }
  }

  /**
   * 触发事件
   * @param {string} event
   * @param {any} [payload]
   */
  emit(event, payload) {
    if (this._debug) logger.debug('emit', event, payload);
    const set = this._map.get(event);
    if (set) {
      // 复制一份，防止 handler 内部修改集合
      const handlers = Array.from(set);
      for (let i = 0; i < handlers.length; i++) {
        try {
          handlers[i](payload);
        } catch (e) {
          logger.error('eventBus handler threw', event, e && e.message);
        }
      }
    }
    if (this._wildcard.size > 0) {
      const ws = Array.from(this._wildcard);
      for (let i = 0; i < ws.length; i++) {
        try { ws[i]({ event, payload }); }
        catch (e) { logger.error('eventBus wildcard threw', event, e && e.message); }
      }
    }
  }

  /**
   * 清空所有订阅
   * @param {string} [event] 不传则清空全部
   */
  clear(event) {
    if (event === undefined) {
      this._map.clear();
      this._wildcard.clear();
    } else if (event === '*') {
      this._wildcard.clear();
    } else {
      this._map.delete(event);
    }
  }

  /** 统计 */
  count() {
    let total = 0;
    this._map.forEach(function (set) { total += set.size; });
    total += this._wildcard.size;
    return total;
  }
}

/** 全局单例（推荐所有模块共享此实例） */
export const eventBus = new EventBus();
