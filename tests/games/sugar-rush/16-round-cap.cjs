'use strict';
require('./_loader.cjs').loadAll();
var passed=0, failed=0;
function ok(c,n){if(c)passed++;else{failed++;console.log('FAIL: '+n);}}
var E=window.ApexSugarRushGameEngine;
var C=window.ApexSugarRushCap;
var MP=window.ApexSugarRushMathProfile;

// 1. applyRoundCap 存在
ok(typeof C.applyRoundCap==='function','applyRoundCap exists');

// 2. 未达顶：正常累积
var r1=C.applyRoundCap('demo',100,0,10);
ok(r1.rawWin===10,'no cap: rawWin=10');
ok(r1.capped===false,'no cap: capped=false');
ok(r1.roundEnded===false,'no cap: roundEnded=false');

// 3. 达顶：立即结束
var knobs=MP.getProfile('demo');
var rawCap=knobs.maxWinMultiplier/knobs.payScale;
var r2=C.applyRoundCap('demo',100,rawCap-1,100);
ok(r2.rawWin===rawCap,'cap: rawWin clamped to rawCap');
ok(r2.capped===true,'cap: capped=true');
ok(r2.roundEnded===true,'cap: roundEnded=true');

// 4. FsSession 存在
ok(typeof E.FsSession==='function','FsSession exists');

// 5. FsSession.step() 返回结构正确
var s=new E.FsSession('demo',100);
var step=s.step();
ok(step.result&&typeof step.result.winMinor==='number','step.result.winMinor number');
ok(typeof step.ended==='boolean','step.ended boolean');
ok(s.spinsPlayed===1,'spinsPlayed incremented');

// 6. FS session 长跑到结束
var s2=new E.FsSession('demo',100);
var n=0;
while(!s2.ended && n<50){ s2.step(); n++; }
ok(n>0,'FS session ran at least 1 spin');
ok(s2.spinsPlayed===n,'spinsPlayed matches steps');

console.log('[round-cap] passed='+passed+' failed='+failed);
process.exit(failed>0?1:0);
