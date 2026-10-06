// Apex Engine · RNG Abstraction
// 算法: xorshift128+ (Vigna 2016)
// 用途: 游戏数学。禁止 Math.random / LCG / sin-hash / 时间戳
// ES Module · 无依赖 · Node 可直接运行

const MASK64 = (1n << 64n) - 1n;
const TWO_POW_53 = 9007199254740992; // 2^53
const DEFAULT_SEED = 0x9E3779B97F4A7C15n;

export class RNG {
  constructor(seed) {
    this.reseed(seed);
  }

  reseed(seed) {
    let s = (seed == null) ? DEFAULT_SEED : BigInt(seed);
    s = s & MASK64;
    if (s === 0n) s = DEFAULT_SEED;

    // SplitMix64 派生两个 64 位状态
    let x = s;
    const splitmix = () => {
      x = (x + 0x9E3779B97F4A7C15n) & MASK64;
      let z = x;
      z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
      z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
      z = z ^ (z >> 31n);
      return z & MASK64;
    };
    this.s0 = splitmix();
    this.s1 = splitmix();
    if (this.s0 === 0n && this.s1 === 0n) this.s1 = 1n;

    return this;
  }

  // 返回 64 位无符号整数 (BigInt)
  next() {
    let s1 = this.s0;
    const s0 = this.s1;
    this.s0 = s0;
    s1 ^= (s1 << 23n) & MASK64;
    s1 ^= (s1 >> 17n);
    s1 ^= s0;
    s1 ^= (s0 >> 26n);
    this.s1 = s1;
    return (s0 + s1) & MASK64;
  }

  // 返回 [0, 1) 的双精度浮点数
  nextFloat() {
    const v = this.next() >> 11n; // 取高 53 位
    return Number(v) / TWO_POW_53;
  }

  // 返回 [min, max] 的整数 (inclusive)
  int(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max))
      throw new TypeError('int(min, max) 必须为整数');
    if (max < min) throw new RangeError('max < min');
    const range = BigInt(max - min + 1);
    const v = this.next() % range;
    return min + Number(v);
  }

  // 加权抽取
  // items: 任意数组; weights: 同长度数字数组 (>= 0, 至少一个 > 0)
  pickWeighted(items, weights) {
    if (!Array.isArray(items) || items.length === 0)
      throw new TypeError('items 必须为非空数组');
    if (!Array.isArray(weights) || weights.length !== items.length)
      throw new TypeError('weights 长度必须等于 items');
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      if (typeof w !== 'number' || !isFinite(w) || w < 0)
        throw new TypeError('weights[' + i + '] 非法');
      total += w;
    }
    if (total <= 0) throw new RangeError('weights 总和必须 > 0');
    const r = this.nextFloat() * total;
    let acc = 0;
    for (let i = 0; i < items.length; i++) {
      acc += weights[i];
      if (r < acc) return items[i];
    }
    return items[items.length - 1];
  }

  // Fisher-Yates 洗牌 (原地)
  shuffle(arr) {
    if (!Array.isArray(arr)) throw new TypeError('shuffle 需要数组');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
}

// 工厂函数: 让调用方不必 new
export function createRNG(seed) {
  return new RNG(seed);
}

// 从外部熵源派生 seed (仅供参考; 游戏数学请用固定 seed 以支持 Replay)
export function seedFromString(str) {
  let h = 14695981039346656037n; // FNV-1a 64-bit offset basis
  const FNV_PRIME = 1099511628211n;
  for (let i = 0; i < str.length; i++) {
    h ^= BigInt(str.charCodeAt(i));
    h = (h * FNV_PRIME) & MASK64;
  }
  return h;
}
