// @ts-check
/* Apex · Canvas 粒子渲染器
 * 职责：Canvas 上绘制粒子（爆炸 / 光晕 / 金币飞出）
 * 特性：
 *   - devicePixelRatio 感知（上限 2）
 *   - 对象池（不每帧 new）
 *   - 自适应质量（根据 FPS 调整预算）
 *   - 后台暂停
 * 规则：
 *   - 不用 Math.random：用内部 xorshift 种子
 *   - 用 requestAnimationFrame（不 setInterval）
 *   - 不参与数学
 */

import { QUALITY } from '../shared/constants.js';
import { logger } from '../shared/logger.js';

const BUDGET = {
  high:   120,
  medium:  70,
  low:     30
};

/** 一个粒子（可复用对象池） */
const PARTICLE = {
  alive: false,
  x: 0, y: 0,
  vx: 0, vy: 0,
  life: 0, maxLife: 0,
  size: 4, sizeEnd: 1,
  color: '#fff',
  alpha: 1, alphaEnd: 0,
  gravity: 0,
  shape: 'circle' // circle | square | spark
};

export class FXRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    if (!canvas) throw new Error('FXRenderer: canvas required');
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._pool = [];
    this._active = [];
    this._quality = QUALITY.HIGH;
    this._running = false;
    this._raf = 0;
    this._lastFrame = 0;
    this._fpsSamples = [];
    this._seed = 1;
    this._paused = false;

    this._onResize = this._resize.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);

    // 预分配对象池
    this._poolSize = BUDGET.high;
    for (let i = 0; i < this._poolSize; i++) {
      this._pool.push(Object.assign({}, PARTICLE));
    }

    this._resize();
  }

  /** 内部伪随机（xorshift32） */
  _rand() {
    let x = this._seed | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this._seed = (x >>> 0) || 1;
    return (this._seed >>> 0) / 4294967296;
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this._canvas.getBoundingClientRect();
    this._canvas.width = Math.max(1, Math.floor(r.width * dpr));
    this._canvas.height = Math.max(1, Math.floor(r.height * dpr));
    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._w = r.width;
    this._h = r.height;
  }

  /** 设置质量等级 */
  setQuality(level) {
    if (!BUDGET[level]) return;
    this._quality = level;
    logger.debug('FX quality', level);
  }

  /** 获取当前预算 */
  getBudget() { return BUDGET[this._quality] || BUDGET.medium; }

  /**
   * 从对象池取一个粒子（若无空闲则返回 null）
   * @returns {any}
   */
  _acquire() {
    if (this._active.length >= this.getBudget()) return null;
    for (let i = 0; i < this._pool.length; i++) {
      if (!this._pool[i].alive) return this._pool[i];
    }
    return null;
  }

  /**
   * 爆炸效果
   * @param {number} x
   * @param {number} y
   * @param {{count?:number, color?:string|string[], spread?:number, speed?:number, life?:number}} [opts]
   */
  burst(x, y, opts) {
    const count = (opts && opts.count) || 30;
    const colors = Array.isArray(opts && opts.color) ? opts.color : [((opts && opts.color) || '#f5d76e')];
    const speed = (opts && opts.speed) || 180;
    const life = (opts && opts.life) || 900;

    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) break;
      const ang = this._rand() * Math.PI * 2;
      const sp = speed * (0.5 + this._rand() * 0.9);
      Object.assign(p, {
        alive: true,
        x: x, y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 40,
        life: 0,
        maxLife: life * (0.6 + this._rand() * 0.6),
        size: 2 + this._rand() * 3,
        sizeEnd: 0.5,
        color: colors[(this._rand() * colors.length) | 0],
        alpha: 1, alphaEnd: 0,
        gravity: 380,
        shape: 'circle'
      });
      this._active.push(p);
    }
    this._ensureRunning();
  }

  /**
   * 光晕脉冲
   * @param {number} x
   * @param {number} y
   * @param {{color?:string, radius?:number, life?:number}} [opts]
   */
  glow(x, y, opts) {
    const p = this._acquire();
    if (!p) return;
    Object.assign(p, {
      alive: true,
      x: x, y: y,
      vx: 0, vy: 0,
      life: 0,
      maxLife: (opts && opts.life) || 600,
      size: (opts && opts.radius) || 20,
      sizeEnd: ((opts && opts.radius) || 20) * 2.5,
      color: (opts && opts.color) || '#f5d76e',
      alpha: 0.85, alphaEnd: 0,
      gravity: 0,
      shape: 'glow'
    });
    this._active.push(p);
    this._ensureRunning();
  }

  _ensureRunning() {
    if (this._running || this._paused) return;
    this._running = true;
    this._lastFrame = performance.now();
    const self = this;
    this._raf = requestAnimationFrame(function (t) { self._frame(t); });
  }

  _frame(now) {
    if (!this._running) return;
    const dt = Math.min(50, now - this._lastFrame);
    this._lastFrame = now;

    // FPS 采样（每秒取一次平均）
    this._fpsSamples.push(dt);
    if (this._fpsSamples.length > 30) this._fpsSamples.shift();

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._w, this._h);

    const alive = [];
    for (let i = 0; i < this._active.length; i++) {
      const p = this._active[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.alive = false;
        continue;
      }
      const t = p.life / p.maxLife;
      const inv = 1 - t;
      p.vy += p.gravity * (dt / 1000);
      p.x += p.vx * (dt / 1000);
      p.y += p.vy * (dt / 1000);
      const a = p.alpha + (p.alphaEnd - p.alpha) * t;
      const sz = p.size + (p.sizeEnd - p.size) * t;

      ctx.globalAlpha = Math.max(0, Math.min(1, a));

      if (p.shape === 'glow') {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, sz), 0, Math.PI * 2);
        ctx.fill();
      }

      p.vx *= inv * 0.5 + 0.5;
      alive.push(p);
    }

    ctx.globalAlpha = 1;
    this._active = alive;

    if (this._active.length > 0 && !this._paused) {
      const self = this;
      this._raf = requestAnimationFrame(function (t) { self._frame(t); });
    } else {
      this._running = false;
      ctx.clearRect(0, 0, this._w, this._h);
    }
  }

  /** 暂停（后台 / FS 切场景时） */
  pause() {
    this._paused = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._running = false;
  }

  /** 恢复 */
  resume() {
    this._paused = false;
    if (this._active.length > 0) this._ensureRunning();
  }

  /** 清空所有粒子 */
  clear() {
    for (let i = 0; i < this._active.length; i++) this._active[i].alive = false;
    this._active = [];
    if (this._raf) cancelAnimationFrame(this._raf);
    this._running = false;
    this._ctx.clearRect(0, 0, this._w, this._h);
  }

  /** 平均帧时长（用于 FPS 估算，供 Adaptive Quality 用） */
  avgFrameMs() {
    if (this._fpsSamples.length === 0) return 16.67;
    let sum = 0;
    for (let i = 0; i < this._fpsSamples.length; i++) sum += this._fpsSamples[i];
    return sum / this._fpsSamples.length;
  }

  /** 销毁 */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);
    this.clear();
    this._pool = [];
  }
}
