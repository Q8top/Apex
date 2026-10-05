/* ============================================================
 * Apex Olympius · Easing
 * ------------------------------------------------------------
 * 纯函数缓动库。无状态、无依赖、无副作用。
 *
 * 约定：
 *   - t ∈ [0,1] 由调用方保证；内部 clamp01 兜底
 *   - 除 easeOutBack / easeInBack 等 overshoot 类外，f(0)=0 且 f(1)=1
 *   - 输入 NaN → 视为 0；输入 +Infinity → 视为 1；-Infinity → 视为 0
 *
 * 禁：Math.random / eval / new Function
 * ============================================================ */

export const VERSION = 'olympius-easing-v1.0.1';

export function clamp01(t) {
  if (t !== t) return 0;         // NaN
  if (t <= 0) return 0;          // 含 -Infinity
  if (t >= 1) return 1;          // 含 +Infinity
  return t;
}

export function clamp(t, lo, hi) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) return lo;
  if (t !== t) return lo;
  if (t <= lo) return lo;
  if (t >= hi) return hi;
  return t;
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp01(t);
}

export function inverseLerp(a, b, v) {
  if (b === a) return 0;
  return clamp01((v - a) / (b - a));
}

/* ---------- 线性 ---------- */
export function linear(t) {
  return clamp01(t);
}

/* ---------- 二次 ---------- */
export function easeInQuad(t) {
  t = clamp01(t);
  return t * t;
}

export function easeOutQuad(t) {
  t = clamp01(t);
  const u = 1 - t;
  return 1 - u * u;
}

/* ---------- 三次 ---------- */
export function easeInCubic(t) {
  t = clamp01(t);
  return t * t * t;
}

export function easeOutCubic(t) {
  t = clamp01(t);
  const u = 1 - t;
  return 1 - u * u * u;
}

export function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ---------- 回弹（带 overshoot） ---------- */
const BACK_C1 = 1.70158;

export function easeOutBack(t, s = BACK_C1) {
  t = clamp01(t);
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

/* 兼容别名 */
export const easeOutBack2 = easeOutBack;

/* ---------- 正弦 ---------- */
export function easeInSine(t) {
  t = clamp01(t);
  return 1 - Math.cos((t * Math.PI) / 2);
}

export function easeOutSine(t) {
  t = clamp01(t);
  return Math.sin((t * Math.PI) / 2);
}

/* ---------- 指数 ---------- */
export function easeOutExpo(t) {
  t = clamp01(t);
  if (t === 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

/* ---------- 弹跳 ---------- */
export function easeOutBounce(t) {
  t = clamp01(t);
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
  if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
  t -= 2.625 / d1;
  return n1 * t * t + 0.984375;
}
