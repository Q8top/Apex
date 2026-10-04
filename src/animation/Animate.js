// @ts-check
/* Apex · 通用动画工具
 * 职责：
 *   - countUp：数字滚动（支持 cancel / 格式化）
 *   - 缓动函数库
 *   - shake / pulse 小工具
 * 规则：
 *   - 用 requestAnimationFrame，不用 setInterval
 *   - 不用 Math.random
 *   - 支持 cancel
 */

import { logger } from '../shared/logger.js';

// ── 缓动函数 ──

export const Ease = {
  linear(t) { return t; },
  outQuad(t) { return 1 - (1 - t) * (1 - t); },
  outCubic(t) { return 1 - Math.pow(1 - t, 3); },
  outQuart(t) { return 1 - Math.pow(1 - t, 4); },
  outQuint(t) { return 1 - Math.pow(1 - t, 5); },
  outExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
  inOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
  inOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
};

// ── 数字滚动 ──

/**
 * @typedef {Object} CountUpOpts
 * @property {number} [duration] 毫秒，默认 420
 * @property {(v:number)=>string} [formatter] 默认整数
 * @property {(t:number)=>number} [ease] 默认 outCubic
 * @property {boolean} [skip] 直接跳到终值
 */

/**
 * 数字从 from 滚动到 to
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {CountUpOpts} [opts]
 * @returns {{cancel: () => void, promise: Promise<void>}}
 */
export function countUp(el, from, to, opts) {
  const o = opts || {};
  const duration = o.duration || 420;
  const fmt = o.formatter || function (v) { return String(Math.round(v)); };
  const ease = o.ease || Ease.outCubic;

  let cancelled = false;
  let raf = 0;

  const promise = new Promise(function (resolve) {
    if (o.skip || duration <= 0 || from === to) {
      if (el) el.textContent = fmt(to);
      resolve();
      return;
    }
    const start = performance.now();
    function frame(now) {
      if (cancelled) { resolve(); return; }
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      if (el) el.textContent = fmt(v);
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        if (el) el.textContent = fmt(to);
        resolve();
      }
    }
    raf = requestAnimationFrame(frame);
  });

  return {
    cancel() {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    },
    promise: promise
  };
}

// ── 抖动 ──

/**
 * 元素抖动（用 transform translateX，不触发 layout）
 * @param {HTMLElement} el
 * @param {{intensity?:number, duration?:number}} [opts]
 * @returns {Promise<void>}
 */
export function shake(el, opts) {
  const o = opts || {};
  const intensity = o.intensity || 4;
  const duration = o.duration || 220;
  return new Promise(function (resolve) {
    if (!el) { resolve(); return; }
    const start = performance.now();
    const prev = el.style.transform || '';
    function frame(now) {
      const t = (now - start) / duration;
      if (t >= 1) {
        el.style.transform = prev;
        resolve();
        return;
      }
      const damping = 1 - t;
      // 正弦抖动（无随机）
      const offset = Math.sin(t * Math.PI * 8) * intensity * damping;
      el.style.transform = 'translateX(' + offset.toFixed(2) + 'px)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

// ── 脉冲 ──

/**
 * 元素脉冲（scale 1 → peak → 1）
 * @param {HTMLElement} el
 * @param {{peak?:number, duration?:number}} [opts]
 * @returns {Promise<void>}
 */
export function pulse(el, opts) {
  const o = opts || {};
  const peak = o.peak || 1.12;
  const duration = o.duration || 260;
  return new Promise(function (resolve) {
    if (!el) { resolve(); return; }
    const start = performance.now();
    const prev = el.style.transform || '';
    function frame(now) {
      const t = (now - start) / duration;
      if (t >= 1) {
        el.style.transform = prev;
        resolve();
        return;
      }
      // 0 → 0.5 放大，0.5 → 1 归位
      const k = t < 0.5 ? (t / 0.5) : (1 - (t - 0.5) / 0.5);
      const scale = 1 + (peak - 1) * k;
      el.style.transform = 'scale(' + scale.toFixed(3) + ')';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

// ── CSS class 触发（配合 @keyframes） ──

/**
 * 加 CSS class 播放动画，动画结束后移除
 * @param {HTMLElement} el
 * @param {string} className
 * @param {number} [duration] 毫秒
 * @returns {Promise<void>}
 */
export function playClass(el, className, duration) {
  return new Promise(function (resolve) {
    if (!el) { resolve(); return; }
    el.classList.remove(className);
    // 强制回流，确保动画重启
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(function () {
      el.classList.remove(className);
      resolve();
    }, duration || 400);
  });
}

// ── 数字格式化快捷 ──

/**
 * 格式化带逗号整数（用于 countUp 默认）
 * @param {number} v
 * @returns {string}
 */
export function formatInt(v) {
  return Math.round(v).toLocaleString('en-US');
}
