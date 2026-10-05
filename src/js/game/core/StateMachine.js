/* ============================================================
   Apex Olympius · StateMachine.js
   显式状态机 · 替代散落的布尔值
   
   为什么需要：
   - 布尔值（spinning/winning/tumbling）组合会产生矛盾状态
   - 显式状态 + 转换表，从根本防止非法状态
   - 状态可查询、可日志、可回放
   
   状态列表：
     IDLE          等待用户操作
     SPINNING      正在生成盘面 / 播放起手动画
     EVALUATING    扫描盘面，寻找中奖
     WINNING       高亮中奖符号
     TUMBLING      消除 + 补位
     MULTIPLIER    倍率降落动画
     SCATTER_CHECK 检查 Scatter 数量
     FS_TRIGGER    触发免费旋转
     FREE_SPINS    免费旋转进行中
     BIG_WIN       大赢全屏展示
     COMPLETE      本局结束，即将回 IDLE
   ============================================================ */

export const S = Object.freeze({
  IDLE:          'IDLE',
  SPINNING:      'SPINNING',
  EVALUATING:    'EVALUATING',
  WINNING:       'WINNING',
  TUMBLING:      'TUMBLING',
  MULTIPLIER:    'MULTIPLIER',
  SCATTER_CHECK: 'SCATTER_CHECK',
  FS_TRIGGER:    'FS_TRIGGER',
  FREE_SPINS:    'FREE_SPINS',
  BIG_WIN:       'BIG_WIN',
  COMPLETE:      'COMPLETE'
});

/* 合法转换表：state -> 允许进入的下一个状态数组 */
export const TRANSITIONS = Object.freeze({
  IDLE:          [S.SPINNING],
  SPINNING:      [S.EVALUATING, S.COMPLETE],         // 异常/无中奖直接结束
  EVALUATING:    [S.WINNING, S.MULTIPLIER, S.SCATTER_CHECK, S.COMPLETE],
  WINNING:       [S.TUMBLING, S.MULTIPLIER, S.SCATTER_CHECK, S.COMPLETE],
  TUMBLING:      [S.EVALUATING, S.MULTIPLIER, S.SCATTER_CHECK, S.COMPLETE],
  MULTIPLIER:    [S.EVALUATING, S.WINNING, S.TUMBLING, S.SCATTER_CHECK, S.COMPLETE],
  SCATTER_CHECK: [S.FS_TRIGGER, S.BIG_WIN, S.COMPLETE],
  FS_TRIGGER:    [S.FREE_SPINS],
  FREE_SPINS:    [S.EVALUATING, S.WINNING, S.TUMBLING, S.MULTIPLIER, S.SCATTER_CHECK, S.BIG_WIN, S.COMPLETE],
  BIG_WIN:       [S.COMPLETE, S.FREE_SPINS],
  COMPLETE:      [S.IDLE]
});

/* ===== 状态机类 ===== */
export class StateMachine {
  constructor({ debug = false } = {}) {
    this._state = S.IDLE;
    this._since = Date.now();
    this._history = [];
    this._listeners = new Map();     // state -> [fn]
    this._anyListeners = [];         // 任何变化都触发
    this._debug = debug;
  }

  get current() { return this._state; }
  get since()   { return this._since; }
  get history() { return this._history.slice(); }

  /* 是否能转入目标状态 */
  canGoTo(next) {
    if (next === this._state) return true;
    const allowed = TRANSITIONS[this._state];
    return Array.isArray(allowed) && allowed.includes(next);
  }

  /* 转入目标状态（返回是否成功） */
  goTo(next, meta = {}) {
    if (next === this._state) return true;   // 幂等

    if (!TRANSITIONS[next]) {
      if (this._debug) console.warn('[SM] 未知状态：' + next);
      return false;
    }

    if (!this.canGoTo(next)) {
      if (this._debug) console.warn(`[SM] 非法转换：${this._state} -> ${next}`);
      return false;
    }

    const prev = this._state;
    const now = Date.now();
    this._history.push({
      from: prev,
      to: next,
      at: now,
      duration: now - this._since,
      meta
    });
    if (this._history.length > 500) this._history.shift();

    this._state = next;
    this._since = now;

    if (this._debug) {
      console.log(`[SM] ${prev} -> ${next}  (${now - (this._history[this._history.length - 1].at - this._history[this._history.length - 1].duration)}ms)`);
    }

    // 触发监听器
    const fns = this._listeners.get(next);
    if (fns) for (const fn of fns) { try { fn(meta, prev); } catch (e) { console.error('[SM] listener error', e); } }
    for (const fn of this._anyListeners) { try { fn(next, prev, meta); } catch (e) { console.error('[SM] any listener error', e); } }

    return true;
  }

  /* 订阅特定状态进入事件 */
  onEnter(state, fn) {
    if (!this._listeners.has(state)) this._listeners.set(state, []);
    this._listeners.get(state).push(fn);
    return () => this.off(state, fn);
  }

  /* 取消订阅 */
  off(state, fn) {
    const arr = this._listeners.get(state);
    if (!arr) return;
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }

  /* 订阅所有状态变化 */
  onAny(fn) {
    this._anyListeners.push(fn);
    return () => {
      const i = this._anyListeners.indexOf(fn);
      if (i >= 0) this._anyListeners.splice(i, 1);
    };
  }

  /* 输入锁定查询：非 IDLE 时锁定 UI */
  isLocked() {
    return this._state !== S.IDLE;
  }

  /* 是否处于"游戏进行中"（用于判断是否需要收尾） */
  isBusy() {
    return this._state !== S.IDLE && this._state !== S.COMPLETE;
  }

  /* 强制重置到 IDLE（用于异常兜底） */
  reset() {
    const prev = this._state;
    this._state = S.IDLE;
    this._since = Date.now();
    this._history.push({ from: prev, to: S.IDLE, at: this._since, duration: 0, meta: { forced: true } });
    if (this._debug) console.warn(`[SM] 强制重置 ${prev} -> IDLE`);
  }

  /* 调试：打印历史 */
  dumpHistory() {
    return this._history.map(h =>
      `${h.from} -> ${h.to}  (${h.duration}ms)`
    );
  }
}

export const VERSION = 'olympius-state-v1.0.0';
