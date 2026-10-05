/* ============================================================
   Apex Olympius · EventBus.js
   极简事件总线
   
   用途：
   - GameEngine 输出"游戏事件"（spin:start / win:amount / ...）
   - UI 层订阅事件，播放对应动画/音效
   - 数学与表现解耦
   
   支持：
   - on(type, fn)      订阅
   - once(type, fn)    订阅一次
   - off(type, fn)     取消
   - emit(type, data)  触发
   - clear()           清空所有
   ============================================================ */

export class EventBus {
  constructor({ debug = false } = {}) {
    this._map = new Map();       // type -> Set<fn>
    this._debug = debug;
  }

  on(type, fn) {
    if (!this._map.has(type)) this._map.set(type, new Set());
    this._map.get(type).add(fn);
    return () => this.off(type, fn);
  }

  once(type, fn) {
    const wrap = (data) => {
      this.off(type, wrap);
      fn(data);
    };
    return this.on(type, wrap);
  }

  off(type, fn) {
    const set = this._map.get(type);
    if (!set) return;
    set.delete(fn);
  }

  emit(type, data) {
    if (this._debug) console.log('[Bus] ' + type, data || '');
    const set = this._map.get(type);
    if (!set) return 0;
    // 拷贝一份，防止回调内 off 影响遍历
    const arr = Array.from(set);
    for (const fn of arr) {
      try { fn(data); } catch (e) { console.error('[Bus] handler error on ' + type, e); }
    }
    return arr.length;
  }

  /* 一次性注册多个事件：{ type: fn, ... } */
  register(map) {
    const offs = [];
    for (const [type, fn] of Object.entries(map)) {
      offs.push(this.on(type, fn));
    }
    return () => offs.forEach(f => f());
  }

  clear() {
    this._map.clear();
  }

  /* 调试：返回事件类型列表 */
  types() {
    return Array.from(this._map.keys());
  }
}

export const VERSION = 'olympius-eventbus-v1.0.0';
