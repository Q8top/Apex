'use strict';
require('./_loader.cjs').loadAll();
var passed=0, failed=0;
function ok(c,n){if(c)passed++;else{failed++;console.log('FAIL: '+n);}}
var E=window.ApexSugarRushGameEngine;
var M=window.ApexSugarRushMultiplier;

// 1. spinBase 返回 marksVisual 字段
var r=E.spinBase('demo',100);
ok(Array.isArray(r.marksVisual),'spinBase has marksVisual array');

// 2. 单次 spin 局部 marks 存在（验证：1000 次 spin 后，每次 marksVisual 长度有变化）
var seen=0;
for(var i=0;i<500;i++){
  var rr=E.spinBase('demo',100);
  if(rr.marksVisual.length>0)seen++;
}
ok(seen>0,'at least some spins produce marksVisual (got '+seen+'/500)');

// 3. 全局：spinBase 之间无状态泄漏
var m1=new M.MarkState();
m1.set(0,2);
var r3=E.spinBase('demo',100);
ok(m1.get(0)===2,'external MarkState unaffected by spinBase');

// 4. spinBase 不传 marks 参数，返回结果只含本 spin 标记
var r4=E.spinBase('demo',100);
ok(r4.marksVisual!==undefined,'r4 has marksVisual');

console.log('[base-marks] passed='+passed+' failed='+failed);
process.exit(failed>0?1:0);
