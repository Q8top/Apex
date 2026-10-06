// Apex Engine · Replay System
// 用途: 记录 spin 结果 + 确定性重放验证
// 策略 R1: 只记录 seed + seq, 重放时从头快进到 seq
//          不改动 rng.js, 保持 Math Engine 完全不变
// 环境: 当前仅 Demo / Simulation. authority 字段标记结果来源.

import { createMathEngine } from './math-engine.js';

// ══════════════════════════════════════════════════════════
// 工具
// ══════════════════════════════════════════════════════════

/**
 * 计算确定性 spinId
 * @param {string} roundId  回合标识 (如 "r42")
 * @param {number|string} seed  本次会话的 RNG seed
 * @param {number} seq      本回合内的顺序号 (0-based)
 * @returns {string}
 */
export function computeSpinId(roundId, seed, seq) {
  if (roundId == null || seed == null || seq == null) {
    throw new TypeError('computeSpinId: roundId/seed/seq 均不可为空');
  }
  if (!Number.isInteger(seq) || seq < 0) {
    throw new TypeError('computeSpinId: seq 必须为非负整数');
  }
  return String(roundId) + '-' + String(seed) + '-' + String(seq);
}

/**
 * 深度相等比较 (用于 Replay 验证)
 * 只比较可 JSON 序列化的值 (与 JSONL 记录语义一致)
 */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') {
    // NaN !== NaN, 但数学结果中不应出现 NaN
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return false;
  }
  for (const k of ka) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

/**
 * 找出两个对象第一个差异路径 (调试用)
 * 返回 null 表示无差异, 否则返回 { path, a, b }
 */
export function findFirstDiff(a, b, path) {
  path = path || '';
  if (a === b) return null;
  if (a == null || b == null || typeof a !== typeof b) {
    return { path: path || '/', a: a, b: b };
  }
  if (typeof a !== 'object') {
    return { path: path || '/', a: a, b: b };
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return { path: path || '/', a: a, b: b };
    if (a.length !== b.length) {
      return { path: path + '.length', a: a.length, b: b.length };
    }
    for (let i = 0; i < a.length; i++) {
      const d = findFirstDiff(a[i], b[i], path + '[' + i + ']');
      if (d) return d;
    }
    return null;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const d = findFirstDiff(a[k], b[k], path ? (path + '.' + k) : k);
    if (d) return d;
  }
  return null;
}

// ══════════════════════════════════════════════════════════
// 序列化 / 反序列化
// ══════════════════════════════════════════════════════════

/**
 * 构造 spin 记录的完整结构 (不写入磁盘, 只返回对象)
 * @param {Object} spinResult  MathEngine.playSpin() 的返回值
 * @param {Object} meta        { seed, mode, bet, seq, roundId, authority? }
 * @returns {Object}           可 JSON.stringify 的记录
 */
export function serializeSpin(spinResult, meta) {
  if (!spinResult || typeof spinResult !== 'object') {
    throw new TypeError('serializeSpin: spinResult 必须是对象');
  }
  if (!meta || typeof meta !== 'object') {
    throw new TypeError('serializeSpin: meta 必须是对象');
  }
  const required = ['seed', 'mode', 'bet', 'seq', 'roundId'];
  for (const k of required) {
    if (meta[k] == null) {
      throw new TypeError('serializeSpin: meta.' + k + ' 缺失');
    }
  }
  if (!Number.isInteger(meta.seq) || meta.seq < 0) {
    throw new TypeError('serializeSpin: meta.seq 必须为非负整数');
  }
  if (typeof meta.bet !== 'number' || !(meta.bet > 0)) {
    throw new TypeError('serializeSpin: meta.bet 必须是正数');
  }

  return {
    spinId: computeSpinId(meta.roundId, meta.seed, meta.seq),
    roundId: meta.roundId,
    seq: meta.seq,
    seed: meta.seed,
    configVersion: spinResult.configVersion || null,
    mathVersion: spinResult.mathVersion || null,
    gameMode: meta.mode,
    bet: meta.bet,
    authority: meta.authority || 'client',
    timestamp: meta.timestamp || new Date().toISOString(),
    result: spinResult
  };
}

/**
 * 从 JSONL 一行解析记录
 * @param {string} line
 * @returns {Object}
 */
export function deserializeSpin(line) {
  if (typeof line !== 'string') {
    throw new TypeError('deserializeSpin: line 必须是字符串');
  }
  const trimmed = line.trim();
  if (!trimmed) {
    throw new TypeError('deserializeSpin: line 不能为空');
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    throw new Error('deserializeSpin: JSON 解析失败 - ' + e.message);
  }
  const required = ['spinId', 'roundId', 'seq', 'seed', 'gameMode', 'bet', 'result'];
  for (const k of required) {
    if (parsed[k] == null) {
      throw new Error('deserializeSpin: 缺少字段 ' + k);
    }
  }
  return parsed;
}

// ══════════════════════════════════════════════════════════
// ReplayRecorder · JSONL append-only
// ══════════════════════════════════════════════════════════

export class ReplayRecorder {
  /**
   * @param {string} filePath  JSONL 输出路径 (调用方负责确保目录存在)
   */
  constructor(filePath) {
    if (typeof filePath !== 'string' || !filePath) {
      throw new TypeError('ReplayRecorder: filePath 必须为非空字符串');
    }
    this.filePath = filePath;
    this.count = 0;
    this.buffer = [];
    this.fs = null;
    this._initialized = false;
  }

  /**
   * 延迟加载 fs (以便在浏览器端不引入 node:fs)
   * 首次 record() 时初始化
   */
  async _ensureFs() {
    if (this._initialized) return;
    const fs = await import('node:fs');
    const path = await import('node:path');
    this.fs = fs;
    this.pathMod = path;
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this._initialized = true;
  }

  /**
   * 追加一条记录 (同步, 内部先 buffer)
   * 若已 flush 过, 则直接 appendFileSync
   */
  record(spinResult, meta) {
    if (!this._initialized) {
      // 同步路径: 使用 require-like 方式 (ESM 下通过 createRequire)
      // 为简化, 这里抛错提示使用 recordAsync, 或预先 init
      throw new Error('ReplayRecorder: 请先 await recorder.init() 或使用 recordAsync');
    }
    const rec = serializeSpin(spinResult, meta);
    const line = JSON.stringify(rec) + '\n';
    this.fs.appendFileSync(this.filePath, line, 'utf8');
    this.count++;
    return rec.spinId;
  }

  /**
   * 异步初始化 (Node)
   */
  async init() {
    await this._ensureFs();
    return this;
  }

  /**
   * 异步追加一条记录
   */
  async recordAsync(spinResult, meta) {
    await this._ensureFs();
    const rec = serializeSpin(spinResult, meta);
    const line = JSON.stringify(rec) + '\n';
    await this.fs.promises.appendFile(this.filePath, line, 'utf8');
    this.count++;
    return rec.spinId;
  }

  /**
   * 读取所有已记录条目
   */
  static async loadAll(filePath) {
    const fs = await import('node:fs');
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const out = [];
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      out.push(deserializeSpin(line));
    }
    return out;
  }
}

// ══════════════════════════════════════════════════════════
// ReplayVerifier · R1 策略 (快进到 seq, 比对完整 GameResult)
// ══════════════════════════════════════════════════════════

export class ReplayVerifier {
  /**
   * @param {Object} config   game.json 内容
   */
  constructor(config) {
    if (!config || !config.game) {
      throw new TypeError('ReplayVerifier: config.game 缺失');
    }
    this.config = config;
  }

  /**
   * 验证单条记录
   * @param {Object} record   deserializeSpin() 的返回值
   * @returns {Object}        { ok, spinId, reason?, diff? }
   */
  verify(record) {
    if (!record || typeof record !== 'object') {
      throw new TypeError('verify: record 必须是对象');
    }
    const { seed, seq, gameMode, bet, spinId } = record;
    if (seed == null || seq == null || !gameMode || bet == null) {
      return {
        ok: false,
        spinId: spinId || null,
        reason: 'record 缺少必要字段 (seed/seq/gameMode/bet)'
      };
    }

    // 版本一致性: 若记录带版本且与 config 不符, 直接失败
    if (record.configVersion && record.configVersion !== this.config.version) {
      return {
        ok: false,
        spinId,
        reason: 'configVersion 不匹配: 记录=' + record.configVersion +
                ' 当前=' + this.config.version
      };
    }
    if (record.mathVersion && record.mathVersion !== this.config.mathVersion) {
      return {
        ok: false,
        spinId,
        reason: 'mathVersion 不匹配: 记录=' + record.mathVersion +
                ' 当前=' + this.config.mathVersion
      };
    }

    // R1: 重新创建引擎, 快进 seq 次, 然后 playSpin(bet)
    let engine;
    try {
      engine = createMathEngine(this.config, { seed, mode: gameMode });
    } catch (e) {
      return { ok: false, spinId, reason: 'createMathEngine 失败: ' + e.message };
    }

    for (let i = 0; i < seq; i++) {
      engine.playSpin(bet);
    }
    const reproduced = engine.playSpin(bet);

    // 补充版本字段 (便于一致比对)
    reproduced.configVersion = this.config.version;
    reproduced.mathVersion = this.config.mathVersion;

    // 记录里的 result 也补齐版本字段 (老记录可能缺)
    const expected = Object.assign({}, record.result);
    if (!expected.configVersion) expected.configVersion = this.config.version;
    if (!expected.mathVersion) expected.mathVersion = this.config.mathVersion;

    if (deepEqual(reproduced, expected)) {
      return { ok: true, spinId };
    }

    const diff = findFirstDiff(reproduced, expected);
    return {
      ok: false,
      spinId,
      reason: 'deepEqual 不一致',
      diff
    };
  }

  /**
   * 批量验证
   * @param {Array} records
   * @returns {Object}  { total, passed, failed, failures: [] }
   */
  verifyAll(records) {
    if (!Array.isArray(records)) {
      throw new TypeError('verifyAll: records 必须是数组');
    }
    const failures = [];
    let passed = 0;
    for (const r of records) {
      const res = this.verify(r);
      if (res.ok) passed++;
      else failures.push(res);
    }
    return {
      total: records.length,
      passed,
      failed: records.length - passed,
      failures
    };
  }
}

// ══════════════════════════════════════════════════════════
// 便捷: 生成 Record (不落盘, 供测试)
// ══════════════════════════════════════════════════════════

/**
 * 一次性生成 seq+1 个 spin 的记录 (从 seq=0 到 seq)
 * @param {Object} config
 * @param {Object} opts    { seed, mode, bet, roundId, count }
 * @returns {Array}        记录数组
 */
export function generateRecords(config, opts) {
  const seed = opts.seed;
  const mode = opts.mode || 'demo';
  const bet = opts.bet != null ? opts.bet : 1;
  const roundId = opts.roundId || 'r0';
  const count = opts.count != null ? opts.count : 10;
  if (!Number.isInteger(count) || count < 1) {
    throw new TypeError('generateRecords: count 必须为 >= 1 的整数');
  }
  const engine = createMathEngine(config, { seed, mode });
  const out = [];
  for (let i = 0; i < count; i++) {
    const result = engine.playSpin(bet);
    result.configVersion = config.version;
    result.mathVersion = config.mathVersion;
    out.push(serializeSpin(result, {
      seed, mode, bet, seq: i, roundId,
      authority: 'client',
      timestamp: new Date(1700000000000 + i * 1000).toISOString()
    }));
  }
  return out;
}
