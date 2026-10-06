#!/usr/bin/env node
// Apex Engine - Replay System test
// run: node tests/math/replay.test.js

import {
  computeSpinId,
  deepEqual,
  findFirstDiff,
  serializeSpin,
  deserializeSpin,
  ReplayRecorder,
  ReplayVerifier,
  generateRecords
} from '../../src/js/engine/replay.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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

function section(title) {
  console.log('\n--- ' + title + ' ---');
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));

// === 1. computeSpinId ===
section('1. computeSpinId');

eq(computeSpinId('r42', 12345, 0), 'r42-12345-0', 'basic format');
eq(computeSpinId('r1', 'abc', 99), 'r1-abc-99', 'string seed');
eq(computeSpinId('round-x', 9999999999, 123456789), 'round-x-9999999999-123456789', 'large numbers');

let threw = false;
try { computeSpinId(null, 1, 0); } catch (e) { threw = true; }
ok(threw, 'null roundId throws');

threw = false;
try { computeSpinId('r', 1, -1); } catch (e) { threw = true; }
ok(threw, 'negative seq throws');

threw = false;
try { computeSpinId('r', 1, 1.5); } catch (e) { threw = true; }
ok(threw, 'non-integer seq throws');

const id1 = computeSpinId('rA', 42, 7);
const id2 = computeSpinId('rA', 42, 7);
eq(id1, id2, 'deterministic');

// === 2. deepEqual ===
section('2. deepEqual');

ok(deepEqual(1, 1), 'primitive equal');
ok(!deepEqual(1, 2), 'primitive not equal');
ok(deepEqual(null, null), 'null equal');
ok(!deepEqual(null, undefined), 'null vs undefined');
ok(deepEqual([1, 2, 3], [1, 2, 3]), 'array equal');
ok(!deepEqual([1, 2, 3], [1, 2]), 'array length diff');
ok(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), 'key order irrelevant');
ok(!deepEqual({ a: 1 }, { a: 1, b: 2 }), 'extra key diff');
ok(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }), 'nested equal');
ok(!deepEqual({ a: [1, { b: 3 }] }, { a: [1, { b: 2 }] }), 'nested diff');

// === 3. findFirstDiff ===
section('3. findFirstDiff');

eq(findFirstDiff({ a: 1 }, { a: 1 }), null, 'no diff -> null');

const d1 = findFirstDiff({ a: 1, b: 2 }, { a: 1, b: 3 });
ok(d1 && d1.path === 'b' && d1.a === 2 && d1.b === 3, 'first diff b');

const d2 = findFirstDiff([1, 2, 3], [1, 9, 3]);
ok(d2 && d2.path === '[1]' && d2.a === 2 && d2.b === 9, 'array diff');

const d3 = findFirstDiff({ x: { y: 'a' } }, { x: { y: 'b' } });
ok(d3 && d3.path === 'x.y', 'nested path');

const d4 = findFirstDiff({ a: 1 }, { a: 1, b: 2 });
ok(d4 && d4.path === 'b', 'extra key');

const d5 = findFirstDiff([1, 2], [1, 2, 3]);
ok(d5 && d5.path === '.length', 'array length diff');

// === 4. serializeSpin ===
section('4. serializeSpin');

const fakeResult = {
  mode: 'demo',
  bet: 10,
  totalWin: 25.5,
  initialGrid: [['a', 'b'], ['c', 'd']],
  tumble: { totalWin: 25.5, tumbleCount: 2 },
  configVersion: '1.0.0',
  mathVersion: '1.0.0'
};

const rec = serializeSpin(fakeResult, {
  seed: 12345,
  mode: 'demo',
  bet: 10,
  seq: 7,
  roundId: 'r42'
});

eq(rec.spinId, 'r42-12345-7', 'spinId');
eq(rec.roundId, 'r42', 'roundId');
eq(rec.seq, 7, 'seq');
eq(rec.seed, 12345, 'seed');
eq(rec.gameMode, 'demo', 'gameMode');
eq(rec.bet, 10, 'bet');
eq(rec.authority, 'client', 'authority default');
eq(rec.configVersion, '1.0.0', 'configVersion');
eq(rec.mathVersion, '1.0.0', 'mathVersion');
ok(rec.timestamp && rec.timestamp.length > 0, 'timestamp auto');
ok(deepEqual(rec.result, fakeResult), 'result preserved');

threw = false;
try { serializeSpin(null, {}); } catch (e) { threw = true; }
ok(threw, 'null spinResult throws');

threw = false;
try { serializeSpin(fakeResult, {}); } catch (e) { threw = true; }
ok(threw, 'missing meta fields throws');

threw = false;
try { serializeSpin(fakeResult, { seed: 1, mode: 'demo', bet: 10, seq: -1, roundId: 'r' }); } catch (e) { threw = true; }
ok(threw, 'negative seq throws');

threw = false;
try { serializeSpin(fakeResult, { seed: 1, mode: 'demo', bet: 0, seq: 0, roundId: 'r' }); } catch (e) { threw = true; }
ok(threw, 'zero bet throws');

// === 5. deserializeSpin round-trip ===
section('5. deserializeSpin round-trip');

const line = JSON.stringify(rec);
const parsed = deserializeSpin(line);
eq(parsed.spinId, rec.spinId, 'round-trip spinId');
eq(parsed.seed, rec.seed, 'round-trip seed');
eq(parsed.seq, rec.seq, 'round-trip seq');
eq(parsed.bet, rec.bet, 'round-trip bet');
ok(deepEqual(parsed.result, rec.result), 'round-trip result deep equal');

threw = false;
try { deserializeSpin(''); } catch (e) { threw = true; }
ok(threw, 'empty line throws');

threw = false;
try { deserializeSpin('{invalid json'); } catch (e) { threw = true; }
ok(threw, 'invalid JSON throws');

threw = false;
try { deserializeSpin('{"spinId":"x"}'); } catch (e) { threw = true; }
ok(threw, 'missing fields throws');

// === 6. generateRecords ===
section('6. generateRecords');

const records = generateRecords(config, {
  seed: 777, mode: 'demo', bet: 1, roundId: 'rT', count: 5
});

eq(records.length, 5, 'count = 5');
eq(records[0].spinId, 'rT-777-0', 'first spinId');
eq(records[4].spinId, 'rT-777-4', 'last spinId');
ok(records[0].result.totalWin !== undefined, 'result has totalWin');

// 确定性: 同 seed 同结果
const records2 = generateRecords(config, {
  seed: 777, mode: 'demo', bet: 1, roundId: 'rT', count: 5
});
ok(deepEqual(records[0].result, records2[0].result), 'same seed -> same result[0]');
ok(deepEqual(records[4].result, records2[4].result), 'same seed -> same result[4]');

threw = false;
try { generateRecords(config, { seed: 1, count: 0 }); } catch (e) { threw = true; }
ok(threw, 'count = 0 throws');

// === 7. ReplayVerifier ===
section('7. ReplayVerifier');

const verifier = new ReplayVerifier(config);

// 生成 5 条合法记录
const realRecords = generateRecords(config, {
  seed: 9001, mode: 'demo', bet: 1, roundId: 'rv', count: 5
});

const v1 = verifier.verify(realRecords[0]);
ok(v1.ok, 'verify records[0] PASS');
eq(v1.spinId, 'rv-9001-0', 'spinId matches');

const v3 = verifier.verify(realRecords[3]);
ok(v3.ok, 'verify records[3] PASS (seq=3, 快进 3 次)');

const all = verifier.verifyAll(realRecords);
eq(all.total, 5, 'verifyAll total = 5');
eq(all.passed, 5, 'verifyAll passed = 5');
eq(all.failed, 0, 'verifyAll failed = 0');

// 篡改后应 FAIL
const tampered = JSON.parse(JSON.stringify(realRecords[0]));
tampered.result.totalWin = tampered.result.totalWin + 0.01;
const vBad = verifier.verify(tampered);
ok(!vBad.ok, 'tampered totalWin FAIL');
eq(vBad.reason, 'deepEqual 不一致', 'tampered reason');
ok(vBad.diff && vBad.diff.path && vBad.diff.path.indexOf('totalWin') >= 0,
   'diff path contains totalWin');

// 版本不匹配
const vVer = JSON.parse(JSON.stringify(realRecords[0]));
vVer.configVersion = '99.99.99';
const vBadVer = verifier.verify(vVer);
ok(!vBadVer.ok, 'configVersion mismatch FAIL');
ok(vBadVer.reason.indexOf('configVersion') >= 0, 'reason mentions configVersion');

// 缺字段
const vMissing = { spinId: 'x' };
const vBadMissing = verifier.verify(vMissing);
ok(!vBadMissing.ok, 'missing fields FAIL');
ok(vBadMissing.reason.indexOf('缺少') >= 0, 'reason mentions missing');

// 构造失败场景: 同 seed 但改了 seq 后 result 对不上
const wrongSeq = JSON.parse(JSON.stringify(realRecords[2]));
wrongSeq.seq = 3;  // 实际是 seq=2 的 result
const vWrongSeq = verifier.verify(wrongSeq);
ok(!vWrongSeq.ok, 'wrong seq -> result mismatch FAIL');

// === 8. ReplayRecorder 文件 IO ===
section('8. ReplayRecorder file IO');

const tmpDir = path.join(os.tmpdir(), 'apex-replay-test-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });
const tmpFile = path.join(tmpDir, 'test.jsonl');

// 用 async 包装以便 await recorder.init()
async function testRecorderIO() {
  const recorder = new ReplayRecorder(tmpFile);
  await recorder.init();

  const ioRecords = generateRecords(config, {
    seed: 5555, mode: 'real', bet: 1, roundId: 'io', count: 3
  });

  for (const r of ioRecords) {
    // recordAsync 需要原始 result + meta
    await recorder.recordAsync(r.result, {
      seed: r.seed, mode: r.gameMode, bet: r.bet,
      seq: r.seq, roundId: r.roundId,
      timestamp: r.timestamp
    });
  }

  eq(recorder.count, 3, 'recorder count = 3');
  ok(fs.existsSync(tmpFile), 'file created');

  const loaded = await ReplayRecorder.loadAll(tmpFile);
  eq(loaded.length, 3, 'loaded 3 records');
  eq(loaded[0].spinId, 'io-5555-0', 'loaded[0] spinId');
  eq(loaded[2].spinId, 'io-5555-2', 'loaded[2] spinId');
  ok(deepEqual(loaded[0].result, ioRecords[0].result), 'loaded[0] result deep equal');

  // 验证加载回来的记录能被 verifier 通过
  const vLoaded = verifier.verifyAll(loaded);
  eq(vLoaded.passed, 3, 'loaded records all verify PASS');
  eq(vLoaded.failed, 0, 'loaded records no failures');

  // 清理
  fs.unlinkSync(tmpFile);
  fs.rmdirSync(tmpDir);
}

// === 9. ReplayVerifier 边界 ===
section('9. ReplayVerifier boundaries');

threw = false;
try { new ReplayVerifier(null); } catch (e) { threw = true; }
ok(threw, 'null config throws');

threw = false;
try { new ReplayVerifier({}); } catch (e) { threw = true; }
ok(threw, 'empty config throws');

threw = false;
try { verifier.verifyAll(null); } catch (e) { threw = true; }
ok(threw, 'verifyAll(null) throws');

// === 汇总 ===
async function run() {
  await testRecorderIO();

  console.log('\n==================');
  console.log('PASSED: ' + passed);
  console.log('FAILED: ' + failed);

  if (failed > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  X ' + f);
    process.exit(1);
  }
  console.log('\n[ALL OK] Replay tests passed');
  process.exit(0);
}

run().catch(function (e) {
  console.error('[FATAL]', e);
  process.exit(2);
});
