// @ts-check
/* Apex · 音频管理
 * 职责：Web Audio 合成音效（无外部音频文件）
 * 规则：
 *   - 首次用户触摸内 resume AudioContext（iOS Safari）
 *   - 后台 suspend，回来 resume
 *   - 静音状态持久化
 *   - 失败不能崩溃游戏
 */

import { readString, writeString, KEYS } from '../shared/storage.js';
import { eventBus } from '../core/EventBus.js';
import { logger } from '../shared/logger.js';

const DEFAULT_MASTER = 0.28;

export class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
    /** @type {GainNode|null} */
    this._master = null;
    this._muted = readString(KEYS.SOUND, '1') === '0';
    this._unlocked = false;
    this._enabled = true;
    this._bound = false;
  }

  /** 建立 AudioContext（懒加载） */
  _ensure() {
    if (this._ctx) return this._ctx;
    const AC = window.AudioContext || (/** @type {any} */ (window).webkitAudioContext);
    if (!AC) {
      logger.warn('AudioContext unavailable');
      this._enabled = false;
      return null;
    }
    try {
      this._ctx = new AC();
      this._master = this._ctx.createGain();
      this._master.gain.value = DEFAULT_MASTER;
      this._master.connect(this._ctx.destination);
    } catch (e) {
      logger.warn('AudioContext create failed', e && e.message);
      this._enabled = false;
      this._ctx = null;
      this._master = null;
    }
    return this._ctx;
  }

  /** 首次触摸解锁（在用户手势内调用） */
  unlock() {
    const ctx = this._ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this._unlocked = true;
        logger.debug('audio unlocked');
      }).catch((e) => {
        logger.warn('audio resume failed', e && e.message);
      });
    } else {
      this._unlocked = true;
    }
  }

  /** 是否有 Web Audio */
  isSupported() { return this._enabled; }

  /** 是否已解锁 */
  isUnlocked() { return this._unlocked; }

  /** 是否静音 */
  isMuted() { return this._muted; }

  /** 设置静音 */
  setMuted(v) {
    this._muted = !!v;
    writeString(KEYS.SOUND, v ? '0' : '1');
    eventBus.emit('audio:mute-change', this._muted);
  }

  /** 切换静音 */
  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  /** 播放一个音（内部基元） */
  _tone(freq, dur, type, vol, delay) {
    if (this._muted) return;
    const ctx = this._ensure();
    if (!ctx) return;
    if (ctx.state !== 'running') {
      // 尝试恢复
      ctx.resume().catch(function () {});
      if (ctx.state !== 'running') return;
    }
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this._master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  /**
   * 播放命名音效
   * @param {string} name
   * @param {any} [arg]
   */
  play(name, arg) {
    if (this._muted || !this._enabled) return;
    switch (name) {
      case 'click':
        this._tone(880, 0.05, 'square', 0.16);
        break;
      case 'spinStart':
        this._tone(220, 0.09, 'sawtooth', 0.18);
        this._tone(330, 0.12, 'sawtooth', 0.14, 0.05);
        break;
      case 'reelStop':
        this._tone(440 + ((arg && arg.col) || 0) * 32, 0.07, 'triangle', 0.24);
        break;
      case 'land':
        this._tone(660, 0.05, 'triangle', 0.18);
        break;
      case 'win_hit':
        this._tone(880, 0.06, 'sine', 0.22);
        break;
      case 'winSmall':
        [660, 792].forEach((f, i) => this._tone(f, 0.12, 'sine', 0.28, i * 0.07));
        break;
      case 'winMedium':
        [660, 792, 990].forEach((f, i) => this._tone(f, 0.14, 'sine', 0.3, i * 0.07));
        break;
      case 'winLarge':
        [660, 792, 990, 1320].forEach((f, i) => this._tone(f, 0.18, 'sine', 0.34, i * 0.08));
        break;
      case 'multiplier':
        this._tone(1320, 0.1, 'sine', 0.28);
        this._tone(1760, 0.12, 'sine', 0.24, 0.08);
        break;
      case 'scatter':
        this._tone(1174, 0.1, 'sine', 0.26);
        this._tone(1568, 0.14, 'sine', 0.26, 0.08);
        break;
      case 'tumble':
        this._tone(392, 0.08, 'triangle', 0.18);
        break;
      case 'fsStart':
        [523, 659, 784].forEach((f, i) => this._tone(f, 0.22, 'sine', 0.36, i * 0.13));
        break;
      case 'fsEnd':
        [784, 659, 523].forEach((f, i) => this._tone(f, 0.18, 'sine', 0.3, i * 0.1));
        break;
      case 'bigwin':
        [523, 659, 784, 1047].forEach((f, i) => {
          this._tone(f, 0.28, 'sine', 0.42, i * 0.13);
          this._tone(f * 2, 0.22, 'triangle', 0.14, i * 0.13);
        });
        break;
      case 'megawin':
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
          this._tone(f, 0.32, 'sine', 0.46, i * 0.14);
          this._tone(f * 2, 0.26, 'triangle', 0.16, i * 0.14);
        });
        break;
      case 'epicwin':
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
          this._tone(f, 0.36, 'sine', 0.5, i * 0.15);
          this._tone(f * 1.5, 0.3, 'triangle', 0.18, i * 0.15);
        });
        break;
      case 'error':
        this._tone(180, 0.18, 'sawtooth', 0.24);
        break;
      default:
        logger.debug('unknown sfx', name);
    }
  }

  /** 前后台生命周期 */
  bindLifecycle() {
    if (this._bound) return;
    this._bound = true;
    const self = this;
    eventBus.on('lifecycle:background', function () {
      if (self._ctx && self._ctx.state === 'running') {
        self._ctx.suspend().catch(function () {});
      }
    });
    eventBus.on('lifecycle:foreground', function () {
      if (self._ctx && self._ctx.state === 'suspended' && self._unlocked) {
        self._ctx.resume().catch(function () {});
      }
    });
  }

  /** 全局一次点击解锁（挂到 body） */
  bindGlobalUnlock() {
    const self = this;
    function once() {
      self.unlock();
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('touchstart', once);
    }
    document.addEventListener('pointerdown', once, { passive: true });
    document.addEventListener('touchstart', once, { passive: true });
  }
}

/** 默认单例 */
export const audioManager = new AudioManager();
