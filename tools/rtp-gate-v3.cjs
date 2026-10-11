'use strict';
/**
 * Sugar Rush 完整会话 RTP 门禁（S1.8-B2 版本）
 * 环境变量：
 *   RTP_MODE       real | demo | all（默认 all）
 *   RTP_SPINS      局数（默认 200000）
 *   RTP_SEEDS      重复次数（默认 1）
 *   RTP_THRESHOLD  相对偏离阈值（默认 0.05 = 5%）
 *
 * 注意：Sweet Bonanza 的 RTP 门禁是 tests/math/rtp-gate.cjs，不是本脚本。
 */
var path = require('path');
var ROOT = path.resolve(__dirname, '..');
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues){
  globalThis.crypto = require('crypto').webcrypto;
}

var MODE = process.env.RTP_MODE || 'all';
var SPINS = parseInt(process.env.RTP_SPINS || '200000', 10);
var SEEDS = parseInt(process.env.RTP_SEEDS || '1', 10);
var THRESHOLD = Number(process.env.RTP_THRESHOLD || '0.05');
var MODES = (MODE === 'all') ? ['real', 'demo'] : [MODE];

require(path.join(ROOT, 'tests/games/sugar-rush/_loader.cjs')).loadAll();
var W = global.window;
var E = W.ApexSugarRushGameEngine;
var P = W.ApexSugarRushMathProfile;
if (!E || !P) { console.error('[FATAL] SR engine not loaded'); process.exit(2); }

var FS_HARD_CAP = 60, MAX_RETRIG = 10;

function simFull(mode){
  var bet = 100;
  var totalBet = 0, totalWin = 0, nWinFrames = 0, nFrames = 0;
  var fsCount = 0, fsSpinsTotal = 0;
  var prof = P.getProfile(mode);
  for (var i = 0; i < SPINS; i++){
    totalBet += bet;
    var s = E.spinBase(mode, bet);
    totalWin += s.winMinor;
    nFrames++;
    if (s.winMinor > 0) nWinFrames++;
    if (s.fsTriggered && s.fsSpinsAwarded > 0){
      fsCount++;
      var left = s.fsSpinsAwarded;
      var marks = [];
      var capMinor = bet * (prof.maxWinMultiplier || 5000);
      var chainWin = 0, spinsThisRound = 0, rtr = 0;
      while (left > 0 && spinsThisRound < FS_HARD_CAP){
        var f = E.spinFree(mode, bet, { marks: marks });
        var wm = f.winMinor;
        if (chainWin + wm > capMinor) wm = Math.max(0, capMinor - chainWin);
        chainWin += wm;
        totalWin += wm;
        nFrames++;
        if (wm > 0) nWinFrames++;
        marks = f.marksAfter || [];
        left--; spinsThisRound++;
        if (f.fsTriggered && rtr < MAX_RETRIG){ left += (f.fsSpinsAwarded || 0); rtr++; }
      }
      fsSpinsTotal += spinsThisRound;
    }
  }
  return { rtp: totalWin / totalBet, hit: nFrames > 0 ? nWinFrames / nFrames : 0, fsRate: fsCount / SPINS, avgFsSpins: fsCount > 0 ? fsSpinsTotal / fsCount : 0 };
}

console.log('[RTP-GATE v3 / Sugar Rush] mode=' + MODE + '  spins=' + SPINS + '  seeds=' + SEEDS + '  threshold=' + (THRESHOLD * 100) + '%');
console.log('='.repeat(64));
var failed = 0;
for (var mi = 0; mi < MODES.length; mi++){
  var m = MODES[mi];
  var p;
  try { p = P.getProfile(m); } catch (e){ console.log('[' + m + '] skip: ' + e.message); continue; }
  var target = p.targetRtp ? (p.targetRtp.target || ((p.targetRtp.min + p.targetRtp.max) / 2)) : 0.91;
  var useThreshold = (m === 'real');   // demo 区间宽，用区间判定；real 区间窄，用相对偏离
  for (var si = 0; si < SEEDS; si++){
    var t0 = Date.now();
    var r = simFull(m);
    var ms = Date.now() - t0;
    var pass, reason;
    if (useThreshold){
      var dev = target > 0 ? Math.abs(r.rtp - target) / target : 0;
      pass = dev <= THRESHOLD;
      reason = '偏离=' + (dev * 100).toFixed(2) + '%';
    } else {
      pass = p.targetRtp && r.rtp >= p.targetRtp.min && r.rtp <= p.targetRtp.max;
      reason = '区间 [' + (p.targetRtp.min * 100).toFixed(0) + '-' + (p.targetRtp.max * 100).toFixed(0) + '%]';
    }
    if (!pass) failed++;
    console.log('  [' + m + ' seed#' + si + '] RTP=' + (r.rtp * 100).toFixed(2) + '%  ' + reason + '  ' + (pass ? 'PASS' : 'FAIL') + '  (' + ms + 'ms)');
  }
}
console.log('='.repeat(64));
console.log(failed === 0 ? '[ALL PASS]' : ('[FAIL] ' + failed + ' seed(s) failed'));
process.exit(failed ? 1 : 0);
