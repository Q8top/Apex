#!/usr/bin/env node
// Apex UI - Engine Adapter 测试
// run: node tests/ui/engine-adapter.test.js

import {
  EngineAdapter,
  createEngineAdapter,
  computeTier,
  buildViewModel
} from '../../src/js/ui/engine-adapter.js';
import { createMathEngine } from '../../src/js/engine/math-engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

let passed = 0, failed = 0;
const failures = [];

function eq(a, b, label) {
  if (a === b) { passed++; return; }
  failed++; failures.push(label + ': expect ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
}

function ok(cond, label) {
  if (cond) { passed++; return; }
  failed++; failures.push(label);
}

function eqDeep(a, b, label) {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa === sb) { passed++; return; }
  failed++; failures.push(label + ': expect ' + sb + ', got ' + sa);
}

function section(title) {
  console.log('\n--- ' + title + ' ---');
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));

// === 1. computeTier ===
section('1. computeTier');

const T = config.bigWinThresholds; // { big:10, mega:30, super:60, epic:150 }

eq(computeTier(0, T), 'none', 'ratio=0');
eq(computeTier(-1, T), 'none', 'ratio<0');
eq(computeTier(0.01, T), 'small', 'ratio=0.01');
eq(computeTier(5, T), 'small', 'ratio=5');
eq(computeTier(9.99, T), 'small', 'ratio<10');
eq(computeTier(10, T), 'nice', 'ratio=10 边界');
eq(computeTier(29.99, T), 'nice', 'ratio<30');
eq(computeTier(30, T), 'big', 'ratio=30 边界');
eq(computeTier(59.99, T), 'big', 'ratio<60');
eq(computeTier(60, T), 'mega', 'ratio=60 边界');
eq(computeTier(149.99, T), 'mega', 'ratio<150');
eq(computeTier(150, T), 'epic', 'ratio=150 边界');
eq(computeTier(10000, T), 'epic', 'ratio very large');

// null thresholds -> 用默认值
eq(computeTier(5, null), 'small', 'null thresholds fallback');

// === 2. buildViewModel ===
section('2. buildViewModel');

const engine = createMathEngine(config, { seed: 1234, mode: 'demo' });
const raw = engine.playSpin(10);
const view = buildViewModel(raw, config);

// grid
ok(Array.isArray(view.grid), 'view.grid is array');
eq(view.grid.length, 5, 'grid 5 rows');
eq(view.grid[0].length, 6, 'grid 6 cols');
ok(Array.isArray(view.finalGrid), 'view.finalGrid is array');

// 数值
eq(view.totalWin, raw.totalWin, 'totalWin matches');
eq(view.bet, raw.bet, 'bet matches');
eq(view.mode, raw.mode, 'mode matches');
eq(view.scatterCount, raw.scatterCount, 'scatterCount matches');
eq(view.freeSpinsAwarded, raw.freeSpinsAwarded, 'freeSpinsAwarded matches');

// tier 一致性
const expectedTier = computeTier(raw.winRatio, T);
eq(view.tier, expectedTier, 'tier consistent');

// tumble
eq(view.tumbleCount, raw.tumble.tumbleCount, 'tumbleCount matches');
eq(view.tumbleSteps.length, raw.tumble.history.length, 'tumbleSteps length matches');
eq(view.safetyHit, raw.tumble.safetyHit, 'safetyHit matches');

// winIds 是从 tumbleSteps 去重的
const allWinIds = new Set();
for (const h of raw.tumble.history) {
  for (const id of h.winIds) allWinIds.add(id);
}
eq(view.winIds.length, allWinIds.size, 'winIds unique count matches');

// 深拷贝验证: 修改 view 不影响 raw
view.grid[0][0] = 'MUTATED';
ok(raw.initialGrid[0][0] !== 'MUTATED', 'view.grid is a deep copy');

// === 3. buildViewModel 边界 ===
section('3. buildViewModel boundaries');

let threw = false;
try { buildViewModel(null, config); } catch (e) { threw = true; }
ok(threw, 'null gameResult throws');

// 最小 gameResult
const minimal = buildViewModel({
  mode: 'demo', bet: 1, totalWin: 0, winRatio: 0,
  initialGrid: [], scatterCount: 0, freeSpinsAwarded: 0,
  tumble: { totalWin: 0, tumbleCount: 0, history: [], finalGrid: [], safetyHit: false },
  freeSpins: null, baseWin: 0, freeSpinsWin: 0
}, config);

eq(minimal.tier, 'none', 'minimal tier none');
eq(minimal.tumbleSteps.length, 0, 'minimal tumbleSteps empty');
eq(minimal.freeSpins, null, 'minimal freeSpins null');

// === 4. EngineAdapter 构造 ===
section('4. EngineAdapter constructor');

const adapter = new EngineAdapter(config, { seed: 1234, mode: 'demo' });
eq(adapter.getMode(), 'demo', 'mode = demo');
eq(adapter.getSeed(), 1234, 'seed = 1234');

const adapterReal = new EngineAdapter(config, { seed: 5678, mode: 'real' });
eq(adapterReal.getMode(), 'real', 'mode = real');

// 默认 mode
const adapterDefault = new EngineAdapter(config, { seed: 1 });
eq(adapterDefault.getMode(), 'demo', 'default mode = demo');

// 不传 seed -> Date.now
const adapterNoSeed = new EngineAdapter(config, { mode: 'demo' });
ok(typeof adapterNoSeed.getSeed() === 'number', 'auto seed is number');

// getConfig 返回同一对象引用
ok(adapter.getConfig() === config, 'getConfig same reference');

// 边界
threw = false;
try { new EngineAdapter(null, {}); } catch (e) { threw = true; }
ok(threw, 'null config throws');

threw = false;
try { new EngineAdapter({}, {}); } catch (e) { threw = true; }
ok(threw, 'config without game throws');

threw = false;
try { new EngineAdapter(config, { mode: 'invalid' }); } catch (e) { threw = true; }
ok(threw, 'invalid mode throws');

// === 5. playSpin ===
section('5. playSpin');

const a1 = new EngineAdapter(config, { seed: 7777, mode: 'demo' });
const r1 = a1.playSpin(10);
ok(r1.raw != null, 'raw present');
ok(r1.view != null, 'view present');
ok(typeof r1.view.totalWin === 'number', 'view.totalWin is number');
ok(r1.raw.totalWin === r1.view.totalWin, 'raw/view totalWin match');

// bet 边界
threw = false;
try { a1.playSpin(0); } catch (e) { threw = true; }
ok(threw, 'bet=0 throws');

threw = false;
try { a1.playSpin(-1); } catch (e) { threw = true; }
ok(threw, 'bet<0 throws');

threw = false;
try { a1.playSpin('10'); } catch (e) { threw = true; }
ok(threw, 'bet as string throws');

// === 6. setMode ===
section('6. setMode');

const a2 = new EngineAdapter(config, { seed: 42, mode: 'demo' });
const beforeMode = a2.getMode();
a2.setMode('real');
eq(a2.getMode(), 'real', 'setMode real');
ok(beforeMode === 'demo', 'before was demo');
// 同 mode 调用不应改变 seed
const seedBefore = a2.getSeed();
a2.setMode('real');
eq(a2.getSeed(), seedBefore, 'setMode same mode keeps seed');

threw = false;
try { a2.setMode('bad'); } catch (e) { threw = true; }
ok(threw, 'setMode invalid throws');

// === 7. reseed ===
section('7. reseed');

const a3 = new EngineAdapter(config, { seed: 1111, mode: 'demo' });
a3.reseed(2222);
eq(a3.getSeed(), 2222, 'reseed changes seed');

const a4 = new EngineAdapter(config, { seed: 2222, mode: 'demo' });
const rA = a3.playSpin(10);
const rB = a4.playSpin(10);
eq(rA.view.totalWin, rB.view.totalWin, 'reseed -> same as new with that seed');

threw = false;
try { a3.reseed(null); } catch (e) { threw = true; }
ok(threw, 'reseed null throws');

// === 8. Engine vs Adapter 一致性 ===
section('8. Engine vs Adapter consistency');

const engine2 = createMathEngine(config, { seed: 3333, mode: 'demo' });
const adapter2 = new EngineAdapter(config, { seed: 3333, mode: 'demo' });

let mismatches = 0;
const N = 500;
for (let i = 0; i < N; i++) {
  const eRes = engine2.playSpin(10);
  const aRes = adapter2.playSpin(10);
  if (eRes.totalWin !== aRes.view.totalWin) mismatches++;
  if (eRes.tumble.tumbleCount !== aRes.view.tumbleCount) mismatches++;
  if (eRes.scatterCount !== aRes.view.scatterCount) mismatches++;
}

eq(mismatches, 0, 'Engine vs Adapter: 500 spins * 3 fields all match');

// === 9. createEngineAdapter 工厂 ===
section('9. createEngineAdapter factory');

const fac = createEngineAdapter(config, { seed: 8888, mode: 'real' });
ok(fac instanceof EngineAdapter, 'factory returns EngineAdapter instance');
eq(fac.getMode(), 'real', 'factory mode real');
eq(fac.getSeed(), 8888, 'factory seed');

// === 汇总 ===
console.log('\n==================');
console.log('PASSED: ' + passed);
console.log('FAILED: ' + failed);

if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  X ' + f);
  process.exit(1);
}
console.log('\n[ALL OK] Engine Adapter tests passed');
process.exit(0);
