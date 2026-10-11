'use strict';
/**
 * Sugar Rush 完整会话 RTP 门禁
 * 口径：一次 base spin = 1 注。命中 FS 则模拟完整 FS 会话
 * （含 retrigger + chain cap），这才是玩家真实收支。
 */
require('../tests/games/sugar-rush/_loader.cjs').loadAll();
var W = global.window;
var E = W.ApexSugarRushGameEngine;
var P = W.ApexSugarRushMathProfile;
if (!E || !P) { console.error('[FATAL] engine not loaded'); process.exit(2); }

var N = parseInt(process.argv[2] || '20000', 10);
var MAX_RETRIG = 10;
var FS_HARD_CAP = 60;

function simFull(mode){
  var bet = 100;
  var totalBet = 0, totalWin = 0, nWinFrames = 0, nFrames = 0;
  var fsCount = 0, fsSpinsTotal = 0, retrigTotal = 0;
  var prof = P.getProfile(mode);

  for (var i = 0; i < N; i++){
    totalBet += bet;
    var s = E.spinBase(mode, bet);
    totalWin += s.winMinor;
    nFrames++;
    if (s.winMinor > 0) nWinFrames++;

    if (s.fsTriggered && s.fsSpinsAwarded > 0){
      fsCount++;
      var left = s.fsSpinsAwarded;
      var marks = [];
      var capMinor = bet * prof.maxWinMultiplier;
      var chainWin = 0;
      var spinsThisRound = 0;
      var rtr = 0;

      while (left > 0 && spinsThisRound < FS_HARD_CAP){
        var f = E.spinFree(mode, bet, { marks: marks });
        var wm = f.winMinor;
        if (chainWin + wm > capMinor) wm = Math.max(0, capMinor - chainWin);
        chainWin += wm;
        totalWin += wm;
        nFrames++;
        if (wm > 0) nWinFrames++;
        marks = f.marksAfter || [];
        left--;
        spinsThisRound++;
        if (f.fsTriggered && rtr < MAX_RETRIG){
          left += f.fsSpinsAwarded || 0;
          retrigTotal++;
          rtr++;
        }
      }
      fsSpinsTotal += spinsThisRound;
    }
  }

  return {
    rtp: totalWin / totalBet,
    hit: nFrames > 0 ? nWinFrames / nFrames : 0,
    fsRate: fsCount / N,
    avgFsSpins: fsCount > 0 ? fsSpinsTotal / fsCount : 0,
    retrigRate: fsCount > 0 ? retrigTotal / fsCount : 0
  };
}

console.log('[RTP-GATE v3] n=' + N + '  完整会话（base + FS chain）');
console.log('='.repeat(60));

var failed = 0;
['real', 'demo'].forEach(function(m){
  var t0 = Date.now();
  var r = simFull(m);
  var ms = Date.now() - t0;
  var p = P.getProfile(m);
  var rtpOk = r.rtp >= p.targetRtp.min && r.rtp <= p.targetRtp.max;
  var hitOk = r.hit >= p.targetHitRate.min && r.hit <= p.targetHitRate.max;

  console.log('[' + m + ']  ' + ms + 'ms');
  console.log('  RTP    = ' + (r.rtp * 100).toFixed(2) + '%  (目标 '
    + (p.targetRtp.min * 100).toFixed(0) + '-' + (p.targetRtp.max * 100).toFixed(0) + '%)  '
    + (rtpOk ? 'PASS' : 'FAIL'));
  console.log('  hitRate= ' + (r.hit * 100).toFixed(2) + '%  (目标 '
    + (p.targetHitRate.min * 100).toFixed(0) + '-' + (p.targetHitRate.max * 100).toFixed(0) + '%)  '
    + (hitOk ? 'PASS' : 'FAIL'));
  console.log('  FS触发 = 1/' + (r.fsRate > 0 ? Math.round(1 / r.fsRate) : 'inf')
    + '  平均FS局数 = ' + r.avgFsSpins.toFixed(1)
    + '  retrigger率 = ' + (r.retrigRate * 100).toFixed(1) + '%');
  console.log('');

  if (!rtpOk) failed++;
  if (!hitOk) failed++;
});

console.log('='.repeat(60));
console.log(failed === 0 ? '[ALL PASS]' : ('[FAIL] ' + failed + ' target(s) missed'));
process.exit(failed ? 1 : 0);
