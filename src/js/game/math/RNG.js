/* ============================================================
   Apex Olympius · RNG.js
   种子确定性伪随机数生成器（PRNG）
   
   特性：
   - 完全确定性：相同种子 → 相同序列
   - 无 Math.random / 无 crypto（可复现是硬要求）
   - 使用 Mulberry32 算法（32 位状态，周期 2^32）
   - fork() 派生独立子流，避免不同系统相互干扰
   
   用途：
   - 盘面生成、Tumble 补位、倍率降下、Scatter、FS 触发
   都通过 fork() 派生独立流
   ============================================================ */

/* Mulberry32 · 已知分布质量良好的小型 PRNG */
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 从字符串生成 32 位种子（FNV-1a） */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export class RNG {
  constructor(seed) {
    if (typeof seed === 'string') {
      seed = hashString(seed);
    }
    if (!Number.isFinite(seed)) {
      throw new Error('RNG seed must be a number or string');
    }
    this._seed = seed >>> 0;
    this._fn = mulberry32(this._seed);
    this._counter = 0;
  }

  /* 当前种子（用于调试/回放） */
  get seed() {
    return this._seed;
  }

  /* [0, 1) */
  next() {
    this._counter++;
    return this._fn();
  }

  /* [0, n) 整数 */
  nextInt(n) {
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('RNG.nextInt(n): n must be positive');
    }
    return Math.floor(this.next() * n);
  }

  /* 加权随机：返回 items 中一个下标
     weights 与 items 等长，权重应为非负数
     返回: 0 <= idx < items.length
  */
  pickWeightedIndex(weights) {
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      if (w < 0) throw new Error('RNG.pickWeightedIndex: negative weight');
      total += w;
    }
    if (total <= 0) throw new Error('RNG.pickWeightedIndex: total weight = 0');
    let r = this.next() * total;
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r < acc) return i;
    }
    return weights.length - 1;  // 浮点兜底
  }

  /* 加权随机：返回 items[idx] */
  pickWeighted(items, weights) {
    if (items.length !== weights.length) {
      throw new Error('RNG.pickWeighted: items/weights length mismatch');
    }
    return items[this.pickWeightedIndex(weights)];
  }

  /* Fisher–Yates 原地洗牌 */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* 派生独立子流
     用法：const gridRng = rng.fork('grid');
          const multRng = rng.fork('mult');
     label 相同 → 派生流相同（可复现）
  */
  fork(label) {
    const childSeed = hashString('fork:' + this._seed + ':' + label);
    return new RNG(childSeed);
  }

  /* 调试：导出状态 */
  snapshot() {
    return {
      seed: this._seed,
      counter: this._counter
    };
  }
}

/* ============================================================
   测试辅助（非生产代码）：快速生成固定种子 RNG
   ============================================================ */
export function rngFromString(str) {
  return new RNG(str);
}
