/* Apex · Sheet scroll lock 共享锁
 * 多个 sheet 同时打开时正确维持/恢复 body overflow。
 *
 * 语义：
 *   - lock()   count+1，count 由 0 → 1 时保存当前 overflow 并设为 'hidden'
 *   - unlock() count-1，count 归 0 时恢复保存的 overflow
 *   - reset()  强制清零（测试 / 异常恢复用）
 *
 * 依赖：全局 window / document。无外部依赖。
 */
(function () {
  'use strict';

  var count = 0;
  var prevOverflow = null;

  function lock() {
    count++;
    if (count === 1) {
      prevOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }
    return count;
  }

  function unlock() {
    count = Math.max(0, count - 1);
    if (count === 0) {
      document.body.style.overflow = prevOverflow || '';
      prevOverflow = null;
    }
    return count;
  }

  function getCount() { return count; }

  function reset() {
    count = 0;
    prevOverflow = null;
  }

  window.ApexSheetLock = Object.freeze({
    lock: lock,
    unlock: unlock,
    getCount: getCount,
    reset: reset
  });
})();
