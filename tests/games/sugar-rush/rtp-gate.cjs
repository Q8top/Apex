'use strict';
require('./_loader.cjs').loadAll();
var E = window.ApexSugarRushGameEngine;
var M = window.ApexSugarRushMathProfile;
var N = parseInt(process.argv[2] || '200000', 10);
function runSim(mode, n){
  var total = 0, hits = 0;
  for (var i=0; i<n; i++){
    var s = E.spin(mode, 100);
    total += s.winMinor;
    if (s.winMinor > 0) hits++;
  }
  return { rtp: total / (n * 100), hitRate: hits / n };
}
var failed = 0;
console.log('[RTP-GATE] n=' + N);
['real','demo'].forEach(function(mode){
  var r = runSim(mode, N);
  var p = M.getProfile(mode);
  var TOL=0.015; var rtpOk = r.rtp >= p.targetRtp.min - TOL && r.rtp <= p.targetRtp.max + TOL;
  var hitOk = r.hitRate >= p.targetHitRate.min && r.hitRate <= p.targetHitRate.max;
  console.log('  ' + mode + ' rtp=' + r.rtp.toFixed(4) + ' [' + p.targetRtp.min + ',' + p.targetRtp.max + '] ' + (rtpOk ? 'PASS' : 'FAIL'));
  console.log('  ' + mode + ' hit=' + r.hitRate.toFixed(4) + ' [' + p.targetHitRate.min + ',' + p.targetHitRate.max + '] ' + (hitOk ? 'PASS' : 'FAIL'));
  if (!rtpOk) failed++;
  if (!hitOk) failed++;
});
process.exit(failed > 0 ? 1 : 0);
