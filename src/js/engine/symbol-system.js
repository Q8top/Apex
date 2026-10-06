// Apex Engine · Symbol System
// 从 config 加载符号池, 提供加权抽取与分类查询
// 纯逻辑 · 无 DOM · Node 可直接运行

export class SymbolSystem {
  constructor(config) {
    if (!config || !Array.isArray(config.symbols)) {
      throw new TypeError('config.symbols 必须为数组');
    }
    this.config = config;
    this.symbols = config.symbols.slice();
    this.byId = new Map();

    for (const s of this.symbols) {
      if (!s.id) throw new TypeError('symbol 缺少 id');
      if (this.byId.has(s.id)) throw new Error('symbol id 重复: ' + s.id);
      this.byId.set(s.id, s);
    }

    this.bases    = this.symbols.filter(s => s.type === 'base');
    this.highs    = this.symbols.filter(s => s.type === 'high');
    this.normals  = this.bases.concat(this.highs); // 参与普通判奖的符号
    this.scatter  = this.symbols.find(s => s.type === 'scatter') || null;
    this.wild     = this.symbols.find(s => s.type === 'wild') || null;

    // 预抽权重数组
    this.normalIds     = this.normals.map(s => s.id);
    this.normalWeights = this.normals.map(s => s.weight);
    this.baseIds       = this.bases.map(s => s.id);
    this.baseWeights   = this.bases.map(s => s.weight);
    this.highIds       = this.highs.map(s => s.id);
    this.highWeights   = this.highs.map(s => s.weight);

    if (this.normals.length === 0) throw new Error('至少需要一个 base 或 high 符号');
    if (this.normalWeights.every(w => w === 0)) throw new Error('normal 权重全为 0');
  }

  get(id) { return this.byId.get(id) || null; }

  has(id) { return this.byId.has(id); }

  /** 从所有 base + high 中加权抽取一个 id */
  pickNormal(rng) { return rng.pickWeighted(this.normalIds, this.normalWeights); }

  /** 从 base 中加权抽取 */
  pickBase(rng) { return rng.pickWeighted(this.baseIds, this.baseWeights); }

  /** 从 high 中加权抽取 */
  pickHigh(rng) { return rng.pickWeighted(this.highIds, this.highWeights); }

  isScatter(id) { return !!(this.scatter && this.scatter.id === id); }
  isWild(id)    { return !!(this.wild && this.wild.id === id); }
  isSpecial(id) { return this.isScatter(id) || this.isWild(id); }

  /** 给定 count, 返回该符号的 payout 倍率 (无 payout 或不存在返回 0) */
  payoutFor(id, count) {
    const s = this.byId.get(id);
    if (!s || !s.payout) return 0;
    // payout 结构: { "8": 0.2, "10": 0.5, "12": 2.0 }
    // 取 <= count 的最高阈值
    const keys = Object.keys(s.payout).map(Number).sort((a, b) => b - a);
    for (const k of keys) {
      if (count >= k) return s.payout[String(k)];
    }
    return 0;
  }

  /** 返回所有可判奖符号 id (base + high) */
  getNormalIds() { return this.normalIds.slice(); }

  /** 返回 scatter id 或 null */
  getScatterId() { return this.scatter ? this.scatter.id : null; }

  /** 返回 wild id 或 null */
  getWildId() { return this.wild ? this.wild.id : null; }
}

export function createSymbolSystem(config) {
  return new SymbolSystem(config);
}
