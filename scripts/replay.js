#!/usr/bin/env node
// Apex · Replay CLI
// 用途: 记录 / 重放 / 验证 spin
// 用法:
//   node scripts/replay.js --spin <spinId> --file <path>
//   node scripts/replay.js --file <path> --verify-all
//   node scripts/replay.js --file <path> --list
//   node scripts/replay.js --generate --seed=1 --mode=demo --count=100 --out=<path>

import {
  deserializeSpin,
  ReplayRecorder,
  ReplayVerifier,
  generateRecords
} from '../src/js/engine/replay.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── CLI 参数 ──
function parseArgs(argv) {
  const out = {
    spin: null,
    file: null,
    verifyAll: false,
    list: false,
    generate: false,
    seed: 1,
    mode: 'demo',
    bet: 1,
    count: 10,
    out: null,
    roundId: 'r0'
  };
  for (const a of argv) {
    if (a.startsWith('--spin=')) out.spin = a.slice(7);
    else if (a === '--spin') out.spin = '(next-arg)';
    else if (a.startsWith('--file=')) out.file = a.slice(7);
    else if (a === '--file') out.file = '(next-arg)';
    else if (a === '--verify-all') out.verifyAll = true;
    else if (a === '--list') out.list = true;
    else if (a === '--generate') out.generate = true;
    else if (a.startsWith('--seed=')) out.seed = parseInt(a.slice(7), 10);
    else if (a.startsWith('--mode=')) out.mode = a.slice(7);
    else if (a.startsWith('--bet=')) out.bet = parseFloat(a.slice(6));
    else if (a.startsWith('--count=')) out.count = parseInt(a.slice(8), 10);
    else if (a.startsWith('--out=')) out.out = a.slice(6);
    else if (a.startsWith('--round=')) out.roundId = a.slice(8);
  }
  // 支持 --spin <value> 形式
  const spinIdx = argv.indexOf('--spin');
  if (spinIdx >= 0 && argv[spinIdx + 1] && !argv[spinIdx + 1].startsWith('--')) {
    out.spin = argv[spinIdx + 1];
  }
  const fileIdx = argv.indexOf('--file');
  if (fileIdx >= 0 && argv[fileIdx + 1] && !argv[fileIdx + 1].startsWith('--')) {
    out.file = argv[fileIdx + 1];
  }
  return out;
}

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/game.json'), 'utf8'));
const args = parseArgs(process.argv.slice(2));

function usage() {
  console.log('用法:');
  console.log('  node scripts/replay.js --generate --seed=1 --mode=demo --count=100 --out=replays/r1.jsonl');
  console.log('  node scripts/replay.js --file=replays/r1.jsonl --list');
  console.log('  node scripts/replay.js --file=replays/r1.jsonl --spin=r1-1-5');
  console.log('  node scripts/replay.js --file=replays/r1.jsonl --verify-all');
  process.exit(0);
}

if (process.argv.length <= 2) usage();

// ── 子命令: generate ──
async function cmdGenerate() {
  if (!args.out) {
    console.error('[FATAL] --generate 需要 --out=<path>');
    process.exit(2);
  }
  const outPath = path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out);
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const records = generateRecords(config, {
    seed: args.seed,
    mode: args.mode,
    bet: args.bet,
    roundId: args.roundId,
    count: args.count
  });

  const lines = records.map(function (r) { return JSON.stringify(r); }).join('\n') + '\n';
  fs.writeFileSync(outPath, lines, 'utf8');

  console.log('[OK] generated ' + records.length + ' records');
  console.log('     path:         ' + outPath);
  console.log('     seed:         ' + args.seed);
  console.log('     mode:         ' + args.mode);
  console.log('     bet:          ' + args.bet);
  console.log('     first spinId: ' + records[0].spinId);
  console.log('     last spinId:  ' + records[records.length - 1].spinId);
  console.log('     size:         ' + (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB');
}

// ── 子命令: list ──
function cmdList() {
  if (!args.file) {
    console.error('[FATAL] --list 需要 --file=<path>');
    process.exit(2);
  }
  const filePath = path.isAbsolute(args.file) ? args.file : path.join(ROOT, args.file);
  if (!fs.existsSync(filePath)) {
    console.error('[FATAL] 文件不存在: ' + filePath);
    process.exit(2);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const records = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    records.push(deserializeSpin(line));
  }

  console.log('=== File: ' + args.file + ' ===');
  console.log('Total: ' + records.length);
  console.log('');
  console.log('spinId'.padEnd(22) + ' mode'.padEnd(7) + ' seq'.padStart(5) + ' bet'.padStart(7) + '  totalWin');
  console.log('─'.repeat(60));

  const show = Math.min(records.length, 50);
  for (let i = 0; i < show; i++) {
    const r = records[i];
    const tw = (r.result && r.result.totalWin) || 0;
    console.log(
      String(r.spinId).padEnd(22) +
      ' ' + String(r.gameMode).padEnd(6) +
      ' ' + String(r.seq).padStart(4) +
      ' ' + String(r.bet).padStart(6) +
      '  ' + tw.toFixed(2)
    );
  }
  if (records.length > 50) {
    console.log('... (' + (records.length - 50) + ' more)');
  }
}

// ── 子命令: spin (验证单条) ──
function cmdSpin() {
  if (!args.file || !args.spin) {
    console.error('[FATAL] --spin 需要 --file 和 --spin=<spinId>');
    process.exit(2);
  }
  const filePath = path.isAbsolute(args.file) ? args.file : path.join(ROOT, args.file);
  if (!fs.existsSync(filePath)) {
    console.error('[FATAL] 文件不存在: ' + filePath);
    process.exit(2);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let target = null;
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const rec = deserializeSpin(line);
    if (rec.spinId === args.spin) {
      target = rec;
      break;
    }
  }

  if (!target) {
    console.error('[FATAL] spinId 未找到: ' + args.spin);
    process.exit(2);
  }

  console.log('=== Verify spin: ' + target.spinId + ' ===');
  console.log('  mode:    ' + target.gameMode);
  console.log('  seed:    ' + target.seed);
  console.log('  seq:     ' + target.seq);
  console.log('  bet:     ' + target.bet);
  console.log('  totalWin: ' + (target.result && target.result.totalWin || 0).toFixed(4));
  console.log('');

  const verifier = new ReplayVerifier(config);
  const t0 = Date.now();
  const res = verifier.verify(target);
  const ms = Date.now() - t0;

  if (res.ok) {
    console.log('[PASS] replay matches original  (' + ms + 'ms)');
    process.exit(0);
  } else {
    console.log('[FAIL] ' + res.reason);
    if (res.diff) {
      console.log('  diff path: ' + res.diff.path);
      console.log('  expected:  ' + JSON.stringify(res.diff.a));
      console.log('  actual:    ' + JSON.stringify(res.diff.b));
    }
    process.exit(1);
  }
}

// ── 子命令: verify-all ──
function cmdVerifyAll() {
  if (!args.file) {
    console.error('[FATAL] --verify-all 需要 --file=<path>');
    process.exit(2);
  }
  const filePath = path.isAbsolute(args.file) ? args.file : path.join(ROOT, args.file);
  if (!fs.existsSync(filePath)) {
    console.error('[FATAL] 文件不存在: ' + filePath);
    process.exit(2);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const records = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    records.push(deserializeSpin(line));
  }

  console.log('=== Verify all: ' + args.file + ' ===');
  console.log('Total records: ' + records.length);
  console.log('');

  const verifier = new ReplayVerifier(config);
  const t0 = Date.now();
  const result = verifier.verifyAll(records);
  const ms = Date.now() - t0;

  console.log('Result:');
  console.log('  total:  ' + result.total);
  console.log('  passed: ' + result.passed);
  console.log('  failed: ' + result.failed);
  console.log('  time:   ' + ms + 'ms');
  console.log('');

  if (result.failed > 0) {
    console.log('Failures (first 10):');
    for (const f of result.failures.slice(0, 10)) {
      console.log('  X ' + f.spinId + ' : ' + f.reason);
      if (f.diff) {
        console.log('    path: ' + f.diff.path);
        console.log('    expected: ' + JSON.stringify(f.diff.a));
        console.log('    actual:   ' + JSON.stringify(f.diff.b));
      }
    }
    if (result.failures.length > 10) {
      console.log('  ... (' + (result.failures.length - 10) + ' more)');
    }
    process.exit(1);
  }

  console.log('[ALL OK] all records replayed and matched');
  process.exit(0);
}

// ── main 分发 ──
async function main() {
  if (args.generate) {
    await cmdGenerate();
    return;
  }
  if (args.list) {
    cmdList();
    return;
  }
  if (args.verifyAll) {
    cmdVerifyAll();
    return;
  }
  if (args.spin) {
    cmdSpin();
    return;
  }
  usage();
}

main().catch(function (e) {
  console.error('[FATAL] ' + e.message);
  console.error(e.stack);
  process.exit(2);
});
