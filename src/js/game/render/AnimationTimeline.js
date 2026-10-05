/* ============================================================
 * Apex Olympius · AnimationTimeline
 * ------------------------------------------------------------
 * 由外部 RAF 驱动（Renderer.update → tl.update(dt)），
 * 自身不持有 requestAnimationFrame。
 * 虚拟时钟，不依赖 Date.now()，后台标签页切回不会 dt 爆炸。
 * ============================================================ */

export const VERSION = 'olympius-animation-timeline-v1.0.0';

export class CancelError extends Error {
  constructor(msg = 'timeline cancelled') {
    super(msg);
    this.name = 'CancelError';
  }
}

export class AnimationTimeline {
  constructor({ speed = 1 } = {}) {
    if (!Number.isFinite(speed) || speed <= 0) {
      throw new Error('AnimationTimeline: invalid speed');
    }
    this._now = 0;
    this._speed = speed;
    this._pending = new Set();
    this._skip = false;
    this._cancelled = false;
    this._seq = 0;
  }

  get now()         { return this._now; }
  get speed()       { return this._speed; }
  get isSkipping()  { return this._skip; }
  get isCancelled() { return this._cancelled; }
  get pending()     { return this._pending.size; }

  setSpeed(s) {
    if (!Number.isFinite(s) || s <= 0) throw new Error('AnimationTimeline.setSpeed: invalid');
    this._speed = s;
  }

  /* -------- 外部 RAF 驱动 -------- */
  update(dtMs) {
    if (this._cancelled || !Number.isFinite(dtMs) || dtMs <= 0) return;
    this._now += dtMs * this._speed;
    if (this._pending.size === 0) return;

    const ready = [];
    for (const t of this._pending) {
      if (this._now >= t.at) ready.push(t);
    }
    for (const t of ready) {
      this._pending.delete(t);
      t.resolve(this._now);
    }
  }

  /* -------- 时间原语（Player 钩子唯一时间入口） -------- */
  wait(ms) {
    if (this._cancelled) return Promise.reject(new CancelError());
    if (this._skip || !Number.isFinite(ms) || ms <= 0) return Promise.resolve(this._now);

    const at = this._now + ms;
    const id = ++this._seq;
    return new Promise((resolve, reject) => {
      this._pending.add({ at, id, resolve, reject });
    });
  }

  /* -------- 编排（Renderer 内部用） -------- */
  async parallel(items) {
    const tasks = items.map((it) => (typeof it === 'function' ? it() : it));
    return Promise.all(tasks);
  }

  async sequence(items) {
    const out = [];
    for (const it of items) {
      out.push(typeof it === 'function' ? await it() : await it);
    }
    return out;
  }

  /* -------- 快进：resolve 所有等待，不中断 GameEngine -------- */
  skip() {
    this._skip = true;
    this._flushResolve();
  }

  endSkip() {
    this._skip = false;
  }

  /* -------- 硬拆除：reject 所有等待，调用方必须 sm.forceReset() -------- */
  cancel() {
    this._cancelled = true;
    this._flushReject();
  }

  reset() {
    this._now = 0;
    this._skip = false;
    this._cancelled = false;
    this._pending.clear();
  }

  _flushResolve() {
    for (const t of this._pending) t.resolve(this._now);
    this._pending.clear();
  }

  _flushReject() {
    for (const t of this._pending) t.reject(new CancelError());
    this._pending.clear();
  }
}
