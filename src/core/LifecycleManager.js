// @ts-check
/* Apex · 生命周期管理
 * 目的：统一处理页面可见性 / 前后台 / BFCache / 网络变化
 * 规则：后台时暂停动画 / 音频 / Auto；恢复时通知订阅者
 */

import { logger } from '../shared/logger.js';
import { eventBus } from './EventBus.js';

export class LifecycleManager {
  constructor() {
    this._active = true;
    this._bfcache = false;
    this._bound = false;
    this._cleanups = [];
  }

  /** 启动监听 */
  start() {
    if (this._bound) return;
    this._bound = true;

    const self = this;

    this._on(document, 'visibilitychange', function () {
      if (document.hidden) self._enterBackground();
      else self._enterForeground();
    });

    this._on(window, 'pagehide', function (e) {
      if (e && e.persisted) {
        self._bfcache = true;
        logger.debug('pagehide (bfcache)');
      }
      self._enterBackground();
    });

    this._on(window, 'pageshow', function (e) {
      if (e && e.persisted) {
        self._bfcache = false;
        logger.debug('pageshow (restore from bfcache)');
      }
      self._enterForeground();
    });

    this._on(window, 'online', function () {
      logger.info('network online');
      eventBus.emit('net:online');
    });

    this._on(window, 'offline', function () {
      logger.warn('network offline');
      eventBus.emit('net:offline');
    });
  }

  _on(target, event, handler) {
    target.addEventListener(event, handler);
    this._cleanups.push(function () { target.removeEventListener(event, handler); });
  }

  _enterBackground() {
    if (!this._active) return;
    this._active = false;
    eventBus.emit('lifecycle:background');
  }

  _enterForeground() {
    if (this._active) return;
    this._active = true;
    eventBus.emit('lifecycle:foreground');
  }

  /** 是否在活动状态 */
  isActive() { return this._active; }

  /** 是否从 BFCache 恢复 */
  wasBFCache() { return this._bfcache; }

  /** 停止监听 */
  stop() {
    this._cleanups.forEach(function (fn) { fn(); });
    this._cleanups = [];
    this._bound = false;
  }
}
