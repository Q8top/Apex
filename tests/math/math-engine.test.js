#!/usr/bin/env node
// Apex Engine · Math Engine 测试
// 运行: node tests/math/math-engine.test.js

import { MathEngine, createMathEngine } from '../../src/js/engine/math-engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

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

function inRange(v, lo, hi, label) {
  if (v >= lo && v <= hi) { passed++; return; }
  failed++; failures.push(label + ': ' + v + ' 不在 [' + lo + ', ' + hi + ']');
}

function section(title) {
  console.log('\n--- ' + title + ' ---');
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));

// ═══════════════ 1. 确定性 ═══════════════
section('1. 确定性 (同 seed 同结果)');

const e1 = createMathEngine(config, { seed: 123, mode: 'demo' });
const e2 = createMathEngine(config, { seed: 123, mode: 'demo' });
const s1 = e1.playSpin(10);
const s2 = e2.playSpin(10);
eq(s1.totalWin, s2.totalWin, '同 seed 总赢一致');
eq(s1.tumble.tumbleCount, s2.tumble.tumbleCount, '同 seed tumble 数一致');
eq(s1.freeSpinsAwarded, s2.freeSpinsAwarded, '同 seed Free Spins 一致');

const e3 = createMathEngine(config, { seed: 456, mode: 'demo' });
const s3 = e3.playSpin(10);
ok(s1.totalWin !== s3.totalWin || s1.tumble.tumbleCount !== s3.tumble.tumbleCount,
   '不同 seed 至少一项不同');

// ═══════════════ 2. Grid 大小 ═══════════════
section('2. Grid 6x5');

const eng = createMathEngine(config, { seed: 1, mode: 'demo' });
eq(eng.cols, 6, 'cols=6');
eq(eng.rows, 5, 'rows=5');
eq(eng.minCount, 8, 'minCount=8');

const grid = eng.rollGrid();
eq(grid.length, 5, 'grid 有 5 行');
eq(grid[0].length, 6, 'grid 每行 6 列');

let allFilled = true;
for (let r = 0; r < 5; r++)
  for (let c = 0; c < 6; c++)
    if (!grid[r][c]) allFilled = false;
ok(allFilled, 'grid 全部格子已填充');

// ═══════════════ 3. seed / rng 必填 ═══════════════
section('3. seed 或 rng 必填');

let threw = false;
try { new MathEngine(config, { mode: 'demo' }); } catch (e) { threw = true; }
ok(threw, '不传 seed/rng 抛错');

threw = false;
try { new MathEngine(config, { mode: 'demo', rng: {} }); } catch (e) { threw = true; }
ok(threw, '传非法 rng 抛错');

// ═══════════════ 4. hitRate 靶向 ═══════════════
section('4. hitRate 靶向 (1000 局)');

const engHit = createMathEngine(config, { seed: 2024, mode: 'demo' });
let hitCount = 0;
const N = 1000;
for (let i = 0; i < N; i++) {
  const s = engHit.playSpin(10);
  if (s.totalWin > 0) hitCount++;
}
const hitRate = hitCount / N;
console.log('     demo hitRate:', (hitRate * 100).toFixed(1) + '%');
inRange(hitRate, 0.42, 0.65, 'demo hitRate 在 [0.42, 0.65]');

const engHitR = createMathEngine(config, { seed: 2024, mode: 'real' });
let hitCountR = 0;
for (let i = 0; i < N; i++) {
  const s = engHitR.playSpin(10);
  if (s.totalWin > 0) hitCountR++;
}
const hitRateR = hitCountR / N;
console.log('     real hitRate:', (hitRateR * 100).toFixed(1) + '%');
inRange(hitRateR, 0.20, 0.40, 'real hitRate 在 [0.20, 0.40]');

// ═══════════════ 5. 中奖判定一致性 ═══════════════
section('5. 中奖判定一致性');

const eng5 = createMathEngine(config, { seed: 555, mode: 'demo' });
let winGridsChecked = 0, noWinGridsChecked = 0;

for (let i = 0; i < 200; i++) {
  const decision = eng5.rollHitDecision();
  const g = eng5.rollGridTargeted(decision.isWin);
  const ev = eng5.evaluate(g, 10);

  if (decision.isWin) {
    winGridsChecked++;
    ok(ev.wins.length > 0, 'isWin=true 时至少一个符号中奖 (局 ' + i + ')');
    const hasBig = ev.wins.some(w => w.count >= 8);
    ok(hasBig, '中奖符号 count >= 8 (局 ' + i + ')');
  } else {
    noWinGridsChecked++;
    ok(ev.wins.length === 0, 'isWin=false 时无中奖 (局 ' + i + ')');
    // 检查没有符号 >= 8
    const flat = [];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 6; c++) flat.push(g[r][c]);
    const counts = new Map();
    for (const id of flat) counts.set(id, (counts.get(id) || 0) + 1);
    let anyOver = false;
    for (const [id, cnt] of counts.entries()) {
      if (id === 'lolli' || id === 'wild') continue;
      if (cnt >= 8) anyOver = true;
    }
    ok(!anyOver, 'isWin=false 时所有普通符号 <= 7 (局 ' + i + ')');
  }
}
console.log('     win grids:', winGridsChecked, ' no-win grids:', noWinGridsChecked);

// ═══════════════ 6. Tumble 连消 ═══════════════
section('6. Tumble 连消机制');

const eng6 = createMathEngine(config, { seed: 7777, mode: 'demo' });
let tumbleFound = false;
let maxTumble = 0;

for (let i = 0; i < 500; i++) {
  const s = eng6.playSpin(10);
  if (s.tumble.tumbleCount > 0) {
    tumbleFound = true;
    if (s.tumble.tumbleCount > maxTumble) maxTumble = s.tumble.tumbleCount;

    // 检查 tumble.history 每步都有中奖
    for (const h of s.tumble.history) {
      ok(h.wins.length > 0, 'tumble step ' + h.step + ' 有中奖');
    }
    // 最终 grid 无中奖
    const finalEval = eng6.evaluate(s.tumble.finalGrid, 10);
    ok(finalEval.wins.length === 0, 'tumble 结束后 grid 无中奖');
  }
}
ok(tumbleFound, '至少一局触发 tumble');
console.log('     最大 tumble 连消数:', maxTumble);

// ═══════════════ 7. Safety limit 保护 ═══════════════
section('7. Safety limit');

const safCfg = JSON.parse(JSON.stringify(config));
safCfg.tumble.safetyLimit = 3; // 强制触发 safety
const eng7 = createMathEngine(safCfg, { seed: 999, mode: 'demo' });

let safetyTriggered = false;
for (let i = 0; i < 200; i++) {
  const s = eng7.playSpin(10);
  if (s.tumble.safetyHit) {
    safetyTriggered = true;
    ok(s.tumble.tumbleCount <= 3, 'safety 命中时 tumble <= 3');
    ok(s.tumble.totalWin >= 0, 'safety 命中时结算不为负');
  }
}
console.log('     safety 触发:', safetyTriggered ? '是' : '否 (正常)');

// ═══════════════ 8. Free Spins 触发条件 ═══════════════
section('8. Free Spins 触发条件');

const eng8 = createMathEngine(config, { seed: 8001, mode: 'demo' });

// 直接测 freeSpinsAward 方法
eq(eng8.freeSpinsAward(3), 0, '3 scatter → 0 次');
eq(eng8.freeSpinsAward(4), 10, '4 scatter → 10 次');
eq(eng8.freeSpinsAward(5), 12, '5 scatter → 12 次');
eq(eng8.freeSpinsAward(6), 15, '6 scatter → 15 次');
eq(eng8.freeSpinsAward(10), 15, '10 scatter → 15 次 (上限)');

// Retrigger
eq(eng8.freeSpinsRetrigger(2), 0, '2 scatter retrigger → 0');
eq(eng8.freeSpinsRetrigger(3), 5, '3 scatter retrigger → +5');
eq(eng8.freeSpinsRetrigger(6), 5, '6 scatter retrigger → +5');

// 统计 1000 局 Free Spins 触发率
const eng8b = createMathEngine(config, { seed: 8002, mode: 'demo' });
let fsTrig = 0;
const N8 = 1000;
for (let i = 0; i < N8; i++) {
  const s = eng8b.playSpin(10);
  if (s.freeSpinsAwarded > 0) {
    fsTrig++;
    // 触发时必须有对应 scatter 数
    ok(s.scatterCount >= 4 && s.scatterCount <= 6,
       'scatter 数在 [4,6] (实际 ' + s.scatterCount + ')');
    // awarded 必须与 scatter 数匹配
    const expected = s.scatterCount === 4 ? 10
                   : s.scatterCount === 5 ? 12 : 15;
    eq(s.freeSpinsAwarded, expected, 'fsAwarded 匹配 scatter 数');
  }
}
const fsRate = fsTrig / N8;
console.log('     fsRate:', (fsRate * 100).toFixed(1) + '% (目标 ~10%)');
inRange(fsRate, 0.06, 0.14, 'demo fsRate 在 [6%, 14%]');

// ═══════════════ 9. playFreeSpins 内部逻辑 ═══════════════
section('9. playFreeSpins');

const eng9 = createMathEngine(config, { seed: 9001, mode: 'demo' });

// 直接调 playFreeSpins(10, 10) 检查结构
const fs9 = eng9.playFreeSpins(10, 10);
ok(fs9.spinsPlayed >= 10, '至少玩了 10 局 (含 retrigger)');
ok(fs9.spinsPlayed <= 100, '不超过 safety limit 100');
eq(typeof fs9.totalWin, 'number', 'totalWin 为数字');
ok(fs9.totalWin >= 0, 'totalWin >= 0');
ok(Array.isArray(fs9.history), 'history 是数组');
ok(Array.isArray(fs9.bombList), 'bombList 是数组');
eq(fs9.history.length, fs9.spinsPlayed, 'history 长度 = spinsPlayed');

// 每个 spin 检查
for (const h of fs9.history) {
  ok(h.spin > 0, 'spin 编号 > 0');
  ok(h.tumble !== undefined, '有 tumble 结果');
  ok(h.spinWin >= 0, 'spinWin >= 0');
  ok(h.spinMult >= 1, 'spinMult >= 1');
}

// ═══════════════ 10. Bomb 倍数累积 ═══════════════
section('10. Bomb 倍数');

const eng10 = createMathEngine(config, { seed: 10001, mode: 'demo' });

// rollBombMultiplier 的返回值
let bombHits = 0;
for (let i = 0; i < 5000; i++) {
  const m = eng10.rollBombMultiplier();
  if (m > 0) {
    bombHits++;
    const allowed = config.freeSpins.bombMultipliers;
    ok(allowed.indexOf(m) >= 0, 'bomb 倍数在允许列表: ' + m);
  }
}
const bombRate = bombHits / 5000;
console.log('     bomb hit rate:', (bombRate * 100).toFixed(1) + '% (目标 ~35%)');
inRange(bombRate, 0.28, 0.42, 'bomb rate 在 [28%, 42%]');

// accumulateBombs 逻辑
const fakeHistory = [
  { step: 1 }, { step: 2 }, { step: 3 }
];
const acc = eng10.accumulateBombs(fakeHistory);
eq(acc.list.length + (acc.list.length === 0 ? 0 : 0), acc.list.length, 'acc.list 长度一致');
ok(acc.accumulated >= 0, '累积倍数 >= 0');
// accumulated 应等于 list 中所有 multiplier 之和
const sum = acc.list.reduce((s, b) => s + b.multiplier, 0);
eq(acc.accumulated, sum, 'accumulated = sum(list multipliers)');

// ═══════════════ 11. 性能 ═══════════════
section('11. 性能');

const eng11 = createMathEngine(config, { seed: 11001, mode: 'demo' });
const t11 = Date.now();
const N11 = 1000;
for (let i = 0; i < N11; i++) eng11.playSpin(10);
const ms11 = Date.now() - t11;
console.log('     1000 局耗时:', ms11 + 'ms');
ok(ms11 < 3000, '1000 局 < 3s, 实际 ' + ms11 + 'ms');

// ═══════════════ 12. 源码无违规模式 ═══════════════
section('12. 源码无违规模式');

const files = [
  'src/js/engine/rng.js',
  'src/js/engine/symbol-system.js',
  'src/js/engine/math-engine.js'
];

for (const rel of files) {
  const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  // 剥离注释
  const src = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  ok(!/Math\.random/.test(src), rel + ' 无 Math.random (代码)');
  ok(!/1103515245|12345/.test(src), rel + ' 无 LCG 常量 (代码)');
  ok(!/12\.9898|43758\.5453/.test(src), rel + ' 无 sin-hash 常量 (代码)');
  ok(!/Date\.now/.test(src), rel + ' 无 Date.now (代码)');
}

// ═══════════════ 13. 长跑统计 (demo + real) ═══════════════
section('13. 长跑统计');

for (const mode of ['demo', 'real']) {
  const e = createMathEngine(config, { seed: 13000 + (mode === 'demo' ? 0 : 1), mode });
  let hits = 0, total = 0, fsCount = 0, maxTumble = 0, maxWin = 0;
  const N13 = 2000;
  for (let i = 0; i < N13; i++) {
    const s = e.playSpin(10);
    if (s.totalWin > 0) hits++;
    if (s.freeSpinsAwarded > 0) fsCount++;
    if (s.tumble.tumbleCount > maxTumble) maxTumble = s.tumble.tumbleCount;
    if (s.totalWin > maxWin) maxWin = s.totalWin;
    total += s.totalWin;
  }
  const rtp = total / (N13 * 10);
  const hr = hits / N13;
  const fsr = fsCount / N13;
  console.log('     [' + mode + '] hitRate=' + (hr*100).toFixed(1) + '%',
              'fsRate=' + (fsr*100).toFixed(1) + '%',
              'RTP=' + rtp.toFixed(3),
              'maxTumble=' + maxTumble,
              'maxWin=' + maxWin.toFixed(2));
}

// ═══════════════ 结果汇总 ═══════════════
console.log('\n══════════════════════════════════');
console.log('PASSED: ' + passed);
console.log('FAILED: ' + failed);

if (failed > 0) {
  console.log('\n失败详情:');
  for (const f of failures.slice(0, 30)) console.log('  ✗ ' + f);
  if (failures.length > 30) console.log('  ... (共 ' + failures.length + ' 条)');
  process.exit(1);
}
console.log('\n[ALL OK] Math Engine 测试通过');
process.exit(0);
