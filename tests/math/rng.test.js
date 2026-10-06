#!/usr/bin/env node
// Apex Engine · RNG 测试 (xorshift128+)
// 零依赖 · 纯 Node
// 运行: node tests/math/rng.test.js

import { RNG, createRNG, seedFromString } from '../../src/js/engine/rng.js';

let passed = 0, failed = 0;
const failures = [];

function eq(a, b, label) {
  if (a === b) { passed++; return; }
  failed++; failures.push(label + ': 期望 ' + String(b) + ', 实际 ' + String(a));
}

function ok(cond, label) {
  if (cond) { passed++; return; }
  failed++; failures.push(label);
}

function approx(a, b, tol, label) {
  if (Math.abs(a - b) <= tol) { passed++; return; }
  failed++; failures.push(label + ': |' + a + ' - ' + b + '| > ' + tol);
}

function section(title) {
  console.log('\n--- ' + title + ' ---');
}

// ═══════════════ 1. 确定性 ═══════════════
section('1. 确定性 (同 seed 同序列)');

const r1 = new RNG(12345);
const r2 = new RNG(12345);
for (let i = 0; i < 100; i++) {
  const a = r1.next();
  const b = r2.next();
  if (a !== b) { failed++; failures.push('第 ' + i + ' 步不一致: ' + a + ' vs ' + b); break; }
}
if (failures.length === 0) passed++;

// ═══════════════ 2. 不同 seed 不同序列 ═══════════════
section('2. 不同 seed → 不同序列');

const ra = new RNG(1);
const rb = new RNG(2);
let diffCount = 0;
for (let i = 0; i < 50; i++) if (ra.next() !== rb.next()) diffCount++;
ok(diffCount === 50, 'seed 1 vs 2: 50 次全部不同, 实际 ' + diffCount);

// ═══════════════ 3. next() 返回 BigInt ═══════════════
section('3. next() 类型与范围');

const rn = new RNG(999);
let typeOk = true, rangeOk = true;
const MASK = (1n << 64n) - 1n;
for (let i = 0; i < 1000; i++) {
  const v = rn.next();
  if (typeof v !== 'bigint') { typeOk = false; break; }
  if (v < 0n || v > MASK) { rangeOk = false; break; }
}
ok(typeOk, 'next() 返回 BigInt');
ok(rangeOk, 'next() 在 [0, 2^64) 范围内');

// ═══════════════ 4. nextFloat() 范围 ═══════════════
section('4. nextFloat() 在 [0, 1)');

const rf = new RNG(777);
let fOk = true;
for (let i = 0; i < 10000; i++) {
  const v = rf.nextFloat();
  if (v < 0 || v >= 1 || !isFinite(v)) { fOk = false; break; }
}
ok(fOk, '10000 个 nextFloat 全在 [0, 1)');

// ═══════════════ 5. int() 边界 ═══════════════
section('5. int(min, max) 边界与包含性');

const ri = new RNG(555);
let minOk = true, maxOk = true;
for (let i = 0; i < 5000; i++) {
  const v = ri.int(3, 7);
  if (v < 3) minOk = false;
  if (v > 7) maxOk = false;
  if (!Number.isInteger(v)) { minOk = false; maxOk = false; }
}
ok(minOk, 'int(3, 7) >= 3');
ok(maxOk, 'int(3, 7) <= 7');

// 单点 range
const rs = new RNG(1);
eq(rs.int(42, 42), 42, 'int(42, 42) === 42');

// 边界错误
let threw = false;
try { new RNG(1).int(5, 3); } catch (e) { threw = true; }
ok(threw, 'int(5, 3) 抛 RangeError');

threw = false;
try { new RNG(1).int(1.5, 3); } catch (e) { threw = true; }
ok(threw, 'int(1.5, 3) 抛 TypeError');

// ═══════════════ 6. int() 分布均匀性 ═══════════════
section('6. int(0, 9) 分布均匀 (chi-like)');

const rd = new RNG(2024);
const buckets = new Array(10).fill(0);
const N = 100000;
for (let i = 0; i < N; i++) buckets[rd.int(0, 9)]++;

const expected = N / 10;
let maxDev = 0;
for (let i = 0; i < 10; i++) {
  const dev = Math.abs(buckets[i] - expected) / expected;
  if (dev > maxDev) maxDev = dev;
}
ok(maxDev < 0.05, 'int 分布最大偏差 ' + (maxDev * 100).toFixed(2) + '% < 5%');
console.log('     buckets:', buckets.join(', '));
console.log('     maxDev:', (maxDev * 100).toFixed(2) + '%');

// ═══════════════ 7. pickWeighted 加权抽取 ═══════════════
section('7. pickWeighted 加权抽取');

const rw = new RNG(31415);
const items = ['a', 'b', 'c'];
const weights = [70, 20, 10];
const counts = { a: 0, b: 0, c: 0 };
const NW = 100000;
for (let i = 0; i < NW; i++) counts[rw.pickWeighted(items, weights)]++;

approx(counts.a / NW, 0.70, 0.02, 'a 频率约 70%');
approx(counts.b / NW, 0.20, 0.02, 'b 频率约 20%');
approx(counts.c / NW, 0.10, 0.02, 'c 频率约 10%');
console.log('     counts:', JSON.stringify(counts));

// 错误处理
threw = false;
try { new RNG(1).pickWeighted([], []); } catch (e) { threw = true; }
ok(threw, 'pickWeighted([], []) 抛 TypeError');

threw = false;
try { new RNG(1).pickWeighted(['a'], [0]); } catch (e) { threw = true; }
ok(threw, 'pickWeighted 权重全 0 抛 RangeError');

threw = false;
try { new RNG(1).pickWeighted(['a', 'b'], [1]); } catch (e) { threw = true; }
ok(threw, 'pickWeighted 长度不匹配抛 TypeError');

// ═══════════════ 8. shuffle ═══════════════
section('8. shuffle (Fisher-Yates)');

// 顺序打乱
const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sh = new RNG(1).shuffle(orig.slice());
let changed = 0;
for (let i = 0; i < orig.length; i++) if (orig[i] !== sh[i]) changed++;
ok(changed >= 5, 'shuffle 至少移动 5 个元素, 实际 ' + changed);

// 元素守恒
const setA = new Set(orig);
const setB = new Set(sh);
eq(setA.size, setB.size, 'shuffle 元素数守恒');
let sameSet = true;
for (const v of setA) if (!setB.has(v)) { sameSet = false; break; }
ok(sameSet, 'shuffle 元素集合不变');

// 确定性
const s1 = new RNG(888).shuffle([1,2,3,4,5,6,7,8,9,10]);
const s2 = new RNG(888).shuffle([1,2,3,4,5,6,7,8,9,10]);
eq(JSON.stringify(s1), JSON.stringify(s2), 'shuffle 同 seed 同结果');

// ═══════════════ 9. reseed ═══════════════
section('9. reseed 重置');

const rr = new RNG(42);
const first1 = rr.next();
const first2 = rr.next();
rr.reseed(42);
eq(rr.next(), first1, 'reseed 后第一个值一致');
eq(rr.next(), first2, 'reseed 后第二个值一致');

// ═══════════════ 10. seedFromString ═══════════════
section('10. seedFromString (FNV-1a)');

const h1 = seedFromString('spin-001');
const h2 = seedFromString('spin-001');
const h3 = seedFromString('spin-002');
eq(h1, h2, 'seedFromString 确定性');
ok(h1 !== h3, 'seedFromString 不同输入不同输出');
ok(typeof h1 === 'bigint', 'seedFromString 返回 BigInt');

// ═══════════════ 11. createRNG 工厂 ═══════════════
section('11. createRNG 工厂');

const c1 = createRNG(123);
ok(c1 instanceof RNG, 'createRNG 返回 RNG 实例');
eq(c1.next(), new RNG(123).next(), 'createRNG(123) 等价 new RNG(123)');

// ═══════════════ 12. seed=0 安全处理 ═══════════════
section('12. seed=0 与 null 安全');

const rz = new RNG(0);
const v0 = rz.next();
ok(typeof v0 === 'bigint' && v0 !== 0n, 'seed=0 被安全替换, 首个值不为 0');

const rnull = new RNG(null);
ok(typeof rnull.next() === 'bigint', 'seed=null 不崩溃');

const rundef = new RNG(undefined);
ok(typeof rundef.next() === 'bigint', 'seed=undefined 不崩溃');

// ═══════════════ 13. 长序列无卡死 ═══════════════
section('13. 长序列 1e6 步');

const rLong = new RNG(1);
const t0 = Date.now();
for (let i = 0; i < 1e6; i++) rLong.next();
const ms = Date.now() - t0;
ok(ms < 3000, '1e6 next() 耗时 < 3s, 实际 ' + ms + 'ms');
console.log('     1e6 next() 耗时:', ms + 'ms');

// ═══════════════ 14. 源码无违规模式 ═══════════════
section('14. rng.js 无违规模式');

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, '../../src/js/engine/rng.js'), 'utf8');

// 剥离 // 行注释 和 /* */ 块注释, 只检查实际代码
const src = raw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

ok(!/Math\.random/.test(src), '无 Math.random (代码)');
ok(!/1103515245|12345/.test(src), '无 LCG 常量 (代码)');
ok(!/12\.9898|43758\.5453/.test(src), '无 sin-hash 常量 (代码)');
ok(!/Date\.now/.test(src), '无 Date.now (代码)');

// ═══════════════ 结果汇总 ═══════════════
console.log('\n══════════════════════════════════');
console.log('PASSED: ' + passed);
console.log('FAILED: ' + failed);

if (failed > 0) {
  console.log('\n失败详情:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('\n[ALL OK] RNG 测试通过');
process.exit(0);
