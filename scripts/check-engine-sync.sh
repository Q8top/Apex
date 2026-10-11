#!/usr/bin/env bash
# S2.3: 客户端/服务端引擎一致性（同 seed + 同输入 → totalMultiplier 一致）
# 注意：客户端 game-engine.js 生产拒绝 real/gridOverride；Node 环境放行。
set -euo pipefail
cd "$(dirname "$0")/.."

node - <<'NODEEOF'
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}

function loadEngine(prefix, useConfig) {
  var cacheBefore = Object.keys(require.cache);
  globalThis.window = {};
  ['version','math-profile','symbols.locked','paytable.locked']
    .forEach(function(f){ require(require('path').resolve(useConfig + '/' + f + '.js')); });
  ['errors','grid','rng','multiplier','evaluator','tumble','bonus','payout','game-engine']
    .forEach(function(f){ require(require('path').resolve(prefix + '/' + f + '.js')); });
  // 用 SeededRng 保证前后端在同 seed 下产生相同序列
  var SRng = require(require('path').resolve('tests/math/seeded-rng.cjs')).SeededRng;
  return {
    GE: globalThis.window.ApexEngineGameEngine.GameEngine,
    Rng: SRng,
    MP: globalThis.window.ApexMathProfile
  };
}

// 客户端：src/engine + src/config（math-profile 只 demo）
var client = loadEngine('src/engine', 'src/config');
// 服务端：functions/_engine + functions/_config（含 real）
var server = loadEngine('functions/_engine', 'functions/_config');

// 同 seed + 同输入（demo 模式避开 real 分歧；gridOverride 在 Node 环境被放行）
var weights = client.MP.buildRngWeights('demo');
var SEED = 'sync-test-v1';
var grid = new Array(30).fill('banana');
grid[0] = 'lollipop'; grid[1] = 'lollipop'; grid[2] = 'lollipop'; grid[3] = 'lollipop';

var cEng = new client.GE({ rng: new client.Rng(SEED, weights), profile: client.MP.getProfile('demo') });
var sEng = new server.GE({ rng: new server.Rng(SEED, weights), profile: server.MP.getProfile('demo') });

var cr = cEng.spin({ mode: 'demo', betMinor: 100, spinId: 'sync-test-0001', gridOverride: grid });
var sr = sEng.spin({ mode: 'demo', betMinor: 100, spinId: 'sync-test-0001', gridOverride: grid });

console.log('[ENGINE-SYNC] client mult=' + cr.totalMultiplier + '  server mult=' + sr.totalMultiplier);
console.log('[ENGINE-SYNC] client win=' + cr.totalWinMinor + '  server win=' + sr.totalWinMinor);
if (cr.totalMultiplier !== sr.totalMultiplier) {
  console.error('[FATAL] totalMultiplier 不一致');
  process.exit(1);
}
if (cr.totalWinMinor !== sr.totalWinMinor) {
  console.error('[FATAL] totalWinMinor 不一致');
  process.exit(1);
}
console.log('[OK] 前后端引擎一致');
NODEEOF
