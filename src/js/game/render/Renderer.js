/* ============================================================
 * Apex Olympius · Renderer
 * ------------------------------------------------------------
 * 全项目唯一 requestAnimationFrame 持有者。
 * 全项目唯一时钟源：每帧调用 timeline.update(dtMs)。
 * 只负责：Canvas 尺寸 / DPR / RAF 循环 / dt 计算 / 可见性 / resize。
 * 具体绘制由 onFrame 回调（GridRenderer / FX / HUD 等）挂载。
 * ============================================================ */

import { DPR_MAX } from './RenderConstants.js';
import { AnimationTimeline } from './AnimationTimeline.js';

export const VERSION = 'olympius-renderer-v1.0.0';

const DT_MAX_MS = 100;      // 单帧 dt 上限，防后台切回瞬移
const DT_NORMAL_MS = 16.7;  // 首帧 / 重启后的默认 dt

export class Renderer {
  constructor({ canvas, timeline = null, onFrame = null, debug = false } = {}) {
    if (!canvas || !canvas.getContext) {
      throw new Error('Renderer: canvas element is required');
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!this.ctx) throw new Error('Renderer: 2D context unavailable');

    this.timeline = timeline || new AnimationTimeline();
    this.onFrame = onFrame;
    this.debug = debug;

    this._running = false;
    this._rafId = 0;
    this._lastTs = 0;
    this._dpr = 1;
    this._rect = { width: 0, height: 0 };
    this._frameCount = 0;
    this._fpsAccum = 0;
    this._fpsTimer = 0;
    this._fps = 0;

    this._onResize = this._onResize.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._onReduceMotion = this._onReduceMotion.bind(this);

    this._reduceMotionQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
  }

  /* -------- 生命周期 -------- */
  init() {
    this._attachListeners();
    this._applyReduceMotion();
    this._resize();
    return this;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTs = 0;
    this._rafId = requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = 0;
    this._lastTs = 0;
  }

  destroy() {
    this.stop();
    this._detachListeners();
    this.timeline.cancel();
  }

  /* -------- 只读查询 -------- */
  get fps()    { return this._fps; }
  get dpr()    { return this._dpr; }
  get width()  { return this._rect.width; }
  get height() { return this._rect.height; }

  /* -------- 主循环 -------- */
  _loop(ts) {
    if (!this._running) return;

    const last = this._lastTs || ts - DT_NORMAL_MS;
    let dt = ts - last;
    if (!Number.isFinite(dt) || dt <= 0) dt = DT_NORMAL_MS;
    if (dt > DT_MAX_MS) dt = DT_MAX_MS;
    this._lastTs = ts;

    /* 唯一时钟推进 */
    this.timeline.update(dt);

    /* 绘制 */
    try {
      this._draw(dt);
    } catch (e) {
      console.error('[Olympius][Renderer] draw error', e);
    }

    if (this.debug) this._tickFps(dt);

    this._rafId = requestAnimationFrame(this._loop.bind(this));
  }

  _draw(dt) {
    const { ctx } = this;
    const { width, height } = this._rect;
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (this.onFrame) this.onFrame(dt, ctx, width, height);
  }

  _tickFps(dt) {
    this._frameCount++;
    this._fpsAccum += dt;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 1000) {
      this._fps = Math.round((this._frameCount * 1000) / this._fpsTimer);
      this._frameCount = 0;
      this._fpsTimer = 0;
    }
  }

  /* -------- 尺寸 / DPR -------- */
  _resize() {
    const el = this.canvas;
    const rect = el.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));

    const dpr = Math.min(
      (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
      DPR_MAX
    );

    const bufW = Math.round(cssW * dpr);
    const bufH = Math.round(cssH * dpr);

    if (el.width !== bufW || el.height !== bufH) {
      el.width = bufW;
      el.height = bufH;
    }

    this._dpr = dpr;
    this._rect = { width: cssW, height: cssH };
  }

  _onResize() {
    this._resize();
  }

  _onVisibility() {
    if (document.hidden) {
      this.stop();
    } else if (!this._running) {
      this.start();
    }
  }

  /* -------- prefers-reduced-motion -------- */
  _applyReduceMotion() {
    const q = this._reduceMotionQuery;
    if (!q) return;
    if (q.matches) {
      this.timeline.setSpeed(0.3);
    } else {
      this.timeline.setSpeed(1.0);
    }
  }

  _onReduceMotion() {
    this._applyReduceMotion();
  }

  /* -------- 事件绑定 -------- */
  _attachListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('orientationchange', this._onResize, { passive: true });
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibility);
    }
    if (this._reduceMotionQuery && this._reduceMotionQuery.addEventListener) {
      this._reduceMotionQuery.addEventListener('change', this._onReduceMotion);
    }
  }

  _detachListeners() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('orientationchange', this._onResize);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibility);
    }
    if (this._reduceMotionQuery && this._reduceMotionQuery.removeEventListener) {
      this._reduceMotionQuery.removeEventListener('change', this._onReduceMotion);
    }
  }
}
