#!/usr/bin/env node
// APEX 通用 RTP 模拟器
// 用法：MODE=real N=30000 node scripts/apex-rtp-sim.mjs [游戏名...]
//   不传游戏名 → 跑全部 6 款
//   单款示例：MODE=real N=30000 node scripts/apex-rtp-sim.mjs sugar
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SPEC = {
  'lucky-fruit': {
    dir: 'slot', prefix: 'slot', engine: 'SlotEngine',
    spinFn: (E, bet) => { const g = E.spin(); const r = E.evaluate(g, bet); return { totalWin: r.totalWin, scatterCount: 0 }; },
    trigger: 999, fsFn: null
  },
  'olympus': {
    dir: 'olympus', prefix: 'olympus', engine: 'OlympusEngine',
    spinFn: (E, bet) => E.playFullSpin(bet),
    trigger: 4, fsFn: (E, bet) => E.playFreeSpins(bet)
  },
  'sweet': {
    dir: 'sweet', prefix: 'sweet', engine: 'SweetEngine',
    spinFn: (E, bet) => E.playFullSpin(bet, false),
    trigger: 4, fsFn: (E, bet) => E.playFreeSpins(bet)
  },
  'sugar': {
    dir: 'sugar', prefix: 'sugar', engine: 'SugarEngine',
    spinFn: (E, bet) => E.playFullSpin(bet, false),
    trigger: 3, fsFn: (E, bet) => E.playFreeSpins(bet)
  },
  'starlight': {
    dir: 'starlight', prefix: 'starlight', engine: 'StarlightEngine',
    spinFn: (E, bet) => E.playFullSpin(bet),
    trigger: 4, fsFn: (E, bet) => E.playFreeSpins(bet)
  },
  'bigbass': {
    dir: 'bigbass', prefix: 'bigbass', engine: 'BigBassEngine',
    spinFn: (E, bet) => E.playFullSpin(bet),
    trigger: 3, fsFn: (E, bet) => E.playFreeSpins(bet)
  }
};

function loadEngine(gameKey) {
  const spec = SPEC[gameKey];
  const sb = {};
  sb.window = sb; sb.globalThis = sb;
  sb.performance = { now: () => Date.now() };
  sb.crypto = globalThis.crypto;
  sb.document = { getElementById: () => null, createElementNS: () => ({ setAttribute(){}, innerHTML:'' }), body: { appendChild(){} } };
  vm.createContext(sb);
  const cfg = fs.readFileSync(path.join(ROOT, `src/js/${spec.dir}/${spec.prefix}-config.js`), 'utf8');
  const eng = fs.readFileSync(path.join(ROOT, `src/js/${spec.dir}/${spec.prefix}-engine.js`), 'utf8');
  vm.runInContext(cfg, sb, { filename: `${spec.prefix}-config.js` });
  vm.runInContext(eng, sb, { filename: `${spec.prefix}-engine.js` });
  return { E: sb[spec.engine], spec };
}

function runOne(gameKey, mode, N, bet) {
  const { E, spec } = loadEngine(gameKey);
  E.setMode(mode);
  let tb = 0, tw = 0, baseWin = 0, fsWin = 0, hits = 0, maxWin = 0, fsN = 0;
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    tb += bet;
    const r = spec.spinFn(E, bet);
    let win = r.totalWin || 0;
    baseWin += win;
    const sc = r.scatterCount || 0;
    if (sc >= spec.trigger && spec.fsFn) {
      fsN++;
      const fs = spec.fsFn(E, bet);
      fsWin += fs.totalWin || 0;
      win += fs.totalWin || 0;
    }
    tw += win;
    if (win > 0) { hits++; if (win > maxWin) maxWin = win; }
  }
  const ms = Date.now() - t0;
  return { tb, tw, baseWin, fsWin, hits, maxWin, fsN, ms, N };
}

const args = process.argv.slice(2);
const games = args.length ? args : Object.keys(SPEC);
const mode = process.env.MODE || 'real';
const N = Number(process.env.N) || 20000;
const bet = Number(process.env.BET) || 10;

console.log(`=== APEX RTP SIM · ${mode} · ${N} 局 · 下注 ${bet} ===\n`);
let anyFail = false;
for (const g of games) {
  try {
    const r = runOne(g, mode, N, bet);
    const rtp = r.tw / r.tb * 100;
    const rtpBase = r.baseWin / r.tb * 100;
    const rtpFs = r.fsWin / r.tb * 100;
    const flag = (rtp < 88 || rtp > 94) ? ' ⚠️ 超出 88~94%' : ' ✅';
    console.log(`▸ ${g}${flag}`);
    console.log(`  RTP:      ${rtp.toFixed(2)}%`);
    console.log(`  base 贡献: ${rtpBase.toFixed(2)}%`);
    console.log(`  FS  贡献: ${rtpFs.toFixed(2)}%`);
    console.log(`  命中率:    ${(r.hits / r.N * 100).toFixed(2)}%`);
    console.log(`  FS 触发:   ${(r.fsN / r.N * 100).toFixed(3)}%`);
    console.log(`  最大单局:  ${r.maxWin.toFixed(2)}`);
    console.log(`  耗时:      ${r.ms}ms`);
    console.log('');
  } catch (e) {
    anyFail = true;
    console.log(`▸ ${g} ❌ 出错: ${e.message}\n`);
  }
}
if (anyFail) process.exit(1);
